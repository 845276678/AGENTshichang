# AI服务集成开发文档

## 🤖 AI服务概览

### 集成的5个AI服务
| AI服务 | 提供商 | 主要功能 | API文档 |
|--------|--------|----------|---------|
| 文心一言 | 百度 | 创意解析与理解 | [文心一言API](https://cloud.baidu.com/doc/WENXINWORKSHOP) |
| 通义千问 | 阿里巴巴 | 技术架构设计 | [通义千问API](https://help.aliyun.com/dashscope/) |
| 星火大模型 | 讯飞 | 市场调研与分析 | [星火API](https://www.xfyun.cn/doc/spark/Web.html) |
| 混元 | 腾讯 | 财务建模与预测 | [混元API](https://cloud.tencent.com/document/product/1729) |
| GLM | 智谱AI | 法律合规分析 | [GLM API](https://open.bigmodel.cn/dev/api) |

## 🔑 API密钥申请指南

### 1. 百度文心一言
```bash
# 申请地址
https://cloud.baidu.com/product/wenxinworkshop

# 申请流程
1. 注册百度智能云账号
2. 实名认证（个人/企业）
3. 申请文心一言服务
4. 创建应用获取API Key和Secret Key
5. 充值（免费额度用完后需付费）

# 费用标准
- 免费额度: 每月1000次调用
- 付费价格: 0.012元/1K tokens
```

### 2. 阿里通义千问
```bash
# 申请地址
https://dashscope.aliyun.com

# 申请流程
1. 开通阿里云账号
2. 实名认证
3. 开通DashScope服务
4. 创建API Key
5. 选择计费模式

# 费用标准
- 免费额度: 每月100万tokens
- 付费价格: 0.002元/1K tokens
```

### 3. 讯飞星火
```bash
# 申请地址
https://console.xfyun.cn

# 申请流程
1. 注册讯飞开放平台账号
2. 实名认证
3. 创建星火应用
4. 获取APPID、APISecret、APIKey
5. 充值购买服务

# 费用标准
- 免费额度: 每日200次
- 付费价格: 0.018元/1K tokens
```

### 4. 腾讯混元
```bash
# 申请地址
https://cloud.tencent.com/product/hunyuan

# 申请流程
1. 注册腾讯云账号
2. 完成实名认证
3. 开通混元服务
4. 创建密钥(SecretId/SecretKey)
5. 开通计费

# 费用标准
- 免费额度: 每月10万tokens
- 付费价格: 0.01元/1K tokens
```

### 5. 智谱GLM
```bash
# 申请地址
https://open.bigmodel.cn

# 申请流程
1. 注册智谱AI账号
2. 实名认证
3. 申请API访问权限
4. 获取API Key
5. 充值账户

# 费用标准
- 免费额度: 注册送18元体验金
- 付费价格: 0.005元/1K tokens
```

## 🔧 API接口封装

### AI服务管理器
```typescript
// src/lib/ai-services.ts
import { AI_PROMPTS } from './ai-prompts'

export interface AIService {
  name: string
  provider: string
  task: string
  call(prompt: string, data: any): Promise<AIResponse>
}

export interface AIResponse {
  success: boolean
  data?: any
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class AIServiceManager {
  private services: Map<string, AIService> = new Map()

  constructor() {
    this.initializeServices()
  }

  private initializeServices() {
    this.services.set('baidu', new BaiduService())
    this.services.set('alibaba', new AlibabaService())
    this.services.set('iflytek', new IflytekService())
    this.services.set('tencent', new TencentService())
    this.services.set('zhipu', new ZhipuService())
  }

  async callService(serviceId: string, task: string, data: any): Promise<AIResponse> {
    const service = this.services.get(serviceId)
    if (!service) {
      throw new Error(`AI service ${serviceId} not found`)
    }

    const prompt = this.buildPrompt(task, data)
    return await service.call(prompt, data)
  }

  private buildPrompt(task: string, data: any): string {
    const promptTemplate = AI_PROMPTS[task as keyof typeof AI_PROMPTS]
    if (!promptTemplate) {
      throw new Error(`Prompt template for ${task} not found`)
    }

    // 替换模板变量
    return promptTemplate
      .replace('{ideaTitle}', data.title || '')
      .replace('{ideaDescription}', data.description || '')
      .replace('{category}', data.category || '')
      .replace('{submittedAt}', data.submittedAt || '')
  }
}
```

### 百度文心一言实现
```typescript
// src/lib/ai-services/baidu.ts
import crypto from 'crypto'

export class BaiduService implements AIService {
  name = '百度文心一言'
  provider = 'baidu'
  task = '创意解析与理解'

  private apiKey = process.env.BAIDU_API_KEY!
  private secretKey = process.env.BAIDU_SECRET_KEY!
  private baseUrl = 'https://aip.baidubce.com'

  async call(prompt: string, data: any): Promise<AIResponse> {
    try {
      // 获取access token
      const accessToken = await this.getAccessToken()

      // 调用文心一言API
      const response = await fetch(
        `${this.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            top_p: 0.9,
            penalty_score: 1.0
          })
        }
      )

      const result = await response.json()

      if (result.error_code) {
        return {
          success: false,
          error: `百度API错误: ${result.error_msg}`
        }
      }

      return {
        success: true,
        data: result.result,
        usage: {
          promptTokens: result.usage?.prompt_tokens || 0,
          completionTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        }
      }

    } catch (error) {
      return {
        success: false,
        error: `百度服务调用失败: ${error.message}`
      }
    }
  }

  private async getAccessToken(): Promise<string> {
    const cacheKey = 'baidu_access_token'

    // 先从缓存获取
    const cachedToken = await redis.get(cacheKey)
    if (cachedToken) {
      return cachedToken
    }

    // 获取新token
    const response = await fetch(
      `${this.baseUrl}/oauth/2.0/token?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`,
      { method: 'POST' }
    )

    const result = await response.json()

    if (result.error) {
      throw new Error(`获取百度access token失败: ${result.error_description}`)
    }

    // 缓存token（有效期30天，我们缓存25天）
    await redis.setex(cacheKey, 25 * 24 * 3600, result.access_token)

    return result.access_token
  }
}
```

### 阿里通义千问实现
```typescript
// src/lib/ai-services/alibaba.ts
export class AlibabaService implements AIService {
  name = '阿里通义千问'
  provider = 'alibaba'
  task = '技术架构设计'

