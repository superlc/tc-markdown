# Tasks: add-inline-prediction

## Status: Complete

## Tasks

- [x] 1. Core: 创建 `InlineCompleter` 类
  - 实现行内标记检测逻辑
  - 支持粗体、斜体、代码、删除线、链接、图片
  - 处理嵌套和转义字符
  - 导出类型和类

- [x] 2. Core: 集成到 `StreamingParser`
  - 在 `parseBlock()` 前调用补全器
  - 添加 `data-predicted` 属性到补全节点
  - 添加 `enableInlinePrediction` 配置选项

- [x] 3. React: 更新类型和组件
  - 导出新配置选项类型
  - 可选: 添加 predicted 节点的默认样式

- [x] 4. Vue: 更新类型和组件
  - 导出新配置选项类型
  - 可选: 添加 predicted 节点的默认样式

- [x] 5. Storybook: 添加演示
  - 展示行内预测效果
  - 对比开启/关闭预测的差异
