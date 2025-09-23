import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/auth-middleware'
import { documentGenerator } from '@/lib/ai/document-generator'
import { DocumentGenerationSchema } from '@/types/document-generation'

export async function POST(request: NextRequest) {
  try {
    // 身份验证
    const authResult = await authenticateToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      )
    }

    const user = authResult.user!
    const body = await request.json()

    // 验证请求参数
    const validationResult = DocumentGenerationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: '请求参数无效', errors: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { ideaId, agentId, templateIds: _templateIds, customization: _customization } = validationResult.data

    // 模拟获取创意和AI Agent信息
    // 实际应用中应该从数据库查询
    const mockIdeaData = {
      ideaId,
      agentId,
      idea: {
        title: '智能健康管理平台',
        description: '基于AI的个性化健康管理和疾病预防平台，通过数据分析提供精准的健康建议',
        category: '健康科技',
        tags: ['AI', '健康管理', '数据分析', '个性化'],
        targetMarket: '注重健康的中高收入人群',
        painPoints: [
          '传统体检报告难以理解',
          '缺乏个性化健康指导',
          '健康数据分散难以管理',
          '疾病预防缺乏科学依据'
        ]
      },
      agent: {
        name: 'HealthGPT',
        specialties: ['健康数据分析', '医疗AI', '用户体验设计'],
        personality: {
          style: '专业严谨',
          approach: '数据驱动'
        }
      },
      collaborationResult: {
        enhancedTitle: 'SmartHealth - AI驱动的个人健康管理生态平台',
        enhancedDescription: '革命性的AI健康管理平台，集成可穿戴设备数据、医疗记录和生活方式信息，提供个性化健康评估、疾病风险预测和精准干预建议的一站式健康管理解决方案。',
        finalScore: 88,
        collaborationCost: 250
      }
    }

    console.log(`🚀 开始为用户 ${(user as any).id || 'unknown'} 生成文档包`)
    console.log(`📝 创意: ${mockIdeaData.idea.title}`)
    console.log(`🤖 AI专家: ${mockIdeaData.agent.name}`)

    // 生成文档包
    const deliverablePackage = await documentGenerator.generateDeliverablePackage(mockIdeaData)

    // 保存到数据库（模拟）
    console.log(`💾 保存文档包到数据库: ${deliverablePackage.id}`)

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        packageId: deliverablePackage.id,
        title: deliverablePackage.title,
        summary: deliverablePackage.summary,
        pricing: deliverablePackage.pricing,
        deliverables: deliverablePackage.deliverables,
        metadata: deliverablePackage.metadata,
        estimatedGeneration: {
          timeRequired: '2-5分钟',
          documentsCount: deliverablePackage.documents.length,
          totalPages: deliverablePackage.summary.totalPages
        }
      },
      message: '文档生成请求已提交，正在处理中...'
    })

  } catch (error) {
    console.error('文档生成错误:', error)
    return NextResponse.json(
      { success: false, message: '文档生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 身份验证
    const authResult = await authenticateToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')

    if (!packageId) {
      return NextResponse.json(
        { success: false, message: '缺少packageId参数' },
        { status: 400 }
      )
    }

    // 模拟查询文档包状态
    console.log(`📊 查询文档包状态: ${packageId}`)

    // 模拟生成进度
    const mockProgress = {
      packageId,
      status: 'completed', // generating | completed | failed
      progress: 100, // 0-100
      currentStep: '文档生成完成',
      estimatedTimeRemaining: 0,
      generatedDocuments: 6,
      totalDocuments: 6,
      downloadUrl: `/api/documents/download?packageId=${packageId}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockProgress
    })

  } catch (error) {
    console.error('查询文档状态错误:', error)
    return NextResponse.json(
      { success: false, message: '查询失败' },
      { status: 500 }
    )
  }
}