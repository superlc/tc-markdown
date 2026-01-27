import type { Root, Element } from 'hast';
import type { ProcessorOptions } from '../types';
import type { InlineType } from '../inline-prediction';

/**
 * 块信息
 */
export interface BlockInfo {
  /** 块的唯一标识 */
  key: string;
  /** 块的原始文本 */
  source: string;
  /** 块是否稳定（已闭合） */
  stable: boolean;
  /** 块在列表中的索引 */
  index: number;
  /** 块类型 */
  type: BlockType;
  /** 解析后的 HAST 节点 */
  hast: Element | null;
}

/**
 * 块类型
 */
export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'code'
  | 'list'
  | 'blockquote'
  | 'thematicBreak'
  | 'table'
  | 'html'
  | 'unknown';

/**
 * 解析器状态
 */
export interface ParserState {
  /** 完整的 HAST 树 */
  hast: Root;
  /** 块信息列表 */
  blocks: BlockInfo[];
  /** 是否已完成 */
  isComplete: boolean;
}

/**
 * 性能统计
 */
export interface ParserStats {
  /** 总追加次数 */
  totalAppends: number;
  /** 缓存命中次数 */
  cacheHits: number;
  /** 缓存未命中次数 */
  cacheMisses: number;
  /** 平均解析时间 (ms) */
  avgParseTime: number;
  /** 总解析时间 (ms) */
  totalParseTime: number;
}

/**
 * 流式解析器配置
 */
export interface StreamingParserOptions extends ProcessorOptions {
  /** 是否启用块缓存，默认 true */
  enableCache?: boolean;
  /** 是否启用行内预测，默认 true */
  enableInlinePrediction?: boolean;
  /** 预测的行内标记类型，默认全部 */
  predictedInlineTypes?: InlineType[];
  /**
   * 是否缓冲（暂不显示）不确定的块级前缀，默认 true。
   * 典型场景：流式输出刚好停在列表前缀 "-" / "1." 时，避免先显示前缀后又变成列表导致闪现。
   */
  bufferUncertainPrefixes?: boolean;
  /**
   * 是否启用字符级流式缓冲，默认 false。
   * 启用后会使用更精细的字符级 token 识别，适用于对闪烁敏感的场景。
   * 注意：会略微增加 CPU 开销。
   */
  enableCharacterBuffer?: boolean;
}

/**
 * 流式解析器接口
 */
export interface StreamingParser {
  /**
   * 追加内容
   * @param chunk 要追加的内容片段
   */
  append(chunk: string): void;

  /**
   * 获取当前解析状态
   */
  getState(): ParserState;

  /**
   * 获取性能统计
   */
  getStats(): ParserStats;

  /**
   * 标记解析完成
   */
  finish(): void;

  /**
   * 重置解析器
   */
  reset(): void;

  /**
   * 获取累积的内容
   */
  getContent(): string;
}
