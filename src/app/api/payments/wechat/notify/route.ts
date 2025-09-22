import { NextRequest, NextResponse } from 'next/server'
import PaymentManager, { PaymentProvider } from '@/lib/payment'

// 微信支付回调处理
export async function POST(request: NextRequest) {
  try {
    console.log('收到微信支付回调')

    // 获取回调头部信息
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // 获取回调内容
    const body = await request.text()

    console.log('微信支付回调头部:', headers)
    console.log('微信支付回调内容:', body)

    // 解析JSON内容
    const params = JSON.parse(body)

    // 处理支付回调
    const paymentManager = new PaymentManager()
    const result = await paymentManager.handlePaymentNotify(
      PaymentProvider.WECHAT,
      params,
      headers
    )

    if (result.success) {
      console.log('微信支付回调处理成功:', result.message)
      return NextResponse.json({
        code: 'SUCCESS',
        message: '成功'
      })
    } else {
      console.error('微信支付回调处理失败:', result.message)
      return NextResponse.json({
        code: 'FAIL',
        message: result.message
      }, { status: 400 })
    }
  } catch (error) {
    console.error('微信支付回调处理异常:', error)
    return NextResponse.json({
      code: 'FAIL',
      message: '系统异常'
    }, { status: 500 })
  }
}

// 微信退款回调处理
export async function PUT(request: NextRequest) {
  try {
    console.log('收到微信退款回调')

    // 获取回调头部信息
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // 获取回调内容
    const body = await request.text()
    const params = JSON.parse(body)

    console.log('微信退款回调:', params)

    // 这里可以处理退款状态更新
    // 根据实际需求实现退款状态同步逻辑

    return NextResponse.json({
      code: 'SUCCESS',
      message: '成功'
    })
  } catch (error) {
    console.error('微信退款回调处理异常:', error)
    return NextResponse.json({
      code: 'FAIL',
      message: '系统异常'
    }, { status: 500 })
  }
}