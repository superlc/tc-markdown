import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * 常见图片尺寸模式的正则表达式
 */
const SIZE_PATTERNS = [
  // placeholder.com: /300x200 或 /300
  /\/(\d+)x(\d+)/,
  // placeholder.com: /300 (正方形)
  /\/(\d+)(?:[?#]|$)/,
  // picsum.photos: /300/200
  /\/(\d+)\/(\d+)/,
  // 查询参数: ?width=300&height=200 或 ?w=300&h=200
  /[?&](?:width|w)=(\d+)(?:&(?:height|h)=(\d+))?/i,
  // 查询参数: ?size=300x200
  /[?&]size=(\d+)x(\d+)/i,
];

/**
 * 从 URL 中提取图片尺寸
 */
function extractSizeFromUrl(url: string): { width?: number; height?: number } {
  for (const pattern of SIZE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      const width = parseInt(match[1], 10);
      const height = match[2] ? parseInt(match[2], 10) : width; // 如果没有高度，默认正方形
      if (width > 0 && height > 0 && width <= 4000 && height <= 4000) {
        return { width, height };
      }
    }
  }
  return {};
}

/**
 * Rehype 插件：提取图片 URL 中的尺寸信息
 * 将尺寸信息添加到 img 元素的 data-* 属性中
 */
export function rehypeImageSize() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img' && node.properties) {
        const src = node.properties.src as string | undefined;
        if (src && !src.startsWith('data:')) {
          const { width, height } = extractSizeFromUrl(src);
          if (width && height) {
            node.properties['data-width'] = width;
            node.properties['data-height'] = height;
          }
        }
      }
    });
  };
}

export default rehypeImageSize;
