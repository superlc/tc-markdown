## Context

Mermaid 是广泛使用的图表 DSL，支持流程图、时序图、甘特图、类图等多种图表类型。用户在 Markdown 中使用 \`\`\`mermaid 代码块编写图表，需要渲染为可视化图形。

参考 [streamdown](https://streamdown.ai) 组件库的 Mermaid 实现方案，其提供了全屏、下载、复制等交互功能。本设计在此基础上增加图片/代码切换和缩放控制。

### 约束
- 需同时支持 React 和 Vue
- 需支持浅色/暗黑模式
- 需与现有代码块复制功能兼容
- 需考虑 Mermaid 库体积（约 2MB），支持懒加载

## Goals / Non-Goals

### Goals
- 识别并渲染 Mermaid 代码块为 SVG 图表
- 提供图片/代码切换视图
- 图片模式支持缩放操作（放大、缩小、重置到初始状态）
- **支持全屏模式查看复杂图表**（参考 streamdown）
- 支持图表下载（PNG 格式）
- 代码模式复用现有复制功能

### Non-Goals
- 不支持 Mermaid 图表在线编辑
- 不支持 Mermaid Live Editor 集成
- 暂不支持自定义 Mermaid 主题配置

## Decisions

### Decision 1: Mermaid 懒加载策略

**选择**: 动态 import 懒加载 mermaid 库

**理由**:
- Mermaid 库体积较大（~2MB），直接打包会显著增加 bundle 大小
- 并非所有用户都需要 Mermaid 功能
- 仅在检测到 mermaid 代码块时才加载

**实现**:
```ts
let mermaidPromise: Promise<typeof import('mermaid')> | null = null;

export async function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid');
  }
  return mermaidPromise;
}
```

### Decision 2: 渲染时机

**选择**: 组件挂载后异步渲染

**理由**:
- Mermaid 需要 DOM 环境
- 避免阻塞首次渲染
- 支持 loading 状态展示

**流程**:
1. 识别 ```mermaid 代码块
2. 渲染为 MermaidBlock 组件（显示 loading skeleton）
3. 组件挂载后异步加载 Mermaid 并渲染 SVG
4. 渲染完成后显示图表

### Decision 3: 缩放与交互方案（参考 streamdown 优化）

**选择**: 全屏模式 + CSS transform 缩放 + 鼠标滚轮/拖拽支持

**理由**:
- streamdown 采用全屏覆盖层查看复杂图表，交互体验好
- 全屏模式下可提供更大的操作空间进行缩放和平移
- CSS transform 性能高效，无需重新渲染 SVG

**实现**:
```ts
interface ViewerState {
  // 显示模式
  mode: 'preview' | 'code';     // 图片/代码切换
  isFullscreen: boolean;         // 是否全屏

  // 缩放状态
  scale: number;                 // 当前缩放比例，默认 1
  minScale: number;              // 最小缩放 0.25
  maxScale: number;              // 最大缩放 4
  step: number;                  // 按钮缩放步长 0.25

  // 平移状态（全屏模式下支持）
  translateX: number;
  translateY: number;
  isDragging: boolean;
}
```

**交互方式**:
1. **按钮缩放**: 点击 +/- 按钮，按步长缩放
2. **鼠标滚轮**: 全屏模式下支持滚轮缩放（Ctrl/Cmd + 滚轮）
3. **拖拽平移**: 全屏模式下支持拖拽移动图表位置
4. **双击重置**: 双击图表区域重置到初始状态
5. **键盘支持**: ESC 退出全屏，+/- 键缩放

### Decision 4: 全屏模式实现

**选择**: Portal + CSS overlay（参考 streamdown）

**理由**:
- 使用 Portal 渲染到 body，避免 z-index 层级问题
- 深色半透明背景突出图表内容
- 点击背景或 ESC 键退出全屏

**实现**:
```tsx
// React
<Portal>
  <div className="md-mermaid-fullscreen-overlay">
    <div className="md-mermaid-fullscreen-toolbar">
      {/* 工具栏：缩放、下载、关闭 */}
    </div>
    <div className="md-mermaid-fullscreen-content">
      {/* 可缩放、可拖拽的 SVG 容器 */}
    </div>
  </div>
</Portal>
```

### Decision 5: 下载功能实现

**选择**: SVG → Canvas → PNG Blob → Download

**理由**:
- SVG 可直接获取，无需额外渲染
- PNG 格式兼容性更好
- 支持透明背景或自定义背景色

**实现步骤**:
1. 获取渲染后的 SVG 元素
2. 使用 canvas 绘制 SVG
3. 调用 canvas.toBlob() 生成 PNG
4. 创建下载链接触发下载

### Decision 6: 组件架构

```
┌───────────────────────────────────────────────────┐
│                  MermaidBlock                      │
├───────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐  │
│  │              Toolbar                         │  │
│  │  [图片|代码] │ [+][-][重置] │ [全屏][下载]   │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────┐  │
│  │           Content Area                       │  │
│  │                                              │  │
│  │   [图片模式]           [代码模式]            │  │
│  │   SVG 渲染              代码块 + 复制        │  │
│  │   可缩放                                     │  │
│  └─────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│           MermaidFullscreenViewer                  │
│           (Portal to body)                         │
├───────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐  │
│  │  [−][+][重置][适应][下载]           [×关闭]  │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────┐  │
│  │                                              │  │
│  │         可拖拽、可缩放的 SVG 容器             │  │
│  │         支持滚轮缩放、双击重置               │  │
│  │                                              │  │
│  └─────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────┘
```

## Risks / Trade-offs

### Risk 1: Mermaid 渲染失败
- **风险**: 语法错误导致渲染失败
- **缓解**: 捕获异常，显示错误提示，同时保留代码视图供用户检查

### Risk 2: 大型图表性能
- **风险**: 复杂图表 SVG 体积大，缩放可能卡顿
- **缓解**: 使用 CSS transform 而非重绘，必要时降级为静态图片

### Risk 3: 流式渲染场景
- **风险**: Mermaid 代码块未完成时渲染可能失败
- **缓解**: 仅在代码块 stable 状态时触发渲染，pending 状态显示代码

## Open Questions

- [ ] 是否需要支持 Mermaid 主题自定义？（当前设计为 Non-Goal）
- [ ] 下载时是否需要支持 SVG 格式导出？
