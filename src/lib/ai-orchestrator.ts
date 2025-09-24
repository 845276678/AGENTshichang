// AI服务编排配置
import { AIServiceFactory, AIProvider, AIResponse } from './ai-services'
import { AI_RESEARCH_PROMPTS } from './ai-research-prompts'

export interface AIService {
  provider: string
  model: string
  endpoint: string
  apiKey: string
  capabilities: string[]
}

export interface ResearchGuideStage {
  stage: string
  aiService: AIService
  prompt: string
  outputFormat: string
  dependencies?: string[]
}

// 中国本地AI服务配置
export const AI_SERVICES: Record<string, AIService> = {
  // 百度文心
  WENXIN: {
    provider: '百度',
    model: 'ERNIE-Bot-4.0',
    endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro',
    apiKey: process.env.BAIDU_API_KEY || '',
    capabilities: ['基本盘分析', '实战指导', '行动建议']
  },

  // 阿里通义
  QWEN: {
    provider: '阿里云',
    model: 'qwen-plus',
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    apiKey: process.env.ALIYUN_API_KEY || '',
    capabilities: ['数据源指导', '信息获取', '资源推荐']
  },

  // 讯飞星火
  SPARK: {
    provider: '讯飞',
    model: 'Spark3.0',
    endpoint: 'https://spark-api.xf-yun.com/v3.1/chat/completions',
    apiKey: process.env.XUNFEI_API_KEY || '',
    capabilities: ['调研方法', '操作指南', '执行计划']
  },

  // 腾讯混元
  HUNYUAN: {
    provider: '腾讯',
    model: 'hunyuan-pro',
    endpoint: 'https://hunyuan.tencentcloudapi.com',
    apiKey: process.env.TENCENT_API_KEY || '',
    capabilities: ['MVP验证', '快速测试', '低成本验证']
  },

  // 智谱GLM
  GLM: {
    provider: '智谱AI',
    model: 'glm-4',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    apiKey: process.env.ZHIPU_API_KEY || '',
    capabilities: ['商业模式', '盈利设计', '模式验证']
  }
}

// AI调研指导流程配置 (替代原有的商业计划生成)
export const RESEARCH_GUIDE_WORKFLOW: ResearchGuideStage[] = [
  {
    stage: '基本盘分析师',
    aiService: AI_SERVICES.WENXIN,
    prompt: AI_RESEARCH_PROMPTS.WENXIN_BASIC_MARKET_ANALYSIS,
    outputFormat: 'research_guide'
  },

  {
    stage: '调研方法专家',
    aiService: AI_SERVICES.SPARK,
    prompt: AI_RESEARCH_PROMPTS.SPARK_RESEARCH_GUIDE,
    outputFormat: 'research_methods',
    dependencies: ['基本盘分析师']
  },

  {
    stage: '数据源指南',
    aiService: AI_SERVICES.QWEN,
    prompt: AI_RESEARCH_PROMPTS.QWEN_DATA_SOURCES,
    outputFormat: 'data_sources',
    dependencies: ['调研方法专家']
  },

  {
    stage: 'MVP验证专家',
    aiService: AI_SERVICES.HUNYUAN,
    prompt: AI_RESEARCH_PROMPTS.HUNYUAN_MVP_GUIDE,
    outputFormat: 'mvp_guide',
    dependencies: ['数据源指南']
  },

  {
    stage: '商业模式导师',
    aiService: AI_SERVICES.GLM,
    prompt: AI_RESEARCH_PROMPTS.GLM_BUSINESS_MODEL,
    outputFormat: 'business_model_guide',
    dependencies: ['MVP验证专家']
  }
]

