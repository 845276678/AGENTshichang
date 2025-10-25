import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth-helper'
import type { Idea, User } from '@/types/entities'
import type { CreateDiscussionInput } from '@/lib/validators'

export const dynamic = 'force-dynamic'


export async function POST(req: NextRequest) {
  try {
    const authResult = await getUserFromToken(req)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    const user = authResult.user

    const body = await req.json() as CreateDiscussionInput
    const { ideaId } = body

    if (!ideaId) {
      return NextResponse.json({ error: '创意ID不能为空' }, { status: 400 })
    }

    // 检查创意是否存在且属于用户
    const idea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        userId: user.id
      }
    })

    if (!idea) {
      return NextResponse.json({ error: '创意不存在或无权限' }, { status: 404 })
    }

    // 检查是否已存在进行中的讨论
    const existingDiscussion = await prisma.ideaDiscussion.findFirst({
      where: {
        ideaId,
        userId: user.id,
        status: 'ACTIVE'
      }
    })

    if (existingDiscussion) {
      return NextResponse.json({ error: '已存在进行中的讨论' }, { status: 400 })
    }

    // 智能专家匹配算法 - 基于创意内容和用户需求
    const selectedAgent = await selectOptimalAgent(idea, user.id)

    // 创建讨论会话
    const discussion = await prisma.ideaDiscussion.create({
      data: {
        ideaId,
        userId: user.id,
        aiAgentType: selectedAgent.type,
        aiAgentName: selectedAgent.name,
        status: 'ACTIVE',
        currentRound: 1,
        totalRounds: 3
      }
    })

    // 生成AI的初始分析消息
    const initialAnalysisContent = await generateInitialAnalysis(idea)

    await prisma.discussionMessage.create({
      data: {
        discussionId: discussion.id,
        content: initialAnalysisContent.content,
        messageType: 'INITIAL_ANALYSIS',
        roundNumber: 1,
        senderType: 'AI_AGENT',
        senderName: selectedAgent.name,
        analysisData: initialAnalysisContent.analysisData,
        suggestions: initialAnalysisContent.suggestions
      }
    })

    return NextResponse.json({
      success: true,
      discussion: {
        id: discussion.id,
        currentRound: discussion.currentRound,
        totalRounds: discussion.totalRounds,
        aiAgentName: discussion.aiAgentName,
        aiAgentType: discussion.aiAgentType
      }
    })

  } catch (error) {
    console.error('创建讨论失败:', error)
    return NextResponse.json({ error: '创建讨论失败' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await getUserFromToken(req)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    const user = authResult.user

    const { searchParams } = new URL(req.url)
    const ideaId = searchParams.get('ideaId')

    if (!ideaId) {
      return NextResponse.json({ error: '创意ID不能为空' }, { status: 400 })
    }

    // 获取讨论信息
    const discussion = await prisma.ideaDiscussion.findFirst({
      where: {
        ideaId,
        userId: user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        idea: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true
          }
        }
      }
    })

    if (!discussion) {
      return NextResponse.json({ error: '讨论不存在' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      discussion
    })

  } catch (error) {
    console.error('获取讨论失败:', error)
    return NextResponse.json({ error: '获取讨论失败' }, { status: 500 })
  }
}

// AI专家定义
interface AIAgent {
  type: string
  name: string
  expertise: string[]
  personality: string
  focus: string[]
  categories: string[]
  score: number
}

// 初始分析结果
interface InitialAnalysis {
  content: string
  analysisData: Record<string, unknown>
  suggestions: string[]
}

