import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { logger } from "@/lib/logger"
import { ScenarioReasoner, scenarioCache } from "@/lib/business-plan/scenario-reasoner"
import type { ScenarioContext } from "@/types/business-plan"

export const dynamic = 'force-dynamic'


const reasoner = new ScenarioReasoner()

interface AnalyzeRequestBody {
  ideaId?: string
  ideaTitle: string
  ideaDescription: string
  category?: string
  context?: Partial<ScenarioContext>
  force?: boolean
}

const DEFAULT_CONTEXT: ScenarioContext = {
  industry: "待补充行业",
  targetCustomers: [],
  regions: [],
  channels: [],
  availableResources: [],
  constraints: [],
  launchTimeline: "待确认"
}

function normalizeContext(input?: Partial<ScenarioContext>): ScenarioContext {
  const normalizeArray = (value?: string | string[]): string[] => {
    if (!value) {
      return []
    }
    if (Array.isArray(value)) {
      return value.filter(Boolean)
    }
    return [value]
  }

  return {
    industry: input?.industry || DEFAULT_CONTEXT.industry,
    targetCustomers: normalizeArray(input?.targetCustomers),
    regions: normalizeArray(input?.regions),
    channels: normalizeArray(input?.channels),
    availableResources: normalizeArray(input?.availableResources),
    budgetRange: input?.budgetRange,
    constraints: normalizeArray(input?.constraints),
    launchTimeline: input?.launchTimeline || DEFAULT_CONTEXT.launchTimeline
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody

    if (!body.ideaTitle?.trim() || !body.ideaDescription?.trim()) {
      return NextResponse.json(
        { success: false, error: "缺少创意标题或描述" },
        { status: 400 }
      )
    }

    const context = normalizeContext(body.context)
    const ideaId = body.ideaId?.trim() || randomUUID()

    if (!body.force) {
      const cached = await scenarioCache.get(ideaId)
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          meta: { cached: true }
        })
      }
    }

    const scenario = await reasoner.analyze({
      ideaId,
      ideaTitle: body.ideaTitle,
      ideaDescription: body.ideaDescription,
      category: body.category || "GENERAL",
      context
    })

    await scenarioCache.set(ideaId, scenario)

    return NextResponse.json({
      success: true,
      data: scenario,
      meta: { cached: false }
    })
  } catch (error) {
    logger.error("Scenario analysis API failed", { route: "/api/scenario/analyze" }, error as Error)
    const message = error instanceof Error ? error.message : "场景分析失败"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
