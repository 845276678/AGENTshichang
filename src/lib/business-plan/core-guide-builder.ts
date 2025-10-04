import type { BusinessPlanGuide, BiddingSnapshot, BusinessPlanMetadata } from "./types"

const BASE_GUIDE_TEMPLATE: BusinessPlanGuide = {
  currentSituation: {
    title: "形势与方向",
    summary: "收集专家洞察，在当今市场中定位这个概念。",
    keyInsights: [
      "市场机会扫描进行中",
      "用户需求验证待定",
      "竞争差异化有待确认"
    ],
    marketReality: {
      marketSize: "市场规模评估进行中",
      competition: "竞争强度审查进行中",
      opportunities: ["机会映射进行中"],
      challenges: ["风险记录中"]
    },
    userNeeds: {
      targetUsers: "目标人物画像起草中",
      painPoints: ["痛点综合待定"],
      solutions: ["解决方案框架进行中"]
    },
    actionItems: [
      "将竞价洞察整合到价值图中",
      "定义高优先级用户群体",
      "设计结构化研究与验证待办事项"
    ]
  },
  mvpDefinition: {
    title: "MVP定义与验证计划",
    productConcept: {
      coreFeatures: ["识别提供核心价值的功能"],
      uniqueValue: "为早期采用者明确差异化价值",
      minimumScope: "专注于一到两个高影响力流程"
    },
    developmentPlan: {
      phases: [
        {
          name: "技术验证",
          duration: "2周",
          deliverables: ["原型演示", "性能笔记", "风险登记册"],
          resources: ["首席工程师", "产品", "QA"]
        },
        {
          name: "MVP构建",
          duration: "3周",
          deliverables: ["可用MVP", "检测工具", "支持工具"],
          resources: ["前端", "后端", "设计"]
        },
        {
          name: "试点验证",
          duration: "3周",
          deliverables: ["种子用户群体", "反馈报告", "指标仪表板"],
          resources: ["运营", "分析", "支持"]
        }
      ],
      techStack: ["技术栈定义进行中"],
      estimatedCost: "预计90天消耗：¥50,000 – ¥80,000"
    },
    validationStrategy: {
      hypotheses: ["关键问题/解决方案假设待验证"],
      experiments: ["设计访谈与实验待办事项"],
      successMetrics: ["定义领先/滞后指标"],
      timeline: "在90天内分三个连续阶段进行验证"
    },
    actionItems: [
      "确定MVP范围和优先级",
      "建立协作与反馈工具",
      "锁定每周迭代节奏"
    ]
  },
  businessExecution: {
    title: "商业执行与运营",
    businessModel: {
      revenueStreams: ["收入流压力测试"],
      costStructure: ["成本模型进行中"],
      pricingStrategy: "与早期采用者进行定价实验",
      scalability: "评估可扩展性杠杆"
    },
    launchStrategy: {
      phases: [
        {
          name: "预热",
          timeline: "第1个月",
          goals: ["建立品牌资产", "激活早期社区"],
          tactics: ["内容营销", "专家网络研讨会"]
        },
        {
          name: "试点",
          timeline: "第2个月",
          goals: ["与种子用户验证", "收集案例研究"],
          tactics: ["用户共创", "白手套式入职"]
        },
        {
          name: "商业验证",
          timeline: "第3个月",
          goals: ["验证货币化", "正式化反馈循环"],
          tactics: ["限时优惠", "推荐激励"]
        }
      ],
      marketingChannels: ["渠道组合设计进行中"],
      budgetAllocation: ["预算分配计划待定"]
    },
    operationalPlan: {
      teamStructure: ["明确跨职能团队"],
      processes: ["定义运营节奏与治理"],
      infrastructure: ["选择工具和平台栈"],
      riskManagement: ["记录缓解手册"]
    },
    actionItems: [
      "概述货币化场景",
      "设计正反馈运营手册",
      "部署监控和警报"
    ]
  },
  executionPlan: undefined,
  metadata: {
    ideaTitle: "概念",
    reportId: undefined,
    generatedAt: new Date().toISOString(),
    estimatedReadTime: 18,
    implementationTimeframe: "90天",
    confidenceLevel: 50,
    source: 'ai-bidding'
  }
}

const cloneGuide = (): BusinessPlanGuide => JSON.parse(JSON.stringify(BASE_GUIDE_TEMPLATE))

const computeConfidence = (snapshot: BiddingSnapshot): number => {
  const base = Math.min(95, Math.max(30, (snapshot.highestBid ?? 150) / 3))
  const supporters = snapshot.supportedAgents?.length ?? 0
  return Math.min(98, Math.round(base + supporters * 2))
}

