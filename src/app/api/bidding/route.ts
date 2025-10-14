import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/auth-middleware'
import AIServiceManager, { SYSTEM_PROMPTS } from '@/lib/ai-service-manager'
import { AI_PERSONAS } from '@/lib/ai-persona-system'
import type { AIPersona } from '@/lib/ai-persona-system'
import {
  generateBiddingRound,
  generatePersonaComment,
  calculatePersonaScore,
  generateAIPersonaAnalysis
} from '@/lib/ai-persona-enhanced'
import { evaluateIdeaQuality } from '@/lib/idea-evaluation'
import type { IdeaEvaluationResult, IdeaEvaluationVerdict, DimensionStatus } from '@/lib/idea-evaluation'
import { buildCriticalReviewPrompt } from '@/lib/prompt-builders'

// UTF-8编码响应助手函数
function createUTF8Response(data: any, status: number = 200) {
  const response = NextResponse.json(data, { status })
  response.headers.set('Content-Type', 'application/json; charset=utf-8')
  return response
}

const aiServiceManager = new AIServiceManager()

// 竞价会话状态管理
interface BiddingSession {
  ideaId: string
  ideaContent: string
  status: 'active' | 'completed' | 'cancelled' | 'awaiting_supplement'
  phase: 'evaluation' | 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result'
  startTime: number
  endTime?: number
  currentRound: number
  maxRounds: number
  participants: number
  currentBids: Record<string, number>
  messages: any[]
  finalReport?: any
  evaluationResult?: IdeaEvaluationResult
  supplementCount?: number // 补充次数
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
      return createUTF8Response({ error: 'Missing required fields' }, 400)
    }

    const finalSessionId = sessionId || `session_${Date.now()}_${ideaId}`

    // 检查是否已有活跃会话
    if (activeSessions.has(finalSessionId)) {
      return createUTF8Response({ error: 'Session already exists' }, 409)
    }

    // 创建竞价会话
    const session: BiddingSession = {
      ideaId,
      ideaContent,
      status: 'active',
      phase: 'evaluation', // 从评估阶段开始
      startTime: Date.now(),
      currentRound: 1,
      maxRounds: 3,
      participants: 1,
      currentBids: {},
      messages: [],
      supplementCount: 0
    }

    activeSessions.set(finalSessionId, session)

    console.log(`🎭 Created bidding session: ${finalSessionId} for idea: ${ideaId}`)

    // 先进行创意评估
    setTimeout(async () => {
      await evaluateAndStartBidding(finalSessionId)
    }, 2000) // 2秒后开始评估

    return createUTF8Response({
      success: true,
      sessionId: finalSessionId,
      session: {
        ...session,
        message: 'AI专家团队正在评估您的创意...'
      }
    })

  } catch (error) {
    console.error('Error starting bidding session:', error)
    return createUTF8Response(
      { error: 'Failed to start bidding session' },
      500
    )
  }
}

// 补充创意信息并重新评估
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, supplementInfo } = body

    if (!sessionId || !supplementInfo) {
      return createUTF8Response({ error: 'Missing required fields' }, 400)
    }

    const session = activeSessions.get(sessionId)
    if (!session) {
      return createUTF8Response({ error: 'Session not found' }, 404)
    }

    if (session.status !== 'awaiting_supplement') {
      return createUTF8Response({ error: 'Session not awaiting supplement' }, 400)
    }

    console.log(`📝 User supplementing idea for session: ${sessionId}`)

    // 更新创意内容
    const originalContent = session.ideaContent
    session.ideaContent = `${originalContent}\n\n补充信息：\n${supplementInfo}`
    session.supplementCount = (session.supplementCount || 0) + 1

    // 广播补充信息
    broadcastMessage(session.ideaId, {
      type: 'idea_supplemented',
      message: '用户已补充信息，正在重新评估...'
    })

    // 重新评估
    setTimeout(async () => {
      await evaluateAndStartBidding(sessionId)
    }, 1500)

    // 重置状态
    session.status = 'active'

    return createUTF8Response({
      success: true,
      message: '补充信息已提交，正在重新评估...',
      session: {
        ideaContent: session.ideaContent,
        supplementCount: session.supplementCount
      }
    })

  } catch (error) {
    console.error('Error supplementing idea:', error)
    return createUTF8Response(
      { error: 'Failed to supplement idea' },
      500
    )
  }
}

