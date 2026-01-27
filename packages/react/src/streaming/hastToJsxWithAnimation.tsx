import React from 'react';
import type { Element } from '@tc/md-core';
import { toJsxRuntime, type Components } from 'hast-util-to-jsx-runtime';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import AnimationText from './AnimationText';
import type { AnimationConfig } from './types';
import { sanitizeHast, type SanitizeConfig } from '../utils/sanitize';

// ElementContent 类型定义
type ElementContent = Element['children'][number];

/**
 * 判断节点是否应该包含动画文本
 * 只对块级元素内的直接文本子节点应用动画
 */
const BLOCK_LEVEL_TAGS = new Set([
  'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'td', 'th', 'dt', 'dd'
]);

/**
 * 递归处理 HAST 节点，为文本节点添加动画
 */
function processNode(
  node: ElementContent,
  animationConfig: AnimationConfig | undefined,
  parentIsBlock: boolean,
  keyPrefix: string
): ElementContent {
  if (node.type === 'text') {
    // 只对非空白文本在块级元素内时添加动画
    if (parentIsBlock && node.value.trim()) {
      return {
        type: 'element',
        tagName: 'animation-text',
        properties: {
          text: node.value,
          animationConfig,
        },
        children: [],
        data: { isAnimationText: true },
      } as unknown as ElementContent;
    }
    return node;
  }

  if (node.type === 'element') {
    const isBlock = BLOCK_LEVEL_TAGS.has(node.tagName);
    const newChildren = node.children.map((child: ElementContent, i: number) =>
      processNode(child, animationConfig, isBlock, `${keyPrefix}-${i}`)
    );
    return {
      ...node,
      children: newChildren,
    };
  }

  return node;
}

/**
 * 将 HAST 转换为带动画的 JSX
 */
export function hastToJsxWithAnimation(
  hast: Element,
  options: {
    components?: Components;
    enableAnimation?: boolean;
    animationConfig?: AnimationConfig;
    enableSanitize?: boolean;
    sanitizeConfig?: SanitizeConfig;
  }
): React.ReactElement | null {
  const { components, enableAnimation, animationConfig, enableSanitize } = options;

  // 先进行安全净化
  let processedHast: Element = hast;
  if (enableSanitize) {
    processedHast = sanitizeHast(hast) as Element;
  }

  if (!enableAnimation) {
    // 不启用动画，直接转换
    try {
      return toJsxRuntime(processedHast, {
        jsx,
        jsxs,
        Fragment,
        components,
      }) as React.ReactElement;
    } catch {
      return null;
    }
  }

  // 处理节点添加动画标记
  processedHast = processNode(processedHast, animationConfig, false, 'root') as Element;

  // 自定义组件映射，处理 animation-text
  const enhancedComponents = {
    ...components,
    'animation-text': (props: { text: string; animationConfig?: AnimationConfig }) => {
      return <AnimationText text={props.text} animationConfig={props.animationConfig} />;
    },
  } as Components;

  try {
    return toJsxRuntime(processedHast, {
      jsx,
      jsxs,
      Fragment,
      components: enhancedComponents,
    }) as React.ReactElement;
  } catch {
    return null;
  }
}
