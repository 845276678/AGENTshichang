import { AIServiceManager } from '@/lib/ai-service-manager'
import type {
  SimplifiedBusinessPlan,
  AIExpertAssignment,
  ContentAdaptationStrategy,
  SimplifiedGenerationFlow
} from './simplified-guide-structure'
import type { BiddingSnapshot } from './types'
import type { MaturityScoreResult } from '@/types/maturity-score'

/**
 * 简化版商业计划书生成器
 *
 * 核心特点：
 * 1. 4个核心模块，结构清晰
 * 2. AI专家分工协作
 * 3. 内容深度自适应
 * 4. 并行生成提高效率
 */
export class SimplifiedBusinessPlanGenerator {
  private aiService: AIServiceManager

  constructor() {
    this.aiService = new AIServiceManager()
  }

  /**
   * 生成简化版商业计划书
   */
  async generateSimplifiedPlan(
    snapshot: BiddingSnapshot,
    maturityScore?: MaturityScoreResult
  ): Promise<SimplifiedBusinessPlan> {
    console.log('🚀 开始生成简化版商业计划书...')

    // 1. 确定内容深度
    const contentDepth = this.determineContentDepth(maturityScore)
    console.log(`📊 内容深度: ${contentDepth}`)

    // 2. 准备基础上下文
    const baseContext = this.prepareBaseContext(snapshot, maturityScore)

    // 3. 按正确的AI专家分工并行生成各模块内容
    const [
      userAndMarket,        // 小琳 (用户情感专家)
      productAndTech,       // 艾克斯 (技术专家)
      validationAndIteration, // 阿伦 (运营推广专家) + 李博 (理论专家)
      businessAndResources    // 老王 (投资家) + 阿伦 (运营推广专家)
    ] = await Promise.all([
      this.generateUserAndMarketModule(baseContext, contentDepth),
      this.generateProductAndTechModule(baseContext, contentDepth),
      this.generateValidationModule(baseContext, contentDepth),
      this.generateBusinessModule(baseContext, contentDepth)
    ])

    // 4. 组装完整计划
    const plan: SimplifiedBusinessPlan = {
      userAndMarket,
      productAndTech,
      validationAndIteration,
      businessAndResources,
      metadata: {
        ideaTitle: snapshot.ideaTitle,
        ideaId: snapshot.ideaId,
        maturityLevel: maturityScore?.level || 'MEDIUM',
        maturityScore: maturityScore?.totalScore || 6,
        generatedAt: new Date().toISOString(),
        confidence: maturityScore?.confidence || 0.8,
        aiContributors: ['老王 (投资家)', '艾克斯 (技术专家)', '小琳 (用户情感专家)', '阿伦 (运营推广专家)', '李博 (理论专家)'],
        contentDepth
      }
    }

    console.log('✅ 简化版商业计划书生成完成')
    return plan
  }

  /**
   * 确定内容深度
   */
  private determineContentDepth(maturityScore?: MaturityScoreResult): 'basic' | 'detailed' | 'comprehensive' {
    if (!maturityScore) return 'detailed'

    if (maturityScore.totalScore <= 5) return 'basic'
    if (maturityScore.totalScore <= 7) return 'detailed'
    return 'comprehensive'
  }

  /**
   * 准备基础上下文
   */
  private prepareBaseContext(snapshot: BiddingSnapshot, maturityScore?: MaturityScoreResult) {
    return {
      idea: {
        title: snapshot.ideaTitle,
        description: snapshot.ideaDescription || '',
        industry: snapshot.industry || '通用',
        targetUsers: snapshot.targetUsers || '未明确'
      },
      discussions: snapshot.expertDiscussion || [],
      bids: snapshot.finalBids || [],
      maturity: maturityScore ? {
        score: maturityScore.totalScore,
        level: maturityScore.level,
        strengths: maturityScore.strengths,
        weaknesses: maturityScore.weaknesses
      } : null,
      userContext: snapshot.userContext || null
    }
  }

  /**
   * 生成用户需求与市场模块 - 小琳 (用户情感专家)
   */
  private async generateUserAndMarketModule(context: any, depth: string) {
    const prompt = this.buildUserMarketPrompt(context, depth)

    try {
      const response = await this.aiService.callSingleService({
        provider: 'zhipu', // 小琳使用智谱GLM
        persona: 'innovation-mentor-charlie',
        context: {
          ideaContent: context.idea.description,
          phase: 'content-generation',
          round: 1
        },
        systemPrompt: prompt,
        temperature: 0.7,
        maxTokens: depth === 'basic' ? 800 : depth === 'detailed' ? 1200 : 1600
      })

      return this.parseUserMarketResponse(response.content, context)
    } catch (error) {
      console.error('用户市场模块生成失败:', error)
      return this.getFallbackUserMarket(context)
    }
  }

