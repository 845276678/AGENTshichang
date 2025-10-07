/**
 * Lightweight idea evaluation heuristics.
 * Scores an early-stage idea description before the agent bidding flow begins.
 */

export type IdeaEvaluationVerdict = 'reject' | 'needs_work' | 'acceptable' | 'excellent'

export interface IdeaEvaluationWeights {
  problemClarity: number
  userDefinition: number
  solutionStrength: number
  businessViability: number
}

export interface IdeaEvaluationBreakdown extends IdeaEvaluationWeights {}

export type IdeaEvaluationDimensionKey = keyof IdeaEvaluationWeights

export type DimensionStatus = 'missing' | 'weak' | 'good' | 'strong'

export interface IdeaEvaluationDimensionResult {
  key: IdeaEvaluationDimensionKey
  label: string
  score: number
  weight: number
  status: DimensionStatus
}

export interface SmartScoreContext {
  dimensions: IdeaEvaluationDimensionResult[]
  wordCount: number
  minimumWordCount: number
  missingSectionCount: number
  riskCount: number
}

export interface IdeaEvaluationResult {
  score: number
  verdict: IdeaEvaluationVerdict
  breakdown: IdeaEvaluationBreakdown
  strengths: string[]
  weaknesses: string[]
  missingSections: string[]
  improvementActions: string[]
  requiredInfo: string[]
  risks: string[]
  dimensions: IdeaEvaluationDimensionResult[]
  isWillingToDiscuss: boolean
  feedback: string
  metadata: {
    wordCount: number
    sentenceCount: number
    paragraphCount: number
    uniqueKeywordMatches: number
    keywordCoverage: number
  }
}

export interface IdeaEvaluationOptions {
  weights?: Partial<IdeaEvaluationWeights>
  minimumWordCount?: number
}

const DEFAULT_WEIGHTS: IdeaEvaluationWeights = {
  problemClarity: 25,
  userDefinition: 25,
  solutionStrength: 25,
  businessViability: 25,
}

export const DEFAULT_IDEA_EVALUATION_WEIGHTS = DEFAULT_WEIGHTS

export type IdeaEvaluation = IdeaEvaluationResult

const KEYWORDS = {
  problem: ['problem', 'pain', 'struggle', 'issue', 'challenge', 'need', 'gap', 'bottleneck', 'friction'],
  impact: ['because', 'leads to', 'results in', 'impact', 'effect', 'consequence'],
  user: ['user', 'customer', 'client', 'team', 'manager', 'founder', 'student', 'teacher', 'developer', 'designer', 'marketer', 'analyst'],
  userQualifier: ['b2b', 'b2c', 'smb', 'enterprise', 'saas', 'freelancer', 'agency', 'industry', 'segment', 'region'],
  solution: ['solution', 'platform', 'service', 'product', 'assistant', 'app', 'tool', 'workflow', 'automation', 'api', 'dashboard'],
  solutionDetail: ['feature', 'module', 'component', 'integration', 'pipeline', 'flow', 'step', 'process'],
  businessModel: ['pricing', 'subscription', 'license', 'fee', 'commission', 'revenue', 'business model', 'monetization', 'monetisation', 'premium'],
  market: ['market', 'competition', 'competitor', 'alternative', 'advantage', 'differentiation', 'positioning', 'segment'],
  traction: ['survey', 'interview', 'feedback', 'beta', 'pilot', 'traction', 'waitlist', 'users', 'customers', 'growth', 'retention', 'metric'],
} as const

const LIST_PATTERN = /(^|\n)\s*(?:[-*]|\d+\.)\s+/
const NUMBER_PATTERN = /\b\d[\d,]*(?:\.\d+)?\b/
const CURRENCY_PATTERN = /(\$|usd|eur|gbp|cny|rmb|yen|yuan|dollar|percent|%)/i

const DEFAULT_MIN_WORDS = 60

