// 阿里通义千问 API 集成
import axios, { AxiosResponse } from 'axios'

interface QwenMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface QwenChatRequest {
  model: string
  input: {
    messages: QwenMessage[]
  }
  parameters?: {
    temperature?: number
    top_p?: number
    top_k?: number
    max_tokens?: number
    repetition_penalty?: number
    seed?: number
    stream?: boolean
  }
}

interface QwenChatResponse {
  output: {
    text?: string
    choices?: Array<{
      finish_reason: string
      message: {
        role: string
        content: string
      }
    }>
  }
  usage: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
  }
  request_id: string
}

interface QwenErrorResponse {
  code: string
  message: string
  request_id: string
}

export class AliTongyiService {
  private apiKey: string
  private readonly baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY || ''

    if (!this.apiKey) {
      throw new Error('阿里通义千问API密钥未配置')
    }
  }

  // 调用通义千问API
  async chat(prompt: string, options: {
    model?: string
    temperature?: number
    topP?: number
    topK?: number
    maxTokens?: number
    systemPrompt?: string
    stream?: boolean
  } = {}): Promise<{
    content: string
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }> {
    try {
      const messages: QwenMessage[] = []

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

      const requestData: QwenChatRequest = {
        model: options.model || 'qwen-turbo',
        input: {
          messages
        },
        parameters: {
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.8,
          top_k: options.topK || 50,
          max_tokens: options.maxTokens || 2000,
          repetition_penalty: 1.1,
          stream: options.stream || false
        }
      }

      const response: AxiosResponse<QwenChatResponse | QwenErrorResponse> = await axios.post(
        this.baseUrl,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-SSE': options.stream ? 'enable' : 'disable'
          },
          timeout: 60000
        }
      )

      // 检查错误响应
      if ('code' in response.data) {
        throw new Error(`通义千问API错误: ${response.data.message} (${response.data.code})`)
      }

      const data = response.data as QwenChatResponse

      // 处理响应内容
      let content = ''
      if (data.output.text) {
        content = data.output.text
      } else if (data.output.choices && data.output.choices.length > 0) {
        content = data.output.choices[0]?.message.content || ''
      } else {
        throw new Error('通义千问API响应格式错误')
      }

      return {
        content,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.total_tokens
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data
        if (errorData && 'message' in errorData) {
          throw new Error(`通义千问API调用失败: ${errorData.message}`)
        }
        throw new Error(`通义千问API调用失败: ${error.message}`)
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
        const messages: QwenMessage[] = []

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

        const requestData: QwenChatRequest = {
          model: options.model || 'qwen-turbo',
          input: {
            messages
          },
          parameters: {
            temperature: options.temperature || 0.7,
            top_p: options.topP || 0.8,
            max_tokens: options.maxTokens || 2000,
            stream: true
          }
        }

        const response = await axios.post(
          this.baseUrl,
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'X-DashScope-SSE': 'enable'
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
            if (line.startsWith('data:')) {
              try {
                const jsonStr = line.slice(5).trim()
                if (jsonStr && jsonStr !== '[DONE]') {
                  const data = JSON.parse(jsonStr)

                  if (data.output?.choices?.[0]?.message?.content) {
                    const content = data.output.choices[0].message.content
                    fullContent += content
                    onMessage(content)
                  }

                  if (data.usage) {
                    usage = {
                      promptTokens: data.usage.input_tokens,
                      completionTokens: data.usage.output_tokens,
                      totalTokens: data.usage.total_tokens
                    }
                  }
                }
              } catch (parseError) {
                console.warn('解析SSE数据失败:', parseError)
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
          reject(new Error(`通义千问流式调用失败: ${error.message}`))
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
      const qwenMessages: QwenMessage[] = []

      if (options.systemPrompt) {
        qwenMessages.push({
          role: 'system',
          content: options.systemPrompt
        })
      }

      // 转换消息格式
      for (const msg of messages) {
        qwenMessages.push({
          role: msg.role,
          content: msg.content
        })
      }

      const requestData: QwenChatRequest = {
        model: options.model || 'qwen-turbo',
        input: {
          messages: qwenMessages
        },
        parameters: {
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.8,
          max_tokens: options.maxTokens || 2000
        }
      }

      const response: AxiosResponse<QwenChatResponse | QwenErrorResponse> = await axios.post(
        this.baseUrl,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      )

      if ('code' in response.data) {
        throw new Error(`通义千问API错误: ${response.data.message}`)
      }

      const data = response.data as QwenChatResponse
      let content = ''

      if (data.output.choices && data.output.choices.length > 0) {
        content = data.output.choices[0]?.message.content || ''
      } else if (data.output.text) {
        content = data.output.text
      } else {
        throw new Error('通义千问API响应格式错误')
      }

      return {
        content,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.total_tokens
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`通义千问API调用失败: ${error.response?.data?.message || error.message}`)
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
      console.error('通义千问健康检查失败:', error)
      return false
    }
  }

  // 获取模型信息
  getModelInfo() {
    return {
      provider: '阿里巴巴',
      model: 'Qwen-Turbo',
      capabilities: ['基本盘分析', '实战指导', '行动建议', '多轮对话', '流式输出'],
      maxTokens: 8000,
      supportedLanguages: ['zh', 'en'],
      features: ['多轮对话', '流式输出', '系统提示'],
      models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-max-longcontext']
    }
  }
}

export default AliTongyiService