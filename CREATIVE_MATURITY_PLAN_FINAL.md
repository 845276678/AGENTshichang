# 创意成熟度分级处理方案 - 最终实施版

> **版本**: v4.0 - Final
> **日期**: 2025-01-09
> **状态**: 待开发

---

## 📋 核心决策总结

### ✅ 已确认的关键决策

| 维度 | 决策 |
|------|------|
| **评分引擎** | 第一期规则版，后续加语义匹配 |
| **分数阈值** | 4.0/5.0/7.0/7.5，保留灰色区，用户选择 |
| **评分维度** | 5维（目标客户、需求场景、核心价值、商业模式、可信度） |
| **权重配置** | 可配置化，初期均等权重 |
| **评分透明度** | 高透明，展示专家原话+4维雷达图 |
| **低分引导** | AI讨论后直接给建议，不让用户选择太多 |
| **中分处理** | 提示薄弱项+给建议，不强制填写 |
| **高分验证** | 一次性问卷（10-15题），网上检索+给链接 |
| **置信度机制** | 低置信度也接受，在计划书中说明不完善之处 |
| **数据保存** | 新建表，仅保留1天 |
| **架构改动** | 最小化，新增文件为主 |
| **商业模式** | 积分付费，高分创意消耗更多积分 |
| **用户配额** | 不限制 |
| **分期实施** | 三期依次上线，每期测试后再上下一期 |

---

## 🎯 一、核心理念

**按"成熟度"而非"好坏"分级**

所有创意都经过AI专家讨论，根据成熟度提供不同深度的建议：

- **低分（1-4）** = 想法阶段 → **直接给聚焦建议**
- **中分（5-7）** = 方向阶段 → **提示薄弱项+给优化建议**
- **高分（7.5-10）** = 方案阶段 → **验证数据+给深度方案**

---

## 📊 二、评分机制

### 2.1 五维评估模型

| 维度 | 权重 | 评估问题 | 低分特征 | 中分特征 | 高分特征 |
|------|------|---------|---------|---------|---------|
| 🎯 目标客户 | 20% | 客户是谁？ | 模糊/泛化 | 有方向但不具体 | 清晰画像 |
| 📍 需求场景 | 20% | 什么场景下用？ | 不清楚 | 有但未聚焦 | 具体场景 |
| 💡 核心价值 | 25% | 解决什么问题？ | 不清楚/宽泛 | 有但未聚焦 | 聚焦+差异化 |
| 💰 商业模式 | 20% | 怎么赚钱？ | 未提及 | 有想法但不完整 | 清晰路径 |
| 📈 可信度 | 15% | 有数据支撑吗？ | 纯想象 | 部分假设 | 有数据/已验证 |

**权重配置化**：存储在配置表，支持动态调整

### 2.2 分数阈值（含灰色区）

```
1.0 ━━━━━━━━━━━ 4.0 ┈┈┈┈┈ 5.0 ━━━━━━━ 7.0 ┈┈┈ 7.5 ━━━━━━━━ 10.0
    低分区          灰色区    中分区      灰色区      高分区
```

**灰色区处理**：
- **4.0-5.0**：提示"您的创意介于想法和方向之间，建议补充3个问题可获得更准确评估"
- **7.0-7.5**：提示"您的创意已较成熟，补充验证数据可获得投资级计划书"

### 2.3 评分引擎（第一期：规则版）

```typescript
class MaturityScorer {

  /**
   * 分析AI专家讨论，计算成熟度评分
   */
  analyze(aiMessages: AIMessage[], bids: Record<string, number>) {
    const dimensions = {
      targetCustomer: this.scoreDimension('targetCustomer', aiMessages),
      demandScenario: this.scoreDimension('demandScenario', aiMessages),
      coreValue: this.scoreDimension('coreValue', aiMessages),
      businessModel: this.scoreDimension('businessModel', aiMessages),
      credibility: this.scoreDimension('credibility', aiMessages)
    };

    // 加权平均
    const weights = this.getWeights(); // 从配置表读取
    const totalScore = Object.keys(dimensions).reduce((sum, dim) => {
      return sum + dimensions[dim].score * weights[dim];
    }, 0);

    // 确定等级
    const level = this.determineLevel(totalScore);

    // 提取专家共识
    const expertConsensus = this.extractExpertConsensus(aiMessages, bids);

    return {
      totalScore,
      level,
      dimensions,
      expertConsensus,
      confidence: this.calculateConfidence(dimensions),
      scoringVersion: '1.0.0'
    };
  }

  /**
   * 评估单个维度（规则版）
   */
  private scoreDimension(dimension: string, messages: AIMessage[]) {
    const keywords = this.getKeywordsForDimension(dimension);

    let score = 5; // 默认中等
    let evidence = [];

    // 检测专家质疑（降分）
    const concerns = messages.filter(msg =>
      keywords.concerns.some(kw => msg.content.includes(kw))
    );

    // 检测专家认可（加分）
    const praise = messages.filter(msg =>
      keywords.praise.some(kw => msg.content.includes(kw))
    );

    // 边际递减：多次提及同一问题不重复扣分
    const uniqueConcerns = this.deduplicateConcerns(concerns);
    const uniquePraise = this.deduplicatePraise(praise);

    score -= uniqueConcerns.length * 0.8; // 每个疑虑-0.8分
    score += uniquePraise.length * 0.5;   // 每个认可+0.5分

    score = Math.max(1, Math.min(10, score)); // 限制1-10

    return {
      score,
      status: this.getStatus(score),
      evidence: [...concerns, ...praise].slice(0, 3), // 最多3条证据
      confidence: this.calculateDimensionConfidence(concerns, praise)
    };
  }

  /**
   * 去重：避免关键词堆砌刷分
   */
  private deduplicateConcerns(concerns: AIMessage[]) {
    const seen = new Set();
    return concerns.filter(msg => {
      const key = this.extractKeyIssue(msg.content);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 确定等级（含灰色区）
   */
  private determineLevel(score: number) {
    if (score < 4.0) return 'LOW';
    if (score < 5.0) return 'GRAY_LOW';  // 灰色区
    if (score < 7.0) return 'MEDIUM';
    if (score < 7.5) return 'GRAY_HIGH'; // 灰色区
    return 'HIGH';
  }
}
```

