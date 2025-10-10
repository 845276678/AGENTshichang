# 创意成熟度分级处理方案

> **版本**: v2.0
> **日期**: 2025-01-09
> **状态**: 待确认

---

## 📌 核心理念

**不是按"创意好坏"分级，而是按"创意成熟度"分级**

- **低分** = 想法阶段（需要聚焦和验证）
- **中分** = 方向阶段（需要细化和补充）
- **高分** = 方案阶段（需要验证真实性）

---

## 🎯 设计目标

### 问题1：避免方案错配
- **担心**：用户有一定市场前景或已验证需求，但我们给的方案不够准确
- **解决**：高分创意增加数据验证环节，确保基于真实信息生成方案

### 问题2：避免过度引导
- **担心**：用户想法不完善时，给太详细的方案，导致后续验证时发现不符合市场需求
- **解决**：低分创意只给聚焦引导，不生成完整计划书，避免用户基于错误方向投入资源

### 问题3：合理评估标准
- **现实**：用户提交时一般只有几句话，不可能包含完整商业计划书要素
- **解决**：评分基于"成熟度"而非"完整度"，关注关键要素是否明确

### 问题4：数据真实性
- **担心**：高分创意可能包含未验证的数据（如"市场规模100亿"但无依据）
- **解决**：友好地引导用户提供数据来源，AI检查合理性并给出风险提示

---

## 📊 一、分级标准（基于成熟度）

### 1.1 评估维度

| 维度 | 评估问题 | 低分特征 | 中分特征 | 高分特征 |
|------|---------|---------|---------|---------|
| **🎯 目标用户** | 是否明确具体？ | ❌ 模糊/泛化<br>"所有人" | ⚠️ 有方向但不具体<br>"职场人士" | ✅ 清晰画像+痛点<br>"25-35岁互联网运营" |
| **💡 核心价值** | 解决什么问题？ | ❌ 不清楚/太宽泛<br>"提升效率" | ⚠️ 有但未聚焦<br>"时间管理" | ✅ 聚焦+差异化<br>"自由职业者时薪优化" |
| **💰 商业模式** | 怎么赚钱？ | ❌ 没想过/不知道<br>无提及 | ⚠️ 有想法但不完整<br>"可能收费" | ✅ 清晰路径<br>"订阅制99元/月" |
| **📈 可信度** | 有数据/案例支撑吗？ | ❌ 纯想象<br>"应该有需求" | ⚠️ 部分假设<br>"参考竞品" | ✅ 有数据/已验证<br>"已有200付费用户" |

### 1.2 分级逻辑

```
低分创意（1-4分）：
✓ 4个维度中有 ≥3个 是 ❌
✓ 特征：纯想法，缺乏基本要素
✓ 典型：只有一个概念，没想清楚细节

中分创意（5-7分）：
✓ 4个维度中有 2-3个 是 ⚠️，其余是✅或❌
✓ 特征：方向清晰，但缺细节或验证
✓ 典型：基本框架有了，需要补充和优化

高分创意（8-10分）：
✓ 4个维度中有 ≥3个 是 ✅
✓ 特征：方案较完整，有数据/案例
✓ 典型：已有初步验证，准备扩展
```

### 1.3 评分依据来源

**从AI专家讨论中提取**：

```
目标用户是否明确？
├─ 专家提问："目标用户是谁？" → 得分低
├─ 专家提问："为什么选这个人群？" → 得分中
└─ 专家评价："人群定位精准" → 得分高

核心价值是否清晰？
├─ 专家提问："和XX产品有什么区别？" → 得分低
├─ 专家评价："方向可以，但需要差异化" → 得分中
└─ 专家评价："独特价值明显" → 得分高

商业模式是否明确？
├─ 专家提问："怎么赚钱？" → 得分低
├─ 专家评价："模式初步，需细化" → 得分中
└─ 专家评价："订阅制是标准打法" → 得分高

可信度如何？
├─ 创意描述无数据，专家说"需要验证" → 得分低
├─ 创意描述有参考，专家说"假设合理" → 得分中
└─ 创意描述有真实数据 → 得分高 + 触发验证
```

---

## 🔴 二、低分创意（1-4分）：聚焦引导型

### 2.1 核心目标

**帮用户把"大而空"的想法聚焦到"小而实"的方向**

### 2.2 典型案例

**❌ 用户输入**：
```
"做一个日程计划助手"
```

**问题诊断**：
- 目标用户不明确（学生？职场？宝妈？创业者？）
- 核心价值不清楚（和市面上几十个产品有啥区别？）
- 商业模式缺失（免费？订阅？）
- 无验证数据

**评分**：3.5分（低分）

### 2.3 生成内容结构

#### Part 1: 问题诊断（温和但直接）

```markdown
### 📋 您的创意诊断报告

您的创意方向有潜力，但目前还需要进一步聚焦。

我们的AI专家团队发现以下关键问题：

🎯 **目标用户不够清晰**
> 老王："咱得先想明白，这日程助手是给谁用的？学生党、职场人、
> 自由职业者，他们的需求可完全不一样啊。学生要排课表，
> 职场人要开会提醒，自由职业者要追踪项目时间，你想做哪个？"

💡 **核心价值待明确**
> 艾克斯："市面上已经有Notion、滴答清单、微软To Do、Google Calendar，
> 你的产品和它们有什么本质区别？用户为什么要换到你的产品？"

💰 **商业模式未定义**
> 李博："免费用户怎么转付费？订阅制还是功能收费？不想清楚这个，
> 后面获客成本收不回来。"
```

#### Part 2: 聚焦引导（3步法）

```markdown
### 🎯 聚焦三步法

为了帮助您将创意落地，建议按以下步骤聚焦：

---

#### 📍 第一步：明确目标用户（选择一个细分人群）

请从以下场景中选择最匹配您创意的 **1-2个**：

□ **自由职业者**（设计师、程序员、咨询师）
   痛点：项目多、时间碎片化、需要追踪时薪

□ **创业团队**（5-20人小团队）
   痛点：需要协作、同步进度、避免会议冲突

□ **知识工作者**（研究员、分析师、写作者）
   痛点：需要深度工作时间管理、避免打扰

□ **学生群体**（大学生、考研党）
   痛点：课程多、作业deadline管理

□ **其他**：___________

💡 **建议**：先聚焦一个群体做深，而不是做大而全的产品。
Notion一开始也只是做"程序员的笔记工具"。

---

#### 📍 第二步：找到核心差异化价值

**您的日程助手与现有产品最大的不同是什么？**

参考示例：
- ✅ "专为自由职业者设计，自动识别高价值任务，帮助优化时薪"
- ✅ "团队协作场景下，AI自动协调成员时间，减少会议冲突"
- ✅ "结合番茄工作法+AI教练，提升专注力"
- ❌ "界面更好看"（不够差异化）
- ❌ "功能更多"（反而增加复杂度）

**您的核心价值**（用一句话描述）：

> ___________________________________________

---

#### 📍 第三步：验证需求真实性

在投入开发之前，请完成以下小任务（建议1周内完成）：

**任务清单**：

□ **用户访谈**（最重要）
   访谈 5-10位 目标用户，确认他们确实有这个痛点
   问题模板：
   - 您现在用什么工具管理日程？
   - 最不满意的地方是什么？
   - 如果有___功能，您会付费吗？付多少？

□ **竞品分析**
   找到 3个 类似产品，分析它们的优缺点
   模板：| 产品 | 优点 | 缺点 | 定价 |

□ **MVP定义**
   用一句话描述你的最小可行产品（MVP）：
   "我的产品帮助 [谁]，通过 [什么方式]，解决 [什么问题]"

**完成后，请重新提交创意，我们将为您生成更具针对性的商业计划。**
```

