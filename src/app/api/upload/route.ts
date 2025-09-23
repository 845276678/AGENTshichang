import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ossService } from '@/lib/storage/oss.service'

export async function POST(request: NextRequest) {
  try {
    // 身份验证
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return authResult // 返回错误响应
    }

    const user = authResult.user!
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'other'

    if (!file) {
      return NextResponse.json(
        { success: false, message: '未提供文件' },
        { status: 400 }
      )
    }

    // 验证文件大小
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: '文件大小不能超过10MB' },
        { status: 400 }
      )
    }

    // 转换为Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 上传文件
    const result = await ossService.uploadFile(buffer, {
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      userId: user.id,
      category: category as any
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        filename: result.filename
      }
    })

  } catch (error) {
    console.error('文件上传错误:', error)
    return NextResponse.json(
      { success: false, message: '文件上传失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 身份验证
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return authResult // 返回错误响应
    }

    const user = authResult.user!
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined

    // 获取用户文件列表
    const files = await ossService.listUserFiles(user.id, category)

    return NextResponse.json({
      success: true,
      data: files
    })

  } catch (error) {
    console.error('获取文件列表错误:', error)
    return NextResponse.json(
      { success: false, message: '获取文件列表失败' },
      { status: 500 }
    )
  }
}