import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, handleApiError } from '@/lib/auth'
import { BusinessPlanSessionService } from '@/lib/business-plan/session-service'
import { composeBusinessPlanGuide } from '@/lib/business-plan/content-composer'
import type { BiddingSnapshot } from '@/lib/business-plan/types'
import { BusinessPlanSource } from '@prisma/client'

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

    if (reportId) {
      const report = await BusinessPlanSessionService.getReportById(reportId)
      if (!report) {
        return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        data: {
          session: report.session,
          report
        }
      })
    }

    const session = await BusinessPlanSessionService.getSessionWithReport(sessionId!)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
    }

    if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 410 })
    }

    return NextResponse.json({
      success: true,
      data: {
        session,
        report: session.reports?.[0] ?? null
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    const body = await request.json()

    if (!body || !body.ideaContent) {
      return NextResponse.json({ success: false, error: '缺少必要的创意内容参数' }, { status: 400 })
    }

    const snapshot = buildSnapshot(body, user.id)
    const session = await BusinessPlanSessionService.createSession({
      userId: user.id,
      ideaId: body.ideaId,
      source: (body.source as BusinessPlanSource) ?? BusinessPlanSource.AI_BIDDING,
      snapshot
    })

    const { guide, metadata } = composeBusinessPlanGuide(snapshot)
    const completion = await BusinessPlanSessionService.completeSession({
      sessionId: session.id,
      guide,
      metadata: {
        ...metadata,
        source: (body.source as string) ?? 'ai-bidding'
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: completion.session.id,
      businessPlanUrl: `/business-plan?sessionId=${completion.session.id}&source=ai-bidding`,
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
