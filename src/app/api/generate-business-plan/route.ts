import { NextRequest, NextResponse } from 'next/server'
import { AIOrchestrator } from '@/lib/ai-orchestrator'
import ResearchReportService from '@/lib/services/research-report.service'
import IdeaService from '@/lib/services/idea.service'
import UserService from '@/lib/services/user.service'
import { verifyToken } from '@/lib/jwt'

// AI调研指导API - 生成调研指导报告
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供认证token' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'token无效或已过期' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // 解析请求数据
    const { ideaId, ideaData } = await request.json()

    // 验证输入数据
    if (!ideaData?.title || !ideaData?.description) {
      return NextResponse.json(
        { error: '缺少必要的创意信息' },
        { status: 400 }
      )
    }

    // 检查用户是否存在并有足够积分
    const user = await UserService.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取系统配置中的报告生成成本
    const reportCost = 500 // 从系统配置获取，这里暂时写死

    if (user.credits < reportCost) {
      return NextResponse.json(
        { error: '积分余额不足，需要500积分生成调研报告' },
        { status: 402 }
      )
    }

    // 如果提供了ideaId，验证创意是否存在
    let idea = null
    if (ideaId) {
      idea = await IdeaService.findById(ideaId)
      if (!idea) {
        return NextResponse.json(
          { error: '创意不存在' },
          { status: 404 }
        )
      }
    } else {
      // 如果没有提供ideaId，先创建创意
      idea = await IdeaService.create(userId, {
        title: ideaData.title,
        description: ideaData.description,
        category: ideaData.category || 'OTHER',
        tags: ideaData.tags || [],
        visibility: 'PRIVATE' // 临时创意设为私有
      })
    }

    // 检查用户是否已为此创意生成过报告
    const hasExistingReport = await ResearchReportService.hasUserGeneratedReport(userId, idea.id)
    if (hasExistingReport) {
      return NextResponse.json(
        { error: '您已为此创意生成过调研报告' },
        { status: 409 }
      )
    }

    // 创建调研报告记录
    const report = await ResearchReportService.create(userId, {
      ideaId: idea.id,
      creditsCost: reportCost
    })

    // 初始化AI编排器
    const orchestrator = new AIOrchestrator()

    // 设置进度回调
    orchestrator.onProgress = async (stage: string, result: any) => {
      console.log(`调研指导阶段完成: ${stage}`)

      try {
        // 根据阶段名称更新对应的分析结果
        let stageField: 'basicAnalysis' | 'researchMethods' | 'dataSources' | 'mvpGuidance' | 'businessModel'
        let progress = 0

        switch (stage) {
          case '基本盘分析师':
            stageField = 'basicAnalysis'
            progress = 20
            break
          case '调研方法专家':
            stageField = 'researchMethods'
            progress = 40
            break
          case '数据源指南':
            stageField = 'dataSources'
            progress = 60
            break
          case 'MVP验证专家':
            stageField = 'mvpGuidance'
            progress = 80
            break
          case '商业模式导师':
            stageField = 'businessModel'
            progress = 100
            break
          default:
            return
        }

        // 保存阶段结果
        await ResearchReportService.saveAnalysisResult(report.id, stageField, result)

        // 更新进度
        await ResearchReportService.updateProgress(report.id, progress)
      } catch (error) {
        console.error(`更新阶段 ${stage} 结果失败:`, error)
      }
    }

    // 异步生成调研指导方案
    orchestrator.generateResearchGuide({
      title: ideaData.title,
      description: ideaData.description,
      category: ideaData.category || 'OTHER'
    }).then(async (researchGuide) => {
      try {
        // 更新报告状态为完成
        await ResearchReportService.update(report.id, {
          status: 'COMPLETED',
          progress: 100,
          reportData: researchGuide,
          summary: `为创意"${ideaData.title}"生成的AI调研指导方案，包含基本盘分析、调研方法、数据源指南、MVP验证和商业模式探索。`
        })

        console.log(`调研报告 ${report.id} 生成完成`)
      } catch (error) {
        console.error(`保存调研报告失败:`, error)

        // 标记报告为失败状态
        await ResearchReportService.update(report.id, {
          status: 'FAILED',
          progress: 0
        })

        // 退还积分
        await UserService.updateCredits(
          userId,
          reportCost,
          'REFUND',
          '调研报告生成失败退款',
          report.id
        )
      }
    }).catch(async (error) => {
      console.error('生成调研指导失败:', error)

      // 标记报告为失败状态
      await ResearchReportService.update(report.id, {
        status: 'FAILED',
        progress: 0
      })

      // 退还积分
      await UserService.updateCredits(
        userId,
        reportCost,
        'REFUND',
        '调研报告生成失败退款',
        report.id
      )
    })

    // 立即返回报告ID，客户端可以轮询获取进度
    return NextResponse.json({
      success: true,
      data: {
        reportId: report.id,
        ideaId: idea.id,
        status: 'GENERATING',
        progress: 0,
        creditsCost: reportCost,
        estimatedTime: '5-10分钟'
      },
      message: 'AI调研指导生成已开始，请稍后查看结果'
    })

  } catch (error) {
    console.error('生成调研指导失败:', error)
    return NextResponse.json(
      { error: '生成调研指导失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取调研报告进度和结果
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('reportId')
    const ideaId = searchParams.get('ideaId')

    if (!reportId && !ideaId) {
      return NextResponse.json(
        { error: '缺少报告ID或创意ID' },
        { status: 400 }
      )
    }

    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供认证token' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'token无效或已过期' },
        { status: 401 }
      )
    }

    let report = null

    if (reportId) {
      // 根据报告ID获取报告
      report = await ResearchReportService.findById(reportId)
    } else if (ideaId) {
      // 根据创意ID获取最新的报告
      const reports = await ResearchReportService.getIdeaReports(ideaId, 1, 1)
      report = reports.data[0] || null
    }

    if (!report) {
      return NextResponse.json(
        { error: '调研报告不存在' },
        { status: 404 }
      )
    }

    // 检查用户权限
    if (report.userId !== decoded.userId) {
      return NextResponse.json(
        { error: '无权限访问此报告' },
        { status: 403 }
      )
    }

    // 返回报告信息
    const response = {
      success: true,
      data: {
        reportId: report.id,
        ideaId: report.ideaId,
        status: report.status,
        progress: report.progress,
        creditsCost: report.creditsCost,
        createdAt: report.createdAt,
        completedAt: report.completedAt,
        // 如果报告完成，返回完整内容
        ...(report.status === 'COMPLETED' && {
          reportData: report.reportData,
          summary: report.summary,
          basicAnalysis: report.basicAnalysis,
          researchMethods: report.researchMethods,
          dataSources: report.dataSources,
          mvpGuidance: report.mvpGuidance,
          businessModel: report.businessModel
        })
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('获取调研报告失败:', error)
    return NextResponse.json(
      { error: '获取调研报告失败' },
      { status: 500 }
    )
  }
}