# Tasks

## Implementation

- [x] 1. 添加依赖 `remark-math`、`rehype-katex` 到 `@tc/md-core`
- [x] 2. 在 `ProcessorOptions` 中添加 `math?: boolean` 配置项
- [x] 3. 在 `createProcessor` 中根据 `math` 配置启用插件
- [x] 4. 创建 `MathProvider` 组件实现 KaTeX CSS 懒加载
- [x] 5. 在 `StreamingMarkdown` 组件中自动懒加载 KaTeX CSS
- [x] 6. 更新 Storybook 示例验证数学公式渲染

## Validation

- [x] 行内公式 `$E = mc^2$` 正确渲染
- [x] 块级公式 `$$ ... $$` 正确渲染
- [x] 默认不启用数学公式（`math: false`）
- [x] 启用 `math: true` 后公式正常显示
- [x] KaTeX CSS 懒加载，不打包到构建产物中

## Usage

只需设置 `math={true}` prop，CSS 会自动懒加载：

```tsx
<StreamingMarkdown source={content} math={true} />
```
