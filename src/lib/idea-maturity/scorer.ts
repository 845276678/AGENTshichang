/**
 * 创意成熟度评分器
 *
 * 核心评分逻辑：
 * 1. 基础信息完整度（25分）
 * 2. AI竞价反馈质量（30分）
 * 3. 用户补充完善度（20分）
 * 4. 商业可行性（25分）
 */

import type {
  IdeaDataForScoring,
  ScoringResult,
  IdeaMaturityLevel
} from './types'

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
    aiMessages: Array<{
      personaId: string
      content: string
      emotion: string
      timestamp: Date | string
    }>
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
  ): ScoringResult {
    const total = basicScore + biddingScore + supplementScore + commercialScore

    let level: IdeaMaturityLevel
    if (total >= 90) level = IdeaMaturityLevel.HIGHLY_MATURE
    else if (total >= 80) level = IdeaMaturityLevel.MATURE
    else if (total >= 60) level = IdeaMaturityLevel.MODERATE
    else if (total >= 40) level = IdeaMaturityLevel.BASIC
    else level = IdeaMaturityLevel.IMMATURE

    return {
      totalScore: total,
      maturityLevel: level,
      dimensionScores: {
        basicCompleteness: basicScore,
        biddingFeedback: biddingScore,
        supplementQuality: supplementScore,
        commercialViability: commercialScore
      }
    }
  }

  // ============== 辅助方法 ==============

  private hasClarity(content: string): boolean {
    // 检查是否包含明确的"做什么"描述
    const clarityKeywords = ['开发', '创建', '设计', '构建', '提供', '帮助']
    return clarityKeywords.some(keyword => content.includes(keyword))
  }

  private hasSpecificity(content: string): boolean {
    // 检查是否有具体场景描述
    return content.length > 100 && !this.isTooVague(content)
  }

  private isTooVague(content: string): boolean {
    const vaguePatterns = ['所有人', '大家', '用户', '人们']
    return vaguePatterns.some(pattern => content.includes(pattern)) && content.length < 150
  }

  private isSpecificUser(targetUser: string): boolean {
    // 检查用户群体是否具体
    const specificIndicators = ['岁', '职业', '学生', '白领', '创业者']
    return specificIndicators.some(indicator => targetUser.includes(indicator))
  }

  private hasPainPoint(targetUser: string): boolean {
    // 检查是否提到痛点
    const painPointKeywords = ['痛点', '问题', '困难', '需要', '希望']
    return painPointKeywords.some(keyword => targetUser.includes(keyword))
  }

  private hasCoreFunctionDescription(coreFunctionality: string): boolean {
    return coreFunctionality.length > 20
  }

  private hasDifferentiation(content: string): boolean {
    const diffKeywords = ['不同', '创新', '独特', '优势', '改进']
    return diffKeywords.some(keyword => content.includes(keyword))
  }

  private hasEvidence(content: string): boolean {
    // 检查是否提供证据（案例、数据等）
    const evidenceKeywords = ['数据', '调研', '访谈', '案例', '例如', '比如']
    return evidenceKeywords.some(keyword => content.includes(keyword))
  }

  private hasMarketSizeEstimate(content: string): boolean {
    // 检查是否提到市场规模
    const marketKeywords = ['市场', '用户量', '规模', '亿', '万']
    return marketKeywords.some(keyword => content.includes(keyword))
  }

  private isReasonableMarketSize(content: string): boolean {
    // 检查市场规模评估是否合理（不是"所有人"、"全中国"等）
    const unreasonablePatterns = ['所有人', '全中国', '全世界', '每个人']
    return !unreasonablePatterns.some(pattern => content.includes(pattern))
  }

  private hasMonetizationMention(content: string): boolean {
    const monetizationKeywords = ['收费', '付费', '订阅', '广告', '变现']
    return monetizationKeywords.some(keyword => content.includes(keyword))
  }

  private isViableMonetization(content: string): boolean {
    // 简单检查变现方式是否合理
    return content.length > 50
  }

  private calculateAverageBid(bids: Record<string, number>): number {
    const values = Object.values(bids)
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  private calculateStdDev(bids: Record<string, number>): number {
    const values = Object.values(bids)
    if (values.length === 0) return 0

    const avg = this.calculateAverageBid(bids)
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2))
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length

    return Math.sqrt(variance)
  }
}
