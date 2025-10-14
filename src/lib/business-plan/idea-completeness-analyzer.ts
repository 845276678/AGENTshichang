/**
 * 创意完整度分析器
 * 评估用户创意的完整度,识别缺失信息,提供改进建议
 */

export interface DimensionAnalysis {
  score: number // 0-100
  detected: string[]
  missing: string[]
  questions: string[]
  suggestions: string[]
}

export interface CompletenessAnalysis {
  overallScore: number // 0-100
  dimensions: {
    targetUsers: DimensionAnalysis
    painPoints: DimensionAnalysis
    coreFeatures: DimensionAnalysis
    userScenarios: DimensionAnalysis
    businessModel: DimensionAnalysis
    competitors: DimensionAnalysis
    uniqueValue: DimensionAnalysis
    techRequirements: DimensionAnalysis
  }
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    dimension: string
    suggestion: string
    questions: string[]
  }>
  canGenerateQuality: 'high' | 'medium' | 'low' | 'insufficient'
  nextSteps: string[]
}

/**
 * 分析创意完整度
 */
export async function analyzeIdeaCompleteness(
  ideaTitle: string,
  ideaDescription: string
): Promise<CompletenessAnalysis> {

  const dimensions = {
    targetUsers: analyzeTargetUsers(ideaDescription),
    painPoints: analyzePainPoints(ideaDescription),
    coreFeatures: analyzeCoreFeatures(ideaDescription),
    userScenarios: analyzeUserScenarios(ideaDescription),
    businessModel: analyzeBusinessModel(ideaDescription),
    competitors: analyzeCompetitors(ideaDescription),
    uniqueValue: analyzeUniqueValue(ideaDescription),
    techRequirements: analyzeTechRequirements(ideaDescription)
  }

  // 计算总分 (加权平均)
  const weights = {
    targetUsers: 0.15,
    painPoints: 0.15,
    coreFeatures: 0.15,
    userScenarios: 0.10,
    businessModel: 0.15,
    competitors: 0.10,
    uniqueValue: 0.10,
    techRequirements: 0.10
  }

  const overallScore = Math.round(
    Object.entries(dimensions).reduce((sum, [key, analysis]) => {
      return sum + analysis.score * weights[key as keyof typeof weights]
    }, 0)
  )

  // 生成改进建议
  const recommendations = generateRecommendations(dimensions)

  // 确定生成质量等级
  const canGenerateQuality = determineGenerationQuality(overallScore)

  // 生成下一步建议
  const nextSteps = generateNextSteps(dimensions, overallScore)

  return {
    overallScore,
    dimensions,
    recommendations,
    canGenerateQuality,
    nextSteps
  }
}

/**
 * 分析目标用户维度
 */
