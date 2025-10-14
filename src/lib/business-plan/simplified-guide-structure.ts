/**
 * 简化版创意实现建议 - 4模块结构设计
 *
 * 应用范围：所有创意（通过AI个性化调整内容深度和复杂度）
 * AI分工：利用现有5个AI专家的专长进行内容生成
 */

export interface SimplifiedBusinessPlan {
  // 模块1：用户需求与市场定位
  userAndMarket: {
    targetUsers: {
      primary: string // 核心用户群体
      secondary?: string // 次要用户群体
      characteristics: string[] // 用户特征
      painPoints: string[] // 用户痛点
    }
    marketAnalysis: {
      size: string // 市场规模
      trends: string[] // 市场趋势
      opportunities: string[] // 市场机会
      competitors: string[] // 主要竞争对手
    }
    applicationScenarios: {
      primary: string // 主要应用场景
      secondary: string[] // 次要应用场景
      useCases: string[] // 具体用例
    }
  }

  // 模块2：产品方案与技术实现
  productAndTech: {
    coreValue: string // 核心价值主张
    keyFeatures: string[] // 关键功能
    techStack: {
      recommended: string[] // 推荐技术栈
      alternatives: string[] // 备选方案
      reasoning: string // 选择理由
    }
    developmentPlan: {
      mvpFeatures: string[] // MVP功能
      timeline: string // 开发时间线
      milestones: Array<{
        phase: string
        duration: string
        deliverables: string[]
      }>
    }
    differentiators: string[] // 差异化优势
  }

  // 模块3：验证策略与迭代路径
  validationAndIteration: {
    hypotheses: string[] // 核心假设
    validationMethods: Array<{
      method: string // 验证方法
      timeline: string // 时间安排
      successCriteria: string // 成功标准
      resources: string[] // 所需资源
    }>
    iterationPlan: {
      cycles: Array<{
        focus: string // 迭代重点
        duration: string // 周期时长
        experiments: string[] // 实验内容
        metrics: string[] // 关键指标
      }>
      feedbackChannels: string[] // 反馈渠道
      decisionFramework: string // 决策框架
    }
    riskMitigation: Array<{
      risk: string // 风险点
      impact: 'high' | 'medium' | 'low' // 影响程度
      mitigation: string // 缓解措施
    }>
  }

  // 模块4：商业模式与资源规划
  businessAndResources: {
    businessModel: {
      revenueStreams: string[] // 收入来源
      pricingStrategy: string // 定价策略
      costStructure: string[] // 成本结构
      keyMetrics: string[] // 关键指标
    }
    teamAndResources: {
      coreTeam: Array<{
        role: string // 角色
        skills: string[] // 技能要求
        priority: 'critical' | 'important' | 'nice-to-have' // 优先级
      }>
      budget: {
        development: string // 开发预算
        marketing: string // 营销预算
        operations: string // 运营预算
        timeline: string // 预算周期
      }
      partnerships: string[] // 潜在合作伙伴
    }
    launchStrategy: {
      phases: Array<{
        name: string // 阶段名称
        goals: string[] // 阶段目标
        timeline: string // 时间安排
        tactics: string[] // 具体策略
      }>
      channels: string[] // 推广渠道
      metrics: string[] // 成功指标
    }
  }

  // 元数据
  metadata: {
    ideaTitle: string
    ideaId?: string
    maturityLevel: 'LOW' | 'GRAY_LOW' | 'MEDIUM' | 'GRAY_HIGH' | 'HIGH'
    maturityScore: number
    generatedAt: string
    confidence: number
    aiContributors: string[] // 参与生成的AI专家
    contentDepth: 'basic' | 'detailed' | 'comprehensive' // 内容深度
  }
}

/**
 * AI专家分工策略（修正版）
 */
export interface AIExpertAssignment {
  // 老王 (投资家) - 负责模块4商业模式
  wangLao: {
    modules: ['businessAndResources']
    tasks: [
      '商业模式设计',
      '投资回报分析',
      '资源配置规划',
      '盈利模式验证'
    ]
    prompt: string
  }

