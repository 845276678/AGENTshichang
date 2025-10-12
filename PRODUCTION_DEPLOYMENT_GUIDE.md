# 生产环境部署指南 - DeepSeek MVP功能

## 📋 部署清单

### ✅ 已完成的准备工作

1. **代码准备**
   - ✅ DeepSeek API客户端已实现 (`src/lib/deepseek-client.ts`)
   - ✅ MVP生成API已更新支持DeepSeek (`src/app/api/business-plan/modules/mvp-prototype/route.ts`)
   - ✅ 完善的降级机制已实现
   - ✅ 生产构建已通过

2. **环境配置**
   - ✅ 生产环境`.env.production`已配置DeepSeek API Key
   - ✅ API配置验证通过：
     ```bash
     DEEPSEEK_API_KEY=sk-c29c2772520e43babffe15098d4ad33e
     DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
     DEEPSEEK_MODEL=deepseek-chat
     ```

3. **文档准备**
   - ✅ 集成文档 (`DEEPSEEK_MVP_INTEGRATION.md`)
   - ✅ 生产验证脚本 (`scripts/verify-production-deepseek.js`)
   - ✅ 部署指南 (本文档)

4. **代码版本控制**
   - ✅ 所有更改已提交到Git
   - ✅ 已推送到GitHub master分支
   - ✅ Commit: `feat: 集成DeepSeek API实现功能性MVP原型生成 (1de53bf)`

---

## 🚀 部署步骤

### 方式1: Zeabur自动部署（推荐）

Zeabur平台已配置自动部署，当代码推送到GitHub master分支时会自动触发部署。

#### 当前状态
- ✅ 代码已推送到GitHub
- ⏳ 等待Zeabur自动构建和部署

#### 监控部署进度
1. 访问Zeabur控制台：https://zeabur.com
2. 进入项目：AIagentshichang
3. 查看"部署"标签页
4. 等待构建完成（预计3-5分钟）

#### 部署日志关键信息
```
✓ Installing dependencies
✓ Building application
✓ DeepSeek client initialized
✓ MVP prototype API ready
✓ Deployment successful
```

---

### 方式2: 手动部署到Zeabur

如果需要手动触发部署：

```bash
# 确保在项目根目录
cd D:\ai\AIagentshichang

# 推送到GitHub（已完成）
git push origin master

# Zeabur会自动检测到更新并部署
# 如需手动触发，在Zeabur控制台点击"重新部署"
```

---

## 🔍 部署后验证

### 1. 运行自动验证脚本

```bash
node scripts/verify-production-deepseek.js
```

**预期输出：**
```
🔍 开始验证生产环境DeepSeek MVP功能...

1️⃣ 测试：健康检查
   ✅ 健康检查通过: { status: 'ok', ... }

2️⃣ 测试：DeepSeek生成功能性MVP
   📤 发送请求到: https://aijiayuan.top/api/business-plan/modules/mvp-prototype
   ✅ MVP生成成功!
   ⏱️  生成耗时: 12.34秒
   📏 HTML代码长度: 15234 字符
   🤖 可能使用了DeepSeek生成 (代码较长且复杂)

3️⃣ 测试：修改现有MVP
   ✅ 修改功能正常工作

✅ 验证完成！
```

### 2. 手动测试流程

#### 测试A: 生成新的功能性MVP

1. **访问模块化生成页面**
   ```
   https://aijiayuan.top/business-plan/modular
   ```

2. **输入测试创意**
   ```
   标题：在线教育平台
   描述：一个为K12学生提供在线学习的平台，包含视频课程、在线答疑、作业提交等功能
   ```

3. **选择MVP原型模块并生成**

4. **验证结果**
   - ✅ 生成的HTML包含真实的交互组件（不仅仅是文字描述）
   - ✅ 有完整的JavaScript逻辑代码
   - ✅ 可以在浏览器中实际交互
   - ✅ 生成时间在10-20秒左右（DeepSeek API调用）

#### 测试B: MVP实时修改

1. **访问MVP工作台**
   ```
   https://aijiayuan.top/business-plan/mvp-generator?ideaTitle=测试&ideaDescription=测试描述
   ```

2. **生成初始MVP后，进行对话式修改**
   ```
   用户: 添加一个学习进度统计模块
   系统: ✅ 正在添加学习进度统计模块...
   ```

3. **验证修改**
   - ✅ 右侧预览实时更新
   - ✅ 添加了新的交互组件
   - ✅ 功能可以正常使用

#### 测试C: 设计调整

1. **在工作台对话**
   ```
   用户: 把整体颜色改成绿色系
   系统: ✅ 正在调整设计...
   ```

2. **验证结果**
   - ✅ 颜色已更改为绿色
   - ✅ 功能保持不变
   - ✅ 布局结构未改变

---

## 📊 监控和日志

### 查看生产日志

#### Zeabur平台日志
1. 进入Zeabur项目控制台
2. 点击"日志"标签
3. 查找关键日志：
   ```
   🛠️ 开始生成MVP原型
   ✨ 生成新的功能性MVP原型
   🚀 调用DeepSeek API生成功能性MVP原型
   ✅ DeepSeek API成功生成功能性MVP
   ```

