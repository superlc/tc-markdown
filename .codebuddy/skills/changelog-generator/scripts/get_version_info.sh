#!/bin/bash
# 获取版本信息
# 输出：当前版本标签、下一个版本（如果有 package.json）、commit 数量统计

set -e

echo "=== Version Info ==="

# 获取最新的版本标签
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "none")
echo "Latest tag: $LATEST_TAG"

# 获取 package.json 中的版本（如果存在）
if [ -f "package.json" ]; then
    PKG_VERSION=$(grep -o '"version":\s*"[^"]*"' package.json | head -1 | cut -d'"' -f4)
    echo "Package version: $PKG_VERSION"
fi

# 获取自上个标签以来的 commit 数量
if [ "$LATEST_TAG" != "none" ]; then
    COMMIT_COUNT=$(git rev-list "$LATEST_TAG"..HEAD --count)
    echo "Commits since $LATEST_TAG: $COMMIT_COUNT"
else
    COMMIT_COUNT=$(git rev-list HEAD --count)
    echo "Total commits: $COMMIT_COUNT"
fi

# 获取日期范围
if [ "$LATEST_TAG" != "none" ]; then
    TAG_DATE=$(git log -1 --format=%ad --date=short "$LATEST_TAG")
    echo "Tag date: $TAG_DATE"
fi

LATEST_COMMIT_DATE=$(git log -1 --format=%ad --date=short HEAD)
echo "Latest commit: $LATEST_COMMIT_DATE"
