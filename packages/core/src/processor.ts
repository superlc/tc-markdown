import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import { rehypeImageSize } from './plugins/rehype-image-size';
import type { ProcessorOptions } from './types';

/**
 * 创建 unified processor
 * 
 * @param options - 配置选项
 * @returns 配置好的 unified processor
 * 
 * @example
 * ```ts
 * const processor = createProcessor({ gfm: true, highlight: true });
 * const hast = processor.runSync(processor.parse('# Hello'));
 * ```
 */
export function createProcessor(options: ProcessorOptions = {}) {
  const { gfm = true, highlight = true, remarkPlugins = [], rehypePlugins = [] } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let processor: any = unified().use(remarkParse);

  // 启用 GFM 扩展
  if (gfm) {
    processor = processor.use(remarkGfm);
  }

  // 添加自定义 remark 插件
  for (const config of remarkPlugins) {
    processor = processor.use(config.plugin, config.options);
  }

  // 转换为 hast
  processor = processor.use(remarkRehype, { allowDangerousHtml: true });

  // 启用代码高亮
  if (highlight) {
    processor = processor.use(rehypeHighlight, { detect: true });
  }

  // 提取图片尺寸信息
  processor = processor.use(rehypeImageSize);

  // 添加自定义 rehype 插件
  for (const config of rehypePlugins) {
    processor = processor.use(config.plugin, config.options);
  }

  return processor;
}

/**
 * 默认 processor 实例（启用 GFM 和代码高亮）
 */
export const defaultProcessor = createProcessor();
