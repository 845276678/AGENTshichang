# 创意成熟度评估体系设计文档（10分制）

## 1. 核心概念

创意成熟度（Idea Maturity Score）：衡量创意从"想法"到"可执行方案"的成熟程度

**设计原则**：
- 基于**The Mom Test**理论，识别有效/无效信号
- 5个维度综合评估，10分制计分
- 只有达到"中等成熟度"（5-7分）以上的创意，才解锁专业工作坊
- 未达标的创意，引导用户在竞价环节继续完善

---

## 2. 成熟度评分模型（10分制）

### 2.1 五维评估体系

```typescript
interface DimensionScores {
  targetCustomer: DimensionScore;   // 目标客户 20%
  demandScenario: DimensionScore;   // 需求场景 20%
  coreValue: DimensionScore;        // 核心价值 25%
  businessModel: DimensionScore;    // 商业模式 20%
  credibility: DimensionScore;      // 可信度 15%
}

interface DimensionScore {
  score: number;                    // 1-10分
  status: 'CLEAR' | 'NEEDS_FOCUS' | 'UNCLEAR';
  evidence: string[];               // 专家原话(最多3条)
  confidence: number;               // 该维度的置信度 0-1
}
```

### 2.2 维度1：目标客户（权重20%）

**评估标准**：
- ✅ **明确细分**：具体的用户画像（年龄、职业、痛点）
- ✅ **真实接触**：有用户访谈、介绍推荐
- ❌ **过于宽泛**："所有人"、"大家"

**评分示例**：
```
❌ 低分（2-4分）：
"所有需要学习的人"
→ 太泛化，无法验证

⚠️ 中分（5-7分）：
"高中理科生"
→ 有细分，但缺少痛点验证

✅ 高分（7.5-10分）：
"高三理科生（重点高中），备考压力大，错题多但没时间整理，
我访谈了20个学生，15个有此痛点"
→ 细分明确 + 真实访谈 + 痛点验证
```

---

### 2.3 维度2：需求场景（权重20%）

**评估标准**：
- ✅ **具体场景**：明确的使用场景和频次
- ✅ **刚需痛点**：有真实痛点故事
- ❌ **场景模糊**："经常"、"总是"等泛泛描述

**评分示例**：
```
❌ 低分（2-4分）：
"学生学习时使用"
→ 场景太模糊

⚠️ 中分（5-7分）：
"每周整理错题时使用"
→ 有具体场景，但缺少痛点证据

✅ 高分（7.5-10分）：
"上周五晚上，我花了2小时整理错题本，
拍照→分类→标注，效率很低。我同学也反映，
每次考试后都要花半天整理，丢了很多睡眠时间"
→ 具体时间 + 痛点量化 + 多个案例
```

---

### 2.4 维度3：核心价值（权重25%）

**评估标准**：
- ✅ **差异化明确**：与竞品有清晰区别
- ✅ **技术壁垒**：有独特优势
- ❌ **同质化**：和现有产品没区别

**评分示例**：
```
❌ 低分（2-4分）：
"做一个AI学习助手"
→ 没有差异化

⚠️ 中分（5-7分）：
"AI错题本，自动分析错题规律"
→ 有核心功能，但和竞品（作业帮）差异不明显

✅ 高分（7.5-10分）：
"专注错题分析（不做题库），OCR识别手写错题，
AI分析薄弱知识点，生成个性化复习计划。
作业帮主打题库+直播课，我们更轻量化"
→ 差异化明确 + 竞品分析 + 独特价值
```

---

### 2.5 维度4：商业模式（权重20%）

**评估标准**：
- ✅ **真实付费**：有用户已付费证据
- ✅ **变现路径清晰**：明确的收费方式
- ❌ **未来承诺**："将会付费"、"肯定会买"

**评分示例**：
```
❌ 低分（2-4分）：
"用户肯定愿意付费"
→ 未来承诺，无真实验证

⚠️ 中分（5-7分）：
"基础版免费，高级版99元/年"
→ 有变现路径，但未验证

✅ 高分（7.5-10分）：
"我们做了MVP，50个测试用户，12个转化付费（24%），
每月收入1188元，客单价99元/年。
竞品作业帮VIP 198元/年，我们定价更低"
→ 真实付费数据 + 转化率 + 竞品对比
```

