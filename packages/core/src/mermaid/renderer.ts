/**
 * Mermaid 渲染器
 * 提供懒加载和渲染封装，支持自定义主题
 */

import type {
  MermaidRenderOptions,
  MermaidRenderResult,
  MermaidTheme,
  MermaidThemeVariables,
  MermaidCustomTheme,
} from './types';
import { defaultCustomTheme } from './themes';
import { detectColorScheme, type DarkModeDetectorOptions } from './darkMode';

// Mermaid 库缓存
let mermaidPromise: Promise<typeof import('mermaid')> | null = null;
let renderCounter = 0;

/**
 * 懒加载 Mermaid 库
 */
export async function loadMermaid(): Promise<typeof import('mermaid')> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid');
  }
  return mermaidPromise;
}

/**
 * 判断是否为自定义主题配置（包含 light/dark 两套）
 */
function isCustomTheme(
  variables: MermaidCustomTheme | MermaidThemeVariables | undefined
): variables is MermaidCustomTheme {
  return (
    variables !== undefined &&
    'light' in variables &&
    'dark' in variables &&
    typeof variables.light === 'object' &&
    typeof variables.dark === 'object'
  );
}

/**
 * 获取当前主题变量
 */
function resolveThemeVariables(
  options: MermaidRenderOptions,
  darkModeOptions?: DarkModeDetectorOptions
): { theme: MermaidTheme; themeVariables?: MermaidThemeVariables } {
  const { theme = 'auto', themeVariables } = options;
  const dark = detectColorScheme(darkModeOptions) === 'dark';

  // 使用自定义主题（auto 模式或显式指定 base）
  if (theme === 'auto' || theme === 'base') {
    // 获取主题变量：优先使用用户配置，否则使用默认配置
    let variables: MermaidThemeVariables;

    if (isCustomTheme(themeVariables)) {
      // 用户提供了 light/dark 两套配置
      variables = dark ? themeVariables.dark : themeVariables.light;
    } else if (themeVariables) {
      // 用户只提供了单套配置，直接使用
      variables = themeVariables;
    } else {
      // 使用默认的自定义主题
      variables = dark ? defaultCustomTheme.dark : defaultCustomTheme.light;
    }

    return {
      theme: 'base',
      themeVariables: variables,
    };
  }

  // 使用内置主题
  return { theme };
}

// 全局主题缓存（Mermaid 是单例，需要全局跟踪上次使用的配置）
let lastThemeConfig: string | null = null;

/**
 * Mermaid 渲染器类
 */
export class MermaidRenderer {
  private options: MermaidRenderOptions;
  private darkModeOptions?: DarkModeDetectorOptions;

  constructor(options: MermaidRenderOptions = {}, darkModeOptions?: DarkModeDetectorOptions) {
    this.options = options;
    this.darkModeOptions = darkModeOptions;
  }

  /**
   * 初始化 Mermaid（每次渲染前检查主题是否需要更新）
   */
  private async initialize(): Promise<void> {
    const colorScheme = detectColorScheme(this.darkModeOptions);
    const { theme, themeVariables } = resolveThemeVariables(this.options, this.darkModeOptions);

    // 生成配置签名，用于检测是否需要重新初始化
    const configSignature = JSON.stringify({ theme, themeVariables, colorScheme });

    // Mermaid 是全局单例，只有当配置变化时才需要重新初始化
    if (lastThemeConfig === configSignature) {
      return;
    }

    const mermaid = await loadMermaid();

    mermaid.default.initialize({
      startOnLoad: false,
      theme,
      themeVariables,
      securityLevel: this.options.securityLevel ?? 'strict',
      maxTextSize: 50000,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
      },
      sequence: {
        useMaxWidth: true,
      },
    });

    lastThemeConfig = configSignature;
  }

  /**
   * 渲染 Mermaid 代码为 SVG
   */
  async render(code: string): Promise<MermaidRenderResult> {
    try {
      await this.initialize();
      const mermaid = await loadMermaid();

      // 生成唯一 ID
      const id = `${this.options.idPrefix ?? 'mermaid'}-${++renderCounter}`;

      // 创建临时容器（Mermaid 会将渲染结果或错误信息插入到 DOM）
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
      document.body.appendChild(tempContainer);

      try {
        // 渲染 SVG
        const { svg } = await mermaid.default.render(id, code, tempContainer);

        return {
          success: true,
          svg,
        };
      } finally {
        // 清理临时容器（无论成功或失败都要清理）
        tempContainer.remove();
        // 清理可能遗留的错误元素（Mermaid 有时会创建 id 为 'd' + id 的元素）
        document.getElementById(`d${id}`)?.remove();
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 更新主题配置
   */
  setTheme(theme: MermaidTheme | 'auto'): void {
    this.options.theme = theme;
  }

  /**
   * 更新主题变量
   */
  setThemeVariables(variables: MermaidCustomTheme | MermaidThemeVariables): void {
    this.options.themeVariables = variables;
  }

  /**
   * 更新暗黑模式检测配置
   */
  setDarkModeOptions(options: DarkModeDetectorOptions): void {
    this.darkModeOptions = options;
  }
}
