import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/auth'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

interface AgentReplyRequest {
  biddingId: string
  sessionId: string
  agentId: string
  userReply: string
  conversationHistory: Array<{
    role: 'agent' | 'user'
    content: string
    timestamp: string
  }>
  originalIdea: string
  currentScore?: number
}

interface AgentReplyResponse {
  success: boolean
  data?: {
    agentResponse: string
    updatedScore: number
    scoreChange: number
    resolvedChallenges: string[]
    newChallenges: string[]
    emotion: 'neutral' | 'excited' | 'confident' | 'worried' | 'aggressive'
  }
  error?: string
}

/**
 * Agent对话回复API
 *
 * 功能：允许用户针对特定Agent的质疑进行回复，Agent基于回复重新评估
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AgentReplyRequest

    // 验证必要参数
    if (!body.agentId || !body.userReply?.trim() || !body.originalIdea) {
      return NextResponse.json({
        success: false,
        error: "缺少必要参数"
      } as AgentReplyResponse, { status: 400 })
    }

    console.log('🤖 Agent对话请求:', {
      agentId: body.agentId,
      userReplyLength: body.userReply.length,
      conversationRound: body.conversationHistory.length + 1
    })

    // 构建对话Prompt
    const prompt = buildConversationPrompt(body)

    // 根据agentId选择对应的AI模型
    const aiClient = getAIClient(body.agentId)
    const modelName = getModelName(body.agentId)

    if (!aiClient) {
      return NextResponse.json({
        success: false,
        error: `Agent ${body.agentId} 对应的AI服务未配置`
      } as AgentReplyResponse, { status: 500 })
    }

    // 调用AI模型
    const response = await aiClient.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: getAgentSystemPrompt(body.agentId)
        },
        // 添加对话历史
        ...body.conversationHistory.map(msg => ({
          role: msg.role === 'agent' ? 'assistant' as const : 'user' as const,
          content: msg.content
        })),
        // 用户最新回复
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const agentResponseContent = response.choices[0]?.message?.content || ''

    // 解析Agent回复（尝试JSON格式）
    let parsedResponse
    try {
      // 尝试提取JSON
      const jsonMatch = agentResponseContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        // 如果没有JSON，使用纯文本回复
        parsedResponse = {
          response: agentResponseContent,
          resolvedChallenges: [],
          newChallenges: [],
          updatedScore: body.currentScore || 70,
          scoreReason: '基于用户回复进行评估',
          emotion: 'neutral'
        }
      }
    } catch (parseError) {
      console.warn('⚠️ 无法解析JSON，使用纯文本回复')
      parsedResponse = {
        response: agentResponseContent,
        resolvedChallenges: [],
        newChallenges: [],
        updatedScore: body.currentScore || 70,
        scoreReason: '基于用户回复进行评估',
        emotion: 'neutral'
      }
    }

    // 计算评分变化
    const previousScore = body.currentScore || 70
    const updatedScore = parsedResponse.updatedScore || previousScore
    const scoreChange = updatedScore - previousScore

    console.log('✅ Agent回复成功:', {
      agentId: body.agentId,
      scoreChange,
      resolvedCount: parsedResponse.resolvedChallenges?.length || 0,
      newChallengesCount: parsedResponse.newChallenges?.length || 0
    })

    return NextResponse.json({
      success: true,
      data: {
        agentResponse: parsedResponse.response || agentResponseContent,
        updatedScore,
        scoreChange,
        resolvedChallenges: parsedResponse.resolvedChallenges || [],
        newChallenges: parsedResponse.newChallenges || [],
        emotion: determineEmotion(scoreChange, parsedResponse)
      }
    } as AgentReplyResponse)

  } catch (error) {
    console.error('❌ Agent对话失败:', error)
    return handleApiError(error)
  }
}

/**
 * 构建对话Prompt
 */
