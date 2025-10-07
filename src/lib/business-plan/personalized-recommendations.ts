/**
 * 商业计划书个性化建议生成器
 *
 * 基于用户的项目上下文信息，生成针对性的建议
 */

import type { UserProjectContext } from './types'

export interface PersonalizedRecommendation {
  category: string
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
}

export interface PersonalizedRecommendations {
  marketStrategy: PersonalizedRecommendation[]
  resourceAllocation: PersonalizedRecommendation[]
  riskMitigation: PersonalizedRecommendation[]
  timeline: PersonalizedRecommendation[]
  teamBuilding: PersonalizedRecommendation[]
  summary: string
}

/**
 * 生成个性化建议
 */
export function generatePersonalizedRecommendations(
  context: UserProjectContext,
  ideaContent: string
): PersonalizedRecommendations {
  const recommendations: PersonalizedRecommendations = {
    marketStrategy: [],
    resourceAllocation: [],
    riskMitigation: [],
    timeline: [],
    teamBuilding: [],
    summary: ''
  }

  // 1. 市场策略建议
  if (context.targetMarket || context.targetUsers) {
    recommendations.marketStrategy.push({
      category: '市场定位',
      title: '精准的目标市场定位',
      content: `基于您的目标${context.targetMarket ? `市场（${context.targetMarket}）` : ''}${context.targetUsers ? `和用户群体（${context.targetUsers}）` : ''}，建议：\n\n1. 进行详细的用户画像分析\n2. 研究竞品在该市场的表现\n3. 制定差异化的市场进入策略\n4. 设计针对性的营销方案`,
      priority: 'high',
      actionable: true
    })
  } else {
    recommendations.marketStrategy.push({
      category: '市场定位',
      title: '明确目标市场',
      content: '建议您首先明确项目的目标市场和用户群体。这将帮助您：\n\n1. 精准定位产品功能\n2. 优化资源分配\n3. 制定有效的营销策略\n4. 降低市场风险',
      priority: 'high',
      actionable: true
    })
  }

  // 2. 资源配置建议
  if (context.budget) {
    const budgetMin = context.budget.min || 0
    const budgetMax = context.budget.max || budgetMin

    if (budgetMax > 0) {
      const avgBudget = (budgetMin + budgetMax) / 2
      const currency = context.budget.currency || 'CNY'

      recommendations.resourceAllocation.push({
        category: '预算管理',
        title: '预算分配建议',
        content: `基于您的预算范围（${budgetMin}-${budgetMax} ${currency}），建议按以下比例分配：\n\n1. 产品研发：40-50%\n   - 核心技术开发\n   - 产品测试优化\n\n2. 市场营销：25-30%\n   - 品牌推广\n   - 用户获取\n\n3. 团队建设：15-20%\n   - 人员招聘\n   - 培训发展\n\n4. 运营成本：10-15%\n   - 日常运营\n   - 应急储备`,
        priority: 'high',
        actionable: true
      })
    }
  } else {
    recommendations.resourceAllocation.push({
      category: '预算规划',
      title: '制定详细预算计划',
      content: '建议制定详细的预算计划，包括：\n\n1. 启动资金需求\n2. 运营成本预估\n3. 各阶段资金需求\n4. 应急资金储备\n\n合理的预算规划是项目成功的关键保障。',
      priority: 'high',
      actionable: true
    })
  }

  // 3. 团队建设建议
  if (context.team) {
    if (context.team.size && context.team.size > 0) {
      recommendations.teamBuilding.push({
        category: '团队管理',
        title: '团队效能优化',
        content: `针对您${context.team.size}人的团队规模，建议：\n\n1. 明确分工与职责\n2. 建立高效的协作机制\n3. 定期进行团队建设\n4. 设置清晰的KPI体系\n\n${context.team.experience ? `考虑到团队${context.team.experience}，建议适当调整培训和支持力度。` : ''}`,
        priority: 'medium',
        actionable: true
      })
    }

    if (context.team.roles && context.team.roles.length > 0) {
      recommendations.teamBuilding.push({
        category: '人才需求',
        title: '关键岗位配置',
        content: `当前团队角色：${context.team.roles.join('、')}\n\n建议评估以下方面：\n1. 是否覆盖所有关键职能\n2. 各角色的能力是否匹配需求\n3. 是否需要补充专业人才\n4. 外部资源的合作可能性`,
        priority: 'medium',
        actionable: true
      })
    }
  } else {
    recommendations.teamBuilding.push({
      category: '团队组建',
      title: '搭建核心团队',
      content: '建议优先组建核心团队，考虑以下关键角色：\n\n1. 产品负责人：把控产品方向\n2. 技术负责人：领导技术开发\n3. 运营负责人：推动业务增长\n4. 市场负责人：拓展市场渠道\n\n可考虑全职、兼职或外包等灵活方式。',
      priority: 'high',
      actionable: true
    })
  }

  // 4. 时间规划建议
  if (context.timeline) {
    if (context.timeline.duration) {
      const months = context.timeline.duration
      recommendations.timeline.push({
        category: '项目周期',
        title: '阶段性目标设定',
        content: `基于${months}个月的项目周期，建议分阶段推进：\n\n**第1阶段（1-${Math.ceil(months * 0.3)}个月）：产品打磨**\n- 完成MVP开发\n- 内部测试与优化\n- 收集早期用户反馈\n\n**第2阶段（${Math.ceil(months * 0.3) + 1}-${Math.ceil(months * 0.7)}个月）：市场验证**\n- 小范围试运营\n- 快速迭代优化\n- 建立初始用户群\n\n**第3阶段（${Math.ceil(months * 0.7) + 1}-${months}个月）：规模增长**\n- 扩大市场推广\n- 优化运营体系\n- 准备下一阶段发展`,
        priority: 'high',
        actionable: true
      })
    }
  } else {
    recommendations.timeline.push({
      category: '时间规划',
      title: '制定项目时间表',
      content: '建议制定详细的项目时间表：\n\n1. 设定明确的里程碑\n2. 分解各阶段任务\n3. 预留缓冲时间\n4. 定期review进度\n\n合理的时间规划能帮助团队保持节奏，及时调整方向。',
      priority: 'high',
      actionable: true
    })
  }

  // 5. 风险管理建议
  if (context.risks && context.risks.length > 0) {
    recommendations.riskMitigation.push({
      category: '风险应对',
      title: '已识别风险的应对策略',
      content: `针对您识别的风险点：\n\n${context.risks.map((risk, i) => `${i + 1}. ${risk}`).join('\n')}\n\n建议：\n1. 为每个风险制定应对预案\n2. 设置风险监控指标\n3. 定期评估风险状态\n4. 保持应急资源储备`,
      priority: 'high',
      actionable: true
    })
  } else {
    recommendations.riskMitigation.push({
      category: '风险识别',
      title: '全面的风险评估',
      content: '建议进行系统的风险评估，关注：\n\n1. **市场风险**：需求变化、竞争加剧\n2. **技术风险**：技术难题、人才流失\n3. **资金风险**：现金流断裂、融资失败\n4. **运营风险**：管理混乱、效率低下\n\n提前识别和准备能大大提高成功率。',
      priority: 'medium',
      actionable: true
    })
  }

  // 6. 基于约束条件的建议
  if (context.constraints && context.constraints.length > 0) {
    recommendations.riskMitigation.push({
      category: '约束管理',
      title: '应对项目约束',
      content: `您提到的约束条件：\n\n${context.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n建议采取以下策略：\n1. 将约束转化为创新机会\n2. 寻找替代解决方案\n3. 调整项目范围和优先级\n4. 积极寻求外部资源支持`,
      priority: 'medium',
      actionable: true
    })
  }

  // 7. 基于补充信息生成建议
  if (context.supplements && context.supplements.length > 0) {
    // 分析补充信息的类别分布
    const categories = new Set(context.supplements.map(s => s.category))

    if (categories.has('background')) {
      recommendations.marketStrategy.push({
        category: '背景分析',
        title: '基于项目背景的策略建议',
        content: '根据您补充的项目背景信息，建议：\n\n1. 充分利用现有资源和经验\n2. 关注行业发展趋势\n3. 建立差异化竞争优势\n4. 与相关方建立战略合作',
        priority: 'medium',
        actionable: true
      })
    }

    if (categories.has('features')) {
      recommendations.resourceAllocation.push({
        category: '功能开发',
        title: '功能优先级建议',
        content: '基于您描述的功能特性，建议：\n\n1. 采用MVP方法，先做核心功能\n2. 快速验证用户需求\n3. 基于反馈迭代优化\n4. 避免过度设计和功能膨胀',
        priority: 'high',
        actionable: true
      })
    }
  }

  // 生成总结
  recommendations.summary = generateSummary(recommendations, context)

  return recommendations
}