#### API调用日志
生产环境的API调用日志包含：
- DeepSeek API调用状态
- 生成耗时
- HTML代码长度
- 降级情况（如果发生）

**正常日志示例：**
```json
{
  "timestamp": "2025-10-12T08:00:00Z",
  "level": "info",
  "message": "MVP原型生成完成",
  "metadata": {
    "htmlSize": 15234,
    "hasModification": false,
    "usedDeepSeek": true,
    "duration": "12.5s"
  }
}
```

**降级日志示例：**
```json
{
  "timestamp": "2025-10-12T08:00:00Z",
  "level": "warn",
  "message": "DeepSeek生成失败，使用降级模板",
  "error": "API timeout"
}
```

---

## ⚠️ 故障排查

### 问题1: DeepSeek API调用失败

**症状：**
- 生成时间很短（<2秒）
- 生成的HTML代码很短（<5000字符）
- 只有静态模板内容

**排查步骤：**
1. 检查Zeabur环境变量
   ```
   DEEPSEEK_API_KEY是否正确
   DEEPSEEK_BASE_URL是否正确
   ```

2. 检查DeepSeek API额度
   - 访问 https://platform.deepseek.com/usage
   - 确认还有可用额度

3. 查看生产日志
   ```
   搜索 "DeepSeek" 关键词
   查找错误信息
   ```

**解决方案：**
- 如果API Key失效：在Zeabur控制台更新环境变量
- 如果额度用完：充值或使用降级模板（自动）
- 如果网络问题：Zeabur会自动重试

### 问题2: 生成的内容不够功能性

**症状：**
- 虽然调用了DeepSeek，但生成的仍是简单静态页面

**原因：**
- Prompt可能需要优化
- 创意描述不够详细

**解决方案：**
1. 优化用户输入引导
2. 在`src/lib/deepseek-client.ts`中调整Prompt
3. 增加示例来引导更好的生成

### 问题3: 修改功能不生效

**症状：**
- 用户在工作台进行修改，但预览没有更新

**排查：**
1. 检查浏览器控制台错误
2. 查看API返回的HTML长度
3. 确认iframe是否重新渲染

**解决方案：**
- 清除浏览器缓存
- 检查`key={currentVersion.id}`是否正确设置

---

## 📈 性能监控

### 关键指标

1. **API调用成功率**
   - 目标：>95%
   - 监控：Zeabur日志 + 自定义监控

2. **生成耗时**
   - 新建MVP：10-20秒
   - 修改MVP：5-10秒
   - 设计调整：5-8秒

3. **降级率**
   - 目标：<5%
   - 原因：API失败、超时、配置错误

4. **用户满意度**
   - 通过用户反馈评分
   - 重新生成率（如果高，说明质量不满意）

---

## 🔄 回滚计划

如果生产环境出现严重问题，可以回滚到之前的版本：

### Git回滚
```bash
# 查看最近的提交
git log --oneline -5

# 回滚到DeepSeek集成之前的版本
git revert 1de53bf

# 推送回滚
git push origin master
```

### Zeabur回滚
1. 进入Zeabur控制台
2. 点击"部署历史"
3. 选择之前的稳定版本
4. 点击"回滚到此版本"

---

## 📝 后续优化计划

1. **短期（1-2周）**
   - [ ] 收集用户反馈
   - [ ] 优化Prompt提升生成质量
   - [ ] 添加生成质量评分机制

2. **中期（1个月）**
   - [ ] 实现流式输出（实时显示生成进度）
   - [ ] 添加智能缓存减少API调用
   - [ ] 支持更多功能类型的识别

3. **长期（3个月）**
   - [ ] 支持多种AI模型（智谱、通义千问）
   - [ ] 实现A/B测试比较不同模型效果
   - [ ] 自动代码优化和压缩

---

## 🎯 成功标准

部署被认为成功，当：

✅ **功能性**
- DeepSeek API调用成功率 >95%
- 生成的MVP包含真实交互组件
- 修改和设计调整功能正常

✅ **性能**
- 生成耗时 <20秒
- 页面加载时间 <3秒
- 降级率 <5%

✅ **稳定性**
- 无严重错误
- 降级机制正常工作
- 日志完整可追溯

✅ **用户体验**
- 用户反馈评分 >4.0/5.0
- 重新生成率 <20%
- 无用户投诉

---

## 📞 支持联系

如遇问题，请：

1. **查看文档**
   - `DEEPSEEK_MVP_INTEGRATION.md` - 技术实现细节
   - 本文档 - 部署和验证指南

2. **检查日志**
   - Zeabur平台日志
   - 浏览器控制台
   - 网络请求

3. **联系团队**
   - GitHub Issues: https://github.com/845276678/AGENTshichang/issues
   - 邮件：技术支持团队

---

**部署时间**：2025-10-12
**部署人员**：AI开发团队
**版本**：v1.0.0 with DeepSeek Integration
**状态**：✅ 准备就绪，等待自动部署
