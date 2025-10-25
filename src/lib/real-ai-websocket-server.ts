/**
 * 真实AI竞价服务 - 替换模拟WebSocket服务器
 * 集成DeepSeek、DashScope和Zhipu GLM进行实时AI对话
 */

import { NextRequest } from 'next/server'
import { WebSocket, WebSocketServer } from 'ws'
import { AI_PERSONAS } from '@/lib/ai-persona-system'
import AIServiceManager from '@/lib/ai-service-manager'
import { ULTRA_FAST_BIDDING_TIME_CONFIG, type BiddingTimeConfiguration } from '@/config/bidding-time-config'

// AI服务管理器实例
const aiServiceManager = new AIServiceManager()

// 使用统一的时间配置
const TIME_CONFIG = ULTRA_FAST_BIDDING_TIME_CONFIG

// 全局类型扩展
declare global {
  var broadcastToSession: ((ideaId: string, message: any) => void) | undefined
}

// 真实竞价会话数据
interface RealBiddingSession {
  id: string
  ideaId: string
  ideaContent: string // 用户输入的创意内容
  currentPhase: 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result'
  startTime: Date
  phaseStartTime: Date
  timeRemaining: number
  participants: Set<string>
  currentBids: Record<string, number>
  highestBid: number
  messages: any[]
  realAICost: number // 真实API调用成本
  aiCallCount: number // AI调用次数统计
  phaseTimers: NodeJS.Timeout[] // 存储所有阶段计时器，用于清理
  isEnding: boolean // 标记会话是否正在结束，防止重复触发
}

const activeSessions = new Map<string, RealBiddingSession>()
const connectedClients = new Map<string, WebSocket>()

// 创建真实AI竞价会话
function createRealSession(ideaId: string, ideaContent: string): RealBiddingSession {
  const session: RealBiddingSession = {
    id: ideaId,
    ideaId,
    ideaContent,
    currentPhase: 'warmup',
    startTime: new Date(),
    phaseStartTime: new Date(),
    timeRemaining: TIME_CONFIG.phases.warmup, // 使用配置的预热时间
    participants: new Set(),
    currentBids: {},
    highestBid: 50,
    messages: [],
    realAICost: 0,
    aiCallCount: 0,
    phaseTimers: [],
    isEnding: false
  }

  activeSessions.set(ideaId, session)
  startRealAISession(session)
  return session
}

// 启动真实AI会话
function startRealAISession(session: RealBiddingSession) {
  console.log(`🤖 Starting real AI bidding session for idea: ${session.ideaId}`)
  console.log(`⏱️ Using time config:`, {
    warmup: TIME_CONFIG.phases.warmup,
    discussion: TIME_CONFIG.phases.discussion,
    bidding: TIME_CONFIG.phases.bidding,
    prediction: TIME_CONFIG.phases.prediction,
    result: TIME_CONFIG.phases.result,
    total: TIME_CONFIG.totalTime
  })

  // 预热阶段 - 立即开始
  setTimeout(() => {
    if (!activeSessions.has(session.ideaId)) return
    session.currentPhase = 'warmup'
    generateRealAIDialogue(session, true)
    broadcastPhaseUpdate(session)
  }, 1000)

  // 每10秒生成一次AI对话（超快速模式下更频繁）
  const dialogueInterval = setInterval(() => {
    if (activeSessions.has(session.ideaId) && !session.isEnding) {
      generateRealAIDialogue(session)
    } else {
      clearInterval(dialogueInterval)
    }
  }, 10000) // 10秒一次对话

  // 使用配置的时间设置阶段切换定时器（转换为毫秒）
  let cumulativeTime = 0

  // 讨论阶段
  cumulativeTime += TIME_CONFIG.phases.warmup * 1000
  console.log(`🔍 [DEBUG] Scheduling discussion switch at ${cumulativeTime}ms`)
  const discussionTimer = setTimeout(() => switchToDiscussion(session), cumulativeTime)
  session.phaseTimers.push(discussionTimer)

  // 竞价阶段
  cumulativeTime += TIME_CONFIG.phases.discussion * 1000
  console.log(`🔍 [DEBUG] Scheduling bidding switch at ${cumulativeTime}ms`)
  const biddingTimer = setTimeout(() => switchToBidding(session), cumulativeTime)
  session.phaseTimers.push(biddingTimer)

  // 预测阶段
  cumulativeTime += TIME_CONFIG.phases.bidding * 1000
  console.log(`🔍 [DEBUG] Scheduling prediction switch at ${cumulativeTime}ms`)
  const predictionTimer = setTimeout(() => switchToPrediction(session), cumulativeTime)
  session.phaseTimers.push(predictionTimer)

  // 结果阶段
  cumulativeTime += TIME_CONFIG.phases.prediction * 1000
  console.log(`🔍 [DEBUG] Scheduling result switch at ${cumulativeTime}ms`)
  const resultTimer = setTimeout(() => switchToResult(session), cumulativeTime)
  session.phaseTimers.push(resultTimer)

  console.log(`⏰ Phase transitions scheduled:`, {
    discussion: `${TIME_CONFIG.phases.warmup}s`,
    bidding: `${TIME_CONFIG.phases.warmup + TIME_CONFIG.phases.discussion}s`,
    prediction: `${TIME_CONFIG.phases.warmup + TIME_CONFIG.phases.discussion + TIME_CONFIG.phases.bidding}s`,
    result: `${TIME_CONFIG.phases.warmup + TIME_CONFIG.phases.discussion + TIME_CONFIG.phases.bidding + TIME_CONFIG.phases.prediction}s`,
    totalDuration: `${cumulativeTime / 1000}s`,
    totalTimersScheduled: session.phaseTimers.length
  })
}

