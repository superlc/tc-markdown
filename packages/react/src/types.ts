import type { ComponentType } from 'react';
import type { ProcessorOptions } from '@superlc/md-core';
import type { MermaidTheme } from '@superlc/md-core';

/**
 * 自定义组件映射表
 * 可用于覆盖默认 HTML 元素的渲染方式
 */
export type MarkdownComponents = {
  [key: string]: ComponentType<Record<string, unknown>> | undefined;
};

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
  children: string;
  /** 自定义组件映射 */
  components?: MarkdownComponents;
  /** 容器 className */
  className?: string;
  /** 是否显示代码块复制按钮，默认 true */
  copyButton?: boolean;
  /** 复制成功回调 */
  onCodeCopy?: (code: string) => void;
  /**
   * Mermaid 渲染配置
   * - true: 启用默认配置
   * - false: 禁用（默认）
   * - MermaidOptions: 自定义配置
   */
  mermaid?: boolean | MermaidOptions;
}

/**
 * useMarkdown Hook 配置
 */
export interface UseMarkdownOptions extends ProcessorOptions {
  /** 自定义组件映射 */
  components?: MarkdownComponents;
  /** 是否显示代码块复制按钮，默认 true */
  copyButton?: boolean;
  /** 复制成功回调 */
  onCodeCopy?: (code: string) => void;
  /** Mermaid 渲染配置 */
  mermaid?: boolean | MermaidOptions;
}
