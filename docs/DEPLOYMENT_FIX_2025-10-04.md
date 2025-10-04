# 生产环境502错误修复记录

**日期**: 2025-10-04
**问题**: 生产环境持续返回502 Bad Gateway
**状态**: 🟡 修复已部署,等待验证

---

## 问题根因

### 错误信息
```
Error: Cannot find module './src/lib/validate-env'
Require stack:
- /app/server.js
```

### 根本原因
`server.js` (第27行) 试图引用 TypeScript 文件:
```javascript
const { validateEnvironment, printValidationResults } = require('./src/lib/validate-env');
```

在生产环境中,TypeScript文件需要先编译。Next.js的构建过程不会自动编译 `server.js` 中引用的 `.ts` 文件,导致运行时找不到模块。

---

## 解决方案

### 修复方法
将环境验证逻辑从 TypeScript 文件内联到 `server.js` 中:

```javascript
// 环境变量验证 (内联版本,避免TypeScript导入问题)
function validateEnvironment() {
  const errors = [];
  const warnings = [];

  if (!process.env.DATABASE_URL) errors.push('DATABASE_URL is required');
  if (!process.env.JWT_SECRET) errors.push('JWT_SECRET is required');
  if (!process.env.NEXTAUTH_SECRET) errors.push('NEXTAUTH_SECRET is required');

  const aiServices = {
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    glm: !!process.env.ZHIPU_API_KEY,
    qwen: !!process.env.DASHSCOPE_API_KEY,
  };
  const configuredServices = Object.values(aiServices).filter(Boolean).length;
  if (configuredServices === 0) warnings.push('No AI services configured');
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters');
  }

  return { isValid: errors.length === 0, errors, warnings, aiServices: configuredServices };
}

console.log('Validating environment configuration...');
const validationResult = validateEnvironment();

if (validationResult.errors.length > 0) {
  console.error('\n❌ Environment validation errors:');
  validationResult.errors.forEach(err => console.error('  - ' + err));
}
if (validationResult.warnings.length > 0) {
  console.warn('\n⚠️  Environment validation warnings:');
  validationResult.warnings.forEach(warn => console.warn('  - ' + warn));
}
if (validationResult.isValid) {
  console.log('✅ Environment validation passed');
  console.log('   AI services configured: ' + validationResult.aiServices + '/3');
}

if (!validationResult.isValid) {
  console.error('\n❌ Environment validation failed. Please fix the errors above.');
  process.exit(1);
}
```

### 提交信息
- **Commit**: 62a38b5
- **Message**: `fix: 修复server.js中TypeScript模块导入问题 - 内联环境验证避免生产环境MODULE_NOT_FOUND错误`
- **推送时间**: 约5分钟前

---

## 修复验证

### 本地验证
✅ `server.js` 语法正确
✅ 不再依赖TypeScript模块
✅ 环境验证逻辑完整保留

### Zeabur部署状态
🟡 等待自动部署完成
🟡 预计部署时间: 2-5分钟
🟡 最后检查: 仍显示502 (部署可能进行中)

### 验证步骤
1. 等待2-3分钟让Zeabur完成部署
2. 检查健康端点:
   ```bash
   curl https://aijiayuan.top/api/health
   ```
3. 预期输出:
   ```json
   {
     "status": "healthy",
     "checks": {
       "database": {"status": "healthy"},
       "aiServices": {"status": "healthy"},
       "environment": {"status": "healthy"}
     }
   }
   ```

---

## 预防措施

### 已采取的措施
1. ✅ 环境验证逻辑内联到 `server.js`
2. ✅ 移除对 TypeScript 文件的依赖

### 长期改进建议

#### 1. 使用编译后的JavaScript
创建 `src/lib/validate-env.js` (纯JS版本):
```javascript
// src/lib/validate-env.js
function validateEnvironment() {
  // ... 验证逻辑
}

module.exports = { validateEnvironment, printValidationResults };
```

然后在 `server.js` 中:
```javascript
const { validateEnvironment } = require('./src/lib/validate-env.js');
```

#### 2. 使用构建步骤编译
在 `package.json` 的 `build` 脚本中添加:
```json
{
  "scripts": {
    "prebuild": "tsc src/lib/validate-env.ts --outDir dist",
    "build": "next build"
  }
}
```

