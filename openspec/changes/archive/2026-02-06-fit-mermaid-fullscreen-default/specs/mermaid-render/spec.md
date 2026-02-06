# mermaid-render Spec Delta

## MODIFIED Requirements

### Requirement: 全屏模式查看

系统 SHALL 支持在全屏覆盖层中查看复杂图表，提供更大的操作空间。

#### Scenario: 进入全屏模式

- **GIVEN** 图表已成功渲染
- **WHEN** 用户点击"全屏"按钮
- **THEN** 系统 SHALL 显示全屏覆盖层
- **AND** 覆盖层 SHALL 渲染到 body（使用 Portal）
- **AND** 背景 SHALL 为半透明深色遮罩
- **AND** 图表 SHALL 自动适配容器大小显示完整内容

> **变更说明**: 新增 "图表 SHALL 自动适配容器大小显示完整内容" 要求，进入全屏时默认执行适配操作而非固定 100% 缩放。
