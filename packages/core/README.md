# @superlc/md-core

基于 [unified](https://unifiedjs.com/) 生态的 Markdown 解析核心库，为 React 和 Vue 渲染层提供统一的解析能力。

[![npm version](https://img.shields.io/npm/v/@superlc/md-core.svg)](https://www.npmjs.com/package/@superlc/md-core)
[![npm downloads](https://img.shields.io/npm/dm/@superlc/md-core.svg)](https://www.npmjs.com/package/@superlc/md-core)

📖 **[在线文档](http://43.163.201.189/md/latest/?path=/docs/%E7%AE%80%E4%BB%8B--docs)** | 🔗 **[GitHub](https://github.com/nicepkg/react-md)**

## 功能特性

- 🚀 **高性能解析** - 基于 unified 生态，解析速度快
- 📦 **零框架依赖** - 纯函数实现，可在任何环境使用
- 🔌 **插件生态** - 完整支持 remark/rehype 插件
- ✅ **规范兼容** - 100% CommonMark 兼容，100% GFM 插件兼容
- 🎨 **内置样式** - 提供精心设计的默认 CSS 样式
- 📐 **数学公式** - 内置 remark-math + rehype-katex 支持
- 💡 **代码高亮** - 内置 rehype-highlight 支持
- 🔒 **类型安全** - 完整的 TypeScript 类型定义

## 安装

```bash
# npm
npm install @superlc/md-core

# pnpm
pnpm add @superlc/md-core

# yarn
yarn add @superlc/md-core
```

## 快速开始

### 基础使用

```typescript
import { parseToHtml, parseToHast } from '@superlc/md-core';

// 解析为 HTML 字符串
const html = parseToHtml('# Hello World');
console.log(html); // <h1>Hello World</h1>

// 解析为 HAST (Hypertext AST)
const hast = parseToHast('# Hello World');
console.log(hast);
```

### 启用 GFM 扩展

```typescript
import { parseToHtml } from '@superlc/md-core';

const markdown = `
| 名称 | 价格 |
|------|------|
| 苹果 | ¥5   |
| 香蕉 | ¥3   |

- [x] 已完成
- [ ] 待办
`;

const html = parseToHtml(markdown, { gfm: true });
```

### 代码高亮

```typescript
import { parseToHtml } from '@superlc/md-core';

const markdown = `
\`\`\`javascript
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`
`;

const html = parseToHtml(markdown, { highlight: true });
```

### 数学公式

```typescript
import { parseToHtml } from '@superlc/md-core';

const markdown = `
行内公式：$E = mc^2$

块级公式：
$$
\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$
`;

const html = parseToHtml(markdown, { math: true });
```

### 自定义插件

```typescript
import { createProcessor, parseToHtml } from '@superlc/md-core';
import remarkEmoji from 'remark-emoji';
import rehypeSlug from 'rehype-slug';

const html = parseToHtml(':rocket: # Hello', {
  remarkPlugins: [{ plugin: remarkEmoji }],
  rehypePlugins: [{ plugin: rehypeSlug }],
});
```

### 创建自定义处理器

```typescript
import { createProcessor } from '@superlc/md-core';

const processor = createProcessor({
  gfm: true,
  highlight: true,
  math: true,
});

// 复用处理器解析多个文档
const html1 = processor.processSync('# Doc 1').toString();
const html2 = processor.processSync('# Doc 2').toString();
```

## API 参考

### parseToHtml(markdown, options?)

将 Markdown 字符串解析为 HTML 字符串。

```typescript
function parseToHtml(markdown: string, options?: ParseOptions): string;
```

### parseToHast(markdown, options?)

将 Markdown 字符串解析为 HAST (Hypertext AST)。

```typescript
function parseToHast(markdown: string, options?: ParseOptions): HastRoot;
```

### createProcessor(options?)

创建一个可复用的 unified 处理器。

```typescript
function createProcessor(options?: ParseOptions): Processor;
```

### ParseOptions

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `gfm` | `boolean` | `true` | 启用 GitHub Flavored Markdown |
| `highlight` | `boolean` | `true` | 启用代码语法高亮 |
| `math` | `boolean` | `false` | 启用数学公式 (KaTeX) |
| `remarkPlugins` | `PluginConfig[]` | `[]` | remark 插件列表 |
| `rehypePlugins` | `PluginConfig[]` | `[]` | rehype 插件列表 |

### PluginConfig

```typescript
interface PluginConfig {
  plugin: Plugin;
  options?: any;
}
```

## 样式

包内提供了预设的 CSS 样式：

```typescript
import '@superlc/md-core/styles.css';
```

样式包含：
- 基础 Markdown 排版样式
- 代码高亮主题（亮色/暗色）
- 数学公式样式
- 表格、任务列表等 GFM 样式

## 架构设计

```
Markdown 文本
    │
    ▼ remark-parse
  MDAST (Markdown AST)
    │
    ▼ remark-gfm (可选)
  MDAST (增强)
    │
    ▼ remark-rehype
  HAST (HTML AST)
    │
    ▼ rehype-highlight (可选)
  HAST (代码高亮)
    │
    ├──▶ parseToHast() → HAST
    │
    └──▶ parseToHtml() → HTML String
```

## 相关包

| 包 | 描述 |
|---|---|
| [@superlc/md-react](https://www.npmjs.com/package/@superlc/md-react) | React 渲染组件 |
| [@superlc/md-vue](https://www.npmjs.com/package/@superlc/md-vue) | Vue 3 渲染组件 |

## License

MIT
