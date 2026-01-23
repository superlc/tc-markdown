import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { ReactElement } from 'react';
import { createStreamingParser, type ParserStats, type BlockInfo } from '@tc/md-core';
import { toJsxRuntime, type Components } from 'hast-util-to-jsx-runtime';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import type { UseStreamingMarkdownOptions, UseStreamingMarkdownResult } from './types';

/**
 * 流式 Markdown 渲染 Hook
 * 支持高性能增量解析和渲染
 */
export function useStreamingMarkdown(
  options: UseStreamingMarkdownOptions = {}
): UseStreamingMarkdownResult {
  const {
    components,
    minUpdateInterval = 16,
    immediate = false,
    ...parserOptions
  } = options;

  // 解析器实例（稳定引用）
  const parserRef = useRef(createStreamingParser(parserOptions));

  // 状态
  const [version, setVersion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

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

  // 追加内容
  const append = useCallback(
    (chunk: string) => {
      parserRef.current.append(chunk);
      triggerUpdate();
    },
    [triggerUpdate]
  );

  // 标记完成
  const finish = useCallback(() => {
    parserRef.current.finish();
    setIsComplete(true);
    // 取消待处理的更新，立即更新
    if (pendingUpdateRef.current !== null) {
      cancelAnimationFrame(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
    setVersion((v) => v + 1);
  }, []);

  // 重置
  const reset = useCallback(() => {
    parserRef.current.reset();
    setIsComplete(false);
    if (pendingUpdateRef.current !== null) {
      cancelAnimationFrame(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
    setVersion((v) => v + 1);
  }, []);

  // 清理
  useEffect(() => {
    return () => {
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
    reset,
    finish,
    blocks: state.blocks,
    stats,
    isComplete,
    content,
  };
}
