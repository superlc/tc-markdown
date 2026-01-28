import type {
  InlineType,
  Completion,
  CompletionResult,
  InlinePredictionOptions,
  MarkerState,
} from './types';

/**
 * 图片占位 SVG：skeleton 背景（带流光动画）+ 图片图标
 * 尺寸：200x120，浅灰背景 + shimmer 动画 + 居中图片图标
 * 注意：需要正确编码 # 为 %23 用于 data URI
 */
const PLACEHOLDER_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">
  <defs>
    <linearGradient id="shimmer" x1="-100%" y1="0%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#e8e8e8"/>
      <stop offset="50%" stop-color="#f5f5f5"/>
      <stop offset="100%" stop-color="#e8e8e8"/>
      <animate attributeName="x1" from="-100%" to="100%" dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="x2" from="0%" to="200%" dur="1.5s" repeatCount="indefinite"/>
    </linearGradient>
  </defs>
  <rect width="200" height="120" rx="6" fill="url(#shimmer)"/>
  <g transform="translate(100,60)">
    <rect x="-24" y="-18" width="48" height="36" rx="3" fill="#bdbdbd"/>
    <circle cx="-12" cy="-8" r="5" fill="#9e9e9e"/>
    <path d="M-24 18 L-24 6 L-8 -2 L4 8 L24 -6 L24 18 Z" fill="#9e9e9e"/>
  </g>