// 商业化方案生成流程配置
export const BUSINESS_PLAN_WORKFLOW: BusinessPlanStage[] = [
  {
    stage: '创意解析与理解',
    aiService: AI_SERVICES.WENXIN,
    prompt: `
      请分析以下创意想法，提取核心概念和商业价值：

      创意标题：{ideaTitle}
      创意描述：{ideaDescription}
      分类：{category}

      请从以下角度进行分析：
      1. 核心问题识别
      2. 目标用户群体
      3. 解决方案概述
      4. 创新点分析
      5. 市场需求评估

      输出格式：结构化JSON
    `,
    outputFormat: 'json'
  },

  {
    stage: '市场调研与分析',
    aiService: AI_SERVICES.SPARK,
    prompt: `
      基于以下创意概念，进行深度市场调研：

      创意概念：{conceptAnalysis}

      请提供：
      1. 市场规模分析（TAM/SAM/SOM）
      2. 竞品调研（至少5个直接/间接竞品）
      3. 用户画像分析
      4. 市场趋势预测
      5. 进入壁垒分析
      6. 商业机会评估

      请引用真实数据和报告来源。
    `,
    outputFormat: 'markdown',
    dependencies: ['创意解析与理解']
  },

  {
    stage: '技术架构设计',
    aiService: AI_SERVICES.QWEN,
    prompt: `
      为以下项目设计完整技术方案：

      项目概述：{conceptAnalysis}
      市场需求：{marketAnalysis}

      请提供：
      1. 系统架构图（用Mermaid语法）
      2. 技术栈选择与理由
      3. 数据库设计
      4. API接口设计
      5. 安全方案
      6. 性能优化策略
      7. 部署方案
      8. 开发时间估算

      重点考虑中国本土化部署和合规要求。
    `,
    outputFormat: 'markdown_with_diagrams',
    dependencies: ['创意解析与理解', '市场调研与分析']
  },

  {
    stage: '商业模式设计',
    aiService: AI_SERVICES.WENXIN,
    prompt: `
      基于前期分析，设计可持续的商业模式：

      技术方案：{techArchitecture}
      市场分析：{marketAnalysis}

      请设计：
      1. 商业模式画布（9个模块）
      2. 收入流设计（至少3种）
      3. 成本结构分析
      4. 定价策略
      5. 客户获取策略
      6. 合作伙伴网络
      7. 核心竞争优势
      8. 可扩展性分析

      特别关注中国市场特色。
    `,
    outputFormat: 'structured_analysis',
    dependencies: ['技术架构设计', '市场调研与分析']
  },

  {
    stage: '财务建模与预测',
    aiService: AI_SERVICES.HUNYUAN,
    prompt: `
      为项目建立详细财务模型：

      商业模式：{businessModel}
      技术方案：{techArchitecture}
      市场数据：{marketAnalysis}

      请创建：
      1. 5年财务预测模型
      2. 现金流量表
      3. 损益预测表
      4. 资产负债表
      5. 投资回报分析（ROI/IRR/NPV）
      6. 敏感性分析
      7. 融资需求分析
      8. 估值模型

      提供Excel公式和计算逻辑。
    `,
    outputFormat: 'financial_model',
    dependencies: ['商业模式设计']
  },

  {
    stage: '法律合规与知识产权',
    aiService: AI_SERVICES.GLM,
    prompt: `
      为项目提供法律合规建议：

      业务模式：{businessModel}
      技术方案：{techArchitecture}

      请分析：
      1. 相关法律法规梳理
      2. 合规要求检查表
      3. 知识产权保护策略
      4. 专利申请建议
      5. 商标注册方案
      6. 数据安全合规
      7. 用户隐私保护
      8. 潜在法律风险及应对

      重点关注中国《网络安全法》、《数据安全法》等。
    `,
    outputFormat: 'legal_analysis',
    dependencies: ['商业模式设计', '技术架构设计']
  },

  {
    stage: '项目实施计划',
    aiService: AI_SERVICES.QWEN,
    prompt: `
      制定详细的项目执行计划：

      技术方案：{techArchitecture}
      财务计划：{financialModel}
      法律建议：{legalAnalysis}

      请提供：
      1. 项目里程碑规划
      2. 团队组建计划
      3. 技能需求矩阵
      4. 开发阶段规划
      5. 风险识别与应对
      6. 质量保证计划
      7. 测试验收标准
      8. 上线运营计划

      提供甘特图（Mermaid格式）。
    `,
    outputFormat: 'project_plan',
    dependencies: ['技术架构设计', '财务建模与预测', '法律合规与知识产权']
  },

  {
    stage: '投资推介方案',
    aiService: AI_SERVICES.WENXIN,
    prompt: `
      创建专业的投资者推介材料：

      完整分析：{allPreviousStages}

      请生成：
      1. BP执行摘要
      2. 投资亮点总结
      3. 市场机会描述
      4. 产品解决方案
      5. 商业模式说明
      6. 竞争优势分析
      7. 团队介绍模板
      8. 财务预测摘要
      9. 融资用途说明
      10. 退出策略规划

      语言简洁有力，适合15分钟路演。
    `,
    outputFormat: 'investor_pitch',
    dependencies: ['项目实施计划']
  }
]

