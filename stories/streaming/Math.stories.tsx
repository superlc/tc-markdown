import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StreamingMarkdown } from '@tc/md-react';
import '../styles.css';

const meta: Meta<typeof StreamingMarkdown> = {
  title: 'React/数学公式',
  component: StreamingMarkdown,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof StreamingMarkdown>;

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
 * 数学公式渲染示例
 */
export const 默认效果: Story = {
  render: () => {
    const [key, setKey] = useState(0);

    return (
      <div className="streaming-demo">
        <div className="controls">
          <button onClick={() => setKey((k) => k + 1)}>重新开始</button>
          <span className="status">math=true</span>
        </div>

        <div className="content-area">
          <StreamingMarkdown
            key={key}
            source={mathContent}
            outputRate="medium"
            math={true}
            className="markdown-body"
          />
        </div>
      </div>
    );
  },
};
