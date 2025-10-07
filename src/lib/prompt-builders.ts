import type { AIPersona } from '@/lib/ai-persona-system'
import type {
  IdeaEvaluationResult,
  IdeaEvaluationVerdict,
  DimensionStatus,
} from '@/lib/idea-evaluation'

export interface PromptSessionContext {
  ideaContent: string
  evaluationResult?: IdeaEvaluationResult
}

const VERDICT_LABEL: Record<IdeaEvaluationVerdict, string> = {
  reject: '拒绝',
  needs_work: '待完善',
  acceptable: '可推进',
  excellent: '优秀',
}

const DIMENSION_STATUS_LABEL: Record<DimensionStatus, string> = {
  missing: '缺失',
  weak: '薄弱',
  good: '良好',
  strong: '优秀',
}

const CRITICAL_REVIEW_TEMPLATE = `
你是{personaName}（{personaRole}），保持「{personaTone}」的表达风格，用犀利、简洁的语言点评创意。

**创意速览**
- 核心描述：{ideaSummary}
- 系统评分：{evaluationScore}/100（判定：{evaluationVerdict}）
- 综合可行性（0-10）：{feasibilityScore}
- 系统要点：{systemFeedback}

**维度概览**
{dimensionSummary}

**提示信息**
优势：
{strengthHighlights}
风险：
{riskHighlights}

原始创意节选：
---
{ideaFull}
---

请在150字内完成点评，结构需包含：
1. 开头一句点出最大隐患或最值得推进的突破口；
2. 简述最担忧或最看好的方面及原因；
3. 用短句给出2-3条必须补充或修正的关键行动建议（可用顿号或分号分隔）。

必须指出具体问题，避免客套和重复题面。`

const FALLBACK_CRITICAL_REVIEW_PROMPT = `你是{personaName}，请在不超过120字内直接点评：{ideaContent}`

export function buildCriticalReviewPrompt(
  persona: AIPersona,
  session: PromptSessionContext,
): string {
  const evaluation = session.evaluationResult
  const ideaFull = normalizeWhitespace(session.ideaContent || '') || '暂无创意描述'

  if (!evaluation) {
    return FALLBACK_CRITICAL_REVIEW_PROMPT
      .replace('{personaName}', persona.name)
      .replace('{ideaContent}', truncateText(ideaFull, 120))
  }

  const personaTone = persona.personality && persona.personality.length
    ? persona.personality.slice(0, 2).join('、')
    : '专业'
  const personaRole = persona.specialty || persona.catchPhrase || '领域专家'
  const ideaSummary = truncateText(ideaFull, 80)
  const dimensionSummary = evaluation.dimensions && evaluation.dimensions.length
    ? evaluation.dimensions
        .map((dimension) => `- ${dimension.label}: ${dimension.score}/${dimension.weight}（${DIMENSION_STATUS_LABEL[dimension.status] ?? dimension.status}）`)
        .join('
')
    : '- 暂无维度数据'
  const strengthHighlights = formatBulletList(evaluation.strengths)
  const riskHighlights = formatBulletList(evaluation.risks)
  const verdictLabel = VERDICT_LABEL[evaluation.verdict] ?? evaluation.verdict
  const feedbackSummary = truncateText(
    (evaluation.feedback || '')
      .split(/?
/)
      .find((line) => line.trim()) || '暂无系统反馈',
    80,
  )
  const feasibilityScore = (evaluation.score / 10).toFixed(1)

  const replacements: Record<string, string> = {
    '{personaName}': persona.name,
    '{personaTone}': personaTone,
    '{personaRole}': personaRole,
    '{ideaSummary}': ideaSummary,
    '{ideaFull}': truncateText(ideaFull, 200),
    '{evaluationScore}': String(evaluation.score),
    '{evaluationVerdict}': verdictLabel,
    '{systemFeedback}': feedbackSummary,
    '{dimensionSummary}': dimensionSummary,
    '{strengthHighlights}': strengthHighlights,
    '{riskHighlights}': riskHighlights,
    '{feasibilityScore}': feasibilityScore,
  }

  let prompt = CRITICAL_REVIEW_TEMPLATE
  for (const [token, value] of Object.entries(replacements)) {
    prompt = prompt.split(token).join(value)
  }
  return prompt
}

function formatBulletList(items: string[] | undefined, limit = 2): string {
  if (!items || items.length === 0) {
    return '- 暂无信息'
  }
  return items.slice(0, limit).map((item) => `- ${item}`).join('
')
}

function truncateText(value: string, max = 120): string {
  if (value.length <= max) {
    return value
  }
  return `${value.slice(0, max - 1)}…`
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}
