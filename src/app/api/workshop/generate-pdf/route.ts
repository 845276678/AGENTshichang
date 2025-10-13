/**
 * PDF报告生成 API
 *
 * POST /api/workshop/generate-pdf - 生成工作坊完成报告PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateWorkshopReport, type WorkshopReportData } from '@/lib/workshop/pdf-generator'
import { z } from 'zod'

// 请求验证Schema
const GeneratePDFSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
  userProfile: z.object({
    name: z.string().min(1, '姓名不能为空'),
    email: z.string().email('邮箱格式无效').optional(),
    company: z.string().optional()
  }).optional(),
  includeHistory: z.boolean().default(false)
})

// 响应接口
interface PDFApiResponse {
  success: boolean
  data?: {
    filename: string
    contentType: string
    size: number
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = GeneratePDFSchema.parse(body)

    console.log(`📄 生成PDF报告请求`, {
      sessionId: validatedData.sessionId,
      hasUserProfile: !!validatedData.userProfile,
      includeHistory: validatedData.includeHistory
    })

    // 获取工作坊会话数据
    const session = await prisma.workshopSession.findUnique({
      where: { id: validatedData.sessionId }
    })

    if (!session) {
      return NextResponse.json({
        success: false,
        error: '工作坊会话不存在'
      }, { status: 404 })
    }

    // 检查会话是否完成
    if (session.status !== 'COMPLETED') {
      return NextResponse.json({
        success: false,
        error: '工作坊尚未完成，无法生成报告'
      }, { status: 400 })
    }

    // 获取评估历史（如果需要）
    let assessmentHistory = undefined
    if (validatedData.includeHistory) {
      assessmentHistory = await prisma.maturityAssessment.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          totalScore: true,
          level: true,
          createdAt: true
        }
      })
    }

    // 构建报告数据
    const reportData: WorkshopReportData = {
      session: {
        id: session.id,
        workshopId: session.workshopId as any,
        userId: session.userId,
        currentStep: session.currentStep,
        status: session.status as any,
        formData: session.formData as any,
        conversationHistory: session.conversationHistory as any,
        progress: calculateProgress(session),
        completedSteps: extractCompletedSteps(session),
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString()
      },
      userProfile: validatedData.userProfile,
      assessmentHistory: assessmentHistory?.map(assessment => ({
        id: assessment.id,
        totalScore: assessment.totalScore,
        level: assessment.level,
        createdAt: assessment.createdAt.toISOString()
      }))
    }

    // 生成PDF
    console.log(`📊 开始生成PDF报告...`)
    const doc = generateWorkshopReport(reportData)
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // 生成文件名
    const workshopNames: Record<string, string> = {
      'demand-validation': '需求验证实验室',
      'mvp-builder': 'MVP构建工作坊',
      'growth-hacking': '增长黑客训练营',
      'profit-model': '商业模式设计'
    }

    const workshopName = workshopNames[session.workshopId] || session.workshopId
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `${workshopName}_完成报告_${timestamp}.pdf`

    console.log(`✅ PDF生成成功`, {
      filename,
      size: pdfBuffer.length,
      pages: doc.internal.pages.length - 1
    })

    // 返回PDF文件
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('❌ PDF生成失败:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '请求数据无效: ' + error.errors.map(e => e.message).join(', ')
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'PDF生成失败，请稍后再试'
    }, { status: 500 })
  }
}

// GET: 获取PDF生成信息（健康检查）
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: 'PDF生成服务运行正常',
    timestamp: new Date().toISOString(),
    supportedWorkshops: [
      'demand-validation',
      'mvp-builder',
      'growth-hacking',
      'profit-model'
    ],
    features: [
      '完整工作坊报告生成',
      '用户信息集成',
      '评估历史包含',
      '多格式导出支持'
    ]
  })
}

// 辅助函数：计算进度
function calculateProgress(session: any): number {
  const formData = session.formData || {}
  const workshopId = session.workshopId

  if (session.status === 'COMPLETED') return 100

  const filledFields = Object.values(formData).filter(value =>
    value !== undefined && value !== null && value !== '' &&
    (Array.isArray(value) ? value.length > 0 : true)
  ).length

  const totalFields = {
    'demand-validation': 8,
    'mvp-builder': 10,
    'growth-hacking': 6,
    'profit-model': 9
  }[workshopId] || 8

  return Math.min(Math.round((filledFields / totalFields) * 100), 100)
}

// 辅助函数：提取完成步骤
function extractCompletedSteps(session: any): number[] {
  const formData = session.formData || {}
  const completedSteps: number[] = []

  if (session.workshopId === 'demand-validation') {
    if (formData.targetCustomer?.segment && formData.targetCustomer?.painPoints?.length > 0) {
      completedSteps.push(1)
    }
    if (formData.demandScenario?.context && formData.demandScenario?.frequency) {
      completedSteps.push(2)
    }
    if (formData.valueProposition?.coreValue && formData.valueProposition?.differentiation) {
      completedSteps.push(3)
    }
    if (formData.validationPlan?.method?.length > 0 && formData.validationPlan?.successCriteria) {
      completedSteps.push(4)
    }
  }

  // TODO: 实现其他工作坊的步骤检测逻辑

  return completedSteps.sort((a, b) => a - b)
}