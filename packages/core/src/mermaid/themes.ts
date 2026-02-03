/**
 * Mermaid 默认主题配置
 * 基于 neutral（浅色）和 default（深色）主题色值
 */

import type { MermaidThemeVariables, MermaidCustomTheme } from './types';

/**
 * 浅色主题变量（基于 neutral 主题）
 * 特点：柔和灰色调，低对比度，适合浅色背景
 */
export const lightThemeVariables: MermaidThemeVariables = {
  darkMode: false,
  background: '#f4f4f4',
  fontFamily: '"trebuchet ms", verdana, arial, sans-serif',

  // 主色调 - neutral 风格的灰色调
  primaryColor: '#eee',
  primaryTextColor: '#333',
  primaryBorderColor: '#999',

  // 次要色调
  secondaryColor: '#f0f0f0',
  secondaryTextColor: '#333',
  secondaryBorderColor: '#aaa',

  // 第三色调
  tertiaryColor: '#e8e8e8',
  tertiaryTextColor: '#333',
  tertiaryBorderColor: '#bbb',

  // 连线和文字
  lineColor: '#666',
  textColor: '#333',
  mainBkg: '#eee',

  // 注释
  noteBkgColor: '#fff5ad',
  noteTextColor: '#333',
  noteBorderColor: '#aaaa33',

  // 流程图
  nodeBorder: '#999',
  clusterBkg: '#f8f8f8',
  clusterBorder: '#ccc',
  edgeLabelBackground: '#f8f8f8',
  nodeTextColor: '#333',

  // 序列图
  actorBkg: '#eee',
  actorBorder: '#999',
  actorTextColor: '#333',
  actorLineColor: '#666',
  signalColor: '#333',
  signalTextColor: '#333',
  activationBkgColor: '#f4f4f4',
  activationBorderColor: '#666',
  loopTextColor: '#333',
};

/**
 * 深色主题变量（基于 default 主题）
 * 特点：清晰对比度，适合深色背景
 */
export const darkThemeVariables: MermaidThemeVariables = {
  darkMode: true,
  background: '#1f1f1f',
  fontFamily: '"trebuchet ms", verdana, arial, sans-serif',

  // 主色调 - default 风格的暖色调
  primaryColor: '#1f2020',
  primaryTextColor: '#e0e0e0',
  primaryBorderColor: '#81B1DB',

  // 次要色调
  secondaryColor: '#2b2b2b',
  secondaryTextColor: '#e0e0e0',
  secondaryBorderColor: '#666',

  // 第三色调
  tertiaryColor: '#333',
  tertiaryTextColor: '#e0e0e0',
  tertiaryBorderColor: '#555',

  // 连线和文字
  lineColor: '#81B1DB',
  textColor: '#ccc',
  mainBkg: '#1f2020',

  // 注释
  noteBkgColor: '#fff5ad',
  noteTextColor: '#333',
  noteBorderColor: '#aaaa33',

  // 流程图
  nodeBorder: '#81B1DB',
  clusterBkg: '#2b2b2b',
  clusterBorder: '#555',
  edgeLabelBackground: '#2b2b2b',
  nodeTextColor: '#e0e0e0',

  // 序列图
  actorBkg: '#1f2020',
  actorBorder: '#81B1DB',
  actorTextColor: '#e0e0e0',
  actorLineColor: '#81B1DB',
  signalColor: '#e0e0e0',
  signalTextColor: '#e0e0e0',
  activationBkgColor: '#2b2b2b',
  activationBorderColor: '#81B1DB',
  loopTextColor: '#e0e0e0',
};

/**
 * 默认自定义主题配置
 */
export const defaultCustomTheme: MermaidCustomTheme = {
  light: lightThemeVariables,
  dark: darkThemeVariables,
};