**关键词库示例**：

```typescript
const DIMENSION_KEYWORDS = {
  targetCustomer: {
    concerns: ['目标用户是谁', '客户群体', '谁会用', '太宽泛', '所有人'],
    praise: ['目标明确', '人群清晰', '定位精准', '细分市场']
  },
  demandScenario: {
    concerns: ['什么场景', '怎么用', '使用场景不清', '需求模糊'],
    praise: ['场景清晰', '刚需场景', '高频场景', '痛点明确']
  },
  coreValue: {
    concerns: ['和XX有什么区别', '差异化', '凭什么', '同质化'],
    praise: ['独特价值', '差异化明显', '技术壁垒', '创新点']
  },
  businessModel: {
    concerns: ['怎么赚钱', '商业模式', '盈利方式', '收费模式'],
    praise: ['模式清晰', '订阅制', '可持续', '盈利路径']
  },
  credibility: {
    concerns: ['需要验证', '假设', '没有数据', '不确定'],
    praise: ['有数据', '已验证', 'MVP', '真实用户']
  }
};
```

---

## 🔴 三、低分创意（1-4分）：直接建议型

### 3.1 核心策略

AI专家讨论后，**直接给出聚焦建议**，不让用户选择太多。

### 3.2 生成内容模板

```markdown
# 您的创意需要进一步聚焦 📍

**评分**: 3.5/10（成熟度：想法阶段）
**置信度**: 85%

---

## 📊 五维评估

[雷达图展示]

| 维度 | 得分 | 状态 | 专家反馈 |
|------|------|------|---------|
| 🎯 目标客户 | 2.5/10 | ❌ 待明确 | 老王："你这是给谁用的？" |
| 📍 需求场景 | 3.0/10 | ❌ 待明确 | 艾克斯："什么场景下用户会用这个？" |
| 💡 核心价值 | 4.0/10 | ⚠️ 待聚焦 | 小琳："和现有产品的区别在哪？" |
| 💰 商业模式 | 3.5/10 | ❌ 待定义 | 李博:"怎么赚钱？订阅还是一次性付费？" |
| 📈 可信度 | 3.0/10 | ❌ 需验证 | 阿伦："建议先做用户访谈" |

**平均分**: 3.2/10

---

## 💡 AI专家给您的建议

基于五位专家的讨论，我们建议您：

### 第一步：明确目标客户 🎯

**建议聚焦**：自由职业者（设计师、程序员、咨询师）

**理由**：
- 老王："这个人群付费意愿高，市场成熟"
- 李博："自由职业者对时间管理工具的需求最强烈"

**下一步行动**：
- 访谈5-10位自由职业者，确认他们的时间管理痛点
- 了解他们现在用什么工具，最不满意的地方是什么

---

### 第二步：聚焦需求场景 📍

**建议场景**：项目时间追踪 + 时薪计算

**理由**：
- 艾克斯："自由职业者最关心的是'这个项目值不值得做'"
- 小琳："时薪可视化能给用户直观的价值感"

**下一步行动**：
- 画出用户使用的典型流程（从开始项目到查看时薪报告）
- 确认核心功能：时间追踪、项目管理、时薪报告

---

### 第三步：定义差异化价值 💡

**建议定位**：不是"又一个时间管理工具"，而是"自由职业者的时薪优化顾问"

**理由**：
- 阿伦："市面上时间管理工具太多了，你得有独特卖点"
- 老王："时薪优化这个角度很好，直接和赚钱挂钩"

**下一步行动**：
- 用一句话描述你的产品："帮助自由职业者通过AI时薪分析，优化时间分配，提升收入"
- 找3个竞品，对比你的独特优势

---

### 第四步：验证需求真实性 ✅

**建议方式**：
1. **用户访谈**（5-10人）
   - 问题1：你现在用什么工具管理时间？
   - 问题2：最不满意的地方是什么？
   - 问题3：如果有AI时薪分析，你愿意付费吗？

2. **竞品分析**（3个产品）
   - Toggl、RescueTime、Clockify
   - 分析它们的优缺点、定价、用户评价

3. **MVP原型**
   - 用Figma画出核心界面
   - 收集10-20人的反馈

---

## 🎁 完成后的下一步

完成以上4步后，您将获得：
- ✅ 明确的目标客户和需求场景
- ✅ 清晰的差异化价值定位
- ✅ 真实的用户验证数据

**届时您可以重新提交创意，我们将为您生成详细的商业计划书！**

[重新提交创意] [保存建议PDF]
```

