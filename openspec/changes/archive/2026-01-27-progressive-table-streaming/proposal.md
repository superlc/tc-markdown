# Proposal: progressive-table-streaming

## Summary
优化表格的流式显示，从当前的「一次性完整显示」改为「渐进式逐行显示」，提升用户体验。

## Problem
当前实现中，`stream-buffer.ts` 将表格识别为不完整 token 时会进行缓冲，直到表格结构完整（header + separator + 至少一行数据）后才一次性显示。这导致：
1. 长表格需要等待较长时间才能看到任何内容
2. 用户无法感知表格正在生成
3. 与其他块级元素（段落、列表）的渐进式显示体验不一致

## Solution
1. **移除表格的 token 缓冲**：不再将表格作为 incomplete token 缓冲
2. **逐行显示表格**：当 header + separator 确认后，立即开始显示表格结构
3. **表格行增量渲染**：每新增一行数据，增量更新表格 DOM

## Scope
- `@tc/md-core`: 修改 `stream-buffer.ts` 和 `block-splitter.ts` 中的表格处理逻辑
- 不涉及 React/Vue 组件层改动（复用现有增量渲染机制）

## Non-Goals
- 不处理表格内的行内元素预测（已有 InlineCompleter 处理）
- 不改变表格的 HAST 输出结构

## Risks
- 表格 header 未完成时可能显示为普通段落，需要处理过渡

## Affected Specs
- `markdown-streaming`: 新增表格渐进式显示 requirement
