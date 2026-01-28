# Proposal: Vue 包支持数学公式渲染

## Summary

为 `@tc/md-vue` 包的 `Markdown` 和 `StreamingMarkdown` 组件添加 `math` prop 支持，实现与 React 包一致的 LaTeX 数学公式渲染能力。

## Motivation

- React 的 `StreamingMarkdown` 组件已支持 `math` prop 和 KaTeX CSS 懒加载
- Vue 的组件缺少 `math` prop，无法启用数学公式渲染
- 当前 story 中传递 `math: true` 但组件未处理该属性

## Scope

- 为 Vue `Markdown` 组件添加 `math` prop
- 为 Vue `StreamingMarkdown` 组件添加 `math` prop  
- 添加 KaTeX CSS 懒加载工具（复用 React 的模式）
- 导出 `MathProvider` 等辅助函数

## Non-Goals

- 不修改 core 包的数学公式解析逻辑（已支持）
- 不添加新的数学渲染引擎