// AI服务调用类
export class AIOrchestrator {
  private serviceFactory: typeof AIServiceFactory

  constructor() {
    this.serviceFactory = AIServiceFactory
  }

  // 根据提供商获取对应的AI服务
  private getAIProvider(serviceProvider: string): AIProvider {
    const providerMap: Record<string, AIProvider> = {
      '百度': AIProvider.BAIDU,
      '阿里云': AIProvider.ALI,
      '讯飞': AIProvider.XUNFEI,
      '腾讯': AIProvider.TENCENT,
      '智谱AI': AIProvider.ZHIPU
    }
    return providerMap[serviceProvider] || AIProvider.BAIDU
  }

  // 生成调研指导方案 (新增方法)
  async generateResearchGuide(ideaData: {
    title: string
    description: string
    category: string
  }): Promise<any> {
    const results: Record<string, any> = {}

    // 按依赖顺序执行各阶段
    for (const stage of RESEARCH_GUIDE_WORKFLOW) {
      console.log(`执行调研指导阶段: ${stage.stage}`)

      try {
        // 准备提示词，注入前期结果
        const enrichedPrompt = this.enrichPrompt(stage.prompt, {
          ideaTitle: ideaData.title,
          ideaDescription: ideaData.description,
          category: ideaData.category,
          ideaAnalysis: results['基本盘分析师']?.content || '',
          basicMarket: results['基本盘分析师']?.content || '',
          keyAssumptions: this.extractKeyAssumptions(results),
          researchGoals: this.generateResearchGoals(ideaData),
          marketValidation: results['调研方法专家']?.content || '',
          ...results
        })

        // 调用对应AI服务
        const provider = this.getAIProvider(stage.aiService.provider)
        const service = this.serviceFactory.getService(provider)
        const response: AIResponse = await service.chat(enrichedPrompt, {
          temperature: 0.7,
          maxTokens: 2048
        })
        const result = response.content

        // 后处理结果
        results[stage.stage] = await this.postProcessResearchResult(result, stage.outputFormat)

        // 进度回调
        this.onProgress?.(stage.stage, results[stage.stage])

      } catch (error) {
        console.error(`调研指导阶段 ${stage.stage} 执行失败:`, error)
        // 实现容错机制
        results[stage.stage] = await this.handleStageError(stage, error)
      }
    }

    return this.generateResearchGuideReport(results, ideaData)
  }

  // 从结果中提取关键假设
  private extractKeyAssumptions(results: Record<string, any>): string {
    const basicAnalysis = results['基本盘分析师']
    if (basicAnalysis?.keyInsights) {
      return basicAnalysis.keyInsights.join('; ')
    }
    return '待验证的核心假设'
  }

  // 生成调研目标
  private generateResearchGoals(ideaData: { title: string; description: string; category: string }): string {
    return `验证${ideaData.title}在${ideaData.category}领域的市场需求和商业可行性`
  }


  // 调研结果后处理
  private async postProcessResearchResult(result: string, format: string): Promise<any> {
    switch (format) {
      case 'research_guide':
        return this.parseResearchGuide(result)

      case 'research_methods':
        return this.parseResearchMethods(result)

      case 'data_sources':
        return this.parseDataSources(result)

      case 'mvp_guide':
        return this.parseMVPGuide(result)

      case 'business_model_guide':
        return this.parseBusinessModelGuide(result)

      default:
        return { content: result, type: format }
    }
  }

  // 解析基本盘分析结果
  private parseResearchGuide(result: string): any {
    return {
      content: result,
      type: 'research_guide',
      targetCircle: this.extractSection(result, '目标圈子'),
      needType: this.extractSection(result, '需求硬度'),
      keyInsights: this.extractListItems(result, '关键洞察'),
      actionItems: this.extractListItems(result, '下一步行动')
    }
  }

