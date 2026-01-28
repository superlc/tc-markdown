import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { parseToHast } from '@superlc/md-core';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import type { UseMarkdownOptions } from './types';

/**
 * 将 Markdown 转换为 React 元素的 Hook
 * 
 * @param content - Markdown 源文本
 * @param options - 配置选项
 * @returns React 元素
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const element = useMarkdown('# Hello World', {
 *     components: {
 *       h1: ({ children }) => <h1 className="text-2xl">{children}</h1>
 *     }
 *   });
 *   return <div>{element}</div>;
 * }
 * ```
 */
export function useMarkdown(content: string, options: UseMarkdownOptions = {}): ReactNode {
  const { components = {}, ...processorOptions } = options;

  return useMemo(() => {
    if (!content) return null;

    const hast = parseToHast(content, processorOptions);

    return toJsxRuntime(hast, {
      Fragment,
      jsx,
      jsxs,
      components: components as Record<string, unknown>,
    });
  }, [content, components, processorOptions]);
}
