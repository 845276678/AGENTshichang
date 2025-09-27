// AI服务管理器 - 统一管理DeepSeek、智谱GLM、通义千问
// 实现负载均衡、错误处理、成本控制

import type { DialogueContext } from './dialogue-strategy';

export interface AIServiceProvider {
  name: 'deepseek' | 'zhipu' | 'qwen';
  apiKey: string;
  baseURL: string;
  rateLimit: number;
  costPerCall: number;
}

export interface AIServiceRequest {
  provider: 'deepseek' | 'zhipu' | 'qwen';
  persona: string;
  context: DialogueContext;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface AIServiceResponse {
  provider: string;
  content: string;
  reasoning?: string;
  confidence: number;
  tokens_used: number;
  cost: number;
  timestamp: number;
}

// AI服务配置
const AI_SERVICE_CONFIG = {
  deepseek: {
    name: 'deepseek' as const,
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    rateLimit: 100, // requests per minute
    costPerCall: 0.002, // 每次调用成本(元)
    personas: ['tech-pioneer-alex', 'market-insight-delta']
  },
  zhipu: {
    name: 'zhipu' as const,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4',
    rateLimit: 60,
    costPerCall: 0.003,
    personas: ['business-guru-beta', 'investment-advisor-ivan']
  },
  qwen: {
    name: 'qwen' as const,
    baseURL: 'https://dashscope.aliyuncs.com/api/v1',
    model: 'qwen-max',
    rateLimit: 80,
    costPerCall: 0.0025,
    personas: ['innovation-mentor-charlie']
  }
};

// 系统提示词模板
const SYSTEM_PROMPTS = {
  'tech-pioneer-alex': `
你是技术先锋艾克斯，一位经验丰富的首席技术专家。你的特点：
- 专注于技术可行性、架构设计、算法优化
- 说话风格：专业、严谨、逻辑清晰
- 关注点：技术复杂度、开发周期、扩展性、维护成本
- 竞价策略：基于技术实现难度和创新程度
- 性格：理性、专业、有时会显得有些技术至上主义

在竞价过程中，你需要：
1. 从技术角度评估创意的可行性
2. 分析技术实现的复杂度和风险
3. 给出合理的技术估值
4. 与其他AI专家进行专业讨论
5. 保持角色一致性，体现技术专家的专业性
`,

  'business-guru-beta': `
你是商业智囊贝塔，一位敏锐的商业战略顾问。你的特点：
- 专注于商业模式、市场策略、盈利分析
- 说话风格：务实、敏锐、富有说服力
- 关注点：商业价值、盈利模式、市场定位、竞争优势
- 竞价策略：基于商业潜力和盈利预期
- 性格：精明、务实、有时会显得较为功利

在竞价过程中，你需要：
1. 从商业角度评估创意的市场价值
2. 分析商业模式的可行性和盈利潜力
3. 给出基于商业价值的估值
4. 与技术和其他专家探讨商业可行性
5. 体现商业战略家的洞察力和判断力
`,

  'innovation-mentor-charlie': `
你是创新导师查理，一位富有想象力的创新思维专家。你的特点：
- 专注于创新理论、设计思维、用户体验
- 说话风格：富有激情、启发性、人文关怀
- 关注点：创新程度、用户价值、社会影响、体验设计
- 竞价策略：基于创新价值和用户体验
- 性格：开放、富有同理心、重视人文价值

在竞价过程中，你需要：
1. 从创新和用户体验角度评估创意
2. 分析创意的独特性和社会价值
3. 给出基于创新价值的估值
4. 倡导以用户为中心的设计思维
5. 平衡技术和商业考量，强调人文价值
`,

  'market-insight-delta': `
你是市场洞察黛拉，一位细致的市场研究专家。你的特点：
- 专注于市场调研、竞品分析、趋势预测
- 说话风格：数据驱动、客观、前瞻性
- 关注点：市场需求、竞争环境、用户行为、发展趋势
- 竞价策略：基于市场数据和竞争分析
- 性格：理性、细致、重视数据和事实

在竞价过程中，你需要：
1. 从市场角度分析创意的机会和挑战
2. 提供竞品分析和市场定位建议
3. 给出基于市场潜力的估值
4. 用数据支撑你的观点和判断
5. 保持客观理性的市场分析视角
`,

  'investment-advisor-ivan': `
你是投资顾问伊万，一位谨慎的风险投资专家。你的特点：
- 专注于投资评估、风险控制、财务分析
- 说话风格：谨慎、理性、重视风险评估
- 关注点：投资回报率、风险评估、现金流、退出策略
- 竞价策略：基于投资价值和风险收益比
- 性格：谨慎、理性、对风险敏感

在竞价过程中，你需要：
1. 从投资角度评估创意的价值和风险
2. 分析投资回报率和资金需求
3. 给出基于投资价值的估值
4. 提醒注意各种投资风险
5. 保持投资人的谨慎和理性
`
};

// AI服务管理器类
export class AIServiceManager {
  private providers: Map<string, AIServiceProvider>;
  private rateLimiters: Map<string, RateLimiter>;
  private healthStatus: Map<string, boolean>;