  // 解析调研方法结果
  private parseResearchMethods(result: string): any {
    return {
      content: result,
      type: 'research_methods',
      week1: this.extractSection(result, '第1周'),
      week2: this.extractSection(result, '第2周'),
      week3: this.extractSection(result, '第3周'),
      week4: this.extractSection(result, '第4周'),
      methods: this.extractListItems(result, '调研方法')
    }
  }

  // 解析数据源结果
  private parseDataSources(result: string): any {
    return {
      content: result,
      type: 'data_sources',
      freeSources: this.extractListItems(result, '免费数据源'),
      paidSources: this.extractListItems(result, '付费数据源'),
      tips: this.extractListItems(result, '获取技巧')
    }
  }

  // 解析MVP验证结果
  private parseMVPGuide(result: string): any {
    return {
      content: result,
      type: 'mvp_guide',
      coreFeatures: this.extractListItems(result, '核心功能'),
      validationMethods: this.extractListItems(result, '验证方法'),
      metrics: this.extractListItems(result, '验证指标'),
      timeline: this.extractSection(result, '执行计划')
    }
  }

  // 解析商业模式结果
  private parseBusinessModelGuide(result: string): any {
    return {
      content: result,
      type: 'business_model_guide',
      revenueModels: this.extractListItems(result, '盈利模式'),
      pricingStrategies: this.extractListItems(result, '定价策略'),
      experiments: this.extractListItems(result, '验证实验'),
      risks: this.extractListItems(result, '风险因素')
    }
  }

