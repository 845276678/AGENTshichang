import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/auth-middleware'
import AIServiceManager from '@/lib/ai-service-manager'
import { AI_PERSONAS } from '@/lib/ai-persona-system'

const aiServiceManager = new AIServiceManager()

// 竞价会话状态管理
interface BiddingSession {
  ideaId: string
  ideaContent: string
  status: 'active' | 'completed' | 'cancelled'
  phase: 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result'
  startTime: number
  endTime?: number
  currentRound: number
  maxRounds: number
  participants: number
  currentBids: Record<string, number>
  messages: any[]
  finalReport?: any
}

// 全局会话存储（生产环境应使用Redis）
const activeSessions = new Map<string, BiddingSession>()

// 启动竞价会话
export async function POST(request: NextRequest) {
  try {
    // 认证检查（可选）
    try {
      const authResult = await authenticateToken(request)
      if (!authResult.success) {
        console.log('Auth check failed, proceeding without auth:', authResult.error)
      }
    } catch (authError) {
      console.log('Auth check skipped in development:', authError)
    }

    const body = await request.json()
    const { ideaId, ideaContent, sessionId } = body

    if (!ideaId || !ideaContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const finalSessionId = sessionId || `session_${Date.now()}_${ideaId}`

    // 检查是否已有活跃会话
    if (activeSessions.has(finalSessionId)) {
      return NextResponse.json({ error: 'Session already exists' }, { status: 409 })
    }

    // 创建竞价会话
    const session: BiddingSession = {
      ideaId,
      ideaContent,
      status: 'active',
      phase: 'warmup',
      startTime: Date.now(),
      currentRound: 1,
      maxRounds: 3,
      participants: 1,
      currentBids: {},
      messages: []
    }

    activeSessions.set(finalSessionId, session)

    console.log(`🎭 Created bidding session: ${finalSessionId} for idea: ${ideaId}`)

    // 启动AI对话引擎
    setTimeout(async () => {
      await startAIBiddingDialogue(finalSessionId)
    }, 3000) // 3秒后开始AI对话

    return NextResponse.json({
      success: true,
      sessionId: finalSessionId,
      session: {
        ...session,
        message: 'AI竞价会话已启动，专家团队正在准备中...'
      }
    })

  } catch (error) {
    console.error('Error starting bidding session:', error)
    return NextResponse.json(
      { error: 'Failed to start bidding session' },
      { status: 500 }
    )
  }
}

// 获取竞价会话状态
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const session = activeSessions.get(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error getting session:', error)
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 })
  }
}

// AI竞价对话逻辑
async function startAIBiddingDialogue(sessionId: string) {
  const session = activeSessions.get(sessionId)
  if (!session || session.status !== 'active') {
    console.log(`Session ${sessionId} not found or not active`)
    return
  }

  try {
    console.log(`🎭 Starting AI bidding dialogue for session: ${sessionId}`)

    // 第一轮：暖场和初步讨论
    if (session.phase === 'warmup') {
      await runWarmupPhase(sessionId)

      // 3分钟后进入讨论阶段
      setTimeout(() => {
        if (activeSessions.get(sessionId)?.status === 'active') {
          transitionToPhase(sessionId, 'discussion')
        }
      }, 180000) // 3分钟
    }

  } catch (error) {
    console.error('Error in AI bidding dialogue:', error)
    const session = activeSessions.get(sessionId)
    if (session) {
      session.status = 'cancelled'
    }
  }
}

