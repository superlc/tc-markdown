import React, { useEffect, useRef, useMemo, memo } from 'react';
import type { FC, ReactElement } from 'react';
import { createStreamingParser, type BlockInfo } from '@tc/md-core';
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
 * 声明式 API，支持受控模式
 */
export const StreamingMarkdown: FC<StreamingMarkdownProps> = ({
  content,
  isComplete = false,
  onComplete,
  onBlockStable,
  components,
  className,
  minUpdateInterval = 16,
  ...parserOptions
}) => {
  // 解析器实例
  const parserRef = useRef(createStreamingParser(parserOptions));
  
  // 上一次的内容和块状态
  const prevContentRef = useRef('');
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

  // 内容变化时更新解析器
  useEffect(() => {
    const prevContent = prevContentRef.current;
    
    if (content !== prevContent) {
      // 检测是追加还是替换
      if (content.startsWith(prevContent)) {
        // 追加模式
        const newChunk = content.slice(prevContent.length);
        if (newChunk) {
          parserRef.current.append(newChunk);
        }
      } else {
        // 替换模式，重置解析器
        parserRef.current.reset();
        if (content) {
          parserRef.current.append(content);
        }
      }
      
      prevContentRef.current = content;
      triggerUpdate();
    }
  }, [content]);

  // 完成状态变化
  useEffect(() => {
    if (isComplete) {
      parserRef.current.finish();
      if (pendingUpdateRef.current !== null) {
        cancelAnimationFrame(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
      forceUpdate();
      onComplete?.();
    }
  }, [isComplete, onComplete]);

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
      if (pendingUpdateRef.current !== null) {
        cancelAnimationFrame(pendingUpdateRef.current);
      }
    };
  }, []);

  // 获取当前状态
  const state = parserRef.current.getState();

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
    <div className={className} data-streaming={!isComplete}>
      {renderedBlocks}
    </div>
  );
};

StreamingMarkdown.displayName = 'StreamingMarkdown';
