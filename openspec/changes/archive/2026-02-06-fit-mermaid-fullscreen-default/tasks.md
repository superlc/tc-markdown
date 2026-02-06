# Tasks: Mermaid 全屏默认适配容器

## Implementation Tasks

- [x] 1. 更新 React MermaidFullscreenViewer
  - 在全屏状态激活后调用 `fitToContainer`
  - 使用 `requestAnimationFrame` 确保 DOM 布局完成

- [x] 2. 更新 Vue MermaidFullscreenViewer
  - 在全屏状态激活后调用 `fitToContainer`
  - 使用 `watch` + `requestAnimationFrame` 确保 DOM 布局完成

- [x] 3. 更新 mermaid-render spec
  - 修改"进入全屏模式"场景，新增 "图表 SHALL 自动适配容器大小显示完整内容"

## Validation

- [ ] 4. 手动测试
  - 验证大型图表进入全屏后自动缩小显示完整
  - 验证小型图表进入全屏后合理放大
  - 验证手动缩放、平移、重置功能正常
