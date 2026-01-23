import type { Meta, StoryObj } from '@storybook/react';
import { FrameworkTabs } from './components/FrameworkTabs';
import { Markdown as ReactMarkdown } from '@tc/md-react';
import { Markdown as VueMarkdown } from '@tc/md-vue';

const MarkdownContent = `
### 云服务器
##### 什么是腾讯云云服务器？
腾讯云云服务器（Cloud Virtual Machine，CVM）是腾讯云提供的可扩展的计算服务。使用云服务器 CVM 避免了使用传统服务器时需要预估资源用量及前期投入的问题，帮助您在短时间内快速启动任意数量的云服务器并即时部署应用程序。
##### 如何使用云服务器？
1. **控制台**：腾讯云提供的 Web 服务界面，用于配置和管理云服务器。提供稳定、安全的云服务器服务
2. **云数据库**：提供多种类型的数据库服务，包括 \`MySQL\`，\`SQL Server\`，\`MongoDB\` 等
3. **云存储**：提供高效、安全、灵活的云存储服务
4. **内容分发网络**：提供全球覆盖的内容分发\`\`\`服务\`\`\`提供全球覆盖的内容分发提供全球覆盖的内容分发提供全球覆盖的内容分发提供全球覆盖的内容分发提供全球覆盖的内容分发提供全球覆盖的内容分发提供全球覆盖的内容分发提供全球覆盖的内容分发提供全球覆盖的内容分发提供全球覆盖的内容分发

##### 云服务器
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

\`\`\`typescript
import React from "react";

type ButtonProps = {
  label: string;
  onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button
    type="button"
    className="button"
    onClick={onClick}
    aria-label={label}
  >
    {label}
  </button>
);

\`\`\`

| 概念 | 说明 | 说明 | 说明 | 说明 | 说明 | 说明 | 说明 | 说明 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 实例 | 云端的虚拟计算资源，包括 CPU、内存、操作系统、网络、磁盘等最基础的计算组件。腾讯云为云服务器提供了不同的 CPU、内存、存储和网络配置，详情请参见 实例规格。 | 云端的虚拟计算资源，包括 CPU、内存、操作系统、网络、磁盘等最基础的计算组件。腾讯云为云服务器提供了不同的 CPU、内存、存储和网络配置，详情请参见 实例规格。 | 云端的虚拟计算资源，包括 CPU、内存、操作系统、网络、磁盘等最基础的计算组件。腾讯云为云服务器提供了不同的 CPU、内存、存储和网络配置，详情请参见 实例规格。 | 云端的虚拟计算资源，包括 CPU、内存、操作系统、网络、磁盘等最基础的计算组件。腾讯云为云服务器提供了不同的 CPU、内存、存储和网络配置，详情请参见 实例规格。 | 云端的虚拟计算资源，包括 CPU、内存、操作系统、网络、磁盘等最基础的计算组件。腾讯云为云服务器提供了不同的 CPU、内存、存储和网络配置，详情请参见 实例规格。 | 云端的虚拟计算资源，包括 CPU、内存、操作系统、网络、磁盘等最基础的计算组件。腾讯云为云服务器提供了不同的 CPU、内存、存储和网络配置，详情请参见 实例规格。 | 云端的虚拟计算资源，包括 CPU、内存、操作系统、网络、磁盘等最基础的计算组件。腾讯云为云服务器提供了不同的 CPU、内存、存储和网络配置，详情请参见 实例规格。 | 云端的虚拟计算资源，包括 CPU、内存、操作系统、网络、磁盘等最基础的计算组件。腾讯云为云服务器提供了不同的 CPU、内存、存储和网络配置，详情请参见 实例规格。 |
| 云数据库 | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) |
| 云存储 | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) |
| 内容分发网络 | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) | 参考[价格页](https://cloud.tencent.com/price/) |

![](https://cloudcache.tencent-cloud.com/qcloud/ui/static/static_source_business/ca7caae9-3dc3-4e2f-9e4d-bf8a7ad9f8fe.png)

---
以上信息仅供参考，具体信息请以腾讯云官网为准。

**腾讯云**，让创新更简单。
> Dorothy followed her through many of the beautiful rooms in her castle.
>
>> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

##### 列表
1. 有序列表
2. 有序列表

    1.有序列表

    2.有序列表
3.有序列表

##### 任务列表
- [x] 任务列表
  - [x] 任务列表
  - [ ] 任务列表
- [ ] 任务列表
- [ ] 任务列表
`;

const meta: Meta<typeof FrameworkTabs> = {
  title: 'Components/Markdown',
  component: FrameworkTabs,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof FrameworkTabs>;

const reactCode = `import { Markdown } from '@tc/md-react';

function App() {
  const content = \`### 云服务器
##### 什么是腾讯云云服务器？
腾讯云云服务器（CVM）是腾讯云提供的可扩展的计算服务...
\`;

  return (
    <Markdown className="markdown-body" gfm highlight>
      {content}
    </Markdown>
  );
}`;

const vueCode = `<script setup lang="ts">
import { Markdown } from '@tc/md-vue';

const content = \`### 云服务器
##### 什么是腾讯云云服务器？
腾讯云云服务器（CVM）是腾讯云提供的可扩展的计算服务...
\`;
</script>

<template>
  <Markdown 
    :content="content" 
    class="markdown-body"
    gfm
    highlight
  />
</template>`;

/**
 * 完整示例 - 在 React 和 Vue 之间切换查看效果
 */
export const Default: Story = {
  args: {
    content: MarkdownContent,
    ReactComponent: ReactMarkdown,
    VueComponent: VueMarkdown,
    reactCode,
    vueCode,
    componentProps: { gfm: true, highlight: true },
  },
};