// 获取竞价会话状态
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')

    if (!sessionId) {
      return createUTF8Response({ error: 'Missing sessionId' }, 400)
    }

    const session = activeSessions.get(sessionId)
    if (!session) {
      return createUTF8Response({ error: 'Session not found' }, 404)
    }

    return createUTF8Response({
      success: true,
      session
    })

  } catch (error) {
    console.error('Error getting session:', error)
    return createUTF8Response({ error: 'Failed to get session' }, 500)
  }
}

// AI竞价对话逻辑
// 评估创意并决定流程
async function evaluateAndStartBidding(sessionId: string) {
  const session = activeSessions.get(sessionId)
  if (!session) return

  try {
    console.log(`📊 Evaluating idea for session: ${sessionId}`)

    // 执行创意评估
    const evaluation = await evaluateIdeaQuality(session.ideaContent)
    const { feedback } = evaluation

    // 保存评估结果
    session.evaluationResult = evaluation

    console.log(`📊 Evaluation result: ${evaluation.verdict} (score: ${evaluation.score}/100)`)

    // 广播评估结果
    broadcastMessage(session.ideaId, {
      type: 'evaluation_result',
      evaluation,
    })

    // 根据评分决定流程
    if (evaluation.score < 60) {
      // 低分：暂停并等待用户补充
      session.status = 'awaiting_supplement'
      session.phase = 'evaluation'

      console.log(`⏸️ Idea needs improvement. Waiting for user supplement...`)

      broadcastMessage(session.ideaId, {
        type: 'needs_supplement',
        message: 'Your idea needs more detail before the AI bidding can continue. Please follow the prompts to enrich it.',
        requiredInfo: evaluation.requiredInfo,
        weaknesses: evaluation.weaknesses,
        missingSections: evaluation.missingSections,
        improvementActions: evaluation.improvementActions,
        risks: evaluation.risks,
        feedback,
        score: evaluation.score,
        verdict: evaluation.verdict,
      })
    } else {
      // 高分：进入犀利点评阶段
      console.log(`✅ Idea quality acceptable. Starting critical review...`)

      session.phase = 'warmup'
      await startAIBiddingDialogue(sessionId)
    }

  } catch (error) {
    console.error('Error in idea evaluation:', error)
    // 评估失败，直接进入正常流程
    session.phase = 'warmup'
    await startAIBiddingDialogue(sessionId)
  }
}

