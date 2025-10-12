# 创意成熟度评估体系设计文档

## 1. 核心概念

创意成熟度（Idea Maturity Score）：衡量创意是否具备进入专业工作坊深化的条件

**设计原则**：
- 只有达到"中等成熟度"以上的创意，才解锁4个专业工作坊
- 未达标的创意，引导用户在竞价环节继续完善

---

## 2. 成熟度评分模型（总分100分）

### 2.1 基础信息完整度（25分）
```typescript
interface BasicCompletenessScore {
  ideaDescription: {
    weight: 10,
    criteria: {
      length: '至少50字',
      clarity: '描述清晰，包含"做什么"',
      具体性: '不是纯概念，有具体场景'
    }
  },
  targetUser: {
    weight: 8,
    criteria: {
      明确性: '明确说出目标用户是谁',
      细分: '不是"所有人"这种泛泛描述',
      痛点: '提到用户痛点或需求'
    }
  },
  coreFunctionality: {
    weight: 7,
    criteria: {
      核心功能: '至少描述1个核心功能',
      差异化: '提到与现有产品的不同'
    }
  }
}
```

**评分示例**：
```
❌ 不成熟（5分）：
"我想做一个AI产品"
→ 太模糊，没有目标用户，没有功能描述

⚠️ 初步成熟（15分）：
"我想做一个AI学习助手，帮助学生提高学习效率"
→ 有方向，但目标用户太宽泛，功能不明确

✅ 较成熟（23分）：
"针对高中生备考压力大的痛点，开发AI错题本，自动分析学生的错题规律，生成个性化复习计划，目标用户是高一到高三的理科生"
→ 目标用户明确，痛点清晰，核心功能具体
```

---

### 2.2 AI竞价反馈质量（30分）
```typescript
interface BiddingFeedbackScore {
  竞价分数: {
    weight: 15,
    criteria: {
      平均分: 'avgBid >= 60分得满分',
      最高分: 'highestBid >= 80分加5分',
      一致性: '5个Agent分数标准差<15得5分'
    }
  },
  讨论深度: {
    weight: 15,
    criteria: {
      消息数量: 'aiMessages.length >= 15条',
      挑战次数: '至少2个Agent提出质疑',
      用户回复质量: '用户至少回复3次，每次>20字'
    }
  }
}
```

**评分逻辑**：
```javascript
// 竞价分数维度
const biddingScore = calculateBiddingScore({
  avgBid: 75,        // 平均出价75分
  highestBid: 90,    // 最高出价90分
  stdDev: 12         // 标准差12（一致性好）
})
// → 得分：15分（平均分）+ 5分（最高分奖励）+ 5分（一致性）= 25/30

// 讨论深度维度
const discussionScore = calculateDiscussionScore({
  messageCount: 20,       // 20条AI消息
  challengeCount: 3,      // 3个Agent质疑
  userReplies: [
    { length: 45, quality: 'good' },
    { length: 38, quality: 'good' },
    { length: 52, quality: 'excellent' }
  ]
})
// → 得分：5分（消息数）+ 5分（质疑数）+ 5分（回复质量）= 15/15
```

---

### 2.3 用户补充完善度（20分）
```typescript
interface SupplementScore {
  补充次数: {
    weight: 5,
    criteria: '使用了1-3次补充机会'
  },
  补充质量: {
    weight: 15,
    categories: {
      targetUserDetail: '补充了目标用户细节（+5分）',
      painPointEvidence: '提供了痛点证据或案例（+5分）',
      competitorInfo: '补充了竞品信息（+3分）',
      technicalDetail: '补充了技术实现细节（+2分）'
    }
  }
}
```

**示例**：
```
用户补充1：
"目标用户主要是高三理科生，因为他们备考时间紧，错题多，
我自己高三时就遇到这个问题，每次整理错题本要花2小时"

→ 得分：5分（补充次数）+ 5分（目标用户）+ 5分（痛点证据）= 15/20
```

---

### 2.4 商业可行性（25分）
```typescript
interface CommercialViabilityScore {
  市场规模: {
    weight: 8,
    criteria: {
      明确性: '提到市场规模或用户数量',
      合理性: '市场规模评估合理（不是"全中国人"）'
    }
  },
  变现路径: {
    weight: 8,
    criteria: {
      清晰度: '至少提到1种变现方式',
      可行性: '变现方式符合行业常规'
    }
  },
  竞争意识: {
    weight: 9,
    criteria: {
      竞品认知: '知道至少1个竞品',
      差异化: '说出了自己的差异化点'
    }
  }
}
```

