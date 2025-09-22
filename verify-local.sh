#!/bin/bash
# ==================================================
# 本地开发环境验证脚本
# ==================================================

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 验证本地开发环境..."
echo "=========================="

# 验证函数
verify_service() {
    local service_name="$1"
    local url="$2"
    local timeout="$3"

    echo -n "检查 $service_name... "

    if curl -s --max-time "$timeout" "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 正常${NC}"
        return 0
    else
        echo -e "${RED}❌ 失败${NC}"
        return 1
    fi
}

# 检查应用是否运行
if ! curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo -e "${RED}❌ 应用未运行，请先启动开发服务器${NC}"
    echo "运行: npm run dev"
    exit 1
fi

echo -e "${GREEN}✅ 应用正在运行${NC}"
echo

# 验证各个服务
echo "验证服务状态："
verify_service "应用首页" "http://localhost:4000" 5
verify_service "API健康检查" "http://localhost:4000/api/health" 5
verify_service "用户API" "http://localhost:4000/api/users" 5

echo
echo "📊 系统信息："

# 检查数据库连接
echo -n "数据库连接... "
if npx prisma db status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 已连接${NC}"
else
    echo -e "${RED}❌ 连接失败${NC}"
fi

# 检查环境变量
echo -n "环境配置... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ 已配置${NC}"
else
    echo -e "${YELLOW}⚠️ 未找到 .env.local${NC}"
fi

# 检查依赖
echo -n "项目依赖... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ 已安装${NC}"
else
    echo -e "${RED}❌ 未安装${NC}"
fi

echo
echo "🌐 访问地址："
echo "- 应用主页: http://localhost:4000"
echo "- API文档: http://localhost:4000/api"
echo "- 健康检查: http://localhost:4000/api/health"
echo "- 数据库管理: npx prisma studio"

echo
echo "🛠️ 常用命令："
echo "- 启动开发: npm run dev"
echo "- 数据库管理: npx prisma studio"
echo "- 类型检查: npm run type-check"
echo "- 代码格式化: npm run format"
echo "- 运行测试: npm run test"

echo
echo "✨ 验证完成！"