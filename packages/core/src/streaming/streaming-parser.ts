import type { Root, Element, RootContent, ElementContent } from 'hast';
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
import { InlineCompleter, type CompletionResult } from '../inline-prediction';

/**
 * 创建流式解析器
 */
export function createStreamingParser(
  options: StreamingParserOptions = {}
): StreamingParser {
  const {
    enableCache = true,
    enableInlinePrediction = true,
    predictedInlineTypes,
    bufferUncertainPrefixes = true,
    ...processorOptions
  } = options;

  // 内部状态
  let content = '';
  let isComplete = false;
  let totalAppends = 0;
  let totalParseTime = 0;

  // 工具实例
  const splitter = new BlockSplitter();
  const cache = new BlockCache();
  const processor = createProcessor(processorOptions);
  const inlineCompleter = enableInlinePrediction
    ? new InlineCompleter({ predictedInlineTypes })
    : null;

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
   * 为预测补全的节点添加 data-predicted 属性
   * 递归处理 HAST 树，标记最内层的行内元素
   */
  function markPredictedNodes(
    node: Element,
    completionResult: CompletionResult
  ): Element {
    if (!completionResult.hasCompletions) {
      return node;
    }

    // 需要标记的标签名映射
    const tagMap: Record<string, string[]> = {
      bold: ['strong', 'b'],
      italic: ['em', 'i'],
      code: ['code'],
      strikethrough: ['del', 's'],
      link: ['a'],
      image: ['img'],
    };

    // 收集需要标记的标签
    const tagsToMark = new Set<string>();
    for (const completion of completionResult.completions) {
      const tags = tagMap[completion.type];
      if (tags) {
        tags.forEach((t) => tagsToMark.add(t));
      }
    }

    // 递归处理节点
    function processNode(n: ElementContent): ElementContent {
      if (n.type !== 'element') {
        return n;
      }

      const elem = n as Element;
      
      // 递归处理子节点
      const newChildren = elem.children.map(processNode);
      
      // 检查是否需要标记
      if (tagsToMark.has(elem.tagName)) {
        return {
          ...elem,
          properties: {
            ...elem.properties,
            'data-predicted': true,
          },
          children: newChildren,
        };
      }

      return {
        ...elem,
        children: newChildren,
      };
    }

    return processNode(node) as Element;
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

        // 行内预测（pair-close 类）
        let sourceToparse = raw.source;
        let completionResult: CompletionResult | null = null;

        if (!stable && inlineCompleter && raw.type !== 'code') {
          completionResult = inlineCompleter.complete(sourceToparse);
          sourceToparse = completionResult.text;
        }

        hast = parseBlock(sourceToparse);

        // 标记预测节点
        if (completionResult?.hasCompletions && hast) {
          hast = markPredictedNodes(hast, completionResult);
        }

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

  /**
   * 在解析前裁剪“末尾不确定的块级前缀”，用于 B 策略：宁可稍微积压也不闪。
   * 典型例子：流式输出停在 "-" / "1." / ">" / "#" / "```" 这一行的中间。
   */
  function stripUncertainTailForDisplay(input: string): string {
    // 围栏代码（fenced code block）：以 "```" 或 "~~~" 开头的代码块围栏行
    // 只在该行尚未“确认”（还没出现空格+内容或换行）时，暂不显示该行。

    const isUncertainLine = (line: string): boolean => {
      // 无序列表前缀："-" / "*" / "+"（可带空格）
      if (/^\s{0,3}[-*+]\s*$/.test(line)) return true;
      // 有序列表前缀："1." / "1)"（可带空格）
      if (/^\s{0,3}\d+[.)]\s*$/.test(line)) return true;
      // 引用前缀：">", "> "
      if (/^\s{0,3}>\s*$/.test(line)) return true;
      // 标题前缀："#"..."######"（可带空格）
      if (/^\s{0,3}#{1,6}\s*$/.test(line)) return true;
      // 围栏代码前缀："```" 或 "~~~"（可带语言，但末尾还在这一行内时也可能不完整）
      if (/^\s{0,3}(`{3,}|~{3,})\s*\w*\s*$/.test(line)) return true;
      return false;
    };

    // 如果以 \n 结尾，最后一行是空；此时检查“上一行”是否是不确定前缀行
    if (input.endsWith('\n')) {
      const trimmedEnd = input.slice(0, -1);
      const lastNl = trimmedEnd.lastIndexOf('\n');
      const prevLine = lastNl >= 0 ? trimmedEnd.slice(lastNl + 1) : trimmedEnd;
      if (isUncertainLine(prevLine)) {
        return lastNl >= 0 ? input.slice(0, lastNl + 1) : '';
      }
      return input;
    }

    const lastNl = input.lastIndexOf('\n');
    const lastLine = lastNl >= 0 ? input.slice(lastNl + 1) : input;
    if (isUncertainLine(lastLine)) {
      return lastNl >= 0 ? input.slice(0, lastNl + 1) : '';
    }
    return input;
  }

  return {
    append(chunk: string): void {
      if (isComplete) {
        throw new Error('Parser is already complete. Call reset() to reuse.');
      }

      content += chunk;
      totalAppends++;

      const parseInput = bufferUncertainPrefixes
        ? stripUncertainTailForDisplay(content)
        : content;

      // 分割并处理块（使用 parseInput 以避免显示不确定前缀）
      const rawBlocks = splitter.split(parseInput);
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
      // 完成时不再缓冲，直接按全量内容解析
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