**评分示例**：
```
✅ 高分案例（22分）：
"目标市场是全国高中生约2400万人，其中理科生占60%约1400万。
变现方式：基础版免费，高级版（AI深度分析）99元/年。
竞品有'作业帮'和'猿辅导'，但他们主要做题库和直播课，
我们专注错题分析和个性化复习路径，更轻量化。"

→ 市场规模（8分）+ 变现路径（8分）+ 竞争意识（6分）= 22/25
```

---

## 3. 成熟度等级划分

### 3.1 等级定义

```typescript
enum IdeaMaturityLevel {
  IMMATURE = 'immature',           // 0-39分：不成熟
  BASIC = 'basic',                 // 40-59分：初步成熟
  MODERATE = 'moderate',           // 60-79分：中等成熟 ✅ 解锁门槛
  MATURE = 'mature',               // 80-89分：成熟
  HIGHLY_MATURE = 'highly_mature'  // 90-100分：高度成熟
}
```

### 3.2 各等级特征

#### 🔴 不成熟（0-39分）
**特征**：
- 创意描述模糊，缺少关键信息
- AI竞价分数低（平均<50）
- 用户未主动补充或补充质量差

**系统反馈**：
```
您的创意还需要进一步完善。建议：
1. 明确目标用户是谁（年龄、职业、痛点）
2. 说清楚核心功能（解决什么问题）
3. 与AI专家团队深入讨论，完善创意

当前不建议进入专业工作坊，请先在竞价环节打磨创意。
```

**引导行为**：
- 禁用工作坊按钮（灰色+锁定图标）
- 显示"需要先达到60分"
- 提供"创意完善指南"链接

---

#### 🟡 初步成熟（40-59分）
**特征**：
- 基本信息完整，但缺少细节
- AI竞价分数中等（平均50-60）
- 商业可行性不明确

**系统反馈**：
```
您的创意已有基础，但还需要深化。建议：
1. 补充目标用户的具体痛点（为什么需要这个产品？）
2. 说明与竞品的差异化（为什么选你而不是竞品？）
3. 提供市场规模或变现思路

当前评分：55分，距离工作坊门槛还差5分。
```

**引导行为**：
- 工作坊按钮变为"即将解锁"状态
- 显示进度条："55/60"
- 提示"再补充1次高质量内容即可解锁"

---

#### 🟢 中等成熟（60-79分）✅ **解锁门槛**
**特征**：
- 创意描述清晰，关键信息完整
- AI竞价分数良好（平均60-75）
- 有初步的商业思考

**系统反馈**：
```
🎉 恭喜！您的创意已达到专业工作坊解锁标准（当前：68分）

根据您的创意特点，我们推荐以下工作坊：

✅ 需求验证工作坊（推荐度：⭐⭐⭐⭐⭐）
   您的目标用户较多元，建议通过模拟访谈验证真实需求

⚠️ MVP构建工作坊（推荐度：⭐⭐⭐）
   技术复杂度中等，可参加也可暂缓

⏸️ 增长黑客工作坊（推荐度：⭐⭐）
   建议先验证需求后再考虑推广

⏸️ 盈利模式工作坊（推荐度：⭐⭐⭐⭐）
   变现路径较清晰，建议参加优化定价策略
```

**解锁内容**：
- 全部4个工作坊可用
- 但根据创意特征，只推荐2-3个优先参加
- 其他可标记为"可选"或"后续参加"

---

#### 🟢 成熟（80-89分）
**特征**：
- 创意非常清晰，细节丰富
- AI竞价高分（平均75-85）
- 商业模式清晰，有竞争分析

**系统反馈**：
```
🌟 您的创意已非常成熟！（当前：83分）

强烈建议参加以下工作坊，进一步提升执行力：

✅ MVP构建工作坊 - 直接进入开发阶段
✅ 增长黑客工作坊 - 制定精准推广策略
✅ 盈利模式工作坊 - 优化商业模式

提示：您的创意质量高，工作坊将为您提供更深度的执行方案。
```

