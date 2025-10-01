// 璋冪爺鎶ュ憡杞崲涓鸿惤鍦版暀缁冩寚鍗楃殑宸ュ叿鍑芥暟
import { ResearchReport } from '@prisma/client'

// 钀藉湴鏁欑粌涓夋缁撴瀯鐨勬暟鎹被鍨?
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
  // AI鐘€鍒╃偣璇勬満鍒?
  aiInsights?: {
    overallAssessment: {
      score: number // 0-10鍒?
      level: string // 椤圭洰娼滃姏绛夌骇
      summary: string // 涓€鍙ヨ瘽鐘€鍒╃偣璇?
      keyStrengths: string[] // 鏍稿績浼樺娍
      criticalChallenges: string[] // 鍏抽敭鎸戞垬
    }
    sustainabilityAnalysis: {
      longTermViability: string // 闀挎湡鍙鎬ц瘎浼?
      persistenceFactors: string[] // 鍧氭寔鎴愬姛鐨勫叧閿洜绱?
      riskMitigation: string[] // 椋庨櫓缂撹В寤鸿
    }
    stageAlerts: Array<{
      stage: string // 闃舵鍚嶇О
      timeline: string // 鏃堕棿绾?
      criticalMilestones: string[] // 鍏抽敭閲岀▼纰?
      warningSignals: string[] // 棰勮淇″彿
    }>
  }

  // 绗竴娈碉細鐜扮姸璁ょ煡涓庢柟鍚戠‘璁?
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

  // 绗簩娈碉細MVP浜у搧瀹氫箟涓庨獙璇佽鍒?
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

  // 绗笁娈碉細鍟嗕笟鍖栬惤鍦颁笌杩愯惀绛栫暐
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

  // 鍏冩暟鎹?
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

