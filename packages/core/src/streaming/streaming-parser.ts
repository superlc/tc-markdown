import type { Root, Element, RootContent } from 'hast';
import type {
  StreamingParser,
  StreamingParserOptions,
  ParserState,
  ParserStats,
  BlockInfo,
} from './types';
import { BlockSplitter, type RawBlock } from './block-splitter';
import { BlockCache } from './block-cache';
import { createProcessor } from '../processor';

/**
 * 创建流式解析器
 */
export function createStreamingParser(
  options: StreamingParserOptions = {}
): StreamingParser {
  const { enableCache = true, ...processorOptions } = options;

  // 内部状态
  let content = '';
  let isComplete = false;
  let totalAppends = 0;
  let totalParseTime = 0;

  // 工具实例
  const splitter = new BlockSplitter();
  const cache = new BlockCache();
  const processor = createProcessor(processorOptions);

  // 当前块信息
  let currentBlocks: BlockInfo[] = [];

  /**
   * 解析单个块的内容为 HAST
   */
  function parseBlock(source: string): Element {
    try {
      const hast = processor.runSync(processor.parse(source)) as Root;
      // 返回第一个子元素，如果没有则创建一个 div 包裹
      if (hast.children.length === 1 && hast.children[0].type === 'element') {
        return hast.children[0] as Element;
      }
      // 多个子元素或非元素，包裹在 div 中
      return {
        type: 'element',
        tagName: 'div',
        properties: {},
        children: hast.children as Element['children'],
      };
    } catch {
      // 解析失败，返回错误提示
      return {
        type: 'element',
        tagName: 'div',
        properties: { className: ['parse-error'] },
        children: [{ type: 'text', value: source }],
      };
    }
  }

  /**
   * 处理原始块，返回带 HAST 的块信息
   */
  function processBlocks(rawBlocks: RawBlock[]): BlockInfo[] {
    const blocks: BlockInfo[] = [];

    for (let i = 0; i < rawBlocks.length; i++) {
      const raw = rawBlocks[i];
      const isLast = i === rawBlocks.length - 1;
      
      // 最后一个块且内容未完成时标记为非稳定
      const stable = raw.stable && (!isLast || isComplete);

      // 尝试从缓存获取
      let hast: Element | null = null;
      if (enableCache && stable) {
        hast = cache.get(i, raw.source);
      }

      // 缓存未命中，解析
      if (!hast) {
        const startTime = performance.now();
        hast = parseBlock(raw.source);
        totalParseTime += performance.now() - startTime;

        // 稳定块存入缓存
        if (enableCache && stable) {
          cache.set(i, raw.source, hast);
        }
      }

      // 为非稳定块添加 pending 属性
      if (!stable && hast) {
        hast = {
          ...hast,
          properties: {
            ...hast.properties,
            'data-pending': true,
          },
        };
      }

      // 添加块 key 到属性
      const key = cache.generateKey(i, raw.source, stable);
      if (hast) {
        hast = {
          ...hast,
          properties: {
            ...hast.properties,
            'data-block-key': key,
          },
        };
      }

      blocks.push(cache.createBlockInfo(i, raw.source, raw.type, stable, hast));
    }

    return blocks;
  }

  /**
   * 构建完整的 HAST 树
   */
  function buildHast(blocks: BlockInfo[]): Root {
    const children: RootContent[] = blocks
      .map((b) => b.hast)
      .filter((h): h is Element => h !== null);

    return {
      type: 'root',
      children,
    };
  }

  return {
    append(chunk: string): void {
      if (isComplete) {
        throw new Error('Parser is already complete. Call reset() to reuse.');
      }

      content += chunk;
      totalAppends++;

      // 分割并处理块
      const rawBlocks = splitter.split(content);
      currentBlocks = processBlocks(rawBlocks);
    },

    getState(): ParserState {
      return {
        hast: buildHast(currentBlocks),
        blocks: currentBlocks,
        isComplete,
      };
    },

    getStats(): ParserStats {
      const cacheStats = cache.getStats();
      return {
        totalAppends,
        cacheHits: cacheStats.hits,
        cacheMisses: cacheStats.misses,
        avgParseTime: totalAppends > 0 ? totalParseTime / totalAppends : 0,
        totalParseTime,
      };
    },

    finish(): void {
      isComplete = true;
      // 重新处理块，标记所有块为稳定
      const rawBlocks = splitter.split(content);
      currentBlocks = processBlocks(rawBlocks);
    },

    reset(): void {
      content = '';
      isComplete = false;
      totalAppends = 0;
      totalParseTime = 0;
      currentBlocks = [];
      cache.clear();
    },

    getContent(): string {
      return content;
    },
  };
}
