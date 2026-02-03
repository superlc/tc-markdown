/**
 * Mermaid 组件类型定义 (Vue)
 */

import type { MermaidTheme } from '@superlc/md-core';

/** 视图模式 */
export type ViewMode = 'preview' | 'code';

/** 缩放状态 */
export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

/** 缩放配置 */
export interface ZoomConfig {
  min: number;
  max: number;
  step: number;
  default: number;
}

/** 流式状态 */
export type StreamStatus = 'loading' | 'done';

/** MermaidBlock Props */
export interface MermaidBlockProps {
  /** Mermaid 源代码 */
  code: string;
  /** 主题 */
  theme?: MermaidTheme | 'auto';
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /**
   * 流式状态
   * - 'loading': 正在流式输入，代码块可能不完整
   * - 'done': 流式输入完成，代码块已完整
   * 用于优化流式渲染体验：loading 状态下会延迟渲染并保留上次有效结果
   */
  streamStatus?: StreamStatus;
}

/** MermaidFullscreenViewer Props */
export interface MermaidFullscreenViewerProps {
  /** SVG 内容 */
  svg: string;
  /** 是否显示 */
  open: boolean;
}
