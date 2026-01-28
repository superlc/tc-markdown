import { useEffect, memo } from 'react';
import type { FC, ReactNode } from 'react';

/**
 * KaTeX CSS 加载状态
 */
let katexCssLoaded = false;
let katexCssLoadPromise: Promise<void> | null = null;

/**
 * 懒加载 KaTeX CSS
 */
async function loadKatexCss(): Promise<void> {
  if (katexCssLoaded) {
    return;
  }

  if (katexCssLoadPromise) {
    return katexCssLoadPromise;
  }

  katexCssLoadPromise = (async () => {
    // 动态导入 KaTeX 样式
    // @ts-expect-error CSS 模块无类型声明
    await import('katex/dist/katex.min.css');
    katexCssLoaded = true;
  })();

  return katexCssLoadPromise;
}

interface MathProviderProps {
  /** 子元素 */
  children: ReactNode;
}

/**
 * 数学公式样式提供组件
 * 用于懒加载 KaTeX CSS，仅在使用时加载
 */
export const MathProvider: FC<MathProviderProps> = memo(({ children }) => {
  useEffect(() => {
    if (!katexCssLoaded) {
      loadKatexCss();
    }
  }, []);

  // CSS 未加载时，公式可能显示不正确，但内容仍可见
  // 加载完成后会自动应用样式
  return <>{children}</>;
});

MathProvider.displayName = 'MathProvider';

/**
 * 检查 KaTeX CSS 是否已加载
 */
export function isKatexCssLoaded(): boolean {
  return katexCssLoaded;
}

/**
 * 预加载 KaTeX CSS
 */
export function preloadKatexCss(): Promise<void> {
  return loadKatexCss();
}
