import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VueRenderer } from '../components/VueRenderer';
import { Markdown, StreamingMarkdown } from '@superlc/md-vue';
import '../styles.css';

const meta: Meta<typeof VueRenderer> = {
  title: 'Vue/基础示例',
  component: VueRenderer,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof VueRenderer>;

const sampleContent = `
# Markdown 基础示例

这是一个展示 **Markdown** 常用语法的测试文档。

## 文本格式

普通文本、**粗体**、*斜体*、~~删除线~~、\`行内代码\`

## 列表

### 无序列表
- 第一项
- 第二项
  - 嵌套项 A
  - 嵌套项 B
- 第三项

### 有序列表
1. 步骤一
2. 步骤二
3. 步骤三

### 任务列表
- [x] 已完成任务
- [ ] 待完成任务

## 引用

> 这是一段引用文字。
> 
> 引用可以有多行。

## 代码块

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

## 表格

| 名称 | 类型 | 描述 |
|------|------|------|
| id | number | 唯一标识 |
| name | string | 名称 |
| active | boolean | 是否激活 |

## 链接与图片

[访问 GitHub](https://github.com)

![示例图片](https://picsum.photos/300/150)

## 分隔线

---

*文档结束*
`;

/**
 * 静态 Markdown 渲染
 */
export const 静态渲染: Story = {
  args: {
    component: Markdown,
    props: {
      content: sampleContent,
      class: 'markdown-body',
      gfm: true,
      highlight: true,
    },
  },
};

/**
 * 流式 Markdown 渲染
 */
export const 流式渲染: Story = {
  render: () => {
    const [key, setKey] = useState(0);

    const StreamingWrapper: React.FC = () => {
      const containerRef = React.useRef<HTMLDivElement>(null);
      const appRef = React.useRef<ReturnType<typeof import('vue').createApp> | null>(null);

      React.useEffect(() => {
        if (!containerRef.current) return;

        import('vue').then(({ createApp }) => {
          if (appRef.current) {
            appRef.current.unmount();
          }

          containerRef.current!.innerHTML = '';
          const mountEl = document.createElement('div');
          containerRef.current!.appendChild(mountEl);

          const app = createApp(StreamingMarkdown, {
            source: sampleContent,
            outputRate: 'medium',
            class: 'markdown-body',
            gfm: true,
            highlight: true,
          });
          app.mount(mountEl);
          appRef.current = app;
        });

        return () => {
          if (appRef.current) {
            appRef.current.unmount();
            appRef.current = null;
          }
        };
      }, []);

      return <div ref={containerRef} />;
    };

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
          <span className="status">默认中速 (medium)</span>
        </div>
        <div className="content-area">
          <StreamingWrapper key={key} />
        </div>
      </div>
    );
  },
};
