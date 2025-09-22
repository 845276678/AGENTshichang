# 🔧 Docker构建依赖冲突修复方案

## 🚨 问题描述

Docker构建过程中遇到依赖版本冲突：
- `next-auth@4.24.11` 需要 `nodemailer@^6.6.5`
- 项目中使用了 `nodemailer@^7.0.6`
- 导致npm无法解析依赖关系

## ✅ 解决方案

### 1. 更新包版本
```json
// package.json
"nodemailer": "^6.9.15"  // 从 ^7.0.6 降级到兼容版本
```

### 2. 配置npm使用legacy-peer-deps
```bash
# .npmrc
legacy-peer-deps=true
```

### 3. 更新Dockerfile构建参数
```dockerfile
# 在所有npm ci命令中添加 --legacy-peer-deps
RUN npm ci --legacy-peer-deps
```

### 4. 创建简化Dockerfile
创建了 `Dockerfile.simple` 用于快速构建和测试

## 🔄 更新的文件

1. **package.json** - 更新nodemailer版本
2. **Dockerfile** - 添加legacy-peer-deps参数
3. **Dockerfile.simple** - 简化版Docker配置
4. **.npmrc** - npm配置文件
5. **deploy-mysql.sh** - 使用简化Dockerfile构建
6. **test-docker-build.sh** - 本地测试脚本

## 🧪 验证步骤

```bash
# 1. 本地测试依赖安装
npm install

# 2. 测试Docker构建
./test-docker-build.sh

# 3. 部署到生产环境
./deploy-mysql.sh
```

## 📝 注意事项

- nodemailer从v7降级到v6.9.15，功能兼容性良好
- legacy-peer-deps仅用于解决依赖冲突，不影响功能
- 生产环境部署时会自动使用修复后的配置

## ⚡ 快速修复命令

如果仍遇到问题，可以手动执行：

```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 本地Docker测试
docker build -f Dockerfile.simple -t test .
```

## 🎯 长期解决方案

未来考虑升级到：
- Next-Auth v5 (支持更新的依赖版本)
- 或者使用自定义认证解决方案

这将彻底解决版本冲突问题。