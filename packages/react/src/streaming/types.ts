import type { ReactElement } from 'react';
import type { StreamingParserOptions, ParserStats, BlockInfo, OutputRate, OutputRateStatus } from '@superlc/md-core';
import type { MarkdownComponents } from '../types';
import type { SanitizeConfig } from '../utils/sanitize';

/**
 * 文字动画配置
 */
export interface AnimationConfig {
  /**
   * 淡入动画持续时间（毫秒）
   * @default 200
   */
  fadeDuration?: number;
  /**
   * 动画缓动函数
   * @default 'ease-in-out'
   */
  easing?: string;
}

/**
 * 流式渲染配置
 */
export interface StreamingConfig {
  /**
   * 是否启用文字淡入动画
   * @default false
   */
  enableAnimation?: boolean;
  /**
   * 动画配置
   */
  animationConfig?: AnimationConfig;
  /**
   * 是否启用 HTML 安全净化
   * @default false
   */
  enableSanitize?: boolean;
  /**
   * DOMPurify 配置（仅当 enableSanitize 为 true 时生效）
   */
  sanitizeConfig?: SanitizeConfig;
}

/**
 * useStreamingMarkdown Hook 配置
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
  /** 流式渲染配置（动画等） */
  streaming?: StreamingConfig;
}

/**
 * useStreamingMarkdown Hook 返回值
 */
export interface UseStreamingMarkdownResult {
  /** 渲染后的 React 元素 */
  element: ReactElement | null;
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
  blocks: BlockInfo[];
  /** 性能统计 */
  stats: ParserStats;
  /** 是否已完成 */
  isComplete: boolean;
  /** 累积的内容 */
  content: string;
  /** 输出进度 (0-1) */
  progress: number;
  /** 输出状态 */
  outputStatus: OutputRateStatus;
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
  /** 完成时的回调 */
  onComplete?: () => void;
  /** 块稳定时的回调 */
  onBlockStable?: (block: BlockInfo) => void;
  /** 进度变化回调 */
  onProgress?: (progress: number) => void;
  /** 自定义组件映射 */
  components?: MarkdownComponents;
  /** 容器 className */
  className?: string;
  /** 最小更新间隔 (ms) */
  minUpdateInterval?: number;
  /** 是否自动开始输出（仅 source 模式） */
  autoStart?: boolean;
  /** 流式渲染配置（动画等） */
  streaming?: StreamingConfig;
}