---

### 2.6 维度5：可信度（权重15%）

**评估标准**：
- ✅ **可验证证据**：截图、数据、链接
- ✅ **具体过去**："上周"、"上次"等具体时间
- ❌ **假设性**："预计"、"应该"、"可能"

**评分示例**：
```
❌ 低分（2-4分）：
"我觉得用户应该会喜欢"
→ 假设，无验证

⚠️ 中分（5-7分）：
"上周我访谈了10个学生"
→ 有具体行动，但缺少证据

✅ 高分（7.5-10分）：
"附访谈记录截图：[链接]
留存率：第1周80%，第2周65%
Google Analytics数据：日活120人
App Store评分4.2分（35个评价）"
→ 多重可验证证据
```

---

## 3. The Mom Test 信号识别

### 3.1 有效信号（加分项）

```typescript
interface ValidSignals {
  specificPast: number;       // 具体的过去("上次"、"上周")
  realSpending: number;       // 真实花费("每月付"、"已付费")
  painPoints: number;         // 痛点故事("丢了客户"、"损失")
  userIntroductions: number;  // 用户介绍("介绍"、"认识")
  evidence: number;           // 可验证证据("截图"、"数据"、"链接")
}
```

**加分规则**：
- 商业模式：每个真实付费证据 +1.5分（最多+3分）
- 可信度：每个可验证证据 +2.0分（最多+4分）
- 核心价值：每个痛点故事 +0.8分（最多+2分）
- 目标客户：每个用户介绍 +0.6分（最多+1.5分）
- 需求场景：每个具体过去案例 +0.5分（最多+1.5分）

---

### 3.2 无效信号（降分项）

```typescript
interface InvalidSignals {
  compliments: number;        // 赞美次数（"太棒了"、"很喜欢"）
  generalities: number;       // 泛泛而谈（"我经常"、"大家都"）
  futurePromises: number;     // 未来保证（"会买"、"将会使用"）
}
```

**惩罚规则**：
- 赞美：完全过滤，不计入评分
- 泛泛而谈：降低置信度-0.1
- 未来承诺：>3次，降低置信度-0.15

---

## 4. 成熟度等级划分

### 4.1 等级定义

```typescript
type MaturityLevel =
  | 'LOW'        // 1-4分: 想法阶段
  | 'GRAY_LOW'   // 4-5分: 灰色区(想法→方向)
  | 'MEDIUM'     // 5-7分: 方向阶段 ✅ 解锁门槛
  | 'GRAY_HIGH'  // 7-7.5分: 灰色区(方向→方案)
  | 'HIGH';      // 7.5-10分: 方案阶段
```

### 4.2 各等级特征

#### 🔴 想法阶段（1-4分）

**特征**：
- 创意描述模糊，缺少关键信息
- AI专家质疑多，认可少
- 无真实用户验证
- 充满假设和未来承诺

**系统反馈**：
```
您的创意处于"想法阶段"（当前：3.2分）

🔒 工作坊状态：未解锁
距离解锁还需：1.8分

💡 建议优先改进：
1. 目标客户（2.5分）：补充5-10个真实用户访谈
2. 可信度（2.8分）：提供具体数据或证据
3. 商业模式（3.1分）：验证用户付费意愿

下一步：与AI专家团队深入讨论，收集用户反馈
```

---

#### 🟡 灰色区（4-5分）

**特征**：
- 基本信息完整，但缺少验证
- 有初步的用户画像，但未深入访谈
- 商业模式不明确

**系统反馈**：
```
您的创意即将突破"方向阶段"（当前：4.7分）

⏳ 工作坊状态：即将解锁
距离解锁还需：0.3分

💡 快速提升建议：
1. 补充1-2个真实用户访谈案例（+0.5分）
2. 说明与竞品的具体差异（+0.3分）
3. 提供痛点量化证据（+0.2分）

提示：再完善一次，即可解锁专业工作坊！
```

