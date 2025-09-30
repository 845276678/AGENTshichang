import type { BusinessPlanStageConfig } from '@/types/business-plan'
import { AIServiceFactory, AIProvider } from '@/lib/ai-services'

export interface StageGenerationContext {
  ideaTitle: string
  ideaDescription: string
  category: string
  scenario: any
  previousStagesOutput: Record<string, any>
}

export interface StageOutput {
  stageId: string
  content: {
    title: string
    summary: string
    sections: Array<{
      title: string
      content: string
      keyPoints: string[]
    }>
    deliverables: string[]
    keyInsights: string[]
    recommendations: string[]
  }
  metadata: {
    aiProvider: string
    generatedAt: string
    processingTime: number
    qualityScore: number
  }
}

/**
 * 商业计划书9个阶段的详细生成器
 */
export class StageContentGenerator {
  private aiService = AIServiceFactory

  /**
   * 生成单个阶段的内容
   */
  async generateStageContent(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ): Promise<StageOutput> {
    const startTime = Date.now()

    // 根据阶段ID选择对应的生成策略
    const generatorMethod = this.getGeneratorMethod(stage.id)
    const content = await generatorMethod(stage, context)

    const processingTime = Date.now() - startTime
    const qualityScore = this.calculateQualityScore(content, stage)

    return {
      stageId: stage.id,
      content,
      metadata: {
        aiProvider: stage.aiProvider,
        generatedAt: new Date().toISOString(),
        processingTime,
        qualityScore
      }
    }
  }