// 生成真实AI对话
async function generateRealAIDialogue(session: RealBiddingSession, isPhaseStart = false) {
  try {
    const persona = AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)]

    // 构建真实AI提示词
    const prompt = buildAIPrompt(session, persona, isPhaseStart)

    console.log(`🧠 Calling real AI for ${persona.name} in ${session.currentPhase} phase`)

    // 调用真实AI服务
    const aiResponse = await callRealAIService(prompt, persona)

    if (aiResponse.success) {
      const message = {
        messageId: Date.now().toString() + Math.random(),
        personaId: persona.id,
        phase: session.currentPhase,
        content: aiResponse.content,
        emotion: determineEmotion(aiResponse.content, session.currentPhase),
        bidValue: extractBidValue(aiResponse.content),
        timestamp: Date.now(),
        cost: aiResponse.cost, // 真实API成本
        tokens: aiResponse.tokens,
        isRealAI: true // 标记为真实AI生成
      }

      session.messages.push(message)
      session.realAICost += aiResponse.cost
      session.aiCallCount++

      // 广播真实AI消息
      broadcastAIMessage(session, message)

      // 更新真实成本统计
      broadcastCostUpdate(session)

    } else {
      console.error(`❌ AI call failed for ${persona.name}:`, aiResponse.error)
      // 失败时使用备用模板，避免中断体验
      generateFallbackMessage(session, persona, isPhaseStart)
    }

  } catch (error) {
    console.error('🚨 Error in real AI dialogue generation:', error)
    // 错误处理：使用备用消息
    generateFallbackMessage(session, persona, isPhaseStart)
  }
}

// 构建AI提示词
function buildAIPrompt(session: RealBiddingSession, persona: any, isPhaseStart: boolean): string {
  const baseContext = `你是${persona.name}。你的专长是${persona.specialty}。你的口头禅是"${persona.catchPhrase}"。

用户创意内容：
${session.ideaContent}

当前阶段：${session.currentPhase}
${isPhaseStart ? '这是该阶段的开始' : '继续当前阶段的讨论'}

历史消息：
${session.messages.slice(-3).map(msg => `${msg.personaId}: ${msg.content}`).join('\n')}
`

  const phasePrompts = {
    warmup: `现在是预热阶段。请作为${persona.name}，用专业且热情的语气介绍自己，并对这个创意表达初步兴趣。请保持角色的专业特点，回复控制在50字以内。`,

    discussion: `现在是深度讨论阶段。请作为${persona.name}，从你的专业角度深入分析这个创意的可行性、市场潜力和技术难点。与其他专家进行建设性的讨论。回复控制在100字以内。`,

    bidding: `现在是竞价阶段。请作为${persona.name}，评估这个创意的价值并考虑出价。如果你认为值得投资，在回复中明确说出"出价X积分"（X为具体数字）。解释你的出价理由。回复控制在80字以内。`,

    prediction: `现在是预测阶段。请作为${persona.name}，预测这个创意的未来发展前景、可能遇到的挑战和成功的关键因素。给出专业的建议。回复控制在120字以内。`,

    result: `现在是结果阶段。请作为${persona.name}，总结这个创意的整体评价，给出最终的投资建议或合作意向。保持积极和专业的态度。回复控制在80字以内。`
  }

  return baseContext + '\n\n' + phasePrompts[session.currentPhase]
}

