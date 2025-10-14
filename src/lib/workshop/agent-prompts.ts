/**
 * 工作坊 AI Agent 提示词模板
 *
 * 使用统一的Agent注册表，确保Agent配置的一致性
 */

// 从Agent注册表导入工作坊Agent配置
import { WORKSHOP_AGENTS, type WorkshopAgent } from '@/lib/agent-registry'

// 工作坊类型定义
export type WorkshopId = 'demand-validation' | 'mvp-builder' | 'growth-hacking' | 'profit-model'
export type AgentId = 'alex' | 'sophia' | 'marcus' | 'elena' | 'david' | 'lisa'

// Agent消息类型
export interface AgentMessage {
  id: string
  agentId: AgentId
  content: string
  type: 'question' | 'feedback' | 'suggestion' | 'validation' | 'case_study' | 'knowledge'
  relatedFormField?: string
  timestamp: Date
  suggestions?: string[]
  resources?: Array<{
    title: string
    url: string
    type: 'article' | 'video' | 'tool' | 'template'
  }>
  nextAction?: {
    type: 'fill_field' | 'review_section' | 'proceed'
    target?: string
  }
}

// 工作坊Agent配置 - 从agent-registry动态生成，确保与注册表同步
// 每个工作坊定义Agent在该工作坊中的具体角色和专长
export const WORKSHOP_AGENT_CONFIG = {
  'demand-validation': {
    title: '需求验证实验室',
    description: '通过科学的方法验证您的创意是否解决了真实需求',
    agents: {
      'alex': {
        role: '战略顾问',
        focus: '目标客户分析与市场定位',
        expertise: ['客户细分', '痛点识别', '竞争分析', '市场规模评估'],
        personality: '逻辑严谨，善于数据分析，会提出尖锐的战略问题'
      },
      'sophia': {
        role: '用户研究专家',
        focus: '需求验证与用户洞察',
        expertise: ['用户访谈', '问卷设计', '行为观察', '需求挖掘'],
        personality: '细致入微，善于倾听，能发现用户的潜在需求'
      },
      'marcus': {
        role: '技术架构专家',
        focus: '解决方案可行性评估',
        expertise: ['技术架构', '实现复杂度', '开发成本', '技术风险'],
        personality: '实用主义，关注可行性，会提出技术约束和建议'
      },
      'elena': {
        role: '商业模式专家',
        focus: '价值主张与商业逻辑',
        expertise: ['价值主张画布', '收入模式', '成本结构', '商业可行性'],
        personality: '商业嗅觉敏锐，善于发现商机，会质疑商业逻辑'
      },
      'david': {
        role: '财务分析专家',
        focus: '经济效益与投资回报',
        expertise: ['财务建模', '投资回报', '现金流', '风险评估'],
        personality: '数字敏感，风险意识强，会从财务角度审视项目'
      },
      'lisa': {
        role: '运营增长专家',
        focus: '市场推广与品牌建设',
        expertise: ['品牌定位', '推广策略', '渠道选择', '客户获取'],
        personality: '创意十足，善于沟通，能提出有效的营销方案'
      }
    }
  },

  'mvp-builder': {
    title: 'MVP构建工作坊',
    description: '快速构建最小可行产品，验证核心价值假设',
    agents: {
      'alex': {
        role: '战略顾问',
        focus: '产品定义与功能优先级',
        expertise: ['产品规划', '功能定义', '用户故事', 'MoSCoW优先级'],
        personality: '目标导向，善于平衡需求与资源，会推动产品决策'
      },
      'sophia': {
        role: '用户研究专家',
        focus: '用户体验与界面设计',
        expertise: ['用户流程', '界面设计', '可用性测试', '用户反馈'],
        personality: '用户至上，注重细节，会从用户角度审视产品'
      },
      'marcus': {
        role: '技术架构专家',
        focus: '技术方案与开发实现',
        expertise: ['技术选型', '架构设计', '开发规划', '性能优化'],
        personality: '技术驱动，追求最佳实践，会提出技术建议和约束'
      },
      'elena': {
        role: '商业模式专家',
        focus: '开发流程与项目管理',
        expertise: ['敏捷开发', '项目管理', '团队协作', '交付节奏'],
        personality: '流程优化，团队协调，会推动高效的开发流程'
      },
      'david': {
        role: '财务分析专家',
        focus: '测试策略与质量控制',
        expertise: ['测试策略', '质量标准', '风险控制', '上线准备'],
        personality: '严谨细致，风险意识强，会关注质量和稳定性'
      },
      'lisa': {
        role: '运营增长专家',
        focus: '产品运营与数据分析',
        expertise: ['运营策略', '数据分析', '用户增长', '产品迭代'],
        personality: '数据驱动，增长导向，会关注产品的市场表现'
      }
    }
  },

  'growth-hacking': {
    title: '增长黑客训练营',
    description: '运用数据驱动的方法实现快速增长',
    agents: {
      'alex': {
        role: '战略顾问',
        focus: '增长战略与目标设定',
        expertise: ['增长策略', '北极星指标', '增长模型', 'OKR设定'],
        personality: '战略思维，目标导向，善于制定增长战略和规划'
      },
      'sophia': {
        role: '用户研究专家',
        focus: '用户行为分析与优化',
        expertise: ['用户行为分析', '转化优化', '用户画像', '行为预测'],
        personality: '用户洞察，行为分析，能深度理解用户行为模式'
      },
      'marcus': {
        role: '技术架构专家',
        focus: '产品功能与增长机制',
        expertise: ['产品增长', '功能优化', 'A/B测试', '增长机制设计'],
        personality: '产品思维，实验导向，善于通过产品驱动增长'
      },
      'elena': {
        role: '商业模式专家',
        focus: '营销渠道与获客策略',
        expertise: ['渠道营销', '内容营销', '社交媒体', '病毒营销'],
        personality: '营销创新，渠道整合，能设计有效的营销增长策略'
      },
      'david': {
        role: '财务分析专家',
        focus: '数据分析与增长度量',
        expertise: ['数据分析', '增长指标', '漏斗分析', '留存分析'],
        personality: '数据驱动，分析严谨，通过数据发现增长机会'
      },
      'lisa': {
        role: '运营增长专家',
        focus: '用户运营与社区建设',
        expertise: ['用户运营', '社区运营', '活动策划', '用户留存'],
        personality: '运营思维，用户导向，善于通过运营手段促进增长'
      }
    }
  },

  'profit-model': {
    title: '商业模式设计',
    description: '设计可持续的盈利模式和商业架构',
    agents: {
      'alex': {
        role: '战略顾问',
        focus: '商业模式创新与战略规划',
        expertise: ['商业模式画布', '战略规划', '竞争策略', '价值创造'],
        personality: '战略视野，创新思维，善于设计可持续的商业模式'
      },
      'sophia': {
        role: '用户研究专家',
        focus: '客户关系与价值主张',
        expertise: ['价值主张设计', '客户关系管理', '客户细分', '服务设计'],
        personality: '客户中心，价值导向，深度理解客户需求和价值创造'
      },
      'marcus': {
        role: '技术架构专家',
        focus: '运营模式与效率优化',
        expertise: ['运营模式', '流程优化', '成本控制', '效率提升'],
        personality: '效率导向，流程优化，关注运营效率和成本控制'
      },
      'elena': {
        role: '商业模式专家',
        focus: '资源配置与合作伙伴',
        expertise: ['资源整合', '合作伙伴', '供应链', '生态构建'],
        personality: '资源整合，生态思维，善于构建合作伙伴网络'
      },
      'david': {
        role: '财务分析专家',
        focus: '财务模型与盈利分析',
        expertise: ['财务建模', '盈利分析', '投资回报', '财务规划'],
        personality: '财务严谨，数字敏感，通过财务角度评估商业可行性'
      },
      'lisa': {
        role: '运营增长专家',
        focus: '市场开拓与规模化',
        expertise: ['市场拓展', '规模化策略', '国际化', '品牌建设'],
        personality: '市场敏锐，拓展导向，善于发现市场机会和扩张策略'
      }
    }
  }
}