  /**
   * 生成产品方案与技术模块 - 艾克斯 (技术专家)
   */
  private async generateProductAndTechModule(context: any, depth: string) {
    const prompt = this.buildProductTechPrompt(context, depth)

    try {
      const response = await this.aiService.callSingleService({
        provider: 'deepseek', // 艾克斯使用DeepSeek
        persona: 'tech-expert-alex',
        context: {
          ideaContent: context.idea.description,
          phase: 'content-generation',
          round: 1
        },
        systemPrompt: prompt,
        temperature: 0.6,
        maxTokens: depth === 'basic' ? 1000 : depth === 'detailed' ? 1400 : 1800
      })

      return this.parseProductTechResponse(response.content, context)
    } catch (error) {
      console.error('产品技术模块生成失败:', error)
      return this.getFallbackProductTech(context)
    }
  }

  /**
   * 生成验证策略与迭代模块 - 阿伦 (运营推广专家) + 李博 (理论专家)
   */
  private async generateValidationModule(context: any, depth: string) {
    // 先让李博提供理论框架
    const theoryPrompt = this.buildTheoryFrameworkPrompt(context, depth)

    try {
      const theoryResponse = await this.aiService.callSingleService({
        provider: 'qwen', // 李博使用通义千问
        persona: 'theory-expert-li',
        context: {
          ideaContent: context.idea.description,
          phase: 'content-generation',
          round: 1
        },
        systemPrompt: theoryPrompt,
        temperature: 0.7,
        maxTokens: depth === 'basic' ? 600 : depth === 'detailed' ? 1000 : 1400
      })

      // 再让阿伦基于理论框架设计具体的验证策略
      const validationPrompt = this.buildValidationPrompt(context, theoryResponse.content, depth)
      const validationResponse = await this.aiService.callSingleService({
        provider: 'deepseek', // 阿伦使用DeepSeek
        persona: 'operation-expert-alan',
        context: {
          ideaContent: context.idea.description,
          phase: 'content-generation',
          round: 1
        },
        systemPrompt: validationPrompt,
        temperature: 0.8,
        maxTokens: depth === 'basic' ? 800 : depth === 'detailed' ? 1200 : 1600
      })

      return this.parseValidationResponse(validationResponse.content, theoryResponse.content, context)
    } catch (error) {
      console.error('验证模块生成失败:', error)
      return this.getFallbackValidation(context)
    }
  }

  /**
   * 生成商业模式与资源模块 - 老王 (投资家) + 阿伦 (运营推广专家)
   */
  private async generateBusinessModule(context: any, depth: string) {
    // 先让老王分析商业模式和投资价值
    const businessPrompt = this.buildBusinessModelPrompt(context, depth)

    try {
      const businessResponse = await this.aiService.callSingleService({
        provider: 'qwen', // 老王使用通义千问
        persona: 'investor-wang',
        context: {
          ideaContent: context.idea.description,
          phase: 'content-generation',
          round: 1
        },
        systemPrompt: businessPrompt,
        temperature: 0.7,
        maxTokens: depth === 'basic' ? 800 : depth === 'detailed' ? 1200 : 1600
      })

      // 再让阿伦设计运营推广策略
      const launchPrompt = this.buildLaunchStrategyPrompt(context, businessResponse.content, depth)
      const launchResponse = await this.aiService.callSingleService({
        provider: 'deepseek', // 阿伦使用DeepSeek
        persona: 'operation-expert-alan',
        context: {
          ideaContent: context.idea.description,
          phase: 'content-generation',
          round: 1
        },
        systemPrompt: launchPrompt,
        temperature: 0.8,
        maxTokens: depth === 'basic' ? 800 : depth === 'detailed' ? 1200 : 1600
      })

      return this.parseBusinessResponse(businessResponse.content, launchResponse.content, context)
    } catch (error) {
      console.error('商业模块生成失败:', error)
      return this.getFallbackBusiness(context)
    }
  }