  constructor() {
    this.providers = new Map();
    this.rateLimiters = new Map();
    this.healthStatus = new Map();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    Object.entries(AI_SERVICE_CONFIG).forEach(([key, config]) => {
      this.providers.set(key, {
        name: config.name,
        apiKey: process.env[`${key.toUpperCase()}_API_KEY`] || '',
        baseURL: config.baseURL,
        rateLimit: config.rateLimit,
        costPerCall: config.costPerCall
      });

      this.rateLimiters.set(key, new RateLimiter(config.rateLimit));
      this.healthStatus.set(key, true);
    });
  }

  // 调用单个AI服务
  async callSingleService(request: AIServiceRequest): Promise<AIServiceResponse> {
    const provider = this.providers.get(request.provider);
    if (!provider) {
      throw new Error(`Unknown AI provider: ${request.provider}`);
    }

    // 检查速率限制
    const rateLimiter = this.rateLimiters.get(request.provider)!;
    if (!rateLimiter.canMakeRequest()) {
      throw new Error(`Rate limit exceeded for ${request.provider}`);
    }

    // 检查服务健康状态
    if (!this.healthStatus.get(request.provider)) {
      throw new Error(`Service ${request.provider} is currently unavailable`);
    }

    try {
      const response = await this.makeAPICall(provider, request);
      rateLimiter.recordRequest();
      return response;
    } catch (error) {
      console.error(`AI service call failed for ${request.provider}:`, error);
      this.healthStatus.set(request.provider, false);

      // 5分钟后重新标记为健康
      setTimeout(() => {
        this.healthStatus.set(request.provider, true);
      }, 5 * 60 * 1000);

      throw error;
    }
  }

  // 调用多个AI服务
  async callMultipleServices(
    providers: string[],
    context: DialogueContext
  ): Promise<AIServiceResponse[]> {
    const requests = providers.map(provider => {
      const persona = this.getPersonaForProvider(provider, context);
      return {
        provider: provider as any,
        persona,
        context,
        systemPrompt: SYSTEM_PROMPTS[persona as keyof typeof SYSTEM_PROMPTS],
        temperature: 0.7,
        maxTokens: 500
      };
    });

    const results = await Promise.allSettled(
      requests.map(request => this.callSingleService(request))
    );

    const responses: AIServiceResponse[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        responses.push(result.value);
      } else {
        console.error(`AI service call failed for ${providers[index]}:`, result.reason);
        // 添加备用响应
        responses.push(this.getFallbackResponse(providers[index], context));
      }
    });

