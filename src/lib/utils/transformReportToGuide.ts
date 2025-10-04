import type { ResearchReport } from '@prisma/client'

export interface ExecutionPlanPhase {
  name: string
  timeline: string
  focus: string
  keyOutcomes: string[]
  metrics: string[]
}

export interface ExecutionPlanSprint {
  name: string
  focus: string
  objectives: string[]
  feedbackHooks: string[]
}

export interface ExecutionPlanFeedback {
  cadence: string[]
  channels: string[]
  decisionGates: string[]
  tooling: string[]
}

export interface ExecutionPlan {
  mission: string
  summary: string
  phases: ExecutionPlanPhase[]
  weeklySprints: ExecutionPlanSprint[]
  feedbackLoop: ExecutionPlanFeedback
  dailyRoutines: string[]
  reviewFramework: {
    weekly: string[]
    monthly: string[]
    dataWatch: string[]
  }
}

export interface LandingCoachGuide {
  aiInsights?: {
    overallAssessment: {
      score: number
      level: string
      summary: string
      keyStrengths: string[]
      criticalChallenges: string[]
    }
    sustainabilityAnalysis: {
      longTermViability: string
      persistenceFactors: string[]
      riskMitigation: string[]
    }
    stageAlerts: Array<{
      stage: string
      timeline: string
      criticalMilestones: string[]
      warningSignals: string[]
    }>
  }
  currentSituation: {
    title: string
    summary: string
    keyInsights: string[]
    marketReality: {
      marketSize: string
      competition: string
      opportunities: string[]
      challenges: string[]
    }
    userNeeds: {
      targetUsers: string
      painPoints: string[]
      solutions: string[]
    }
    actionItems: string[]
  }
  mvpDefinition: {
    title: string
    productConcept: {
      coreFeatures: string[]
      uniqueValue: string
      minimumScope: string
    }
    developmentPlan: {
      phases: Array<{
        name: string
        duration: string
        deliverables: string[]
        resources: string[]
      }>
      techStack: string[]
      estimatedCost: string
    }
    validationStrategy: {
      hypotheses: string[]
      experiments: string[]
      successMetrics: string[]
      timeline: string
    }
    actionItems: string[]
  }
  businessExecution: {
    title: string
    businessModel: {
      revenueStreams: string[]
      costStructure: string[]
      pricingStrategy: string
      scalability: string
    }
    launchStrategy: {
      phases: Array<{
        name: string
        timeline: string
        goals: string[]
        tactics: string[]
      }>
      marketingChannels: string[]
      budgetAllocation: string[]
    }
    operationalPlan: {
      teamStructure: string[]
      processes: string[]
      infrastructure: string[]
      riskManagement: string[]
    }
    actionItems: string[]
  }
  executionPlan?: ExecutionPlan
  metadata: {
    ideaTitle: string
    reportId?: string
    generatedAt: string
    estimatedReadTime: number
    implementationTimeframe: string
    confidenceLevel: number
    source?: string
    winningBid?: number
    winner?: string
  }
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const toText = (value: unknown, fallback: string): string => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : fallback
  }
  if (value === null || value === undefined) {
    return fallback
  }
  return String(value)
}

const toList = (value: unknown, fallback: string[] = []): string[] => {
  if (!value && value !== 0) {
    return [...fallback]
  }

  if (Array.isArray(value)) {
    return value
      .map(item => toText(item, ''))
      .filter(item => item.length > 0)
  }

  const text = toText(value, '')
  return text ? [text] : [...fallback]
}