// 辅助函数：从注册表获取Agent基础信息
function getAgentFromRegistry(agentId: AgentId): WorkshopAgent | undefined {
  return WORKSHOP_AGENTS.find(agent => agent.id === agentId)
}

// Agent基础提示词模板
export const AGENT_BASE_PROMPT = {
  system: `你是一位经验丰富的{role}，正在指导用户完成{workshopTitle}。

## 你的专业背景
- 角色：{role}
- 专业领域：{focus}
- 核心技能：{expertise}
- 个性特点：{personality}

## 工作坊背景
- 工作坊：{workshopTitle}
- 目标：{workshopDescription}
- 当前步骤：第{currentStep}步
- 用户已填写：{completedFields}

## 互动原则
1. 保持你的专业角色和个性特点，像真实专家一样自然对话
2. 根据用户输入质量调整回复方式：
   - 如果输入过于空泛（如"AI项目"），引导用户描述具体场景和问题
   - 如果输入充实，给予深入的专业分析
3. 提出启发性问题帮助用户深入思考
4. 分享相关案例或最佳实践（可以简短）
5. 给出2-3条具体可执行的建议
6. 如果发现用户理解有误，温和地指出并解释
7. 控制在150-200字，保持专业但不生硬

## 回复风格
不要按照固定格式（"反馈-问题-建议"）机械输出，而是像真实专家交流那样：
- 先对用户输入给出总体评价
- 自然地穿插问题和建议
- 用对话的方式而不是列表的方式表达
- 可以用"我注意到..."、"我建议你..."、"有没有考虑过..."这样的自然表达

记住：你的目标是像一位经验丰富的导师一样，帮助用户深入思考并完善方案。`,

  user: `## 用户输入上下文
工作坊：{workshopTitle}
当前步骤：{currentStep} / {totalSteps}
相关表单字段：{fieldName}
用户当前填写内容：
{userInput}

## 已完成的表单数据
{formContext}

## 对话历史
{conversationHistory}

请基于以上信息，以{role}的身份给出专业指导。`
}

