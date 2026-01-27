/**
 * 行内预测补全类型
 */

/**
 * 支持的行内标记类型
 */
export type InlineType = 'bold' | 'italic' | 'code' | 'strikethrough' | 'link' | 'image';

/**
 * 补全信息
 */
export interface Completion {
  /** 标记类型 */
  type: InlineType;
  /** 开始标记在原文中的位置 */
  position: number;
  /** 补全的闭合标记 */
  marker: string;
  /** 开始标记 */
  openMarker: string;
}

/**
 * 补全结果
 */
export interface CompletionResult {
  /** 补全后的文本 */
  text: string;
  /** 补全的标记信息 */
  completions: Completion[];
  /** 是否有补全 */
  hasCompletions: boolean;
}

/**
 * 行内预测配置
 */
export interface InlinePredictionOptions {
  /** 是否启用行内预测，默认 true */
  enableInlinePrediction?: boolean;
  /** 预测的行内标记类型，默认全部 */
  predictedInlineTypes?: InlineType[];
}

/**
 * 标记状态（用于栈追踪）
 */
export interface MarkerState {
  type: InlineType;
  marker: string;
  position: number;
  /** 对于图片，记录 ]( 后 URL 开始的位置，用于替换不完整的 URL */
  urlStartPosition?: number;
}
