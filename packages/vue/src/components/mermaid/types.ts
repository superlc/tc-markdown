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

/** MermaidBlock Props */
export interface MermaidBlockProps {
  /** Mermaid 源代码 */
  code: string;
  /** 主题 */
  theme?: MermaidTheme | 'auto';
  /** 是否显示工具栏 */
  showToolbar?: boolean;
}

/** MermaidFullscreenViewer Props */
export interface MermaidFullscreenViewerProps {
  /** SVG 内容 */
  svg: string;
  /** 是否显示 */
  open: boolean;
}
