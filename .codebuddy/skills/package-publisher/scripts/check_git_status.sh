#!/bin/bash
# 检查 git 工作区状态
# 输出：是否有未提交的修改、未跟踪的文件等

set -e

echo "=== Git Status Check ==="

# 检查是否在 git 仓库中
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "ERROR: Not in a git repository"
    exit 1
fi

# 获取当前分支
BRANCH=$(git branch --show-current)
echo "Current branch: $BRANCH"

# 检查是否有暂存的修改
STAGED=$(git diff --cached --name-only)
if [ -n "$STAGED" ]; then
    echo ""
    echo "Staged changes:"
    echo "$STAGED" | sed 's/^/  /'
fi

# 检查是否有未暂存的修改
UNSTAGED=$(git diff --name-only)
if [ -n "$UNSTAGED" ]; then
    echo ""
    echo "Unstaged changes:"
    echo "$UNSTAGED" | sed 's/^/  /'
fi

# 检查是否有未跟踪的文件（排除常见的忽略目录）
UNTRACKED=$(git ls-files --others --exclude-standard)
if [ -n "$UNTRACKED" ]; then
    echo ""
    echo "Untracked files:"
    echo "$UNTRACKED" | sed 's/^/  /'
fi

# 总结状态
echo ""
echo "=== Summary ==="
if [ -z "$STAGED" ] && [ -z "$UNSTAGED" ] && [ -z "$UNTRACKED" ]; then
    echo "Working tree is clean"
    echo "CLEAN=true"
else
    echo "Working tree has uncommitted changes"
    echo "CLEAN=false"
    [ -n "$STAGED" ] && echo "HAS_STAGED=true" || echo "HAS_STAGED=false"
    [ -n "$UNSTAGED" ] && echo "HAS_UNSTAGED=true" || echo "HAS_UNSTAGED=false"
    [ -n "$UNTRACKED" ] && echo "HAS_UNTRACKED=true" || echo "HAS_UNTRACKED=false"
fi
