import type { VNode, Ref } from 'vue';
import type { StreamingParserOptions, ParserStats, BlockInfo } from '@tc/md-core';
import type { MarkdownComponents } from '../types';

/**
 * useStreamingMarkdown Composable 配置
 */
export interface UseStreamingMarkdownOptions extends StreamingParserOptions {
  /** 自定义组件映射 */
  components?: MarkdownComponents;
  /** 最小更新间隔 (ms)，默认 16 (约 60fps) */
  minUpdateInterval?: number;
  /** 是否禁用批处理，每次 append 立即更新 */
  immediate?: boolean;
}

/**
 * useStreamingMarkdown Composable 返回值
 */
export interface UseStreamingMarkdownResult {
  /** 渲染后的 VNode */
  vnode: Ref<VNode | null>;
  /** 追加内容 */
  append: (chunk: string) => void;
  /** 重置解析器 */
  reset: () => void;
  /** 标记完成 */
  finish: () => void;
  /** 当前块信息 */
  blocks: Ref<BlockInfo[]>;
  /** 性能统计 */
  stats: Ref<ParserStats>;
  /** 是否已完成 */
  isComplete: Ref<boolean>;
  /** 累积的内容 */
  content: Ref<string>;
}

/**
 * StreamingMarkdown 组件 Props
 */
export interface StreamingMarkdownProps extends StreamingParserOptions {
  /** 当前累积的 Markdown 内容 */
  content: string;
  /** 是否已完成流式输入 */
  isComplete?: boolean;
  /** 自定义组件映射 */
  components?: MarkdownComponents;
  /** 容器 class */
  class?: string;
  /** 最小更新间隔 (ms) */
  minUpdateInterval?: number;
}

/**
 * StreamingMarkdown 组件 Emits
 */
export interface StreamingMarkdownEmits {
  /** 完成事件 */
  (e: 'complete'): void;
  /** 块稳定事件 */
  (e: 'blockStable', block: BlockInfo): void;
}
