/**
 * Mermaid 组件类型定义
 */

import type { MermaidTheme } from '@superlc/md-core';

/** 视图模式 */
export type ViewMode = 'preview' | 'code';

/** 缩放配置 */
export interface ZoomConfig {
  min: number;
  max: number;
  step: number;
  default: number;
}

/** 缩放状态 */
export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

/** MermaidBlock Props */
export interface MermaidBlockProps {
  /** Mermaid 源代码 */
  code: string;
  /** 主题 */
  theme?: MermaidTheme | 'auto';
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 复制成功回调 */
  onCopy?: (code: string) => void;
  /** 额外的 className */
  className?: string;
}

/** MermaidFullscreenViewer Props */
export interface MermaidFullscreenViewerProps {
  /** SVG 内容 */
  svg: string;
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 下载回调 */
  onDownload?: () => void;
}
