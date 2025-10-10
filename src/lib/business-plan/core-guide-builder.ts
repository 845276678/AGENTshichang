import type { BusinessPlanGuide, BiddingSnapshot, BusinessPlanMetadata } from "./types"
import type { AIMessage } from '@/lib/ai-persona-system'
import AIServiceManager from '@/lib/ai-service-manager'
import { contentCache } from './content-cache'

const aiServiceManager = new AIServiceManager()

const BASE_GUIDE_TEMPLATE: BusinessPlanGuide = {
  currentSituation: {
    title: "先聊聊大环境和机会",
    summary: "收集专家的洞察，在当今市场中找准这个创意的位置。",
    keyInsights: [
      "市场机会扫描中，看看有哪些空间",
      "用户需求还在验证，得和真实用户聊聊",
      "竞争差异化要确认，找到你的独特价值"
    ],
    marketReality: {
      marketSize: "市场规模评估中，会给你一个靠谱的数字",
      competition: "竞争情况审查中，看看对手都在做什么",
      opportunities: ["机会点梳理中，帮你找到切入点"],
      challenges: ["可能遇到的坑也在记录中"]
    },
    userNeeds: {
      targetUsers: "目标用户画像起草中，帮你找到第一批种子用户",
      painPoints: ["痛点整理中，看看用户到底需要什么"],
      solutions: ["解决方案框架中，想想怎么帮他们"]
    },
    actionItems: [
      "把竞价时专家们说的那些点整理成一张价值主张图",
      "确定3-5个最优先要搞定的用户群体",
      "设计一套结构化的用户研究计划，别瞎猜"
    ]
  },
  mvpDefinition: {
    title: "第一步:做个能用的MVP",
    productConcept: {
      coreFeatures: ["先把最核心的功能列出来，别贪多"],
      uniqueValue: "说清楚你跟别人有啥不一样，为什么用户要选你",
      minimumScope: "MVP阶段专注1-2个高影响力的场景就够了"
    },
    developmentPlan: {
      phases: [
        {
          name: "第一步:验证技术能不能行",
          duration: "2周",
          deliverables: ["做个原型演示", "性能测试笔记", "风险清单"],
          resources: ["技术负责人", "产品经理", "测试"]
        },
        {
          name: "第二步:做出能用的产品",
          duration: "3周",
          deliverables: ["可用的MVP", "数据追踪", "基础支持工具"],
          resources: ["前端", "后端", "设计"]
        },
        {
          name: "第三步:找人来试试",
          duration: "3周",
          deliverables: ["种子用户群", "反馈报告", "数据分析"],
          resources: ["运营", "分析", "客服"]
        }
      ],
      techStack: ["技术栈定义中，选成熟的就行"],
      estimatedCost: "预计4周消耗：¥15,000 - ¥30,000（主要是人工与工具成本）"
    },
    validationStrategy: {
      hypotheses: ["关键假设待验证，这些假设决定成败"],
      experiments: ["设计访谈和实验计划，用数据说话"],
      successMetrics: ["定义成功指标，不能光凭感觉"],
      timeline: "4周内分四步走：对齐方向 → 原型构建 → 用户验证 → 收入信号"
    },
    actionItems: [
      '确定MVP范围和「必须有的」功能，其他的先放放',
      '把协作和反馈工具搭起来',
      '定好每周迭代节奏，谁负责什么'
    ]
  },
  businessExecution: {
    title: "怎么赚钱",
    businessModel: {
      revenueStreams: ["收入来源要想清楚，别指望一个渠道"],
      costStructure: ["成本结构要算好，知道钱花在哪"],
      pricingStrategy: "定价策略得和早期用户一起试试看",
      scalability: "规模化怎么做，提前想好"
    },
    launchStrategy: {
      phases: [
        {
          name: "预热期",
          timeline: "第1周",
          goals: ["搭品牌", "找种子用户"],
          tactics: ["内容营销", "专家背书"]
        },
        {
          name: "试点期",
          timeline: "第2-3周",
          goals: ["小范围验证", "收集案例"],
          tactics: ["用户共创", "精细化服务"]
        },
        {
          name: "商业验证",
          timeline: "第4周",
          goals: ["验证付费", "建立反馈循环"],
          tactics: ["限时优惠", "推荐返利"]
        }
      ],
      marketingChannels: ["渠道组合设计中，多试几个"],
      budgetAllocation: ["预算分配计划中，控制好节奏"]
    },
    operationalPlan: {
      teamStructure: ["团队怎么搭，找对的人"],
      processes: ["流程怎么定，保持敏捷"],
      infrastructure: ["工具和平台怎么选，够用就行"],
      riskManagement: ["风险怎么管，提前准备预案"]
    },
    actionItems: [
      "列出几个可能的赚钱方式",
      "写个运营手册，让团队知道怎么干",
      "把关键指标的监控搭起来"
    ]
  },
  executionPlan: undefined,
  metadata: {
    ideaTitle: "你的创意",
    reportId: undefined,
    generatedAt: new Date().toISOString(),
    estimatedReadTime: 15,
    implementationTimeframe: "4周",
    confidenceLevel: 50,
    source: 'ai-bidding'
  }
}

const cloneGuide = (): BusinessPlanGuide => JSON.parse(JSON.stringify(BASE_GUIDE_TEMPLATE))

