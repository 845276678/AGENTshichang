import type { ExecutionPlan } from "./types"
import type { BiddingSnapshot } from "./types"
import { resolveExecutionTemplate } from "./template-library"

export interface PracticalPlannerOptions {
  ideaDescription?: string
  industry?: string
  teamStrength?: string
}

const clonePlan = (plan: ExecutionPlan): ExecutionPlan => JSON.parse(JSON.stringify(plan))

export function buildExecutionPlan(
  snapshot: BiddingSnapshot,
  options: PracticalPlannerOptions = {}
): ExecutionPlan {
  const template = resolveExecutionTemplate({
    ideaTitle: snapshot.ideaTitle,
    industry: options.industry,
    teamStrength: options.teamStrength
  })

  const plan = clonePlan(template.plan)

  const supporters = snapshot.supportedAgents?.length ?? 0
  const highestBid = snapshot.highestBid ?? 0
  const winnerName = snapshot.winnerName || 'AI专家团队'

  plan.summary = `为"${snapshot.ideaTitle}"制定计划。团队应该在接下来的90天内证明技术、客户价值和可重复的商业模式。最高出价 ¥${highestBid} 显示势头良好，建议由 ${winnerName} 主导冲刺，同时让 ${supporters} 位支持者参与反馈循环。`

  plan.mission = snapshot.ideaDescription
    ? `端到端验证"${snapshot.ideaTitle}"概念。核心场景：${snapshot.ideaDescription.slice(0, 80)}...`
    : `端到端验证"${snapshot.ideaTitle}"概念并建立可重复的商业循环。`

  // 根据竞价结果微调指标
  plan.phases[0].metrics.push(`技术验收 ≥ ${Math.min(80, Math.max(40, Math.floor(highestBid / 5)))}%`)
  plan.phases[1].metrics.push('客户满意度 ≥ 8/10')
  plan.phases[2].metrics.push('至少10位付费或承诺用户')

  // 将支持者注入反馈循环
  if (supporters > 0 && snapshot.supportedAgents) {
    plan.feedbackLoop.channels.push(`支持者跟进：${snapshot.supportedAgents.join(', ')}`)
  }

  return plan
}
