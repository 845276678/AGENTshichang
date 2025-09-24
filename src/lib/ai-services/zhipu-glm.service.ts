// 智谱GLM大模型 API 集成
import axios, { AxiosResponse } from 'axios'
import jwt from 'jsonwebtoken'

interface GLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface GLMChatRequest {
  model: string
  messages: GLMMessage[]
  temperature?: number
  top_p?: number
  max_tokens?: number
  stream?: boolean
  tools?: any[]
  tool_choice?: string
}

interface GLMChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface GLMErrorResponse {
  error: {
    code: string
    message: string
    type: string
  }
}

export class ZhipuGLMService {
  private apiKey: string
  private readonly baseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    this.apiKey = process.env.ZHIPU_API_KEY || ''

    if (!this.apiKey) {
      throw new Error('智谱GLM API密钥未配置')
    }
  }

  // 生成JWT token
  private generateJWT(): string {
    try {
      const [apiKeyId, secret] = this.apiKey.split('.')

      if (!apiKeyId || !secret) {
        throw new Error('智谱API密钥格式错误，应为 {id}.{secret} 格式')
      }

      const payload = {
        api_key: apiKeyId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1小时过期
        timestamp: Math.floor(Date.now() / 1000)
      }

      return jwt.sign(payload, secret, {
        algorithm: 'HS256',
        header: {
          alg: 'HS256',
          sign_type: 'SIGN'
        } as any
      })
    } catch (error) {
      throw new Error(`生成智谱JWT失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取访问令牌
  private getAccessToken(): string {
    // 如果token存在且未过期，直接返回
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    // 生成新的JWT token
    this.accessToken = this.generateJWT()
    // 设置过期时间为55分钟后，提前5分钟刷新
    this.tokenExpiresAt = Date.now() + 55 * 60 * 1000

    return this.accessToken
  }

  // 调用智谱GLM API
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
      const messages: GLMMessage[] = []

      // 添加系统提示
      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        })
      }

      // 添加用户消息
      messages.push({
        role: 'user',
        content: prompt
      })

      const requestData: GLMChatRequest = {
        model: options.model || 'glm-4',
        messages,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.8,
        max_tokens: options.maxTokens || 2048,
        stream: false
      }

      const token = this.getAccessToken()

      const response: AxiosResponse<GLMChatResponse | GLMErrorResponse> = await axios.post(
        this.baseUrl,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      )

      // 检查错误响应
      if ('error' in response.data) {
        throw new Error(`智谱GLM API错误: ${response.data.error.message} (${response.data.error.code})`)
      }

      const data = response.data as GLMChatResponse

      if (!data.choices || data.choices.length === 0) {
        throw new Error('智谱GLM API响应格式错误')
      }

      return {
        content: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data
        if (errorData && 'error' in errorData) {
          throw new Error(`智谱GLM API调用失败: ${errorData.error.message}`)
        }
        throw new Error(`智谱GLM API调用失败: ${error.message}`)
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
        const messages: GLMMessage[] = []

        if (options.systemPrompt) {
          messages.push({
            role: 'system',
            content: options.systemPrompt
          })
        }

        messages.push({
          role: 'user',
          content: prompt
        })

        const requestData: GLMChatRequest = {
          model: options.model || 'glm-4',
          messages,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.8,
          max_tokens: options.maxTokens || 2048,
          stream: true
        }

        const token = this.getAccessToken()

        const response = await axios.post(
          this.baseUrl,
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
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

                  if (data.choices?.[0]?.delta?.content) {
                    const content = data.choices[0].delta.content
                    fullContent += content
                    onMessage(content)
                  }

                  if (data.usage) {
                    usage = {
                      promptTokens: data.usage.prompt_tokens,
                      completionTokens: data.usage.completion_tokens,
                      totalTokens: data.usage.total_tokens
                    }
                  }
                }
              } catch (parseError) {
                console.warn('解析智谱GLM SSE数据失败:', parseError)
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
          reject(new Error(`智谱GLM流式调用失败: ${error.message}`))
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
      const glmMessages: GLMMessage[] = []

      if (options.systemPrompt) {
        glmMessages.push({
          role: 'system',
          content: options.systemPrompt
        })
      }

      // 转换消息格式
      for (const msg of messages) {
        glmMessages.push({
          role: msg.role,
          content: msg.content
        })
      }

      const requestData: GLMChatRequest = {
        model: options.model || 'glm-4',
        messages: glmMessages,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.8,
        max_tokens: options.maxTokens || 2048
      }

      const token = this.getAccessToken()

      const response: AxiosResponse<GLMChatResponse | GLMErrorResponse> = await axios.post(
        this.baseUrl,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      )

      if ('error' in response.data) {
        throw new Error(`智谱GLM API错误: ${response.data.error.message}`)
      }

      const data = response.data as GLMChatResponse

      if (!data.choices || data.choices.length === 0) {
        throw new Error('智谱GLM API响应格式错误')
      }

      return {
        content: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`智谱GLM API调用失败: ${error.response?.data?.error?.message || error.message}`)
      }
      throw error
    }
  }

  // 工具调用（Function Calling）
  async chatWithTools(
    prompt: string,
    tools: any[],
    options: {
      model?: string
      temperature?: number
      topP?: number
      maxTokens?: number
      toolChoice?: string
    } = {}
  ): Promise<{
    content: string
    toolCalls?: any[]
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    try {
      const requestData: GLMChatRequest = {
        model: options.model || 'glm-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.8,
        max_tokens: options.maxTokens || 2048,
        tools,
        tool_choice: options.toolChoice || 'auto'
      }

      const token = this.getAccessToken()

      const response: AxiosResponse<any> = await axios.post(
        this.baseUrl,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      )

      if (response.data.error) {
        throw new Error(`智谱GLM API错误: ${response.data.error.message}`)
      }

      const choice = response.data.choices[0]
      return {
        content: choice.message.content || '',
        toolCalls: choice.message.tool_calls,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`智谱GLM工具调用失败: ${error.response?.data?.error?.message || error.message}`)
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
      console.error('智谱GLM健康检查失败:', error)
      return false
    }
  }

  // 获取模型信息
  getModelInfo() {
    return {
      provider: '智谱AI',
      model: 'GLM-4',
      capabilities: ['基本盘分析', '实战指导', '行动建议', '多轮对话', '流式输出', '工具调用'],
      maxTokens: 128000,
      supportedLanguages: ['zh', 'en'],
      features: ['多轮对话', '流式输出', '工具调用', 'Function Calling', '长上下文'],
      models: ['glm-4', 'glm-4v', 'glm-3-turbo']
    }
  }
}

export default ZhipuGLMService