// AI鏈嶅姟璋冪敤鐨勫畬鏁撮敊璇鐞嗗拰閲嶈瘯鏈哄埗
import { z } from 'zod'

// AI鏈嶅姟鎻愪緵鍟嗘灇涓?export enum AIServiceProvider {
  DEEPSEEK = 'deepseek',
  ZHIPU = 'zhipu',
  ALI = 'ali',
  MOONSHOT = 'moonshot'
}

// 閿欒绫诲瀷瀹氫箟
export enum AIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  AUTH_ERROR = 'AUTH_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  PARSING_ERROR = 'PARSING_ERROR',
  UNKNOWN = 'UNKNOWN'
}

// AI鏈嶅姟閿欒绫?export class AIServiceError extends Error {
  public readonly type: AIErrorType
  public readonly provider: AIServiceProvider
  public readonly statusCode?: number
  public readonly retryable: boolean
  public readonly retryAfter?: number
  public readonly originalError?: Error

  constructor(
    message: string,
    type: AIErrorType,
    provider: AIServiceProvider,
    options: {
      statusCode?: number
      retryable?: boolean
      retryAfter?: number
      originalError?: Error
    } = {}
  ) {
    super(message)
    this.name = 'AIServiceError'
    this.type = type
    this.provider = provider
    this.statusCode = options.statusCode
    this.retryable = options.retryable ?? this.isRetryableByDefault(type)
    this.retryAfter = options.retryAfter
    this.originalError = options.originalError
  }

  private isRetryableByDefault(type: AIErrorType): boolean {
    return [
      AIErrorType.NETWORK_ERROR,
      AIErrorType.RATE_LIMIT,
      AIErrorType.SERVICE_UNAVAILABLE,
      AIErrorType.TIMEOUT
    ].includes(type)
  }
}

// 閲嶈瘯閰嶇疆
export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  exponentialBackoff: boolean
  jitter: boolean
}

// 榛樿閲嶈瘯閰嶇疆
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  exponentialBackoff: true,
  jitter: true
}

// AI鏈嶅姟璇锋眰閰嶇疆
export interface AIServiceConfig {
  provider: AIServiceProvider
  apiKey: string
  baseURL: string
  timeout: number
  retryConfig: RetryConfig
  model: string
  temperature?: number
  maxTokens?: number
}

// AI璇锋眰鍙傛暟
export interface AIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

// AI鍝嶅簲鏁版嵁
export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model?: string
  finishReason?: string
}

// AI鏈嶅姟缁熻
interface ServiceStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalCost: number
  averageResponseTime: number
  lastError?: AIServiceError
  lastSuccessAt?: Date
}

