import { randomUUID } from "crypto"

import { logger } from "@/lib/logger"
import redis from "@/lib/redis"
import type { ClarificationQuestion, FeasibilityScore, ScenarioContext, ScenarioOutput } from "@/types/business-plan"

export interface ScenarioAnalyzePayload {
  ideaId: string
  ideaTitle: string
  ideaDescription: string
  category: string
  context: ScenarioContext
}

const CACHE_PREFIX = "bp:scenario:"
const CACHE_TTL_SECONDS = 60 * 60 * 24

export class ScenarioCache {
  async get(ideaId: string): Promise<ScenarioOutput | null> {
    const cached = await redis.get(`${CACHE_PREFIX}${ideaId}`)
    if (!cached) {
      return null
    }

    try {
      return JSON.parse(cached) as ScenarioOutput
    } catch (error) {
      logger.warn("Scenario cache payload parse failed", { ideaId }, error as Error)
      return null
    }
  }

  async set(ideaId: string, scenario: ScenarioOutput): Promise<void> {
    await redis.setex(
      `${CACHE_PREFIX}${ideaId}`,
      CACHE_TTL_SECONDS,
      JSON.stringify({ ...scenario, cachedAt: new Date().toISOString() })
    )
  }
}

export const scenarioCache = new ScenarioCache()

export class ScenarioReasoner {
  async analyze(payload: ScenarioAnalyzePayload): Promise<ScenarioOutput> {
    const traceId = randomUUID()
    const feasibility = this.computeFeasibilityScore(payload.context)
    const clarifications = this.buildClarificationQuestions(payload.context, feasibility)

    return {
      traceId,
      summary: this.composeSummary(payload, feasibility),
      primaryUseCases: this.deriveUseCases(payload, payload.context),
      actors: this.deriveActors(payload.context),
      assumptions: this.deriveAssumptions(payload.context),
      risks: this.deriveRisks(payload.context),
      feasibility,
      recommendedPilots: this.derivePilotPlans(payload.context),
      nextSteps: this.buildNextSteps(feasibility, clarifications),
      clarifications
    }
  }

  private computeFeasibilityScore(context: ScenarioContext): FeasibilityScore {
    const resourceScore = Math.min(100, (context.availableResources.length || 0) * 15 + 40)
    const hasDigitalChannel = context.channels.some(channel => /线上|online|app|小程序|数字/.test(channel))
    const techScore = Math.min(
      100,
      35 + (hasDigitalChannel ? 30 : 10) + (context.availableResources.includes("技术团队") ? 25 : 0)
    )
    const regulationRisk = context.constraints?.some(item => /监管|资质|牌照/.test(item)) ?? false
    const complianceScore = regulationRisk ? 65 : 85
    const marketScore = Math.min(100, (context.targetCustomers.length || 1) * 18 + (context.regions.length || 1) * 12 + 35)

    const overall = Math.round(
      resourceScore * 0.25 + techScore * 0.25 + complianceScore * 0.2 + marketScore * 0.3
    )

    const actions: FeasibilityScore["actions"] = []
    if (resourceScore < 70) {
      actions.push({ label: "补充关键执行资源", type: "clarify" })
    }
    if (!hasDigitalChannel) {
      actions.push({ label: "补齐线上触达渠道", type: "leverage" })
    }
    if (regulationRisk) {
      actions.push({ label: "梳理行业准入与合规要求", type: "mitigate" })
    }

    return {
      overall,
      resourceFit: Math.round(resourceScore),
      techFit: Math.round(techScore),
      compliance: Math.round(complianceScore),
      marketReadiness: Math.round(marketScore),
      actions
    }
  }

  private composeSummary(payload: ScenarioAnalyzePayload, feasibility: FeasibilityScore): string {
    const regions = payload.context.regions.length ? payload.context.regions.join("、") : "待确认地区"
    const channels = payload.context.channels.length ? payload.context.channels.join("、") : "渠道信息待补充"
    return `围绕"${payload.ideaTitle}"在${regions}落地，主要通过${channels}触达客户，当前整体可行性评分为 ${feasibility.overall} 分。`
  }

  private deriveUseCases(payload: ScenarioAnalyzePayload, context: ScenarioContext): string[] {
    if (!context.targetCustomers.length) {
      return ["需要补充目标客户群体信息以提炼应用场景"]
    }

    const base = context.targetCustomers.map(customer => `${customer} 使用 ${payload.ideaTitle} 解决核心痛点`)
    if (context.channels.some(channel => /线下/.test(channel))) {
      base.push("线下网点结合数字化工具提升转化与履约效率")
    }
    if (context.channels.some(channel => /线上|平台|app/.test(channel))) {
      base.push("通过线上触达实现低成本试点与反馈闭环")
    }
    return Array.from(new Set(base)).slice(0, 4)
  }

