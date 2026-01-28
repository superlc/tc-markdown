import type { Pluggable } from 'unified';

/**
 * 插件配置
 */
export interface PluginConfig {
  plugin: Pluggable;
  options?: unknown;
}

/**
 * Processor 配置选项
 */
export interface ProcessorOptions {
  /** 启用 GFM（GitHub Flavored Markdown）扩展，默认 true */
  gfm?: boolean;
  /** 启用代码高亮，默认 true */
  highlight?: boolean;
  /** 启用数学公式渲染（LaTeX 语法），默认 false */
  math?: boolean;
  /** 自定义 remark 插件 */
  remarkPlugins?: PluginConfig[];
  /** 自定义 rehype 插件 */
  rehypePlugins?: PluginConfig[];
}

/**
 * 解析配置选项
 */
export interface ParseOptions extends ProcessorOptions {
  /** Markdown 源文本 */
  content: string;
}
