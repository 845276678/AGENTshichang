// 百度文心一言 API 集成
import axios, { AxiosResponse } from 'axios'

interface BaiduTokenResponse {
  access_token: string
  expires_in: number
  error?: string
  error_description?: string
}

interface BaiduChatRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  top_p?: number
  penalty_score?: number
  user_id?: string
}

interface BaiduChatResponse {
  id: string
  object: string
  created: number
  result: string
  is_truncated: boolean
  need_clear_history: boolean
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  error_code?: number
  error_msg?: string
}

export class BaiduWenxinService {
  private apiKey: string
  private secretKey: string
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0
  private readonly baseUrl = 'https://aip.baidubce.com'

  constructor() {
    this.apiKey = process.env.BAIDU_API_KEY || ''
    this.secretKey = process.env.BAIDU_SECRET_KEY || ''

    if (!this.apiKey || !this.secretKey) {
      throw new Error('百度API密钥未配置')
    }
  }

  // 获取访问令牌
  private async getAccessToken(): Promise<string> {
    // 如果token存在且未过期，直接返回
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    try {
      const response: AxiosResponse<BaiduTokenResponse> = await axios.post(
        `${this.baseUrl}/oauth/2.0/token`,
        null,
        {
          params: {
            grant_type: 'client_credentials',
            client_id: this.apiKey,
            client_secret: this.secretKey
          },
          timeout: 10000
        }
      )

      if (response.data.error) {
        throw new Error(`百度认证失败: ${response.data.error_description}`)
      }

      this.accessToken = response.data.access_token
      // 提前5分钟过期，避免边界情况
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000

      return this.accessToken
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`百度认证请求失败: ${error.message}`)
      }
      throw error
    }
  }

  // 调用文心一言API
  async chat(prompt: string, options: {
    temperature?: number
    topP?: number
    userId?: string
  } = {}): Promise<{
    content: string
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    try {
      const accessToken = await this.getAccessToken()

      const requestData: BaiduChatRequest = {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.8,
        penalty_score: 1.0,
        user_id: options.userId
      }

      const response: AxiosResponse<BaiduChatResponse> = await axios.post(
        `${this.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro`,
        requestData,
        {
          params: {
            access_token: accessToken
          },
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60秒超时
        }
      )

      if (response.data.error_code) {
        throw new Error(`百度API错误: ${response.data.error_msg}`)
      }

      return {
        content: response.data.result,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          // token过期，清除缓存并重试一次
          this.accessToken = null
          this.tokenExpiresAt = 0

          if (!error.config?.headers?.['X-Retry']) {
            error.config = error.config || {}
            error.config.headers = error.config.headers || {}
            error.config.headers['X-Retry'] = 'true'
            return this.chat(prompt, options)
          }
        }

        throw new Error(`百度API调用失败: ${error.response?.data?.error_msg || error.message}`)
      }
      throw error
    }
  }

  // 检查服务状态
  async healthCheck(): Promise<boolean> {
    try {
      await this.getAccessToken()
      return true
    } catch (error) {
      console.error('百度文心一言健康检查失败:', error)
      return false
    }
  }

  // 获取模型信息
  getModelInfo() {
    return {
      provider: '百度',
      model: 'ERNIE-Bot-4.0',
      capabilities: ['基本盘分析', '实战指导', '行动建议'],
      maxTokens: 4096,
      supportedLanguages: ['zh', 'en']
    }
  }
}

export default BaiduWenxinService