  private deriveActors(context: ScenarioContext) {
    const actors = context.targetCustomers.slice(0, 3).map(customer => ({
      name: customer,
      role: "目标用户",
      needs: ["体验提升", "成本优化"],
      successIndicators: ["留存率提升", "复购率增长"]
    }))

    if (context.availableResources.length) {
      actors.push({
        name: "项目执行团队",
        role: "内部实施",
        needs: ["明确分工", "资源保障"],
        successIndicators: ["关键节点按期完成", "质量指标达标"]
      })
    }

    if (context.channels.some(channel => /合作|渠道/.test(channel))) {
      actors.push({
        name: "合作伙伴",
        role: "渠道支撑",
        needs: ["利润共享", "协同机制"],
        successIndicators: ["合作协议签署", "渠道贡献率达标"]
      })
    }

    return actors
  }

  private deriveAssumptions(context: ScenarioContext): string[] {
    const assumptions = ["目标市场对方案存在明确痛点且有支付意愿"]
    if (context.budgetRange) {
      assumptions.push(`预算 ${context.budgetRange} 万元可覆盖试点成本`)
    } else {
      assumptions.push("预算未确认，需要在试点前锁定投入规模")
    }
    if (context.constraints?.length) {
      assumptions.push("可在 90 天内完成主要合规与审批流程")
    }
    return assumptions
  }

  private deriveRisks(context: ScenarioContext) {
    const risks = [] as ScenarioOutput["risks"]
    if (context.constraints?.some(item => /监管|牌照/.test(item))) {
      risks.push({
        type: "regulation",
        detail: "行业准入或牌照要求可能导致上线延期",
        severity: "high",
        mitigation: "收集必备资质，并与当地合规顾问确认办理周期"
      })
    }
    if (context.availableResources.length < 3) {
      risks.push({
        type: "resource",
        detail: "关键团队与合作资源储备不足",
        severity: "medium",
        mitigation: "在试点前补齐关键岗位与合作伙伴"
      })
    }
    if (!context.channels.length) {
      risks.push({
        type: "market",
        detail: "缺少明确触达渠道，市场验证成本偏高",
        severity: "medium",
        mitigation: "确认两条优先渠道并制定投放策略"
      })
    }
    return risks
  }

  private derivePilotPlans(context: ScenarioContext) {
    if (!context.regions.length) {
      return [{ city: "待定", channel: "待定", rationale: "需补充首批试点地区与渠道" }]
    }
    return context.regions.slice(0, 2).map((region, index) => ({
      city: region,
      channel: context.channels[index] || context.channels[0] || "线下试点",
      rationale: "结合资源与客群集中度，适合作为首批试点"
    }))
  }

  private buildClarificationQuestions(context: ScenarioContext, feasibility: FeasibilityScore): ClarificationQuestion[] {
    const questions: ClarificationQuestion[] = []

    if (!context.availableResources.length) {
      questions.push({
        id: randomUUID(),
        field: "availableResources",
        question: "请列出可立即投入的核心资源（团队、合作方、渠道等）",
        reason: "资源匹配度偏低，需要确认投入能力",
        required: true
      })
    }

    if (!context.channels.length) {
      questions.push({
        id: randomUUID(),
        field: "channels",
        question: "计划通过哪些渠道触达核心客户？",
        reason: "缺少渠道信息会影响市场准备度评分",
        required: true
      })
    }

    if (!context.budgetRange) {
      questions.push({
        id: randomUUID(),
        field: "business_model",
        question: "请提供预估的启动预算范围或阶段投入计划",
        reason: "预算缺失无法评估财务可行性",
        required: false
      })
    }

    if (feasibility.overall < 70) {
      questions.push({
        id: randomUUID(),
        field: "partnerships",
        question: "是否已有潜在合作伙伴或渠道资源可协助试点？",
        reason: "补充外部资源信息可提升落地可行性",
        required: false
      })
    }

    return questions
  }

  private buildNextSteps(feasibility: FeasibilityScore, clarifications: ClarificationQuestion[]) {
    const steps: ScenarioOutput["nextSteps"] = []
    const required = clarifications.filter(item => item.required)
    if (required.length) {
      steps.push({
        type: "clarify",
        description: `补齐关键信息：${required.map(item => item.question).join('、')}`
      })
    }
    steps.push({
      type: "research",
      description: "设计 5-8 位核心用户访谈验证需求与付费意愿"
    })
    if (feasibility.overall >= 70) {
      steps.push({
        type: "experiment",
        description: "制定 30/60/90 天试点计划并设置量化指标"
      })
    }
    return steps
  }
}
