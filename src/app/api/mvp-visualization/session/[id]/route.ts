/**
 * MVP前端可视化工作坊 - 获取会话详情API
 *
 * GET /api/mvp-visualization/session/[id]
 *
 * 功能：
 * 1. 根据sessionId获取会话详情
 * 2. 返回完整的会话数据（包含frontendRequirements、代码、对话历史等）
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type {
  GetMVPSessionResponse,
  MVPVisualizationSessionData
} from '@/types/mvp-visualization'

export const dynamic = 'force-dynamic'


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: '缺少会话ID' },
        { status: 400 }
      )
    }

    console.log(`📖 获取MVP工作坊会话: ${sessionId}`)

    // 从数据库读取会话
    const session = await prisma.mVPVisualizationSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        refinementDocument: {
          select: {
            id: true,
            ideaTitle: true,
            ideaContent: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      )
    }

    // 转换为前端类型
    const sessionData: MVPVisualizationSessionData = {
      id: session.id,
      userId: session.userId,
      refinementDocumentId: session.refinementDocumentId || undefined,
      frontendRequirements: session.frontendRequirements as any,
      generatedHTML: session.generatedHTML,
      generatedCSS: session.generatedCSS,
      conversationHistory: session.conversationHistory as any,
      currentRound: session.currentRound,
      adjustmentHistory: session.adjustmentHistory as any,
      creditsDeducted: session.creditsDeducted,
      isFromBidding: session.isFromBidding,
      finalHTMLFile: session.finalHTMLFile || undefined,
      updatedPlanDocument: session.updatedPlanDocument || undefined,
      status: session.status as any,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      completedAt: session.completedAt?.toISOString()
    }

    const response: GetMVPSessionResponse = {
      success: true,
      session: sessionData
    }

    console.log(`✅ 会话获取成功，当前轮次: ${session.currentRound}，状态: ${session.status}`)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 获取MVP工作坊会话失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误'
      },
      { status: 500 }
    )
  }
}
