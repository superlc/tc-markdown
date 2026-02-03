import type { FC } from 'react';
import React, { useMemo } from 'react';
import { parseToHast } from '@superlc/md-core';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import type { MarkdownProps, MermaidOptions } from './types';
import { CodeBlock } from './components/CodeBlock';
import { MermaidBlock } from './components/mermaid';

/**
 * 检查是否为 Mermaid 代码块
 */
function isMermaidCodeBlock(props: Record<string, unknown>): boolean {
  const children = props.children;
  if (!React.isValidElement(children)) return false;

  const codeProps = children.props as Record<string, unknown> | undefined;
  const className = codeProps?.className;

  if (typeof className === 'string') {
    return className.includes('language-mermaid');
  }
  return false;
}

/**
 * 从 code 元素中提取文本
 */
function extractCodeText(children: unknown): string {
  if (!React.isValidElement(children)) return '';
  const codeProps = children.props as Record<string, unknown>;
  const codeChildren = codeProps?.children;

  if (typeof codeChildren === 'string') {
    return codeChildren;
  }
  if (Array.isArray(codeChildren)) {
    return codeChildren
      .map((c) => (typeof c === 'string' ? c : ''))
      .join('');
  }
  return '';
}

/**
 * 解析 Mermaid 配置
 */
function parseMermaidOptions(
  mermaid: boolean | MermaidOptions | undefined
): MermaidOptions | null {
  if (!mermaid) return null;
  if (mermaid === true) return { enabled: true };
  return mermaid.enabled !== false ? mermaid : null;
}

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
 * 
 * @example 启用 Mermaid 渲染
 * ```tsx
 * <Markdown mermaid>
 *   ```mermaid
 *   graph TD
 *     A --> B
 *   ```
 * </Markdown>
 * ```
 */
export const Markdown: FC<MarkdownProps> = ({
  children,
  components,
  className,
  copyButton = true,
  onCodeCopy,
  mermaid,
  ...processorOptions
}) => {
  const mermaidOptions = parseMermaidOptions(mermaid);

  const element = useMemo(() => {
    if (!children) return null;

    const hast = parseToHast(children, processorOptions);

    // 创建内置 CodeBlock 组件
    const PreComponent = (props: Record<string, unknown>) => {
      // 检查是否为 mermaid 代码块
      if (mermaidOptions && isMermaidCodeBlock(props)) {
        const code = extractCodeText(props.children);
        return (
          <MermaidBlock
            code={code}
            theme={mermaidOptions.theme}
            onCopy={onCodeCopy}
          />
        );
      }

      // 普通代码块
      if (copyButton) {
        return (
          <CodeBlock showCopyButton={copyButton} onCopy={onCodeCopy} {...props} />
        );
      }

      return <pre {...props} />;
    };

    // 合并组件，用户自定义组件优先
    const mergedComponents = {
      pre: PreComponent,
      ...components,
    } as Record<string, unknown>;

    return toJsxRuntime(hast, {
      Fragment,
      jsx,
      jsxs,
      components: mergedComponents,
    });
  }, [children, components, copyButton, onCodeCopy, mermaidOptions, processorOptions]);

  return <div className={className}>{element}</div>;
};

Markdown.displayName = 'Markdown';