  /**
   * 构建用户市场分析提示词 - 小琳 (用户情感专家)
   */
  private buildUserMarketPrompt(context: any, depth: string): string {
    const basePrompt = `
作为用户情感专家小琳，请基于以下信息深入分析用户需求与市场情况：

创意信息：
- 标题：${context.idea.title}
- 描述：${context.idea.description}
- 行业：${context.idea.industry}

专家讨论：
${context.discussions?.map((d: any) => `${d.personaName}: ${d.content}`).join('\n') || '暂无专家讨论记录'}

请从用户体验和情感角度分析，以JSON格式返回：
{
  "targetUsers": {
    "primary": "核心用户群体的情感特征和需求",
    "secondary": "次要用户群体",
    "characteristics": ["用户情感特征1", "用户行为特征2"],
    "painPoints": ["情感痛点1", "体验痛点2"]
  },
  "marketAnalysis": {
    "size": "市场规模和用户情感需求描述",
    "trends": ["用户行为趋势1", "情感需求趋势2"],
    "opportunities": ["用户体验机会1", "情感连接机会2"],
    "competitors": ["竞争对手的用户体验短板"]
  },
  "applicationScenarios": {
    "primary": "主要情感化应用场景",
    "secondary": ["次要情感场景1", "次要情感场景2"],
    "useCases": ["具体用户情感用例1", "具体用户情感用例2"]
  }
}
`

    if (depth === 'basic') {
      return basePrompt + '\n请提供基础的用户情感分析，重点关注核心痛点和情感需求。'
    } else if (depth === 'detailed') {
      return basePrompt + '\n请提供详细的用户体验分析，包含情感旅程和心理模型。'
    } else {
      return basePrompt + '\n请提供深度的用户情感洞察，包含心理驱动因素和情感设计建议。'
    }
  }

  /**
   * 构建产品技术方案提示词 - 艾克斯 (技术专家)
   */
  private buildProductTechPrompt(context: any, depth: string): string {
    return `
作为技术专家艾克斯，请为以下创意设计完整的产品技术方案：

创意：${context.idea.title}
描述：${context.idea.description}
行业：${context.idea.industry}
用户上下文：${JSON.stringify(context.userContext)}

请以JSON格式返回技术架构分析：
{
  "coreValue": "从技术角度的核心价值主张",
  "keyFeatures": ["核心技术功能1", "核心技术功能2"],
  "techStack": {
    "recommended": ["推荐技术栈1", "推荐技术栈2"],
    "alternatives": ["备选技术方案1", "备选技术方案2"],
    "reasoning": "技术选择的工程理由和架构考虑"
  },
  "developmentPlan": {
    "mvpFeatures": ["MVP核心技术功能1", "MVP核心技术功能2"],
    "timeline": "技术开发时间线和里程碑",
    "milestones": [
      {
        "phase": "技术阶段名称",
        "duration": "持续时间",
        "deliverables": ["技术交付物1", "技术交付物2"]
      }
    ]
  },
  "differentiators": ["技术差异化优势1", "技术护城河2"]
}

${depth === 'basic' ? '请提供基础技术方案，重点考虑可行性。' :
  depth === 'detailed' ? '请提供详细技术规划，包含架构设计。' :
  '请提供企业级技术架构方案，包含性能和扩展性分析。'}
`
  }

  /**
   * 构建理论框架提示词 - 李博 (理论专家)
   */
  private buildTheoryFrameworkPrompt(context: any, depth: string): string {
    return `
作为理论专家李博，请为以下创意提供验证策略的理论框架：

创意信息：${JSON.stringify(context.idea)}
成熟度：${context.maturity ? `${context.maturity.score}/10 (${context.maturity.level})` : '未知'}

请从学术和理论角度，以JSON格式返回框架指导：
{
  "theoreticalFoundation": {
    "framework": "适用的理论框架（如精益创业、设计思维等）",
    "principles": ["理论原则1", "理论原则2"],
    "methodology": "推荐的验证方法论"
  },
  "riskAnalysis": {
    "systematicRisks": ["系统性风险1", "系统性风险2"],
    "mitigationTheory": "风险缓解的理论基础",
    "monitoringFramework": "风险监控的理论模型"
  },
  "sustainabilityModel": {
    "longTermViability": "长期可持续性的理论分析",
    "scalingTheory": "规模化扩张的理论支撑",
    "adaptationMechanism": "环境适应的理论机制"
  }
}

${depth === 'basic' ? '请提供基础理论指导。' :
  depth === 'detailed' ? '请提供详细的理论分析框架。' :
  '请提供深度的理论模型和学术支撑。'}
`
  }

