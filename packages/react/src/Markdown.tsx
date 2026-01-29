import type { FC } from 'react';
import { useMemo } from 'react';
import { parseToHast } from '@superlc/md-core';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import type { MarkdownProps } from './types';
import { CodeBlock } from './components/CodeBlock';

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
  copyButton = true,
  onCodeCopy,
  ...processorOptions
}) => {
  const element = useMemo(() => {
    if (!children) return null;

    const hast = parseToHast(children, processorOptions);

    // 创建内置 CodeBlock 组件
    const PreComponent = copyButton
      ? (props: Record<string, unknown>) => (
          <CodeBlock showCopyButton={copyButton} onCopy={onCodeCopy} {...props} />
        )
      : undefined;

    // 合并组件，用户自定义组件优先
    const mergedComponents = {
      ...(PreComponent ? { pre: PreComponent } : {}),
      ...components,
    } as Record<string, unknown>;

    return toJsxRuntime(hast, {
      Fragment,
      jsx,
      jsxs,
      components: mergedComponents,
    });
  }, [children, components, copyButton, onCodeCopy, processorOptions]);

  return <div className={className}>{element}</div>;
};

Markdown.displayName = 'Markdown';
