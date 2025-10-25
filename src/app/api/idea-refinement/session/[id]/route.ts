/**
 * 创意完善工作坊 - 获取会话详情API
 *
 * GET /api/idea-refinement/session/[id]
 *
 * 功能：
 * 1. 根据documentId获取会话详情
 * 2. 返回完整的会话数据（包含refinedDocument、对话历史、进度等）
 * 3. 支持恢复会话功能
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { REFINEMENT_DIMENSIONS } from '@/lib/idea-refinement/prompts'
import type {
  GetRefinementSessionResponse,
  RefinedDocument,
  ConversationMessage
} from '@/types/idea-refinement'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: '缺少文档ID' },
        { status: 400 }
      )
    }

    console.log(`📖 获取创意完善工作坊会话: ${documentId}`)

    // 从数据库读取会话
    const document = await prisma.ideaRefinementDocument.findUnique({
      where: { id: documentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        biddingSession: {
          select: {
            id: true,
            createdAt: true
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      )
    }

    // 计算当前维度信息
    const currentDimensionIndex = document.currentDimension
    const currentDimension = REFINEMENT_DIMENSIONS[currentDimensionIndex]

    // 计算完成的维度信息
    const completedDimensions = document.completedDimensions as string[]
    const completedDimensionsInfo = completedDimensions.map(dimId => {
      const dim = REFINEMENT_DIMENSIONS.find(d => d.id === dimId)
      return dim ? { id: dim.id, name: dim.name, icon: dim.icon } : null
    }).filter(Boolean)

    // 统计信息
    const totalRounds = REFINEMENT_DIMENSIONS.reduce((sum, d) => sum + d.rounds, 0) // 31轮
    const completedRoundsCount = completedDimensions.length * 5 +
      (currentDimensionIndex > completedDimensions.length ? document.currentRound - 1 : 0)

    // 转换为前端类型
    const response: GetRefinementSessionResponse = {
      success: true,
      document: {
        id: document.id,
        userId: document.userId,
        ideaTitle: document.ideaTitle,
        ideaContent: document.ideaContent,
        biddingSessionId: document.biddingSessionId || undefined,
        evaluationScore: document.evaluationScore as any,
        refinedDocument: document.refinedDocument as RefinedDocument,
        conversationHistory: document.conversationHistory as ConversationMessage[],
        currentDimension: document.currentDimension,
        currentRound: document.currentRound,
        completedDimensions: document.completedDimensions,
        progress: document.progress,
        status: document.status as any,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
        completedAt: document.completedAt?.toISOString()
      },
      currentDimensionInfo: {
        id: currentDimension.id,
        name: currentDimension.name,
        icon: currentDimension.icon,
        currentRound: document.currentRound,
        totalRounds: currentDimension.rounds
      },
      completedDimensionsInfo: completedDimensionsInfo as any,
      statistics: {
        totalDimensions: REFINEMENT_DIMENSIONS.length,
        completedDimensionsCount: completedDimensions.length,
        totalRounds,
        completedRounds: completedRoundsCount,
        totalMessages: (document.conversationHistory as any[]).length
      }
    }

    console.log(`✅ 会话获取成功，当前进度: ${document.progress}%，状态: ${document.status}`)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 获取创意完善工作坊会话失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误'
      },
      { status: 500 }
    )
  }
}
