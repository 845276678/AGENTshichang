/**
 * 增强的AI竞价策略系统
 *
 * 实现动态出价计算，考虑多种因素：
 * - 用户补充内容质量
 * - 竞争对手出价情况
 * - AI角色自身信心度
 * - 市场趋势分析
 */

import type { AIPersona } from '@/lib/ai-persona-enhanced'

// 竞价上下文接口
export interface BiddingContext {
  ideaContent: string
  userSupplements: Array<{
    category: string
    content: string
    timestamp: Date
  }>
  currentBids: Record<string, number>
  aiMessages: Array<{
    personaId: string
    content: string
    emotion: string
    timestamp: Date
  }>
  phase: string
}

// 竞价策略接口
export interface BiddingStrategy {
  personaId: string
  baseBid: number
  finalBid: number
  adjustmentFactors: {
    userSupplement: number    // 用户补充内容影响 (0-50)
    competitorBids: number    // 竞争对手出价影响 (0-30)
    confidence: number        // 自身信心度 (0-20)
    marketTrend: number       // 市场趋势 (0-20)
    personalityBonus: number  // 个性化加成 (-10 to +10)
  }
  reasoning: string[]  // 出价理由
  maxBid: number
  minBid: number
}

// 分析用户补充内容质量
export const analyzeSupplementQuality = (supplements: BiddingContext['userSupplements']): number => {
  if (supplements.length === 0) return 0

  let qualityScore = 0

  supplements.forEach(supp => {
    const content = supp.content.toLowerCase()
    const length = supp.content.length

    // 1. 长度评分 (0-20分)
    if (length > 200) qualityScore += 20
    else if (length > 100) qualityScore += 15
    else if (length > 50) qualityScore += 10
    else qualityScore += 5

    // 2. 关键信息评分 (0-30分)
    const keywordScores = {
      '用户': 5, '目标': 5, '市场': 5,
      '功能': 5, '技术': 5, '创新': 5,
      '团队': 5, '资源': 5, '经验': 5,
      '预算': 5, '投入': 5, '成本': 5,
      '时间': 5, '计划': 5, '里程碑': 5
    }

    Object.entries(keywordScores).forEach(([keyword, score]) => {
      if (content.includes(keyword)) {
        qualityScore += score
      }
    })

    // 3. 具体性评分 (0-20分) - 检测数字和具体描述
    const hasNumbers = /\d+/.test(content)
    const hasPercentage = /%/.test(content)
    const hasMoneyAmount = /[¥$€]\d+|元|万|千/.test(content)

    if (hasNumbers) qualityScore += 8
    if (hasPercentage) qualityScore += 6
    if (hasMoneyAmount) qualityScore += 6
  })

  // 归一化到0-1范围
  return Math.min(qualityScore / 100, 1)
}

// 获取市场趋势评分
export const getMarketTrendScore = (context: BiddingContext): number => {
  const ideaContent = context.ideaContent.toLowerCase()
  let trendScore = 0.5 // 基础分

  // 热门领域关键词
  const trendingKeywords = {
    'ai': 0.15, '人工智能': 0.15, '机器学习': 0.12,
    '大数据': 0.1, '云计算': 0.1, '区块链': 0.08,
    '物联网': 0.08, '5g': 0.08, '元宇宙': 0.1,
    '新能源': 0.12, '绿色': 0.08, '可持续': 0.08,
    '健康': 0.1, '医疗': 0.1, '教育': 0.08,
    '社交': 0.08, '电商': 0.08, '短视频': 0.1
  }

  Object.entries(trendingKeywords).forEach(([keyword, boost]) => {
    if (ideaContent.includes(keyword)) {
      trendScore += boost
    }
  })

  return Math.min(trendScore, 1)
}

// 根据AI角色个性计算调整值
export const getPersonalityAdjustment = (
  persona: AIPersona,
  context: BiddingContext
): number => {
  let adjustment = 0
  const ideaContent = context.ideaContent.toLowerCase()

  // 根据专业领域匹配度调整
  const specialty = persona.specialty?.toLowerCase() || ''

  // 技术型专家
  if (specialty.includes('技术') || specialty.includes('工程')) {
    if (ideaContent.includes('技术') || ideaContent.includes('开发')) {
      adjustment += 15
    }
  }

  // 市场型专家
  if (specialty.includes('市场') || specialty.includes('营销')) {
    if (ideaContent.includes('市场') || ideaContent.includes('用户')) {
      adjustment += 15
    }
  }

  // 产品型专家
  if (specialty.includes('产品') || specialty.includes('设计')) {
    if (ideaContent.includes('产品') || ideaContent.includes('体验')) {
      adjustment += 15
    }
  }

  // 根据角色性格调整
  const personality = persona.personality?.toLowerCase() || ''

  if (personality.includes('激进') || personality.includes('冒险')) {
    adjustment += 10 // 激进型更愿意高价
  } else if (personality.includes('保守') || personality.includes('谨慎')) {
    adjustment -= 10 // 保守型更谨慎
  }

  // 根据冲突关系调整
  if (persona.conflicts && persona.conflicts.length > 0) {
    const hasCompetingBids = persona.conflicts.some(conflictId =>
      context.currentBids[conflictId] && context.currentBids[conflictId] > 0
    )
    if (hasCompetingBids) {
      adjustment += 8 // 与冲突对象竞争时更激进
    }
  }

  return adjustment
}