**解锁内容**：
- 全部工作坊推荐参加
- 可获得"快速通道"（工作坊流程简化）

---

#### 💎 高度成熟（90-100分）
**特征**：
- 创意极度完善，接近可执行标准
- AI竞价满分或接近满分
- 商业计划书质量高

**系统反馈**：
```
💎 您的创意已达到行业顶尖水平！（当前：94分）

建议：
1. 直接参加全部4个工作坊，获取执行级方案
2. 或跳过工作坊，直接生成完整商业计划书

特权：
- 工作坊"专家模式"已解锁（更深度的分析）
- 可预约"1对1创业导师咨询"（限时免费）
```

**解锁内容**：
- 专家模式工作坊
- 额外奖励功能（如导师咨询、资源对接）

---

## 4. 技术实现方案

### 4.1 数据结构

```typescript
interface IdeaMaturityAssessment {
  ideaId: string
  userId: string
  sessionId: string

  // 评分详情
  scores: {
    basicCompleteness: number      // 基础信息（25分）
    biddingFeedback: number         // 竞价反馈（30分）
    supplementQuality: number       // 补充质量（20分）
    commercialViability: number     // 商业可行性（25分）
  }

  // 总分和等级
  totalScore: number                // 0-100
  maturityLevel: IdeaMaturityLevel  // 成熟度等级

  // 解锁状态
  workshopAccess: {
    unlocked: boolean               // 是否解锁工作坊
    unlockedAt?: Date               // 解锁时间
    recommendations: WorkshopRecommendation[]  // 推荐参加的工作坊
  }

  // 改进建议
  improvementSuggestions: {
    category: string                // 改进类别
    priority: 'high' | 'medium' | 'low'
    suggestion: string              // 具体建议
    estimatedScoreGain: number      // 预计提升分数
  }[]

  // 历史记录
  assessmentHistory: {
    timestamp: Date
    totalScore: number
    trigger: 'initial' | 'supplement' | 'bidding_complete'
  }[]

  createdAt: Date
  updatedAt: Date
}
```

### 4.2 评分计算API

```typescript
// src/lib/idea-maturity/scorer.ts
export class IdeaMaturityScorer {
  /**
   * 计算基础信息完整度（25分）
   */
  calculateBasicCompleteness(data: {
    ideaContent: string
    targetUser?: string
    coreFunctionality?: string
  }): number {
    let score = 0

    // 创意描述（10分）
    if (data.ideaContent.length >= 50) score += 3
    if (this.hasClarity(data.ideaContent)) score += 4
    if (this.hasSpecificity(data.ideaContent)) score += 3

    // 目标用户（8分）
    if (data.targetUser) {
      if (this.isSpecificUser(data.targetUser)) score += 5
      if (this.hasPainPoint(data.targetUser)) score += 3
    }

    // 核心功能（7分）
    if (data.coreFunctionality) {
      if (this.hasCoreFunctionDescription(data.coreFunctionality)) score += 4
      if (this.hasDifferentiation(data.coreFunctionality)) score += 3
    }

    return Math.min(score, 25)
  }

  /**
   * 计算竞价反馈质量（30分）
   */
  calculateBiddingFeedback(data: {
    currentBids: Record<string, number>
    aiMessages: AIMessage[]
    userReplies: string[]
  }): number {
    let score = 0

    // 竞价分数（15分）
    const avgBid = this.calculateAverageBid(data.currentBids)
    const highestBid = Math.max(...Object.values(data.currentBids))
    const stdDev = this.calculateStdDev(data.currentBids)

    if (avgBid >= 60) score += 15
    else if (avgBid >= 50) score += 10
    else if (avgBid >= 40) score += 5

    if (highestBid >= 80) score += 5

    if (stdDev < 15) score += 5

    // 讨论深度（15分）
    if (data.aiMessages.length >= 15) score += 5

    const challengeCount = data.aiMessages.filter(
      msg => msg.emotion === 'worried' || msg.content.includes('质疑')
    ).length
    if (challengeCount >= 2) score += 5

    const qualityReplies = data.userReplies.filter(r => r.length > 20).length
    if (qualityReplies >= 3) score += 5

    return Math.min(score, 30)
  }

  /**
   * 计算用户补充完善度（20分）
   */
  calculateSupplementQuality(supplements: Array<{
    category: string
    content: string
  }>): number {
    let score = 0

    // 补充次数（5分）
    if (supplements.length >= 1) score += 5

    // 补充质量（15分）
    supplements.forEach(supp => {
      if (supp.category === 'targetUser' && supp.content.length > 30) score += 5
      if (supp.category === 'painPoint' && this.hasEvidence(supp.content)) score += 5
      if (supp.category === 'competitor' && supp.content.length > 20) score += 3
      if (supp.category === 'technical' && supp.content.length > 20) score += 2
    })

    return Math.min(score, 20)
  }

  /**
   * 计算商业可行性（25分）
   */
  calculateCommercialViability(data: {
    ideaContent: string
    marketAnalysis?: string
    competitors?: any[]
  }): number {
    let score = 0

    // 市场规模（8分）
    if (this.hasMarketSizeEstimate(data.ideaContent)) score += 5
    if (this.isReasonableMarketSize(data.ideaContent)) score += 3

    // 变现路径（8分）
    if (this.hasMonetizationMention(data.ideaContent)) score += 5
    if (this.isViableMonetization(data.ideaContent)) score += 3

    // 竞争意识（9分）
    if (data.competitors && data.competitors.length > 0) score += 5
    if (this.hasDifferentiation(data.ideaContent)) score += 4

    return Math.min(score, 25)
  }

  /**
   * 总评分计算
   */
  calculateTotalScore(
    basicScore: number,
    biddingScore: number,
    supplementScore: number,
    commercialScore: number
  ): {
    totalScore: number
    maturityLevel: IdeaMaturityLevel
  } {
    const total = basicScore + biddingScore + supplementScore + commercialScore

    let level: IdeaMaturityLevel
    if (total >= 90) level = IdeaMaturityLevel.HIGHLY_MATURE
    else if (total >= 80) level = IdeaMaturityLevel.MATURE
    else if (total >= 60) level = IdeaMaturityLevel.MODERATE
    else if (total >= 40) level = IdeaMaturityLevel.BASIC
    else level = IdeaMaturityLevel.IMMATURE

    return { totalScore: total, maturityLevel: level }
  }
}
```

