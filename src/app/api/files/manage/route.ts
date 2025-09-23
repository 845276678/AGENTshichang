import { NextRequest } from 'next/server'
import FileStorageManager from '@/lib/storage'
import { verifyToken } from '@/lib/jwt'
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/errors'

// 获取用户文件列表
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
    const type = searchParams.get('type') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    // 获取文件列表
    const storageManager = new FileStorageManager()
    const result = await storageManager.getUserFiles(userId, {
      type: type as any,
      page,
      limit,
      ...(search && { search })
    })

    return createSuccessResponse({
      files: result.files,
      pagination: {
        total: result.total,
        page,
        limit,
        hasNext: result.hasNext
      }
    })

  } catch (error) {
    return handleApiError(error)
  }
}

// 删除文件
export async function DELETE(request: NextRequest) {
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
    const { fileIds } = await request.json()

    if (!fileIds || !Array.isArray(fileIds)) {
      return createErrorResponse('请提供要删除的文件ID列表', 400)
    }

    // 删除文件
    const storageManager = new FileStorageManager()
    if (fileIds.length === 1) {
      await storageManager.deleteFile(fileIds[0], userId)
    } else {
      await storageManager.deleteFiles(fileIds, userId)
    }

    return createSuccessResponse(null, '文件删除成功')

  } catch (error) {
    return handleApiError(error)
  }
}