function analyzeTargetUsers(description: string): DimensionAnalysis {
  const detected: string[] = []
  const missing: string[] = []
  let score = 0

  // 检测年龄段
  const agePatterns = [
    { regex: /K12|小学|中学|高中|学生/g, value: 'K12学生' },
    { regex: /大学生|高校|院校/g, value: '大学生' },
    { regex: /白领|上班族|职场/g, value: '白领群体' },
    { regex: /中老年|老人|退休/g, value: '中老年群体' },
    { regex: /儿童|幼儿|宝宝/g, value: '儿童群体' },
    { regex: /家长|父母/g, value: '家长群体' }
  ]

  for (const pattern of agePatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 15
    }
  }

  // 检测职业/身份
  const professionPatterns = [
    { regex: /企业|公司|团队|管理者/g, value: '企业用户' },
    { regex: /医生|护士|医疗/g, value: '医疗从业者' },
    { regex: /教师|老师|教育工作者/g, value: '教育工作者' },
    { regex: /创业者|初创/g, value: '创业者' }
  ]

  for (const pattern of professionPatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 10
    }
  }

  // 检测用户规模
  const scalePatterns = [
    { regex: /\d+万?人|用户量|用户规模/g, value: '用户规模' },
    { regex: /小众|垂直|细分/g, value: '细分用户群' },
    { regex: /大众|广泛|通用/g, value: '大众用户群' }
  ]

  for (const pattern of scalePatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 10
    }
  }

  // 检测地域
  const locationPatterns = [
    { regex: /一线城市|北上广深/g, value: '一线城市' },
    { regex: /二三线|三四线/g, value: '二三线城市' },
    { regex: /农村|乡镇/g, value: '农村地区' },
    { regex: /本地|社区|周边/g, value: '本地用户' }
  ]

  for (const pattern of locationPatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 10
    }
  }

  // 检测收入水平
  if (/中高端|高端|中产|高收入/.test(description)) {
    detected.push('中高收入群体')
    score += 10
  }

  // 生成缺失信息
  if (score < 20) missing.push('用户年龄段不明确')
  if (score < 30) missing.push('用户职业/身份特征缺失')
  if (score < 40) missing.push('用户规模范围未提及')
  if (score < 50) missing.push('目标地域不清晰')

  const questions = [
    '您的产品主要面向哪个年龄段的用户?',
    '用户的职业或身份特征是什么?',
    '预期的用户规模大概有多少?',
    '主要针对哪些地区的用户?',
    '用户的收入水平如何?'
  ]

  const suggestions = [
    '尝试明确描述用户的年龄、职业、收入等基本特征',
    '说明用户群体的规模和分布情况',
    '考虑不同类型用户的差异化需求'
  ]

  return {
    score: Math.min(score, 100),
    detected,
    missing,
    questions: missing.length > 0 ? questions.slice(0, missing.length) : [],
    suggestions: missing.length > 0 ? suggestions : []
  }
}

/**
 * 分析痛点问题维度
 */
function analyzePainPoints(description: string): DimensionAnalysis {
  const detected: string[] = []
  const missing: string[] = []
  let score = 0

  // 检测问题描述词汇
  const problemPatterns = [
    { regex: /痛点|问题|困难|挑战/g, value: '明确提及痛点' },
    { regex: /效率低|浪费时间|麻烦/g, value: '效率问题' },
    { regex: /成本高|昂贵|负担/g, value: '成本问题' },
    { regex: /不方便|复杂|繁琐/g, value: '便利性问题' },
    { regex: /缺乏|没有|不足/g, value: '功能缺失问题' },
    { regex: /质量差|不准确|不可靠/g, value: '质量问题' }
  ]

  for (const pattern of problemPatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 15
    }
  }

  // 检测解决方案描述
  const solutionPatterns = [
    { regex: /解决|改善|优化|提升/g, value: '提出解决方案' },
    { regex: /自动化|智能化|简化/g, value: '自动化解决思路' },
    { regex: /个性化|定制|量身/g, value: '个性化解决思路' }
  ]

  for (const pattern of solutionPatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 10
    }
  }

  // 检测现状分析
  if (/目前|现在|当前/.test(description)) {
    detected.push('分析了现状')
    score += 10
  }

  // 生成缺失信息
  if (!detected.some(d => d.includes('痛点'))) missing.push('未明确说明要解决的核心痛点')
  if (!detected.some(d => d.includes('解决'))) missing.push('解决方案不够清晰')
  if (score < 30) missing.push('缺少对现有方案不足的分析')
  if (score < 40) missing.push('用户痛点的影响程度不明确')

  const questions = [
    '用户目前遇到的最主要问题是什么?',
    '这个问题给用户造成了什么损失或困扰?',
    '用户现在是如何解决这个问题的?',
    '现有解决方案有什么不足之处?',
    '您的方案如何更好地解决这个痛点?'
  ]

  const suggestions = [
    '详细描述用户面临的具体问题和困扰',
    '分析现有解决方案的不足之处',
    '说明问题的严重程度和影响范围'
  ]

  return {
    score: Math.min(score, 100),
    detected,
    missing,
    questions: missing.length > 0 ? questions.slice(0, missing.length + 1) : [],
    suggestions: missing.length > 0 ? suggestions : []
  }
}

