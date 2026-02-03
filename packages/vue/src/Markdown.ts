import { defineComponent, computed, h, watch, type VNode, type PropType } from 'vue';
import { parseToHast, type PluginConfig } from '@superlc/md-core';
import type { Root, Element, Text, Comment } from 'hast';
import type { MarkdownComponents, MermaidOptions } from './types';
import { preloadKatexCss } from './MathProvider';
import { CodeBlock } from './components/CodeBlock';
import { MermaidBlock } from './components/mermaid';

type HastNode = Root | Element | Text | Comment;

/**
 * 检查是否为 Mermaid 代码块
 */
function isMermaidElement(node: Element): boolean {
  if (node.tagName !== 'pre') return false;
  const codeChild = node.children.find(
    (child): child is Element => child.type === 'element' && child.tagName === 'code'
  );
  if (!codeChild) return false;
  const className = codeChild.properties?.className;
  if (Array.isArray(className)) {
    return className.some((c) => typeof c === 'string' && c.includes('language-mermaid'));
  }
  return typeof className === 'string' && className.includes('language-mermaid');
}

/**
 * 从 code 元素中提取文本
 */
function extractTextFromElement(node: Element): string {
  const codeChild = node.children.find(
    (child): child is Element => child.type === 'element' && child.tagName === 'code'
  );
  if (!codeChild) return '';

  return codeChild.children
    .map((child) => (child.type === 'text' ? child.value : ''))
    .join('');
}

/**
 * 解析 Mermaid 配置
 */
function parseMermaidOptions(
  mermaid: boolean | MermaidOptions | undefined
): MermaidOptions | null {
  if (!mermaid) return null;
  if (mermaid === true) return { enabled: true };
  return mermaid.enabled !== false ? mermaid : null;
}

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
    copyButton: {
      type: Boolean,
      default: true,
    },
    mermaid: {
      type: [Boolean, Object] as PropType<boolean | MermaidOptions>,
      default: false,
    },
  },
  emits: ['codeCopy'],
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

    /**
     * 将 HAST 节点转换为 Vue VNode
     */
    function hastToVNode(
      node: HastNode,
      components: MarkdownComponents = {},
      mermaidOptions: MermaidOptions | null = null
    ): VNode | string | null {
      if (node.type === 'text') {
        return node.value;
      }

      if (node.type === 'comment') {
        return null;
      }

      if (node.type === 'root') {
        const children = node.children
          .map((child) => hastToVNode(child as HastNode, components, mermaidOptions))
          .filter((child): child is VNode | string => child !== null);
        return h('div', { class: props.class }, children);
      }

      if (node.type === 'element') {
        const { tagName, properties, children } = node;

        // 检查是否为 Mermaid 代码块
        if (mermaidOptions && isMermaidElement(node)) {
          const code = extractTextFromElement(node);
          return h(MermaidBlock, {
            code,
            theme: mermaidOptions.theme,
            onCopy: (code: string) => emit('codeCopy', code),
          });
        }

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
          .map((child) => hastToVNode(child as HastNode, components, mermaidOptions))
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

      const mermaidOptions = parseMermaidOptions(props.mermaid);

      // 合并内置 CodeBlock 组件（如果启用 copyButton）
      const mergedComponents: MarkdownComponents = {
        ...(props.copyButton
          ? {
              pre: defineComponent({
                setup(_, { slots }) {
                  return () =>
                    h(
                      CodeBlock,
                      {
                        showCopyButton: props.copyButton,
                        onCopy: (code: string) => emit('codeCopy', code),
                      },
                      slots.default
                    );
                },
              }),
            }
          : {}),
        ...props.components,
      };

      return hastToVNode(hast, mergedComponents, mermaidOptions);
    });

    return () => (vnode.value ? vnode.value : null);
  },
});
