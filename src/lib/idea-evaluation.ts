/**
 * 创意质量评估模块
 * 用于快速评估用户创意的完整度和可行性
 */

export interface IdeaEvaluation {
  score: number // 0-100 综合评分
  verdict: 'reject' | 'needs_work' | 'acceptable' | 'excellent'
  completeness: {
    problemDefinition: number // 0-25 问题定义清晰度
    targetUser: number // 0-25 目标用户明确度
    solution: number // 0-25 解决方案具体度
    businessModel: number // 0-25 商业模式提及度
  }
  missingPoints: string[] // 缺失的关键信息
  criticalIssues: string[] // 严重问题
  strengths: string[] // 优势亮点
  requiredInfo: string[] // 必须补充的信息
  isWillingToDiscuss: boolean // 是否值得深入讨论
}

/**
 * 评估创意质量
 */
export async function evaluateIdeaQuality(ideaContent: string): Promise<IdeaEvaluation> {
  const evaluation: IdeaEvaluation = {
    score: 0,
    verdict: 'reject',
    completeness: {
      problemDefinition: 0,
      targetUser: 0,
      solution: 0,
      businessModel: 0
    },
    missingPoints: [],
    criticalIssues: [],
    strengths: [],
    requiredInfo: [],
    isWillingToDiscuss: false
  }

  const content = ideaContent.toLowerCase()
  const wordCount = ideaContent.length

  // 1. 评估问题定义 (0-25分)
  const problemKeywords = ['问题', '痛点', '困难', '挑战', '需要', '缺乏', '不足', '麻烦']
  const hasProblem = problemKeywords.some(keyword => content.includes(keyword))

  if (hasProblem) {
    evaluation.completeness.problemDefinition = wordCount > 50 ? 25 : 15
    evaluation.strengths.push('明确了要解决的问题')
  } else {
    evaluation.missingPoints.push('未说明要解决什么问题或用户痛点')
    evaluation.requiredInfo.push('请描述目标用户遇到了什么问题或痛点')
  }

  // 2. 评估目标用户 (0-25分)
  const userKeywords = ['用户', '客户', '学生', '企业', '团队', '开发者', '设计师', '公司']
  const hasTargetUser = userKeywords.some(keyword => content.includes(keyword))

  if (hasTargetUser) {
    evaluation.completeness.targetUser = 25
    evaluation.strengths.push('明确了目标用户群体')
  } else {
    evaluation.missingPoints.push('未明确目标用户是谁')
    evaluation.requiredInfo.push('请说明这个产品/服务是给谁用的？')
  }

  // 3. 评估解决方案 (0-25分)
  const solutionKeywords = ['通过', '提供', '帮助', '实现', '功能', '特点', '平台', '工具', '系统', 'app']
  const hasSolution = solutionKeywords.some(keyword => content.includes(keyword))

  if (hasSolution) {
    evaluation.completeness.solution = wordCount > 100 ? 25 : 18
    evaluation.strengths.push('提出了解决方案思路')
  } else {
    evaluation.missingPoints.push('未说明如何解决问题')
    evaluation.requiredInfo.push('请描述你打算如何解决这个问题？核心功能是什么？')
  }

  // 4. 评估商业模式 (0-25分)
  const businessKeywords = ['付费', '收费', '盈利', '赚钱', '商业模式', '订阅', '广告', '佣金', '会员']
  const hasBusiness = businessKeywords.some(keyword => content.includes(keyword))

  if (hasBusiness) {
    evaluation.completeness.businessModel = 20
    evaluation.strengths.push('考虑了商业模式')
  } else {
    evaluation.missingPoints.push('未提及如何盈利')
  }

  // 计算总分
  const { problemDefinition, targetUser, solution, businessModel } = evaluation.completeness
  evaluation.score = problemDefinition + targetUser + solution + businessModel

  // 检查严重问题
  if (wordCount < 20) {
    evaluation.criticalIssues.push('创意描述过于简短，缺少必要信息')
  }

  if (wordCount > 1000) {
    evaluation.criticalIssues.push('描述过长，请精简到核心要点')
  }

  const vaguePhrases = ['做一个', '弄一个', 'app', '平台', '系统']
  const isVague = vaguePhrases.every(phrase =>
    content.includes(phrase) && wordCount < 50
  )

  if (isVague) {
    evaluation.criticalIssues.push('描述过于笼统，缺少具体细节')
  }

  // 确定评判结果
  if (evaluation.score >= 81) {
    evaluation.verdict = 'excellent'
    evaluation.isWillingToDiscuss = true
  } else if (evaluation.score >= 61) {
    evaluation.verdict = 'acceptable'
    evaluation.isWillingToDiscuss = true
  } else if (evaluation.score >= 41) {
    evaluation.verdict = 'needs_work'
    evaluation.isWillingToDiscuss = false
  } else {
    evaluation.verdict = 'reject'
    evaluation.isWillingToDiscuss = false
  }

  return evaluation
}

/**
 * 生成基于评估结果的系统提示
 */
export function generateEvaluationFeedback(evaluation: IdeaEvaluation): string {
  const { verdict, score, missingPoints, requiredInfo, strengths } = evaluation

  let feedback = ''

  switch (verdict) {
    case 'reject':
      feedback = `您的创意还需要大幅完善（评分：${score}/100）。\n\n`
      feedback += `❌ 缺失的关键信息：\n${missingPoints.map(p => `• ${p}`).join('\n')}\n\n`
      feedback += `📝 请补充以下信息后再提交：\n${requiredInfo.map(r => `${r}`).join('\n')}`
      break

    case 'needs_work':
      feedback = `您的创意有一定基础，但还需要完善（评分：${score}/100）。\n\n`
      if (strengths.length > 0) {
        feedback += `✅ 优势：\n${strengths.map(s => `• ${s}`).join('\n')}\n\n`
      }
      feedback += `📝 建议补充：\n${requiredInfo.map(r => `• ${r}`).join('\n')}`
      break

    case 'acceptable':
      feedback = `您的创意基本完整，AI专家们将开始点评（评分：${score}/100）。\n\n`
      if (strengths.length > 0) {
        feedback += `✅ 优势：\n${strengths.map(s => `• ${s}`).join('\n')}`
      }
      break

    case 'excellent':
      feedback = `优秀的创意！AI专家们将进行深度分析和竞价（评分：${score}/100）。\n\n`
      feedback += `✅ 亮点：\n${strengths.map(s => `• ${s}`).join('\n')}`
      break
  }

  return feedback
}
