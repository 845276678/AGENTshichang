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
  mission: 'Complete validation within 90 days.',
  summary:
    'Three focused phases keep learning loops fast, decisions evidence-based, and execution steady.',
  phases: [
    {
      name: 'Phase 1 - Market Insight & Positioning',
      timeline: 'Day 1 - Day 30',
      focus: 'Interview target users, map competitors, and sharpen the value proposition.',
      keyOutcomes: [
        '15+ structured customer conversations',
        'Competitive landscape map with differentiation notes',
        'Draft positioning and value proposition statement'
      ],
      metrics: [
        'Persona clarity score >= 80%',
        'Top three pains confirmed by 60%+ of interviewees'
      ]
    },
    {
      name: 'Phase 2 - MVP Build & Validation',
      timeline: 'Day 31 - Day 60',
      focus: 'Translate insight into a focused MVP and validate core assumptions.',
      keyOutcomes: [
        'High-fidelity prototype and prioritised backlog',
        'MVP v1.0 shipped to pilot cohort',
        '30+ actionable pieces of usage feedback'
      ],
      metrics: [
        'Critical feature completion >= 80%',
        'Activation or task success rate >= 60%'
      ]
    },
    {
      name: 'Phase 3 - Go-to-Market & Operations',
      timeline: 'Day 61 - Day 90',
      focus: 'Prove commercial traction, document repeatable operations, and prepare scale levers.',
      keyOutcomes: [
        'Signed lighthouse customer or pilot renewal',
        'Revenue or retention model validated',
        'Documented operating and support playbooks'
      ],
      metrics: [
        'Pilot retention >= 50%',
        'Sales/marketing funnel conversion benchmarks defined'
      ]
    }
  ],
  weeklySprints: [
    {
      name: 'Sprint 1-2 - Insight Bootcamp',
      focus: 'Collect real user evidence and frame opportunity areas.',
      objectives: [
        'Lock target persona and JTBD',
        'Quantify top problems with lightweight survey',
        'Map competitor promises versus gaps'
      ],
      feedbackHooks: ['Interview summaries', 'Problem ranking workshop', 'Competitor teardown notes']
    },
    {
      name: 'Sprint 3-4 - Prototype & Signals',
      focus: 'Prototype critical journeys and validate desirability quickly.',
      objectives: [
        'Build interactive prototype for main flows',
        'Run hallway/usability tests with 5-7 users',
        'Track qualitative sentiment and friction points'
      ],
      feedbackHooks: ['Prototype testing sessions', 'Usability scorecard', 'Design review playback']
    },
    {
      name: 'Sprint 5-6 - MVP Launch',
      focus: 'Ship the lean MVP and measure adoption with tight loops.',
      objectives: [
        'Release MVP to pilot group',
        'Instrument analytics and feedback widgets',
        'Run weekly retention and conversion reviews'
      ],
      feedbackHooks: ['Product analytics dashboard', 'Pilot check-in calls', 'Retention curve snapshot']
    },
    {
      name: 'Sprint 7-9 - Growth Engine',
      focus: 'Prove acquisition economics and stabilise operations.',
      objectives: [
        'Test at least two scalable acquisition channels',
        'Define pricing and packaging experiment',
        'Document onboarding and support SOPs'
      ],
      feedbackHooks: ['Channel experiment log', 'Pricing learning report', 'Support ticket review']
    }
  ],
  feedbackLoop: {
    cadence: ['Weekly discovery playback', 'Bi-weekly growth stand-up', 'Monthly strategy review'],
    channels: ['User interviews', 'Product analytics', 'Revenue dashboard', 'Support pulse'],
    decisionGates: ['Problem-solution fit validated', 'Healthy MVP retention', 'Scalable acquisition identified'],
    tooling: ['Notion OS', 'Linear', 'Amplitude or Looker', 'Miro collaboration boards']
  },
  dailyRoutines: [
    'Morning 15-minute KPI review and blockers sync',
    'Daily user signal triage (feedback, tickets, analytics anomalies)',
    'Time-boxed maker blocks for product or go-to-market experiments',
    'End-of-day learning log capturing decisions and open questions'
  ],
  reviewFramework: {
    weekly: [
      'Outcome-focused team review (what moved, what stalled)',
      'Customer signal debrief and next hypothesis selection',
      'Risk register refresh with owners/actions'
    ],
    monthly: [
      'North-star metric trajectory versus targets',
      'Resource and budget health check',
      'Strategic bet review and roadmap adjustments'
    ],
    dataWatch: [
      'Activation, retention, and referral funnel trends',
      'Acquisition cost versus LTV indicators',
      'Customer effort score and support load'
    ]
  }
}

