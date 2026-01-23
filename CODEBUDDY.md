<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 项目概述

基于 [unified](https://unifiedjs.com/) 生态的多框架 Markdown 渲染组件库，支持 React 和 Vue 3。采用 monorepo 架构，核心解析逻辑与框架渲染层分离。

## 常用命令

### 依赖安装
```bash
pnpm install
```

### 开发模式（启动 Storybook）
```bash
pnpm dev
# 或
pnpm storybook
```
在 http://localhost:6006 查看组件文档和示例。

### 构建所有包
```bash
pnpm build
```

### 构建单个包
```bash
pnpm build:core    # @tc/md-core
pnpm build:react   # @tc/md-react
pnpm build:vue     # @tc/md-vue
```

### 运行测试
```bash
pnpm test              # watch 模式
pnpm test:run          # 单次运行
pnpm test:coverage     # 覆盖率报告
```

### 代码检查与格式化
```bash
pnpm lint          # ESLint 检查
pnpm lint:fix      # 自动修复
pnpm format        # Prettier 格式化
pnpm format:check  # 格式检查
```

### 构建 Storybook 静态站点
```bash
pnpm build:storybook
```

## 高层架构

### 整体设计

```
┌─────────────────────────────────────────────────────────────┐
│                      用户应用层                              │
├─────────────────────────────────────────────────────────────┤
│   @tc/md-react          │          @tc/md-vue               │
│   ├── Markdown 组件      │          ├── Markdown 组件        │
│   └── useMarkdown Hook   │          └── useMarkdown Composable│
├─────────────────────────────────────────────────────────────┤
│                      @tc/md-core                             │
│   ├── processor.ts   (unified 管道配置)                      │
│   ├── parse.ts       (解析 API)                             │
│   └── types.ts       (类型定义)                              │
├─────────────────────────────────────────────────────────────┤
│                      unified 生态                            │
│   remark-parse → remark-gfm → remark-rehype → rehype-*       │
└─────────────────────────────────────────────────────────────┘
```

### 包职责

| 包 | 职责 |
|---|---|
| `@tc/md-core` | Markdown 解析核心。封装 unified 管道，将 Markdown 转换为 HAST（Hypertext AST）或 HTML。不依赖任何 UI 框架。 |
| `@tc/md-react` | React 渲染层。将 HAST 通过 `hast-util-to-jsx-runtime` 转换为 React 元素，提供 `<Markdown>` 组件和 `useMarkdown` Hook。 |
| `@tc/md-vue` | Vue 渲染层。将 HAST 递归转换为 Vue VNode，提供 `<Markdown>` 组件和 `useMarkdown` Composable。 |

### 数据流

```
Markdown 文本
    │
    ▼ remark-parse
  MDAST (Markdown AST)
    │
    ▼ remark-gfm (可选插件)
  MDAST (增强)
    │
    ▼ remark-rehype
  HAST (HTML AST)
    │
    ▼ rehype-highlight (可选插件)
  HAST (代码高亮)
    │
    ├──▶ React: hast-util-to-jsx-runtime → React Element
    │
    └──▶ Vue: 自定义 hastToVNode → Vue VNode
```

### 目录结构

```
react-md/
├── packages/
│   ├── core/               # @tc/md-core
│   │   └── src/
│   │       ├── index.ts    # 导出入口
│   │       ├── processor.ts # unified 管道创建
│   │       ├── parse.ts    # parseToHast/parseToHtml API
│   │       └── types.ts    # 类型定义
│   ├── react/              # @tc/md-react
│   │   └── src/
│   │       ├── index.ts
│   │       ├── Markdown.tsx
│   │       ├── useMarkdown.ts
│   │       └── types.ts
│   └── vue/                # @tc/md-vue
│       └── src/
│           ├── index.ts
│           ├── Markdown.vue
│           ├── useMarkdown.ts
│           └── types.ts
├── stories/                # Storybook 示例
├── .storybook/             # Storybook 配置
└── [根配置文件]
```

### 插件扩展机制

通过 `remarkPlugins` 和 `rehypePlugins` 选项注入自定义插件：

```tsx
<Markdown
  remarkPlugins={[{ plugin: remarkMath }]}
  rehypePlugins={[{ plugin: rehypeKatex }]}
>
  $E = mc^2$
</Markdown>
```

插件在 `createProcessor` 中按顺序添加到 unified 管道。

### 自定义组件覆盖

两个框架均支持通过 `components` prop 覆盖默认 HTML 元素渲染：

```tsx
// React
<Markdown components={{ h1: MyHeading, a: MyLink }}>...</Markdown>

// Vue
<Markdown :components="{ h1: MyHeading, a: MyLink }" content="..." />
```

### 构建产物

每个包输出：
- `dist/index.js` - ESM 格式
- `dist/index.cjs` - CommonJS 格式
- `dist/index.d.ts` - TypeScript 类型声明

使用 Vite 库模式构建，外部化 peer dependencies。

### 关键依赖

- **unified** - 内容处理管道框架
- **remark-parse** - Markdown → MDAST 解析器
- **remark-gfm** - GitHub Flavored Markdown 扩展
- **remark-rehype** - MDAST → HAST 转换器
- **rehype-highlight** - 代码语法高亮
- **hast-util-to-jsx-runtime** - HAST → JSX（React 专用）
