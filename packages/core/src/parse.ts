import rehypeStringify from 'rehype-stringify';
import type { Root } from 'hast';
import { createProcessor, defaultProcessor } from './processor';
import type { ParseOptions, ProcessorOptions } from './types';

/**
 * 将 Markdown 解析为 HAST（Hypertext Abstract Syntax Tree）
 * 
 * @param content - Markdown 源文本
 * @param options - 解析配置
 * @returns HAST 根节点
 * 
 * @example
 * ```ts
 * const hast = parseToHast('# Hello World');
 * console.log(hast.children);
 * ```
 */
export function parseToHast(content: string, options: ProcessorOptions = {}): Root {
  const processor = Object.keys(options).length > 0 ? createProcessor(options) : defaultProcessor;
  const mdast = processor.parse(content);
  const hast = processor.runSync(mdast) as Root;
  return hast;
}

/**
 * 将 Markdown 解析为 HTML 字符串
 * 
 * @param content - Markdown 源文本
 * @param options - 解析配置
 * @returns HTML 字符串
 * 
 * @example
 * ```ts
 * const html = parseToHtml('# Hello World');
 * // => '<h1>Hello World</h1>'
 * ```
 */
export function parseToHtml(content: string, options: ProcessorOptions = {}): string {
  const processor = createProcessor(options).use(rehypeStringify, { allowDangerousHtml: true });
  const result = processor.processSync(content);
  return String(result);
}

/**
 * 通用解析函数，支持输出 HAST 或 HTML
 * 
 * @param options - 解析配置（包含 content）
 * @returns 解析结果对象
 */
export function parse(options: ParseOptions): { hast: Root; html: string } {
  const { content, ...processorOptions } = options;
  return {
    hast: parseToHast(content, processorOptions),
    html: parseToHtml(content, processorOptions),
  };
}
