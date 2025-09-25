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
  private client: OSS | null = null
  private bucket: string
  private region: string

  constructor() {
    this.region = process.env.OSS_REGION || 'oss-cn-hangzhou'
    this.bucket = process.env.OSS_BUCKET || 'ai-agent-marketplace'
  }

  private ensureClient(): OSS {
    if (!this.client) {
      const accessKeyId = process.env.OSS_ACCESS_KEY_ID
      const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET

      if (!accessKeyId || !accessKeySecret) {
        throw new Error('OSS client is not configured. Please set OSS_ACCESS_KEY_ID and OSS_ACCESS_KEY_SECRET.')
      }

      this.client = new OSS({
        region: this.region,
        accessKeyId,
        accessKeySecret,
        bucket: this.bucket
      })
    }

    return this.client
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

      // 楠岃瘉鏂囦欢澶у皬
      if (metadata.size > 10 * 1024 * 1024) { // 10MB 闄愬埗
        return {
          success: false,
          error: '鏂囦欢澶у皬涓嶈兘瓒呰繃10MB'
        }
      }

      // 楠岃瘉鏂囦欢绫诲瀷
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/json',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

      if (!allowedTypes.includes(metadata.mimeType)) {
        return {
          success: false,
          error: '涓嶆敮鎸佺殑鏂囦欢绫诲瀷'
        }
      }

      // 涓婁紶鏂囦欢
      const client = this.ensureClient()
      const result = await client.put(filename, buffer, {
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
      console.error('OSS涓婁紶澶辫触:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '涓婁紶澶辫触'
      }
    }
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const client = this.ensureClient()
      await client.delete(filename)
      return true
    } catch (error) {
      console.error('OSS鍒犻櫎澶辫触:', error)
      return false
    }
  }

  async getSignedUrl(filename: string, expireTime: number = 3600): Promise<string | null> {
    try {
      const client = this.ensureClient()
      const url = client.signatureUrl(filename, {
        expires: expireTime
      })
      return url
    } catch (error) {
      console.error('鐢熸垚绛惧悕URL澶辫触:', error)
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
      const client = this.ensureClient()
      const result = await client.list({
        prefix,
        'max-keys': 100
      })

      if (!result.objects) return []

      const endpointHost = `${this.bucket}.${this.region}.aliyuncs.com`

      return result.objects.reduce<Array<{ filename: string; url: string; lastModified: Date; size: number }>>((files, obj) => {
        if (!obj.name) {
          return files
        }

        const size = typeof obj.size === 'number' ? obj.size : Number(obj.size || 0)
        const lastModified = obj.lastModified ? new Date(obj.lastModified) : new Date(0)

        files.push({
          filename: obj.name,
          url: `https://${endpointHost}/${obj.name}`,
          lastModified,
          size
        })

        return files
      }, [])
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛鏂囦欢鍒楄〃澶辫触:', error)
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
      const client = this.ensureClient()
      const result = await client.head(filename)
      const metadata = result.meta
        ? Object.fromEntries(
            Object.entries(result.meta).map(([key, value]) => [key, String(value ?? '')])
          )
        : undefined

      return {
        exists: true,
        size: parseInt(result.res.headers['content-length'] || '0'),
        lastModified: new Date(result.res.headers['last-modified'] || ''),
        ...(metadata ? { metadata } : {})
      }
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        return { exists: false }
      }
      console.error('鑾峰彇鏂囦欢淇℃伅澶辫触:', error)
      return { exists: false }
    }
  }
}

export const ossService = new OSSService()
export default OSSService



