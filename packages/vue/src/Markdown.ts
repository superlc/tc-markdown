import { defineComponent, computed, h, watch, type VNode, type PropType } from 'vue';
import { parseToHast, type PluginConfig } from '@tc/md-core';
import type { Root, Element, Text, Comment } from 'hast';
import type { MarkdownComponents } from './types';
import { preloadKatexCss } from './MathProvider';

type HastNode = Root | Element | Text | Comment;

/**
 * Vue Markdown 渲染组件
 */
export const Markdown = defineComponent({
  name: 'Markdown',
  props: {
    content: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      default: '',
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
    components: {
      type: Object as PropType<MarkdownComponents>,
      default: () => ({}),
    },
    remarkPlugins: {
      type: Array as PropType<PluginConfig[]>,
      default: () => [],
    },
    rehypePlugins: {
      type: Array as PropType<PluginConfig[]>,
      default: () => [],
    },
  },
  setup(props) {
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

    /**
     * 将 HAST 节点转换为 Vue VNode
     */
    function hastToVNode(
      node: HastNode,
      components: MarkdownComponents = {}
    ): VNode | string | null {
      if (node.type === 'text') {
        return node.value;
      }

      if (node.type === 'comment') {
        return null;
      }

      if (node.type === 'root') {
        const children = node.children
          .map((child) => hastToVNode(child as HastNode, components))
          .filter((child): child is VNode | string => child !== null);
        return h('div', { class: props.class }, children);
      }

      if (node.type === 'element') {
        const { tagName, properties, children } = node;
        const Component = components[tagName] || tagName;

        const nodeProps: Record<string, unknown> = {};
        if (properties) {
          for (const [key, value] of Object.entries(properties)) {
            if (key === 'className') {
              nodeProps.class = Array.isArray(value) ? value.join(' ') : value;
            } else {
              nodeProps[key] = value;
            }
          }
        }

        const childVNodes = children
          .map((child) => hastToVNode(child as HastNode, components))
          .filter((child): child is VNode | string => child !== null);

        // 对于自定义组件使用 slot，对于原生 HTML 元素直接传递 children
        if (typeof Component === 'string') {
          return h(Component, nodeProps, childVNodes);
        }
        return h(Component, nodeProps, () => childVNodes);
      }

      return null;
    }

    const vnode = computed(() => {
      if (!props.content) return null;

      const hast = parseToHast(props.content, {
        gfm: props.gfm,
        highlight: props.highlight,
        math: props.math,
        remarkPlugins: props.remarkPlugins,
        rehypePlugins: props.rehypePlugins,
      });

      return hastToVNode(hast, props.components);
    });

    return () => (vnode.value ? vnode.value : null);
  },
});
