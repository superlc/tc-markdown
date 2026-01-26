import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { ReactElement } from 'react';
import {
  createStreamingParser,
  OutputRateController,
  type OutputRateStatus,
} from '@tc/md-core';
import { toJsxRuntime, type Components } from 'hast-util-to-jsx-runtime';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import type { UseStreamingMarkdownOptions, UseStreamingMarkdownResult } from './types';

/**
 * 流式 Markdown 渲染 Hook
 * 支持高性能增量解析和渲染，以及内置速率控制
 */
export function useStreamingMarkdown(
  options: UseStreamingMarkdownOptions = {}
): UseStreamingMarkdownResult {
  const {
    components,
    minUpdateInterval = 16,
    immediate = false,
    outputRate = 'medium',
    ...parserOptions
  } = options;

  // 解析器实例（稳定引用）
  const parserRef = useRef(createStreamingParser(parserOptions));
  // 速率控制器实例
  const controllerRef = useRef(new OutputRateController(outputRate));

  // 状态
  const [version, setVersion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputStatus, setOutputStatus] = useState<OutputRateStatus>('idle');

  // 更新节流
  const lastUpdateRef = useRef(0);
  const pendingUpdateRef = useRef<number | null>(null);

  // 触发更新
  const triggerUpdate = useCallback(() => {
    const now = performance.now();
    const elapsed = now - lastUpdateRef.current;

    if (immediate || elapsed >= minUpdateInterval) {
      // 立即更新
      lastUpdateRef.current = now;
      setVersion((v) => v + 1);
    } else {
      // 延迟更新
      if (pendingUpdateRef.current === null) {
        pendingUpdateRef.current = window.requestAnimationFrame(() => {
          pendingUpdateRef.current = null;
          lastUpdateRef.current = performance.now();
          setVersion((v) => v + 1);
        });
      }
    }
  }, [minUpdateInterval, immediate]);

  // 追加内容（手动模式）
  const append = useCallback(
    (chunk: string) => {
      parserRef.current.append(chunk);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  // 开始按速率输出（速率控制模式）
  const start = useCallback(
    (source: string) => {
      // 重置解析器
      parserRef.current.reset();
      setIsComplete(false);
      setProgress(0);
      setOutputStatus('running');

      controllerRef.current.start(
        source,
        (chunk, accumulated) => {
          // 重置并重新解析累积内容
          parserRef.current.reset();
          parserRef.current.append(accumulated);
          setProgress(controllerRef.current.progress);
          triggerUpdate();
        },
        () => {
          parserRef.current.finish();
          setIsComplete(true);
          setProgress(1);
          setOutputStatus('complete');
          triggerUpdate();
        }
      );
    },
    [triggerUpdate]
  );

  // 暂停输出
  const pause = useCallback(() => {
    controllerRef.current.pause();
    setOutputStatus(controllerRef.current.status);
  }, []);

  // 恢复输出
  const resume = useCallback(() => {
    controllerRef.current.resume();
    setOutputStatus(controllerRef.current.status);
  }, []);

  // 跳过到结束
  const skipToEnd = useCallback(() => {
    controllerRef.current.skipToEnd();
    setOutputStatus(controllerRef.current.status);
    setProgress(1);
  }, []);

  // 标记完成
  const finish = useCallback(() => {
    controllerRef.current.stop();
    parserRef.current.finish();
    setIsComplete(true);
    setOutputStatus('complete');
    // 取消待处理的更新，立即更新
    if (pendingUpdateRef.current !== null) {
      cancelAnimationFrame(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
    setVersion((v) => v + 1);
  }, []);

  // 重置
  const reset = useCallback(() => {
    controllerRef.current.stop();
    parserRef.current.reset();
    setIsComplete(false);
    setProgress(0);
    setOutputStatus('idle');
    if (pendingUpdateRef.current !== null) {
      cancelAnimationFrame(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
    setVersion((v) => v + 1);
  }, []);

  // 更新速率配置
  useEffect(() => {
    controllerRef.current.setRate(outputRate);
  }, [outputRate]);

  // 清理
  useEffect(() => {
    return () => {
      controllerRef.current.stop();
      if (pendingUpdateRef.current !== null) {
        cancelAnimationFrame(pendingUpdateRef.current);
      }
    };
  }, []);

  // 获取当前状态
  const state = parserRef.current.getState();
  const stats = parserRef.current.getStats();
  const content = parserRef.current.getContent();

  // 转换 HAST 为 React 元素
  const element = useMemo(() => {
    if (state.hast.children.length === 0) {
      return null;
    }

    try {
      return toJsxRuntime(state.hast, {
        jsx,
        jsxs,
        Fragment,
        components: components as Components,
      }) as ReactElement;
    } catch {
      return null;
    }
  }, [state.hast, components, version]);

  return {
    element,
    append,
    start,
    pause,
    resume,
    skipToEnd,
    reset,
    finish,
    blocks: state.blocks,
    stats,
    isComplete,
    content,
    progress,
    outputStatus,
  };
}
