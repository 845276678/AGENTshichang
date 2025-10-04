import type { ExecutionPlan } from "./types"

export interface ExecutionTemplateContext {
  ideaTitle: string
  industry?: string
  teamStrength?: string
}

export interface ExecutionTemplate {
  id: string
  label: string
  summary: string
  plan: ExecutionPlan
}

const BASE_EXECUTION_PLAN: ExecutionPlan = {
  mission: 'Focus the next 90 days on validating the product, customers, and business loop.',
  summary:
    'The roadmap is split into three phases. Each phase contains weekly sprints, feedback loops, and clear checkpoints to keep the team aligned.',
  phases: [
    {
      name: 'Phase 1 · Technical Validation',
      timeline: 'Day 1-30',
      focus: 'Build the core prototype and de-risk key technology.',
      keyOutcomes: ['Prototype of the main workflow', 'List of technical risks and mitigations', 'Observability and metrics wiring'],
      metrics: ['Prototype usability ≥ 80%', 'Technical risks resolved ≥ 70%']
    },
    {
      name: 'Phase 2 · Customer & MVP Validation',
      timeline: 'Day 31-60',
      focus: 'Collect high-quality user feedback and confirm the smallest sellable package.',
      keyOutcomes: ['100+ meaningful user touchpoints', 'Validated problem-solution fit', 'Defined paid offering'],
      metrics: ['Key flow completion ≥ 60%', 'NPS trend > 0']
    },
    {
      name: 'Phase 3 · Commercial Proof',
      timeline: 'Day 61-90',
      focus: 'Win the first paying customers and lock positive feedback loops.',
      keyOutcomes: ['First paying or committed users', 'Clear monetisation hypothesis', 'Operational SOP ready for replication'],
      metrics: ['Initial conversion meets target', 'Renewal / referral intent increasing']
    }
  ],
  weeklySprints: [
    {
      name: 'Weeks 1-2 · Technical Spike',
      focus: 'Confirm stack, unblock data/model access, surface key risks.',
      objectives: ['Complete technical discovery and PoC', 'Set up data/model environment', 'Capture risk register'],
      feedbackHooks: ['Daily engineering stand-up', 'Risk log review']
    },
    {
      name: 'Weeks 3-4 · MVP & Customer Interviews',
      focus: 'Ship a demo-worthy MVP while running structured interviews.',
      objectives: ['Deliver demo prototype', 'Run 15+ deep interviews', 'Synthesize early insights'],
      feedbackHooks: ['Interview summary board', 'Weekly insight score']
    },
    {
      name: 'Weeks 5-8 · Data Driven Iterations',
      focus: 'Use in-product analytics to drive rapid iteration.',
      objectives: ['Ship instrumentation & dashboard', 'Run A/B experiments on key flows', 'Reduce drop-off metrics'],
      feedbackHooks: ['Behaviour review session', 'Product council check-in']
    },
    {
      name: 'Weeks 9-12 · Commercial Sprint',
      focus: 'Validate willingness to pay and build a repeatable loop.',
      objectives: ['Launch limited-time pilot offer', 'Close the first committed accounts', 'Document sales/support scripts'],
      feedbackHooks: ['Post-sale interviews', 'Weekly revenue stand-up']
    }
  ],
  feedbackLoop: {
    cadence: ['Daily stand-up for blockers and wins', 'Weekly retro + plan review', 'Monthly milestone & resource check'],
    channels: ['Deep customer interviews', 'Product analytics', 'Community / support signals', 'Offline field notes'],
    decisionGates: ['Is retention trending in target segments?', 'Is conversion improving?', 'Is infrastructure scaling safely?'],
    tooling: ['Project board (Notion/Jira)', 'Analytics dashboard', 'Feedback intake form', 'AI summary assistant']
  },
  dailyRoutines: [
    'Talk to at least three users every day to capture feedback',
    'Ship or polish one product improvement per day',
    'Update the core metric dashboard before end of day'
  ],
  reviewFramework: {
    weekly: ['Check progress vs. sprint goals', 'Summarise notable feedback and data wins', 'Agree experiments to run next'],
    monthly: ['Review milestone health', 'Adjust product and go-to-market priorities', 'Plan the next month’s growth bets'],
    dataWatch: ['DAU/WAU/MAU curves', 'Key feature usage frequency', 'Retention and conversion funnels', 'Feedback resolution time']
  }
}

export const NINETY_DAY_FOCUS_TEMPLATE: ExecutionTemplate = {
  id: 'default-90-day-plan',
  label: '90-Day Focus Plan',
  summary:
    'A battle-tested 90-day operating rhythm covering technology, customer discovery, monetisation and continuous positive feedback.',
  plan: BASE_EXECUTION_PLAN
}

export const TEMPLATE_LIBRARY: Record<string, ExecutionTemplate> = {
  default: NINETY_DAY_FOCUS_TEMPLATE
}

export function resolveExecutionTemplate(_context?: ExecutionTemplateContext): ExecutionTemplate {
  // Future work: choose template based on industry / team strength. For now always return the base template.
  return NINETY_DAY_FOCUS_TEMPLATE
}
