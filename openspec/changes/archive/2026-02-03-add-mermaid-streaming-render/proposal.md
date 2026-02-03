# Proposal: Mermaid 图表流式渲染

## Change ID
`add-mermaid-streaming-render`

## Summary
为 Mermaid 图表增加流式渲染支持，实现图表图形的渐进式展示效果（而非代码的流式显示）。当 Mermaid 代码块稳定后触发渲染，SVG 图形以动画形式逐步展现，提升用户体验。

## Motivation
当前实现中，Mermaid 图表在流式场景下的行为是：
1. 代码块未闭合（`stable: false`）时显示为普通代码
2. 代码块闭合后（`stable: true`）立即完整显示渲染后的 SVG

这种"突然出现"的体验不够平滑。用户期望看到图表元素渐进式展现，与整体流式渲染的体验保持一致。

## Scope
- **In Scope**:
  - SVG 图形元素的渐进式显示动画
  - 节点、连线、文字等元素依次出现
  - React 和 Vue 组件支持
  - 可配置的动画速率和样式
  
- **Out of Scope**:
  - Mermaid 代码的逐字符流式显示（已由现有流式解析器处理）
  - 修改 Mermaid 库本身
  - 图表结构的实时构建（需等代码完整才能解析）

## Technical Approach

### 核心思路
Mermaid 库不支持渐进式渲染，必须等待完整代码才能生成 SVG。因此采用**后处理动画**方案：

1. **等待代码块稳定**：复用现有 `stable` 机制，代码块闭合后触发渲染
2. **SVG 元素提取**：解析生成的 SVG，提取节点（rect, circle, polygon）、连线（path, line）、文字（text, tspan）等元素
3. **动画编排**：为元素设置初始隐藏状态，按拓扑顺序或层级依次显示
4. **CSS 动画**：使用 CSS transitions/animations 实现淡入、缩放等效果

### 动画策略
| 图表类型 | 动画顺序 |
|---------|---------|
| 流程图 flowchart | 按流程方向：从起点向终点依次显示节点和连线 |
| 时序图 sequence | 按时间顺序：参与者 → 消息线 → 消息文字 |
| 类图 class | 按层级：类节点 → 关系连线 |
| 其他 | 按 SVG DOM 顺序依次显示 |

### 可配置项
- `streamingAnimation`: 是否启用流式动画（默认 `true`，仅在流式模式下生效）
- `animationDuration`: 单个元素动画时长（默认 `150ms`）
- `animationStagger`: 元素间隔时间（默认 `50ms`）

## Dependencies
- 依赖现有 `mermaid-render` spec 中的渲染能力
- 依赖 `markdown-streaming` spec 中的 `stable` 块状态

## Risks & Mitigations
| 风险 | 缓解措施 |
|-----|---------|
| SVG 结构随 Mermaid 版本变化 | 使用通用选择器（如 `[class*="node"]`），不依赖具体类名 |
| 复杂图表元素过多导致动画卡顿 | 设置元素数量上限（如 >100 个元素时跳过动画） |
| 动画中途用户操作冲突 | 动画期间禁用缩放/下载按钮，或允许跳过动画 |

## Success Criteria
1. 流式模式下 Mermaid 图表以动画形式展现
2. 非流式模式下保持即时显示行为
3. 动画流畅，不影响页面性能
4. React 和 Vue 行为一致