// 调用真实AI服务
async function callRealAIService(prompt: string, persona: any) {
  try {
    // 根据persona选择不同的AI服务提供商
    const provider = selectAIProvider(persona)

    const startTime = Date.now()
    let response

    switch (provider) {
      case 'deepseek':
        response = await aiServiceManager.callDeepSeek(prompt, {
          max_tokens: 150,
          temperature: 0.8,
          model: 'deepseek-chat'
        })
        break

      case 'dashscope':
        response = await aiServiceManager.callDashScope(prompt, {
          max_tokens: 150,
          temperature: 0.8,
          model: 'qwen-plus'
        })
        break

      case 'zhipu':
        response = await aiServiceManager.callZhipuGLM(prompt, {
          max_tokens: 150,
          temperature: 0.8,
          model: 'glm-4'
        })
        break

      default:
        // 默认使用DeepSeek
        response = await aiServiceManager.callDeepSeek(prompt, {
          max_tokens: 150,
          temperature: 0.8,
          model: 'deepseek-chat'
        })
    }

    const duration = Date.now() - startTime

    if (response && response.choices && response.choices[0]) {
      return {
        success: true,
        content: response.choices[0].message.content.trim(),
        cost: calculateRealCost(response.usage?.total_tokens || 100, provider),
        tokens: response.usage?.total_tokens || 100,
        provider,
        duration
      }
    } else {
      return {
        success: false,
        error: 'Invalid AI response format'
      }
    }

  } catch (error) {
    console.error('AI service call error:', error)
    return {
      success: false,
      error: error.message || 'AI service unavailable'
    }
  }
}

// 选择AI服务提供商（负载均衡）
function selectAIProvider(persona: any): string {
  // 根据专家角色分配不同的AI提供商
  const providerMap = {
    'tech-pioneer-alex': 'deepseek',      // 技术专家用DeepSeek
    'business-tycoon-wang': 'dashscope',  // 商业大亨用DashScope
    'marketing-guru-lisa': 'zhipu',       // 营销大师用智谱GLM
    'financial-wizard-john': 'deepseek',  // 金融专家用DeepSeek
    'trend-master-allen': 'dashscope'     // 趋势大师用DashScope
  }

  return providerMap[persona.id] || 'deepseek'
}

// 计算真实API成本
function calculateRealCost(tokens: number, provider: string): number {
  const pricing = {
    deepseek: 0.00014,  // $0.00014 per 1K tokens
    dashscope: 0.0008,  // ¥0.008 per 1K tokens (约$0.0011)
    zhipu: 0.001       // ¥0.01 per 1K tokens (约$0.0014)
  }

  return (tokens / 1000) * (pricing[provider] || 0.0008)
}

// 从AI回复中提取出价
function extractBidValue(content: string): number | undefined {
  const bidMatch = content.match(/出价\s*(\d+)\s*积分/i)
  if (bidMatch) {
    return parseInt(bidMatch[1])
  }
  return undefined
}

// 根据内容判断情绪
function determineEmotion(content: string, phase: string): string {
  if (content.includes('出价') || content.includes('投资')) return 'excited'
  if (content.includes('风险') || content.includes('担心')) return 'worried'
  if (content.includes('成功') || content.includes('优秀')) return 'happy'
  if (content.includes('分析') || content.includes('专业')) return 'confident'

  // 根据阶段设置默认情绪
  const phaseEmotions = {
    warmup: 'excited',
    discussion: 'confident',
    bidding: 'excited',
    prediction: 'worried',
    result: 'happy'
  }

  return phaseEmotions[phase] || 'neutral'
}

// 生成备用消息（AI调用失败时使用）
function generateFallbackMessage(session: RealBiddingSession, persona: any, isPhaseStart: boolean) {
  const templates = {
    warmup: [`大家好！我是${persona.name}，${persona.catchPhrase}`, '很高兴参与这次创意评估！'],
    discussion: [`从${persona.specialty}的角度来看，这个创意有一定潜力`, '让我深入分析一下核心要素'],
    bidding: [`基于我的专业判断，这个创意值得投资`, '我正在评估合理的出价区间'],
    prediction: [`这个项目的未来发展需要关注几个关键要素`, '成功的关键在于执行力和市场时机'],
    result: [`综合评估后，我对这个创意持积极态度`, '期待看到项目的进一步发展']
  }

  const messages = templates[session.currentPhase] || templates.discussion
  const content = messages[Math.floor(Math.random() * messages.length)]

  const message = {
    messageId: Date.now().toString() + Math.random(),
    personaId: persona.id,
    phase: session.currentPhase,
    content,
    emotion: 'neutral',
    timestamp: Date.now(),
    cost: 0,
    tokens: 0,
    isRealAI: false, // 标记为备用消息
    isFallback: true
  }

  session.messages.push(message)
  broadcastAIMessage(session, message)
}

