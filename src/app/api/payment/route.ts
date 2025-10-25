import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // 检查数据库连接
    await prisma.$connect()
    
    // 获取支付统计信息
    const stats = await prisma.order.aggregate({
      _count: {
        id: true
      },
      _sum: {
        amount: true
      },
      where: {
        status: 'PAID'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: stats._count.id,
        totalAmount: stats._sum.amount || 0,
        successRate: stats._count.id > 0 ? 100 : 0
      }
    })
  } catch (error) {
    console.error('Payment stats error:', error)
    
    // 如果是数据库连接错误，返回更友好的错误信息
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed. Please check your database configuration.'
      }, { status: 503 })
    }
    
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
        status: 'PENDING',
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
