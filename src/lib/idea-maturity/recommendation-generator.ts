/**
 * 工作坊推荐生成器
 *
 * 根据创意特征和成熟度分数，智能推荐合适的工作坊参加顺序
 */

import type {
  IdeaMaturityLevel,
  WorkshopRecommendation,
  WorkshopPriority,
  IdeaDataForScoring
} from './types'

export class WorkshopRecommendationGenerator {
  /**
   * 生成工作坊推荐
   */
  generateRecommendations(
    totalScore: number,
    maturityLevel: IdeaMaturityLevel,
    ideaData: IdeaDataForScoring
  ): WorkshopRecommendation[] {
    const recommendations: WorkshopRecommendation[] = []

    // 如果未解锁（< 60分），返回空数组
    if (totalScore < 60) {
      return recommendations
    }

    // 分析创意特征
    const characteristics = this.analyzeIdeaCharacteristics(ideaData)

    // 根据特征生成推荐
    recommendations.push(
      this.generateDemandValidationRecommendation(characteristics, totalScore),
      this.generateMVPBuildingRecommendation(characteristics, totalScore),
      this.generateGrowthHackingRecommendation(characteristics, totalScore),
      this.generateProfitModelRecommendation(characteristics, totalScore)
    )

    // 按推荐等级排序
    recommendations.sort((a, b) => b.recommendationLevel - a.recommendationLevel)

    return recommendations
  }

  /**
   * 分析创意特征
   */
  private analyzeIdeaCharacteristics(ideaData: IdeaDataForScoring): {
    hasVagueTargetUser: boolean
    hasTechnicalBackground: boolean
    hasUnclearBizModel: boolean
    hasCompetitors: boolean
    needsMarketValidation: boolean
  } {
    const content = ideaData.ideaContent.toLowerCase()
    const supplements = ideaData.supplements || []

    return {
      // 目标用户是否模糊
      hasVagueTargetUser: !ideaData.targetUser || ideaData.targetUser.length < 20,

      // 是否有技术背景（通过补充内容判断）
      hasTechnicalBackground: supplements.some(s =>
        s.category === 'technical' || s.content.includes('技术')
      ),

      // 商业模式是否不清晰
      hasUnclearBizModel: !(
        content.includes('付费') ||
        content.includes('订阅') ||
        content.includes('广告') ||
        content.includes('变现')
      ),

      // 是否提到竞品
      hasCompetitors: (ideaData.competitors?.length || 0) > 0,

      // 是否需要市场验证（根据AI消息情绪判断）
      needsMarketValidation: (ideaData.aiMessages || []).some(
        msg => msg.emotion === 'worried' || msg.content.includes('风险')
      )
    }
  }

  /**
   * 生成需求验证工作坊推荐
   */
  private generateDemandValidationRecommendation(
    characteristics: ReturnType<typeof this.analyzeIdeaCharacteristics>,
    totalScore: number
  ): WorkshopRecommendation {
    let priority: WorkshopPriority = 'medium'
    let level = 3
    let reason = '通过模拟用户访谈，验证需求真实性'

    // 高优先级条件
    if (characteristics.hasVagueTargetUser || characteristics.needsMarketValidation) {
      priority = 'high'
      level = 5
      reason = '您的目标用户较模糊，强烈建议通过模拟访谈验证真实需求，避免"虚假需求"陷阱'
    }

    return {
      workshopId: 'demand-validation',
      title: '🧪 需求验证实验室',
      description: '6位真实用户Agent模拟访谈，揭示表面需求 vs 真实需求',
      priority,
      recommendationLevel: level,
      reason,
      estimatedDuration: 15
    }
  }

  /**
   * 生成MVP构建工作坊推荐
   */
  private generateMVPBuildingRecommendation(
    characteristics: ReturnType<typeof this.analyzeIdeaCharacteristics>,
    totalScore: number
  ): WorkshopRecommendation {
    let priority: WorkshopPriority = 'medium'
    let level = 3
    let reason = '获取技术选型建议和MVP开发路径'

    // 非技术背景优先推荐
    if (!characteristics.hasTechnicalBackground) {
      priority = 'high'
      level = 4
      reason = '非技术背景创业者优先参加，专业团队帮您制定无代码/低代码方案'
    }

    // 高成熟度降低优先级
    if (totalScore >= 80) {
      priority = 'medium'
      level = 3
    }

    return {
      workshopId: 'mvp-building',
      title: '🛠️ MVP构建指挥部',
      description: '4位专业Agent（产品/技术/设计/测试）制定MVP开发方案',
      priority,
      recommendationLevel: level,
      reason,
      estimatedDuration: 20
    }
  }

  /**
   * 生成增长黑客工作坊推荐
   */
  private generateGrowthHackingRecommendation(
    characteristics: ReturnType<typeof this.analyzeIdeaCharacteristics>,
    totalScore: number
  ): WorkshopRecommendation {
    let priority: WorkshopPriority = 'low'
    let level = 2
    let reason = '获取冷启动推广策略和渠道建议'

    // 需求验证后才推荐高优先级
    if (totalScore >= 70 && !characteristics.needsMarketValidation) {
      priority = 'medium'
      level = 3
      reason = '需求已验证，现在可以开始制定推广策略'
    }

    return {
      workshopId: 'growth-hacking',
      title: '📢 增长黑客作战室',
      description: '5位Agent（平台专家+增长黑客+销售总监）制定推广方案',
      priority,
      recommendationLevel: level,
      reason,
      estimatedDuration: 15
    }
  }

  /**
   * 生成盈利模式工作坊推荐
   */
  private generateProfitModelRecommendation(
    characteristics: ReturnType<typeof this.analyzeIdeaCharacteristics>,
    totalScore: number
  ): WorkshopRecommendation {
    let priority: WorkshopPriority = 'medium'
    let level = 3
    let reason = '获取盈利模式设计和定价策略建议'

    // 商业模式不清晰时高优先级
    if (characteristics.hasUnclearBizModel) {
      priority = 'high'
      level = 4
      reason = '您的变现路径不够明确，强烈建议参加优化盈利模式'
    }

    // 如果已经很清晰，降低优先级
    if (!characteristics.hasUnclearBizModel && totalScore >= 80) {
      priority = 'low'
      level = 2
      reason = '变现路径较清晰，可选参加进一步优化定价策略'
    }

    return {
      workshopId: 'profit-model',
      title: '💰 盈利模式实验室',
      description: '3位Agent（商业模式专家+定价师+经济分析师）设计盈利方案',
      priority,
      recommendationLevel: level,
      reason,
      estimatedDuration: 10
    }
  }
}