---

#### 🟢 方向阶段（5-7分）✅ **解锁门槛**

**特征**：
- 创意方向清晰，关键信息完整
- 有初步的用户验证
- AI专家认可度良好

**系统反馈**：
```
🎉 恭喜！您的创意已达到"方向阶段"（当前：6.3分）

✅ 工作坊状态：已解锁！

根据您的创意特点，推荐以下工作坊：

⭐⭐⭐⭐⭐ 需求验证工作坊（强烈推荐）
原因：目标客户画像初步清晰，建议通过模拟访谈深化验证
薄弱维度：credibility (4.5分)
预计时长：15分钟

⭐⭐⭐⭐ 盈利模式工作坊（推荐）
原因：商业模式有雏形，建议优化定价策略
薄弱维度：businessModel (5.2分)
预计时长：10分钟

⭐⭐⭐ MVP构建工作坊（可选）
原因：核心价值较清晰，可选参加
预计时长：20分钟

💡 还可提升：
- 可信度（4.5分）：补充可验证证据（截图/数据）
- 商业模式（5.2分）：验证用户付费意愿
```

---

#### 🟢 灰色区（7-7.5分）

**特征**：
- 创意非常成熟，细节丰富
- 有多个用户验证案例
- 商业模式初步验证

**系统反馈**：
```
🌟 您的创意即将达到"方案阶段"（当前：7.2分）

✅ 工作坊全部解锁

建议参加：
✅ MVP构建工作坊 - 直接进入开发阶段
✅ 增长黑客工作坊 - 制定精准推广策略
✅ 盈利模式工作坊 - 优化商业模式

提示：您的创意质量高，再补充1-2个真实付费案例，
即可达到"方案阶段"（可直接生成商业计划书）
```

---

#### 💎 方案阶段（7.5-10分）

**特征**：
- 创意极度完善，接近可执行标准
- 有真实付费数据或MVP验证
- AI专家高度认可

**系统反馈**：
```
💎 您的创意已达到"方案阶段"！（当前：8.5分）

建议：
1. 参加全部4个工作坊，获取执行级方案
2. 或直接生成完整商业计划书

特权已解锁：
✅ 工作坊"专家模式"（更深度的分析）
✅ 快速通道（工作坊流程简化）
✅ 1对1创业导师咨询（限时免费）

下一步：
- 进入专业工作坊深化方案
- 或直接生成商业计划书
- 连接投资人/资源对接
```

---

## 5. 技术实现方案

### 5.1 核心评分流程

```typescript
// src/lib/business-plan/maturity-scorer.ts
export class MaturityScorer {
  analyze(aiMessages: AIMessage[], bids: Record<string, number>): MaturityScoreResult {
    // 1. 过滤无效数据 (The Mom Test)
    const { validMessages, invalidSignals } = this.filterInvalidData(aiMessages);

    // 2. 识别有效信号 (The Mom Test)
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
    const totalScore = this.calculateWeightedScore(dimensions);

    // 5. 确定等级
    const level = this.determineLevel(totalScore);

    return { totalScore, level, dimensions, ... };
  }
}
```

### 5.2 评估API端点

```typescript
// POST /api/maturity/assess
{
  "ideaId": "idea_123",
  "userId": "user_456",
  "sessionId": "session_789",
  "aiMessages": [...],
  "bids": { "alex": 7.5, "sophia": 8.0, ... }
}

// 响应
{
  "success": true,
  "data": {
    "totalScore": 6.3,
    "level": "MEDIUM",
    "dimensions": {
      "targetCustomer": { "score": 6.5, "status": "NEEDS_FOCUS", "evidence": [...] },
      "demandScenario": { "score": 6.8, "status": "CLEAR", "evidence": [...] },
      "coreValue": { "score": 7.2, "status": "CLEAR", "evidence": [...] },
      "businessModel": { "score": 5.2, "status": "NEEDS_FOCUS", "evidence": [...] },
      "credibility": { "score": 4.5, "status": "UNCLEAR", "evidence": [...] }
    },
    "workshopAccess": {
      "unlocked": true,
      "recommendations": [...]
    },
    "validSignals": {
      "specificPast": 3,
      "realSpending": 0,
      "painPoints": 2,
      "userIntroductions": 1,
      "evidence": 0
    },
    "invalidSignals": {
      "compliments": 2,
      "generalities": 1,
      "futurePromises": 3
    },
    "confidence": 0.78
  }
}
```

