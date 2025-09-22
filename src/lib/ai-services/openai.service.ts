import { AIService, AIResponse, AIServiceOptions } from './index'

export default class OpenAIService implements AIService {
  private apiKey: string
  private baseURL: string
  private model: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    this.baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'

    if (!this.apiKey) {
      throw new Error('OpenAI API Key未配置')
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
        throw new Error(`OpenAI API调用失败: ${response.status} - ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('OpenAI API返回数据格式错误')
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
      console.error('OpenAI服务调用失败:', error)
      throw new Error(`OpenAI服务调用失败: ${error instanceof Error ? error.message : '未知错误'}`)
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
      console.error('OpenAI健康检查失败:', error)
      return false
    }
  }

  getModelInfo() {
    return {
      provider: 'OpenAI',
      model: this.model,
      capabilities: [
        '文本生成',
        '对话聊天',
        '内容分析',
        '创意写作',
        '代码生成',
        '翻译',
        '总结',
        '问答'
      ],
      maxTokens: this.model.includes('gpt-4') ? 8192 : 4096,
      supportedLanguages: [
        'zh-CN', 'en-US', 'ja-JP', 'ko-KR',
        'fr-FR', 'de-DE', 'es-ES', 'pt-BR',
        'ru-RU', 'ar-SA', 'hi-IN', 'th-TH'
      ]
    }
  }
}