export function buildCoreGuide(snapshot: BiddingSnapshot): {
  guide: BusinessPlanGuide
  metadata: BusinessPlanMetadata
} {
  const guide = cloneGuide()
  const highestBid = snapshot.highestBid ?? 0
  const supporters = snapshot.supportedAgents?.length ?? 0
  const confidence = computeConfidence(snapshot)
  const winnerName = snapshot.winnerName || 'AI专家团队'

  guide.metadata.ideaTitle = snapshot.ideaTitle
  guide.metadata.generatedAt = new Date().toISOString()
  guide.metadata.confidenceLevel = confidence
  guide.metadata.implementationTimeframe = '90天'
  guide.metadata.estimatedReadTime = 18
  guide.metadata.winningBid = highestBid
  guide.metadata.winner = winnerName

  guide.currentSituation.summary = `"${snapshot.ideaTitle}" 完成了竞价轮，最高出价为 ¥${highestBid}。将这些洞察转化为结构化研究和MVP验证。`
  guide.currentSituation.keyInsights = [
    '竞价对话揭示了差异化和差距',
    supporters > 0 ? `${supporters} 位专家支持者突显了切实的需求信号` : '专家看到了前景，但需要重点验证',
    '立即启动结构化用户研究和价值确认'
  ]

  guide.mvpDefinition.productConcept.uniqueValue = `为"${snapshot.ideaTitle}"提供最小可行的有价值体验。`
  guide.mvpDefinition.productConcept.minimumScope = '将MVP范围限制在最高影响力的流程，并嵌入反馈收集。'
  guide.mvpDefinition.developmentPlan.techStack = ['Next.js / React', 'Node.js 或 FastAPI', '向量存储 + AI服务', '监控与日志套件']
  guide.mvpDefinition.validationStrategy.hypotheses = [
    '目标用户愿意为改进的结果付费',
    'AI输出足够准确和可解释以供发布',
    '正反馈循环可以推动留存或推荐'
  ]
  guide.mvpDefinition.validationStrategy.experiments = [
    '通过实时原型演示进行结构化访谈',
    '基于行为分析的有限发布',
    '小规模支付意愿实验'
  ]
  guide.mvpDefinition.validationStrategy.successMetrics = ['≥ 30 位种子用户参与', '≥ 70% 关键流程完成', '≥ 10% 转化或承诺']
  guide.mvpDefinition.validationStrategy.timeline = '在90天内执行 技术 → 客户 → 商业 验证'
  guide.mvpDefinition.actionItems = [
    '锁定MVP范围和"必备"功能',
    '建立协作和反馈工具',
    '定义冲刺节奏、负责人和审查节奏'
  ]

  guide.businessExecution.businessModel.revenueStreams = ['订阅 + 附加服务', '企业项目/咨询', '数据驱动的洞察产品']
  guide.businessExecution.businessModel.costStructure = ['研发和模型运营', '客户成功/支持', '营销与合作伙伴']
  guide.businessExecution.businessModel.pricingStrategy = '使用分层订阅和使用附加服务；提供早期采用者激励。'
  guide.businessExecution.businessModel.scalability = '采用模块化架构和运营手册，在各垂直领域扩展。'
  guide.businessExecution.launchStrategy.marketingChannels = ['内容与思想领导力', '社区/私域流量', '行业合作伙伴', '推荐与倡导']
  guide.businessExecution.launchStrategy.budgetAllocation = ['营销 40%', '产品与技术 35%', '客户成功 15%', '应急 10%']
  guide.businessExecution.operationalPlan.teamStructure = [
    '跨职能构建小组（工程 + 产品）',
    '用户研究与增长赋能',
    '商业和合作伙伴负责人',
    '数据与可观察性分析师'
  ]
  guide.businessExecution.operationalPlan.processes = [
    '每周OKR检查和对齐',
    '结构化客户反馈分类循环',
    '检测与分析维护',
    '正反馈审查节奏'
  ]
  guide.businessExecution.operationalPlan.infrastructure = [
    '云计算与存储平台',
    '分析与仪表板栈',
    '实验/功能标志工具',
    '反馈和支持工单系统'
  ]
  guide.businessExecution.operationalPlan.riskManagement = [
    '为通过/拒绝决策定义阶段门',
    '为关键依赖项维护后备选项',
    '保持符合数据和隐私要求',
    '准备沟通和应急手册'
  ]
  guide.businessExecution.actionItems = [
    '概述货币化场景',
    '发布正反馈运营手册',
    '部署KPI监控和警报'
  ]

  const metadata: BusinessPlanMetadata = {
    source: snapshot.source,
    winningBid: highestBid,
    winner: winnerName,
    supportedAgents: supporters
  }

  return { guide, metadata }
}
