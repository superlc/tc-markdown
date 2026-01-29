import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Markdown, StreamingMarkdown } from '@superlc/md-react';
import './styles.css';

const meta: Meta<typeof Markdown> = {
  title: 'React/代码复制',
  component: Markdown,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Markdown>;

const codeContent = `
# 代码块复制功能演示

以下代码块支持一键复制，鼠标悬停显示复制按钮。

## JavaScript 示例

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

## Python 示例

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

## TypeScript 示例

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(name: string, email: string): User {
  return {
    id: Date.now(),
    name,
    email,
  };
}
\`\`\`

## CSS 示例

\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
\`\`\`
`;

/**
 * 默认启用复制按钮
 */
export const 默认启用: Story = {
  render: () => {
    const [copyLog, setCopyLog] = useState<string[]>([]);

    const handleCopy = (code: string) => {
      const preview = code.length > 50 ? code.slice(0, 50) + '...' : code;
      setCopyLog((prev) => [`复制成功: ${preview}`, ...prev.slice(0, 4)]);
    };

    return (
      <div className="code-copy-demo">
        <div className="copy-log">
          <h4>复制记录</h4>
          {copyLog.length === 0 ? (
            <p className="empty">点击代码块右上角按钮复制代码</p>
          ) : (
            <ul>
              {copyLog.map((log, i) => (
                <li key={i}>{log}</li>
              ))}
            </ul>
          )}
        </div>
        <Markdown className="markdown-body" onCodeCopy={handleCopy}>
          {codeContent}
        </Markdown>
      </div>
    );
  },
};

/**
 * 禁用复制按钮
 */
export const 禁用复制按钮: Story = {
  render: () => (
    <div className="code-copy-demo">
      <p className="note">copyButton=false 时，代码块不显示复制按钮</p>
      <Markdown className="markdown-body" copyButton={false}>
        {codeContent}
      </Markdown>
    </div>
  ),
};

const streamingCodeContent = `
# 流式渲染 + 代码复制

这是一个流式渲染示例，代码块在内容稳定后才会显示复制按钮。

\`\`\`javascript
// 这段代码在流式渲染完成后可以复制
const fetchData = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

fetchData('https://api.example.com/data')
  .then(console.log)
  .catch(console.error);
\`\`\`

继续输入更多内容...

\`\`\`typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function request<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  return res.json();
}
\`\`\`
`;

/**
 * 流式渲染模式
 */
export const 流式渲染: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    const [copyLog, setCopyLog] = useState<string[]>([]);

    const handleCopy = (code: string) => {
      const preview = code.length > 50 ? code.slice(0, 50) + '...' : code;
      setCopyLog((prev) => [`复制成功: ${preview}`, ...prev.slice(0, 4)]);
    };

    return (
      <div className="code-copy-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
          <span className="note">代码块稳定后显示复制按钮</span>
        </div>
        <div className="copy-log">
          <h4>复制记录</h4>
          {copyLog.length === 0 ? (
            <p className="empty">等待代码块稳定后可复制</p>
          ) : (
            <ul>
              {copyLog.map((log, i) => (
                <li key={i}>{log}</li>
              ))}
            </ul>
          )}
        </div>
        <StreamingMarkdown
          key={key}
          source={streamingCodeContent}
          outputRate="medium"
          className="markdown-body"
          onCodeCopy={handleCopy}
        />
      </div>
    );
  },
};