### 3.3 积分消耗

- 低分引导：**50积分**
- 交付物：建议文档（5-8页）

---

## 🟡 四、中分创意（5-7分）：提示+建议型

### 4.1 核心策略

AI专家讨论后，**提示薄弱维度+给优化建议**，不强制填写任何内容。

### 4.2 生成内容模板

```markdown
# 您的创意基础良好，还有优化空间 ⭐

**评分**: 6.5/10（成熟度：方向阶段）
**置信度**: 88%

---

## 📊 五维评估

[雷达图展示]

| 维度 | 得分 | 状态 | 专家反馈 |
|------|------|------|---------|
| 🎯 目标客户 | 8.0/10 | ✅ 清晰 | 老王："自由职业者定位很好" |
| 📍 需求场景 | 7.0/10 | ✅ 明确 | 艾克斯："时间追踪场景清晰" |
| 💡 核心价值 | 6.5/10 | ⚠️ 需聚焦 | 小琳："时薪优化是好卖点，但需要更具体" |
| 💰 商业模式 | 5.0/10 | ⚠️ 待完善 | 李博："订阅制是对的，但定价策略需要细化" |
| 📈 可信度 | 6.0/10 | ⚠️ 需验证 | 阿伦："建议做MVP验证" |

**平均分**: 6.5/10

---

## ✨ 专家认可的优势

✅ **目标客户清晰**：自由职业者是高付费意愿群体
✅ **需求场景明确**：时间追踪+时薪计算是刚需
✅ **核心价值独特**：时薪优化角度有差异化

---

## 🔍 待优化的薄弱项

基于专家讨论，以下3个方面需要进一步完善：

### 1. 核心价值聚焦度（6.5/10）⚠️

**专家反馈**：
- 小琳："时薪优化是好方向，但具体怎么优化？给用户什么建议？"
- 艾克斯："AI分析的逻辑是什么？只是统计时间吗？"

**优化建议**：
- 🎯 **建议1**：明确AI分析的3个核心功能
  - 识别"高价值任务" vs "低价值任务"
  - 分析时间分配是否合理
  - 给出具体的优化建议（如"减少XX任务30%"）

- 🎯 **建议2**：准备1-2个真实案例
  - "设计师小A使用后，时薪从100元提升到150元"
  - 具体说明他优化了哪些时间分配

- 🎯 **建议3**：对比竞品的差异
  | 功能 | Toggl | RescueTime | 您的产品 |
  |------|-------|------------|---------|
  | 时间追踪 | ✅ | ✅ | ✅ |
  | 时薪计算 | ✅ | ❌ | ✅ |
  | AI优化建议 | ❌ | ⚠️ 简单 | ✅ 深度 |

---

### 2. 商业模式完整度（5.0/10）⚠️

**专家反馈**：
- 李博："订阅制99元/月，定价依据是什么？"
- 老王："获客成本多少？怎么获客？"

**优化建议**：
- 💰 **建议1**：细化定价策略
  - 基础版：59元/月（基本时间追踪）
  - 专业版：99元/月（AI分析+报告）
  - 团队版：199元/月（团队协作）

- 💰 **建议2**：明确获客渠道
  - 小红书/即刻（内容营销）
  - V2EX/站酷（社区运营）
  - 预估CAC：100-150元/人

- 💰 **建议3**：计算LTV/CAC
  - ARPU：99元/月
  - 留存率：假设60%（需验证）
  - LTV：99 × 12 × 60% = 712元
  - LTV/CAC = 712/125 = 5.7（健康）

---

### 3. 可信度（6.0/10）⚠️

**专家反馈**：
- 阿伦："建议先做MVP验证需求"
- 艾克斯："没有用户数据，风险较高"

**优化建议**：
- 📊 **建议1**：3个月MVP计划
  - 月1：开发核心功能（时间追踪+时薪计算）
  - 月2-3：邀请50个种子用户测试
  - 目标：验证留存率>50%

- 📊 **建议2**：用户验证清单
  - 访谈10位自由职业者，录音记录
  - 竞品用户评价分析（App Store/知乎）
  - 问卷调查（100份有效样本）

---

## 📋 生成初步商业计划书

基于当前信息，我们已为您生成初步商业计划书（标注假设部分）

[查看完整商业计划书] [下载PDF]

**包含内容**：
- ✅ 市场分析（基于行业数据）
- ✅ 产品定义（MVP功能清单）
- ✅ 商业模式（收入/成本/定价）
- ✅ 财务模型（简化版，标注假设）
- ⚠️ 标注：部分数据基于假设，需通过MVP验证

---

## 🎯 下一步建议

您可以选择：

1. **直接执行**：按照当前商业计划开发MVP
2. **补充信息**：回答5个关键问题，获得更精准的计划书
   - 问题1：您的获客渠道和预算？
   - 问题2：竞品对比的详细分析？
   - 问题3：MVP的具体功能清单？
   - 问题4：3个月的验证目标？
   - 问题5：团队背景和资源？

[补充信息（可选）] [直接下载计划书]
```