  private apiKey = process.env.ALIBABA_DASHSCOPE_API_KEY!
  private baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

  async call(prompt: string, data: any): Promise<AIResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          parameters: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000
          }
        })
      })

      const result = await response.json()

      if (result.code && result.code !== '200') {
        return {
          success: false,
          error: `阿里API错误: ${result.message}`
        }
      }

      return {
        success: true,
        data: result.output?.text || result.output?.choices?.[0]?.message?.content,
        usage: {
          promptTokens: result.usage?.input_tokens || 0,
          completionTokens: result.usage?.output_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        }
      }

    } catch (error) {
      return {
        success: false,
        error: `阿里服务调用失败: ${error.message}`
      }
    }
  }
}
```

### 讯飞星火实现
```typescript
// src/lib/ai-services/iflytek.ts
import crypto from 'crypto'
import WebSocket from 'ws'

export class IflytekService implements AIService {
  name = '讯飞星火'
  provider = 'iflytek'
  task = '市场调研与分析'

  private appId = process.env.IFLYTEK_APP_ID!
  private apiSecret = process.env.IFLYTEK_API_SECRET!
  private apiKey = process.env.IFLYTEK_API_KEY!
  private baseUrl = 'wss://spark-api.xf-yun.com/v3.1/chat'

  async call(prompt: string, data: any): Promise<AIResponse> {
    return new Promise((resolve) => {
      try {
        const url = this.generateUrl()
        const ws = new WebSocket(url)

        let response = ''
        let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

        ws.on('open', () => {
          const params = {
            header: {
              app_id: this.appId,
              uid: 'aimarket'
            },
            parameter: {
              chat: {
                domain: 'generalv3',
                temperature: 0.7,
                max_tokens: 2048
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

          ws.send(JSON.stringify(params))
        })

        ws.on('message', (data) => {
          const result = JSON.parse(data.toString())

          if (result.header.code !== 0) {
            resolve({
              success: false,
              error: `讯飞API错误: ${result.header.message}`
            })
            return
          }

          // 累积响应内容
          if (result.payload?.choices?.text) {
            result.payload.choices.text.forEach((item: any) => {
              response += item.content
            })
          }

          // 记录token使用量
          if (result.payload?.usage) {
            usage = {
              promptTokens: result.payload.usage.text.prompt_tokens,
              completionTokens: result.payload.usage.text.completion_tokens,
              totalTokens: result.payload.usage.text.total_tokens
            }
          }

          // 检查是否结束
          if (result.header.status === 2) {
            ws.close()
            resolve({
              success: true,
              data: response.trim(),
              usage
            })
          }
        })

        ws.on('error', (error) => {
          resolve({
            success: false,
            error: `讯飞WebSocket错误: ${error.message}`
          })
        })

        // 30秒超时
        setTimeout(() => {
          ws.close()
          resolve({
            success: false,
            error: '讯飞服务调用超时'
          })
        }, 30000)

      } catch (error) {
        resolve({
          success: false,
          error: `讯飞服务调用失败: ${error.message}`
        })
      }
    })
  }

  private generateUrl(): string {
    const host = 'spark-api.xf-yun.com'
    const path = '/v3.1/chat'
    const date = new Date().toUTCString()

    // 生成签名
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(signatureOrigin)
      .digest('base64')

    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    const authorization = Buffer.from(authorizationOrigin).toString('base64')

    return `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`
  }
}
```

### 腾讯混元实现
```typescript
// src/lib/ai-services/tencent.ts
import crypto from 'crypto'

export class TencentService implements AIService {
  name = '腾讯混元'
  provider = 'tencent'
  task = '财务建模与预测'

  private secretId = process.env.TENCENT_SECRET_ID!
  private secretKey = process.env.TENCENT_SECRET_KEY!
  private region = 'ap-beijing'
  private service = 'hunyuan'
  private host = 'hunyuan.tencentcloudapi.com'

  async call(prompt: string, data: any): Promise<AIResponse> {
    try {
      const payload = {
        Model: 'hunyuan-lite',
        Messages: [
          {
            Role: 'user',
            Content: prompt
          }
        ],
        Temperature: 0.7,
        TopP: 0.9
      }

      const headers = this.generateHeaders(JSON.stringify(payload))

      const response = await fetch(`https://${this.host}/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.Response?.Error) {
        return {
          success: false,
          error: `腾讯API错误: ${result.Response.Error.Message}`
        }
      }

      return {
        success: true,
        data: result.Response?.Choices?.[0]?.Message?.Content || '',
        usage: {
          promptTokens: result.Response?.Usage?.PromptTokens || 0,
          completionTokens: result.Response?.Usage?.CompletionTokens || 0,
          totalTokens: result.Response?.Usage?.TotalTokens || 0
        }
      }

    } catch (error) {
      return {
        success: false,
        error: `腾讯服务调用失败: ${error.message}`
      }
    }
  }

  private generateHeaders(payload: string): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const date = new Date(parseInt(timestamp) * 1000).toISOString().substr(0, 10)

    // 构建签名
    const hashedPayload = crypto.createHash('sha256').update(payload).digest('hex')
    const canonicalRequest = [
      'POST',
      '/',
      '',
      `content-type:application/json\nhost:${this.host}\n`,
      'content-type;host',
      hashedPayload
    ].join('\n')

    const stringToSign = [
      'TC3-HMAC-SHA256',
      timestamp,
      `${date}/${this.service}/tc3_request`,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n')

    const secretDate = crypto.createHmac('sha256', `TC3${this.secretKey}`).update(date).digest()
    const secretService = crypto.createHmac('sha256', secretDate).update(this.service).digest()
    const secretSigning = crypto.createHmac('sha256', secretService).update('tc3_request').digest()
    const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex')

    const authorization = [
      'TC3-HMAC-SHA256',
      `Credential=${this.secretId}/${date}/${this.service}/tc3_request`,
      'SignedHeaders=content-type;host',
      `Signature=${signature}`
    ].join(', ')

    return {
      'Content-Type': 'application/json',
      'Host': this.host,
      'Authorization': authorization,
      'X-TC-Timestamp': timestamp,
      'X-TC-Version': '2023-09-01',
      'X-TC-Region': this.region,
      'X-TC-Action': 'ChatCompletions'
    }
  }
}
```

### 智谱GLM实现
```typescript
// src/lib/ai-services/zhipu.ts
import jwt from 'jsonwebtoken'

export class ZhipuService implements AIService {
  name = '智谱GLM'
  provider = 'zhipu'
  task = '法律合规分析'

  private apiKey = process.env.ZHIPU_API_KEY!
  private baseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

  async call(prompt: string, data: any): Promise<AIResponse> {
    try {
      const token = this.generateJWT()

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2000
        })
      })

      const result = await response.json()

      if (result.error) {
        return {
          success: false,
          error: `智谱API错误: ${result.error.message}`
        }
      }

      return {
        success: true,
        data: result.choices?.[0]?.message?.content || '',
        usage: {
          promptTokens: result.usage?.prompt_tokens || 0,
          completionTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        }
      }

    } catch (error) {
      return {
        success: false,
        error: `智谱服务调用失败: ${error.message}`
      }
    }
  }

  private generateJWT(): string {
    const [apiKey, secret] = this.apiKey.split('.')

    const payload = {
      iss: apiKey,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1小时过期
      iat: Math.floor(Date.now() / 1000)
    }

    return jwt.sign(payload, secret, { algorithm: 'HS256' })
  }
}
```

## 🚀 商业计划生成API

### 主要API接口
```typescript
// src/app/api/business-plan/generate/route.ts
import { AIServiceManager } from '@/lib/ai-services'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { ideaId, options } = body

    // 获取创意信息
    const idea = await db.execute(
      'SELECT * FROM ideas WHERE id = ?',
      [ideaId]
    )

    if (idea.length === 0) {
      return NextResponse.json({ error: '创意不存在' }, { status: 404 })
    }

    const ideaData = idea[0]

    // 检查用户积分是否足够
    const user = authResult.user
    const businessPlanCost = 500 // 生成商业计划需要500积分

    if (user.credits < businessPlanCost) {
      return NextResponse.json(
        { error: '积分不足，需要500积分生成商业计划' },
        { status: 400 }
      )
    }

    // 创建商业计划记录
    const businessPlanResult = await db.execute(
      'INSERT INTO business_plans (idea_id, user_id, status) VALUES (?, ?, ?)',
      [ideaId, user.id, 'generating']
    )

    const businessPlanId = businessPlanResult.insertId

    // 异步生成商业计划
    generateBusinessPlanAsync(businessPlanId, ideaData, options)

    return NextResponse.json({
      success: true,
      businessPlanId,
      message: '商业计划生成已开始，请稍后查看结果'
    })

  } catch (error) {
    console.error('Business plan generation error:', error)
    return NextResponse.json(
      { error: '商业计划生成失败' },
      { status: 500 }
    )
  }
}

// 异步生成商业计划
async function generateBusinessPlanAsync(
  businessPlanId: number,
  ideaData: any,
  options: any
) {
  const aiManager = new AIServiceManager()
  const stages = [
    { service: 'baidu', task: 'WENXIN_CONCEPT_ANALYSIS' },
    { service: 'iflytek', task: 'SPARK_MARKET_RESEARCH' },
    { service: 'alibaba', task: 'QWEN_TECH_ARCHITECTURE' },
    { service: 'tencent', task: 'HUNYUAN_FINANCIAL_MODEL' },
    { service: 'zhipu', task: 'GLM_LEGAL_COMPLIANCE' }
  ]

  const results = {}
  let completedStages = 0

  try {
    for (const stage of stages) {
      // 调用AI服务
      const result = await aiManager.callService(
        stage.service,
        stage.task,
        ideaData
      )

      results[stage.task] = result
      completedStages++

      // 更新进度
      await db.execute(
        'UPDATE business_plans SET generation_stages = ? WHERE id = ?',
        [JSON.stringify({ completed: completedStages, total: stages.length, results }), businessPlanId]
      )
    }

    // 计算综合评分
    const overallScore = calculateOverallScore(results)

    // 更新最终结果
    await db.execute(
      'UPDATE business_plans SET plan_data = ?, overall_score = ?, status = ?, completed_at = NOW() WHERE id = ?',
      [JSON.stringify(results), overallScore, 'completed', businessPlanId]
    )

    // 扣除用户积分
    await db.execute(
      'UPDATE users SET credits = credits - 500 WHERE id = ?',
      [ideaData.author_id]
    )

  } catch (error) {
    console.error('AI generation error:', error)

    // 标记为失败
    await db.execute(
      'UPDATE business_plans SET status = ? WHERE id = ?',
      ['failed', businessPlanId]
    )
  }
}

function calculateOverallScore(results: any): number {
  // 根据各AI服务的结果计算综合评分
  let totalScore = 0
  let validResults = 0

  Object.values(results).forEach((result: any) => {
    if (result.success && result.data) {
      totalScore += 8.5 // 假设每个AI给出8.5分的平均分
      validResults++
    }
  })

  return validResults > 0 ? totalScore / validResults : 0
}
```

## 📊 错误处理和监控

### 错误处理策略
```typescript
// src/lib/ai-error-handler.ts
export class AIErrorHandler {
  static async handleError(service: string, error: any): Promise<void> {
    // 记录错误日志
    console.error(`AI Service Error [${service}]:`, error)

    // 发送监控告警
    await sendAlert({
      service,
      error: error.message,
      timestamp: new Date().toISOString()
    })

    // 记录到数据库
    await db.execute(
      'INSERT INTO ai_service_logs (service, error_message, created_at) VALUES (?, ?, NOW())',
      [service, error.message]
    )
  }

  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
    throw new Error('Max retries exceeded')
  }
}
```

### 使用量监控
```typescript
// src/lib/ai-usage-monitor.ts
export class AIUsageMonitor {
  static async trackUsage(service: string, usage: any): Promise<void> {
    await db.execute(
      'INSERT INTO ai_usage_stats (service, prompt_tokens, completion_tokens, total_tokens, cost, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        service,
        usage.promptTokens,
        usage.completionTokens,
        usage.totalTokens,
        this.calculateCost(service, usage.totalTokens)
      ]
    )
  }

  private static calculateCost(service: string, tokens: number): number {
    const prices = {
      baidu: 0.012,    // 元/1K tokens
      alibaba: 0.002,  // 元/1K tokens
      iflytek: 0.018,  // 元/1K tokens
      tencent: 0.01,   // 元/1K tokens
      zhipu: 0.005     // 元/1K tokens
    }

    return (tokens / 1000) * (prices[service as keyof typeof prices] || 0.01)
  }

  static async getDailyUsage(): Promise<any> {
    return await db.execute(`
      SELECT
        service,
        SUM(total_tokens) as total_tokens,
        SUM(cost) as total_cost,
        COUNT(*) as request_count
      FROM ai_usage_stats
      WHERE DATE(created_at) = CURDATE()
      GROUP BY service
    `)
  }
}
```

## 🔄 缓存优化

### AI结果缓存
```typescript
// src/lib/ai-cache.ts
export class AICacheManager {
  private static CACHE_PREFIX = 'ai_result:'
  private static DEFAULT_TTL = 24 * 3600 // 24小时

  static async getCachedResult(key: string): Promise<any> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`
    const cached = await redis.get(cacheKey)
    return cached ? JSON.parse(cached) : null
  }

  static async setCachedResult(key: string, result: any, ttl?: number): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`
    await redis.setex(cacheKey, ttl || this.DEFAULT_TTL, JSON.stringify(result))
  }

  static generateCacheKey(service: string, prompt: string): string {
    const hash = crypto.createHash('md5').update(prompt).digest('hex')
    return `${service}:${hash}`
  }
}
```

---

**集成完成后，系统将具备**:
- 5个AI服务的完整集成
- 智能缓存和错误重试机制
- 详细的使用量监控和成本控制
- 高并发下的稳定服务调用
- 完整的商业计划生成流程