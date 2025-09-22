#!/bin/bash
# 测试Docker构建脚本

set -e

echo "🔧 开始Docker构建测试..."

# 清理旧镜像
echo "清理旧镜像..."
docker rmi ai-agent-marketplace:test 2>/dev/null || true

# 使用简化Dockerfile构建
echo "使用简化Dockerfile构建..."
docker build -f Dockerfile.simple -t ai-agent-marketplace:test .

echo "✅ Docker构建测试完成！"

# 可选：运行容器测试
read -p "是否运行容器测试？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "运行容器测试..."
    docker run --rm -p 3000:3000 --env-file .env.production ai-agent-marketplace:test &
    sleep 10

    # 测试健康检查
    if curl -f http://localhost:3000/api/health; then
        echo "✅ 容器运行正常"
    else
        echo "❌ 容器运行异常"
    fi

    # 停止容器
    docker stop $(docker ps -q --filter ancestor=ai-agent-marketplace:test) 2>/dev/null || true
fi

echo "🎉 测试完成！"