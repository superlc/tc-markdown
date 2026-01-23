import type { BlockType } from './types';

/**
 * 原始块信息（分割后未解析）
 */
export interface RawBlock {
  source: string;
  type: BlockType;
  stable: boolean;
  startIndex: number;
}

/**
 * 代码块状态追踪
 */
interface CodeBlockState {
  inCodeBlock: boolean;
  fence: string; // ``` 或 ~~~
  language: string;
}

/**
 * 块边界分割器
 * 将 Markdown 内容按块级元素边界分割
 */
export class BlockSplitter {
  private codeBlockState: CodeBlockState = {
    inCodeBlock: false,
    fence: '',
    language: '',
  };

  /**
   * 分割内容为块
   */
  split(content: string): RawBlock[] {
    const lines = content.split('\n');
    const blocks: RawBlock[] = [];
    let currentBlock: RawBlock | null = null;
    let lineIndex = 0;

    this.codeBlockState = { inCodeBlock: false, fence: '', language: '' };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLastLine = i === lines.length - 1;

      // 处理代码块
      if (this.isCodeFence(line)) {
        if (!this.codeBlockState.inCodeBlock) {
          // 开始代码块
          if (currentBlock) {
            currentBlock.stable = true;
            blocks.push(currentBlock);
          }
          const fence = this.extractFence(line);
          this.codeBlockState = {
            inCodeBlock: true,
            fence,
            language: line.slice(fence.length).trim(),
          };
          currentBlock = {
            source: line,
            type: 'code',
            stable: false,
            startIndex: lineIndex,
          };
        } else if (this.isMatchingCloseFence(line)) {
          // 结束代码块
          currentBlock!.source += '\n' + line;
          currentBlock!.stable = true;
          blocks.push(currentBlock!);
          currentBlock = null;
          this.codeBlockState = { inCodeBlock: false, fence: '', language: '' };
        } else {
          // 代码块内容
          currentBlock!.source += '\n' + line;
        }
        lineIndex += line.length + 1;
        continue;
      }

      // 在代码块内
      if (this.codeBlockState.inCodeBlock) {
        currentBlock!.source += '\n' + line;
        lineIndex += line.length + 1;
        continue;
      }

      // 空行 - 段落分隔
      if (line.trim() === '') {
        if (currentBlock && currentBlock.source.trim() !== '') {
          currentBlock.stable = true;
          blocks.push(currentBlock);
          currentBlock = null;
        }
        lineIndex += line.length + 1;
        continue;
      }

      // 检测新块类型
      const blockType = this.detectBlockType(line);

      // 标题、分隔线等独立块
      if (blockType === 'heading' || blockType === 'thematicBreak') {
        if (currentBlock) {
          currentBlock.stable = true;
          blocks.push(currentBlock);
        }
        currentBlock = {
          source: line,
          type: blockType,
          stable: !isLastLine, // 最后一行可能未完成
          startIndex: lineIndex,
        };
        if (blockType === 'thematicBreak') {
          currentBlock.stable = true;
          blocks.push(currentBlock);
          currentBlock = null;
        }
        lineIndex += line.length + 1;
        continue;
      }

      // 列表项
      if (blockType === 'list') {
        if (currentBlock && currentBlock.type !== 'list') {
          currentBlock.stable = true;
          blocks.push(currentBlock);
          currentBlock = {
            source: line,
            type: 'list',
            stable: false,
            startIndex: lineIndex,
          };
        } else if (currentBlock && currentBlock.type === 'list') {
          currentBlock.source += '\n' + line;
        } else {
          currentBlock = {
            source: line,
            type: 'list',
            stable: false,
            startIndex: lineIndex,
          };
        }
        lineIndex += line.length + 1;
        continue;
      }

      // 引用块
      if (blockType === 'blockquote') {
        if (currentBlock && currentBlock.type !== 'blockquote') {
          currentBlock.stable = true;
          blocks.push(currentBlock);
          currentBlock = {
            source: line,
            type: 'blockquote',
            stable: false,
            startIndex: lineIndex,
          };
        } else if (currentBlock && currentBlock.type === 'blockquote') {
          currentBlock.source += '\n' + line;
        } else {
          currentBlock = {
            source: line,
            type: 'blockquote',
            stable: false,
            startIndex: lineIndex,
          };
        }
        lineIndex += line.length + 1;
        continue;
      }

      // 表格
      if (blockType === 'table') {
        if (currentBlock && currentBlock.type !== 'table') {
          currentBlock.stable = true;
          blocks.push(currentBlock);
          currentBlock = {
            source: line,
            type: 'table',
            stable: false,
            startIndex: lineIndex,
          };
        } else if (currentBlock && currentBlock.type === 'table') {
          currentBlock.source += '\n' + line;
        } else {
          currentBlock = {
            source: line,
            type: 'table',
            stable: false,
            startIndex: lineIndex,
          };
        }
        lineIndex += line.length + 1;
        continue;
      }

      // 普通段落
      if (!currentBlock) {
        currentBlock = {
          source: line,
          type: 'paragraph',
          stable: false,
          startIndex: lineIndex,
        };
      } else if (currentBlock.type === 'paragraph' || currentBlock.type === 'heading') {
        // 标题后的内容继续属于同一块（直到空行）
        if (currentBlock.type === 'heading') {
          currentBlock.stable = true;
          blocks.push(currentBlock);
          currentBlock = {
            source: line,
            type: 'paragraph',
            stable: false,
            startIndex: lineIndex,
          };
        } else {
          currentBlock.source += '\n' + line;
        }
      } else {
        currentBlock.stable = true;
        blocks.push(currentBlock);
        currentBlock = {
          source: line,
          type: 'paragraph',
          stable: false,
          startIndex: lineIndex,
        };
      }
      lineIndex += line.length + 1;
    }

