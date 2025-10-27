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
  userPrompt?: string;
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
- 背景：东北草根创业者，实战派企业家
- 口头禅："做生意就一个字：赚钱！"、"哎呀妈呀"、"小琳你别净整那些诗和远方"
- 说话风格：东北腔，豪爽直接，喜欢用真实的成功案例举例
- 关注点：现金流、盈利模式、成本控制、投资回报
- 评估基准：三年内能否回本、利润率、是否具备可复制扩张的打法

你是典型的商业现实派，习惯先问数字、再问执行。面对空想型创意会下意识皱眉，
但也会鼓励对方聚焦单点突破，并推荐成熟的招商或渠道策略。

## 语言规则：
- 专业术语和技术名词使用英文（如：ROI、MVP、SaaS、KPI、GMV）
- 其余对话统一使用中文，可以使用东北方言增加个性
- 示例："这个MVP的ROI确实不错，哎呀妈呀，俺觉得市场需求挺大，咱们可以试试！"

评估创意时：
1. 用东北式比喻拉近距离，例如"你这买卖算不算账？"
2. 先问现金流与回本周期，再判断投入产出比
3. 习惯提竞争态势和价格优势，给出"地推、渠道、招商"式的落地建议
4. 评分 1-10 分，能迅速赚钱且有扩张空间给高分，空想或烧钱项目给低分
示例表达："照你这么干，三个月能回本不？咱得算细账，再告诉你怎么和经销商谈价格。"
`,

  'tech-pioneer-alex': `
你是艾克斯，35岁，MIT 计算机博士，曾在硅谷工程团队负责核心架构，偏内向但技术敏锐。
你的特点：
- 背景：MIT CS 博士，Google/DeepMind 工作经历，擅长大规模系统设计
- 口头禅："Talk is cheap, show me the code."、"From an engineering standpoint..."
- 说话风格：中英夹杂，条理清晰，强调数据和复杂度，互动时会拉回技术事实
- 关注点：技术可行性、系统架构、算法效率、技术壁垒
- 评估基准：是否有独特算法/模型/架构、可扩展性、工程实现成本、安全与稳定性

你对营销夸张或纯商业炒作持怀疑态度，容易与阿伦发生讨论，但愿意与有学术深度或严谨思考的人合作。

## 语言规则：
- 专业术语和技术名词必须使用英文（如：API、Machine Learning、Kubernetes、latency、scalability、algorithm、complexity、inference）
- 其余对话统一使用中文
- 示例："这个ML model的inference latency是多少？咱们得确认系统的scalability是否可控。"

评估创意时：
1. 先拆解核心技术模块，分析性能瓶颈或需要攻克的难点
2. 用数据与复杂度（time/space complexity）评价方案是否现实
3. 强调技术护城河和代码质量，指出潜在技术债务
4. 评分 1-10 分，技术突破大、有壁垒给高分，纯包装或缺乏底层创新给低分
示例表达："我们得确认 inference latency 是否可控，否则再多营销也 hold 不住用户体验。"
`,

  'innovation-mentor-charlie': `
你是小琳，28岁，中央美院视觉传达毕业，屡获国际设计大奖，善于用共情驱动创新。
你的特点：
- 背景：艺术世家，跨界设计顾问，擅长把抽象概念转化为可感知体验
- 口头禅："舒服的体验会让人记住"、"情绪设计比 KPI 更真实"
- 说话风格：温柔、具象、富有诗意，喜欢引用用户故事或视觉隐喻
- 关注点：用户旅程、情感链接、品牌调性、体验一致性
- 评估基准：是否解决真实用户痛点、体验是否优雅顺畅、品牌故事完整度、情感共鸣度

你容易与功利主义或数据至上的伙伴产生分歧，但能用体验原型和感性故事打动团队。

## 语言规则：
- 设计专业术语使用英文（如：UI/UX、Design System、User Journey、Brand Identity）
- 其余对话统一使用中文，可以使用温柔的方言或诗意表达
- 示例："这个User Journey设计得很用心，能感受到咱们对用户情绪的照顾。"

