# 创意成熟度分级处理方案 v3.0（优化版）

> **版本**: v3.0 - 基于反馈优化
> **日期**: 2025-01-09
> **状态**: 待确认后开发

---

## 📋 变更说明（v2 → v3）

### 核心优化
1. ✅ **评分引擎升级**：规则+语义匹配，增加置信度机制
2. ✅ **防刷分设计**：关键词边际递减、矛盾检测
3. ✅ **动态问卷**：仅针对薄弱项出题，最多10题
4. ✅ **分段体验**：高分验证改为3段式，降低放弃率
5. ✅ **指标口径统一**：定义标准计算方式
6. ✅ **类型整合**：统一到现有 business-plan.ts
7. ✅ **MVP分期**：第一期只做评分+低分引导

### 风险应对
- 评分波动 → 置信度+阈值缓冲区
- 用户流失 → 分段保存+即时洞见
- 数据质量 → 证据校验+来源追踪
- 落地成本 → 分3期迭代上线

---

## 🎯 一、核心理念（不变）

**按"成熟度"而非"好坏"分级**

- **低分（1-4）** = 想法阶段（需要聚焦）
- **中分（5-7）** = 方向阶段（需要细化）
- **高分（8-10）** = 方案阶段（需要验证）

---

## 📊 二、评分机制（升级版）

### 2.1 评分维度（4维不变）

| 维度 | 权重 | 评估问题 | 低分 | 中分 | 高分 |
|------|------|---------|------|------|------|
| 🎯 目标用户 | 30% | 是否明确具体？ | 模糊/泛化 | 有方向但不具体 | 清晰画像+痛点 |
| 💡 核心价值 | 30% | 解决什么问题？ | 不清楚/宽泛 | 有但未聚焦 | 聚焦+差异化 |
| 💰 商业模式 | 25% | 怎么赚钱？ | 未提及 | 有想法但不完整 | 清晰路径 |
| 📈 可信度 | 15% | 有数据支撑吗？ | 纯想象 | 部分假设 | 有数据/已验证 |

**权重可配置化**，支持后续 A/B 测试调整。

### 2.2 评分引擎（规则+语义）

#### 旧方案问题
```javascript
// ❌ 仅靠关键词匹配，容易误判
if (专家提问.includes("目标用户是谁")) {
  score = 低分
}
```

#### 新方案（三层防护）

```typescript
class MaturityScorer {

  /**
   * 第一层：启发式规则（保底）
   */
  private ruleBasedScore(dimension, messages) {
    // 关键词匹配，但加入边际递减
    const keywords = this.getKeywords(dimension);
    let score = 5; // 默认中等

    keywords.forEach((kw, index) => {
      const count = countOccurrences(messages, kw);
      const weight = 1 / (index + 1); // 边际递减
      score += (count > 0 ? weight : -weight);
    });

    return clamp(score, 1, 10);
  }

  /**
   * 第二层：语义匹配（提升准确性）
   */
  private async semanticScore(dimension, messages) {
    // 使用轻量级模型或向量检索
    const questionEmbeddings = await this.getEmbeddings([
      "目标用户是谁？",
      "你的客户群体在哪？",
      "Who is your target audience?"
    ]);

    const messageEmbeddings = await this.getEmbeddings(messages);
    const similarity = cosineSimilarity(questionEmbeddings, messageEmbeddings);

    // 高相似度 → 说明专家在质疑这个维度 → 得分低
    return similarity > 0.7 ? 3 : 7;
  }

  /**
   * 第三层：矛盾检测（防刷分）
   */
  private contradictionCheck(dimension, messages) {
    // 检测矛盾陈述
    const positive = ["清晰", "明确", "精准"];
    const negative = ["模糊", "不清楚", "待定义"];

    const hasPositive = messages.some(m => positive.some(p => m.includes(p)));
    const hasNegative = messages.some(m => negative.some(n => m.includes(n)));

    if (hasPositive && hasNegative) {
      // 有矛盾，降低置信度
      return { penalty: -1, lowConfidence: true };
    }

    return { penalty: 0, lowConfidence: false };
  }

  /**
   * 综合评分 + 置信度
   */
  async scoreDimension(dimension, messages) {
    const ruleScore = this.ruleBasedScore(dimension, messages);
    const semanticScore = await this.semanticScore(dimension, messages);
    const { penalty, lowConfidence } = this.contradictionCheck(dimension, messages);

    // 加权平均：规则40% + 语义60%
    const finalScore = (ruleScore * 0.4 + semanticScore * 0.6) + penalty;

    // 置信度：0-1
    const confidence = lowConfidence ? 0.6 : 0.9;

    return {
      score: clamp(finalScore, 1, 10),
      confidence,
      evidence: this.extractEvidence(dimension, messages),
      method: 'HYBRID' // RULE_BASED, SEMANTIC, HYBRID
    };
  }
}
```

