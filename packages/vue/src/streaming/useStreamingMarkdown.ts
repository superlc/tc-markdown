import { ref, computed, onUnmounted, h, type VNode } from 'vue';
import { createStreamingParser, type Root, type Element } from '@tc/md-core';
import type { UseStreamingMarkdownOptions, UseStreamingMarkdownResult } from './types';
import type { MarkdownComponents } from '../types';

/**
 * 将 HAST 节点转换为 Vue VNode
 */
function hastToVNode(
  node: Root | Element | { type: string; value?: string },
  components?: MarkdownComponents
): VNode | string | null {
  if (node.type === 'text') {
    return (node as { value: string }).value;
  }

  if (node.type === 'root') {
    const children = (node as Root).children
      .map((child) => hastToVNode(child as Element, components))
      .filter((v): v is VNode | string => v !== null);
    return h('div', {}, children);
  }

  if (node.type === 'element') {
    const element = node as Element;
    const tagName = element.tagName;
    const CustomComponent = components?.[tagName];
    const props: Record<string, unknown> = { ...element.properties };

    // 转换 className 为 class
    if (props.className) {
      props.class = Array.isArray(props.className)
        ? props.className.join(' ')
        : props.className;
      delete props.className;
    }

    const children = element.children
      .map((child) => hastToVNode(child as Element, components))
      .filter((v): v is VNode | string => v !== null);

    if (CustomComponent) {
      return h(CustomComponent, props, () => children);
    }

    return h(tagName, props, children);
  }

  return null;
}

/**
 * 流式 Markdown 渲染 Composable
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

  // 解析器实例
  const parser = createStreamingParser(parserOptions);

  // 响应式状态
  const version = ref(0);
  const isComplete = ref(false);

  // 更新节流
  let lastUpdate = 0;
  let pendingUpdate: number | null = null;

  // 触发更新
  const triggerUpdate = () => {
    const now = performance.now();
    const elapsed = now - lastUpdate;

    if (immediate || elapsed >= minUpdateInterval) {
      lastUpdate = now;
      version.value++;
    } else if (pendingUpdate === null) {
      pendingUpdate = requestAnimationFrame(() => {
        pendingUpdate = null;
        lastUpdate = performance.now();
        version.value++;
      });
    }
  };

  // 追加内容
  const append = (chunk: string) => {
    parser.append(chunk);
    triggerUpdate();
  };

  // 标记完成
  const finish = () => {
    parser.finish();
    isComplete.value = true;
    if (pendingUpdate !== null) {
      cancelAnimationFrame(pendingUpdate);
      pendingUpdate = null;
    }
    version.value++;
  };

  // 重置
  const reset = () => {
    parser.reset();
    isComplete.value = false;
    if (pendingUpdate !== null) {
      cancelAnimationFrame(pendingUpdate);
      pendingUpdate = null;
    }
    version.value++;
  };

  // 清理
  onUnmounted(() => {
    if (pendingUpdate !== null) {
      cancelAnimationFrame(pendingUpdate);
    }
  });

  // 计算属性：块信息
  const blocks = computed(() => {
    // 依赖 version 触发更新
    void version.value;
    return parser.getState().blocks;
  });

  // 计算属性：性能统计
  const stats = computed(() => {
    void version.value;
    return parser.getStats();
  });

  // 计算属性：内容
  const content = computed(() => {
    void version.value;
    return parser.getContent();
  });

  // 计算属性：VNode
  const vnode = computed<VNode | null>(() => {
    void version.value;
    const state = parser.getState();

    if (state.blocks.length === 0) {
      return null;
    }

    // 将每个块渲染为 VNode
    const children = state.blocks
      .map((block) => {
        if (!block.hast) return null;
        return h(
          'div',
          {
            key: block.key,
            'data-block-key': block.key,
            'data-pending': !block.stable || undefined,
          },
          [hastToVNode(block.hast, components)]
        );
      })
      .filter((v): v is VNode => v !== null);

    return h('div', { 'data-streaming': !isComplete.value }, children);
  });

  return {
    vnode,
    append,
    reset,
    finish,
    blocks,
    stats,
    isComplete,
    content,
  };
}