const computeConfidence = (snapshot: BiddingSnapshot): number => {
  const base = Math.min(95, Math.max(30, (snapshot.highestBid ?? 150) / 3))
  const supporters = snapshot.supportedAgents?.length ?? 0
  return Math.min(98, Math.round(base + supporters * 2))
}

/**
 * 专家对话上下文结构
 */
interface ExpertContext {
  summary: string
  keyQuotes: Array<{
    expert: string
    personaName: string
    quote: string
    topic: string
    sentiment: 'positive' | 'negative' | 'neutral'
  }>
  consensusPoints: string[]
  controversialPoints: string[]
}

/**
 * 提取关键引用
 */
function extractKeyQuotes(messages: AIMessage[]): ExpertContext['keyQuotes'] {
  const quotes: ExpertContext['keyQuotes'] = []

  // 专家名称映射
  const personaNames: Record<string, string> = {
    'tech-pioneer-alex': '艾克斯',
    'business-guru-beta': '老王',
    'innovation-mentor-charlie': '小琳',
    'investment-advisor-ivan': '李博',
    'market-insight-delta': '阿伦'
  }

  messages.forEach(msg => {
    // 只提取speech类型且内容足够长的消息
    if (msg.type === 'speech' && msg.content.length >= 20 && msg.content.length <= 200) {
      // 判断情绪倾向
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
      if (msg.emotion === 'excited' || msg.emotion === 'confident' || msg.emotion === 'happy') {
        sentiment = 'positive'
      } else if (msg.emotion === 'worried' || msg.emotion === 'angry') {
        sentiment = 'negative'
      }

      // 判断主题
      let topic = '整体评估'
      if (msg.content.includes('技术') || msg.content.includes('算法') || msg.content.includes('架构')) {
        topic = '技术可行性'
      } else if (msg.content.includes('市场') || msg.content.includes('用户') || msg.content.includes('需求')) {
        topic = '市场分析'
      } else if (msg.content.includes('盈利') || msg.content.includes('商业') || msg.content.includes('变现')) {
        topic = '商业模式'
      } else if (msg.content.includes('风险') || msg.content.includes('挑战')) {
        topic = '风险评估'
      }

      quotes.push({
        expert: msg.personaId,
        personaName: personaNames[msg.personaId] || msg.personaId,
        quote: msg.content,
        topic,
        sentiment
      })
    }
  })

  // 每个专家最多保留2条最有价值的发言
  const quotesByExpert: Record<string, typeof quotes> = {}
  quotes.forEach(q => {
    if (!quotesByExpert[q.expert]) quotesByExpert[q.expert] = []
    quotesByExpert[q.expert].push(q)
  })

  const selectedQuotes: typeof quotes = []
  Object.values(quotesByExpert).forEach(expertQuotes => {
    // 优先选择有明确情绪的发言
    const sorted = expertQuotes.sort((a, b) => {
      if (a.sentiment !== 'neutral' && b.sentiment === 'neutral') return -1
      if (a.sentiment === 'neutral' && b.sentiment !== 'neutral') return 1
      return b.quote.length - a.quote.length
    })
    selectedQuotes.push(...sorted.slice(0, 2))
  })

  return selectedQuotes
}

/**
 * 智能提取专家对话上下文
 */
async function extractExpertContext(snapshot: BiddingSnapshot): Promise<ExpertContext> {
  const messages = snapshot.aiMessages || []

  if (messages.length === 0) {
    return {
      summary: '暂无专家讨论记录',
      keyQuotes: [],
      consensusPoints: [],
      controversialPoints: []
    }
  }

  // 提取关键引用
  const keyQuotes = extractKeyQuotes(messages)

  // 分析共识和争议
  const positiveCount = keyQuotes.filter(q => q.sentiment === 'positive').length
  const negativeCount = keyQuotes.filter(q => q.sentiment === 'negative').length

  const consensusPoints: string[] = []
  const controversialPoints: string[] = []

  if (positiveCount > negativeCount * 2) {
    consensusPoints.push('专家们普遍看好这个创意的市场前景')
  } else if (negativeCount > positiveCount * 2) {
    consensusPoints.push('专家们认为这个创意存在明显的风险点')
  } else {
    controversialPoints.push('专家们对创意的评价存在分歧，需要进一步验证')
  }

  // 按主题分组分析
  const topicGroups: Record<string, typeof keyQuotes> = {}
  keyQuotes.forEach(q => {
    if (!topicGroups[q.topic]) topicGroups[q.topic] = []
    topicGroups[q.topic].push(q)
  })

  Object.entries(topicGroups).forEach(([topic, quotes]) => {
    const positive = quotes.filter(q => q.sentiment === 'positive').length
    const negative = quotes.filter(q => q.sentiment === 'negative').length

    if (positive > 0 && negative > 0) {
      controversialPoints.push(`${topic}方面存在不同看法`)
    } else if (positive > negative) {
      consensusPoints.push(`${topic}得到专家认可`)
    }
  })

  // 生成摘要
  const expertNames = [...new Set(keyQuotes.map(q => q.personaName))].join('、')
  const summary = `${expertNames}等${keyQuotes.length > 0 ? keyQuotes.length : messages.length}位专家参与了讨论。${consensusPoints[0] || '专家们从多个角度分析了这个创意'}。${controversialPoints.length > 0 ? `但${controversialPoints[0]}，建议重点关注。` : '整体评价较为一致。'}`

  return {
    summary,
    keyQuotes: keyQuotes.slice(0, 8), // 最多保留8条引用
    consensusPoints: consensusPoints.slice(0, 3),
    controversialPoints: controversialPoints.slice(0, 3)
  }
}