#### Part 3: 参考案例（激励）

```markdown
### 💼 类似成功案例

**Notion**
- 最初想法："做一个笔记工具"（很宽泛）
- 聚焦后："知识工作者的 All-in-one 工作区"
- 关键：先服务程序员群体，再扩展到设计师、产品经理

**Forest（专注森林）**
- 最初想法："帮助人们专注"（太空）
- 聚焦后："学生群体的番茄工作法+游戏化激励"
- 关键：一个核心功能做到极致

**建议**：先做一个极简版MVP，只保留1-2个核心功能，快速验证需求。
```

### 2.4 交付物

- ✅ 聚焦引导文档（PDF/Markdown，5-8页）
- ✅ 用户访谈问题清单（10个问题）
- ✅ 竞品分析模板（Excel/表格）
- ✅ MVP画布（一页纸模板）
- ❌ **不生成完整商业计划书**（避免基于不成熟想法投入资源）

---

## 🟡 三、中分创意（5-7分）：补充优化型

### 3.1 核心目标

**识别缺失环节，引导用户补充，生成可执行的初步方案**

### 3.2 典型案例

**⚠️ 用户输入**：
```
"做一个面向自由职业者的时间管理工具，帮助他们追踪项目时间，
自动生成时薪报告，采用订阅制，99元/月"
```

**分析**：
- 目标用户明确（自由职业者）✅
- 核心价值清晰（时薪报告）✅
- 商业模式初步（订阅制）✅
- 市场竞争未分析 ⚠️
- 获客策略缺失 ⚠️
- 定价依据不明 ⚠️

**评分**：6.5分（中分）

### 3.3 生成内容结构

#### Part 1: 创意亮点总结

```markdown
### ✨ 您的创意具备良好的基础

AI专家团队认可的优势：

✅ **目标人群聚焦**
> 李博："自由职业者是高付费意愿群体，这个定位很好。"

✅ **核心价值明确**
> 老王："时薪可视化是真实痛点，我认识的设计师都想知道自己时薪多少。"

✅ **商业模式清晰**
> 艾克斯："订阅制是SaaS的标准打法，技术上也容易实现。"

**初步可行性评分**：⭐⭐⭐⭐⚝ (7/10)
```

#### Part 2: 关键缺失环节（带具体问题）

```markdown
### 🔍 需要补充的关键信息

为了生成更精准的商业计划，我们需要了解以下信息：

---

#### 【市场与竞争】

❓ **目标市场有多大？**

建议调研：
- 国内自由职业者数量（设计师、程序员、咨询师等）
- 其中有多少人会为时间管理工具付费？（预估渗透率）

参考数据：
- 艾瑞咨询：2024年中国自由职业者约2000万人
- 假设10%有工具付费意愿 = 200万潜在用户

**您的市场规模估算**：___________

---

❓ **竞品情况如何？**

已知竞品：
- **Toggl**：国际主流，价格 $9-20/月
- **RescueTime**：自动追踪，价格 $12/月
- **Clockify**：免费+付费增值
- **国内**：滴答清单、Timetrack 等

**您的产品相比它们，独特优势是什么？**

□ AI分析时薪优化建议（智能化）
□ 中文体验更好（本地化）
□ 价格更亲民（成本优势）
□ 其他：___________

---

#### 【获客与增长】

❓ **如何找到第一批100个用户？**

建议渠道：
□ 小红书（设计师、自由职业者聚集）
□ 即刻（互联网人群）
□ V2EX（程序员社区）
□ 站酷/UI中国（设计师社区）
□ 其他：___________

需要准备什么内容？
□ 教程（如何提升时薪）
□ 案例（真实用户数据）
□ 免费试用14天

**您的冷启动策略**：___________

---

❓ **用户留存策略？**

订阅制最大挑战是续费率，如何让用户持续使用？

建议：
- 每周发送"时薪分析报告"（邮件提醒）
- 设置"时薪目标"并追踪进度（游戏化）
- 提供"行业时薪对比"（社交激励）

**您的留存策略**：___________

---

#### 【产品与定价】

❓ **MVP包含哪些功能？**

请勾选您的MVP核心功能（建议≤5个）：

□ 时间追踪（必须）
□ 时薪报告（必须）
□ 项目管理
□ AI分析建议
□ 团队协作
□ 发票生成
□ 其他：___________

---

❓ **99元/月定价合理吗？**

竞品价格参考：
- Toggl: $9-20/月（约65-140元）
- Clockify: 免费 + $9.99/月专业版
- 国内工具：一般59-199元/月

建议：
- 考虑分级定价（59元基础版 / 99元专业版 / 199元团队版）
- 提供年付优惠（899元/年，相当于75元/月）

**您的定价策略**：___________
```

#### Part 3: 优化建议（可选方向）

```markdown
### 💡 三个可行的优化方向

根据您的创意，我们建议考虑以下优化方向（可选其一深入）：

---

#### 方向A：聚焦"设计师"细分市场 🎨

**优势**：
- 设计师对工具美学要求高，愿意为好工具付费
- 群体集中，容易触达（站酷、UI中国等）

**差异化**：
- 支持设计软件时间追踪（Figma/Sketch/PS插件）
- 自动识别"创作时间"vs"沟通时间"
- 提供"设计时薪行业报告"

**冷启动**：
- 在UI中国、站酷等设计社区推广
- 制作"设计师时薪提升指南"内容

**预估**：设计师群体约100万，渗透率5% = 5万潜在用户

---

#### 方向B：强化"AI时薪优化"功能 🤖

**优势**：
- 提供智能建议，不只是记录，而是提升效率
- 技术门槛高，竞品难模仿

**差异化**：
- AI识别"高价值任务" vs "低价值任务"
- 建议优化时间分配（"减少低价值任务30%，时薪可提升50%"）
- 个性化效率报告

**技术要求**：
- 需要AI/ML能力
- 需要足够数据训练模型

**预估**：溢价空间大，可定价129-199元/月

---

#### 方向C：To B 企业服务 🏢

**优势**：
- 企业付费能力强，客单价可提升到999-2999元/年
- 续费率更稳定（企业决策周期长）

**目标客户**：
- 设计公司、咨询公司（雇佣自由职业者的企业）
- 远程团队（需要追踪成员工时）

**价值**：
- 帮助企业管理外包人员工时
- 自动生成项目成本报告
- 工时数据作为结算依据

**预估**：单客户价值高，但销售周期长

---

**建议**：选择一个方向深入验证，而不是三个都做。
```

