// 阿里云OSS文件存储服务
import OSS from 'ali-oss'
import crypto from 'crypto'
import path from 'path'

interface OSSConfig {
  region: string
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  endpoint?: string
}

interface UploadOptions {
  folder?: string
  filename?: string
  public?: boolean
  maxSize?: number
  allowedTypes?: string[]
}

interface UploadResult {
  url: string
  key: string
  size: number
  contentType: string
  etag: string
}

interface SignedUrlOptions {
  expires?: number
  method?: 'GET' | 'PUT'
  contentType?: string
  contentMd5?: string
}

export class AliyunOSSService {
  private client: OSS
  private config: OSSConfig
  private baseUrl: string

  constructor() {
    this.config = {
      region: process.env.ALIYUN_OSS_REGION || 'oss-cn-beijing',
      accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET || '',
      bucket: process.env.ALIYUN_OSS_BUCKET || '',
      ...(process.env.ALIYUN_OSS_ENDPOINT && { endpoint: process.env.ALIYUN_OSS_ENDPOINT })
    }

    if (!this.config.accessKeyId || !this.config.accessKeySecret || !this.config.bucket) {
      throw new Error('阿里云OSS配置未完成')
    }

    // 初始化OSS客户端
    this.client = new OSS({
      region: this.config.region,
      accessKeyId: this.config.accessKeyId,
      accessKeySecret: this.config.accessKeySecret,
      bucket: this.config.bucket,
      ...(this.config.endpoint && { endpoint: this.config.endpoint })
    })

    // 构建基础URL
    this.baseUrl = this.config.endpoint
      ? `https://${this.config.bucket}.${this.config.endpoint}`
      : `https://${this.config.bucket}.${this.config.region}.aliyuncs.com`
  }

  // 上传文件
  async uploadFile(
    file: Buffer | string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const {
        folder = 'uploads',
        filename,
        public: isPublic = false,
        maxSize = 10 * 1024 * 1024, // 10MB
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
      } = options

      // 生成文件key
      const key = this.generateFileKey(folder, filename)

      // 检查文件大小
      const fileSize = Buffer.isBuffer(file) ? file.length : Buffer.byteLength(file, 'utf8')
      if (fileSize > maxSize) {
        throw new Error(`文件大小超过限制: ${maxSize / (1024 * 1024)}MB`)
      }

      // 检测文件类型
      const contentType = this.detectContentType(key, file)
      if (!allowedTypes.includes(contentType)) {
        throw new Error(`不支持的文件类型: ${contentType}`)
      }

      // 上传参数
      const uploadOptions: any = {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'max-age=31536000' // 1年缓存
        }
      }

      // 设置访问权限
      if (isPublic) {
        uploadOptions.headers['x-oss-object-acl'] = 'public-read'
      }

      // 执行上传
      const result = await this.client.put(key, file, uploadOptions)

