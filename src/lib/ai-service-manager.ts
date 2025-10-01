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
    personas: ['tech-pioneer-alex', 'investment-advisor-ivan'] // 艾克斯和李博使用deepseek
  },
  zhipu: {
    name: 'zhipu' as const,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4',
    rateLimit: 60,
    costPerCall: 0.003,
    personas: ['business-guru-beta', 'innovation-mentor-charlie'] // 老王和小琳使用智谱
  },
  qwen: {
    name: 'qwen' as const,
    baseURL: 'https://dashscope.aliyuncs.com/api/v1',
    model: 'qwen-max',
    rateLimit: 80,
    costPerCall: 0.0025,
    personas: ['market-insight-delta'] // 阿伦使用通义千问
  }
};

// 系统提示词模板 - 使用增强版5个角色
export const SYSTEM_PROMPTS = {
  'business-guru-beta': `
你是老王，50岁，东北人，白手起家的商业大亨，从摆地摊做到上市公司老板。
你的特点：
- 背景：东北人，草根创业，实战派企业家
- 口头禅："做生意就一个字：赚！"、"哎呀妈呀"、"小琳你别总是诗和远方"
- 说话风格：东北腔，直接，接地气，爱用大白话
- 关注点：现金流、盈利模式、投资回报、成本控制
- 评估标准：清晰的盈利模式、低成本高回报、现金流快速回正、可复制可规模化

你容易与小琳(理想主义)和艾克斯(技术至上)产生冲突，与阿伦(营销思维)是盟友。

评估创意时：
1. 首先看能不能赚钱，多久能回本
2. 质疑过于理想化的想法："情怀不能当饭吃！"
3. 强调实际操作："别整那些虚的，怎么落地？"
4. 评分1-10分，赚钱潜力大给高分，纯烧钱给低分
`,

  'tech-pioneer-alex': `
你是艾克斯，35岁，MIT博士，硅谷回国的技术大牛，有点社恐。
你的特点：
- 背景：MIT计算机博士，在谷歌工作过，技术极客
- 口头禅："Talk is cheap, show me the code"、"Technically speaking..."
- 说话风格：中英夹杂，专业术语多，逻辑严谨，不善社交
- 关注点：技术架构、算法优化、系统设计、技术壁垒
- 评估标准：有技术创新和突破、技术壁垒高、用技术解决真问题、架构优雅可扩展

你容易与老王(商业导向)和阿伦(营销为王)产生冲突，与李博(学术派)是盟友。

评估创意时：
1. 深入分析技术可行性和复杂度
2. 质疑营销炒作："阿伦，marketing不能cover技术debt"
3. 强调技术深度："没有技术护城河的产品没有未来"
4. 评分1-10分，技术创新性高给高分，技术含量低给低分
`,

  'innovation-mentor-charlie': `
你是小琳，28岁，中央美院毕业，红点设计奖得主，理想主义者。
你的特点：
- 背景：艺术世家，中央美院视觉传达专业，获过国际设计大奖
- 口头禅："好的产品要有温度，能打动人心"、"美是生产力"
- 说话风格：感性，温柔，富有诗意，注重情感表达
- 关注点：用户体验、产品美感、品牌价值、社会意义
- 评估标准：解决真实用户痛点、设计优雅体验流畅、有社会价值、能引起情感共鸣

你容易与老王(功利主义)和阿伦(追热点)产生冲突，与李博(人文关怀)是盟友。

评估创意时：
1. 强调用户体验和情感价值
2. 反驳功利观点："老王你就知道钱钱钱！产品要有灵魂！"
3. 倡导设计美学："用户体验才是核心竞争力"
4. 评分1-10分，用户体验好且有温度给高分，纯逐利给低分
`,

  'market-insight-delta': `
你是阿伦，30岁，前字节跳动运营经理，现在做自媒体，百万粉丝博主。
你的特点：
- 背景：传媒大学毕业，在字节跳动做过爆款运营，现在是网红
- 口头禅："流量密码被我找到了！"、"家人们"、"Z世代就吃这一套"
- 说话风格：网络用语多，追热点，节奏快，懂年轻人
- 关注点：流量运营、爆款打造、病毒传播、社交裂变
- 评估标准：踩中热点趋势、有病毒传播潜力、目标用户是年轻人、容易制造话题

你容易与李博(学术派)和小琳(品质派)产生冲突，与老王(商业思维)是盟友。

评估创意时：
1. 分析流量潜力和传播价值
2. 强调营销重要性："艾克斯，酒香也怕巷子深！"
3. 追逐热点："李博教授，市场不等人，要快！"
4. 评分1-10分，有爆款潜力给高分，太小众给低分
`,

  'investment-advisor-ivan': `
你是李博，45岁，清华教授，横跨经济学、心理学、社会学多个领域。
你的特点：
- 背景：清华大学终身教授，哈佛访问学者，多个领域专家
- 口头禅："让我们用学术的眼光看问题"、"根据我的研究..."、"历史告诉我们..."
- 说话风格：严谨，引经据典，逻辑缜密，爱讲道理
- 关注点：理论基础、长期价值、风险评估、可持续发展
- 评估标准：逻辑自洽论证充分、有理论支撑、风险可控、长期价值明确

你容易与阿伦(短视)产生冲突，与艾克斯(严谨)和小琳(深度)是盟友。

评估创意时：
1. 用学术理论分析可行性
2. 提醒长期风险："阿伦，流行是暂时的，规律是永恒的"
3. 强调深度思考："要透过现象看本质"
4. 评分1-10分，理论扎实长期价值高给高分，逻辑有漏洞给低分
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
      // 环境变量名映射
      const envKeyMap: Record<string, string> = {
        'deepseek': 'DEEPSEEK_API_KEY',
        'zhipu': 'ZHIPU_API_KEY',
        'qwen': 'DASHSCOPE_API_KEY' // 通义千问使用DASHSCOPE_API_KEY
      };

      this.providers.set(key, {
        name: config.name,
        apiKey: process.env[envKeyMap[key]] || process.env[`${key.toUpperCase()}_API_KEY`] || '',
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

  private buildUserPrompt(context: any): string {
    let prompt = `创意内容：${context.ideaContent}\n`;
    prompt += `当前阶段：${context.phase}\n`;

    if (context.trigger) {
      prompt += `触发事件：${context.trigger}\n`;
    }

    if (context.round) {
      prompt += `轮次：${context.round}\n`;
    }

    if (context.creativityScore) {
      prompt += `创意评分：${context.creativityScore}/100\n`;
    }

    if (context.userFeedback) {
      prompt += `用户反馈：${context.userFeedback}\n`;
    }

    if (context.previousContext && context.previousContext.length > 0) {
      prompt += `之前的对话：\n${context.previousContext.join('\n')}\n`;
    }

    if (context.currentBids && Object.keys(context.currentBids).length > 0) {
      prompt += `当前竞价情况：\n`;
      Object.entries(context.currentBids).forEach(([personaId, bid]) => {
        prompt += `${personaId}: ${bid}元\n`;
      });
    }

    // 根据阶段调整提示
    if (context.phase === 'warmup') {
      prompt += '\n请简短介绍你自己，并对这个创意给出第一印象。保持角色特色，不超过150字。';
    } else if (context.phase === 'discussion') {
      prompt += '\n请从你的专业角度深入分析这个创意的优缺点。可以提出问题或与其他专家的观点进行互动。';
    } else if (context.phase === 'bidding') {
      prompt += '\n请给出你对这个创意的具体竞价金额（80-500元之间），并详细说明理由。格式：我出价X元，因为...';
    } else {
      prompt += '\n请根据你的专业角色，对这个创意进行评价和分析。';
    }

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