# Tasks: progressive-table-streaming

## Implementation Tasks

- [x] **1. 移除表格 token 缓冲逻辑**
  - 修改 `stream-buffer.ts`，移除 `table` tokenRecognizer
  - 表格内容不再被缓冲，直接 commit 到输出

- [x] **2. 优化表格块识别**
  - 修改 `stream-buffer.ts`，添加不完整表格行的检测
  - 当只有 `|` 开头但未闭合时，暂不显示该行

- [x] **3. 验证增量渲染**
  - 确保表格块的 key 在内容追加时保持稳定
  - 验证 React/Vue 组件正确增量更新

- [x] **4. 更新 Storybook 示例**
  - 扩展表格测试用例，添加更多行验证渐进式显示

## Validation
- 流式输入表格时，逐行显示
- 表格 header + separator 确认后立即显示表头
- 后续数据行增量追加
- 无闪烁或跳动