/**
 * 分析核心功能维度
 */
function analyzeCoreFeatures(description: string): DimensionAnalysis {
  const detected: string[] = []
  const missing: string[] = []
  let score = 0

  // 检测功能关键词
  const featurePatterns = [
    { regex: /搜索|查找|检索/g, value: '搜索功能' },
    { regex: /推荐|建议|匹配/g, value: '推荐功能' },
    { regex: /分析|统计|报告/g, value: '分析功能' },
    { regex: /管理|组织|整理/g, value: '管理功能' },
    { regex: /沟通|交流|聊天|消息/g, value: '沟通功能' },
    { regex: /支付|交易|购买/g, value: '支付功能' },
    { regex: /预约|预订|下单/g, value: '预约功能' },
    { regex: /学习|练习|测试/g, value: '学习功能' },
    { regex: /监控|追踪|记录/g, value: '监控功能' },
    { regex: /生成|创建|制作/g, value: '生成功能' }
  ]

  for (const pattern of featurePatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 10
    }
  }

  // 检测功能数量
  const featureCount = detected.length
  if (featureCount >= 3) score += 20
  if (featureCount >= 5) score += 10

  // 检测功能描述的详细程度
  if (/具体|详细|包括/.test(description)) {
    detected.push('功能描述详细')
    score += 15
  }

  // 检测技术特征
  const techPatterns = [
    { regex: /AI|人工智能|机器学习/g, value: 'AI功能' },
    { regex: /实时|即时|在线/g, value: '实时功能' },
    { regex: /自动|智能|自适应/g, value: '自动化功能' },
    { regex: /可视化|图表|报表/g, value: '可视化功能' }
  ]

  for (const pattern of techPatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 10
    }
  }

  // 生成缺失信息
  if (featureCount < 3) missing.push('核心功能数量太少,建议补充')
  if (!detected.some(d => d.includes('详细'))) missing.push('功能描述不够具体')
  if (score < 30) missing.push('缺少技术特色或创新点')
  if (score < 50) missing.push('功能之间的关联性不清晰')

  const questions = [
    '产品的3-5个核心功能分别是什么?',
    '每个功能具体是如何工作的?',
    '功能之间是如何协同配合的?',
    '有哪些技术特色或创新之处?',
    '用户使用这些功能的频率如何?'
  ]

  const suggestions = [
    '列出3-5个最重要的核心功能',
    '详细描述每个功能的具体实现方式',
    '说明功能的技术特色和创新点'
  ]

  return {
    score: Math.min(score, 100),
    detected,
    missing,
    questions: missing.length > 0 ? questions.slice(0, missing.length + 1) : [],
    suggestions: missing.length > 0 ? suggestions : []
  }
}

/**
 * 分析使用场景维度
 */
function analyzeUserScenarios(description: string): DimensionAnalysis {
  const detected: string[] = []
  const missing: string[] = []
  let score = 0

  // 检测场景关键词
  const scenarioPatterns = [
    { regex: /在家|居家|家庭/g, value: '家庭使用场景' },
    { regex: /办公|工作|公司/g, value: '办公场景' },
    { regex: /学校|课堂|教室/g, value: '教育场景' },
    { regex: /外出|出行|移动/g, value: '移动场景' },
    { regex: /购物|消费|买/g, value: '购物场景' },
    { regex: /社交|聚会|朋友/g, value: '社交场景' },
    { regex: /医院|诊所|就医/g, value: '医疗场景' }
  ]

  for (const pattern of scenarioPatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 15
    }
  }

  // 检测时间场景
  const timePatterns = [
    { regex: /早上|上午|晨间/g, value: '早间使用' },
    { regex: /下午|晚上|夜间/g, value: '晚间使用' },
    { regex: /周末|假期|休息/g, value: '休闲时使用' },
    { regex: /工作日|平时/g, value: '工作日使用' }
  ]

  for (const pattern of timePatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 10
    }
  }

  // 检测使用频率
  if (/每天|日常|经常|频繁/.test(description)) {
    detected.push('高频使用场景')
    score += 15
  }

  if (/偶尔|有时|不定期/.test(description)) {
    detected.push('低频使用场景')
    score += 10
  }

  // 生成缺失信息
  if (detected.length < 2) missing.push('使用场景描述不足')
  if (!detected.some(d => d.includes('使用'))) missing.push('使用频率不明确')
  if (score < 30) missing.push('缺少具体的使用情境描述')

  const questions = [
    '用户在什么场景下会使用您的产品?',
    '用户使用产品的频率大概是怎样的?',
    '典型的使用流程是什么样的?',
    '什么情况下用户最需要这个产品?'
  ]

  const suggestions = [
    '描述2-3个典型的使用场景',
    '说明用户使用的频率和时长',
    '详细描述用户的使用流程'
  ]

  return {
    score: Math.min(score, 100),
    detected,
    missing,
    questions: missing.length > 0 ? questions.slice(0, missing.length + 1) : [],
    suggestions: missing.length > 0 ? suggestions : []
  }
}

