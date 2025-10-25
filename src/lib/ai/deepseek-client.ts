/**
 * DeepSeek API Client for MVP Code Generation
 * Wrapper around the main deepseek client for code generation tasks
 */

import OpenAI from 'openai'

// Create DeepSeek client (using OpenAI SDK as DeepSeek is compatible with OpenAI API)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
})

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GenerateOptions {
  temperature?: number
  max_tokens?: number
}

export interface AIResponse {
  content: string
  tokensUsed?: number
}

/**
 * Call DeepSeek API with messages
 */
export async function callDeepSeekAPI(
  messages: Message[],
  options: GenerateOptions = {}
): Promise<AIResponse> {
  try {
    const completion = await deepseek.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 4000,
      stream: false
    })

    const content = completion.choices[0]?.message?.content || ''
    const tokensUsed = completion.usage?.total_tokens

    return {
      content,
      tokensUsed
    }
  } catch (error: any) {
    console.error('❌ DeepSeek API调用失败:', error)
    throw new Error(`DeepSeek API调用失败: ${error.message}`)
  }
}

/**
 * Check if DeepSeek API is properly configured
 */
export function checkDeepSeekConfig(): { isConfigured: boolean; error?: string } {
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'your_deepseek_api_key') {
    return {
      isConfigured: false,
      error: 'DeepSeek API Key未配置或配置不正确，请在.env文件中设置DEEPSEEK_API_KEY'
    }
  }

  return { isConfigured: true }
}
