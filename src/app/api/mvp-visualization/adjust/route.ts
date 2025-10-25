/**
 * MVP前端可视化工作坊 - 代码调整API
 *
 * POST /api/mvp-visualization/adjust
 *
 * 功能：
 * 1. 接收用户的调整请求（最多5轮对话）
 * 2. 调用DeepSeek AI根据用户需求调整HTML和CSS代码
 * 3. 保存调整历史和新代码版本
 * 4. 返回更新后的代码和AI说明
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callDeepSeekAPI, type Message } from '@/lib/ai/deepseek-client'
import type {
  SubmitAdjustmentRequest,
  SubmitAdjustmentResponse,
  MVPConversationMessage,
  GeneratedCode,
  AdjustmentRecord
} from '@/types/mvp-visualization'

export const dynamic = 'force-dynamic'

const MAX_ROUNDS = 5 // 最多5轮对话优化

export async function POST(request: NextRequest) {
  try {
    const body: SubmitAdjustmentRequest = await request.json()
    const { sessionId, adjustmentRequest } = body

    // 参数验证
    if (!sessionId || !adjustmentRequest) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    console.log(`🔧 处理代码调整请求 - 会话: ${sessionId}`)

    // 获取会话数据
    const session = await prisma.mVPVisualizationSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      )
    }

    if (session.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: '工作坊已完成，无法继续调整' },
        { status: 400 }
      )
    }

    const currentRound = session.currentRound

    // 检查是否超过最大轮次
    if (currentRound >= MAX_ROUNDS) {
      return NextResponse.json(
        { success: false, error: `已达到最大调整轮次（${MAX_ROUNDS}轮），请导出代码` },
        { status: 400 }
      )
    }

    console.log(`📍 当前轮次: ${currentRound}/${MAX_ROUNDS}`)

    // 保存用户消息
    const conversationHistory = session.conversationHistory as MVPConversationMessage[]
    const userMsg: MVPConversationMessage = {
      role: 'user',
      content: adjustmentRequest,
      timestamp: new Date().toISOString(),
      round: currentRound,
      type: 'adjustment'
    }
    conversationHistory.push(userMsg)

    // 构建AI Prompt
    const systemPrompt = `你是一位专业的前端开发专家，擅长根据用户反馈快速调整HTML和CSS代码。

你的任务：
1. 理解用户的调整需求（功能修改、样式调整、布局优化等）
2. 修改现有的HTML和CSS代码
3. 确保修改后的代码可以直接在浏览器中运行
4. 保持代码简洁、语义化、响应式
5. 不要使用外部框架，纯HTML+CSS

输出格式：
你必须返回三部分内容，使用特殊分隔符：

===HTML===
[完整的HTML代码]

===CSS===
[完整的CSS代码]

===说明===
[简要说明本次调整的内容和改进点]`

    // 获取当前代码
    const currentHTML = session.generatedHTML
    const currentCSS = session.generatedCSS

    // 构建对话上下文（包含最近的调整历史）
    const recentMessages = conversationHistory.slice(-6) // 最近6条消息（3轮对话）
    const contextMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `当前代码版本：

**HTML代码**：
\`\`\`html
${currentHTML}
\`\`\`

**CSS代码**：
\`\`\`css
${currentCSS}
\`\`\`

这是第 ${currentRound} 轮调整。`
      },
      ...recentMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: `用户的调整需求：${adjustmentRequest}

请根据上述需求调整代码，并按照指定格式返回完整的HTML和CSS代码。`
      }
    ]

    // 调用DeepSeek API
    console.log('🤖 调用DeepSeek API进行代码调整...')
    const startTime = Date.now()

    const aiResponse = await callDeepSeekAPI(contextMessages, {
      temperature: 0.7,
      max_tokens: 6000
    })

    const adjustmentTime = Date.now() - startTime
    console.log(`✅ 代码调整完成，耗时: ${adjustmentTime}ms`)

    // 解析AI返回的代码
    const { html, css, explanation } = parseAdjustedCode(aiResponse.content)

    if (!html || !css) {
      return NextResponse.json(
        { success: false, error: 'AI生成的代码格式不正确，请重试' },
        { status: 500 }
      )
    }

    // 创建调整记录
    const adjustmentRecord: AdjustmentRecord = {
      round: currentRound,
      userRequest: adjustmentRequest,
      previousHTML: currentHTML,
      previousCSS: currentCSS,
      newHTML: html,
      newCSS: css,
      adjustedAt: new Date().toISOString(),
      adjustmentTime
    }

    // 更新调整历史
    const adjustmentHistory = session.adjustmentHistory as AdjustmentRecord[]
    adjustmentHistory.push(adjustmentRecord)

    // 创建AI说明消息
    const aiMessage: MVPConversationMessage = {
      role: 'assistant',
      content: `我已经根据您的需求调整了代码！

${explanation || '代码已更新，请在预览区域查看效果。'}

**本次调整**：
${adjustmentRequest}

**当前进度**：第 ${currentRound}/${MAX_ROUNDS} 轮调整

${currentRound < MAX_ROUNDS
  ? `您还可以进行 ${MAX_ROUNDS - currentRound} 轮调整。如果对当前效果满意，可以直接导出代码。`
  : '🎉 已完成全部5轮调整！请导出代码以完成工作坊。'
}`,
      timestamp: new Date().toISOString(),
      round: currentRound,
      type: 'adjustment',
      code: {
        html,
        css,
        generatedAt: new Date().toISOString(),
        model: 'deepseek-chat',
        generationTime: adjustmentTime
      }
    }

    conversationHistory.push(aiMessage)

    // 更新会话
    const nextRound = currentRound + 1
    const updateData: any = {
      generatedHTML: html,
      generatedCSS: css,
      conversationHistory: conversationHistory,
      adjustmentHistory: adjustmentHistory,
      currentRound: nextRound
    }

    // 如果达到最大轮次，标记为准备导出
    if (nextRound > MAX_ROUNDS) {
      updateData.status = 'READY_TO_EXPORT'
    }

    await prisma.mVPVisualizationSession.update({
      where: { id: sessionId },
      data: updateData
    })

    console.log(`💾 会话已更新，当前轮次: ${nextRound}/${MAX_ROUNDS}`)

    // 返回响应
    const response: SubmitAdjustmentResponse = {
      success: true,
      code: {
        html,
        css,
        generatedAt: new Date().toISOString(),
        model: 'deepseek-chat',
        generationTime: adjustmentTime
      },
      aiMessage,
      currentRound: nextRound,
      maxRounds: MAX_ROUNDS,
      canAdjustMore: nextRound <= MAX_ROUNDS,
      adjustmentRecord
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 代码调整失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '代码调整失败，请重试'
      },
      { status: 500 }
    )
  }
}

/**
 * 解析AI调整后的代码
 * 提取HTML、CSS和说明部分
 */
function parseAdjustedCode(content: string): {
  html: string
  css: string
  explanation: string
} {
  // 使用正则表达式提取各部分
  const htmlMatch = content.match(/===HTML===\s*([\s\S]*?)\s*===CSS===/i)
  const cssMatch = content.match(/===CSS===\s*([\s\S]*?)\s*===说明===/i)
  const explanationMatch = content.match(/===说明===\s*([\s\S]*?)$/i)

  // 如果匹配失败，尝试备用解析策略
  if (!htmlMatch || !cssMatch) {
    console.warn('⚠️ 使用备用解析策略')

    // 尝试直接提取代码块
    const htmlCodeBlock = content.match(/```html\s*([\s\S]*?)\s*```/i)
    const cssCodeBlock = content.match(/```css\s*([\s\S]*?)\s*```/i)

    return {
      html: htmlCodeBlock?.[1]?.trim() || '',
      css: cssCodeBlock?.[1]?.trim() || '',
      explanation: '代码已调整'
    }
  }

  return {
    html: htmlMatch[1].trim(),
    css: cssMatch[1].trim(),
    explanation: explanationMatch?.[1]?.trim() || ''
  }
}
