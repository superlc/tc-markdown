import React, { useState, useEffect, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  StreamingMarkdown,
  useStreamingMarkdown,
  type BlockInfo,
} from '@tc/md-react';
import './styles.css';

const meta: Meta<typeof StreamingMarkdown> = {
  title: 'Components/StreamingMarkdown',
  component: StreamingMarkdown,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof StreamingMarkdown>;

// 使用与 Markdown.stories.tsx 相同的测试内容
const sampleContent = `
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

// 模拟流式输入的函数
function useSimulatedStream(
  text: string,
  speed: number = 30,
  chunkSize: number = 1
) {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const start = useCallback(() => {
    setContent('');
    setIsStreaming(true);
    setIsComplete(false);

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        const chunk = text.slice(index, index + chunkSize);
        setContent((prev) => prev + chunk);
        index += chunkSize;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, chunkSize]);

  const reset = useCallback(() => {
    setContent('');
    setIsStreaming(false);
    setIsComplete(false);
  }, []);

  return { content, isStreaming, isComplete, start, reset };
}

/**
 * 基础流式渲染示例
 */
export const Basic: Story = {
  render: () => {
    const { content, isStreaming, isComplete, start, reset } =
      useSimulatedStream(sampleContent, 20, 3);

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={start} disabled={isStreaming}>
            {isStreaming ? '输出中...' : '开始流式输出'}
          </button>
          <button onClick={reset} disabled={isStreaming}>
            重置
          </button>
          <span className="status">
            {isStreaming
              ? '⏳ 流式输出中'
              : isComplete
                ? '✅ 完成'
                : '⏸️ 就绪'}
          </span>
        </div>

        <div className="content-area">
          <StreamingMarkdown
            content={content}
            isComplete={isComplete}
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};

/**
 * 使用 Hook 的示例
 */
export const WithHook: Story = {
  render: () => {
    const { element, append, reset, finish, blocks, stats, isComplete } =
      useStreamingMarkdown({
        gfm: true,
        highlight: true,
      });

    const [isStreaming, setIsStreaming] = useState(false);
    const intervalRef = React.useRef<number | null>(null);

    const startStream = () => {
      reset();
      setIsStreaming(true);

      let index = 0;
      intervalRef.current = window.setInterval(() => {
        if (index < sampleContent.length) {
          const chunk = sampleContent.slice(index, index + 5);
          append(chunk);
          index += 5;
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          finish();
          setIsStreaming(false);
        }
      }, 30);
    };

    const handleReset = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      reset();
      setIsStreaming(false);
    };

    useEffect(() => {
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, []);

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={startStream} disabled={isStreaming}>
            {isStreaming ? '输出中...' : '开始流式输出'}
          </button>
          <button onClick={handleReset} disabled={isStreaming}>
            重置
          </button>
        </div>

        <div className="stats-panel">
          <h4>📊 性能统计</h4>
          <ul>
            <li>追加次数: {stats.totalAppends}</li>
            <li>缓存命中: {stats.cacheHits}</li>
            <li>缓存未命中: {stats.cacheMisses}</li>
            <li>平均解析时间: {stats.avgParseTime.toFixed(2)}ms</li>
            <li>块数量: {blocks.length}</li>
            <li>
              稳定块: {blocks.filter((b) => b.stable).length} /{' '}
              {blocks.length}
            </li>
          </ul>
        </div>

        <div className="content-area">
          <div className="markdown-body">{element}</div>
        </div>
      </div>
    );
  },
};

/**
 * 块稳定事件示例
 */
export const WithBlockEvents: Story = {
  render: () => {
    const [events, setEvents] = useState<string[]>([]);
    const { content, isStreaming, isComplete, start, reset } =
      useSimulatedStream(sampleContent, 30, 5);

    const handleBlockStable = (block: BlockInfo) => {
      setEvents((prev) => [
        ...prev.slice(-9),
        `块 ${block.index} 稳定: ${block.type} (key: ${block.key.slice(0, 20)}...)`,
      ]);
    };

    const handleComplete = () => {
      setEvents((prev) => [...prev, '✅ 流式输出完成']);
    };

    const handleReset = () => {
      reset();
      setEvents([]);
    };

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={start} disabled={isStreaming}>
            开始
          </button>
          <button onClick={handleReset} disabled={isStreaming}>
            重置
          </button>
        </div>

        <div className="events-panel">
          <h4>📝 事件日志 (最近 10 条)</h4>
          <ul>
            {events.map((event, i) => (
              <li key={i}>{event}</li>
            ))}
          </ul>
        </div>

        <div className="content-area">
          <StreamingMarkdown
            content={content}
            isComplete={isComplete}
            onComplete={handleComplete}
            onBlockStable={handleBlockStable}
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};

/**
 * 不同速度对比
 */
export const SpeedComparison: Story = {
  render: () => {
    const slow = useSimulatedStream(sampleContent, 100, 1);
    const medium = useSimulatedStream(sampleContent, 30, 3);
    const fast = useSimulatedStream(sampleContent, 10, 10);

    const startAll = () => {
      slow.start();
      medium.start();
      fast.start();
    };

    const resetAll = () => {
      slow.reset();
      medium.reset();
      fast.reset();
    };

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button
            onClick={startAll}
            disabled={slow.isStreaming || medium.isStreaming || fast.isStreaming}
          >
            同时开始
          </button>
          <button onClick={resetAll}>全部重置</button>
        </div>

        <div className="comparison-grid">
          <div className="comparison-item">
            <h4>🐢 慢速 (100ms/字符)</h4>
            <StreamingMarkdown
              content={slow.content}
              isComplete={slow.isComplete}
              className="markdown-body"
            />
          </div>

          <div className="comparison-item">
            <h4>🚶 中速 (30ms/3字符)</h4>
            <StreamingMarkdown
              content={medium.content}
              isComplete={medium.isComplete}
              className="markdown-body"
            />
          </div>

          <div className="comparison-item">
            <h4>🚀 快速 (10ms/10字符)</h4>
            <StreamingMarkdown
              content={fast.content}
              isComplete={fast.isComplete}
              className="markdown-body"
            />
          </div>
        </div>
      </div>
    );
  },
};
