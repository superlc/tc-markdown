import {
  OutputRate,
  OutputRateCustom,
  OutputRatePreset,
  OutputRateStatus,
  RATE_PRESETS,
  DEFAULT_RATE,
} from './types';

/**
 * 输出速率控制器
 * 用于控制流式内容的输出速率
 */
export class OutputRateController {
  private _status: OutputRateStatus = 'idle';
  private _progress: number = 0;
  private _config: OutputRateCustom;

  private _content: string = '';
  private _index: number = 0;
  private _accumulated: string = '';
  private _timerId: ReturnType<typeof setTimeout> | null = null;
  private _onChunk: ((chunk: string, accumulated: string) => void) | null = null;
  private _onComplete: (() => void) | null = null;

  constructor(rate: OutputRate = DEFAULT_RATE) {
    this._config = this._resolveConfig(rate);
  }

  /**
   * 当前状态
   */
  get status(): OutputRateStatus {
    return this._status;
  }

  /**
   * 输出进度 (0-1)
   */
  get progress(): number {
    return this._progress;
  }

  /**
   * 开始按速率输出内容
   */
  start(
    content: string,
    onChunk: (chunk: string, accumulated: string) => void,
    onComplete?: () => void
  ): void {
    this.stop();

    this._content = content;
    this._index = 0;
    this._accumulated = '';
    this._onChunk = onChunk;
    this._onComplete = onComplete || null;
    this._status = 'running';
    this._progress = 0;

    this._scheduleNext();
  }

  /**
   * 暂停输出
   */
  pause(): void {
    if (this._status === 'running') {
      this._clearTimer();
      this._status = 'paused';
    }
  }

  /**
   * 恢复输出
   */
  resume(): void {
    if (this._status === 'paused') {
      this._status = 'running';
      this._scheduleNext();
    }
  }

  /**
   * 停止并重置
   */
  stop(): void {
    this._clearTimer();
    this._content = '';
    this._index = 0;
    this._accumulated = '';
    this._onChunk = null;
    this._onComplete = null;
    this._status = 'idle';
    this._progress = 0;
  }

  /**
   * 跳过剩余内容，立即完成
   */
  skipToEnd(): void {
    if (this._status === 'idle' || this._status === 'complete') {
      return;
    }

    this._clearTimer();

    // 输出剩余所有内容
    if (this._index < this._content.length) {
      const remaining = this._content.slice(this._index);
      this._accumulated += remaining;
      this._index = this._content.length;
      this._progress = 1;

      if (this._onChunk) {
        this._onChunk(remaining, this._accumulated);
      }
    }

    this._complete();
  }

  /**
   * 更新速率（运行时）
   */
  setRate(rate: OutputRate): void {
    this._config = this._resolveConfig(rate);
  }

  /**
   * 解析速率配置
   */
  private _resolveConfig(rate: OutputRate): OutputRateCustom {
    if (typeof rate === 'string') {
      return { ...RATE_PRESETS[rate as OutputRatePreset] };
    }
    return { ...rate };
  }

  /**
   * 调度下一次输出
   */
  private _scheduleNext(): void {
    if (this._status !== 'running') {
      return;
    }

    // instant 模式立即输出全部
    if (this._config.interval === 0 || this._config.chunkSize === Infinity) {
      this._outputAll();
      return;
    }

    this._timerId = setTimeout(() => {
      this._outputChunk();
    }, this._config.interval);
  }

  /**
   * 输出一个 chunk
   */
  private _outputChunk(): void {
    if (this._status !== 'running' || this._index >= this._content.length) {
      this._complete();
      return;
    }

    const chunk = this._content.slice(
      this._index,
      this._index + this._config.chunkSize
    );
    this._index += chunk.length;
    this._accumulated += chunk;
    this._progress = this._content.length > 0 
      ? this._index / this._content.length 
      : 1;

    if (this._onChunk) {
      this._onChunk(chunk, this._accumulated);
    }

    if (this._index >= this._content.length) {
      this._complete();
    } else {
      this._scheduleNext();
    }
  }

  /**
   * 立即输出全部内容
   */
  private _outputAll(): void {
    if (this._content.length > 0) {
      this._accumulated = this._content;
      this._index = this._content.length;
      this._progress = 1;

      if (this._onChunk) {
        this._onChunk(this._content, this._accumulated);
      }
    }

    this._complete();
  }

  /**
   * 完成输出
   */
  private _complete(): void {
    this._clearTimer();
    this._status = 'complete';
    this._progress = 1;

    if (this._onComplete) {
      this._onComplete();
    }
  }

  /**
   * 清除定时器
   */
  private _clearTimer(): void {
    if (this._timerId !== null) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }
  }
}
