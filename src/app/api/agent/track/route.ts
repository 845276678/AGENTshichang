/**
 * Agent使用追踪API
 * POST /api/agent/track
 * 记录Agent使用日志
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, module, action, sessionId, metadata } = body

    // 验证必填字段
    if (!agentId || !module || !action) {
      return NextResponse.json(
        { error: '缺少必填字段：agentId、module、action' },
        { status: 400 }
      )
    }

    // 获取当前用户（可选）
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // 记录使用日志
    await prisma.agentUsageLog.create({
      data: {
        userId,
        agentId,
        module,
        action,
        sessionId: sessionId || null,
        metadata: metadata || null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Agent使用追踪失败:', error)
    return NextResponse.json(
      { error: '记录失败' },
      { status: 500 }
    )
  }
}
