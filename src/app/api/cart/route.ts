import { NextRequest, NextResponse } from 'next/server'

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

    // 返回模拟的购物车数据，避免数据库依赖
    return NextResponse.json({
      success: true,
      data: {
        items: [],
        totalItems: 0,
        totalPrice: 0
      }
    })
  } catch (error) {
    console.error('Cart fetch error:', error)
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

    // 返回模拟的添加结果，避免数据库依赖
    return NextResponse.json({
      success: true,
      data: {
        cartItemId: `cart_${Date.now()}`,
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

    // 返回模拟的删除结果，避免数据库依赖
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