### 2.3 置信度机制

```typescript
interface DimensionScore {
  score: number          // 1-10
  confidence: number     // 0-1，表示评分可信度
  evidence: Evidence[]   // 证据列表
  method: 'RULE_BASED' | 'SEMANTIC' | 'HYBRID'
}

interface Evidence {
  type: 'EXPERT_QUOTE' | 'USER_DATA' | 'IMPLICIT'
  source: string         // 专家ID或消息ID
  content: string        // 原文
  weight: number         // 证据权重
}
```

**低置信度处理**：
```typescript
if (avgConfidence < 0.7) {
  // 不直接打分，改为请求补充信息
  return {
    status: 'NEED_MORE_INFO',
    questions: generateClarifyingQuestions(lowConfidenceDimensions)
  };
}
```

### 2.4 分数阈值优化

#### 旧方案（硬阈值）
```
低分：< 4.5
中分：4.5 - 7.5
高分：> 7.5
```

#### 新方案（缓冲区）
```
低分：1.0 - 4.0
灰色区：4.0 - 5.0 （需补充信息）
中分：5.0 - 7.0
灰色区：7.0 - 7.5 （可选验证）
高分：7.5 - 10.0
```

**灰色区处理**：
- **4.0-5.0**：提示"您的创意介于想法和方向之间，回答3个问题可获得更准确评估"
- **7.0-7.5**：提示"您的创意已较成熟，补充验证数据可获得投资级计划书"

---

## 🔴 三、低分创意（1-4分）：聚焦引导型

### 3.1 核心目标（不变）

帮用户从"大而空"聚焦到"小而实"

### 3.2 优化内容结构

#### 压缩版（1次会话完成）

```markdown
# 您的创意需要进一步聚焦 📍

**评分**: 3.5/10 (成熟度：想法阶段)
**置信度**: 85% (评分可信)

---

## 📊 四维评估

| 维度 | 得分 | 状态 | 专家反馈 |
|------|------|------|---------|
| 🎯 目标用户 | 2.5/10 | ❌ 待明确 | 老王："你这是给谁用的？学生？职场？" |
| 💡 核心价值 | 3.0/10 | ❌ 待聚焦 | 艾克斯："和现有产品有啥本质区别？" |
| 💰 商业模式 | 4.0/10 | ⚠️ 初步 | 李博："怎么赚钱？订阅还是功能收费？" |
| 📈 可信度 | 4.5/10 | ⚠️ 假设 | 小琳："建议先做用户访谈验证需求" |

**平均分**: 3.5/10

---

## 🎯 3步快速聚焦（预计10分钟）

### 第1步：选择一个细分人群 (2分钟)

□ 自由职业者（设计师、程序员）
□ 创业团队（5-20人）
□ 知识工作者（研究员、分析师）
□ 学生群体（大学生、考研党）
□ 其他：___

**为什么要聚焦？**
Notion最初只服务程序员，Forest专注学生群体。先做小做深，再扩展。

---

### 第2步：用一句话定义核心价值 (3分钟)

**公式**: 我的产品帮助 [谁]，通过 [什么方式]，解决 [什么问题]

**示例**:
✅ "帮助自由职业者，通过AI时薪分析，优化时间分配提升收入"
❌ "一个更好用的日程管理工具"（太宽泛）

**您的定义**: ___________________________

---

### 第3步：选择验证方式 (5分钟)

在开发前，建议先验证需求真实性：

□ 用户访谈（访谈5-10人，确认痛点）
□ 竞品分析（找3个类似产品，分析优缺点）
□ MVP原型（用Figma画出核心界面，收集反馈）

**承诺**: 完成验证后重新提交，我们将为您生成针对性商业计划 🎁

---

## 💼 参考案例

**Notion**: 想法"笔记工具" → 聚焦"程序员All-in-one工作区" → 成功
**Forest**: 想法"帮助专注" → 聚焦"学生番茄钟+游戏化" → 爆款

**关键**: 一个极简MVP + 一个细分人群 → 快速验证
```

### 3.3 交互优化

**旧方案**：生成静态文档（PDF/Markdown）
**新方案**：交互式表单 + 即时反馈

```typescript
// 前端组件
<FocusGuidanceForm
  score={3.5}
  dimensions={dimensionScores}
  onSubmit={(answers) => {
    // 实时重新评分
    const newScore = recalculateScore(originalScore, answers);

    if (newScore >= 5.0) {
      // 升级到中分
      generateOptimizationPlan();
    } else {
      // 继续引导
      showMoreGuidance();
    }
  }}
/>
```

---

## 🟡 四、中分创意（5-7分）：补充优化型

### 4.1 核心目标（不变）

识别缺失环节，引导补充，给初步方案