#### Part 4: 初步商业计划（基于假设）

```markdown
### 📋 初步商业计划框架

⚠️ **重要提示**：以下数据基于行业经验估算，实际需要通过MVP验证。

---

#### 【MVP定义】（3个月）

**核心功能**：
- 时间追踪（Web端 + Chrome插件）
- 项目管理（简化版）
- 时薪报告（周报 + 月报）

**技术栈**：
- 前端：React + TailwindCSS
- 后端：Node.js + PostgreSQL
- Chrome插件：Manifest V3

**开发预算**：
- 自己开发：3-6个月（时间成本）
- 外包开发：15-30万

---

#### 【冷启动】（1-3个月）

**目标**：100个种子用户

**策略**：
1. 内容营销（免费）
   - 发布"自由职业者时间管理指南"
   - 分享"如何计算真实时薪"教程
   - 目标：5-10篇高质量内容

2. 社区运营（低成本）
   - 在小红书、即刻等平台运营
   - 参与相关话题讨论
   - 目标：积累500-1000关注

3. 小额广告测试（可选）
   - 预算：5000-10000元
   - 渠道：小红书信息流
   - 目标：测试CAC（获客成本）

**预算**：5万（内容制作 + 小额广告）

---

#### 【增长策略】（3-12个月）

**转化漏斗**：
- 免费试用14天
- 转化率预估：10-15%（行业平均）
- 推荐奖励：推荐成功送1个月免费

**预期增长**：
| 时间 | 注册用户 | 付费用户 | 月收入 | CAC | LTV |
|------|---------|---------|--------|-----|-----|
| 第3月 | 500 | 50 | 4,950元 | 100元 | 1,188元 |
| 第6月 | 2,000 | 250 | 24,750元 | 80元 | 1,188元 |
| 第12月 | 8,000 | 1,000 | 99,000元 | 60元 | 1,188元 |

**关键指标**：
- CAC（获客成本）：< 100元
- LTV（用户生命周期价值）：99元/月 × 12月 = 1,188元
- LTV/CAC > 3:1（健康比例）

---

#### 【财务预测】（第一年）

**收入**：
- 付费用户：1,000人
- ARPU：99元/月
- 年收入：1,000 × 99 × 12 = 118.8万

**成本**：
- 研发：30万（团队2人）
- 运营：20万（服务器、客服、营销）
- 总成本：50万

**利润**：118.8万 - 50万 = 68.8万

⚠️ **风险提示**：
- 转化率可能低于预期（10% → 5%）
- CAC可能高于预期（100元 → 200元）
- 留存率是关键（月留存需>70%）

建议：先做3个月MVP，验证转化率和留存率，再决定是否扩大投入。
```

### 3.4 交付物

- ✅ 完整商业计划书（15-25页）
- ✅ 补充信息问卷（10-15个问题）
- ✅ 优化方向建议（2-3个可选方向）
- ✅ 简化版财务模型（标注"基于假设"）
- ✅ 竞品分析对比表
- 🔄 **支持用户补充信息后重新生成**

---

## 🟢 四、高分创意（8-10分）：验证深化型

### 4.1 核心目标

**识别不合理数据，引导用户提供真实依据，生成可信的执行方案**

### 4.2 典型案例

**✅ 用户输入**：
```
"做一个面向设计师的时间管理工具，已有200个付费测试用户，
月活留存65%，定价99元/月，预计第一年GMV 300万。
目标融资500万，占股15%，估值3000万。"
```

**分析**：
- 目标用户明确 ✅
- 核心价值清晰 ✅
- 商业模式完整 ✅
- 有真实数据支撑 ✅
- **需要验证**：200用户来源？65%留存真实性？估值依据？

**评分**：8.5分（高分）

### 4.3 处理流程

#### 阶段一：友好的数据验证 🔍

