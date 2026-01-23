import type { FC } from 'react';
import { useMarkdown } from './useMarkdown';
import type { MarkdownProps } from './types';

/**
 * React Markdown 渲染组件
 * 
 * @example
 * ```tsx
 * <Markdown className="prose">
 *   # Hello World
 *   
 *   This is **bold** and *italic* text.
 * </Markdown>
 * ```
 * 
 * @example 自定义组件
 * ```tsx
 * <Markdown
 *   components={{
 *     h1: ({ children }) => <h1 className="text-3xl font-bold">{children}</h1>,
 *     a: ({ href, children }) => <a href={href} target="_blank">{children}</a>
 *   }}
 * >
 *   # Custom Heading
 *   [Link](https://example.com)
 * </Markdown>
 * ```
 */
export const Markdown: FC<MarkdownProps> = ({
  children,
  components,
  className,
  ...processorOptions
}) => {
  const element = useMarkdown(children, { components, ...processorOptions });

  return <div className={className}>{element}</div>;
};

Markdown.displayName = 'Markdown';
