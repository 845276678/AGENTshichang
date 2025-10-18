/**
 * AI角色辩论机制系统
 *
 * 实现AI专家之间的观点碰撞和辩论，增强竞价过程的互动性
 */

import type { AIPersona } from '@/lib/ai-persona-enhanced'

// 辩论消息接口
export interface DebateMessage {
  id: string
  personaId: string
  personaName: string
  content: string
  timestamp: Date
  emotion: 'confident' | 'aggressive' | 'skeptical' | 'supportive' | 'neutral'
  type: 'debate' | 'counter' | 'support' | 'question'
  targetPersonaId?: string  // 回应的目标专家
  debateTopic: string       // 辩论主题
}

// 辩论主题枚举
export enum DebateTopic {
  MARKET_SIZE = 'market_size',           // 市场规模
  TECHNICAL_FEASIBILITY = 'tech_feasibility', // 技术可行性
  BUSINESS_MODEL = 'business_model',     // 商业模式
  COMPETITION = 'competition',           // 竞争分析
  RESOURCE_REQUIREMENT = 'resources',    // 资源需求
  RISK_ASSESSMENT = 'risks',             // 风险评估
  INNOVATION = 'innovation',             // 创新程度
  EXECUTION = 'execution'                // 执行难度
}

// 辩论主题配置
const DEBATE_TOPIC_CONFIG: Record<DebateTopic, {
  keywords: string[]
  proTemplate: string[]
  conTemplate: string[]
  neutralTemplate: string[]
}> = {
  [DebateTopic.MARKET_SIZE]: {
    keywords: ['市场', '用户', '规模', '需求'],
    proTemplate: [
      '我认为这个市场前景广阔，{reason}',
      '从市场数据来看，{reason}，潜力巨大',
      '目标用户群体明确，{reason}，市场需求真实存在'
    ],
    conTemplate: [
      '我对市场规模持保守态度，{reason}',
      '市场可能被高估了，{reason}',
      '需要更多市场验证，因为{reason}'
    ],
    neutralTemplate: [
      '市场规模需要进一步调研，特别是{reason}',
      '建议关注细分市场，{reason}'
    ]
  },
  [DebateTopic.TECHNICAL_FEASIBILITY]: {
    keywords: ['技术', '开发', '实现', '功能'],
    proTemplate: [
      '技术实现完全可行，{reason}',
      '现有技术栈足够支持，{reason}',
      '技术方案清晰可行，{reason}'
    ],
    conTemplate: [
      '技术难度可能被低估，{reason}',
      '存在明显的技术瓶颈，{reason}',
      '技术风险较高，{reason}'
    ],
    neutralTemplate: [
      '技术可行但需要专业团队，{reason}',
      '建议分阶段实现，{reason}'
    ]
  },
  [DebateTopic.BUSINESS_MODEL]: {
    keywords: ['商业', '盈利', '收入', '变现'],
    proTemplate: [
      '商业模式清晰可行，{reason}',
      '盈利路径明确，{reason}',
      '变现方式多样化，{reason}'
    ],
    conTemplate: [
      '商业模式不够清晰，{reason}',
      '盈利能力存疑，{reason}',
      '变现难度较大，{reason}'
    ],
    neutralTemplate: [
      '商业模式需要迭代优化，{reason}',
      '建议先验证核心价值，{reason}'
    ]
  },
  [DebateTopic.COMPETITION]: {
    keywords: ['竞争', '对手', '差异化', '优势'],
    proTemplate: [
      '竞争优势明显，{reason}',
      '差异化清晰，{reason}',
      '护城河足够深，{reason}'
    ],
    conTemplate: [
      '竞争压力巨大，{reason}',
      '缺乏明显差异化，{reason}',
      '容易被模仿，{reason}'
    ],
    neutralTemplate: [
      '需要强化差异化，{reason}',
      '建议关注竞争动态，{reason}'
    ]
  },
  [DebateTopic.RESOURCE_REQUIREMENT]: {
    keywords: ['团队', '资源', '投入', '成本'],
    proTemplate: [
      '资源需求合理，{reason}',
      '团队配置可行，{reason}',
      '投入产出比良好，{reason}'
    ],
    conTemplate: [
      '资源需求过高，{reason}',
      '团队要求苛刻，{reason}',
      '投入风险大，{reason}'
    ],
    neutralTemplate: [
      '需要合理控制资源投入，{reason}',
      '建议分阶段配置资源，{reason}'
    ]
  },
  [DebateTopic.RISK_ASSESSMENT]: {
    keywords: ['风险', '挑战', '问题', '困难'],
    proTemplate: [
      '风险可控，{reason}',
      '主要挑战有应对方案，{reason}',
      '风险收益比合理，{reason}'
    ],
    conTemplate: [
      '存在重大风险，{reason}',
      '挑战可能被低估，{reason}',
      '风险管理方案不足，{reason}'
    ],
    neutralTemplate: [
      '需要制定详细风险预案，{reason}',
      '建议关注关键风险点，{reason}'
    ]
  },
  [DebateTopic.INNOVATION]: {
    keywords: ['创新', '新颖', '独特', '首创'],
    proTemplate: [
      '创新点突出，{reason}',
      '具有独特价值，{reason}',
      '创新方向正确，{reason}'
    ],
    conTemplate: [
      '创新度不足，{reason}',
      '缺乏实质性创新，{reason}',
      '创新点不够突出，{reason}'
    ],
    neutralTemplate: [
      '创新需要持续迭代，{reason}',
      '建议深化创新维度，{reason}'
    ]
  },
  [DebateTopic.EXECUTION]: {
    keywords: ['执行', '落地', '实施', '推进'],
    proTemplate: [
      '执行计划清晰，{reason}',
      '落地路径明确，{reason}',
      '可执行性强，{reason}'
    ],
    conTemplate: [
      '执行难度大，{reason}',
      '落地挑战多，{reason}',
      '执行计划不够详细，{reason}'
    ],
    neutralTemplate: [
      '需要细化执行方案，{reason}',
      '建议制定详细路线图，{reason}'
    ]
  }
}

