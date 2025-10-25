/**
 * 创意完善工作坊 - 启动API
 *
 * POST /api/idea-refinement/start
 *
 * 功能：
 * 1. 创建创意完善工作坊会话
 * 2. 初始化6个维度的空数据结构
 * 3. 返回第一条AI引导消息（开始维度1的第1轮对话）
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  REFINEMENT_DIMENSIONS,
  getPromptForDimensionRound
} from '@/lib/idea-refinement/prompts'
import type {
  StartRefinementRequest,
  StartRefinementResponse,
  ConversationMessage
} from '@/types/idea-refinement'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body: StartRefinementRequest = await request.json()
    const { userId, ideaTitle, ideaContent, biddingSessionId, evaluationScore } = body

    // 参数验证
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      )
    }

    if (!ideaTitle || !ideaContent) {
      return NextResponse.json(
        { success: false, error: '缺少创意标题或内容' },
        { status: 400 }
      )
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    console.log(`🚀 启动创意完善工作坊 - 用户: ${user.username}, 创意: ${ideaTitle}`)

    // 初始化refinedDocument结构（6个维度的空对象）
    const initialRefinedDocument = {
      basicInfo: {
        ideaTitle,
        ideaContent,
        createdAt: new Date().toISOString()
      },
      targetUser: {},
      businessModel: {},
      marketAnalysis: {},
      competitiveAdvantage: {},
      productDetails: {},
      implementation: {}
    }

    // 创建工作坊会话
    const document = await prisma.ideaRefinementDocument.create({
      data: {
        userId,
        ideaTitle,
        ideaContent,
        biddingSessionId: biddingSessionId || null,
        evaluationScore: evaluationScore ? (evaluationScore as any) : null,
        refinedDocument: initialRefinedDocument as any,
        conversationHistory: [],
        currentDimension: 0, // 从第1个维度开始（targetUser）
        currentRound: 1, // 从第1轮开始
        completedDimensions: [],
        progress: 0,
        status: 'IN_PROGRESS'
      }
    })

    console.log(`✅ 工作坊会话创建成功: ${document.id}`)

    // 获取第一个维度
    const firstDimension = REFINEMENT_DIMENSIONS[0]

    // 生成第一条AI消息（维度1，轮次1）
    const systemPrompt = getPromptForDimensionRound(firstDimension.id, 0) // round 0 是systemPrompt
    const round1Prompt = getPromptForDimensionRound(firstDimension.id, 1)

    const initialMessage: ConversationMessage = {
      role: 'assistant',
      content: `${firstDimension.icon} 欢迎来到创意完善工作坊！

我将引导您完善以下创意：
**${ideaTitle}**

我们将通过6个维度来深度完善您的创意：
${REFINEMENT_DIMENSIONS.map((d, i) => `${i + 1}. ${d.icon} ${d.name} (${d.rounds}轮对话)`).join('\n')}

现在，让我们开始第1个维度：**${firstDimension.name}**

---

${round1Prompt}`,
      timestamp: new Date().toISOString(),
      dimensionId: firstDimension.id,
      round: 1
    }

    // 更新会话，添加初始消息
    await prisma.ideaRefinementDocument.update({
      where: { id: document.id },
      data: {
        conversationHistory: [initialMessage]
      }
    })

    // 返回响应
    const response: StartRefinementResponse = {
      success: true,
      documentId: document.id,
      initialMessage,
      currentDimension: {
        id: firstDimension.id,
        name: firstDimension.name,
        icon: firstDimension.icon,
        totalRounds: firstDimension.rounds
      }
    }

    console.log('✅ 创意完善工作坊启动成功')
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 创意完善工作坊启动失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误'
      },
      { status: 500 }
    )
  }
}
