import { NextRequest, NextResponse } from 'next/server'

// 获取商业计划会话数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      )
    }

    // 从全局存储中获取会话数据
    const businessPlanSessions = (global as any).businessPlanSessions
    if (!businessPlanSessions || !businessPlanSessions.has(sessionId)) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    const sessionData = businessPlanSessions.get(sessionId)

    // 检查会话是否过期（24小时）
    const expirationTime = 24 * 60 * 60 * 1000 // 24小时
    if (Date.now() - sessionData.timestamp > expirationTime) {
      businessPlanSessions.delete(sessionId)
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      data: sessionData
    })

  } catch (error) {
    console.error('Error fetching business plan session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 创建商业计划会话数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ideaContent,
      highestBid,
      averageBid,
      finalBids,
      winner,
      winnerName,
      aiMessages,
      supportedAgents,
      currentBids,
      ideaId
    } = body

    // 生成会话ID
    const sessionId = `bp_${ideaId || 'manual'}_${Date.now()}`

    // 存储会话数据
    const businessPlanSessions = (global as any).businessPlanSessions || new Map()
    ;(global as any).businessPlanSessions = businessPlanSessions

    businessPlanSessions.set(sessionId, {
      ideaContent,
      highestBid,
      averageBid,
      finalBids,
      winner,
      winnerName,
      aiMessages: aiMessages || [],
      supportedAgents: supportedAgents || [],
      currentBids,
      timestamp: Date.now(),
      ideaId
    })

    console.log(`📋 Business plan session created via API: ${sessionId}`)

    return NextResponse.json({
      success: true,
      sessionId,
      businessPlanUrl: `/business-plan?sessionId=${sessionId}&source=api`
    })

  } catch (error) {
    console.error('Error creating business plan session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

// 删除商业计划会话数据
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      )
    }

    const businessPlanSessions = (global as any).businessPlanSessions
    if (businessPlanSessions && businessPlanSessions.has(sessionId)) {
      businessPlanSessions.delete(sessionId)
      console.log(`🗑️ Business plan session deleted: ${sessionId}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted'
    })

  } catch (error) {
    console.error('Error deleting business plan session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}