  /**
   * 构建验证策略提示词 - 阿伦 (运营推广专家)
   */
  private buildValidationPrompt(context: any, theoryResponse: string, depth: string): string {
    return `
作为运营推广专家阿伦，基于李博的理论框架，为创意设计具体的验证策略：

理论框架：${theoryResponse}

创意信息：${JSON.stringify(context.idea)}

请以JSON格式返回运营验证策略：
{
  "hypotheses": ["关键假设1（可验证）", "关键假设2（可验证）"],
  "validationMethods": [
    {
      "method": "具体验证方法（如A/B测试、用户访谈）",
      "timeline": "执行时间安排",
      "successCriteria": "成功标准和KPI",
      "resources": ["所需资源1", "所需资源2"]
    }
  ],
  "iterationPlan": {
    "cycles": [
      {
        "focus": "迭代重点（如获客、留存、转化）",
        "duration": "迭代周期时长",
        "experiments": ["增长实验1", "增长实验2"],
        "metrics": ["关键指标1", "关键指标2"]
      }
    ],
    "feedbackChannels": ["用户反馈渠道1", "数据反馈渠道2"],
    "decisionFramework": "数据驱动的决策框架"
  },
  "riskMitigation": [
    {
      "risk": "运营风险点",
      "impact": "high|medium|low",
      "mitigation": "具体缓解措施"
    }
  ]
}

${depth === 'basic' ? '请提供基础验证策略。' :
  depth === 'detailed' ? '请提供详细的增长验证计划。' :
  '请提供全面的运营验证体系。'}
`
  }

  /**
   * 构建商业模式提示词 - 老王 (投资家)
   */
  private buildBusinessModelPrompt(context: any, depth: string): string {
    return `
作为投资家老王，请为以下创意设计商业模式和投资分析：

创意信息：${JSON.stringify(context.idea)}
用户上下文：${JSON.stringify(context.userContext)}

请以JSON格式返回投资级商业分析：
{
  "businessModel": {
    "revenueStreams": ["收入来源1（具体模式）", "收入来源2"],
    "pricingStrategy": "定价策略和投资回报逻辑",
    "costStructure": ["主要成本项1", "主要成本项2"],
    "keyMetrics": ["关键财务指标1", "关键财务指标2"]
  },
  "investmentAnalysis": {
    "marketSize": "目标市场规模和增长潜力",
    "competitiveAdvantage": "核心竞争优势和护城河",
    "riskFactors": ["投资风险1", "投资风险2"],
    "exitStrategy": "退出策略和投资回报预期"
  },
  "teamAndResources": {
    "coreTeam": [
      {
        "role": "关键角色",
        "skills": ["核心技能1", "核心技能2"],
        "priority": "critical|important|nice-to-have"
      }
    ],
    "budget": {
      "development": "开发投入预算",
      "marketing": "市场推广预算",
      "operations": "运营资金需求",
      "timeline": "资金使用周期"
    },
    "partnerships": ["战略合作伙伴1", "资源合作伙伴2"]
  }
}

${depth === 'basic' ? '请提供基础投资分析。' :
  depth === 'detailed' ? '请提供详细的投资评估报告。' :
  '请提供完整的投资尽调分析。'}
`
  }

  /**
   * 构建推广策略提示词 - 阿伦 (运营推广专家)
   */
  private buildLaunchStrategyPrompt(context: any, businessResponse: string, depth: string): string {
    return `
作为运营推广专家阿伦，基于老王的商业模式分析，设计具体的运营推广策略：

商业模式分析：${businessResponse}

创意信息：${JSON.stringify(context.idea)}

请以JSON格式返回运营推广策略：
{
  "launchStrategy": {
    "phases": [
      {
        "name": "推广阶段名称",
        "goals": ["阶段目标1", "阶段目标2"],
        "timeline": "时间安排",
        "tactics": ["具体策略1", "具体策略2"]
      }
    ],
    "channels": ["推广渠道1（具体平台）", "推广渠道2"],
    "metrics": ["成功指标1", "成功指标2"]
  },
  "growthHacking": {
    "viralMechanics": "病毒传播机制设计",
    "contentStrategy": "内容营销策略",
    "communityBuilding": "社群运营方案",
    "partnershipMarketing": "合作营销策略"
  },
  "operationalPlan": {
    "dailyOperations": ["日常运营任务1", "日常运营任务2"],
    "weeklyGoals": ["周目标1", "周目标2"],
    "monthlyMilestones": ["月度里程碑1", "月度里程碑2"]
  }
}

${depth === 'basic' ? '请提供基础推广策略。' :
  depth === 'detailed' ? '请提供详细的运营计划。' :
  '请提供全面的增长黑客策略。'}
`
  }

