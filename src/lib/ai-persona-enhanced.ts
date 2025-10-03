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
  const focusMatches = persona.personality.filter(keyword => normalized.includes(keyword.toLowerCase())).length
  const triggerMatches = asList(persona.triggerKeywords).filter(keyword => normalized.includes(keyword.toLowerCase())).length
  const themeMatches = themeKeywords[theme].filter(keyword => normalized.includes(keyword.toLowerCase())).length

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
  const tone = score >= 80 ? 'high conviction' : score >= 65 ? 'cautious optimism' : score >= 50 ? 'needs validation' : 'holding back'
  const intro = `${persona.name}: ` + (persona.catchPhrase ? `${persona.catchPhrase} ` : '')
  const highlightText = highlights.length ? `Focus: ${highlights.join(', ')}. ` : ''

  if (score >= 80) {
    return `${intro}${highlightText}I am very confident about this idea. Let's double-down and validate the core assumptions quickly.`
  }
  if (score >= 65) {
    return `${intro}${highlightText}Current view: ${tone}. Accelerate MVP delivery while controlling costs and gather deeper user signals.`
  }
  if (score >= 50) {
    return `${intro}${highlightText}Current view: ${tone}. Strengthen the critical data points first, then revisit the investment decision.`
  }
  return `${intro}${highlightText}Current view: ${tone}. Resolve the key risks before committing further capital or resources.`
}

const deriveBidAmount = (score: number, baseOffset: number, previousBids: Record<string, number> = {}) => {
  const ambition = score / 100
  const currentHigh = Object.values(previousBids).reduce((max, value) => Math.max(max, value || 0), 0)
  const proposal = currentHigh * 0.6 + ambition * 200 + baseOffset
  const noise = Math.random() * 30 - 15
  return Math.round(clamp(proposal + noise, 50, 500))
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
    const bidAmount = deriveBidAmount(score, round * 10, previousBids)
    const comment = generatePersonaComment(persona, score, ideaContent, highlights)

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

export { AI_PERSONAS, type AIPersona }