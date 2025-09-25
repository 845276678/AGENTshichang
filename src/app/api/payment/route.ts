import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 返回模拟的支付统计信息，避免数据库依赖
    return NextResponse.json({
      success: true,
      data: {
        totalOrders: 0,
        totalAmount: 0,
        successRate: 100
      }
    })
  } catch (error) {
    console.error('Payment stats error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payment stats'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, description } = body

    // 返回模拟的支付订单，避免数据库依赖
    return NextResponse.json({
      success: true,
      data: {
        orderId: `order_${Date.now()}`,
        amount: amount || 0,
        status: 'pending'
      }
    })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create payment order'
    }, { status: 500 })
  }
}
