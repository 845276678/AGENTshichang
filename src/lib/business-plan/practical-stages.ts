import type { BusinessPlanStageConfig } from '@/types/business-plan'

export const PRACTICAL_BUSINESS_PLAN_STAGES: BusinessPlanStageConfig[] = [
  {
    id: 'goal_analysis',
    name: '目标分析与澄清',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '8-10分钟',
    deliverables: [
      '清晰的目标层次结构',
      '可量化的成功指标',
      '目标实现的时间节点',
      '资源投入预期',
      '目标管理工具推荐'
    ],
    dependencies: [],
    description: '帮助创业者明确"为什么做"比"做什么"更重要，建立清晰的短中长期目标体系'
  },
  {
    id: 'basic_market_analysis',
    name: '基本盘需求与市场分析',
    aiProvider: 'ALI',
    estimatedTime: '12-15分钟',
    deliverables: [
      '基本盘圈子识别',
      '需求硬度分析报告',
      '个人优势匹配评估',
      'MVP核心功能定义',
      '启动成本预算'
    ],
    dependencies: ['goal_analysis'],
    description: '基于"基本盘理论"，从身边朋友圈开始验证创意，分析需求硬度和个人优势匹配'
  },
  {
    id: 'research_method_guide',
    name: '4周调研方法指导',
    aiProvider: 'ZHIPU',
    estimatedTime: '10-12分钟',
    deliverables: [
      '4周详细调研计划',
      '用户访谈问题清单',
      '竞品调研方法指南',
      '数据收集工具推荐',
      '验证实验设计方案'
    ],
    dependencies: ['basic_market_analysis'],
    description: '设计系统化的4周调研计划，包括用户验证、竞品分析、数据收集和市场验证'
  },
  {
    id: 'implementation_plan',
    name: '3个月实施计划与正反馈机制',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '15-20分钟',
    deliverables: [
      '3个月详细实施计划',
      '每周里程碑设定',
      '正反馈机制设计',
      '风险预警与应对策略',
      '团队管理指导'
    ],
    dependencies: ['research_method_guide'],
    description: '制定详细的3个月实施计划，建立正反馈机制维持信心，确保快速迭代和持续推进'
  },
  {
    id: 'business_model_profitability',
    name: '商业模式与盈利路径',
    aiProvider: 'ALI',
    estimatedTime: '12-15分钟',
    deliverables: [
      '商业模式画布',
      '收入模式设计',
      '成本结构优化方案',
      '竞争优势分析',
      '财务可行性评估'
    ],
    dependencies: ['basic_market_analysis', 'implementation_plan'],
    description: '设计可持续的商业模式，包括收入流设计、成本控制、竞争优势构建和盈利路径规划'
  }
]

// 阶段间的数据流转映射
export const STAGE_DATA_FLOW = {
  'goal_analysis': {
    outputs: ['userGoals', 'successMetrics', 'timelineTargets'],
    nextStages: ['basic_market_analysis']
  },
  'basic_market_analysis': {
    inputs: ['userGoals', 'successMetrics'],
    outputs: ['targetCircle', 'needHardness', 'personalAdvantages', 'mvpDefinition'],
    nextStages: ['research_method_guide', 'business_model_profitability']
  },
  'research_method_guide': {
    inputs: ['targetCircle', 'mvpDefinition'],
    outputs: ['researchPlan', 'validationMethods', 'dataCollectionTools'],
    nextStages: ['implementation_plan']
  },
  'implementation_plan': {
    inputs: ['researchPlan', 'mvpDefinition'],
    outputs: ['detailedSchedule', 'feedbackMechanisms', 'riskManagement'],
    nextStages: ['business_model_profitability']
  },
  'business_model_profitability': {
    inputs: ['targetCircle', 'needHardness', 'detailedSchedule'],
    outputs: ['businessModelCanvas', 'revenueModel', 'competitiveAdvantage'],
    nextStages: []
  }
}

