/**
 * 从创意内容和补充信息中提取用户项目上下文
 */

import type { UserProjectContext } from './types'
import type { SupplementCategory } from '@/components/bidding/EnhancedSupplementPanel'

interface ExtractContextParams {
  ideaContent: string
  supplements?: Array<{
    category: SupplementCategory | string
    content: string
    timestamp: Date | string
  }>
}

/**
 * 从文本中提取数字
 */
function extractNumbers(text: string): number[] {
  const matches = text.match(/\d+/g)
  return matches ? matches.map(Number) : []
}

/**
 * 从文本中提取预算信息
 */
function extractBudget(text: string): UserProjectContext['budget'] | undefined {
  const lowerText = text.toLowerCase()

  // 查找预算相关关键词
  if (lowerText.includes('预算') || lowerText.includes('资金') || lowerText.includes('万') || lowerText.includes('元')) {
    const numbers = extractNumbers(text)

    if (numbers.length > 0) {
      // 如果有多个数字，可能是范围
      if (numbers.length >= 2) {
        const [min, max] = numbers.sort((a, b) => a - b)
        return {
          min: min * 10000, // 假设是万
          max: max * 10000,
          currency: 'CNY'
        }
      } else {
        return {
          min: numbers[0] * 10000,
          max: numbers[0] * 10000,
          currency: 'CNY'
        }
      }
    }
  }

  return undefined
}

/**
 * 从文本中提取团队信息
 */
function extractTeam(text: string): UserProjectContext['team'] | undefined {
  const lowerText = text.toLowerCase()

  if (lowerText.includes('团队') || lowerText.includes('人员') || lowerText.includes('成员')) {
    const numbers = extractNumbers(text)
    const size = numbers.length > 0 ? numbers[0] : undefined

    // 提取角色
    const roleKeywords = ['产品', '技术', '开发', '设计', '运营', '市场', '前端', '后端', 'AI', '工程师']
    const roles: string[] = []

    roleKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        roles.push(keyword)
      }
    })

    if (size || roles.length > 0) {
      return {
        size,
        roles: roles.length > 0 ? roles : undefined,
        experience: undefined
      }
    }
  }

  return undefined
}

/**
 * 从文本中提取时间计划
 */
function extractTimeline(text: string): UserProjectContext['timeline'] | undefined {
  const lowerText = text.toLowerCase()

  if (lowerText.includes('周期') || lowerText.includes('时间') || lowerText.includes('月') || lowerText.includes('阶段')) {
    const numbers = extractNumbers(text)

    if (numbers.length > 0) {
      return {
        duration: numbers[0], // 假设是月数
        milestones: []
      }
    }
  }

  return undefined
}

/**
 * 从创意内容中提取基本信息
 */
function extractBasicInfo(ideaContent: string) {
  const lines = ideaContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let projectName: string | undefined
  let targetMarket: string | undefined
  let targetUsers: string | undefined

  lines.forEach(line => {
    const lowerLine = line.toLowerCase()

    // 提取项目名称
    if (lowerLine.includes('项目名称') || lowerLine.startsWith('项目：')) {
      projectName = line.split(/[:：]/)[1]?.trim()
    }

    // 提取目标市场
    if (lowerLine.includes('目标市场') || lowerLine.includes('市场定位')) {
      targetMarket = line.split(/[:：]/)[1]?.trim() || line
    }

    // 提取目标用户
    if (lowerLine.includes('目标用户') || lowerLine.includes('用户群体')) {
      targetUsers = line.split(/[:：]/)[1]?.trim() || line
    }
  })

  return { projectName, targetMarket, targetUsers }
}

/**
 * 从补充信息中提取上下文
 */
function extractFromSupplements(
  supplements: ExtractContextParams['supplements']
): Partial<UserProjectContext> {
  if (!supplements || supplements.length === 0) {
    return {}
  }

  const context: Partial<UserProjectContext> = {
    supplements: supplements.map(s => ({
      category: s.category,
      content: s.content,
      timestamp: typeof s.timestamp === 'string' ? s.timestamp : s.timestamp.toISOString()
    }))
  }

  // 遍历补充信息，提取结构化数据
  supplements.forEach(supplement => {
    const { category, content } = supplement

    switch (category) {
      case 'target_users':
        context.targetUsers = content
        break

      case 'resources':
        const team = extractTeam(content)
        if (team) {
          context.team = team
        }
        const budget = extractBudget(content)
        if (budget) {
          context.budget = budget
        }
        break

      case 'timeline':
        const timeline = extractTimeline(content)
        if (timeline) {
          context.timeline = timeline
        }
        break

      case 'budget':
        const budgetInfo = extractBudget(content)
        if (budgetInfo) {
          context.budget = budgetInfo
        }
        break
    }
  })

  return context
}

/**
 * 主函数：提取用户项目上下文
 */
export function extractUserContext(params: ExtractContextParams): UserProjectContext {
  const { ideaContent, supplements } = params

  // 从创意内容提取基本信息
  const basicInfo = extractBasicInfo(ideaContent)

  // 从创意内容提取资源信息
  const budget = extractBudget(ideaContent)
  const team = extractTeam(ideaContent)
  const timeline = extractTimeline(ideaContent)

  // 从补充信息中提取
  const supplementContext = extractFromSupplements(supplements)

  // 合并所有信息
  const context: UserProjectContext = {
    projectName: basicInfo.projectName,
    targetMarket: basicInfo.targetMarket,
    targetUsers: supplementContext.targetUsers || basicInfo.targetUsers,
    budget: supplementContext.budget || budget,
    team: supplementContext.team || team,
    timeline: supplementContext.timeline || timeline,
    coreAdvantages: [],
    uniqueValue: undefined,
    constraints: [],
    risks: [],
    supplements: supplementContext.supplements
  }

  return context
}