---

## 6. 工作坊推荐逻辑

### 6.1 推荐算法

```typescript
function generateWorkshopRecommendations(assessment: MaturityScoreResult) {
  const { weakDimensions, level } = assessment;

  const recommendations = [];

  // 优先推荐薄弱维度对应的工作坊
  if (weakDimensions.includes('targetCustomer') || weakDimensions.includes('demandScenario')) {
    recommendations.push({
      workshopId: 'demand-validation',
      title: '🧪 需求验证实验室',
      priority: 'high',
      recommendationLevel: 5,
      reason: '目标客户或需求场景需要深化验证'
    });
  }

  if (weakDimensions.includes('businessModel')) {
    recommendations.push({
      workshopId: 'profit-model',
      title: '💰 盈利模式实验室',
      priority: 'high',
      recommendationLevel: 5,
      reason: '商业模式需要验证和优化'
    });
  }

  if (level === 'HIGH' || level === 'GRAY_HIGH') {
    recommendations.push({
      workshopId: 'mvp-building',
      title: '🛠️ MVP构建指挥部',
      priority: 'medium',
      recommendationLevel: 4,
      reason: '创意成熟度高，可进入开发阶段'
    });
  }

  return recommendations;
}
```

---

## 7. 数据埋点

```typescript
// 关键埋点事件
trackEvent('maturity_assessed', {
  totalScore: 6.3,
  level: 'MEDIUM',
  unlocked: true,
  weakDimensions: ['businessModel', 'credibility'],
  validSignalCount: 6,
  invalidSignalCount: 6,
  confidence: 0.78
});

trackEvent('workshop_recommendation_shown', {
  recommendations: ['demand-validation', 'profit-model'],
  topPriority: 'demand-validation'
});

trackEvent('workshop_entered', {
  workshopId: 'demand-validation',
  maturityScore: 6.3,
  weakDimensions: ['businessModel', 'credibility']
});
```

---

## 8. 防刷分机制

### 8.1 去重算法

```typescript
// 避免关键词堆砌刷分
private deduplicateConcerns(concerns: AIMessage[]): AIMessage[] {
  const seen = new Set<string>();
  return concerns.filter(msg => {
    const key = this.extractKeyIssue(msg.content);

    // 完全相同
    if (seen.has(key)) return false;

    // 语义近似检测
    for (const seenKey of seen) {
      if (this.isSemanticallyClose(key, seenKey)) {
        return false;
      }
    }

    seen.add(key);
    return true;
  });
}
```

### 8.2 边际递减

- 每个维度最多只计算前5个独特质疑/认可
- 重复关键词自动过滤
- 语义相似的问题合并计算

---

## 9. 总结

这个10分制成熟度评估体系确保：

✅ **科学性**：基于The Mom Test理论，识别真实需求
✅ **可信度**：置信度计算，量化评估可靠性
✅ **个性化**：基于薄弱维度推荐工作坊
✅ **防刷分**：去重算法，边际递减机制
✅ **渐进式**：5个等级，清晰的改进路径

**核心价值**：
避免用户拿着不成熟的创意浪费时间在深度工作坊中，
而是先在竞价环节打磨好，再进入专业化阶段。

---

**实施状态**：
- ✅ 评分引擎已实现（src/lib/business-plan/maturity-scorer.ts）
- ✅ 类型定义已完成（src/types/maturity-score.ts）
- ⏳ UI组件待实现
- ⏳ API端点待实现
- ⏳ 数据库集成待完成

**版本**：v2.0.0（10分制）
**更新时间**：2025-01-15
