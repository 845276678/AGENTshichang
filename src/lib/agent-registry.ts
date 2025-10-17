/**
 * Agent注册中心
 * 统一管理所有Agent的配置信息
 */

// Agent模块类型
export type AgentModule = 'bidding' | 'workshop' | 'assessment'

// Agent基础信息接口
export interface AgentBase {
  id: string
  name: string
  avatar: string
  description: string
  tags: string[]
}

// 竞价Agent接口
export interface BiddingAgent extends AgentBase {
  module: 'bidding'
  role: string
  specialty: string
  personality: string
  catchPhrase: string
}

// 工作坊Agent接口
export interface WorkshopAgent extends AgentBase {
  module: 'workshop'
  role: string
  workshops: string[]
  expertise: Record<string, string>
}

// 评估Agent接口
export interface AssessmentAgent extends AgentBase {
  module: 'assessment'
  role: string
  dimensions: string[]
}

// 联合类型
export type Agent = BiddingAgent | WorkshopAgent | AssessmentAgent

// ============================================
// 竞价系统 - 5位AI竞价师
// ============================================

export const BIDDING_AGENTS: BiddingAgent[] = [
  {
    id: 'tech-pioneer-alex',
    module: 'bidding',
    name: '科技先锋 · 艾克斯',
    avatar: '👨‍💻',
    role: '技术竞价师',
    specialty: '科技创新',
    description: '专注高科技和未来科技项目，只对颠覆性、具有技术可行性的创意感兴趣，出价豪爽但眼光犀利。',
    tags: ['AI技术', '区块链', '物联网', '技术架构'],
    personality: '严谨理性 · 中英夹杂',
    catchPhrase: 'Technically speaking...'
  },
  {
    id: 'business-guru-beta',
    module: 'bidding',
    name: '商业教父 · 老王',
    avatar: '👴',
    role: '商业竞价师',
    specialty: '商业策略',
    description: '关注商业价值的精明商人，专门寻找能赚钱、有市场前景的商业创意和方案。',
    tags: ['商业模式', '市场营销', '盈利方案', '现金流'],
    personality: '务实精明 · 接地气',
    catchPhrase: '哎呀妈呀，这买卖...'
  },
  {
    id: 'innovation-mentor-charlie',
    module: 'bidding',
    name: '文艺少女 · 小琳',
    avatar: '👧',
    role: '创意竞价师',
    specialty: '文艺创作',
    description: '寻找故事、诗歌、艺术创意的温柔少女，对情感描述敏感，喜欢有温度有故事的创意想法。',
    tags: ['诗歌文学', '艺术创作', '情感故事', '用户体验'],
    personality: '感性温柔 · 有共鸣',
    catchPhrase: '这个创意让我感受到...'
  },
  {
    id: 'market-insight-delta',
    module: 'bidding',
    name: '市场洞察 · 阿伦',
    avatar: '📊',
    role: '市场竞价师',
    specialty: '市场营销',
    description: '年轻活力的市场专家，擅长捕捉流量密码和传播机会，关注市场反应和增长潜力。',
    tags: ['市场增长', '流量运营', '传播策略', '用户获取'],
    personality: '活力十足 · 网感强',
    catchPhrase: '家人们，这个流量密码...'
  },
  {
    id: 'investment-advisor-ivan',
    module: 'bidding',
    name: '投资顾问 · 李博',
    avatar: '🎯',
    role: '投资竞价师',
    specialty: '投资分析',
    description: '严谨的投资分析专家，注重结构化验证和证据链完整性，从投资回报角度评估项目。',
    tags: ['投资分析', '风险评估', '财务建模', '数据验证'],
    personality: '严谨专业 · 数据驱动',
    catchPhrase: '从数据来看...'
  }
]

// ============================================
// 工作坊顾问 - 6位专业导师
// ============================================

