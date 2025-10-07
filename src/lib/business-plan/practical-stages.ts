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
      '短中长期时间安排',
      '资源投入预估',
      '目标管理工具与节奏建议'
    ],
    dependencies: [],
    description: '帮助创业者搞清楚“为什么做”“要做到什么”，建立结构化的目标体系，并对齐四周冲刺的重点。'
  },
  {
    id: 'basic_market_analysis',
    name: '基本盘需求与市场分析',
    aiProvider: 'ALI',
    estimatedTime: '12-15分钟',
    deliverables: [
      '基本盘圈层识别',
      '需求硬度评分报告',
      '个人优势匹配分析',
      'MVP 核心功能定义',
      '启动成本与投入预算'
    ],
    dependencies: ['goal_analysis'],
    description: '基于“基本盘理论”，从身边圈层开始验证创意，评估需求硬度与个人优势匹配度，为四周冲刺奠定基础。'
  },
  {
    id: 'research_method_guide',
    name: '4周调研方法指南',
    aiProvider: 'ZHIPU',
    estimatedTime: '10-12分钟',
    deliverables: [
      '逐周调研行动计划',
      '用户访谈问题清单',
      '竞品深度调研手册',
      '数据收集与验证工具',
      '快速实验设计模板'
    ],
    dependencies: ['basic_market_analysis'],
    description: '设计系统化的四周调研计划，涵盖用户验证、竞品分析、数据收集与市场验证，确保每周都有可交付成果。'
  },
  {
    id: 'implementation_plan',
    name: '4周实施计划与正反馈机制',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '15-20分钟',
    deliverables: [
      '4周详细执行排期',
      '每周里程碑与产出',
      '正反馈机制与节奏板',
      '风险预警与备选预案',
      '团队协作与沟通指引'
    ],
    dependencies: ['research_method_guide'],
    description: '制定落地的四周冲刺计划，设置每周节奏与正反馈机制，保障团队持续推进并能及时纠偏。'
  },
  {
    id: 'business_model_profitability',
    name: '商业模式与盈利路径',
    aiProvider: 'ALI',
    estimatedTime: '12-15分钟',
    deliverables: [
      '商业模式画布',
      '收入结构与定价建议',
      '成本与资源配置方案',
      '竞争优势与差异化分析',
      '盈利路径与关键指标'
    ],
    dependencies: ['basic_market_analysis', 'implementation_plan'],
    description: '设计可持续的商业模式，明确收入结构、成本控制、差异化优势与盈利指标，为后续扩张打底。'
  }
]

// 阶段间的数据流转映射
export const STAGE_DATA_FLOW = {
  goal_analysis: {
    outputs: ['userGoals', 'successMetrics', 'timelineTargets'],
    nextStages: ['basic_market_analysis']
  },
  basic_market_analysis: {
    inputs: ['userGoals', 'successMetrics'],
    outputs: ['targetCircle', 'needHardness', 'personalAdvantages', 'mvpDefinition'],
    nextStages: ['research_method_guide', 'business_model_profitability']
  },
  research_method_guide: {
    inputs: ['targetCircle', 'mvpDefinition'],
    outputs: ['researchPlan', 'validationMethods', 'dataCollectionTools'],
    nextStages: ['implementation_plan']
  },
  implementation_plan: {
    inputs: ['researchPlan', 'mvpDefinition'],
    outputs: ['detailedSchedule', 'feedbackMechanisms', 'riskManagement'],
    nextStages: ['business_model_profitability']
  },
  business_model_profitability: {
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
      question: '你希望在接下来的4周内达成什么结果？',
      hint: '例如：完成 MVP 原型、验证 3 个核心假设、拿到首批付费承诺。',
      required: true
    },
    {
      id: 'success_metrics',
      question: '你如何判断这轮冲刺是否成功？',
      hint: '例如：用户满意度 80%、获取 20 位深度反馈、转化 3 个付费用户。',
      required: true
    },
    {
      id: 'medium_term_goals',
      question: '你在 3-6 个月内的目标是什么？',
      hint: '例如：产品正式上线、月度营收稳定、拓展关键渠道。',
      required: false
    },
    {
      id: 'long_term_vision',
      question: '你对这个项目的长期愿景（1-3 年）是什么？',
      hint: '例如：成为细分领域的领军品牌、实现持续盈利、规划退出路径。',
      required: false
    }
  ]
}

