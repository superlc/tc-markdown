/**
 * @tc/md-react
 * 基于 @tc/md-core 的 React Markdown 渲染组件
 */

export { Markdown } from './Markdown';
export { useMarkdown } from './useMarkdown';
export type { MarkdownProps, MarkdownComponents, UseMarkdownOptions } from './types';

// 流式渲染
export {
  useStreamingMarkdown,
  StreamingMarkdown,
  StreamingImage,
  AnimationText,
} from './streaming';
export type {
  UseStreamingMarkdownOptions,
  UseStreamingMarkdownResult,
  StreamingMarkdownProps,
  AnimationConfig,
  StreamingConfig,
} from './streaming';

// 工具函数
export { sanitizeHast, sanitizeHtml, isDOMPurifyAvailable } from './utils';
export type { SanitizeConfig } from './utils';

// 重新导出 core 的类型
export type {
  ProcessorOptions,
  PluginConfig,
  BlockInfo,
  ParserStats,
  OutputRate,
  OutputRatePreset,
  OutputRateCustom,
  OutputRateStatus,
  InlineType,
  InlinePredictionOptions,
} from '@tc/md-core';