// 识别辩论主题
export const identifyDebateTopics = (ideaContent: string): DebateTopic[] => {
  const content = ideaContent.toLowerCase()
  const topics: DebateTopic[] = []

  Object.entries(DEBATE_TOPIC_CONFIG).forEach(([topic, config]) => {
    const hasKeyword = config.keywords.some(keyword => content.includes(keyword))
    if (hasKeyword) {
      topics.push(topic as DebateTopic)
    }
  })

  // 如果没有识别到主题，返回默认主题
  if (topics.length === 0) {
    topics.push(DebateTopic.BUSINESS_MODEL, DebateTopic.MARKET_SIZE)
  }

  return topics
}

// 选择辩论者
export const selectDebaters = (
  personas: AIPersona[],
  count: number = 2
): AIPersona[] => {
  // 优先选择有冲突关系的专家
  const availablePersonas = [...personas]
  const selected: AIPersona[] = []

  // 第一个随机选择
  const first = availablePersonas[Math.floor(Math.random() * availablePersonas.length)]
  selected.push(first)

  // 第二个优先选择与第一个有冲突的
  if (first.conflicts && first.conflicts.length > 0) {
    const conflictPersona = availablePersonas.find(p =>
      first.conflicts!.includes(p.id) && p.id !== first.id
    )
    if (conflictPersona) {
      selected.push(conflictPersona)
      return selected.slice(0, count)
    }
  }

  // 如果没有冲突，随机选择不同专业领域的
  const remaining = availablePersonas.filter(p => p.id !== first.id)
  while (selected.length < count && remaining.length > 0) {
    const nextIndex = Math.floor(Math.random() * remaining.length)
    selected.push(remaining[nextIndex])
    remaining.splice(nextIndex, 1)
  }

  return selected.slice(0, count)
}

// 生成辩论立场
const generateStance = (
  persona: AIPersona,
  topic: DebateTopic,
  ideaContent: string
): 'pro' | 'con' | 'neutral' => {
  // 根据专家特性和创意内容决定立场
  const specialty = persona.specialty?.toLowerCase() || ''
  const personality = persona.personality?.toLowerCase() || ''
  const content = ideaContent.toLowerCase()

  let proScore = 0.5 // 基础分

  // 根据专业领域匹配度调整
  if (topic === DebateTopic.TECHNICAL_FEASIBILITY) {
    if (specialty.includes('技术') || specialty.includes('工程')) {
      if (content.includes('技术')) proScore += 0.2
    }
  }

  if (topic === DebateTopic.MARKET_SIZE || topic === DebateTopic.BUSINESS_MODEL) {
    if (specialty.includes('市场') || specialty.includes('商业')) {
      if (content.includes('市场') || content.includes('用户')) proScore += 0.2
    }
  }

  // 根据性格调整
  if (personality.includes('激进') || personality.includes('乐观')) {
    proScore += 0.15
  } else if (personality.includes('保守') || personality.includes('谨慎')) {
    proScore -= 0.15
  }

  // 随机因素
  proScore += (Math.random() - 0.5) * 0.2

  if (proScore > 0.6) return 'pro'
  if (proScore < 0.4) return 'con'
  return 'neutral'
}

// 生成辩论内容
export const generateDebateContent = (
  persona: AIPersona,
  topic: DebateTopic,
  ideaContent: string,
  stance?: 'pro' | 'con' | 'neutral'
): string => {
  const actualStance = stance || generateStance(persona, topic, ideaContent)
  const config = DEBATE_TOPIC_CONFIG[topic]

  let templates: string[]
  if (actualStance === 'pro') {
    templates = config.proTemplate
  } else if (actualStance === 'con') {
    templates = config.conTemplate
  } else {
    templates = config.neutralTemplate
  }

  // 随机选择模板
  const template = templates[Math.floor(Math.random() * templates.length)]

  // 生成理由
  const reasons = generateReasoning(persona, topic, ideaContent, actualStance)
  const reason = reasons[Math.floor(Math.random() * reasons.length)]

  return template.replace('{reason}', reason)
}