// 用户目标检测配置
export const GOAL_VALIDATION_CONFIG = {
  requiredFields: ['shortTerm', 'successMetrics'],
  optionalFields: ['mediumTerm', 'longTerm'],
  clarificationQuestions: [
    {
      id: 'short_term_goals',
      question: '你希望在接下来的3个月内实现什么目标？',
      hint: '例如：验证用户需求、完成MVP开发、获得100个测试用户',
      required: true
    },
    {
      id: 'success_metrics',
      question: '你如何判断这个项目是否成功？',
      hint: '例如：用户满意度达到80%、月收入达到1万元、获得天使投资',
      required: true
    },
    {
      id: 'medium_term_goals',
      question: '你的6-12个月目标是什么？',
      hint: '例如：产品正式上线、用户规模达到1万、实现盈亏平衡',
      required: false
    },
    {
      id: 'long_term_vision',
      question: '你对这个项目的长期愿景（1-3年）是什么？',
      hint: '例如：成为行业领导者、IPO上市、被大公司收购',
      required: false
    }
  ]
}

// 基本盘分析配置
export const BASIC_MARKET_CONFIG = {
  circleTypes: [
    '同事朋友圈', '同学校友圈', '行业专业圈',
    '兴趣爱好圈', '地域社区圈', '线上社群圈'
  ],
  needHardnessLevels: [
    { level: 'hard', description: '硬需求：必须解决的问题', score: 8-10 },
    { level: 'medium', description: '中等需求：重要但可延迟的问题', score: 5-7 },
    { level: 'soft', description: '软需求：可有可无的问题', score: 1-4 }
  ],
  personalAdvantageTypes: [
    '行业经验', '技术能力', '人脉资源',
    '资金优势', '时间投入', '学习能力'
  ]
}

// 调研方法配置
export const RESEARCH_METHOD_CONFIG = {
  weeklyPlans: [
    {
      week: 1,
      focus: '身边用户验证',
      activities: ['用户访谈', '需求确认', '假设验证'],
      deliverables: ['用户反馈报告', '需求验证结果', '假设修正建议']
    },
    {
      week: 2,
      focus: '竞品深度调研',
      activities: ['直接竞品分析', '间接竞品研究', '市场空白识别'],
      deliverables: ['竞品分析报告', '差异化机会清单', '定位策略建议']
    },
    {
      week: 3,
      focus: '数据收集与验证',
      activities: ['市场数据收集', 'MVP原型测试', 'A/B测试'],
      deliverables: ['市场数据报告', 'MVP测试结果', '用户行为分析']
    },
    {
      week: 4,
      focus: '结果整理与策略调整',
      activities: ['调研结果分析', '策略调整建议', '下步计划制定'],
      deliverables: ['综合调研报告', '策略调整方案', '下阶段行动计划']
    }
  ]
}

// 实施计划配置
export const IMPLEMENTATION_CONFIG = {
  monthlyMilestones: [
    {
      month: 1,
      theme: 'MVP开发与初步验证',
      keyMilestones: ['MVP功能完成', '第一批用户测试', '初步反馈收集'],
      successCriteria: ['功能可用性达到80%', '用户测试满意度>70%', '收集到20+有效反馈']
    },
    {
      month: 2,
      theme: '扩大验证与产品优化',
      keyMilestones: ['用户群体扩展', '产品功能优化', '数据跟踪建立'],
      successCriteria: ['测试用户达到100+', '产品留存率>60%', '核心指标体系建立']
    },
    {
      month: 3,
      theme: '商业模式验证与优化',
      keyMilestones: ['付费模式测试', '商业模式验证', '扩展计划制定'],
      successCriteria: ['获得第一批付费用户', '商业模式可行性确认', '下阶段发展规划完成']
    }
  ],
  feedbackMechanisms: [
    '每周小胜利庆祝', '可视化进展追踪', '定期团队分享',
    '导师指导机制', '同行交流支持', '用户反馈激励'
  ]
}

// 商业模式配置
export const BUSINESS_MODEL_CONFIG = {
  canvasElements: [
    'valuePropositions', 'customerSegments', 'channels', 'customerRelationships',
    'keyResources', 'keyActivities', 'keyPartnerships', 'costStructure', 'revenueStreams'
  ],
  revenueModels: [
    '订阅制收费', '一次性付费', '按使用量收费', '免费增值模式',
    '广告收入', '佣金分成', '数据服务', '企业定制'
  ],
  costCategories: [
    '人员成本', '技术成本', '营销成本', '运营成本',
    '办公成本', '法务成本', '合规成本', '其他费用'
  ]
}