### 4.2 动态问卷（最多10题）

#### 旧方案问题
- 固定15个问题，用户觉得累
- 不管哪个维度薄弱，都问同样的问题

#### 新方案（智能出题）

```typescript
class DynamicQuestionnaireGenerator {

  generate(maturityScore: CreativeMaturityScore): Question[] {
    const questions: Question[] = [];

    // 只针对得分<6的维度出题
    if (maturityScore.dimensions.targetUser.score < 6) {
      questions.push({
        id: 'target_user_detail',
        category: 'USER',
        priority: 'HIGH',
        question: '您的目标用户主要集中在哪个职业/场景？',
        type: 'SINGLE_CHOICE',
        options: ['自由职业者', '创业团队', '知识工作者', '学生群体'],
        hint: '聚焦一个群体，后续可扩展'
      });
    }

    if (maturityScore.dimensions.businessModel.score < 6) {
      questions.push({
        id: 'pricing_strategy',
        category: 'BUSINESS',
        priority: 'HIGH',
        question: '您倾向哪种收费模式？',
        type: 'SINGLE_CHOICE',
        options: ['订阅制（月付/年付）', '一次性购买', '免费+增值服务', '还没想好'],
        hint: 'SaaS通常采用订阅制'
      });
    }

    if (maturityScore.dimensions.coreValue.score < 6) {
      questions.push({
        id: 'differentiation',
        category: 'PRODUCT',
        priority: 'MEDIUM',
        question: '相比现有产品，您的核心差异是什么？',
        type: 'TEXT',
        placeholder: '例如：AI自动分析+个性化建议',
        hint: '可以是技术、体验、价格、渠道等'
      });
    }

    // 根据优先级排序，最多10题
    return questions
      .sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority])
      .slice(0, 10);
  }
}
```

### 4.3 分段保存 + 即时洞见

```typescript
interface QuestionnaireProgress {
  totalQuestions: 10,
  answeredQuestions: 3,
  savedAt: Date,
  insights: [
    {
      trigger: 'answered_target_user',
      insight: '太好了！聚焦自由职业者是个好选择，这个群体付费意愿高。',
      nextAction: '建议补充：他们在哪些平台聚集？（小红书/即刻/V2EX？）'
    }
  ]
}
```

**用户体验**：
- 回答3题 → 显示第1条洞见
- 回答6题 → 显示第2条洞见
- 回答10题 → 生成完整计划书

**草稿保存**：
```typescript
// 每答1题自动保存
await saveQuestionnaireProgress(ideaId, {
  answers: currentAnswers,
  progress: 3/10
});

// 用户下次回来可以继续
const savedProgress = await loadQuestionnaireProgress(ideaId);
```

---

## 🟢 五、高分创意（7.5-10分）：验证深化型

### 5.1 核心目标（不变）

验证数据真实性，生成可信方案

### 5.2 三段式验证（降低放弃率）

#### 旧方案问题
- 一次性问15个问题，10-15分钟
- 用户看到长问卷就放弃

#### 新方案（分3段，每段产出即时价值）

```markdown
## 🎉 恭喜！您的创意已具备投资价值

**评分**: 8.5/10 (成熟度：方案阶段)
**置信度**: 92%

AI专家团队高度认可：
✅ 已有200付费用户（真实验证）
✅ 65%留存率（行业优秀）
✅ 商业模式清晰

---

为了生成**投资级商业计划书**，我们需要验证一些关键数据。

**验证分3段进行，每段3-5分钟，完成后立即获得相应洞见**

---

### 📊 第一段：用户数据验证 (3分钟)

**问题1**: 200位付费用户主要来自？
□ 自然增长（口碑/SEO）
□ 付费广告（CAC: ___元）
□ 社群运营
□ 内测朋友

**问题2**: 65%留存率是哪个周期？
□ 第1个月
□ 第3个月 ⭐ 重要
□ 第6个月

**问题3**: 用户主要职业？
设计师 ___%，程序员 ___%，其他 ___%

---

✅ **完成第一段后，您将获得**:
- 用户画像分析报告
- 获客渠道健康度评估
- 留存率行业对比

[开始第一段验证] [稍后继续]

---

### 💰 第二段：财务数据验证 (4分钟)

**问题4**: 300万GMV如何计算？
现有 ___ 用户 → 第一年目标 ___ 用户 × 99元/月 × 12月

**问题5**: 获客成本预算？
预计CAC: ___ 元 × 新增用户 ___ 人 = ___ 万

**问题6**: 成本结构？
研发 ___ 万 + 运营 ___ 万 + 市场 ___ 万

---

✅ **完成第二段后，您将获得**:
- 详细财务模型（3年预测）
- 收入成本分析
- 盈亏平衡点计算

[开始第二段验证] [稍后继续]

---

### 💼 第三段：融资规划验证 (3分钟)

**问题7**: 3000万估值如何计算？
□ PS倍数法（ARR × ___ 倍）
□ 可比公司法（参考 ___ 公司）
□ 投资人建议

**问题8**: 500万融资用途？
产品 ___ 万，市场 ___ 万，团队 ___ 万，储备 ___ 万

**问题9**: 核心团队背景？
□ 有SaaS创业经验
□ 有行业背景
□ 首次创业

---

✅ **完成第三段后，您将获得**:
- 融资建议（合理估值区间）
- 融资路演PPT（15页）
- 风险评估与应对方案

[开始第三段验证] [稍后继续]

---

**⏱️ 总计: 10分钟**
**🎁 总交付物: 7份文档**

- 投资级商业计划书（30-50页）
- 详细财务模型（Excel）
- 融资路演PPT（15页）
- 用户画像报告
- 财务分析报告
- 风险评估报告
- 90天行动计划
```

