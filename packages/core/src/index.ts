/**
 * @tc/md-core
 * 基于 unified 的 Markdown 解析核心库
 */

export { createProcessor, defaultProcessor } from './processor';
export { parse, parseToHast, parseToHtml } from './parse';
export type { ProcessorOptions, ParseOptions, PluginConfig } from './types';
export type { Root, Element, Text, Comment } from 'hast';

// 流式解析
export { createStreamingParser, BlockSplitter, BlockCache } from './streaming';
export type {
  StreamingParser,
  StreamingParserOptions,
  ParserState,
  ParserStats,
  BlockInfo,
  BlockType,
} from './streaming';

// 输出速率控制
export { OutputRateController, RATE_PRESETS, DEFAULT_RATE } from './output-rate';
export type {
  OutputRate,
  OutputRatePreset,
  OutputRateCustom,
  OutputRateStatus,
} from './output-rate';
