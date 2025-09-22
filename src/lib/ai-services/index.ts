// AI服务统一导出
export { BaiduWenxinService } from './baidu-wenxin.service'
export { XunfeiXinghuoService } from './xunfei-xinghuo.service'
export { AliTongyiService } from './ali-tongyi.service'
export { TencentHunyuanService } from './tencent-hunyuan.service'
export { ZhipuGLMService } from './zhipu-glm.service'
export { default as OpenAIService } from './openai.service'
export { default as DeepSeekService } from './deepseek.service'

// AI服务类型定义
export interface AIResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIServiceOptions {
  temperature?: number
  topP?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface AIService {
  chat(prompt: string, options?: AIServiceOptions): Promise<AIResponse>
  healthCheck(): Promise<boolean>
  getModelInfo(): {
    provider: string
    model: string
    capabilities: string[]
    maxTokens: number
    supportedLanguages: string[]
  }
}

// AI服务提供商枚举
export enum AIProvider {
  BAIDU = 'baidu',
  XUNFEI = 'xunfei',
  ALI = 'ali',
  TENCENT = 'tencent',
  ZHIPU = 'zhipu',
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek'
}

// AI服务工厂
import BaiduWenxinService from './baidu-wenxin.service'
import XunfeiXinghuoService from './xunfei-xinghuo.service'
import AliTongyiService from './ali-tongyi.service'
import TencentHunyuanService from './tencent-hunyuan.service'
import ZhipuGLMService from './zhipu-glm.service'
import OpenAIService from './openai.service'
import DeepSeekService from './deepseek.service'

export class AIServiceFactory {
  private static instances: Map<AIProvider, AIService> = new Map()

  static getService(provider: AIProvider): AIService {
    if (!this.instances.has(provider)) {
      let service: AIService

      switch (provider) {
        case AIProvider.BAIDU:
          service = new BaiduWenxinService()
          break
        case AIProvider.XUNFEI:
          service = new XunfeiXinghuoService()
          break
        case AIProvider.ALI:
          service = new AliTongyiService()
          break
        case AIProvider.TENCENT:
          service = new TencentHunyuanService()
          break
        case AIProvider.ZHIPU:
          service = new ZhipuGLMService()
          break
        case AIProvider.OPENAI:
          service = new OpenAIService()
          break
        case AIProvider.DEEPSEEK:
          service = new DeepSeekService()
          break
        default:
          throw new Error(`不支持的AI服务提供商: ${provider}`)
      }

      this.instances.set(provider, service)
    }

    return this.instances.get(provider)!
  }

  // 获取所有可用的服务
  static async getAvailableServices(): Promise<Array<{
    provider: AIProvider
    isHealthy: boolean
    modelInfo: any
  }>> {
    const providers = Object.values(AIProvider)
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        try {
          const service = this.getService(provider)
          const isHealthy = await service.healthCheck()
          const modelInfo = service.getModelInfo()

          return {
            provider,
            isHealthy,
            modelInfo
          }
        } catch (error) {
          return {
            provider,
            isHealthy: false,
            modelInfo: null
          }
        }
      })
    )

    return results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)
  }

  // 获取健康的服务
  static async getHealthyServices(): Promise<AIProvider[]> {
    const services = await this.getAvailableServices()
    return services
      .filter(service => service.isHealthy)
      .map(service => service.provider)
  }

  // 负载均衡获取服务（优先使用更稳定的服务）
  static async getBalancedService(): Promise<AIService> {
    const healthyProviders = await this.getHealthyServices()

    if (healthyProviders.length === 0) {
      throw new Error('没有可用的AI服务')
    }

    // 服务优先级排序（稳定性和质量优先）
    const priorityOrder: AIProvider[] = [
      AIProvider.OPENAI,      // 最稳定，质量最高
      AIProvider.DEEPSEEK,    // 国产优秀，性价比高
      AIProvider.ZHIPU,       // 智谱GLM，中文好
      AIProvider.ALI,         // 阿里通义
      AIProvider.TENCENT,     // 腾讯混元
      AIProvider.XUNFEI,      // 科大讯飞
      AIProvider.BAIDU        // 百度千帆（降级到最低优先级）
    ]

    // 按优先级选择可用服务
    for (const provider of priorityOrder) {
      if (healthyProviders.includes(provider)) {
        return this.getService(provider)
      }
    }

    // 如果没有按优先级找到，则随机选择
    const randomIndex = Math.floor(Math.random() * healthyProviders.length)
    const selectedProvider = healthyProviders[randomIndex]

    return this.getService(selectedProvider)
  }
}

// 默认导出工厂
export default AIServiceFactory