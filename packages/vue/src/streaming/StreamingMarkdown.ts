import {
  defineComponent,
  ref,
  watch,
  onUnmounted,
  h,
  type PropType,
  type VNode,
} from 'vue';
import {
  createStreamingParser,
  OutputRateController,
  type BlockInfo,
  type Root,
  type Element,
  type OutputRate,
} from '@superlc/md-core';
import type { MarkdownComponents } from '../types';
import { preloadKatexCss } from '../MathProvider';

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
 * 流式 Markdown 渲染组件
 */
export const StreamingMarkdown = defineComponent({
  name: 'StreamingMarkdown',

  props: {
    content: {
      type: String,
      default: undefined,
    },
    source: {
      type: String,
      default: undefined,
    },
    outputRate: {
      type: [String, Object] as PropType<OutputRate>,
      default: 'medium',
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    components: {
      type: Object as PropType<MarkdownComponents>,
      default: undefined,
    },
    class: {
      type: String,
      default: undefined,
    },
    minUpdateInterval: {
      type: Number,
      default: 16,
    },
    autoStart: {
      type: Boolean,
      default: true,
    },
    gfm: {
      type: Boolean,
      default: true,
    },
    highlight: {
      type: Boolean,
      default: true,
    },
    math: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['complete', 'blockStable', 'progress'],

  setup(props, { emit }) {
    // 启用数学公式时懒加载 KaTeX CSS
    watch(
      () => props.math,
      (math) => {
        if (math) {
          preloadKatexCss();
        }
      },
      { immediate: true }
    );

    const parser = createStreamingParser({
      gfm: props.gfm,
      highlight: props.highlight,
      math: props.math,
    });
    const controller = new OutputRateController(props.outputRate);

    const version = ref(0);
    const prevContent = ref('');
    const prevSource = ref<string | undefined>(undefined);
    const prevBlocks = ref<BlockInfo[]>([]);
    const streamComplete = ref(false);

    let lastUpdate = 0;
    let pendingUpdate: number | null = null;

    const triggerUpdate = () => {
      const now = performance.now();
      const elapsed = now - lastUpdate;

      if (elapsed >= props.minUpdateInterval) {
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

    // source 模式
    watch(
      () => props.source,
      (newSource) => {
        if (newSource !== undefined && newSource !== prevSource.value) {
          prevSource.value = newSource;

          if (props.autoStart && newSource) {
            parser.reset();
            prevContent.value = '';
            streamComplete.value = false;

            controller.start(
              newSource,
              (chunk) => {
                // 增量追加，避免每个 chunk 都 reset 导致整树重建闪烁
                if (chunk) {
                  parser.append(chunk);
                  prevContent.value += chunk;
                }
                emit('progress', controller.progress);
                triggerUpdate();
              },
              () => {
                parser.finish();
                streamComplete.value = true;
                emit('complete');
                triggerUpdate();
              }
            );
          }
        }
      },
      { immediate: true }
    );

    // content 模式
    watch(
      () => props.content,
      (newContent) => {
        if (props.source !== undefined) {
          return;
        }

        const oldContent = prevContent.value;
        const currentContent = newContent || '';

        if (currentContent !== oldContent) {
          if (currentContent.startsWith(oldContent)) {
            const chunk = currentContent.slice(oldContent.length);
            if (chunk) {
              parser.append(chunk);
            }
          } else {
            parser.reset();
            if (currentContent) {
              parser.append(currentContent);
            }
          }

          prevContent.value = currentContent;
          triggerUpdate();

          const currentBlocks = parser.getState().blocks;
          currentBlocks.forEach((block, index) => {
            const prev = prevBlocks.value[index];
            if (block.stable && (!prev || !prev.stable)) {
              emit('blockStable', block);
            }
          });
          prevBlocks.value = currentBlocks;
        }
      },
      { immediate: true }
    );

    // isComplete 变化（content 模式）
    watch(
      () => props.isComplete,
      (isComplete) => {
        if (props.source !== undefined) {
          return;
        }

        if (isComplete) {
          parser.finish();
          if (pendingUpdate !== null) {
            cancelAnimationFrame(pendingUpdate);
            pendingUpdate = null;
          }
          version.value++;
          emit('complete');
        }
      }
    );

    // outputRate 变化
    watch(
      () => props.outputRate,
      (rate) => {
        controller.setRate(rate);
      }
    );

    onUnmounted(() => {
      controller.stop();
      if (pendingUpdate !== null) {
        cancelAnimationFrame(pendingUpdate);
      }
    });

    return () => {
      void version.value;

      const state = parser.getState();
      const isStreamComplete = props.source !== undefined 
        ? streamComplete.value 
        : props.isComplete;

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
            [hastToVNode(block.hast, props.components)]
          );
        })
        .filter((v): v is VNode => v !== null);

      return h(
        'div',
        {
          class: props.class,
          'data-streaming': !isStreamComplete,
        },
        children
      );
    };
  },
});
