import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import type { ReactElement } from 'react';
import {
  createStreamingParser,
  OutputRateController,
  type OutputRateStatus,
  type BlockInfo,
} from '@superlc/md-core';
import { toJsxRuntime, type Components } from 'hast-util-to-jsx-runtime';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import type { UseStreamingMarkdownOptions, UseStreamingMarkdownResult } from './types';

/**
 * 稳定块渲染组件
 * Hook 场景下也按块渲染，避免每次更新都重建整棵树导致闪烁
 */
const StableBlock = memo<{
  block: BlockInfo;
  components?: Components;
}>(
  ({ block, components }) => {
    if (!block.hast) return null;

    try {
      return toJsxRuntime(block.hast, {
        jsx,
        jsxs,
        Fragment,
        components,
      }) as ReactElement;
    } catch {
      return null;
    }
  },
  (prev, next) => {
    // 只有 key 相同且都是稳定块时跳过重渲染
    return prev.block.key === next.block.key && prev.block.stable && next.block.stable;
  }
);

StableBlock.displayName = 'StableBlock';

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
        (chunk) => {
          // 增量追加，避免每个 chunk 都 reset 导致整树重建闪烁
          if (chunk) {
            parserRef.current.append(chunk);
          }
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

  // 按块渲染：稳定块通过 key 复用，避免 Hook 场景整树重建闪烁
  const renderedBlocks = useMemo(() => {
    return state.blocks.map((block) =>
      jsx(
        StableBlock,
        {
          block,
          components: components as Components,
        },
        block.key
      )
    );
  }, [state.blocks, components, version]);

  const element = useMemo(() => {
    if (state.blocks.length === 0) {
      return null;
    }
    return jsx(Fragment, { children: renderedBlocks });
  }, [renderedBlocks, state.blocks.length]);

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