interface DimensionConfig {
  key: keyof IdeaEvaluationWeights
  label: string
  strength: string
  weakness: string
  missing: string
  action: string
}

const DIMENSION_CONFIGS: DimensionConfig[] = [
  {
    key: 'problemClarity',
    label: 'Problem clarity',
    strength: 'Problem statement is clear and specific.',
    weakness: 'Problem statement lacks context or clarity.',
    missing: 'Problem statement',
    action: 'Explain the core pain point the idea addresses and why it matters.',
  },
  {
    key: 'userDefinition',
    label: 'User definition',
    strength: 'Target users are well defined.',
    weakness: 'Target users are vague or missing.',
    missing: 'Target user profile',
    action: 'Describe who will use the solution, including roles, industries, or demographics.',
  },
  {
    key: 'solutionStrength',
    label: 'Solution strength',
    strength: 'Solution approach is tangible and actionable.',
    weakness: 'Solution outline lacks concrete detail.',
    missing: 'Solution outline',
    action: 'Outline the key features or workflow so reviewers understand how the idea works.',
  },
  {
    key: 'businessViability',
    label: 'Business viability',
    strength: 'Business model and validation signals are present.',
    weakness: 'Business model or validation signals are missing.',
    missing: 'Business model and traction',
    action: 'Describe how the idea makes money and reference traction, pricing, or market context.',
  },
]

