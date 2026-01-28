import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VueRenderer } from '../components/VueRenderer';
import { Markdown, StreamingMarkdown } from '@superlc/md-vue';
import '../styles.css';

const meta: Meta<typeof VueRenderer> = {
  title: 'Vue/数学公式',
  component: VueRenderer,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof VueRenderer>;

const mathContent = `
# 数学公式渲染

本示例展示 LaTeX 数学公式的渲染效果。

## 行内公式

著名的质能方程：$E = mc^2$

圆的面积公式：$A = \\pi r^2$

二次方程求根公式：$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

## 块级公式

### 求和公式

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

### 积分公式

$$
\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

### 矩阵

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\begin{pmatrix}
x \\\\
y
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}
$$

### 欧拉公式

$$
e^{i\\pi} + 1 = 0
$$

### 极限

$$
\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e
$$

## 混合内容

在文本中嵌入公式：当 $n \\to \\infty$ 时，$\\frac{1}{n} \\to 0$。

麦克斯韦方程组中的高斯定律：

$$
\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}
$$
`;

/**
 * 静态数学公式渲染
 */
export const 静态渲染: Story = {
  args: {
    component: Markdown,
    props: {
      content: mathContent,
      class: 'markdown-body',
      gfm: true,
      highlight: true,
      math: true,
    },
  },
};

/**
 * 流式数学公式渲染
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
            source: mathContent,
            outputRate: 'medium',
            class: 'markdown-body',
            gfm: true,
            highlight: true,
            math: true,
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
          <span className="status">math=true</span>
        </div>
        <div className="content-area">
          <StreamingWrapper key={key} />
        </div>
      </div>
    );
  },
};