// 基本盘分析配置
export const BASIC_MARKET_CONFIG = {
  circleTypes: [
    '同事朋友圈', '同学校友圈', '行业社群圈',
    '兴趣爱好圈', '本地社区圈', '线上社群圈'
  ],
  needHardnessLevels: [
    { level: 'hard', description: '硬需求：必须解决的问题', score: 8-10 },
    { level: 'medium', description: '中等需求：重要但可延迟', score: 5-7 },
    { level: 'soft', description: '软需求：可有可无', score: 1-4 }
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
      activities: ['用户访谈', '需求确认', '核心假设梳理'],
      deliverables: ['用户反馈报告', '需求验证结论', '假设修正建议']
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
      activities: ['市场数据收集', 'MVP 原型测试', '小规模实验'],
      deliverables: ['市场数据汇总', 'MVP 测试结果', '用户行为分析']
    },
    {
      week: 4,
      focus: '结果整理与策略调优',
      activities: ['调研结果分析', '策略调整建议', '下一阶段计划'],
      deliverables: ['综合调研报告', '策略调整方案', '下一阶段行动清单']
    }
  ]
}

// 实施计划配置
export const IMPLEMENTATION_CONFIG = {
  weeklyMilestones: [
    {
      week: 1,
      theme: '方向确认与节奏搭建',
      keyMilestones: ['完成目标与假设清单', '锁定目标用户画像', '搭建执行看板'],
      successCriteria: ['完成 ≥8 场访谈', '形成 5 项核心假设', '节奏板开始运行']
    },
    {
      week: 2,
      theme: 'MVP 原型与技术验证',
      keyMilestones: ['核心流程跑通', '关键技术问题定位并解决', '完成演示脚本与埋点'],
      successCriteria: ['原型稳定通过内部测试', '高优先级技术问题解决率 ≥80%', '核心数据正常采集']
    },
    {
      week: 3,
      theme: '用户验证与快速迭代',
      keyMilestones: ['组织目标用户体验', '收集并分类反馈', '完成至少一次迭代'],
      successCriteria: ['累计 ≥15 位用户体验', '高频反馈形成行动项', '完成 1-2 次产品更新']
    },
    {
      week: 4,
      theme: '收入信号与扩展规划',
      keyMilestones: ['设计收费实验', '获取首批付费或预订', '制定下一阶段路线图'],
      successCriteria: ['获得 ≥3 个付费承诺', '形成转化漏斗数据', '明确后续 4-8 周重点']
    }
  ],
  feedbackMechanisms: [
    '每日站会更新进展与阻塞',
    '每周五冲刺复盘',
    '专家顾问定期把关',
    '用户社群即时反馈',
    '里程碑庆祝与信心补给',
    '风控检查与备选预案'
  ]
}

// 商业模式配置
export const BUSINESS_MODEL_CONFIG = {
  canvasElements: [
    'valuePropositions', 'customerSegments', 'channels', 'customerRelationships',
    'keyResources', 'keyActivities', 'keyPartnerships', 'costStructure', 'revenueStreams'
  ],
  revenueModels: [
    '订阅付费', '一次性买断', '按使用量计费', '增值服务',
    'SaaS 模式', '佣金分成', '数据服务', '企业版授权'
  ],
  costCategories: [
    '人员成本', '技术成本', '运营成本', '营销成本',
    '办公成本', '合规成本', '供应链成本', '渠道成本'
  ]
}
