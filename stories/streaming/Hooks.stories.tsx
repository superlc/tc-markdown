import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StreamingMarkdown, useStreamingMarkdown, type BlockInfo } from '@tc/md-react';
import '../styles.css';

const meta: Meta<typeof StreamingMarkdown> = {
  title: 'Streaming/Hook与事件',
  component: StreamingMarkdown,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof StreamingMarkdown>;

const sampleContent = `
### 云服务器
腾讯云云服务器（Cloud Virtual Machine，CVM）是腾讯云提供的可扩展的计算服务。

##### 如何使用云服务器？
1. **控制台**：腾讯云提供的 Web 服务界面
2. **云数据库**：提供多种类型的数据库服务
3. **云存储**：提供高效、安全、灵活的云存储服务

- 高性能
- 高可靠
- 灵活扩展

更多信息请访问 [腾讯云官网](https://cloud.tencent.com/)
`;

/**
 * 使用 Hook - 支持暂停/恢复/跳过
 */
export const Hook控制: Story = {
  render: () => {
    const {
      element,
      start,
      pause,
      resume,
      skipToEnd,
      reset,
      blocks,
      stats,
      progress,
      outputStatus,
    } = useStreamingMarkdown({
      gfm: true,
      highlight: true,
      outputRate: 'medium',
    });

    const handleStart = () => {
      start(sampleContent);
    };

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={handleStart} disabled={outputStatus === 'running'}>
            开始
          </button>
          <button onClick={pause} disabled={outputStatus !== 'running'}>
            暂停
          </button>
          <button onClick={resume} disabled={outputStatus !== 'paused'}>
            恢复
          </button>
          <button onClick={skipToEnd} disabled={outputStatus === 'idle' || outputStatus === 'complete'}>
            跳过
          </button>
          <button onClick={reset}>重置</button>
          <span className="status">
            {outputStatus === 'running' && '输出中'}
            {outputStatus === 'paused' && '已暂停'}
            {outputStatus === 'complete' && '完成'}
            {outputStatus === 'idle' && '就绪'}
          </span>
        </div>

        <div className="stats-panel">
          <h4>状态信息</h4>
          <ul>
            <li>进度: {(progress * 100).toFixed(1)}%</li>
            <li>追加次数: {stats.totalAppends}</li>
            <li>块数量: {blocks.length}</li>
            <li>稳定块: {blocks.filter((b) => b.stable).length} / {blocks.length}</li>
          </ul>
          <div style={{ height: '4px', background: '#e1e4e8', borderRadius: '2px', marginTop: '8px' }}>
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: '#0366d6',
                borderRadius: '2px',
                transition: 'width 0.1s',
              }}
            />
          </div>
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
export const 块事件: Story = {
  render: () => {
    const [events, setEvents] = useState<string[]>([]);
    const [key, setKey] = useState(0);

    const handleBlockStable = (block: BlockInfo) => {
      setEvents((prev) => [
        ...prev.slice(-9),
        `块 ${block.index} 稳定: ${block.type} (key: ${block.key.slice(0, 15)}...)`,
      ]);
    };

    const handleComplete = () => {
      setEvents((prev) => [...prev, '流式输出完成']);
    };

    const handleReset = () => {
      setEvents([]);
      setKey((k) => k + 1);
    };

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={handleReset}>重新开始</button>
        </div>

        <div className="events-panel">
          <h4>事件日志 (最近 10 条)</h4>
          <ul>
            {events.map((event, i) => (
              <li key={i}>{event}</li>
            ))}
          </ul>
        </div>

        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={sampleContent}
            outputRate="medium"
            onComplete={handleComplete}
            onBlockStable={handleBlockStable}
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};
