/**
 * 预设速率档位
 */
export type OutputRatePreset = 'slow' | 'medium' | 'fast' | 'instant';

/**
 * 自定义速率配置
 */
export interface OutputRateCustom {
  /** 每次输出的间隔时间 (ms) */
  interval: number;
  /** 每次输出的字符数 */
  chunkSize: number;
}

/**
 * 速率配置
 */
export type OutputRate = OutputRatePreset | OutputRateCustom;

/**
 * 控制器状态
 */
export type OutputRateStatus = 'idle' | 'running' | 'paused' | 'complete';

/**
 * 预设速率配置映射
 */
export const RATE_PRESETS: Record<OutputRatePreset, OutputRateCustom> = {
  slow: { interval: 50, chunkSize: 1 },
  medium: { interval: 30, chunkSize: 2 },
  fast: { interval: 10, chunkSize: 5 },
  instant: { interval: 0, chunkSize: Infinity },
};

/**
 * 默认速率
 */
export const DEFAULT_RATE: OutputRatePreset = 'medium';