然后在 `server.js` 中:
```javascript
const { validateEnvironment } = require('./dist/lib/validate-env.js');
```

#### 3. 使用运行时TypeScript支持
安装 `ts-node`:
```bash
npm install --save ts-node
```

在 `server.js` 顶部:
```javascript
require('ts-node/register');
const { validateEnvironment } = require('./src/lib/validate-env.ts');
```

**注意**: 此方法增加启动时间和内存使用,不推荐用于生产环境。

---

## 相关问题

### 类似的潜在问题
检查 `server.js` 中其他TypeScript导入:

1. **L262, L365, L461**: AI Service Manager
   ```javascript
   AIServiceManager = require('./src/lib/ai-service-manager.cjs').default;
   ```
   ✅ 已使用 `.cjs` 版本作为主要导入
   ✅ 有 `.ts` fallback,但使用 `ts-node/register`

2. **L1060**: Session Cleanup
   ```javascript
   const { startSessionCleanupTask } = require('./src/lib/session-cleanup.ts');
   ```
   ⚠️ **潜在问题** - 也是TypeScript导入
   💡 **建议**: 同样内联或转为 `.js`

### 建议修复 session-cleanup 导入
```javascript
// server.js L1057-1066
try {
  // 尝试加载清理任务（TypeScript可能需要编译）
  let startSessionCleanupTask;
  try {
    startSessionCleanupTask = require('./src/lib/session-cleanup.js').startSessionCleanupTask;
  } catch (error) {
    // 如果.js不存在,尝试.ts (需要ts-node)
    require('ts-node/register');
    startSessionCleanupTask = require('./src/lib/session-cleanup.ts').startSessionCleanupTask;
  }
  startSessionCleanupTask();
  console.log('🧹 Session cleanup task started');
} catch (error) {
  console.warn('⚠️  Failed to start session cleanup task:', error.message);
  console.warn('   Session cleanup will not run automatically');
}
```

或者创建 `src/lib/session-cleanup.js` 版本。

---

## 时间线

| 时间 | 事件 |
|------|------|
| 09:28 | 发现502错误 - 所有端点不可用 |
| 09:30 | 分析Zeabur日志,发现 MODULE_NOT_FOUND 错误 |
| 09:35 | 识别根因: TypeScript模块导入问题 |
| 09:40 | 实施修复: 内联环境验证逻辑 |
| 09:42 | 提交并推送修复 (commit 62a38b5) |
| 09:44 | 等待Zeabur自动部署 |
| 09:46 | 第一次检查: 仍显示502 (部署中) |
| **待更新** | 部署完成,服务恢复 |

---

## 验证清单

部署完成后,执行以下检查:

- [ ] 健康检查API返回200
- [ ] 主页加载正常
- [ ] 竞价页面可访问
- [ ] 商业计划页面可访问
- [ ] WebSocket连接正常
- [ ] AI服务配置正确显示
- [ ] 运行完整功能测试 (`docs/PRODUCTION_TESTING_PLAN.md`)

---

## 经验教训

### 1. TypeScript在生产环境的挑战
- **问题**: TypeScript文件在Docker生产环境需要编译
- **教训**: `server.js` 应该只使用纯JavaScript,或确保TypeScript文件已编译

### 2. 环境差异导致的问题
- **问题**: 本地构建成功,生产失败
- **原因**: 本地有完整的TypeScript工具链,生产环境只有编译后的代码
- **教训**: 始终在类似生产的环境中测试(Docker容器)

### 3. 快速诊断的重要性
- **成功点**: Zeabur日志清晰显示了错误
- **改进点**: 应该有更好的本地→生产环境一致性检查

---

## 相关文档

- `docs/DEPLOYMENT_ISSUE_2025-10-04.md` - 问题诊断报告
- `docs/ZEABUR_DEPLOYMENT_GUIDE.md` - Zeabur部署调试指南
- `docs/ENVIRONMENT_CHECK_GUIDE.md` - 三层环境检查指南
- `scripts/production-check.sh` - 生产环境健康检查脚本

---

**文档状态**: 🟡 进行中 - 等待部署验证
**下次更新**: 部署完成后添加验证结果
**负责人**: Claude Code Assistant
