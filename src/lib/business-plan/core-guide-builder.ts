import type { BusinessPlanGuide, BiddingSnapshot, BusinessPlanMetadata } from "./types"

const BASE_GUIDE_TEMPLATE: BusinessPlanGuide = {
  currentSituation: {
    title: "Situation & Direction",
    summary: "Gathering expert insights to position the concept in today’s market.",
    keyInsights: [
      "Market opportunity scan in progress",
      "User needs validation pending",
      "Competitive differentiation to confirm"
    ],
    marketReality: {
      marketSize: "Market sizing assessment ongoing",
      competition: "Competitive intensity review in progress",
      opportunities: ["Opportunity mapping underway"],
      challenges: ["Risks being documented"]
    },
    userNeeds: {
      targetUsers: "Target personas drafting in progress",
      painPoints: ["Pain points synthesis pending"],
      solutions: ["Solution framing underway"]
    },
    actionItems: [
      "Consolidate bidding insights into a value map",
      "Define high-priority user segments",
      "Design structured research & validation backlog"
    ]
  },
  mvpDefinition: {
    title: "MVP Definition & Validation Plan",
    productConcept: {
      coreFeatures: ["Identify essential value-delivering features"],
      uniqueValue: "Clarify differentiated value for early adopters",
      minimumScope: "Focus on one or two high-impact journeys"
    },
    developmentPlan: {
      phases: [
        {
          name: "Technical validation",
          duration: "2 weeks",
          deliverables: ["Prototype demo", "Performance notes", "Risk register"],
          resources: ["Lead engineer", "Product", "QA"]
        },
        {
          name: "MVP build",
          duration: "3 weeks",
          deliverables: ["Usable MVP", "Instrumentation", "Support tooling"],
          resources: ["Frontend", "Backend", "Design"]
        },
        {
          name: "Pilot validation",
          duration: "3 weeks",
          deliverables: ["Seed user cohort", "Feedback report", "Metrics dashboard"],
          resources: ["Operations", "Analytics", "Support"]
        }
      ],
      techStack: ["Tech stack definition in progress"],
      estimatedCost: "Estimated 90-day burn: ¥50,000 – ¥80,000"
    },
    validationStrategy: {
      hypotheses: ["Key problem / solution hypotheses pending validation"],
      experiments: ["Design interview & experiment backlog"],
      successMetrics: ["Define leading / lagging indicators"],
      timeline: "Validate in three successive phases across 90 days"
    },
    actionItems: [
      "Agree MVP scope & prioritisation",
      "Stand up collaboration & feedback tooling",
      "Lock weekly iteration rhythm"
    ]
  },
  businessExecution: {
    title: "Commercial Execution & Operations",
    businessModel: {
      revenueStreams: ["Revenue streams to stress-test"],
      costStructure: ["Cost model work in progress"],
      pricingStrategy: "Run pricing experiments with early adopters",
      scalability: "Assess scalability levers"
    },
    launchStrategy: {
      phases: [
        {
          name: "Warm-up",
          timeline: "Month 1",
          goals: ["Build brand assets", "Activate early community"],
          tactics: ["Content marketing", "Expert webinars"]
        },
        {
          name: "Pilot",
          timeline: "Month 2",
          goals: ["Validate with seed users", "Collect case studies"],
          tactics: ["User co-creation", "White-glove onboarding"]
        },
        {
          name: "Commercial proof",
          timeline: "Month 3",
          goals: ["Validate monetisation", "Formalise feedback loop"],
          tactics: ["Limited-time offer", "Referral incentives"]
        }
      ],
      marketingChannels: ["Channel mix design in progress"],
      budgetAllocation: ["Budget allocation plan pending"]
    },
    operationalPlan: {
      teamStructure: ["Clarify cross-functional team"],
      processes: ["Define operating cadence & governance"],
      infrastructure: ["Select tooling & platform stack"],
      riskManagement: ["Document mitigation playbooks"]
    },
    actionItems: [
      "Outline monetisation scenarios",
      "Design positive-feedback operating handbook",
      "Deploy monitoring & alerting"
    ]
  },
  executionPlan: undefined,
  metadata: {
    ideaTitle: "Concept",
    reportId: undefined,
    generatedAt: new Date().toISOString(),
    estimatedReadTime: 18,
    implementationTimeframe: "90 days",
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
  const winnerName = snapshot.winnerName || 'AI Expert Panel'

  guide.metadata.ideaTitle = snapshot.ideaTitle
  guide.metadata.generatedAt = new Date().toISOString()
  guide.metadata.confidenceLevel = confidence
  guide.metadata.implementationTimeframe = '90 days'
  guide.metadata.estimatedReadTime = 18
  guide.metadata.winningBid = highestBid
  guide.metadata.winner = winnerName

  guide.currentSituation.summary = `“${snapshot.ideaTitle}” completed the bidding round with a top bid of ¥${highestBid}. Translate these insights into structured research and MVP validation.`
  guide.currentSituation.keyInsights = [
    'Bidding dialogue surfaced differentiation and gaps',
    supporters > 0 ? `${supporters} expert supporters highlight tangible demand signals` : 'Experts see promise, yet focused validation is required',
    'Activate structured user research and value confirmation immediately'
  ]

  guide.mvpDefinition.productConcept.uniqueValue = `Deliver the smallest valuable experience for “${snapshot.ideaTitle}”.`
  guide.mvpDefinition.productConcept.minimumScope = 'Restrict MVP scope to the highest-impact journey and embed feedback collection.'
  guide.mvpDefinition.developmentPlan.techStack = ['Next.js / React', 'Node.js or FastAPI', 'Vector store + AI services', 'Monitoring & logging suite']
  guide.mvpDefinition.validationStrategy.hypotheses = [
    'Target users are willing to pay for improved outcomes',
    'AI output is accurate and explainable enough for launch',
    'A positive feedback loop can drive retention or referrals'
  ]
  guide.mvpDefinition.validationStrategy.experiments = [
    'Structured interviews with live prototype walkthroughs',
    'Limited release backed by behavioural analytics',
    'Small-scale willingness-to-pay experiments'
  ]
  guide.mvpDefinition.validationStrategy.successMetrics = ['≥ 30 seed users engaged', '≥ 70% key flow completion', '≥ 10% conversion or commitment']
  guide.mvpDefinition.validationStrategy.timeline = 'Execute technical → customer → commercial validation in 90 days'
  guide.mvpDefinition.actionItems = [
    'Lock MVP scope and “must-have” features',
    'Set up collaboration and feedback tooling',
    'Define sprint cadence, owners and review rhythm'
  ]

  guide.businessExecution.businessModel.revenueStreams = ['Subscriptions + add-ons', 'Enterprise projects / consulting', 'Data-driven insights products']
  guide.businessExecution.businessModel.costStructure = ['R&D and model operations', 'Customer success/support', 'Marketing & partnerships']
  guide.businessExecution.businessModel.pricingStrategy = 'Use tiered subscription with usage add-ons; offer an early adopter incentive.'
  guide.businessExecution.businessModel.scalability = 'Adopt modular architecture and operational playbooks to scale across verticals.'
  guide.businessExecution.launchStrategy.marketingChannels = ['Content & thought leadership', 'Community / private traffic', 'Industry partners', 'Referral & advocacy']
  guide.businessExecution.launchStrategy.budgetAllocation = ['Marketing 40%', 'Product & tech 35%', 'Customer success 15%', 'Contingency 10%']
  guide.businessExecution.operationalPlan.teamStructure = [
    'Cross-functional build squad (engineering + product)',
    'User research & growth enablement',
    'Commercial and partnership lead',
    'Data & observability analyst'
  ]
  guide.businessExecution.operationalPlan.processes = [
    'Weekly OKR check-in and alignment',
    'Structured customer feedback triage loop',
    'Instrumentation & analytics upkeep',
    'Positive-feedback review cadence'
  ]
  guide.businessExecution.operationalPlan.infrastructure = [
    'Cloud compute & storage platform',
    'Analytics & dashboarding stack',
    'Experimentation / feature flag tooling',
    'Feedback and support ticket system'
  ]
  guide.businessExecution.operationalPlan.riskManagement = [
    'Define stage gates for go/no-go decisions',
    'Maintain fallback options for critical dependencies',
    'Remain compliant with data & privacy requirements',
    'Prepare communication and contingency playbooks'
  ]
  guide.businessExecution.actionItems = [
    'Outline monetisation scenarios',
    'Publish positive-feedback operating handbook',
    'Deploy KPI monitoring and alerting'
  ]

  const metadata: BusinessPlanMetadata = {
    source: snapshot.source,
    winningBid: highestBid,
    winner: winnerName,
    supportedAgents: supporters
  }

  return { guide, metadata }
}
