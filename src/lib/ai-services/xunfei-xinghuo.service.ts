// 讯飞星火认知大模型 API 集成
import axios, { AxiosResponse } from 'axios'
import crypto from 'crypto'

interface XunfeiMessage {
  role: 'user' | 'assistant'
  content: string
}

interface XunfeiChatRequest {
  header: {
    app_id: string
    uid?: string
  }
  parameter: {
    chat: {
      domain: string
      temperature?: number
      max_tokens?: number
      top_k?: number
      chat_id?: string
    }
  }
  payload: {
    message: {
      text: XunfeiMessage[]
    }
  }
}

interface XunfeiChatResponse {
  header: {
    code: number
    message: string
    sid: string
    status: number
  }
  payload?: {
    choices: {
      status: number
      seq: number
      text: Array<{
        content: string
        role: string
        index: number
      }>
    }
    usage: {
      text: {
        question_tokens: number
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
      }
    }
  }
}

export class XunfeiXinghuoService {
  private appId: string
  private apiSecret: string
  private apiKey: string
  private readonly baseUrl = 'wss://spark-api.xf-yun.com'
  private readonly httpUrl = 'https://spark-api-open.xf-yun.com/v1/chat/completions'

  constructor() {
    this.appId = process.env.XUNFEI_APP_ID || ''
    this.apiSecret = process.env.XUNFEI_API_SECRET || ''
    this.apiKey = process.env.XUNFEI_API_KEY || ''

    if (!this.appId || !this.apiSecret || !this.apiKey) {
      throw new Error('讯飞API密钥未配置')
    }
  }

  // 生成认证URL
  private generateAuthUrl(): string {
    const host = 'spark-api.xf-yun.com'
    const path = '/v3.5/chat'
    const date = new Date().toUTCString()

    // 生成签名
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(signatureOrigin)
      .digest('base64')

    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    const authorization = Buffer.from(authorizationOrigin).toString('base64')

    return `${this.baseUrl}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`
  }

  // 使用HTTP API调用（推荐）
  async chat(prompt: string, options: {
    temperature?: number
    maxTokens?: number
    topK?: number
    domain?: string
  } = {}): Promise<{
    content: string
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    try {
      const requestData = {
        model: options.domain || 'generalv3.5',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.5,
        max_tokens: options.maxTokens || 2048,
        top_k: options.topK || 4,
        stream: false
      }

      // 生成认证头
      const timestamp = Math.floor(Date.now() / 1000)
      const nonce = crypto.randomBytes(16).toString('hex')

      const authString = `api_key=${this.apiKey}&timestamp=${timestamp}&nonce=${nonce}`
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(authString)
        .digest('hex')

      const response: AxiosResponse<any> = await axios.post(
        this.httpUrl,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Appid': this.appId,
            'X-Timestamp': timestamp.toString(),
            'X-Nonce': nonce,
            'X-Signature': signature
          },
          timeout: 60000
        }
      )

      if (response.data.error) {
        throw new Error(`讯飞API错误: ${response.data.error.message}`)
      }

      const choice = response.data.choices?.[0]
      if (!choice) {
        throw new Error('讯飞API响应格式错误')
      }

      return {
        content: choice.message.content,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.error?.message || error.message
        throw new Error(`讯飞API调用失败: ${errorMsg}`)
      }
      throw error
    }
  }

  // WebSocket方式调用（流式）
  async chatStream(prompt: string, onMessage: (content: string) => void, options: {
    temperature?: number
    maxTokens?: number
    domain?: string
  } = {}): Promise<{
    content: string
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    return new Promise((resolve, reject) => {
      try {
        const WebSocket = require('ws')
        const authUrl = this.generateAuthUrl()
        const ws = new WebSocket(authUrl)

        let fullContent = ''
        let usage = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        }

        ws.on('open', () => {
          const requestData: XunfeiChatRequest = {
            header: {
              app_id: this.appId,
              uid: 'user_' + Date.now()
            },
            parameter: {
              chat: {
                domain: options.domain || 'generalv3.5',
                temperature: options.temperature || 0.5,
                max_tokens: options.maxTokens || 2048
              }
            },
            payload: {
              message: {
                text: [
                  {
                    role: 'user',
                    content: prompt
                  }
                ]
              }
            }
          }

          ws.send(JSON.stringify(requestData))
        })

        ws.on('message', (data: Buffer) => {
          try {
            const response: XunfeiChatResponse = JSON.parse(data.toString())

            if (response.header.code !== 0) {
              reject(new Error(`讯飞API错误: ${response.header.message}`))
              return
            }

            if (response.payload?.choices?.text) {
              const textContent = response.payload.choices.text
                .map(item => item.content)
                .join('')

              fullContent += textContent
              onMessage(textContent)

              if (response.payload.usage) {
                usage = {
                  promptTokens: response.payload.usage.text.prompt_tokens,
                  completionTokens: response.payload.usage.text.completion_tokens,
                  totalTokens: response.payload.usage.text.total_tokens
                }
              }
            }

            // 检查是否完成
            if (response.header.status === 2) {
              ws.close()
              resolve({
                content: fullContent,
                usage
              })
            }
          } catch (error) {
            reject(error)
          }
        })

        ws.on('error', (error: Error) => {
          reject(new Error(`讯飞WebSocket连接失败: ${error.message}`))
        })

        ws.on('close', () => {
          if (fullContent) {
            resolve({
              content: fullContent,
              usage
            })
          }
        })

        // 设置超时
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close()
            reject(new Error('讯飞API调用超时'))
          }
        }, 60000)

      } catch (error) {
        reject(error)
      }
    })
  }

  // 检查服务状态
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.chat('你好', { maxTokens: 10 })
      return !!response.content
    } catch (error) {
      console.error('讯飞星火健康检查失败:', error)
      return false
    }
  }

  // 获取模型信息
  getModelInfo() {
    return {
      provider: '讯飞',
      model: 'Spark-3.5',
      capabilities: ['基本盘分析', '实战指导', '行动建议', '流式输出'],
      maxTokens: 8192,
      supportedLanguages: ['zh', 'en'],
      features: ['WebSocket流式', 'HTTP同步']
    }
  }
}

export default XunfeiXinghuoService