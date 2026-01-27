/**
 * HTML 安全净化工具
 * 可选依赖 DOMPurify，未安装时跳过净化
 */

import type { Element, Root } from '@tc/md-core';

export interface SanitizeConfig {
  /** DOMPurify 配置 */
  ADD_TAGS?: string[];
  ADD_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
  [key: string]: unknown;
}

// DOMPurify 类型
type DOMPurifyModule = {
  default: {
    sanitize: (html: string, config?: Record<string, unknown>) => string;
  };
};

// 尝试加载 DOMPurify
let DOMPurify: DOMPurifyModule | null = null;

try {
  // 动态导入，避免在未安装时报错
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DOMPurify = require('dompurify') as DOMPurifyModule;
} catch {
  // DOMPurify 未安装，跳过
}

/**
 * 判断 DOMPurify 是否可用
 */
export function isDOMPurifyAvailable(): boolean {
  return DOMPurify !== null;
}

/**
 * 净化 HTML 字符串
 */
export function sanitizeHtml(
  html: string,
  config?: SanitizeConfig
): string {
  if (!DOMPurify) {
    return html;
  }

  const defaultConfig: SanitizeConfig = {
    ADD_ATTR: ['target', 'rel', 'data-block-key', 'data-pending', 'data-predicted'],
    ...config,
  };

  return DOMPurify.default.sanitize(html, defaultConfig);
}

/**
 * 递归净化 HAST 树中的危险属性
 * 这是一个轻量级的替代方案，不依赖 DOMPurify
 */
export function sanitizeHast(node: Element | Root): Element | Root {
  if (node.type === 'root') {
    return {
      ...node,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      children: (node.children as any[]).map((child) => {
        if (child.type === 'element') {
          return sanitizeHast(child as Element);
        }
        return child;
      }),
    } as Root;
  }

  // 危险属性黑名单
  const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur'];
  const dangerousProtocols = ['javascript:', 'vbscript:', 'data:text/html'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitizedProps: Record<string, any> = {};

  if (node.properties) {
    for (const [key, value] of Object.entries(node.properties)) {
      const lowerKey = key.toLowerCase();

      // 跳过事件处理器
      if (dangerousAttrs.includes(lowerKey) || lowerKey.startsWith('on')) {
        continue;
      }

      // 检查 href/src 中的危险协议
      if ((lowerKey === 'href' || lowerKey === 'src') && typeof value === 'string') {
        const lowerValue = value.toLowerCase().trim();
        if (dangerousProtocols.some((p) => lowerValue.startsWith(p))) {
          continue;
        }
      }

      sanitizedProps[key] = value;
    }
  }

  return {
    ...node,
    properties: sanitizedProps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: (node.children as any[]).map((child) => {
      if (child.type === 'element') {
        return sanitizeHast(child as Element) as Element;
      }
      return child;
    }),
  };
}
