/**
 * MVP前端可视化工作坊 - 导出代码API
 *
 * POST /api/mvp-visualization/export
 *
 * 功能：
 * 1. 确认用户完成所有调整
 * 2. 将HTML和CSS合并为单一HTML文件
 * 3. 生成更新后的产品计划书（Markdown格式）
 * 4. 标记会话为已完成（COMPLETED）
 * 5. 返回下载文件的内容
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  mergeCodeToHTMLFile,
  generatePlanDocumentFromSession
} from '@/lib/mvp-visualization/utils'
import type {
  ExportMVPCodeRequest,
  ExportMVPCodeResponse,
  MVPVisualizationSessionData
} from '@/types/mvp-visualization'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body: ExportMVPCodeRequest = await request.json()
    const { sessionId, projectTitle } = body

    // 参数验证
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: '缺少会话ID' },
        { status: 400 }
      )
    }

    console.log(`📦 开始导出MVP代码 - 会话: ${sessionId}`)

    // 获取会话数据
    const session = await prisma.mVPVisualizationSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        refinementDocument: {
          select: {
            id: true,
            ideaTitle: true,
            ideaContent: true,
            refinedDocument: true
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

    // 检查是否有生成的代码
    if (!session.generatedHTML || !session.generatedCSS) {
      return NextResponse.json(
        { success: false, error: '尚未生成代码，无法导出' },
        { status: 400 }
      )
    }

    console.log('🔧 合并HTML和CSS代码...')

    // 合并HTML和CSS为单一文件
    const title = projectTitle || session.refinementDocument?.ideaTitle || 'MVP原型'
    const finalHTMLFile = mergeCodeToHTMLFile(
      session.generatedHTML,
      session.generatedCSS,
      title
    )

    console.log('📝 生成产品计划书...')

    // 转换会话数据为SessionData类型
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
      finalHTMLFile: undefined,
      updatedPlanDocument: undefined,
      status: session.status as any,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      completedAt: session.completedAt?.toISOString()
    }

    // 生成产品计划书（基于refinedDocument和调整历史）
    const updatedPlanDocument = generatePlanDocumentFromSession(
      sessionData,
      session.refinementDocument?.refinedDocument as any
    )

    console.log('💾 保存导出结果到数据库...')

    // 更新会话，保存导出结果
    await prisma.mVPVisualizationSession.update({
      where: { id: sessionId },
      data: {
        finalHTMLFile,
        updatedPlanDocument,
        status: 'COMPLETED',
        completedAt: new Date()
      }
    })

    console.log('✅ MVP工作坊已完成！')

    // 构建文件名
    const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').slice(0, 50)
    const htmlFileName = `${safeTitle}_MVP原型_${timestamp}.html`
    const planFileName = `${safeTitle}_产品计划书_${timestamp}.md`

    // 返回响应
    const response: ExportMVPCodeResponse = {
      success: true,
      files: {
        htmlFile: {
          filename: htmlFileName,
          content: finalHTMLFile,
          size: Buffer.byteLength(finalHTMLFile, 'utf8'),
          mimeType: 'text/html'
        },
        planDocument: {
          filename: planFileName,
          content: updatedPlanDocument,
          size: Buffer.byteLength(updatedPlanDocument, 'utf8'),
          mimeType: 'text/markdown'
        }
      },
      summary: {
        totalRounds: session.currentRound - 1, // currentRound是下一轮的编号
        adjustmentsCount: (session.adjustmentHistory as any[]).length,
        finalHTMLSize: session.generatedHTML.length,
        finalCSSSize: session.generatedCSS.length,
        creditsUsed: session.creditsDeducted,
        isFromBidding: session.isFromBidding
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ MVP代码导出失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '导出失败，请重试'
      },
      { status: 500 }
    )
  }
}
