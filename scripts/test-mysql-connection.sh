#!/bin/bash
# ==========================================
# MySQL连接测试脚本
# ==========================================

# MySQL配置
MYSQL_HOST="8.137.153.81"
MYSQL_PORT="31369"
MYSQL_USER="root"
MYSQL_PASSWORD="Jk8Iq9ijPht04m6ud7G3N12wZVlEMvY5"
MYSQL_DATABASE="zeabur"

echo "🔍 测试MySQL连接..."
echo "主机: $MYSQL_HOST"
echo "端口: $MYSQL_PORT"
echo "数据库: $MYSQL_DATABASE"
echo "用户: $MYSQL_USER"
echo ""

# 检查网络连接
echo "1. 检查网络连接..."
if nc -z "$MYSQL_HOST" "$MYSQL_PORT" 2>/dev/null; then
    echo "✅ 网络连接正常"
else
    echo "❌ 网络连接失败"
    exit 1
fi

# 尝试连接数据库
echo ""
echo "2. 测试数据库连接..."

# 方法1: 使用Docker MySQL客户端
if docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT VERSION();" "$MYSQL_DATABASE"; then
    echo "✅ MySQL连接成功"
else
    echo "❌ MySQL连接失败"
    exit 1
fi

echo ""
echo "3. 测试数据库操作..."

# 测试基本操作
if docker run --rm mysql:8.0 mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SHOW TABLES;" "$MYSQL_DATABASE"; then
    echo "✅ 数据库操作正常"
else
    echo "⚠️ 数据库操作警告（可能是空数据库）"
fi

echo ""
echo "🎉 MySQL连接测试完成！"
echo ""
echo "连接字符串:"
echo "mysql://root:Jk8Iq9ijPht04m6ud7G3N12wZVlEMvY5@8.137.153.81:31369/zeabur"