### 5.3 数据合理性检查

```typescript
class DataVerificationValidator {

  /**
   * 检查数据合理性
   */
  validate(answers: VerificationAnswer[]): ValidationResult {
    const warnings: Warning[] = [];
    const suggestions: Suggestion[] = [];

    // 1. 增长率检查
    const currentUsers = answers.find(a => a.questionId === 'current_users')?.answer as number;
    const targetUsers = answers.find(a => a.questionId === 'target_users')?.answer as number;
    const growthRate = targetUsers / currentUsers;

    if (growthRate > 15) {
      warnings.push({
        level: 'HIGH',
        message: `预计增长${growthRate}倍，增长率偏高`,
        detail: `从${currentUsers}到${targetUsers}用户，需要强大的获客能力`,
        suggestion: '建议调整为8-12倍，或大幅增加市场预算'
      });
    }

    // 2. LTV/CAC 比值检查
    const ltv = answers.find(a => a.questionId === 'ltv')?.answer as number;
    const cac = answers.find(a => a.questionId === 'cac')?.answer as number;
    const ratio = ltv / cac;

    if (ratio < 3) {
      warnings.push({
        level: 'MEDIUM',
        message: `LTV/CAC = ${ratio.toFixed(1)}，低于健康标准(3:1)`,
        detail: '获客成本相对用户价值过高，盈利能力不足',
        suggestion: '建议：降低CAC（内容营销）或提升LTV（提高续费率）'
      });
    }

    // 3. 留存率周期检查
    const retentionPeriod = answers.find(a => a.questionId === 'retention_period')?.answer as string;
    const retentionRate = answers.find(a => a.questionId === 'retention_rate')?.answer as number;

    if (retentionPeriod === '第1个月' && retentionRate > 60) {
      suggestions.push({
        level: 'INFO',
        message: '第1个月65%留存是正常水平',
        detail: '建议持续追踪第3、6个月留存，这些指标更能反映产品粘性',
        action: '在产品中加入用户分群，识别高留存用户特征'
      });
    }

    // 4. 估值合理性检查
    const arr = calculateARR(answers);
    const valuation = answers.find(a => a.questionId === 'valuation')?.answer as number;
    const psRatio = valuation / arr;

    if (psRatio > 15) {
      warnings.push({
        level: 'HIGH',
        message: `估值是ARR的${psRatio.toFixed(1)}倍，高于行业标准(5-15倍)`,
        detail: `您的ARR为${arr}万，合理估值区间：${arr * 5}万 - ${arr * 15}万`,
        suggestion: '建议调整估值，或补充高增长潜力的证据（如已签约大客户）'
      });
    }

    return {
      passed: warnings.filter(w => w.level === 'HIGH').length === 0,
      score: calculateHealthScore(warnings),
      warnings,
      suggestions,
      confidenceLevel: this.calculateConfidence(warnings)
    };
  }
}
```

### 5.4 证据追踪

```typescript
interface DataEvidence {
  questionId: string
  answer: any
  evidenceType: 'SELF_REPORTED' | 'UPLOADED_DOC' | 'LINKED_SOURCE' | 'CALCULATED'
  source?: {
    type: 'FILE' | 'URL' | 'SCREENSHOT'
    url?: string
    filename?: string
    uploadedAt?: Date
  }
  verificationStatus: 'PENDING' | 'VERIFIED' | 'SUSPICIOUS'
}

// 示例
{
  questionId: 'market_size',
  answer: '自由职业者市场约2000万人',
  evidenceType: 'LINKED_SOURCE',
  source: {
    type: 'URL',
    url: 'https://艾瑞咨询.com/report/2024/freelancer-market'
  },
  verificationStatus: 'VERIFIED'
}
```

---

## 📏 六、指标口径统一

### 6.1 定义文件

**新建**: `src/lib/business-plan/metrics-definitions.ts`

