# Proposal: add-math-formula-support

## Summary
添加内置数学公式渲染支持，使用 KaTeX 渲染 LaTeX 语法的数学表达式。

## Problem
当前 Markdown 内容包含数学公式时：
- 行内公式 `$E = mc^2$` 显示为原始文本
- 块级公式 `$$ \sum_{i=1}^{n} i $$` 显示为原始文本

用户需要手动配置 `remark-math` + `rehype-katex` 插件，增加了使用门槛。

## Solution
1. 添加 `remark-math` 和 `rehype-katex` 依赖
2. 在 `ProcessorOptions` 中新增 `math` 配置项（默认 `false`）
3. 当 `math: true` 时自动启用数学公式解析和渲染
4. 添加 KaTeX 样式文件导出

## Scope
- `@tc/md-core`: 添加数学公式插件集成
- 样式：导出 KaTeX CSS

## Impact
- 新增功能，向后兼容
- 新增依赖：`remark-math`、`rehype-katex`、`katex`（peer）