```markdown
### 🎉 恭喜！您的创意已经具备较高的成熟度

AI专家团队给予高度评价：

⭐ **老王**："有200个付费用户，这就是真金白银的验证啊！
比那些只会画饼的强多了。"

⭐ **李博**："65%月活留存率如果属实，这是非常健康的指标。
SaaS行业能做到50%就算优秀了。"

⭐ **艾克斯**："产品已经跑起来了，接下来是规模化的问题。
技术架构需要考虑扩展性。"

**综合评分**：⭐⭐⭐⭐⭐⭐⭐⭐⚝ (8.5/10)

---

### 📊 为了生成更精准的商业计划，我们需要了解一些细节

（以下信息将帮助我们验证数据合理性，并给出更有针对性的建议）

**预计填写时间**：10-15分钟
**所有问题均可选填**，但完整填写将获得更精准的方案

---

#### 【用户数据验证】

##### Q1. 200位付费用户是如何获取的？

□ 自然增长（口碑传播/SEO/社交媒体）
□ 付费广告（CAC成本：___元/人）
□ 社群运营（来自哪些社群：_______）
□ 朋友/内测用户（占比约：___%）
□ 其他：___________

💡 **为什么要问这个？**
了解获客渠道，帮助评估规模化增长的可行性。
如果主要靠朋友圈，可能扩张困难；如果是自然增长，说明产品粘性好。

---

##### Q2. 65%月活留存率的统计周期？

□ 第1个月留存（注册后1个月还在用）
□ 第3个月留存（注册后3个月还在用）
□ 第6个月留存（注册后6个月还在用）
□ 还没统计到，这是预估的

💡 **为什么要问这个？**
不同周期的留存意义完全不同：
- 第1个月65%：正常水平
- 第3个月65%：非常优秀 ⭐⭐⭐
- 第6个月65%：行业顶尖 ⭐⭐⭐⭐⭐

这直接影响LTV（用户生命周期价值）的计算。

---

##### Q3. 用户画像数据（可选，帮助精准定位）

**主要职业分布**：
- 设计师占 ___%
- 程序员占 ___%
- 其他自由职业者占 ___%

**付费转化率**：
- 免费试用用户数：___人
- 转化为付费的比例：___%

**用户反馈**：
- 用户最喜欢的3个功能是？
  1. ___________
  2. ___________
  3. ___________

---

#### 【财务数据验证】

##### Q4. 300万GMV的计算依据？

请简单说明您的预测逻辑：

**示例**：
现有200用户 → 第一年目标2500用户（12倍增长）
2500用户 × 99元/月 × 12月 = 297万

**您的计算**：
- 现有用户：200人
- 第一年目标用户：___人（___倍增长）
- 客单价：___元/月
- 预计GMV：___万

**获客预算**：
- 预计CAC（单个获客成本）：___元
- 需要新增用户：___人
- 总获客预算：___ × ___ = ___万

---

##### Q5. 成本结构（可选，但建议提供）

**研发成本**：___万/年
- 团队规模：___人
- 人均成本：___万/年

**运营成本**：___万/年
- 服务器/云服务：___万
- 客服/支持：___万
- 营销推广：___万

**毛利率预估**：___%

---

#### 【融资规划验证】

##### Q6. 3000万估值是如何计算的？

□ **PS倍数法**（收入倍数）
  预计年收入 300万 × ___ 倍 = 3000万
  （SaaS行业一般5-15倍）

□ **可比公司法**
  参考___公司的估值（他们是___万估值，我们规模相当）

□ **成本加成法**
  投入成本 + 预期回报

□ **投资人给的建议估值**

□ **其他方法**：___________

💡 **李博的建议**：
早期SaaS一般是ARR（年经常性收入）的5-10倍估值。
您的ARR = 200用户 × 99元/月 × 12月 = 23.76万
合理估值区间：120万 - 240万（种子轮）
如果有高增长潜力，可以给到500万 - 1000万（天使轮）

---

##### Q7. 500万融资的用途拆解？

请说明资金使用计划：

- 产品开发：___万（___ 功能迭代/技术升级）
- 市场推广：___万（___ 渠道/广告预算）
- 团队扩张：___万（招聘___人）
- 运营储备：___万（___个月运营成本）

**总计**：___万

---

#### 【团队与资源】（可选）

##### Q8. 核心团队背景？

创始人/核心成员的相关经验：
- □ 有SaaS创业经验
- □ 有相关行业背景（设计/时间管理）
- □ 有技术开发能力
- □ 有市场运营经验
- □ 首次创业

##### Q9. 是否已有技术原型或Demo？

□ 已有完整产品，正在运营
□ 有MVP，功能基本完整
□ 有原型/Demo，还在开发中
□ 只有想法，还没开始开发

---

### 🎁 完成验证后，您将获得：

✅ **投资级商业计划书**（30-50页）
   - 基于真实数据的市场分析
   - 详细的产品规划和技术架构
   - 可信的财务模型（3年预测）

✅ **详细财务模型**（Excel文件）
   - 月度/季度收入预测
   - 成本结构拆解
   - 现金流分析
   - 敏感性分析（不同增长率下的表现）

✅ **融资路演PPT**（15-20页）
   - 问题-解决方案-市场机会
   - 产品演示和用户案例
   - 商业模式和收入模型
   - 团队介绍和融资规划

✅ **风险评估与应对**
   - 识别数据疑点（如果有）
   - 市场/技术/运营风险
   - 每项风险的应对预案

✅ **90天行动计划**
   - 具体可执行的任务清单
   - 关键里程碑和验证指标
   - 资源调配建议

---

**⏱️ 验证问卷可跳过，但我们强烈建议完整填写**

原因：
1. 基于真实数据的计划书更有说服力（投资人/合作伙伴）
2. 帮助您自己验证假设的合理性
3. 识别潜在风险，避免后期踩坑
```

#### 阶段二：基于验证生成深度方案 📋

**根据用户填写的数据，AI会：**

##### 1. 数据合理性检查

```markdown
### 📊 数据验证结果

✅ **合理的数据**：
- 200付费用户，主要来自社群运营 + 口碑传播（健康来源）
- 第3个月留存65%（行业优秀水平）
- CAC 150元，LTV 1188元，LTV/CAC = 7.9（非常健康）

⚠️ **需要注意的点**：
- 预计第一年增长12倍（从200 → 2500用户）
  - 这需要___万的获客预算（2300用户 × 150元CAC）
  - 当前融资计划中市场推广预算为___万
  - **建议**：调整为现实的6-8倍增长，或增加市场预算

- 3000万估值（ARR的126倍）偏高
  - 行业合理倍数：5-10倍（成熟期）或10-15倍（高增长期）
  - 您的ARR：23.76万
  - **建议估值区间**：120万 - 350万（种子/天使轮）

💡 **李博的建议**：
"估值不是越高越好，合理的估值更容易融资成功，也给后续轮次留出空间。
建议先融200-300万，占股20-25%，估值800万-1200万。"
```

##### 2. 生成可信的财务模型

```markdown
### 💰 财务模型（基于真实数据）

#### 收入预测（保守/中性/乐观三种情景）

**中性情景**（最可能）：

| 月份 | 新增用户 | 累计用户 | 留存率 | 活跃付费用户 | 月收入 | 累计收入 |
|------|---------|---------|--------|-------------|--------|---------|
| M1 | 50 | 250 | 65% | 163 | 16,137元 | 16,137元 |
| M3 | 80 | 410 | 65% | 267 | 26,433元 | 68,703元 |
| M6 | 120 | 730 | 65% | 475 | 47,025元 | 182,358元 |
| M12 | 150 | 1,450 | 65% | 943 | 93,357元 | 658,791元 |

**关键假设**：
- ✅ 第3个月留存65%（基于您的真实数据）
- ⚠️ 每月新增用户递增（需要持续获客投入）
- ⚠️ CAC保持在150元（规模化后可能降低到100元）

**年度总结**：
- 第一年收入：65.88万（而非300万）
- 需要调整预期或增加获客投入

---

#### 成本结构（基于您的数据）

**固定成本**：
- 研发团队：2人 × 15万/年 = 30万
- 运营成本：服务器5万 + 客服5万 = 10万
- 小计：40万/年

**变动成本**：
- 获客成本：1250新用户 × 150元 = 18.75万
- 小计：18.75万/年

**总成本**：58.75万/年

**利润**：65.88万 - 58.75万 = 7.13万（微利）

⚠️ **风险提示**：
- 第一年处于投入期，利润微薄
- 建议保留6-12个月现金储备
- 如果留存率下降到50%，将会亏损

---

#### 敏感性分析

| 情景 | 留存率 | CAC | 年收入 | 年成本 | 利润 |
|------|--------|-----|--------|--------|------|
| 乐观 | 70% | 120元 | 81万 | 55万 | 26万 ✅ |
| 中性 | 65% | 150元 | 66万 | 59万 | 7万 ⚝ |
| 悲观 | 50% | 200元 | 46万 | 65万 | -19万 ❌ |

**建议**：
- 持续优化留存率（这是SaaS的生命线）
- 控制CAC（通过内容营销降低获客成本）
- 前6个月重点验证这两个指标
```

