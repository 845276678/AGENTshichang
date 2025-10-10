# 创意成熟度分级处理方案 - 增强版

> **版本**: v4.1 - Enhanced
> **日期**: 2025-01-09
> **状态**: 待开发
> **基于**: v4.0 Final + 深度审阅反馈

---

## 📋 核心决策总结

| 维度 | 决策 |
|------|------|
| **评分引擎** | 第一期规则版，后续加语义匹配 |
| **分数阈值** | 4.0/5.0/7.0/7.5，保留灰色区，用户选择 |
| **评分维度** | 5维（目标客户、需求场景、核心价值、商业模式、可信度） |
| **权重配置** | 可配置化，初期均等权重，支持版本管理与回滚 |
| **评分透明度** | 高透明，展示专家原话+5维雷达图+评分原因块 |
| **低分引导** | AI讨论后直接给建议，融合The Mom Test验证清单 |
| **中分处理** | 提示薄弱项+给建议，不强制填写 |
| **高分验证** | 一次性问卷（10-15题），支持草稿保存、分段提交 |
| **置信度机制** | 明确计算口径，低置信度标注假设部分 |
| **数据保存** | 新建表，默认保留7天（支持延长至30天或立即删除） |
| **架构改动** | 最小化，新增文件为主 |
| **商业模式** | 积分付费，高分创意消耗更多积分，支持补差价 |
| **用户配额** | 不限制 |
| **分期实施** | 三期依次上线，每期标定测试后再上下一期 |

---

## 🎯 一、核心理念（融合The Mom Test）

**按"成熟度"而非"好坏"分级 + The Mom Test验证原则**

所有创意都经过AI专家讨论，根据成熟度提供不同深度的建议：

- **低分（1-4）** = 想法阶段 → **直接给聚焦建议 + Mom Test验证清单**
- **中分（5-7）** = 方向阶段 → **提示薄弱项+给优化建议**
- **高分（7.5-10）** = 方案阶段 → **验证数据真实性+给深度方案**

### The Mom Test 三大原则

1. **谈论对方生活，而非你的主意**
2. **询问具体的过去，而非想象的未来**
3. **少说多听，挖掘真实痛点**

---

## 📊 二、评分机制（增强版）

### 2.1 五维评估模型

| 维度 | 权重 | 评估问题 | 低分特征 | 中分特征 | 高分特征 |
|------|------|---------|---------|---------|------------|
| 🎯 目标客户 | 20% | 是否明确具体？ | 模糊/泛化 | 有方向但不具体 | 清晰画像 + **已访谈5+用户** |
| 📍 需求场景 | 20% | 什么场景下用？ | 不清楚 | 有但未聚焦 | 具体场景 + **有过去30天真实案例** |
| 💡 核心价值 | 25% | 解决什么问题？ | 不清楚/宽泛 | 有但未聚焦 | 聚焦+差异化 + **用户愿意付费** |
| 💰 商业模式 | 20% | 怎么赚钱？ | 未提及 | 有想法但不完整 | 清晰路径 + **已有真实付费** |
| 📈 可信度 | 15% | 有数据支撑吗？ | 纯想象 | 部分假设 | 有数据/已验证 + **可追溯证据** |

**权重配置化**：存储在配置表，支持动态调整、A/B测试、版本管理与回滚

---

### 2.2 分数阈值（含灰色区）

```
1.0 ━━━━━━━━━━━ 4.0 ┈┈┈┈┈ 5.0 ━━━━━━━ 7.0 ┈┈┈ 7.5 ━━━━━━━━ 10.0
    低分区          灰色区    中分区      灰色区      高分区
```

**灰色区处理**：
- **4.0-5.0**：提示"您的创意介于想法和方向之间，回答3个问题可获得更准确评估"
  - 前端按钮："补充信息（免费）" / "暂时跳过"
  - 补充后重新评分，如升级到中分，补差价150积分
- **7.0-7.5**：提示"您的创意已较成熟，补充验证数据可获得投资级计划书"
  - 前端按钮："开始验证（需补600积分）" / "保存当前计划书"
  - 用户可随时返回继续

---

### 2.3 评分引擎（规则版 + The Mom Test）

#### **2.3.1 核心评分逻辑**

```typescript
class MaturityScorer {

  /**
   * 分析AI专家讨论，计算成熟度评分
   */
  analyze(aiMessages: AIMessage[], bids: Record<string, number>) {
    // 1. 过滤无效数据（The Mom Test）
    const { validMessages, invalidSignals } = this.filterInvalidData(aiMessages);

    // 2. 识别有效信号（The Mom Test）
    const validSignals = this.detectValidSignals(aiMessages);

    // 3. 评估5个维度
    const dimensions = {
      targetCustomer: this.scoreDimension('targetCustomer', validMessages, validSignals),
      demandScenario: this.scoreDimension('demandScenario', validMessages, validSignals),
      coreValue: this.scoreDimension('coreValue', validMessages, validSignals),
      businessModel: this.scoreDimension('businessModel', validMessages, validSignals),
      credibility: this.scoreDimension('credibility', validMessages, validSignals)
    };

    // 4. 加权平均
    const weights = this.getWeights(); // 从配置表读取
    const totalScore = Object.keys(dimensions).reduce((sum, dim) => {
      return sum + dimensions[dim].score * weights[dim];
    }, 0);

    // 5. 计算置信度（明确口径）
    const confidence = this.calculateConfidence(dimensions, validSignals, invalidSignals);

    // 6. 确定等级
    const level = this.determineLevel(totalScore);

    // 7. 提取专家共识
    const expertConsensus = this.extractExpertConsensus(aiMessages, bids);

    // 8. 生成评分原因块
    const scoringReasons = this.generateScoringReasons(dimensions, validSignals, invalidSignals);

    return {
      totalScore,
      level,
      dimensions,
      expertConsensus,
      confidence,
      scoringReasons, // 新增：评分原因块
      validSignals,   // 新增：有效信号统计
      invalidSignals, // 新增：无效信号统计
      scoringVersion: '1.0.0'
    };
  }
}
```

---

#### **2.3.2 无效数据识别与抑制（The Mom Test）**

**无效数据的三个典型**：
1. **赞美、奉承**："太棒了"、"很喜欢"、"有潜力"
2. **泛泛而谈**："我经常"、"我总是"、"我将会"
3. **未来承诺**："会买"、"肯定会用"、"一定会成功"

**抑制规则**：

```typescript
/**
 * 过滤无效数据
 */
private filterInvalidData(aiMessages: AIMessage[]) {
  const validMessages = [];
  const invalidSignals = {
    compliments: 0,    // 赞美次数
    generalities: 0,   // 泛泛而谈
    futurePromises: 0  // 未来保证
  };

  const complimentKeywords = ['太棒了', '很喜欢', '不错的主意', '有潜力'];
  const generalityKeywords = ['我经常', '我总是', '我绝不', '我将会', '我可能'];
  const futureKeywords = ['会买', '将会使用', '一定会', '肯定会'];

  for (const msg of aiMessages) {
    let isInvalid = false;

    // 检测赞美
    if (complimentKeywords.some(kw => msg.content.includes(kw))) {
      invalidSignals.compliments++;
      isInvalid = true; // 完全过滤
    }

    // 检测泛泛而谈
    if (generalityKeywords.some(kw => msg.content.includes(kw))) {
      invalidSignals.generalities++;
      // 不完全过滤，但降低置信度
    }

    // 检测未来保证
    if (futureKeywords.some(kw => msg.content.includes(kw))) {
      invalidSignals.futurePromises++;
      // 不完全过滤，但降低可信度分数
    }

    if (!isInvalid) {
      validMessages.push(msg);
    }
  }

  return { validMessages, invalidSignals };
}
```

**对评分的影响**：
- **赞美**：完全过滤，不计入评分
- **泛泛而谈**：保留但降低置信度（-0.1 per 5次）
- **未来保证**：保留但降低可信度维度分数（-0.5 per 3次）

---

#### **2.3.3 有效信号识别与加权（The Mom Test）**

**证据等级表**：

| 证据类型 | 示例 | 权重 |
|---------|------|------|
| **🏆 票据/链接/截图** | 付费截图、用户访谈录音、数据报表 | **+1.0** |
| **⭐ 具体数字与时间** | "上周三，花了2小时"、"每月付99元" | **+0.5** |
| **📝 模糊描述** | "有一些用户"、"大概需要" | **0** |
| **❌ 未来承诺** | "我会买"、"应该有需求" | **-0.5** |

**有效信号识别**：