/**
 * 分析商业模式维度
 */
function analyzeBusinessModel(description: string): DimensionAnalysis {
  const detected: string[] = []
  const missing: string[] = []
  let score = 0

  // 检测收费模式
  const revenuePatterns = [
    { regex: /订阅|月费|年费|会员/g, value: '订阅制模式' },
    { regex: /一次性|买断|购买/g, value: '一次性付费模式' },
    { regex: /佣金|抽成|分成/g, value: '佣金模式' },
    { regex: /广告|推广|流量/g, value: '广告模式' },
    { regex: /免费|增值|基础版/g, value: '免费增值模式' },
    { regex: /企业版|商业版|定制/g, value: '企业服务模式' }
  ]

  for (const pattern of revenuePatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 20
    }
  }

  // 检测价格信息
  const pricePatterns = [
    { regex: /\d+元|￥\d+|\$\d+/g, value: '明确价格' },
    { regex: /免费/g, value: '免费策略' }
  ]

  for (const pattern of pricePatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 15
    }
  }

  // 检测商业类型
  if (/B2B|企业|公司/.test(description)) {
    detected.push('B2B模式')
    score += 10
  }
  if (/B2C|消费者|个人/.test(description)) {
    detected.push('B2C模式')
    score += 10
  }
  if (/平台|撮合|连接/.test(description)) {
    detected.push('平台模式')
    score += 10
  }

  // 生成缺失信息
  if (!detected.some(d => d.includes('模式'))) missing.push('收费模式不明确')
  if (!detected.some(d => d.includes('价格'))) missing.push('价格策略缺失')
  if (score < 30) missing.push('商业模式的可行性分析不足')

  const questions = [
    '您计划采用什么样的收费模式?',
    '产品的定价策略是怎样的?',
    '预期的收入来源有哪些?',
    '如何确保商业模式的可持续性?'
  ]

  const suggestions = [
    '明确说明收费模式和定价策略',
    '分析收入来源的多样性',
    '考虑商业模式的可扩展性'
  ]

  return {
    score: Math.min(score, 100),
    detected,
    missing,
    questions: missing.length > 0 ? questions.slice(0, missing.length + 1) : [],
    suggestions: missing.length > 0 ? suggestions : []
  }
}

/**
 * 分析竞争情况维度
 */
