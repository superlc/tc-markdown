import { ref, computed, onUnmounted, h, type VNode } from 'vue';
import {
  createStreamingParser,
  OutputRateController,
  type Root,
  type Element,
  type OutputRateStatus,
} from '@tc/md-core';
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

  const parser = createStreamingParser(parserOptions);
  const controller = new OutputRateController(outputRate);

  const version = ref(0);
  const isComplete = ref(false);
  const progress = ref(0);
  const outputStatus = ref<OutputRateStatus>('idle');

  let lastUpdate = 0;
  let pendingUpdate: number | null = null;

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

  const append = (chunk: string) => {
    parser.append(chunk);
    triggerUpdate();
  };

  const start = (source: string) => {
    parser.reset();
    isComplete.value = false;
    progress.value = 0;
    outputStatus.value = 'running';

    controller.start(
      source,
      (_chunk, accumulated) => {
        parser.reset();
        parser.append(accumulated);
        progress.value = controller.progress;
        triggerUpdate();
      },
      () => {
        parser.finish();
        isComplete.value = true;
        progress.value = 1;
        outputStatus.value = 'complete';
        triggerUpdate();
      }
    );
  };

  const pause = () => {
    controller.pause();
    outputStatus.value = controller.status;
  };

  const resume = () => {
    controller.resume();
    outputStatus.value = controller.status;
  };

  const skipToEnd = () => {
    controller.skipToEnd();
    outputStatus.value = controller.status;
    progress.value = 1;
  };

  const finish = () => {
    controller.stop();
    parser.finish();
    isComplete.value = true;
    outputStatus.value = 'complete';
    if (pendingUpdate !== null) {
      cancelAnimationFrame(pendingUpdate);
      pendingUpdate = null;
    }
    version.value++;
  };

  const reset = () => {
    controller.stop();
    parser.reset();
    isComplete.value = false;
    progress.value = 0;
    outputStatus.value = 'idle';
    if (pendingUpdate !== null) {
      cancelAnimationFrame(pendingUpdate);
      pendingUpdate = null;
    }
    version.value++;
  };

  onUnmounted(() => {
    controller.stop();
    if (pendingUpdate !== null) {
      cancelAnimationFrame(pendingUpdate);
    }
  });

  const blocks = computed(() => {
    void version.value;
    return parser.getState().blocks;
  });

  const stats = computed(() => {
    void version.value;
    return parser.getStats();
  });

  const content = computed(() => {
    void version.value;
    return parser.getContent();
  });

  const vnode = computed<VNode | null>(() => {
    void version.value;
    const state = parser.getState();

    if (state.blocks.length === 0) {
      return null;
    }

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
    start,
    pause,
    resume,
    skipToEnd,
    reset,
    finish,
    blocks,
    stats,
    isComplete,
    content,
    progress,
    outputStatus,
  };
}
