// 腾讯混元大模型 API 集成
import axios, { AxiosResponse } from 'axios'
import crypto from 'crypto'

interface TencentMessage {
  Role: 'user' | 'assistant' | 'system'
  Content: string
}

interface TencentChatRequest {
  Model: string
  Messages: TencentMessage[]
  Temperature?: number
  TopP?: number
  MaxTokens?: number
  Stream?: boolean
}

interface TencentChatResponse {
  Response: {
    Choices: Array<{
      Message: {
        Role: string
        Content: string
      }
      FinishReason: string
    }>
    Usage: {
      PromptTokens: number
      CompletionTokens: number
      TotalTokens: number
    }
    RequestId: string
    Error?: {
      Code: string
      Message: string
    }
  }
}

interface TencentCredentials {
  secretId: string
  secretKey: string
}

export class TencentHunyuanService {
  private credentials: TencentCredentials
  private readonly region = 'ap-beijing'
  private readonly service = 'hunyuan'
  private readonly version = '2023-09-01'
  private readonly action = 'ChatCompletions'
  private readonly endpoint = 'hunyuan.tencentcloudapi.com'

  constructor() {
    this.credentials = {
      secretId: process.env.TENCENT_SECRET_ID || '',
      secretKey: process.env.TENCENT_SECRET_KEY || ''
    }

    if (!this.credentials.secretId || !this.credentials.secretKey) {
      throw new Error('腾讯云API密钥未配置')
    }
  }