```typescript
/**
 * 识别有效信号（The Mom Test）
 */
private detectValidSignals(aiMessages: AIMessage[]) {
  const validSignals = {
    specificPast: 0,      // 具体的过去（"上次"、"上周"）
    realSpending: 0,      // 真实花费（"每月付"、"已付费"）
    painPoints: 0,        // 痛点故事（"丢了客户"、"损失"）
    userIntroductions: 0, // 用户介绍（"介绍"、"认识"）
    evidence: 0           // 可验证证据（"截图"、"数据"、"链接"）
  };

  const specificPastKeywords = ['上次', '上周', '去年', '花了', '最近一次'];
  const realSpendingKeywords = ['每月付', '每年花', '已经付费', '现在用', '订阅了'];
  const painPointKeywords = ['丢了客户', '损失', '浪费了', '痛苦', '被迫'];
  const introductionKeywords = ['介绍', '认识', '朋友也有', '可以问'];
  const evidenceKeywords = ['截图', '数据', '链接', '报告', '录音', '文件'];

  for (const msg of aiMessages) {
    if (specificPastKeywords.some(kw => msg.content.includes(kw))) {
      validSignals.specificPast++;
    }
    if (realSpendingKeywords.some(kw => msg.content.includes(kw))) {
      validSignals.realSpending++;
    }
    if (painPointKeywords.some(kw => msg.content.includes(kw))) {
      validSignals.painPoints++;
    }
    if (introductionKeywords.some(kw => msg.content.includes(kw))) {
      validSignals.userIntroductions++;
    }
    if (evidenceKeywords.some(kw => msg.content.includes(kw))) {
      validSignals.evidence++;
    }
  }

  return validSignals;
}
```

**对评分的加权影响**：

```typescript
/**
 * 根据有效信号调整分数
 */
private applyValidSignalBonus(dimensions, validSignals) {
  // 有真实付费证据 → 商业模式加分
  if (validSignals.realSpending > 0) {
    dimensions.businessModel.score += Math.min(validSignals.realSpending * 0.5, 2);
  }

  // 有多个具体过去案例 → 可信度加分
  if (validSignals.specificPast > 2) {
    dimensions.credibility.score += Math.min(validSignals.specificPast * 0.3, 1.5);
  }

  // 有痛点故事 → 核心价值加分
  if (validSignals.painPoints > 0) {
    dimensions.coreValue.score += Math.min(validSignals.painPoints * 0.4, 1);
  }

  // 有可验证证据 → 可信度大幅加分
  if (validSignals.evidence > 0) {
    dimensions.credibility.score += Math.min(validSignals.evidence * 1.0, 2);
  }

  return dimensions;
}
```

---

#### **2.3.4 置信度（Confidence）计算口径**

**明确定义**：置信度表示评分的可靠程度（0-1），不是创意质量本身。

**计算公式**：

```typescript
/**
 * 计算置信度（明确口径）
 */
private calculateConfidence(
  dimensions: Record<string, DimensionScore>,
  validSignals: ValidSignals,
  invalidSignals: InvalidSignals
): number {
  let confidence = 0.9; // 基础置信度

  // 1. 维度证据充分度（最重要）
  const avgEvidenceCount = Object.values(dimensions)
    .reduce((sum, dim) => sum + dim.evidence.length, 0) / 5;

  if (avgEvidenceCount < 1) {
    confidence -= 0.2; // 证据太少，降低置信度
  } else if (avgEvidenceCount > 3) {
    confidence += 0.05; // 证据充足，提升置信度
  }

  // 2. 有效信号加成
  const totalValidSignals = Object.values(validSignals).reduce((a, b) => a + b, 0);
  confidence += Math.min(totalValidSignals * 0.02, 0.1); // 每个有效信号+0.02，最多+0.1

  // 3. 无效信号惩罚（The Mom Test）
  if (invalidSignals.futurePromises > 3) {
    confidence -= 0.15; // 太多未来保证，降低置信度
  }
  if (invalidSignals.generalities > 5) {
    confidence -= 0.1; // 太多泛泛而谈，降低置信度
  }

  // 4. 专家意见一致性
  const scoreDifferences = Object.values(dimensions).map(d => d.score);
  const stdDev = this.calculateStdDev(scoreDifferences);
  if (stdDev > 2.5) {
    confidence -= 0.1; // 专家意见分歧大，降低置信度
  }

  // 5. 归一化到 [0.5, 1.0] 区间
  return Math.max(0.5, Math.min(1.0, confidence));
}
```

**置信度分级**：
- **≥ 0.85**：高置信度 ✅ 评分可靠
- **0.70 - 0.84**：中置信度 ⚠️ 评分基本可靠，但建议补充信息
- **< 0.70**：低置信度 ⚠️ 建议补充更多证据或重新评估

---

#### **2.3.5 评分原因块（固定呈现模板）**

**目标**：让用户清楚知道"为什么是这个分数"，提升可解释性。

**模板结构**：

```typescript
/**
 * 生成评分原因块
 */
private generateScoringReasons(
  dimensions: Record<string, DimensionScore>,
  validSignals: ValidSignals,
  invalidSignals: InvalidSignals
): ScoringReason[] {
  const reasons = [];

  // 为每个维度生成原因块
  for (const [dimName, dimScore] of Object.entries(dimensions)) {
    const reason: ScoringReason = {
      dimension: dimName,
      score: dimScore.score,
      status: dimScore.status,
      expertQuotes: dimScore.evidence.slice(0, 3), // 最多3条专家原话
      machineReason: this.generateMachineReason(dimName, dimScore, validSignals, invalidSignals)
    };
    reasons.push(reason);
  }

  return reasons;
}

/**
 * 生成机器提取理由
 */
private generateMachineReason(
  dimName: string,
  dimScore: DimensionScore,
  validSignals: ValidSignals,
  invalidSignals: InvalidSignals
): string {
  let reason = '';

  if (dimName === 'businessModel') {
    if (validSignals.realSpending > 0) {
      reason = `✅ 检测到 ${validSignals.realSpending} 处真实付费证据，商业模式可信度高`;
    } else if (invalidSignals.futurePromises > 2) {
      reason = `⚠️ 检测到 ${invalidSignals.futurePromises} 处未来承诺，缺少真实付费验证`;
    } else {
      reason = `⚠️ 未检测到真实付费证据，建议补充用户访谈数据`;
    }
  }

  if (dimName === 'credibility') {
    if (validSignals.evidence > 0) {
      reason = `✅ 检测到 ${validSignals.evidence} 处可验证证据（截图/数据/链接），可信度高`;
    } else if (validSignals.specificPast > 2) {
      reason = `✅ 检测到 ${validSignals.specificPast} 处具体过去案例，有一定可信度`;
    } else {
      reason = `⚠️ 缺少可验证证据，建议提供具体数据或访谈记录`;
    }
  }

  // ... 其他维度类似逻辑

  return reason;
}
```

**前端呈现示例**：

```markdown
## 📊 评分原因详解

### 🎯 目标客户：7.5/10 ✅ 较明确

**专家反馈**：
1. 老王："自由职业者定位不错，但具体是哪个细分领域？设计师？程序员？"
2. 李博："目标人群有方向，但建议进一步聚焦到月收入2-5万的设计师群体"

**机器分析**：
✅ 检测到 2 处具体过去案例，用户画像有一定清晰度
⚠️ 建议：补充5-10个目标用户访谈记录，明确细分人群

---

### 💰 商业模式：8.5/10 ✅ 清晰

**专家反馈**：
1. 李博："订阅制99元/月是标准打法，定价合理"
2. 老王："有200个付费用户，这就是真金白银的验证！"

**机器分析**：
✅ 检测到 3 处真实付费证据，商业模式可信度高
✅ 检测到 1 处可验证证据（付费截图），可信度进一步提升

---

### 📈 可信度：6.0/10 ⚠️ 需验证

**专家反馈**：
1. 阿伦："65%留存率是哪个周期？第1个月还是第3个月？"
2. 艾克斯："建议补充第3、6个月留存数据"

**机器分析**：
⚠️ 检测到 2 处未来承诺，缺少长期数据验证
⚠️ 建议：补充第3、6个月留存率数据，增强可信度
```

---

#### **2.3.6 防刷分机制（增强版）**

**问题**：用户可能通过关键词堆砌刷分。

**解决方案**：

1. **关键词边际递减**（已有）
2. **语义近似去重**（新增）
3. **负样本词表**（新增）
4. **重复同义表达检测**（新增）