// 生成理由
const generateReasoning = (
  persona: AIPersona,
  topic: DebateTopic,
  ideaContent: string,
  stance: 'pro' | 'con' | 'neutral'
): string[] => {
  const reasons: string[] = []

  switch (topic) {
    case DebateTopic.MARKET_SIZE:
      if (stance === 'pro') {
        reasons.push('目标用户群体规模可观')
        reasons.push('市场增长趋势明显')
        reasons.push('用户痛点清晰')
      } else if (stance === 'con') {
        reasons.push('目标市场可能过于细分')
        reasons.push('市场教育成本高')
        reasons.push('用户付费意愿不明确')
      } else {
        reasons.push('建议进行详细的市场调研')
        reasons.push('可以先从细分市场切入')
      }
      break

    case DebateTopic.TECHNICAL_FEASIBILITY:
      if (stance === 'pro') {
        reasons.push('技术栈成熟可靠')
        reasons.push('开发难度在可控范围')
        reasons.push('有成功案例可以参考')
      } else if (stance === 'con') {
        reasons.push('技术实现复杂度高')
        reasons.push('需要专业技术团队')
        reasons.push('可能遇到技术瓶颈')
      } else {
        reasons.push('建议做技术可行性验证')
        reasons.push('可以考虑分阶段实现')
      }
      break

    case DebateTopic.BUSINESS_MODEL:
      if (stance === 'pro') {
        reasons.push('盈利模式多元化')
        reasons.push('用户付费意愿强')
        reasons.push('有清晰的现金流预期')
      } else if (stance === 'con') {
        reasons.push('盈利模式需要验证')
        reasons.push('变现周期较长')
        reasons.push('收入预期不够稳定')
      } else {
        reasons.push('建议先验证核心价值主张')
        reasons.push('可以探索多种变现方式')
      }
      break

    default:
      reasons.push('需要更多信息才能判断')
      reasons.push('建议进一步分析')
  }

  return reasons
}

// 生成辩论对话
export const generateDebateMessages = (
  personas: AIPersona[],
  ideaContent: string,
  roundCount: number = 2
): DebateMessage[] => {
  const messages: DebateMessage[] = []
  const topics = identifyDebateTopics(ideaContent)
  const debaters = selectDebaters(personas, 2)

  if (debaters.length < 2) return messages

  const [persona1, persona2] = debaters
  const mainTopic = topics[0] || DebateTopic.BUSINESS_MODEL

  // 第一轮：提出观点
  const stance1 = generateStance(persona1, mainTopic, ideaContent)
  messages.push({
    id: `debate_${Date.now()}_${persona1.id}`,
    personaId: persona1.id,
    personaName: persona1.name,
    content: generateDebateContent(persona1, mainTopic, ideaContent, stance1),
    timestamp: new Date(),
    emotion: stance1 === 'pro' ? 'confident' : stance1 === 'con' ? 'skeptical' : 'neutral',
    type: 'debate',
    debateTopic: mainTopic
  })

  // 第二轮：回应
  const stance2 = stance1 === 'pro' ? 'con' : 'pro' // 反对立场
  messages.push({
    id: `debate_${Date.now() + 1}_${persona2.id}`,
    personaId: persona2.id,
    personaName: persona2.name,
    content: generateDebateContent(persona2, mainTopic, ideaContent, stance2),
    timestamp: new Date(Date.now() + 1000),
    emotion: stance2 === 'pro' ? 'confident' : 'aggressive',
    type: 'counter',
    targetPersonaId: persona1.id,
    debateTopic: mainTopic
  })

  // 如果有更多轮次，继续辩论
  if (roundCount > 1 && topics.length > 1) {
    const secondTopic = topics[1]

    messages.push({
      id: `debate_${Date.now() + 2}_${persona1.id}`,
      personaId: persona1.id,
      personaName: persona1.name,
      content: generateDebateContent(persona1, secondTopic, ideaContent),
      timestamp: new Date(Date.now() + 2000),
      emotion: 'confident',
      type: 'debate',
      targetPersonaId: persona2.id,
      debateTopic: secondTopic
    })
  }

  return messages
}

// 辩论摘要生成
export const generateDebateSummary = (messages: DebateMessage[]): string => {
  if (messages.length === 0) return '暂无辩论内容'

  let summary = '=== 专家辩论摘要 ===\n\n'

  const topicGroups = messages.reduce((groups, msg) => {
    if (!groups[msg.debateTopic]) {
      groups[msg.debateTopic] = []
    }
    groups[msg.debateTopic].push(msg)
    return groups
  }, {} as Record<string, DebateMessage[]>)

  Object.entries(topicGroups).forEach(([topic, msgs]) => {
    summary += `主题: ${topic}\n`
    msgs.forEach(msg => {
      summary += `  ${msg.personaName}: ${msg.content}\n`
    })
    summary += '\n'
  })

  return summary
}