// 特殊场景提示词
export const SPECIAL_SCENARIOS = {
  // 表单验证场景
  validation: {
    prompt: `用户刚刚填写了{fieldName}字段，内容是：{fieldValue}

请从{role}的角度分析这个回答：
1. 是否充分和准确？
2. 是否有遗漏的重要方面？
3. 有什么具体的改进建议？
4. 可以提出1-2个深入思考的问题

保持专业但友好的语调。`
  },

  // 启发提问场景
  inspiration: {
    prompt: `用户在{fieldName}字段可能需要更多思考和启发。

请从{role}的角度：
1. 解释为什么这个方面很重要
2. 提供一个相关的简短案例（成功或失败）
3. 给出2-3个启发性问题帮助用户思考
4. 推荐1-2个有用的工具或方法

让用户感到受启发而不是被批评。`
  },

  // 知识补充场景
  knowledge: {
    prompt: `用户可能对{topic}这个概念不够清楚。

请从{role}的角度：
1. 用简单易懂的语言解释这个概念
2. 说明它为什么重要
3. 给出一个具体的例子
4. 提供实用的执行建议

避免过于理论化，注重实用性。`
  },

  // 案例分享场景
  case_study: {
    prompt: `用户的情况让你想到了一个相关案例。

请分享：
1. 案例背景（简要）
2. 遇到的挑战或机会
3. 采取的策略和方法
4. 结果和关键学习点
5. 对用户当前情况的启发

案例可以是成功的也可以是失败的，关键是有启发意义。`
  }
}