```typescript
/**
 * 关键词去重（语义近似）
 */
private deduplicateConcerns(concerns: AIMessage[]) {
  const seen = new Set();
  return concerns.filter(msg => {
    const key = this.extractKeyIssue(msg.content);

    // 1. 完全相同
    if (seen.has(key)) return false;

    // 2. 语义近似检测（简化版）
    for (const seenKey of seen) {
      if (this.isSemanticallyClose(key, seenKey)) {
        return false; // 语义相似，去重
      }
    }

    seen.add(key);
    return true;
  });
}

/**
 * 语义近似判断（简化版）
 */
private isSemanticallyClose(str1: string, str2: string): boolean {
  // 1. Levenshtein距离
  const distance = this.levenshteinDistance(str1, str2);
  if (distance <= 3) return true;

  // 2. 同义词表匹配
  const synonyms = {
    '目标用户': ['客户群体', '用户画像', '目标人群'],
    '核心价值': ['差异化', '独特优势', '核心卖点'],
    // ... 更多同义词
  };

  for (const [base, syns] of Object.entries(synonyms)) {
    if ((str1.includes(base) || syns.some(s => str1.includes(s))) &&
        (str2.includes(base) || syns.some(s => str2.includes(s)))) {
      return true;
    }
  }

  return false;
}

/**
 * 负样本词表（反问/否定）
 */
private isNegativeSample(content: string): boolean {
  const negativeKeywords = [
    '不是', '并非', '不会', '绝不', '从不',
    '反而', '相反', '但是', '然而', '虽然'
  ];

  return negativeKeywords.some(kw => content.includes(kw));
}
```

---

### 2.4 阈值与权重版本化（工程化）

#### **2.4.1 版本管理机制**

**问题**：阈值和权重需要动态调整，但不能直接改生产配置。

**解决方案**：版本化 + 灰度发布 + 回滚机制

**数据库Schema**：

```prisma
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

  // 阈值配置
  thresholdLowMax   Float    @default(4.0)               // 低分上限
  thresholdMidMin   Float    @default(5.0)               // 中分下限
  thresholdMidMax   Float    @default(7.0)               // 中分上限
  thresholdHighMin  Float    @default(7.5)               // 高分下限

  description       String?                              // 配置说明
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // 标定数据
  calibrationSetSize Int?    @map("calibration_set_size") // 标定集样本数
  calibrationAccuracy Float? @map("calibration_accuracy") // 标定准确率

  @@map("scoring_weight_config")
}
```

---

#### **2.4.2 小样本标定与回放对比**

**流程**：

```
1. 准备标定集（≥50条已人工评分的创意）
   ↓
2. 新版本配置在测试环境运行
   ↓
3. 回放对比：新版本 vs 旧版本 vs 人工评分
   ↓
4. 计算准确率、召回率、F1-score
   ↓
5. 如果准确率 ≥ 85%，上线灰度发布（10% → 50% → 100%）
   ↓
6. 监控线上指标，如有异常立即回滚
```

**代码实现**：

```typescript
/**
 * 标定与回放系统
 */
class ScoringCalibration {

  /**
   * 回放对比
   */
  async replayComparison(
    calibrationSet: CalibrationIdea[],
    newVersion: string,
    oldVersion: string
  ) {
    const results = [];

    for (const idea of calibrationSet) {
      // 使用新版本评分
      const newScore = await this.scoreWithVersion(idea, newVersion);

      // 使用旧版本评分
      const oldScore = await this.scoreWithVersion(idea, oldVersion);

      // 对比人工标注
      const humanScore = idea.humanScore;

      results.push({
        ideaId: idea.id,
        humanScore,
        newScore: newScore.totalScore,
        oldScore: oldScore.totalScore,
        newError: Math.abs(newScore.totalScore - humanScore),
        oldError: Math.abs(oldScore.totalScore - humanScore)
      });
    }

    // 计算指标
    const metrics = this.calculateMetrics(results);

    return {
      results,
      metrics,
      recommendation: metrics.newAccuracy > metrics.oldAccuracy ? 'APPROVE' : 'REJECT'
    };
  }

  /**
   * 计算准确率
   */
  private calculateMetrics(results: ComparisonResult[]) {
    const newErrors = results.map(r => r.newError);
    const oldErrors = results.map(r => r.oldError);

    const newMAE = newErrors.reduce((a, b) => a + b, 0) / newErrors.length;
    const oldMAE = oldErrors.reduce((a, b) => a + b, 0) / oldErrors.length;

    return {
      newAccuracy: 1 - (newMAE / 10), // 转换为准确率
      oldAccuracy: 1 - (oldMAE / 10),
      improvement: ((oldMAE - newMAE) / oldMAE) * 100 // 改进百分比
    };
  }
}
```

---

#### **2.4.3 灰度发布与回滚机制**

**灰度发布**：

```typescript
/**
 * 根据用户ID分流不同版本
 */
async function getActiveWeightConfig(userId?: string): Promise<ScoringWeightConfig> {
  // 1. 检查是否有灰度发布的版本
  const canaryConfig = await prisma.scoringWeightConfig.findFirst({
    where: { isCanary: true }
  });

  if (canaryConfig && userId) {
    // 2. 根据用户ID哈希决定是否使用灰度版本
    const hash = simpleHash(userId);
    const percentage = canaryConfig.canaryPercentage || 0;

    if (hash % 100 < percentage) {
      console.log(`User ${userId} using canary version ${canaryConfig.version}`);
      return canaryConfig;
    }
  }

  // 3. 默认使用稳定版本
  const activeConfig = await prisma.scoringWeightConfig.findFirst({
    where: { isActive: true }
  });

  return activeConfig || getDefaultConfig();
}
```

**回滚机制**：

```typescript
/**
 * 立即回滚到上一个稳定版本
 */
async function rollbackToStableVersion() {
  // 1. 找到当前灰度版本
  const canaryConfig = await prisma.scoringWeightConfig.findFirst({
    where: { isCanary: true }
  });

  if (canaryConfig) {
    // 2. 禁用灰度版本
    await prisma.scoringWeightConfig.update({
      where: { id: canaryConfig.id },
      data: { isCanary: false, canaryPercentage: 0 }
    });

    console.log(`Rolled back canary version ${canaryConfig.version}`);
  }

  // 3. 记录回滚事件
  await prisma.versionRollbackLog.create({
    data: {
      fromVersion: canaryConfig?.version,
      reason: 'Manual rollback or anomaly detected',
      timestamp: new Date()
    }
  });
}
```

---

## 🔴 三、低分创意（1-4分）：直接建议型 + The Mom Test

### 3.1 核心策略

AI专家讨论后，**直接给出聚焦建议 + The Mom Test 验证清单**，不让用户选择太多。

### 3.2 生成内容模板（融合The Mom Test）

