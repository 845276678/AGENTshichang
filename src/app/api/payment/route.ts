import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // 获取支付统计信息
    const stats = await prisma.order.aggregate({
      _count: {
        id: true
      },
      _sum: {
        amount: true
      },
      where: {
        status: 'completed'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: stats._count.id,
        totalAmount: stats._sum.amount || 0,
        successRate: 100 // 简化处理
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

    // 创建支付订单
    const order = await prisma.order.create({
      data: {
        userId,
        amount,
        description: description || 'AI服务消费',
        status: 'pending',
        paymentMethod: 'credit',
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        status: order.status
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
