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
  const winnerName = snapshot.winnerName || 'AI Expert Panel'

  plan.summary = `Plan for “${snapshot.ideaTitle}”. The team should use the next 90 days to prove technology, customer value and repeatable business. Highest bid ¥${highestBid} indicates momentum, and ${winnerName} is recommended to champion the sprint while keeping ${supporters} supporters in the feedback loop.`

  plan.mission = snapshot.ideaDescription
    ? `Validate the concept “${snapshot.ideaTitle}” end-to-end. Core scenario: ${snapshot.ideaDescription.slice(0, 80)}...`
    : `Validate the concept “${snapshot.ideaTitle}” end-to-end and establish a repeatable business loop.`

  // Lightly adapt metrics to the bidding results
  plan.phases[0].metrics.push(`Technical acceptance ≥ ${Math.min(80, Math.max(40, Math.floor(highestBid / 5)))}%`)
  plan.phases[1].metrics.push('Customer satisfaction ≥ 8/10')
  plan.phases[2].metrics.push('At least 10 paying or committed users')

  // Inject supporters into the feedback loop
  if (supporters > 0 && snapshot.supportedAgents) {
    plan.feedbackLoop.channels.push(`Supporter follow-ups: ${snapshot.supportedAgents.join(', ')}`)
  }

  return plan
}