```markdown
# 您的创意需要进一步聚焦 📍

**评分**: 3.5/10（成熟度：想法阶段）
**置信度**: 85%（评分可信）

---

## 📊 五维评估

[雷达图展示]

| 维度 | 得分 | 状态 | 专家反馈 | 机器分析 |
|------|------|------|---------|---------|
| 🎯 目标客户 | 2.5/10 | ❌ 待明确 | 老王："你这是给谁用的？" | ⚠️ 未检测到具体用户群体 |
| 📍 需求场景 | 3.0/10 | ❌ 待明确 | 艾克斯："什么场景下用户会用这个？" | ⚠️ 缺少过去30天真实案例 |
| 💡 核心价值 | 4.0/10 | ⚠️ 待聚焦 | 小琳："和现有产品的区别在哪？" | ⚠️ 未检测到差异化优势 |
| 💰 商业模式 | 3.5/10 | ❌ 待定义 | 李博:"怎么赚钱？订阅还是一次性付费？" | ⚠️ 未检测到真实付费证据 |
| 📈 可信度 | 3.0/10 | ❌ 需验证 | 阿伦："建议先做用户访谈" | ⚠️ 检测到3处未来承诺，缺少验证 |

**平均分**: 3.2/10

---

## ⚠️ 为什么是低分？（基于The Mom Test分析）

我们的AI专家发现您的创意缺少**真实用户验证**：

❌ **检测到5处"未来保证"**：
- "用户会喜欢"、"一定有需求"、"应该会买" → 这些都是未来的想象

❌ **缺少具体的过去案例**：
- 没有提到"上次用户遇到这个问题是什么时候"
- 没有提到"用户现在如何解决这个问题"

❌ **缺少真实付费证据**：
- 没有提到"用户现在为类似解决方案花多少钱"

⚠️ **提示**：根据**The Mom Test**原则，只有**已经发生的事实**才能证明需求的真实性。

---

## 💡 AI专家给您的建议

基于五位专家的讨论，我们建议您：

### 第一步：明确目标客户 🎯

**建议聚焦**：自由职业者（设计师、程序员、咨询师）

**理由**：
- 老王：\"这个人群付费意愿高，市场成熟\"
- 李博：\"自由职业者对时间管理工具的需求最强烈\"

**❌ 不要这样做**：
- \"你觉得自由职业者会用吗？\" → 对方会为了照顾你而撒谎

**✅ The Mom Test 验证方法**：

1. **找到10个自由职业者并聊天**
   - 问："你上次遇到时间管理问题是什么时候？"
   - 问："你现在怎么解决这个问题？"
   - 问："你为此花了多少时间/金钱？"

2. **记录真实数据**（只记录已经发生的事实）
   | 问题 | 记录 |
   |------|------|
   | 和几个人聊过？ | ___ 人 |
   | 他们上次遇到问题是什么时候？ | （具体日期） |
   | 他们现在如何解决？ | （具体工具） |
   | 他们为此花了多少钱？ | ___ 元/年 |

3. **识别真实需求 vs 礼貌敷衍**
   - ❌ "这个想法太棒了！" → 赞美（无效）
   - ❌ "我经常遇到这个问题" → 泛泛而谈（无效）
   - ❌ "我绝对会买" → 未来承诺（无效）
   - ✅ "上周我因为这个丢了一个客户" → 真实痛点
   - ✅ "我现在每月为XX工具付99元" → 真实付费

---

### 第二步：聚焦需求场景 📍

**建议场景**：项目时间追踪 + 时薪计算

**理由**：
- 艾克斯：\"自由职业者最关心的是'这个项目值不值得做'\"
- 小琳：\"时薪可视化能给用户直观的价值感\"

**✅ The Mom Test 验证方法**：

**问这些问题**：
1. "告诉我你最近一次管理项目时间的具体情况"
2. "那件事的影响是什么？（浪费了多少时间/钱）"
3. "你有尝试其他办法吗？为什么没用？"

**不要问这些**：
- ❌ "你会用时薪追踪功能吗？" → 未来的谎言
- ❌ "你觉得时薪可视化有用吗？" → 引导赞美

---

### 第三步：定义差异化价值 💡

**建议定位**：不是\"又一个时间管理工具\"，而是\"自由职业者的时薪优化顾问\"

**理由**：
- 阿伦：\"市面上时间管理工具太多了，你得有独特卖点\"
- 老王：\"时薪优化这个角度很好，直接和赚钱挂钩\"

**✅ The Mom Test 验证方法**：

**问这些问题**：
1. "你现在用什么工具管理时间？每年花多少钱？"
2. "那个工具最不满意的地方是什么？"
3. "如果有AI时薪分析，你愿意把预算转移过来吗？"

**记录替代方案**：
| 竞品 | 用户数量 | 年费用 | 最不满意之处 |
|------|---------|--------|-------------|
| Toggl | 3人 | 99元/人 | 缺少AI分析 |
| ... | ... | ... | ... |

---

### 第四步：验证需求真实性 ✅

**建议方式**：

1. **用户访谈**（5-10人）
   - 用**The Mom Test问题清单**（见下方）
   - 记录**已经发生的事实**，不记录未来承诺

2. **竞品分析**（3个产品）
   - Toggl、RescueTime、Clockify
   - 分析优缺点、定价、用户评价

3. **MVP原型**
   - 用Figma画出核心界面
   - 收集10-20人的反馈

---

## 📋 The Mom Test 问题清单（必读！）

**❌ 永远不要问这些问题**：
1. "你觉得我的主意好吗？" → 对方会为了照顾你而撒谎
2. "你会买这个产品吗？" → 未来的保证都是乐观的谎言
3. "你愿意花多少钱？" → 人们会为了说你想听的而撒谎
4. "你想要什么功能？" → 用户知道问题，但不知道解决方案

**✅ 永远要问这些问题**：
1. "你上次遇到XX问题是什么时候？" → 具体的过去
2. "你现在怎么解决这个问题？" → 替代方案
3. "你为此花了多少时间/金钱？" → 真实成本
4. "告诉我上次问题发生的具体情况" → 挖掘痛点故事
5. "那件事的影响是什么？" → 了解问题严重性
6. "你有尝试其他办法吗？为什么没用？" → 了解现有方案的问题
7. "我还可以问谁？" → 获得更多潜在用户

---

## 💼 参考案例

**Dropbox** 创始人：
- ❌ 没有问"你觉得云存储是好主意吗？"
- ✅ 拍了个演示视频，看有多少人真的注册等待名单
- 结果：7万人注册 → 验证了真实需求

**Airbnb** 创始人：
- ❌ 没有问"你会在陌生人家里住吗？"
- ✅ 自己先出租自己的公寓，看有多少人真的付费
- 结果：3个人付费住宿 → 验证了真实需求

---

## 🎁 完成后的下一步

完成以上4步后，您将获得：
- ✅ 明确的目标客户和需求场景
- ✅ 清晰的差异化价值定位
- ✅ 真实的用户验证数据

**届时您可以重新提交创意，我们将为您生成详细的商业计划书！**

[重新提交创意] [下载The Mom Test验证清单PDF]
```

### 3.3 积分消耗

- 低分引导：**50积分**
- 交付物：建议文档（5-8页） + The Mom Test验证清单PDF

---

## 🟡 四、中分创意（5-7分）：提示+建议型

### 4.1 核心策略

AI专家讨论后，**提示薄弱维度+给优化建议**，不强制填写任何内容。

### 4.2 生成内容模板（优化版）

```markdown
# 您的创意基础良好，还有优化空间 ⭐

**评分**: 6.5/10（成熟度：方向阶段）
**置信度**: 88%（评分基本可信）

---

## 📊 五维评估

[雷达图展示]

| 维度 | 得分 | 状态 | 专家反馈 | 机器分析 |
|------|------|------|---------|---------|
| 🎯 目标客户 | 8.0/10 | ✅ 清晰 | 老王："自由职业者定位很好" | ✅ 检测到2处具体用户群体 |
| 📍 需求场景 | 7.0/10 | ✅ 明确 | 艾克斯："时间追踪场景清晰" | ✅ 检测到1处过去30天案例 |
| 💡 核心价值 | 6.5/10 | ⚠️ 需聚焦 | 小琳："时薪优化是好卖点，但需要更具体" | ⚠️ 差异化优势不够明显 |
| 💰 商业模式 | 5.0/10 | ⚠️ 待完善 | 李博："订阅制是对的，但定价策略需要细化" | ⚠️ 未检测到真实付费证据 |
| 📈 可信度 | 6.0/10 | ⚠️ 需验证 | 阿伦："建议做MVP验证" | ⚠️ 检测到1处未来承诺 |

**平均分**: 6.5/10

---

## ✨ 专家认可的优势

✅ **目标客户清晰**：自由职业者是高付费意愿群体
✅ **需求场景明确**：时间追踪+时薪计算是刚需
✅ **核心价值独特**：时薪优化角度有差异化

---

## 🔍 待优化的薄弱项（基于The Mom Test）

基于专家讨论，以下2个方面需要进一步完善：

### 1. 商业模式完整度（5.0/10）⚠️

**专家反馈**：
- 李博："订阅制99元/月，定价依据是什么？"
- 老王："获客成本多少？怎么获客？"

**机器分析**：
- ⚠️ 未检测到真实付费证据
- ⚠️ 建议：补充用户现在为类似工具付费的数据

**✅ The Mom Test 验证建议**：

**不要问**：
- ❌ "你愿意为这个功能付99元吗？" → 未来承诺

**要问**：
1. "你现在用什么时间管理工具？每月花多少钱？"
2. "如果有更好的工具，你愿意把这笔预算转移过来吗？"
3. "你的预算上限是多少？超过多少你就不会考虑了？"

**补充建议**：
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

### 2. 可信度（6.0/10）⚠️

**专家反馈**：
- 阿伦："建议先做MVP验证需求"
- 艾克斯："没有用户数据，风险较高"

**机器分析**：
- ⚠️ 检测到1处未来承诺（"用户会喜欢AI分析"）
- ⚠️ 建议：用真实用户测试代替未来想象

**✅ The Mom Test 验证建议**：

**不要做**：
- ❌ 问"你觉得AI分析有用吗？" → 引导赞美

**要做**：
1. 开发最小可行原型（仅核心功能）
2. 邀请10个真实用户测试
3. 记录他们的真实行为：
   - 每天打开几次？
   - 使用哪些功能？
   - 哪里卡住了？
   - 是否愿意推荐给朋友？

**补充建议**：
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
2. **补充信息**：回答5个关键问题（基于The Mom Test），获得更精准的计划书
   - 问题1：你和几个目标用户聊过？他们最近一次遇到问题是什么时候？
   - 问题2：他们现在用什么工具？每月花多少钱？
   - 问题3：他们最不满意的地方是什么？
   - 问题4：你的MVP核心功能是什么（≤3个）？
   - 问题5：你打算如何验证需求（用户测试/问卷/访谈）？

[补充信息（免费）] [直接下载计划书]
```

### 4.3 积分消耗

- 中分优化：**200积分**
- 交付物：
  - 优化建议文档（10-15页）
  - 初步商业计划书（15-25页，标注假设）

---

## 🟢 五、高分创意（7.5-10分）：验证+深度方案

### 5.1 核心策略

