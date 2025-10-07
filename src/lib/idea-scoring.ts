/**
 * 创意评分系统
 *
 * 评分维度：
 * - 清晰度 (25分): 目标是否明确
 * - 完整度 (25分): 是否包含必要信息
 * - 可行性 (25分): 需求是否现实可执行
 * - 细节度 (25分): 描述是否具体
 */

export interface IdeaScoreDimension {
  name: string
  score: number // 0-25
  maxScore: number
  feedback: string
  suggestions: string[]
}

export interface IdeaScore {
  totalScore: number // 0-100
  maxScore: number
  dimensions: {
    clarity: IdeaScoreDimension
    completeness: IdeaScoreDimension
    feasibility: IdeaScoreDimension
    detail: IdeaScoreDimension
  }
  level: 'poor' | 'fair' | 'good' | 'excellent' // <60, 60-80, 80-90, >90
  needsImprovement: boolean
  overallFeedback: string
  guidedQuestions: string[]
}

/**
 * 评估创意的清晰度
 */
function evaluateClarity(ideaContent: string): IdeaScoreDimension {
  let score = 0
  const suggestions: string[] = []
  let feedback = ''

  const content = ideaContent.toLowerCase().trim()

  // 检查是否有明确的目标关键词
  const goalKeywords = ['目标', '想要', '希望', '打算', '计划', '实现', '解决']
  const hasGoal = goalKeywords.some(keyword => content.includes(keyword))
  if (hasGoal) {
    score += 10
  } else {
    suggestions.push('明确说明您的目标是什么')
  }

  // 检查是否描述了问题或需求
  const problemKeywords = ['问题', '需求', '痛点', '困难', '挑战', '不足']
  const hasProblem = problemKeywords.some(keyword => content.includes(keyword))
  if (hasProblem) {
    score += 8
  } else {
    suggestions.push('描述您想解决的问题或满足的需求')
  }

  // 检查长度（至少要有基本描述）
  if (content.length >= 50) {
    score += 7
  } else if (content.length >= 20) {
    score += 3
    suggestions.push('提供更详细的描述（至少50字）')
  } else {
    suggestions.push('创意描述太简短，请补充更多信息')
  }

  // 生成反馈
  if (score >= 20) {
    feedback = '创意目标非常清晰明确'
  } else if (score >= 15) {
    feedback = '创意目标基本清晰，可以进一步明确'
  } else if (score >= 10) {
    feedback = '创意目标模糊，需要更明确的表述'
  } else {
    feedback = '创意目标不清晰，建议重新组织描述'
  }

  return {
    name: '清晰度',
    score,
    maxScore: 25,
    feedback,
    suggestions
  }
}

/**
 * 评估创意的完整度
 */
function evaluateCompleteness(ideaContent: string): IdeaScoreDimension {
  let score = 0
  const suggestions: string[] = []
  let feedback = ''

  const content = ideaContent.toLowerCase()

  // 检查是否包含背景信息
  const backgroundKeywords = ['背景', '现状', '目前', '当前', '市场']
  const hasBackground = backgroundKeywords.some(keyword => content.includes(keyword))
  if (hasBackground) {
    score += 6
  } else {
    suggestions.push('补充项目背景或市场现状')
  }

  // 检查是否包含目标用户
  const userKeywords = ['用户', '客户', '受众', '人群', '群体', '对象']
  const hasUser = userKeywords.some(keyword => content.includes(keyword))
  if (hasUser) {
    score += 6
  } else {
    suggestions.push('说明目标用户群体是谁')
  }

  // 检查是否包含价值主张
  const valueKeywords = ['价值', '优势', '好处', '收益', '效果', '提升', '改善']
  const hasValue = valueKeywords.some(keyword => content.includes(keyword))
  if (hasValue) {
    score += 6
  } else {
    suggestions.push('阐述您的创意能带来什么价值')
  }

  // 检查是否包含实现方式
  const methodKeywords = ['实现', '方案', '方法', '技术', '功能', '特性']
  const hasMethod = methodKeywords.some(keyword => content.includes(keyword))
  if (hasMethod) {
    score += 7
  } else {
    suggestions.push('描述如何实现这个创意')
  }

  // 生成反馈
  if (score >= 20) {
    feedback = '创意信息完整全面'
  } else if (score >= 15) {
    feedback = '创意信息较为完整，可补充部分细节'
  } else if (score >= 10) {
    feedback = '创意信息不够完整，缺少关键要素'
  } else {
    feedback = '创意信息严重缺失，需要大幅补充'
  }

  return {
    name: '完整度',
    score,
    maxScore: 25,
    feedback,
    suggestions
  }
}