</svg>`;

/**
 * 默认占位图 URL（skeleton SVG data URI）
 * 使用 encodeURIComponent 正确编码 SVG
 */
const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(PLACEHOLDER_SVG_RAW);

/**
 * 默认启用的行内标记类型
 */
export const DEFAULT_INLINE_TYPES: InlineType[] = [
  'bold',
  'italic',
  'code',
  'strikethrough',
  'link',
  'image',
];

/**
 * 行内标记预测补全器
 * 检测未闭合的行内标记并智能补全
 */
export class InlineCompleter {
  private enabledTypes: Set<InlineType>;

  constructor(options: InlinePredictionOptions = {}) {
    const types = options.predictedInlineTypes ?? DEFAULT_INLINE_TYPES;
    this.enabledTypes = new Set(types);
  }

  /**
   * 补全未闭合的行内标记
   */
  complete(text: string): CompletionResult {
    const completions: Completion[] = [];
    const markerStack: MarkerState[] = [];

    const isEscapedAt = (input: string, pos: number): boolean => {
      let backslashes = 0;
      for (let i = pos - 1; i >= 0 && input[i] === '\\'; i--) {
        backslashes++;
      }
      return backslashes % 2 === 1;
    };

    let i = 0;
    const len = text.length;

    while (i < len) {
      // 跳过转义字符
      if (text[i] === '\\' && i + 1 < len) {
        i += 2;
        continue;
      }

      // 检测行内代码（优先处理，因为代码内不解析其他标记）
      if (this.enabledTypes.has('code') && text[i] === '`') {
        const codeResult = this.handleCodeMarker(text, i, markerStack);
        if (codeResult.skip > 0) {
          i += codeResult.skip;
          continue;
        }
      }

      // 检测删除线 ~~
      if (this.enabledTypes.has('strikethrough') && text[i] === '~' && text[i + 1] === '~') {
        const result = this.handleDoubleMarker(text, i, '~~', 'strikethrough', markerStack);
        if (result.skip > 0) {
          i += result.skip;
          continue;
        }
      }

      // 检测粗体 ** 或 __
      if (this.enabledTypes.has('bold')) {
        if ((text[i] === '*' && text[i + 1] === '*') || (text[i] === '_' && text[i + 1] === '_')) {
          const marker = text.slice(i, i + 2);
          const result = this.handleDoubleMarker(text, i, marker, 'bold', markerStack);
          if (result.skip > 0) {
            i += result.skip;
            continue;
          }
        }
      }

      // 检测斜体 * 或 _（单个，且不在单词中间）
      if (this.enabledTypes.has('italic')) {
        if (text[i] === '*' || text[i] === '_') {
          const result = this.handleSingleEmphasis(text, i, markerStack);
          if (result.skip > 0) {
            i += result.skip;
            continue;
          }
        }
      }

      // 检测图片 ![ 或末尾的单独 !
      if (this.enabledTypes.has('image') && text[i] === '!') {
        if (text[i + 1] === '[') {
          const result = this.handleImageOrLink(text, i, true, markerStack);
          if (result.skip > 0) {
            i += result.skip;
            continue;
          }
        } else if (i === len - 1) {
          // 末尾的单独 !，可能是图片开始
          markerStack.push({ type: 'image', marker: '!', position: i });
          i++;
          continue;
        }
      }

      // 检测链接 [
      if (this.enabledTypes.has('link') && text[i] === '[') {
        const result = this.handleImageOrLink(text, i, false, markerStack);
        if (result.skip > 0) {
          i += result.skip;
          continue;
        }
      }

      i++;
    }

    // 根据栈中未闭合的标记生成补全
    // 删除线特殊处理：当存在未闭合删除线且文本以单个 "~" 结尾时，
    // 该 "~" 往往是闭合 "~~" 的一半。如果直接显示，会导致该帧把删除线回退成纯文本，产生闪现。
    const hasOpenStrikethrough = markerStack.some((s) => s.type === 'strikethrough');
    const shouldHideTrailingSingleTilde =
      this.enabledTypes.has('strikethrough') &&
      hasOpenStrikethrough &&
      text.endsWith('~') &&
      !text.endsWith('~~') &&
      !isEscapedAt(text, text.length - 1);

    const baseText = shouldHideTrailingSingleTilde ? text.slice(0, -1) : text;

    let completedText = baseText;
    for (let j = markerStack.length - 1; j >= 0; j--) {
      const state = markerStack[j];
      const closeMarker = this.getCloseMarker(state);
      completions.push({
        type: state.type,
        position: state.position,
        marker: closeMarker,
        openMarker: state.marker,
      });

      // 图片 URL 未完整时，需要替换已输入的不完整 URL 为占位图
      if (state.marker === '![...](incomplete' && state.urlStartPosition !== undefined) {
        // 截取到 ]( 位置，然后追加占位图 URL 和闭合括号
        completedText = completedText.slice(0, state.urlStartPosition) + closeMarker;
        continue;
      }

      // 特殊处理：如果 marker 正好在文本末尾（常见于 chunk 边界），
      // 直接补全闭合可能仍会短暂显示裸 marker。插入 ZWSP 让 parser 更倾向于生成节点。
      const markerEndsAtTextEnd = state.position + state.marker.length === baseText.length;
      if (markerEndsAtTextEnd && (state.type === 'bold' || state.type === 'italic' || state.type === 'code' || state.type === 'strikethrough')) {
        completedText += '\u200B' + closeMarker;
      } else {
        completedText += closeMarker;
      }
    }

    return {
      text: completedText,
      completions,
      hasCompletions: completions.length > 0,
    };
  }

  /**
   * 处理行内代码标记
   */
  private handleCodeMarker(
    text: string,
    pos: number,
    stack: MarkerState[]
  ): { skip: number } {
    // 计算连续的 ` 数量
    let count = 0;
    while (pos + count < text.length && text[pos + count] === '`') {
      count++;
    }
    const marker = '`'.repeat(count);

    // 检查栈顶是否有匹配的代码标记
    const topIdx = this.findInStack(stack, 'code', marker);
    if (topIdx >= 0) {
      // 闭合代码
      stack.splice(topIdx, 1);
      return { skip: count };
    }

    // 开始代码
    stack.push({ type: 'code', marker, position: pos });
    return { skip: count };
  }

  /**
   * 处理双字符标记（**, __, ~~）
   */
  private handleDoubleMarker(
    text: string,
    pos: number,
    marker: string,
    type: InlineType,
    stack: MarkerState[]
  ): { skip: number } {
    // 检查栈顶是否有匹配的标记
    const topIdx = this.findInStack(stack, type, marker);
    if (topIdx >= 0) {
      // 闭合
      stack.splice(topIdx, 1);
      return { skip: 2 };
    }

    // 允许 marker 出现在 chunk 末尾：如果当前帧恰好以 "**"/"~~" 结尾，也要入栈，
    // 否则会先渲染出裸 marker，下一帧才变成格式化元素，造成明显闪烁。
    const afterMarker = text[pos + 2];
    if (!afterMarker || !/\s/.test(afterMarker)) {
      stack.push({ type, marker, position: pos });
    }
    return { skip: 2 };
  }

  /**
   * 处理单字符强调标记（* 或 _）
   */
  private handleSingleEmphasis(
    text: string,
    pos: number,
    stack: MarkerState[]
  ): { skip: number } {
    const char = text[pos];
    
    // 检查是否是 ** 或 __ 的一部分
    if (text[pos + 1] === char) {
      return { skip: 0 }; // 让 bold 处理
    }

    // 下划线在单词中间不视为标记（GFM 行为）
    if (char === '_') {
      const before = text[pos - 1];
      const after = text[pos + 1];
      if (before && /\w/.test(before) && after && /\w/.test(after)) {
        return { skip: 0 };
      }
    }

    // 检查栈顶是否有匹配的标记
    const topIdx = this.findInStack(stack, 'italic', char);
    if (topIdx >= 0) {
      // 闭合
      stack.splice(topIdx, 1);
      return { skip: 1 };
    }

    // 允许 marker 出现在 chunk 末尾：如果当前帧恰好以 "*"/"_" 结尾，也要入栈，
    // 否则会先渲染出裸 marker，下一帧才变成格式化元素，造成明显闪烁。
    const afterMarker = text[pos + 1];
    if (!afterMarker || !/\s/.test(afterMarker)) {
      stack.push({ type: 'italic', marker: char, position: pos });
    }
    return { skip: 1 };
  }

  /**
   * 处理链接或图片标记
   */
  private handleImageOrLink(
    text: string,
    pos: number,
    isImage: boolean,
    stack: MarkerState[]
  ): { skip: number } {
    const type: InlineType = isImage ? 'image' : 'link';
    const startOffset = isImage ? 2 : 1; // ![ 或 [

    // 查找 ]
    let bracketEnd = text.indexOf(']', pos + startOffset);
    if (bracketEnd === -1) {
      // [ 未闭合
      stack.push({ type, marker: isImage ? '![' : '[', position: pos });
      return { skip: startOffset };
    }

    // 检查 ] 后面是否是 (
    if (text[bracketEnd + 1] === '(') {
      // 查找 )
      let parenEnd = text.indexOf(')', bracketEnd + 2);
      if (parenEnd === -1) {
        // ( 未闭合
        if (isImage) {
          // 图片：URL 未完整时始终使用占位图，避免加载不完整 URL 导致裂图闪烁
          // 记录 URL 开始位置，用于后续替换不完整的 URL
          stack.push({ 
            type, 
            marker: '![...](incomplete', 
            position: pos,
            urlStartPosition: bracketEnd + 2 
          });
        } else {
          stack.push({ type, marker: '[...](' , position: pos });
        }
        return { skip: bracketEnd + 2 - pos };
      }
      // 完整的链接/图片，跳过
      return { skip: parenEnd + 1 - pos };
    }

    // ] 后面不是 (，可能是引用链接 [text][ref] 或者不完整
    if (text[bracketEnd + 1] === '[') {
      let refEnd = text.indexOf(']', bracketEnd + 2);
      if (refEnd === -1) {
        // 引用未闭合
        stack.push({ type, marker: isImage ? '![...][' : '[...][', position: pos });
        return { skip: bracketEnd + 2 - pos };
      }
      return { skip: refEnd + 1 - pos };
    }

    // ] 后面是字符串结尾或其他字符，需要补全 (#) 或 (placeholder)
    // 这样 [链接] 会被补全为 [链接](#) 形成有效链接
    if (bracketEnd + 1 >= text.length || !/[([]/.test(text[bracketEnd + 1])) {
      stack.push({ type, marker: isImage ? '![...]' : '[...]', position: pos });
      return { skip: bracketEnd + 1 - pos };
    }

    // 不是有效的链接语法，跳过
    return { skip: startOffset };
  }

  /**
   * 在栈中查找匹配的标记
   */
  private findInStack(stack: MarkerState[], type: InlineType, marker: string): number {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].type === type) {
        // 代码标记需要精确匹配
        if (type === 'code' && stack[i].marker !== marker) {
          continue;
        }
        // 粗体/斜体需要相同字符类型匹配
        if ((type === 'bold' || type === 'italic') && stack[i].marker[0] !== marker[0]) {
          continue;
        }
        return i;
      }
    }
    return -1;
  }

  /**
   * 获取闭合标记
   * - 链接补全为 ](#)，形成可点击但无实际跳转的链接
   * - 图片补全使用占位图 URL
   */
  private getCloseMarker(state: MarkerState): string {
    switch (state.type) {
      case 'link':
        if (state.marker.includes('](')) {
          return ')';
        }
        if (state.marker.includes('][')) {
          return ']';
        }
        // [...]（已有闭合的 ]，需要补全 (#)）
        if (state.marker === '[...]') {
          return '(#)';
        }
        // 链接补全为 ](#)，显示为可点击链接但不跳转
        return '](#)';
      case 'image':
        // 单独的 !，补全为完整图片语法
        if (state.marker === '!') {
          return `[](${DEFAULT_PLACEHOLDER_IMAGE})`;
        }
        // 图片 URL 未完整时，使用占位图替代不完整的 URL
        if (state.marker === '![...](incomplete') {
          return `${DEFAULT_PLACEHOLDER_IMAGE})`;
        }
        if (state.marker.includes('](')) {
          return ')';
        }
        if (state.marker.includes('][')) {
          return ']';
        }
        // ![...]（已有闭合的 ]，需要补全 (placeholder)）
        if (state.marker === '![...]') {
          return `(${DEFAULT_PLACEHOLDER_IMAGE})`;
        }
        // 图片使用占位图
        return `](${DEFAULT_PLACEHOLDER_IMAGE})`;
      default:
        return state.marker;
    }
  }

  /**
   * 更新启用的类型
   */
  setEnabledTypes(types: InlineType[]): void {
    this.enabledTypes = new Set(types);
  }
}