  // 艾克斯 (技术专家) - 负责模块2技术实现
  aix: {
    modules: ['productAndTech']
    tasks: [
      '技术架构设计',
      '开发计划制定',
      '技术选型建议',
      '技术风险评估'
    ]
    prompt: string
  }

  // 小琳 (用户情感专家) - 负责模块1用户需求
  xiaoLin: {
    modules: ['userAndMarket']
    tasks: [
      '用户情感分析',
      '用户体验设计',
      '用户痛点挖掘',
      '应用场景设计'
    ]
    prompt: string
  }

  // 阿伦 (运营推广专家) - 负责模块3验证策略和模块4推广
  aLun: {
    modules: ['validationAndIteration', 'businessAndResources']
    tasks: [
      '增长策略设计',
      '验证方法制定',
      '运营推广规划',
      '渠道建设方案'
    ]
    prompt: string
  }

  // 李博 (理论专家) - 负责整体理论指导和风险分析
  liBo: {
    modules: ['validationAndIteration', 'businessAndResources']
    tasks: [
      '理论框架构建',
      '风险识别与评估',
      '战略规划指导',
      '可持续性分析'
    ]
    prompt: string
  }
}

/**
 * 内容深度自适应策略
 */
export interface ContentAdaptationStrategy {
  // 低成熟度 (1-5分): 基础内容，重点引导
  lowMaturity: {
    contentDepth: 'basic'
    focus: ['用户验证', '需求确认', '简单MVP']
    guidance: '重点提供验证问题和行动指导'
    pages: '5-8页'
  }

  // 中等成熟度 (5-7分): 详细内容，平衡分析
  mediumMaturity: {
    contentDepth: 'detailed'
    focus: ['市场分析', '产品设计', '验证策略', '商业模式']
    guidance: '提供完整的分析和实施建议'
    pages: '12-18页'
  }

  // 高成熟度 (7-10分): 全面内容，深度分析
  highMaturity: {
    contentDepth: 'comprehensive'
    focus: ['深度市场洞察', '技术架构', '商业模式创新', '投资规划']
    guidance: '提供投资级别的详细分析和规划'
    pages: '20-30页'
  }
}

/**
 * 生成流程设计
 */
export interface SimplifiedGenerationFlow {
  steps: Array<{
    step: number
    name: string
    aiExpert: string
    input: string[]
    output: string
    estimatedTime: string
  }>
}

export const SIMPLIFIED_GENERATION_FLOW: SimplifiedGenerationFlow = {
  steps: [
    {
      step: 1,
      name: '用户情感与体验分析',
      aiExpert: '小琳',
      input: ['创意描述', '竞价讨论内容', '用户上下文'],
      output: 'userAndMarket模块内容',
      estimatedTime: '30-45秒'
    },
    {
      step: 2,
      name: '技术架构设计',
      aiExpert: '艾克斯',
      input: ['小琳的用户分析', '技术要求', '团队能力'],
      output: 'productAndTech模块内容',
      estimatedTime: '35-45秒'
    },
    {
      step: 3,
      name: '验证策略与增长规划',
      aiExpert: '阿伦',
      input: ['用户分析', '技术方案', '市场环境'],
      output: 'validationAndIteration模块内容',
      estimatedTime: '40-50秒'
    },
    {
      step: 4,
      name: '商业模式与投资分析',
      aiExpert: '老王',
      input: ['所有前置分析', '行业背景', '竞争环境'],
      output: 'businessAndResources商业模式部分',
      estimatedTime: '35-45秒'
    },
    {
      step: 5,
      name: '理论框架与风险评估',
      aiExpert: '李博',
      input: ['完整商业计划', '宏观环境', '政策环境'],
      output: '理论指导和风险分析',
      estimatedTime: '30-40秒'
    },
    {
      step: 6,
      name: '运营推广策略优化',
      aiExpert: '阿伦',
      input: ['商业模式', '风险评估', '市场分析'],
      output: 'businessAndResources推广策略部分',
      estimatedTime: '25-35秒'
    }
  ]
}