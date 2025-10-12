/**
 * 改进建议生成器
 *
 * 根据各维度得分情况，生成具体的改进建议
 */

import type { ImprovementSuggestion, IdeaDataForScoring } from './types'

export class ImprovementSuggestionGenerator {
  /**
   * 生成改进建议
   */
  generateSuggestions(
    scores: {
      basicCompleteness: number
      biddingFeedback: number
      supplementQuality: number
      commercialViability: number
    },
    totalScore: number,
    ideaData: IdeaDataForScoring
  ): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = []

    // 基础信息完整度建议
    if (scores.basicCompleteness < 20) {
      suggestions.push(...this.getBasicCompletenessSuggestions(ideaData))
    }

    // 竞价反馈质量建议
    if (scores.biddingFeedback < 25) {
      suggestions.push(...this.getBiddingFeedbackSuggestions(ideaData))
    }

    // 补充质量建议
    if (scores.supplementQuality < 15) {
      suggestions.push(...this.getSupplementQualitySuggestions(ideaData))
    }

    // 商业可行性建议
    if (scores.commercialViability < 20) {
      suggestions.push(...this.getCommercialViabilitySuggestions(ideaData))
    }

    // 按优先级和预期提升分数排序
    suggestions.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return b.estimatedScoreGain - a.estimatedScoreGain
    })

    return suggestions
  }

  /**
   * 基础信息完整度建议
   */
  private getBasicCompletenessSuggestions(
    ideaData: IdeaDataForScoring
  ): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = []

    // 检查创意描述长度
    if (ideaData.ideaContent.length < 50) {
      suggestions.push({
        category: '基础信息',
        priority: 'high',
        suggestion: '创意描述过于简短（当前${ideaData.ideaContent.length}字），建议至少50字以上，详细说明"做什么"、"解决什么问题"',
        estimatedScoreGain: 8
      })
    }

    // 检查目标用户
    if (!ideaData.targetUser || ideaData.targetUser.length < 20) {
      suggestions.push({
        category: '基础信息',
        priority: 'high',
        suggestion: '目标用户描述不够具体，建议明确用户画像（年龄、职业、痛点）',
        estimatedScoreGain: 8
      })
    }

    // 检查核心功能
    if (!ideaData.coreFunctionality || ideaData.coreFunctionality.length < 20) {
      suggestions.push({
        category: '基础信息',
        priority: 'high',
        suggestion: '核心功能描述不清晰，建议说明产品的核心价值和与竞品的差异',
        estimatedScoreGain: 7
      })
    }

    return suggestions
  }

  /**
   * 竞价反馈质量建议
   */
  private getBiddingFeedbackSuggestions(
    ideaData: IdeaDataForScoring
  ): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = []

    // 检查AI消息数量
    const messageCount = ideaData.aiMessages?.length || 0
    if (messageCount < 15) {
      suggestions.push({
        category: 'AI竞价反馈',
        priority: 'medium',
        suggestion: `与AI专家的讨论还不够深入（当前${messageCount}条），建议继续完善创意描述，让专家有更多讨论内容`,
        estimatedScoreGain: 5
      })
    }

    // 检查用户回复数量
    const replyCount = ideaData.userReplies?.length || 0
    if (replyCount < 3) {
      suggestions.push({
        category: 'AI竞价反馈',
        priority: 'high',
        suggestion: `您的回复次数较少（${replyCount}次），建议积极回应AI专家的质疑，提供更多细节`,
        estimatedScoreGain: 5
      })
    }

    // 检查平均出价
    const avgBid = this.calculateAverage(Object.values(ideaData.currentBids || {}))
    if (avgBid < 50) {
      suggestions.push({
        category: 'AI竞价反馈',
        priority: 'high',
        suggestion: `AI专家平均出价较低（${Math.round(avgBid)}分），说明创意吸引力不足，建议补充市场分析和差异化优势`,
        estimatedScoreGain: 10
      })
    }

    return suggestions
  }

  /**
   * 补充质量建议
   */
  private getSupplementQualitySuggestions(
    ideaData: IdeaDataForScoring
  ): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = []

    const supplementCount = ideaData.supplements?.length || 0

    if (supplementCount === 0) {
      suggestions.push({
        category: '用户补充',
        priority: 'high',
        suggestion: '您还未使用"补充创意"功能，建议补充目标用户细节、痛点证据或竞品信息',
        estimatedScoreGain: 5
      })
    } else if (supplementCount < 3) {
      suggestions.push({
        category: '用户补充',
        priority: 'medium',
        suggestion: `已补充${supplementCount}次，还可再补充${3 - supplementCount}次，建议补充市场分析或技术实现细节`,
        estimatedScoreGain: 5
      })
    }

    // 检查是否缺少关键补充类别
    const categories = new Set(ideaData.supplements?.map(s => s.category) || [])
    if (!categories.has('targetUser')) {
      suggestions.push({
        category: '用户补充',
        priority: 'high',
        suggestion: '建议补充目标用户的具体痛点和使用场景（使用"补充创意"功能）',
        estimatedScoreGain: 5
      })
    }

    return suggestions
  }

  /**
   * 商业可行性建议
   */
  private getCommercialViabilitySuggestions(
    ideaData: IdeaDataForScoring
  ): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = []

    const content = ideaData.ideaContent.toLowerCase()

    // 检查市场规模
    const hasMarketSize = ['市场', '用户量', '规模'].some(kw => content.includes(kw))
    if (!hasMarketSize) {
      suggestions.push({
        category: '商业可行性',
        priority: 'high',
        suggestion: '创意中未提及市场规模，建议补充目标市场有多少潜在用户',
        estimatedScoreGain: 5
      })
    }

    // 检查变现方式
    const hasMonetization = ['收费', '付费', '订阅', '广告', '变现'].some(kw => content.includes(kw))
    if (!hasMonetization) {
      suggestions.push({
        category: '商业可行性',
        priority: 'high',
        suggestion: '创意中未明确变现方式，建议说明如何盈利（如：订阅制、广告、佣金等）',
        estimatedScoreGain: 5
      })
    }

    // 检查竞品信息
    const competitorCount = ideaData.competitors?.length || 0
    if (competitorCount === 0) {
      suggestions.push({
        category: '商业可行性',
        priority: 'medium',
        suggestion: '未提及竞品信息，建议研究至少1-2个竞品，说明您的差异化优势',
        estimatedScoreGain: 5
      })
    }

    // 检查差异化
    const hasDifferentiation = ['不同', '创新', '独特', '优势', '改进'].some(kw => content.includes(kw))
    if (!hasDifferentiation) {
      suggestions.push({
        category: '商业可行性',
        priority: 'medium',
        suggestion: '创意中未说明差异化优势，建议明确您的产品与现有方案有何不同',
        estimatedScoreGain: 4
      })
    }

    return suggestions
  }

  /**
   * 计算平均值
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }
}
