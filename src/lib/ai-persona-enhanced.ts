import { AI_PERSONAS } from '@/lib/ai-persona-system'
import type { AIPersona } from '@/lib/ai-persona-system'

export type BidPhase = 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result'
export type PersonaTheme = 'market' | 'technology' | 'product' | 'general'

export interface PersonaBidContext {
  ideaContent: string
  round: number
  phase: BidPhase
  previousBids?: Record<string, number>
  highlights?: string[]
  theme?: PersonaTheme
}

export interface PersonaBidResult {
  persona: AIPersona
  personaId: string
  score: number
  bidAmount: number
  confidence: number
  comment: string
}

// Agent每日预算管理
interface AgentDailyBudget {
  personaId: string
  dailyLimit: number
  remainingBudget: number
  lastResetDate: string // YYYY-MM-DD格式
}

const DAILY_BUDGET_LIMIT = 2000
const agentBudgets: Map<string, AgentDailyBudget> = new Map()

// 获取当前日期字符串
function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// 重置agent预算(如果是新的一天)
function resetBudgetIfNeeded(personaId: string): void {
  const today = getTodayString()
  const budget = agentBudgets.get(personaId)

  if (!budget || budget.lastResetDate !== today) {
    agentBudgets.set(personaId, {
      personaId,
      dailyLimit: DAILY_BUDGET_LIMIT,
      remainingBudget: DAILY_BUDGET_LIMIT,
      lastResetDate: today
    })
  }
}

// 获取agent剩余预算
function getRemainingBudget(personaId: string): number {
  resetBudgetIfNeeded(personaId)
  return agentBudgets.get(personaId)?.remainingBudget ?? DAILY_BUDGET_LIMIT
}

// 扣除agent预算
function deductBudget(personaId: string, amount: number): boolean {
  resetBudgetIfNeeded(personaId)
  const budget = agentBudgets.get(personaId)

  if (!budget || budget.remainingBudget < amount) {
    return false
  }

  budget.remainingBudget -= amount
  return true
}

const BASE_NEUTRAL_SCORE = 60

const styleMultipliers: Record<AIPersona['biddingStyle'], number> = {
  conservative: 0.9,
  aggressive: 1.1,
  strategic: 1.05,
  emotional: 1,
  analytical: 1.05
}

