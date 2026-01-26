# Proposal: 流式输出速率可配置

## Summary
为流式渲染组件添加内置的输出速率配置，提供预设速率档位（慢/中/快）和自定义速率选项，默认使用中等速度以获得舒缓的阅读体验。

## Motivation
当前流式渲染组件仅处理内容解析和渲染，输出速率的控制完全由调用方实现（如 Storybook 演示中的 `useSimulatedStream`）。这导致：
1. 每个使用场景都需要重复实现速率控制逻辑
2. 缺少统一的速率标准，用户体验不一致
3. 无法快速调整输出节奏以适配不同阅读场景

## Proposed Solution
1. 新增 `OutputRateController` 工具类，封装速率控制逻辑
2. 提供三个预设速率档位：`slow`（舒缓）、`medium`（中等，默认）、`fast`（快速）
3. 支持自定义 `{ interval, chunkSize }` 精细控制
4. 在 React/Vue Hook 和组件中集成速率控制选项

## Impact
- **@tc/md-core**: 新增 `OutputRateController` 类
- **@tc/md-react**: `useStreamingMarkdown` 和 `StreamingMarkdown` 增加 `outputRate` 选项
- **@tc/md-vue**: 同步支持

## Affected Specs
- `markdown-streaming`: 新增输出速率配置相关 Requirements
