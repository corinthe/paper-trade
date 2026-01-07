#!/bin/bash
# Script to copy pre-generated Prisma client from another machine
# 
# Usage:
#   1. On machine with working Prisma:
#      cd prophet-trader-nextjs && npm install && npx prisma generate
#      tar -czf ~/prisma-client.tar.gz node_modules/.prisma node_modules/@prisma/client
#
#   2. Transfer prisma-client.tar.gz to target machine
#
#   3. Run this script:
#      ./scripts/copy-prisma-client.sh /path/to/prisma-client.tar.gz

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <path-to-prisma-client.tar.gz>"
    exit 1
fi

TAR_FILE="$1"

if [ ! -f "$TAR_FILE" ]; then
    echo "Error: File $TAR_FILE not found"
    exit 1
fi

echo "Extracting Prisma client from $TAR_FILE..."
cd "$(dirname "$0")/.."
tar -xzf "$TAR_FILE"

echo "✅ Prisma client installed successfully!"
echo ""
echo "You can now:"
echo "  - Run migrations: npx prisma db push"
echo "  - Start the app: npm run dev"
echo "  - Open Prisma Studio: npx prisma studio"