// 阶段切换函数
function switchToDiscussion(session: RealBiddingSession) {
  console.log(`🔍 [DEBUG] switchToDiscussion called for session ${session.ideaId}`)
  console.log(`🔍 [DEBUG] Session active: ${activeSessions.has(session.ideaId)}`)
  console.log(`🔍 [DEBUG] Session isEnding: ${session.isEnding}`)

  if (!activeSessions.has(session.ideaId) || session.isEnding) {
    console.log(`⏭️ Skip discussion switch - session ${session.ideaId} not active or ending`)
    return
  }

  console.log(`📢 Switching to DISCUSSION phase for session ${session.ideaId}`)
  session.currentPhase = 'discussion'
  session.phaseStartTime = new Date()
  session.timeRemaining = TIME_CONFIG.phases.discussion

  broadcastPhaseUpdate(session)
  generateRealAIDialogue(session, true)
}

function switchToBidding(session: RealBiddingSession) {
  console.log(`🔍 [DEBUG] switchToBidding called for session ${session.ideaId}`)
  console.log(`🔍 [DEBUG] Session active: ${activeSessions.has(session.ideaId)}`)
  console.log(`🔍 [DEBUG] Session isEnding: ${session.isEnding}`)

  if (!activeSessions.has(session.ideaId) || session.isEnding) {
    console.log(`⏭️ Skip bidding switch - session ${session.ideaId} not active or ending`)
    return
  }

  console.log(`💰 Switching to BIDDING phase for session ${session.ideaId}`)
  session.currentPhase = 'bidding'
  session.phaseStartTime = new Date()
  session.timeRemaining = TIME_CONFIG.phases.bidding

  broadcastPhaseUpdate(session)
  generateRealAIDialogue(session, true)
}

function switchToPrediction(session: RealBiddingSession) {
  console.log(`🔍 [DEBUG] switchToPrediction called for session ${session.ideaId}`)
  console.log(`🔍 [DEBUG] Session active: ${activeSessions.has(session.ideaId)}`)
  console.log(`🔍 [DEBUG] Session isEnding: ${session.isEnding}`)

  if (!activeSessions.has(session.ideaId) || session.isEnding) {
    console.log(`⏭️ Skip prediction switch - session ${session.ideaId} not active or ending`)
    return
  }

  console.log(`🔮 Switching to PREDICTION phase for session ${session.ideaId}`)
  session.currentPhase = 'prediction'
  session.phaseStartTime = new Date()
  session.timeRemaining = TIME_CONFIG.phases.prediction

  broadcastPhaseUpdate(session)
  generateRealAIDialogue(session, true)
}

function switchToResult(session: RealBiddingSession) {
  console.log(`🔍 [DEBUG] switchToResult called for session ${session.ideaId}`)
  console.log(`🔍 [DEBUG] Session active: ${activeSessions.has(session.ideaId)}`)
  console.log(`🔍 [DEBUG] Session isEnding: ${session.isEnding}`)

  if (!activeSessions.has(session.ideaId) || session.isEnding) {
    console.log(`⏭️ Skip result switch - session ${session.ideaId} not active or ending`)
    return
  }

  console.log(`🏆 Switching to RESULT phase for session ${session.ideaId}`)
  session.currentPhase = 'result'
  session.phaseStartTime = new Date()
  session.timeRemaining = TIME_CONFIG.phases.result

  broadcastPhaseUpdate(session)
  generateRealAIDialogue(session, true)

  // 使用配置的结果展示时间后结束会话
  const endDelay = TIME_CONFIG.phases.result * 1000
  console.log(`⏰ Session will end in ${TIME_CONFIG.phases.result} seconds (${endDelay}ms)`)
  console.log(`🔍 [DEBUG] Setting end timer for session ${session.ideaId}`)

  const endTimer = setTimeout(() => {
    console.log(`⏰ [DEBUG] End timer fired for session ${session.ideaId}`)
    endSession(session)
  }, endDelay)
  session.phaseTimers.push(endTimer)

  console.log(`🔍 [DEBUG] End timer scheduled, total timers: ${session.phaseTimers.length}`)
}

