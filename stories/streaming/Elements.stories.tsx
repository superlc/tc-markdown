import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StreamingMarkdown } from '@tc/md-react';
import '../styles.css';

const meta: Meta<typeof StreamingMarkdown> = {
  title: 'Streaming/元素测试',
  component: StreamingMarkdown,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof StreamingMarkdown>;

const listContent = `
### 列表测试

##### 无序列表
- 第一项
- 第二项
  - 嵌套项 A
  - 嵌套项 B
- 第三项

##### 有序列表
1. **控制台**：腾讯云提供的 Web 服务界面
2. **云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库云数据库**：提供 \`MySQL\`、\`MongoDB\` 等
3. **云存储**：提供高效、安全的存储服务

##### 任务列表
- [x] 已完成任务
- [ ] 未完成任务
`;

const linkContent = `
### 链接测试

这是一段包含[普通链接](https://example.com)的文本。

更多信息请访问 [腾讯云官网](https://cloud.tencent.com/)。

##### 图片
![示例图片](https://cloudcache.tencent-cloud.com/qcloud/ui/static/static_source_business/ca7caae9-3dc3-4e2f-9e4d-bf8a7ad9f8fe.png)

##### 组合
查看 [价格详情](https://cloud.tencent.com/price/) 或访问 [文档中心](https://cloud.tencent.com/document/)。
`;

const codeContent = `
### 代码测试

行内代码：\`const x = 1;\`

代码块：
\`\`\`typescript
import React from "react";

type ButtonProps = {
  label: string;
  onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);
\`\`\`
`;

const tableContent = `
### 表格测试

| 概念 | 说明 | 状态 |
| ---- | ---- | ---- |
| 云服务器 | 云端的虚拟计算资源 | 可用 |
| 云数据库 | 提供 MySQL、MongoDB 等数据库服务 | 可用 |
| 云存储 | 高效安全的对象存储服务 | 可用 |
| 云函数 | 无服务器计算服务 | 可用 |
| 容器服务 | Kubernetes 容器编排服务 | 可用 |
| CDN | 内容分发网络加速 | 可用 |
| 负载均衡 | 流量分发与高可用 | 可用 |
| API 网关 | API 管理与发布 | 测试中 |
`;

const emphasisContent = `
### 强调测试

这是**粗体文字**，这是*斜体文字*，这是~~删除线~~。

删除线边界测试：前缀~~删、内容~~删除、闭合~~删除~~、以及 ~~删除线后还有内容~~OK。

组合：**粗体中包含*斜体*文字**

行内代码：\`console.log('hello')\`
`;

export const 列表: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
        </div>
        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={listContent}
            outputRate="slow"
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};

export const 链接: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
        </div>
        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={linkContent}
            outputRate="slow"
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};

export const 代码: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
        </div>
        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={codeContent}
            outputRate="slow"
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};

export const 表格: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
        </div>
        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={tableContent}
            outputRate="slow"
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};

export const 强调: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
        </div>
        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={emphasisContent}
            outputRate="slow"
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};
