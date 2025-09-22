import OSS from 'ali-oss'
import { v4 as uuidv4 } from 'uuid'

interface FileUploadResult {
  success: boolean
  url?: string
  filename?: string
  error?: string
}

interface FileMetadata {
  originalName: string
  size: number
  mimeType: string
  userId: string
  category: 'avatar' | 'idea-attachment' | 'product-file' | 'other'
}

class OSSService {
  private client: OSS

  constructor() {
    this.client = new OSS({
      region: process.env.OSS_REGION || 'oss-cn-hangzhou',
      accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
      bucket: process.env.OSS_BUCKET || 'ai-agent-marketplace'
    })
  }

  private generateFileName(originalName: string, category: string, userId: string): string {
    const ext = originalName.split('.').pop()
    const uuid = uuidv4()
    const timestamp = Date.now()
    return `${category}/${userId}/${timestamp}_${uuid}.${ext}`
  }

  async uploadFile(
    buffer: Buffer,
    metadata: FileMetadata
  ): Promise<FileUploadResult> {
    try {
      const filename = this.generateFileName(
        metadata.originalName,
        metadata.category,
        metadata.userId
      )

      // 验证文件大小
      if (metadata.size > 10 * 1024 * 1024) { // 10MB 限制
        return {
          success: false,
          error: '文件大小不能超过10MB'
        }
      }

      // 验证文件类型
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/json',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

      if (!allowedTypes.includes(metadata.mimeType)) {
        return {
          success: false,
          error: '不支持的文件类型'
        }
      }

      // 上传文件
      const result = await this.client.put(filename, buffer, {
        headers: {
          'Content-Type': metadata.mimeType,
          'x-oss-meta-original-name': metadata.originalName,
          'x-oss-meta-user-id': metadata.userId,
          'x-oss-meta-category': metadata.category
        }
      })

      return {
        success: true,
        url: result.url,
        filename: filename
      }
    } catch (error) {
      console.error('OSS上传失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败'
      }
    }
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      await this.client.delete(filename)
      return true
    } catch (error) {
      console.error('OSS删除失败:', error)
      return false
    }
  }

  async getSignedUrl(filename: string, expireTime: number = 3600): Promise<string | null> {
    try {
      const url = this.client.signatureUrl(filename, {
        expires: expireTime
      })
      return url
    } catch (error) {
      console.error('生成签名URL失败:', error)
      return null
    }
  }

  async uploadAvatar(buffer: Buffer, originalName: string, userId: string): Promise<FileUploadResult> {
    return this.uploadFile(buffer, {
      originalName,
      size: buffer.length,
      mimeType: this.getMimeTypeFromExtension(originalName),
      userId,
      category: 'avatar'
    })
  }

  async uploadIdeaAttachment(buffer: Buffer, originalName: string, userId: string): Promise<FileUploadResult> {
    return this.uploadFile(buffer, {
      originalName,
      size: buffer.length,
      mimeType: this.getMimeTypeFromExtension(originalName),
      userId,
      category: 'idea-attachment'
    })
  }

  async uploadProductFile(buffer: Buffer, originalName: string, userId: string): Promise<FileUploadResult> {
    return this.uploadFile(buffer, {
      originalName,
      size: buffer.length,
      mimeType: this.getMimeTypeFromExtension(originalName),
      userId,
      category: 'product-file'
    })
  }

  private getMimeTypeFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'json': 'application/json',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }

  async listUserFiles(userId: string, category?: string): Promise<Array<{
    filename: string
    url: string
    lastModified: Date
    size: number
  }>> {
    try {
      const prefix = category ? `${category}/${userId}/` : `${userId}/`
      const result = await this.client.list({
        prefix,
        'max-keys': 100
      })

      if (!result.objects) return []

      return result.objects.map(obj => ({
        filename: obj.name || '',
        url: `https://${this.client.options.bucket}.${this.client.options.region}.aliyuncs.com/${obj.name}`,
        lastModified: new Date(obj.lastModified || ''),
        size: obj.size || 0
      }))
    } catch (error) {
      console.error('获取用户文件列表失败:', error)
      return []
    }
  }

  async getFileInfo(filename: string): Promise<{
    exists: boolean
    size?: number
    lastModified?: Date
    metadata?: Record<string, string>
  }> {
    try {
      const result = await this.client.head(filename)
      return {
        exists: true,
        size: parseInt(result.res.headers['content-length'] || '0'),
        lastModified: new Date(result.res.headers['last-modified'] || ''),
        metadata: result.meta
      }
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        return { exists: false }
      }
      console.error('获取文件信息失败:', error)
      return { exists: false }
    }
  }
}

export const ossService = new OSSService()
export default OSSService