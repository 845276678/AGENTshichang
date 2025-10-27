import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, handleApiError } from '@/lib/auth'
import { BusinessPlanSessionService } from '@/lib/business-plan/session-service'
import { composeBusinessPlanGuide } from '@/lib/business-plan/content-composer'
import type { BiddingSnapshot } from '@/lib/business-plan/types'
import { BusinessPlanSource } from '@prisma/client'

export const dynamic = 'force-dynamic'


function buildSnapshot(body: any, userId?: string): BiddingSnapshot {
  const ideaTitle = body.ideaTitle || body.ideaName || (body.ideaContent ? body.ideaContent.slice(0, 30) : '未命名创意')

  return {
    ideaId: body.ideaId,
    ideaTitle,
    source: body.source,
    ideaDescription: body.ideaContent,
    highestBid: typeof body.highestBid === 'number' ? body.highestBid : Number(body.highestBid) || 0,
    averageBid: typeof body.averageBid === 'number' ? body.averageBid : Number(body.averageBid) || undefined,
    finalBids: body.finalBids || body.currentBids || {},
    winnerId: body.winner || body.winnerId,
    winnerName: body.winnerName,
    supportedAgents: Array.isArray(body.supportedAgents) ? body.supportedAgents : [],
    currentBids: body.currentBids || {},
    aiMessages: body.aiMessages || [],
    viewerCount: body.viewerCount || undefined
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const reportId = searchParams.get('reportId')

    if (!sessionId && !reportId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId or reportId parameter' }, { status: 400 })
    }

    // 按reportId查询时不需要强制认证，但需要验证访问权限
    if (reportId) {
      const report = await BusinessPlanSessionService.getReportById(reportId)
      if (!report) {
        return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 })
      }

      // 如果报告有userId，验证是否有权访问
      // 但允许刚创建的报告（5分钟内）免认证访问，以支持从竞价页面跳转
      const isRecentReport = report.createdAt && (Date.now() - report.createdAt.getTime()) < 5 * 60 * 1000

      if (report.userId && !isRecentReport) {
        try {
          const user = await authenticateRequest(request)
          if (report.userId !== user.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized to access this report' }, { status: 403 })
          }
        } catch (authError) {
          // 未认证用户无法访问报告
          return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
        }
      }

      // 🆕 合并 metadata 到 guide 中，确保前端能访问 guide.metadata
      const enrichedReport = {
        ...report,
        guide: {
          ...report.guide,
          metadata: report.metadata || {}
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          session: report.session,
          report: enrichedReport
        }
      })
    }

    // 按sessionId查询时验证用户权限
    const session = await BusinessPlanSessionService.getSessionWithReport(sessionId!)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
    }

    // 检查会话是否过期
    if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 410 })
    }

    // 如果会话有userId，验证访问权限
    // 但允许刚创建的会话（5分钟内）免认证访问，以支持从竞价页面跳转
    const isRecentSession = session.createdAt && (Date.now() - session.createdAt.getTime()) < 5 * 60 * 1000

    if (session.userId && !isRecentSession) {
      try {
        const user = await authenticateRequest(request)
        if (session.userId !== user.id) {
          return NextResponse.json({ success: false, error: 'Unauthorized to access this session' }, { status: 403 })
        }
      } catch (authError) {
        // 未认证用户无法访问需要认证的会话
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
      }
    }

    // 🆕 合并 metadata 到 guide 中，确保前端能访问 guide.metadata
    const report = session.reports?.[0] ?? null
    const enrichedReport = report ? {
      ...report,
      guide: {
        ...report.guide,
        metadata: report.metadata || {}
      }
    } : null

    return NextResponse.json({
      success: true,
      data: {
        session,
        report: enrichedReport
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // 尝试认证，但允许匿名请求（从AI竞价系统）
    let user: { id: string } | null = null
    try {
      user = await authenticateRequest(request)
    } catch (authError) {
      // 检查是否来自服务端内部调用（AI竞价系统）
      const isInternalCall = request.headers.get('X-Internal-Call') === 'true'
      if (!isInternalCall) {
        // 如果不是内部调用且未认证，则拒绝
        throw authError
      }
      // 内部调用允许匿名
      console.log('⚠️  允许来自AI竞价系统的匿名商业计划会话创建')
    }

    const body = await request.json()

    if (!body || !body.ideaContent) {
      return NextResponse.json({ success: false, error: '缺少必要的创意内容参数' }, { status: 400 })
    }

    const snapshot = buildSnapshot(body, user?.id)
    const session = await BusinessPlanSessionService.createSession({
      userId: user?.id ?? null, // 允许null用于匿名会话
      ideaId: body.ideaId,
      source: (body.source as BusinessPlanSource) ?? BusinessPlanSource.AI_BIDDING,
      snapshot
    })

    // 🆕 传递成熟度评分给 composeBusinessPlanGuide
    const { guide, metadata } = await composeBusinessPlanGuide(snapshot, {
      maturityScore: body.maturityScore ?? null
    })
    const completion = await BusinessPlanSessionService.completeSession({
      sessionId: session.id,
      guide,
      metadata: {
        ...metadata,
        source: (body.source as string) ?? 'AI_BIDDING'
      }
    })

    // 构建跳转URL - 优先使用ideaId格式（新格式）
    let businessPlanUrl: string
    if (body.ideaId && (body.source === 'ai-bidding' || body.source === 'bidding')) {
      // 竞价来源：使用ideaId + source=bidding + highestBid格式
      const highestBid = body.highestBid || body.currentBids?.max || 0
      businessPlanUrl = `/business-plan?ideaId=${body.ideaId}&source=bidding&highestBid=${highestBid}`
    } else {
      // 其他来源：使用sessionId格式（兼容旧逻辑）
      businessPlanUrl = `/business-plan?sessionId=${completion.session.id}&source=${body.source || 'ai-bidding'}`
    }

    return NextResponse.json({
      success: true,
      sessionId: completion.session.id,
      businessPlanUrl,
      reportId: completion.report.id
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId parameter' }, { status: 400 })
    }

    await BusinessPlanSessionService.deleteSession(sessionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
