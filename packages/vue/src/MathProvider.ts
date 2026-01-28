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
