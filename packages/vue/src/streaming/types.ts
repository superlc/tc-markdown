import type { VNode, Ref } from 'vue';
import type { StreamingParserOptions, ParserStats, BlockInfo, OutputRate, OutputRateStatus } from '@superlc/md-core';
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
  /** 输出速率配置 */
  outputRate?: OutputRate;
}

/**
 * useStreamingMarkdown Composable 返回值
 */
export interface UseStreamingMarkdownResult {
  /** 渲染后的 VNode */
  vnode: Ref<VNode | null>;
  /** 追加内容（手动模式） */
  append: (chunk: string) => void;
  /** 开始按速率输出（速率控制模式） */
  start: (source: string) => void;
  /** 暂停输出 */
  pause: () => void;
  /** 恢复输出 */
  resume: () => void;
  /** 跳过到结束 */
  skipToEnd: () => void;
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
  /** 输出进度 (0-1) */
  progress: Ref<number>;
  /** 输出状态 */
  outputStatus: Ref<OutputRateStatus>;
}

/**
 * StreamingMarkdown 组件 Props
 */
export interface StreamingMarkdownProps extends StreamingParserOptions {
  /** 当前累积的 Markdown 内容（外部控制模式） */
  content?: string;
  /** 完整的 Markdown 源内容（内置速率控制模式） */
  source?: string;
  /** 输出速率配置，默认 'medium' */
  outputRate?: OutputRate;
  /** 是否已完成流式输入 */
  isComplete?: boolean;
  /** 自定义组件映射 */
  components?: MarkdownComponents;
  /** 容器 class */
  class?: string;
  /** 最小更新间隔 (ms) */
  minUpdateInterval?: number;
  /** 是否自动开始输出（仅 source 模式） */
  autoStart?: boolean;
}

/**
 * StreamingMarkdown 组件 Emits
 */
export interface StreamingMarkdownEmits {
  /** 完成事件 */
  (e: 'complete'): void;
  /** 块稳定事件 */
  (e: 'blockStable', block: BlockInfo): void;
  /** 进度变化事件 */
  (e: 'progress', progress: number): void;
}