```typescript
/**
 * 财务指标统一定义
 */
export const METRICS_DEFINITIONS = {

  /**
   * ARR (Annual Recurring Revenue) - 年度经常性收入
   */
  ARR: {
    name: '年度经常性收入',
    formula: 'MRR × 12',
    unit: '万元',
    description: '订阅制业务的年度可预测收入',
    calculation: (monthlyRevenue: number) => monthlyRevenue * 12,
    notes: [
      '仅计算订阅收入，不包含一次性收入',
      '基于当前付费用户的月度订阅费用'
    ]
  },

  /**
   * MRR (Monthly Recurring Revenue) - 月度经常性收入
   */
  MRR: {
    name: '月度经常性收入',
    formula: '付费用户数 × ARPU',
    unit: '元',
    description: '每月可预测的订阅收入',
    calculation: (payingUsers: number, arpu: number) => payingUsers * arpu,
    notes: [
      '仅计算活跃付费用户',
      '按当前定价计算，不包含折扣'
    ]
  },

  /**
   * CAC (Customer Acquisition Cost) - 获客成本
   */
  CAC: {
    name: '获客成本',
    formula: '总营销费用 / 新增付费用户数',
    unit: '元/人',
    description: '获得一个付费用户的平均成本',
    calculation: (marketingSpend: number, newUsers: number) => marketingSpend / newUsers,
    notes: [
      '包含广告、内容、活动等所有获客费用',
      '不包含产品开发成本',
      '时间窗口：通常按月或季度计算'
    ]
  },

  /**
   * LTV (Lifetime Value) - 用户生命周期价值
   */
  LTV: {
    name: '用户生命周期价值',
    formula: 'ARPU × 平均订阅月数',
    unit: '元',
    description: '一个用户在整个生命周期内贡献的总收入',
    calculation: (arpu: number, avgLifetimeMonths: number) => arpu * avgLifetimeMonths,
    alternativeFormula: 'ARPU / 月流失率',
    notes: [
      '假设恒定的ARPU（实际可能增长）',
      '平均订阅月数 = 1 / 月流失率',
      '例如：月流失率10% → 平均订阅10个月'
    ]
  },

  /**
   * 留存率
   */
  RETENTION_RATE: {
    name: '留存率',
    formula: '(期末活跃用户 / 期初用户) × 100%',
    unit: '%',
    description: '用户在特定时期后仍然活跃的比例',
    calculation: (activeUsers: number, initialUsers: number) => (activeUsers / initialUsers) * 100,
    periods: {
      'D1': '次日留存',
      'D7': '7日留存',
      'D30': '30日留存',
      'M1': '第1个月留存',
      'M3': '第3个月留存',
      'M6': '第6个月留存'
    },
    notes: [
      '必须明确时间周期（D1/D7/M1/M3/M6）',
      '活跃定义：登录 或 使用核心功能',
      'SaaS行业：M3留存>50%为优秀'
    ]
  },

  /**
   * 流失率
   */
  CHURN_RATE: {
    name: '流失率',
    formula: '(期内流失用户 / 期初用户) × 100%',
    unit: '%',
    description: '用户在特定时期内取消订阅的比例',
    calculation: (churnedUsers: number, initialUsers: number) => (churnedUsers / initialUsers) * 100,
    notes: [
      '月流失率 = 1 - 月留存率',
      '年流失率 ≈ 月流失率 × 12（简化）',
      'SaaS行业：月流失率<5%为优秀'
    ]
  }

};

/**
 * 自动在生成的文档中插入指标说明
 */
export function generateMetricsGlossary(): string {
  let glossary = '## 📊 财务指标说明\n\n';

  Object.entries(METRICS_DEFINITIONS).forEach(([key, def]) => {
    glossary += `### ${def.name} (${key})\n\n`;
    glossary += `**公式**: ${def.formula}\n`;
    glossary += `**单位**: ${def.unit}\n`;
    glossary += `**说明**: ${def.description}\n\n`;

    if (def.notes) {
      glossary += '**注意事项**:\n';
      def.notes.forEach(note => {
        glossary += `- ${note}\n`;
      });
    }

    glossary += '\n---\n\n';
  });

  return glossary;
}
```

### 6.2 计算器统一

```typescript
/**
 * 财务计算器（确保口径一致）
 */
export class FinancialCalculator {

  constructor(private definitions = METRICS_DEFINITIONS) {}

  calculateARR(monthlyRevenue: number): number {
    return this.definitions.ARR.calculation(monthlyRevenue);
  }

  calculateLTV(arpu: number, churnRate: number): number {
    const avgLifetimeMonths = 1 / churnRate;
    return this.definitions.LTV.calculation(arpu, avgLifetimeMonths);
  }