export function evaluateIdea(ideaRaw: string, options: IdeaEvaluationOptions = {}): IdeaEvaluationResult {
  const idea = (ideaRaw ?? '').trim()

  if (!idea) {
    const emptyResult: Omit<IdeaEvaluationResult, 'feedback'> = {
      score: 0,
      verdict: 'reject',
      breakdown: createZeroBreakdown(),
      strengths: [],
      weaknesses: ['No description provided.'],
      missingSections: DIMENSION_CONFIGS.map((cfg) => cfg.missing),
      improvementActions: ['Add at least one paragraph describing the idea before submitting.'],
      requiredInfo: ['Provide problem, target user, solution details, and business model context.'],
      risks: ['Cannot assess feasibility or viability without content.'],
      dimensions: DIMENSION_CONFIGS.map((cfg) => ({
        key: cfg.key,
        label: cfg.label,
        score: 0,
        weight: DEFAULT_WEIGHTS[cfg.key],
        status: 'missing',
      })),
      isWillingToDiscuss: false,
      metadata: {
        wordCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        uniqueKeywordMatches: 0,
        keywordCoverage: 0,
      },
    }

    const feedback = generateEvaluationFeedback({ ...emptyResult, feedback: '' })
    return { ...emptyResult, feedback }
  }

  const weights = { ...DEFAULT_WEIGHTS, ...options.weights }
  const minimumWordCount = options.minimumWordCount ?? DEFAULT_MIN_WORDS

  const ideaUnix = idea.replace(/\r\n/g, '\n')
  const normalized = normalizeText(idea)
  const words = ideaUnix.split(/\s+/).filter(Boolean)
  const sentences = ideaUnix.split(/[.!?]+/).filter((chunk) => chunk.trim().length > 0)
  const paragraphs = ideaUnix.split(/\n{2,}/).filter((chunk) => chunk.trim().length > 0)

  const matchedKeywords = new Set<string>()

  const breakdown: IdeaEvaluationBreakdown = {
    problemClarity: scoreProblem(normalized, weights.problemClarity, matchedKeywords),
    userDefinition: scoreUser(normalized, weights.userDefinition, matchedKeywords),
    solutionStrength: scoreSolution(normalized, ideaUnix, weights.solutionStrength, matchedKeywords),
    businessViability: scoreBusiness(normalized, ideaUnix, weights.businessViability, matchedKeywords),
  }

  const strengths: string[] = []
  const weaknesses: string[] = []
  const missingSections: string[] = []
  const improvementActions: string[] = []
  const requiredInfo: string[] = []
  const risks: string[] = []
  const dimensions: IdeaEvaluationDimensionResult[] = []

  for (const config of DIMENSION_CONFIGS) {
    const weight = weights[config.key]
    const score = breakdown[config.key]
    const status = deriveDimensionStatus(score, weight)

    dimensions.push({
      key: config.key,
      label: config.label,
      score,
      weight,
      status,
    })

    analyseDimension(
      config,
      score,
      weight,
      strengths,
      weaknesses,
      missingSections,
      improvementActions,
      requiredInfo,
    )
  }

  const totalScore = Object.values(breakdown).reduce((sum, value) => sum + value, 0)
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0)
  const normalisedScore = totalWeight === 0 ? 0 : Math.min(100, Math.max(0, (totalScore / totalWeight) * 100))
  const baseScore = Math.round(normalisedScore)

  if (words.length < minimumWordCount) {
    risks.push(`Description is very short (${words.length} words). Expand the idea before sharing.`)
  }

  if (words.length > 2000) {
    risks.push('Description is very long. Consider summarising the essentials for reviewers.')
  }

  if (breakdown.businessViability === 0) {
    risks.push('Business model is missing. Reviewers may decline without monetisation or traction details.')
  }

  const dedupedStrengths = dedupe(strengths)
  const dedupedWeaknesses = dedupe(weaknesses)
  const dedupedMissingSections = dedupe(missingSections)
  const dedupedImprovementActions = dedupe(improvementActions)
  const dedupedRequiredInfo = dedupe(requiredInfo)
  const dedupedRisks = dedupe(risks)

  const uniqueKeywordMatches = matchedKeywords.size
  const keywordCoverage = words.length === 0 ? 0 : Number((uniqueKeywordMatches / words.length).toFixed(3))

  const finalScore = computeSmartScore(baseScore, {
    dimensions,
    wordCount: words.length,
    minimumWordCount,
    missingSectionCount: dedupedMissingSections.length,
    riskCount: dedupedRisks.length,
  })

  const verdict = deriveVerdict(finalScore)

  const baseResult: Omit<IdeaEvaluationResult, 'feedback'> = {
    score: finalScore,
    verdict,
    breakdown,
    strengths: dedupedStrengths,
    weaknesses: dedupedWeaknesses,
    missingSections: dedupedMissingSections,
    improvementActions: dedupedImprovementActions,
    requiredInfo: dedupedRequiredInfo,
    risks: dedupedRisks,
    dimensions,
    isWillingToDiscuss: verdict === 'acceptable' || verdict === 'excellent',
    metadata: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      uniqueKeywordMatches,
      keywordCoverage,
    },
  }

  const feedback = generateEvaluationFeedback({ ...baseResult, feedback: '' })

  return {
    ...baseResult,
    feedback,
  }
}

export async function evaluateIdeaQuality(ideaRaw: string, options: IdeaEvaluationOptions = {}): Promise<IdeaEvaluationResult> {
  return evaluateIdea(ideaRaw, options)
}

export function generateEvaluationFeedback(result: IdeaEvaluationResult): string {
  const sections: string[] = []

  sections.push(`Overall score: ${result.score}/100 (verdict: ${result.verdict}).`)
  sections.push(getVerdictMessage(result.verdict, result.score))
  sections.push(formatBreakdown(result.breakdown))

  pushBlock(sections, 'Strengths', result.strengths)
  pushBlock(sections, 'Weak spots', result.weaknesses)
  pushBlock(sections, 'Missing sections', result.missingSections)
  pushBlock(sections, 'Next actions', result.improvementActions)
  pushBlock(sections, 'Required info', result.requiredInfo)
  pushBlock(sections, 'Risks to address', result.risks)

  const dimensionSummary = formatDimensionOverview(result.dimensions)
  if (dimensionSummary) {
    sections.push(dimensionSummary)
  }

  const summaryLine = formatMetadataSummary(result)
  if (summaryLine) {
    sections.push(summaryLine)
  }

  return sections.join('\n\n')
}

