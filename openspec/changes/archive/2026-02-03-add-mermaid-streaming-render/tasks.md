# Tasks: Mermaid 图表流式渲染

## Phase 1: 核心能力实现

### 1.1 SVG 元素提取器 (core)
- [ ] 创建 `SvgElementExtractor` 类，解析 SVG DOM 结构
- [ ] 提取节点元素（.node, .cluster, rect, circle, polygon）
- [ ] 提取连线元素（.edgePath, path, line）
- [ ] 提取文字元素（.nodeLabel, .edgeLabel, text）
- [ ] 按图表类型识别元素拓扑顺序
- **验证**: 单元测试覆盖各类图表 SVG 结构解析

### 1.2 动画编排器 (core)
- [ ] 创建 `SvgAnimationOrchestrator` 类
- [ ] 实现元素初始隐藏（opacity: 0, transform: scale(0.8)）
- [ ] 实现依次显示调度（使用 requestAnimationFrame）
- [ ] 支持配置 duration、stagger、easing
- [ ] 实现动画完成回调
- **验证**: 单元测试验证动画时序正确

### 1.3 动画 CSS 样式 (core)
- [ ] 添加 `.md-mermaid-animate-in` 关键帧动画
- [ ] 添加 `.md-mermaid-element--hidden` 初始隐藏类
- [ ] 添加 `.md-mermaid-element--visible` 动画显示类
- **验证**: 视觉检查动画效果

## Phase 2: React 集成

### 2.1 MermaidBlock 流式动画支持
- [ ] 添加 `streamingAnimation` prop
- [ ] 添加 `animationDuration`、`animationStagger` props
- [ ] 集成 `SvgAnimationOrchestrator`
- [ ] 检测是否处于流式上下文（通过 data-streaming 属性或 context）
- [ ] 非流式模式下跳过动画
- **验证**: Storybook 流式渲染示例展示动画效果

### 2.2 StreamingMarkdown 集成
- [ ] 传递流式上下文给 MermaidBlock
- [ ] 块稳定时触发动画而非立即显示
- **验证**: 完整流式渲染 Mermaid 内容测试

## Phase 3: Vue 集成

### 3.1 MermaidBlock 流式动画支持
- [ ] 添加对应 props（与 React 一致）
- [ ] 集成动画编排器
- [ ] 流式上下文检测
- **验证**: Storybook Vue 示例

### 3.2 StreamingMarkdown 集成
- [ ] 传递流式上下文
- [ ] 块稳定时触发动画
- **验证**: Vue 流式渲染 Mermaid 测试

## Phase 4: 优化与边界处理

### 4.1 性能优化
- [ ] 元素数量超过阈值（100）时跳过动画
- [ ] 使用 CSS transforms 而非 top/left 确保 GPU 加速
- [ ] 动画期间避免重复触发
- **验证**: 大型图表性能测试

### 4.2 交互处理
- [ ] 动画进行中禁用缩放/下载按钮（或显示"加载中"）
- [ ] 提供"跳过动画"功能（点击图表区域）
- **验证**: 手动测试交互流程

## Phase 5: 文档与发布

### 5.1 更新文档
- [ ] 更新 README Mermaid 章节，说明流式动画特性
- [ ] 更新 API 参考，添加新增 props
- **验证**: 文档审查

### 5.2 Storybook 示例
- [ ] 添加"流式动画"示例（React & Vue）
- [ ] 添加动画配置示例
- **验证**: Storybook 可访问

---

## Dependencies Graph
```
1.1 ─┬─> 1.2 ─┬─> 2.1 ──> 2.2
     │        │
     │        └─> 3.1 ──> 3.2
     │
     └─> 1.3 ──────────────────> 4.1 ──> 4.2 ──> 5.1 ──> 5.2
```
