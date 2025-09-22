#!/bin/bash

# 健康检查脚本
set -e

echo "🏥 执行系统健康检查..."

# 检查应用健康状态
check_app_health() {
    echo "📱 检查应用健康状态..."

    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        echo "✅ 应用健康状态: 正常"
    else
        echo "❌ 应用健康状态: 异常"
        return 1
    fi
}

# 检查数据库连接
check_database() {
    echo "🗄️ 检查数据库连接..."

    if docker exec postgres-primary pg_isready -U $POSTGRES_USER > /dev/null 2>&1; then
        echo "✅ 数据库连接: 正常"
    else
        echo "❌ 数据库连接: 异常"
        return 1
    fi
}

# 检查Redis连接
check_redis() {
    echo "🔴 检查Redis连接..."

    if docker exec redis redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis连接: 正常"
    else
        echo "❌ Redis连接: 异常"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    echo "💾 检查磁盘空间..."

    usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$usage" -lt 80 ]; then
        echo "✅ 磁盘使用率: ${usage}% (正常)"
    elif [ "$usage" -lt 90 ]; then
        echo "⚠️ 磁盘使用率: ${usage}% (警告)"
    else
        echo "❌ 磁盘使用率: ${usage}% (危险)"
        return 1
    fi
}

# 检查内存使用
check_memory() {
    echo "🧠 检查内存使用..."

    memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$memory_usage" -lt 80 ]; then
        echo "✅ 内存使用率: ${memory_usage}% (正常)"
    elif [ "$memory_usage" -lt 90 ]; then
        echo "⚠️ 内存使用率: ${memory_usage}% (警告)"
    else
        echo "❌ 内存使用率: ${memory_usage}% (危险)"
        return 1
    fi
}

# 检查容器状态
check_containers() {
    echo "🐳 检查容器状态..."

    failed_containers=$(docker ps -a --filter "status=exited" --format "table {{.Names}}" | grep -v NAMES | wc -l)

    if [ "$failed_containers" -eq 0 ]; then
        echo "✅ 所有容器运行正常"
    else
        echo "❌ 发现 $failed_containers 个停止的容器"
        docker ps -a --filter "status=exited" --format "table {{.Names}}\t{{.Status}}"
        return 1
    fi
}

# 主检查函数
main() {
    local exit_code=0

    check_app_health || exit_code=1
    check_database || exit_code=1
    check_redis || exit_code=1
    check_disk_space || exit_code=1
    check_memory || exit_code=1
    check_containers || exit_code=1

    if [ $exit_code -eq 0 ]; then
        echo ""
        echo "🎉 所有健康检查通过！"
        echo "系统运行状态良好。"
    else
        echo ""
        echo "⚠️ 发现系统问题！"
        echo "请检查上述错误并采取相应措施。"
    fi

    exit $exit_code
}

main "$@"