  calculateLTVtoCAC(ltv: number, cac: number): {
    ratio: number;
    health: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
    message: string;
  } {
    const ratio = ltv / cac;

    if (ratio >= 5) return { ratio, health: 'EXCELLENT', message: '非常健康' };
    if (ratio >= 3) return { ratio, health: 'GOOD', message: '健康' };
    if (ratio >= 1) return { ratio, health: 'WARNING', message: '需要优化' };
    return { ratio, health: 'CRITICAL', message: '不健康，亏损' };
  }

  /**
   * 生成带口径说明的财务模型
   */
  generateFinancialModel(data: any) {
    const model = {
      // ... 计算逻辑
    };

    // 自动附加指标说明
    return {
      ...model,
      glossary: generateMetricsGlossary(),
      calculationTimestamp: new Date(),
      definitionVersion: '1.0.0'
    };
  }
}
```

---

## 🔄 七、系统集成（对齐现有架构）

### 7.1 类型整合

**修改**: `src/types/business-plan.ts`（而非新建）

```typescript
// ============ 新增：成熟度评分相关类型 ============

/**
 * 创意成熟度评分
 */
export interface CreativeMaturityScore {
  // 版本与元数据
  scoringVersion: string      // '1.0.0'
  scoredAt: Date

  // 总分与等级
  totalScore: number          // 1-10
  maturityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'NEED_INFO'
  confidence: number          // 0-1，整体置信度

  // 四维评分（整合到现有结构）
  dimensions: {
    targetUser: DimensionScore
    coreValue: DimensionScore
    businessModel: DimensionScore
    credibility: DimensionScore
  }

  // 专家共识
  expertConsensus: ExpertConsensus

  // 推荐动作
  recommendedAction: 'FOCUS_GUIDANCE' | 'OPTIMIZATION_PLAN' | 'VERIFICATION' | 'CLARIFY'
}

/**
 * 维度评分（增强版）
 */
export interface DimensionScore {
  score: number               // 1-10
  confidence: number          // 0-1
  status: 'CLEAR' | 'VAGUE' | 'MISSING' | 'CONFLICTED'
  evidence: Evidence[]
  method: 'RULE_BASED' | 'SEMANTIC' | 'HYBRID'
  weight: number              // 该维度权重（可配置）
}

/**
 * 证据
 */
export interface Evidence {
  type: 'EXPERT_QUOTE' | 'USER_CLAIM' | 'DATA_POINT' | 'IMPLICIT'
  source: string              // expertId 或 messageId
  content: string
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  weight: number              // 证据权重
  timestamp: Date
}

/**
 * 专家共识
 */
export interface ExpertConsensus {
  supportRate: number         // 专家支持率（出价>平均的比例）
  averageBid: number
  highestBid: number
  lowestBid: number
  mainStrengths: string[]     // 专家认可的优势
  mainConcerns: string[]      // 专家主要疑虑
  consensusLevel: 'HIGH' | 'MEDIUM' | 'LOW'  // 专家意见一致性
}

// ============ 新增：验证流程相关类型 ============

/**
 * 验证请求
 */
export interface VerificationRequest {
  ideaId: string
  phase: 1 | 2 | 3            // 三段式
  questions: VerificationQuestion[]
  estimatedMinutes: number
  rewards: string[]           // 完成后的交付物
  savedProgress?: {
    phase: number
    answeredCount: number
    savedAt: Date
  }
}

/**
 * 验证问题
 */
export interface VerificationQuestion {
  id: string
  phase: 1 | 2 | 3
  category: 'USER' | 'FINANCIAL' | 'MARKET' | 'TEAM'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  question: string
  type: 'TEXT' | 'NUMBER' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
  required: boolean
  hint?: string
  placeholder?: string
  options?: string[]
  dependsOn?: string          // 依赖的问题ID
  validation?: {
    min?: number
    max?: number
    pattern?: string
    customValidator?: string
  }
}

/**
 * 验证答案
 */
export interface VerificationAnswer {
  questionId: string
  answer: string | number | string[]
  confidence?: number         // 用户对答案的信心
  evidence?: DataEvidence     // 数据证据
  answeredAt: Date
}

/**
 * 数据证据
 */
export interface DataEvidence {
  type: 'SELF_REPORTED' | 'UPLOADED_DOC' | 'LINKED_SOURCE' | 'CALCULATED'
  source?: {
    type: 'FILE' | 'URL' | 'SCREENSHOT'
    url?: string
    filename?: string
    fileSize?: number
    uploadedAt?: Date
  }
  verificationStatus: 'PENDING' | 'VERIFIED' | 'SUSPICIOUS' | 'REJECTED'
  verifiedBy?: 'AUTO' | 'MANUAL'
  verifiedAt?: Date
}

/**
 * 验证结果
 */
export interface ValidationResult {
  passed: boolean
  healthScore: number         // 0-100
  confidence: number          // 0-1
  warnings: Warning[]
  suggestions: Suggestion[]
  timestamp: Date
}

