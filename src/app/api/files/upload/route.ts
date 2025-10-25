import { NextRequest } from 'next/server'
import FileStorageManager, { FileType } from '@/lib/storage'
import { verifyToken } from '@/lib/jwt'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/errors'

export const dynamic = 'force-dynamic'


// 文件上传API
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('未提供认证token', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return createErrorResponse('token无效或已过期', 401)
    }

    const userId = decoded.userId

    // 解析表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const folder = formData.get('folder') as string
    const isPublic = formData.get('public') === 'true'

    if (!file) {
      return createErrorResponse('未选择文件', 400)
    }

    // 验证文件类型
    const fileType = type as FileType || FileType.OTHER
    if (!Object.values(FileType).includes(fileType)) {
      return createErrorResponse('不支持的文件类型', 400)
    }

    // 转换文件为Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // 上传文件
    const storageManager = new FileStorageManager()

    let uploadResult
    if (fileType === FileType.IMAGE) {
      // 图片上传（带处理）
      uploadResult = await storageManager.uploadImage(
        buffer,
        file.name,
        userId,
        {
          type: fileType,
          folder,
          public: isPublic,
          quality: 85,
          format: 'jpg'
        }
      )
    } else {
      // 普通文件上传
      uploadResult = await storageManager.uploadFile(
        buffer,
        file.name,
        userId,
        {
          type: fileType,
          folder,
          public: isPublic
        }
      )
    }

    return createSuccessResponse({
      id: uploadResult.id,
      filename: uploadResult.filename,
      originalName: uploadResult.originalName,
      url: uploadResult.url,
      size: uploadResult.size,
      contentType: uploadResult.contentType,
      type: uploadResult.type
    }, '文件上传成功')

  } catch (error) {
    return handleApiError(error)
  }
}

// 获取上传签名（前端直传）
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('未提供认证token', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return createErrorResponse('token无效或已过期', 401)
    }

    const userId = decoded.userId
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as FileType || FileType.OTHER
    const maxSize = parseInt(searchParams.get('maxSize') || '10485760') // 10MB

    // 生成上传签名
    const storageManager = new FileStorageManager()
    const signatureData = await storageManager.generateUploadSignature(
      userId,
      type,
      maxSize
    )

    return createSuccessResponse(signatureData, '上传签名生成成功')

  } catch (error) {
    return handleApiError(error)
  }
}