  // 解析响应的方法
  private parseUserMarketResponse(response: string, context: any) {
    try {
      return JSON.parse(response)
    } catch {
      return this.getFallbackUserMarket(context)
    }
  }

  private parseProductTechResponse(response: string, context: any) {
    try {
      return JSON.parse(response)
    } catch {
      return this.getFallbackProductTech(context)
    }
  }

  private parseValidationResponse(validationResponse: string, theoryResponse: string, context: any) {
    try {
      const validation = JSON.parse(validationResponse)
      const theory = JSON.parse(theoryResponse)

      // 合并理论框架和验证策略
      return {
        ...validation,
        theoreticalFoundation: theory.theoreticalFoundation,
        sustainabilityModel: theory.sustainabilityModel
      }
    } catch {
      return this.getFallbackValidation(context)
    }
  }

  private parseBusinessResponse(businessResponse: string, launchResponse: string, context: any) {
    try {
      const business = JSON.parse(businessResponse)
      const launch = JSON.parse(launchResponse)

      // 合并商业模式和推广策略
      return {
        businessModel: business.businessModel,
        teamAndResources: business.teamAndResources,
        investmentAnalysis: business.investmentAnalysis,
        launchStrategy: launch.launchStrategy,
        growthHacking: launch.growthHacking,
        operationalPlan: launch.operationalPlan
      }
    } catch {
      return this.getFallbackBusiness(context)
    }
  }

  // 降级方案（省略具体实现）
  private getFallbackUserMarket(context: any) {
    return {
      targetUsers: {
        primary: context.idea.targetUsers || '目标用户待明确',
        characteristics: ['基础用户特征待分析'],
        painPoints: ['用户痛点待发现']
      },
      marketAnalysis: {
        size: '市场规模待调研',
        trends: ['市场趋势待分析'],
        opportunities: ['市场机会待挖掘'],
        competitors: ['竞争对手待识别']
      },
      applicationScenarios: {
        primary: '主要应用场景待明确',
        secondary: ['次要场景待挖掘'],
        useCases: ['具体用例待设计']
      }
    }
  }

  private getFallbackProductTech(context: any) {
    return {
      coreValue: '核心价值待明确',
      keyFeatures: ['关键功能待设计'],
      techStack: {
        recommended: ['技术方案待选择'],
        alternatives: ['备选方案待评估'],
        reasoning: '技术选择理由待分析'
      },
      developmentPlan: {
        mvpFeatures: ['MVP功能待确定'],
        timeline: '开发时间线待制定',
        milestones: [{
          phase: '开发阶段待规划',
          duration: '时间待估算',
          deliverables: ['交付物待明确']
        }]
      },
      differentiators: ['差异化优势待发现']
    }
  }

  private getFallbackValidation(context: any) {
    return {
      hypotheses: ['核心假设待验证'],
      validationMethods: [{
        method: '验证方法待选择',
        timeline: '时间安排待制定',
        successCriteria: '成功标准待确定',
        resources: ['所需资源待评估']
      }],
      iterationPlan: {
        cycles: [{
          focus: '迭代重点待明确',
          duration: '周期时长待确定',
          experiments: ['实验待设计'],
          metrics: ['指标待选择']
        }],
        feedbackChannels: ['反馈渠道待建立'],
        decisionFramework: '决策框架待制定'
      },
      riskMitigation: [{
        risk: '风险点待识别',
        impact: 'medium' as const,
        mitigation: '缓解措施待制定'
      }]
    }
  }

  private getFallbackBusiness(context: any) {
    return {
      businessModel: {
        revenueStreams: ['收入模式待设计'],
        pricingStrategy: '定价策略待制定',
        costStructure: ['成本结构待分析'],
        keyMetrics: ['关键指标待确定']
      },
      teamAndResources: {
        coreTeam: [{
          role: '核心角色待明确',
          skills: ['技能要求待分析'],
          priority: 'critical' as const
        }],
        budget: {
          development: '开发预算待估算',
          marketing: '营销预算待规划',
          operations: '运营预算待计算',
          timeline: '预算周期待确定'
        },
        partnerships: ['合作伙伴待寻找']
      },
      launchStrategy: {
        phases: [{
          name: '启动阶段待规划',
          goals: ['阶段目标待设定'],
          timeline: '时间安排待确定',
          tactics: ['具体策略待制定']
        }],
        channels: ['推广渠道待选择'],
        metrics: ['成功指标待确定']
      }
    }
  }
}