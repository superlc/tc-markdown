#!/bin/bash
# 获取从上一个版本标签到当前 HEAD 之间的 commit 列表
# 用法: ./get_commits.sh [base_ref]
# base_ref: 可选，指定基准引用（默认自动检测最新 tag）

set -e

BASE_REF="${1:-}"

# 如果没有指定基准引用，自动检测最新的版本标签
if [ -z "$BASE_REF" ]; then
    # 获取最新的版本标签（按版本排序）
    BASE_REF=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    
    if [ -z "$BASE_REF" ]; then
        echo "Warning: No tags found, using first commit as base" >&2
        BASE_REF=$(git rev-list --max-parents=0 HEAD)
    fi
fi

echo "Base reference: $BASE_REF" >&2
echo "---"

# 获取 commit 列表，格式：hash|author|date|subject
git log "$BASE_REF"..HEAD --pretty=format:"%h|%an|%ad|%s" --date=short --no-merges

echo ""
