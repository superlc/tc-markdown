/**
 * 流式缓冲处理器
 * 借鉴 x-markdown 的字符级增量处理策略
 * 用于精细控制不完整 Markdown 语法的显示
 */

/**
 * Token 类型
 * 注意：emphasis、inline-code、link、image、table 不再缓冲
 * - emphasis/inline-code/link/image 由 InlineCompleter 自动补全闭合标记
 * - table 改为渐进式逐行显示
 */
export type StreamTokenType =
  | 'text'
  | 'html';

/**
 * 流式缓冲状态
 */
export interface StreamBufferState {
  /** 待处理的内容 */
  pending: string;
  /** 当前 token 类型 */
  token: StreamTokenType;
  /** 已处理的字符数 */
  processedLength: number;
  /** 已确认完整的 Markdown */
  completeMarkdown: string;
}

/**
 * Token 识别器
 */
interface TokenRecognizer {
  tokenType: StreamTokenType;
  /** 判断是否是该 token 的开始 */
  isStartOfToken: (pending: string) => boolean;
  /** 判断当前内容是否仍是不完整的 token */
  isStreamingValid: (pending: string) => boolean;
}

/**
 * 不完整 token 的正则验证规则
 * 参考 x-markdown 的实现
 * 
 * 设计原则：
 * - 链接/图片/强调/行内代码：不缓冲，由 InlineCompleter 自动补全闭合标记实现逐字显示
 * - HTML 标签：缓冲到闭合
 */
const STREAM_INCOMPLETE_REGEX = {
  html: [/^<\/$/, /^<\/?[a-zA-Z][a-zA-Z0-9-]{0,100}[^>\r\n]{0,1000}$/],
} as const;

/**
 * Token 识别器映射
 * 注意：移除了 list、emphasis、inline-code、link、image、table 识别器
 * - list 由 streaming-parser 的 stripUncertainTailForDisplay 处理
 * - emphasis/inline-code/link/image 由 InlineCompleter 自动补全闭合标记
 * - table 改为渐进式逐行显示，不再缓冲
 */
const tokenRecognizers: TokenRecognizer[] = [
  {
    tokenType: 'html',
    isStartOfToken: (pending) => pending.startsWith('<'),
    isStreamingValid: (pending) =>
      STREAM_INCOMPLETE_REGEX.html.some((re) => re.test(pending)),
  },
];

/**
 * 判断是否在代码块内
 */
function isInCodeBlock(text: string, isFinalChunk = false): boolean {
  const lines = text.split('\n');
  let inFenced = false;
  let fenceChar = '';
  let fenceLen = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;

    const match = line.match(/^(`{3,}|~{3,})(.*)$/);
    if (match) {
      const fence = match[1];
      const after = match[2];
      const char = fence[0];
      const len = fence.length;

      if (!inFenced) {
        inFenced = true;
        fenceChar = char;
        fenceLen = len;
      } else {
        const isValidEnd = char === fenceChar && len >= fenceLen && /^\s*$/.test(after);
        if (isValidEnd) {
          if (isFinalChunk || i < lines.length - 1) {
            inFenced = false;
            fenceChar = '';
            fenceLen = 0;
          }
        }
      }
    }
  }

  return inFenced;
}

/**
 * 判断是否是不确定的行级前缀（列表、标题、引用、表格行等）
 * 这些前缀后面没有实际内容时，不应该显示
 */
function isUncertainLinePrefix(line: string): boolean {
  // 无序列表前缀："-" / "*" / "+"（只有前缀，没有内容）
  if (/^\s{0,3}[-*+]\s*$/.test(line)) return true;
  // 有序列表前缀："1." / "1)"（只有前缀，没有内容）
  if (/^\s{0,3}\d+[.)]\s*$/.test(line)) return true;
  // 有序列表开始（只有数字，还没有 . 或 )）
  if (/^\s{0,3}\d+$/.test(line)) return true;
  // 引用前缀：">", "> "（只有前缀，没有内容）
  if (/^\s{0,3}>\s*$/.test(line)) return true;
  // 标题前缀："#"..."######"（只有前缀，没有内容）
  if (/^\s{0,3}#{1,6}\s*$/.test(line)) return true;
  // 围栏代码前缀
  if (/^\s{0,3}(`{3,}|~{3,})\s*\w*\s*$/.test(line)) return true;

  // 表格行前缀（渐进式渲染）：
  // 新行刚开始时通常会先输出 "|" 或 "|   "，这会被解析成一个“空行/空表格行”并短暂闪现。
  // 这里将“明显未成型的表格行”视为不确定前缀，直到它包含足够的分隔符/内容再显示。
  const trimmed = line.trim();
  if (trimmed.startsWith('|')) {
    // 只有管道和空白："|" / "||" / "| |" / "|   |   |" 等
    if (trimmed.replace(/\|/g, '').trim() === '') return true;

    const pipeCount = (trimmed.match(/\|/g) || []).length;
    // 只有一个 "|"（新行刚开始，还没出现下一个分隔）
    if (pipeCount < 2) return true;
  }

  return false;
}