// 主要的动态出价计算函数
export const calculateDynamicBid = (
  persona: AIPersona,
  context: BiddingContext
): BiddingStrategy => {
  const reasoning: string[] = []

  // 1. 确定基础出价范围
  const baseBidRange = {
    min: 30,  // 最低出价
    max: 150  // 最高出价
  }

  let baseBid = baseBidRange.min
  reasoning.push(`初始基础出价: ${baseBid}`)

  // 2. 用户补充内容影响 (0-50分)
  let userSupplementAdjustment = 0
  if (context.userSupplements.length > 0) {
    const supplementQuality = analyzeSupplementQuality(context.userSupplements)
    userSupplementAdjustment = supplementQuality * 50
    baseBid += userSupplementAdjustment
    reasoning.push(`用户补充质量(${(supplementQuality * 100).toFixed(0)}%): +${userSupplementAdjustment.toFixed(1)}`)
  }

  // 3. 竞争对手出价影响 (0-30分)
  let competitorBidsAdjustment = 0
  const bidValues = Object.values(context.currentBids).filter(bid => bid > 0)

  if (bidValues.length > 0) {
    const maxCompetitorBid = Math.max(...bidValues)
    const avgCompetitorBid = bidValues.reduce((a, b) => a + b, 0) / bidValues.length

    if (maxCompetitorBid > baseBid) {
      // 竞争策略：超过最高出价10-20%
      const competitiveBoost = (maxCompetitorBid - baseBid) * 0.15
      competitorBidsAdjustment = Math.min(competitiveBoost, 30)
      baseBid += competitorBidsAdjustment
      reasoning.push(`竞争出价(最高${maxCompetitorBid}): +${competitorBidsAdjustment.toFixed(1)}`)
    }
  }

  // 4. 信心度影响 (0-20分)
  const baseConfidence = 0.7 // 基础信心度
  const confidenceAdjustment = baseConfidence * 20
  baseBid += confidenceAdjustment
  reasoning.push(`专家信心度(${(baseConfidence * 100).toFixed(0)}%): +${confidenceAdjustment.toFixed(1)}`)

  // 5. 市场趋势影响 (0-20分)
  const marketTrendScore = getMarketTrendScore(context)
  const marketTrendAdjustment = marketTrendScore * 20
  baseBid += marketTrendAdjustment
  reasoning.push(`市场趋势评分(${(marketTrendScore * 100).toFixed(0)}%): +${marketTrendAdjustment.toFixed(1)}`)

  // 6. 个性化调整 (-10 to +10)
  const personalityAdjustment = getPersonalityAdjustment(persona, context)
  baseBid += personalityAdjustment
  if (personalityAdjustment !== 0) {
    reasoning.push(`个性化调整: ${personalityAdjustment > 0 ? '+' : ''}${personalityAdjustment.toFixed(1)}`)
  }

  // 7. 确保在合理范围内
  const finalBid = Math.max(baseBidRange.min, Math.min(baseBid, baseBidRange.max))

  if (finalBid !== baseBid) {
    reasoning.push(`出价范围限制: ${baseBid.toFixed(1)} → ${finalBid.toFixed(1)}`)
  }

  reasoning.push(`最终出价: ${finalBid.toFixed(1)}`)

  return {
    personaId: persona.id,
    baseBid: baseBidRange.min,
    finalBid: Math.round(finalBid * 10) / 10, // 保留1位小数
    adjustmentFactors: {
      userSupplement: Math.round(userSupplementAdjustment * 10) / 10,
      competitorBids: Math.round(competitorBidsAdjustment * 10) / 10,
      confidence: Math.round(confidenceAdjustment * 10) / 10,
      marketTrend: Math.round(marketTrendAdjustment * 10) / 10,
      personalityBonus: Math.round(personalityAdjustment * 10) / 10
    },
    reasoning,
    maxBid: baseBidRange.max,
    minBid: baseBidRange.min
  }
}

// 批量计算所有AI角色的出价策略
export const calculateAllBiddingStrategies = (
  personas: AIPersona[],
  context: BiddingContext
): Record<string, BiddingStrategy> => {
  const strategies: Record<string, BiddingStrategy> = {}

  personas.forEach(persona => {
    strategies[persona.id] = calculateDynamicBid(persona, context)
  })

  return strategies
}

// 导出策略分析报告
export const generateStrategyReport = (
  strategies: Record<string, BiddingStrategy>
): string => {
  const sortedStrategies = Object.values(strategies).sort((a, b) => b.finalBid - a.finalBid)

  let report = '=== AI竞价策略分析报告 ===\n\n'

  sortedStrategies.forEach((strategy, index) => {
    report += `${index + 1}. 专家 ${strategy.personaId}\n`
    report += `   最终出价: ¥${strategy.finalBid}\n`
    report += `   调整因素:\n`
    report += `     - 用户补充: +${strategy.adjustmentFactors.userSupplement}\n`
    report += `     - 竞争出价: +${strategy.adjustmentFactors.competitorBids}\n`
    report += `     - 信心度: +${strategy.adjustmentFactors.confidence}\n`
    report += `     - 市场趋势: +${strategy.adjustmentFactors.marketTrend}\n`
    report += `     - 个性调整: ${strategy.adjustmentFactors.personalityBonus >= 0 ? '+' : ''}${strategy.adjustmentFactors.personalityBonus}\n`
    report += `   出价理由:\n`
    strategy.reasoning.forEach(reason => {
      report += `     • ${reason}\n`
    })
    report += '\n'
  })

  return report
}