AI专家讨论后，**一次性问卷验证数据（支持草稿保存），网上检索真实性，生成投资级计划书**。

### 5.2 生成内容模板（第一部分）

```markdown
# 恭喜！您的创意已具备投资价值 🎉

**评分**: 8.5/10（成熟度：方案阶段）
**置信度**: 92%（评分高度可信）

---

## 📊 五维评估

[雷达图展示]

| 维度 | 得分 | 状态 | 专家反馈 | 机器分析 |
|------|------|------|---------|---------|
| 🎯 目标客户 | 9.0/10 | ✅ 精准 | 老王："自由职业者定位很好，有200付费用户验证" | ✅ 检测到5处具体用户案例 |
| 📍 需求场景 | 8.5/10 | ✅ 清晰 | 艾克斯："时间追踪场景真实" | ✅ 检测到3处过去30天案例 |
| 💡 核心价值 | 8.0/10 | ✅ 独特 | 小琳："时薪优化是独特价值点" | ✅ 差异化优势明显 |
| 💰 商业模式 | 8.5/10 | ✅ 清晰 | 李博："订阅制模式成熟，定价合理" | ✅ 检测到3处真实付费证据 |
| 📈 可信度 | 8.5/10 | ✅ 已验证 | 阿伦："有真实用户数据，可信度高" | ✅ 检测到2处可验证证据 |

**平均分**: 8.5/10

---

## ✨ AI专家团队高度认可

⭐ **老王**："有200个付费用户，这就是真金白银的验证！"
⭐ **李博**："65%留存率如果属实，这是非常健康的指标。"
⭐ **艾克斯**："产品已经跑起来了，接下来是规模化问题。"
⭐ **小琳**："时薪可视化的体验设计很好。"
⭐ **阿伦**："这个方向有爆款潜力。"

---

## 🔍 数据验证环节（一次性问卷，支持草稿保存）

为了生成**投资级商业计划书**，我们需要验证部分关键数据的真实性。

**预计时间**：10-15分钟
**方式**：一次性问卷（15个问题，基于The Mom Test）+ 网上检索验证

**✅ 支持功能**：
- 草稿自动保存（每答1题自动保存）
- 稍后继续（可随时返回）
- 分段提交（不必一次性完成）

完成后，您将获得：
- ✅ 投资级商业计划书（30-50页）
- ✅ 详细财务模型（Excel，3年预测）
- ✅ 融资路演PPT（15-20页）
- ✅ 数据验证报告（标注哪些已验证，哪些需假设）
- ✅ 风险评估与应对方案
- ✅ 90天行动计划

---

## 📝 验证问卷（15个问题，基于The Mom Test）

### 💡 The Mom Test 提示

我们的问卷遵循**The Mom Test**原则：
- ✅ 关注**已经发生的事实**（而非未来想象）
- ✅ 询问**具体的过去**（而非泛泛而谈）
- ✅ 挖掘**真实行为**（而非口头承诺）

---

### 用户数据（5题）

**Q1. 200位付费用户主要来自？** *

□ 自然增长（口碑/SEO）
□ 付费广告（CAC: ___ 元）
□ 社群运营（哪些社群：___）
□ 内测朋友

💡 **为什么问这个**：了解获客渠道，评估规模化增长可行性

**⚠️ The Mom Test 提示**：
- 不要说"我觉得用户会从XX渠道来"
- 而是说"**过去3个月**，200个用户中，有XX个来自自然增长，XX个来自广告"

---

**Q2. 65%留存率是哪个周期？** *

□ 第1个月留存
□ 第3个月留存 ⭐ 重要
□ 第6个月留存

💡 **为什么问这个**：不同周期意义不同，直接影响LTV计算

**⚠️ The Mom Test 提示**：
- 不要说"我预计留存率是65%"
- 而是说"**根据过去6个月的数据**，第1个月留存率是65%"

---

**Q3. 用户主要职业分布？**

- 设计师：___%
- 程序员：___%
- 咨询师：___%
- 其他：___%

💡 **为什么问这个**：精准定位后续营销策略

**⚠️ The Mom Test 提示**：
- 基于**已注册用户的真实数据**，不要猜测

---

**Q4. 付费转化率？**

- 免费用户总数：___ 人
- 转化为付费的比例：___%

**⚠️ The Mom Test 提示**：
- 这应该是**已经发生**的转化，而非"预计转化率"

---

**Q5. 用户最喜欢的3个功能？**

1. ___
2. ___
3. ___

💡 **如何获取**：
- ✅ 用户调研/问卷
- ✅ 使用数据分析（功能使用频率）
- ❌ 不要基于自己的猜测

---

### 财务数据（5题）

**Q6. 300万GMV如何计算？** *

- 现有用户：___ 人
- **过去3个月月增长率**：___%
- 第一年目标用户：___ 人
- 客单价：___ 元/月
- 预计GMV：___ 万

💡 **我们将验证**：增长倍数是否合理，参考行业基准

**⚠️ The Mom Test 提示**：
- 不要说"我觉得能增长到2500人"
- 而是说"**基于过去3个月月均增长20%**，保守预计第一年能达到1500人"

---

**Q7. 获客成本？**

- 预计CAC：___ 元/人
- **过去3个月实际CAC**：___ 元/人（如果有）
- 新增用户：___ 人
- 获客预算：___ 万

**⚠️ The Mom Test 提示**：
- 如果已有付费广告数据，请填写**实际CAC**
- 如果没有，请基于行业基准估算

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

## 💾 草稿自动保存

- ✅ 每答1题自动保存
- ✅ 可随时退出，稍后继续
- ✅ 保存7天，支持延长至30天

[继续填写] [暂时保存并退出]

---

## 🔒 隐私声明

我们需要收集您的业务与财务数据，仅用于生成商业计划书。

✅ 传输加密（HTTPS）
✅ 存储加密（AES-256）
✅ **默认保留7天**，可选：
   - 立即删除
   - 延长至30天
✅ 不分享给第三方
✅ 可随时导出/删除

**数据主体权利**（符合《个保法》/GDPR）：
- ✅ 访问权：可随时查看您的数据
- ✅ 更正权：可随时修正错误数据
- ✅ 删除权：可随时删除您的数据
- ✅ 导出权：可导出为PDF/Excel

□ 我已阅读并同意隐私声明

[开始验证（10-15分钟）] [暂不验证，先生成基础版]
```

---

### 5.3 验证+检索逻辑（工程化）

#### **5.3.1 数据源适配器（可替换）**

```typescript
// src/lib/business-plan/data-verifier.ts

/**
 * 数据源适配器接口
 */
interface DataSourceAdapter {
  search(query: string): Promise<SearchResult[]>;
  getRateLimit(): RateLimitInfo;
}

/**
 * Bing Search API 适配器
 */
class BingSearchAdapter implements DataSourceAdapter {
  private apiKey: string;
  private endpoint = 'https://api.bing.microsoft.com/v7.0/search';
  private cache: Map<string, SearchResult[]> = new Map();
  private rateLimiter: RateLimiter;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.rateLimiter = new RateLimiter({
      maxRequests: 100,
      perMs: 60000 // 100次/分钟
    });
  }

  async search(query: string): Promise<SearchResult[]> {
    // 1. 检查缓存（TTL: 1小时）
    const cached = this.cache.get(query);
    if (cached && Date.now() - cached.timestamp < 3600000) {
      console.log(`Cache hit for query: ${query}`);
      return cached.results;
    }

    // 2. 速率限制
    await this.rateLimiter.wait();

    // 3. 调用API（带重试）
    const results = await this.fetchWithRetry(query, 3);

    // 4. 缓存结果
    this.cache.set(query, { results, timestamp: Date.now() });

    return results;
  }

  private async fetchWithRetry(query: string, retries: number): Promise<SearchResult[]> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.endpoint}?q=${encodeURIComponent(query)}`, {
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return this.parseResults(data);

      } catch (error) {
        console.error(`Retry ${i + 1}/${retries} failed:`, error);
        if (i === retries - 1) throw error;

        // 指数退避
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    return [];
  }

  private parseResults(data: any): SearchResult[] {
    return (data.webPages?.value || []).map((item: any) => ({
      title: item.name,
      url: item.url,
      snippet: item.snippet,
      confidence: 0.8
    }));
  }

  getRateLimit(): RateLimitInfo {
    return this.rateLimiter.getInfo();
  }
}

