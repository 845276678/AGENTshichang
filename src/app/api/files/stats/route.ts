import { NextRequest } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic';
import FileStorageManager from '@/lib/storage'

// 强制动态渲染
export const dynamic = 'force-dynamic';
import { verifyToken } from '@/lib/jwt'

// 强制动态渲染
export const dynamic = 'force-dynamic';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/errors'

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取存储统计
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

    // 获取存储统计
    const storageManager = new FileStorageManager()
    const stats = await storageManager.getStorageStats(userId)

    // 计算使用率
    const usagePercentage = (stats.quotaUsed / stats.quotaLimit) * 100

    return createSuccessResponse({
      ...stats,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      formattedQuotaUsed: formatFileSize(stats.quotaUsed),
      formattedQuotaLimit: formatFileSize(stats.quotaLimit)
    })

  } catch (error) {
    return handleApiError(error)
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) {return '0 B'}

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}