/**
 * 评估创意的可行性
 */
function evaluateFeasibility(ideaContent: string): IdeaScoreDimension {
  let score = 15 // 默认中等可行性
  const suggestions: string[] = []
  let feedback = ''

  const content = ideaContent.toLowerCase()

  // 检查是否提到资源
  const resourceKeywords = ['资源', '团队', '资金', '预算', '人员', '技能']
  const hasResource = resourceKeywords.some(keyword => content.includes(keyword))
  if (hasResource) {
    score += 5
  } else {
    suggestions.push('说明您拥有或需要的资源（人员、资金、技术等）')
  }

  // 检查是否提到时间计划
  const timeKeywords = ['时间', '周期', '阶段', '计划', '进度', '月', '年']
  const hasTime = timeKeywords.some(keyword => content.includes(keyword))
  if (hasTime) {
    score += 5
  } else {
    suggestions.push('提供预期的时间周期或实施计划')
  }

  // 检查是否过于理想化（减分项）
  const unrealisticKeywords = ['必定', '一定能', '绝对', '完美', '百分百', '彻底解决']
  const isUnrealistic = unrealisticKeywords.some(keyword => content.includes(keyword))
  if (isUnrealistic) {
    score -= 5
    suggestions.push('避免过于理想化的表述，考虑实际约束和挑战')
  }

  // 生成反馈
  if (score >= 20) {
    feedback = '创意具有很强的可行性'
  } else if (score >= 15) {
    feedback = '创意可行性较好，需考虑实施细节'
  } else if (score >= 10) {
    feedback = '创意可行性一般，需要更多规划'
  } else {
    feedback = '创意可行性较低，建议重新评估'
  }

  return {
    name: '可行性',
    score: Math.max(0, Math.min(25, score)),
    maxScore: 25,
    feedback,
    suggestions
  }
}

/**
 * 评估创意的细节度
 */