const themeKeywords: Record<PersonaTheme, string[]> = {
  market: ['market', 'user', 'customer', 'revenue', 'business', 'competition'],
  technology: ['technology', 'tech', 'system', 'architecture', 'algorithm', 'model', 'data'],
  product: ['product', 'feature', 'experience', 'design', 'ux', 'ui'],
  general: []
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const asList = (value: string[] | undefined) => value ?? []

const keywordScore = (ideaContent: string, persona: AIPersona, theme: PersonaTheme) => {
  const normalized = ideaContent.toLowerCase()

  // 先检查人设匹配度 - 如果完全不匹配，返回极低分数
  const focusMatches = persona.personality.filter(keyword => normalized.includes(keyword.toLowerCase())).length
  const triggerMatches = asList(persona.triggerKeywords).filter(keyword => normalized.includes(keyword.toLowerCase())).length
  const themeMatches = themeKeywords[theme].filter(keyword => normalized.includes(keyword.toLowerCase())).length

  // 人设匹配阈值：至少需要1个personality关键词或2个trigger关键词
  const hasPersonalityMatch = focusMatches >= 1
  const hasTriggerMatch = triggerMatches >= 2
  const hasMinimalMatch = hasPersonalityMatch || hasTriggerMatch

  // 如果完全不符合人设，返回-50分(会导致最终分数很低，出价为0)
  if (!hasMinimalMatch) {
    return -50
  }

  // 正常匹配情况下的分数计算
  return focusMatches * 6 + triggerMatches * 4 + themeMatches * 2
}

const competitionPressure = (persona: AIPersona, currentBids: Map<string, number>) => {
  if (!currentBids.size) return 0
  const topBid = Math.max(...currentBids.values())
  const myBid = currentBids.get(persona.id) ?? 0
  const gap = topBid - myBid
  if (gap <= 0) return 5
  if (gap > 120) return 12
  if (gap > 60) return 8
  return 4
}

export function calculatePersonaScore(
  persona: AIPersona,
  ideaContent: string,
  theme: PersonaTheme,
  currentBids: Map<string, number>
): number {
  const base = BASE_NEUTRAL_SCORE
  const styleMultiplier = styleMultipliers[persona.biddingStyle] ?? 1
  const enthusiasm = keywordScore(ideaContent, persona, theme)
  const pressure = competitionPressure(persona, currentBids)
  const randomness = Math.random() * 8 - 4

  return clamp((base + enthusiasm + pressure + randomness) * styleMultiplier, 30, 95)
}

export function generatePersonaComment(
  persona: AIPersona,
  score: number,
  ideaContent: string,
  highlights: string[] = []
): string {
  const tone = score >= 80 ? '非常看好' : score >= 65 ? '谨慎乐观' : score >= 50 ? '需要验证' : '持保留态度'
  const intro = `${persona.name}：` + (persona.catchPhrase ? `${persona.catchPhrase} ` : '')
  const highlightText = highlights.length ? `关注点：${highlights.join('、')}。` : ''

  if (score >= 80) {
    return `${intro}${highlightText}我对这个创意非常有信心，建议快速验证核心假设并加大投入。`
  }
  if (score >= 65) {
    return `${intro}${highlightText}当前看法：${tone}。建议在控制成本的同时加快MVP交付，并收集更深入的用户反馈。`
  }
  if (score >= 50) {
    return `${intro}${highlightText}当前看法：${tone}。建议先强化关键数据点，然后再考虑投资决策。`
  }
  return `${intro}${highlightText}当前看法：${tone}。建议先解决关键风险，再进一步投入资源。`
}

const deriveBidAmount = (
  personaId: string,
  score: number,
  baseOffset: number,
  previousBids: Record<string, number> = {}
) => {
  // 如果分数太低(不匹配人设)，直接返回0
  if (score < 30) {
    return 0
  }

  // 检查剩余预算
  const remainingBudget = getRemainingBudget(personaId)
  if (remainingBudget <= 0) {
    return 0
  }

  const ambition = score / 100
  const currentHigh = Object.values(previousBids).reduce((max, value) => Math.max(max, value || 0), 0)
  const proposal = currentHigh * 0.6 + ambition * 200 + baseOffset
  const noise = Math.random() * 30 - 15

  // 计算初始出价
  const initialBid = Math.round(clamp(proposal + noise, 50, 500))

  // 考虑预算限制，保守出价(只用30%的预算在单个项目上)
  const maxBidForThisIdea = Math.min(initialBid, remainingBudget * 0.3)

  // 确保不低于50，但不超过剩余预算
  const finalBid = Math.min(Math.max(50, maxBidForThisIdea), remainingBudget)

  return Math.round(finalBid)
}

const resolveTheme = (phase: BidPhase, explicitTheme?: PersonaTheme): PersonaTheme => {
  if (explicitTheme) return explicitTheme
  if (phase === 'bidding') return 'market'
  if (phase === 'discussion') return 'product'
  return 'general'
}

export function generateBiddingRound(context: PersonaBidContext): PersonaBidResult[] {
  const { ideaContent, phase, round, previousBids = {}, highlights = [], theme } = context
  const resolvedTheme = resolveTheme(phase, theme)
  const currentBidMap = new Map(Object.entries(previousBids))

  return AI_PERSONAS.map(persona => {
    const score = calculatePersonaScore(persona, ideaContent, resolvedTheme, currentBidMap)
    const bidAmount = deriveBidAmount(persona.id, score, round * 10, previousBids)
    const comment = generatePersonaComment(persona, score, ideaContent, highlights)

    // 只有在实际出价时才扣除预算
    if (bidAmount > 0 && phase === 'bidding') {
      deductBudget(persona.id, bidAmount)
    }

    return {
      persona,
      personaId: persona.id,
      score,
      bidAmount,
      confidence: clamp(score / 100, 0.3, 0.95),
      comment
    }
  })
}

// 导出预算管理函数供外部使用
export function getAgentRemainingBudget(personaId: string): number {
  return getRemainingBudget(personaId)
}

export function resetAgentBudget(personaId: string): void {
  resetBudgetIfNeeded(personaId)
}

export { AI_PERSONAS, type AIPersona }