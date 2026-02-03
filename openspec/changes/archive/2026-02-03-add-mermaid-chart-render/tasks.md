## 1. Core 层实现

- [x] 1.1 添加 mermaid 依赖到 core 包（peerDependency）
- [x] 1.2 创建 MermaidRenderer 工具类，封装 mermaid.render() 调用和懒加载
- [x] 1.3 实现 SVG 转 PNG/下载功能工具函数

## 2. React 组件实现

- [x] 2.1 创建 MermaidBlock 组件（图片/代码切换、工具栏）
- [x] 2.2 实现图片模式缩放控制（放大、缩小、重置）
- [x] 2.3 创建 MermaidFullscreenViewer 组件（Portal、遮罩层）
- [x] 2.4 实现全屏模式交互（滚轮缩放、拖拽平移、双击重置、键盘支持）
- [x] 2.5 实现图表下载功能（PNG 格式）
- [x] 2.6 集成到 Markdown 组件，自动识别 ```mermaid 代码块
- [x] 2.7 添加 mermaid prop 配置开关

## 3. Vue 组件实现

- [x] 3.1 创建 MermaidBlock 组件（图片/代码切换、工具栏）
- [x] 3.2 实现图片模式缩放控制
- [x] 3.3 创建 MermaidFullscreenViewer 组件（Teleport、遮罩层）
- [x] 3.4 实现全屏模式交互
- [x] 3.5 实现图表下载功能
- [x] 3.6 集成到 Markdown 组件
- [x] 3.7 添加 mermaid prop 配置开关

## 4. 样式与交互

- [x] 4.1 添加 Mermaid 渲染器默认样式（支持浅色/暗黑模式）
- [x] 4.2 添加工具栏图标和交互样式
- [x] 4.3 添加全屏模式遮罩层和容器样式
- [x] 4.4 添加缩放、拖拽动画和过渡效果

## 5. 测试与文档

- [x] 5.1 添加 Storybook 示例（各类图表类型、全屏模式）
- [x] 5.2 验证流式渲染场景下的 Mermaid 渲染