export interface Warning {
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  category: 'FINANCIAL' | 'MARKET' | 'TEAM' | 'DATA_QUALITY'
  message: string
  detail: string
  affectedMetrics: string[]
  suggestion: string
}

export interface Suggestion {
  category: 'OPTIMIZATION' | 'RISK_MITIGATION' | 'DATA_COLLECTION'
  title: string
  description: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  actionable: boolean
  estimatedImpact: string
}

// ============ 扩展现有类型 ============

/**
 * 扩展 ScenarioOutput（现有类型）
 */
export interface ScenarioOutput {
  // ... 现有字段 ...

  // 新增：成熟度评分
  maturityScore?: CreativeMaturityScore

  // 新增：验证数据
  verificationData?: {
    requested: boolean
    completed: boolean
    answers?: VerificationAnswer[]
    validationResult?: ValidationResult
  }
}
```

### 7.2 API路由对齐

所有API统一使用 **App Router**

```
src/app/api/
  ├── score-creative-maturity/
  │   └── route.ts                # 评分API
  ├── generate-business-plan/
  │   └── route.ts                # 生成计划书（已存在，需修改）
  ├── verify-creative-data/
  │   └── route.ts                # 提交验证数据
  └── recalculate-score/
      └── route.ts                # 重新评分（补充信息后）
```

**避免**：在 `server.js` 中混杂业务逻辑

### 7.3 事件触发流程

```typescript
// server.js 只负责触发评分，不包含评分逻辑