##### 3. 风险识别与应对

```markdown
### ⚠️ 风险评估与应对方案

#### 风险1：增长预期过于乐观

**风险描述**：
预计第一年增长12倍，但获客预算可能不足以支撑这个增长速度。

**影响**：
- 实际收入可能只有预期的50%（150万 vs 300万）
- 影响后续融资和团队信心

**应对方案**：
1. 调整增长预期为6-8倍（更现实）
2. 增加市场推广预算到50万（占融资额的10%）
3. 建立每月增长监控机制，及时调整策略

---

#### 风险2：留存率数据周期较短

**风险描述**：
65%留存率是"第1个月"数据，第3、6个月留存可能下降。

**影响**：
- 如果第3个月留存降到50%，LTV降低，财务模型失效
- 获客成本回收周期延长

**应对方案**：
1. 持续追踪长期留存（3个月、6个月）
2. 识别流失原因，优化产品体验
3. 建立用户分层，重点维护高价值用户

**建议动作**：
- 每周发送"时薪分析报告"（激活用户）
- 设置"时薪目标"并追踪进度（增加粘性）
- 建立用户社群，增强归属感

---

#### 风险3：估值偏高可能影响融资

**风险描述**：
3000万估值是ARR的126倍，远高于行业标准（5-15倍）。

**影响**：
- 投资人可能觉得估值不合理，放弃投资
- 即使融资成功,也会稀释过多股权

**应对方案**：
1. 调整估值到800万-1200万（更合理）
2. 或者提供更有说服力的增长数据
3. 强调团队、技术壁垒等非财务因素

**李博的建议**：
"合理估值更容易快速融资，也给下一轮留出空间。
不要为了少稀释5%股权，错过最佳融资窗口期。"
```

##### 4. 融资建议

```markdown
### 💼 融资建议（基于真实数据）

#### 建议融资方案

**融资金额**：200-300万（而非500万）

**理由**：
1. 当前阶段是验证阶段（200用户 → 2000用户）
2. 200-300万足够支撑12-18个月
3. 下一轮可以用更好的数据融更多钱

**建议估值**：800万-1200万

**出让股权**：20-30%

**资金用途**：
- 产品优化：60万（增加AI功能、团队协作）
- 市场推广：100万（目标获取1500新用户）
- 团队扩张：40万（招聘1-2人）
- 运营储备：50万（12个月buffer）

---

#### 投资人关注的关键指标

投资人会重点看：

1. **留存率**（最重要）
   - 您的：65%（第1个月）
   - 建议：持续追踪到第6个月
   - 目标：第3个月 >50%，第6个月 >40%

2. **LTV/CAC 比值**
   - 您的：1188元 / 150元 = 7.9（优秀）
   - 健康标准：>3
   - 目标：保持在5-10之间

3. **增长速度**
   - 您的：月增长20-30%
   - 建议：保持这个速度6个月，证明可持续性

4. **NPS（净推荐值）**
   - 建议：调研用户NPS
   - 目标：>50（优秀）

---

#### 需要补充的融资材料

□ **3-6个月长期留存数据**（最重要）
□ **用户访谈视频/案例**（2-3个深度案例）
□ **产品Demo**（5分钟演示视频）
□ **竞品对比分析**（功能/价格/用户反馈）
□ **团队背景介绍**（强调相关经验）
□ **未来12个月路线图**（产品/市场计划）

💡 **建议时间线**：
- 第1-2个月：补充材料，优化留存
- 第3个月：开始接触投资人
- 第4-5个月：谈判和尽调
- 第6个月：完成融资
```

### 4.4 交付物

- ✅ 投资级商业计划书（30-50页，含真实数据标注）
- ✅ 详细财务模型（Excel，3年月度预测 + 敏感性分析）
- ✅ 融资路演PPT（15-20页）
- ✅ 风险评估矩阵（识别数据疑点 + 应对方案）
- ✅ 数据优化建议（如何完善指标追踪）
- ✅ 融资材料清单（需要补充的文档）
- ✅ 90天行动计划（具体任务 + 验证指标）

---

## 📈 五、评分时机与流程

### 5.1 现有流程

```
用户提交创意
    ↓
AI专家竞价讨论
    ↓
生成商业计划书
```

### 5.2 新流程（增加评分环节）

```
用户提交创意
    ↓
AI专家竞价 + 讨论
（5位专家提问、评价、出价）
    ↓
【新增】智能评分模块
    ├─ 分析专家讨论内容
    ├─ 提取关键信息（用户是否明确？价值是否清晰？模式是否完整？是否有数据？）
    ├─ 计算4个维度得分
    ├─ 综合评分 → 确定等级（低/中/高）
    ↓
根据等级分流
    ├─ 低分（1-4）→ 聚焦引导型
    ├─ 中分（5-7）→ 补充优化型
    └─ 高分（8-10）→ 验证深化型
```

### 5.3 评分规则示例

从AI专家讨论中提取信息：

```javascript
// 伪代码示例

function analyzeCreativeMaturity(aiMessages, ideaContent) {
  let scores = {
    targetUser: 0,
    coreValue: 0,
    businessModel: 0,
    credibility: 0
  }

  // 1. 分析目标用户维度
  if (专家提问.includes(['目标用户是谁', '谁会用', '用户画像'])) {
    scores.targetUser = 低分(2-3)
  } else if (专家评价.includes(['人群清晰但需细化', '定位可以'])) {
    scores.targetUser = 中分(5-6)
  } else if (专家评价.includes(['人群精准', '定位明确', '痛点清晰'])) {
    scores.targetUser = 高分(8-9)
  }

  // 2. 分析核心价值维度
  if (专家提问.includes(['和XX有什么区别', '凭什么', '优势在哪'])) {
    scores.coreValue = 低分(2-3)
  } else if (专家评价.includes(['有差异化', '方向可以', '需要聚焦'])) {
    scores.coreValue = 中分(5-6)
  } else if (专家评价.includes(['独特价值', '强差异化', '技术壁垒'])) {
    scores.coreValue = 高分(8-9)
  }

  // 3. 分析商业模式维度
  if (专家提问.includes(['怎么赚钱', '收费模式', '盈利方式'])) {
    scores.businessModel = 低分(2-3)
  } else if (专家评价.includes(['模式初步', '可以但需细化', '定价待优化'])) {
    scores.businessModel = 中分(5-6)
  } else if (专家评价.includes(['模式清晰', '订阅制是标准', '可持续'])) {
    scores.businessModel = 高分(8-9)
  }

  // 4. 分析可信度维度
  if (创意描述.includes(['已有X用户', '测试过', 'MVP运行中'])) {
    scores.credibility = 高分(8-9)
    needVerification = true  // 触发验证流程
  } else if (创意描述.includes(['参考了', '调研过', '竞品是'])) {
    scores.credibility = 中分(5-6)
  } else {
    scores.credibility = 低分(2-3)
  }

  // 计算总分
  totalScore = (scores.targetUser + scores.coreValue +
                scores.businessModel + scores.credibility) / 4

  // 确定等级
  if (totalScore < 4.5) return 'LOW'
  if (totalScore < 7.5) return 'MEDIUM'
  return 'HIGH'
}
```