/**
 * 速率限制器
 */
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private perMs: number;

  constructor(config: { maxRequests: number; perMs: number }) {
    this.maxRequests = config.maxRequests;
    this.perMs = config.perMs;
  }

  async wait() {
    const now = Date.now();

    // 清理过期请求
    this.requests = this.requests.filter(t => now - t < this.perMs);

    // 如果达到限制，等待
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.perMs - (now - oldestRequest);
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }

  getInfo(): RateLimitInfo {
    const now = Date.now();
    const recentRequests = this.requests.filter(t => now - t < this.perMs);
    return {
      remaining: this.maxRequests - recentRequests.length,
      resetAt: new Date(this.requests[0] + this.perMs)
    };
  }
}
```

---

#### **5.3.2 数据验证器（增强版）**

```typescript
/**
 * 数据验证器
 */
class DataVerifier {
  private dataSource: DataSourceAdapter;

  constructor(dataSource: DataSourceAdapter) {
    this.dataSource = dataSource;
  }

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
    const searchResults = await this.dataSource.search(claim);

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
   * 提取关键声明
   */
  private extractClaim(answer: VerificationAnswer): string {
    // 使用简单的NLP或规则提取
    // 例如："自由职业者市场约2000万人" → "中国自由职业者数量 2000万"
    return answer.answer.toString();
  }
}
```

---

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

### 5.5 积分消耗与计费边界

#### **5.5.1 积分消耗**

- 高分验证+深度方案：**800积分**
- 交付物：
  - 投资级商业计划书（30-50页PDF）
  - 详细财务模型（Excel）
  - 融资路演PPT（20页）
  - 数据验证报告
  - 风险评估报告
  - 90天行动计划

#### **5.5.2 计费时机与失败回滚**

```typescript
/**
 * 高分验证流程（带计费保护）
 */
async function startHighScoreVerification(ideaId: string, userId: string) {
  // 1. 预检查：用户积分是否足够
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.credits < 800) {
    throw new Error('积分不足，需要800积分');
  }

  // 2. 创建待处理订单（暂不扣费）
  const order = await prisma.verificationOrder.create({
    data: {
      ideaId,
      userId,
      amount: 800,
      status: 'PENDING',
      createdAt: new Date()
    }
  });

  try {
    // 3. 用户填写问卷（支持草稿保存）
    const answers = await collectVerificationAnswers(ideaId, order.id);

    // 4. 验证数据（网上检索）
    const verificationResults = await verifyData(answers);

    // 5. 生成投资级计划书
    const businessPlan = await generateInvestmentGradePlan(ideaId, answers, verificationResults);

    // 6. 成功后扣费
    await prisma.$transaction([
      // 扣除积分
      prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: 800 } }
      }),
      // 更新订单状态
      prisma.verificationOrder.update({
        where: { id: order.id },
        data: { status: 'COMPLETED', completedAt: new Date() }
      }),
      // 保存计划书
      prisma.businessPlan.create({
        data: {
          ideaId,
          userId,
          content: businessPlan,
          verificationResults,
          createdAt: new Date()
        }
      })
    ]);

    return { success: true, businessPlan };

  } catch (error) {
    console.error('验证失败:', error);

    // 7. 失败回滚（不扣费）
    await prisma.verificationOrder.update({
      where: { id: order.id },
      data: { status: 'FAILED', failedAt: new Date(), error: error.message }
    });

    // 8. 通知用户
    throw new Error('验证失败，未扣除积分，请稍后重试');
  }
}
```

#### **5.5.3 幂等性保证**

```typescript
/**
 * 防止重复扣费（同一ideaId只能评分一次）
 */
async function scoreCreativeMaturity(ideaId: string, userId: string) {
  // 1. 检查是否已评分
  const existingScore = await prisma.creativeMaturityAdvice.findFirst({
    where: { ideaId, expiresAt: { gte: new Date() } }
  });

  if (existingScore) {
    console.log(`Idea ${ideaId} already scored, returning cached result`);
    return existingScore; // 返回缓存结果，不重复扣费
  }

  // 2. 创建评分锁（防止并发）
  const lock = await acquireLock(`score:${ideaId}`, 60000); // 60秒锁

  try {
    // 3. 双重检查（防止并发创建）
    const recheck = await prisma.creativeMaturityAdvice.findFirst({
      where: { ideaId, expiresAt: { gte: new Date() } }
    });

    if (recheck) {
      return recheck;
    }

    // 4. 执行评分（只执行一次）
    const score = await performScoring(ideaId);

    // 5. 扣费（只扣一次）
    const fee = score.level === 'LOW' ? 50 : score.level === 'MEDIUM' ? 200 : 800;
    await deductCredits(userId, fee, `评分-${ideaId}`);

    return score;

  } finally {
    await releaseLock(lock);
  }
}
```

---

## 🗄️ 六、数据存储方案（优化版）

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

  // Mom Test信号（新增）
  validSignals      Json     @map("valid_signals")       // 有效信号统计
  invalidSignals    Json     @map("invalid_signals")     // 无效信号统计

  // 评分原因（新增）
  scoringReasons    Json     @map("scoring_reasons")     // 评分原因块

  // 验证数据（高分创意）
  verificationData  Json?    @map("verification_data")   // 用户填写的验证问卷
  verificationLinks Json?    @map("verification_links")  // 网上检索的参考链接
  verifiedAt        DateTime? @map("verified_at")

  // 元数据
  scoringVersion    String   @map("scoring_version")     // "1.0.0"

  // 时间戳
  createdAt         DateTime @default(now()) @map("created_at")
  expiresAt         DateTime @map("expires_at")          // 默认7天后过期
  extendedUntil     DateTime? @map("extended_until")     // 用户延长至

  @@index([ideaId, createdAt])
  @@index([expiresAt]) // 用于定时清理
  @@map("creative_maturity_advice")
}

// 评分权重配置表
model ScoringWeightConfig {
  id                String   @id @default(cuid())
  version           String   @unique                      // "1.0.0"
  isActive          Boolean  @default(false)             // 是否当前激活
  isCanary          Boolean  @default(false)             // 是否灰度版本
  canaryPercentage  Int      @default(0)                 // 灰度百分比（0-100）

  // 5维权重（总和=1.0）
  targetCustomer    Float    @map("target_customer")      // 0.20
  demandScenario    Float    @map("demand_scenario")      // 0.20
  coreValue         Float    @map("core_value")           // 0.25
  businessModel     Float    @map("business_model")       // 0.20
  credibility       Float    @map("credibility")          // 0.15

  // 阈值配置
  thresholdLowMax   Float    @default(4.0)               // 低分上限
  thresholdMidMin   Float    @default(5.0)               // 中分下限
  thresholdMidMax   Float    @default(7.0)               // 中分上限
  thresholdHighMin  Float    @default(7.5)               // 高分下限

  // 标定数据
  calibrationSetSize Int?    @map("calibration_set_size") // 标定集样本数
  calibrationAccuracy Float? @map("calibration_accuracy") // 标定准确率

  description       String?                              // 配置说明
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("scoring_weight_config")
}

// 验证订单表（新增，用于计费保护）
model VerificationOrder {
  id                String   @id @default(cuid())
  ideaId            String   @map("idea_id")
  userId            String   @map("user_id")
  amount            Int                                  // 积分数量
  status            String                               // PENDING/COMPLETED/FAILED
  error             String?                              // 失败原因
  createdAt         DateTime @default(now()) @map("created_at")
  completedAt       DateTime? @map("completed_at")
  failedAt          DateTime? @map("failed_at")

  @@index([ideaId])
  @@index([userId])
  @@map("verification_order")
}

// 版本回滚日志（新增）
model VersionRollbackLog {
  id                String   @id @default(cuid())
  fromVersion       String?  @map("from_version")
  toVersion         String?  @map("to_version")
  reason            String
  timestamp         DateTime @default(now())

  @@map("version_rollback_log")
}

// 问卷草稿表（新增，支持分段提交）
model QuestionnaireDraft {
  id                String   @id @default(cuid())
  ideaId            String   @map("idea_id")
  userId            String   @map("user_id")
  answers           Json                                 // 已填写的答案
  progress          Float                                // 完成进度（0-1）
  savedAt           DateTime @default(now()) @map("saved_at")
  expiresAt         DateTime @map("expires_at")          // 默认7天后过期

  @@index([ideaId, userId])
  @@index([expiresAt])
  @@map("questionnaire_draft")
}
```

---

### 6.2 数据保留策略（优化版）

#### **6.2.1 默认保留7天**

```typescript
/**
 * 创建评分数据（默认7天）
 */
async function createMaturityScore(ideaId: string, score: any) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // +7天

  await prisma.creativeMaturityAdvice.create({
    data: {
      ideaId,
      ...score,
      expiresAt
    }
  });
}
```

#### **6.2.2 用户可选延长或删除**

