import type { ExecutionPlan } from "./types"
import type { BiddingSnapshot } from "./types"
import { resolveExecutionTemplate } from "./template-library"
import { generatePersonalizedExecutionPlan } from "./ai-plan-generator"
import AIServiceManager from '../ai-service-manager'

export interface PracticalPlannerOptions {
  ideaDescription?: string
  industry?: string
  teamStrength?: string
  useAIGeneration?: boolean // 是否使用AI生成（默认true）
}

const clonePlan = (plan: ExecutionPlan): ExecutionPlan => JSON.parse(JSON.stringify(plan))

export async function buildExecutionPlan(
  snapshot: BiddingSnapshot,
  options: PracticalPlannerOptions = {}
): Promise<ExecutionPlan> {
  // 默认使用AI生成
  const useAI = options.useAIGeneration !== false

  // 如果启用AI生成，尝试用AI生成个性化计划
  if (useAI) {
    try {
      console.log('🤖 使用AI生成个性化执行计划...')
      const aiService = new AIServiceManager()
      const plan = await generatePersonalizedExecutionPlan(snapshot, aiService)

      console.log('✅ AI执行计划生成成功')

      // 仍然执行后续的个性化处理
      return enhancePlanWithBiddingContext(plan, snapshot)

    } catch (error) {
      console.error('❌ AI生成失败，降级到模板方案:', error)
      // AI失败，继续使用模板方案
    }
  }

  // 降级方案：使用模板
  console.log('📋 使用模板生成执行计划')
  const template = resolveExecutionTemplate({
    ideaTitle: snapshot.ideaTitle,
    industry: options.industry,
    teamStrength: options.teamStrength
  })

  const plan = clonePlan(template.plan)

  const supporters = snapshot.supportedAgents?.length ?? 0
  const highestBid = snapshot.highestBid ?? 0
  const winnerName = snapshot.winnerName || "AI专家团队"

  return enhancePlanWithBiddingContext(plan, snapshot)
}

/**
 * 用竞价结果和专家支持信息增强计划
 */
function enhancePlanWithBiddingContext(
  plan: ExecutionPlan,
  snapshot: BiddingSnapshot
): ExecutionPlan {
  const supporters = snapshot.supportedAgents?.length ?? 0
  const highestBid = snapshot.highestBid ?? 0
  const winnerName = snapshot.winnerName || "AI专家团队"

  const supporterNote = supporters > 0
    ? `好消息是有 ${supporters} 位专家明确看好，说明方向扎实`
    : "虽然现场支持者不多，但也许意味着市场还没被教育，反而是潜在机会"

  // 如果计划的summary还是通用模板，才替换
  if (plan.summary.includes('三个聚焦阶段') || plan.summary.includes('快速学习循环')) {
    plan.summary = `"${snapshot.ideaTitle}" 的 4 周冲刺计划来了。竞价阶段拿到了 ¥${highestBid} 的最高出价，${supporterNote}。接下来 28 天，请 ${winnerName} 带头推进，${supporters > 0 ? `其他 ${supporters} 位支持者` : "其他专家"}持续给反馈，每周都要拿出验证结果。`
  }

  // 如果mission还是通用的，才替换
  if (plan.mission.includes('在90天内完成验证') || !plan.mission.includes(snapshot.ideaTitle)) {
    plan.mission = snapshot.ideaDescription
      ? `把 "${snapshot.ideaTitle}" 落地，核心场景是：${snapshot.ideaDescription.slice(0, 80)}${snapshot.ideaDescription.length > 80 ? "..." : ""}。4 周内必须拿出能跑通的版本、真实用户反馈和收入信号。`
      : `4 周内把 "${snapshot.ideaTitle}" 从想法推进到可验证的产品雏形。每个周末都要看到数据、反馈和新的行动计划。`
  }

  // 移除技术可信度评分，添加更实际的指标（只在使用模板时需要）
  if (plan.phases[1] && !plan.phases[1].metrics.some(m => m.includes('原型体验自评'))) {
    plan.phases[1].metrics.push("原型体验自评至少 8 分（团队内部测试）")
  }
  if (plan.phases[2] && !plan.phases[2].metrics.some(m => m.includes('用户验证反馈'))) {
    plan.phases[2].metrics.push("收集至少 15 份有效的用户验证反馈")
  }
  if (plan.phases[3] && !plan.phases[3].metrics.some(m => m.includes('付费或预订承诺'))) {
    plan.phases[3].metrics.push("锁定至少 3 个明确的付费或预订承诺")
  }

  // 添加专家支持到反馈渠道
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
