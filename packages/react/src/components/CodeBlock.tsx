import React, { useState, useCallback, type ReactNode } from 'react';

/**
 * 复制文本到剪贴板
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 降级方案
    return fallbackCopy(text);
  }
}

/**
 * 降级复制方案（使用 execCommand）
 */
function fallbackCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * 复制图标 SVG - 简洁的文档复制图标
 */
const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  </svg>
);

/**
 * 复制成功图标 SVG - 对勾图标
 */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export interface CodeBlockProps {
  children?: ReactNode;
  /** 是否显示复制按钮 */
  showCopyButton?: boolean;
  /** 复制成功回调 */
  onCopy?: (code: string) => void;
  /** 额外的 className */
  className?: string;
}

/**
 * 代码块组件，包装 <pre> 元素并添加复制按钮
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  showCopyButton = true,
  onCopy,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    // 从 children 中提取文本内容
    const codeText = extractTextFromChildren(children);
    
    const success = await copyToClipboard(codeText);
    if (success) {
      setCopied(true);
      onCopy?.(codeText);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [children, onCopy]);

  return (
    <div className={`md-code-block-wrapper${className ? ` ${className}` : ''}`}>
      <pre>{children}</pre>
      {showCopyButton && (
        <button
          type="button"
          className={`md-copy-button${copied ? ' md-copy-button--copied' : ''}`}
          onClick={handleCopy}
          title={copied ? '已复制' : '复制代码'}
          aria-label={copied ? '已复制' : '复制代码'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      )}
    </div>
  );
};

/**
 * 从 React children 中递归提取文本内容
 */
function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (React.isValidElement(children)) {
    return extractTextFromChildren(children.props.children);
  }
  return '';
}

CodeBlock.displayName = 'CodeBlock';
