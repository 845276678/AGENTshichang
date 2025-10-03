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

  // 1. 检查内容是否过于简短或空泛
  const contentWords = normalized.split(/\s+/).filter(w => w.length > 1)
  if (contentWords.length < 5) {
    // 少于5个有效词，太空泛，直接返回极低分
    return -100
  }

  // 2. 检查是否只是通用词汇组合（如"AI+创意"、"互联网+项目"等）
  const genericPatterns = [
    /^(ai|人工智能|互联网|科技|技术|创意|项目|平台|系统|app|应用)[\+\s]*(创意|项目|平台|系统|想法|idea|concept)?$/i,
    /^(ai|互联网|科技)[\+\s]*$/i
  ]

  const isGenericOnly = genericPatterns.some(pattern => pattern.test(normalized.trim()))
  if (isGenericOnly) {
    return -100
  }

  // 3. 检查人设专业领域匹配度
  const focusMatches = persona.personality.filter(keyword => normalized.includes(keyword.toLowerCase())).length
  const triggerMatches = asList(persona.triggerKeywords).filter(keyword => normalized.includes(keyword.toLowerCase())).length
  const themeMatches = themeKeywords[theme].filter(keyword => normalized.includes(keyword.toLowerCase())).length

  // 4. 更严格的人设匹配阈值
  // 需要：至少2个personality关键词 或 (1个personality + 3个trigger) 或 5个trigger
  const hasStrongPersonalityMatch = focusMatches >= 2
  const hasModerateMatch = focusMatches >= 1 && triggerMatches >= 3
  const hasStrongTriggerMatch = triggerMatches >= 5
  const hasMinimalMatch = hasStrongPersonalityMatch || hasModerateMatch || hasStrongTriggerMatch

  // 5. 如果不符合人设要求，返回极低分
  if (!hasMinimalMatch) {
    return -80
  }

  // 6. 检查是否有实质性的业务描述（用户、场景、价值等）
  const businessKeywords = ['用户', '客户', '场景', '问题', '解决', '价值', '需求', '痛点', 'user', 'customer', 'problem', 'solution', 'value']
  const hasBusinessContext = businessKeywords.some(keyword => normalized.includes(keyword))

  if (!hasBusinessContext && focusMatches < 3) {
    // 没有业务背景且匹配度不高，也是空泛内容
    return -60
  }

  // 7. 正常匹配情况下的分数计算
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
  const intro = persona.catchPhrase || ''
  const highlightText = highlights.length ? `特别关注${highlights.join('、')}这几块。` : ''

  // 根据分数和人设生成更自然的评论
  if (score < 30) {
    const lowScoreComments = [
      `${intro}说实话，这个想法还太空泛了，建议先想清楚具体要解决什么问题。`,
      `${intro}嗯...我觉得还需要更具体的方向，现在这样不太好评估。`,
      `${intro}抱歉啊，这个创意描述得太宽泛了，我暂时看不到明确的切入点。`,
      `${intro}建议你再细化一下，目前的信息量有点不够我做判断。`
    ]
    return lowScoreComments[Math.floor(Math.random() * lowScoreComments.length)]
  }

  if (score >= 80) {
    const highScoreComments = [
      `${intro}${highlightText}这个方向我很看好！建议赶紧做个MVP验证一下核心假设，我觉得有戏。`,
      `${intro}${highlightText}不错不错，这个切入点找得挺准的。尽快把产品原型跑起来，边做边调整。`,
      `${intro}${highlightText}很有潜力！我建议你马上开始做用户调研，同时准备技术方案，抓紧时间。`,
      `${intro}${highlightText}这个想法靠谱！关键是执行，建议先小范围测试，数据好的话可以快速扩大。`
    ]
    return highScoreComments[Math.floor(Math.random() * highScoreComments.length)]
  }

  if (score >= 65) {
    const goodScoreComments = [
      `${intro}${highlightText}想法还可以，不过建议先做做市场调研，看看用户是不是真的需要这个。`,
      `${intro}${highlightText}方向没啥大问题，建议控制好成本，先做个简单版本试试水。`,
      `${intro}${highlightText}有一定可行性，关键要把核心功能做扎实，别一开始就搞太复杂了。`,
      `${intro}${highlightText}我觉得可以试试，不过要注意几个关键指标，及时根据数据调整策略。`
    ]
    return goodScoreComments[Math.floor(Math.random() * goodScoreComments.length)]
  }

  if (score >= 50) {
    const moderateComments = [
      `${intro}${highlightText}嗯，有点意思，但还需要验证几个关键假设才能下判断。`,
      `${intro}${highlightText}这个方向可以考虑，建议先把核心数据收集起来，再决定要不要深入。`,
      `${intro}${highlightText}想法有一定价值，不过市场和技术方面都还有些不确定性，谨慎一点比较好。`,
      `${intro}${highlightText}我的看法是可以做，但要做好长期准备，短期可能看不到明显效果。`
    ]
    return moderateComments[Math.floor(Math.random() * moderateComments.length)]
  }

  // score 30-49
  const lowButNotZeroComments = [
    `${intro}${highlightText}老实说，这个方向风险比较大，建议先解决几个核心问题再推进。`,
    `${intro}${highlightText}嗯...感觉还有不少坑要填，如果要做的话，一定要把风险控制好。`,
    `${intro}${highlightText}我持保留意见，不是说不能做，而是觉得需要更充分的准备。`,
    `${intro}${highlightText}这个可能有点难度，建议你再想想有没有更好的切入点。`
  ]
  return lowButNotZeroComments[Math.floor(Math.random() * lowButNotZeroComments.length)]
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