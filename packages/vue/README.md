# @superlc/md-vue

基于 [@superlc/md-core](https://www.npmjs.com/package/@superlc/md-core) 的 Vue 3 Markdown 渲染组件，专为流式渲染场景优化。

[![npm version](https://img.shields.io/npm/v/@superlc/md-vue.svg)](https://www.npmjs.com/package/@superlc/md-vue)
[![npm downloads](https://img.shields.io/npm/dm/@superlc/md-vue.svg)](https://www.npmjs.com/package/@superlc/md-vue)

📖 **[在线文档](http://43.163.201.189/md/latest/?path=/docs/%E7%AE%80%E4%BB%8B--docs)** | 🔗 **[GitHub](https://github.com/nicepkg/react-md)**

## 功能特性

- 🌊 **流式渲染** - 专为 AI 对话、实时编辑等场景优化
- 🚀 **高性能** - 增量解析、块级缓存、最小化 DOM 更新
- 📐 **数学公式** - 内置 KaTeX 支持，CSS 懒加载
- 🎨 **代码高亮** - 内置 highlight.js，支持 190+ 语言
- 📊 **Mermaid 图表** - 支持流程图、时序图、类图等
- 🔌 **插件扩展** - 完整支持 remark/rehype 插件生态
- 🎭 **组件覆盖** - 自定义任意 HTML 元素的渲染
- 💚 **Vue 3 原生** - 使用 Composition API 和 VNode
- 🔒 **类型安全** - 完整的 TypeScript 类型定义

## 安装

```bash
# npm
npm install @superlc/md-vue

# pnpm
pnpm add @superlc/md-vue

# yarn
yarn add @superlc/md-vue
```

### 环境要求

- Vue >= 3.3.0

### 可选依赖

```bash
# Mermaid 图表支持
pnpm add mermaid
```

## 快速开始

### 基础使用

```vue
<script setup>
import { Markdown } from '@superlc/md-vue';
import '@superlc/md-vue/styles.css';

const content = `# Hello World

This is **Markdown** content.`;
</script>

<template>
  <Markdown class="markdown-body" :content="content" />
</template>
```

### 流式渲染

#### 受控模式（推荐）

适用于自定义数据源（WebSocket、SSE 等）：

```vue
<script setup>
import { ref } from 'vue';
import { StreamingMarkdown } from '@superlc/md-vue';

const content = ref('');
const isComplete = ref(false);

// 模拟 SSE 数据流
async function fetchStream() {
  const response = await fetch('/api/chat');
  const reader = response.body.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      isComplete.value = true;
      break;
    }
    content.value += new TextDecoder().decode(value);
  }
}
</script>

<template>
  <StreamingMarkdown
    :content="content"
    :is-complete="isComplete"
    class="markdown-body"
  />
</template>
```

#### Source 模式

内置速率控制，适用于模拟流式输出：

```vue
<script setup>
import { StreamingMarkdown } from '@superlc/md-vue';

const fullContent = `# Hello World

This is a long content...`;

function handleComplete() {
  console.log('Done');
}
</script>

<template>
  <StreamingMarkdown
    :source="fullContent"
    output-rate="medium"
    @complete="handleComplete"
  />
</template>
```

#### 自定义速率

```vue
<template>
  <StreamingMarkdown
    :source="content"
    :output-rate="{ charsPerSecond: 100, chunkSize: 5 }"
  />
</template>
```

### 数学公式

```vue
<script setup>
import { Markdown } from '@superlc/md-vue';

const content = `
行内公式：$E = mc^2$

块级公式：
$$
\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$
`;
</script>

<template>
  <Markdown :content="content" math />
</template>
```

### 代码高亮

```vue
<script setup>
import { Markdown } from '@superlc/md-vue';

const content = `
\`\`\`javascript
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`
`;
</script>

<template>
  <Markdown :content="content" highlight />
</template>
```

### Mermaid 图表

```vue
<script setup>
import { Markdown } from '@superlc/md-vue';

const content = `
\`\`\`mermaid
graph TD
    A[开始] --> B{条件判断}
    B -->|是| C[执行操作]
    B -->|否| D[结束]
    C --> D
\`\`\`
`;
</script>

<template>
  <Markdown :content="content" mermaid />
</template>
```

**Mermaid 功能特性：**
- 动态加载：按需加载，不影响首屏性能
- 主题适配：自动跟随浅色/暗色主题
- 全屏查看：支持浏览器原生全屏 API
- 缩放平移：鼠标滚轮缩放，拖拽平移
- PNG 下载：一键导出高清 PNG 图片

### 自定义组件

```vue
<script setup>
import { h } from 'vue';
import { Markdown } from '@superlc/md-vue';

const CustomHeading = (props, { slots }) => {
  return h('h1', { class: 'custom-h1' }, slots.default?.());
};

const CustomLink = (props, { slots }) => {
  return h('a', { 
    href: props.href, 
    target: '_blank',
    rel: 'noopener' 
  }, slots.default?.());
};

const components = {
  h1: CustomHeading,
  a: CustomLink,
};

const content = '# Custom Heading\n\n[Link](https://example.com)';
</script>

<template>
  <Markdown :content="content" :components="components" />
</template>
```

### 插件扩展

```vue
<script setup>
import { Markdown } from '@superlc/md-vue';
import remarkEmoji from 'remark-emoji';
import rehypeSlug from 'rehype-slug';

const remarkPlugins = [{ plugin: remarkEmoji }];
const rehypePlugins = [{ plugin: rehypeSlug }];

const content = ':rocket: # Hello';
</script>

<template>
  <Markdown
    :content="content"
    :remark-plugins="remarkPlugins"
    :rehype-plugins="rehypePlugins"
  />
</template>
```

### 使用 Composables

```vue
<script setup>
import { ref } from 'vue';
import { useMarkdown, useStreamingMarkdown } from '@superlc/md-vue';

// 静态渲染
const content = ref('# Hello World');
const vnode = useMarkdown(content, { gfm: true, highlight: true });

// 流式渲染
const streamContent = ref('');
const isComplete = ref(false);

const { blocks, stats } = useStreamingMarkdown({
  content: streamContent,
  isComplete,
  onComplete: () => console.log('Done'),
});
</script>

<template>
  <div class="markdown-body">
    <component :is="vnode" />
  </div>
</template>
```

## API 参考

### Markdown 组件

| Prop | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `content` | `string` | - | Markdown 内容 |
| `class` | `string` | - | 容器 CSS 类名 |
| `gfm` | `boolean` | `true` | 启用 GFM 扩展 |
| `highlight` | `boolean` | `true` | 启用代码高亮 |
| `math` | `boolean` | `false` | 启用数学公式 |
| `mermaid` | `boolean` | `false` | 启用 Mermaid 图表 |
| `components` | `object` | `{}` | 自定义组件映射 |
| `remarkPlugins` | `array` | `[]` | remark 插件列表 |
| `rehypePlugins` | `array` | `[]` | rehype 插件列表 |

### StreamingMarkdown 组件

| Prop | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `content` | `string` | - | 受控模式内容 |
| `source` | `string` | - | Source 模式完整内容 |
| `isComplete` | `boolean` | `false` | 受控模式完成标记 |
| `outputRate` | `string \| object` | `'medium'` | 输出速率 |
| `minUpdateInterval` | `number` | `16` | 最小更新间隔(ms) |

**Events:**

| 事件 | 参数 | 描述 |
|------|------|------|
| `complete` | - | 渲染完成时触发 |
| `block-stable` | `block: Block` | 块稳定时触发 |
| `progress` | `progress: number` | 进度更新时触发 |

### MermaidBlock 组件

| Prop | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `code` | `string` | - | Mermaid 图表代码 |
| `streamStatus` | `'loading' \| 'done'` | `'done'` | 流式状态 |

### useMarkdown Composable

```typescript
function useMarkdown(
  content: Ref<string> | string,
  options?: MarkdownOptions
): ComputedRef<VNode>;
```

### useStreamingMarkdown Composable

```typescript
function useStreamingMarkdown(options: {
  content: Ref<string>;
  isComplete?: Ref<boolean>;
  onComplete?: () => void;
  onBlockStable?: (block: Block) => void;
}): {
  blocks: Ref<Block[]>;
  isComplete: Ref<boolean>;
  stats: ComputedRef<{ totalBlocks: number; stableBlocks: number }>;
};
```

## 样式

```typescript
// 引入默认样式
import '@superlc/md-vue/styles.css';
```

样式包含：
- 基础 Markdown 排版
- 代码高亮主题（亮色/暗色自动切换）
- 数学公式样式
- 表格、任务列表等 GFM 样式
- Mermaid 图表容器样式

## 浏览器支持

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## 相关包

| 包 | 描述 |
|---|---|
| [@superlc/md-core](https://www.npmjs.com/package/@superlc/md-core) | 解析核心库 |
| [@superlc/md-react](https://www.npmjs.com/package/@superlc/md-react) | React 渲染组件 |

## License

MIT
