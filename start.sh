#!/usr/bin/env bash
# start.sh — Mac/Linux launcher with auto-install portable Node.js
set -e
cd "$(dirname "$0")"

echo ""
echo "  ╔════════════════════════════════════════╗"
echo "  ║   QLTC - Quản lý Tài chính Cá nhân     ║"
echo "  ╚════════════════════════════════════════╝"
echo ""

# 1) System Node.js
if command -v node &> /dev/null; then
  echo "  [OK] Phát hiện Node.js hệ thống."
  echo "  Khởi động server..."
  echo ""
  node "$(pwd)/server.js" 8000
  exit 0
fi

# 2) Portable Node already extracted
NODE_DIR="$(pwd)/node-portable"
NODE_BIN="$NODE_DIR/bin/node"
if [ -x "$NODE_BIN" ]; then
  echo "  [OK] Sử dụng Node.js portable."
  echo ""
  "$NODE_BIN" "$(pwd)/server.js" 8000
  exit 0
fi

# 3) Download portable
echo "  Không tìm thấy Node.js."
read -p "  Tải Node.js portable (~30MB)? [Y/n] " ans
ans=${ans:-Y}
if [[ ! "$ans" =~ ^[Yy]$ ]]; then
  echo "  Đã hủy. Cài Node.js từ: https://nodejs.org/"
  exit 1
fi

NODE_VERSION="v20.18.0"
OS=""
ARCH=""

case "$(uname -s)" in
  Darwin) OS="darwin" ;;
  Linux)  OS="linux" ;;
  *) echo "  [LỖI] OS không hỗ trợ tự cài. Cài thủ công: https://nodejs.org/"; exit 1 ;;
esac

case "$(uname -m)" in
  x86_64|amd64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "  [LỖI] Kiến trúc không hỗ trợ. Cài thủ công: https://nodejs.org/"; exit 1 ;;
esac

FOLDER="node-${NODE_VERSION}-${OS}-${ARCH}"
URL="https://nodejs.org/dist/${NODE_VERSION}/${FOLDER}.tar.gz"
TGZ="/tmp/node-portable.tar.gz"

echo ""
echo "  Đang tải $URL ..."
if command -v curl &> /dev/null; then
  curl -L --progress-bar -o "$TGZ" "$URL"
elif command -v wget &> /dev/null; then
  wget -O "$TGZ" "$URL"
else
  echo "  [LỖI] Cần có 'curl' hoặc 'wget' để tải. Cài Node thủ công."
  exit 1
fi

echo "  Đang giải nén..."
mkdir -p _node_tmp
tar -xzf "$TGZ" -C _node_tmp
mv "_node_tmp/$FOLDER" "$NODE_DIR"
rm -rf _node_tmp "$TGZ"

echo "  [OK] Đã cài Node.js portable."
echo ""
"$NODE_BIN" "$(pwd)/server.js" 8000
