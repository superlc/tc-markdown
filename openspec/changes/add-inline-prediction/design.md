# Design: add-inline-prediction

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   StreamingParser                            │
├─────────────────────────────────────────────────────────────┤
│   BlockSplitter → InlineCompleter → parseBlock()            │
│                       ↓                                      │
│              检测未闭合标记                                   │
│                       ↓                                      │
│              补全闭合标记                                     │
│                       ↓                                      │
│              解析为 HAST                                      │
│                       ↓                                      │
│              标记 pending 节点                               │
└─────────────────────────────────────────────────────────────┘
```

## InlineCompleter 类设计

```typescript
interface InlineCompleter {
  /**
   * 补全未闭合的行内标记
   * @param text 原始文本
   * @returns 补全后的文本 + 补全信息
   */
  complete(text: string): {
    text: string;           // 补全后的文本
    completions: Completion[]; // 补全的标记信息
  };
}

interface Completion {
  type: 'bold' | 'italic' | 'code' | 'strikethrough' | 'link' | 'image';
  position: number;        // 开始标记在原文中的位置
  marker: string;          // 补全的闭合标记
}
```

## 标记检测规则

| 标记类型 | 开始模式 | 闭合模式 | 补全策略 |
|---------|---------|---------|---------|
| 粗体 | `**` 或 `__` | 相同标记 | 在文本末尾补全 |
| 斜体 | `*` 或 `_` | 相同标记 | 在文本末尾补全 |
| 行内代码 | `` ` `` | `` ` `` | 在文本末尾补全 |
| 删除线 | `~~` | `~~` | 在文本末尾补全 |
| 链接 | `[text](` | `)` | 补全 `)` |
| 链接文本 | `[text` | `]` | 补全 `]()` |
| 图片 | `![alt](` | `)` | 补全 `)` |

## 嵌套处理

使用栈结构追踪嵌套标记：

```typescript
// 输入: "这是**粗体*斜体"
// 栈: [{ type: 'bold', marker: '**' }, { type: 'italic', marker: '*' }]
// 补全: "这是**粗体*斜体*" + "**" → 按栈逆序补全
```

## HAST 节点标记

补全产生的元素添加 `data-predicted="true"` 属性：

```typescript
{
  type: 'element',
  tagName: 'strong',
  properties: {
    'data-predicted': true,  // 预测补全的节点
  },
  children: [{ type: 'text', value: '粗体' }]
}
```

## 配置选项

```typescript
interface StreamingParserOptions {
  // 现有选项...
  
  /** 是否启用行内预测，默认 true */
  enableInlinePrediction?: boolean;
  
  /** 预测的行内标记类型，默认全部 */
  predictedInlineTypes?: ('bold' | 'italic' | 'code' | 'strikethrough' | 'link' | 'image')[];
}
```

## 性能考虑

1. **增量检测**: 仅检测最后一个非稳定块
2. **缓存补全结果**: 相同输入返回缓存的补全
3. **轻量正则**: 使用简单正则，避免回溯

## 边界情况

1. **代码块内**: 代码块内不进行行内预测
2. **转义字符**: `\*` 不视为标记开始
3. **歧义标记**: `_` 在单词内不视为斜体标记（GFM 行为）
4. **多重嵌套**: 支持 `**粗体*斜体***` 等嵌套
