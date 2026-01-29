import { defineComponent, ref, h, type PropType, type VNode } from 'vue';

/**
 * 复制文本到剪贴板
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return fallbackCopy(text);
  }
}

/**
 * 降级复制方案（使用 execCommand）
 */
function fallbackCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * 复制图标 SVG - 简洁的文档复制图标
 */
const CopyIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
    },
    [
      h('path', {
        d: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
      }),
    ]
  );

/**
 * 复制成功图标 SVG - 对勾图标
 */
const CheckIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
    },
    [
      h('path', {
        d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
      }),
    ]
  );

/**
 * 从 VNode children 中递归提取文本内容
 */
function extractTextFromVNodes(children: VNode[] | string | undefined): string {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children
      .map((child) => {
        if (typeof child === 'string') {
          return child;
        }
        if (child && typeof child === 'object' && 'children' in child) {
          return extractTextFromVNodes(child.children as VNode[] | string);
        }
        return '';
      })
      .join('');
  }
  return '';
}

export interface CodeBlockProps {
  showCopyButton?: boolean;
}

/**
 * Vue 代码块组件，包装 <pre> 元素并添加复制按钮
 */
export const CodeBlock = defineComponent({
  name: 'CodeBlock',
  props: {
    showCopyButton: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  emits: ['copy'],
  setup(props, { slots, emit }) {
    const copied = ref(false);

    const handleCopy = async () => {
      const defaultSlot = slots.default?.();
      const codeText = defaultSlot ? extractTextFromVNodes(defaultSlot) : '';

      const success = await copyToClipboard(codeText);
      if (success) {
        copied.value = true;
        emit('copy', codeText);
        setTimeout(() => {
          copied.value = false;
        }, 2000);
      }
    };

    return () => {
      const children = slots.default?.();

      return h('div', { class: 'md-code-block-wrapper' }, [
        h('pre', {}, children),
        props.showCopyButton &&
          h(
            'button',
            {
              type: 'button',
              class: `md-copy-button${copied.value ? ' md-copy-button--copied' : ''}`,
              onClick: handleCopy,
              title: copied.value ? '已复制' : '复制代码',
              'aria-label': copied.value ? '已复制' : '复制代码',
            },
            [copied.value ? h(CheckIcon) : h(CopyIcon)]
          ),
      ]);
    };
  },
});
