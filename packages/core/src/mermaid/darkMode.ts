/**
 * 暗黑模式检测工具
 * 支持多种检测方式：系统偏好、CSS 类名、data 属性
 */

export type ColorScheme = 'light' | 'dark';

/**
 * 暗黑模式检测配置
 */
export interface DarkModeDetectorOptions {
  /**
   * 检测策略
   * - 'system': 仅检测系统偏好 (prefers-color-scheme)
   * - 'class': 检测 html/body 上的类名 (dark/light)
   * - 'attribute': 检测 html 上的 data 属性 (data-theme, data-mode 等)
   * - 'auto': 自动检测，优先级：attribute > class > system
   * @default 'auto'
   */
  strategy?: 'system' | 'class' | 'attribute' | 'auto';

  /**
   * 自定义选择器（用于 class/attribute 策略）
   * @default 'html'
   */
  selector?: string;

  /**
   * 暗黑模式的类名列表
   * @default ['dark', 'theme-dark', 'dark-mode', 'dark-theme']
   */
  darkClassNames?: string[];

  /**
   * 浅色模式的类名列表
   * @default ['light', 'theme-light', 'light-mode', 'light-theme']
   */
  lightClassNames?: string[];

  /**
   * 检测的 data 属性名列表
   * @default ['data-theme', 'data-mode', 'data-color-scheme', 'data-color-mode']
   */
  dataAttributes?: string[];

  /**
   * data 属性中表示暗黑模式的值
   * @default ['dark', 'night']
   */
  darkAttributeValues?: string[];
}

const DEFAULT_OPTIONS: Required<DarkModeDetectorOptions> = {
  strategy: 'auto',
  selector: 'html',
  darkClassNames: ['dark', 'theme-dark', 'dark-mode', 'dark-theme'],
  lightClassNames: ['light', 'theme-light', 'light-mode', 'light-theme'],
  dataAttributes: ['data-theme', 'data-mode', 'data-color-scheme', 'data-color-mode'],
  darkAttributeValues: ['dark', 'night'],
};

/**
 * 检测系统偏好
 */
function detectSystemPreference(): ColorScheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 检测 CSS 类名
 */
function detectByClass(options: Required<DarkModeDetectorOptions>): ColorScheme | null {
  if (typeof document === 'undefined') return null;

  const element = document.querySelector(options.selector);
  if (!element) return null;

  const classList = element.classList;

  // 优先检测暗黑模式类名
  for (const className of options.darkClassNames) {
    if (classList.contains(className)) return 'dark';
  }

  // 检测浅色模式类名
  for (const className of options.lightClassNames) {
    if (classList.contains(className)) return 'light';
  }

  return null;
}

/**
 * 检测 data 属性
 */
function detectByAttribute(options: Required<DarkModeDetectorOptions>): ColorScheme | null {
  if (typeof document === 'undefined') return null;

  const element = document.querySelector(options.selector);
  if (!element) return null;

  for (const attr of options.dataAttributes) {
    const value = element.getAttribute(attr)?.toLowerCase();
    if (value) {
      if (options.darkAttributeValues.includes(value)) return 'dark';
      if (value === 'light' || value === 'day') return 'light';
    }
  }

  return null;
}

/**
 * 检测当前暗黑模式状态
 */
export function detectColorScheme(options: DarkModeDetectorOptions = {}): ColorScheme {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  switch (opts.strategy) {
    case 'system':
      return detectSystemPreference();

    case 'class': {
      const result = detectByClass(opts);
      return result ?? detectSystemPreference();
    }

    case 'attribute': {
      const result = detectByAttribute(opts);
      return result ?? detectSystemPreference();
    }

    case 'auto':
    default: {
      // 优先级：attribute > class > system
      const attrResult = detectByAttribute(opts);
      if (attrResult) return attrResult;

      const classResult = detectByClass(opts);
      if (classResult) return classResult;

      return detectSystemPreference();
    }
  }
}

/**
 * 创建暗黑模式变化监听器
 * 返回清理函数
 */
export function observeColorScheme(
  callback: (scheme: ColorScheme) => void,
  options: DarkModeDetectorOptions = {}
): () => void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cleanups: (() => void)[] = [];

  // 监听系统偏好变化
  if (opts.strategy === 'system' || opts.strategy === 'auto') {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (mediaQuery) {
      const handler = () => callback(detectColorScheme(opts));
      mediaQuery.addEventListener('change', handler);
      cleanups.push(() => mediaQuery.removeEventListener('change', handler));
    }
  }

  // 监听 DOM 属性/类名变化
  if (opts.strategy !== 'system' && typeof MutationObserver !== 'undefined') {
    const element = document.querySelector(opts.selector);
    if (element) {
      const observer = new MutationObserver(() => {
        callback(detectColorScheme(opts));
      });

      observer.observe(element, {
        attributes: true,
        attributeFilter: ['class', ...opts.dataAttributes],
      });

      cleanups.push(() => observer.disconnect());
    }
  }

  return () => cleanups.forEach((fn) => fn());
}