// AI鏈嶅姟绠＄悊鍣?export class AIServiceManager {
  private configs = new Map<AIServiceProvider, AIServiceConfig>()
  private stats = new Map<AIServiceProvider, ServiceStats>()
  private circuitBreaker = new Map<AIServiceProvider, CircuitBreakerState>()

  constructor() {
    this.initializeConfigs()
    this.initializeStats()
  }

  private initializeConfigs() {
    // DeepSeek閰嶇疆
    if (process.env.DEEPSEEK_API_KEY) {
      this.configs.set(AIServiceProvider.DEEPSEEK, {
        provider: AIServiceProvider.DEEPSEEK,
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1',
        timeout: 30000,
        retryConfig: DEFAULT_RETRY_CONFIG,
        model: 'deepseek-chat',
        temperature: 0.7,
        maxTokens: 2048
      })
    }

    // 鏅鸿氨閰嶇疆
    if (process.env.ZHIPU_API_KEY) {
      this.configs.set(AIServiceProvider.ZHIPU, {
        provider: AIServiceProvider.ZHIPU,
        apiKey: process.env.ZHIPU_API_KEY,
        baseURL: 'https://open.bigmodel.cn/api/paas/v4',
        timeout: 30000,
        retryConfig: DEFAULT_RETRY_CONFIG,
        model: 'glm-4',
        temperature: 0.7,
        maxTokens: 2048
      })
    }

    // 闃块噷閰嶇疆
    if (process.env.ALI_API_KEY) {
      this.configs.set(AIServiceProvider.ALI, {
        provider: AIServiceProvider.ALI,
        apiKey: process.env.ALI_API_KEY,
        baseURL: 'https://dashscope.aliyuncs.com/api/v1',
        timeout: 30000,
        retryConfig: DEFAULT_RETRY_CONFIG,
        model: 'qwen-turbo',
        temperature: 0.7,
        maxTokens: 2048
      })
    }

    // 鏈堜箣鏆楅潰閰嶇疆
    if (process.env.MOONSHOT_API_KEY) {
      this.configs.set(AIServiceProvider.MOONSHOT, {
        provider: AIServiceProvider.MOONSHOT,
        apiKey: process.env.MOONSHOT_API_KEY,
        baseURL: 'https://api.moonshot.cn/v1',
        timeout: 30000,
        retryConfig: DEFAULT_RETRY_CONFIG,
        model: 'moonshot-v1-8k',
        temperature: 0.7,
        maxTokens: 2048
      })
    }
  }

  private initializeStats() {
    this.configs.forEach((config, provider) => {
      this.stats.set(provider, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalCost: 0,
        averageResponseTime: 0
      })
    })
  }

  // 鍙戦€丄I璇锋眰锛堝甫瀹屾暣閿欒澶勭悊锛?  async sendRequest(
    provider: AIServiceProvider,
    request: AIRequest
  ): Promise<AIResponse> {
    const config = this.configs.get(provider)
    if (!config) {
      throw new AIServiceError(
        `Provider ${provider} not configured`,
        AIErrorType.INVALID_REQUEST,
        provider
      )
    }

    // 妫€鏌ョ啍鏂櫒鐘舵€?    if (this.isCircuitOpen(provider)) {
      throw new AIServiceError(
        `Circuit breaker open for ${provider}`,
        AIErrorType.SERVICE_UNAVAILABLE,
        provider,
        { retryable: false }
      )
    }

    const startTime = Date.now()
    let lastError: AIServiceError | null = null

    for (let attempt = 1; attempt <= config.retryConfig.maxAttempts; attempt++) {
      try {
        const response = await this.makeRequest(config, request, attempt)

        // 璇锋眰鎴愬姛锛岃褰曠粺璁?        this.recordSuccess(provider, Date.now() - startTime)
        this.resetCircuitBreaker(provider)

        return response

      } catch (error) {
        lastError = this.handleError(error, provider, attempt)

        // 璁板綍澶辫触缁熻
        this.recordFailure(provider, lastError)

        // 妫€鏌ユ槸鍚﹀簲璇ラ噸璇?        if (!lastError.retryable || attempt === config.retryConfig.maxAttempts) {
          break
        }

        // 璁＄畻閲嶈瘯寤惰繜
        const delay = this.calculateRetryDelay(config.retryConfig, attempt, lastError.retryAfter)
        console.log(`Retrying ${provider} request (attempt ${attempt + 1}/${config.retryConfig.maxAttempts}) after ${delay}ms`)

        await this.sleep(delay)
      }
    }

    throw lastError!
  }

  // 鏅鸿兘璺敱锛氶€夋嫨鏈€浣矨I鏈嶅姟
  async sendRequestWithFallback(
    request: AIRequest,
    preferredProvider?: AIServiceProvider
  ): Promise<{ response: AIResponse; usedProvider: AIServiceProvider }> {
    const providers = this.getAvailableProviders(preferredProvider)

    if (providers.length === 0) {
      throw new AIServiceError(
        'No AI services available',
        AIErrorType.SERVICE_UNAVAILABLE,
        AIServiceProvider.DEEPSEEK
      )
    }

    let lastError: AIServiceError | null = null

    for (const provider of providers) {
      try {
        const response = await this.sendRequest(provider, request)
        return { response, usedProvider: provider }
      } catch (error) {
        console.warn(`Provider ${provider} failed:`, error.message)
        lastError = error as AIServiceError

        // 濡傛灉鏄笉鍙噸璇曠殑閿欒锛屽皾璇曚笅涓€涓彁渚涘晢
        if (!lastError.retryable) {
          continue
        }

        // 濡傛灉鏄厤棰濊秴鍑烘垨璁よ瘉閿欒锛岃烦杩囪繖涓彁渚涘晢
        if ([AIErrorType.QUOTA_EXCEEDED, AIErrorType.AUTH_ERROR].includes(lastError.type)) {
          continue
        }
      }
    }

    throw lastError!
  }

  // 鍙戣捣HTTP璇锋眰
  private async makeRequest(
    config: AIServiceConfig,
    request: AIRequest,
    attempt: number
  ): Promise<AIResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)

    try {
      const requestBody = this.buildRequestBody(config, request)
      const headers = this.buildHeaders(config)

      console.log(`Making AI request to ${config.provider} (attempt ${attempt})`)

      const response = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw await this.createErrorFromResponse(response, config.provider)
      }

      const data = await response.json()
      return this.parseResponse(data, config.provider)

    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw new AIServiceError(
          'Request timeout',
          AIErrorType.TIMEOUT,
          config.provider
        )
      }

      if (error instanceof AIServiceError) {
        throw error
      }

      throw new AIServiceError(
        `Network error: ${error.message}`,
        AIErrorType.NETWORK_ERROR,
        config.provider,
        { originalError: error as Error }
      )
    }
  }

  // 鏋勫缓璇锋眰浣?  private buildRequestBody(config: AIServiceConfig, request: AIRequest) {
    const body: any = {
      model: request.model || config.model,
      messages: request.messages,
      temperature: request.temperature ?? config.temperature,
      max_tokens: request.maxTokens || config.maxTokens,
      stream: false
    }

    // 涓嶅悓鏈嶅姟鍟嗙殑鐗规畩澶勭悊
    switch (config.provider) {
      case AIServiceProvider.ZHIPU:
        // 鏅鸿氨鐨勭壒娈婂弬鏁?        body.top_p = 0.95
        break
      case AIServiceProvider.ALI:
        // 闃块噷鐨勭壒娈婂弬鏁?        body.top_p = 0.8
        break
    }

    return body
  }

  // 鏋勫缓璇锋眰澶?  private buildHeaders(config: AIServiceConfig) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'AI-Agent-Platform/1.0'
    }

    // 涓嶅悓鏈嶅姟鍟嗙殑璁よ瘉鏂瑰紡
    switch (config.provider) {
      case AIServiceProvider.DEEPSEEK:
      case AIServiceProvider.MOONSHOT:
        headers['Authorization'] = `Bearer ${config.apiKey}`
        break
      case AIServiceProvider.ZHIPU:
        headers['Authorization'] = `Bearer ${config.apiKey}`
        break
      case AIServiceProvider.ALI:
        headers['Authorization'] = `Bearer ${config.apiKey}`
        headers['X-DashScope-SSE'] = 'disable'
        break
    }

    return headers
  }

  // 瑙ｆ瀽鍝嶅簲
  private parseResponse(data: any, provider: AIServiceProvider): AIResponse {
    try {
      const choice = data.choices?.[0]
      if (!choice) {
        throw new Error('No choices in response')
      }

      return {
        content: choice.message?.content || '',
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        } : undefined,
        model: data.model,
        finishReason: choice.finish_reason
      }
    } catch (error) {
      throw new AIServiceError(
        `Failed to parse response: ${error.message}`,
        AIErrorType.PARSING_ERROR,
        provider,
        { originalError: error as Error }
      )
    }
  }

  // 浠嶩TTP鍝嶅簲鍒涘缓閿欒
  private async createErrorFromResponse(response: Response, provider: AIServiceProvider): Promise<AIServiceError> {
    const statusCode = response.status
    let errorData: any = {}

    try {
      errorData = await response.json()
    } catch {
      // JSON瑙ｆ瀽澶辫触锛屼娇鐢ㄧ姸鎬佹枃鏈?    }

    const message = errorData.error?.message || errorData.message || response.statusText

    // 鏍规嵁鐘舵€佺爜纭畾閿欒绫诲瀷
    let errorType: AIErrorType
    let retryable = true
    let retryAfter: number | undefined

    switch (statusCode) {
      case 401:
      case 403:
        errorType = AIErrorType.AUTH_ERROR
        retryable = false
        break
      case 429:
        errorType = AIErrorType.RATE_LIMIT
        retryAfter = this.parseRetryAfter(response.headers.get('retry-after'))
        break
      case 400:
        errorType = AIErrorType.INVALID_REQUEST
        retryable = false
        break
      case 402:
        errorType = AIErrorType.QUOTA_EXCEEDED
        retryable = false
        break
      case 503:
        errorType = AIErrorType.SERVICE_UNAVAILABLE
        break
      default:
        errorType = AIErrorType.UNKNOWN
    }

    return new AIServiceError(message, errorType, provider, {
      statusCode,
      retryable,
      retryAfter
    })
  }

  // 澶勭悊閿欒
  private handleError(error: any, provider: AIServiceProvider, attempt: number): AIServiceError {
    if (error instanceof AIServiceError) {
      return error
    }

    if (error.name === 'AbortError') {
      return new AIServiceError('Request timeout', AIErrorType.TIMEOUT, provider)
    }

    return new AIServiceError(
      `Unknown error: ${error.message}`,
      AIErrorType.UNKNOWN,
      provider,
      { originalError: error }
    )
  }

  // 璁＄畻閲嶈瘯寤惰繜
  private calculateRetryDelay(config: RetryConfig, attempt: number, retryAfter?: number): number {
    if (retryAfter) {
      return Math.min(retryAfter * 1000, config.maxDelay)
    }

    let delay = config.baseDelay

    if (config.exponentialBackoff) {
      delay = config.baseDelay * Math.pow(2, attempt - 1)
    }

    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5)
    }

    return Math.min(delay, config.maxDelay)
  }

  // 鑾峰彇鍙敤鐨勬湇鍔℃彁渚涘晢锛堟寜浼樺厛绾ф帓搴忥級
  private getAvailableProviders(preferredProvider?: AIServiceProvider): AIServiceProvider[] {
    const allProviders = Array.from(this.configs.keys())
    const available = allProviders.filter(provider => !this.isCircuitOpen(provider))

    if (available.length === 0) {
      return allProviders // 濡傛灉鎵€鏈夋湇鍔￠兘鐔旀柇锛岃繑鍥炴墍鏈夐厤缃殑鏈嶅姟
    }

    // 鎸夋垚鍔熺巼鍜屽搷搴旀椂闂存帓搴?    available.sort((a, b) => {
      const statsA = this.stats.get(a)!
      const statsB = this.stats.get(b)!

      const successRateA = statsA.totalRequests > 0 ? statsA.successfulRequests / statsA.totalRequests : 0
      const successRateB = statsB.totalRequests > 0 ? statsB.successfulRequests / statsB.totalRequests : 0

      if (successRateA !== successRateB) {
        return successRateB - successRateA // 鎴愬姛鐜囬珮鐨勪紭鍏?      }

      return statsA.averageResponseTime - statsB.averageResponseTime // 鍝嶅簲鏃堕棿鐭殑浼樺厛
    })

    // 濡傛灉鎸囧畾浜嗕紭鍏堟彁渚涘晢锛屾斁鍒板墠闈?    if (preferredProvider && available.includes(preferredProvider)) {
      const filtered = available.filter(p => p !== preferredProvider)
      return [preferredProvider, ...filtered]
    }

    return available
  }

  // 鐔旀柇鍣ㄧ浉鍏虫柟娉?  private isCircuitOpen(provider: AIServiceProvider): boolean {
    const state = this.circuitBreaker.get(provider)
    if (!state) {\n      return false\n    }

    if (state.state === 'OPEN') {
      if (Date.now() > state.nextRetryTime) {
        state.state = 'HALF_OPEN'
        return false
      }
      return true
    }

    return false
  }

  private resetCircuitBreaker(provider: AIServiceProvider) {
    this.circuitBreaker.set(provider, {
      state: 'CLOSED',
      failureCount: 0,
      nextRetryTime: 0
    })
  }

  // 璁板綍鎴愬姛缁熻
  private recordSuccess(provider: AIServiceProvider, responseTime: number) {
    const stats = this.stats.get(provider)!
    stats.totalRequests++
    stats.successfulRequests++
    stats.averageResponseTime = (stats.averageResponseTime + responseTime) / 2
    stats.lastSuccessAt = new Date()
  }

  // 璁板綍澶辫触缁熻
  private recordFailure(provider: AIServiceProvider, error: AIServiceError) {
    const stats = this.stats.get(provider)!
    stats.totalRequests++
    stats.failedRequests++
    stats.lastError = error

    // 鏇存柊鐔旀柇鍣ㄧ姸鎬?    const state = this.circuitBreaker.get(provider) ?? {
      state: 'CLOSED' as const,
      failureCount: 0,
      nextRetryTime: 0
    }

    state.failureCount++

    // 杩炵画5娆″け璐ュ垯寮€鍚啍鏂櫒
    if (state.failureCount >= 5) {
      state.state = 'OPEN'
      state.nextRetryTime = Date.now() + 60000 // 1鍒嗛挓鍚庡皾璇曞崐寮€
    }

    this.circuitBreaker.set(provider, state)
  }

  // 瑙ｆ瀽閲嶈瘯鏃堕棿
  private parseRetryAfter(retryAfterHeader: string | null): number | undefined {
    if (!retryAfterHeader) {\n      return undefined\n    }
    const seconds = parseInt(retryAfterHeader)
    return isNaN(seconds) ? undefined : seconds
  }

  // 鐫＄湢鍑芥暟
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 鑾峰彇鏈嶅姟缁熻
  getStats(): Record<string, ServiceStats> {
    const result: Record<string, ServiceStats> = {}
    this.stats.forEach((stats, provider) => {
      result[provider] = { ...stats }
    })
    return result
  }

  // 鑾峰彇鐔旀柇鍣ㄧ姸鎬?  getCircuitBreakerStates(): Record<string, any> {
    const result: Record<string, any> = {}
    this.circuitBreaker.forEach((state, provider) => {
      result[provider] = { ...state }
    })
    return result
  }
}

// 鐔旀柇鍣ㄧ姸鎬?interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  nextRetryTime: number
}

// 鍒涘缓鍏ㄥ眬AI鏈嶅姟绠＄悊鍣ㄥ疄渚?export const aiServiceManager = new AIServiceManager()

// 渚挎嵎鏂规硶
export async function callAI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    provider?: AIServiceProvider
    model?: string
    temperature?: number
    maxTokens?: number
  } = {}
): Promise<{ response: AIResponse; usedProvider: AIServiceProvider }> {
  return aiServiceManager.sendRequestWithFallback({
    messages,
    model: options.model,
    temperature: options.temperature,
    maxTokens: options.maxTokens
  }, options.provider)
}

// 瀵煎嚭绫诲瀷
export type { AIRequest, AIResponse, AIServiceConfig, RetryConfig }