/**
 * 生成建议总结
 */
function generateSummary(
  recommendations: PersonalizedRecommendations,
  context: UserProjectContext
): string {
  const totalRecs = Object.values(recommendations)
    .filter(v => Array.isArray(v))
    .reduce((sum, arr) => sum + arr.length, 0)

  const highPriority = Object.values(recommendations)
    .filter(v => Array.isArray(v))
    .flat()
    .filter(r => r.priority === 'high').length

  let summary = `基于您提供的项目信息，我们为您生成了 ${totalRecs} 条个性化建议，其中 ${highPriority} 条为高优先级建议。\n\n`

  // 根据上下文信息完整度给出评估
  const completeness = calculateContextCompleteness(context)

  if (completeness >= 80) {
    summary += '✅ 您的项目信息非常完整，这些建议已经充分考虑了您的实际情况。'
  } else if (completeness >= 60) {
    summary += '💡 建议进一步补充项目信息（如预算、时间规划、团队情况等），以获得更精准的指导方案。'
  } else {
    summary += '⚠️ 您的项目信息还不够完整。建议补充更多细节，这将帮助我们为您提供更有针对性的建议。'
  }

  return summary
}

/**
 * 计算上下文信息完整度
 */
function calculateContextCompleteness(context: UserProjectContext): number {
  let score = 0
  const maxScore = 100

  // 基本信息 (30分)
  if (context.projectName) score += 10
  if (context.targetMarket) score += 10
  if (context.targetUsers) score += 10

  // 资源信息 (30分)
  if (context.budget && (context.budget.min || context.budget.max)) score += 15
  if (context.team && context.team.size) score += 15

  // 规划信息 (20分)
  if (context.timeline && context.timeline.duration) score += 20

  // 战略信息 (20分)
  if (context.coreAdvantages && context.coreAdvantages.length > 0) score += 10
  if (context.risks && context.risks.length > 0) score += 10

  return Math.round((score / maxScore) * 100)
}

/**
 * 将建议格式化为Markdown
 */
export function formatRecommendationsAsMarkdown(
  recommendations: PersonalizedRecommendations
): string {
  let markdown = '# 💡 个性化建议\n\n'

  markdown += `${recommendations.summary}\n\n`

  markdown += '---\n\n'

  // 按优先级排序并输出
  const sections = [
    { key: 'marketStrategy', title: '📈 市场策略建议' },
    { key: 'resourceAllocation', title: '💰 资源配置建议' },
    { key: 'timeline', title: '⏱️ 时间规划建议' },
    { key: 'teamBuilding', title: '👥 团队建设建议' },
    { key: 'riskMitigation', title: '🛡️ 风险管理建议' }
  ]

  sections.forEach(section => {
    const recs = recommendations[section.key as keyof Omit<PersonalizedRecommendations, 'summary'>]
    if (Array.isArray(recs) && recs.length > 0) {
      markdown += `## ${section.title}\n\n`

      recs.forEach(rec => {
        const priorityEmoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'
        markdown += `### ${priorityEmoji} ${rec.title}\n\n`
        markdown += `${rec.content}\n\n`
      })
    }
  })

  return markdown
}
