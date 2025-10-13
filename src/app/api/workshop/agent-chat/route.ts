/**
 * 工作坊 Agent 聊天 API
 *
 * 处理与AI Agent的对话交互
 * 集成OpenAI API，提供智能回复
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  generateAgentPrompt,
  type WorkshopId,
  type AgentId,
  FALLBACK_RESPONSES,
  WORKSHOP_AGENT_CONFIG
} from '@/lib/workshop/agent-prompts'
import { prisma } from '@/lib/prisma'

// OpenAI配置
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = 'gpt-4'

// 请求接口
interface AgentChatRequest {
  workshopId: WorkshopId
  agentId: AgentId
  sessionId: string
  userMessage: string
  formContext: Record<string, any>
  conversationHistory: Array<{
    id: string
    agentId: AgentId
    content: string
    type: string
    timestamp: string
  }>
  currentStep: number
  totalSteps: number
  scenario?: 'user' | 'validation' | 'inspiration' | 'knowledge' | 'case_study'
  relatedField?: string
}

// 响应接口
interface AgentChatResponse {
  success: boolean
  data?: {
    message: string
    type: 'question' | 'feedback' | 'suggestion' | 'validation' | 'case_study' | 'knowledge'
    suggestions?: string[]
    resources?: Array<{
      title: string
      url: string
      type: 'article' | 'video' | 'tool' | 'template'
    }>
    nextAction?: {
      type: 'fill_field' | 'review_section' | 'proceed'
      target?: string
    }
  }
  error?: string
}

// OpenAI API调用
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API Key未配置')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API错误: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenAI返回空结果')
    }

    return data.choices[0].message.content.trim()

  } catch (error) {
    console.error('OpenAI API调用失败:', error)
    throw error
  }
}

// 解析Agent回复，提取结构化信息
function parseAgentResponse(response: string, scenario: string) {
  // 默认类型映射
  const typeMapping: Record<string, string> = {
    'validation': 'validation',
    'inspiration': 'suggestion',
    'knowledge': 'knowledge',
    'case_study': 'case_study',
    'user': 'feedback'
  }

  // 尝试识别建议和资源（简单的关键词匹配）
  const suggestions: string[] = []
  const resources: Array<{title: string, url: string, type: string}> = []

  // 提取建议（寻找编号列表）
  const suggestionMatches = response.match(/[1-9]\.\s*(.+?)(?=\n|$)/g)
  if (suggestionMatches) {
    suggestionMatches.forEach(match => {
      const suggestion = match.replace(/^[1-9]\.\s*/, '').trim()
      if (suggestion) {
        suggestions.push(suggestion)
      }
    })
  }

  // 检测下一步行动
  let nextAction: {type: string, target?: string} | undefined

  if (response.includes('继续填写') || response.includes('下一步')) {
    nextAction = { type: 'proceed' }
  } else if (response.includes('回顾') || response.includes('检查')) {
    nextAction = { type: 'review_section' }
  } else if (response.includes('填写') && response.includes('字段')) {
    nextAction = { type: 'fill_field' }
  }

  return {
    message: response,
    type: typeMapping[scenario] || 'feedback',
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    resources: resources.length > 0 ? resources : undefined,
    nextAction
  }
}

// 保存对话历史到数据库
async function saveConversationToDatabase(
  sessionId: string,
  agentId: AgentId,
  userMessage: string,
  agentResponse: string
) {
  try {
    // 获取当前会话
    const session = await prisma.workshopSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      console.warn(`工作坊会话 ${sessionId} 不存在，跳过对话保存`)
      return
    }

    // 解析现有对话历史
    const currentHistory = Array.isArray(session.conversationHistory)
      ? session.conversationHistory as any[]
      : []

    // 添加新的对话记录
    const newMessages = [
      {
        id: `user-${Date.now()}`,
        agentId: 'user',
        content: userMessage,
        type: 'user_message',
        timestamp: new Date().toISOString()
      },
      {
        id: `${agentId}-${Date.now()}`,
        agentId,
        content: agentResponse,
        type: 'agent_reply',
        timestamp: new Date().toISOString()
      }
    ]

    const updatedHistory = [...currentHistory, ...newMessages]

    // 限制历史记录数量（最多保留50条）
    const limitedHistory = updatedHistory.slice(-50)

    // 更新数据库
    await prisma.workshopSession.update({
      where: { id: sessionId },
      data: {
        conversationHistory: limitedHistory,
        lastActivityAt: new Date()
      }
    })

  } catch (error) {
    console.error('保存对话历史失败:', error)
    // 不抛出错误，避免影响主要功能
  }
}