// 智能专家匹配算法
async function selectOptimalAgent(idea: Idea, userId: string): Promise<{ type: string; name: string }> {
  // 5个核心AI专家定义
  const agents: AIAgent[] = [
    {
      type: 'tech',
      name: '科技艾克斯',
      expertise: ['技术', '开发', '算法', '架构', '系统', '创新', '编程', '软件', '硬件', '人工智能'],
      personality: 'analytical',
      focus: ['可行性', '技术难度', '创新程度', '实现路径'],
      categories: ['TECH'],
      score: 0
    },
    {
      type: 'business',
      name: '商人老王',
      expertise: ['商业', '盈利', '市场', '投资', '管理', '策略', '营销', '成本', '收入', '竞争'],
      personality: 'pragmatic',
      focus: ['商业价值', '盈利模式', '市场规模', 'ROI分析'],
      categories: ['BUSINESS', 'FINANCE', 'RETAIL'],
      score: 0
    },
    {
      type: 'artistic',
      name: '文艺小琳',
      expertise: ['设计', '美学', '创意', '艺术', '情感', '体验', '品牌', '文化', '视觉', '故事'],
      personality: 'creative',
      focus: ['用户体验', '情感价值', '美学设计', '品牌故事'],
      categories: ['LIFESTYLE'],
      score: 0
    },
    {
      type: 'trend',
      name: '趋势阿伦',
      expertise: ['趋势', '营销', '传播', '社交', '媒体', '推广', '流行', '话题', '影响力', '病毒式'],
      personality: 'dynamic',
      focus: ['市场趋势', '传播潜力', '营销策略', '社交影响'],
      categories: ['ENTERTAINMENT'],
      score: 0
    },
    {
      type: 'academic',
      name: '教授李博',
      expertise: ['研究', '理论', '学术', '分析', '框架', '方法', '科学', '教育', '知识', '体系'],
      personality: 'systematic',
      focus: ['理论基础', '研究方法', '学术价值', '知识体系'],
      categories: ['EDUCATION', 'HEALTH', 'OTHER'],
      score: 0
    }
  ]

  // 1. 基于分类的基础匹配 (30%)
  for (const agent of agents) {
    if (agent.categories.includes(idea.category)) {
      agent.score += 30
    }
  }

  // 2. 基于内容关键词匹配 (40%)
  const ideaContent = `${idea.title} ${idea.description}`.toLowerCase()
  for (const agent of agents) {
    let keywordMatches = 0
    for (const keyword of agent.expertise) {
      if (ideaContent.includes(keyword)) {
        keywordMatches++
      }
    }
    // 关键词匹配率转换为分数
    const keywordScore = Math.min(40, (keywordMatches / agent.expertise.length) * 40)
    agent.score += keywordScore
  }

  // 3. 基于用户历史偏好 (20%)
  try {
    const userHistory = await getUserDiscussionHistory(userId)
    for (const agent of agents) {
      const historyScore = calculateHistoryPreference(userHistory, agent.type)
      agent.score += historyScore * 0.2 // 最大20分
    }
  } catch (error) {
    console.log('获取用户历史失败，跳过历史匹配:', error)
  }

  // 4. 基于创意复杂度匹配 (10%)
  const complexityScore = analyzeIdeaComplexity(idea)
  for (const agent of agents) {
    if (agent.type === 'tech' && complexityScore.technical > 7) {
      agent.score += 10
    } else if (agent.type === 'business' && complexityScore.commercial > 7) {
      agent.score += 10
    } else if (agent.type === 'academic' && complexityScore.theoretical > 7) {
      agent.score += 10
    }
  }

  // 找到得分最高的专家
  const bestAgent = agents.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  )

  // 记录匹配结果用于优化
  await logAgentSelection(idea.id, userId, agents, bestAgent.type)

  console.log(`智能匹配结果: ${bestAgent.name} (${bestAgent.type}) - 得分: ${bestAgent.score}`)

  return {
    type: bestAgent.type,
    name: bestAgent.name
  }
}

// 获取用户讨论历史
async function getUserDiscussionHistory(userId: string) {
  const discussions = await prisma.ideaDiscussion.findMany({
    where: {
      userId,
      status: 'COMPLETED'
    },
    include: {
      messages: {
        where: {
          senderType: 'USER'
        }
      }
    },
    orderBy: {
      completedAt: 'desc'
    },
    take: 10 // 最近10次讨论
  })

  return discussions
}

// 计算用户对特定专家类型的偏好
function calculateHistoryPreference(history: Array<{ aiAgentType: string; messages: unknown[] }>, agentType: string): number {
  if (history.length === 0) return 0

  const sameTypeDiscussions = history.filter(d => d.aiAgentType === agentType)
  const preference = sameTypeDiscussions.length / history.length

  // 转换为0-100分数
  return preference * 100
}

