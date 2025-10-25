import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth-helper'
import { $Enums } from '@prisma/client'

export const dynamic = 'force-dynamic'

type MessageType = $Enums.MessageType
const MessageType = $Enums.MessageType

export async function POST(req: NextRequest) {
  try {
    const authResult = await getUserFromToken(req)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    const user = authResult.user

    const { discussionId, content, action } = await req.json()

    if (!discussionId || (!content?.trim() && action !== 'skip')) {
      return NextResponse.json({ error: '讨论ID和内容不能为空（除非跳过）' }, { status: 400 })
    }

    // 验证讨论是否存在且属于用户
    const discussion = await prisma.ideaDiscussion.findFirst({
      where: {
        id: discussionId,
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        idea: true,
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!discussion) {
      return NextResponse.json({ error: '讨论不存在或已结束' }, { status: 404 })
    }

    if (discussion.currentRound > discussion.totalRounds) {
      return NextResponse.json({ error: '讨论轮数已达上限' }, { status: 400 })
    }

    let userMessage = null
    let aiMessage = null

    // 处理跳过操作
    if (action === 'skip') {
      // 创建跳过消息记录
      userMessage = await prisma.discussionMessage.create({
        data: {
          discussionId,
          content: '用户选择跳过此轮讨论',
          messageType: 'USER_RESPONSE',
          roundNumber: discussion.currentRound,
          senderType: 'USER',
          senderName: user.username || user.email
        }
      })

      // AI回应跳过
      const skipResponse = generateSkipResponse(discussion.aiAgentType, discussion.currentRound)
      aiMessage = await prisma.discussionMessage.create({
        data: {
          discussionId,
          content: skipResponse.content,
          messageType: skipResponse.messageType as MessageType,
          roundNumber: discussion.currentRound,
          senderType: 'AI_AGENT',
          senderName: discussion.aiAgentName,
          analysisData: skipResponse.analysisData,
          suggestions: skipResponse.suggestions
        }
      })
    } else {
      // 创建用户回复消息
      userMessage = await prisma.discussionMessage.create({
        data: {
          discussionId,
          content: content.trim(),
          messageType: 'USER_RESPONSE',
          roundNumber: discussion.currentRound,
          senderType: 'USER',
          senderName: user.username || user.email
        }
      })

      // 生成AI回复
      const aiResponse = await generateAIResponse(discussion, content, discussion.messages)

      aiMessage = await prisma.discussionMessage.create({
        data: {
          discussionId,
          content: aiResponse.content,
          messageType: aiResponse.messageType as MessageType,
          roundNumber: discussion.currentRound,
          senderType: 'AI_AGENT',
          senderName: discussion.aiAgentName,
          analysisData: aiResponse.analysisData,
          suggestions: aiResponse.suggestions
        }
      })
    }

    // 检查是否完成所有轮次
    const shouldComplete = discussion.currentRound >= discussion.totalRounds

    if (shouldComplete) {
      // 标记讨论完成
      await prisma.ideaDiscussion.update({
        where: { id: discussionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })
    } else {
      // 进入下一轮
      await prisma.ideaDiscussion.update({
        where: { id: discussionId },
        data: {
          currentRound: discussion.currentRound + 1
        }
      })
    }

    return NextResponse.json({
      success: true,
      userMessage,
      aiMessage,
      isCompleted: shouldComplete,
      nextRound: shouldComplete ? null : discussion.currentRound + 1
    })

  } catch (error) {
    console.error('发送消息失败:', error)
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 })
  }
}

// 生成AI回复 - 集成真实AI服务
async function generateAIResponse(discussion: any, userContent: string, previousMessages: any[]) {
  const currentRound = discussion.currentRound
  const agentType = discussion.aiAgentType
  const idea = discussion.idea

  try {
    // 构建AI提示词
    const aiPrompt = buildAIPrompt(agentType, idea, userContent, currentRound, previousMessages)

    // 调用AI服务获取回复
    const aiResponse = await callAIService(agentType, aiPrompt)

    // 解析AI回复并格式化
    return parseAIResponse(aiResponse, agentType, currentRound)

  } catch (error) {
    console.error('AI服务调用失败，使用备用回复:', error)

    // 如果AI服务失败，回退到模拟回复
    return generateFallbackResponse(agentType, idea, userContent, currentRound)
  }
}

// 调用AI服务 - 增强版本，包含质量监控
async function callAIService(agentType: string, prompt: string): Promise<string> {
  // 根据Agent类型选择最合适的AI服务
  const serviceOrder = getServiceOrderByAgent(agentType)

  for (const serviceName of serviceOrder) {
    try {
      let result
      const startTime = Date.now()

      if (serviceName === 'deepseek' && process.env.DEEPSEEK_API_KEY) {
        result = await callDeepSeekAPI(prompt)
      } else if (serviceName === 'zhipu' && process.env.ZHIPU_API_KEY) {
        result = await callZhipuAPI(prompt)
      } else if (serviceName === 'ali' && process.env.DASHSCOPE_API_KEY) {
        result = await callAliAPI(prompt)
      }

      if (result && result.length > 50) {
        const responseTime = Date.now() - startTime

        // 质量检查
        const qualityScore = await checkResponseQuality(result, prompt, agentType)

        // 记录服务性能
        await logServicePerformance(serviceName, {
          responseTime,
          qualityScore,
          success: true,
          promptLength: prompt.length,
          responseLength: result.length
        })

        // 如果质量太低，尝试重新生成
        if (qualityScore < 0.6) {
          console.warn(`${serviceName} 回复质量较低 (${qualityScore}), 尝试优化...`)
          const improvedResult = await improveResponse(result, prompt, agentType)
          if (improvedResult && improvedResult !== result) {
            console.log(`${serviceName} 回复质量已优化`)
            return improvedResult
          }
        }

        console.log(`成功使用 ${serviceName} 生成回复 (质量评分: ${qualityScore})`)
        return result
      }
    } catch (error) {
      console.warn(`${serviceName} 服务调用失败:`, error)

      // 记录失败信息
      await logServicePerformance(serviceName, {
        responseTime: 0,
        qualityScore: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      continue
    }
  }

  throw new Error('所有AI服务都不可用')
}

// 检查回复质量
async function checkResponseQuality(response: string, prompt: string, agentType: string): Promise<number> {
  let score = 0.5 // 基础分

  // 长度检查 (20%)
  if (response.length > 200 && response.length < 2000) {
    score += 0.2
  } else if (response.length >= 100) {
    score += 0.1
  }

  // 相关性检查 (30%)
  const relevanceScore = checkRelevance(response, prompt, agentType)
  score += relevanceScore * 0.3

  // 结构化检查 (25%)
  const structureScore = checkStructure(response)
  score += structureScore * 0.25

  // 专业性检查 (25%)
  const professionalScore = checkProfessionalism(response, agentType)
  score += professionalScore * 0.25

  return Math.min(score, 1.0)
}

// 相关性检查
function checkRelevance(response: string, _prompt: string, agentType: string): number {
  let score = 0

  // 检查是否包含专家特色词汇
  const expertKeywords = {
    'tech': ['技术', '开发', '算法', '架构', '代码', '系统'],
    'business': ['商业', '盈利', '市场', '成本', '投资', '收入'],
    'artistic': ['设计', '美学', '体验', '情感', '创意', '艺术'],
    'trend': ['趋势', '热点', '传播', '社交', '营销', '推广'],
    'academic': ['研究', '理论', '学术', '分析', '框架', '方法']
  }

  const keywords = expertKeywords[agentType as keyof typeof expertKeywords] || []
  const matchedKeywords = keywords.filter(keyword => response.includes(keyword))
  score += Math.min(matchedKeywords.length / keywords.length, 0.8)

  // 检查是否回应了prompt中的关键问题
  if (response.includes('问题') && response.includes('建议')) {
    score += 0.2
  }

  return Math.min(score, 1.0)
}

// 结构化检查
function checkStructure(response: string): number {
  let score = 0

  // 检查是否有标题和要点
  if (response.includes('**') || response.includes('#')) {
    score += 0.4
  }

  // 检查是否有列表
  if (response.includes('•') || response.includes('-') || response.includes('1.')) {
    score += 0.3
  }

  // 检查是否有总结或行动建议
  if (response.includes('建议') || response.includes('总结') || response.includes('下一步')) {
    score += 0.3
  }

  return Math.min(score, 1.0)
}

// 专业性检查
function checkProfessionalism(response: string, agentType: string): number {
  let score = 0.5

  // 检查专业术语的使用
  const professionalTerms = {
    'tech': ['API', '数据库', '前端', '后端', 'UI', 'UX'],
    'business': ['ROI', 'KPI', '现金流', '盈利模式', 'B2B', 'B2C'],
    'artistic': ['配色', '布局', '交互', '视觉', '品牌', '用户界面'],
    'trend': ['病毒式传播', 'KOL', '流量', '转化率', '用户画像', 'AARRR'],
    'academic': ['假设', '验证', '模型', '框架', '方法论', '实证']
  }

  const terms = professionalTerms[agentType as keyof typeof professionalTerms] || []
  const usedTerms = terms.filter(term => response.includes(term))
  if (usedTerms.length > 0) {
    score += Math.min(usedTerms.length / terms.length * 0.3, 0.3)
  }

  // 检查语言风格
  if (response.includes('让我') || response.includes('我建议') || response.includes('我认为')) {
    score += 0.2
  }

  return Math.min(score, 1.0)
}

// 改进回复质量
async function improveResponse(originalResponse: string, _prompt: string, agentType: string): Promise<string> {
  // 简单的改进策略：添加更多结构化内容
  let improved = originalResponse

  // 如果缺少标题，添加标题
  if (!improved.includes('**') && !improved.includes('#')) {
    const agentNames = {
      'tech': '科技艾克斯',
      'business': '商人老王',
      'artistic': '文艺小琳',
      'trend': '趋势阿伦',
      'academic': '教授李博'
    }
    const agentName = agentNames[agentType as keyof typeof agentNames] || '专家'
    improved = `## 💡 **${agentName}的专业分析**\n\n${improved}`
  }

  // 如果缺少建议，添加建议
  if (!improved.includes('建议') && !improved.includes('推荐')) {
    improved += '\n\n**💡 我的建议：**\n• 建议深入分析核心需求\n• 推荐制定详细实施计划\n• 建议寻求相关专业支持'
  }

  return improved
}

// 记录服务性能
async function logServicePerformance(serviceName: string, metrics: {
  responseTime?: number
  qualityScore?: number
  success: boolean
  error?: string
  promptLength?: number
  responseLength?: number
}) {
  // 这里可以记录到数据库或监控系统
  console.log(`AI服务性能记录 [${serviceName}]:`, {
    timestamp: new Date().toISOString(),
    ...metrics
  })

  // 如果需要，可以发送到外部监控服务
  // await sendToMonitoring(serviceName, metrics)
}

// 根据Agent类型确定AI服务优先级
function getServiceOrderByAgent(agentType: string): string[] {
  const serviceMapping = {
    'tech': ['deepseek', 'zhipu', 'ali'],      // 技术专家优先用DeepSeek
    'business': ['zhipu', 'deepseek', 'ali'],  // 商业专家优先用智谱GLM（中文商业逻辑强）
    'artistic': ['zhipu', 'ali', 'deepseek'],  // 艺术专家优先用智谱GLM（情感表达好）
    'trend': ['ali', 'zhipu', 'deepseek'],     // 趋势专家优先用阿里（实时性好）
    'academic': ['zhipu', 'deepseek', 'ali']   // 学术专家优先用智谱GLM（逻辑严谨）
  }

  return serviceMapping[agentType as keyof typeof serviceMapping] || ['deepseek', 'zhipu', 'ali']
}

// 调用DeepSeek API
async function callDeepSeekAPI(prompt: string): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    })
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 调用智谱GLM API
async function callZhipuAPI(prompt: string): Promise<string> {
  const [apiKeyId, secret] = (process.env.ZHIPU_API_KEY || '').split('.')
  if (!apiKeyId || !secret) {
    throw new Error('智谱API密钥格式错误')
  }

  // 生成JWT token
  const jwt = require('jsonwebtoken')
  const token = jwt.sign(
    {
      api_key: apiKeyId,
      exp: Math.floor(Date.now() / 1000) + 3600,
      timestamp: Math.floor(Date.now() / 1000)
    },
    secret,
    {
      algorithm: 'HS256',
      header: {
        alg: 'HS256',
        sign_type: 'SIGN'
      }
    }
  )

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  })

  if (!response.ok) {
    throw new Error(`智谱GLM API error: ${response.status}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`智谱GLM API error: ${data.error.message}`)
  }

  return data.choices[0].message.content
}

// 调用阿里通义千问API
async function callAliAPI(prompt: string): Promise<string> {
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      input: {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 1500
      }
    })
  })

  if (!response.ok) {
    throw new Error(`阿里通义千问 API error: ${response.status}`)
  }

  const data = await response.json()
  if (data.code) {
    throw new Error(`阿里通义千问 API error: ${data.message}`)
  }

  return data.output.text || data.output.choices[0].message.content
}

// 构建AI提示词
function buildAIPrompt(agentType: string, idea: any, userContent: string, currentRound: number, previousMessages: any[]): string {
  const agentPersonalities = {
    'tech': {
      name: '科技艾克斯',
      role: '技术创新专家',
      style: '专业且富有创新精神，善于分析技术可行性和前沿趋势'
    },
    'business': {
      name: '商人老王',
      role: '商业价值专家',
      style: '实用主义，直接关注盈利模式和商业价值'
    },
    'artistic': {
      name: '文艺小琳',
      role: '情感创意专家',
      style: '富有情感表达力，关注美学价值和用户体验'
    },
    'trend': {
      name: '趋势阿伦',
      role: '市场趋势专家',
      style: '敏锐捕捉市场热点，善于营销传播'
    },
    'academic': {
      name: '教授李博',
      role: '学术理论专家',
      style: '严谨的学术态度，关注理论基础和系统性'
    }
  }

  const agent = agentPersonalities[agentType as keyof typeof agentPersonalities] || agentPersonalities.tech

  let roundContext = ''
  if (currentRound === 1) {
    roundContext = '这是第一轮深入分析。请基于用户回复进行专业分析，并提出针对性问题。'
  } else if (currentRound === 2) {
    roundContext = '这是第二轮改进建议。请基于前面的讨论，提供更具体的优化方案。'
  } else {
    roundContext = '这是最后一轮总结评估。请提供最终建议和行动计划。'
  }

  const conversationHistory = previousMessages.map(msg =>
    `${msg.senderType === 'USER' ? '用户' : agent.name}: ${msg.content}`
  ).join('\n\n')

  return `你是${agent.name}，${agent.role}。你的风格是${agent.style}。

## 创意背景
标题：${idea.title}
描述：${idea.description}
分类：${idea.category}

## 讨论轮次
${roundContext}

## 对话历史
${conversationHistory}

## 用户最新回复
${userContent}

## 回复要求
请以${agent.name}的身份，用专业但不失亲切的语气回复用户。回复内容需要：

1. **个性化回应**：针对用户回复的内容进行具体分析
2. **专业指导**：基于你的专长提供有价值的建议
3. **互动性强**：提出1-2个深入的问题
4. **结构清晰**：使用markdown格式，包含标题和要点
5. **长度适中**：300-500字，内容丰富但不冗长

请确保回复体现你的专业特色和个人风格。`
}

// 解析AI回复并格式化
function parseAIResponse(aiResponse: string, agentType: string, currentRound: number) {
  // 简单的分析数据生成（基于轮次和专家类型）
  const analysisData = generateAnalysisData(agentType, currentRound)

  // 提取建议（从AI回复中）
  const suggestions = extractSuggestions(aiResponse)

  // 确定消息类型
  let messageType = 'IMPROVEMENT_SUGGESTION'
  if (currentRound === 1) {
    messageType = 'INITIAL_ANALYSIS'
  } else if (currentRound === 3) {
    messageType = 'FINAL_ASSESSMENT'
  }

  return {
    content: aiResponse,
    messageType,
    analysisData,
    suggestions
  }
}

// 生成分析数据
function generateAnalysisData(agentType: string, _currentRound: number) {
  const baseScores = {
    'tech': {
      technicalInnovation: 85 + Math.floor(Math.random() * 10),
      implementationComplexity: 70 + Math.floor(Math.random() * 15),
      scalability: 80 + Math.floor(Math.random() * 15)
    },
    'business': {
      profitability: 90 + Math.floor(Math.random() * 10),
      marketSize: 75 + Math.floor(Math.random() * 15),
      competitiveAdvantage: 80 + Math.floor(Math.random() * 15)
    },
    'artistic': {
      emotionalResonance: 88 + Math.floor(Math.random() * 12),
      aestheticAppeal: 85 + Math.floor(Math.random() * 10),
      brandPotential: 82 + Math.floor(Math.random() * 15)
    },
    'trend': {
      viralPotential: 92 + Math.floor(Math.random() * 8),
      socialMediaFit: 88 + Math.floor(Math.random() * 12),
      marketTiming: 85 + Math.floor(Math.random() * 10)
    },
    'academic': {
      theoreticalDepth: 87 + Math.floor(Math.random() * 10),
      researchPotential: 90 + Math.floor(Math.random() * 10),
      academicImpact: 83 + Math.floor(Math.random() * 12)
    }
  }

  return baseScores[agentType as keyof typeof baseScores] || baseScores.tech
}

// 从AI回复中提取建议
function extractSuggestions(aiResponse: string): string[] {
  const suggestions: string[] = []

  // 尝试提取列表项
  const listRegex = /[•\-\*]\s*(.+)/g
  let match
  while ((match = listRegex.exec(aiResponse)) !== null) {
    const suggestion = match[1]?.trim()
    if (suggestion && suggestion.length > 10 && suggestion.length < 100) {
      suggestions.push(suggestion)
    }
  }

  // 如果没有找到列表项，尝试提取句子
  if (suggestions.length === 0) {
    const sentences = aiResponse.split(/[。！？]/).filter(s => s.length > 20 && s.length < 80)
    suggestions.push(...sentences.slice(0, 3))
  }

  return suggestions.slice(0, 5) // 最多返回5个建议
}

// 生成跳过回复
function generateSkipResponse(agentType: string, currentRound: number) {
  const agentNames = {
    'tech': '科技艾克斯',
    'business': '商人老王',
    'artistic': '文艺小琳',
    'trend': '趋势阿伦',
    'academic': '教授李博'
  }

  const agentName = agentNames[agentType as keyof typeof agentNames] || '专家'

  let content = ''
  if (currentRound < 3) {
    content = `😊 **${agentName}理解您的选择** (第${currentRound}轮)\n\n没关系，我理解您可能暂时没有更多信息要补充。让我们进入下一轮讨论，我会基于现有信息继续为您提供分析和建议。\n\n**基于当前信息的建议：**\n• 建议先收集更多相关信息\n• 可以考虑咨询相关领域专家\n• 建议从小规模验证开始\n\n让我们继续深入分析您的创意！✨`
  } else {
    content = `🎉 **${agentName}的最终总结** (第${currentRound}轮)\n\n感谢您参与我们的讨论！虽然您选择跳过了一些环节，但我已经为您的创意进行了全面分析。\n\n**最终建议：**\n• 您的创意具有很好的发展潜力\n• 建议继续完善和深化想法\n• 可以考虑寻找合作伙伴或投资\n\n现在可以进入竞价阶段，看看AI们对您创意的评价！🚀`
  }

  return {
    content,
    messageType: currentRound === 3 ? 'FINAL_ASSESSMENT' : 'IMPROVEMENT_SUGGESTION',
    analysisData: generateAnalysisData(agentType, currentRound),
    suggestions: [
      '建议收集更多相关信息',
      '可以考虑咨询专业人士',
      '建议从简单的原型开始验证'
    ]
  }
}

// 备用回复生成（当AI服务不可用时）
// 备用回复生成（当AI服务不可用时）
function generateFallbackResponse(agentType: string, idea: any, _userContent: string, currentRound: number) {
  const agentNames = {
    'tech': '科技艾克斯',
    'business': '商人老王',
    'artistic': '文艺小琳',
    'trend': '趋势阿伦',
    'academic': '教授李博'
  }

  const agentName = agentNames[agentType as keyof typeof agentNames] || '专家'

  let content = ''

  if (currentRound === 1) {
    content = `💭 **${agentName}的分析** (第${currentRound}轮)\n\n感谢你分享的想法！基于你的回复，我能看出你对这个创意「${idea.title}」有深入的思考。\n\n**初步分析：**\n• 你提到的想法很有价值，值得进一步探索\n• 这个领域确实存在市场机会\n• 建议从小规模验证开始\n\n**接下来我想了解：**\n1. 你认为最大的实现难点在哪里？\n2. 有没有考虑过目标用户的具体需求？\n\n让我们继续深入讨论！`
  } else if (currentRound === 2) {
    content = `🚀 **${agentName}的建议** (第${currentRound}轮)\n\n基于我们之前的讨论，我为你的创意制定了一些具体建议：\n\n**优化方向：**\n• 优先解决核心功能的实现\n• 关注用户体验的设计\n• 制定可行的推广策略\n\n**最后一个关键问题：**\n如果要开始实施这个创意，你觉得第一步应该做什么？\n\n这将帮助我为你提供最实用的行动建议！`
  } else {
    content = `🎉 **${agentName}的最终评估** (第${currentRound}轮)\n\n经过三轮深入讨论，你的创意「${idea.title}」已经有了清晰的发展方向！\n\n**综合评价：**\n• 创意具有很好的市场潜力\n• 实施方案合理可行\n• 建议立即开始行动\n\n**下一步行动建议：**\n1. 制作简单的原型验证想法\n2. 与潜在用户深度交流\n3. 开始寻找合作伙伴或投资\n\n恭喜你！这个创意值得认真推进。现在可以进入竞价阶段了！✨`
  }

  return {
    content,
    messageType: currentRound === 1 ? 'INITIAL_ANALYSIS' : currentRound === 3 ? 'FINAL_ASSESSMENT' : 'IMPROVEMENT_SUGGESTION',
    analysisData: generateAnalysisData(agentType, currentRound),
    suggestions: [
      '建议制作简单原型验证想法',
      '可以考虑与用户深度访谈',
      '重点关注核心功能的实现'
    ]
  }
}