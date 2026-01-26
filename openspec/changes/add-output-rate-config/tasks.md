# Tasks

## 1. Core - 输出速率控制器
- [x] 在 `@tc/md-core` 新增 `OutputRateController` 类
- [x] 实现预设速率档位：`slow`、`medium`（默认）、`fast`
- [x] 支持自定义 `{ interval, chunkSize }` 配置
- [x] 导出类型定义 `OutputRate`、`OutputRateConfig`

## 2. React - 集成速率控制
- [x] `useStreamingMarkdown` 增加 `outputRate` 选项
- [x] `StreamingMarkdown` 组件增加 `outputRate` prop
- [x] 新增 `start`、`pause`、`resume`、`skipToEnd` 控制方法

## 3. Vue - 集成速率控制
- [x] `useStreamingMarkdown` 增加 `outputRate` 选项
- [x] `StreamingMarkdown` 组件增加 `outputRate` prop

## 4. Storybook - 更新演示
- [x] 更新 `StreamingMarkdown.stories.tsx` 使用内置速率控制
- [x] 添加速率选择器交互演示
- [x] 添加暂停/恢复/跳过控制演示
- [x] 添加自定义速率演示

## 5. 文档更新
- [x] 更新类型导出