async function finishRealAIBidding(ideaId, ideaContent, bids) {
  // ... 现有代码 ...

  // 触发评分API
  const apiBaseUrl = process.env.API_BASE_URL || `http://127.0.0.1:${port}`;

  try {
    const response = await fetch(`${apiBaseUrl}/api/score-creative-maturity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ideaId,
        ideaContent,
        aiMessages: collectAIMessages(ideaId),
        bids
      })
    });

    const { maturityScore } = await response.json();

    // 在session_complete中包含评分
    broadcastToSession(ideaId, {
      type: 'session_complete',
      results: {
        // ... 现有字段 ...
        maturityScore  // 新增
      }
    });

  } catch (error) {
    console.error('评分失败，使用降级策略:', error);
    // 降级：不评分，直接生成标准计划书
  }
}
```

---

## 🚀 八、分期实施计划（MVP优先）

### 第一期（MVP）：评分 + 低分引导 [2周]

**目标**：快速验证分级处理的价值

#### 功能范围
✅ 评分引擎（规则版，暂不做语义）
✅ 低分创意聚焦引导（交互式表单）
✅ 评分结果展示（4维雷达图）
❌ 中分/高分处理（暂用现有流程）

#### 技术实现
```
1. src/types/business-plan.ts - 新增类型定义
2. src/lib/business-plan/maturity-scorer.ts - 评分引擎（规则版）
3. src/app/api/score-creative-maturity/route.ts - 评分API
4. src/components/FocusGuidanceForm.tsx - 低分引导表单
5. server.js - 触发评分
```

#### 验证指标
- 低分创意占比
- 引导表单完成率
- 重新提交后的评分提升

---

### 第二期：中分优化 + 动态问卷 [2周]

**目标**：针对大多数用户（中分）优化体验

#### 功能范围
✅ 动态问卷（针对薄弱维度出题）
✅ 分段保存 + 即时洞见
✅ 优化版计划书生成

#### 技术实现
```
1. src/lib/business-plan/dynamic-questionnaire-generator.ts
2. src/app/api/generate-business-plan/route.ts - 修改
3. src/components/OptimizationQuestionnaire.tsx
```

#### 验证指标
- 问卷完成率
- 用户满意度
- 计划书下载率

---

### 第三期：高分验证 + 投资级计划书 [3周]

**目标**：为高质量创意提供深度服务

#### 功能范围
✅ 三段式验证
✅ 数据合理性检查
✅ 证据追踪
✅ 投资级计划书生成
✅ 财务模型（Excel导出）

#### 技术实现
```
1. src/lib/business-plan/data-verification-manager.ts
2. src/lib/business-plan/financial-calculator.ts
3. src/lib/business-plan/metrics-definitions.ts
4. src/components/VerificationWizard.tsx
```

#### 验证指标
- 高分创意占比
- 验证完成率
- 融资成功案例

---

### 第四期：智能优化 [持续]

**目标**：提升评分准确性和用户体验

#### 功能范围
✅ 语义匹配（接入向量检索）
✅ 矛盾检测
✅ 防刷分机制
✅ 多语言支持
✅ 标注集与监控

---

## 📊 九、数据隐私与合规

### 9.1 隐私声明

**高分验证前显示**：

```markdown
## 🔒 数据隐私声明

为生成投资级商业计划书，我们需要收集您的业务与财务数据。

### 我们收集什么？
- 用户数据（数量、来源、留存率）
- 财务数据（收入、成本、估值）
- 团队信息（背景、经验）

### 如何使用？
✅ 仅用于生成您的商业计划书
✅ 帮助评估数据合理性
❌ 不会用于其他目的
❌ 不会分享给第三方

### 数据安全
- 传输加密（HTTPS）
- 存储加密（AES-256）
- 访问审计（记录所有访问）
- 自动删除（90天后）

### 您的权利
- 随时导出数据
- 随时删除数据
- 选择不提供某些数据（影响计划书质量）

□ 我已阅读并同意隐私声明

[继续验证] [放弃]
```

### 9.2 最小化收集

```typescript
// 数据敏感级别
enum DataSensitivity {
  PUBLIC = 'PUBLIC',         // 可公开（如行业）
  INTERNAL = 'INTERNAL',     // 内部可见（如粗略收入范围）
  CONFIDENTIAL = 'CONFIDENTIAL',  // 机密（如详细财务）
  RESTRICTED = 'RESTRICTED'  // 严格受限（如用户名单）
}

// 问题定义时标注敏感级别
{
  id: 'revenue_detail',
  question: '月度收入明细',
  sensitivity: DataSensitivity.CONFIDENTIAL,
  required: false,  // 敏感数据改为可选
  alternative: '可提供收入区间：□10-50万 □50-100万 □100万+'
}
```

### 9.3 访问审计

```typescript
// 记录所有对验证数据的访问
await prisma.dataAccessLog.create({
  data: {
    ideaId: ideaId,
    accessor: userId,
    accessType: 'READ',
    dataFields: ['revenue', 'users', 'team'],
    purpose: 'GENERATE_PLAN',
    timestamp: new Date(),
    ipAddress: request.ip
  }
});
```

---

## ✅ 十、待确认问题清单

### 核心设计
- [ ] 1. **评分引擎**：第一期用规则版，第二/三期再加语义匹配，是否可行？
- [ ] 2. **阈值设置**：低/中/高分界线（4.0/5.0/7.0/7.5），是否合理？加入灰色区是否必要？
- [ ] 3. **权重配置**：目标用户30%、核心价值30%、商业模式25%、可信度15%，是否需调整？

### 用户体验
- [ ] 4. **评分透明度**：是否向用户展示详细4维评分？还是只展示总分+等级？
- [ ] 5. **低分引导**：压缩为3步表单（10分钟内），是否足够？还是需要更详细的文档？
- [ ] 6. **中分问卷**：动态生成（最多10题），是否合理？还是固定15题更好？
- [ ] 7. **高分验证**：三段式（每段3-5分钟），是否降低了放弃率？还是一次性更好？

### 数据处理
- [ ] 8. **置信度机制**：低置信度(<0.7)时不打分改为请求补充，是否合理？
- [ ] 9. **数据验证**：高分创意必须提供数据证据，还是可选？
- [ ] 10. **隐私合规**：90天自动删除验证数据，是否太短/太长？

### 技术实现
- [ ] 11. **分期计划**：第一期只做评分+低分引导（2周），是否可接受？
- [ ] 12. **API架构**：统一使用App Router，server.js只触发不包含逻辑，是否认同？
- [ ] 13. **类型整合**：修改现有business-plan.ts而非新建文件，是否会有冲突？

### 商业考量
- [ ] 14. **成本控制**：高分创意生成成本高（多次AI调用），是否需要付费门槛？
- [ ] 15. **用户配额**：每个用户每月免费评估几次？超出后如何处理？

---

## 📝 十一、后续优化方向（暂不实施）

这些优化在v3.0暂不实施，待MVP验证后再考虑：

1. **语义匹配**：接入向量检索，提升评分准确性
2. **多语言支持**：支持英文创意评估
3. **申诉机制**：用户觉得评分不合理时可申诉
4. **协作评分**：允许团队成员共同补充信息
5. **历史对比**：展示创意迭代前后的评分变化
6. **行业对标**：同行业创意的评分分布
7. **AI教练**：根据评分提供个性化创业建议
8. **融资对接**：高分创意推荐给投资人

---

**请您仔细阅读优化后的方案，确认以下关键点**：

1. ✅ 评分引擎升级（规则+语义+置信度）
2. ✅ 防刷分机制（边际递减+矛盾检测）
3. ✅ 三级处理优化（压缩低分、动态中分、分段高分）
4. ✅ 指标口径统一（定义文件）
5. ✅ 类型整合（修改而非新建）
6. ✅ 分期实施（MVP优先）
7. ✅ 隐私合规（声明+加密+审计）

**如果认可，我们就可以开始第一期开发了！** 🚀