export const BASE_LANDING_COACH_TEMPLATE: LandingCoachGuide = {
  aiInsights: {
    overallAssessment: {
      score: 8,
      level: 'Promising',
      summary: 'The idea resonates with a clearly underserved segment and shows early signs of viability.',
      keyStrengths: [
        'Clear customer pain with quantified urgency',
        'Founding team insight and domain depth',
        'Product vision aligns with measurable business outcomes'
      ],
      criticalChallenges: [
        'Proof of willingness to pay is still limited',
        'Operational readiness for scale remains untested',
        'Team capacity must support parallel experiments'
      ]
    },
    sustainabilityAnalysis: {
      longTermViability: 'Balanced growth path if retention loops are prioritised and cost discipline maintained.',
      persistenceFactors: [
        'Close proximity to customers keeps insight fresh',
        'Roadmap emphasises habit-forming value props',
        'Early adopter community willing to co-create and advocate'
      ],
      riskMitigation: [
        'Schedule quarterly roadmap and finance reviews',
        'Create contingency plans for critical vendors',
        'Document repeatable processes to avoid single points of failure'
      ]
    },
    stageAlerts: [
      {
        stage: 'Discovery refinement',
        timeline: 'Weeks 1-4',
        criticalMilestones: [
          'Validated top three customer pains',
          'Persona and JTBD documented with evidence',
          'Differentiated value proposition tested with interviews'
        ],
        warningSignals: [
          'Interviews surface fragmented pains with low urgency',
          'Competitors already solving core needs with solid adoption'
        ]
      },
      {
        stage: 'MVP & pilot',
        timeline: 'Weeks 5-8',
        criticalMilestones: [
          'Pilot cohort onboarded and actively using MVP',
          'Instrumentation in place for activation and retention signals',
          'Qualitative feedback loop established with weekly cadence'
        ],
        warningSignals: [
          'Pilot usage drops below 40% weekly active',
          'No clear "aha" moment identified from user sessions'
        ]
      },
      {
        stage: 'Growth and operations',
        timeline: 'Weeks 9-12',
        criticalMilestones: [
          'Repeatable acquisition channel with positive unit economics',
          'Support and onboarding playbooks documented and tested',
          'Pricing experiment validated with paying customers'
        ],
        warningSignals: [
          'Acquisition costs climb without matching retention',
          'Support load increases faster than team capacity',
          'Cash runway drops below six months without plan to extend'
        ]
      }
    ]
  },
  currentSituation: {
    title: 'Current situation & alignment',
    summary:
      'We aligned the founding team around the market context, customer pains, and desired 90-day outcomes.',
    keyInsights: [
      'Market demand is concentrated in a niche willing to pay for speed and reliability',
      'Economic buyers value demonstrable ROI within a quarter',
      'A challenger narrative differentiates against legacy incumbents'
    ],
    marketReality: {
      marketSize: 'Serviceable obtainable market estimated at $25M ARR within two years.',
      competition: 'Legacy vendors optimise for compliance rather than agility; startups focus on DIY workflows.',
      opportunities: [
        'Customers frustrated by lengthy onboarding cycles and rigid contracts',
        'Adjacent automation and analytics categories offer expansion paths'
      ],
      challenges: [
        'Procurement cycles can stretch beyond 60 days',
        'High-touch onboarding currently depends on founders'
      ]
    },
    userNeeds: {
      targetUsers: 'Operators in mid-market teams accountable for recurring execution under tight deadlines.',
      painPoints: [
        'Manual orchestration creates frequent hand-off delays',
        'Limited visibility into performance and accountability',
        'Tool sprawl results in duplicated effort and errors'
      ],
      solutions: [
        'Automated workflow templates with guardrails',
        'Real-time collaboration dashboard with alerts',
        'Outcome tracking linked to customer SLAs'
      ]
    },
    actionItems: [
      'Refine persona messaging and circulate to GTM team',
      'Build objection-handling guide from recent interviews',
      'Run weekly customer roundtable to keep insight fresh'
    ]
  },
  mvpDefinition: {
    title: 'MVP value proposition',
    productConcept: {
      coreFeatures: [
        'Template-driven workflow builder with guardrails',
        'Collaboration timeline that highlights owners and blockers',
        'Analytics module that surfaces bottlenecks and impact'
      ],
      uniqueValue: 'Deliver always-on execution visibility without adding management overhead.',
      minimumScope: 'Focus on two core workflows and a single analytics dashboard for pilot accounts.'
    },
    developmentPlan: {
      phases: [
        {
          name: 'Phase A - Prototype',
          duration: '2 weeks',
          deliverables: ['Clickable prototype', 'Usability testing notes'],
          resources: ['Product design', 'Engineering lead']
        },
        {
          name: 'Phase B - MVP build',
          duration: '4 weeks',
          deliverables: ['MVP v1.0', 'Instrumentation and logging', 'Pilot onboarding toolkit'],
          resources: ['Core engineering squad', 'QA', 'Customer success lead']
        },
        {
          name: 'Phase C - Pilot iteration',
          duration: '3 weeks',
          deliverables: ['Retention improvements', 'Support playbook v1', 'Pricing experiment assets'],
          resources: ['Engineering', 'Customer success', 'Growth PMM']
        }
      ],
      techStack: ['Next.js', 'Prisma/PostgreSQL', 'Trigger.dev for automation', 'Segment + Amplitude'],
      estimatedCost: 'Approximately $45k including people cost and tooling subscriptions.'
    },
    validationStrategy: {
      hypotheses: [
        'Operators will adopt guided workflows if setup time is under 15 minutes',
        'Real-time visibility reduces blocker resolution time by 30%',
        'Economic buyers approve budget with ROI evidence within 60 days'
      ],
      experiments: [
        'A/B onboarding flow test with pilot cohort',
        'Resolution time tracking before and after platform adoption',
        'Pricing and packaging interviews with economic buyers'
      ],
      successMetrics: [
        'Activation within 7 days >= 70%',
        'Weekly active operator ratio >= 60%',
        'Net promoter score >= 30 by week 8'
      ],
      timeline: 'Hypotheses validated or revised by the end of week 8.'
    },
    actionItems: [
      'Prioritise backlog by impact versus effort against hypotheses',
      'Confirm pilot success criteria with customers before build completion',
      'Set up analytics dashboards and qualitative feedback tags'
    ]
  },
  businessExecution: {
    title: 'Commercialisation & operations plan',
    businessModel: {
      revenueStreams: ['Subscription tiers based on workflow volume', 'Implementation services for enterprise tiers'],
      costStructure: ['Core product squad', 'Customer success pods', 'Cloud infrastructure and tooling'],
      pricingStrategy: 'Usage-based floor with expansion pricing tied to automated workflows.',
      scalability: 'Modular architecture and playbooks enable regional pods without custom rebuilds.'
    },
    launchStrategy: {
      phases: [
        {
          name: 'Launch wave 1',
          timeline: 'Weeks 1-4',
          goals: ['Secure three design partners', 'Publish thought leadership asset'],
          tactics: ['Founder-led outreach', 'Industry roundtable', 'Co-marketing with integrators']
        },
        {
          name: 'Launch wave 2',
          timeline: 'Weeks 5-8',
          goals: ['Activate referral program', 'Host live product workshop'],
          tactics: ['Customer referral incentives', 'Partner webinar', 'Targeted paid experiments']
        },
        {
          name: 'Launch wave 3',
          timeline: 'Weeks 9-12',
          goals: ['Scale inbound pipeline', 'Transition to repeatable sales motion'],
          tactics: ['Content and SEO engine', 'SDR enablement kit', 'Lifecycle nurture sequences']
        }
      ],
      marketingChannels: ['Founder-led outbound', 'Partner ecosystem', 'Content and community'],
      budgetAllocation: ['40% demand generation', '35% customer success enablement', '25% product-led growth experiments']
    },
    operationalPlan: {
      teamStructure: ['Core squad: PM, tech lead, three engineers, designer', 'Customer success pod (CSM + support)'],
      processes: ['Weekly growth/product council', 'Incident response and post-mortem ritual', 'Quarterly roadmap + finance sync'],
      infrastructure: ['Observability stack', 'CRM and success tools', 'Automation platform for workflows'],
      riskManagement: ['Risk register with owners', 'Runway and burn-down tracker', 'Vendor redundancy plan']
    },
    actionItems: [
      'Define hiring plan for the success pod once pilot conversion hits target',
      'Document onboarding checklist with QA gates',
      'Create shared scorecard for product, growth, and success teams'
    ]
  },
  executionPlan: defaultExecutionPlan,
  metadata: {
    ideaTitle: 'New market idea',
    generatedAt: new Date().toISOString(),
    estimatedReadTime: 12,
    implementationTimeframe: '90 days',
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

  lines.push(`# ${guide.metadata.ideaTitle} - Landing Coach Guide`)
  lines.push(`Generated: ${new Date(guide.metadata.generatedAt).toLocaleString()}`)
  lines.push(`Execution window: ${guide.metadata.implementationTimeframe}`)
  lines.push(`Confidence: ${formatPercent(guide.metadata.confidenceLevel)}`)
  if (guide.metadata.winner) {
    lines.push(`Winning persona: ${guide.metadata.winner}`)
  }
  if (typeof guide.metadata.winningBid === 'number') {
    lines.push(`Winning bid: ${guide.metadata.winningBid}`)
  }
  lines.push('')

  lines.push('## 1. Current Situation & Alignment')
  lines.push(`**Overview:** ${guide.currentSituation.summary}`)
  if (guide.currentSituation.keyInsights.length) {
    lines.push('**Key insights:**')
    guide.currentSituation.keyInsights.forEach(item => lines.push(`- ${item}`))
  }
  lines.push('**Market reality:**')
  lines.push(`- Market size: ${guide.currentSituation.marketReality.marketSize}`)
  lines.push(`- Competitive landscape: ${guide.currentSituation.marketReality.competition}`)
  if (guide.currentSituation.marketReality.opportunities.length) {
    lines.push('  Opportunities:')
  }
  guide.currentSituation.marketReality.opportunities.forEach(item => lines.push(`  - ${item}`))
  if (guide.currentSituation.marketReality.challenges.length) {
    lines.push('  Challenges:')
  }
  guide.currentSituation.marketReality.challenges.forEach(item => lines.push(`  - ${item}`))
  lines.push(`**Target users:** ${guide.currentSituation.userNeeds.targetUsers}`)
  if (guide.currentSituation.userNeeds.painPoints.length) {
    lines.push('  Pain points:')
    guide.currentSituation.userNeeds.painPoints.forEach(item => lines.push(`  - ${item}`))
  }
  if (guide.currentSituation.userNeeds.solutions.length) {
    lines.push('  Proposed solutions:')
    guide.currentSituation.userNeeds.solutions.forEach(item => lines.push(`  - ${item}`))
  }
  if (guide.currentSituation.actionItems.length) {
    lines.push('**Immediate actions:**')
    guide.currentSituation.actionItems.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`))
  }
  lines.push('')

  lines.push('## 2. MVP Definition & Validation')
  lines.push(`**Product focus:** ${guide.mvpDefinition.productConcept.uniqueValue}`)
  if (guide.mvpDefinition.productConcept.coreFeatures.length) {
    lines.push('**Core capabilities:**')
    guide.mvpDefinition.productConcept.coreFeatures.forEach(item => lines.push(`- ${item}`))
  }
  lines.push(`**Minimum scope:** ${guide.mvpDefinition.productConcept.minimumScope}`)
  if (guide.mvpDefinition.developmentPlan.phases.length) {
    lines.push('**Development plan:**')
    guide.mvpDefinition.developmentPlan.phases.forEach(phase => {
      lines.push(`- ${phase.name} (${phase.duration})`)
      lines.push(`  Deliverables: ${phase.deliverables.join(', ')}`)
      if (phase.resources.length) {
        lines.push(`  Resources: ${phase.resources.join(', ')}`)
      }
    })
  }
  lines.push(`**Tech stack:** ${guide.mvpDefinition.developmentPlan.techStack.join(', ')}`)
  lines.push(`**Estimated cost:** ${guide.mvpDefinition.developmentPlan.estimatedCost}`)
  if (guide.mvpDefinition.validationStrategy.hypotheses.length) {
    lines.push('**Validation hypotheses:**')
    guide.mvpDefinition.validationStrategy.hypotheses.forEach(item => lines.push(`- ${item}`))
  }
  if (guide.mvpDefinition.validationStrategy.experiments.length) {
    lines.push('**Experiments:**')
    guide.mvpDefinition.validationStrategy.experiments.forEach(item => lines.push(`- ${item}`))
  }
  if (guide.mvpDefinition.validationStrategy.successMetrics.length) {
    lines.push('**Success metrics:**')
    guide.mvpDefinition.validationStrategy.successMetrics.forEach(item => lines.push(`- ${item}`))
  }
  lines.push(`**Validation timeline:** ${guide.mvpDefinition.validationStrategy.timeline}`)
  if (guide.mvpDefinition.actionItems.length) {
    lines.push('**Near-term actions:**')
    guide.mvpDefinition.actionItems.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`))
  }
  lines.push('')

  lines.push('## 3. Business Model & Operations')
  lines.push('**Business model:**')
  lines.push(`- Revenue streams: ${guide.businessExecution.businessModel.revenueStreams.join(', ')}`)
  lines.push(`- Cost structure: ${guide.businessExecution.businessModel.costStructure.join(', ')}`)
  lines.push(`- Pricing strategy: ${guide.businessExecution.businessModel.pricingStrategy}`)
  lines.push(`- Scalability: ${guide.businessExecution.businessModel.scalability}`)
  if (guide.businessExecution.launchStrategy.phases.length) {
    lines.push('**Launch plan:**')
    guide.businessExecution.launchStrategy.phases.forEach(phase => {
      lines.push(`- ${phase.name} (${phase.timeline})`)
      lines.push(`  Goals: ${phase.goals.join(', ')}`)
      if (phase.tactics.length) {
        lines.push(`  Tactics: ${phase.tactics.join(', ')}`)
      }
    })
  }
  lines.push(`- Marketing channels: ${guide.businessExecution.launchStrategy.marketingChannels.join(', ')}`)
  lines.push(`- Budget allocation: ${guide.businessExecution.launchStrategy.budgetAllocation.join(', ')}`)
  lines.push('**Operations:**')
  lines.push(`- Team structure: ${guide.businessExecution.operationalPlan.teamStructure.join(', ')}`)
  lines.push(`- Processes: ${guide.businessExecution.operationalPlan.processes.join(', ')}`)
  lines.push(`- Infrastructure: ${guide.businessExecution.operationalPlan.infrastructure.join(', ')}`)
  lines.push(`- Risk management: ${guide.businessExecution.operationalPlan.riskManagement.join(', ')}`)
  if (guide.businessExecution.actionItems.length) {
    lines.push('**Operational priorities:**')
    guide.businessExecution.actionItems.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`))
  }
  lines.push('')

  if (guide.executionPlan) {
    lines.push('## 4. 90-Day Execution Plan')
    lines.push(`**Mission:** ${guide.executionPlan.mission}`)
    lines.push(`**Summary:** ${guide.executionPlan.summary}`)
    lines.push('### Phases')
    guide.executionPlan.phases.forEach(phase => {
      lines.push(`- ${phase.name} (${phase.timeline})`)
      lines.push(`  Focus: ${phase.focus}`)
      lines.push(`  Key outcomes: ${phase.keyOutcomes.join(', ')}`)
      lines.push(`  Metrics: ${phase.metrics.join(', ')}`)
    })
    lines.push('### Weekly sprints')
    guide.executionPlan.weeklySprints.forEach(sprint => {
      lines.push(`- ${sprint.name}`)
      lines.push(`  Focus: ${sprint.focus}`)
      lines.push(`  Objectives: ${sprint.objectives.join(', ')}`)
      lines.push(`  Feedback hooks: ${sprint.feedbackHooks.join(', ')}`)
    })
    lines.push('### Feedback loop')
    lines.push(`- Cadence: ${guide.executionPlan.feedbackLoop.cadence.join(', ')}`)
    lines.push(`- Channels: ${guide.executionPlan.feedbackLoop.channels.join(', ')}`)
    lines.push(`- Decision gates: ${guide.executionPlan.feedbackLoop.decisionGates.join(', ')}`)
    lines.push(`- Tooling: ${guide.executionPlan.feedbackLoop.tooling.join(', ')}`)
    lines.push('### Daily routines')
    guide.executionPlan.dailyRoutines.forEach(item => lines.push(`- ${item}`))
    lines.push('### Reviews & metrics')
    lines.push(`- Weekly review: ${guide.executionPlan.reviewFramework.weekly.join(', ')}`)
    lines.push(`- Monthly calibration: ${guide.executionPlan.reviewFramework.monthly.join(', ')}`)
    lines.push(`- Metrics to watch: ${guide.executionPlan.reviewFramework.dataWatch.join(', ')}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(
    'Note: Generated by the landing coach AI. Adjust to your context and validate with customer feedback and data before major investment.'
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
    missingFields.push('Market analysis')
    recommendations.push('Add market size, competitive insight, and clear problem statements.')
  }

  if (!report?.mvpGuidance) {
    missingFields.push('MVP definition and validation plan')
    recommendations.push('Describe MVP scope, validation experiments, and success metrics.')
  }

  if (!report?.businessModel) {
    missingFields.push('Business model and operations')
    recommendations.push('Detail revenue model, cost structure, and go-to-market approach.')
  }

  if (missingFields.length === 0 && !report?.executionPlan) {
    recommendations.push('Add a 90-day execution plan so the team can operationalise the insights.')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    recommendations
  }
}

export default transformReportToGuide