// 暖场阶段
async function runWarmupPhase(sessionId: string) {
  const session = activeSessions.get(sessionId)
  if (!session) return

  console.log(`🔥 Running warmup phase for session: ${sessionId}`)

  // 让每个AI角色依次发言介绍自己
  for (let i = 0; i < AI_PERSONAS.length; i++) {
    const persona = AI_PERSONAS[i]

    try {
      const response = await generateAIResponse(persona.id, session.ideaContent, {
        phase: 'warmup',
        prompt: `请简短介绍你自己，并对这个创意"${session.ideaContent}"给出第一印象。保持角色特色，不超过100字。`
      })

      const message = {
        id: `msg_${Date.now()}_${i}`,
        personaId: persona.id,
        phase: 'warmup',
        round: 1,
        type: 'speech',
        content: response.content,
        emotion: determineEmotion(response.content),
        timestamp: new Date(),
        confidence: response.confidence || 0.8,
        tokens: response.tokens_used || 50,
        cost: response.cost || 0.002
      }

      session.messages.push(message)

      // 通过WebSocket广播消息
      broadcastMessage(session.ideaId, {
        type: 'ai_message',
        message
      })

      console.log(`💬 ${persona.name}: ${response.content.substring(0, 50)}...`)

      // AI角色之间间隔2-4秒发言
      await sleep(2000 + Math.random() * 2000)

    } catch (error) {
      console.error(`Error generating response for ${persona.name}:`, error)

      // 添加备用响应
      const fallbackMessage = {
        id: `fallback_${Date.now()}_${i}`,
        personaId: persona.id,
        phase: 'warmup',
        round: 1,
        type: 'speech',
        content: `大家好，我是${persona.name}。这个创意很有意思，让我仔细分析一下...`,
        emotion: 'neutral',
        timestamp: new Date(),
        confidence: 0.5
      }

      session.messages.push(fallbackMessage)
      broadcastMessage(session.ideaId, {
        type: 'ai_message',
        message: fallbackMessage
      })

      await sleep(3000)
    }
  }
}

// 阶段切换
async function transitionToPhase(sessionId: string, newPhase: string) {
  const session = activeSessions.get(sessionId)
  if (!session) return

  console.log(`🔄 Transitioning session ${sessionId} from ${session.phase} to ${newPhase}`)

  session.phase = newPhase as any

  broadcastMessage(session.ideaId, {
    type: 'phase_change',
    phase: newPhase,
    timestamp: Date.now(),
    message: `进入${getPhaseDisplayName(newPhase)}阶段`
  })

  // 根据阶段执行对应逻辑
  switch (newPhase) {
    case 'discussion':
      await runDiscussionPhase(sessionId)
      break
    case 'bidding':
      await runBiddingPhase(sessionId)
      break
    case 'prediction':
      await runPredictionPhase(sessionId)
      break
    case 'result':
      await runResultPhase(sessionId)
      break
  }
}

// 讨论阶段
async function runDiscussionPhase(sessionId: string) {
  const session = activeSessions.get(sessionId)
  if (!session) return

  console.log(`💭 Running discussion phase for session: ${sessionId}`)

  // AI角色进行深入讨论
  for (let round = 1; round <= 2; round++) {
    for (const persona of AI_PERSONAS) {
      try {
        const context = buildDialogueContext(session, persona.id)
        const response = await generateAIResponse(persona.id, session.ideaContent, {
          phase: 'discussion',
          round,
          context,
          prompt: `基于前面的对话，请从你的专业角度深入分析这个创意。可以询问其他专家问题，或对他们的观点进行回应。`
        })

        const message = {
          id: `discussion_${Date.now()}_${round}`,
          personaId: persona.id,
          phase: 'discussion',
          round,
          type: 'speech',
          content: response.content,
          emotion: determineEmotion(response.content),
          timestamp: new Date(),
          confidence: response.confidence || 0.8
        }

        session.messages.push(message)
        broadcastMessage(session.ideaId, {
          type: 'ai_message',
          message
        })

        await sleep(3000 + Math.random() * 2000)

      } catch (error) {
        console.error(`Error in discussion for ${persona.name}:`, error)
      }
    }
  }

  // 5分钟后进入竞价阶段
  setTimeout(() => {
    if (activeSessions.get(sessionId)?.status === 'active') {
      transitionToPhase(sessionId, 'bidding')
    }
  }, 300000) // 5分钟
}