const mergeLists = (base: string[], addition: string[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of [...base, ...addition]) {
    const value = toText(item, '')
    if (!value) continue
    if (seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }
  return result
}
const defaultExecutionPlan: ExecutionPlan = {
  mission: '在90天内完成验证。',
  summary:
    '三个聚焦阶段保持学习循环快速、决策基于证据、执行稳定。',
  phases: [
    {
      name: '阶段1 - 市场洞察与定位',
      timeline: '第1-30天',
      focus: '访谈目标用户，分析竞争对手，明确价值主张。',
      keyOutcomes: [
        '完成15+次结构化客户访谈',
        '绘制竞争格局图及差异化要点',
        '起草定位和价值主张声明'
      ],
      metrics: [
        '人物画像清晰度 >= 80%',
        '前三大痛点得到60%+访谈者确认'
      ]
    },
    {
      name: '阶段2 - MVP构建与验证',
      timeline: '第31-60天',
      focus: '将洞察转化为聚焦的MVP并验证核心假设。',
      keyOutcomes: [
        '高保真原型和优先级待办事项',
        'MVP v1.0交付试点用户',
        '收集30+条可执行的使用反馈'
      ],
      metrics: [
        '关键功能完成度 >= 80%',
        '激活或任务成功率 >= 60%'
      ]
    },
    {
      name: '阶段3 - 市场推广与运营',
      timeline: '第61-90天',
      focus: '证明商业吸引力，记录可重复的运营流程，准备规模化杠杆。',
      keyOutcomes: [
        '签约标杆客户或试点续约',
        '验证收入或留存模型',
        '记录运营和支持手册'
      ],
      metrics: [
        '试点留存率 >= 50%',
        '定义销售/营销漏斗转化基准'
      ]
    }
  ],
  weeklySprints: [
    {
      name: '冲刺1-2 - 洞察训练营',
      focus: '收集真实用户证据，框定机会领域。',
      objectives: [
        '锁定目标人物画像和待完成任务',
        '通过轻量级调查量化主要问题',
        '对比竞争对手承诺与差距'
      ],
      feedbackHooks: ['访谈总结', '问题优先级研讨会', '竞品拆解笔记']
    },
    {
      name: '冲刺3-4 - 原型与信号',
      focus: '快速原型化关键流程并验证可取性。',
      objectives: [
        '为主要流程构建交互原型',
        '与5-7位用户进行走廊/可用性测试',
        '追踪定性情感和摩擦点'
      ],
      feedbackHooks: ['原型测试会议', '可用性记分卡', '设计评审回放']
    },
    {
      name: '冲刺5-6 - MVP发布',
      focus: '交付精益MVP并通过紧密循环衡量采用情况。',
      objectives: [
        '向试点小组发布MVP',
        '部署分析和反馈工具',
        '每周审查留存率和转化率'
      ],
      feedbackHooks: ['产品分析仪表板', '试点检查电话', '留存曲线快照']
    },
    {
      name: '冲刺7-9 - 增长引擎',
      focus: '证明获客经济性并稳定运营。',
      objectives: [
        '至少测试两个可扩展的获客渠道',
        '定义定价和打包实验',
        '记录入职和支持标准操作流程'
      ],
      feedbackHooks: ['渠道实验日志', '定价学习报告', '支持工单审查']
    }
  ],
  feedbackLoop: {
    cadence: ['每周发现回放', '双周增长站立会', '月度战略审查'],
    channels: ['用户访谈', '产品分析', '收入仪表板', '支持脉冲'],
    decisionGates: ['问题-解决方案匹配验证', 'MVP健康留存', '可扩展获客识别'],
    tooling: ['Notion OS', 'Linear', 'Amplitude 或 Looker', 'Miro 协作白板']
  },
  dailyRoutines: [
    '早晨15分钟KPI审查和阻碍同步',
    '每日用户信号分类（反馈、工单、分析异常）',
    '产品或市场推广实验的限时专注工作',
    '结束一天学习日志记录决策和未决问题'
  ],
  reviewFramework: {
    weekly: [
      '以结果为重点的团队审查（进展与停滞）',
      '客户信号汇报和下一假设选择',
      '风险登记册更新及责任人/行动'
    ],
    monthly: [
      '北极星指标轨迹与目标对比',
      '资源和预算健康检查',
      '战略赌注审查和路线图调整'
    ],
    dataWatch: [
      '激活、留存和推荐漏斗趋势',
      '获客成本与LTV指标',
      '客户努力分数和支持负荷'
    ]
  }
}

export const BASE_LANDING_COACH_TEMPLATE: LandingCoachGuide = {
  aiInsights: {
    overallAssessment: {
      score: 8,
      level: '有前景',
      summary: '这个想法与明确的服务不足群体产生共鸣，并显示出早期可行性迹象。',
      keyStrengths: [
        '明确的客户痛点，量化紧迫性',
        '创始团队洞察力和领域深度',
        '产品愿景与可衡量的业务成果一致'
      ],
      criticalChallenges: [
        '支付意愿的证明仍然有限',
        '规模化的运营准备尚未测试',
        '团队能力必须支持并行实验'
      ]
    },
    sustainabilityAnalysis: {
      longTermViability: '如果优先考虑留存循环并保持成本纪律，则实现平衡增长路径。',
      persistenceFactors: [
        '与客户的密切接触保持洞察新鲜',
        '路线图强调习惯养成的价值主张',
        '早期采用者社区愿意共创和倡导'
      ],
      riskMitigation: [
        '安排季度路线图和财务审查',
        '为关键供应商创建应急计划',
        '记录可重复的流程以避免单点故障'
      ]
    },
    stageAlerts: [
      {
        stage: '发现完善',
        timeline: '第1-4周',
        criticalMilestones: [
          '验证前三大客户痛点',
          '以证据记录人物画像和待完成任务',
          '通过访谈测试差异化价值主张'
        ],
        warningSignals: [
          '访谈显示碎片化的低紧迫性痛点',
          '竞争对手已经通过可靠的采用解决核心需求'
        ]
      },
      {
        stage: 'MVP与试点',
        timeline: '第5-8周',
        criticalMilestones: [
          '试点群体入职并积极使用MVP',
          '为激活和留存信号部署检测',
          '建立每周节奏的定性反馈循环'
        ],
        warningSignals: [
          '试点使用率降至每周活跃40%以下',
          '从用户会话中没有识别出明确的"啊哈"时刻'
        ]
      },
      {
        stage: '增长与运营',
        timeline: '第9-12周',
        criticalMilestones: [
          '具有正单位经济性的可重复获客渠道',
          '记录并测试支持和入职手册',
          '通过付费客户验证定价实验'
        ],
        warningSignals: [
          '获客成本攀升而留存率没有匹配',
          '支持负载增长快于团队能力',
          '现金跑道降至六个月以下，没有延长计划'
        ]
      }
    ]
  },
  currentSituation: {
    title: '当前形势与校准',
    summary:
      '我们围绕市场背景、客户痛点和期望的90天成果对创始团队进行了校准。',
    keyInsights: [
      '市场需求集中在愿意为速度和可靠性付费的利基市场',
      '经济买家重视在一个季度内的可证明投资回报率',
      '挑战者叙事使其与传统巨头区分开来'
    ],
    marketReality: {
      marketSize: '两年内可服务可获得市场预计为2500万美元年收入。',
      competition: '传统供应商优化合规性而非敏捷性；初创公司专注于DIY工作流程。',
      opportunities: [
        '客户对冗长的入职周期和刚性合同感到沮丧',
        '相邻的自动化和分析类别提供扩展路径'
      ],
      challenges: [
        '采购周期可能超过60天',
        '高接触入职目前依赖创始人'
      ]
    },
    userNeeds: {
      targetUsers: '中型团队中负责在紧迫截止日期下执行重复任务的运营人员。',
      painPoints: [
        '手动编排造成频繁的交接延迟',
        '对绩效和问责制的可见性有限',
        '工具蔓延导致重复工作和错误'
      ],
      solutions: [
        '带有护栏的自动化工作流模板',
        '带警报的实时协作仪表板',
        '与客户SLA相关的成果跟踪'
      ]
    },
    actionItems: [
      '完善人物画像信息并传达给GTM团队',
      '从最近的访谈中构建异议处理指南',
      '举办每周客户圆桌会议以保持洞察新鲜'
    ]
  },
  mvpDefinition: {
    title: 'MVP价值主张',
    productConcept: {
      coreFeatures: [
        '带护栏的模板驱动工作流构建器',
        '突出显示负责人和障碍的协作时间线',
        '展示瓶颈和影响的分析模块'
      ],
      uniqueValue: '在不增加管理开销的情况下提供持续的执行可见性。',
      minimumScope: '专注于两个核心工作流和一个分析仪表板以供试点账户使用。'
    },
    developmentPlan: {
      phases: [
        {
          name: '阶段A - 原型',
          duration: '2周',
          deliverables: ['可点击原型', '可用性测试笔记'],
          resources: ['产品设计', '工程主管']
        },
        {
          name: '阶段B - MVP构建',
          duration: '4周',
          deliverables: ['MVP v1.0', '检测和日志记录', '试点入职工具包'],
          resources: ['核心工程小组', 'QA', '客户成功主管']
        },
        {
          name: '阶段C - 试点迭代',
          duration: '3周',
          deliverables: ['留存改进', '支持手册v1', '定价实验资产'],
          resources: ['工程', '客户成功', '增长PMM']
        }
      ],
      techStack: ['Next.js', 'Prisma/PostgreSQL', 'Trigger.dev 用于自动化', 'Segment + Amplitude'],
      estimatedCost: '约45,000美元，包括人力成本和工具订阅。'
    },
    validationStrategy: {
      hypotheses: [
        '如果设置时间少于15分钟，运营人员将采用引导式工作流',
        '实时可见性可将障碍解决时间缩短30%',
        '经济买家在60天内批准有ROI证据的预算'
      ],
      experiments: [
        '与试点群体进行A/B入职流程测试',
        '平台采用前后的解决时间跟踪',
        '与经济买家进行定价和打包访谈'
      ],
      successMetrics: [
        '7天内激活率 >= 70%',
        '每周活跃运营人员比率 >= 60%',
        '第8周净推荐值 >= 30'
      ],
      timeline: '到第8周结束时验证或修改假设。'
    },
    actionItems: [
      '根据影响与努力相对于假设优先处理待办事项',
      '在构建完成前与客户确认试点成功标准',
      '设置分析仪表板和定性反馈标签'
    ]
  },
  businessExecution: {
    title: '商业化与运营计划',
    businessModel: {
      revenueStreams: ['基于工作流量的订阅层级', '企业层级的实施服务'],
      costStructure: ['核心产品小组', '客户成功团队', '云基础设施和工具'],
      pricingStrategy: '基于使用量的基础价格，扩展定价与自动化工作流相关。',
      scalability: '模块化架构和手册使区域团队无需自定义重建即可运作。'
    },
    launchStrategy: {
      phases: [
        {
          name: '发布第1波',
          timeline: '第1-4周',
          goals: ['获得三个设计合作伙伴', '发布思想领导力资产'],
          tactics: ['创始人主导的外展', '行业圆桌会议', '与集成商联合营销']
        },
        {
          name: '发布第2波',
          timeline: '第5-8周',
          goals: ['激活推荐计划', '举办现场产品研讨会'],
          tactics: ['客户推荐激励', '合作伙伴网络研讨会', '定向付费实验']
        },
        {
          name: '发布第3波',
          timeline: '第9-12周',
          goals: ['扩大入站管道', '过渡到可重复的销售动作'],
          tactics: ['内容和SEO引擎', 'SDR赋能工具包', '生命周期培育序列']
        }
      ],
      marketingChannels: ['创始人主导的外展', '合作伙伴生态系统', '内容和社区'],
      budgetAllocation: ['40% 需求生成', '35% 客户成功赋能', '25% 产品主导增长实验']
    },
    operationalPlan: {
      teamStructure: ['核心小组：PM、技术主管、三名工程师、设计师', '客户成功团队（CSM + 支持）'],
      processes: ['每周增长/产品委员会', '事故响应和事后审查仪式', '季度路线图 + 财务同步'],
      infrastructure: ['可观察性堆栈', 'CRM和成功工具', '工作流自动化平台'],
      riskManagement: ['带负责人的风险登记册', '资金和消耗跟踪器', '供应商冗余计划']
    },
    actionItems: [
      '一旦试点转化达到目标，定义成功团队的招聘计划',
      '记录带QA门的入职检查清单',
      '为产品、增长和成功团队创建共享记分卡'
    ]
  },
  executionPlan: defaultExecutionPlan,
  metadata: {
    ideaTitle: '新市场想法',
    generatedAt: new Date().toISOString(),
    estimatedReadTime: 12,
    implementationTimeframe: '90天',
    confidenceLevel: 70
  }
}
const pickImplementationTimeframe = (report: any): string => {
  const raw = toText(
    report?.implementationTimeframe ??
      report?.plan?.timeframe ??
      report?.timeline ??
      '',
    ''
  )
  if (raw) return raw
  const duration = Number(report?.executionPlan?.duration ?? report?.plan?.duration ?? 0)
  if (!Number.isNaN(duration) && duration > 0) {
    return `${duration} days`
  }
  return BASE_LANDING_COACH_TEMPLATE.metadata.implementationTimeframe
}

const calculateConfidenceLevel = (report: any): number => {
  let score = 40
  if (report?.basicAnalysis) {
    score += 15
    if (report.basicAnalysis.marketAnalysis) score += 10
    if (report.basicAnalysis.userAnalysis) score += 10
  }
  if (report?.mvpGuidance) {
    score += 10
    if (report.mvpGuidance.developmentPlan) score += 5
  }
  if (report?.businessModel) {
    score += 10
    if (report.businessModel.revenueModel || report.businessModel.launchPlan) score += 5
  }
  if (report?.executionPlan) score += 10
  if (report?.status === 'COMPLETED') score += 5
  const progress = Number(report?.progress ?? 0)
  if (!Number.isNaN(progress)) {
    score += Math.min(progress / 5, 10)
  }
  return Math.max(25, Math.min(95, Math.round(score)))
}

const normaliseExecutionPlan = (plan: any): ExecutionPlan => {
  if (!plan) return clone(defaultExecutionPlan)
  const base = clone(defaultExecutionPlan)
  return {
    mission: toText(plan.mission, base.mission),
    summary: toText(plan.summary, base.summary),
    phases: Array.isArray(plan.phases) && plan.phases.length
      ? plan.phases.map((phase: any, index: number) => ({
          name: toText(phase.name, base.phases[index % base.phases.length].name),
          timeline: toText(phase.timeline, base.phases[index % base.phases.length].timeline),
          focus: toText(phase.focus, base.phases[index % base.phases.length].focus),
          keyOutcomes: mergeLists(base.phases[index % base.phases.length].keyOutcomes, toList(phase.keyOutcomes)),
          metrics: mergeLists(base.phases[index % base.phases.length].metrics, toList(phase.metrics))
        }))
      : base.phases,
    weeklySprints: Array.isArray(plan.weeklySprints) && plan.weeklySprints.length
      ? plan.weeklySprints.map((sprint: any, index: number) => ({
          name: toText(sprint.name, base.weeklySprints[index % base.weeklySprints.length].name),
          focus: toText(sprint.focus, base.weeklySprints[index % base.weeklySprints.length].focus),
          objectives: mergeLists(base.weeklySprints[index % base.weeklySprints.length].objectives, toList(sprint.objectives)),
          feedbackHooks: mergeLists(base.weeklySprints[index % base.weeklySprints.length].feedbackHooks, toList(sprint.feedbackHooks))
        }))
      : base.weeklySprints,
    feedbackLoop: {
      cadence: mergeLists(base.feedbackLoop.cadence, toList(plan.feedbackLoop?.cadence)),
      channels: mergeLists(base.feedbackLoop.channels, toList(plan.feedbackLoop?.channels)),
      decisionGates: mergeLists(base.feedbackLoop.decisionGates, toList(plan.feedbackLoop?.decisionGates)),
      tooling: mergeLists(base.feedbackLoop.tooling, toList(plan.feedbackLoop?.tooling))
    },
    dailyRoutines: mergeLists(base.dailyRoutines, toList(plan.dailyRoutines)),
    reviewFramework: {
      weekly: mergeLists(base.reviewFramework.weekly, toList(plan.reviewFramework?.weekly)),
      monthly: mergeLists(base.reviewFramework.monthly, toList(plan.reviewFramework?.monthly)),
      dataWatch: mergeLists(base.reviewFramework.dataWatch, toList(plan.reviewFramework?.dataWatch))
    }
  }
}
export function transformReportToGuide(report: Partial<ResearchReport> & Record<string, any>): LandingCoachGuide {
  const guide = clone(BASE_LANDING_COACH_TEMPLATE)

  guide.metadata.ideaTitle = toText(
    report?.idea?.title ?? report?.ideaTitle ?? report?.title,
    guide.metadata.ideaTitle
  )
  guide.metadata.reportId = toText(report?.id ?? report?.reportId ?? '', '') || undefined
  guide.metadata.generatedAt = new Date(report?.updatedAt ?? report?.createdAt ?? Date.now()).toISOString()
  guide.metadata.estimatedReadTime = Number(report?.estimatedReadTime ?? guide.metadata.estimatedReadTime)
  guide.metadata.implementationTimeframe = pickImplementationTimeframe(report)
  guide.metadata.confidenceLevel = calculateConfidenceLevel(report)
  if (report?.source) guide.metadata.source = String(report.source)
  if (typeof report?.winningBid === 'number') guide.metadata.winningBid = report.winningBid
  if (report?.winner) guide.metadata.winner = String(report.winner)

  const analysis = report?.basicAnalysis ?? {}
  guide.currentSituation.summary = toText(
    analysis.summary ?? analysis.marketOverview,
    guide.currentSituation.summary
  )
  guide.currentSituation.keyInsights = mergeLists(
    guide.currentSituation.keyInsights,
    toList(analysis.keyInsights)
  )
  const market = analysis.marketAnalysis ?? {}
  guide.currentSituation.marketReality = {
    marketSize: toText(market.size, guide.currentSituation.marketReality.marketSize),
    competition: toText(market.competition, guide.currentSituation.marketReality.competition),
    opportunities: mergeLists(guide.currentSituation.marketReality.opportunities, toList(market.opportunities)),
    challenges: mergeLists(guide.currentSituation.marketReality.challenges, toList(market.challenges))
  }
  const user = analysis.userAnalysis ?? {}
  guide.currentSituation.userNeeds = {
    targetUsers: toText(user.targetUsers, guide.currentSituation.userNeeds.targetUsers),
    painPoints: mergeLists(guide.currentSituation.userNeeds.painPoints, toList(user.painPoints)),
    solutions: mergeLists(guide.currentSituation.userNeeds.solutions, toList(user.solutions))
  }
  guide.currentSituation.actionItems = mergeLists(
    guide.currentSituation.actionItems,
    toList(analysis.nextSteps ?? analysis.recommendations)
  )

  const mvp = report?.mvpGuidance ?? {}
  const productDefinition = mvp.productDefinition ?? {}
  guide.mvpDefinition.productConcept = {
    coreFeatures: mergeLists(guide.mvpDefinition.productConcept.coreFeatures, toList(productDefinition.coreFeatures)),
    uniqueValue: toText(productDefinition.uniqueValue, guide.mvpDefinition.productConcept.uniqueValue),
    minimumScope: toText(productDefinition.scope, guide.mvpDefinition.productConcept.minimumScope)
  }
  const developmentPlan = mvp.developmentPlan ?? {}
  guide.mvpDefinition.developmentPlan = {
    phases: Array.isArray(developmentPlan.phases) && developmentPlan.phases.length
      ? developmentPlan.phases.map((phase: any, index: number) => ({
          name: toText(phase.name, guide.mvpDefinition.developmentPlan.phases[index % guide.mvpDefinition.developmentPlan.phases.length].name),
          duration: toText(phase.duration, guide.mvpDefinition.developmentPlan.phases[index % guide.mvpDefinition.developmentPlan.phases.length].duration),
          deliverables: mergeLists(
            guide.mvpDefinition.developmentPlan.phases[index % guide.mvpDefinition.developmentPlan.phases.length].deliverables,
            toList(phase.deliverables)
          ),
          resources: mergeLists(
            guide.mvpDefinition.developmentPlan.phases[index % guide.mvpDefinition.developmentPlan.phases.length].resources,
            toList(phase.resources)
          )
        }))
      : guide.mvpDefinition.developmentPlan.phases,
    techStack: mergeLists(guide.mvpDefinition.developmentPlan.techStack, toList(developmentPlan.techStack)),
    estimatedCost: toText(
      developmentPlan.budget ?? developmentPlan.estimatedCost,
      guide.mvpDefinition.developmentPlan.estimatedCost
    )
  }
  const validationStrategy = mvp.validationStrategy ?? {}
  guide.mvpDefinition.validationStrategy = {
    hypotheses: mergeLists(guide.mvpDefinition.validationStrategy.hypotheses, toList(validationStrategy.hypotheses)),
    experiments: mergeLists(guide.mvpDefinition.validationStrategy.experiments, toList(validationStrategy.experiments)),
    successMetrics: mergeLists(guide.mvpDefinition.validationStrategy.successMetrics, toList(validationStrategy.metrics ?? validationStrategy.successMetrics)),
    timeline: toText(validationStrategy.timeline, guide.mvpDefinition.validationStrategy.timeline)
  }
  guide.mvpDefinition.actionItems = mergeLists(
    guide.mvpDefinition.actionItems,
    toList(mvp.nextSteps)
  )

  const business = report?.businessModel ?? {}
  const revenueModel = business.revenueModel ?? {}
  guide.businessExecution.businessModel = {
    revenueStreams: mergeLists(guide.businessExecution.businessModel.revenueStreams, toList(revenueModel.streams ?? business.revenueStreams)),
    costStructure: mergeLists(guide.businessExecution.businessModel.costStructure, toList(business.costStructure)),
    pricingStrategy: toText(business.pricingStrategy, guide.businessExecution.businessModel.pricingStrategy),
    scalability: toText(business.scalability, guide.businessExecution.businessModel.scalability)
  }
  const launchPlan = business.launchPlan ?? {}
  guide.businessExecution.launchStrategy = {
    phases: Array.isArray(launchPlan.phases) && launchPlan.phases.length
      ? launchPlan.phases.map((phase: any, index: number) => ({
          name: toText(phase.name, guide.businessExecution.launchStrategy.phases[index % guide.businessExecution.launchStrategy.phases.length].name),
          timeline: toText(phase.timeline, guide.businessExecution.launchStrategy.phases[index % guide.businessExecution.launchStrategy.phases.length].timeline),
          goals: mergeLists(guide.businessExecution.launchStrategy.phases[index % guide.businessExecution.launchStrategy.phases.length].goals, toList(phase.goals)),
          tactics: mergeLists(guide.businessExecution.launchStrategy.phases[index % guide.businessExecution.launchStrategy.phases.length].tactics, toList(phase.tactics))
        }))
      : guide.businessExecution.launchStrategy.phases,
    marketingChannels: mergeLists(guide.businessExecution.launchStrategy.marketingChannels, toList(launchPlan.channels ?? business.marketingChannels)),
    budgetAllocation: mergeLists(guide.businessExecution.launchStrategy.budgetAllocation, toList(launchPlan.budget ?? business.budgetAllocation))
  }
  const operations = business.operations ?? {}
  guide.businessExecution.operationalPlan = {
    teamStructure: mergeLists(guide.businessExecution.operationalPlan.teamStructure, toList(operations.team ?? operations.teamStructure)),
    processes: mergeLists(guide.businessExecution.operationalPlan.processes, toList(operations.processes)),
    infrastructure: mergeLists(guide.businessExecution.operationalPlan.infrastructure, toList(operations.infrastructure)),
    riskManagement: mergeLists(guide.businessExecution.operationalPlan.riskManagement, toList(operations.risks ?? operations.riskManagement))
  }
  guide.businessExecution.actionItems = mergeLists(
    guide.businessExecution.actionItems,
    toList(business.nextSteps)
  )

  if (report?.aiInsights) {
    const insights = report.aiInsights
    guide.aiInsights = {
      overallAssessment: {
        score: Number(insights.overallAssessment?.score ?? guide.aiInsights?.overallAssessment.score ?? 7),
        level: toText(insights.overallAssessment?.level, guide.aiInsights?.overallAssessment.level ?? 'Promising'),
        summary: toText(
          insights.overallAssessment?.summary,
          guide.aiInsights?.overallAssessment.summary ?? 'The concept shows healthy market pull with manageable execution risk.'
        ),
        keyStrengths: mergeLists(
          guide.aiInsights?.overallAssessment.keyStrengths ?? [],
          toList(insights.overallAssessment?.keyStrengths)
        ),
        criticalChallenges: mergeLists(
          guide.aiInsights?.overallAssessment.criticalChallenges ?? [],
          toList(insights.overallAssessment?.criticalChallenges)
        )
      },
      sustainabilityAnalysis: {
        longTermViability: toText(
          insights.sustainabilityAnalysis?.longTermViability,
          guide.aiInsights?.sustainabilityAnalysis.longTermViability ?? 'Balanced growth is achievable with disciplined execution.'
        ),
        persistenceFactors: mergeLists(
          guide.aiInsights?.sustainabilityAnalysis.persistenceFactors ?? [],
          toList(insights.sustainabilityAnalysis?.persistenceFactors)
        ),
        riskMitigation: mergeLists(
          guide.aiInsights?.sustainabilityAnalysis.riskMitigation ?? [],
          toList(insights.sustainabilityAnalysis?.riskMitigation)
        )
      },
      stageAlerts: Array.isArray(insights.stageAlerts) && insights.stageAlerts.length
        ? insights.stageAlerts
        : guide.aiInsights?.stageAlerts ?? BASE_LANDING_COACH_TEMPLATE.aiInsights!.stageAlerts
    }
  }

  guide.executionPlan = normaliseExecutionPlan(report?.executionPlan)

  return guide
}
export function generateGuideMarkdown(guide: LandingCoachGuide): string {
  const lines: string[] = []
  const formatPercent = (value: number) => {
    const percent = value > 1 ? value : value * 100
    return `${Math.round(percent)}%`
  }

  lines.push(`# ${guide.metadata.ideaTitle} - 落地教练指南`)
  lines.push(`生成时间: ${new Date(guide.metadata.generatedAt).toLocaleString()}`)
  lines.push(`执行周期: ${guide.metadata.implementationTimeframe}`)
  lines.push(`可信度: ${formatPercent(guide.metadata.confidenceLevel)}`)
  if (guide.metadata.winner) {
    lines.push(`获胜专家: ${guide.metadata.winner}`)
  }
  if (typeof guide.metadata.winningBid === 'number') {
    lines.push(`获胜出价: ${guide.metadata.winningBid}`)
  }
  lines.push('')

  lines.push('## 1. 当前形势与校准')
  lines.push(`**概述:** ${guide.currentSituation.summary}`)
  if (guide.currentSituation.keyInsights.length) {
    lines.push('**关键洞察:**')
    guide.currentSituation.keyInsights.forEach(item => lines.push(`- ${item}`))
  }
  lines.push('**市场现状:**')
  lines.push(`- 市场规模: ${guide.currentSituation.marketReality.marketSize}`)
  lines.push(`- 竞争格局: ${guide.currentSituation.marketReality.competition}`)
  if (guide.currentSituation.marketReality.opportunities.length) {
    lines.push('  机遇:')
  }
  guide.currentSituation.marketReality.opportunities.forEach(item => lines.push(`  - ${item}`))
  if (guide.currentSituation.marketReality.challenges.length) {
    lines.push('  挑战:')
  }
  guide.currentSituation.marketReality.challenges.forEach(item => lines.push(`  - ${item}`))
  lines.push(`**目标用户:** ${guide.currentSituation.userNeeds.targetUsers}`)
  if (guide.currentSituation.userNeeds.painPoints.length) {
    lines.push('  痛点:')
    guide.currentSituation.userNeeds.painPoints.forEach(item => lines.push(`  - ${item}`))
  }
  if (guide.currentSituation.userNeeds.solutions.length) {
    lines.push('  建议方案:')
    guide.currentSituation.userNeeds.solutions.forEach(item => lines.push(`  - ${item}`))
  }
  if (guide.currentSituation.actionItems.length) {
    lines.push('**立即行动:**')
    guide.currentSituation.actionItems.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`))
  }
  lines.push('')

  lines.push('## 2. MVP定义与验证')
  lines.push(`**产品重点:** ${guide.mvpDefinition.productConcept.uniqueValue}`)
  if (guide.mvpDefinition.productConcept.coreFeatures.length) {
    lines.push('**核心功能:**')
    guide.mvpDefinition.productConcept.coreFeatures.forEach(item => lines.push(`- ${item}`))
  }
  lines.push(`**最小范围:** ${guide.mvpDefinition.productConcept.minimumScope}`)
  if (guide.mvpDefinition.developmentPlan.phases.length) {
    lines.push('**开发计划:**')
    guide.mvpDefinition.developmentPlan.phases.forEach(phase => {
      lines.push(`- ${phase.name} (${phase.duration})`)
      lines.push(`  交付成果: ${phase.deliverables.join(', ')}`)
      if (phase.resources.length) {
        lines.push(`  资源: ${phase.resources.join(', ')}`)
      }
    })
  }
  lines.push(`**技术栈:** ${guide.mvpDefinition.developmentPlan.techStack.join(', ')}`)
  lines.push(`**预估成本:** ${guide.mvpDefinition.developmentPlan.estimatedCost}`)
  if (guide.mvpDefinition.validationStrategy.hypotheses.length) {
    lines.push('**验证假设:**')
    guide.mvpDefinition.validationStrategy.hypotheses.forEach(item => lines.push(`- ${item}`))
  }
  if (guide.mvpDefinition.validationStrategy.experiments.length) {
    lines.push('**实验方案:**')
    guide.mvpDefinition.validationStrategy.experiments.forEach(item => lines.push(`- ${item}`))
  }
  if (guide.mvpDefinition.validationStrategy.successMetrics.length) {
    lines.push('**成功指标:**')
    guide.mvpDefinition.validationStrategy.successMetrics.forEach(item => lines.push(`- ${item}`))
  }
  lines.push(`**验证时间线:** ${guide.mvpDefinition.validationStrategy.timeline}`)
  if (guide.mvpDefinition.actionItems.length) {
    lines.push('**近期行动:**')
    guide.mvpDefinition.actionItems.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`))
  }
  lines.push('')

  lines.push('## 3. 商业模式与运营')
  lines.push('**商业模式:**')
  lines.push(`- 收入来源: ${guide.businessExecution.businessModel.revenueStreams.join(', ')}`)
  lines.push(`- 成本结构: ${guide.businessExecution.businessModel.costStructure.join(', ')}`)
  lines.push(`- 定价策略: ${guide.businessExecution.businessModel.pricingStrategy}`)
  lines.push(`- 可扩展性: ${guide.businessExecution.businessModel.scalability}`)
  if (guide.businessExecution.launchStrategy.phases.length) {
    lines.push('**发布计划:**')
    guide.businessExecution.launchStrategy.phases.forEach(phase => {
      lines.push(`- ${phase.name} (${phase.timeline})`)
      lines.push(`  目标: ${phase.goals.join(', ')}`)
      if (phase.tactics.length) {
        lines.push(`  策略: ${phase.tactics.join(', ')}`)
      }
    })
  }
  lines.push(`- 营销渠道: ${guide.businessExecution.launchStrategy.marketingChannels.join(', ')}`)
  lines.push(`- 预算分配: ${guide.businessExecution.launchStrategy.budgetAllocation.join(', ')}`)
  lines.push('**运营:**')
  lines.push(`- 团队结构: ${guide.businessExecution.operationalPlan.teamStructure.join(', ')}`)
  lines.push(`- 流程: ${guide.businessExecution.operationalPlan.processes.join(', ')}`)
  lines.push(`- 基础设施: ${guide.businessExecution.operationalPlan.infrastructure.join(', ')}`)
  lines.push(`- 风险管理: ${guide.businessExecution.operationalPlan.riskManagement.join(', ')}`)
  if (guide.businessExecution.actionItems.length) {
    lines.push('**运营优先事项:**')
    guide.businessExecution.actionItems.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`))
  }
  lines.push('')

  if (guide.executionPlan) {
    lines.push('## 4. 90天执行计划')
    lines.push(`**使命:** ${guide.executionPlan.mission}`)
    lines.push(`**总结:** ${guide.executionPlan.summary}`)
    lines.push('### 阶段')
    guide.executionPlan.phases.forEach(phase => {
      lines.push(`- ${phase.name} (${phase.timeline})`)
      lines.push(`  重点: ${phase.focus}`)
      lines.push(`  关键成果: ${phase.keyOutcomes.join(', ')}`)
      lines.push(`  指标: ${phase.metrics.join(', ')}`)
    })
    lines.push('### 每周冲刺')
    guide.executionPlan.weeklySprints.forEach(sprint => {
      lines.push(`- ${sprint.name}`)
      lines.push(`  重点: ${sprint.focus}`)
      lines.push(`  目标: ${sprint.objectives.join(', ')}`)
      lines.push(`  反馈钩子: ${sprint.feedbackHooks.join(', ')}`)
    })
    lines.push('### 反馈循环')
    lines.push(`- 节奏: ${guide.executionPlan.feedbackLoop.cadence.join(', ')}`)
    lines.push(`- 渠道: ${guide.executionPlan.feedbackLoop.channels.join(', ')}`)
    lines.push(`- 决策关卡: ${guide.executionPlan.feedbackLoop.decisionGates.join(', ')}`)
    lines.push(`- 工具: ${guide.executionPlan.feedbackLoop.tooling.join(', ')}`)
    lines.push('### 日常例行')
    guide.executionPlan.dailyRoutines.forEach(item => lines.push(`- ${item}`))
    lines.push('### 审查与指标')
    lines.push(`- 每周审查: ${guide.executionPlan.reviewFramework.weekly.join(', ')}`)
    lines.push(`- 月度校准: ${guide.executionPlan.reviewFramework.monthly.join(', ')}`)
    lines.push(`- 关注指标: ${guide.executionPlan.reviewFramework.dataWatch.join(', ')}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(
    '注意：由落地教练AI生成。在做出重大投资之前，请根据您的背景进行调整并通过客户反馈和数据进行验证。'
  )

  return lines.join('\n')
}
export function validateReportForGuide(report: any): {
  isValid: boolean
  missingFields: string[]
  recommendations: string[]
} {
  const missingFields: string[] = []
  const recommendations: string[] = []

  if (!report?.basicAnalysis) {
    missingFields.push('市场分析')
    recommendations.push('添加市场规模、竞争洞察和明确的问题陈述。')
  }

  if (!report?.mvpGuidance) {
    missingFields.push('MVP定义和验证计划')
    recommendations.push('描述MVP范围、验证实验和成功指标。')
  }

  if (!report?.businessModel) {
    missingFields.push('商业模式和运营')
    recommendations.push('详细说明收入模型、成本结构和市场推广方法。')
  }

  if (missingFields.length === 0 && !report?.executionPlan) {
    recommendations.push('添加90天执行计划，以便团队能够将洞察付诸实践。')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    recommendations
  }
}

export default transformReportToGuide