### 4.3 实时评估API

```typescript
// src/app/api/idea-maturity/assess/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ideaId, sessionId, trigger } = body

    // 1. 获取创意数据
    const ideaData = await getIdeaData(ideaId, sessionId)

    // 2. 计算各维度分数
    const scorer = new IdeaMaturityScorer()

    const basicScore = scorer.calculateBasicCompleteness({
      ideaContent: ideaData.content,
      targetUser: ideaData.userContext?.targetUser,
      coreFunctionality: ideaData.userContext?.coreFunctionality
    })

    const biddingScore = scorer.calculateBiddingFeedback({
      currentBids: ideaData.biddingResults?.bids || {},
      aiMessages: ideaData.aiMessages || [],
      userReplies: ideaData.userReplies || []
    })

    const supplementScore = scorer.calculateSupplementQuality(
      ideaData.supplements || []
    )

    const commercialScore = scorer.calculateCommercialViability({
      ideaContent: ideaData.content,
      marketAnalysis: ideaData.analysis?.marketGap,
      competitors: ideaData.analysis?.competitors
    })

    // 3. 计算总分和等级
    const { totalScore, maturityLevel } = scorer.calculateTotalScore(
      basicScore,
      biddingScore,
      supplementScore,
      commercialScore
    )

    // 4. 判断是否解锁工作坊
    const unlocked = totalScore >= 60

    // 5. 生成推荐
    const recommendations = generateWorkshopRecommendations({
      totalScore,
      maturityLevel,
      ideaData
    })

    // 6. 生成改进建议
    const improvementSuggestions = generateImprovementSuggestions({
      scores: { basicScore, biddingScore, supplementScore, commercialScore },
      totalScore,
      ideaData
    })

    // 7. 保存评估结果
    const assessment: IdeaMaturityAssessment = {
      ideaId,
      userId: body.userId,
      sessionId,
      scores: {
        basicCompleteness: basicScore,
        biddingFeedback: biddingScore,
        supplementQuality: supplementScore,
        commercialViability: commercialScore
      },
      totalScore,
      maturityLevel,
      workshopAccess: {
        unlocked,
        unlockedAt: unlocked ? new Date() : undefined,
        recommendations
      },
      improvementSuggestions,
      assessmentHistory: [{
        timestamp: new Date(),
        totalScore,
        trigger
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await saveAssessment(assessment)

    return NextResponse.json({
      success: true,
      data: assessment
    })

  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## 5. UI/UX 设计

### 5.1 成熟度显示组件

```typescript
// src/components/idea-maturity/MaturityScoreCard.tsx
export const MaturityScoreCard: React.FC<{
  assessment: IdeaMaturityAssessment
}> = ({ assessment }) => {
  const { totalScore, maturityLevel, workshopAccess } = assessment

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>创意成熟度评估</CardTitle>
            <p className="text-sm text-gray-500">
              评估您的创意是否具备深度开发条件
            </p>
          </div>
          <MaturityBadge level={maturityLevel} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 总分显示 */}
        <div className="text-center">
          <div className="relative inline-block">
            <CircularProgress value={totalScore} max={100} size={120} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{totalScore}</span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
          </div>
        </div>

        {/* 各维度分数 */}
        <div className="space-y-3">
          <ScoreDimension
            label="基础信息完整度"
            score={assessment.scores.basicCompleteness}
            max={25}
            color="blue"
          />
          <ScoreDimension
            label="AI竞价反馈质量"
            score={assessment.scores.biddingFeedback}
            max={30}
            color="green"
          />
          <ScoreDimension
            label="用户补充完善度"
            score={assessment.scores.supplementQuality}
            max={20}
            color="purple"
          />
          <ScoreDimension
            label="商业可行性"
            score={assessment.scores.commercialViability}
            max={25}
            color="orange"
          />
        </div>

        {/* 工作坊解锁状态 */}
        <div className="pt-4 border-t">
          {workshopAccess.unlocked ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  专业工作坊已解锁！
                </span>
              </div>
              <p className="text-sm text-green-700">
                您的创意已达到标准，可以参加以下工作坊深化方案
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">
                  工作坊暂未解锁
                </span>
              </div>
              <p className="text-sm text-yellow-700 mb-2">
                距离解锁还需 {60 - totalScore} 分
              </p>
              <Progress value={(totalScore / 60) * 100} className="h-2" />
            </div>
          )}
        </div>

        {/* 改进建议 */}
        {!workshopAccess.unlocked && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">💡 改进建议</h4>
            {assessment.improvementSuggestions.slice(0, 3).map((sugg, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="mt-0.5">
                  +{sugg.estimatedScoreGain}分
                </Badge>
                <span className="text-gray-700">{sugg.suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 5.2 工作坊推荐组件

```typescript
// src/components/workshops/WorkshopRecommendations.tsx
export const WorkshopRecommendations: React.FC<{
  recommendations: WorkshopRecommendation[]
  unlocked: boolean
}> = ({ recommendations, unlocked }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">专业工作坊推荐</h3>

      {recommendations.map(rec => (
        <Card
          key={rec.workshopId}
          className={`${
            unlocked ? 'border-blue-200 hover:shadow-lg transition-shadow' : 'opacity-60'
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WorkshopIcon type={rec.workshopId} />
                <div>
                  <CardTitle className="text-base">{rec.title}</CardTitle>
                  <p className="text-sm text-gray-500">{rec.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={rec.priority} />
                {!unlocked && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>预计 {rec.estimatedDuration} 分钟</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">推荐度：</span>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rec.recommendationLevel
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button
                disabled={!unlocked}
                onClick={() => handleEnterWorkshop(rec.workshopId)}
              >
                {unlocked ? '进入工作坊' : '未解锁'}
              </Button>
            </div>

            {rec.reason && (
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-2">
                💡 {rec.reason}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## 6. 用户流程示例

### 场景1：不成熟创意（35分）

```
用户提交："我想做一个AI产品"

→ AI竞价环节：
  - 5个Agent质疑："太模糊了，做什么AI产品？"
  - 用户补充："帮助学习的AI"
  - Agent继续问："哪类学习？什么用户？"

→ 竞价结束，平均分45分

→ 成熟度评估：
  - 基础信息：8/25（描述太简单）
  - 竞价反馈：12/30（分数低）
  - 补充质量：5/20（补充不够详细）
  - 商业可行性：10/25（没提商业模式）
  - 总分：35分 → 不成熟

→ UI显示：
  ┌────────────────────────────────────┐
  │ ⚠️ 创意成熟度：35分（不成熟）       │
  │                                    │
  │ 工作坊状态：🔒 未解锁              │
  │ 距离解锁还需：25分                 │
  │                                    │
  │ 💡 改进建议：                      │
  │ 1. 明确目标用户（+8分）            │
  │ 2. 说明核心功能（+7分）            │
  │ 3. 补充市场分析（+5分）            │
  │                                    │
  │ [ 返回修改创意 ]  [ 查看指导 ]    │
  └────────────────────────────────────┘
```

---

### 场景2：中等成熟创意（68分）✅ 解锁

```
用户提交："针对高中理科生备考压力大，开发AI错题本，
          自动分析错题规律，生成个性化复习计划"

→ AI竞价环节：
  - Alex（技术）：75分，"技术可行，推荐用现成OCR"
  - Sophia（市场）：80分，"高三市场需求强"
  - Marcus（财务）：65分，"需要明确变现模式"
  - 用户补充："变现方式是免费+高级版99元/年"

→ 竞价结束，平均分70分

→ 成熟度评估：
  - 基础信息：22/25（描述清晰）
  - 竞价反馈：25/30（分数良好）
  - 补充质量：15/20（补充了变现）
  - 商业可行性：18/25（差异化不够明确）
  - 总分：68分 → 中等成熟 ✅

→ UI显示：
  ┌────────────────────────────────────┐
  │ 🎉 创意成熟度：68分（中等成熟）    │
  │                                    │
  │ 工作坊状态：✅ 已解锁！            │
  │                                    │
  │ 推荐参加的工作坊：                 │
  │                                    │
  │ ⭐⭐⭐⭐⭐ 需求验证工作坊            │
  │ 原因：目标用户多元，需验证需求      │
  │ [ 立即参加 ]                       │
  │                                    │
  │ ⭐⭐⭐⭐ 盈利模式工作坊              │
  │ 原因：优化定价策略，提升付费率      │
  │ [ 立即参加 ]                       │
  │                                    │
  │ ⭐⭐⭐ MVP构建工作坊                │
  │ 原因：技术方案较清晰，可选参加      │
  │ [ 稍后参加 ]                       │
  │                                    │
  │ [ 全部参加 ]  [ 跳过 ]            │
  └────────────────────────────────────┘
```

---

## 7. 动态调整机制

### 7.1 实时更新
```typescript
// 在用户补充创意后，实时重新评估
onUserSupplement(async (supplement) => {
  const newAssessment = await assessIdeaMaturity({
    ideaId,
    sessionId,
    trigger: 'supplement'
  })

  if (newAssessment.totalScore >= 60 && !wasUnlocked) {
    // 刚刚达到解锁标准
    showUnlockAnimation()
    trackEvent('workshop_unlocked', {
      previousScore: oldScore,
      newScore: newAssessment.totalScore
    })
  }
})
```

### 7.2 鼓励机制
```typescript
// 距离解锁很近时，给予鼓励
if (totalScore >= 55 && totalScore < 60) {
  showEncouragement({
    message: '再努力一下！距离解锁只差 ${60 - totalScore} 分',
    suggestions: getTopImprovementSuggestions(assessment, 2)
  })
}
```

---

## 8. 数据埋点

```typescript
// 关键埋点事件
trackEvent('idea_maturity_assessed', {
  totalScore: 68,
  maturityLevel: 'moderate',
  unlocked: true,
  trigger: 'bidding_complete'
})

trackEvent('workshop_recommendation_shown', {
  recommendations: ['demand-validation', 'profit-model'],
  topPriority: 'demand-validation'
})

trackEvent('workshop_entered', {
  workshopId: 'demand-validation',
  maturityScore: 68,
  timeFromUnlock: '2 minutes'
})
```

---

## 9. 总结

这个成熟度评估体系确保：

✅ **质量控制**：只有达标的创意才能进入工作坊
✅ **渐进式引导**：通过5个Agent竞价逐步完善创意
✅ **个性化推荐**：根据创意特点推荐合适的工作坊
✅ **动态调整**：实时评估，及时反馈
✅ **用户激励**：清晰的进度和改进路径

**核心价值**：
避免用户拿着不成熟的创意浪费时间在深度工作坊中，
而是先在竞价环节打磨好，再进入专业化阶段。
