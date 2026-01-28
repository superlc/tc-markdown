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

## 数学公式（如果支持）

行内公式：$E = mc^2$

块级公式：

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

---

*文档结束*
`;

/**
 * 基础流式渲染
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