---

## 🛠️ 六、技术实现要点

### 6.1 新增数据结构

**文件**: `src/types/business-plan.ts`

```typescript
/**
 * 创意成熟度评分
 */
export interface CreativeMaturityScore {
  // 总分与等级
  totalScore: number          // 1-10
  maturityLevel: 'LOW' | 'MEDIUM' | 'HIGH'

  // 四维评分
  dimensions: {
    targetUser: {
      score: number         // 1-10
      status: 'CLEAR' | 'VAGUE' | 'MISSING'
      evidence: string      // 从专家讨论中提取的依据
      expertQuotes: string[] // 专家原话
    }
    coreValue: {
      score: number
      status: 'DIFFERENTIATED' | 'UNCLEAR' | 'COMMODITY'
      evidence: string
      expertQuotes: string[]
    }
    businessModel: {
      score: number
      status: 'DEFINED' | 'PRELIMINARY' | 'MISSING'
      evidence: string
      expertQuotes: string[]
    }
    credibility: {
      score: number
      status: 'VALIDATED' | 'ASSUMED' | 'IMAGINARY'
      evidence: string
      expertQuotes: string[]
      needsVerification: boolean  // 高分创意触发验证
    }
  }

  // 专家共识
  expertConsensus: {
    supportRate: number     // 5位专家中有几位看好（出价>平均）
    averageBid: number      // 平均出价
    mainConcerns: string[]  // 专家主要疑虑（提取高频问题）
    mainStrengths: string[] // 专家认可的优势
  }

  // 评分时间
  scoredAt: Date
}

/**
 * 数据验证请求（高分创意）
 */
export interface DataVerificationRequest {
  ideaId: string
  questions: VerificationQuestion[]
  estimatedTime: number    // 预计填写时间（分钟）
  optional: boolean        // 是否可跳过（高分创意建议不跳过）
  rewards: string[]        // 完成后获得的交付物
}

/**
 * 验证问题
 */
export interface VerificationQuestion {
  id: string
  category: 'USER' | 'FINANCIAL' | 'MARKET' | 'TEAM'
  question: string
  type: 'TEXT' | 'NUMBER' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
  required: boolean
  hint?: string           // 提示信息（为什么要问这个问题）
  options?: string[]      // 选项（单选/多选）
  placeholder?: string    // 输入框占位符
}

/**
 * 验证回答
 */
export interface VerificationAnswer {
  questionId: string
  answer: string | number | string[]
  confidence?: number     // 用户对答案的信心（可选）
}

/**
 * 验证结果
 */
export interface DataVerificationResult {
  ideaId: string
  answers: VerificationAnswer[]
  reasonabilityCheck: {
    passed: boolean
    warnings: string[]    // 数据异常提示
    suggestions: string[] // 改进建议
  }
  submittedAt: Date
}
```

### 6.2 核心文件修改

#### 1. `server.js` - 新增评分触发

**位置**: 在 `finishRealAIBidding` 和 `finishSimulatedBidding` 函数中

```javascript
async function finishRealAIBidding(ideaId, ideaContent, bids) {
  // ... 现有代码 ...

  // 【新增】收集专家讨论内容用于评分
  const aiMessages = []; // 从 broadcastToSession 或数据库中收集

  // 【新增】调用评分API
  const scoringResult = await fetch(`${apiBaseUrl}/api/score-creative-maturity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ideaId: ideaId,
      ideaContent: ideaContent,
      aiMessages: aiMessages,
      bids: bids
    })
  });

  const { maturityScore } = await scoringResult.json();

  console.log(`💯 创意成熟度评分: ${maturityScore.totalScore}/10 (${maturityScore.maturityLevel})`);

  // 在 session_complete 消息中包含评分
  broadcastToSession(ideaId, {
    type: 'session_complete',
    results: {
      // ... 现有字段 ...
      maturityScore: maturityScore  // 新增
    }
  });
}
```

#### 2. 新建 `src/lib/business-plan/maturity-scorer.ts`

```typescript
import type { CreativeMaturityScore } from '@/types/business-plan';

/**
 * 创意成熟度评分器
 */
export class MaturityScorer {

  /**
   * 分析专家讨论，计算成熟度得分
   */
  analyzeExpertDiscussion(
    aiMessages: any[],
    ideaContent: string,
    bids: Record<string, number>
  ): CreativeMaturityScore {

    // 提取专家问题和评价
    const expertQuestions = this.extractQuestions(aiMessages);
    const expertPraise = this.extractPraise(aiMessages);
    const expertConcerns = this.extractConcerns(aiMessages);

    // 评估4个维度
    const targetUserScore = this.scoreTargetUser(ideaContent, expertQuestions, expertPraise);
    const coreValueScore = this.scoreCoreValue(ideaContent, expertQuestions, expertPraise);
    const businessModelScore = this.scoreBusinessModel(ideaContent, expertQuestions, expertPraise);
    const credibilityScore = this.scoreCredibility(ideaContent, expertQuestions, expertPraise);

    // 计算总分
    const totalScore = (
      targetUserScore.score +
      coreValueScore.score +
      businessModelScore.score +
      credibilityScore.score
    ) / 4;

    // 确定等级
    let maturityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (totalScore < 4.5) maturityLevel = 'LOW';
    else if (totalScore < 7.5) maturityLevel = 'MEDIUM';
    else maturityLevel = 'HIGH';

    return {
      totalScore: Math.round(totalScore * 10) / 10,
      maturityLevel,
      dimensions: {
        targetUser: targetUserScore,
        coreValue: coreValueScore,
        businessModel: businessModelScore,
        credibility: credibilityScore
      },
      expertConsensus: {
        supportRate: this.calculateSupportRate(bids),
        averageBid: Object.values(bids).reduce((a, b) => a + b, 0) / Object.values(bids).length,
        mainConcerns: expertConcerns,
        mainStrengths: expertPraise
      },
      scoredAt: new Date()
    };
  }

