// 文件存储管理器
import AliyunOSSService from './aliyun-oss.service'
import { prisma } from '../database'

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  AVATAR = 'avatar',
  REPORT = 'report',
  OTHER = 'other'
}

export enum FileStatus {
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  FAILED = 'failed',
  DELETED = 'deleted'
}

export interface FileRecord {
  id: string
  userId: string
  filename: string
  originalName: string
  key: string
  url: string
  size: number
  contentType: string
  type: FileType
  status: FileStatus
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface UploadOptions {
  type?: FileType
  folder?: string
  public?: boolean
  maxSize?: number
  allowedTypes?: string[]
  metadata?: Record<string, any>
}

export class FileStorageManager {
  private ossService: AliyunOSSService | null = null

  constructor() {
    try {
      this.ossService = new AliyunOSSService()
    } catch (error) {
      console.warn('阿里云OSS服务初始化失败:', error)
      this.ossService = null
    }
  }

  // 上传文件
  async uploadFile(
    file: Buffer,
    originalName: string,
    userId: string,
    options: UploadOptions = {}
  ): Promise<FileRecord> {
    if (!this.ossService) {
      throw new Error('文件存储服务未配置')
    }

    try {
      const {
        type = FileType.OTHER,
        folder,
        public: isPublic = true,
        maxSize = 10 * 1024 * 1024,
        allowedTypes,
        metadata = {}
      } = options

      // 根据文件类型确定存储文件夹
      const storageFolder = folder || this.getFolderByType(type)

      // 上传到OSS
      const uploadResult = await this.ossService.uploadFile(file, {
        folder: storageFolder,
        filename: originalName,
        public: isPublic,
        maxSize,
        allowedTypes
      })

      // 保存文件记录到数据库
      const fileRecord = await prisma.file.create({
        data: {
          userId,
          filename: uploadResult.key.split('/').pop() || originalName,
          originalName,
          key: uploadResult.key,
          url: uploadResult.url,
          size: uploadResult.size,
          contentType: uploadResult.contentType,
          type: type.toUpperCase(),
          status: 'UPLOADED',
          metadata: {
            ...metadata,
            etag: uploadResult.etag,
            folder: storageFolder
          }
        }
      })

      return this.formatFileRecord(fileRecord)
    } catch (error) {
      throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 上传图片（带处理）
  async uploadImage(
    file: Buffer,
    originalName: string,
    userId: string,
    options: UploadOptions & {
      width?: number
      height?: number
      quality?: number
      format?: 'jpg' | 'png' | 'webp'
    } = {}
  ): Promise<FileRecord> {
    if (!this.ossService) {
      throw new Error('文件存储服务未配置')
    }

    try {
      const {
        type = FileType.IMAGE,
        folder,
        width,
        height,
        quality = 80,
        format = 'jpg',
        metadata = {}
      } = options

      const storageFolder = folder || this.getFolderByType(type)

      // 上传图片到OSS
      const uploadResult = await this.ossService.uploadImage(file, {
        folder: storageFolder,
        filename: originalName,
        width,
        height,
        quality,
        format
      })

      // 保存文件记录
      const fileRecord = await prisma.file.create({
        data: {
          userId,
          filename: uploadResult.key.split('/').pop() || originalName,
          originalName,
          key: uploadResult.key,
          url: uploadResult.url,
          size: uploadResult.size,
          contentType: uploadResult.contentType,
          type: type.toUpperCase(),
          status: 'UPLOADED',
          metadata: {
            ...metadata,
            etag: uploadResult.etag,
            folder: storageFolder,
            imageProcess: { width, height, quality, format }
          }
        }
      })

      return this.formatFileRecord(fileRecord)
    } catch (error) {
      throw new Error(`图片上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 批量上传文件
  async uploadFiles(
    files: Array<{
      file: Buffer
      originalName: string
    }>,
    userId: string,
    options: UploadOptions = {}
  ): Promise<FileRecord[]> {
    const uploadPromises = files.map(({ file, originalName }) =>
      this.uploadFile(file, originalName, userId, options)
    )

    return await Promise.all(uploadPromises)
  }

  // 删除文件
  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      // 获取文件记录
      const fileRecord = await prisma.file.findUnique({
        where: { id: fileId }
      })

      if (!fileRecord) {
        throw new Error('文件不存在')
      }

      if (fileRecord.userId !== userId) {
        throw new Error('无权限删除此文件')
      }

      // 从OSS删除文件
      if (this.ossService) {
        await this.ossService.deleteFile(fileRecord.key)
      }

      // 更新数据库记录
      await prisma.file.update({
        where: { id: fileId },
        data: {
          status: 'DELETED',
          deletedAt: new Date()
        }
      })
    } catch (error) {
      throw new Error(`删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 批量删除文件
  async deleteFiles(fileIds: string[], userId: string): Promise<void> {
    try {
      // 获取文件记录
      const fileRecords = await prisma.file.findMany({
        where: {
          id: { in: fileIds },
          userId
        }
      })

      if (fileRecords.length !== fileIds.length) {
        throw new Error('部分文件不存在或无权限删除')
      }

      // 从OSS批量删除
      if (this.ossService && fileRecords.length > 0) {
        const keys = fileRecords.map(record => record.key)
        await this.ossService.deleteFiles(keys)
      }

      // 更新数据库记录
      await prisma.file.updateMany({
        where: { id: { in: fileIds } },
        data: {
          status: 'DELETED',
          deletedAt: new Date()
        }
      })
    } catch (error) {
      throw new Error(`批量删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取文件信息
  async getFileInfo(fileId: string, userId?: string): Promise<FileRecord> {
    try {
      const fileRecord = await prisma.file.findUnique({
        where: { id: fileId }
      })

      if (!fileRecord) {
        throw new Error('文件不存在')
      }

      if (userId && fileRecord.userId !== userId) {
        throw new Error('无权限访问此文件')
      }

      return this.formatFileRecord(fileRecord)
    } catch (error) {
      throw new Error(`获取文件信息失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取用户文件列表
  async getUserFiles(
    userId: string,
    options: {
      type?: FileType
      page?: number
      limit?: number
      search?: string
    } = {}
  ): Promise<{
    files: FileRecord[]
    total: number
    hasNext: boolean
  }> {
    try {
      const { type, page = 1, limit = 20, search } = options
      const offset = (page - 1) * limit

      const where: any = {
        userId,
        status: { not: 'DELETED' }
      }

      if (type) {
        where.type = type.toUpperCase()
      }

      if (search) {
        where.OR = [
          { filename: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } }
        ]
      }

      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit
        }),
        prisma.file.count({ where })
      ])

      return {
        files: files.map(file => this.formatFileRecord(file)),
        total,
        hasNext: offset + limit < total
      }
    } catch (error) {
      throw new Error(`获取文件列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 生成上传签名（前端直传）
  async generateUploadSignature(
    userId: string,
    type: FileType = FileType.OTHER,
    maxSize: number = 10 * 1024 * 1024
  ): Promise<{
    signature: any
    uploadUrl: string
    callback: string
  }> {
    if (!this.ossService) {
      throw new Error('文件存储服务未配置')
    }

    try {
      const folder = this.getFolderByType(type)
      const signature = await this.ossService.getUploadSignature(folder, maxSize)

      // 构建回调URL
      const callbackUrl = `${process.env.NEXTAUTH_URL}/api/files/upload-callback`

      return {
        signature,
        uploadUrl: signature.host,
        callback: callbackUrl
      }
    } catch (error) {
      throw new Error(`生成上传签名失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 处理上传回调
  async handleUploadCallback(
    data: {
      key: string
      size: number
      etag: string
      contentType: string
      userId: string
      originalName: string
      type: FileType
    }
  ): Promise<FileRecord> {
    try {
      if (!this.ossService) {
        throw new Error('文件存储服务未配置')
      }

      // 生成访问URL
      const url = `${this.ossService.getConfig().baseUrl}/${data.key}`

      // 保存文件记录
      const fileRecord = await prisma.file.create({
        data: {
          userId: data.userId,
          filename: data.key.split('/').pop() || data.originalName,
          originalName: data.originalName,
          key: data.key,
          url,
          size: data.size,
          contentType: data.contentType,
          type: data.type.toUpperCase(),
          status: 'UPLOADED',
          metadata: {
            etag: data.etag,
            uploadMethod: 'direct'
          }
        }
      })

      return this.formatFileRecord(fileRecord)
    } catch (error) {
      throw new Error(`处理上传回调失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取存储统计
  async getStorageStats(userId?: string): Promise<{
    totalFiles: number
    totalSize: number
    typeStats: Record<string, { count: number; size: number }>
    quotaUsed: number
    quotaLimit: number
  }> {
    try {
      const where = userId ? { userId, status: { not: 'DELETED' } } : { status: { not: 'DELETED' } }

      const [totalStats, typeStats] = await Promise.all([
        prisma.file.aggregate({
          where,
          _sum: { size: true },
          _count: true
        }),
        prisma.file.groupBy({
          by: ['type'],
          where,
          _sum: { size: true },
          _count: true
        })
      ])

      const typeStatsMap = typeStats.reduce((acc, stat) => {
        acc[stat.type] = {
          count: stat._count,
          size: stat._sum.size || 0
        }
        return acc
      }, {} as Record<string, { count: number; size: number }>)

      const quotaLimit = userId ? 1 * 1024 * 1024 * 1024 : 100 * 1024 * 1024 * 1024 // 1GB个人，100GB系统

      return {
        totalFiles: totalStats._count,
        totalSize: totalStats._sum.size || 0,
        typeStats: typeStatsMap,
        quotaUsed: totalStats._sum.size || 0,
        quotaLimit
      }
    } catch (error) {
      throw new Error(`获取存储统计失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 清理过期文件
  async cleanupExpiredFiles(): Promise<number> {
    try {
      // 删除30天前标记为删除的文件
      const expiredDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const expiredFiles = await prisma.file.findMany({
        where: {
          status: 'DELETED',
          deletedAt: { lt: expiredDate }
        }
      })

      if (expiredFiles.length > 0 && this.ossService) {
        // 从OSS删除文件
        const keys = expiredFiles.map(file => file.key)
        await this.ossService.deleteFiles(keys)

        // 从数据库删除记录
        await prisma.file.deleteMany({
          where: {
            id: { in: expiredFiles.map(file => file.id) }
          }
        })
      }

      return expiredFiles.length
    } catch (error) {
      console.error('清理过期文件失败:', error)
      return 0
    }
  }

  // 根据文件类型获取存储文件夹
  private getFolderByType(type: FileType): string {
    const folderMap: Record<FileType, string> = {
      [FileType.IMAGE]: 'images',
      [FileType.AVATAR]: 'avatars',
      [FileType.DOCUMENT]: 'documents',
      [FileType.REPORT]: 'reports',
      [FileType.OTHER]: 'uploads'
    }

    return folderMap[type] || 'uploads'
  }

  // 格式化文件记录
  private formatFileRecord(record: any): FileRecord {
    return {
      id: record.id,
      userId: record.userId,
      filename: record.filename,
      originalName: record.originalName,
      key: record.key,
      url: record.url,
      size: record.size,
      contentType: record.contentType,
      type: record.type.toLowerCase() as FileType,
      status: record.status.toLowerCase() as FileStatus,
      metadata: record.metadata || {},
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    if (!this.ossService) {
      return false
    }

    return await this.ossService.healthCheck()
  }

  // 获取配置信息
  getConfig() {
    return {
      hasOSS: !!this.ossService,
      ossConfig: this.ossService?.getConfig()
    }
  }
}

export default FileStorageManager