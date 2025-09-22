#!/bin/bash

# 生产环境部署脚本
set -e

echo "🚀 开始部署AI创意交易平台到生产环境..."

# 检查必要的环境变量
check_env_vars() {
    echo "📋 检查环境变量..."
    required_vars=(
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "JWT_SECRET"
        "BAIDU_API_KEY"
        "ALIPAY_APP_ID"
        "ALIYUN_OSS_ACCESS_KEY_ID"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "❌ 缺少必要的环境变量: $var"
            exit 1
        fi
    done
    echo "✅ 环境变量检查完成"
}

# 创建必要的Docker网络和卷
setup_docker_infrastructure() {
    echo "🐳 设置Docker基础设施..."

    # 创建网络
    docker network create ai-marketplace || true
    docker network create monitoring || true

    # 创建数据卷
    docker volume create postgres_primary_data || true
    docker volume create redis_data || true
    docker volume create app_logs || true
    docker volume create nginx_logs || true
    docker volume create prometheus_data || true
    docker volume create grafana_data || true
    docker volume create loki_data || true
    docker volume create alertmanager_data || true

    echo "✅ Docker基础设施设置完成"
}

# 数据库迁移
run_database_migration() {
    echo "🗄️ 运行数据库迁移..."

    # 等待数据库启动
    echo "等待数据库启动..."
    sleep 30

    # 运行Prisma迁移
    docker run --rm \
        --network ai-marketplace \
        --env-file .env.production \
        $DOCKER_IMAGE \
        npx prisma migrate deploy

    echo "✅ 数据库迁移完成"
}

# 启动服务
start_services() {
    echo "🔄 启动服务..."

    # 启动数据库和缓存
    docker-compose -f docker-compose.prod.yml up -d postgres-primary redis

    # 等待数据库就绪
    echo "等待数据库就绪..."
    sleep 30

    # 运行数据库迁移
    run_database_migration

    # 启动应用和负载均衡
    docker-compose -f docker-compose.prod.yml up -d app nginx

    # 启动监控服务
    docker-compose -f docker-compose.monitoring.yml up -d

    echo "✅ 所有服务已启动"
}

# 健康检查
health_check() {
    echo "🏥 进行健康检查..."

    # 等待服务启动
    sleep 60

    # 检查应用健康状态
    max_retries=10
    retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        if curl -f http://localhost/api/health > /dev/null 2>&1; then
            echo "✅ 应用健康检查通过"
            break
        fi

        retry_count=$((retry_count + 1))
        echo "⏳ 健康检查失败，重试 $retry_count/$max_retries..."
        sleep 10
    done

    if [ $retry_count -eq $max_retries ]; then
        echo "❌ 健康检查失败，部署可能存在问题"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    echo "🎉 部署完成！"
    echo ""
    echo "📊 服务访问地址:"
    echo "  - 应用: https://yourdomain.com"
    echo "  - 管理后台: https://yourdomain.com/admin"
    echo "  - API健康检查: https://yourdomain.com/api/health"
    echo "  - Grafana监控: http://localhost:3001"
    echo "  - Prometheus: http://localhost:9090"
    echo ""
    echo "🔧 管理命令:"
    echo "  - 查看日志: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  - 重启服务: docker-compose -f docker-compose.prod.yml restart"
    echo "  - 停止服务: docker-compose -f docker-compose.prod.yml down"
    echo ""
    echo "📝 下一步:"
    echo "  1. 配置域名和SSL证书"
    echo "  2. 设置监控告警"
    echo "  3. 配置备份策略"
    echo "  4. 进行压力测试"
}

# 主部署流程
main() {
    check_env_vars
    setup_docker_infrastructure
    start_services
    health_check
    show_deployment_info
}

# 错误处理
cleanup_on_error() {
    echo "❌ 部署失败，正在清理..."
    docker-compose -f docker-compose.prod.yml down || true
    docker-compose -f docker-compose.monitoring.yml down || true
    exit 1
}

trap cleanup_on_error ERR

# 执行部署
main "$@"