/**
 * 从竞价对话中提取专家洞察
 */
function extractExpertInsights(snapshot: BiddingSnapshot): {
  strengths: string[]
  challenges: string[]
  opportunities: string[]
  keyQuestions: string[]
} {
  const insights = {
    strengths: [] as string[],
    challenges: [] as string[],
    opportunities: [] as string[],
    keyQuestions: [] as string[]
  }

  // 从专家消息中提取关键洞察
  const messages = snapshot.messages || []
  messages.forEach(msg => {
    const content = msg.content || ''

    // 识别优势相关的内容
    if (content.includes('优势') || content.includes('亮点') || content.includes('看好')) {
      const match = content.match(/[^。！？]*(?:优势|亮点|看好)[^。！？]*/g)
      if (match) insights.strengths.push(...match.map(s => s.trim()).filter(Boolean))
    }

    // 识别挑战相关的内容
    if (content.includes('挑战') || content.includes('风险') || content.includes('问题')) {
      const match = content.match(/[^。！？]*(?:挑战|风险|问题)[^。！？]*/g)
      if (match) insights.challenges.push(...match.map(s => s.trim()).filter(Boolean))
    }

    // 识别机会相关的内容
    if (content.includes('机会') || content.includes('潜力') || content.includes('空间')) {
      const match = content.match(/[^。！？]*(?:机会|潜力|空间)[^。！？]*/g)
      if (match) insights.opportunities.push(...match.map(s => s.trim()).filter(Boolean))
    }

    // 识别问题
    if (content.includes('?') || content.includes('？')) {
      const match = content.match(/[^。！]*[?？]/g)
      if (match) insights.keyQuestions.push(...match.map(s => s.trim()).filter(Boolean))
    }
  })

  // 去重并限制数量
  insights.strengths = [...new Set(insights.strengths)].slice(0, 5)
  insights.challenges = [...new Set(insights.challenges)].slice(0, 5)
  insights.opportunities = [...new Set(insights.opportunities)].slice(0, 5)
  insights.keyQuestions = [...new Set(insights.keyQuestions)].slice(0, 3)

  return insights
}

/**
 * 使用AI生成个性化的商业计划内容
 */
