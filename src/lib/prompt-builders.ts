import type { AIPersona } from '@/lib/ai-persona-system'
import type {
  IdeaEvaluationResult,
  IdeaEvaluationVerdict,
  DimensionStatus
} from '@/lib/idea-evaluation'

export interface PromptSessionContext {
  ideaContent: string
  evaluationResult?: IdeaEvaluationResult
}

const VERDICT_LABEL: Record<IdeaEvaluationVerdict, string> = {
  reject: '拒绝',
  needs_work: '待优化',
  acceptable: '可推进',
  excellent: '强烈推荐'
}

const DIMENSION_STATUS_LABEL: Record<DimensionStatus, string> = {
  missing: '缺失',
  weak: '薄弱',
  good: '良好',
  strong: '优秀'
}

const CRITICAL_REVIEW_TEMPLATE = `
作为 {personaName} 这位 {personaRole}，请以 {personaTone} 的口吻，为下面的创意写一段结构化点评。

**基础信息**
- 创意摘要：{ideaSummary}
- 系统评分：{evaluationScore}/100（判断为 {evaluationVerdict}）
- 可行性得分（0-10）：{feasibilityScore}
- 系统提醒要点：{systemFeedback}

**维度拆解**
{dimensionSummary}

**提示信息**
亮点：
{strengthHighlights}
风险：
{riskHighlights}

原始创意全文
---
{ideaFull}
---

请在 150 字以内输出：
1. 开场一句给出总体判断与价值取向；
2. 点出最值得肯定的部分，并解释原因；
3. 用 2~3 条建议指出需要补强的关键环节（用换行或顿号分隔）。

仅返回最终文本，不需要额外说明。`

const FALLBACK_CRITICAL_REVIEW_PROMPT =
  `请让 {personaName} 在 120 字内，从专业角度点评这条创意：{ideaContent}`

export function buildCriticalReviewPrompt(
  persona: AIPersona,
  session: PromptSessionContext
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

  const dimensionSummary =
    evaluation.dimensions && evaluation.dimensions.length
      ? evaluation.dimensions
          .map((dimension) => `- ${dimension.label}: ${dimension.score}/${dimension.weight}（${DIMENSION_STATUS_LABEL[dimension.status] ?? dimension.status}）`)
          .join('\n')
      : '- 暂无维度数据'

  const strengthHighlights = formatBulletList(evaluation.strengths)
  const riskHighlights = formatBulletList(evaluation.risks)
  const verdictLabel = VERDICT_LABEL[evaluation.verdict] ?? evaluation.verdict
  const feedbackSummary = truncateText(
    (evaluation.feedback || '')
      .split(/\r?\n/)
      .find((line) => line.trim()) || '系统暂未提供详细反馈',
    80
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
    '{feasibilityScore}': feasibilityScore
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
  return items
    .slice(0, limit)
    .map((item) => `- ${item}`)
    .join('\n')
}

/**
 * 智能截断文本 - 在合适的位置截断，保持语义完整
 */
function truncateText(value: string, max = 120): string {
  if (value.length <= max) {
    return value
  }

  // 尝试在句号、问号、感叹号处截断
  const sentenceEnd = /[。！？.!?]/g
  let lastMatch: RegExpExecArray | null = null
  let match: RegExpExecArray | null

  while ((match = sentenceEnd.exec(value)) !== null) {
    if (match.index < max) {
      lastMatch = match
    } else {
      break
    }
  }

  // 如果找到了合适的句子结尾
  if (lastMatch && lastMatch.index > max * 0.6) {
    return value.slice(0, lastMatch.index + 1)
  }

  // 否则尝试在逗号、分号处截断
  const punctuation = /[，；,;]/g
  lastMatch = null

  while ((match = punctuation.exec(value)) !== null) {
    if (match.index < max) {
      lastMatch = match
    } else {
      break
    }
  }

  if (lastMatch && lastMatch.index > max * 0.7) {
    return value.slice(0, lastMatch.index + 1) + '…'
  }

  // 最后在空格处截断，避免截断单词
  const lastSpace = value.lastIndexOf(' ', max - 1)
  if (lastSpace > max * 0.8) {
    return value.slice(0, lastSpace) + '…'
  }

  // 实在找不到好的截断点，直接截断
  return `${value.slice(0, max - 1)}…`
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}
