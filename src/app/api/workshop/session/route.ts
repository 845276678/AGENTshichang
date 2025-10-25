/**
 * 工作坊会话管理 API
 *
 * GET /api/workshop/session - 查询用户的工作坊会话
 * POST /api/workshop/session - 创建新的工作坊会话
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// 请求验证Schema
const CreateSessionSchema = z.object({
  workshopId: z.enum(['demand-validation', 'mvp-builder', 'growth-hacking', 'profit-model']),
  userId: z.string().min(1),
  currentStep: z.number().min(1).max(10).default(1),
  formData: z.record(z.any()).default({}),
  conversationHistory: z.array(z.any()).default([])
})

const QuerySessionSchema = z.object({
  workshopId: z.enum(['demand-validation', 'mvp-builder', 'growth-hacking', 'profit-model']),
  userId: z.string().min(1)
})

// 响应接口
interface SessionApiResponse {
  success: boolean
  data?: any
  error?: string
}

// GET: 查询工作坊会话
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const queryData = {
      workshopId: searchParams.get('workshopId'),
      userId: searchParams.get('userId')
    }

    // 验证查询参数
    const validatedQuery = QuerySessionSchema.parse(queryData)

    console.log(`🔍 查询工作坊会话`, validatedQuery)

    // 查找现有会话
    const existingSession = await prisma.workshopSession.findFirst({
      where: {
        workshopId: validatedQuery.workshopId,
        userId: validatedQuery.userId,
        status: {
          in: ['IN_PROGRESS', 'COMPLETED']
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!existingSession) {
      return NextResponse.json({
        success: false,
        error: '未找到匹配的会话'
      }, { status: 404 })
    }

    console.log(`✅ 会话查询成功: ${existingSession.id}`)

    return NextResponse.json({
      success: true,
      data: {
        id: existingSession.id,
        workshopId: existingSession.workshopId,
        userId: existingSession.userId,
        currentStep: existingSession.currentStep,
        totalSteps: existingSession.totalSteps,
        status: existingSession.status,
        formData: existingSession.formData,
        conversationHistory: existingSession.conversationHistory,
        progress: calculateProgress(existingSession),
        completedSteps: extractCompletedSteps(existingSession),
        lastSaveAt: existingSession.lastActivityAt?.toISOString(),
        createdAt: existingSession.createdAt.toISOString(),
        updatedAt: existingSession.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 查询会话失败:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '查询参数无效: ' + error.errors.map(e => e.message).join(', ')
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: '查询会话失败'
    }, { status: 500 })
  }
}

// POST: 创建新的工作坊会话
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = CreateSessionSchema.parse(body)

    console.log(`📝 创建工作坊会话`, {
      workshopId: validatedData.workshopId,
      userId: validatedData.userId
    })

    // 检查是否已存在进行中的会话
    const existingSession = await prisma.workshopSession.findFirst({
      where: {
        workshopId: validatedData.workshopId,
        userId: validatedData.userId,
        status: 'IN_PROGRESS'
      }
    })

    if (existingSession) {
      console.log(`⚠️ 发现现有会话，返回现有会话: ${existingSession.id}`)

      // 计算并返回完整的会话数据
      return NextResponse.json({
        success: true,
        data: {
          id: existingSession.id,
          workshopId: existingSession.workshopId,
          userId: existingSession.userId,
          currentStep: existingSession.currentStep,
          totalSteps: existingSession.totalSteps,
          status: existingSession.status,
          formData: existingSession.formData,
          conversationHistory: existingSession.conversationHistory,
          progress: calculateProgress(existingSession),
          completedSteps: extractCompletedSteps(existingSession),
          lastSaveAt: existingSession.lastActivityAt?.toISOString(),
          createdAt: existingSession.createdAt.toISOString(),
          updatedAt: existingSession.updatedAt.toISOString()
        }
      })
    }

    // 获取工作坊总步骤数
    const getTotalSteps = (workshopId: string): number => {
      const stepsMap: Record<string, number> = {
        'demand-validation': 4,
        'mvp-builder': 4,
        'growth-hacking': 3,
        'profit-model': 3
      }
      return stepsMap[workshopId] || 4
    }

    // 创建新会话
    const newSession = await prisma.workshopSession.create({
      data: {
        workshopId: validatedData.workshopId,
        userId: validatedData.userId,
        currentStep: validatedData.currentStep,
        totalSteps: getTotalSteps(validatedData.workshopId),
        status: 'IN_PROGRESS',
        formData: validatedData.formData,
        conversationHistory: validatedData.conversationHistory,
        lastActivityAt: new Date()
      }
    })

    console.log(`✅ 会话创建成功: ${newSession.id}`)

    return NextResponse.json({
      success: true,
      data: {
        id: newSession.id,
        workshopId: newSession.workshopId,
        userId: newSession.userId,
        currentStep: newSession.currentStep,
        totalSteps: newSession.totalSteps,
        status: newSession.status,
        formData: newSession.formData,
        conversationHistory: newSession.conversationHistory,
        progress: 0,
        completedSteps: [],
        lastSaveAt: newSession.lastActivityAt?.toISOString(),
        createdAt: newSession.createdAt.toISOString(),
        updatedAt: newSession.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 创建会话失败:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '请求数据无效: ' + error.errors.map(e => e.message).join(', ')
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: '创建会话失败'
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

  // 工作坊字段总数（简化估算）
  const totalFields = {
    'demand-validation': 8,
    'mvp-builder': 10,
    'growth-hacking': 6,
    'profit-model': 9
  }[workshopId] || 8

  return Math.min(Math.round((filledFields / totalFields) * 100), 100)
}

// 辅助函数：提取已完成步骤
function extractCompletedSteps(session: any): number[] {
  const formData = session.formData || {}
  const currentStep = session.currentStep || 1
  const completedSteps: number[] = []

  // 根据表单数据推断已完成的步骤
  if (session.workshopId === 'demand-validation') {
    if (formData.targetCustomer &&
        formData.targetCustomer.segment &&
        formData.targetCustomer.painPoints?.length > 0) {
      completedSteps.push(1)
    }
    if (formData.demandScenario &&
        formData.demandScenario.context &&
        formData.demandScenario.frequency) {
      completedSteps.push(2)
    }
    if (formData.valueProposition &&
        formData.valueProposition.coreValue &&
        formData.valueProposition.differentiation) {
      completedSteps.push(3)
    }
    if (formData.validationPlan &&
        formData.validationPlan.method?.length > 0 &&
        formData.validationPlan.successCriteria) {
      completedSteps.push(4)
    }
  }

  // 其他工作坊的逻辑可以类似实现...

  return completedSteps.sort((a, b) => a - b)
}