// 分析创意复杂度
function analyzeIdeaComplexity(idea: Pick<Idea, 'title' | 'description'>): { technical: number; commercial: number; theoretical: number } {
  const content = `${idea.title} ${idea.description}`.toLowerCase()

  // 技术复杂度指标
  const techKeywords = ['AI', '算法', '机器学习', '区块链', '云计算', '大数据', '物联网', '系统', '平台', '架构']
  const technicalComplexity = techKeywords.filter(keyword =>
    content.includes(keyword.toLowerCase())
  ).length

  // 商业复杂度指标
  const businessKeywords = ['盈利', '商业模式', '投资', '融资', '市场', '竞争', '营销', '销售', '渠道', '合作']
  const commercialComplexity = businessKeywords.filter(keyword =>
    content.includes(keyword)
  ).length

  // 理论复杂度指标
  const theoryKeywords = ['研究', '理论', '框架', '模型', '方法论', '分析', '验证', '实验', '数据', '学术']
  const theoreticalComplexity = theoryKeywords.filter(keyword =>
    content.includes(keyword)
  ).length

  return {
    technical: Math.min(10, technicalComplexity),
    commercial: Math.min(10, commercialComplexity),
    theoretical: Math.min(10, theoreticalComplexity)
  }
}

// 记录专家选择结果用于算法优化
async function logAgentSelection(
  ideaId: string,
  userId: string,
  allAgents: AIAgent[],
  selectedType: string
): Promise<void> {
  try {
    // 这里可以记录到数据库或日志系统，用于后续算法优化
    console.log('专家匹配记录:', {
      ideaId,
      userId,
      selectedAgent: selectedType,
      allScores: allAgents.map((a: AIAgent) => ({ type: a.type, score: a.score })),
      timestamp: new Date().toISOString()
    })

    // 可以扩展为保存到数据库用于后续分析
    // await prisma.agentSelectionLog.create({
    //   data: {
    //     ideaId,
    //     userId,
    //     selectedAgent: selectedType,
    //     matchingScores: allAgents,
    //     createdAt: new Date()
    //   }
    // })
  } catch (error) {
    console.warn('记录专家选择失败:', error)
  }
}