```typescript
/**
 * 延长数据保留期
 */
async function extendDataRetention(ideaId: string, days: number) {
  const maxDays = 30; // 最多延长至30天
  const extendDays = Math.min(days, maxDays);

  const extendedUntil = new Date();
  extendedUntil.setDate(extendedUntil.getDate() + extendDays);

  await prisma.creativeMaturityAdvice.update({
    where: { ideaId },
    data: { extendedUntil }
  });

  console.log(`Extended data retention for ${ideaId} to ${extendDays} days`);
}

/**
 * 立即删除数据
 */
async function deleteDataImmediately(ideaId: string, userId: string) {
  // 1. 验证权限（只有创意所有者可删除）
  const advice = await prisma.creativeMaturityAdvice.findFirst({
    where: { ideaId, userId }
  });

  if (!advice) {
    throw new Error('无权删除该数据');
  }

  // 2. 删除所有相关数据
  await prisma.$transaction([
    prisma.creativeMaturityAdvice.delete({ where: { id: advice.id } }),
    prisma.questionnaireDraft.deleteMany({ where: { ideaId, userId } }),
    // 记录删除日志（用于审计）
    prisma.dataAccessLog.create({
      data: {
        ideaId,
        userId,
        action: 'DELETE',
        timestamp: new Date()
      }
    })
  ]);

  console.log(`User ${userId} deleted all data for idea ${ideaId}`);
}
```

---

### 6.3 自动清理任务（工程化）

#### **问题**：`setInterval` 在 Serverless/Edge 环境不可靠

#### **解决方案**：使用平台原生定时任务或队列

##### **方案A：Vercel Cron（推荐）**

```typescript
// src/app/api/cron/cleanup-expired-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Vercel Cron Job：每小时清理过期数据
 *
 * 配置方式：在 vercel.json 添加
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-expired-data",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // 1. 验证请求来自Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // 2. 清理过期的评分数据
    const expiredAdvice = await prisma.creativeMaturityAdvice.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { extendedUntil: { lt: now } }
        ]
      }
    });

    // 3. 清理过期的问卷草稿
    const expiredDrafts = await prisma.questionnaireDraft.deleteMany({
      where: { expiresAt: { lt: now } }
    });

    console.log(`🧹 Cleaned up ${expiredAdvice.count} expired advice records`);
    console.log(`🧹 Cleaned up ${expiredDrafts.count} expired drafts`);

    return NextResponse.json({
      success: true,
      cleaned: {
        advice: expiredAdvice.count,
        drafts: expiredDrafts.count
      },
      timestamp: now
    });

  } catch (error) {
    console.error('Cleanup failed:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
```

**Vercel配置文件**：

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup-expired-data",
    "schedule": "0 * * * *"
  }]
}
```

---

##### **方案B：BullMQ 队列（适用于高并发）**

```typescript
// src/lib/tasks/cleanup-queue.ts

import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. 创建队列
export const cleanupQueue = new Queue('cleanup', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

// 2. 调度任务（每小时一次）
export async function scheduleCleanupTask() {
  await cleanupQueue.add(
    'cleanup-expired-data',
    {},
    {
      repeat: {
        pattern: '0 * * * *' // Every hour
      }
    }
  );
}

// 3. Worker处理任务
const cleanupWorker = new Worker(
  'cleanup',
  async (job) => {
    const now = new Date();

    const expiredAdvice = await prisma.creativeMaturityAdvice.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { extendedUntil: { lt: now } }
        ]
      }
    });

    const expiredDrafts = await prisma.questionnaireDraft.deleteMany({
      where: { expiresAt: { lt: now } }
    });

    console.log(`🧹 Cleaned up ${expiredAdvice.count} advice, ${expiredDrafts.count} drafts`);

    return {
      cleaned: {
        advice: expiredAdvice.count,
        drafts: expiredDrafts.count
      }
    };
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379')
    }
  }
);
```

---

### 6.4 隐私与合规（完整版）

#### **6.4.1 符合《个保法》/GDPR的隐私声明**

```markdown
## 🔒 隐私声明与数据保护

### 我们收集什么数据？

**创意评分数据**：
- 创意内容（标题、描述）
- AI专家讨论记录
- 评分结果与原因

**高分验证数据**（仅高分创意）：
- 用户数据（用户数量、来源、留存率）
- 财务数据（收入、成本、估值）
- 团队信息（背景、经验）

### 数据如何使用？

✅ **仅用于生成您的商业计划书**
✅ **帮助评估数据合理性**
❌ **不会用于其他目的**
❌ **不会分享给第三方**

### 数据安全

- **传输加密**：HTTPS/TLS 1.3
- **存储加密**：AES-256-GCM
- **访问控制**：仅创意所有者可访问
- **访问审计**：所有访问记录日志
- **自动删除**：默认7天后删除

### 数据主体权利（符合《个保法》第45-50条 / GDPR第15-22条）

您拥有以下权利：

1. **✅ 访问权**（知情权）
   - 随时查看您的数据
   - 了解数据如何处理

2. **✅ 更正权**
   - 随时修正错误数据
   - 补充不完整数据

3. **✅ 删除权**（被遗忘权）
   - 随时删除您的数据
   - 删除后不可恢复

4. **✅ 导出权**（可携带权）
   - 导出为PDF/Excel
   - 迁移到其他平台

5. **✅ 限制处理权**
   - 暂停数据处理
   - 仅保留不使用

6. **✅ 反对权**
   - 反对自动化决策
   - 要求人工审核

### 数据保留期限

**默认保留**：7天
**可选延长**：最多30天
**立即删除**：随时可删除

**自动清理**：过期后自动删除，无法恢复

### 数据脱敏

**高敏感数据脱敏**：
- 财务数据：仅保留统计结果，不保留明细
- 用户名单：不保留具体用户信息
- 团队信息：仅保留背景类型，不保留姓名

### 数据访问日志

所有数据访问均记录：
- 访问时间
- 访问者ID
- 访问操作（查看/修改/删除）
- 访问IP

### 联系我们

如有数据保护相关问题，请联系：
- 邮箱：privacy@example.com
- 数据保护专员（DPO）：dpo@example.com

### 隐私政策更新

最后更新：2025-01-09
版本：v1.0
```

---

#### **6.4.2 访问控制与审计**

```typescript
/**
 * 记录数据访问（用于审计）
 */
async function logDataAccess(
  ideaId: string,
  userId: string,
  action: 'READ' | 'UPDATE' | 'DELETE',
  ipAddress: string
) {
  await prisma.dataAccessLog.create({
    data: {
      ideaId,
      userId,
      action,
      ipAddress,
      timestamp: new Date()
    }
  });
}

/**
 * 权限校验（仅创意所有者可访问）
 */
async function checkAccessPermission(ideaId: string, userId: string) {
  const advice = await prisma.creativeMaturityAdvice.findFirst({
    where: { ideaId, userId }
  });

  if (!advice) {
    throw new Error('无权访问该数据');
  }

  return advice;
}

/**
 * API路由权限示例
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  const userId = getUserIdFromToken(request); // 从JWT获取
  const ideaId = params.ideaId;
  const ipAddress = request.headers.get('x-real-ip') || 'unknown';

  // 1. 权限校验
  await checkAccessPermission(ideaId, userId);

  // 2. 记录访问日志
  await logDataAccess(ideaId, userId, 'READ', ipAddress);

  // 3. 返回数据
  const advice = await prisma.creativeMaturityAdvice.findFirst({
    where: { ideaId, userId }
  });

  return NextResponse.json(advice);
}
```

---

## 🛠️ 七、技术实现（最小改动）

### 7.1 新增文件（不改现有）

```
src/
├── types/
│   └── business-plan.ts              # 修改：新增maturity score类型定义
├── lib/
│   └── business-plan/
│       ├── maturity-scorer.ts         # 新建：评分引擎
│       ├── data-verifier.ts           # 新建：数据验证器
│       ├── weight-config-manager.ts   # 新建：权重配置管理
│       ├── scoring-calibration.ts     # 新建：标定与回放系统
│       ├── metrics-definitions.ts     # 新建：财务指标口径定义
│       └── templates/
│           ├── focus-guidance.ts      # 新建：低分引导模板
│           ├── optimization-plan.ts   # 新建：中分优化模板
│           └── verified-plan.ts       # 新建：高分验证模板
├── app/api/
│   ├── score-creative/
│   │   └── route.ts                   # 新建：评分API
│   ├── verify-data/
│   │   └── route.ts                   # 新建：验证API
│   └── cron/
│       └── cleanup-expired-data/
│           └── route.ts               # 新建：定时清理API（Vercel Cron）
└── components/
    ├── ScoreRadarChart.tsx            # 新建：雷达图组件
    ├── VerificationForm.tsx           # 新建：验证问卷组件（支持草稿保存）
    └── GrayZonePrompt.tsx             # 新建：灰色区提示组件
```

---

### 7.2 修改现有文件（最小改动）

#### **1. server.js（加5行触发评分）**

```javascript
// server.js

async function finishRealAIBidding(ideaId, ideaContent, bids) {
  // ... 现有代码 ..

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
        // ... 现有字段 ..
        maturityScore: result  // 🆕 新增
      }
    });
  } catch (error) {
    console.error('评分失败，使用降级策略:', error);
    // 降级：不评分，继续原流程
    // 🆕 新增：埋点记录
    await recordScoringFailure(ideaId, error);
  }
}

/**
 * 🆕 新增：记录评分失败（用于监控）
 */
