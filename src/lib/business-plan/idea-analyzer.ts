/**
 * 智能创意分析器
 * 分析用户创意并自动关联到4个商业计划模块
 */

export interface IdeaAnalysisResult {
  // 基础信息
  ideaTitle: string
  ideaDescription: string

  // 自动识别的特征
  characteristics: {
    industry: string // 行业类型
    targetUsers: string[] // 目标用户群体
    coreFeatures: string[] // 核心功能
    businessType: 'B2B' | 'B2C' | 'B2B2C' | 'C2C' // 商业模式类型
    complexity: 'low' | 'medium' | 'high' // 复杂度
  }

  // 模块关联分析
  moduleRelevance: {
    marketAnalysis: {
      priority: 'high' | 'medium' | 'low'
      suggestedFocus: string[]
      estimatedTime: string
      keyQuestions: string[]
    }
    mvpPrototype: {
      priority: 'high' | 'medium' | 'low'
      suggestedFeatures: string[]
      estimatedTime: string
      technicalRequirements: string[]
    }
    marketingStrategy: {
      priority: 'high' | 'medium' | 'low'
      suggestedChannels: string[]
      estimatedTime: string
      targetAudience: string[]
    }
    businessModel: {
      priority: 'high' | 'medium' | 'low'
      revenueStreams: string[]
      estimatedTime: string
      costStructure: string[]
    }
  }

  // 生成建议
  recommendations: {
    suggestedModules: Array<'market-analysis' | 'mvp-prototype' | 'marketing-strategy' | 'business-model'>
    suggestedOrder: string[]
    totalEstimatedTime: string
    criticalPath: string
  }
}

/**
 * 分析创意并生成模块关联建议
 */
export async function analyzeIdea(
  ideaTitle: string,
  ideaDescription: string
): Promise<IdeaAnalysisResult> {

  // 1. 识别行业类型
  const industry = identifyIndustry(ideaDescription)

  // 2. 提取目标用户
  const targetUsers = extractTargetUsers(ideaDescription)

  // 3. 识别核心功能
  const coreFeatures = extractCoreFeatures(ideaDescription)

  // 4. 判断商业模式类型
  const businessType = determineBusinessType(ideaDescription)

  // 5. 评估复杂度
  const complexity = assessComplexity(ideaDescription, coreFeatures.length)

  // 6. 生成模块关联分析
  const moduleRelevance = generateModuleRelevance(
    ideaDescription,
    industry,
    targetUsers,
    coreFeatures,
    businessType
  )

  // 7. 生成推荐
  const recommendations = generateRecommendations(moduleRelevance, complexity)

  return {
    ideaTitle,
    ideaDescription,
    characteristics: {
      industry,
      targetUsers,
      coreFeatures,
      businessType,
      complexity
    },
    moduleRelevance,
    recommendations
  }
}

/**
 * 识别行业类型
 */
function identifyIndustry(description: string): string {
  const industryKeywords = {
    '教育科技': ['教育', '学习', '培训', '课程', '辅导', '知识'],
    '医疗健康': ['医疗', '健康', '诊断', '治疗', '药品', '康复'],
    '电子商务': ['电商', '购物', '零售', '商城', '交易', '买卖'],
    '金融科技': ['金融', '支付', '理财', '投资', '贷款', '保险'],
    '企业服务': ['企业', '办公', '协作', 'SaaS', '管理', '效率'],
    '社交娱乐': ['社交', '娱乐', '直播', '短视频', '游戏', '社区'],
    '生活服务': ['生活', '服务', '家政', '外卖', '出行', '本地'],
    '智能硬件': ['硬件', '设备', '物联网', '智能', '传感', '控制']
  }

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => description.includes(keyword))) {
      return industry
    }
  }

  return '通用'
}

/**
 * 提取目标用户
 */