function analyzeCompetitors(description: string): DimensionAnalysis {
  const detected: string[] = []
  const missing: string[] = []
  let score = 0

  // 检测竞争对手提及
  if (/竞争|对手|同类|类似/.test(description)) {
    detected.push('提及竞争情况')
    score += 20
  }

  // 检测优势描述
  const advantagePatterns = [
    { regex: /优势|强|更好|超越/g, value: '描述了优势' },
    { regex: /独特|创新|首创|唯一/g, value: '强调了独特性' },
    { regex: /差异|不同|区别/g, value: '分析了差异化' }
  ]

  for (const pattern of advantagePatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 15
    }
  }

  // 检测市场空白
  if (/空白|缺少|没有|少有/.test(description)) {
    detected.push('识别了市场空白')
    score += 20
  }

  // 生成缺失信息
  if (score < 20) missing.push('未分析竞争对手情况')
  if (score < 40) missing.push('产品优势不够明确')
  if (score < 60) missing.push('差异化特征不突出')

  const questions = [
    '市场上有哪些类似的产品或服务?',
    '您的产品与竞争对手相比有什么优势?',
    '有哪些独特的功能或特色?',
    '如何在竞争中脱颖而出?'
  ]

  const suggestions = [
    '研究并分析主要竞争对手',
    '明确产品的差异化优势',
    '突出独特价值主张'
  ]

  return {
    score: Math.min(score, 100),
    detected,
    missing,
    questions: missing.length > 0 ? questions.slice(0, missing.length + 1) : [],
    suggestions: missing.length > 0 ? suggestions : []
  }
}

/**
 * 分析独特价值维度
 */
function analyzeUniqueValue(description: string): DimensionAnalysis {
  const detected: string[] = []
  const missing: string[] = []
  let score = 0

  // 检测价值主张
  const valuePatterns = [
    { regex: /提升|改善|优化|增强/g, value: '提升价值' },
    { regex: /节省|降低|减少/g, value: '成本节约价值' },
    { regex: /便利|方便|简单|易用/g, value: '便利性价值' },
    { regex: /个性化|定制|专属/g, value: '个性化价值' },
    { regex: /准确|精确|可靠/g, value: '准确性价值' }
  ]

  for (const pattern of valuePatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 15
    }
  }

  // 检测量化收益
  if (/\d+%|\d+倍|\d+小时|\d+分钟/.test(description)) {
    detected.push('量化了收益')
    score += 20
  }

  // 检测用户获得感
  if (/满意|喜欢|推荐|口碑/.test(description)) {
    detected.push('考虑了用户满意度')
    score += 15
  }

  // 生成缺失信息
  if (score < 30) missing.push('用户价值不够明确')
  if (!detected.some(d => d.includes('量化'))) missing.push('缺少量化的收益描述')
  if (score < 50) missing.push('用户获得感描述不足')

  const questions = [
    '用户使用您的产品能获得什么具体价值?',
    '能为用户节省多少时间或成本?',
    '用户的满意度预期如何?',
    '如何量化产品带来的收益?'
  ]

  const suggestions = [
    '清晰阐述用户能获得的具体价值',
    '尽量用数据量化产品收益',
    '考虑用户的情感价值和满意度'
  ]

  return {
    score: Math.min(score, 100),
    detected,
    missing,
    questions: missing.length > 0 ? questions.slice(0, missing.length + 1) : [],
    suggestions: missing.length > 0 ? suggestions : []
  }
}

/**
 * 分析技术需求维度
 */