async function generatePersonalizedContent(
  snapshot: BiddingSnapshot,
  expertInsights: ReturnType<typeof extractExpertInsights>,
  expertContext: ExpertContext
): Promise<{
  marketAnalysis: string
  competitionAnalysis: string
  targetCustomers: string[]
  userNeeds: string
  mvpFeatures: string[]
  techStack: string[]
  revenueModel: string
  pricingStrategy: string
  customerAcquisition: {
    targetCustomers: string[]
    acquisitionChannels: string[]
    coldStartStrategy: string
    budgetAllocation: string
  }
  marketingStrategy: {
    contentStrategy: string[]
    communityStrategy: string[]
    partnershipIdeas: string[]
    viralMechanics: string
  }
  earlyMilestones: {
    twoWeekGoals: Array<{
      title: string
      description: string
      successCriteria: string
      effort: 'low' | 'medium' | 'high'
      impact: 'low' | 'medium' | 'high'
    }>
    oneMonthGoals: Array<{
      title: string
      description: string
      successCriteria: string
      effort: 'low' | 'medium' | 'high'
      impact: 'low' | 'medium' | 'high'
    }>
    quickWins: string[]
  }
}> {
  const ideaTitle = snapshot.ideaTitle || '创意项目'
  const ideaContent = snapshot.ideaDescription || snapshot.summary || ''

  // 生成缓存键
  const cacheKey = contentCache.getHash(
    ideaContent,
    JSON.stringify({
      summary: expertContext.summary,
      consensusCount: expertContext.consensusPoints.length,
      controversyCount: expertContext.controversialPoints.length,
      quotesCount: expertContext.keyQuotes.length
    })
  )

  // 尝试从缓存获取
  const cachedContent = contentCache.get(cacheKey)
  if (cachedContent) {
    console.log('🎯 使用缓存的AI生成内容，节省成本')
    return cachedContent
  }

  // 构建丰富的上下文prompt
  const contextPrompt = `
创意标题：${ideaTitle}
创意描述：${ideaContent}

【专家竞价讨论摘要】
${expertContext.summary}

【专家关键观点】
${expertContext.keyQuotes.map(q => `${q.personaName}（${q.topic}）：${q.quote}`).join('\n')}

【专家共识】
${expertContext.consensusPoints.join('\n')}

${expertContext.controversialPoints.length > 0 ? `【存在争议】\n${expertContext.controversialPoints.join('\n')}` : ''}

【竞价结果】
最高出价：${snapshot.highestBid || 0}分
支持专家：${snapshot.supportedAgents?.length || 0}位
`.trim()

  const prompt = `
你是一位资深的商业顾问和营销专家，正在为创业者制定详细的商业计划。请基于以下信息生成个性化的分析和建议：

${contextPrompt}

请提供以下内容（用JSON格式返回）：

1. marketAnalysis: 市场分析（100-150字，分析市场规模、增长趋势、目标用户群体）
2. competitionAnalysis: 竞争分析（80-120字，分析直接竞品和间接竞品，找到差异化切入点）
3. targetCustomers: 目标客户画像（3-4个具体的用户群体描述，每个20-40字）
4. userNeeds: 用户需求和痛点（80-120字，具体说明目标用户的核心痛点和需求）
5. mvpFeatures: MVP核心功能列表（3-5个功能，每个15-30字，要具体可执行）
6. techStack: 技术栈推荐（3-5个，结合创意特点和行业最佳实践）
7. revenueModel: 收入模式建议（100-150字，说明2-3种可能的变现方式）
8. pricingStrategy: 定价策略（80-120字，说明早期定价和成熟期定价）

9. customerAcquisition: 客户获取策略
   - targetCustomers: 目标客户画像（3-4个具体的用户群体描述，每个20-40字）
   - acquisitionChannels: 获客渠道（4-6个具体可执行的渠道，每个包含渠道名称和如何操作）
   - coldStartStrategy: 冷启动策略（150-200字，详细说明前100个用户如何获取）
   - budgetAllocation: 预算分配建议（80-120字，说明钱应该花在哪里）

10. marketingStrategy: 营销推广策略
   - contentStrategy: 内容营销策略（3-4条具体的内容方向，每条说明在哪个平台发什么内容）
   - communityStrategy: 社群运营策略（3-4条具体的社群玩法，说明如何找到并激活目标用户社群）
   - partnershipIdeas: 合作伙伴策略（3-4个可能的合作方向，说明找谁合作、如何合作）
   - viralMechanics: 病毒传播机制（80-120字，设计让用户主动分享的机制）

11. earlyMilestones: 早期里程碑目标（让用户快速获得正反馈）
   - twoWeekGoals: 2周内可达成的目标（3-4个选项，每个包含：）
     * title: 目标标题（10-15字）
     * description: 具体描述（40-60字，说明怎么做）
     * successCriteria: 成功标准（20-30字，可量化）
     * effort: 投入程度（low/medium/high）
     * impact: 影响程度（low/medium/high）
   - oneMonthGoals: 4周内可达成的目标（3-4个选项，结构同上）
   - quickWins: 立即可做的3个快赢行动（每个15-25字）

要求：
- 内容必须紧密结合这个具体的创意和行业特点
- 获客渠道要具体可执行，不要泛泛而谈
- 冷启动策略要有具体的执行步骤
- 早期目标要现实可达，能给用户带来成就感和正反馈
- 目标要有选择性，让用户根据自己情况选择
- 语言口语化、接地气
- 给出可执行的具体建议
- 避免空洞的套话

请直接返回JSON，不要其他说明。
`.trim()

  // 多层降级策略：DeepSeek → Qwen → 智能模板
  let aiResponse: any = null
  let lastError: Error | null = null

  // 第一层：尝试 DeepSeek
  try {
    console.log('🤖 尝试使用 DeepSeek 生成内容...')
    const response = await aiServiceManager.callSingleService({
      provider: 'deepseek',
      persona: 'business-strategist',
      context: {
        ideaContent,
        expertInsights: contextPrompt
      },
      systemPrompt: '你是一位资深商业顾问和营销专家，擅长将创意转化为可执行的商业计划，特别擅长设计获客策略和冷启动方案。使用口语化、务实的语言，给出具体可操作的建议。',
      userPrompt: prompt,
      temperature: 0.7,
      maxTokens: 3000
    })

    const content = response.content.trim()
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      aiResponse = JSON.parse(jsonMatch[0])
      console.log('✅ DeepSeek 生成成功')
    }
  } catch (error) {
    lastError = error as Error
    console.warn('⚠️ DeepSeek 调用失败:', error)

    // 第二层：尝试 Qwen (通义千问)
    try {
      console.log('🤖 降级到 Qwen 生成内容...')
      const response = await aiServiceManager.callSingleService({
        provider: 'qwen',
        persona: 'business-strategist',
        context: {
          ideaContent,
          expertInsights: contextPrompt
        },
        systemPrompt: '你是一位资深商业顾问和营销专家，擅长将创意转化为可执行的商业计划，特别擅长设计获客策略和冷启动方案。使用口语化、务实的语言，给出具体可操作的建议。',
        userPrompt: prompt,
        temperature: 0.7,
        maxTokens: 3000
      })

      const content = response.content.trim()
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0])
        console.log('✅ Qwen 生成成功')
      }
    } catch (qwenError) {
      lastError = qwenError as Error
      console.error('❌ Qwen 也失败了:', qwenError)
    }
  }

  // 如果AI成功生成内容，解析并返回
  if (aiResponse) {
    try {
      const result = {
        marketAnalysis: aiResponse.marketAnalysis || '市场分析生成中...',
        competitionAnalysis: aiResponse.competitionAnalysis || '竞争分析生成中...',
        targetCustomers: Array.isArray(aiResponse.targetCustomers) ? aiResponse.targetCustomers : [`${ideaTitle}的核心目标用户群体`, '次要用户群体', '潜在扩展用户'],
        userNeeds: aiResponse.userNeeds || '用户需求分析中...',
        mvpFeatures: Array.isArray(aiResponse.mvpFeatures) ? aiResponse.mvpFeatures : ['核心功能1', '核心功能2', '核心功能3'],
        techStack: Array.isArray(aiResponse.techStack) ? aiResponse.techStack : ['Next.js / React', 'Node.js', 'PostgreSQL'],
        revenueModel: aiResponse.revenueModel || '收入模式设计中...',
        pricingStrategy: aiResponse.pricingStrategy || '定价策略设计中...',
        customerAcquisition: {
          targetCustomers: Array.isArray(aiResponse.customerAcquisition?.targetCustomers)
            ? aiResponse.customerAcquisition.targetCustomers
            : [`${ideaTitle}的核心目标用户群体`, '次要用户群体', '潜在扩展用户'],
          acquisitionChannels: Array.isArray(aiResponse.customerAcquisition?.acquisitionChannels)
            ? aiResponse.customerAcquisition.acquisitionChannels
            : ['搜索引擎优化SEO', '内容营销', '社交媒体推广', '合作伙伴引流'],
          coldStartStrategy: aiResponse.customerAcquisition?.coldStartStrategy || '冷启动策略制定中...',
          budgetAllocation: aiResponse.customerAcquisition?.budgetAllocation || '预算分配建议制定中...'
        },
        marketingStrategy: {
          contentStrategy: Array.isArray(aiResponse.marketingStrategy?.contentStrategy)
            ? aiResponse.marketingStrategy.contentStrategy
            : ['创建行业相关的优质内容', '分享用户成功案例', '发布产品使用技巧'],
          communityStrategy: Array.isArray(aiResponse.marketingStrategy?.communityStrategy)
            ? aiResponse.marketingStrategy.communityStrategy
            : ['建立用户社群', '定期组织线上活动', '培养种子用户'],
          partnershipIdeas: Array.isArray(aiResponse.marketingStrategy?.partnershipIdeas)
            ? aiResponse.marketingStrategy.partnershipIdeas
            : ['与互补产品合作', '寻找行业KOL背书', '加入行业联盟'],
          viralMechanics: aiResponse.marketingStrategy?.viralMechanics || '病毒传播机制设计中...'
        },
        earlyMilestones: {
          twoWeekGoals: Array.isArray(aiResponse.earlyMilestones?.twoWeekGoals)
            ? aiResponse.earlyMilestones.twoWeekGoals
            : [
                {
                  title: '验证核心假设',
                  description: '找10个潜在用户深度访谈，验证他们是否真的有这个需求',
                  successCriteria: '至少5人表示愿意试用',
                  effort: 'low' as const,
                  impact: 'high' as const
                },
                {
                  title: '制作MVP原型',
                  description: '用Figma或简单工具做出可演示的产品原型',
                  successCriteria: '完成核心流程演示',
                  effort: 'medium' as const,
                  impact: 'high' as const
                },
                {
                  title: '发布第一篇内容',
                  description: '在知乎或小红书发布一篇与创意相关的专业文章',
                  successCriteria: '获得100+阅读或10+互动',
                  effort: 'low' as const,
                  impact: 'medium' as const
                }
              ],
          oneMonthGoals: Array.isArray(aiResponse.earlyMilestones?.oneMonthGoals)
            ? aiResponse.earlyMilestones.oneMonthGoals
            : [
                {
                  title: '获得前20个真实用户',
                  description: '通过内容、社群等渠道，吸引20个愿意深度试用的用户',
                  successCriteria: '20个注册用户，至少10人完成核心功能体验',
                  effort: 'high' as const,
                  impact: 'high' as const
                },
                {
                  title: '建立用户反馈机制',
                  description: '创建用户群，定期收集反馈，形成产品迭代闭环',
                  successCriteria: '建立微信群，收集到30条有效反馈',
                  effort: 'low' as const,
                  impact: 'high' as const
                },
                {
                  title: '完成MVP开发',
                  description: '开发出包含核心功能的最小可用产品',
                  successCriteria: '核心功能可用，能完成基本流程',
                  effort: 'high' as const,
                  impact: 'high' as const
                }
              ],
          quickWins: Array.isArray(aiResponse.earlyMilestones?.quickWins)
            ? aiResponse.earlyMilestones.quickWins
            : [
                '今天就在朋友圈发布创意，收集初步反馈',
                '加入3个目标用户活跃的社群，观察他们的讨论',
                '制作一个简单的落地页，说明产品价值'
              ]
        }
      }

      // 保存到缓存
      contentCache.set(cacheKey, result)
      console.log('💾 AI生成内容已缓存')

      return result
    } catch (parseError) {
      console.error('❌ AI响应解析失败:', parseError)
      // 继续到降级方案
    }
  }

  // 第三层：智能模板降级（基于专家洞察生成更有针对性的内容）
  console.log('🔧 使用智能模板生成降级内容...')
  console.error('所有AI服务均失败，最后错误:', lastError)

  // 降级方案：基于创意内容和专家洞察生成模板化但有针对性的内容
  return {
    marketAnalysis: `${ideaTitle}面向的市场具有一定规模和增长潜力。通过竞价分析，专家们对这个创意的评估是${snapshot.highestBid && snapshot.highestBid > 200 ? '积极的' : '谨慎乐观的'}，认为需要进一步验证市场需求和竞争优势。建议重点关注目标用户的真实痛点，找到差异化切入点。`,

    competitionAnalysis: `当前市场存在一定竞争，但${ideaTitle}可以通过独特的价值主张建立差异化优势。建议深入分析2-3个主要竞品的优缺点，找到他们没有满足的用户需求。`,

    targetCustomers: [
      `早期采用者：对${ideaTitle}这类解决方案有迫切需求，愿意尝试新产品`,
      `专业用户：在相关领域有一定经验，能够给出有价值的反馈`,
      `意见领袖：在目标社群有影响力，能帮助传播产品`
    ],

    userNeeds: `目标用户在使用现有解决方案时遇到的主要痛点包括：效率低、成本高、体验差等问题。${ideaTitle}需要深入了解用户的具体场景和需求，通过访谈和调研验证这些假设，确保产品真正解决用户的核心问题。`,

    mvpFeatures: [
      `${ideaTitle}的核心功能模块`,
      '用户引导和入门体验优化',
      '基础数据分析和反馈机制',
      '简化的工作流程和交互界面'
    ],

    techStack: ['Next.js / React', 'Node.js 或 FastAPI', '向量数据库 + AI API', 'Vercel/Railway 部署'],

    revenueModel: `建议采用订阅制为主、按量付费为辅的混合模式。早期可以通过免费试用吸引种子用户，积累口碑后推出付费版本。定价要参考同类产品，但可以在功能和服务上形成差异化，支撑溢价空间。`,

    pricingStrategy: `早期定价建议：免费版+付费版（¥99-299/月）。成熟期定价可以根据用户价值分层：个人版、专业版、企业版，形成¥0-¥999/月的价格梯度。`,

    customerAcquisition: {
      targetCustomers: [
        `早期采用者：对${ideaTitle}这类解决方案有迫切需求，愿意尝试新产品`,
        `专业用户：在相关领域有一定经验，能够给出有价值的反馈`,
        `意见领袖：在目标社群有影响力，能帮助传播产品`
      ],
      acquisitionChannels: [
        '内容营销：在知乎、小红书等平台分享行业干货，建立专业形象',
        '社群运营：加入目标用户活跃的微信群、Discord等社群，提供价值',
        'SEO优化：针对核心关键词优化内容，获取搜索流量',
        '合作推广：找互补产品或行业KOL合作，互相引流'
      ],
      coldStartStrategy: `前100个用户获取策略：1）从身边朋友和已有资源开始，邀请10-20个种子用户深度体验；2）在垂直社群发布有价值的内容，展示产品解决的真实问题，吸引30-50个精准用户；3）通过种子用户的反馈优化产品，请他们推荐给朋友，实现口碑传播；4）在产品hunt等平台发布，获取科技爱好者关注。关键是先服务好前20个用户，让他们成为你的传播者。`,
      budgetAllocation: `前期预算重点放在产品打磨（50%）和种子用户运营（30%），少量用于必要的推广测试（20%）。避免在产品验证前大规模投放广告，优先用时间换钱，通过内容和社群运营获取早期用户。`
    },

    marketingStrategy: {
      contentStrategy: [
        `知乎/小红书：分享${ideaTitle}解决的问题和使用技巧，建立专业认知`,
        '公众号/博客：深度文章讲解行业趋势和产品价值，吸引精准用户',
        '短视频：用1分钟展示产品核心功能和使用场景，降低理解门槛',
        '用户故事：分享真实用户的成功案例，增强可信度'
      ],
      communityStrategy: [
        '建立官方用户群：提供1对1支持，收集反馈，培养忠实用户',
        '入驻垂直社群：在行业论坛、专业微信群提供价值，不硬推产品',
        '组织线上活动：定期举办产品分享会、用户访谈，增强粘性',
        '用户激励计划：邀请活跃用户成为产品大使，给予权益和认可'
      ],
      partnershipIdeas: [
        '互补产品合作：找工具链上下游产品，互相推荐用户',
        'B端渠道合作：与企业服务商、代理商合作，打包销售',
        '行业协会/社群：加入专业组织，获取背书和资源对接',
        'KOL深度合作：不只是投放广告，而是让KOL深度参与产品设计'
      ],
      viralMechanics: `设计"用了就想分享"的机制：1）成果可视化：用户使用后生成可分享的成果（如报告、作品），带产品水印；2）邀请奖励：老用户邀请新用户，双方都获得增值权益；3）社交货币：提供有传播价值的功能或内容，让用户愿意晒到朋友圈；4）协作功能：多人协作场景自然带来新用户。`
    },

    earlyMilestones: {
      twoWeekGoals: [
        {
          title: '验证核心假设',
          description: `找10个${ideaTitle}的潜在用户深度访谈，验证他们是否真的有这个需求`,
          successCriteria: '至少5人明确表示愿意试用产品',
          effort: 'low' as const,
          impact: 'high' as const
        },
        {
          title: '制作演示原型',
          description: '用Figma或PPT做出产品的核心流程演示，能向用户展示价值',
          successCriteria: '完成可演示的原型，获得3个以上正面反馈',
          effort: 'medium' as const,
          impact: 'high' as const
        },
        {
          title: '发布首个内容',
          description: `在小红书或知乎发布一篇关于${ideaTitle}解决的问题的专业文章`,
          successCriteria: '获得100+阅读，10+点赞或评论',
          effort: 'low' as const,
          impact: 'medium' as const
        }
      ],
      oneMonthGoals: [
        {
          title: '获得前20个用户',
          description: '通过朋友推荐、社群分享等方式，吸引20个愿意深度试用的真实用户',
          successCriteria: '20个注册用户，至少10人完成核心功能体验',
          effort: 'high' as const,
          impact: 'high' as const
        },
        {
          title: '建立反馈闭环',
          description: '创建用户微信群，每周收集反馈，形成"需求-开发-验证"的快速迭代',
          successCriteria: '建立用户群，收集到30条以上有价值的反馈',
          effort: 'low' as const,
          impact: 'high' as const
        },
        {
          title: '完成MVP开发',
          description: '开发出包含1-2个核心功能的最小可用产品，能真正解决用户问题',
          successCriteria: '产品可用，至少5个用户能独立完成核心流程',
          effort: 'high' as const,
          impact: 'high' as const
        },
        {
          title: '发布3篇优质内容',
          description: '在不同平台发布3篇专业内容，开始建立品牌认知',
          successCriteria: '累计获得500+阅读，建立初步影响力',
          effort: 'medium' as const,
          impact: 'medium' as const
        }
      ],
      quickWins: [
        `今天就在朋友圈发布${ideaTitle}的创意想法，收集10条反馈`,
        '加入3个目标用户活跃的社群，花1周时间观察他们的真实需求',
        '用1天时间制作一个简单的落地页，说明产品核心价值'
      ]
    }
  }
}

