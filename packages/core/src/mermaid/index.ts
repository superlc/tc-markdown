/**
 * Mermaid 渲染工具模块
 */

export { MermaidRenderer, loadMermaid } from './renderer';
export { downloadAsPng, downloadAsSvg, svgToPngBlob, type DownloadOptions } from './download';
export { defaultCustomTheme, lightThemeVariables, darkThemeVariables } from './themes';
export {
  detectColorScheme,
  observeColorScheme,
  type ColorScheme,
  type DarkModeDetectorOptions,
} from './darkMode';
export type {
  MermaidRenderOptions,
  MermaidRenderResult,
  MermaidTheme,
  MermaidThemeVariables,
  MermaidCustomTheme,
} from './types';