function scoreProblem(text: string, weight: number, sink: Set<string>): number {
  const hits = countKeywordHits(text, KEYWORDS.problem, sink)
  if (hits === 0) {
    return 0
  }

  const impactHits = countKeywordHits(text, KEYWORDS.impact)
  const ratio = Math.min(1, 0.5 + Math.min(hits - 1, 3) * 0.12 + (impactHits > 0 ? 0.15 : 0))
  return Math.round(weight * ratio)
}

function scoreUser(text: string, weight: number, sink: Set<string>): number {
  const hits = countKeywordHits(text, KEYWORDS.user, sink)
  if (hits === 0) {
    return 0
  }

  const qualifierHits = countKeywordHits(text, KEYWORDS.userQualifier)
  const ratio = Math.min(1, 0.5 + Math.min(hits - 1, 3) * 0.12 + (qualifierHits > 0 ? 0.18 : 0))
  return Math.round(weight * ratio)
}

function scoreSolution(text: string, raw: string, weight: number, sink: Set<string>): number {
  const hits = countKeywordHits(text, KEYWORDS.solution, sink)
  if (hits === 0) {
    return 0
  }

  const detailHits = countKeywordHits(text, KEYWORDS.solutionDetail)
  const hasList = LIST_PATTERN.test(raw)
  const ratio = Math.min(1, 0.55 + Math.min(hits - 1, 3) * 0.12 + (detailHits > 0 ? 0.15 : 0) + (hasList ? 0.1 : 0))
  return Math.round(weight * ratio)
}

function scoreBusiness(text: string, raw: string, weight: number, sink: Set<string>): number {
  const modelHits = countKeywordHits(text, KEYWORDS.businessModel, sink)
  const marketHits = countKeywordHits(text, KEYWORDS.market)
  const tractionHits = countKeywordHits(text, KEYWORDS.traction)
  const hasNumbers = NUMBER_PATTERN.test(raw)
  const hasCurrency = CURRENCY_PATTERN.test(raw)

  if (modelHits === 0 && marketHits === 0 && tractionHits === 0) {
    return 0
  }

  const base = 0.45
  const bonus = Math.min(modelHits, 3) * 0.12 + Math.min(marketHits, 2) * 0.08 + Math.min(tractionHits, 2) * 0.1 + (hasNumbers ? 0.1 : 0) + (hasCurrency ? 0.1 : 0)
  const ratio = Math.min(1, base + bonus)
  return Math.round(weight * ratio)
}

function analyseDimension(
  config: DimensionConfig,
  score: number,
  weight: number,
  strengths: string[],
  weaknesses: string[],
  missingSections: string[],
  actions: string[],
  requiredInfo: string[],
) {
  const highThreshold = weight * 0.75
  const mediumThreshold = weight * 0.45

  if (score >= highThreshold) {
    strengths.push(config.strength)
    return
  }

  if (score === 0) {
    missingSections.push(config.missing)
    requiredInfo.push(config.action)
  }

  weaknesses.push(`${config.weakness} (scored ${score}/${weight} for ${config.label}).`)
  actions.push(config.action)

  if (score > 0 && score < mediumThreshold) {
    requiredInfo.push(`Add more detail for ${config.label.toLowerCase()} to meet reviewer expectations.`)
  }
}

function deriveVerdict(score: number): IdeaEvaluationVerdict {
  if (score >= 80) {
    return 'excellent'
  }
  if (score >= 60) {
    return 'acceptable'
  }
  if (score >= 40) {
    return 'needs_work'
  }
  return 'reject'
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function countKeywordHits(text: string, keywords: readonly string[], sink?: Set<string>): number {
  let count = 0
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      count += 1
      sink?.add(keyword)
    }
  }
  return count
}