function extractTargetUsers(description: string): string[] {
  const userPatterns = [
    { regex: /([A-Z0-9]+)(学生|用户|群体)/g, extractor: (match: string) => match },
    { regex: /(中小企业|大型企业|创业公司)/g, extractor: (match: string) => match },
    { regex: /(年轻人|中老年人|儿童|青少年)/g, extractor: (match: string) => match },
    { regex: /(白领|蓝领|自由职业者)/g, extractor: (match: string) => match },
  ]

  const users: string[] = []

  for (const pattern of userPatterns) {
    const matches = description.matchAll(pattern.regex)
    for (const match of matches) {
      users.push(pattern.extractor(match[0]))
    }
  }

  // 如果没有明确提到用户，根据行业推断
  if (users.length === 0) {
    if (description.includes('教育') || description.includes('学习')) {
      users.push('学生', '家长')
    } else if (description.includes('企业') || description.includes('办公')) {
      users.push('企业用户', '团队管理者')
    } else {
      users.push('普通用户', '目标客户')
    }
  }

  return [...new Set(users)].slice(0, 3)
}

/**
 * 提取核心功能
 */
function extractCoreFeatures(description: string): string[] {
  const features: string[] = []

  // 识别功能关键词
  const featureKeywords = [
    '搜索', '推荐', '分析', '管理', '协作', '沟通',
    '支付', '交易', '预约', '订购', '配送', '评价',
    '学习', '练习', '测试', '答疑', '辅导', '规划',
    '诊断', '监测', '提醒', '记录', '追踪', '报告'
  ]

  for (const keyword of featureKeywords) {
    if (description.includes(keyword)) {
      features.push(keyword)
    }
  }

  // 如果没有识别到功能，添加默认功能
  if (features.length === 0) {
    features.push('核心功能1', '核心功能2', '核心功能3')
  }

  return features.slice(0, 5)
}

/**
 * 判断商业模式类型
 */
function determineBusinessType(description: string): 'B2B' | 'B2C' | 'B2B2C' | 'C2C' {
  if (description.match(/企业|公司|团队|组织/)) {
    return 'B2B'
  } else if (description.match(/平台|市场|撮合|连接/)) {
    return 'C2C'
  } else if (description.match(/渠道|分销|代理/)) {
    return 'B2B2C'
  }
  return 'B2C'
}

/**
 * 评估复杂度
 */
function assessComplexity(description: string, featureCount: number): 'low' | 'medium' | 'high' {
  let score = 0

  // 功能数量影响
  score += featureCount * 10

  // 关键词影响
  const complexKeywords = ['AI', '人工智能', '机器学习', '区块链', '物联网', '大数据', '云计算']
  for (const keyword of complexKeywords) {
    if (description.includes(keyword)) score += 20
  }

  // 集成需求影响
  const integrationKeywords = ['支付', '地图', '社交', '第三方']
  for (const keyword of integrationKeywords) {
    if (description.includes(keyword)) score += 10
  }

  if (score < 30) return 'low'
  if (score < 60) return 'medium'
  return 'high'
}

/**
 * 生成模块关联分析
 */
function generateModuleRelevance(
  description: string,
  industry: string,
  targetUsers: string[],
  coreFeatures: string[],
  businessType: string
): IdeaAnalysisResult['moduleRelevance'] {

  return {
    marketAnalysis: {
      priority: 'high',
      suggestedFocus: [
        `${industry}市场规模分析`,
        `${targetUsers[0]}需求洞察`,
        '竞争对手分析',
        '市场趋势研究'
      ],
      estimatedTime: '3-5分钟',
      keyQuestions: [
        `谁是您的核心目标用户?`,
        `用户的主要痛点是什么?`,
        `市场上有哪些竞争产品?`,
        `您的产品有什么独特优势?`
      ]
    },

    mvpPrototype: {
      priority: coreFeatures.length > 3 ? 'high' : 'medium',
      suggestedFeatures: coreFeatures,
      estimatedTime: '5-8分钟',
      technicalRequirements: [
        '响应式前端界面',
        '基础用户交互',
        coreFeatures.length > 3 ? '多功能模块' : '单一核心功能',
        '现代化UI设计'
      ]
    },

    marketingStrategy: {
      priority: businessType === 'B2C' ? 'high' : 'medium',
      suggestedChannels: generateMarketingChannels(industry, businessType),
      estimatedTime: '4-6分钟',
      targetAudience: targetUsers
    },

    businessModel: {
      priority: 'high',
      revenueStreams: generateRevenueStreams(businessType, description),
      estimatedTime: '4-6分钟',
      costStructure: [
        '研发成本',
        '运营成本',
        '市场推广成本',
        '人力成本'
      ]
    }
  }
}

