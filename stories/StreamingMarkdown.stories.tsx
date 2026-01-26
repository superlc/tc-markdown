import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  StreamingMarkdown,
  useStreamingMarkdown,
  type BlockInfo,
  type OutputRatePreset,
  type InlineType,
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

| 概念 | 说明 |
| ---- | ---- |
| 实例 | 云端的虚拟计算资源 |
| 云数据库 | 参考[价格页](https://cloud.tencent.com/price/) |

---
以上信息仅供参考，具体信息请以腾讯云官网为准。

**腾讯云**，让创新更简单。
> Dorothy followed her through many of the beautiful rooms in her castle.

##### 列表
1. 有序列表
2. 有序列表

##### 任务列表
- [x] 任务列表
- [ ] 任务列表
`;

/**
 * 基础流式渲染 - 使用内置速率控制
 */
export const Basic: Story = {
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

/**
 * 速率选择器 - 可切换不同速率预设
 */
export const RateSelector: Story = {
  render: () => {
    const [rate, setRate] = useState<OutputRatePreset>('medium');
    const [key, setKey] = useState(0);

    const handleRateChange = (newRate: OutputRatePreset) => {
      setRate(newRate);
      setKey((k) => k + 1);
    };

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button
            onClick={() => handleRateChange('slow')}
            className={rate === 'slow' ? 'active' : ''}
          >
            🐢 慢速
          </button>
          <button
            onClick={() => handleRateChange('medium')}
            className={rate === 'medium' ? 'active' : ''}
          >
            🚶 中速
          </button>
          <button
            onClick={() => handleRateChange('fast')}
            className={rate === 'fast' ? 'active' : ''}
          >
            🚀 快速
          </button>
          <button
            onClick={() => handleRateChange('instant')}
            className={rate === 'instant' ? 'active' : ''}
          >
            ⚡ 立即
          </button>
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
        </div>

        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={sampleContent}
            outputRate={rate}
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};

/**
 * 使用 Hook - 支持暂停/恢复/跳过
 */
export const WithHookControls: Story = {
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
          <button
            onClick={pause}
            disabled={outputStatus !== 'running'}
          >
            暂停
          </button>
          <button
            onClick={resume}
            disabled={outputStatus !== 'paused'}
          >
            恢复
          </button>
          <button
            onClick={skipToEnd}
            disabled={outputStatus === 'idle' || outputStatus === 'complete'}
          >
            跳过
          </button>
          <button onClick={reset}>重置</button>
          <span className="status">
            {outputStatus === 'running' && '⏳ 输出中'}
            {outputStatus === 'paused' && '⏸️ 已暂停'}
            {outputStatus === 'complete' && '✅ 完成'}
            {outputStatus === 'idle' && '⏸️ 就绪'}
          </span>
        </div>

        <div className="stats-panel">
          <h4>📊 状态信息</h4>
          <ul>
            <li>进度: {(progress * 100).toFixed(1)}%</li>
            <li>追加次数: {stats.totalAppends}</li>
            <li>块数量: {blocks.length}</li>
            <li>
              稳定块: {blocks.filter((b) => b.stable).length} / {blocks.length}
            </li>
          </ul>
          <div
            style={{
              height: '4px',
              background: '#e1e4e8',
              borderRadius: '2px',
              marginTop: '8px',
            }}
          >
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
export const WithBlockEvents: Story = {
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
      setEvents((prev) => [...prev, '✅ 流式输出完成']);
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
          <h4>📝 事件日志 (最近 10 条)</h4>
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

/**
 * 不同速度对比
 */
export const SpeedComparison: Story = {
  render: () => {
    const [key, setKey] = useState(0);

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>同时重新开始</button>
        </div>

        <div className="comparison-grid">
          <div className="comparison-item">
            <h4>🐢 慢速 (slow)</h4>
            <StreamingMarkdown
              key={`slow-${key}`}
              source={sampleContent}
              outputRate="slow"
              className="markdown-body"
            />
          </div>

          <div className="comparison-item">
            <h4>🚶 中速 (medium)</h4>
            <StreamingMarkdown
              key={`medium-${key}`}
              source={sampleContent}
              outputRate="medium"
              className="markdown-body"
            />
          </div>

          <div className="comparison-item">
            <h4>🚀 快速 (fast)</h4>
            <StreamingMarkdown
              key={`fast-${key}`}
              source={sampleContent}
              outputRate="fast"
              className="markdown-body"
            />
          </div>
        </div>
      </div>
    );
  },
};

/**
 * 自定义速率
 */
export const CustomRate: Story = {
  render: () => {
    const [interval, setInterval] = useState(40);
    const [chunkSize, setChunkSize] = useState(3);
    const [key, setKey] = useState(0);

    return (
      <div className="streaming-demo">
        <div className="controls" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <label>
            间隔 (ms):
            <input
              type="range"
              min="5"
              max="100"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              style={{ width: '100px', marginLeft: '8px' }}
            />
            {interval}
          </label>
          <label>
            字符数:
            <input
              type="range"
              min="1"
              max="10"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              style={{ width: '100px', marginLeft: '8px' }}
            />
            {chunkSize}
          </label>
          <button onClick={() => setKey((k) => k + 1)}>应用并重新开始</button>
        </div>

        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={sampleContent}
            outputRate={{ interval, chunkSize }}
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};

// 用于行内预测演示的内容
const inlinePredictionContent = `这是一段包含各种**行内标记的文本。

这里有*斜体文字*，也有**粗体文字**，还有\`行内代码\`。

这是一个[链接示例](https://example.com)，以及~~删除线文本~~。

组合使用：**粗体中包含*斜体*文字**，或者\`代码中的内容\`。

更多链接：访问[腾讯云](https://cloud.tencent.com)获取更多信息。
`;

/**
 * 行内预测演示 - 开启 vs 关闭对比
 */
export const InlinePrediction: Story = {
  render: () => {
    const [key, setKey] = useState(0);

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>同时重新开始</button>
          <span className="status">对比：开启预测 vs 关闭预测</span>
        </div>

        <p style={{ margin: '16px 0', color: '#666', fontSize: '14px' }}>
          观察未闭合标记（如 <code>**粗体</code>、<code>*斜体</code>、<code>`代码</code>）的渲染差异。
          开启预测时，未闭合的标记会预渲染为目标格式（带 <code>data-predicted</code> 属性）。
        </p>

        <div className="comparison-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="comparison-item">
            <h4>✅ 开启行内预测 (默认)</h4>
            <StreamingMarkdown
              key={`prediction-on-${key}`}
              source={inlinePredictionContent}
              outputRate="slow"
              enableInlinePrediction={true}
              className="markdown-body"
            />
          </div>

          <div className="comparison-item">
            <h4>❌ 关闭行内预测</h4>
            <StreamingMarkdown
              key={`prediction-off-${key}`}
              source={inlinePredictionContent}
              outputRate="slow"
              enableInlinePrediction={false}
              className="markdown-body"
            />
          </div>
        </div>

        <style>{`
          [data-predicted="true"] {
            opacity: 0.7;
            text-decoration-line: underline;
            text-decoration-style: dashed;
            text-underline-offset: 2px;
          }
        `}</style>
      </div>
    );
  },
};

/**
 * 行内预测类型选择
 */
export const InlinePredictionTypes: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    const [enabledTypes, setEnabledTypes] = useState<InlineType[]>([
      'bold',
      'italic',
      'code',
      'strikethrough',
      'link',
    ]);

    const allTypes: InlineType[] = ['bold', 'italic', 'code', 'strikethrough', 'link', 'image'];

    const toggleType = (type: InlineType) => {
      setEnabledTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    };

    return (
      <div className="streaming-demo">
        <div className="controls" style={{ flexWrap: 'wrap', gap: '8px' }}>
          {allTypes.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={enabledTypes.includes(type) ? 'active' : ''}
              style={{ textTransform: 'capitalize' }}
            >
              {type}
            </button>
          ))}
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
        </div>

        <p style={{ margin: '16px 0', color: '#666', fontSize: '14px' }}>
          选择要启用预测的行内标记类型。未选中的类型将保持原有行为（先显示标记文本，闭合后变为格式）。
        </p>

        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={inlinePredictionContent}
            outputRate="slow"
            enableInlinePrediction={true}
            predictedInlineTypes={enabledTypes}
            className="markdown-body"
          />
        </div>

        <style>{`
          [data-predicted="true"] {
            opacity: 0.7;
            text-decoration-line: underline;
            text-decoration-style: dashed;
            text-underline-offset: 2px;
          }
        `}</style>
      </div>
    );
  },
};