// AI初始分析生成函数
async function generateInitialAnalysis(idea: Pick<Idea, 'title' | 'category'>): Promise<InitialAnalysis> {
  // 这里可以调用实际的AI服务，暂时用模拟数据
  const analysisTemplates = {
    'TECH': {
      content: `👋 你好！我是科技艾克斯，技术创新专家，很高兴分析你的技术创意「${idea.title}」。

🔍 **技术创新分析：**
我注意到你的创意涉及${idea.category}领域，这是一个很有前景的技术方向。基于你的描述，我看到以下技术要点：

• **技术前沿性：** 评估技术的创新程度和领先性
• **实现难度：** 分析技术实现的复杂度和可行性
• **技术价值：** 判断技术突破的价值和影响力

💡 **我想深入了解：**
1. 这个技术方案的核心创新点是什么？
2. 你有考虑过技术实现的具体路径吗？
3. 相比现有解决方案，你的技术优势在哪里？

请详细回答这些问题，让我为你提供更精准的技术创新建议！`,
      analysisData: {
        technicalInnovation: 85,
        implementationDifficulty: 70,
        technologyValue: 80,
        marketImpact: 75
      },
      suggestions: [
        '建议关注技术的前沿性和差异化',
        '可以考虑申请相关技术专利',
        '建议与高校或研究机构合作'
      ]
    },
    'BUSINESS': {
      content: `👋 你好！我是商人老王，商业价值专家，很高兴分析你的创意「${idea.title}」的赚钱潜力！

💰 **商业价值分析：**
• **盈利模式：** 这个创意有多种变现途径，商业价值很高
• **ROI预估：** 根据市场规模，投资回报率很有潜力
• **风险评估：** 需要重点关注市场接受度和竞争风险

🎯 **关键商业问题：**
1. 你的目标市场规模有多大？愿意为此付费的用户有多少？
2. 你的商业模式是什么？如何实现持续盈利？
3. 你的启动资金预算是多少？多久能收回成本？

我需要了解这些信息来为你制定赚钱的商业策略！💸`,
      analysisData: {
        profitPotential: 90,
        marketSize: 80,
        riskLevel: 65,
        roiExpectation: 85
      },
      suggestions: [
        '建议先做市场调研验证付费意愿',
        '可以考虑多元化收入模式',
        '建议制定详细的财务预测'
      ]
    },
    'LIFESTYLE': {
      content: `👋 你好！我是文艺小琳，情感创意专家，很高兴分析你的创意「${idea.title}」的美学价值！

🎨 **情感美学分析：**
• **情感共鸣：** 这个创意能触动人心，有很好的情感价值
• **美学设计：** 可以包装成很有温度和美感的产品
• **艺术价值：** 有潜力成为打动人心的艺术作品

💕 **情感设计问题：**
1. 你希望用户在使用时有什么样的情感体验？
2. 这个创意背后有什么感人的故事吗？
3. 你想要传达什么样的美学理念或价值观？

让我为你的创意注入诗意和温度，打造一个有灵魂的作品！✨`,
      analysisData: {
        emotionalResonance: 88,
        aestheticValue: 85,
        storyTelling: 80,
        artisticPotential: 75
      },
      suggestions: [
        '建议从用户情感需求出发设计',
        '可以考虑打造品牌故事和理念',
        '重点关注美学设计和情感体验'
      ]
    },
    'ENTERTAINMENT': {
      content: `👋 你好！我是趋势阿伦，市场敏感专家，你的创意「${idea.title}」很有爆火潜力！

🔥 **趋势分析：**
• **热点契合度：** 这个创意正好踩在了当前的热点趋势上
• **传播潜力：** 有很强的社交媒体传播和话题制造能力
• **爆款特征：** 具备成为现象级产品的多个要素

📱 **传播策略问题：**
1. 你觉得这个创意最吸引人的卖点是什么？
2. 你的目标用户主要在哪些平台活跃？
3. 有什么独特的营销角度可以制造话题？

让我帮你抓住风口，把你的创意打造成爆款产品！🚀`,
      analysisData: {
        trendAlignment: 92,
        viralPotential: 88,
        socialMediaFit: 85,
        marketTiming: 80
      },
      suggestions: [
        '建议抓住当前热点趋势快速行动',
        '可以考虑与网红或KOL合作推广',
        '重点设计话题性和传播点'
      ]
    },
    'EDUCATION': {
      content: `👋 你好！我是教授李博，学术理论专家，很高兴分析你的创意「${idea.title}」的理论价值！

📚 **学术价值分析：**
• **理论基础：** 这个创意有坚实的理论支撑和学术价值
• **创新程度：** 在理论层面具有一定的突破和贡献
• **研究价值：** 值得深入研究和理论完善

🎓 **学术研究问题：**
1. 这个创意的理论基础是什么？有哪些相关研究？
2. 你认为它在理论上有什么创新或突破？
3. 希望通过这个研究达成什么学术目标？

让我们为你的创意构建严谨的理论体系！📖`,
      analysisData: {
        theoreticalValue: 85,
        academicInnovation: 78,
        researchPotential: 90,
        knowledgeContribution: 82
      },
      suggestions: [
        '建议梳理相关理论文献',
        '可以考虑发表学术论文',
        '重点构建完整的理论框架'
      ]
    }
  }

  const template = analysisTemplates[idea.category as keyof typeof analysisTemplates] || {
    content: `👋 你好！我是DataWiz，数据科学家，很高兴分析你的创意「${idea.title}」。

这是一个很有趣的想法！让我们一起深入探讨一下：

**我想了解的问题：**
1. 这个创意的具体应用场景是什么？
2. 你觉得最大的挑战在哪里？
3. 你希望通过这个创意达成什么目标？

请详细分享你的想法，我会为你提供专业的建议！`,
    analysisData: {
      creativityScore: 75,
      feasibilityScore: 70,
      marketPotential: 65
    },
    suggestions: [
      '建议明确目标用户群体',
      '可以考虑分阶段实现',
      '建议做竞品调研分析'
    ]
  }

  return template
}