function buildConversationPrompt(body: AgentReplyRequest): string {
  return `你是一个专业的创业导师，正在通过竞价方式评估用户的创意。

**原始创意：**
${body.originalIdea}

**用户最新回复：**
${body.userReply}

**你的任务：**
1. 分析用户的回复是否解决了你之前的质疑
2. 如果解决了，明确指出哪些问题已解决，并适度提高评分
3. 如果没有完全解决，继续追问或提出新的质疑
4. 保持专业、建设性的态度，帮助用户完善创意

**输出格式（JSON）：**
\`\`\`json
{
  "response": "你的回复内容（自然语言，80-150字）",
  "resolvedChallenges": ["质疑1已解决", "质疑2已解决"],
  "newChallenges": ["新发现的质疑"],
  "updatedScore": 85,
  "scoreReason": "为什么调整了评分",
  "emotion": "confident"
}
\`\`\`

请以专业、建设性的态度回复，帮助用户完善创意。`
}

/**
 * 获取Agent的系统Prompt
 */
function getAgentSystemPrompt(agentId: string): string {
  const agentPrompts: Record<string, string> = {
    'alex': '你是Alex Chen，一位理性的数据分析专家，擅长用数据和逻辑分析创意的可行性。你的风格是理性、客观、注重数据支撑。',
    'sophia': '你是Sophia Martinez，一位充满激情的设计思维专家，关注用户体验和创新性。你的风格是热情、富有创造力、鼓励创新。',
    'marcus': '你是Marcus Johnson，一位务实的商业战略家，关注商业模式和盈利能力。你的风格是务实、直接、关注投资回报。',
    'elena': '你是Elena Volkov，一位严谨的技术架构师，评估技术可行性和实现难度。你的风格是严谨、专业、注重技术细节。',
    'raj': '你是Raj Patel，一位乐观的市场营销专家，关注市场需求和用户增长。你的风格是乐观、积极、关注市场机会。'
  }

  return agentPrompts[agentId] || '你是一个专业的创业导师，正在评估用户的创意。'
}

/**
 * 根据agentId获取AI客户端
 */
function getAIClient(agentId: string): OpenAI | null {
  // 根据agentId分配AI模型
  // Alex, Sophia -> DeepSeek
  // Marcus, Elena -> 智谱GLM
  // Raj -> 通义千问

  if (agentId === 'alex' || agentId === 'sophia') {
    if (!process.env.DEEPSEEK_API_KEY) return null
    return new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1'
    })
  } else if (agentId === 'marcus' || agentId === 'elena') {
    if (!process.env.ZHIPU_API_KEY) return null
    return new OpenAI({
      apiKey: process.env.ZHIPU_API_KEY,
      baseURL: 'https://open.bigmodel.cn/api/paas/v4'
    })
  } else if (agentId === 'raj') {
    if (!process.env.DASHSCOPE_API_KEY) return null
    return new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    })
  }

  return null
}

/**
 * 获取模型名称
 */
function getModelName(agentId: string): string {
  if (agentId === 'alex' || agentId === 'sophia') {
    return 'deepseek-chat'
  } else if (agentId === 'marcus' || agentId === 'elena') {
    return 'glm-4'
  } else if (agentId === 'raj') {
    return 'qwen-plus'
  }
  return 'deepseek-chat'
}

/**
 * 根据评分变化和回复内容判断情感
 */
function determineEmotion(
  scoreChange: number,
  response: any
): 'neutral' | 'excited' | 'confident' | 'worried' | 'aggressive' {
  const emotion = response.emotion as string

  // 如果AI明确指定了emotion，使用它
  if (emotion && ['neutral', 'excited', 'confident', 'worried', 'aggressive'].includes(emotion)) {
    return emotion as any
  }

  // 否则根据评分变化判断
  if (scoreChange >= 10) return 'excited'
  if (scoreChange >= 5) return 'confident'
  if (scoreChange <= -5) return 'worried'
  if (scoreChange <= -10) return 'aggressive'
  return 'neutral'
}
