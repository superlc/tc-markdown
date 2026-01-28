# markdown-streaming Spec Delta

## ADDED Requirements

### Requirement: Vue 数学公式渲染

Vue 组件 **SHALL** 在启用 `math` 选项后支持 LaTeX 数学公式渲染，并 **MUST** 自动懒加载 KaTeX CSS。

#### Scenario: Vue Markdown 组件启用数学公式

```gherkin
Given Vue Markdown 组件
When 设置 math prop 为 true
And 内容包含 "$E = mc^2$"
Then 渲染输出包含 KaTeX 生成的数学公式元素
```

#### Scenario: Vue StreamingMarkdown 组件启用数学公式

```gherkin
Given Vue StreamingMarkdown 组件
When 设置 math prop 为 true
And 流式输入包含 "$$\\sum_{i=1}^{n} i$$"
Then 渲染输出包含块级数学公式
```

#### Scenario: KaTeX CSS 懒加载

```gherkin
Given 使用 Vue 数学公式组件
When 组件首次渲染
Then KaTeX CSS 被动态加载
And 后续组件复用已加载的 CSS
```

#### Scenario: Vue 导出数学公式辅助函数

```gherkin
Given @tc/md-vue 包
When 导入模块
Then 可以访问 preloadKatexCss 函数
And 可以访问 isKatexCssLoaded 函数
```
