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
  const winnerName = snapshot.winnerName || "AI专家团队"

  const supporterNote = supporters > 0
    ? `好消息是有 ${supporters} 位专家明确看好，说明方向扎实`
    : "虽然现场支持者不多，但也许意味着市场还没被教育，反而是潜在机会"

  plan.summary = `"${snapshot.ideaTitle}" 的 4 周冲刺计划来了。竞价阶段拿到了 ¥${highestBid} 的最高出价，${supporterNote}。接下来 28 天，请 ${winnerName} 带头推进，${supporters > 0 ? `其他 ${supporters} 位支持者` : "其他专家"}持续给反馈，每周都要拿出验证结果。`

  plan.mission = snapshot.ideaDescription
    ? `把 "${snapshot.ideaTitle}" 落地，核心场景是：${snapshot.ideaDescription.slice(0, 80)}${snapshot.ideaDescription.length > 80 ? "..." : ""}。4 周内必须拿出能跑通的版本、真实用户反馈和收入信号。`
    : `4 周内把 "${snapshot.ideaTitle}" 从想法推进到可验证的产品雏形。每个周末都要看到数据、反馈和新的行动计划。`

  const techConfidence = Math.min(85, Math.max(50, Math.floor(highestBid / 5)))

  plan.phases[0]?.metrics.push(`技术可信度评分 ${techConfidence} 分（基于竞价信号）`)
  plan.phases[1]?.metrics.push("原型体验自评至少 8 分（团队内部测试）")
  plan.phases[2]?.metrics.push("收集至少 15 份有效的用户验证反馈")
  plan.phases[3]?.metrics.push("锁定至少 3 个明确的付费或预订承诺")

  if (supporters > 0 && snapshot.supportedAgents?.length) {
    const agentNames = snapshot.supportedAgents.slice(0, 3).join("、")
    const moreText = snapshot.supportedAgents.length > 3 ? `等 ${snapshot.supportedAgents.length} 位专家` : ""
    const expertChannel = `定期向 ${agentNames}${moreText} 同步进展，请他们把关关键决策`
    const channels = new Set(plan.feedbackLoop.channels)
    channels.add(expertChannel)
    plan.feedbackLoop.channels = Array.from(channels)
  }

  return plan
}
