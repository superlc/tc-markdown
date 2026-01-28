# markdown-styles Spec Delta

## ADDED Requirements

### Requirement: 图片骨架屏流光动画
系统 SHALL 在图片加载占位容器上显示平滑的流光（shimmer）动画效果。

#### Scenario: 流光动画方向
- **GIVEN** 图片正在加载，显示骨架屏
- **WHEN** shimmer 动画运行
- **THEN** 流光 SHALL 从左侧进入，向右侧移出
- **AND** 动画 SHALL 使用 linear 缓动函数，确保移动平滑

#### Scenario: 流光动画循环
- **GIVEN** 图片加载未完成
- **WHEN** 动画完成一个周期
- **THEN** 动画 SHALL 无缝循环继续
- **AND** 周期时长为 1.5s

#### Scenario: 组件实例稳定性
- **GIVEN** 流式输入包含图片的段落
- **WHEN** 段落内容不断追加
- **THEN** `StreamingImage` 组件实例 SHALL 保持稳定
- **AND** skeleton 状态 SHALL NOT 被重置
