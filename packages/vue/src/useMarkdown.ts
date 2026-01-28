import { computed, h, type VNode, type ComputedRef } from 'vue';
import { parseToHast } from '@tc/md-core';
import type { Root, Element, Text, Comment } from 'hast';
import type { UseMarkdownOptions, MarkdownComponents } from './types';

type HastNode = Root | Element | Text | Comment;

/**
 * 将 HAST 节点转换为 Vue VNode
 */
function hastToVNode(node: HastNode, components: MarkdownComponents = {}): VNode | string | null {
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
    return h('div', {}, children);
  }

  if (node.type === 'element') {
    const { tagName, properties, children } = node;
    const Component = components[tagName] || tagName;

    const props: Record<string, unknown> = {};
    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        // 转换 className 为 class
        if (key === 'className') {
          props.class = Array.isArray(value) ? value.join(' ') : value;
        } else {
          props[key] = value;
        }
      }
    }

    const childVNodes = children
      .map((child) => hastToVNode(child as HastNode, components))
      .filter((child): child is VNode | string => child !== null);

    return h(Component, props, () => childVNodes);
  }

  return null;
}

/**
 * 将 Markdown 转换为 Vue VNode 的 Composable
 * 
 * @param content - Markdown 源文本（响应式 ref 或 getter）
 * @param options - 配置选项
 * @returns 计算属性，返回 Vue VNode
 * 
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useMarkdown } from '@tc/md-vue';
 * 
 * const content = ref('# Hello World');
 * const vnode = useMarkdown(() => content.value);
 * </script>
 * 
 * <template>
 *   <component :is="vnode" />
 * </template>
 * ```
 */
export function useMarkdown(
  content: () => string,
  options: UseMarkdownOptions = {}
): ComputedRef<VNode | null> {
  const { components = {}, ...processorOptions } = options;

  return computed(() => {
    const md = content();
    if (!md) return null;

    const hast = parseToHast(md, processorOptions);
    const result = hastToVNode(hast, components);
    // hastToVNode for root always returns VNode, not string
    return result as VNode | null;
  });
}
