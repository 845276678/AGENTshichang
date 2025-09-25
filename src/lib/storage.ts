// 文件存储管理模块
import { prisma } from './database'

export interface StorageStats {
  totalFiles: number
  totalSize: number
  quotaUsed: number
  quotaLimit: number
}

export interface FileUploadResult {
  success: boolean
  fileId?: string
  url?: string
  error?: string
}

export default class FileStorageManager {
  private quotaLimit: number

  constructor() {
    // 设置存储配额限制（字节）
    this.quotaLimit = parseInt(process.env.STORAGE_QUOTA_LIMIT || '1073741824') // 1GB
  }

  // 上传文件
  async uploadFile(params: {
    userId: string
    fileName: string
    fileSize: number
    mimeType: string
    buffer: Buffer
    folder?: string
  }): Promise<FileUploadResult> {
    try {
      // 检查存储配额
      const currentUsage = await this.getUserStorageUsage(params.userId)
      if (currentUsage + params.fileSize > this.quotaLimit) {
        return {
          success: false,
          error: '存储配额不足'
        }
      }

      // 生成唯一文件名
      const fileId = this.generateFileId()
      const filePath = this.generateFilePath(params.folder, fileId, params.fileName)

      // 这里应该将文件保存到实际的存储服务（如阿里云OSS、AWS S3等）
      // 现在只是模拟保存
      const fileUrl = await this.saveFileToStorage(filePath, params.buffer)

      // 保存文件记录到数据库
      const fileRecord = await prisma.file.create({
        data: {
          id: fileId,
          userId: params.userId,
          fileName: params.fileName,
          fileSize: params.fileSize,
          mimeType: params.mimeType,
          filePath,
          fileUrl,
          folder: params.folder || 'default',
          status: 'ACTIVE'
        }
      })

      return {
        success: true,
        fileId: fileRecord.id,
        url: fileRecord.fileUrl
      }
    } catch (error) {
      console.error('文件上传失败:', error)
      return {
        success: false,
        error: '文件上传失败'
      }
    }
  }

  // 删除文件
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      const file = await prisma.file.findFirst({
        where: { id: fileId, userId }
      })

      if (!file) {
        return false
      }

      // 从存储服务删除文件
      await this.deleteFileFromStorage(file.filePath)

      // 更新数据库记录
      await prisma.file.update({
        where: { id: fileId },
        data: { status: 'DELETED' }
      })

      return true
    } catch (error) {
      console.error('文件删除失败:', error)
      return false
    }
  }

  // 获取用户文件列表
  async getUserFiles(userId: string, folder?: string) {
    try {
      const where: any = { userId, status: 'ACTIVE' }
      if (folder) {
        where.folder = folder
      }

      return await prisma.file.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('获取文件列表失败:', error)
      return []
    }
  }

  // 获取存储统计
  async getStorageStats(): Promise<StorageStats> {
    try {
      const [totalFiles, files] = await Promise.all([
        prisma.file.count({ where: { status: 'ACTIVE' } }),
        prisma.file.findMany({
          where: { status: 'ACTIVE' },
          select: { fileSize: true }
        })
      ])

      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0)

      return {
        totalFiles,
        totalSize,
        quotaUsed: totalSize,
        quotaLimit: this.quotaLimit
      }
    } catch (error) {
      console.error('获取存储统计失败:', error)
      return {
        totalFiles: 0,
        totalSize: 0,
        quotaUsed: 0,
        quotaLimit: this.quotaLimit
      }
    }
  }

  // 获取用户存储使用量
  async getUserStorageUsage(userId: string): Promise<number> {
    try {
      const files = await prisma.file.findMany({
        where: { userId, status: 'ACTIVE' },
        select: { fileSize: true }
      })

      return files.reduce((sum, file) => sum + file.fileSize, 0)
    } catch (error) {
      console.error('获取用户存储使用量失败:', error)
      return 0
    }
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      // 检查数据库连接
      await prisma.file.count()
      return true
    } catch (error) {
      console.error('存储服务健康检查失败:', error)
      return false
    }
  }

  // 生成文件ID
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 生成文件路径
  private generateFilePath(folder: string | undefined, fileId: string, fileName: string): string {
    const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const folderPath = folder || 'default'
    return `${folderPath}/${timestamp}/${fileId}_${fileName}`
  }

  // 保存文件到存储服务（模拟）
  private async saveFileToStorage(filePath: string, buffer: Buffer): Promise<string> {
    // 这里应该调用实际的存储服务API
    // 现在返回一个模拟的URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/files/${filePath}`
  }

  // 从存储服务删除文件（模拟）
  private async deleteFileFromStorage(filePath: string): Promise<void> {
    // 这里应该调用实际的存储服务API删除文件
    console.log(`删除文件: ${filePath}`)
  }
}
