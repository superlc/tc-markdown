# Tasks

## Implementation

1. [x] **Vue Markdown 添加 math prop**
   - 在 `packages/vue/src/Markdown.ts` 添加 `math` prop 定义
   - 将 `math` 选项传递给 `parseToHast`

2. [x] **Vue StreamingMarkdown 添加 math prop**
   - 在 `packages/vue/src/streaming/StreamingMarkdown.ts` 添加 `math` prop
   - 将 `math` 选项传递给 `createStreamingParser`

3. [x] **添加 KaTeX CSS 懒加载**
   - 创建 `packages/vue/src/MathProvider.ts`
   - 实现 `preloadKatexCss` 和 `isKatexCssLoaded` 函数
   - 在启用 `math` 时自动加载 KaTeX CSS

4. [x] **更新导出**
   - 在 `packages/vue/src/index.ts` 导出 math 相关函数

## Validation

5. [x] **验证 story 渲染**
   - 确认 Vue/数学公式 story 正确渲染 LaTeX 公式

## Dependencies

- `@tc/md-core` 已支持 `math` 选项
- `katex` 依赖已在项目中安装
