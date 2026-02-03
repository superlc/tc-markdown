import React, { useState, useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Markdown, MermaidBlock } from '@superlc/md-react';
import type { StreamStatus } from '@superlc/md-react';
import '../styles.css';

const meta: Meta<typeof MermaidBlock> = {
  title: 'React/Mermaid 图表',
  component: MermaidBlock,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof MermaidBlock>;

// 示例图表代码
const flowchartCode = `graph TD
    A[开始] --> B{是否有条件?}
    B -->|是| C[执行操作 A]
    B -->|否| D[执行操作 B]
    C --> E[结束]
    D --> E`;

const sequenceCode = `sequenceDiagram
    participant Client
    participant Server
    participant Database
    
    Client->>Server: 发送请求
    Server->>Database: 查询数据
    Database-->>Server: 返回结果
    Server-->>Client: 响应数据`;

const classCode = `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`;

const ganttCode = `gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析    :a1, 2024-01-01, 7d
    UI设计      :a2, after a1, 5d
    section 开发阶段
    前端开发    :b1, after a2, 14d
    后端开发    :b2, after a2, 14d
    section 测试阶段
    集成测试    :c1, after b1, 7d`;

const pieCode = `pie title 编程语言使用占比
    "JavaScript" : 40
    "TypeScript" : 25
    "Python" : 20
    "Go" : 10
    "其他" : 5`;

const stateCode = `stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中: 开始处理
    处理中 --> 已完成: 处理成功
    处理中 --> 失败: 处理失败
    失败 --> 待处理: 重试
    已完成 --> [*]`;

/**
 * 流程图示例
 */
export const 流程图: Story = {
  render: () => (
    <div className="demo-container">
      <h2>流程图 (Flowchart)</h2>
      <MermaidBlock code={flowchartCode} />
    </div>
  ),
};

/**
 * 时序图示例
 */
export const 时序图: Story = {
  render: () => (
    <div className="demo-container">
      <h2>时序图 (Sequence Diagram)</h2>
      <MermaidBlock code={sequenceCode} />
    </div>
  ),
};

/**
 * 类图示例
 */
export const 类图: Story = {
  render: () => (
    <div className="demo-container">
      <h2>类图 (Class Diagram)</h2>
      <MermaidBlock code={classCode} />
    </div>
  ),
};

/**
 * 甘特图示例
 */
export const 甘特图: Story = {
  render: () => (
    <div className="demo-container">
      <h2>甘特图 (Gantt Chart)</h2>
      <MermaidBlock code={ganttCode} />
    </div>
  ),
};

/**
 * 饼图示例
 */
export const 饼图: Story = {
  render: () => (
    <div className="demo-container">
      <h2>饼图 (Pie Chart)</h2>
      <MermaidBlock code={pieCode} />
    </div>
  ),
};

/**
 * 状态图示例
 */
export const 状态图: Story = {
  render: () => (
    <div className="demo-container">
      <h2>状态图 (State Diagram)</h2>
      <MermaidBlock code={stateCode} />
    </div>
  ),
};

/**
 * 在 Markdown 中使用 Mermaid
 */
export const Markdown中使用: Story = {
  render: () => {
    const markdownContent = `# Mermaid 图表示例

在 Markdown 中可以直接使用 \`mermaid\` 代码块来渲染图表。

## 系统架构图

\`\`\`mermaid
graph LR
    A[用户] --> B[前端]
    B --> C[API 网关]
    C --> D[服务 A]
    C --> E[服务 B]
    D --> F[(数据库)]
    E --> F
\`\`\`

## 用户登录流程

\`\`\`mermaid
sequenceDiagram
    User->>Frontend: 输入用户名密码
    Frontend->>Backend: POST /login
    Backend->>Database: 验证凭证
    Database-->>Backend: 验证结果
    alt 验证成功
        Backend-->>Frontend: 返回 Token
        Frontend-->>User: 跳转到首页
    else 验证失败
        Backend-->>Frontend: 返回错误
        Frontend-->>User: 显示错误信息
    end
\`\`\`

图表支持**图片/代码切换**、**缩放**、**全屏**和**下载**功能。
`;

    return (
      <div className="demo-container">
        <Markdown mermaid className="markdown-body">
          {markdownContent}
        </Markdown>
      </div>
    );
  },
};

/**
 * 错误处理示例
 */
export const 语法错误处理: Story = {
  render: () => {
    const invalidCode = `graph TD
    A --> B
    C ---> D  // 无效语法`;

    return (
      <div className="demo-container">
        <h2>语法错误处理</h2>
        <p>当 Mermaid 语法错误时，组件会自动切换到代码模式并显示错误信息。</p>
        <MermaidBlock code={invalidCode} />
      </div>
    );
  },
};

// ==================== 流式渲染相关 ====================

// 模拟流式输入的 Hook
function useStreamingText(fullText: string, charPerTick = 3, interval = 50) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<StreamStatus>('loading');
  const indexRef = useRef(0);

  const reset = () => {
    indexRef.current = 0;
    setText('');
    setStatus('loading');
  };

  useEffect(() => {
    if (status === 'done') return;

    const timer = setInterval(() => {
      const nextIndex = Math.min(indexRef.current + charPerTick, fullText.length);
      setText(fullText.slice(0, nextIndex));
      indexRef.current = nextIndex;

      if (nextIndex >= fullText.length) {
        setStatus('done');
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [fullText, charPerTick, interval, status]);

  return { text, status, reset };
}

// 复杂流程图示例
const complexFlowchart = `graph TB
    subgraph 前端
        A[用户界面] --> B[状态管理]
        B --> C[API 调用]
    end
    
    subgraph 后端
        D[API 网关] --> E[认证服务]
        D --> F[业务服务]
        F --> G[(数据库)]
    end
    
    C --> D`;

/**
 * 流式渲染演示
 */
export const 流式渲染: Story = {
  render: () => {
    const { text, status, reset } = useStreamingText(flowchartCode, 2, 80);

    return (
      <div className="demo-container">
        <h2>Mermaid 流式渲染</h2>
        <p>
          当 <code>streamStatus="loading"</code> 时，组件会：
        </p>
        <ul>
          <li>延迟 150ms 后再渲染（避免频繁重渲染）</li>
          <li>渲染失败时保留上次有效结果（而非显示错误）</li>
          <li>流式完成后才显示真正的错误信息</li>
        </ul>

        <div className="streaming-demo">
          <div className="controls">
            <button onClick={reset}>重新开始</button>
            <span className="status">
              状态: <strong>{status === 'loading' ? '流式输入中...' : '完成'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
            <div style={{ flex: 1 }}>
              <h4>输入中的代码：</h4>
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  minHeight: '150px',
                }}
              >
                {text || '(等待输入...)'}
              </pre>
            </div>

            <div style={{ flex: 1 }}>
              <h4>渲染结果：</h4>
              <MermaidBlock code={text || 'graph TD\n    A[...]'} streamStatus={status} />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * 流式优化对比
 */
export const 流式优化对比: Story = {
  render: () => {
    const { text, status, reset } = useStreamingText(sequenceCode, 3, 60);

    return (
      <div className="demo-container">
        <h2>流式优化对比</h2>
        <p>左侧开启流式优化，右侧关闭（始终 done 状态）。观察渲染差异。</p>

        <div className="streaming-demo">
          <div className="controls">
            <button onClick={reset}>重新开始</button>
            <span className="status">
              状态: <strong>{status === 'loading' ? '流式输入中...' : '完成'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
            <div style={{ flex: 1 }}>
              <h4>✅ 开启流式优化 (streamStatus="{status}")</h4>
              <MermaidBlock code={text || 'sequenceDiagram\n    A->>B: ...'} streamStatus={status} />
            </div>

            <div style={{ flex: 1 }}>
              <h4>❌ 关闭流式优化 (streamStatus="done")</h4>
              <MermaidBlock code={text || 'sequenceDiagram\n    A->>B: ...'} streamStatus="done" />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * 复杂图表流式渲染
 */
export const 复杂图表流式渲染: Story = {
  render: () => {
    const { text, status, reset } = useStreamingText(complexFlowchart, 4, 50);

    return (
      <div className="demo-container">
        <h2>复杂图表流式渲染</h2>
        <p>包含子图的复杂流程图，展示流式渲染的稳定性。</p>

        <div className="streaming-demo">
          <div className="controls">
            <button onClick={reset}>重新开始</button>
            <span className="status">
              进度: {Math.round((text.length / complexFlowchart.length) * 100)}% |
              状态: <strong>{status === 'loading' ? '输入中' : '完成'}</strong>
            </span>
          </div>

          <div className="content-area" style={{ marginTop: '16px' }}>
            <MermaidBlock code={text || 'graph TB\n    A[...]'} streamStatus={status} />
          </div>
        </div>
      </div>
    );
  },
};