// POST处理器
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求数据
    const body: AgentChatRequest = await request.json()
    const {
      workshopId,
      agentId,
      sessionId,
      userMessage,
      formContext,
      conversationHistory,
      currentStep,
      totalSteps,
      scenario = 'user',
      relatedField
    } = body

    // 验证必需参数
    if (!workshopId || !agentId || !sessionId || !userMessage) {
      return NextResponse.json({
        success: false,
        error: '缺少必需参数'
      }, { status: 400 })
    }

    // 验证工作坊和Agent是否存在
    if (!WORKSHOP_AGENT_CONFIG[workshopId]) {
      return NextResponse.json({
        success: false,
        error: '无效的工作坊ID'
      }, { status: 400 })
    }

    if (!WORKSHOP_AGENT_CONFIG[workshopId].agents[agentId]) {
      return NextResponse.json({
        success: false,
        error: '无效的Agent ID'
      }, { status: 400 })
    }

    console.log(`🤖 Agent聊天请求: ${workshopId}/${agentId}`, {
      scenario,
      messageLength: userMessage.length,
      formFields: Object.keys(formContext).length,
      historyLength: conversationHistory.length
    })

    // 生成Agent提示词
    const { systemPrompt, userPrompt } = generateAgentPrompt({
      workshopId,
      agentId,
      scenario,
      context: {
        currentStep,
        totalSteps,
        fieldName: relatedField,
        fieldValue: scenario === 'validation' ? userMessage : undefined,
        userInput: userMessage,
        formContext,
        conversationHistory,
        topic: scenario === 'knowledge' ? relatedField : undefined
      }
    })

    // 调用OpenAI API
    const aiResponse = await callOpenAI(systemPrompt, userPrompt)

    // 解析响应
    const parsedResponse = parseAgentResponse(aiResponse, scenario)

    // 异步保存对话历史
    saveConversationToDatabase(sessionId, agentId, userMessage, aiResponse)
    .catch(error => {
      console.error('异步保存对话历史失败:', error)
    })

    console.log(`✅ Agent回复生成成功`, {
      agentId,
      responseLength: aiResponse.length,
      type: parsedResponse.type,
      hasSuggestions: !!parsedResponse.suggestions,
      hasNextAction: !!parsedResponse.nextAction
    })

    return NextResponse.json({
      success: true,
      data: parsedResponse
    })

  } catch (error) {
    console.error('❌ Agent聊天API错误:', error)

    // 根据错误类型返回不同的错误信息
    let errorMessage = FALLBACK_RESPONSES.api_error
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('OpenAI')) {
        errorMessage = '智能助手暂时无法响应，请稍后再试'
      } else if (error.message.includes('参数')) {
        errorMessage = '请求参数错误'
        statusCode = 400
      } else if (error.message.includes('权限') || error.message.includes('认证')) {
        errorMessage = '服务认证失败'
        statusCode = 401
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: statusCode })
  }
}

// GET处理器（用于健康检查）
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: '工作坊Agent聊天API运行正常',
    timestamp: new Date().toISOString(),
    available_workshops: Object.keys(WORKSHOP_AGENT_CONFIG),
    available_agents: Object.keys(WORKSHOP_AGENT_CONFIG['demand-validation'].agents)
  })
}