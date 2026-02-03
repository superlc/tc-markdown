# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2026-02-03

### Features
- **Mermaid 流式渲染**：为 MermaidBlock 组件添加流式渲染支持 (8f302c2)
  - 新增 `streamStatus` prop，支持流式输入时的渐进式渲染
  - 流式状态下延迟渲染，避免频繁重渲染
  - 流式状态下渲染失败保持 loading 状态而非显示错误
  - 渲染成功时自动切换到预览模式
- 新增 Mermaid 流式渲染相关 Storybook 示例 (d716452)

### Other Changes
- 添加 Mermaid 功能说明到 README 文档 (b7f8d66)
- 配置 Storybook 侧边栏排序

## [0.2.0] - 2026-02-03

### Features
- **Mermaid 图表渲染**：支持在 Markdown 中渲染 Mermaid 图表 (088b7d1)
  - 动态加载 Mermaid 库，优化首屏性能
  - 支持浅色/暗色主题自动切换
  - 全屏查看模式（使用浏览器原生 Fullscreen API）
  - 缩放、平移、适应窗口等交互功能
  - PNG 图片下载功能
  - 渲染错误友好提示

### Other Changes
- 完善腾讯云 Lighthouse 部署文档 skill (fc3c130, 1e0353e)

## [0.1.1] - 2026-01-29

### Features
- 代码块复制按钮：支持一键复制代码块内容 (a8c4882)
- 数学公式支持：React 和 Vue 组件均支持 KaTeX 数学公式渲染 (0960829, ebaa9ab)
- 暗色模式：支持浅色/暗色主题切换 (80cd726)
- 流式渲染优化：
  - 优化表格流式渲染体验 (b335ea5)
  - 优化链接和图片显示 (cb8ae24)
  - 行内强调、代码逐字显示效果 (c7fa930)
  - 有序列表渲染稳定性 (5a1bc05)
  - 列表渲染优化 (1a7edb7)
  - 渲染频率可配置 (7d91db6, a33d3d6)

### Bug Fixes
- 修复 Vue 框架下渲染内容为空的问题 (2a9a683)
- 修复图片加载时占位动效 (2ee0925)
- 优化删除线文案显示 (36cc934)

### Other Changes
- 添加 changelog-generator 和 package-publisher skills (19dd25f)
- 添加项目 README 文档 (12c6058)