  /**
   * 评估目标用户维度
   */
  private scoreTargetUser(
    ideaContent: string,
    questions: string[],
    praise: string[]
  ) {
    const concernKeywords = ['目标用户是谁', '谁会用', '用户画像', '太宽泛', '所有人'];
    const praiseKeywords = ['人群清晰', '定位精准', '目标明确', '细分市场'];

    const hasConcerns = questions.some(q =>
      concernKeywords.some(kw => q.includes(kw))
    );

    const hasPraise = praise.some(p =>
      praiseKeywords.some(kw => p.includes(kw))
    );

    let score = 5; // 默认中等
    let status: 'CLEAR' | 'VAGUE' | 'MISSING' = 'VAGUE';

    if (hasConcerns) {
      score = 3;
      status = 'MISSING';
    } else if (hasPraise) {
      score = 8;
      status = 'CLEAR';
    }

    return {
      score,
      status,
      evidence: hasPraise ? praise[0] : (hasConcerns ? questions[0] : '未明确提及'),
      expertQuotes: [...questions.filter(q => concernKeywords.some(kw => q.includes(kw))),
                      ...praise.filter(p => praiseKeywords.some(kw => p.includes(kw)))]
    };
  }

  // 类似实现 scoreCoreValue, scoreBusinessModel, scoreCredibility...

  /**
   * 从专家消息中提取问题
   */
  private extractQuestions(aiMessages: any[]): string[] {
    const questionPatterns = [
      /\?$/,
      /^(谁|什么|为什么|怎么|如何|哪)/,
      /能否/,
      /是否/
    ];

    return aiMessages
      .map(msg => msg.content)
      .filter(content =>
        questionPatterns.some(pattern => pattern.test(content))
      );
  }

  /**
   * 从专家消息中提取认可的优势
   */
  private extractPraise(aiMessages: any[]): string[] {
    const praiseKeywords = [
      '很好', '不错', '优秀', '清晰', '精准', '明确',
      '差异化', '独特', '壁垒', '可行'
    ];

    return aiMessages
      .map(msg => msg.content)
      .filter(content =>
        praiseKeywords.some(kw => content.includes(kw))
      );
  }

  /**
   * 从专家消息中提取疑虑
   */
  private extractConcerns(aiMessages: any[]): string[] {
    const concernKeywords = [
      '担心', '风险', '问题', '不清楚', '模糊', '缺乏',
      '需要验证', '不确定', '同质化'
    ];

    return aiMessages
      .map(msg => msg.content)
      .filter(content =>
        concernKeywords.some(kw => content.includes(kw))
      )
      .slice(0, 5); // 最多5个
  }

  /**
   * 计算专家支持率
   */
  private calculateSupportRate(bids: Record<string, number>): number {
    const bidValues = Object.values(bids);
    const average = bidValues.reduce((a, b) => a + b, 0) / bidValues.length;
    const supportCount = bidValues.filter(bid => bid >= average).length;
    return supportCount / bidValues.length;
  }
}
```

#### 3. 新建 `src/app/api/score-creative-maturity/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { MaturityScorer } from '@/lib/business-plan/maturity-scorer';

