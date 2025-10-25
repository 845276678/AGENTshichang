import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    // 检查数据库连接
    await prisma.$connect()

    // 获取用户购物车
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId
      },
      include: {
        agent: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: cartItems,
        totalItems: cartItems.length,
        totalPrice: cartItems.reduce((sum, item) => sum + (item.price || 0), 0)
      }
    })
  } catch (error) {
    console.error('Cart fetch error:', error)
    
    // 如果是数据库连接错误，返回更友好的错误信息
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed. Please check your database configuration.'
      }, { status: 503 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cart items'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, agentId, price } = body

    // 添加到购物车
    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        agentId,
        price: price || 0,
        quantity: 1,
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        cartItemId: cartItem.id,
        message: 'Item added to cart'
      }
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add item to cart'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get('cartItemId')

    if (!cartItemId) {
      return NextResponse.json({
        success: false,
        error: 'Cart item ID is required'
      }, { status: 400 })
    }

    // 从购物车删除
    await prisma.cartItem.delete({
      where: {
        id: cartItemId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart'
    })
  } catch (error) {
    console.error('Remove from cart error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to remove item from cart'
    }, { status: 500 })
  }
}