    return responses;
  }

  private async makeAPICall(
    provider: AIServiceProvider,
    request: AIServiceRequest
  ): Promise<AIServiceResponse> {
    const startTime = Date.now();

    let response: any;
    switch (provider.name) {
      case 'deepseek':
        response = await this.callDeepSeek(provider, request);
        break;
      case 'zhipu':
        response = await this.callZhipu(provider, request);
        break;
      case 'qwen':
        response = await this.callQwen(provider, request);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider.name}`);
    }

    return {
      provider: provider.name,
      content: response.content,
      reasoning: response.reasoning,
      confidence: response.confidence || 0.8,
      tokens_used: response.tokens_used || 0,
      cost: provider.costPerCall,
      timestamp: Date.now()
    };
  }

  private async callDeepSeek(
    provider: AIServiceProvider,
    request: AIServiceRequest
  ): Promise<any> {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: request.systemPrompt
          },
          {
            role: 'user',
            content: this.buildUserPrompt(request.context)
          }
        ],
        temperature: request.temperature,
        max_tokens: request.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      tokens_used: data.usage?.total_tokens || 0
    };
  }

  private async callZhipu(
    provider: AIServiceProvider,
    request: AIServiceRequest
  ): Promise<any> {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: request.systemPrompt
          },
          {
            role: 'user',
            content: this.buildUserPrompt(request.context)
          }
        ],
        temperature: request.temperature,
        max_tokens: request.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`Zhipu API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      tokens_used: data.usage?.total_tokens || 0
    };
  }

  private async callQwen(
    provider: AIServiceProvider,
    request: AIServiceRequest
  ): Promise<any> {
    const response = await fetch(`${provider.baseURL}/services/aigc/text-generation/generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages: [
            {
              role: 'system',
              content: request.systemPrompt
            },
            {
              role: 'user',
              content: this.buildUserPrompt(request.context)
            }
          ]
        },
        parameters: {
          temperature: request.temperature,
          max_tokens: request.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.output.text,
      tokens_used: data.usage?.total_tokens || 0
    };
  }

  private buildUserPrompt(context: DialogueContext): string {
    let prompt = `创意内容：${context.ideaContent}\n`;
    prompt += `当前阶段：${context.phase}\n`;
    prompt += `触发事件：${context.trigger}\n`;
    prompt += `轮次：${context.round}\n`;

    if (context.creativityScore) {
      prompt += `创意评分：${context.creativityScore}/100\n`;
    }

    if (context.userFeedback) {
      prompt += `用户反馈：${context.userFeedback}\n`;
    }

    if (context.previousContext && context.previousContext.length > 0) {
      prompt += `之前的对话：\n${context.previousContext.join('\n')}\n`;
    }

    prompt += '\n请根据你的专业角色，对这个创意进行评价和分析，并给出你的竞价建议。回复格式：[对话内容]|[竞价金额]|[理由说明]';

    return prompt;
  }

  private getPersonaForProvider(provider: string, context: DialogueContext): string {
    const config = AI_SERVICE_CONFIG[provider as keyof typeof AI_SERVICE_CONFIG];
    if (config && config.personas.length > 0) {
      // 简单轮询选择，可以根据需要实现更复杂的选择逻辑
      const index = context.round % config.personas.length;
      return config.personas[index];
    }
    return 'tech-pioneer-alex'; // 默认角色
  }

  private getFallbackResponse(provider: string, context: DialogueContext): AIServiceResponse {
    return {
      provider,
      content: '抱歉，我现在有些技术问题，稍后再来分析这个创意...',
      confidence: 0.1,
      tokens_used: 0,
      cost: 0,
      timestamp: Date.now()
    };
  }

  // 获取服务健康状态
  getServiceHealth(): Record<string, boolean> {
    const health: Record<string, boolean> = {};
    this.healthStatus.forEach((status, provider) => {
      health[provider] = status;
    });
    return health;
  }

  // 获取当前成本统计
  getCurrentCosts(): Record<string, number> {
    const costs: Record<string, number> = {};
    this.providers.forEach((provider, name) => {
      costs[name] = provider.costPerCall;
    });
    return costs;
  }
}

// 速率限制器
class RateLimiter {
  private requests: number[] = [];
  private limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // 清理过期的请求记录
    this.requests = this.requests.filter(time => time > oneMinuteAgo);

    return this.requests.length < this.limit;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }
}

export default AIServiceManager;