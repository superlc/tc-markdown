import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StreamingMarkdown, type OutputRatePreset } from '@tc/md-react';
import '../styles.css';

const meta: Meta<typeof StreamingMarkdown> = {
  title: 'Streaming/速率控制',
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
 * 速率选择器 - 可切换不同速率预设
 */
export const 速率选择: Story = {
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
          <button onClick={() => handleRateChange('slow')} className={rate === 'slow' ? 'active' : ''}>
            慢速
          </button>
          <button onClick={() => handleRateChange('medium')} className={rate === 'medium' ? 'active' : ''}>
            中速
          </button>
          <button onClick={() => handleRateChange('fast')} className={rate === 'fast' ? 'active' : ''}>
            快速
          </button>
          <button onClick={() => handleRateChange('instant')} className={rate === 'instant' ? 'active' : ''}>
            立即
          </button>
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
        </div>

        <div className="content-area">
          <StreamingMarkdown key={key} source={sampleContent} outputRate={rate} className="markdown-body" />
        </div>
      </div>
    );
  },
};

/**
 * 自定义速率
 */
export const 自定义速率: Story = {
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

/**
 * 不同速度对比
 */
export const 速度对比: Story = {
  render: () => {
    const [key, setKey] = useState(0);

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>同时重新开始</button>
        </div>

        <div className="comparison-grid">
          <div className="comparison-item">
            <h4>慢速 (slow)</h4>
            <StreamingMarkdown key={`slow-${key}`} source={sampleContent} outputRate="slow" className="markdown-body" />
          </div>

          <div className="comparison-item">
            <h4>中速 (medium)</h4>
            <StreamingMarkdown key={`medium-${key}`} source={sampleContent} outputRate="medium" className="markdown-body" />
          </div>

          <div className="comparison-item">
            <h4>快速 (fast)</h4>
            <StreamingMarkdown key={`fast-${key}`} source={sampleContent} outputRate="fast" className="markdown-body" />
          </div>
        </div>
      </div>
    );
  },
};