### 4.3 积分消耗

- 中分优化：**200积分**
- 交付物：
  - 优化建议文档（10-15页）
  - 初步商业计划书（15-25页，标注假设）

---

## 🟢 五、高分创意（7.5-10分）：验证+深度方案

### 5.1 核心策略

AI专家讨论后，**一次性问卷验证数据，网上检索真实性，生成投资级计划书**。

### 5.2 生成内容模板（第一部分）

```markdown
# 恭喜！您的创意已具备投资价值 🎉

**评分**: 8.5/10（成熟度：方案阶段）
**置信度**: 92%

---

## 📊 五维评估

[雷达图展示]

| 维度 | 得分 | 状态 | 专家反馈 |
|------|------|------|---------|
| 🎯 目标客户 | 9.0/10 | ✅ 精准 | 老王："自由职业者定位很好，有200付费用户验证" |
| 📍 需求场景 | 8.5/10 | ✅ 清晰 | 艾克斯："时间追踪场景真实" |
| 💡 核心价值 | 8.0/10 | ✅ 独特 | 小琳："时薪优化是独特价值点" |
| 💰 商业模式 | 8.5/10 | ✅ 清晰 | 李博："订阅制模式成熟，定价合理" |
| 📈 可信度 | 8.5/10 | ✅ 已验证 | 阿伦："有真实用户数据，可信度高" |

**平均分**: 8.5/10

---

## ✨ AI专家团队高度认可

⭐ **老王**："有200个付费用户，这就是真金白银的验证！"
⭐ **李博**："65%留存率如果属实，这是非常健康的指标。"
⭐ **艾克斯**："产品已经跑起来了，接下来是规模化问题。"
⭐ **小琳**："时薪可视化的体验设计很好。"
⭐ **阿伦**："这个方向有爆款潜力。"

---

## 🔍 数据验证环节

为了生成**投资级商业计划书**，我们需要验证部分关键数据的真实性。

**预计时间**：10-15分钟
**方式**：一次性问卷（15个问题）+ 网上检索验证

完成后，您将获得：
- ✅ 投资级商业计划书（30-50页）
- ✅ 详细财务模型（Excel，3年预测）
- ✅ 融资路演PPT（15-20页）
- ✅ 数据验证报告（标注哪些已验证，哪些需假设）
- ✅ 风险评估与应对方案
- ✅ 90天行动计划

---

## 📝 验证问卷（15个问题）

### 用户数据（5题）

**Q1. 200位付费用户主要来自？** *
□ 自然增长（口碑/SEO）
□ 付费广告（CAC: ___ 元）
□ 社群运营（哪些社群：___）
□ 内测朋友

💡 **为什么问这个**：了解获客渠道，评估规模化增长可行性

---

**Q2. 65%留存率是哪个周期？** *
□ 第1个月留存
□ 第3个月留存 ⭐ 重要
□ 第6个月留存

💡 **为什么问这个**：不同周期意义不同，直接影响LTV计算

---

**Q3. 用户主要职业分布？**
- 设计师：___%
- 程序员：___%
- 咨询师：___%
- 其他：___%

💡 **为什么问这个**：精准定位后续营销策略

---

**Q4. 付费转化率？**
- 免费用户总数：___ 人
- 转化为付费的比例：___%

---

**Q5. 用户最喜欢的3个功能？**
1. ___
2. ___
3. ___

---

### 财务数据（5题）

**Q6. 300万GMV如何计算？** *
- 现有用户：___ 人
- 第一年目标用户：___ 人（___ 倍增长）
- 客单价：___ 元/月
- 预计GMV：___ 万

💡 **我们将验证**：增长倍数是否合理，参考行业基准

---

**Q7. 获客成本？**
- 预计CAC：___ 元/人
- 新增用户：___ 人
- 获客预算：___ 万

---

**Q8. 成本结构？**
- 研发成本：___ 万/年
- 运营成本：___ 万/年（服务器+客服+营销）
- 团队规模：___ 人

---

**Q9. 毛利率预估？**
- 预估毛利率：___%

---

**Q10. 现金储备？**
- 当前账上资金：___ 万
- 可支撑：___ 个月

---

### 融资规划（3题）

**Q11. 3000万估值如何计算？** *
□ PS倍数法（ARR × ___ 倍）
□ 可比公司法（参考 ___ 公司）
□ 投资人建议
□ 其他：___

💡 **我们将验证**：估值是否合理，参考行业标准

---

**Q12. 500万融资用途？**
- 产品开发：___ 万
- 市场推广：___ 万
- 团队扩张：___ 万
- 运营储备：___ 万

---

**Q13. 核心团队背景？**
□ 有SaaS创业经验
□ 有相关行业背景
□ 有技术开发能力
□ 有市场运营经验
□ 首次创业

---

### 市场数据（2题）

**Q14. 您提到的"自由职业者市场2000万"，数据来源？**
- 来源：___（如：艾瑞咨询报告、36氪数据）
- 链接：___（可选）

💡 **我们将验证**：网上检索是否能找到相关数据

---

**Q15. 竞品分析？**
您认为的3个主要竞品：
1. ___（优势：___，劣势：___）
2. ___（优势：___，劣势：___）
3. ___（优势：___，劣势：___）

---

## 🔒 隐私声明

我们需要收集您的业务与财务数据，仅用于生成商业计划书。

✅ 传输加密（HTTPS）
✅ **仅保留1天**，自动删除
✅ 不分享给第三方
✅ 可随时删除

□ 我已阅读并同意隐私声明

[开始验证（15分钟）] [暂不验证，先生成基础版]
```