// 广播消息函数
function broadcastAIMessage(session: RealBiddingSession, message: any) {
  const messageType = message.bidValue ? 'bid.placed' : 'persona.speech'

  broadcastToSession(session.ideaId, {
    type: messageType,
    payload: message
  })
}

function broadcastPhaseUpdate(session: RealBiddingSession) {
  broadcastToSession(session.ideaId, {
    type: 'phase.changed',
    payload: {
      phase: session.currentPhase,
      timeRemaining: session.timeRemaining,
      phaseStartTime: session.phaseStartTime.toISOString()
    }
  })
}

function broadcastCostUpdate(session: RealBiddingSession) {
  broadcastToSession(session.ideaId, {
    type: 'ai.cost.update',
    payload: {
      totalCost: session.realAICost,
      callCount: session.aiCallCount,
      averageCostPerCall: session.aiCallCount > 0 ? session.realAICost / session.aiCallCount : 0,
      isRealAI: true
    }
  })
}

function broadcastToSession(ideaId: string, message: any) {
  const session = activeSessions.get(ideaId)
  if (!session) return

  session.participants.forEach(clientId => {
    const client = connectedClients.get(clientId)
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  })
}

// 结束会话
function endSession(session: RealBiddingSession) {
  console.log(`🔍 [DEBUG] endSession called for session ${session.ideaId}`)

  // 防止重复调用
  if (session.isEnding) {
    console.log(`⚠️ Session ${session.ideaId} is already ending, skipping`)
    return
  }

  session.isEnding = true
  console.log(`🔍 [DEBUG] Set session.isEnding = true`)

  console.log(`🏁 Ending real AI session ${session.ideaId}`)
  console.log(`📊 Session stats:`)
  console.log(`   - Total AI calls: ${session.aiCallCount}`)
  console.log(`   - Total cost: $${session.realAICost.toFixed(4)}`)
  console.log(`   - Messages generated: ${session.messages.length}`)
  console.log(`   - Duration: ${((Date.now() - session.startTime.getTime()) / 1000).toFixed(1)}s`)

  // 清理所有计时器
  console.log(`🔍 [DEBUG] Clearing ${session.phaseTimers.length} timers`)
  session.phaseTimers.forEach(timer => {
    clearTimeout(timer)
  })
  session.phaseTimers = []

  // 广播会话结束消息
  console.log(`📢 [DEBUG] Broadcasting session.ended message to ${session.participants.size} participants`)
  broadcastToSession(session.ideaId, {
    type: 'session.ended',
    payload: {
      totalCost: session.realAICost,
      callCount: session.aiCallCount,
      messagesGenerated: session.messages.length,
      duration: Date.now() - session.startTime.getTime(),
      finalPhase: session.currentPhase,
      highestBid: session.highestBid,
      timestamp: Date.now()
    }
  })
  console.log(`✅ [DEBUG] session.ended message broadcasted`)

  // 延迟清理会话数据，确保客户端收到结束消息
  setTimeout(() => {
    // 清理会话数据
    session.participants.forEach(clientId => {
      connectedClients.delete(clientId)
    })

    activeSessions.delete(session.ideaId)
    console.log(`✅ Session ${session.ideaId} fully cleaned up`)
  }, 2000)
}

// WebSocket处理函数
export async function handleRealBiddingWebSocket(request: NextRequest, ideaId: string) {
  console.log(`🔌 Handling real AI WebSocket connection for idea: ${ideaId}`)

  try {
    // 检查是否已有活跃会话
    let session = activeSessions.get(ideaId)
    if (!session) {
      console.log(`📝 Creating new real AI session for idea: ${ideaId}`)
      // 创建新的真实AI会话
      session = createRealSession(ideaId, `Demo idea content for ${ideaId}`)
    }

    // 在真实WebSocket环境中，这里会升级连接
    // 当前返回HTTP响应表示WebSocket端点可用
    return new Response(JSON.stringify({
      success: true,
      message: 'Real AI WebSocket endpoint ready',
      sessionId: session.id,
      phase: session.currentPhase,
      timeRemaining: session.timeRemaining,
      realAI: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Error handling real AI WebSocket:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to initialize real AI WebSocket session'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

// 全局WebSocket广播函数（供其他模块使用）
if (typeof global !== 'undefined') {
  global.broadcastToSession = broadcastToSession
}

export {
  createRealSession,
  generateRealAIDialogue,
  activeSessions,
  connectedClients
}