// 竞价阶段
async function runBiddingPhase(sessionId: string) {
  const session = activeSessions.get(sessionId)
  if (!session) return

  console.log(`💰 Running bidding phase for session: ${sessionId}`)

  // 每个AI角色进行竞价
  for (let round = 1; round <= 3; round++) {
    for (const persona of AI_PERSONAS) {
      try {
        const context = buildDialogueContext(session, persona.id)
        const response = await generateAIResponse(persona.id, session.ideaContent, {
          phase: 'bidding',
          round,
          context,
          prompt: `现在是竞价环节第${round}轮。请给出你对这个创意的具体竞价金额（50-500之间），并说明理由。格式：我出价X元，因为...`
        })

        // 从回应中提取竞价金额
        const bidAmount = extractBidAmount(response.content)
        session.currentBids[persona.id] = bidAmount

        const message = {
          id: `bid_${Date.now()}_${round}`,
          personaId: persona.id,
          phase: 'bidding',
          round,
          type: 'bid',
          content: response.content,
          emotion: 'confident',
          timestamp: new Date(),
          bidValue: bidAmount,
          confidence: response.confidence || 0.8
        }

        session.messages.push(message)
        broadcastMessage(session.ideaId, {
          type: 'ai_bid',
          message,
          currentBids: session.currentBids
        })

        console.log(`💰 ${persona.name} bid: ${bidAmount}元`)

        await sleep(4000 + Math.random() * 2000)

      } catch (error) {
        console.error(`Error in bidding for ${persona.name}:`, error)
      }
    }
  }

  // 3分钟后进入预测阶段
  setTimeout(() => {
    if (activeSessions.get(sessionId)?.status === 'active') {
      transitionToPhase(sessionId, 'prediction')
    }
  }, 180000) // 3分钟
}

// 预测阶段
async function runPredictionPhase(sessionId: string) {
  const session = activeSessions.get(sessionId)
  if (!session) return

  console.log(`🔮 Running prediction phase for session: ${sessionId}`)

  broadcastMessage(session.ideaId, {
    type: 'prediction_start',
    message: '预测环节开始！请预测最终成交价格',
    currentBids: session.currentBids
  })

  // 2分钟后自动进入结果阶段
  setTimeout(() => {
    if (activeSessions.get(sessionId)?.status === 'active') {
      transitionToPhase(sessionId, 'result')
    }
  }, 120000) // 2分钟
}

// 结果阶段
async function runResultPhase(sessionId: string) {
  const session = activeSessions.get(sessionId)
  if (!session) return

  console.log(`🎯 Running result phase for session: ${sessionId}`)

  // 计算最终结果
  const bids = Object.values(session.currentBids)
  const highestBid = Math.max(...bids)
  const avgBid = bids.reduce((a, b) => a + b, 0) / bids.length

  // 生成商业报告
  const finalReport = await generateBusinessReport(sessionId, session)

  session.finalReport = finalReport
  session.status = 'completed'
  session.endTime = Date.now()

  broadcastMessage(session.ideaId, {
    type: 'session_complete',
    results: {
      highestBid,
      averageBid: Math.round(avgBid),
      finalBids: session.currentBids,
      totalMessages: session.messages.length,
      duration: session.endTime - session.startTime,
      report: finalReport
    }
  })

  console.log(`🎉 Session ${sessionId} completed. Highest bid: ${highestBid}元`)
}

// 生成AI回应
async function generateAIResponse(personaId: string, ideaContent: string, context: any): Promise<any> {
  try {
    // 根据人物选择对应的AI服务
    const providerMap: Record<string, string> = {
      'tech-pioneer-alex': 'deepseek',
      'business-guru-beta': 'zhipu',
      'innovation-mentor-charlie': 'qwen',
      'market-insight-delta': 'deepseek',
      'investment-advisor-ivan': 'zhipu'
    }

    const provider = providerMap[personaId] || 'deepseek'

    const dialogueContext = {
      idea: ideaContent,
      phase: context.phase,
      round: context.round || 1,
      previousMessages: context.context?.previousMessages || [],
      currentBids: context.context?.currentBids || {},
      sessionHistory: []
    }

    const response = await aiServiceManager.callSingleService({
      provider: provider as any,
      persona: personaId,
      context: dialogueContext,
      systemPrompt: getSystemPromptForPersona(personaId),
      temperature: 0.7,
      maxTokens: 300
    })

    return response

  } catch (error) {
    console.error(`Error generating AI response for ${personaId}:`, error)

    // 回退响应
    const persona = AI_PERSONAS.find(p => p.id === personaId)
    return {
      content: `我是${persona?.name || personaId}，很抱歉现在无法给出详细回应，但我对这个创意很感兴趣。让我仔细考虑一下...`,
      confidence: 0.5,
      tokens_used: 30,
      cost: 0.001
    }
  }
}

// 辅助函数
function buildDialogueContext(session: BiddingSession, personaId: string) {
  return {
    sessionId: session.ideaId,
    phase: session.phase,
    round: session.currentRound,
    previousMessages: session.messages.slice(-10), // 最近10条消息
    currentBids: session.currentBids,
    persona: personaId
  }
}