      return {
        url: this.getPublicUrl(key),
        key,
        size: fileSize,
        contentType,
        etag: result.res?.headers?.etag || ''
      }
    } catch (error) {
      throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 上传图片（带压缩和处理）
  async uploadImage(
    file: Buffer,
    options: UploadOptions & {
      width?: number
      height?: number
      quality?: number
      format?: 'jpg' | 'png' | 'webp'
    } = {}
  ): Promise<UploadResult> {
    try {
      const {
        folder = 'images',
        width,
        height,
        quality = 80,
        format = 'jpg'
      } = options

      // 检查是否为图片
      const contentType = this.detectContentType('', file)
      if (!contentType.startsWith('image/')) {
        throw new Error('只能上传图片文件')
      }

      // 生成文件key
      const key = this.generateFileKey(folder, undefined, format)

      // 上传原图
      const uploadOptions: any = {
        headers: {
          'Content-Type': `image/${format}`,
          'Cache-Control': 'max-age=31536000'
        }
      }

      const result = await this.client.put(key, file, uploadOptions)

      // 如果需要处理图片，生成处理参数
      let finalUrl = this.getPublicUrl(key)
      if (width || height || quality < 100) {
        const processParams = this.buildImageProcessParams({
          ...(width && { width }),
          ...(height && { height }),
          quality,
          format
        })
        finalUrl = `${finalUrl}?${processParams}`
      }

      return {
        url: finalUrl,
        key,
        size: file.length,
        contentType: `image/${format}`,
        etag: result.res?.headers?.etag || ''
      }
    } catch (error) {
      throw new Error(`图片上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 批量上传文件
  async uploadFiles(
    files: Array<{ file: Buffer; filename?: string; folder?: string }>,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map(({ file, filename, folder }) => {
        const finalFolder = folder || options.folder
        return this.uploadFile(file, {
          ...options,
          ...(filename && { filename }),
          ...(finalFolder && { folder: finalFolder })
        })
      })

      return await Promise.all(uploadPromises)
    } catch (error) {
      throw new Error(`批量上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 删除文件
  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.delete(key)
    } catch (error) {
      throw new Error(`删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 批量删除文件
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      await this.client.deleteMulti(keys)
    } catch (error) {
      throw new Error(`批量删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 复制文件
  async copyFile(sourceKey: string, targetKey: string): Promise<void> {
    try {
      await this.client.copy(targetKey, sourceKey)
    } catch (error) {
      throw new Error(`复制文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取文件信息
  async getFileInfo(key: string): Promise<{
    size: number
    lastModified: Date
    contentType: string
    etag: string
  }> {
    try {
      const result = await this.client.head(key)

      return {
        size: parseInt(result.res.headers['content-length'] || '0'),
        lastModified: new Date(result.res.headers['last-modified'] || ''),
        contentType: result.res.headers['content-type'] || '',
        etag: result.res.headers.etag || ''
      }
    } catch (error) {
      throw new Error(`获取文件信息失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 检查文件是否存在
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.client.head(key)
      return true
    } catch (error) {
      return false
    }
  }

  // 生成签名URL（用于临时访问私有文件）
  async generateSignedUrl(
    key: string,
    options: SignedUrlOptions = {}
  ): Promise<string> {
    try {
      const {
        expires = 3600, // 1小时
        method = 'GET',
        contentType,
        contentMd5
      } = options

      const signedUrl = this.client.signatureUrl(key, {
        expires,
        method,
        ...(contentType && { 'Content-Type': contentType }),
        ...(contentMd5 && { 'Content-MD5': contentMd5 })
      })

      return signedUrl
    } catch (error) {
      throw new Error(`生成签名URL失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取上传签名（用于前端直传）
  async getUploadSignature(
    folder: string = 'uploads',
    maxSize: number = 10 * 1024 * 1024
  ): Promise<{
    accessKeyId: string
    policy: string
    signature: string
    dir: string
    host: string
    expire: number
  }> {
    try {
      const expireTime = Math.floor(Date.now() / 1000) + 3600 // 1小时后过期
      const dir = `${folder}/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/`

      // 构建policy
      const policy = {
        expiration: new Date(expireTime * 1000).toISOString(),
        conditions: [
          ['content-length-range', 0, maxSize],
          ['starts-with', '$key', dir],
          { bucket: this.config.bucket }
        ]
      }

      const policyBase64 = Buffer.from(JSON.stringify(policy)).toString('base64')

      // 生成签名
      const signature = crypto
        .createHmac('sha1', this.config.accessKeySecret)
        .update(policyBase64)
        .digest('base64')

      return {
        accessKeyId: this.config.accessKeyId,
        policy: policyBase64,
        signature,
        dir,
        host: this.baseUrl,
        expire: expireTime
      }
    } catch (error) {
      throw new Error(`生成上传签名失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 列出文件
  async listFiles(
    prefix: string = '',
    marker: string = '',
    maxKeys: number = 100
  ): Promise<{
    files: Array<{
      key: string
      size: number
      lastModified: Date
      etag: string
      url: string
    }>
    nextMarker?: string
    isTruncated: boolean
  }> {
    try {
      const result = await this.client.list({
        prefix,
        marker,
        'max-keys': maxKeys
      })

      const files = (result.objects || []).map(obj => ({
        key: obj.name,
        size: obj.size,
        lastModified: new Date(obj.lastModified),
        etag: obj.etag,
        url: this.getPublicUrl(obj.name)
      }))

      return {
        files,
        ...(result.nextMarker && { nextMarker: result.nextMarker }),
        isTruncated: result.isTruncated
      }
    } catch (error) {
      throw new Error(`列出文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取存储统计
  async getStorageStats(): Promise<{
    totalFiles: number
    totalSize: number
    lastUpdated: Date
  }> {
    try {
      // 这里可以实现存储统计逻辑
      // 由于OSS没有直接的统计API，可能需要遍历所有文件或使用数据库记录

      let totalFiles = 0
      let totalSize = 0
      let marker = ''
      let isTruncated = true

      while (isTruncated) {
        const result = await this.listFiles('', marker, 1000)
        totalFiles += result.files.length
        totalSize += result.files.reduce((sum, file) => sum + file.size, 0)

        if (result.nextMarker) {
          marker = result.nextMarker
          isTruncated = result.isTruncated
        } else {
          isTruncated = false
        }
      }

      return {
        totalFiles,
        totalSize,
        lastUpdated: new Date()
      }
    } catch (error) {
      throw new Error(`获取存储统计失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 生成文件key
  private generateFileKey(folder: string, filename?: string, extension?: string): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')

    if (filename) {
      const ext = extension || path.extname(filename)
      const name = path.basename(filename, ext)
      const hash = crypto.randomBytes(8).toString('hex')
      return `${folder}/${year}/${month}/${day}/${name}_${hash}${ext}`
    } else {
      const hash = crypto.randomBytes(16).toString('hex')
      const ext = extension ? `.${extension}` : ''
      return `${folder}/${year}/${month}/${day}/${hash}${ext}`
    }
  }

  // 检测内容类型
  private detectContentType(filename: string, _file: Buffer | string): string {
    // 简单的内容类型检测
    const ext = path.extname(filename).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }

    return mimeTypes[ext] || 'application/octet-stream'
  }

  // 构建图片处理参数
  private buildImageProcessParams(params: {
    width?: number
    height?: number
    quality?: number
    format?: string
  }): string {
    const processParams: string[] = []

    if (params.width || params.height) {
      let resize = 'm_fit'
      if (params.width) {resize += `,w_${params.width}`}
      if (params.height) {resize += `,h_${params.height}`}
      processParams.push(`resize,${resize}`)
    }

    if (params.quality && params.quality < 100) {
      processParams.push(`quality,q_${params.quality}`)
    }

    if (params.format) {
      processParams.push(`format,${params.format}`)
    }

    return `x-oss-process=image/${processParams.join('/')}`
  }

  // 获取公开访问URL
  private getPublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`
  }

  // 获取配置信息
  getConfig() {
    return {
      region: this.config.region,
      bucket: this.config.bucket,
      endpoint: this.config.endpoint,
      baseUrl: this.baseUrl
    }
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      // 尝试列出bucket信息
      await this.client.getBucketInfo()
      return true
    } catch (error) {
      console.error('阿里云OSS健康检查失败:', error)
      return false
    }
  }
}

export default AliyunOSSService