// Agent响应生成函数
export function generateAgentPrompt({
  workshopId,
  agentId,
  scenario = 'user',
  context
}: {
  workshopId: WorkshopId
  agentId: AgentId
  scenario?: 'user' | 'validation' | 'inspiration' | 'knowledge' | 'case_study'
  context: {
    currentStep?: number
    totalSteps?: number
    fieldName?: string
    fieldValue?: string
    userInput?: string
    formContext?: Record<string, any>
    conversationHistory?: AgentMessage[]
    topic?: string
  }
}) {
  const workshopConfig = WORKSHOP_AGENT_CONFIG[workshopId]
  const agentConfig = workshopConfig.agents[agentId]

  // 构建系统提示词
  const systemPrompt = AGENT_BASE_PROMPT.system
    .replace('{role}', agentConfig.role)
    .replace('{focus}', agentConfig.focus)
    .replace('{expertise}', agentConfig.expertise.join('、'))
    .replace('{personality}', agentConfig.personality)
    .replace('{workshopTitle}', workshopConfig.title)
    .replace('{workshopDescription}', workshopConfig.description)
    .replace('{currentStep}', context.currentStep?.toString() || '1')
    .replace('{completedFields}', Object.keys(context.formContext || {}).join('、') || '无')

  // 构建用户提示词
  let userPrompt = ''

  if (scenario === 'user') {
    userPrompt = AGENT_BASE_PROMPT.user
      .replace('{workshopTitle}', workshopConfig.title)
      .replace('{currentStep}', context.currentStep?.toString() || '1')
      .replace('{totalSteps}', context.totalSteps?.toString() || '4')
      .replace('{fieldName}', context.fieldName || '')
      .replace('{userInput}', context.userInput || '')
      .replace('{formContext}', JSON.stringify(context.formContext || {}, null, 2))
      .replace('{conversationHistory}', formatConversationHistory(context.conversationHistory || []))
      .replace('{role}', agentConfig.role)
  } else if (SPECIAL_SCENARIOS[scenario]) {
    userPrompt = SPECIAL_SCENARIOS[scenario].prompt
      .replace('{fieldName}', context.fieldName || '')
      .replace('{fieldValue}', context.fieldValue || '')
      .replace('{topic}', context.topic || '')
      .replace('{role}', agentConfig.role)
  }

  return {
    systemPrompt,
    userPrompt,
    agentConfig,
    workshopConfig
  }
}

// 格式化对话历史 - 增强版本，包含更多上下文
function formatConversationHistory(history: AgentMessage[]): string {
  if (history.length === 0) return '这是本次工作坊的首次对话'

  // 取最近10条消息（而不是5条），保留更完整的上下文
  const recentMessages = history.slice(-10)

  return recentMessages.map((msg, index) => {
    const timestamp = new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
    const agentName = getAgentFromRegistry(msg.agentId as AgentId)?.name || msg.agentId
    const msgType = {
      'question': '提问',
      'feedback': '反馈',
      'suggestion': '建议',
      'validation': '验证',
      'case_study': '案例',
      'knowledge': '知识'
    }[msg.type] || '消息'

    return `[${timestamp}] ${agentName}(${msgType}): ${msg.content}`
  }).join('\n\n')
}

// 获取工作坊推荐的Agent
export function getRecommendedAgents(
  workshopId: WorkshopId,
  step: number,
  weakDimensions?: string[]
): AgentId[] {
  const recommendations: Record<WorkshopId, Record<number, AgentId[]>> = {
    'demand-validation': {
      1: ['alex', 'sophia'],  // 客户和需求分析
      2: ['sophia', 'elena'], // 场景和价值验证
      3: ['elena', 'david'],  // 商业可行性
      4: ['marcus', 'lisa']   // 实施规划
    },
    'mvp-builder': {
      1: ['alex', 'sophia'],  // 功能规划和UX
      2: ['alex', 'elena'],   // 用户故事和管理
      3: ['marcus', 'david'], // 技术方案
      4: ['sophia', 'lisa']   // 原型和运营
    },
    'growth-hacking': {
      1: ['alex', 'david'],   // 增长目标和数据
      2: ['sophia', 'david'], // AARRR分析
      3: ['marcus', 'elena']  // 实验设计
    },
    'profit-model': {
      1: ['alex', 'elena'],   // 商业模式
      2: ['david', 'marcus'], // 财务模型
      3: ['elena', 'lisa']    // 盈利路径
    }
  }

  return recommendations[workshopId]?.[step] || ['alex', 'sophia']
}