function determineEmotion(content: string): string {
  if (content.includes('激动') || content.includes('太棒了') || content.includes('惊艳')) return 'excited'
  if (content.includes('担心') || content.includes('风险') || content.includes('挑战')) return 'worried'
  if (content.includes('自信') || content.includes('确信') || content.includes('肯定')) return 'confident'
  if (content.includes('愤怒') || content.includes('反对') || content.includes('荒谬')) return 'angry'
  return 'neutral'
}

function extractBidAmount(content: string): number {
  // 多种模式匹配竞价金额
  const patterns = [
    /(\d+)元/,
    /出价\s*(\d+)/,
    /价格\s*(\d+)/,
    /估值\s*(\d+)/,
    /(\d+)\s*块/,
    /我的出价是\s*(\d+)/i
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) {
      const amount = parseInt(match[1])
      return Math.min(Math.max(amount, 50), 500) // 限制在50-500之间
    }
  }

  // 默认随机值
  return Math.floor(Math.random() * 200) + 100
}

function getSystemPromptForPersona(personaId: string): string {
  const prompts: Record<string, string> = {
    'tech-pioneer-alex': `你是技术先锋艾克斯，一位经验丰富的首席技术专家。请从技术角度分析创意的可行性、复杂度和创新性。说话风格专业严谨。`,
    'business-guru-beta': `你是商业智囊贝塔，一位敏锐的商业战略顾问。请从商业价值、市场潜力、盈利模式角度分析。说话风格务实精明。`,
    'innovation-mentor-charlie': `你是创新导师查理，一位富有想象力的创新思维专家。请从创新程度、用户体验、社会影响角度分析。说话风格富有激情。`,
    'market-insight-delta': `你是市场洞察师德尔塔，一位数据驱动的市场分析专家。请从市场需求、竞争环境、发展趋势角度分析。说话风格客观理性。`,
    'investment-advisor-ivan': `你是投资顾问伊万，一位专业的投资评估专家。请从投资价值、风险评估、回报预期角度分析。说话风格谨慎专业。`
  }

  return prompts[personaId] || `你是${personaId}，请保持角色一致性，用专业且有个性的语言回应。`
}

function getPhaseDisplayName(phase: string): string {
  const names: Record<string, string> = {
    'warmup': '暖场介绍',
    'discussion': '深度讨论',
    'bidding': '激烈竞价',
    'prediction': '价格预测',
    'result': '结果揭晓'
  }
  return names[phase] || phase
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function broadcastMessage(ideaId: string, data: any) {
  try {
    // 使用全局广播函数
    if (typeof global !== 'undefined' && global.broadcastToSession) {
      global.broadcastToSession(ideaId, data)
    } else {
      console.log(`📡 Would broadcast to ${ideaId}:`, data.type)
    }
  } catch (error) {
    console.error('Error broadcasting message:', error)
  }
}

async function generateBusinessReport(sessionId: string, session: BiddingSession) {
  const highestBid = Math.max(...Object.values(session.currentBids))
  const avgBid = Object.values(session.currentBids).reduce((a, b) => a + b, 0) / Object.values(session.currentBids).length

  return {
    summary: `基于5位AI专家的专业分析，您的创意"${session.ideaContent.substring(0, 50)}..."获得了综合评估。`,
    valuation: {
      highest: highestBid,
      average: Math.round(avgBid),
      range: `${Math.min(...Object.values(session.currentBids))}-${highestBid}元`
    },
    expertAnalysis: session.messages
      .filter(msg => msg.type === 'speech')
      .slice(0, 5)
      .map(msg => ({
        expert: AI_PERSONAS.find(p => p.id === msg.personaId)?.name,
        opinion: msg.content.substring(0, 100) + '...'
      })),
    recommendations: [
      '建议进一步完善技术方案细节',
      '深入调研目标市场用户需求',
      '制定详细的商业化实施计划',
      '考虑知识产权保护策略'
    ],
    nextSteps: [
      '技术原型开发',
      '市场验证测试',
      '商业计划书制定',
      '寻找合作伙伴或投资'
    ],
    timestamp: Date.now(),
    sessionDuration: session.endTime! - session.startTime,
    totalInteractions: session.messages.length
  }
}