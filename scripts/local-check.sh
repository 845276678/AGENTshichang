#!/bin/bash
# 本地环境快速检查脚本

echo "=== 本地环境快速检查 ==="
echo ""

# 1. Node版本
echo "Node版本:"
node --version

# 2. 环境变量
echo -e "\n环境变量:"
[ -f .env.local ] && echo "✅ .env.local exists" || echo "❌ .env.local missing"

# 3. 依赖
echo -e "\n依赖状态:"
[ -d node_modules ] && echo "✅ node_modules exists" || echo "❌ node_modules missing"

# 4. 构建测试
echo -e "\n执行构建测试..."
npm run build > /dev/null 2>&1 && echo "✅ Build successful" || echo "❌ Build failed"

# 5. 类型检查
echo -e "\n类型检查..."
npm run typecheck > /dev/null 2>&1 && echo "✅ Type check passed" || echo "❌ Type check failed"

# 6. 换行符检查
echo -e "\n换行符检查..."
CRLF_COUNT=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l $'\r' {} \; 2>/dev/null | wc -l)
[ "$CRLF_COUNT" -eq 0 ] && echo "✅ No CRLF found" || echo "❌ Found $CRLF_COUNT files with CRLF"

# 7. BOM检查
echo -e "\nBOM检查..."
BOM_COUNT=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sh -c 'head -c 3 "$1" 2>/dev/null | grep -q $'"'"'\xEF\xBB\xBF'"'"' && echo "$1"' _ {} \; 2>/dev/null | wc -l)
[ "$BOM_COUNT" -eq 0 ] && echo "✅ No BOM found" || echo "❌ Found $BOM_COUNT files with BOM"

echo -e "\n=== 检查完成 ==="
