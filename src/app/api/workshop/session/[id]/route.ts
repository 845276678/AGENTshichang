/**
 * 工作坊会话更新 API
 *
 * PUT /api/workshop/session/[id] - 更新现有会话
 * DELETE /api/workshop/session/[id] - 删除会话（设为废弃状态）
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 更新会话Schema
const UpdateSessionSchema = z.object({
  currentStep: z.number().min(1).max(10).optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
  formData: z.record(z.any()).optional(),
  conversationHistory: z.array(z.any()).optional()
})

// 响应接口
interface SessionApiResponse {
  success: boolean
  data?: any
  error?: string
}

// PUT: 更新工作坊会话
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const sessionId = params.id
    const body = await request.json()

    // 验证请求数据
    const validatedData = UpdateSessionSchema.parse(body)

    console.log(`📝 更新工作坊会话: ${sessionId}`, {
      hasFormData: !!validatedData.formData,
      hasConversation: !!validatedData.conversationHistory,
      status: validatedData.status,
      step: validatedData.currentStep
    })

    // 检查会话是否存在
    const existingSession = await prisma.workshopSession.findUnique({
      where: { id: sessionId }
    })

    if (!existingSession) {
      return NextResponse.json({
        success: false,
        error: '会话不存在'
      }, { status: 404 })
    }

    // 准备更新数据
    const updateData: any = {
      lastActivityAt: new Date()
    }

    if (validatedData.currentStep !== undefined) {
      updateData.currentStep = validatedData.currentStep
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
    }

    if (validatedData.formData !== undefined) {
      // 合并表单数据（保留现有数据，更新新数据）
      const currentFormData = existingSession.formData || {}
      updateData.formData = {
        ...currentFormData,
        ...validatedData.formData
      }
    }

    if (validatedData.conversationHistory !== undefined) {
      updateData.conversationHistory = validatedData.conversationHistory
    }

    // 执行更新
    const updatedSession = await prisma.workshopSession.update({
      where: { id: sessionId },
      data: updateData
    })

    console.log(`✅ 会话更新成功: ${sessionId}`)

    // 返回更新后的会话数据
    return NextResponse.json({
      success: true,
      data: {
        id: updatedSession.id,
        workshopId: updatedSession.workshopId,
        userId: updatedSession.userId,
        currentStep: updatedSession.currentStep,
        status: updatedSession.status,
        formData: updatedSession.formData,
        conversationHistory: updatedSession.conversationHistory,
        progress: calculateProgress(updatedSession),
        completedSteps: extractCompletedSteps(updatedSession),
        lastSaveAt: updatedSession.lastActivityAt?.toISOString(),
        createdAt: updatedSession.createdAt.toISOString(),
        updatedAt: updatedSession.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 更新会话失败:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '更新数据无效: ' + error.errors.map(e => e.message).join(', ')
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: '更新会话失败'
    }, { status: 500 })
  }
}

// DELETE: 删除工作坊会话（设为废弃状态）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const sessionId = params.id

    console.log(`🗑️ 删除工作坊会话: ${sessionId}`)

    // 检查会话是否存在
    const existingSession = await prisma.workshopSession.findUnique({
      where: { id: sessionId }
    })

    if (!existingSession) {
      return NextResponse.json({
        success: false,
        error: '会话不存在'
      }, { status: 404 })
    }

    // 软删除：设为废弃状态而不是物理删除
    const deletedSession = await prisma.workshopSession.update({
      where: { id: sessionId },
      data: {
        status: 'ABANDONED',
        lastActivityAt: new Date()
      }
    })

    console.log(`✅ 会话删除成功: ${sessionId}`)

    return NextResponse.json({
      success: true,
      data: {
        id: deletedSession.id,
        status: deletedSession.status
      }
    })

  } catch (error) {
    console.error('❌ 删除会话失败:', error)

    return NextResponse.json({
      success: false,
      error: '删除会话失败'
    }, { status: 500 })
  }
}

// GET: 获取单个会话详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const sessionId = params.id

    console.log(`🔍 获取会话详情: ${sessionId}`)

    const session = await prisma.workshopSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json({
        success: false,
        error: '会话不存在'
      }, { status: 404 })
    }

    console.log(`✅ 会话详情获取成功: ${sessionId}`)

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        workshopId: session.workshopId,
        userId: session.userId,
        currentStep: session.currentStep,
        status: session.status,
        formData: session.formData,
        conversationHistory: session.conversationHistory,
        progress: calculateProgress(session),
        completedSteps: extractCompletedSteps(session),
        lastSaveAt: session.lastActivityAt?.toISOString(),
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 获取会话详情失败:', error)

    return NextResponse.json({
      success: false,
      error: '获取会话详情失败'
    }, { status: 500 })
  }
}

// 辅助函数：计算会话进度
function calculateProgress(session: any): number {
  const formData = session.formData || {}
  const workshopId = session.workshopId

  // 根据不同工作坊计算进度
  const filledFields = Object.values(formData).filter(value =>
    value !== undefined && value !== null && value !== '' &&
    (Array.isArray(value) ? value.length > 0 : true)
  ).length

  // 工作坊字段总数
  const totalFields = {
    'demand-validation': 8,
    'mvp-builder': 10,
    'growth-hacking': 6,
    'profit-model': 9
  }[workshopId] || 8

  const formProgress = Math.min(Math.round((filledFields / totalFields) * 100), 100)

  // 如果状态为已完成，进度为100%
  if (session.status === 'COMPLETED') {
    return 100
  }

  return formProgress
}

// 辅助函数：提取已完成步骤
function extractCompletedSteps(session: any): number[] {
  const formData = session.formData || {}
  const completedSteps: number[] = []

  // 根据表单数据推断已完成的步骤
  if (session.workshopId === 'demand-validation') {
    // 步骤1：目标客户定义
    if (formData.targetCustomer &&
        formData.targetCustomer.segment &&
        formData.targetCustomer.painPoints?.length > 0 &&
        formData.targetCustomer.currentSolution) {
      completedSteps.push(1)
    }

    // 步骤2：需求场景描述
    if (formData.demandScenario &&
        formData.demandScenario.context &&
        formData.demandScenario.frequency &&
        formData.demandScenario.urgency &&
        formData.demandScenario.willingnessToPay) {
      completedSteps.push(2)
    }

    // 步骤3：价值验证
    if (formData.valueProposition &&
        formData.valueProposition.coreValue &&
        formData.valueProposition.differentiation &&
        formData.valueProposition.measurementMetric) {
      completedSteps.push(3)
    }

    // 步骤4：验证计划
    if (formData.validationPlan &&
        formData.validationPlan.method?.length > 0 &&
        formData.validationPlan.targetSampleSize &&
        formData.validationPlan.successCriteria &&
        formData.validationPlan.timeline) {
      completedSteps.push(4)
    }
  }

  // TODO: 实现其他工作坊的步骤检测逻辑

  return completedSteps.sort((a, b) => a - b)
}