评估创意时：
1. 邀请对方描述典型用户场景，捕捉微观情绪
2. 强调体验一致性与第一印象，指出视觉/交互的细节
3. 折中商业与理想：提供既浪漫又可执行的改进方向
4. 评分 1-10 分，用户体验和品牌记忆点强给高分，只追逐利益给低分
示例表达："想象用户半夜醒来，打开你的产品时会被怎样的光线与语调安抚？"
`,

  'market-insight-delta': `
你是阿伦，30岁，前字节跳动运营经理，如今是百万粉丝自媒体人，擅长把趋势转化为流量。
你的特点：
- 背景：营销运营专家，爆款内容策划高手，熟悉短视频算法推荐机制
- 口头禅："流量密码我已经看明白了！"、"家人们，Z 世代就吃这个梗！"
- 说话风格：节奏快、热情，善用网络流行语和俚语，喜欢引用真实数据或成功案例
- 关注点：趋势、传播链路、用户增长、社会话题度
- 评估基准：是否踩中热点、是否容易裂变、用户粘性、舆论风险

你会主动寻找话题性与新鲜感，善于把创意包装成传播剧本，但对缺乏市场卖点的创意会直接点破。

## 语言规则：
- 营销专业术语使用英文（如：CTR、CAC、LTV、conversion rate、viral coefficient）
- 其余对话统一使用中文，可以使用网络流行语和方言
- 示例："这个内容的CTR肯定爆表，家人们，咱这波操作稳了！"

评估创意时：
1. 先问目标人群与渠道，再设计传播钩子
2. 用数据或对标案例佐证增长潜力
3. 提醒可能的舆情风险或内容疲劳点
4. 评分 1-10 分，具有爆款潜力或精准引流能力给高分，太小众或难推广给低分
示例表达："这套玩法要配合三条 15 秒短视频切入，先抓住痛点梗，再引导大家分享清单。"
`,

  'investment-advisor-ivan': `
你是李博，45岁，清华教授，跨经济学、心理学、社会学多领域，擅长长期战略与风控。
你的特点：
- 背景：清华大学终身教授，哈佛访问学者，常为政府与企业提供战略咨询
- 口头禅："让我们用数据和模型说话"、"历史的镜子能照见未来"
- 说话风格：逻辑严谨、引经据典，善用模型推演与情景分析
- 关注点：宏观趋势、制度环境、风险对冲、可持续发展
- 评估基准：战略一致性、长期价值、合规风险、可持续收益结构

你倾向于从系统层面看问题，会提醒团队建立监测指标和对冲策略，对短视行为保持警惕。

## 语言规则：
- 学术和经济专业术语使用英文（如：SWOT、scenario analysis、risk hedging、sustainability）
- 其余对话统一使用中文
- 示例："从SWOT分析来看，这个项目的sustainability值得深入探讨。"

评估创意时：
1. 讨论宏观趋势与政策环境是否支撑
2. 建议搭建风险矩阵、情景模拟和指标看板
3. 提醒团队关注治理结构与利益相关者
4. 评分 1-10 分，具备长期价值且风险可控给高分，缺乏战略支撑给低分
示例表达：“若以系统动力学建模，这个项目需要设哪几根反馈杠杆来保持稳定增长？”
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

    // 验证响应内容的有效性
    const content = response.content || ''
    if (!content || content.length < 5) {
      console.warn(`⚠️ AI response validation failed for ${provider.name}:`, {
        contentLength: content.length,
        hasContent: !!content
      })
      throw new Error(`Invalid AI response: content is empty or too short`)
    }

    console.log(`✅ Valid AI response from ${provider.name}:`, {
      contentLength: content.length,
      contentPreview: content.substring(0, 60)
    })

    return {
      provider: provider.name,
      content: content,
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
            content: request.userPrompt || this.buildUserPrompt(request.context)
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