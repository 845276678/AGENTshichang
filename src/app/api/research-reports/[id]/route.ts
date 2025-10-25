import { NextRequest, NextResponse } from 'next/server'
import { ResearchReportService } from '@/lib/services/research-report.service'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/research-reports/[id] - 获取指定ID的调研报告
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id

    if (!reportId) {
      return NextResponse.json(
        { error: '缺少报告ID参数' },
        { status: 400 }
      )
    }

    // 验证用户身份（可选，根据业务需求）
    const authHeader = request.headers.get('Authorization')
    let userId = null

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const decoded = await verifyToken(token)
        userId = decoded.userId
      } catch (error) {
        // Token无效，但不阻止访问（根据业务逻辑调整）
        console.warn('Invalid token in research report request:', error)
      }
    }

    // 获取调研报告
    const report = await ResearchReportService.findById(reportId, true)

    if (!report) {
      return NextResponse.json(
        { error: '调研报告不存在' },
        { status: 404 }
      )
    }

    // 如果有用户ID，检查权限（可选）
    if (userId && report.userId !== userId) {
      // 可以根据业务需求决定是否允许访问他人的报告
      // 这里暂时允许访问，但可以限制敏感信息
      console.warn(`User ${userId} accessing report ${reportId} owned by ${report.userId}`)
    }

    return NextResponse.json(report)

  } catch (error) {
    console.error('Failed to get research report:', error)
    return NextResponse.json(
      { error: '获取调研报告失败' },
      { status: 500 }
    )
  }
}