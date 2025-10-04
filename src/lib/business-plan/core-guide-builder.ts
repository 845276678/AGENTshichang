import type { BusinessPlanGuide, BiddingSnapshot, BusinessPlanMetadata } from "./types"

const BASE_GUIDE_TEMPLATE: BusinessPlanGuide = {
  currentSituation: {
    title: "先聊聊大环境和机会",
    summary: "收集专家的洞察，在当今市场中找准这个创意的位置。",
    keyInsights: [
      "市场机会扫描中，看看有哪些空间",
      "用户需求还在验证，得和真实用户聊聊",
      "竞争差异化要确认，找到你的独特价值"
    ],
    marketReality: {
      marketSize: "市场规模评估中，会给你一个靠谱的数字",
      competition: "竞争情况审查中，看看对手都在做什么",
      opportunities: ["机会点梳理中，帮你找到切入点"],
      challenges: ["可能遇到的坑也在记录中"]
    },
    userNeeds: {
      targetUsers: "目标用户画像起草中，帮你找到第一批种子用户",
      painPoints: ["痛点整理中，看看用户到底需要什么"],
      solutions: ["解决方案框架中，想想怎么帮他们"]
    },
    actionItems: [
      "把竞价时专家们说的那些点整理成一张价值主张图",
      "确定3-5个最优先要搞定的用户群体",
      "设计一套结构化的用户研究计划，别瞎猜"
    ]
  },
  mvpDefinition: {
    title: "第一步:做个能用的MVP",
    productConcept: {
      coreFeatures: ["先把最核心的功能列出来，别贪多"],
      uniqueValue: "说清楚你跟别人有啥不一样，为什么用户要选你",
      minimumScope: "MVP阶段专注1-2个高影响力的场景就够了"
    },
    developmentPlan: {
      phases: [
        {
          name: "第一步:验证技术能不能行",
          duration: "2周",
          deliverables: ["做个原型演示", "性能测试笔记", "风险清单"],
          resources: ["技术负责人", "产品经理", "测试"]
        },
        {
          name: "第二步:做出能用的产品",
          duration: "3周",
          deliverables: ["可用的MVP", "数据追踪", "基础支持工具"],
          resources: ["前端", "后端", "设计"]
        },
        {
          name: "第三步:找人来试试",
          duration: "3周",
          deliverables: ["种子用户群", "反馈报告", "数据分析"],
          resources: ["运营", "分析", "客服"]
        }
      ],
      techStack: ["技术栈定义中，选成熟的就行"],
      estimatedCost: "预计90天消耗：¥50,000 – ¥80,000（主要是人工成本）"
    },
    validationStrategy: {
      hypotheses: ["关键假设待验证，这些假设决定成败"],
      experiments: ["设计访谈和实验计划，用数据说话"],
      successMetrics: ["定义成功指标，不能光凭感觉"],
      timeline: "90天内分三步走：技术验证 → 用户验证 → 商业验证"
    },
    actionItems: [
      "确定MVP范围和"必须有的"功能，其他的先放放",
      "把协作和反馈工具搭起来",
      "定好每周迭代节奏，谁负责什么"
    ]
  },
  businessExecution: {
    title: "怎么赚钱",
    businessModel: {
      revenueStreams: ["收入来源要想清楚，别指望一个渠道"],
      costStructure: ["成本结构要算好，知道钱花在哪"],
      pricingStrategy: "定价策略得和早期用户一起试试看",
      scalability: "规模化怎么做，提前想好"
    },
    launchStrategy: {
      phases: [
        {
          name: "预热期",
          timeline: "第1个月",
          goals: ["搭品牌", "找种子用户"],
          tactics: ["内容营销", "专家背书"]
        },
        {
          name: "试点期",
          timeline: "第2个月",
          goals: ["小范围验证", "收集案例"],
          tactics: ["用户共创", "精细化服务"]
        },
        {
          name: "商业验证",
          timeline: "第3个月",
          goals: ["验证付费", "建立反馈循环"],
          tactics: ["限时优惠", "推荐返利"]
        }
      ],
      marketingChannels: ["渠道组合设计中，多试几个"],
      budgetAllocation: ["预算分配计划中，控制好节奏"]
    },
    operationalPlan: {
      teamStructure: ["团队怎么搭，找对的人"],
      processes: ["流程怎么定，保持敏捷"],
      infrastructure: ["工具和平台怎么选，够用就行"],
      riskManagement: ["风险怎么管，提前准备预案"]
    },
    actionItems: [
      "列出几个可能的赚钱方式",
      "写个运营手册，让团队知道怎么干",
      "把关键指标的监控搭起来"
    ]
  },
  executionPlan: undefined,
  metadata: {
    ideaTitle: "你的创意",
    reportId: undefined,
    generatedAt: new Date().toISOString(),
    estimatedReadTime: 15,
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
  guide.metadata.estimatedReadTime = 15
  guide.metadata.winningBid = highestBid
  guide.metadata.winner = winnerName

  // 更口语化的概述
  const supporterText = supporters > 0
    ? `有 ${supporters} 位专家明确表示看好，这说明需求是真实存在的`
    : `虽然还需要进一步验证，但专家们都看到了机会`

  guide.currentSituation.summary = `你的"${snapshot.ideaTitle}"在竞价环节拿到了 ¥${highestBid} 的最高出价。${supporterText}。接下来咱们把这些专家的洞察转化成实实在在的行动计划。`

  guide.currentSituation.keyInsights = [
    `竞价讨论中已经帮你找到了差异化的切入点`,
    supporterText,
    `现在最关键的是：别光想，赶紧找真实用户聊聊`
  ]

  guide.mvpDefinition.productConcept.uniqueValue = `用最小的成本快速验证"${snapshot.ideaTitle}"这个想法到底行不行。`
  guide.mvpDefinition.productConcept.minimumScope = '专注1-2个最核心的场景，把反馈机制嵌进去，每天都能看到用户的真实反应。'
  guide.mvpDefinition.developmentPlan.techStack = ['Next.js / React', 'Node.js 或 FastAPI', '向量数据库 + AI API', 'Vercel/Railway 部署']

  guide.mvpDefinition.validationStrategy.hypotheses = [
    '用户真的愿意为这个结果付钱（不是嘴上说说）',
    'AI的输出质量达到了可以放心给用户用的程度',
    '用户用完会主动推荐给朋友或者继续用'
  ]

  guide.mvpDefinition.validationStrategy.experiments = [
    '找30个潜在用户，给他们看原型，记录他们的真实反应',
    '小范围上线，用数据看用户实际怎么用',
    '直接问价格：你觉得这个值多少钱？'
  ]

  guide.mvpDefinition.validationStrategy.successMetrics = [
    '至少30个真实用户试用过',
    '核心功能完成率 ≥ 70%',
    '至少10%的用户表示愿意付费或推荐'
  ]

  guide.mvpDefinition.validationStrategy.timeline = '90天内走完三步：先验证技术行不行 → 再验证用户要不要 → 最后验证能不能赚钱'

  guide.mvpDefinition.actionItems = [
    '把功能清单砍到只剩"没有就完全不行"的那几个',
    '工具别乱买，GitHub + Notion + 一个分析工具就够了',
    '定好每周节奏，谁负责啥，周五下午一起看数据'
  ]

  guide.businessExecution.businessModel.revenueStreams = [
    '订阅制（月付或年付）+ 按量收费',
    '企业定制服务（利润高但费时间）',
    '数据报告（后期可以考虑）'
  ]

  guide.businessExecution.businessModel.costStructure = [
    '开发成本（人力为主）',
    'AI API调用费用（按实际用量算）',
    '服务器和工具订阅（控制在每月1000以内）',
    '营销推广（早期靠口碑，省钱）'
  ]

  guide.businessExecution.businessModel.pricingStrategy = '先用免费版吸引用户，积累口碑；等产品稳定了再推付费版。定价参考同类产品，但可以稍微低一点抢市场。'

  guide.businessExecution.businessModel.scalability = '代码要写得模块化，别到时候改一个功能牵一发动全身。文档和流程也要记录好，不能只有你一个人知道怎么搞。'

  guide.businessExecution.launchStrategy.marketingChannels = [
    '写文章分享经验（小红书/知乎/公众号）',
    '加入目标用户活跃的社群',
    '找行业KOL合作（互换资源）',
    '老用户推荐奖励（最有效的获客方式）'
  ]

  guide.businessExecution.launchStrategy.budgetAllocation = [
    '产品开发 40%（质量第一）',
    '营销推广 30%（前期靠内容）',
    '用户服务 20%（口碑很重要）',
    '预留机动 10%（总会有意外）'
  ]

  guide.businessExecution.operationalPlan.teamStructure = [
    '产品+技术小分队（2-3人就够）',
    '用户研究和运营（1人兼职也行）',
    '商务拓展（有资源就上，没有就先放放）'
  ]

  guide.businessExecution.operationalPlan.processes = [
    '每周一早上对齐本周目标',
    '每天花半小时看用户反馈',
    '每两周开个复盘会，聊聊数据和调整方向',
    '每月看一次大盘，确认还在正轨上'
  ]

  guide.businessExecution.operationalPlan.infrastructure = [
    '云服务器（Vercel免费版先用起来）',
    '数据看板（Google Analytics + 自建简单后台）',
    '客服工具（微信群 + 飞书多维表格）',
    '代码管理（GitHub私有仓库）'
  ]

  guide.businessExecution.operationalPlan.riskManagement = [
    '每个阶段设置明确的「继续/放弃」判断标准',
    '关键供应商（AI API）要有备选方案',
    '用户数据一定要合规，别因为这个翻车',
    '准备好应对突发情况的话术和方案'
  ]

  guide.businessExecution.actionItems = [
    '列出3种可能的赚钱方式，算算每种的可行性',
    '写一份运营手册，让新人能快速上手',
    '搭一个简单的数据监控，每天看核心指标'
  ]

  const metadata: BusinessPlanMetadata = {
    source: snapshot.source,
    winningBid: highestBid,
    winner: winnerName,
    supportedAgents: supporters
  }

  return { guide, metadata }
}
