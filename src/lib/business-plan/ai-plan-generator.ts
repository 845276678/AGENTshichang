import type { ExecutionPlan } from './types'
import type { BiddingSnapshot } from './types'
import type AIServiceManager from '../ai-service-manager'

/**
 * AI驱动的个性化执行计划生成器
 * 根据创意内容、用户背景和竞价结果，生成定制化的4周执行计划
 */
export async function generatePersonalizedExecutionPlan(
  snapshot: BiddingSnapshot,
  aiService: AIServiceManager
): Promise<ExecutionPlan> {
  const { ideaTitle, ideaDescription, supportedAgents, highestBid, winnerName, userContext } = snapshot

  // 构建AI生成提示词
  const systemPrompt = `你是一位资深的商业计划顾问，擅长将创意转化为可执行的4周冲刺计划。你需要根据用户的具体创意和资源情况，生成真实可行的执行方案。`

  const userPrompt = buildPlanGenerationPrompt(snapshot)

  try {
    // 调用AI生成计划
    const response = await aiService.callSingleService({
      provider: 'deepseek',
      persona: 'business-plan-generator',
      context: {
        idea: ideaDescription || ideaTitle,
        phase: 'planning',
        round: 1,
        previousMessages: [],
        currentBids: {},
        sessionHistory: []
      },
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 2000
    })

    // 解析AI响应为ExecutionPlan结构
    const plan = parseAIResponseToPlan(response.content, snapshot)

    return plan

  } catch (error) {
    console.error('AI执行计划生成失败，使用降级方案:', error)
    // 失败时返回基础模板并注入实际内容
    return generateFallbackPlan(snapshot)
  }
}

/**
 * 构建计划生成提示词
 */
function buildPlanGenerationPrompt(snapshot: BiddingSnapshot): string {
  const { ideaTitle, ideaDescription, supportedAgents, highestBid, winnerName, userContext } = snapshot

  const supporters = supportedAgents?.length ?? 0
  const supporterNote = supporters > 0
    ? `有 ${supporters} 位专家明确看好`
    : '虽然现场支持者不多，但也许意味着市场还没被教育'

  // 提取用户资源信息
  let resourceInfo = ''
  if (userContext) {
    const budgetInfo = userContext.budget
      ? `预算：${userContext.budget.min || 0}-${userContext.budget.max || 0} ${userContext.budget.currency || 'CNY'}`
      : ''
    const teamInfo = userContext.team?.size
      ? `团队规模：${userContext.team.size}人`
      : ''
    const timelineInfo = userContext.timeline?.duration
      ? `时间周期：${userContext.timeline.duration}个月`
      : ''

    resourceInfo = [budgetInfo, teamInfo, timelineInfo].filter(Boolean).join('；')
  }

  return `请为以下创意制定一个4周（28天）的快速验证执行计划：

**创意名称：** ${ideaTitle}

**创意描述：** ${ideaDescription || '未提供详细描述'}

**资源情况：** ${resourceInfo || '未明确说明'}

**竞价结果：**
- 最高出价：¥${highestBid}
- ${supporterNote}
- 获胜专家：${winnerName}

请生成以下内容（必须具体、可执行，避免空泛的建议）：

1. **核心使命** (mission)：一句话说明这4周要达成什么目标

2. **计划摘要** (summary)：200字以内，说明为什么这个计划能帮用户验证创意

3. **4个周阶段** (phases)：每周一个阶段
   - name: 阶段名称
   - timeline: 第X周 (Day X-X)
   - focus: 这周的核心重点（50字以内）
   - keyOutcomes: 3-4个具体交付成果（必须具体，例如"完成10次用户访谈"而不是"了解用户需求"）
   - metrics: 2-3个可量化的成功指标（必须有明确数字，例如"签约3个试点客户"）

4. **每周冲刺** (weeklySprints)：4个冲刺，对应4周
   - name: 冲刺名称
   - focus: 冲刺目标
   - objectives: 3个可操作的目标
   - feedbackHooks: 2-3个反馈机制（具体工具或方法）

5. **反馈循环** (feedbackLoop)：
   - cadence: 3个反馈节奏（例如"每周五下午复盘会"）
   - channels: 3-4个反馈渠道（具体工具名称）
   - decisionGates: 3个关键决策点
   - tooling: 3-4个推荐工具（真实存在的工具名）

6. **每日例行** (dailyRoutines)：4个每天要做的事（具体、简短）

7. **复盘框架** (reviewFramework)：
   - weekly: 3项每周检查内容
   - monthly: 3项月度检查内容（这里指第4周末）
   - dataWatch: 3-4个需要持续监控的数据指标

**重要要求：**
- 所有内容必须围绕"${ideaTitle}"这个具体创意展开
- 所有建议必须可执行、可验证，有明确的行动和数字
- 避免使用"进一步"、"深入"、"完善"等模糊词汇
- 考虑用户的实际资源约束
- 使用中文，语气专业但接地气

请直接返回JSON格式（不要markdown代码块包裹），结构如下：

{
  "mission": "字符串",
  "summary": "字符串",
  "phases": [
    {
      "name": "字符串",
      "timeline": "字符串",
      "focus": "字符串",
      "keyOutcomes": ["字符串1", "字符串2", "字符串3"],
      "metrics": ["字符串1", "字符串2"]
    }
  ],
  "weeklySprints": [
    {
      "name": "字符串",
      "focus": "字符串",
      "objectives": ["字符串1", "字符串2", "字符串3"],
      "feedbackHooks": ["字符串1", "字符串2"]
    }
  ],
  "feedbackLoop": {
    "cadence": ["字符串1", "字符串2", "字符串3"],
    "channels": ["字符串1", "字符串2", "字符串3"],
    "decisionGates": ["字符串1", "字符串2", "字符串3"],
    "tooling": ["字符串1", "字符串2", "字符串3"]
  },
  "dailyRoutines": ["字符串1", "字符串2", "字符串3", "字符串4"],
  "reviewFramework": {
    "weekly": ["字符串1", "字符串2", "字符串3"],
    "monthly": ["字符串1", "字符串2", "字符串3"],
    "dataWatch": ["字符串1", "字符串2", "字符串3"]
  }
}`
}

