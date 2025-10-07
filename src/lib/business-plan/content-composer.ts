import { buildCoreGuide } from './core-guide-builder'
import { buildExecutionPlan } from './practical-planner'
import { generatePersonalizedRecommendations, formatRecommendationsAsMarkdown } from './personalized-recommendations'
import type { BiddingSnapshot, BusinessPlanMetadata, BusinessPlanGuide } from './types'

export interface ComposeGuideOptions {
  industry?: string
  teamStrength?: string
}

export interface ComposedBusinessPlan {
  guide: BusinessPlanGuide
  metadata: BusinessPlanMetadata
}

export async function composeBusinessPlanGuide(
  snapshot: BiddingSnapshot,
  options: ComposeGuideOptions = {}
): Promise<ComposedBusinessPlan> {
  const { guide, metadata } = await buildCoreGuide(snapshot)

  guide.executionPlan = buildExecutionPlan(snapshot, {
    ideaDescription: snapshot.ideaDescription,
    industry: options.industry,
    teamStrength: options.teamStrength
  })

  // 如果有用户上下文信息，生成个性化建议
  if (snapshot.userContext && snapshot.ideaDescription) {
    const recommendations = generatePersonalizedRecommendations(
      snapshot.userContext,
      snapshot.ideaDescription
    )

    // 将个性化建议添加到指南中
    const recommendationsMarkdown = formatRecommendationsAsMarkdown(recommendations)

    // 在核心指南的适当位置插入个性化建议
    // 可以添加到 executionPlan 或作为单独的部分
    if (guide.executionPlan) {
      guide.executionPlan.personalizedRecommendations = recommendationsMarkdown
    }
  }

  return { guide, metadata }
}

