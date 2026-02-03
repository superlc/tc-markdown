/**
 * Mermaid 内置主题类型
 */
export type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral' | 'base';

/**
 * Mermaid 主题变量配置
 * @see https://mermaid.js.org/config/theming.html
 */
export interface MermaidThemeVariables {
  // 通用变量
  /** 暗黑模式标志，影响派生颜色计算 */
  darkMode?: boolean;
  /** 背景色 */
  background?: string;
  /** 字体族 */
  fontFamily?: string;
  /** 字体大小 */
  fontSize?: string;
  /** 主色（节点背景基础色） */
  primaryColor?: string;
  /** 主色文字 */
  primaryTextColor?: string;
  /** 主色边框 */
  primaryBorderColor?: string;
  /** 次要色 */
  secondaryColor?: string;
  /** 次要色文字 */
  secondaryTextColor?: string;
  /** 次要色边框 */
  secondaryBorderColor?: string;
  /** 第三色 */
  tertiaryColor?: string;
  /** 第三色文字 */
  tertiaryTextColor?: string;
  /** 第三色边框 */
  tertiaryBorderColor?: string;
  /** 注释背景色 */
  noteBkgColor?: string;
  /** 注释文字色 */
  noteTextColor?: string;
  /** 注释边框色 */
  noteBorderColor?: string;
  /** 连线颜色 */
  lineColor?: string;
  /** 文字颜色 */
  textColor?: string;
  /** 主背景（流程图节点等） */
  mainBkg?: string;

  // 流程图变量
  /** 节点边框色 */
  nodeBorder?: string;
  /** 子图背景色 */
  clusterBkg?: string;
  /** 子图边框色 */
  clusterBorder?: string;
  /** 默认连线颜色 */
  defaultLinkColor?: string;
  /** 标题颜色 */
  titleColor?: string;
  /** 边标签背景色 */
  edgeLabelBackground?: string;
  /** 节点文字颜色 */
  nodeTextColor?: string;

  // 序列图变量
  /** 参与者背景色 */
  actorBkg?: string;
  /** 参与者边框色 */
  actorBorder?: string;
  /** 参与者文字色 */
  actorTextColor?: string;
  /** 参与者线条色 */
  actorLineColor?: string;
  /** 信号颜色 */
  signalColor?: string;
  /** 信号文字色 */
  signalTextColor?: string;
  /** 激活条背景色 */
  activationBkgColor?: string;
  /** 激活条边框色 */
  activationBorderColor?: string;
  /** 循环文字色 */
  loopTextColor?: string;

  // 允许其他自定义变量
  [key: string]: string | boolean | undefined;
}

/**
 * 自定义主题配置（浅色/深色）
 */
export interface MermaidCustomTheme {
  /** 浅色模式变量 */
  light: MermaidThemeVariables;
  /** 深色模式变量 */
  dark: MermaidThemeVariables;
}

/**
 * Mermaid 渲染配置
 */
export interface MermaidRenderOptions {
  /** 主题，默认根据系统偏好自动选择 */
  theme?: MermaidTheme | 'auto';
  /** 自定义主题变量（当 theme 为 'auto' 或 'base' 时生效） */
  themeVariables?: MermaidCustomTheme | MermaidThemeVariables;
  /** 容器 ID 前缀 */
  idPrefix?: string;
  /** 是否启用安全模式 */
  securityLevel?: 'strict' | 'loose' | 'antiscript' | 'sandbox';
  /** 图表最大宽度 */
  maxWidth?: number;
}

/**
 * Mermaid 渲染结果
 */
export interface MermaidRenderResult {
  /** 渲染成功 */
  success: boolean;
  /** SVG 字符串 */
  svg?: string;
  /** 错误信息 */
  error?: string;
}