/**
 * 解析AI响应为ExecutionPlan结构
 */
function parseAIResponseToPlan(aiResponse: string, snapshot: BiddingSnapshot): ExecutionPlan {
  try {
    // 清理可能的markdown代码块包裹
    let cleanedResponse = aiResponse.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '')
    }

    const parsed = JSON.parse(cleanedResponse)

    // 验证必要字段
    if (!parsed.mission || !parsed.summary || !Array.isArray(parsed.phases)) {
      throw new Error('AI响应缺少必要字段')
    }

    return parsed as ExecutionPlan

  } catch (error) {
    console.error('解析AI响应失败:', error)
    console.log('原始AI响应:', aiResponse)

    // 解析失败，使用降级方案
    return generateFallbackPlan(snapshot)
  }
}

/**
 * 生成降级计划（当AI失败时）
 * 这个版本会注入实际的创意信息，而不是使用占位符
 */
function generateFallbackPlan(snapshot: BiddingSnapshot): ExecutionPlan {
  const { ideaTitle, ideaDescription, supportedAgents, highestBid, winnerName } = snapshot
  const supporters = supportedAgents?.length ?? 0

  const supporterNote = supporters > 0
    ? `好消息是有 ${supporters} 位专家明确看好，说明方向扎实`
    : '虽然现场支持者不多，但也许意味着市场还没被教育，反而是潜在机会'

  return {
    mission: ideaDescription
      ? `把 "${ideaTitle}" 落地，核心场景是：${ideaDescription.slice(0, 80)}${ideaDescription.length > 80 ? '...' : ''}。4 周内必须拿出能跑通的版本、真实用户反馈和收入信号。`
      : `4 周内把 "${ideaTitle}" 从想法推进到可验证的产品雏形。每个周末都要看到数据、反馈和新的行动计划。`,

    summary: `"${ideaTitle}" 的 4 周冲刺计划来了。竞价阶段拿到了 ¥${highestBid} 的最高出价，${supporterNote}。接下来 28 天，请 ${winnerName} 带头推进，${supporters > 0 ? `其他 ${supporters} 位支持者` : '其他专家'}持续给反馈，每周都要拿出验证结果。`,

    phases: [
      {
        name: '第1周 - 需求验证与原型设计',
        timeline: 'Day 1-7',
        focus: `锁定"${ideaTitle}"的核心价值，用纸面原型验证可行性`,
        keyOutcomes: [
          '完成10-15次目标用户访谈，确认核心痛点',
          '绘制用户旅程图和功能优先级列表',
          '制作可点击的低保真原型'
        ],
        metrics: [
          '至少60%受访者确认痛点存在',
          '原型覆盖核心场景的3个关键流程'
        ]
      },
      {
        name: '第2周 - MVP开发与内部测试',
        timeline: 'Day 8-14',
        focus: '开发最小可行版本，团队内部验证可用性',
        keyOutcomes: [
          '完成MVP核心功能开发（1-2个主要功能）',
          '团队内部试用并记录问题',
          '准备对外测试的邀请话术和反馈问卷'
        ],
        metrics: [
          '核心功能可完整跑通端到端流程',
          '团队内部体验自评达到7分以上（满分10分）'
        ]
      },
      {
        name: '第3周 - 用户测试与快速迭代',
        timeline: 'Day 15-21',
        focus: '邀请真实用户试用，收集反馈并快速修复',
        keyOutcomes: [
          '邀请20-30位种子用户试用',
          '收集至少15份有效反馈',
          '完成2-3轮快速迭代优化'
        ],
        metrics: [
          '用户激活率 >= 50%（注册后完成首次核心操作）',
          '至少3位用户主动推荐给他人'
        ]
      },
      {
        name: '第4周 - 商业化验证与路演准备',
        timeline: 'Day 22-28',
        focus: '验证付费意愿，准备下一阶段融资或扩张',
        keyOutcomes: [
          '完成定价实验，获得3-5个付费承诺或预订',
          '整理4周数据和用户故事',
          '制作融资/汇报演示文稿'
        ],
        metrics: [
          '至少3个明确的付费或预订承诺',
          '留存率 >= 40%（第2周用户仍在使用）'
        ]
      }
    ],

    weeklySprints: [
      {
        name: '冲刺1 - 需求探索',
        focus: '快速验证用户痛点和解决方案方向',
        objectives: [
          '找到10位目标用户深度访谈',
          '用纸面原型测试3种不同方案',
          '确定MVP的最小功能集'
        ],
        feedbackHooks: [
          '每晚记录访谈笔记和洞察',
          '周五下午团队复盘会'
        ]
      },
      {
        name: '冲刺2 - MVP冲刺',
        focus: '用最快速度做出能演示的版本',
        objectives: [
          '每日站会同步进度和阻碍',
          '聚焦1-2个核心功能，砍掉一切可延后的',
          '周末前完成内部可演示版本'
        ],
        feedbackHooks: [
          '每日代码review',
          '每晚记录开发问题和技术决策'
        ]
      },
      {
        name: '冲刺3 - 用户验证',
        focus: '让真实用户用起来，收集第一手反馈',
        objectives: [
          '每天邀请5-10位新用户试用',
          '记录用户使用的完整录屏',
          '每2天发布一个修复版本'
        ],
        feedbackHooks: [
          '用户反馈日报',
          '每周2次用户回访电话'
        ]
      },
      {
        name: '冲刺4 - 商业闭环',
        focus: '验证用户愿意为此付费',
        objectives: [
          '测试3种不同的定价方案',
          '与5-10位高意向用户谈付费',
          '整理4周成果制作汇报材料'
        ],
        feedbackHooks: [
          '定价实验数据日报',
          '付费转化漏斗分析'
        ]
      }
    ],

    feedbackLoop: {
      cadence: [
        '每日晨会（15分钟）同步进度和阻碍',
        '每周五下午复盘会（1小时）',
        '每周末发送周报给支持者和顾问'
      ],
      channels: [
        '用户访谈录音和笔记',
        '产品使用数据（Mixpanel/Google Analytics）',
        '用户反馈问卷和客服记录',
        '团队内部Slack频道'
      ],
      decisionGates: [
        'Week1结束：是否继续开发（痛点验证通过）',
        'Week2结束：是否对外测试（内部体验达标）',
        'Week3结束：是否推进商业化（用户活跃度达标）'
      ],
      tooling: [
        'Figma（原型设计）',
        'Notion（文档和知识库）',
        'Linear或Trello（任务管理）',
        'Google Analytics或Mixpanel（数据分析）'
      ]
    },

    dailyRoutines: [
      '早上9点15分钟站会：昨天完成、今天计划、遇到阻碍',
      '每天至少1次用户互动（访谈、反馈回复、使用观察）',
      '晚上记录当天关键学习和决策（5-10分钟日志）',
      '每天检查核心指标：新增用户、激活率、留存情况'
    ],

    reviewFramework: {
      weekly: [
        '回顾本周目标完成情况（红绿灯标记）',
        '分析用户反馈的3个最高频问题',
        '更新风险清单和下周优先级'
      ],
      monthly: [
        '评估4周目标达成度（用户数、留存率、付费意向）',
        '整理可量化的成果和学习',
        '决策下一阶段方向：继续、调整还是终止'
      ],
      dataWatch: [
        '新增用户数和来源渠道',
        '激活率（注册后完成核心操作的比例）',
        '留存率（Week2、Week3仍在使用的比例）',
        '付费意向和转化漏斗'
      ]
    }
  }
}