  // 提取文本段落
  private extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`${sectionName}[：:]([\\s\\S]*?)(?=\\n\\n|\\n#|$)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : ''
  }

  // 提取列表项
  private extractListItems(text: string, listName: string): string[] {
    const section = this.extractSection(text, listName)
    if (!section) {return []}

    const items = section.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))
      .map(line => line.replace(/^[-•\d\.\s]+/, '').trim())
      .filter(line => line.length > 0)

    return items
  }

  // 生成调研指导最终报告
  private generateResearchGuideReport(results: Record<string, any>, ideaData: any): any {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0',
        type: 'research_guide',
        aiExperts: RESEARCH_GUIDE_WORKFLOW.map(stage => ({
          name: stage.stage,
          provider: stage.aiService.provider,
          role: this.getExpertRole(stage.stage)
        })),
        ideaInfo: {
          title: ideaData.title,
          description: ideaData.description,
          category: ideaData.category
        }
      },

      // 基本盘分析结果
      basicAnalysis: {
        targetCircle: results['基本盘分析师']?.targetCircle || '待确定',
        needType: results['基本盘分析师']?.needType || '待评估',
        confidence: '高',
        keyInsights: results['基本盘分析师']?.keyInsights || [
          '从身边的相关圈子开始验证',
          '专注于硬需求验证',
          '利用个人优势和资源'
        ]
      },

      // 4周行动计划
      actionPlan: {
        week1: results['调研方法专家']?.week1?.split('\n').filter(Boolean) || [
          '访谈10个目标用户，了解痛点',
          '收集用户现有解决方案',
          '询问付费意愿和价格敏感度'
        ],
        week2: results['调研方法专家']?.week2?.split('\n').filter(Boolean) || [
          '深度调研3-5个直接竞品',
          '分析竞品用户评价和抱怨',
          '识别市场空白和机会'
        ],
        week3: results['调研方法专家']?.week3?.split('\n').filter(Boolean) || [
          '设计并制作MVP原型',
          '用真实项目测试效果',
          '收集用户反馈和改进建议'
        ],
        week4: results['调研方法专家']?.week4?.split('\n').filter(Boolean) || [
          '测试定价策略和商业模式',
          '计算获客成本和用户价值',
          '准备下一轮验证或融资'
        ]
      },

      // 数据源指南
      dataSources: [
        {
          type: '免费',
          name: '行业协会报告',
          description: '获取行业统计数据和趋势报告',
          cost: '免费'
        },
        {
          type: '免费',
          name: '政府统计数据',
          description: '国家统计局和相关部委数据',
          cost: '免费'
        },
        {
          type: '付费',
          name: '专业研究报告',
          description: '艾瑞、易观等机构的深度报告',
          cost: '1000-5000元/份'
        }
      ],

      // 调研方法指导
      researchMethods: [
        {
          method: '用户访谈',
          target: '10个不同背景的目标用户',
          questions: [
            '你现在如何解决这个问题？',
            '最头疼的地方是什么？',
            '愿意为解决方案付多少钱？',
            '你觉得理想的解决方案是什么样的？'
          ],
          timeline: '第1周完成',
          cost: '200元（请朋友喝咖啡）'
        },
        {
          method: '竞品分析',
          targets: ['直接竞品A', '直接竞品B', '间接替代方案'],
          focus: '价格、功能、用户反馈、市场定位',
          timeline: '第2周完成',
          cost: '300元（购买竞品试用）'
        },
        {
          method: 'MVP验证',
          approach: '制作最简可行产品原型',
          testUsers: '20个目标用户',
          timeline: '第3周完成',
          cost: '1000元（开发工具和云服务）'
        }
      ],

      // 商业模式指导
      businessModel: {
        revenueModels: results['商业模式导师']?.revenueModels || [
          '免费版 + 付费高级功能',
          '按使用量/次数收费',
          '订阅制月费/年费',
          '企业级定制服务'
        ],
        pricingStrategy: '免费试用 → 基础版99元/月 → 高级版299元/月',
        experiments: [
          '测试不同价格点的用户接受度',
          'A/B测试免费功能的边界',
          '验证企业客户的付费意愿'
        ]
      },

      // 详细调研内容
      stages: results,

      // 可下载的指导文档
      deliverables: {
        researchPlan: '4周调研行动计划.pdf',
        interviewGuide: '用户访谈指导手册.pdf',
        competitorAnalysis: '竞品分析模板.xlsx',
        mvpGuide: 'MVP验证方法指南.pdf',
        businessModelCanvas: '商业模式画布模板.pdf'
      },

      // 总结和下一步
      summary: {
        confidence: '高',
        recommendation: '建议立即开始第1周的用户访谈，验证核心假设',
        estimatedCost: '1500元',
        timeToValidation: '4周',
        successCriteria: [
          '80%的用户认为这是重要问题',
          '60%的用户愿意付费使用',
          'MVP测试获得正面反馈',
          '找到可行的商业模式'
        ]
      }
    }
  }

  // 获取专家角色描述
  private getExpertRole(stageName: string): string {
    const roles: Record<string, string> = {
      '基本盘分析师': '从身边开始，帮你找到最容易验证的圈子和用户',
      '调研方法专家': '教你怎么调研，提供具体的调研方法和操作步骤',
      '数据源指南': '告诉你去哪找数据，推荐最佳的免费和付费数据源',
      'MVP验证专家': '教你快速验证，低成本快速验证核心假设',
      '商业模式导师': '指导赚钱方法，探索可行的盈利模式和定价策略'
    }
    return roles[stageName] || '专业指导'
  }

  // 提示词注入
  private enrichPrompt(template: string, data: Record<string, any>): string {
    let enriched = template
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{${key}}`
      enriched = enriched.replace(new RegExp(placeholder, 'g'), String(value))
    }
    return enriched
  }



  // 阶段错误处理
  private async handleStageError(stage: ResearchGuideStage, error: any): Promise<any> {
    console.error(`阶段 ${stage.stage} 出现错误:`, error)

    // 尝试使用备用AI服务
    try {
      const fallbackService = await this.serviceFactory.getBalancedService()
      const response = await fallbackService.chat(
        `请根据以下创意提供${stage.stage}的建议：\n\n${stage.prompt}`,
        { temperature: 0.7, maxTokens: 1000 }
      )

      return {
        content: response.content,
        type: 'fallback',
        error: error.message
      }
    } catch (fallbackError) {
      return {
        content: `${stage.stage}阶段暂时无法完成，请稍后重试。`,
        type: 'error',
        error: error.message
      }
    }
  }

  // 进度回调
  public onProgress?: (stage: string, result: any) => void
}