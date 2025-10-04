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

  // 更口语化、更具体的计划描述
  const supporterNote = supporters > 0
    ? `好消息是有 ${supporters} 位专家明确看好，说明方向是对的`
    : `虽然支持的专家不多，但这正好说明市场还没被教育好，机会更大`

  plan.summary = `"${snapshot.ideaTitle}"的90天落地计划来了。竞价环节拿到了 ¥${highestBid} 的最高出价，${supporterNote}。接下来三个月，建议让 ${winnerName} 带头冲刺，${supporters > 0 ? `其他 ${supporters} 位支持者` : '其他专家'}持续给反馈。记住：每30天必须拿出阶段性成果，不能光做不验证。`

  plan.mission = snapshot.ideaDescription
    ? `把"${snapshot.ideaTitle}"这个想法做出来，核心场景就是：${snapshot.ideaDescription.slice(0, 80)}${snapshot.ideaDescription.length > 80 ? '...' : ''}。90天内必须证明技术能跑通、用户真的要、能赚到钱。`
    : `90天内把"${snapshot.ideaTitle}"从想法变成能赚钱的产品。每一步都要有用户反馈，每个月都要看到进展。`

  // 根据竞价结果动态调整指标，更接地气
  const techConfidence = Math.min(85, Math.max(50, Math.floor(highestBid / 5)))
  plan.phases[0].metrics.push(`技术验收评分 ≥ ${techConfidence}分（满分100）`)
  plan.phases[1].metrics.push('用户满意度 ≥ 8分（满分10分）')
  plan.phases[2].metrics.push('拿下至少10个付费用户（哪怕是内测价也算）')

  // 如果有支持者，把他们加入反馈循环
  if (supporters > 0 && snapshot.supportedAgents) {
    const agentNames = snapshot.supportedAgents.slice(0, 3).join('、')
    const moreText = snapshot.supportedAgents.length > 3 ? `等${snapshot.supportedAgents.length}位专家` : ''
    plan.feedbackLoop.channels.push(`定期跟 ${agentNames}${moreText} 同步进展，听他们的建议`)
  }

  return plan
}
