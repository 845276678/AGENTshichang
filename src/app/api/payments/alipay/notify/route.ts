import { NextRequest, NextResponse } from 'next/server'
import PaymentManager, { PaymentProvider } from '@/lib/payment'

// 支付宝回调处理
export async function POST(request: NextRequest) {
  try {
    console.log('收到支付宝支付回调')

    // 获取回调参数
    const formData = await request.formData()
    const params: Record<string, string> = {}

    // 转换FormData为对象
    for (const [key, value] of formData.entries()) {
      params[key] = value.toString()
    }

    console.log('支付宝回调参数:', params)

    // 处理支付回调
    const paymentManager = new PaymentManager()
    const result = await paymentManager.handlePaymentNotify(
      PaymentProvider.ALIPAY,
      params
    )

    if (result.success) {
      console.log('支付宝回调处理成功:', result.message)
      return new NextResponse('success', { status: 200 })
    } else {
      console.error('支付宝回调处理失败:', result.message)
      return new NextResponse('fail', { status: 400 })
    }
  } catch (error) {
    console.error('支付宝回调处理异常:', error)
    return new NextResponse('fail', { status: 500 })
  }
}

// 处理GET请求（支付宝可能会发送GET请求）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params: Record<string, string> = {}

    // 转换searchParams为对象
    for (const [key, value] of searchParams.entries()) {
      params[key] = value
    }

    console.log('支付宝GET回调参数:', params)

    // 处理支付回调
    const paymentManager = new PaymentManager()
    const result = await paymentManager.handlePaymentNotify(
      PaymentProvider.ALIPAY,
      params
    )

    if (result.success) {
      // 支付成功，重定向到成功页面
      return NextResponse.redirect(new URL('/dashboard/credits?status=success', request.url))
    } else {
      // 支付失败，重定向到失败页面
      return NextResponse.redirect(new URL('/dashboard/credits?status=failed', request.url))
    }
  } catch (error) {
    console.error('支付宝GET回调处理异常:', error)
    return NextResponse.redirect(new URL('/dashboard/credits?status=error', request.url))
  }
}