async function recordScoringFailure(ideaId, error) {
  try {
    await fetch(`${apiBaseUrl}/api/internal/log-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SCORING_FAILURE',
        ideaId,
        error: error.message,
        timestamp: new Date()
      })
    });
  } catch (e) {
    console.error('Failed to log scoring failure:', e);
  }
}
```

---

#### **2. generate-business-plan/route.ts（开头加if分流）**

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
  // ... 现有代码 ..
}
```

---

### 7.3 向后兼容与降级策略

```typescript
// 如果评分失败或超时，降级为原流程
if (!maturityScore) {
  console.warn(`Scoring failed for idea ${ideaId}, falling back to default flow`);

  // 🆕 新增：埋点记录
  await recordEvent({
    type: 'SCORING_FALLBACK',
    ideaId,
    reason: 'scoring_failed_or_timeout',
    timestamp: new Date()
  });

  // 使用原有的商业计划生成逻辑（不计费或退回积分）
  return generateDefaultBusinessPlan(ideaId);
}
```

---

## 📅 八、分期实施计划（增强版）

### 第一期（2周）：评分 + 低分引导 + 小样本标定

**目标**：验证分级处理的价值 + 评分准确性

#### Week 1: 基础架构
- [x] Day 1-2：数据库迁移（新增4个表）
- [x] Day 3-4：评分引擎（规则版）+ Mom Test信号识别
- [x] Day 5：权重配置管理 + 灰度发布机制

#### Week 2: 低分引导 + 标定测试
- [x] Day 1-2：低分引导模板（融合The Mom Test）
- [x] Day 3：评分API + 触发逻辑
- [x] Day 4：前端展示（雷达图+建议） + 灰色区交互
- [x] Day 5：**小样本标定测试（50条样本）+ 回放对比**

**交付物**：
- ✅ 评分功能（5维评分）
- ✅ 低分创意引导（The Mom Test验证清单）
- ✅ 评分展示（雷达图+专家原话+机器分析）
- ✅ 标定准确率报告
- ❌ 中分/高分暂用现有流程

**测试创意**：
1. 低分创意：\"做一个APP\"（极度模糊）
2. 边界创意：评分4.2（灰色区）
3. 中分创意：暂用原流程

---

### 第二期（2周）：中分优化 + 小样本标定

**目标**：为大多数用户提供优化建议

#### Week 1: 建议生成
- [x] Day 1-2：中分优化模板（The Mom Test问题清单）
- [x] Day 3-4：薄弱项识别算法
- [x] Day 5：建议生成逻辑

#### Week 2: 集成测试 + 标定
- [x] Day 1-2：前端问卷组件（可选填）
- [x] Day 3：生成计划书（标注假设）
- [x] Day 4：**小样本标定测试（50条样本）+ 回放对比**
- [x] Day 5：修复问题 + 优化

**交付物**：
- ✅ 中分创意优化建议
- ✅ 初步商业计划书（标注假设）
- ✅ 不强制填写问卷
- ✅ 标定准确率报告
- ❌ 高分验证暂用现有流程

**测试创意**：
1. 中分创意：\"自由职业者时间管理工具，订阅制99元/月\"
2. 边界创意：评分7.2（灰色区）

---

### 第三期（3周）：高分验证 + 外部检索压测

**目标**：为高质量创意提供投资级方案

#### Week 1: 验证系统 + 工程化
- [x] Day 1-2：数据验证器（网上检索，带缓存+重试）
- [x] Day 3：验证问卷设计（The Mom Test）
- [x] Day 4：草稿保存 + 分段提交功能
- [x] Day 5：**外部检索速率与成本压测**

#### Week 2: 深度生成
- [x] Day 1-2：投资级计划书模板
- [x] Day 3：财务模型生成（Excel）+ 指标口径说明
- [x] Day 4：融资PPT生成
- [x] Day 5：验证报告生成

#### Week 3: 集成优化 + 上线
- [x] Day 1-2：前端验证流程 + 灰色区交互
- [x] Day 3：计费保护 + 幂等性 + 权限校验
- [x] Day 4：测试 + 优化
- [x] Day 5：文档 + 上线

**交付物**：
- ✅ 高分创意验证问卷（一次性，支持草稿）
- ✅ 网上检索验证（带缓存+重试）
- ✅ 投资级商业计划书（30-50页）
- ✅ 财务模型（Excel）+ 指标口径说明
- ✅ 融资PPT
- ✅ 外部检索性能报告

**测试创意**：
1. 高分创意：\"已有200付费用户，65%留存率，融资500万\"

---

## 💰 九、积分定价策略（增强版）

| 等级 | 消耗积分 | 原因 | 包含内容 |
|------|---------|------|---------|
| 低分引导 | 50 | AI调用少（1-2次） | 建议文档（5-8页）+ The Mom Test验证清单PDF |
| 中分优化 | 200 | AI调用中（3-5次） | 建议+初步计划书（15-25页）+ The Mom Test补充问卷 |
| 高分验证 | 800 | AI调用多（10+次）+ 网上检索 | 投资级计划书+财务模型+PPT+验证报告+90天计划 |

**灰色区特殊处理**：
- **4.0-5.0**：先收50积分（低分价格），补充信息后若升级到中分，**补差价150积分**
  - 前端提示："补充3个问题后，如评分提升到5分以上，需补150积分"
  - 计费时机：评分提升后才扣费
  - 失败回滚：如评分未提升，不扣差价

- **7.0-7.5**：先收200积分（中分价格），选择验证后，**补差价600积分**
  - 前端提示："开始验证需补600积分，完成后获得投资级计划书"
  - 计费时机：用户确认开始验证后预扣，验证成功后正式扣费
  - 失败回滚：验证失败自动退回600积分

**计费边界**：
- ✅ 评分成功后才扣费（失败不扣）
- ✅ 同一ideaId重复请求不重复扣费（幂等性）
- ✅ 验证失败自动退回积分（事务保护）

---

## ✅ 十、总结清单

### 核心特性
- [x] 5维评分模型（目标客户、需求场景、核心价值、商业模式、可信度）
- [x] 权重可配置化 + 版本管理 + 灰度发布 + 回滚机制
- [x] 灰色区缓冲机制（4.0-5.0 / 7.0-7.5）+ 补差价流程
- [x] 高透明度展示（专家原话+雷达图+机器分析+评分原因块）
- [x] **融合The Mom Test原则**（无效数据抑制 + 有效信号加权）

### 三级处理
- [x] 低分：AI讨论后直接给建议 + **The Mom Test验证清单**
- [x] 中分：提示薄弱项+给建议，不强制填写 + **The Mom Test补充问卷**
- [x] 高分：一次性问卷验证（支持草稿保存）+ 网上检索 + **The Mom Test问题设计**

### 数据处理
- [x] 新建CreativeMaturityAdvice等4个表
- [x] **数据默认保留7天**，可延长至30天或立即删除
- [x] **符合《个保法》/GDPR**（访问权、更正权、删除权、导出权）
- [x] 最小化改动现有代码

### 商业模式
- [x] 积分付费：低分50/中分200/高分800
- [x] 不限制使用次数
- [x] **补差价流程** + **计费保护** + **幂等性保证**

### 分期实施
- [x] 第一期（2周）：评分+低分引导 + **小样本标定**
- [x] 第二期（2周）：中分优化 + **小样本标定**
- [x] 第三期（3周）：高分验证 + **外部检索压测**

### 工程化
- [x] **定时清理任务**：Vercel Cron / BullMQ 队列（不用setInterval）
- [x] **外部检索工程化**：数据源适配器 + 速率限制 + 重试 + 缓存（Redis）
- [x] **防刷分机制**：关键词去重 + 语义近似 + 负样本词表 + 边际递减
- [x] **权限校验**：仅创意所有者可访问
- [x] **访问审计**：所有数据访问记录日志
- [x] **指标口径统一**：财务指标定义文件（metrics-definitions.ts）

---

## 🚀 准备开始开发！

所有关键决策已确认，方案已完善，**工程化细节已补强**。

**下一步**：开始第一期开发（评分引擎 + 低分引导 + 小样本标定）

**预计时间**：2周
**完成后**：标定测试验证准确率，无问题后启动第二期

---

**创建日期**：2025-01-09
**最后更新**：2025-01-09
**状态**：✅ 待开发（基于深度审阅反馈）
**版本**：v4.1 Enhanced