function analyzeTechRequirements(description: string): DimensionAnalysis {
  const detected: string[] = []
  const missing: string[] = []
  let score = 0

  // 检测技术栈
  const techPatterns = [
    { regex: /AI|人工智能|机器学习|深度学习/g, value: 'AI技术' },
    { regex: /云计算|云服务|AWS|阿里云/g, value: '云计算技术' },
    { regex: /数据库|MySQL|MongoDB/g, value: '数据库技术' },
    { regex: /移动端|APP|安卓|iOS/g, value: '移动端技术' },
    { regex: /网页|Web|前端|后端/g, value: 'Web技术' },
    { regex: /API|接口|集成/g, value: 'API集成' },
    { regex: /支付|第三方|SDK/g, value: '第三方集成' }
  ]

  for (const pattern of techPatterns) {
    if (pattern.regex.test(description)) {
      detected.push(pattern.value)
      score += 12
    }
  }

  // 检测技术复杂度
  if (/复杂|高级|先进/.test(description)) {
    detected.push('高技术复杂度')
    score += 10
  }
  if (/简单|基础|标准/.test(description)) {
    detected.push('基础技术需求')
    score += 15
  }

  // 检测开发要求
  if (/开发|编程|技术团队/.test(description)) {
    detected.push('提及开发需求')
    score += 10
  }

  // 检测平台要求
  if (/跨平台|多端|全平台/.test(description)) {
    detected.push('跨平台需求')
    score += 10
  }

  // 如果没有明确技术需求,给个基础分
  if (score === 0) score = 30

  const questions = [
    '产品需要什么样的技术栈?',
    '开发团队的技术要求如何?',
    '需要集成哪些第三方服务?',
    '对技术性能有什么要求?'
  ]

  const suggestions = [
    '明确技术实现方案',
    '评估开发难度和成本',
    '考虑技术方案的可行性'
  ]

  return {
    score: Math.min(score, 100),
    detected,
    missing: score < 50 ? ['技术需求描述不够详细'] : [],
    questions: score < 50 ? questions.slice(0, 2) : [],
    suggestions: score < 50 ? suggestions : []
  }
}

/**
 * 生成改进建议
 */
function generateRecommendations(
  dimensions: CompletenessAnalysis['dimensions']
): CompletenessAnalysis['recommendations'] {
  const recommendations: CompletenessAnalysis['recommendations'] = []

  // 按分数排序,优先推荐分数最低的维度
  const sortedDimensions = Object.entries(dimensions)
    .sort(([,a], [,b]) => a.score - b.score)
    .slice(0, 3) // 只推荐前3个最需要改进的

  for (const [dimensionKey, analysis] of sortedDimensions) {
    if (analysis.score < 70 && analysis.missing.length > 0) {
      recommendations.push({
        priority: analysis.score < 30 ? 'high' : analysis.score < 50 ? 'medium' : 'low',
        dimension: getDimensionName(dimensionKey),
        suggestion: analysis.suggestions[0] || `需要完善${getDimensionName(dimensionKey)}相关信息`,
        questions: analysis.questions.slice(0, 2)
      })
    }
  }

  return recommendations
}

/**
 * 确定生成质量等级
 */
function determineGenerationQuality(overallScore: number): CompletenessAnalysis['canGenerateQuality'] {
  if (overallScore >= 75) return 'high'
  if (overallScore >= 50) return 'medium'
  if (overallScore >= 30) return 'low'
  return 'insufficient'
}

/**
 * 生成下一步建议
 */
function generateNextSteps(
  dimensions: CompletenessAnalysis['dimensions'],
  overallScore: number
): string[] {
  const nextSteps: string[] = []

  if (overallScore < 30) {
    nextSteps.push('📝 建议先完善创意描述,补充关键信息后再进行模块生成')
    nextSteps.push('💡 可以参考我们提供的引导问题来完善创意')
  } else if (overallScore < 50) {
    nextSteps.push('⚡ 可以先生成基础版本,然后根据结果进一步完善')
    nextSteps.push('🎯 建议重点关注得分较低的维度进行补充')
  } else if (overallScore < 75) {
    nextSteps.push('✨ 创意信息已比较完善,可以开始生成模块内容')
    nextSteps.push('🔄 生成后可以根据结果反馈进行迭代优化')
  } else {
    nextSteps.push('🎉 创意信息非常完善,可以生成高质量的商业计划内容')
    nextSteps.push('🚀 建议选择所有模块进行完整的创意实现建议')
  }

  return nextSteps
}

/**
 * 获取维度中文名称
 */
function getDimensionName(dimensionKey: string): string {
  const names: Record<string, string> = {
    targetUsers: '目标用户',
    painPoints: '痛点分析',
    coreFeatures: '核心功能',
    userScenarios: '使用场景',
    businessModel: '商业模式',
    competitors: '竞争分析',
    uniqueValue: '独特价值',
    techRequirements: '技术需求'
  }
  return names[dimensionKey] || dimensionKey
}