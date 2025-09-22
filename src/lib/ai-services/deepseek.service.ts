import { AIService, AIResponse, AIServiceOptions } from './index'

export default class DeepSeekService implements AIService {
  private apiKey: string
  private baseURL: string
  private model: string

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || ''
    this.baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

    if (!this.apiKey) {
      throw new Error('DeepSeek API Key未配置')
    }
  }

  async chat(prompt: string, options?: AIServiceOptions): Promise<AIResponse> {
    try {
      const messages = []

      // 添加系统提示
      if (options?.systemPrompt) {
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

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options?.temperature || 0.7,
          top_p: options?.topP || 1,
          max_tokens: options?.maxTokens || 2000,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`DeepSeek API调用失败: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('DeepSeek API返回数据格式错误')
      }

      return {
        content: data.choices[0].message.content.trim(),
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('DeepSeek服务调用失败:', error)
      throw new Error(`DeepSeek服务调用失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        signal: AbortSignal.timeout(10000) // 10秒超时
      })

      return response.ok
    } catch (error) {
      console.error('DeepSeek健康检查失败:', error)
      return false
    }
  }

  getModelInfo() {
    return {
      provider: 'DeepSeek',
      model: this.model,
      capabilities: [
        '中文对话',
        '代码生成',
        '数学推理',
        '逻辑分析',
        '创意写作',
        '文本总结',
        '翻译',
        '问答'
      ],
      maxTokens: 32768,
      supportedLanguages: [
        'zh-CN', 'en-US', 'ja-JP', 'ko-KR',
        'fr-FR', 'de-DE', 'es-ES', 'pt-BR',
        'ru-RU'
      ]
    }
  }
}