### 5.3 验证+检索逻辑

```typescript
// src/lib/business-plan/data-verifier.ts

class DataVerifier {

  /**
   * 验证用户提交的数据
   */
  async verify(answers: VerificationAnswer[]) {
    const results = [];

    for (const answer of answers) {
      const result = await this.verifyAnswer(answer);
      results.push(result);
    }

    return results;
  }

  /**
   * 验证单个答案
   */
  private async verifyAnswer(answer: VerificationAnswer) {
    // 1. 提取关键声明
    const claim = this.extractClaim(answer);

    // 2. 网上检索
    const searchResults = await this.searchOnline(claim);

    // 3. 判断验证状态
    if (searchResults.length > 0 && searchResults[0].confidence > 0.8) {
      return {
        claim,
        status: 'VERIFIED',
        sources: searchResults.slice(0, 3),
        message: `我们找到了相关数据支持您的说法`
      };
    } else if (searchResults.length > 0) {
      return {
        claim,
        status: 'PARTIALLY_VERIFIED',
        sources: searchResults.slice(0, 3),
        message: `找到部分相关数据，但数值略有差异`
      };
    } else {
      return {
        claim,
        status: 'CANNOT_VERIFY',
        sources: [],
        message: `未找到权威数据源，建议作为假设标注`
      };
    }
  }

  /**
   * 网上检索（调用搜索API或爬虫）
   */
  private async searchOnline(claim: string) {
    // 方案A：调用搜索API（如Bing Search API）
    // 方案B：爬取特定数据源（艾瑞、36氪、行业报告网站）

    const query = this.buildSearchQuery(claim);
    const results = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${query}`);

    // 解析结果，提取相关段落
    return this.parseSearchResults(results);
  }
}
```

### 5.4 生成内容模板（第二部分：验证报告）

```markdown
## 📊 数据验证报告

我们对您提交的数据进行了网上检索验证：

---

### ✅ 已验证的数据

