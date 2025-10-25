/**
 * 创意完善工作坊 - AI对话API
 *
 * POST /api/idea-refinement/chat
 *
 * 功能：
 * 1. 接收用户的回复
 * 2. 根据当前维度和轮次生成AI引导问题
 * 3. 提取和保存用户回答中的关键信息
 * 4. 更新会话进度
 * 5. 判断是否进入下一轮或下一维度
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callDeepSeekAPI, type Message } from '@/lib/ai/deepseek-client'
import {
  REFINEMENT_DIMENSIONS,
  getPromptForDimensionRound,
  getDimensionConfig,
  getNextDimension,
  extractFrontendDesignPrompt
} from '@/lib/idea-refinement/prompts'
import type {
  SubmitUserReplyRequest,
  SubmitUserReplyResponse,
  ConversationMessage,
  RefinedDocument
} from '@/types/idea-refinement'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body: SubmitUserReplyRequest = await request.json()
    const { documentId, userMessage } = body

    // 参数验证
    if (!documentId || !userMessage) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    console.log(`💬 处理用户回复 - 文档: ${documentId}`)

    // 获取会话数据
    const document = await prisma.ideaRefinementDocument.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      )
    }

    if (document.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: '工作坊已完成，无法继续对话' },
        { status: 400 }
      )
    }

    const currentDimensionIndex = document.currentDimension
    const currentRound = document.currentRound
    const currentDimension = REFINEMENT_DIMENSIONS[currentDimensionIndex]

    console.log(`📍 当前位置: 维度${currentDimensionIndex + 1} ${currentDimension.name} - 第${currentRound}轮`)

    // 保存用户消息
    const conversationHistory = document.conversationHistory as ConversationMessage[]
    const userMsg: ConversationMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      dimensionId: currentDimension.id,
      round: currentRound
    }
    conversationHistory.push(userMsg)

    // 判断是否需要继续当前维度的对话，还是进入下一轮/下一维度
    let nextRound = currentRound
    let nextDimensionIndex = currentDimensionIndex
    let needsMoreInput = true
    let completedDocument: RefinedDocument | undefined
    let nextDimensionInfo: any

    // 如果当前轮次已完成，进入下一轮
    if (currentRound < currentDimension.rounds) {
      nextRound = currentRound + 1
      console.log(`➡️  进入第${nextRound}轮对话`)
    } else {
      // 当前维度完成，检查是否有下一个维度
      const completedDimensions = [...document.completedDimensions, currentDimension.id]

      if (currentDimensionIndex < REFINEMENT_DIMENSIONS.length - 1) {
        // 进入下一个维度
        nextDimensionIndex = currentDimensionIndex + 1
        nextRound = 1
        const nextDim = REFINEMENT_DIMENSIONS[nextDimensionIndex]
        console.log(`✅ 维度${currentDimensionIndex + 1}完成，进入维度${nextDimensionIndex + 1}: ${nextDim.name}`)

        nextDimensionInfo = {
          id: nextDim.id,
          name: nextDim.name,
          icon: nextDim.icon,
          totalRounds: nextDim.rounds
        }
      } else {
        // 所有维度完成
        console.log('🎉 所有维度已完成！')
        needsMoreInput = false
        completedDocument = document.refinedDocument as RefinedDocument
      }
    }

    // 生成AI回复
    const aiMessage = await generateAIResponse(
      document,
      userMessage,
      nextDimensionIndex,
      nextRound,
      conversationHistory
    )

    conversationHistory.push(aiMessage)

    // 计算进度
    const totalRounds = REFINEMENT_DIMENSIONS.reduce((sum, d) => sum + d.rounds, 0) // 总轮次：31轮
    const completedRounds = currentDimensionIndex * 5 + currentRound // 已完成轮次（简化计算）
    const progress = Math.min((completedRounds / totalRounds) * 100, 100)

    // 更新数据库
    const updateData: any = {
      conversationHistory: conversationHistory,
      currentDimension: nextDimensionIndex,
      currentRound: nextRound,
      progress: Math.round(progress)
    }

    // 如果当前维度完成，更新completedDimensions
    if (currentRound >= currentDimension.rounds) {
      updateData.completedDimensions = [...document.completedDimensions, currentDimension.id]
    }

    // 如果所有维度完成，更新状态
    if (!needsMoreInput) {
      updateData.status = 'COMPLETED'
      updateData.completedAt = new Date()
    }

    await prisma.ideaRefinementDocument.update({
      where: { id: documentId },
      data: updateData
    })

    console.log(`💾 会话已更新，进度: ${Math.round(progress)}%`)

    // 返回响应
    const response: SubmitUserReplyResponse = {
      success: true,
      aiMessage,
      needsMoreInput,
      progress: {
        currentDimension: nextDimensionIndex,
        currentRound: nextRound,
        overallProgress: Math.round(progress)
      },
      nextDimension: nextDimensionInfo,
      completedDocument
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 对话处理失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '对话处理失败'
      },
      { status: 500 }
    )
  }
}

/**
 * 生成AI回复
 * 根据当前维度和轮次，调用DeepSeek生成合适的引导问题
 */
async function generateAIResponse(
  document: any,
  userMessage: string,
  dimensionIndex: number,
  round: number,
  conversationHistory: ConversationMessage[]
): Promise<ConversationMessage> {
  const dimension = REFINEMENT_DIMENSIONS[dimensionIndex]

  // 获取系统Prompt和当前轮次的Prompt
  const systemPrompt = getPromptForDimensionRound(dimension.id, 0)
  const roundPrompt = getPromptForDimensionRound(dimension.id, round)

  // 构建对话历史（最近5轮）
  const recentHistory = conversationHistory.slice(-10) // 最近10条消息

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    {
      role: 'user',
      content: `用户的回答：${userMessage}\n\n${roundPrompt}`
    }
  ]

  try {
    console.log(`🤖 调用AI生成回复...`)
    const aiResponse = await callDeepSeekAPI(messages, {
      temperature: 0.8,
      max_tokens: 2000
    })

    return {
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date().toISOString(),
      dimensionId: dimension.id,
      round
    }
  } catch (error) {
    console.error('❌ AI回复生成失败，使用备用回复')

    // 备用回复
    return {
      role: 'assistant',
      content: `感谢您的回答！

${roundPrompt}

请继续描述您的想法，越详细越好。`,
      timestamp: new Date().toISOString(),
      dimensionId: dimension.id,
      round
    }
  }
}
