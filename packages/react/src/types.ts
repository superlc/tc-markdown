import type { ComponentType } from 'react';
import type { ProcessorOptions } from '@tc/md-core';

/**
 * 自定义组件映射表
 * 可用于覆盖默认 HTML 元素的渲染方式
 */
export type MarkdownComponents = {
  [key: string]: ComponentType<Record<string, unknown>> | undefined;
};

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
}

/**
 * useMarkdown Hook 配置
 */
export interface UseMarkdownOptions extends ProcessorOptions {
  /** 自定义组件映射 */
  components?: MarkdownComponents;
}