function evaluateDetail(ideaContent: string): IdeaScoreDimension {
  let score = 0
  const suggestions: string[] = []
  let feedback = ''

  const content = ideaContent.trim()

  // 基于长度评分
  if (content.length >= 300) {
    score += 10
  } else if (content.length >= 150) {
    score += 7
  } else if (content.length >= 80) {
    score += 4
  } else {
    suggestions.push('提供更详细的描述（建议至少150字）')
  }

  // 检查是否有具体数据
  const hasNumbers = /\d+/.test(content)
  if (hasNumbers) {
    score += 5
  } else {
    suggestions.push('补充具体的数据或指标（如用户数量、时间、金额等）')
  }

  // 检查是否有具体案例或场景
  const scenarioKeywords = ['例如', '比如', '场景', '案例', '情况', '举例']
  const hasScenario = scenarioKeywords.some(keyword => content.includes(keyword))
  if (hasScenario) {
    score += 5
  } else {
    suggestions.push('举例说明具体的应用场景')
  }

  // 检查句子数量（复杂度）
  const sentences = content.split(/[。！？.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length >= 5) {
    score += 5
  } else if (sentences.length >= 3) {
    score += 3
  } else {
    suggestions.push('补充更多细节，使描述更加丰富')
  }

  // 生成反馈
  if (score >= 20) {
    feedback = '创意描述非常详细具体'
  } else if (score >= 15) {
    feedback = '创意描述较为详细，可进一步丰富'
  } else if (score >= 10) {
    feedback = '创意描述偏简略，缺少细节'
  } else {
    feedback = '创意描述过于简单，急需补充细节'
  }

  return {
    name: '细节度',
    score,
    maxScore: 25,
    feedback,
    suggestions
  }
}

/**
 * 生成引导式问题
 */
function generateGuidedQuestions(score: IdeaScore): string[] {
  const questions: string[] = []

  // 根据低分维度生成问题
  if (score.dimensions.clarity.score < 15) {
    questions.push('您的创意主要想解决什么问题？')
    questions.push('您希望通过这个创意达成什么目标？')
  }

  if (score.dimensions.completeness.score < 15) {
    questions.push('您的目标用户是谁？他们有什么特征？')
    questions.push('这个创意相比现有方案有什么优势或独特价值？')
    questions.push('您计划如何实现这个创意？需要哪些技术或资源？')
  }

  if (score.dimensions.feasibility.score < 15) {
    questions.push('您目前拥有哪些资源（团队、资金、技术）？')
    questions.push('您预期的实施周期是多久？分几个阶段？')
    questions.push('实施过程中可能遇到哪些挑战？如何应对？')
  }

  if (score.dimensions.detail.score < 15) {
    questions.push('能否举例说明一个具体的应用场景？')
    questions.push('能否提供一些具体的数据或指标？')
    questions.push('核心功能或特性有哪些？请详细描述')
  }

  // 如果问题较少，添加通用问题
  if (questions.length < 3) {
    questions.push('还有什么重要信息需要补充吗？')
  }

  return questions.slice(0, 5) // 最多返回5个问题
}

/**
 * 评估创意内容并返回评分
 */
export function scoreIdea(ideaContent: string): IdeaScore {
  if (!ideaContent || ideaContent.trim().length === 0) {
    return {
      totalScore: 0,
      maxScore: 100,
      dimensions: {
        clarity: {
          name: '清晰度',
          score: 0,
          maxScore: 25,
          feedback: '未提供创意内容',
          suggestions: ['请输入您的创意描述']
        },
        completeness: {
          name: '完整度',
          score: 0,
          maxScore: 25,
          feedback: '未提供创意内容',
          suggestions: ['请输入您的创意描述']
        },
        feasibility: {
          name: '可行性',
          score: 0,
          maxScore: 25,
          feedback: '未提供创意内容',
          suggestions: ['请输入您的创意描述']
        },
        detail: {
          name: '细节度',
          score: 0,
          maxScore: 25,
          feedback: '未提供创意内容',
          suggestions: ['请输入您的创意描述']
        }
      },
      level: 'poor',
      needsImprovement: true,
      overallFeedback: '请提供您的创意描述以进行评估',
      guidedQuestions: ['您想做什么？', '为什么想做这件事？', '您的目标用户是谁？']
    }
  }

  // 评估各个维度
  const clarity = evaluateClarity(ideaContent)
  const completeness = evaluateCompleteness(ideaContent)
  const feasibility = evaluateFeasibility(ideaContent)
  const detail = evaluateDetail(ideaContent)

  // 计算总分
  const totalScore = clarity.score + completeness.score + feasibility.score + detail.score

  // 确定等级
  let level: IdeaScore['level']
  if (totalScore >= 90) {
    level = 'excellent'
  } else if (totalScore >= 80) {
    level = 'good'
  } else if (totalScore >= 60) {
    level = 'fair'
  } else {
    level = 'poor'
  }

  // 确定是否需要改进
  const needsImprovement = totalScore < 60

  // 生成总体反馈
  let overallFeedback = ''
  if (totalScore >= 90) {
    overallFeedback = '🎉 优秀！您的创意描述非常完整清晰，可以直接进入竞价阶段。'
  } else if (totalScore >= 80) {
    overallFeedback = '👍 很好！您的创意描述质量较高，建议稍作补充后进入竞价。'
  } else if (totalScore >= 60) {
    overallFeedback = '💡 不错！您的创意有一定基础，但还可以进一步完善。建议补充以下信息以获得更好的方案。'
  } else {
    overallFeedback = '⚠️ 需要完善！您的创意描述还比较简单，建议补充更多信息。完善后将获得更专业的AI评估和方案。'
  }

  const score: IdeaScore = {
    totalScore,
    maxScore: 100,
    dimensions: {
      clarity,
      completeness,
      feasibility,
      detail
    },
    level,
    needsImprovement,
    overallFeedback,
    guidedQuestions: []
  }

  // 生成引导问题
  score.guidedQuestions = generateGuidedQuestions(score)

  return score
}

/**
 * 获取评分等级的颜色配置
 */
export function getScoreLevelColor(level: IdeaScore['level']) {
  const colors = {
    poor: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-800'
    },
    fair: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    good: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800'
    },
    excellent: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-800'
    }
  }

  return colors[level]
}

/**
 * 获取评分等级的文字描述
 */
export function getScoreLevelText(level: IdeaScore['level']): string {
  const texts = {
    poor: '需要完善',
    fair: '基本合格',
    good: '良好',
    excellent: '优秀'
  }

  return texts[level]
}
