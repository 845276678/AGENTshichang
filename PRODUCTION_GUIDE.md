# 生产环境竞价系统配置指南

## WebSocket配置
- 启用真实WebSocket连接
- 心跳间隔：30秒
- 重连最大尝试：5次
- 连接超时：30秒

## 积分系统安全
- 所有积分操作必须经过认证
- 操作日志记录
- 异常自动回滚
- 重试机制保护

## 性能监控
- WebSocket延迟监控
- 积分操作时间追踪
- 用户交互响应监控
- 定期性能报告

## 错误处理
- 三次重试机制
- 指数退避策略
- 自动故障恢复
- 详细错误日志

## 推荐的环境变量
```bash
# 竞价系统配置
BIDDING_WEBSOCKET_TIMEOUT=30000
BIDDING_MAX_RETRIES=3
BIDDING_HEARTBEAT_INTERVAL=30000
BIDDING_RECONNECT_DELAY=5000

# 积分系统配置
CREDITS_OPERATION_TIMEOUT=10000
CREDITS_MAX_RETRIES=3
CREDITS_MONITOR_ENABLED=true

# 性能监控
PERFORMANCE_MONITORING=true
METRICS_RETENTION_SIZE=100
PERFORMANCE_LOG_INTERVAL=300000
```

## 部署检查清单
- [ ] WebSocket服务器正常运行
- [ ] 积分API认证正常
- [ ] 数据库连接稳定
- [ ] AI服务可用性检查
- [ ] 性能监控启用
- [ ] 错误日志配置
- [ ] 用户认证系统正常
- [ ] 商业报告生成API正常