// 错误处理和降级策略
export const FALLBACK_RESPONSES = {
  api_error: "抱歉，我暂时无法处理您的请求。请稍后再试，或者继续填写表单，我们稍后会为您提供反馈。",
  validation_error: "您的输入很有价值！让我们继续下一个部分，我会在后续为您提供更详细的反馈。",
  timeout_error: "网络响应较慢，但您的内容已经保存。请继续填写，我们会尽快为您提供专业指导。"
}

// 导出配置
export {
  WORKSHOP_AGENT_CONFIG as WorkshopConfig
}

/**
 * 检测用户输入质量并生成引导提示词
 * 返回null表示输入质量良好，返回字符串表示需要引导
 */
export function detectInputQuality(userInput: string): {
  quality: 'good' | 'vague' | 'too_short' | 'generic' | 'empty'
  guidancePrompt?: string
} {
  const trimmed = userInput.trim()
  const words = trimmed.split(/\s+/).filter(w => w.length > 1)

  // 空输入
  if (!trimmed || trimmed.length < 3) {
    return {
      quality: 'empty',
      guidancePrompt: `用户尚未填写内容。请友好地引导：
"我注意到这个部分还是空白的。不用担心，让我帮你梳理一下思路。

你可以从以下角度思考：
1. 你想解决什么具体问题？
2. 谁会遇到这个问题？
3. 现在他们是怎么处理的？

先简单描述一下你的想法，我们一起完善。"`
    }
  }

  // 过短（少于10个字）
  if (words.length < 3 || trimmed.length < 10) {
    return {
      quality: 'too_short',
      guidancePrompt: `用户输入过于简短："${trimmed}"

请引导用户补充更多信息：
"'${trimmed}'这个方向很有意思！不过能否再详细描述一下？

比如：
- 具体是什么场景下的${trimmed}？
- 面向哪些用户？
- 要解决他们的什么问题？

多一些细节会帮助我们更好地分析可行性。"`
    }
  }

  // 通用词汇堆砌（AI+、互联网+、区块链+等）
  const genericPatterns = [
    /^(ai|人工智能|互联网|科技|技术|创意|项目|平台|系统|app|应用)[\+\s]*(创意|项目|平台|系统|想法|idea|concept|应用)?$/i,
    /^(ai|互联网|科技|区块链|大数据|云计算)[\+\s]*$/i,
    /^做一个(ai|app|平台|系统|网站)/i
  ]

  if (genericPatterns.some(pattern => pattern.test(trimmed))) {
    return {
      quality: 'generic',
      guidancePrompt: `用户输入过于笼统："${trimmed}"

请引导用户聚焦具体场景：
"${trimmed}的方向很广，让我们聚焦到具体场景上。

请回答这几个问题：
1. 用户是谁？（学生、白领、企业、创作者...）
2. 他们遇到什么问题？（越具体越好）
3. 你的方案如何解决这个问题？

举个例子：'AI+教育'可以聚焦为'帮助小学老师自动生成个性化作业的AI助手'。"`
    }
  }

  // 缺少关键要素检查
  const hasUserMention = /用户|客户|人群|学生|老师|家长|白领|企业|商家/i.test(trimmed)
  const hasProblemMention = /问题|痛点|需求|困难|挑战|麻烦/i.test(trimmed)
  const hasSolutionMention = /解决|提供|帮助|实现|优化|改进|让|使得/i.test(trimmed)

  const missingElements = []
  if (!hasUserMention) missingElements.push('目标用户')
  if (!hasProblemMention) missingElements.push('具体问题')
  if (!hasSolutionMention) missingElements.push('解决方案')

  if (missingElements.length >= 2) {
    return {
      quality: 'vague',
      guidancePrompt: `用户输入缺少关键要素（${missingElements.join('、')}）："${trimmed}"

请引导用户补充：
"你的想法有一定基础，不过我需要了解更多细节：

目前描述中缺少：${missingElements.join('、')}

建议你按照这个框架补充：
- 【谁】会用这个产品/服务？
- 【什么问题】困扰着他们？
- 【如何】解决这个问题？

这样我能给你更有针对性的建议。"`
    }
  }

  // 输入质量良好
  return { quality: 'good' }
}