**1. "自由职业者市场约2000万人"**
- **状态**：✅ 已验证
- **来源**：
  - [2024中国自由职业者报告 - 艾瑞咨询](https://example.com)
    > "截至2024年，中国自由职业者约1800-2200万人，其中设计师、程序员、咨询师占比60%..."
  - [中国灵活就业发展报告 - 人社部](https://example.com)
    > "2024年灵活就业人员约2亿，其中自由职业者约2000万..."
- **可信度**：⭐⭐⭐⭐⭐ 高

---

**2. "SaaS行业LTV/CAC健康比例3:1"**
- **状态**：✅ 已验证
- **来源**：
  - [SaaS Metrics Guide - OpenView Partners](https://openview.com)
    > "A healthy LTV:CAC ratio should be 3:1 or higher..."
- **可信度**：⭐⭐⭐⭐⭐ 高

---

### ⚠️ 部分验证的数据

**3. "65%月留存率是优秀水平"**
- **状态**：⚠️ 部分验证
- **来源**：
  - [SaaS Benchmarks Report 2024](https://example.com)
    > "Median month-1 retention: 60%, top 25%: 70%..."
- **分析**：
  - 您的65%留存率是"第1个月"数据
  - 行业中位数：第1个月60%，第3个月50%
  - **建议**：持续追踪第3、6个月留存，这更能反映产品粘性
- **可信度**：⭐⭐⭐⭐ 中高

---

### ❌ 无法验证的数据（建议作为假设）

**4. "第一年增长12倍（200→2500用户）"**
- **状态**：❌ 无法验证
- **原因**：未找到类似产品的增长数据
- **分析**：
  - 12倍增长需要强大的获客能力
  - 您的获客预算：50万，CAC: 150元
  - 可支撑新增用户：50万/150 = 3333人
  - **建议**：12倍增长可行，但需确保获客预算充足
- **假设标注**：⚠️ 此为乐观预测，建议准备保守方案（6-8倍增长）

---

**5. "3000万估值（ARR的126倍）"**
- **状态**：❌ 偏高
- **原因**：高于行业标准
- **分析**：
  - 您的ARR：23.76万
  - 行业标准：早期SaaS为ARR的5-15倍
  - 合理估值区间：120万 - 350万
  - **李博建议**："估值不是越高越好，合理估值更容易融资成功。建议800万-1200万，融200-300万，占股20-25%。"
- **假设标注**：⚠️ 建议调整估值，或提供高增长潜力的证据

---

## 📋 投资级商业计划书

基于验证数据，我们为您生成了投资级商业计划书：

[下载完整版（50页PDF）]

### 目录
1. 执行摘要（1页）
2. 市场分析（8页）
   - 市场规模（✅ 已验证数据）
   - 竞争格局
   - 目标客户画像
3. 产品方案（10页）
   - 核心功能
   - 技术架构
   - 产品路线图
4. 商业模式（8页）
   - 收入模式
   - 定价策略（✅ 参考行业标准）
   - 获客策略
5. 财务模型（12页）
   - 3年预测（月度/季度）
   - 敏感性分析
   - ✅ 标注：已验证数据 vs 假设数据
6. 融资计划（8页）
   - 融资金额（✅ 调整后的合理方案）
   - 资金用途
   - 估值依据
7. 风险与应对（3页）

---

## 💼 融资路演PPT

[下载PPT（20页）]

---

## 📈 详细财务模型

[下载Excel文件]

**包含**：
- 3年月度收入预测
- 成本结构拆解
- 现金流分析
- 乐观/中性/悲观三种情景

---

## ⚠️ 风险提示与建议

基于数据验证，我们识别了以下风险：

### 风险1：增长预期偏乐观 ⚠️

**风险描述**：12倍增长需要强大执行力
**影响**：如达不到，影响后续融资
**应对方案**：
- 制定保守计划（6-8倍增长）
- 增加获客预算到100万
- 建立每月增长监控

---

### 风险2：留存率需持续追踪 ⚠️

**风险描述**：第1个月65%留存，但第3、6个月数据未知
**影响**：LTV计算可能不准
**应对方案**：
- 每月追踪分群留存
- 识别高留存用户特征
- 优化产品体验

---

### 风险3：估值偏高可能影响融资 ⚠️

**风险描述**：3000万估值是ARR的126倍
**影响**：投资人可能觉得不合理
**应对方案**：
- 调整到800-1200万
- 或提供高增长证据（已签约大客户）

---

## 🎯 90天行动计划

[下载完整清单]

**第1个月**：
- 完成第3、6个月留存数据追踪
- 优化产品，提升留存率到70%
- 准备融资材料

**第2个月**：
- 接触10家投资机构
- 参加2-3场路演活动
- 收集投资人反馈

**第3个月**：
- 完成融资谈判
- 签署投资协议
- 启动扩张计划

---

**感谢使用AI创意评估系统！** 🚀
```

### 5.5 积分消耗

- 高分验证+深度方案：**800积分**
- 交付物：
  - 投资级商业计划书（30-50页PDF）
  - 详细财务模型（Excel）
  - 融资路演PPT（20页）
  - 数据验证报告
  - 风险评估报告
  - 90天行动计划

---

## 🗄️ 六、数据存储方案

### 6.1 数据库Schema

```prisma
// schema.prisma

// 创意成熟度评估表
model CreativeMaturityAdvice {
  id                String   @id @default(cuid())
  ideaId            String   @map("idea_id")
  userId            String?  @map("user_id")

  // 评分结果
  maturityScore     Float    @map("maturity_score")      // 1-10
  maturityLevel     String   @map("maturity_level")      // LOW/GRAY_LOW/MEDIUM/GRAY_HIGH/HIGH
  dimensions        Json     @map("dimensions")          // 5维详情
  confidence        Float    @map("confidence")          // 0-1

  // 专家建议
  expertAdvice      Json     @map("expert_advice")       // 按等级分类的建议
  weakDimensions    String[] @map("weak_dimensions")     // 薄弱维度列表

  // 专家共识
  expertConsensus   Json     @map("expert_consensus")    // 专家观点统计

  // 验证数据（高分创意）
  verificationData  Json?    @map("verification_data")   // 用户填写的验证问卷
  verificationLinks Json?    @map("verification_links")  // 网上检索的参考链接
  verifiedAt        DateTime? @map("verified_at")

  // 元数据
  scoringVersion    String   @map("scoring_version")     // "1.0.0"

  // 时间戳
  createdAt         DateTime @default(now()) @map("created_at")
  expiresAt         DateTime @map("expires_at")          // 创建后1天自动过期

  @@index([ideaId, createdAt])
  @@index([expiresAt]) // 用于定时清理
  @@map("creative_maturity_advice")
}

// 评分权重配置表
model ScoringWeightConfig {
  id                String   @id @default(cuid())
  version           String   @unique                      // "1.0.0"
  isActive          Boolean  @default(false)             // 是否当前激活

  // 5维权重（总和=1.0）
  targetCustomer    Float    @map("target_customer")      // 0.20
  demandScenario    Float    @map("demand_scenario")      // 0.20
  coreValue         Float    @map("core_value")           // 0.25
  businessModel     Float    @map("business_model")       // 0.20
  credibility       Float    @map("credibility")          // 0.15

  description       String?                              // 配置说明
  createdAt         DateTime @default(now()) @map("created_at")

  @@map("scoring_weight_config")
}
```

### 6.2 自动清理任务

```typescript
// src/lib/tasks/cleanup-expired-advice.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 清理过期的创意评估数据（1天后）
 */
export async function cleanupExpiredAdvice() {
  const now = new Date();

  const result = await prisma.creativeMaturityAdvice.deleteMany({
    where: {
      expiresAt: {
        lt: now
      }
    }
  });

  console.log(`🧹 Cleaned up ${result.count} expired advice records`);
  return result.count;
}

// 定时任务：每小时执行一次
setInterval(async () => {
  try {
    await cleanupExpiredAdvice();
  } catch (error) {
    console.error('Failed to cleanup expired advice:', error);
  }
}, 60 * 60 * 1000); // 1小时
```

### 6.3 保存逻辑

```typescript
// src/app/api/score-creative-maturity/route.ts

export async function POST(request: NextRequest) {
  const { ideaId, aiMessages, bids } = await request.json();

  const scorer = new MaturityScorer();
  const result = await scorer.analyze(aiMessages, bids);

  // 保存评分结果（1天后自动过期）
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // +1天

  await prisma.creativeMaturityAdvice.create({
    data: {
      ideaId,
      userId: request.userId, // 从token中获取
      maturityScore: result.totalScore,
      maturityLevel: result.level,
      dimensions: result.dimensions,
      confidence: result.confidence,
      expertAdvice: result.advice,
      weakDimensions: result.weakDimensions,
      expertConsensus: result.expertConsensus,
      scoringVersion: '1.0.0',
      expiresAt
    }
  });

  return NextResponse.json({ success: true, result });
}
```

---

## 🛠️ 七、技术实现（最小改动）

### 7.1 新增文件（不改现有）

```
src/
├── types/
│   └── maturity-score.ts              # 新建：评分相关类型定义
├── lib/
│   └── business-plan/
│       ├── maturity-scorer.ts         # 新建：评分引擎
│       ├── data-verifier.ts           # 新建：数据验证器
│       ├── weight-config-manager.ts   # 新建：权重配置管理
│       └── templates/
│           ├── focus-guidance.ts      # 新建：低分引导模板
│           ├── optimization-plan.ts   # 新建：中分优化模板
│           └── verified-plan.ts       # 新建：高分验证模板
├── app/api/
│   ├── score-creative/
│   │   └── route.ts                   # 新建：评分API
│   └── verify-data/
│       └── route.ts                   # 新建：验证API
└── components/
    ├── ScoreRadarChart.tsx            # 新建：雷达图组件
    ├── VerificationForm.tsx           # 新建：验证问卷组件
    └── GrayZonePrompt.tsx             # 新建：灰色区提示组件
```

### 7.2 修改现有文件（最小改动）

#### 1. server.js（加5行触发评分）

```javascript
// server.js

async function finishRealAIBidding(ideaId, ideaContent, bids) {
  // ... 现有代码 ...

  // 🆕 新增：触发评分（5行）
  try {
    const apiBaseUrl = process.env.API_BASE_URL || `http://127.0.0.1:${port}`;
    const scoreResponse = await fetch(`${apiBaseUrl}/api/score-creative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId, ideaContent, aiMessages: [], bids })
    });
    const { result } = await scoreResponse.json();

    // 在session_complete中包含评分
    broadcastToSession(ideaId, {
      type: 'session_complete',
      results: {
        // ... 现有字段 ...
        maturityScore: result  // 🆕 新增
      }
    });
  } catch (error) {
    console.error('评分失败，使用降级策略:', error);
    // 降级：不评分，继续原流程
  }
}
```

#### 2. generate-business-plan/route.ts（开头加if分流）

```typescript
// src/app/api/generate-business-plan/route.ts

export async function POST(request: NextRequest) {
  const { ideaId, maturityLevel } = await request.json();

  // 🆕 新增：根据评分等级分流（10行）
  if (maturityLevel) {
    if (maturityLevel === 'LOW') {
      return generateFocusGuidance(ideaId);
    } else if (maturityLevel === 'MEDIUM') {
      return generateOptimizationPlan(ideaId);
    } else if (maturityLevel === 'HIGH') {
      return generateVerificationRequest(ideaId);
    }
  }

  // 原有逻辑保持不变
  // ... 现有代码 ...
}
```

### 7.3 向后兼容

```typescript
// 如果评分失败或未评分，降级为原流程
if (!maturityScore) {
  // 使用原有的商业计划生成逻辑
  return generateDefaultBusinessPlan(ideaId);
}
```

---

## 📅 八、分期实施计划

### 第一期（2周）：评分 + 低分引导

**目标**：验证分级处理的价值

#### Week 1: 基础架构
- [ ] Day 1-2：数据库迁移（新增2个表）
- [ ] Day 3-4：评分引擎（规则版）
- [ ] Day 5：权重配置管理

#### Week 2: 低分引导
- [ ] Day 1-2：低分引导模板
- [ ] Day 3：评分API + 触发逻辑
- [ ] Day 4：前端展示（雷达图+建议）
- [ ] Day 5：测试 + 修复

**交付物**：
- ✅ 评分功能（5维评分）
- ✅ 低分创意引导（直接给建议）
- ✅ 评分展示（雷达图+专家原话）
- ❌ 中分/高分暂用现有流程

**测试创意**：
1. 低分创意："做一个APP"（极度模糊）
2. 边界创意：评分4.2（灰色区）
3. 中分创意：暂用原流程

---

### 第二期（2周）：中分优化

**目标**：为大多数用户提供优化建议

#### Week 1: 建议生成
- [ ] Day 1-2：中分优化模板
- [ ] Day 3-4：薄弱项识别算法
- [ ] Day 5：建议生成逻辑

#### Week 2: 集成测试
- [ ] Day 1-2：前端问卷组件（可选填）
- [ ] Day 3：生成计划书（标注假设）
- [ ] Day 4-5：测试 + 优化

**交付物**：
- ✅ 中分创意优化建议
- ✅ 初步商业计划书（标注假设）
- ✅ 不强制填写问卷
- ❌ 高分验证暂用现有流程

**测试创意**：
1. 中分创意："自由职业者时间管理工具，订阅制99元/月"
2. 边界创意：评分7.2（灰色区）

---

### 第三期（3周）：高分验证

**目标**：为高质量创意提供投资级方案

#### Week 1: 验证系统
- [ ] Day 1-3：数据验证器（网上检索）
- [ ] Day 4-5：验证问卷设计

#### Week 2: 深度生成
- [ ] Day 1-2：投资级计划书模板
- [ ] Day 3：财务模型生成（Excel）
- [ ] Day 4：融资PPT生成
- [ ] Day 5：验证报告生成

#### Week 3: 集成优化
- [ ] Day 1-2：前端验证流程
- [ ] Day 3-4：测试 + 优化
- [ ] Day 5：文档 + 上线

**交付物**：
- ✅ 高分创意验证问卷（一次性）
- ✅ 网上检索验证
- ✅ 投资级商业计划书（30-50页）
- ✅ 财务模型（Excel）
- ✅ 融资PPT

**测试创意**：
1. 高分创意："已有200付费用户，65%留存率，融资500万"

---

## 💰 九、积分定价策略

| 等级 | 消耗积分 | 原因 | 包含内容 |
|------|---------|------|---------|
| 低分引导 | 50 | AI调用少（1-2次） | 建议文档（5-8页） |
| 中分优化 | 200 | AI调用中（3-5次） | 建议+初步计划书（15-25页） |
| 高分验证 | 800 | AI调用多（10+次）+ 网上检索 | 投资级计划书+财务模型+PPT+验证报告 |

**灰色区特殊处理**：
- 4.0-5.0：先收50积分（低分价格），补充信息后若升级到中分，补差价150积分
- 7.0-7.5：先收200积分（中分价格），选择验证后，补差价600积分

---

## ✅ 十、总结清单

### 核心特性
- [x] 5维评分模型（目标客户、需求场景、核心价值、商业模式、可信度）
- [x] 权重可配置化
- [x] 灰色区缓冲机制
- [x] 高透明度展示（专家原话+雷达图）

### 三级处理
- [x] 低分：AI讨论后直接给建议
- [x] 中分：提示薄弱项+给建议，不强制填写
- [x] 高分：一次性问卷验证+网上检索

### 数据处理
- [x] 新建CreativeMaturityAdvice表
- [x] 数据仅保留1天，自动清理
- [x] 最小化改动现有代码

### 商业模式
- [x] 积分付费：低分50/中分200/高分800
- [x] 不限制使用次数

### 分期实施
- [x] 第一期（2周）：评分+低分引导
- [x] 第二期（2周）：中分优化
- [x] 第三期（3周）：高分验证

---

## 🚀 准备开始开发！

所有关键决策已确认，方案已完善。

**下一步**：开始第一期开发（评分引擎 + 低分引导）

**预计时间**：2周
**完成后**：测试验证，无问题后启动第二期

---

**创建日期**：2025-01-09
**最后更新**：2025-01-09
**状态**：✅ 待开发
