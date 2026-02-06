# Proposal: Mermaid 全屏默认适配容器

## Summary

进入 Mermaid 图表全屏模式时，默认自动执行"适应窗口"操作，使图表自动适配容器大小，而非当前的 100% 缩放。

## Motivation

当前行为：进入全屏后缩放比例为 100%，对于大型图表可能只能看到局部，用户需要手动点击"适应窗口"按钮。

期望行为：进入全屏后自动适配容器，用户可以立即看到完整图表，提升使用体验。

## Scope

- **影响范围**: React 和 Vue 的 MermaidFullscreenViewer 组件
- **变更类型**: 行为优化，非破坏性变更

## Approach

在全屏状态激活后，自动调用 `fitToContainer` 方法使图表适配容器大小。

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| 小图表可能被过度放大 | fitToContainer 已有 clamp 逻辑限制最大缩放比例 |
| SVG 尺寸获取时机问题 | 使用 requestAnimationFrame 确保 DOM 布局完成 |

## Success Criteria

- 进入全屏后，图表自动适配容器显示完整内容
- 用户仍可手动缩放、平移、重置