export async function buildCoreGuide(snapshot: BiddingSnapshot): Promise<{
  guide: BusinessPlanGuide
  metadata: BusinessPlanMetadata
}> {
  const guide = cloneGuide()
  const highestBid = snapshot.highestBid ?? 0
  const supporters = snapshot.supportedAgents?.length ?? 0
  const confidence = computeConfidence(snapshot)
  const winnerName = snapshot.winnerName || 'AI专家团队'

  // 提取专家洞察（关键词提取）
  const expertInsights = extractExpertInsights(snapshot)

  // 提取专家对话上下文（智能提取）
  const expertContext = await extractExpertContext(snapshot)

  // 生成个性化内容（使用丰富的上下文）
  const personalizedContent = await generatePersonalizedContent(snapshot, expertInsights, expertContext)

  guide.metadata.ideaTitle = snapshot.ideaTitle
  guide.metadata.generatedAt = new Date().toISOString()
  guide.metadata.confidenceLevel = confidence
  guide.metadata.implementationTimeframe = '4周'
  guide.metadata.estimatedReadTime = 15
  guide.metadata.winningBid = highestBid
  guide.metadata.winner = winnerName

  // 添加专家洞察到guide
  guide.expertInsights = {
    summary: expertContext.summary,
    keyQuotes: expertContext.keyQuotes,
    consensusPoints: expertContext.consensusPoints,
    controversialPoints: expertContext.controversialPoints
  }

  // 更口语化的概述
  const supporterText = supporters > 0
    ? `有 ${supporters} 位专家明确表示看好，这说明需求是真实存在的`
    : `虽然还需要进一步验证，但专家们都看到了机会`

  guide.currentSituation.summary = `你的"${snapshot.ideaTitle}"在竞价环节拿到了 ${highestBid} 积分的最高出价。${supporterText}。接下来咱们把这些专家的洞察转化成实实在在的行动计划。`

  // 整合专家识别的关键洞察
  guide.currentSituation.keyInsights = [
    ...expertInsights.strengths.slice(0, 2),
    supporterText,
    `现在最关键的是：别光想，赶紧找真实用户聊聊`
  ].filter(Boolean)

  // 使用AI生成的市场分析
  guide.currentSituation.marketReality.marketSize = personalizedContent.marketAnalysis
  guide.currentSituation.marketReality.competition = personalizedContent.competitionAnalysis
  guide.currentSituation.marketReality.opportunities = [
    ...expertInsights.opportunities.slice(0, 3),
    '通过MVP快速验证，降低试错成本'
  ].filter(Boolean)
  guide.currentSituation.marketReality.challenges = [
    ...expertInsights.challenges.slice(0, 3),
    '需要持续关注用户反馈，快速迭代'
  ].filter(Boolean)

  // 使用AI生成的用户需求分析
  guide.currentSituation.userNeeds.targetUsers = personalizedContent.userNeeds
  guide.currentSituation.userNeeds.painPoints = expertInsights.keyQuestions.length > 0
    ? expertInsights.keyQuestions
    : ['用户的核心痛点需要通过访谈验证', '现有解决方案的不足之处', '愿意为解决方案付费的意愿']
  guide.currentSituation.userNeeds.solutions = [
    `${snapshot.ideaTitle}提供的核心价值`,
    '通过技术手段降低成本',
    '优化用户体验，提高效率'
  ]

  // 使用AI生成的MVP功能和技术栈
  guide.mvpDefinition.productConcept.coreFeatures = personalizedContent.mvpFeatures
  guide.mvpDefinition.productConcept.uniqueValue = `用最小的成本快速验证"${snapshot.ideaTitle}"这个想法到底行不行。`
  guide.mvpDefinition.productConcept.minimumScope = '专注1-2个最核心的场景，把反馈机制嵌进去，每天都能看到用户的真实反应。'
  guide.mvpDefinition.developmentPlan.techStack = personalizedContent.techStack

  guide.mvpDefinition.validationStrategy.hypotheses = [
    '用户真的愿意为这个结果付钱（不是嘴上说说）',
    'AI的输出质量达到了可以放心给用户用的程度',
    '用户用完会主动推荐给朋友或者继续用'
  ]

  guide.mvpDefinition.validationStrategy.experiments = [
    '找30个潜在用户，给他们看原型，记录他们的真实反应',
    '小范围上线，用数据看用户实际怎么用',
    '直接问价格：你觉得这个值多少钱？'
  ]

  guide.mvpDefinition.validationStrategy.successMetrics = [
    '至少30个真实用户试用过',
    '核心功能完成率 ≥ 70%',
    '至少10%的用户表示愿意付费或推荐'
  ]

  guide.mvpDefinition.validationStrategy.timeline = '4周内走完四步：先对齐方向 → 做出原型 → 找用户验证 → 收入信号成形'

  guide.mvpDefinition.actionItems = [
    '把功能清单砍到只剩"没有就完全不行"的那几个',
    '工具别乱买，GitHub + Notion + 一个分析工具就够了',
    '定好每周节奏，谁负责啥，周五下午一起看数据'
  ]

  // 使用AI生成的商业模式
  guide.businessExecution.businessModel.revenueStreams = [
    personalizedContent.revenueModel
  ]
  guide.businessExecution.businessModel.pricingStrategy = personalizedContent.pricingStrategy
  guide.businessExecution.businessModel.costStructure = [
    '开发成本（人力为主）',
    'AI API调用费用（按实际用量算）',
    '服务器和工具订阅（控制在每月1000以内）',
    '营销推广（早期靠口碑，省钱）'
  ]

  guide.businessExecution.businessModel.scalability = '代码要写得模块化，别到时候改一个功能牵一发动全身。文档和流程也要记录好，不能只有你一个人知道怎么搞。'

  // 使用AI生成的营销策略
  guide.businessExecution.launchStrategy.marketingChannels = personalizedContent.marketingStrategy.contentStrategy.concat(
    personalizedContent.marketingStrategy.communityStrategy.slice(0, 2)
  )

  guide.businessExecution.launchStrategy.budgetAllocation = [
    personalizedContent.customerAcquisition.budgetAllocation,
    '持续优化：根据数据反馈调整预算分配',
    '预留应急资金：应对突发情况和机会'
  ]

  // 添加冷启动策略
  guide.businessExecution.launchStrategy.coldStart = {
    strategy: personalizedContent.customerAcquisition.coldStartStrategy,
    targetCustomers: personalizedContent.customerAcquisition.targetCustomers,
    acquisitionChannels: personalizedContent.customerAcquisition.acquisitionChannels,
    viralMechanics: personalizedContent.marketingStrategy.viralMechanics,
    partnershipIdeas: personalizedContent.marketingStrategy.partnershipIdeas
  }

  // 添加早期里程碑目标
  guide.businessExecution.earlyMilestones = personalizedContent.earlyMilestones

  guide.businessExecution.operationalPlan.teamStructure = [
    '产品+技术小分队（2-3人就够）',
    '用户研究和运营（1人兼职也行）',
    '商务拓展（有资源就上，没有就先放放）'
  ]

  guide.businessExecution.operationalPlan.processes = [
    '每周一早上对齐本周目标',
    '每天花半小时看用户反馈',
    '每两周开个复盘会，聊聊数据和调整方向',
    '每月看一次大盘，确认还在正轨上'
  ]

  guide.businessExecution.operationalPlan.infrastructure = [
    '云服务器（Vercel免费版先用起来）',
    '数据看板（Google Analytics + 自建简单后台）',
    '客服工具（微信群 + 飞书多维表格）',
    '代码管理（GitHub私有仓库）'
  ]

  guide.businessExecution.operationalPlan.riskManagement = [
    '每个阶段设置明确的「继续/放弃」判断标准',
    '关键供应商（AI API）要有备选方案',
    '用户数据一定要合规，别因为这个翻车',
    '准备好应对突发情况的话术和方案'
  ]

  guide.businessExecution.actionItems = [
    '列出3种可能的赚钱方式，算算每种的可行性',
    '写一份运营手册，让新人能快速上手',
    '搭一个简单的数据监控，每天看核心指标'
  ]

  const metadata: BusinessPlanMetadata = {
    source: snapshot.source,
    winningBid: highestBid,
    winner: winnerName,
    supportedAgents: supporters,
    // 🆕 保留guide中已设置的metadata字段
    ideaTitle: guide.metadata.ideaTitle,
    generatedAt: guide.metadata.generatedAt,
    confidenceLevel: guide.metadata.confidenceLevel,
    implementationTimeframe: guide.metadata.implementationTimeframe,
    estimatedReadTime: guide.metadata.estimatedReadTime
  }

  return { guide, metadata }
}
