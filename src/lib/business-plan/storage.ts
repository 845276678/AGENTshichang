import redis from "@/lib/redis"
import { logger } from "@/lib/logger"
import type { ScenarioOutput, BusinessPlanStageConfig } from "@/types/business-plan"

export type GenerationStageStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export interface GenerationStageState {
  id: string
  name: string
  aiProvider: BusinessPlanStageConfig["aiProvider"]
  estimatedTime: string
  deliverables: string[]
  status: GenerationStageStatus
  progress: number
  outputs?: unknown
  error?: string
}

export interface BusinessPlanGenerationState {
  ideaId: string
  scenario: ScenarioOutput
  stages: GenerationStageState[]
  createdAt: string
  updatedAt: string
}

const KEY_PREFIX = "bp:generation:"
const TTL_SECONDS = 60 * 60 * 24

export async function saveGenerationState(state: BusinessPlanGenerationState): Promise<void> {
  await redis.setex(`${KEY_PREFIX}${state.ideaId}`, TTL_SECONDS, JSON.stringify(state))
}

export async function getGenerationState(ideaId: string): Promise<BusinessPlanGenerationState | null> {
  const raw = await redis.get(`${KEY_PREFIX}${ideaId}`)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as BusinessPlanGenerationState
    return parsed
  } catch (error) {
    logger.warn("Failed to parse generation state", { ideaId }, error as Error)
    return null
  }
}

export function buildInitialStageStates(stages: BusinessPlanStageConfig[], scenario: ScenarioOutput): GenerationStageState[] {
  return stages.map(stage => ({
    id: stage.id,
    name: stage.name,
    aiProvider: stage.aiProvider,
    estimatedTime: stage.estimatedTime,
    deliverables: stage.deliverables,
    status: stage.id === "scenario_grounding" ? "completed" : "pending",
    progress: stage.id === "scenario_grounding" ? 100 : 0,
    outputs: stage.id === "scenario_grounding" ? scenario : undefined
  }))
}
