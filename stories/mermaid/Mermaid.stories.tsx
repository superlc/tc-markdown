import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Markdown, MermaidBlock } from '@superlc/md-react';
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