// 榛樿鐨勮惤鍦版暀缁冩ā鏉?
export const BASE_LANDING_COACH_TEMPLATE: LandingCoachGuide = {
  currentSituation: {
    title: "鐜扮姸璁ょ煡涓庢柟鍚戠‘璁?,
    summary: "姝ｅ湪鍒嗘瀽鎮ㄧ殑鍒涙剰鍦ㄥ綋鍓嶅競鍦虹幆澧冧腑鐨勫畾浣?..",
    keyInsights: ["甯傚満鏈轰細璇嗗埆涓?, "鐢ㄦ埛闇€姹傞獙璇佷腑", "绔炰簤浼樺娍鍒嗘瀽涓?],
    marketReality: {
      marketSize: "甯傚満瑙勬ā鍒嗘瀽涓?..",
      competition: "绔炰簤鎬佸娍璇勪及涓?..",
      opportunities: ["鏈轰細鐐硅瘑鍒腑..."],
      challenges: ["鎸戞垬璇嗗埆涓?.."]
    },
    userNeeds: {
      targetUsers: "鐩爣鐢ㄦ埛鐢诲儚鏋勫缓涓?..",
      painPoints: ["鐢ㄦ埛鐥涚偣鍒嗘瀽涓?.."],
      solutions: ["瑙ｅ喅鏂规楠岃瘉涓?.."]
    },
    actionItems: ["绔嬪嵆寮€濮嬪競鍦鸿皟鐮?, "楠岃瘉鐢ㄦ埛闇€姹傚亣璁?, "鍒嗘瀽绔炰簤瀵规墜绛栫暐"]
  },
  mvpDefinition: {
    title: "MVP浜у搧瀹氫箟涓庨獙璇佽鍒?,
    productConcept: {
      coreFeatures: ["鏍稿績鍔熻兘瀹氫箟涓?.."],
      uniqueValue: "鐙壒浠峰€间富寮犲垎鏋愪腑...",
      minimumScope: "鏈€灏忓彲琛屼骇鍝佽寖鍥磋鍒掍腑..."
    },
    developmentPlan: {
      phases: [{
        name: "鍘熷瀷寮€鍙戦樁娈?,
        duration: "2-4鍛?,
        deliverables: ["浜у搧鍘熷瀷", "鐢ㄦ埛鍙嶉"],
        resources: ["寮€鍙戝洟闃?, "璁捐甯?]
      }],
      techStack: ["鎶€鏈爤閫夋嫨鍒嗘瀽涓?.."],
      estimatedCost: "鎴愭湰浼扮畻涓?.."
    },
    validationStrategy: {
      hypotheses: ["鏍稿績鍋囪璇嗗埆涓?.."],
      experiments: ["楠岃瘉瀹為獙璁捐涓?.."],
      successMetrics: ["鎴愬姛鎸囨爣瀹氫箟涓?.."],
      timeline: "楠岃瘉鏃堕棿绾胯鍒掍腑..."
    },
    actionItems: ["瀹氫箟鏍稿績鍔熻兘", "鏋勫缓鏈€灏忓師鍨?, "璁捐楠岃瘉瀹為獙"]
  },
  businessExecution: {
    title: "鍟嗕笟鍖栬惤鍦颁笌杩愯惀绛栫暐",
    businessModel: {
      revenueStreams: ["鏀跺叆妯″紡鍒嗘瀽涓?.."],
      costStructure: ["鎴愭湰缁撴瀯瑙勫垝涓?.."],
      pricingStrategy: "瀹氫环绛栫暐鍒跺畾涓?..",
      scalability: "鎵╁睍鎬ц瘎浼颁腑..."
    },
    launchStrategy: {
      phases: [{
        name: "杞惎鍔ㄩ樁娈?,
        timeline: "绗?-2涓湀",
        goals: ["鑾峰彇鏃╂湡鐢ㄦ埛", "鏀堕泦鍙嶉"],
        tactics: ["灏忚寖鍥存祴璇?, "鍙ｇ浼犳挱"]
      }],
      marketingChannels: ["钀ラ攢娓犻亾閫夋嫨涓?.."],
      budgetAllocation: ["棰勭畻鍒嗛厤瑙勫垝涓?.."]
    },
    operationalPlan: {
      teamStructure: ["鍥㈤槦缁撴瀯璁捐涓?.."],
      processes: ["涓氬姟娴佺▼瑙勫垝涓?.."],
      infrastructure: ["鍩虹璁炬柦闇€姹傚垎鏋愪腑..."],
      riskManagement: ["椋庨櫓绠＄悊绛栫暐鍒跺畾涓?.."]
    },
    actionItems: ["鍒跺畾鍟嗕笟妯″紡", "璁捐鍚姩绛栫暐", "寤虹珛杩愯惀浣撶郴"]
  },
  metadata: {
    ideaTitle: "鍒涙剰椤圭洰",
    generatedAt: new Date(),
    estimatedReadTime: 15,
    implementationTimeframe: "3-6涓湀",
    confidenceLevel: 75
  }
}

/**
 * 灏嗚皟鐮旀姤鍛婅浆鎹负钀藉湴鏁欑粌鎸囧崡
 * @param report 璋冪爺鎶ュ憡鏁版嵁
 * @returns 钀藉湴鏁欑粌鎸囧崡
 */
export function transformReportToGuide(report: any): LandingCoachGuide {
  try {
    const guide: LandingCoachGuide = JSON.parse(JSON.stringify(BASE_LANDING_COACH_TEMPLATE))

    // 鏇存柊鍏冩暟鎹?
    if (report.idea) {
      guide.metadata.ideaTitle = report.idea.title || "鍒涙剰椤圭洰"
    }
    guide.metadata.generatedAt = new Date(report.createdAt || Date.now())

    // 绗竴娈碉細鐜扮姸璁ょ煡涓庢柟鍚戠‘璁?
    if (report.basicAnalysis) {
      const analysis = report.basicAnalysis

      guide.currentSituation.summary = analysis.summary || analysis.marketOverview || "甯傚満鐜鍒嗘瀽瀹屾垚"

      if (analysis.keyInsights) {
        guide.currentSituation.keyInsights = Array.isArray(analysis.keyInsights)
          ? analysis.keyInsights
          : [analysis.keyInsights]
      }

      if (analysis.marketAnalysis) {
        guide.currentSituation.marketReality = {
          marketSize: analysis.marketAnalysis.size || "甯傚満瑙勬ā锛氭湁寰呰繘涓€姝ヨ皟鐮?,
          competition: analysis.marketAnalysis.competition || "绔炰簤鏍煎眬锛氫腑绛夌珵浜夊己搴?,
          opportunities: analysis.marketAnalysis.opportunities || ["甯傚満鏈轰細璇嗗埆涓?],
          challenges: analysis.marketAnalysis.challenges || ["鎸戞垬鍒嗘瀽涓?]
        }
      }

      if (analysis.userAnalysis) {
        guide.currentSituation.userNeeds = {
          targetUsers: analysis.userAnalysis.targetUsers || "鐩爣鐢ㄦ埛缇や綋鍒嗘瀽涓?,
          painPoints: analysis.userAnalysis.painPoints || ["鐢ㄦ埛鐥涚偣璇嗗埆涓?],
          solutions: analysis.userAnalysis.solutions || ["瑙ｅ喅鏂规浼樺寲涓?]
        }
      }
    }

    // 绗簩娈碉細MVP浜у搧瀹氫箟涓庨獙璇佽鍒?
    if (report.mvpGuidance) {
      const mvp = report.mvpGuidance

      if (mvp.productDefinition) {
        guide.mvpDefinition.productConcept = {
          coreFeatures: mvp.productDefinition.coreFeatures || ["鏍稿績鍔熻兘瀹氫箟涓?],
          uniqueValue: mvp.productDefinition.uniqueValue || "鐙壒浠峰€间富寮犵‘璁や腑",
          minimumScope: mvp.productDefinition.scope || "鏈€灏忓彲琛屼骇鍝佽寖鍥磋鍒掍腑"
        }
      }

      if (mvp.developmentPlan) {
        guide.mvpDefinition.developmentPlan = {
          phases: mvp.developmentPlan.phases || guide.mvpDefinition.developmentPlan.phases,
          techStack: mvp.developmentPlan.techStack || ["鎶€鏈€夊瀷鍒嗘瀽涓?],
          estimatedCost: mvp.developmentPlan.budget || "鎴愭湰棰勪及锛毬?0,000 - 楼200,000"
        }
      }

      if (mvp.validationStrategy) {
        guide.mvpDefinition.validationStrategy = {
          hypotheses: mvp.validationStrategy.hypotheses || ["鏍稿績鍋囪楠岃瘉涓?],
          experiments: mvp.validationStrategy.experiments || ["楠岃瘉瀹為獙璁捐涓?],
          successMetrics: mvp.validationStrategy.metrics || ["鎴愬姛鎸囨爣纭畾涓?],
          timeline: mvp.validationStrategy.timeline || "4-8鍛ㄩ獙璇佸懆鏈?
        }
      }
    }

    // 绗笁娈碉細鍟嗕笟鍖栬惤鍦颁笌杩愯惀绛栫暐
    if (report.businessModel) {
      const business = report.businessModel

      if (business.revenueModel) {
        guide.businessExecution.businessModel = {
          revenueStreams: business.revenueModel.streams || ["鏀跺叆鏉ユ簮鍒嗘瀽涓?],
          costStructure: business.costStructure || ["鎴愭湰缁撴瀯瑙勫垝涓?],
          pricingStrategy: business.pricingStrategy || "瀹氫环绛栫暐鍒跺畾涓?,
          scalability: business.scalability || "瑙勬ā鍖栨綔鍔涜瘎浼颁腑"
        }
      }

      if (business.launchPlan) {
        guide.businessExecution.launchStrategy = {
          phases: business.launchPlan.phases || guide.businessExecution.launchStrategy.phases,
          marketingChannels: business.launchPlan.channels || ["钀ラ攢娓犻亾浼樺寲涓?],
          budgetAllocation: business.launchPlan.budget || ["棰勭畻鍒嗛厤瑙勫垝涓?]
        }
      }

      if (business.operations) {
        guide.businessExecution.operationalPlan = {
          teamStructure: business.operations.team || ["鍥㈤槦鏋舵瀯璁捐涓?],
          processes: business.operations.processes || ["娴佺▼鏍囧噯鍖栦腑"],
          infrastructure: business.operations.infrastructure || ["鍩虹璁炬柦闇€姹傚垎鏋愪腑"],
          riskManagement: business.operations.risks || ["椋庨櫓鎺у埗绛栫暐鍒跺畾涓?]
        }
      }
    }

    // 鐢熸垚琛屽姩椤圭洰
    guide.currentSituation.actionItems = generateActionItems("璁ょ煡闃舵", report)
    guide.mvpDefinition.actionItems = generateActionItems("MVP闃舵", report)
    guide.businessExecution.actionItems = generateActionItems("鍟嗕笟鍖栭樁娈?, report)

    // 璁＄畻缃俊搴?
    guide.metadata.confidenceLevel = calculateConfidenceLevel(report)

    return guide

  } catch (error) {
    console.error("杞崲璋冪爺鎶ュ憡鍒拌惤鍦版寚鍗楀け璐?", error)
    return {
      ...BASE_LANDING_COACH_TEMPLATE,
      metadata: {
        ...BASE_LANDING_COACH_TEMPLATE.metadata,
        ideaTitle: report?.idea?.title || "鍒涙剰椤圭洰",
        confidenceLevel: 30
      }
    }
  }
}

/**
 * 鏍规嵁闃舵鐢熸垚鍏蜂綋鐨勮鍔ㄩ」鐩?
 */
function generateActionItems(stage: string, report: any): string[] {
  const baseActions = {
    "璁ょ煡闃舵": [
      "瀹屾垚鐢ㄦ埛璁胯皥5-10浜猴紝楠岃瘉闂鍋囪",
      "鍒嗘瀽3-5涓洿鎺ョ珵浜夊鎵嬬殑浜у搧鐗瑰緛",
      "鍒跺畾鐢ㄦ埛鐢诲儚鍜屼娇鐢ㄥ満鏅湴鍥?,
      "璇勪及甯傚満杩涘叆鏃舵満鍜岀珵浜夌瓥鐣?
    ],
    "MVP闃舵": [
      "鏋勫缓浜у搧鍘熷瀷骞惰繘琛屽唴閮ㄦ祴璇?,
      "鎷涘嫙20-50鍚嶆棭鏈熸祴璇曠敤鎴?,
      "璁捐A/B娴嬭瘯楠岃瘉鏍稿績鍋囪",
      "寤虹珛鐢ㄦ埛鍙嶉鏀堕泦鍜屽垎鏋愭満鍒?
    ],
    "鍟嗕笟鍖栭樁娈?: [
      "鍒跺畾璇︾粏鐨勫晢涓氳鍒掑拰璐㈠姟棰勬祴",
      "寤虹珛閿€鍞拰钀ラ攢浣撶郴",
      "璁捐鐢ㄦ埛鑾峰彇鍜岀暀瀛樼瓥鐣?,
      "鍒跺畾鎵╁紶璁″垝鍜岃瀺璧勬柟妗?
    ]
  }

  return baseActions[stage] || [
    "鍒跺畾鍏蜂綋鐨勬墽琛岃鍒?,
    "鍒嗛厤鍥㈤槦瑙掕壊鍜岃矗浠?,
    "璁惧畾闃舵鎬х洰鏍囧拰妫€鏌ョ偣",
    "寤虹珛椋庨櫓鐩戞帶鍜屽簲瀵规満鍒?
  ]
}

/**
 * 鏍规嵁鎶ュ憡鏁版嵁璐ㄩ噺璁＄畻缃俊搴?
 */
function calculateConfidenceLevel(report: any): number {
  let score = 30 // 鍩虹鍒?

  // 鍩虹鍒嗘瀽璐ㄩ噺
  if (report.basicAnalysis) {
    score += 20
    if (report.basicAnalysis.marketAnalysis) score += 10
    if (report.basicAnalysis.userAnalysis) score += 10
  }

  // MVP鎸囧璐ㄩ噺
  if (report.mvpGuidance) {
    score += 15
    if (report.mvpGuidance.developmentPlan) score += 10
  }

  // 鍟嗕笟妯″紡璐ㄩ噺
  if (report.businessModel) {
    score += 15
    if (report.businessModel.revenueModel) score += 10
  }

  // 鎶ュ憡瀹屾垚搴?
  if (report.status === 'COMPLETED') score += 10
  if (report.progress >= 80) score += 5

  return Math.min(score, 95) // 鏈€楂?5鍒嗭紝鐣欐湁鏀硅繘绌洪棿
}

/**
 * 鐢熸垚鍙笅杞界殑钀藉湴鎸囧崡Markdown鍐呭
 */
export function generateGuideMarkdown(guide: LandingCoachGuide): string {
  let markdown = `# ${guide.metadata.ideaTitle} - 鍒涙剰钀藉湴鎸囧崡

> 鐢熸垚鏃堕棿锛?{guide.metadata.generatedAt.toLocaleDateString()}
> 棰勮闃呰鏃堕棿锛?{guide.metadata.estimatedReadTime}鍒嗛挓
> 瀹炴柦鏃堕棿妗嗘灦锛?{guide.metadata.implementationTimeframe}
> 鍙鎬ц瘎浼帮細${guide.metadata.confidenceLevel}%

---

## 馃搳 ${guide.currentSituation.title}

### 鏍稿績娲炲療
${guide.currentSituation.summary}

**鍏抽敭瑕佺偣锛?*
${guide.currentSituation.keyInsights.map(insight => `- ${insight}`).join('\n')}

### 甯傚満鐜板疄
- **甯傚満瑙勬ā锛?* ${guide.currentSituation.marketReality.marketSize}
- **绔炰簤鎬佸娍锛?* ${guide.currentSituation.marketReality.competition}

**甯傚満鏈轰細锛?*
${guide.currentSituation.marketReality.opportunities.map(opp => `- ${opp}`).join('\n')}

**涓昏鎸戞垬锛?*
${guide.currentSituation.marketReality.challenges.map(challenge => `- ${challenge}`).join('\n')}

### 鐢ㄦ埛闇€姹傚垎鏋?
- **鐩爣鐢ㄦ埛锛?* ${guide.currentSituation.userNeeds.targetUsers}

**鏍稿績鐥涚偣锛?*
${guide.currentSituation.userNeeds.painPoints.map(pain => `- ${pain}`).join('\n')}

**瑙ｅ喅鏂规锛?*
${guide.currentSituation.userNeeds.solutions.map(solution => `- ${solution}`).join('\n')}

### 馃幆 绔嬪嵆琛屽姩椤?
${guide.currentSituation.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

---

## 馃殌 ${guide.mvpDefinition.title}

### 浜у搧姒傚康瀹氫箟
- **鐙壒浠峰€硷細** ${guide.mvpDefinition.productConcept.uniqueValue}
- **鏈€灏忚寖鍥达細** ${guide.mvpDefinition.productConcept.minimumScope}

**鏍稿績鍔熻兘锛?*
${guide.mvpDefinition.productConcept.coreFeatures.map(feature => `- ${feature}`).join('\n')}

### 寮€鍙戣鍒?
${guide.mvpDefinition.developmentPlan.phases.map(phase =>
  `**${phase.name}** (${phase.duration})
- 浜や粯鐗╋細${phase.deliverables.join('銆?)}
- 鎵€闇€璧勬簮锛?{phase.resources.join('銆?)}`
).join('\n\n')}

- **鎶€鏈爤锛?* ${guide.mvpDefinition.developmentPlan.techStack.join('銆?)}
- **棰勪及鎴愭湰锛?* ${guide.mvpDefinition.developmentPlan.estimatedCost}

### 楠岃瘉绛栫暐
- **楠岃瘉鏃堕棿绾匡細** ${guide.mvpDefinition.validationStrategy.timeline}

**鏍稿績鍋囪锛?*
${guide.mvpDefinition.validationStrategy.hypotheses.map(hyp => `- ${hyp}`).join('\n')}

**楠岃瘉瀹為獙锛?*
${guide.mvpDefinition.validationStrategy.experiments.map(exp => `- ${exp}`).join('\n')}

**鎴愬姛鎸囨爣锛?*
${guide.mvpDefinition.validationStrategy.successMetrics.map(metric => `- ${metric}`).join('\n')}

### 馃幆 绔嬪嵆琛屽姩椤?
${guide.mvpDefinition.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

---

## 馃捈 ${guide.businessExecution.title}

### 鍟嗕笟妯″紡璁捐
- **瀹氫环绛栫暐锛?* ${guide.businessExecution.businessModel.pricingStrategy}
- **鎵╁睍鎬э細** ${guide.businessExecution.businessModel.scalability}

**鏀跺叆鏉ユ簮锛?*
${guide.businessExecution.businessModel.revenueStreams.map(stream => `- ${stream}`).join('\n')}

**鎴愭湰缁撴瀯锛?*
${guide.businessExecution.businessModel.costStructure.map(cost => `- ${cost}`).join('\n')}

### 鍚姩绛栫暐
${guide.businessExecution.launchStrategy.phases.map(phase =>
  `**${phase.name}** (${phase.timeline})
- 鐩爣锛?{phase.goals.join('銆?)}
- 绛栫暐锛?{phase.tactics.join('銆?)}`
).join('\n\n')}

**钀ラ攢娓犻亾锛?*
${guide.businessExecution.launchStrategy.marketingChannels.map(channel => `- ${channel}`).join('\n')}

**棰勭畻鍒嗛厤锛?*
${guide.businessExecution.launchStrategy.budgetAllocation.map(budget => `- ${budget}`).join('\n')}

### 杩愯惀瑙勫垝
**鍥㈤槦缁撴瀯锛?*
${guide.businessExecution.operationalPlan.teamStructure.map(role => `- ${role}`).join('\n')}

**鏍稿績娴佺▼锛?*
${guide.businessExecution.operationalPlan.processes.map(process => `- ${process}`).join('\n')}

**鍩虹璁炬柦锛?*
${guide.businessExecution.operationalPlan.infrastructure.map(infra => `- ${infra}`).join('\n')}

**椋庨櫓绠＄悊锛?*
${guide.businessExecution.operationalPlan.riskManagement.map(risk => `- ${risk}`).join('\n')}

### 馃幆 绔嬪嵆琛屽姩椤?
${guide.businessExecution.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

---

## 馃搱 鎬荤粨涓庝笅涓€姝?

鍩轰簬褰撳墠鍒嗘瀽锛屾偍鐨勫垱鎰忋€?{guide.metadata.ideaTitle}銆嶅叿鏈?**${guide.metadata.confidenceLevel}%** 鐨勫競鍦哄彲琛屾€с€?

寤鸿鎸夌収浠ヤ笅浼樺厛绾ф帹杩涳細

1. **绗竴闃舵锛堢幇鐘惰鐭ワ級**锛氭繁鍏ュ競鍦鸿皟鐮斿拰鐢ㄦ埛楠岃瘉
2. **绗簩闃舵锛圡VP寮€鍙戯級**锛氬揩閫熷師鍨嬪紑鍙戝拰甯傚満娴嬭瘯
3. **绗笁闃舵锛堝晢涓氬寲锛?*锛氳妯″寲杩愯惀鍜屽競鍦烘嫇灞?

---

*鏈寚鍗楃敱AI鍒涙剰钀藉湴鏁欑粌鐢熸垚锛屽缓璁粨鍚堝疄闄呮儏鍐佃皟鏁存墽琛屾柟妗堛€?
`


  if (guide.executionPlan) {
    markdown += `

## 🧭 90 天聚焦实战计划

### 阶段拆解
${guide.executionPlan.phases.map(phase => `**${phase.name}** (${phase.timeline})
- 聚焦：${phase.focus}
- 关键成果：${phase.keyOutcomes.join('、')}
- 核心指标：${phase.metrics.join('、')}`).join('

')}

### 每周冲刺重点
${guide.executionPlan.weeklySprints.map(sprint => `**${sprint.name}**
- 当前聚焦：${sprint.focus}
- 关键目标：${sprint.objectives.join('、')}
- 反馈钩子：${sprint.feedbackHooks.join('、')}`).join('

')}

### 正反馈机制
- 节奏安排：${guide.executionPlan.feedbackLoop.cadence.join(' / ')}
- 数据与反馈渠道：${guide.executionPlan.feedbackLoop.channels.join(' / ')}
- 决策闸口：${guide.executionPlan.feedbackLoop.decisionGates.join(' / ')}
- 推荐工具：${guide.executionPlan.feedbackLoop.tooling.join(' / ')}

### 每日执行清单
${guide.executionPlan.dailyRoutines.map(item => `- ${item}`).join('
')}

### 复盘与度量框架
- 每周复盘：${guide.executionPlan.reviewFramework.weekly.join('、')}
- 每月校准：${guide.executionPlan.reviewFramework.monthly.join('、')}
- 重点监控指标：${guide.executionPlan.reviewFramework.dataWatch.join('、')}
`;
  }
  return markdown
}

/**
 * 妫€鏌ユ姤鍛婃槸鍚﹀寘鍚冻澶熺殑鏁版嵁鐢ㄤ簬鐢熸垚鎸囧崡
 */
export function validateReportForGuide(report: any): {
  isValid: boolean
  missingFields: string[]
  recommendations: string[]
} {
  const missingFields: string[] = []
  const recommendations: string[] = []

  if (!report.basicAnalysis) {
    missingFields.push("鍩虹甯傚満鍒嗘瀽")
    recommendations.push("琛ュ厖甯傚満鐜鍜岀珵浜夊垎鏋?)
  }

  if (!report.mvpGuidance) {
    missingFields.push("MVP浜у搧鎸囧")
    recommendations.push("瀹屽杽浜у搧瀹氫箟鍜屽紑鍙戣鍒?)
  }

  if (!report.businessModel) {
    missingFields.push("鍟嗕笟妯″紡鍒嗘瀽")
    recommendations.push("鍒跺畾鍟嗕笟鍖栫瓥鐣ュ拰杩愯惀鏂规")
  }

  if (report.status !== 'COMPLETED') {
    missingFields.push("鎶ュ憡鐢熸垚鐘舵€?)
    recommendations.push("绛夊緟鎶ュ憡鐢熸垚瀹屾垚")
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    recommendations
  }
}
