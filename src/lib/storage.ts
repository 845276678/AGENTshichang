// 鏂囦欢瀛樺偍绠＄悊妯″潡
import { prisma } from './database'

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  AVATAR = 'avatar',
  REPORT = 'report',
  OTHER = 'other'
}

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
    // 璁剧疆瀛樺偍閰嶉闄愬埗锛堝瓧鑺傦級
    this.quotaLimit = parseInt(process.env.STORAGE_QUOTA_LIMIT || '1073741824') // 1GB
  }

  // 涓婁紶鏂囦欢
  async uploadFile(params: {
    userId: string
    fileName: string
    fileSize: number
    mimeType: string
    buffer: Buffer
    folder?: string
  }): Promise<FileUploadResult> {
    try {
      // 妫€鏌ュ瓨鍌ㄩ厤棰?
      const currentUsage = await this.getUserStorageUsage(params.userId)
      if (currentUsage + params.fileSize > this.quotaLimit) {
        return {
          success: false,
          error: '瀛樺偍閰嶉涓嶈冻'
        }
      }

      // 鐢熸垚鍞竴鏂囦欢鍚?
      const fileId = this.generateFileId()
      const filePath = this.generateFilePath(params.folder, fileId, params.fileName)

      // 杩欓噷搴旇灏嗘枃浠朵繚瀛樺埌瀹為檯鐨勫瓨鍌ㄦ湇鍔★紙濡傞樋閲屼簯OSS銆丄WS S3绛夛級
      // 鐜板湪鍙槸妯℃嫙淇濆瓨
      const fileUrl = await this.saveFileToStorage(filePath, params.buffer)

      // 淇濆瓨鏂囦欢璁板綍鍒版暟鎹簱
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
      console.error('鏂囦欢涓婁紶澶辫触:', error)
      return {
        success: false,
        error: '鏂囦欢涓婁紶澶辫触'
      }
    }
  }

  // 鍒犻櫎鏂囦欢
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      const file = await prisma.file.findFirst({
        where: { id: fileId, userId }
      })

      if (!file) {
        return false
      }

      // 浠庡瓨鍌ㄦ湇鍔″垹闄ゆ枃浠?
      await this.deleteFileFromStorage(file.filePath)

      // 鏇存柊鏁版嵁搴撹褰?
      await prisma.file.update({
        where: { id: fileId },
        data: { status: 'DELETED' }
      })

      return true
    } catch (error) {
      console.error('鏂囦欢鍒犻櫎澶辫触:', error)
      return false
    }
  }

  // 鑾峰彇鐢ㄦ埛鏂囦欢鍒楄〃
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
      console.error('鑾峰彇鏂囦欢鍒楄〃澶辫触:', error)
      return []
    }
  }

  // 鑾峰彇瀛樺偍缁熻
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
      console.error('鑾峰彇瀛樺偍缁熻澶辫触:', error)
      return {
        totalFiles: 0,
        totalSize: 0,
        quotaUsed: 0,
        quotaLimit: this.quotaLimit
      }
    }
  }

  // 鑾峰彇鐢ㄦ埛瀛樺偍浣跨敤閲?
  async getUserStorageUsage(userId: string): Promise<number> {
    try {
      const files = await prisma.file.findMany({
        where: { userId, status: 'ACTIVE' },
        select: { fileSize: true }
      })

      return files.reduce((sum, file) => sum + file.fileSize, 0)
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛瀛樺偍浣跨敤閲忓け璐?', error)
      return 0
    }
  }

  // 鍋ュ悍妫€鏌?
  async healthCheck(): Promise<boolean> {
    try {
      // 妫€鏌ユ暟鎹簱杩炴帴
      await prisma.file.count()
      return true
    } catch (error) {
      console.error('瀛樺偍鏈嶅姟鍋ュ悍妫€鏌ュけ璐?', error)
      return false
    }
  }

  // 鐢熸垚鏂囦欢ID
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 鐢熸垚鏂囦欢璺緞
  private generateFilePath(folder: string | undefined, fileId: string, fileName: string): string {
    const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const folderPath = folder || 'default'
    return `${folderPath}/${timestamp}/${fileId}_${fileName}`
  }

  // 淇濆瓨鏂囦欢鍒板瓨鍌ㄦ湇鍔★紙妯℃嫙锛?
  private async saveFileToStorage(filePath: string, buffer: Buffer): Promise<string> {
    // 杩欓噷搴旇璋冪敤瀹為檯鐨勫瓨鍌ㄦ湇鍔PI
    // 鐜板湪杩斿洖涓€涓ā鎷熺殑URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/files/${filePath}`
  }

  // 浠庡瓨鍌ㄦ湇鍔″垹闄ゆ枃浠讹紙妯℃嫙锛?
  private async deleteFileFromStorage(filePath: string): Promise<void> {
    // 杩欓噷搴旇璋冪敤瀹為檯鐨勫瓨鍌ㄦ湇鍔PI鍒犻櫎鏂囦欢
    console.log(`鍒犻櫎鏂囦欢: ${filePath}`)
  }
}