  // 生成腾讯云签名
  private generateSignature(requestPayload: string, timestamp: number): string {
    const date = new Date(timestamp * 1000).toISOString().substr(0, 10)

    // 步骤1：拼接规范请求串
    const httpRequestMethod = 'POST'
    const canonicalUri = '/'
    const canonicalQueryString = ''
    const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${this.endpoint}\nx-tc-action:${this.action.toLowerCase()}\n`
    const signedHeaders = 'content-type;host;x-tc-action'
    const hashedRequestPayload = crypto.createHash('sha256').update(requestPayload).digest('hex')
    const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`

    // 步骤2：拼接待签名字符串
    const algorithm = 'TC3-HMAC-SHA256'
    const credentialScope = `${date}/${this.service}/tc3_request`
    const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`

    // 步骤3：计算签名
    const secretDate = crypto.createHmac('sha256', `TC3${this.credentials.secretKey}`).update(date).digest()
    const secretService = crypto.createHmac('sha256', secretDate).update(this.service).digest()
    const secretSigning = crypto.createHmac('sha256', secretService).update('tc3_request').digest()
    const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex')

    // 步骤4：拼接 Authorization
    const authorization = `${algorithm} Credential=${this.credentials.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    return authorization
  }

  // 调用腾讯混元API
  async chat(prompt: string, options: {
    model?: string
    temperature?: number
    topP?: number
    maxTokens?: number
    systemPrompt?: string
  } = {}): Promise<{
    content: string
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    try {
      const messages: TencentMessage[] = []

      // 添加系统提示
      if (options.systemPrompt) {
        messages.push({
          Role: 'system',
          Content: options.systemPrompt
        })
      }

      // 添加用户消息
      messages.push({
        Role: 'user',
        Content: prompt
      })

      const requestData: TencentChatRequest = {
        Model: options.model || 'hunyuan-lite',
        Messages: messages,
        Temperature: options.temperature || 0.7,
        TopP: options.topP || 0.8,
        MaxTokens: options.maxTokens || 2048,
        Stream: false
      }

      const requestPayload = JSON.stringify(requestData)
      const timestamp = Math.floor(Date.now() / 1000)
      const authorization = this.generateSignature(requestPayload, timestamp)

      const response: AxiosResponse<TencentChatResponse> = await axios.post(
        `https://${this.endpoint}`,
        requestData,
        {
          headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json; charset=utf-8',
            'Host': this.endpoint,
            'X-TC-Action': this.action,
            'X-TC-Timestamp': timestamp.toString(),
            'X-TC-Version': this.version,
            'X-TC-Region': this.region
          },
          timeout: 60000
        }
      )

      if (response.data.Response.Error) {
        throw new Error(`腾讯混元API错误: ${response.data.Response.Error.Message} (${response.data.Response.Error.Code})`)
      }

      const choices = response.data.Response.Choices
      if (!choices || choices.length === 0) {
        throw new Error('腾讯混元API响应格式错误')
      }

      return {
        content: choices[0]?.Message?.Content || '',
        usage: {
          promptTokens: response.data.Response.Usage.PromptTokens,
          completionTokens: response.data.Response.Usage.CompletionTokens,
          totalTokens: response.data.Response.Usage.TotalTokens
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data?.Response?.Error
        if (errorData) {
          throw new Error(`腾讯混元API调用失败: ${errorData.Message} (${errorData.Code})`)
        }
        throw new Error(`腾讯混元API调用失败: ${error.message}`)
      }
      throw error
    }
  }

  // 流式调用
  async chatStream(
    prompt: string,
    onMessage: (content: string) => void,
    options: {
      model?: string
      temperature?: number
      topP?: number
      maxTokens?: number
      systemPrompt?: string
    } = {}
  ): Promise<{
    content: string
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const messages: TencentMessage[] = []

        if (options.systemPrompt) {
          messages.push({
            Role: 'system',
            Content: options.systemPrompt
          })
        }

        messages.push({
          Role: 'user',
          Content: prompt
        })

        const requestData: TencentChatRequest = {
          Model: options.model || 'hunyuan-lite',
          Messages: messages,
          Temperature: options.temperature || 0.7,
          TopP: options.topP || 0.8,
          MaxTokens: options.maxTokens || 2048,
          Stream: true
        }

        const requestPayload = JSON.stringify(requestData)
        const timestamp = Math.floor(Date.now() / 1000)
        const authorization = this.generateSignature(requestPayload, timestamp)

        const response = await axios.post(
          `https://${this.endpoint}`,
          requestData,
          {
            headers: {
              'Authorization': authorization,
              'Content-Type': 'application/json; charset=utf-8',
              'Host': this.endpoint,
              'X-TC-Action': this.action,
              'X-TC-Timestamp': timestamp.toString(),
              'X-TC-Version': this.version,
              'X-TC-Region': this.region,
              'Accept': 'text/event-stream'
            },
            responseType: 'stream',
            timeout: 60000
          }
        )

        let fullContent = ''
        let usage = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        }

        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim()
                if (jsonStr && jsonStr !== '[DONE]') {
                  const data = JSON.parse(jsonStr)

                  if (data.Response?.Choices?.[0]?.Message?.Content) {
                    const content = data.Response.Choices[0].Message.Content
                    fullContent += content
                    onMessage(content)
                  }

                  if (data.Response?.Usage) {
                    usage = {
                      promptTokens: data.Response.Usage.PromptTokens,
                      completionTokens: data.Response.Usage.CompletionTokens,
                      totalTokens: data.Response.Usage.TotalTokens
                    }
                  }
                }
              } catch (parseError) {
                console.warn('解析腾讯混元SSE数据失败:', parseError)
              }
            }
          }
        })

        response.data.on('end', () => {
          resolve({
            content: fullContent,
            usage
          })
        })

        response.data.on('error', (error: Error) => {
          reject(new Error(`腾讯混元流式调用失败: ${error.message}`))
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  // 多轮对话
  async multiTurnChat(messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>, options: {
    model?: string
    temperature?: number
    topP?: number
    maxTokens?: number
    systemPrompt?: string
  } = {}): Promise<{
    content: string
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    try {
      const tencentMessages: TencentMessage[] = []

      if (options.systemPrompt) {
        tencentMessages.push({
          Role: 'system',
          Content: options.systemPrompt
        })
      }

      // 转换消息格式
      for (const msg of messages) {
        tencentMessages.push({
          Role: msg.role,
          Content: msg.content
        })
      }

      const requestData: TencentChatRequest = {
        Model: options.model || 'hunyuan-lite',
        Messages: tencentMessages,
        Temperature: options.temperature || 0.7,
        TopP: options.topP || 0.8,
        MaxTokens: options.maxTokens || 2048
      }

      const requestPayload = JSON.stringify(requestData)
      const timestamp = Math.floor(Date.now() / 1000)
      const authorization = this.generateSignature(requestPayload, timestamp)

      const response: AxiosResponse<TencentChatResponse> = await axios.post(
        `https://${this.endpoint}`,
        requestData,
        {
          headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json; charset=utf-8',
            'Host': this.endpoint,
            'X-TC-Action': this.action,
            'X-TC-Timestamp': timestamp.toString(),
            'X-TC-Version': this.version,
            'X-TC-Region': this.region
          },
          timeout: 60000
        }
      )

      if (response.data.Response.Error) {
        throw new Error(`腾讯混元API错误: ${response.data.Response.Error.Message}`)
      }

      const choices = response.data.Response.Choices
      if (!choices || choices.length === 0) {
        throw new Error('腾讯混元API响应格式错误')
      }

      return {
        content: choices[0]?.Message?.Content || '',
        usage: {
          promptTokens: response.data.Response.Usage.PromptTokens,
          completionTokens: response.data.Response.Usage.CompletionTokens,
          totalTokens: response.data.Response.Usage.TotalTokens
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`腾讯混元API调用失败: ${error.response?.data?.Response?.Error?.Message || error.message}`)
      }
      throw error
    }
  }

  // 检查服务状态
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.chat('你好', { maxTokens: 10 })
      return !!response.content
    } catch (error) {
      console.error('腾讯混元健康检查失败:', error)
      return false
    }
  }

  // 获取模型信息
  getModelInfo() {
    return {
      provider: '腾讯',
      model: 'Hunyuan-Lite',
      capabilities: ['基本盘分析', '实战指导', '行动建议', '多轮对话', '流式输出'],
      maxTokens: 32768,
      supportedLanguages: ['zh', 'en'],
      features: ['多轮对话', '流式输出', '系统提示', '高并发'],
      models: ['hunyuan-lite', 'hunyuan-standard', 'hunyuan-pro']
    }
  }
}

export default TencentHunyuanService