function createZeroBreakdown(): IdeaEvaluationBreakdown {
  return {
    problemClarity: 0,
    userDefinition: 0,
    solutionStrength: 0,
    businessViability: 0,
  }
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function pushBlock(sections: string[], title: string, lines: string[]) {
  if (!lines.length) {
    return
  }
  const block = [title, ...lines.map((line) => `- ${line}`)].join('\n')
  sections.push(block)
}

function formatBreakdown(breakdown: IdeaEvaluationBreakdown): string {
  return [
    'Breakdown:',
    `- Problem clarity: ${breakdown.problemClarity}`,
    `- User definition: ${breakdown.userDefinition}`,
    `- Solution strength: ${breakdown.solutionStrength}`,
    `- Business viability: ${breakdown.businessViability}`,
  ].join('\n')
}

function getVerdictMessage(verdict: IdeaEvaluationVerdict, score: number): string {
  switch (verdict) {
    case 'excellent':
      return `Excellent foundation. This idea scores ${score}/100 and is ready for expert bidding.`
    case 'acceptable':
      return `Solid potential. At ${score}/100 the idea can enter expert review; strengthening weak spots will raise enthusiasm.`
    case 'needs_work':
      return `Partial fit. With a ${score}/100 score, fill the gaps below before agents invest more time.`
    case 'reject':
    default:
      return `Insufficient detail. A ${score}/100 score means key pillars are missing. Add the requested info before re-submitting.`
  }
}

function formatMetadataSummary(result: IdeaEvaluationResult): string {
  const { metadata } = result
  const parts: string[] = []
  parts.push(`Context: ${metadata.wordCount} words, ${metadata.sentenceCount} sentences, ${metadata.paragraphCount} paragraphs.`)
  if (metadata.uniqueKeywordMatches > 0) {
    parts.push(`Keyword matches: ${metadata.uniqueKeywordMatches} (~${(metadata.keywordCoverage * 100).toFixed(1)}% coverage).`)
  }
  return parts.join(' ')
}

function computeSmartScore(baseScore: number, context: SmartScoreContext): number {
  let score = baseScore

  const missingDimensions = context.dimensions.filter((dimension) => dimension.status === 'missing').length
  const weakDimensions = context.dimensions.filter((dimension) => dimension.status === 'weak').length
  const strongDimensions = context.dimensions.filter((dimension) => dimension.status === 'strong').length
  const goodDimensions = context.dimensions.filter((dimension) => dimension.status === 'good').length

  if (strongDimensions) {
    score += Math.min(10, strongDimensions * 2)
  }

  if (goodDimensions && strongDimensions < context.dimensions.length) {
    score += Math.min(4, goodDimensions)
  }

  if (weakDimensions) {
    score -= Math.min(15, weakDimensions * 4)
  }

  if (missingDimensions) {
    score -= Math.min(25, missingDimensions * 8)
  }

  if (context.wordCount < context.minimumWordCount) {
    score -= context.wordCount < context.minimumWordCount / 2 ? 12 : 8
  }

  if (context.missingSectionCount > 0) {
    score -= Math.min(12, context.missingSectionCount * 3)
  }

  if (context.riskCount > 0) {
    score -= Math.min(18, context.riskCount * 3)
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

function deriveDimensionStatus(score: number, weight: number): DimensionStatus {
  if (score === 0) {
    return 'missing'
  }
  const ratio = weight === 0 ? 0 : score / weight
  if (ratio >= 0.8) {
    return 'strong'
  }
  if (ratio >= 0.55) {
    return 'good'
  }
  return 'weak'
}

function formatDimensionOverview(dimensions: IdeaEvaluationDimensionResult[]): string {
  if (!dimensions.length) {
    return ''
  }
  return [
    'Dimension summary:',
    ...dimensions.map((dimension) => `- ${dimension.label}: ${dimension.score}/${dimension.weight} (${dimension.status})`),
  ].join('\n')
}
