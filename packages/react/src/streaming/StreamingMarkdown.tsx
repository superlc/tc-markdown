import React, { useEffect, useRef, useMemo, memo } from 'react';
import type { FC, ReactElement } from 'react';
import {
  createStreamingParser,
  OutputRateController,
  type BlockInfo,
} from '@tc/md-core';
import { toJsxRuntime, type Components } from 'hast-util-to-jsx-runtime';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import type { StreamingMarkdownProps } from './types';

/**
 * 稳定块渲染组件
 * 使用 memo 避免不必要的重渲染
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
      return <div className="parse-error">{block.source}</div>;
    }
  },
  (prev, next) => {
    // 只有 key 相同且都是稳定块时跳过重渲染
    return prev.block.key === next.block.key && prev.block.stable && next.block.stable;
  }
);

StableBlock.displayName = 'StableBlock';

/**
 * 流式 Markdown 渲染组件
 * 声明式 API，支持受控模式和内置速率控制模式
 */
export const StreamingMarkdown: FC<StreamingMarkdownProps> = ({
  content,
  source,
  outputRate = 'medium',
  isComplete = false,
  onComplete,
  onBlockStable,
  onProgress,
  components,
  className,
  minUpdateInterval = 16,
  autoStart = true,
  ...parserOptions
}) => {
  // 解析器实例
  const parserRef = useRef(createStreamingParser(parserOptions));
  // 速率控制器实例
  const controllerRef = useRef(new OutputRateController(outputRate));

  // 上一次的内容和块状态
  const prevContentRef = useRef('');
  const prevSourceRef = useRef<string | undefined>(undefined);
  const prevBlocksRef = useRef<BlockInfo[]>([]);

  // 更新节流
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const lastUpdateRef = useRef(0);
  const pendingUpdateRef = useRef<number | null>(null);

  // 触发更新
  const triggerUpdate = () => {
    const now = performance.now();
    const elapsed = now - lastUpdateRef.current;

    if (elapsed >= minUpdateInterval) {
      lastUpdateRef.current = now;
      forceUpdate();
    } else if (pendingUpdateRef.current === null) {
      pendingUpdateRef.current = window.requestAnimationFrame(() => {
        pendingUpdateRef.current = null;
        lastUpdateRef.current = performance.now();
        forceUpdate();
      });
    }
  };

  // source 模式：使用内置速率控制
  useEffect(() => {
    if (source !== undefined && source !== prevSourceRef.current) {
      prevSourceRef.current = source;

      if (autoStart && source) {
        // 重置解析器
        parserRef.current.reset();
        prevContentRef.current = '';

        controllerRef.current.start(
          source,
          (chunk) => {
            // 增量追加，避免每个 chunk 都 reset 导致整树重建闪烁
            if (chunk) {
              parserRef.current.append(chunk);
              prevContentRef.current += chunk;
            }
            onProgress?.(controllerRef.current.progress);
            triggerUpdate();
          },
          () => {
            parserRef.current.finish();
            onComplete?.();
            triggerUpdate();
          }
        );
      }
    }
  }, [source, autoStart, onComplete, onProgress]);

  // content 模式：外部控制（仅当 source 未提供时）
  useEffect(() => {
    if (source !== undefined) {
      // source 模式优先，忽略 content
      return;
    }

    const prevContent = prevContentRef.current;
    const currentContent = content || '';

    if (currentContent !== prevContent) {
      // 检测是追加还是替换
      if (currentContent.startsWith(prevContent)) {
        // 追加模式
        const newChunk = currentContent.slice(prevContent.length);
        if (newChunk) {
          parserRef.current.append(newChunk);
        }
      } else {
        // 替换模式，重置解析器
        parserRef.current.reset();
        if (currentContent) {
          parserRef.current.append(currentContent);
        }
      }

      prevContentRef.current = currentContent;
      triggerUpdate();
    }
  }, [content, source]);

  // 完成状态变化（仅 content 模式）
  useEffect(() => {
    if (source !== undefined) {
      return;
    }

    if (isComplete) {
      parserRef.current.finish();
      if (pendingUpdateRef.current !== null) {
        cancelAnimationFrame(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
      forceUpdate();
      onComplete?.();
    }
  }, [isComplete, onComplete, source]);

  // 更新速率配置
  useEffect(() => {
    controllerRef.current.setRate(outputRate);
  }, [outputRate]);

  // 检测块稳定事件
  useEffect(() => {
    if (onBlockStable) {
      const currentBlocks = parserRef.current.getState().blocks;
      const prevBlocks = prevBlocksRef.current;

      currentBlocks.forEach((block, index) => {
        const prevBlock = prevBlocks[index];
        if (block.stable && (!prevBlock || !prevBlock.stable)) {
          onBlockStable(block);
        }
      });

      prevBlocksRef.current = currentBlocks;
    }
  });

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

  // 判断是否完成
  const isStreamComplete = source !== undefined 
    ? controllerRef.current.status === 'complete' 
    : isComplete;

  // 渲染块
  const renderedBlocks = useMemo(() => {
    return state.blocks.map((block) => (
      <StableBlock
        key={block.key}
        block={block}
        components={components as Components}
      />
    ));
  }, [state.blocks, components]);

  return (
    <div className={className} data-streaming={!isStreamComplete}>
      {renderedBlocks}
    </div>
  );
};

StreamingMarkdown.displayName = 'StreamingMarkdown';
