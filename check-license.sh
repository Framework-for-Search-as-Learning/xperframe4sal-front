#!/bin/bash

# Copyright (c) 2026, lapic-ufjf
# Licensed under The MIT License [see LICENSE for details]

set -e

YEAR=$(date +%Y)
MISSING_COUNT=0
TOTAL_COUNT=0

echo "Checking for copyright statements in source files..."
echo "=========================================================="

# Find all TypeScript and JavaScript files excluding node_modules, dist, build, coverage
while IFS= read -r file; do
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    if ! grep -q "Copyright (c)" "$file"; then
        echo "  ❌ Missing copyright: $file"
        MISSING_COUNT=$((MISSING_COUNT + 1))
    fi
done < <(find . -type f \( -name "*.ts" -o -name "*.js" \) \
    ! -path "./node_modules/*" \
    ! -path "./*/node_modules/*" \
    ! -path "./dist/*" \
    ! -path "./*/dist/*" \
    ! -path "./build/*" \
    ! -path "./*/build/*" \
    ! -path "./coverage/*" \
    ! -path "./*/coverage/*" \
    ! -path "./.next/*" \
    ! -path "*/.next/*" \
    ! -name "*.config.js" \
    2>/dev/null)

echo "=========================================================="
echo "Total files checked: $TOTAL_COUNT"
echo "Files missing copyright: $MISSING_COUNT"

if [ $MISSING_COUNT -gt 0 ]; then
    echo ""
    echo "❌ Please add copyright statements to the files listed above."
    echo "   Run 'make add-copyright' from the project root to automatically add them."
    exit 1
else
    echo ""
    echo "✅ All files have copyright statements!"
    exit 0
fi