export async function POST(request: NextRequest) {
  try {
    const { ideaId, ideaContent, aiMessages, bids } = await request.json();

    console.log(`📊 评估创意成熟度: ideaId=${ideaId}`);

    const scorer = new MaturityScorer();
    const maturityScore = scorer.analyzeExpertDiscussion(aiMessages, ideaContent, bids);

    console.log(`💯 评分结果: ${maturityScore.totalScore}/10 (${maturityScore.maturityLevel})`);

    // 可选：保存评分到数据库
    // await prisma.ideaMaturityScore.create({ data: { ideaId, ...maturityScore } });

    return NextResponse.json({
      success: true,
      maturityScore
    });

  } catch (error) {
    console.error('评分失败:', error);
    return NextResponse.json({
      success: false,
      error: '评分失败'
    }, { status: 500 });
  }
}
```

#### 4. 修改 `src/app/api/generate-business-plan/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const { ideaId, maturityScore } = await request.json();

    console.log(`📋 生成商业计划: ideaId=${ideaId}, level=${maturityScore.maturityLevel}`);

    // 根据等级选择不同处理策略
    if (maturityScore.maturityLevel === 'LOW') {
      // 生成聚焦引导型文档
      return await generateFocusGuidance(ideaId, maturityScore);

    } else if (maturityScore.maturityLevel === 'MEDIUM') {
      // 生成补充优化型计划书
      return await generateOptimizationPlan(ideaId, maturityScore);

    } else {
      // 高分创意：先返回验证问卷
      return await generateVerificationRequest(ideaId, maturityScore);
    }

  } catch (error) {
    console.error('生成失败:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}

/**
 * 生成聚焦引导型文档（低分）
 */
async function generateFocusGuidance(ideaId: string, maturityScore: CreativeMaturityScore) {
  const builder = new FocusGuidanceBuilder();
  const guidance = await builder.build(ideaId, maturityScore);

  return NextResponse.json({
    success: true,
    type: 'FOCUS_GUIDANCE',
    content: guidance
  });
}

/**
 * 生成补充优化型计划书（中分）
 */
async function generateOptimizationPlan(ideaId: string, maturityScore: CreativeMaturityScore) {
  const builder = new OptimizationPlanBuilder();
  const plan = await builder.build(ideaId, maturityScore);

  return NextResponse.json({
    success: true,
    type: 'OPTIMIZATION_PLAN',
    content: plan
  });
}

/**
 * 生成验证请求（高分）
 */
async function generateVerificationRequest(ideaId: string, maturityScore: CreativeMaturityScore) {
  const verifier = new DataVerificationManager();
  const verificationRequest = verifier.createQuestions(ideaId, maturityScore);

  return NextResponse.json({
    success: true,
    type: 'VERIFICATION_REQUEST',
    verificationRequest
  });
}
```

#### 5. 新建三个模板生成器

**文件**: `src/lib/business-plan/templates/focus-guidance-builder.ts`

```typescript
/**
 * 低分创意：聚焦引导型文档生成器
 */
export class FocusGuidanceBuilder {
  async build(ideaId: string, maturityScore: CreativeMaturityScore) {
    // 实现聚焦引导文档生成逻辑
    // 参考本文档 "二、低分创意" 的内容结构
  }
}
```

**文件**: `src/lib/business-plan/templates/optimization-plan-builder.ts`

```typescript
/**
 * 中分创意：补充优化型计划书生成器
 */
export class OptimizationPlanBuilder {
  async build(ideaId: string, maturityScore: CreativeMaturityScore) {
    // 实现补充优化型计划书生成逻辑
    // 参考本文档 "三、中分创意" 的内容结构
  }
}
```

**文件**: `src/lib/business-plan/templates/verified-plan-builder.ts`

```typescript
/**
 * 高分创意：验证深化型计划书生成器
 */
export class VerifiedPlanBuilder {
  async build(ideaId: string, maturityScore: CreativeMaturityScore, verificationData: any) {
    // 实现基于验证数据的深度计划书生成逻辑
    // 参考本文档 "四、高分创意" 的内容结构
  }
}
```

#### 6. 新建 `src/lib/business-plan/verification-manager.ts`

```typescript
/**
 * 数据验证管理器（高分创意）
 */
export class DataVerificationManager {

  /**
   * 生成验证问卷
   */
  createQuestions(ideaId: string, maturityScore: CreativeMaturityScore): DataVerificationRequest {
    const questions: VerificationQuestion[] = [];

    // 用户数据验证问题
    questions.push({
      id: 'user_acquisition',
      category: 'USER',
      question: '付费用户是如何获取的？',
      type: 'MULTIPLE_CHOICE',
      required: true,
      hint: '了解获客渠道，帮助评估规模化增长的可行性',
      options: [
        '自然增长（口碑传播/SEO/社交媒体）',
        '付费广告（请填写CAC成本）',
        '社群运营（请注明社群名称）',
        '朋友/内测用户',
        '其他'
      ]
    });

    // 财务数据验证问题
    questions.push({
      id: 'revenue_calculation',
      category: 'FINANCIAL',
      question: '请说明GMV的计算依据',
      type: 'TEXT',
      required: true,
      hint: '例如：现有200用户 → 第一年目标2500用户 × 99元/月 × 12月',
      placeholder: '请详细说明您的计算过程'
    });

    // ... 更多问题

    return {
      ideaId,
      questions,
      estimatedTime: 10,
      optional: false,
      rewards: [
        '投资级商业计划书（30-50页）',
        '详细财务模型（Excel）',
        '融资路演PPT',
        '风险评估报告',
        '90天行动计划'
      ]
    };
  }

  /**
   * 验证数据合理性
   */
  checkReasonability(answers: VerificationAnswer[]): {
    passed: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 检查增长率合理性
    // 检查估值合理性
    // 检查留存率周期
    // ...

    return {
      passed: warnings.length === 0,
      warnings,
      suggestions
    };
  }
}
```

### 6.3 数据库调整（可选）

如果需要持久化评分数据：

```prisma
// schema.prisma

model IdeaMaturityScore {
  id            String   @id @default(cuid())
  ideaId        String   @unique
  totalScore    Float
  maturityLevel String   // LOW, MEDIUM, HIGH
  dimensions    Json     // 存储4个维度的详细评分
  expertConsensus Json   // 存储专家共识
  scoredAt      DateTime @default(now())

  idea          Idea     @relation(fields: [ideaId], references: [id])
}
```

---

## 🎯 七、用户体验流程

### 7.1 低分创意流程

```
用户提交创意
    ↓
AI专家竞价 (低分3.5)
    ↓
显示评分结果
  "您的创意需要进一步聚焦"
  "评分：3.5/10"
  "主要问题：目标用户不明确、核心价值待定义"
    ↓
生成聚焦引导文档
  - 问题诊断
  - 聚焦三步法
  - 参考案例
    ↓
用户按引导完善创意
    ↓
重新提交评估（可能升级到中分）
```

### 7.2 中分创意流程

```
用户提交创意
    ↓
AI专家竞价 (中分6.5)
    ↓
显示评分结果
  "您的创意基础良好，还有优化空间"
  "评分：6.5/10"
  "认可优势：目标人群清晰、核心价值明确"
  "待完善：市场竞争分析、获客策略"
    ↓
生成补充问卷 (10-15个问题)
    ↓
用户选择填写
  - 可跳过部分问题
  - 填写越完整，计划书越精准
    ↓
生成初步商业计划书
  - 亮点总结
  - 缺失环节分析
  - 优化建议
  - 初步财务模型（标注"基于假设"）
    ↓
用户优化创意后可重新生成
```

### 7.3 高分创意流程

```
用户提交创意
    ↓
AI专家竞价 (高分8.5)
    ↓
显示评分结果
  "恭喜！您的创意已具备投资价值"
  "评分：8.5/10"
  "专家高度认可：已有真实数据验证、方案完整"
    ↓
触发验证流程
  "为了生成更精准的投资级计划书，请完成数据验证"
    ↓
生成验证问卷
  - 用户数据验证（获客来源、留存周期）
  - 财务数据验证（GMV计算、成本结构）
  - 融资规划验证（估值依据、资金用途）
    ↓
用户填写真实数据
  - 建议完整填写（10-15分钟）
  - 可上传佐证材料（可选）
    ↓
AI检查数据合理性
  - 合理 → 生成投资级计划书
  - 异常 → 友好提示 + 建议修正
    ↓
生成深度方案
  - 投资级商业计划书（30-50页）
  - 详细财务模型（Excel）
  - 融资路演PPT
  - 风险评估 + 应对方案
  - 90天行动计划
```

---

## 📌 八、关键确认点

请您确认以下设计是否符合需求：

### ✅ 核心理念
- [x] 按"成熟度"而非"质量"分级
- [x] 低分不是"差"，而是"需要聚焦"
- [x] 高分不是"完美"，而是"需要验证"

### ✅ 分级标准
- [x] 4个维度：目标用户、核心价值、商业模式、可信度
- [x] 低分1-4：想法阶段
- [x] 中分5-7：方向阶段
- [x] 高分8-10：方案阶段

### ✅ 处理策略
- [x] 低分：聚焦引导，不给完整方案
- [x] 中分：识别缺失，引导补充，给初步方案
- [x] 高分：验证数据，生成可信的深度方案

### ✅ 评分时机
- [x] AI专家讨论结束后
- [x] 从专家观点中自动提取
- [x] 对用户透明（告知为什么是这个分数）

### ✅ 验证方式（高分）
- [x] 友好问卷（不是审问）
- [x] 10-15个问题，10-15分钟
- [x] AI检查合理性，给出风险提示

---

## 📝 九、待讨论问题

1. **评分透明度**
   - 是否向用户展示详细的4维评分？
   - 还是只展示总分和等级？

2. **升级机制**
   - 低分创意完善后，是否自动重新评分？
   - 还是用户需要手动申请重新评估？

3. **验证强制性**
   - 高分创意的验证问卷是否必填？
   - 如果用户跳过，是否降级处理？

4. **评分争议**
   - 如果用户觉得评分不合理，是否提供申诉机制？

5. **成本考虑**
   - 不同等级的计划书生成，AI调用成本不同
   - 是否需要设置用户配额或付费门槛？

---

**请您仔细阅读后，确认方案或指出需要调整的部分！** 🚀
