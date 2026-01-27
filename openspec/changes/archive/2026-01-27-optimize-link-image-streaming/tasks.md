## 1. 链接优化
- [x] 1.1 修改 `stream-buffer.ts` 中链接的缓冲策略，不再缓冲链接内容
- [x] 1.2 修改 `InlineCompleter` 的 `getCloseMarker` 方法，对未闭合链接自动补全 `](#)`
- [x] 1.3 确保链接文字可以逐字显示

## 2. 图片优化
- [x] 2.1 定义占位图 URL 配置（使用 1x1 透明 gif data URI）
- [x] 2.2 修改 `InlineCompleter` 对未闭合图片自动补全 `](placeholder-url)`
- [x] 2.3 URL 完整后替换为实际图片

## 3. 测试验证
- [x] 3.1 构建并在 Storybook 测试链接效果
- [x] 3.2 测试图片占位图效果
