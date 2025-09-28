// 调研报告转换为落地教练指南的工具函数
import { ResearchReport } from '@prisma/client'

// 落地教练三段结构的数据类型
export interface LandingCoachGuide {
  // AI犀利点评机制
  aiInsights?: {
    overallAssessment: {
      score: number // 0-10分
      level: string // 项目潜力等级
      summary: string // 一句话犀利点评
      keyStrengths: string[] // 核心优势
      criticalChallenges: string[] // 关键挑战
    }
    sustainabilityAnalysis: {
      longTermViability: string // 长期可行性评估
      persistenceFactors: string[] // 坚持成功的关键因素
      riskMitigation: string[] // 风险缓解建议
    }
    stageAlerts: Array<{
      stage: string // 阶段名称
      timeline: string // 时间线
      criticalMilestones: string[] // 关键里程碑
      warningSignals: string[] // 预警信号
    }>
  }

  // 第一段：现状认知与方向确认
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

  // 第二段：MVP产品定义与验证计划
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

  // 第三段：商业化落地与运营策略
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

  // 元数据
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

// 默认的落地教练模板
const DEFAULT_COACH_TEMPLATE: LandingCoachGuide = {
  currentSituation: {
    title: "现状认知与方向确认",
    summary: "正在分析您的创意在当前市场环境中的定位...",
    keyInsights: ["市场机会识别中", "用户需求验证中", "竞争优势分析中"],
    marketReality: {
      marketSize: "市场规模分析中...",
      competition: "竞争态势评估中...",
      opportunities: ["机会点识别中..."],
      challenges: ["挑战识别中..."]
    },
    userNeeds: {
      targetUsers: "目标用户画像构建中...",
      painPoints: ["用户痛点分析中..."],
      solutions: ["解决方案验证中..."]
    },
    actionItems: ["立即开始市场调研", "验证用户需求假设", "分析竞争对手策略"]
  },
  mvpDefinition: {
    title: "MVP产品定义与验证计划",
    productConcept: {
      coreFeatures: ["核心功能定义中..."],
      uniqueValue: "独特价值主张分析中...",
      minimumScope: "最小可行产品范围规划中..."
    },
    developmentPlan: {
      phases: [{
        name: "原型开发阶段",
        duration: "2-4周",
        deliverables: ["产品原型", "用户反馈"],
        resources: ["开发团队", "设计师"]
      }],
      techStack: ["技术栈选择分析中..."],
      estimatedCost: "成本估算中..."
    },
    validationStrategy: {
      hypotheses: ["核心假设识别中..."],
      experiments: ["验证实验设计中..."],
      successMetrics: ["成功指标定义中..."],
      timeline: "验证时间线规划中..."
    },
    actionItems: ["定义核心功能", "构建最小原型", "设计验证实验"]
  },
  businessExecution: {
    title: "商业化落地与运营策略",
    businessModel: {
      revenueStreams: ["收入模式分析中..."],
      costStructure: ["成本结构规划中..."],
      pricingStrategy: "定价策略制定中...",
      scalability: "扩展性评估中..."
    },
    launchStrategy: {
      phases: [{
        name: "软启动阶段",
        timeline: "第1-2个月",
        goals: ["获取早期用户", "收集反馈"],
        tactics: ["小范围测试", "口碑传播"]
      }],
      marketingChannels: ["营销渠道选择中..."],
      budgetAllocation: ["预算分配规划中..."]
    },
    operationalPlan: {
      teamStructure: ["团队结构设计中..."],
      processes: ["业务流程规划中..."],
      infrastructure: ["基础设施需求分析中..."],
      riskManagement: ["风险管理策略制定中..."]
    },
    actionItems: ["制定商业模式", "设计启动策略", "建立运营体系"]
  },
  metadata: {
    ideaTitle: "创意项目",
    generatedAt: new Date(),
    estimatedReadTime: 15,
    implementationTimeframe: "3-6个月",
    confidenceLevel: 75
  }
}

/**
 * 将调研报告转换为落地教练指南
 * @param report 调研报告数据
 * @returns 落地教练指南
 */
export function transformReportToGuide(report: any): LandingCoachGuide {
  try {
    const guide: LandingCoachGuide = JSON.parse(JSON.stringify(DEFAULT_COACH_TEMPLATE))

    // 更新元数据
    if (report.idea) {
      guide.metadata.ideaTitle = report.idea.title || "创意项目"
    }
    guide.metadata.generatedAt = new Date(report.createdAt || Date.now())

    // 第一段：现状认知与方向确认
    if (report.basicAnalysis) {
      const analysis = report.basicAnalysis

      guide.currentSituation.summary = analysis.summary || analysis.marketOverview || "市场环境分析完成"

      if (analysis.keyInsights) {
        guide.currentSituation.keyInsights = Array.isArray(analysis.keyInsights)
          ? analysis.keyInsights
          : [analysis.keyInsights]
      }

      if (analysis.marketAnalysis) {
        guide.currentSituation.marketReality = {
          marketSize: analysis.marketAnalysis.size || "市场规模：有待进一步调研",
          competition: analysis.marketAnalysis.competition || "竞争格局：中等竞争强度",
          opportunities: analysis.marketAnalysis.opportunities || ["市场机会识别中"],
          challenges: analysis.marketAnalysis.challenges || ["挑战分析中"]
        }
      }

      if (analysis.userAnalysis) {
        guide.currentSituation.userNeeds = {
          targetUsers: analysis.userAnalysis.targetUsers || "目标用户群体分析中",
          painPoints: analysis.userAnalysis.painPoints || ["用户痛点识别中"],
          solutions: analysis.userAnalysis.solutions || ["解决方案优化中"]
        }
      }
    }

    // 第二段：MVP产品定义与验证计划
    if (report.mvpGuidance) {
      const mvp = report.mvpGuidance

      if (mvp.productDefinition) {
        guide.mvpDefinition.productConcept = {
          coreFeatures: mvp.productDefinition.coreFeatures || ["核心功能定义中"],
          uniqueValue: mvp.productDefinition.uniqueValue || "独特价值主张确认中",
          minimumScope: mvp.productDefinition.scope || "最小可行产品范围规划中"
        }
      }

      if (mvp.developmentPlan) {
        guide.mvpDefinition.developmentPlan = {
          phases: mvp.developmentPlan.phases || guide.mvpDefinition.developmentPlan.phases,
          techStack: mvp.developmentPlan.techStack || ["技术选型分析中"],
          estimatedCost: mvp.developmentPlan.budget || "成本预估：¥50,000 - ¥200,000"
        }
      }

      if (mvp.validationStrategy) {
        guide.mvpDefinition.validationStrategy = {
          hypotheses: mvp.validationStrategy.hypotheses || ["核心假设验证中"],
          experiments: mvp.validationStrategy.experiments || ["验证实验设计中"],
          successMetrics: mvp.validationStrategy.metrics || ["成功指标确定中"],
          timeline: mvp.validationStrategy.timeline || "4-8周验证周期"
        }
      }
    }

    // 第三段：商业化落地与运营策略
    if (report.businessModel) {
      const business = report.businessModel

      if (business.revenueModel) {
        guide.businessExecution.businessModel = {
          revenueStreams: business.revenueModel.streams || ["收入来源分析中"],
          costStructure: business.costStructure || ["成本结构规划中"],
          pricingStrategy: business.pricingStrategy || "定价策略制定中",
          scalability: business.scalability || "规模化潜力评估中"
        }
      }

      if (business.launchPlan) {
        guide.businessExecution.launchStrategy = {
          phases: business.launchPlan.phases || guide.businessExecution.launchStrategy.phases,
          marketingChannels: business.launchPlan.channels || ["营销渠道优化中"],
          budgetAllocation: business.launchPlan.budget || ["预算分配规划中"]
        }
      }

      if (business.operations) {
        guide.businessExecution.operationalPlan = {
          teamStructure: business.operations.team || ["团队架构设计中"],
          processes: business.operations.processes || ["流程标准化中"],
          infrastructure: business.operations.infrastructure || ["基础设施需求分析中"],
          riskManagement: business.operations.risks || ["风险控制策略制定中"]
        }
      }
    }

    // 生成行动项目
    guide.currentSituation.actionItems = generateActionItems("认知阶段", report)
    guide.mvpDefinition.actionItems = generateActionItems("MVP阶段", report)
    guide.businessExecution.actionItems = generateActionItems("商业化阶段", report)

    // 计算置信度
    guide.metadata.confidenceLevel = calculateConfidenceLevel(report)

    return guide

  } catch (error) {
    console.error("转换调研报告到落地指南失败:", error)
    return {
      ...DEFAULT_COACH_TEMPLATE,
      metadata: {
        ...DEFAULT_COACH_TEMPLATE.metadata,
        ideaTitle: report?.idea?.title || "创意项目",
        confidenceLevel: 30
      }
    }
  }
}

/**
 * 根据阶段生成具体的行动项目
 */
function generateActionItems(stage: string, report: any): string[] {
  const baseActions = {
    "认知阶段": [
      "完成用户访谈5-10人，验证问题假设",
      "分析3-5个直接竞争对手的产品特征",
      "制定用户画像和使用场景地图",
      "评估市场进入时机和竞争策略"
    ],
    "MVP阶段": [
      "构建产品原型并进行内部测试",
      "招募20-50名早期测试用户",
      "设计A/B测试验证核心假设",
      "建立用户反馈收集和分析机制"
    ],
    "商业化阶段": [
      "制定详细的商业计划和财务预测",
      "建立销售和营销体系",
      "设计用户获取和留存策略",
      "制定扩张计划和融资方案"
    ]
  }

  return baseActions[stage] || [
    "制定具体的执行计划",
    "分配团队角色和责任",
    "设定阶段性目标和检查点",
    "建立风险监控和应对机制"
  ]
}

/**
 * 根据报告数据质量计算置信度
 */
function calculateConfidenceLevel(report: any): number {
  let score = 30 // 基础分

  // 基础分析质量
  if (report.basicAnalysis) {
    score += 20
    if (report.basicAnalysis.marketAnalysis) score += 10
    if (report.basicAnalysis.userAnalysis) score += 10
  }

  // MVP指导质量
  if (report.mvpGuidance) {
    score += 15
    if (report.mvpGuidance.developmentPlan) score += 10
  }

  // 商业模式质量
  if (report.businessModel) {
    score += 15
    if (report.businessModel.revenueModel) score += 10
  }

  // 报告完成度
  if (report.status === 'COMPLETED') score += 10
  if (report.progress >= 80) score += 5

  return Math.min(score, 95) // 最高95分，留有改进空间
}

/**
 * 生成可下载的落地指南Markdown内容
 */
export function generateGuideMarkdown(guide: LandingCoachGuide): string {
  const markdown = `# ${guide.metadata.ideaTitle} - 创意落地指南

> 生成时间：${guide.metadata.generatedAt.toLocaleDateString()}
> 预计阅读时间：${guide.metadata.estimatedReadTime}分钟
> 实施时间框架：${guide.metadata.implementationTimeframe}
> 可行性评估：${guide.metadata.confidenceLevel}%

---

## 📊 ${guide.currentSituation.title}

### 核心洞察
${guide.currentSituation.summary}

**关键要点：**
${guide.currentSituation.keyInsights.map(insight => `- ${insight}`).join('\n')}

### 市场现实
- **市场规模：** ${guide.currentSituation.marketReality.marketSize}
- **竞争态势：** ${guide.currentSituation.marketReality.competition}

**市场机会：**
${guide.currentSituation.marketReality.opportunities.map(opp => `- ${opp}`).join('\n')}

**主要挑战：**
${guide.currentSituation.marketReality.challenges.map(challenge => `- ${challenge}`).join('\n')}

### 用户需求分析
- **目标用户：** ${guide.currentSituation.userNeeds.targetUsers}

**核心痛点：**
${guide.currentSituation.userNeeds.painPoints.map(pain => `- ${pain}`).join('\n')}

**解决方案：**
${guide.currentSituation.userNeeds.solutions.map(solution => `- ${solution}`).join('\n')}

### 🎯 立即行动项
${guide.currentSituation.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

---

## 🚀 ${guide.mvpDefinition.title}

### 产品概念定义
- **独特价值：** ${guide.mvpDefinition.productConcept.uniqueValue}
- **最小范围：** ${guide.mvpDefinition.productConcept.minimumScope}

**核心功能：**
${guide.mvpDefinition.productConcept.coreFeatures.map(feature => `- ${feature}`).join('\n')}

### 开发计划
${guide.mvpDefinition.developmentPlan.phases.map(phase =>
  `**${phase.name}** (${phase.duration})
- 交付物：${phase.deliverables.join('、')}
- 所需资源：${phase.resources.join('、')}`
).join('\n\n')}

- **技术栈：** ${guide.mvpDefinition.developmentPlan.techStack.join('、')}
- **预估成本：** ${guide.mvpDefinition.developmentPlan.estimatedCost}

### 验证策略
- **验证时间线：** ${guide.mvpDefinition.validationStrategy.timeline}

**核心假设：**
${guide.mvpDefinition.validationStrategy.hypotheses.map(hyp => `- ${hyp}`).join('\n')}

**验证实验：**
${guide.mvpDefinition.validationStrategy.experiments.map(exp => `- ${exp}`).join('\n')}

**成功指标：**
${guide.mvpDefinition.validationStrategy.successMetrics.map(metric => `- ${metric}`).join('\n')}

### 🎯 立即行动项
${guide.mvpDefinition.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

---

## 💼 ${guide.businessExecution.title}

### 商业模式设计
- **定价策略：** ${guide.businessExecution.businessModel.pricingStrategy}
- **扩展性：** ${guide.businessExecution.businessModel.scalability}

**收入来源：**
${guide.businessExecution.businessModel.revenueStreams.map(stream => `- ${stream}`).join('\n')}

**成本结构：**
${guide.businessExecution.businessModel.costStructure.map(cost => `- ${cost}`).join('\n')}

### 启动策略
${guide.businessExecution.launchStrategy.phases.map(phase =>
  `**${phase.name}** (${phase.timeline})
- 目标：${phase.goals.join('、')}
- 策略：${phase.tactics.join('、')}`
).join('\n\n')}

**营销渠道：**
${guide.businessExecution.launchStrategy.marketingChannels.map(channel => `- ${channel}`).join('\n')}

**预算分配：**
${guide.businessExecution.launchStrategy.budgetAllocation.map(budget => `- ${budget}`).join('\n')}

### 运营规划
**团队结构：**
${guide.businessExecution.operationalPlan.teamStructure.map(role => `- ${role}`).join('\n')}

**核心流程：**
${guide.businessExecution.operationalPlan.processes.map(process => `- ${process}`).join('\n')}

**基础设施：**
${guide.businessExecution.operationalPlan.infrastructure.map(infra => `- ${infra}`).join('\n')}

**风险管理：**
${guide.businessExecution.operationalPlan.riskManagement.map(risk => `- ${risk}`).join('\n')}

### 🎯 立即行动项
${guide.businessExecution.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

---

## 📈 总结与下一步

基于当前分析，您的创意「${guide.metadata.ideaTitle}」具有 **${guide.metadata.confidenceLevel}%** 的市场可行性。

建议按照以下优先级推进：

1. **第一阶段（现状认知）**：深入市场调研和用户验证
2. **第二阶段（MVP开发）**：快速原型开发和市场测试
3. **第三阶段（商业化）**：规模化运营和市场拓展

---

*本指南由AI创意落地教练生成，建议结合实际情况调整执行方案。*
`

  return markdown
}

/**
 * 检查报告是否包含足够的数据用于生成指南
 */
export function validateReportForGuide(report: any): {
  isValid: boolean
  missingFields: string[]
  recommendations: string[]
} {
  const missingFields: string[] = []
  const recommendations: string[] = []

  if (!report.basicAnalysis) {
    missingFields.push("基础市场分析")
    recommendations.push("补充市场环境和竞争分析")
  }

  if (!report.mvpGuidance) {
    missingFields.push("MVP产品指导")
    recommendations.push("完善产品定义和开发计划")
  }

  if (!report.businessModel) {
    missingFields.push("商业模式分析")
    recommendations.push("制定商业化策略和运营方案")
  }

  if (report.status !== 'COMPLETED') {
    missingFields.push("报告生成状态")
    recommendations.push("等待报告生成完成")
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    recommendations
  }
}