/**
 * 裁剪末尾不确定的行级前缀
 */
function stripUncertainTail(input: string): string {
  if (!input) return input;
  
  // 如果以 \n 结尾，检查上一行
  if (input.endsWith('\n')) {
    const trimmedEnd = input.slice(0, -1);
    const lastNl = trimmedEnd.lastIndexOf('\n');
    const prevLine = lastNl >= 0 ? trimmedEnd.slice(lastNl + 1) : trimmedEnd;
    if (isUncertainLinePrefix(prevLine)) {
      return lastNl >= 0 ? input.slice(0, lastNl + 1) : '';
    }
    return input;
  }
  
  // 检查最后一行
  const lastNl = input.lastIndexOf('\n');
  const lastLine = lastNl >= 0 ? input.slice(lastNl + 1) : input;
  if (isUncertainLinePrefix(lastLine)) {
    return lastNl >= 0 ? input.slice(0, lastNl + 1) : '';
  }
  return input;
}

/**
 * 创建初始缓冲状态
 */
export function createInitialBufferState(): StreamBufferState {
  return {
    pending: '',
    token: 'text',
    processedLength: 0,
    completeMarkdown: '',
  };
}

/**
 * 提交缓冲内容到完整 Markdown
 */
function commitBuffer(state: StreamBufferState): void {
  if (state.pending) {
    state.completeMarkdown += state.pending;
    state.pending = '';
  }
  state.token = 'text';
}

/**
 * 识别当前 token 类型
 */
function recognizeToken(state: StreamBufferState, recognizer: TokenRecognizer): void {
  const { token, pending } = state;

  if (token === 'text' && recognizer.isStartOfToken(pending)) {
    state.token = recognizer.tokenType;
    return;
  }

  if (token === recognizer.tokenType && !recognizer.isStreamingValid(pending)) {
    commitBuffer(state);
  }
}

/**
 * 流式缓冲处理器
 */
export class StreamBuffer {
  private state: StreamBufferState;

  constructor() {
    this.state = createInitialBufferState();
  }

  /**
   * 处理输入文本，返回可以安全显示的 Markdown
   */
  process(input: string): string {
    if (!input) {
      this.reset();
      return '';
    }

    const expectedPrefix = this.state.completeMarkdown + this.state.pending;
    // 如果输入不是前文的延续，重置状态
    if (!input.startsWith(expectedPrefix)) {
      this.reset();
    }

    const chunk = input.slice(this.state.processedLength);
    if (!chunk) {
      return this.state.completeMarkdown;
    }

    this.state.processedLength += chunk.length;

    // 逐字符处理
    for (const char of chunk) {
      this.state.pending += char;

      // 如果在代码块内，直接提交
      const isContentInCodeBlock = isInCodeBlock(
        this.state.completeMarkdown + this.state.pending
      );
      if (isContentInCodeBlock) {
        commitBuffer(this.state);
        continue;
      }

      // 识别 token
      if (this.state.token === 'text') {
        for (const recognizer of tokenRecognizers) {
          recognizeToken(this.state, recognizer);
        }
      } else {
        const recognizer = tokenRecognizers.find(
          (r) => r.tokenType === this.state.token
        );
        if (recognizer) {
          recognizeToken(this.state, recognizer);
        }
      }

      // 如果仍是文本类型，提交
      if (this.state.token === 'text') {
        commitBuffer(this.state);
      }
    }

    // 对结果进行行级裁剪，移除不确定的列表/标题前缀
    return stripUncertainTail(this.state.completeMarkdown);
  }

  /**
   * 完成处理，刷新所有缓冲
   */
  finish(): string {
    commitBuffer(this.state);
    return this.state.completeMarkdown;
  }

  /**
   * 获取完整内容（包括待处理部分）
   */
  getFullContent(): string {
    return this.state.completeMarkdown + this.state.pending;
  }

  /**
   * 获取当前 token 类型
   */
  getCurrentToken(): StreamTokenType {
    return this.state.token;
  }

  /**
   * 获取待处理内容
   */
  getPending(): string {
    return this.state.pending;
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.state = createInitialBufferState();
  }
}
