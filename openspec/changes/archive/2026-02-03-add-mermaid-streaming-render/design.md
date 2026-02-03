# Design: Mermaid 图表流式渲染

## 1. 问题分析

### 1.1 Mermaid 渲染特性
Mermaid 库的工作方式是：
1. 接收完整的 DSL 代码
2. 解析为内部 AST
3. 一次性生成完整 SVG

**关键限制**：无法在代码不完整时渲染，也无法增量更新 SVG。

### 1.2 现有流式行为
```
流式输入: ```mermaid\ngraph TD\n    A --> B\n```

时间线:
t0: [代码块开始，stable=false] → 显示代码文本
t1: [代码追加中]               → 代码文本更新
t2: [代码块闭合，stable=true]  → 触发渲染 → SVG 立即完整显示 ← 突然出现！
```

### 1.3 目标行为
```
t2: [代码块闭合，stable=true]  → 触发渲染 → SVG 元素逐步显示
    - 节点 A 淡入
    - 箭头绘制
    - 节点 B 淡入
```

## 2. 技术方案

### 2.1 后处理动画方案

由于无法修改 Mermaid 渲染过程，采用**后处理**策略：

```
┌─────────────────────────────────────────────────────────────┐
│                    渲染流程                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Mermaid Code ──► MermaidRenderer ──► Complete SVG        │
│                                              │               │
│                                              ▼               │
│                                    SvgElementExtractor      │
│                                              │               │
│                                              ▼               │
│                                    Element[] (ordered)       │
│                                              │               │
│                                              ▼               │
│                                    SvgAnimationOrchestrator │
│                                              │               │
│                                              ▼               │
│                                    Animated SVG Display     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 SVG 元素分类

Mermaid 生成的 SVG 结构分析：

```xml
<svg>
  <!-- 流程图 -->
  <g class="node" id="flowchart-A-0">
    <rect class="basic label-container" />
    <g class="label"><foreignObject><div>A</div></foreignObject></g>
  </g>
  <g class="edgePath">
    <path class="path" d="M..." />
  </g>
  
  <!-- 时序图 -->
  <g class="actor">
    <rect class="actor" />
    <text class="actor"><tspan>Client</tspan></text>
  </g>
  <line class="messageLine0" />
  <text class="messageText">消息</text>
</svg>
```

**元素分类策略**：
| 选择器 | 类型 | 优先级 |
|-------|------|-------|
| `.node`, `.actor`, `.cluster` | 节点 | 1 (先显示) |
| `.edgePath`, `.messageLine*`, `line` | 连线 | 2 |
| `.label`, `.messageText`, `.noteText` | 文字 | 3 (后显示) |

### 2.3 动画实现

#### CSS 关键帧
```css
@keyframes md-mermaid-fade-in {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes md-mermaid-draw-line {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}
```

#### JavaScript 编排
```typescript
class SvgAnimationOrchestrator {
  private elements: SVGElement[];
  private currentIndex = 0;
  private animationFrame: number | null = null;

  async animate(svg: SVGSVGElement, options: AnimationOptions): Promise<void> {
    this.elements = this.extractAndOrder(svg);
    
    // 初始隐藏所有元素
    this.elements.forEach(el => el.style.opacity = '0');
    
    return new Promise(resolve => {
      const showNext = () => {
        if (this.currentIndex >= this.elements.length) {
          resolve();
          return;
        }
        
        const el = this.elements[this.currentIndex];
        el.style.animation = `md-mermaid-fade-in ${options.duration}ms ease-out forwards`;
        
        this.currentIndex++;
        this.animationFrame = setTimeout(showNext, options.stagger);
      };
      
      showNext();
    });
  }
}
```

### 2.4 流式上下文传递

```tsx
// React: 通过 props 或 context 传递
<MermaidBlock 
  code={code}
  isStreaming={true}  // 来自 StreamingMarkdown 上下文
  streamingAnimation={true}
/>

// 或检测父级 data-streaming 属性
useEffect(() => {
  const container = containerRef.current;
  const isStreaming = container?.closest('[data-streaming="true"]');
  // ...
}, []);
```

### 2.5 图表类型检测与排序

```typescript
function detectChartType(code: string): ChartType {
  if (code.startsWith('graph') || code.startsWith('flowchart')) return 'flowchart';
  if (code.startsWith('sequenceDiagram')) return 'sequence';
  if (code.startsWith('classDiagram')) return 'class';
  // ...
  return 'generic';
}

function getElementOrder(chartType: ChartType): ElementOrderFn {
  switch (chartType) {
    case 'flowchart':
      // 按 data-id 中的节点 ID 顺序，结合连线方向
      return flowchartOrder;
    case 'sequence':
      // 按 DOM 顺序（Mermaid 已按时间排列）
      return domOrder;
    default:
      return domOrder;
  }
}
```

## 3. API 设计

### 3.1 MermaidBlock Props 扩展

```typescript
interface MermaidBlockProps {
  // 现有 props...
  
  /** 是否启用流式动画（默认 true，仅流式模式生效） */
  streamingAnimation?: boolean;
  
  /** 单个元素动画时长（ms） */
  animationDuration?: number;
  
  /** 元素之间的间隔时间（ms） */
  animationStagger?: number;
  
  /** 动画完成回调 */
  onAnimationComplete?: () => void;
}
```

### 3.2 Markdown 组件 Props

```typescript
interface MarkdownProps {
  // 现有 props...
  
  /** Mermaid 流式动画配置 */
  mermaidAnimation?: boolean | {
    duration?: number;
    stagger?: number;
  };
}
```

## 4. 边界处理

### 4.1 大型图表
- 元素数量 > 100：跳过动画，直接显示
- 设置 `maxAnimatedElements` 配置项

### 4.2 快速连续渲染
- 如果新渲染触发时上一个动画未完成：
  - 取消上一个动画
  - 直接显示之前的 SVG
  - 开始新 SVG 的动画

### 4.3 非流式模式
- `data-streaming="false"` 或属性不存在时
- 跳过动画，保持现有即时显示行为

## 5. 性能考虑

1. **GPU 加速**：使用 `transform` 和 `opacity`，避免触发布局
2. **节流**：动画期间禁用其他交互
3. **取消机制**：组件卸载时取消未完成的动画
4. **内存**：动画完成后清理事件监听和定时器