/**
 * 生成营销渠道建议
 */
function generateMarketingChannels(industry: string, businessType: string): string[] {
  const channels: string[] = []

  // 基础渠道
  channels.push('社交媒体营销', '内容营销')

  // 根据商业模式
  if (businessType === 'B2B') {
    channels.push('行业展会', 'LinkedIn营销', '企业直销')
  } else {
    channels.push('抖音/小红书', '朋友圈广告', 'KOL合作')
  }

  // 根据行业
  if (industry === '教育科技') {
    channels.push('家长社群', '教育机构合作')
  } else if (industry === '电子商务') {
    channels.push('电商平台', '直播带货')
  }

  return channels.slice(0, 5)
}

/**
 * 生成收入模式建议
 */
function generateRevenueStreams(businessType: string, description: string): string[] {
  const streams: string[] = []

  // 基于商业模式
  if (businessType === 'B2B') {
    streams.push('订阅服务费', '企业年费', '定制化服务')
  } else if (businessType === 'B2C') {
    streams.push('产品销售', '会员订阅', '增值服务')
  } else if (businessType === 'C2C') {
    streams.push('交易佣金', '平台服务费', '广告收入')
  }

  // 基于关键词
  if (description.includes('广告')) {
    streams.push('广告收入')
  }
  if (description.includes('数据')) {
    streams.push('数据服务')
  }

  return [...new Set(streams)].slice(0, 4)
}

/**
 * 生成推荐
 */
function generateRecommendations(
  moduleRelevance: IdeaAnalysisResult['moduleRelevance'],
  complexity: string
): IdeaAnalysisResult['recommendations'] {

  // 根据优先级排序模块
  type ModuleId = 'market-analysis' | 'mvp-prototype' | 'marketing-strategy' | 'business-model'

  const modulePriorities: Array<{ id: ModuleId; priority: string }> = [
    { id: 'market-analysis', priority: moduleRelevance.marketAnalysis.priority },
    { id: 'mvp-prototype', priority: moduleRelevance.mvpPrototype.priority },
    { id: 'marketing-strategy', priority: moduleRelevance.marketingStrategy.priority },
    { id: 'business-model', priority: moduleRelevance.businessModel.priority }
  ]

  const priorityScore = { high: 3, medium: 2, low: 1 }
  modulePriorities.sort((a, b) =>
    priorityScore[b.priority as keyof typeof priorityScore] -
    priorityScore[a.priority as keyof typeof priorityScore]
  )

  const suggestedModules = modulePriorities
    .filter(m => m.priority !== 'low')
    .map(m => m.id)

  // 建议的生成顺序
  const suggestedOrder = [
    '1. 市场需求分析 - 了解用户和市场',
    '2. MVP原型制作 - 验证产品概念',
    '3. 商业模式设计 - 规划盈利方式',
    '4. 推广策略规划 - 获取首批用户'
  ]

  // 计算总时间
  const timeMap: Record<string, number> = {
    low: 15,
    medium: 20,
    high: 25
  }
  const totalMinutes = timeMap[complexity] || 20

  return {
    suggestedModules,
    suggestedOrder,
    totalEstimatedTime: `${totalMinutes}-${totalMinutes + 10}分钟`,
    criticalPath: modulePriorities[0].priority === 'high'
      ? `建议优先完成"${getModuleName(modulePriorities[0].id)}"模块`
      : '建议按顺序完成所有模块'
  }
}

/**
 * 获取模块中文名称
 */
function getModuleName(moduleId: string): string {
  const names: Record<string, string> = {
    'market-analysis': '需求场景分析',
    'mvp-prototype': 'MVP版本制作',
    'marketing-strategy': '推广策略规划',
    'business-model': '盈利模式设计'
  }
  return names[moduleId] || moduleId
}