    // 处理最后一个块
    if (currentBlock) {
      // 最后一个块默认为非稳定（可能还有内容追加）
      // 除非是以空行结尾
      if (content.endsWith('\n\n')) {
        currentBlock.stable = true;
      }
      blocks.push(currentBlock);
    }

    return blocks;
  }

  /**
   * 检测是否是代码围栏
   */
  private isCodeFence(line: string): boolean {
    const trimmed = line.trim();
    return /^(`{3,}|~{3,})/.test(trimmed);
  }

  /**
   * 提取围栏字符
   */
  private extractFence(line: string): string {
    const match = line.trim().match(/^(`{3,}|~{3,})/);
    return match ? match[1] : '';
  }

  /**
   * 检测是否是匹配的闭合围栏
   */
  private isMatchingCloseFence(line: string): boolean {
    const trimmed = line.trim();
    const fence = this.codeBlockState.fence;
    // 闭合围栏必须与开始围栏字符相同，且长度至少相等
    if (fence.startsWith('`')) {
      return /^`{3,}$/.test(trimmed) && trimmed.length >= fence.length;
    }
    return /^~{3,}$/.test(trimmed) && trimmed.length >= fence.length;
  }

  /**
   * 检测块类型
   */
  private detectBlockType(line: string): BlockType {
    const trimmed = line.trim();

    // 标题
    if (/^#{1,6}\s/.test(trimmed)) {
      return 'heading';
    }

    // 分隔线
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed.replace(/\s/g, ''))) {
      return 'thematicBreak';
    }

    // 无序列表
    if (/^[-*+]\s/.test(trimmed)) {
      return 'list';
    }

    // 有序列表
    if (/^\d+\.\s/.test(trimmed)) {
      return 'list';
    }

    // 引用
    if (/^>\s?/.test(trimmed)) {
      return 'blockquote';
    }

    // 表格（包含 |）
    if (/\|/.test(trimmed) && trimmed.includes('|')) {
      return 'table';
    }

    return 'paragraph';
  }
}
