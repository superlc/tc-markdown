import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StreamingMarkdown } from '@tc/md-react';
import '../styles.css';

const meta: Meta<typeof StreamingMarkdown> = {
  title: 'Streaming/基础示例',
  component: StreamingMarkdown,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof StreamingMarkdown>;

const sampleContent = `
### 云服务器
##### 什么是腾讯云云服务器？
腾讯云云服务器（Cloud Virtual Machine，CVM）是腾讯云提供的可扩展的计算服务。使用云服务器 CVM 避免了使用传统服务器时需要预估资源用量及前期投入的问题，帮助您在短时间内快速启动任意数量的云服务器并即时部署应用程序。
##### 如何使用云服务器？
1. **控制台**：腾讯云提供的 Web 服务界面，用于配置和管理云服务器。提供稳定、安全的云服务器服务
2. **云数据库**：提供多种类型的数据库服务，包括 \`MySQL\`，\`SQL Server\`，\`MongoDB\` 等
3. **云存储**：提供高效、安全、灵活的云存储服务
4. **内容分发网络**：提供全球覆盖的内容分发\`\`\`服务\`\`\`

##### 云服务器特点
腾讯云的云服务器提供以下特点：

- 高性能
  - 第2层
  - 高性能2
     - 第3层
     - 高性能3
- 高可靠
- 灵活扩展

更多信息请访问 [腾讯云官网](https://cloud.tencent.com/)

##### 价格
腾讯云的价格根据服务类型和使用量有所不同，具体价格请访问 [腾讯云价格页](https://cloud.tencent.com/price/)

> 注意：所有价格可能会有所变动，以腾讯云官网为准。
`;

/**
 * 基础流式渲染 - 使用内置速率控制
 */
export const 默认效果: Story = {
  render: () => {
    const [key, setKey] = useState(0);

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
          <span className="status">默认中速 (medium)</span>
        </div>

        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={sampleContent}
            outputRate="medium"
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};
