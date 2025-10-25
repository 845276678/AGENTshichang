/**
 * 创意完善工作坊 - 完成工作坊API
 *
 * POST /api/idea-refinement/complete
 *
 * 功能：
 * 1. 标记工作坊为已完成（COMPLETED）
 * 2. 对refinedDocument进行最终验证和整理
 * 3. 生成完成摘要和统计信息
 * 4. 返回完整的refinedDocument供后续使用（如MVP工作坊）
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { REFINEMENT_DIMENSIONS } from '@/lib/idea-refinement/prompts'
import type {
  CompleteRefinementRequest,
  CompleteRefinementResponse,
  RefinedDocument
} from '@/types/idea-refinement'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body: CompleteRefinementRequest = await request.json()
    const { documentId } = body

    // 参数验证
    if (!documentId) {
      return NextResponse.json(
        { success: false, error: '缺少文档ID' },
        { status: 400 }
      )
    }

    console.log(`🎉 完成创意完善工作坊 - 文档: ${documentId}`)

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

    // 检查是否已完成所有维度
    const completedDimensions = document.completedDimensions as string[]
    const allDimensionsCompleted = completedDimensions.length === REFINEMENT_DIMENSIONS.length

    if (!allDimensionsCompleted && document.status !== 'COMPLETED') {
      // 允许用户提前结束（但需要确认）
      console.warn('⚠️ 未完成所有维度，用户选择提前结束')
    }

    // 获取refinedDocument
    const refinedDocument = document.refinedDocument as RefinedDocument

    // 验证refinedDocument的完整性
    const validation = validateRefinedDocument(refinedDocument)

    if (!validation.isComplete) {
      console.warn('⚠️ refinedDocument不完整:', validation.missingFields)
    }

    // 生成完成统计
    const conversationHistory = document.conversationHistory as any[]
    const totalMessages = conversationHistory.length
    const userMessages = conversationHistory.filter(m => m.role === 'user').length
    const aiMessages = conversationHistory.filter(m => m.role === 'assistant').length

    const statistics = {
      totalDimensions: REFINEMENT_DIMENSIONS.length,
      completedDimensions: completedDimensions.length,
      allDimensionsCompleted,
      totalMessages,
      userMessages,
      aiMessages,
      progress: document.progress,
      timeSpent: calculateTimeSpent(
        document.createdAt,
        new Date()
      ),
      hasFrontendDesign: !!refinedDocument.productDetails?.frontendDesign
    }

    console.log('📊 统计信息:', statistics)

    // 更新数据库，标记为完成
    await prisma.ideaRefinementDocument.update({
      where: { id: documentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        progress: 100
      }
    })

    console.log('✅ 创意完善工作坊已完成！')

    // 返回响应
    const response: CompleteRefinementResponse = {
      success: true,
      refinedDocument,
      statistics,
      validation,
      canStartMVPWorkshop: !!refinedDocument.productDetails?.frontendDesign,
      message: allDimensionsCompleted
        ? '恭喜！您已完成所有维度的创意完善。'
        : '工作坊已结束，您可以随时回来继续完善。'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 完成创意完善工作坊失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '完成失败，请重试'
      },
      { status: 500 }
    )
  }
}

/**
 * 验证refinedDocument的完整性
 */
function validateRefinedDocument(refinedDocument: RefinedDocument): {
  isComplete: boolean
  missingFields: string[]
  completedFields: string[]
} {
  const missingFields: string[] = []
  const completedFields: string[] = []

  // 检查6个维度
  const dimensionFields = [
    'targetUser',
    'businessModel',
    'marketAnalysis',
    'competitiveAdvantage',
    'productDetails',
    'implementation'
  ]

  dimensionFields.forEach(field => {
    const data = (refinedDocument as any)[field]
    if (!data || Object.keys(data).length === 0) {
      missingFields.push(field)
    } else {
      completedFields.push(field)
    }
  })

  // 特别检查frontendDesign（可选但推荐）
  if (!refinedDocument.productDetails?.frontendDesign) {
    console.warn('⚠️ 缺少frontendDesign（推荐补充以使用MVP工作坊）')
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completedFields
  }
}

/**
 * 计算耗时（分钟）
 */
function calculateTimeSpent(startTime: Date, endTime: Date): number {
  const diffMs = endTime.getTime() - startTime.getTime()
  return Math.round(diffMs / 1000 / 60) // 转换为分钟
}
