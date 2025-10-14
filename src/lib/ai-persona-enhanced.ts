import { AI_PERSONAS } from '@/lib/ai-persona-system'
import type { AIPersona } from '@/lib/ai-persona-system'
import { getAgentBudget, deductAgentBudget, hasEnoughBudget } from '@/lib/agent-budget'

export type BidPhase = 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result'
export type PersonaTheme = 'market' | 'technology' | 'product' | 'general'

export interface PersonaBidContext {
  ideaContent: string
  round: number
  phase: BidPhase
  previousBids?: Record<string, number>
  highlights?: string[]
  theme?: PersonaTheme
}

export interface PersonaBidResult {
  persona: AIPersona
  personaId: string
  score: number
  bidAmount: number
  confidence: number
  comment: string
}

const BASE_NEUTRAL_SCORE = 60

const styleMultipliers: Record<AIPersona['biddingStyle'], number> = {
  conservative: 0.9,
  aggressive: 1.1,
  strategic: 1.05,
  emotional: 1,
  analytical: 1.05
}

const themeKeywords: Record<PersonaTheme, string[]> = {
  market: ['market', 'user', 'customer', 'revenue', 'business', 'competition'],
  technology: ['technology', 'tech', 'system', 'architecture', 'algorithm', 'model', 'data'],
  product: ['product', 'feature', 'experience', 'design', 'ux', 'ui'],
  general: []
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const asList = (value: string[] | undefined) => value ?? []

interface PersonaPlaybook {
  focus: string
  contextNote: string
  momentumMoves: string[]
  polishMoves: string[]
  rescueMoves: string[]
  closingReminder: string
}

const PERSONA_PLAYBOOKS: Record<string, PersonaPlaybook> = {
  'tech-pioneer-alex': {
    focus: '技术架构',
    contextNote: '我会优先盯住数据流、性能和安全边界。',
    momentumMoves: [
      '把核心链路（数据采集→推理→回写）的性能指标整理成表格，并标记“已验证/待验证”。',
      '确认外部依赖（API、数据源、模型服务）的权限、配额与降级方案。',
      '安排一次 30 分钟技术演示，现场跑通端到端脚本和监控面板。'
    ],
    polishMoves: [
      '先画出端到端架构草图，把数据流、鉴权与缓存策略补齐。',
      '列出必须落地的自动化测试与监控指标，避免后续返工。',
      '把核心模块拆解成 2 周内可验证的开发任务，明确负责人和验收口径。'
    ],
    rescueMoves: [
      '补齐最小可行的数据样本与推理脚本，证明模型真的能跑通。',
      '把关键技术风险（性能、合规或成本）写清楚，并给出备选方案。',
      '在白板上演示一次端到端交互流程，确保需求理解没有偏差。'
    ],
    closingReminder: '下一轮请用数据回答“是否可行”这个问题。'
  },
  'business-guru-beta': {
    focus: '商业模型',
    contextNote: '我关心的是盈利路径和现金节奏是否稳得住。',
    momentumMoves: [
      '复盘竞价区间与目标客单价，给出未来 3 个月的现金流快照。',
      '把核心收费场景写成报价单，并备注可以追加销售的附加服务。',
      '提前约 3 位潜在买单方，确认采购流程、预算窗口与决策人。'
    ],
    polishMoves: [
      '搭建“价值证明 → 试用 → 成交”三步漏斗，为每一步设定可量化指标。',
      '拆解成本结构，标记前三个重成本，并写出控制动作与时间点。',
      '列出 2 个可落地的商业实验（AB 定价、预售等），明确验证窗口。'
    ],
    rescueMoves: [
      '讲清真实成交场景：谁付钱、什么时候付、付多少、为什么付。',
      '补上一张盈亏平衡表，算清固定成本、获客预算与现金流缺口。',
      '锁定一个具体客户样板，确认痛点、预算与采购流程。'
    ],
    closingReminder: '所有推演都要落到现金流时间表上。'
  },
  'innovation-mentor-charlie': {
    focus: '体验与品牌',
    contextNote: '我最在乎用户有没有被打动，故事能不能站住脚。',
    momentumMoves: [
      '把核心用户旅程拆成 3 个关键瞬间，明确每一刻的体验亮点。',
      '收集 5 条真实用户语录，验证故事线是否能引发共鸣。',
      '准备一份低保真原型或脚本，让非专业人士也能秒懂价值。'
    ],
    polishMoves: [
      '确认目标用户画像，补全场景、情绪与触发器。',
      '设计一个 15 分钟的用户共创工作坊议程，带回新灵感。',
      '列出“必须做/可以后延”的体验要素，保持节奏可控。'
    ],
    rescueMoves: [
      '先跑一轮定性访谈，弄清真实痛点与使用环境。',
      '用一句话讲清楚价值承诺，保证连同事都能复述。',
      '准备两种视觉/语调风格对比，尽快确定品牌基调。'
    ],
    closingReminder: '每一个体验决策都要落到真实用户反馈上。'
  },
  'market-insight-delta': {
    focus: '市场与增长',
    contextNote: '声量、转化和节奏要同步推进，否则就是自嗨。',
    momentumMoves: [
      '制定 launch 倒计时表，按天安排内容、渠道与预算。',
      '锁定 3 个带流量的合作位（KOL、社群或媒体）并提前约档期。',
      '准备高转化素材包（标题、短视频脚本、FAQ），保证随时能投放。'
    ],
    polishMoves: [
      '复盘竞品获客路径，标出我们能切入的差异化角度。',
      '在核心渠道跑一个小额试投，拿到真实的转化与成本数据。',
      '建立“话题雷达”表，列出未来四周可借势的行业热点。'
    ],
    rescueMoves: [
      '明确第一批种子用户在哪里，列出可直接触达的渠道/人名。',
      '写一版 30 秒电梯稿，告诉我为什么别人愿意分享你。',
      '制定危机应对脚本，提前准备好负面评论的回复逻辑。'
    ],
    closingReminder: '所有传播动作都要同步记录转化与花费。'
  },
  'investment-advisor-ivan': {
    focus: '结构化验证',
    contextNote: '证据链要完整，推论才能让人信服。',
    momentumMoves: [
      '把核心假设整理成表格：指标、验证方法与截止日期。',
      '建立一个数据仪表盘，实时追踪实验结果与偏差。',
      '准备一次 15 分钟的复盘会，向团队讲清推论与证据闭环。'
    ],
    polishMoves: [
      '写清楚问题空间、解决方案与证据之间的逻辑链。',
      '补上关键风险的定量估计，以及对应的缓解策略。',
      '让实验设计满足统计学标准：样本量、对照组与显著性。'
    ],
    rescueMoves: [
      '先用“如果……那么……”格式把假设重新写一遍。',
      '找到两份行业或学术报告支撑需求规模与政策风险。',
      '重做实验设计，确保结果可复现，而不是主观判断。'
    ],
    closingReminder: '下一轮讨论前请交付证据汇总表。'
  }
}

const DEFAULT_PLAYBOOK: PersonaPlaybook = {
  focus: '综合评估',
  contextNote: '我会综合看执行难度、价值与节奏。',
  momentumMoves: [
    '列出当前最有信心的 3 个动作，并标注验证时间。',
    '识别关键依赖（资源、合作方或技术）并确认可用性。',
    '准备一个面向团队的短复盘，确保所有人朝同一方向推进。'
  ],
  polishMoves: [
    '梳理价值链条，找出仍然模糊的环节并补充证据。',
    '把下一阶段任务拆解到周，避免失控或空转。',
    '明确成功指标，并建立一个简单的追踪机制。'
  ],
  rescueMoves: [
    '先确认这个创意要解决的核心问题是否描述清楚。',
    '用最小代价验证价值假设，避免投入被消耗掉。',
    '找一个真实用户对话，用事实校准我们的判断。'
  ],
  closingReminder: '保持节奏可见、证据透明。'
}

const keywordScore = (ideaContent: string, persona: AIPersona, theme: PersonaTheme) => {
  const normalized = ideaContent.toLowerCase()

  // 1. 检查内容是否过于简短或空泛
  const contentWords = normalized.split(/\s+/).filter(w => w.length > 1)
  if (contentWords.length < 5) {
    // 少于5个有效词，太空泛，直接返回极低分
    return -100
  }

  // 2. 检查是否只是通用词汇组合（如"AI+创意"、"互联网+项目"等）
  const genericPatterns = [
    /^(ai|人工智能|互联网|科技|技术|创意|项目|平台|系统|app|应用)[\+\s]*(创意|项目|平台|系统|想法|idea|concept)?$/i,
    /^(ai|互联网|科技)[\+\s]*$/i
  ]

  const isGenericOnly = genericPatterns.some(pattern => pattern.test(normalized.trim()))
  if (isGenericOnly) {
    return -100
  }

  // 3. 检查人设专业领域匹配度
  const focusMatches = persona.personality.filter(keyword => normalized.includes(keyword.toLowerCase())).length
  const triggerMatches = asList(persona.triggerKeywords).filter(keyword => normalized.includes(keyword.toLowerCase())).length
  const themeMatches = themeKeywords[theme].filter(keyword => normalized.includes(keyword.toLowerCase())).length

  // 4. 更严格的人设匹配阈值
  // 需要：至少2个personality关键词 或 (1个personality + 3个trigger) 或 5个trigger
  const hasStrongPersonalityMatch = focusMatches >= 2
  const hasModerateMatch = focusMatches >= 1 && triggerMatches >= 3
  const hasStrongTriggerMatch = triggerMatches >= 5
  const hasMinimalMatch = hasStrongPersonalityMatch || hasModerateMatch || hasStrongTriggerMatch

  // 5. 如果不符合人设要求，返回极低分
  if (!hasMinimalMatch) {
    return -80
  }

  // 6. 检查是否有实质性的业务描述（用户、场景、价值等）
  const businessKeywords = ['用户', '客户', '场景', '问题', '解决', '价值', '需求', '痛点', 'user', 'customer', 'problem', 'solution', 'value']
  const hasBusinessContext = businessKeywords.some(keyword => normalized.includes(keyword))

  if (!hasBusinessContext && focusMatches < 3) {
    // 没有业务背景且匹配度不高，也是空泛内容
    return -60
  }

  // 7. 正常匹配情况下的分数计算
  return focusMatches * 6 + triggerMatches * 4 + themeMatches * 2
}

const competitionPressure = (persona: AIPersona, currentBids: Map<string, number>) => {
  if (!currentBids.size) return 0
  const topBid = Math.max(...currentBids.values())
  const myBid = currentBids.get(persona.id) ?? 0
  const gap = topBid - myBid
  if (gap <= 0) return 5
  if (gap > 120) return 12
  if (gap > 60) return 8
  return 4
}

export function calculatePersonaScore(
  persona: AIPersona,
  ideaContent: string,
  theme: PersonaTheme,
  currentBids: Map<string, number>
): number {
  const base = BASE_NEUTRAL_SCORE
  const styleMultiplier = styleMultipliers[persona.biddingStyle] ?? 1
  const enthusiasm = keywordScore(ideaContent, persona, theme)
  const pressure = competitionPressure(persona, currentBids)
  const randomness = Math.random() * 8 - 4

  return clamp((base + enthusiasm + pressure + randomness) * styleMultiplier, 30, 95)
}

export function generatePersonaComment(
  persona: AIPersona,
  score: number,
  _ideaContent: string,
  highlights: string[] = []
): string {
  const playbook = PERSONA_PLAYBOOKS[persona.id] ?? DEFAULT_PLAYBOOK
  const highlightPart = highlights.length
    ? `我特别留意 ${highlights.join('、')} 这些点。`
    : playbook.contextNote

  // 根据persona定制评论开头和语气
  const personaHeaders: Record<string, (score: number) => string> = {
    'business-guru-beta': (s) => `哎呀妈呀！这买卖我看了看，给${Math.round(s)}分。${highlightPart}`,
    'tech-pioneer-alex': (s) => `Let me see... 技术评估${Math.round(s)}分。${highlightPart}`,
    'innovation-mentor-charlie': (s) => `这个创意让我感受到了价值~我给${Math.round(s)}分。${highlightPart}`,
    'market-insight-delta': (s) => `家人们！这个项目我评${Math.round(s)}分。${highlightPart}`,
    'investment-advisor-ivan': (s) => `经过系统分析，我给出${Math.round(s)}分的评价。${highlightPart}`
  }

  const personaTransitions: Record<string, { high: string; medium: string; low: string; veryLow: string }> = {
    'business-guru-beta': {
      high: '赚钱的路子清楚了，可以干！',
      medium: '方向对，但得把账算清楚：',
      low: '有风险啊，先把这些整明白：',
      veryLow: '这买卖不靠谱，赶紧刹车：'
    },
    'tech-pioneer-alex': {
      high: 'Architecture looks solid, 可以推进。',
      medium: '技术可行，但要注意：',
      low: 'Tech stack有隐患，建议：',
      veryLow: '技术风险太大，必须重构：'
    },
    'innovation-mentor-charlie': {
      high: '用户会爱上这个体验的！',
      medium: '体验不错，但还要优化：',
      low: '用户价值不够清晰，建议：',
      veryLow: '用户需求没抓准，需要重新思考：'
    },
    'market-insight-delta': {
      high: '流量密码找到了，冲冲冲！',
      medium: '有传播点，但要调整：',
      low: '传播力不够，得加强：',
      veryLow: '市场反应会很冷，建议：'
    },
    'investment-advisor-ivan': {
      high: '理论基础扎实，可以执行。',
      medium: '逻辑成立，但需补充：',
      low: '证据不足，建议完善：',
      veryLow: '理论风险较大，需要：'
    }
  }

  const getHeader = personaHeaders[persona.id] || ((s) => `${persona.name}（${playbook.focus}视角）给出 ${Math.round(s)} 分。${highlightPart}`)
  const transitions = personaTransitions[persona.id] || {
    high: '整体信号不错，可以直接冲刺。',
    medium: '方向基本成立，但还需要把下面的环节补紧：',
    low: '目前还在摇摆区，先把基础打扎实：',
    veryLow: '现在风险比机会大，先止血再谈扩张：'
  }

  const header = getHeader(score)
  const formatChecklist = (items: string[]) => items.map(item => `- ${item}`).join('\n')

  if (score >= 80) {
    return [
      header + transitions.high,
      formatChecklist(playbook.momentumMoves),
      `下一轮别忘了：${playbook.closingReminder}`
    ].join('\n')
  }

  if (score >= 65) {
    return [
      header + transitions.medium,
      formatChecklist(playbook.polishMoves),
      `下一轮别忘了：${playbook.closingReminder}`
    ].join('\n')
  }

  if (score >= 50) {
    return [
      header + transitions.low,
      formatChecklist(playbook.polishMoves),
      `下一轮别忘了：${playbook.closingReminder}`
    ].join('\n')
  }

  return [
    header + transitions.veryLow,
    formatChecklist(playbook.rescueMoves),
    `下一轮别忘了：${playbook.closingReminder}`
  ].join('\n')
}

const deriveBidAmount = async (
  personaId: string,
  score: number,
  baseOffset: number,
  previousBids: Record<string, number> = {}
): Promise<number> => {
  // 如果分数太低(不匹配人设)，直接返回0
  if (score < 30) {
    return 0
  }

  // 检查剩余预算
  const remainingBudget = await getAgentBudget(personaId).then(b => b.remainingBudget)
  if (remainingBudget <= 0) {
    return 0
  }

  const ambition = score / 100
  const currentHigh = Object.values(previousBids).reduce((max, value) => Math.max(max, value || 0), 0)
  const proposal = currentHigh * 0.6 + ambition * 200 + baseOffset
  const noise = Math.random() * 30 - 15

  // 计算初始出价
  const initialBid = Math.round(clamp(proposal + noise, 50, 500))

  // 考虑预算限制，保守出价(只用30%的预算在单个项目上)
  const maxBidForThisIdea = Math.min(initialBid, remainingBudget * 0.3)

  // 确保不低于50，但不超过剩余预算
  const finalBid = Math.min(Math.max(50, maxBidForThisIdea), remainingBudget)

  return Math.round(finalBid)
}

const resolveTheme = (phase: BidPhase, explicitTheme?: PersonaTheme): PersonaTheme => {
  if (explicitTheme) return explicitTheme
  if (phase === 'bidding') return 'market'
  if (phase === 'discussion') return 'product'
  return 'general'
}

export async function generateBiddingRound(context: PersonaBidContext): Promise<PersonaBidResult[]> {
  const { ideaContent, phase, round, previousBids = {}, highlights = [], theme } = context
  const resolvedTheme = resolveTheme(phase, theme)
  const currentBidMap = new Map(Object.entries(previousBids))

  // 为每个persona生成出价（并行处理）
  const results = await Promise.all(
    AI_PERSONAS.map(async (persona) => {
      const score = calculatePersonaScore(persona, ideaContent, resolvedTheme, currentBidMap)
      const bidAmount = await deriveBidAmount(persona.id, score, round * 10, previousBids)
      const comment = generatePersonaComment(persona, score, ideaContent, highlights)

      // 只有在实际出价时才扣除预算
      if (bidAmount > 0 && phase === 'bidding') {
        const result = await deductAgentBudget(persona.id, bidAmount)
        if (!result.success) {
          // 预算扣除失败，返回0出价
          console.warn(`[Agent Budget] ${persona.id} 预算扣除失败: ${result.error}`)
          return {
            persona,
            personaId: persona.id,
            score,
            bidAmount: 0,
            confidence: clamp(score / 100, 0.3, 0.95),
            comment: comment + '\n\n（注：我的预算已用完，暂时无法出价）'
          }
        }
      }

      return {
        persona,
        personaId: persona.id,
        score,
        bidAmount,
        confidence: clamp(score / 100, 0.3, 0.95),
        comment
      }
    })
  )

  return results
}

// 导出预算管理函数供外部使用
export async function getAgentRemainingBudget(personaId: string): Promise<number> {
  const budget = await getAgentBudget(personaId)
  return budget.remainingBudget
}

export async function resetAgentBudget(personaId: string): Promise<void> {
  // 这个函数已经在agent-budget.ts中实现，这里只是重新导出
  const { resetAgentBudget: reset } = await import('@/lib/agent-budget')
  await reset(personaId)
}

/**
 * 使用AI生成基于persona人设的个性化创意分析
 * 这个函数会被API路由调用，传入AIServiceManager实例
 */
export async function generateAIPersonaAnalysis(
  persona: AIPersona,
  ideaContent: string,
  score: number,
  aiService: any // AIServiceManager实例
): Promise<string> {
  const playbook = PERSONA_PLAYBOOKS[persona.id] ?? DEFAULT_PLAYBOOK

  // warmup阶段（score=70）使用简短的开场prompt
  const isWarmup = score === 70

  let analysisPrompt = ''

  if (isWarmup) {
    // warmup阶段：简短开场
    analysisPrompt = `你是${persona.name}，${persona.specialty}专家。

你的人设特点：
- 性格：${persona.personality.join('、')}
- 专长：${persona.specialty}
- 口头禅："${persona.catchPhrase}"

创意内容："${ideaContent}"

这是暖场阶段，请用50-100字简短点评：

1. **必须**用你的口头禅"${persona.catchPhrase}"或类似风格开场
2. **必须**保持你独特的说话风格和性格（${persona.personality.join('、')}）
3. 从你的专业视角简单点评创意
4. 直接、生动、有个性，不要客套话
5. **严禁**引用或扮演其他专家，只能以你自己的身份说话

${persona.id === 'business-guru-beta' ? '特别提示：老王你说话要接地气、有东北味儿，关注能不能赚钱，别太客气！例如："哎呀妈呀，这买卖能成不？"' : ''}
${persona.id === 'tech-pioneer-alex' ? '特别提示：艾克斯你说话可以中英夹杂，关注技术实现！例如："Technically speaking，这个架构..."' : ''}
${persona.id === 'innovation-mentor-charlie' ? '特别提示：小琳你说话要温柔、有共鸣感！例如："这个创意让我感受到..."' : ''}
${persona.id === 'market-insight-delta' ? '特别提示：阿伦你说话要有网感、年轻化！例如："家人们，这个流量密码我找到了！"' : ''}
${persona.id === 'investment-advisor-ivan' ? '特别提示：李博你说话要严谨、学术化！例如："从理论角度分析..."' : ''}`
  } else {
    // discussion/bidding阶段：深度分析
    analysisPrompt = `你是${persona.name}，一位专注于${playbook.focus}的专家。

你的人设特点：
- 性格：${persona.personality.join('、')}
- 专长：${persona.specialty}
- 口头禅："${persona.catchPhrase}"
- 分析视角：${playbook.focus}
- 关注点：${playbook.contextNote}

现在请你基于自己的专业视角，对以下创意进行深入分析：

创意内容：
${ideaContent}

你的评分是：${Math.round(score)}分

请按照以下格式输出你的分析（150-200字）：

1. 开头用你的口头禅或符合性格的开场白
2. 从你的专业视角（${playbook.focus}）指出创意的亮点或问题
3. 给出2-3条具体的、可执行的建议
4. 用符合你性格的语气收尾

严格要求：
- **必须**基于创意的具体内容进行分析，不要泛泛而谈
- **必须**体现你的专业领域和人设特点
- **必须**语气符合你的性格（${persona.personality.join('、')}）
- **必须**建议具体、可操作
- **严禁**引用其他专家（如"王博士"、"李首席"等），只能以你自己的身份说话
- **严禁**使用"综合评估"、"专家会诊"等第三视角的格式
- **必须**控制在150-200字以内，不要超出`
  }

  try {
    const response = await aiService.callSingleService({
      provider: persona.primaryModel,
      persona: persona.id,
      context: {
        idea: ideaContent,
        phase: isWarmup ? 'warmup' : 'discussion',
        round: 1,
        previousMessages: [],
        currentBids: {},
        sessionHistory: []
      },
      systemPrompt: `你是${persona.name}，必须严格按照你的人设说话。`,
      userPrompt: analysisPrompt,
      temperature: 0.7, // 降低温度减少随意发挥
      maxTokens: isWarmup ? 150 : 300 // warmup: 50-100字≈75-150 tokens, discussion/bidding: 150-200字≈225-300 tokens
    })

    return response.content || generatePersonaComment(persona, score, ideaContent, [])
  } catch (error) {
    console.error(`AI分析生成失败 (${persona.name}):`, error)
    // 降级到模板评论
    return generatePersonaComment(persona, score, ideaContent, [])
  }
}

export { AI_PERSONAS, type AIPersona }