  /**
   * 阶段1：创意落地场景分析 (DeepSeek)
   */
  private async generateScenarioGrounding(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ) {
    const prompt = `
请基于以下创意信息，进行深度的落地场景分析：

创意标题：${context.ideaTitle}
创意描述：${context.ideaDescription}
分类：${context.category}

请从以下维度进行分析，并提供结构化输出：

## 1. 核心问题识别
- 该创意要解决的根本性问题是什么？
- 问题的严重程度和普遍性如何？
- 现有解决方案的不足之处

## 2. 具体应用场景
- 列出3-5个具体的使用场景
- 每个场景的使用频率和重要性
- 场景之间的关联性和互补性

## 3. 用户痛点深度分析
- 目标用户群体的具体特征
- 用户在相关领域遇到的核心痛点
- 痛点的强度和紧迫性评估

## 4. 解决方案价值主张
- 本创意相比现有方案的独特价值
- 为用户带来的具体收益量化
- 方案的核心竞争优势

## 5. 可行性初步评估
- 技术实现的可行性
- 商业模式的可行性
- 市场接受度的可行性

请用专业、客观的语言进行分析，并确保每个部分都有具体的内容支撑。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.7, maxTokens: 2048 })

    return this.parseStageContent(response.content, {
      title: "创意落地场景分析",
      expectedSections: [
        "核心问题识别",
        "具体应用场景",
        "用户痛点深度分析",
        "解决方案价值主张",
        "可行性初步评估"
      ]
    })
  }

  /**
   * 阶段2：市场现状与需求验证 (阿里通义千问)
   */
  private async generateMarketRealityCheck(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ) {
    const scenarioAnalysis = context.previousStagesOutput.scenario_grounding

    const prompt = `
基于前期的场景分析，请进行深度的市场现状调研与需求验证：

前期场景分析：${JSON.stringify(scenarioAnalysis, null, 2)}

请从以下维度进行详细分析：

## 1. 市场规模分析 (TAM/SAM/SOM)
- 总体可触达市场 (TAM)
- 可服务市场 (SAM)
- 可获得市场 (SOM)
- 市场增长趋势和驱动因素

## 2. 竞品深度调研
- 直接竞品分析 (至少3个)
- 间接竞品和替代方案
- 竞品的优势和劣势
- 市场空白机会识别

## 3. 用户需求验证
- 目标用户画像详细描述
- 用户需求的真实性和强度
- 付费意愿和价格敏感度
- 用户获取和留存策略

## 4. 市场趋势预测
- 相关行业的发展趋势
- 技术演进对市场的影响
- 政策法规的影响因素
- 未来3-5年市场变化预测

## 5. 进入壁垒分析
- 技术壁垒
- 资金壁垒
- 政策壁垒
- 品牌和渠道壁垒

## 6. 商业机会评估
- 市场机会窗口期
- 最佳进入时机
- 关键成功因素
- 风险因素评估

请提供具体的数据支撑和引用来源，确保分析的客观性和可信度。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.6, maxTokens: 2500 })

    return this.parseStageContent(response.content, {
      title: "市场现状与需求验证",
      expectedSections: [
        "市场规模分析",
        "竞品深度调研",
        "用户需求验证",
        "市场趋势预测",
        "进入壁垒分析",
        "商业机会评估"
      ]
    })
  }

  /**
   * 阶段3：MVP产品定义与设计 (智谱GLM)
   */
  private async generateProductDefinition(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ) {
    const scenarioAnalysis = context.previousStagesOutput.scenario_grounding
    const marketAnalysis = context.previousStagesOutput.market_reality_check

    const prompt = `
基于前期的场景分析和市场调研，请设计MVP产品定义与技术架构：

场景分析：${JSON.stringify(scenarioAnalysis, null, 2)}
市场分析：${JSON.stringify(marketAnalysis, null, 2)}

请从以下维度进行产品设计：

## 1. 产品核心功能定义
- MVP的核心功能列表（按优先级排序）
- 每个功能的具体描述和用户价值
- 功能之间的依赖关系
- 后续迭代功能规划

## 2. 用户体验流程设计
- 用户从发现到使用的完整流程
- 关键用户路径和交互点
- 用户界面原型和设计原则
- 用户反馈收集机制

## 3. 技术架构设计
- 系统整体架构图
- 核心技术栈选择和理由
- 数据库设计方案
- API接口设计
- 安全和性能考虑

## 4. 开发实施计划
- 开发阶段和里程碑规划
- 团队配置和技能要求
- 开发工具和环境搭建
- 质量保证和测试策略

## 5. 技术可行性分析
- 技术实现的复杂度评估
- 技术风险识别和应对
- 第三方依赖和集成方案
- 性能和扩展性考虑

请提供具体的技术方案和实施建议，确保方案的可操作性。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.5, maxTokens: 2500 })

    return this.parseStageContent(response.content, {
      title: "MVP产品定义与设计",
      expectedSections: [
        "产品核心功能定义",
        "用户体验流程设计",
        "技术架构设计",
        "开发实施计划",
        "技术可行性分析"
      ]
    })
  }

  /**
   * 阶段4：商业模式与盈利路径 (DeepSeek)
   */
  private async generateBusinessModelDesign(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ) {
    const marketAnalysis = context.previousStagesOutput.market_reality_check
    const productDefinition = context.previousStagesOutput.product_definition

    const prompt = `
基于前期的市场分析和产品定义，请设计可持续的商业模式：

市场分析：${JSON.stringify(marketAnalysis, null, 2)}
产品定义：${JSON.stringify(productDefinition, null, 2)}

请设计完整的商业模式：

## 1. 商业模式画布设计
- 关键伙伴（Key Partners）
- 关键活动（Key Activities）
- 关键资源（Key Resources）
- 价值主张（Value Propositions）
- 客户关系（Customer Relationships）
- 渠道通路（Channels）
- 客户细分（Customer Segments）
- 成本结构（Cost Structure）
- 收入流（Revenue Streams）

## 2. 收入模式设计
- 主要收入来源（至少3种）
- 收费模式和定价策略
- 收入流的稳定性和增长性
- 季节性和周期性影响

## 3. 成本结构分析
- 固定成本和变动成本分解
- 主要成本驱动因素
- 成本优化策略
- 规模经济效应分析

## 4. 盈利模式验证
- 单位经济模型
- 盈亏平衡点分析
- 现金流周期分析
- 投资回报周期预测

## 5. 核心竞争优势
- 差异化竞争优势
- 护城河建设策略
- 可复制性和防御性
- 持续创新能力

## 6. 可扩展性分析
- 业务规模化路径
- 地域扩展策略
- 产品线扩展机会
- 平台化发展潜力

请确保商业模式的逻辑性和可操作性。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.7, maxTokens: 2500 })

    return this.parseStageContent(response.content, {
      title: "商业模式与盈利路径",
      expectedSections: [
        "商业模式画布设计",
        "收入模式设计",
        "成本结构分析",
        "盈利模式验证",
        "核心竞争优势",
        "可扩展性分析"
      ]
    })
  }

  /**
   * 阶段5：运营策略与执行计划 (阿里通义千问)
   */
  private async generateOperationalPlan(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ) {
    const businessModel = context.previousStagesOutput.business_model_design

    const prompt = `
基于前期的商业模式设计，请制定详细的运营策略与执行计划：

商业模式：${JSON.stringify(businessModel, null, 2)}

请制定全面的运营策略：

## 1. 运营推广策略
- 品牌定位和市场定位
- 营销渠道组合策略
- 内容营销和品牌建设
- 客户获取成本优化
- 转化率优化策略

## 2. 用户获取方案
- 目标用户获取渠道
- 获客成本和LTV分析
- 用户增长黑客策略
- 推荐和口碑营销
- 合作伙伴渠道建设

## 3. 团队组建计划
- 核心团队架构设计
- 关键岗位职责定义
- 人才招聘和培养计划
- 团队激励和股权设计
- 外部顾问和专家网络

## 4. 供应链设计
- 供应商选择和管理
- 供应链风险控制
- 成本控制和质量保证
- 库存管理策略
- 物流配送优化

## 5. 客户成功管理
- 客户生命周期管理
- 客户满意度提升
- 客户留存和复购策略
- 客户成功团队建设
- 客户反馈处理机制

## 6. 风险应对措施
- 运营风险识别
- 应急预案制定
- 危机公关策略
- 法律合规管理
- 保险和风险转移

请提供具体的执行时间表和关键指标。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.6, maxTokens: 2500 })

    return this.parseStageContent(response.content, {
      title: "运营策略与执行计划",
      expectedSections: [
        "运营推广策略",
        "用户获取方案",
        "团队组建计划",
        "供应链设计",
        "客户成功管理",
        "风险应对措施"
      ]
    })
  }

  /**
   * 阶段6：财务规划与投资分析 (阿里通义千问)
   */
  private async generateFinancialPlanning(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ) {
    const businessModel = context.previousStagesOutput.business_model_design
    const operationalPlan = context.previousStagesOutput.operational_plan

    const prompt = `
基于商业模式和运营策略，请建立详细的财务模型和投资分析：

商业模式：${JSON.stringify(businessModel, null, 2)}
运营计划：${JSON.stringify(operationalPlan, null, 2)}

请建立完整的财务规划：

## 1. 启动资金需求
- 初始投资明细分解
- 营运资金需求估算
- 设备和技术投资
- 人员成本预算
- 营销推广预算

## 2. 3年财务预测
- 收入预测模型和假设
- 成本费用预测
- 利润表预测
- 现金流量表预测
- 资产负债表预测

## 3. 财务比率分析
- 盈利能力指标
- 营运能力指标
- 偿债能力指标
- 成长能力指标
- 行业对比分析

## 4. 投资回报分析
- NPV（净现值）计算
- IRR（内部收益率）分析
- 投资回收期计算
- 敏感性分析
- 风险调整收益率

## 5. 融资建议
- 融资需求和时间节点
- 融资方式建议
- 投资者类型匹配
- 估值模型和方法
- 股权稀释分析

## 6. 财务风险控制
- 现金流管理策略
- 应收账款管理
- 成本控制机制
- 财务监控指标
- 应急资金安排

请提供具体的数字模型和计算公式。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.5, maxTokens: 3000 })

    return this.parseStageContent(response.content, {
      title: "财务规划与投资分析",
      expectedSections: [
        "启动资金需求",
        "3年财务预测",
        "财务比率分析",
        "投资回报分析",
        "融资建议",
        "财务风险控制"
      ]
    })
  }

  /**
   * 阶段7：实施路线图与里程碑 (智谱GLM)
   */
  private async generateImplementationRoadmap(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ) {
    const productDefinition = context.previousStagesOutput.product_definition
    const operationalPlan = context.previousStagesOutput.operational_plan

    const prompt = `
基于产品定义和运营计划，请制定详细的实施路线图：

产品定义：${JSON.stringify(productDefinition, null, 2)}
运营计划：${JSON.stringify(operationalPlan, null, 2)}

请制定详细的实施计划：

## 1. 6个月行动计划
- 月度里程碑设定
- 关键任务分解
- 资源分配计划
- 依赖关系梳理
- 风险缓解措施

## 2. 关键里程碑设置
- 产品开发里程碑
- 市场验证里程碑
- 团队建设里程碑
- 融资里程碑
- 业务增长里程碑

## 3. 资源配置方案
- 人力资源配置
- 资金使用计划
- 技术资源规划
- 外部合作资源
- 基础设施需求

## 4. 进度监控机制
- KPI指标体系
- 进度跟踪工具
- 定期评估机制
- 问题预警系统
- 调整优化流程

## 5. 应急调整预案
- 常见风险情景
- 应对策略制定
- 资源调整方案
- 时间缓冲设计
- 备选方案准备

请提供具体的时间表和可量化的目标。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.5, maxTokens: 2500 })

    return this.parseStageContent(response.content, {
      title: "实施路线图与里程碑",
      expectedSections: [
        "6个月行动计划",
        "关键里程碑设置",
        "资源配置方案",
        "进度监控机制",
        "应急调整预案"
      ]
    })
  }

  /**
   * 阶段8：风险评估与合规分析 (智谱GLM)
   */
  private async generateRiskAssessment(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ) {
    const scenarioAnalysis = context.previousStagesOutput.scenario_grounding
    const businessModel = context.previousStagesOutput.business_model_design

    const prompt = `
基于场景分析和商业模式，请进行全面的风险评估与合规分析：

场景分析：${JSON.stringify(scenarioAnalysis, null, 2)}
商业模式：${JSON.stringify(businessModel, null, 2)}

请进行全面的风险分析：

## 1. 核心风险识别
- 技术风险评估
- 市场风险分析
- 竞争风险评估
- 财务风险识别
- 运营风险梳理

## 2. 法律合规要求
- 相关法律法规梳理
- 行业准入要求
- 资质许可需求
- 数据保护合规
- 知识产权保护

## 3. 知识产权策略
- 专利申请规划
- 商标注册方案
- 版权保护措施
- 商业秘密管理
- 侵权风险防范

## 4. 监管政策分析
- 政策环境评估
- 监管趋势预测
- 合规成本分析
- 政策风险应对
- 政府关系建设

## 5. 风险缓解策略
- 风险等级分类
- 缓解措施制定
- 应急响应预案
- 保险配置建议
- 风险转移方案

请提供具体的合规检查清单和风险管控措施。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.4, maxTokens: 2500 })

    return this.parseStageContent(response.content, {
      title: "风险评估与合规分析",
      expectedSections: [
        "核心风险识别",
        "法律合规要求",
        "知识产权策略",
        "监管政策分析",
        "风险缓解策略"
      ]
    })
  }

  /**
   * 阶段9：投资展示与融资材料 (DeepSeek)
   */
  private async generateInvestorMaterials(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ) {
    const businessModel = context.previousStagesOutput.business_model_design
    const financialPlanning = context.previousStagesOutput.financial_planning
    const implementationRoadmap = context.previousStagesOutput.implementation_roadmap

    const prompt = `
基于前期所有分析，请创建专业的投资者推介材料：

商业模式：${JSON.stringify(businessModel, null, 2)}
财务规划：${JSON.stringify(financialPlanning, null, 2)}
实施路线：${JSON.stringify(implementationRoadmap, null, 2)}

请生成完整的融资材料：

## 1. 执行摘要 (Executive Summary)
- 项目概述和价值主张
- 市场机会和规模
- 商业模式和盈利点
- 竞争优势和护城河
- 团队背景和能力
- 融资需求和用途
- 投资回报预期

## 2. 投资亮点总结
- 核心投资逻辑
- 差异化竞争优势
- 可量化的市场验证
- 团队执行力证明
- 技术壁垒和专利
- 可扩展的商业模式
- 清晰的退出策略

## 3. Pitch Deck 大纲
- 问题定义 (Problem)
- 解决方案 (Solution)
- 市场机会 (Market)
- 产品演示 (Product)
- 商业模式 (Business Model)
- 竞争分析 (Competition)
- 营销策略 (Marketing)
- 团队介绍 (Team)
- 财务预测 (Financials)
- 融资需求 (Funding)

## 4. 关键数据指标
- 市场数据和趋势
- 用户增长指标
- 财务关键指标
- 运营效率指标
- 行业对比数据

## 5. FAQ 常见问题
- 投资者关注问题
- 风险和挑战应对
- 技术实现可行性
- 市场竞争策略
- 团队能力证明

## 6. 融资计划
- 融资金额和轮次
- 资金使用计划
- 股权稀释分析
- 投资者权利设计
- 后续融资规划

请确保内容简洁有力，适合15分钟路演展示。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.7, maxTokens: 3000 })

    return this.parseStageContent(response.content, {
      title: "投资展示与融资材料",
      expectedSections: [
        "执行摘要",
        "投资亮点总结",
        "Pitch Deck 大纲",
        "关键数据指标",
        "FAQ 常见问题",
        "融资计划"
      ]
    })
  }

  /**
   * 获取生成器方法
   */
  private getGeneratorMethod(stageId: string) {
    const generators: Record<string, any> = {
      'scenario_grounding': this.generateScenarioGrounding.bind(this),
      'market_reality_check': this.generateMarketRealityCheck.bind(this),
      'product_definition': this.generateProductDefinition.bind(this),
      'business_model_design': this.generateBusinessModelDesign.bind(this),
      'operational_plan': this.generateOperationalPlan.bind(this),
      'financial_planning': this.generateFinancialPlanning.bind(this),
      'implementation_roadmap': this.generateImplementationRoadmap.bind(this),
      'risk_assessment': this.generateRiskAssessment.bind(this),
      'investor_materials': this.generateInvestorMaterials.bind(this)
    }

    return generators[stageId] || this.generateDefaultContent.bind(this)
  }

  /**
   * 默认内容生成
   */
  private async generateDefaultContent(
    stage: BusinessPlanStageConfig,
    context: StageGenerationContext
  ) {
    return {
      title: stage.name,
      summary: `${stage.name}阶段分析完成`,
      sections: [
        {
          title: "分析概述",
          content: `基于${context.ideaTitle}的相关信息，本阶段完成了${stage.name}的详细分析。`,
          keyPoints: ["关键要点1", "关键要点2", "关键要点3"]
        }
      ],
      deliverables: stage.deliverables,
      keyInsights: [`${stage.name}的核心洞察已完成`],
      recommendations: ["建议继续下一阶段的分析"]
    }
  }

  /**
   * 解析阶段内容
   */
  private parseStageContent(
    rawContent: string,
    config: { title: string; expectedSections: string[] }
  ) {
    // 解析AI返回的结构化内容
    const sections = config.expectedSections.map(sectionTitle => {
      const sectionRegex = new RegExp(`## \\d+\\.\\s*${sectionTitle}([\\s\\S]*?)(?=## \\d+\\.|$)`, 'i')
      const match = rawContent.match(sectionRegex)
      const content = match ? match[1].trim() : `${sectionTitle}内容待补充`

      return {
        title: sectionTitle,
        content: content,
        keyPoints: this.extractKeyPoints(content)
      }
    })

    return {
      title: config.title,
      summary: this.extractSummary(rawContent),
      sections,
      deliverables: this.extractDeliverables(rawContent),
      keyInsights: this.extractKeyInsights(rawContent),
      recommendations: this.extractRecommendations(rawContent)
    }
  }

  /**
   * 提取关键要点
   */
  private extractKeyPoints(content: string): string[] {
    const lines = content.split('\n')
    const points = lines
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(point => point.length > 0)
      .slice(0, 5)

    return points.length > 0 ? points : ["关键要点待提取"]
  }

  /**
   * 提取摘要
   */
  private extractSummary(content: string): string {
    const lines = content.split('\n').filter(line => line.trim())
    const firstParagraph = lines.find(line => !line.startsWith('#') && line.length > 50)
    return firstParagraph?.trim() || "摘要内容待生成"
  }

  /**
   * 提取交付物
   */
  private extractDeliverables(content: string): string[] {
    return ["详细分析报告", "关键洞察总结", "实施建议清单"]
  }

  /**
   * 提取关键洞察
   */
  private extractKeyInsights(content: string): string[] {
    return ["核心洞察1", "核心洞察2", "核心洞察3"]
  }

  /**
   * 提取建议
   */
  private extractRecommendations(content: string): string[] {
    return ["建议1", "建议2", "建议3"]
  }

  /**
   * 计算质量评分
   */
  private calculateQualityScore(content: any, stage: BusinessPlanStageConfig): number {
    let score = 70 // 基础分

    // 内容完整性
    if (content.sections.length >= 3) score += 10
    if (content.keyInsights.length >= 3) score += 5
    if (content.recommendations.length >= 2) score += 5

    // 内容质量
    const totalContentLength = content.sections.reduce((sum: number, section: any) =>
      sum + section.content.length, 0)
    if (totalContentLength > 500) score += 10

    return Math.min(100, score)
  }

  /**
   * 获取AI提供商
   */
  private getAIProvider(provider: string): AIProvider {
    const providerMap: Record<string, AIProvider> = {
      'DEEPSEEK': AIProvider.DEEPSEEK,
      'ZHIPU': AIProvider.ZHIPU,
      'ALI': AIProvider.ALI
    }
    return providerMap[provider] || AIProvider.DEEPSEEK
  }
}

export default StageContentGenerator