export const WORKSHOP_AGENTS: WorkshopAgent[] = [
  {
    id: 'alex',
    module: 'workshop',
    name: '产品战略顾问',
    avatar: '👨‍💼',
    role: '产品战略顾问',
    description: '专注于需求明确与MVP范围定义，帮助用户从模糊想法中提炼清晰需求。',
    tags: ['需求澄清', '产品战略', 'MVP范围', '功能优先级'],
    workshops: ['需求验证', 'MVP构建', '增长黑客', '商业模式'],
    expertise: {
      'demand-validation': '产品战略 · 目标客户分析',
      'mvp-builder': '需求明确 · MVP范围定义',
      'growth-hacking': '增长战略 · 目标设定',
      'profit-model': '商业战略 · 模式创新'
    }
  },
  {
    id: 'sophia',
    module: 'workshop',
    name: 'UI/框架设计师',
    avatar: '👩‍🎨',
    role: 'UI/框架设计师',
    description: 'UI/框架设计专家，帮助用户快速理解产品功能并设计简洁易用的用户体验。',
    tags: ['功能架构', '用户体验', '界面设计', '信息架构'],
    workshops: ['需求验证', 'MVP构建', '增长黑客'],
    expertise: {
      'demand-validation': '用户研究 · 需求验证',
      'mvp-builder': '功能设计 · 用户体验',
      'growth-hacking': '用户行为 · 转化优化'
    }
  },
  {
    id: 'marcus',
    module: 'workshop',
    name: '产品开发工程师',
    avatar: '👨‍💻',
    role: '产品开发工程师',
    description: '前端产品开发专家，专注技术实现与开发效率，推荐最简可行的技术方案。',
    tags: ['前端开发', '技术选型', '开发效率', '代码架构'],
    workshops: ['需求验证', 'MVP构建', '增长黑客', '商业模式'],
    expertise: {
      'demand-validation': '技术实现 · 可行性评估',
      'mvp-builder': '前端开发 · 技术实现',
      'growth-hacking': '产品增长 · A/B测试',
      'profit-model': '运营效率 · 流程优化'
    }
  },
  {
    id: 'elena',
    module: 'workshop',
    name: '商业模式专家',
    avatar: '👩‍💼',
    role: '商业专家',
    description: '商业模式与项目管理专家，帮助构建可持续的商业架构。',
    tags: ['商业模式', '项目管理', '资源整合', '营销增长'],
    workshops: ['需求验证', 'MVP构建', '增长黑客', '商业模式'],
    expertise: {
      'demand-validation': '商业模式 · 价值主张',
      'mvp-builder': '敏捷教练 · 项目管理',
      'growth-hacking': '营销增长 · 获客策略',
      'profit-model': '资源整合 · 合作伙伴'
    }
  },
  {
    id: 'david',
    module: 'workshop',
    name: '财务分析专家',
    avatar: '👨‍💼',
    role: '财务专家',
    description: '财务分析与风险控制专家，从财务角度评估项目可行性。',
    tags: ['财务分析', '投资回报', '数据分析', '风险控制'],
    workshops: ['需求验证', 'MVP构建', '增长黑客', '商业模式'],
    expertise: {
      'demand-validation': '财务分析 · 投资回报',
      'mvp-builder': '质量保障 · 风险控制',
      'growth-hacking': '数据分析 · 增长度量',
      'profit-model': '财务建模 · 盈利分析'
    }
  },
  {
    id: 'lisa',
    module: 'workshop',
    name: '合规/运营顾问',
    avatar: '👩‍⚖️',
    role: '合规/运营顾问',
    description: 'MVP可行性评估与合规指导专家，帮助控制项目范围并确保合规性。',
    tags: ['MVP可行性', '成本控制', '合规指导', '风险评估'],
    workshops: ['需求验证', 'MVP构建', '增长黑客', '商业模式'],
    expertise: {
      'demand-validation': '营销推广 · 品牌建设',
      'mvp-builder': 'MVP可行性 · 合规指导',
      'growth-hacking': '运营增长 · 社区建设',
      'profit-model': '市场拓展 · 规模化'
    }
  }
]

// ============================================
// 评估系统 - 1位综合分析师
// ============================================

export const ASSESSMENT_AGENTS: AssessmentAgent[] = [
  {
    id: 'maturity-assessor',
    module: 'assessment',
    name: '成熟度分析师',
    avatar: '🎯',
    role: '综合评估',
    description: '基于10分制对创意进行5维度综合评估，提供专业改进建议和工作坊推荐。',
    tags: ['成熟度评估', '多维分析', '专业建议', '工作坊推荐'],
    dimensions: [
      '目标客户清晰度',
      '需求场景具体性',
      '核心价值独特性',
      '商业模式可行性',
      '可信度与证据'
    ]
  }
]

// ============================================
// Agent注册表（所有Agent）
// ============================================

export const ALL_AGENTS: Agent[] = [
  ...BIDDING_AGENTS,
  ...WORKSHOP_AGENTS,
  ...ASSESSMENT_AGENTS
]

// ============================================
// 工具函数
// ============================================

/**
 * 根据ID获取Agent
 */
export function getAgentById(id: string): Agent | undefined {
  return ALL_AGENTS.find(agent => agent.id === id)
}

/**
 * 根据模块获取Agents
 */
export function getAgentsByModule(module: AgentModule): Agent[] {
  return ALL_AGENTS.filter(agent => agent.module === module)
}

/**
 * 获取竞价Agents
 */
export function getBiddingAgents(): BiddingAgent[] {
  return BIDDING_AGENTS
}

/**
 * 获取工作坊Agents
 */
export function getWorkshopAgents(): WorkshopAgent[] {
  return WORKSHOP_AGENTS
}

/**
 * 获取评估Agents
 */
export function getAssessmentAgents(): AssessmentAgent[] {
  return ASSESSMENT_AGENTS
}

/**
 * 按板块分组获取所有Agents
 */
export function getAgentsGroupedByModule() {
  return {
    bidding: BIDDING_AGENTS,
    workshop: WORKSHOP_AGENTS,
    assessment: ASSESSMENT_AGENTS
  }
}
