#!/bin/bash
# 获取包信息（支持 monorepo）
# 用法: ./get_package_info.sh [package_path]

set -e

PKG_PATH="${1:-.}"

echo "=== Package Info ==="

# 检查 package.json 是否存在
if [ ! -f "$PKG_PATH/package.json" ]; then
    echo "ERROR: package.json not found in $PKG_PATH"
    exit 1
fi

# 解析 package.json
NAME=$(grep -o '"name":\s*"[^"]*"' "$PKG_PATH/package.json" | head -1 | cut -d'"' -f4)
VERSION=$(grep -o '"version":\s*"[^"]*"' "$PKG_PATH/package.json" | head -1 | cut -d'"' -f4)
PRIVATE=$(grep -o '"private":\s*[^,}]*' "$PKG_PATH/package.json" | head -1 | awk -F: '{print $2}' | tr -d ' ')

echo "Package: $NAME"
echo "Version: $VERSION"
echo "Private: ${PRIVATE:-false}"
echo "Path: $PKG_PATH"

# 检查是否是 monorepo
if [ -f "pnpm-workspace.yaml" ] || [ -f "lerna.json" ]; then
    echo ""
    echo "=== Monorepo Detected ==="
    
    if [ -f "pnpm-workspace.yaml" ]; then
        echo "Type: pnpm workspace"
        echo "Packages:"
        # 列出所有子包
        find packages -maxdepth 2 -name "package.json" 2>/dev/null | while read pkg; do
            PKG_DIR=$(dirname "$pkg")
            PKG_NAME=$(grep -o '"name":\s*"[^"]*"' "$pkg" | head -1 | cut -d'"' -f4)
            PKG_VER=$(grep -o '"version":\s*"[^"]*"' "$pkg" | head -1 | cut -d'"' -f4)
            PKG_PRIV=$(grep -o '"private":\s*[^,}]*' "$pkg" | head -1 | awk -F: '{print $2}' | tr -d ' ')
            echo "  - $PKG_NAME@$PKG_VER ($PKG_DIR) ${PKG_PRIV:+[private]}"
        done
    fi
fi

# 获取最新的 git tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "none")
echo ""
echo "Latest git tag: $LATEST_TAG"
