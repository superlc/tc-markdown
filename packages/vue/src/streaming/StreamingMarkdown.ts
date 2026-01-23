import {
  defineComponent,
  ref,
  watch,
  onUnmounted,
  h,
  type PropType,
  type VNode,
} from 'vue';
import { createStreamingParser, type BlockInfo, type Root, type Element } from '@tc/md-core';
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
 * 流式 Markdown 渲染组件
 * 声明式 API，支持受控模式
 */
export const StreamingMarkdown = defineComponent({
  name: 'StreamingMarkdown',

  props: {
    /** 当前累积的 Markdown 内容 */
    content: {
      type: String,
      required: true,
    },
    /** 是否已完成流式输入 */
    isComplete: {
      type: Boolean,
      default: false,
    },
    /** 自定义组件映射 */
    components: {
      type: Object as PropType<MarkdownComponents>,
      default: undefined,
    },
    /** 容器 class */
    class: {
      type: String,
      default: undefined,
    },
    /** 最小更新间隔 (ms) */
    minUpdateInterval: {
      type: Number,
      default: 16,
    },
    /** 启用 GFM */
    gfm: {
      type: Boolean,
      default: true,
    },
    /** 启用代码高亮 */
    highlight: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['complete', 'blockStable'],

  setup(props, { emit }) {
    // 解析器实例
    const parser = createStreamingParser({
      gfm: props.gfm,
      highlight: props.highlight,
    });

    // 状态
    const version = ref(0);
    const prevContent = ref('');
    const prevBlocks = ref<BlockInfo[]>([]);

    // 更新节流
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

    // 监听内容变化
    watch(
      () => props.content,
      (newContent) => {
        const oldContent = prevContent.value;

        if (newContent !== oldContent) {
          if (newContent.startsWith(oldContent)) {
            // 追加模式
            const chunk = newContent.slice(oldContent.length);
            if (chunk) {
              parser.append(chunk);
            }
          } else {
            // 替换模式
            parser.reset();
            if (newContent) {
              parser.append(newContent);
            }
          }

          prevContent.value = newContent;
          triggerUpdate();

          // 检测块稳定事件
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

    // 监听完成状态
    watch(
      () => props.isComplete,
      (isComplete) => {
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

    // 清理
    onUnmounted(() => {
      if (pendingUpdate !== null) {
        cancelAnimationFrame(pendingUpdate);
      }
    });

    return () => {
      // 依赖 version 触发更新
      void version.value;

      const state = parser.getState();

      // 渲染块
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
          'data-streaming': !props.isComplete,
        },
        children
      );
    };
  },
});
