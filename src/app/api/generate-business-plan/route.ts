import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { logger } from "@/lib/logger"
import { ScenarioReasoner, scenarioCache } from "@/lib/business-plan/scenario-reasoner"
import { BUSINESS_PLAN_STAGES } from "@/lib/business-plan/stages"
import { buildInitialStageStates, getGenerationState, saveGenerationState } from "@/lib/business-plan/storage"
import type { ScenarioContext } from "@/types/business-plan"

const reasoner = new ScenarioReasoner()

interface GenerateRequestBody {
  ideaId?: string
  ideaData: {
    title: string
    description: string
    category?: string
    tags?: string[]
    scenarioContext?: Partial<ScenarioContext>
  }
  force?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequestBody
    const { ideaData } = body

    if (!ideaData?.title?.trim() || !ideaData?.description?.trim()) {
      return NextResponse.json({ success: false, error: "缺少创意标题或描述" }, { status: 400 })
    }

    const normalizedContext: ScenarioContext = {
      industry: ideaData.scenarioContext?.industry || ideaData.category || "GENERAL",
      targetCustomers: toArray(ideaData.scenarioContext?.targetCustomers),
      regions: toArray(ideaData.scenarioContext?.regions),
      channels: toArray(ideaData.scenarioContext?.channels),
      availableResources: toArray(ideaData.scenarioContext?.availableResources),
      budgetRange: ideaData.scenarioContext?.budgetRange,
      constraints: toArray(ideaData.scenarioContext?.constraints),
      launchTimeline: ideaData.scenarioContext?.launchTimeline || "暂不确定"
    }

    const ideaId = body.ideaId?.trim() || randomUUID()
    const shouldForce = Boolean(body.force)

    let scenario = shouldForce ? null : await scenarioCache.get(ideaId)
    if (!scenario) {
      scenario = await reasoner.analyze({
        ideaId,
        ideaTitle: ideaData.title,
        ideaDescription: ideaData.description,
        category: ideaData.category || "GENERAL",
        context: normalizedContext
      })
      await scenarioCache.set(ideaId, scenario)
    }

    if (scenario.feasibility.overall < 70) {
      return NextResponse.json(
        {
          success: false,
          error: "创意可行性评分较低，请补充更多信息",
          data: {
            ideaId,
            scenario,
            clarifications: scenario.clarifications
          }
        },
        { status: 409 }
      )
    }

    const stages = buildInitialStageStates(BUSINESS_PLAN_STAGES, scenario)

    const state = {
      ideaId,
      scenario,
      stages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await saveGenerationState(state)

    return NextResponse.json({
      success: true,
      data: state
    })
  } catch (error) {
    logger.error("Generate business plan API failed", { route: "/api/generate-business-plan" }, error as Error)
    const message = error instanceof Error ? error.message : "生成商业计划书失败"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

function toArray(value?: string | string[]): string[] {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }
  return [value]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ideaId = searchParams.get('ideaId')

  if (!ideaId) {
    return NextResponse.json({ success: false, error: '缺少 ideaId' }, { status: 400 })
  }

  const state = await getGenerationState(ideaId)
  if (!state) {
    return NextResponse.json({ success: false, error: '未找到生成记录' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: state })
}