// 启动AI竞价对话
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
      const prompt = buildCriticalReviewPrompt(persona, {
        ideaContent: session.ideaContent,
        evaluationResult: session.evaluationResult,
      })

      const response = await generateAIResponse(persona.id, session.ideaContent, {
        phase: 'warmup',
        prompt,
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

// 生成AI回应 - 使用真实AI服务
async function generateAIResponse(personaId: string, ideaContent: string, context: any): Promise<any> {
  try {
    // 首先获取persona对象
    const persona = AI_PERSONAS.find(p => p.id === personaId)
    if (!persona) {
      throw new Error(`Persona not found: ${personaId}`)
    }

    // 根据角色ID映射到对应的AI服务提供商
    const providerMap: Record<string, string> = {
      'business-guru-beta': 'zhipu',     // 老王使用智谱
      'tech-pioneer-alex': 'deepseek',      // 艾克斯使用deepseek
      'innovation-mentor-charlie': 'zhipu',              // 小琳使用智谱
      'market-insight-delta': 'qwen',         // 阿伦使用通义千问
      'investment-advisor-ivan': 'deepseek'              // 李博使用deepseek
    }

    const provider = providerMap[personaId] || 'deepseek'

    // 构建对话上下文
    const dialogueContext = {
      idea: ideaContent,
      phase: context.phase,
      round: context.round || 1,
      previousMessages: context.context?.previousMessages || [],
      currentBids: context.context?.currentBids || {},
      sessionHistory: []
    }

    // 根据阶段构建不同的用户提示
    let userPrompt = ''

    if (context.phase === 'warmup') {
      userPrompt = `现在是暖场阶段。你是${persona.name}，${persona.specialty}专家。

你的人设特点：
- 性格：${persona.personality.join('、')}
- 专长：${persona.specialty}
- 口头禅："${persona.catchPhrase}"

创意内容："${ideaContent}"

要求（必须严格遵守）：
1. **必须**用你的口头禅"${persona.catchPhrase}"或类似风格开场
2. **必须**保持你的说话风格和性格特点（${persona.personality.join('、')}）
3. 从你的专业视角（${persona.specialty}）简单点评创意
4. 50-100字，直接、生动、有个性
5. 不要用客套话，要体现你独特的性格
6. **严禁**引用或扮演其他专家（如"王博士"、"李首席"等），只能以你自己的身份说话
7. **严禁**使用"综合评估"、"专家会诊"等第三视角的格式

${persona.id === 'business-guru-beta' ? '特别提示：老王说话要接地气、东北味儿，关注赚钱和实际，不要太客气！' : ''}
${persona.id === 'tech-pioneer-alex' ? '特别提示：艾克斯说话可以中英夹杂，关注技术实现，要有技术范儿！' : ''}
${persona.id === 'innovation-mentor-charlie' ? '特别提示：小琳说话要温柔、有共鸣感，关注用户体验和美感！' : ''}
${persona.id === 'market-insight-delta' ? '特别提示：阿伦说话要有网感、年轻化，关注热点和传播，可以用网络用语！' : ''}
${persona.id === 'investment-advisor-ivan' ? '特别提示：李博说话要严谨、学术化，关注理论和验证！' : ''}`
    } else if (context.phase === 'discussion') {
      const previousSpeakers = context.context?.previousMessages?.slice(-3).map((m: any) => m.personaId) || []
      userPrompt = `现在是深度讨论阶段第${context.round}轮。你是${persona.name}，${persona.specialty}专家。

你的人设特点：
- 性格：${persona.personality.join('、')}
- 专长：${persona.specialty}
- 口头禅："${persona.catchPhrase}"

创意：${ideaContent}
之前的发言者：${previousSpeakers.join(', ')}

请从你的专业角度深入分析这个创意：
1. 提出你最关心的1-2个问题
2. 如果有你的"冲突对象"刚发言，要反驳他们
3. 如果有你的"盟友"刚发言，可以支持他们
4. **必须**保持你的个性和说话风格（${persona.personality.join('、')}）
5. 100-150字
6. **严禁**引用或扮演其他专家，只能以你自己的身份说话
7. **严禁**使用"综合评估"、"专家会诊"等第三视角的格式

${persona.id === 'business-guru-beta' ? '特别提示：老王你要关注盈利模式、现金流，说话接地气有东北味儿！' : ''}
${persona.id === 'tech-pioneer-alex' ? '特别提示：艾克斯你要关注技术架构、可行性，说话可以中英夹杂！' : ''}
${persona.id === 'innovation-mentor-charlie' ? '特别提示：小琳你要关注用户体验、情感价值，说话温柔有共鸣！' : ''}
${persona.id === 'market-insight-delta' ? '特别提示：阿伦你要关注传播热点、流量密码，说话要有网感！' : ''}
${persona.id === 'investment-advisor-ivan' ? '特别提示：李博你要关注理论支撑、风险分析，说话严谨学术！' : ''}`
    } else if (context.phase === 'bidding') {
      const otherBids = Object.entries(context.context?.currentBids || {})
        .filter(([id]) => id !== personaId)
        .map(([id, bid]) => `${id}: ${bid}分`)
        .join(', ')

      userPrompt = `现在是评估打分阶段第${context.round}轮。你是${persona.name}，${persona.specialty}专家。

你的人设特点：
- 性格：${persona.personality.join('、')}
- 专长：${persona.specialty}
- 口头禅："${persona.catchPhrase}"

创意：${ideaContent}
其他人的评分：${otherBids || '暂无'}

请给出你的评分（1-10分）并说明理由：
1. 根据你的评估标准打分
2. 如果冲突对象给了高分，你可能会给低分
3. 如果盟友给了某个分数，你可能会趋同
4. **必须**用你的个性化语言解释评分理由，保持你的说话风格（${persona.personality.join('、')}）
5. 格式："我给X分，因为..."（100字左右）
6. **严禁**引用或扮演其他专家，只能以你自己的身份说话
7. **严禁**使用"综合评估"、"专家会诊"等第三视角的格式

${persona.id === 'business-guru-beta' ? '特别提示：老王你打分要看商业价值、能不能赚钱，说话别太客气！' : ''}
${persona.id === 'tech-pioneer-alex' ? '特别提示：艾克斯你打分要看技术难度、架构合理性！' : ''}
${persona.id === 'innovation-mentor-charlie' ? '特别提示：小琳你打分要看用户价值、体验设计！' : ''}
${persona.id === 'market-insight-delta' ? '特别提示：阿伦你打分要看市场潜力、传播性！' : ''}
${persona.id === 'investment-advisor-ivan' ? '特别提示：李博你打分要看理论基础、可验证性！' : ''}`
    }

    // 调用真实AI服务
    const response = await aiServiceManager.callSingleService({
      provider: provider as any,
      persona: personaId,
      context: dialogueContext,
      systemPrompt: getSystemPromptForPersona(personaId),
      temperature: 0.7, // 降低温度减少随意发挥
      maxTokens: context.phase === 'warmup' ? 150 : 300 // warmup简短，其他阶段详细
    })

    return {
      content: response.content,
      confidence: response.confidence || 0.85,
      tokens_used: response.tokens_used || 100,
      cost: response.cost || 0.002
    }

  } catch (error) {
    console.error(`Error generating AI response for ${personaId}:`, error)

    // 如果AI服务失败，使用增强版的备用响应
    return await generateFallbackResponse(personaId, ideaContent, context)
  }
}

// 生成备用响应（当AI服务不可用时）
async function generateFallbackResponse(personaId: string, ideaContent: string, context: any): Promise<any> {
  const persona = AI_PERSONAS.find(p => p.id === personaId)
  if (!persona) {
    return {
      content: '我需要仔细考虑一下这个创意...',
      confidence: 0.5,
      tokens_used: 30,
      cost: 0.001
    }
  }

  let content = ''

  if (context.phase === 'warmup') {
    // warmup阶段也使用AI生成，降级到简单模板
    try {
      const score = 70 // warmup阶段给个中等分数
      content = await generateAIPersonaAnalysis(persona, ideaContent, score, aiServiceManager)
    } catch (error) {
      console.error(`Warmup AI生成失败，使用简单模板 (${persona.name}):`, error)
      // 最终降级模板
      const warmupTemplates: Record<string, string> = {
        'business-guru-beta': `哎呀妈呀，"${ideaContent}"？数据驱动决策，价值创造未来！这事儿能不能赚钱，咱得好好算算账！`,
        'tech-pioneer-alex': `Let me see..."${ideaContent}"，技术上有意思。让数据说话，用技术改变世界！架构得仔细设计啊。`,
        'innovation-mentor-charlie': `"${ideaContent}"让我看到了用户的需求呢~好的创意要触动人心，让生活更美好！体验设计很关键哦。`,
        'market-insight-delta': `家人们！"${ideaContent}"这个idea有点东西！抓住风口，让创意火遍全网！得看看传播点在哪。`,
        'investment-advisor-ivan': `关于"${ideaContent}"，理论指导实践，学术成就未来。需要系统性地分析可行性和风险。`
      }
      content = warmupTemplates[persona.id] || `${persona.catchPhrase} 关于"${ideaContent}"，让我从专业角度分析一下。`
    }
  } else if (context.phase === 'discussion') {
    // 在discussion阶段也使用AI生成个性化分析
    const score = calculatePersonaScore(
      persona,
      ideaContent,
      'product',
      new Map(Object.entries(context.context?.currentBids || {}))
    )

    try {
      content = await generateAIPersonaAnalysis(persona, ideaContent, score, aiServiceManager)
    } catch (error) {
      console.error(`AI讨论分析失败，降级到模板 (${persona.name}):`, error)
      // 降级到预设模板
      const templates: Record<string, string[]> = {
        'business-guru-beta': [
          `哎呀妈呀，${ideaContent}这个想法有点意思，但能赚钱吗？我得好好算算账。`,
          `做生意就一个字：赚！这个${ideaContent}的盈利模式在哪？别整虚的！`
        ],
        'tech-pioneer-alex': [
          `Technically speaking，${ideaContent}的技术架构需要仔细设计，scalability是关键。`,
          `${ideaContent}？Let me think... 技术实现不难，但要做好不容易。`
        ],
        'innovation-mentor-charlie': [
          `${ideaContent}让我想到了用户的真实需求，产品要有温度才能打动人心~`,
          `这个创意很有潜力，但用户体验设计要特别用心，美是生产力！`
        ],
        'market-insight-delta': [
          `家人们！${ideaContent}有爆点！Z世代肯定买单，流量密码被我找到了！`,
          `${ideaContent}踩中热点了！小红书上这类内容超火的，分分钟10万+！`
        ],
        'investment-advisor-ivan': [
          `根据我的研究，${ideaContent}符合创新扩散理论，但要注意风险控制。`,
          `让我们用学术的眼光看${ideaContent}，理论基础扎实但执行是关键。`
        ]
      }
      const personaTemplates = templates[personaId] || [`${persona.catchPhrase}`]
      content = personaTemplates[Math.floor(Math.random() * personaTemplates.length)]
    }

  } else if (context.phase === 'bidding') {
    // 使用增强版的评分系统
    const score = calculatePersonaScore(
      persona,
      ideaContent,
      'market',
      new Map(Object.entries(context.context?.currentBids || {}))
    )

    // 使用AI生成基于人设的个性化分析
    try {
      content = await generateAIPersonaAnalysis(persona, ideaContent, score, aiServiceManager)
    } catch (error) {
      console.error(`AI分析生成失败，降级到模板评论 (${persona.name}):`, error)
      content = generatePersonaComment(persona, score, ideaContent, [])
    }
  }

  return {
    content: content || `我是${persona.name}，${persona.catchPhrase}`,
    confidence: 0.7,
    tokens_used: 50,
    cost: 0.001
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
    'business-guru-beta': SYSTEM_PROMPTS['business-guru-beta'] || '',
    'tech-pioneer-alex': SYSTEM_PROMPTS['tech-pioneer-alex'] || '',
    'innovation-mentor-charlie': SYSTEM_PROMPTS['innovation-mentor-charlie'] || '',
    'market-insight-delta': SYSTEM_PROMPTS['market-insight-delta'] || '',
    'investment-advisor-ivan': SYSTEM_PROMPTS['investment-advisor-ivan'] || ''
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
      '创意实现建议制定',
      '寻找合作伙伴或投资'
    ],
    timestamp: Date.now(),
    sessionDuration: session.endTime! - session.startTime,
    totalInteractions: session.messages.length
  }
}