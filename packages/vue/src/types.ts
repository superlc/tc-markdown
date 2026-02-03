import type { Component } from 'vue';
import type { ProcessorOptions, MermaidTheme } from '@superlc/md-core';

// 从 core 重新导出
export type { PluginConfig } from '@superlc/md-core';

/**
 * 自定义组件映射表
 * 可用于覆盖默认 HTML 元素的渲染方式
 */
export interface MarkdownComponents {
  /** 标题 h1-h6 */
  h1?: Component;
  h2?: Component;
  h3?: Component;
  h4?: Component;
  h5?: Component;
  h6?: Component;
  /** 段落 */
  p?: Component;
  /** 链接 */
  a?: Component;
  /** 图片 */
  img?: Component;
  /** 代码块 */
  pre?: Component;
  code?: Component;
  /** 列表 */
  ul?: Component;
  ol?: Component;
  li?: Component;
  /** 引用 */
  blockquote?: Component;
  /** 表格 */
  table?: Component;
  thead?: Component;
  tbody?: Component;
  tr?: Component;
  th?: Component;
  td?: Component;
  /** 水平线 */
  hr?: Component;
  /** 其他自定义元素 */
  [key: string]: Component | undefined;
}

/**
 * Mermaid 配置选项
 */
export interface MermaidOptions {
  /** 是否启用 Mermaid 渲染，默认 false */
  enabled?: boolean;
  /** 主题 */
  theme?: MermaidTheme | 'auto';
}

/**
 * Markdown 组件 Props
 */
export interface MarkdownProps extends ProcessorOptions {
  /** Markdown 源文本 */
  content: string;
  /** 自定义组件映射 */
  components?: MarkdownComponents;
  /** 容器 class */
  class?: string;
  /** 是否显示代码块复制按钮，默认 true */
  copyButton?: boolean;
  /**
   * Mermaid 渲染配置
   * - true: 启用默认配置
   * - false: 禁用（默认）
   * - MermaidOptions: 自定义配置
   */
  mermaid?: boolean | MermaidOptions;
}

/**
 * useMarkdown Composable 配置
 */
export interface UseMarkdownOptions extends ProcessorOptions {
  /** 自定义组件映射 */
  components?: MarkdownComponents;
  /** 是否显示代码块复制按钮，默认 true */
  copyButton?: boolean;
  /** Mermaid 渲染配置 */
  mermaid?: boolean | MermaidOptions;
}
