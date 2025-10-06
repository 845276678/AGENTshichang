import { buildCoreGuide } from './core-guide-builder'
import { buildExecutionPlan } from './practical-planner'
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

  return { guide, metadata }
}
