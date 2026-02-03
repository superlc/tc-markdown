/**
 * @superlc/md-vue
 * 基于 @superlc/md-core 的 Vue 3 Markdown 渲染组件
 */

import type { App } from 'vue';
import { Markdown } from './Markdown';
import { StreamingMarkdown } from './streaming';

export { Markdown };
export { useMarkdown } from './useMarkdown';
export { CodeBlock, MermaidBlock, MermaidFullscreenViewer, useZoom } from './components';
export type {
  CodeBlockProps,
  MermaidBlockProps,
  MermaidFullscreenViewerProps,
  ViewMode,
  ZoomConfig,
  ZoomState,
} from './components';
export type { MarkdownProps, MarkdownComponents, UseMarkdownOptions, MermaidOptions } from './types';

// 流式渲染
export { useStreamingMarkdown, StreamingMarkdown } from './streaming';
export type {
  UseStreamingMarkdownOptions,
  UseStreamingMarkdownResult,
  StreamingMarkdownProps,
  StreamingMarkdownEmits,
} from './streaming';

// 数学公式支持
export { preloadKatexCss, isKatexCssLoaded } from './MathProvider';

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
} from '@superlc/md-core';

/**
 * Vue 插件安装函数
 */
export function install(app: App): void {
  app.component('Markdown', Markdown);
  app.component('StreamingMarkdown', StreamingMarkdown);
}

export default {
  install,
  Markdown,
  StreamingMarkdown,
};
