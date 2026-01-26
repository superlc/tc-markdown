/**
 * @tc/md-vue
 * 基于 @tc/md-core 的 Vue 3 Markdown 渲染组件
 */

import type { App } from 'vue';
import { Markdown } from './Markdown';
import { StreamingMarkdown } from './streaming';

export { Markdown };
export { useMarkdown } from './useMarkdown';
export type { MarkdownProps, MarkdownComponents, UseMarkdownOptions } from './types';

// 流式渲染
export { useStreamingMarkdown, StreamingMarkdown } from './streaming';
export type {
  UseStreamingMarkdownOptions,
  UseStreamingMarkdownResult,
  StreamingMarkdownProps,
  StreamingMarkdownEmits,
} from './streaming';

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
} from '@tc/md-core';

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
