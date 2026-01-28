# Proposal: fix-image-skeleton-shimmer

## Summary
修复图片加载占位容器（skeleton）的流光（shimmer）动画效果丢失问题。

## Problem
图片骨架屏的 shimmer 动画存在两个问题：

1. **CSS 动画配置问题**：
   - 动画缺少 `linear` 缓动函数，导致流光效果不流畅
   - `background-position` 的起始值和结束值设置不正确

2. **组件频繁重建问题**（根因）：
   - 块的 key 基于 `index + source hash` 生成
   - 流式输入时 source 不断变化，导致 key 变化
   - React 销毁并重建组件，`StreamingImage` 的 skeleton 状态被重置

## Solution

1. **修复 CSS 动画**：
   - 添加 `linear` 缓动函数
   - 调整 `background-position` 动画值

2. **稳定块 key 生成策略**：
   - 块 key 仅使用 `index`，不包含 source hash
   - 确保流式输入过程中组件实例保持稳定
   - memo 比较函数决定是否跳过重渲染

## Scope
- `packages/core/src/styles/markdown.css` - CSS 动画修复
- `packages/core/src/streaming/block-cache.ts` - key 生成策略

## Affected Components
- `@tc/md-core`
- `@tc/md-react`（间接受益）
