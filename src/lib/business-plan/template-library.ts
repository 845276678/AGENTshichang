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
  mission: '接下来4周，我们就围绕一个目标：做出能验证价值的版本，并拿到真实用户与收入信号。',
  summary:
    '按周推进：第1周对齐方向，第2周做出原型，第3周拉用户验证，第4周冲刺付费与增长，每一步都要有反馈和数据支撑。',
  phases: [
    {
      name: '第1周 · 对齐方向',
      timeline: '第1周',
      focus: '把问题、场景和目标用户讲清楚，确认技术路线，避免一开始就走偏。',
      keyOutcomes: ['问题-解决方案对照表', '目标用户画像与使用场景', '技术方案与风险清单', '执行节奏与看板'],
      metrics: ['完成至少 8 场定性访谈', '列出 ≥5 个必须验证的核心假设']
    },
    {
      name: '第2周 · 做出原型',
      timeline: '第2周',
      focus: '把最小可行产品搭起来，核心流程要能演示、能跑通、数据能记录。',
      keyOutcomes: ['可演示的 MVP', '关键功能流程跑通', '技术/数据埋点全部就绪', '演示脚本与使用说明'],
      metrics: ['核心流程成功率 ≥70%', '高优先级技术问题解决率 ≥80%']
    },
    {
      name: '第3周 · 用户验证',
      timeline: '第3周',
      focus: '邀请目标用户真实体验，分类整理反馈，快速迭代验证价值命中度。',
      keyOutcomes: ['≥15 位目标用户深度体验', '用户反馈整理看板', '至少一次功能迭代', '价值验证报告'],
      metrics: ['体验完成率 ≥60%', '价值认可率 ≥70%']
    },
    {
      name: '第4周 · 收入信号',
      timeline: '第4周',
      focus: '设计收费与增长实验，拿到首批付费或预订承诺，规划下一阶段路线。',
      keyOutcomes: ['定价假设与试销方案', '首批付费/预订用户清单', '转化漏斗数据', '下阶段行动路线图'],
      metrics: ['获取 ≥3 个清晰的付费承诺', '完成 ≥2 个增长/转化实验']
    }
  ],
  weeklySprints: [
    {
      name: '第1周 · 方向验证',
      focus: '搞清楚真正的问题与用户，锁定4周冲刺要达成的关键指标。',
      objectives: ['完成问题澄清访谈并整理假设', '搭建执行看板与节奏表', '确定衡量成功的核心指标'],
      feedbackHooks: ['每天站会同步新洞察', '访谈结束 2 小时内整理要点']
    },
    {
      name: '第2周 · 原型冲刺',
      focus: '让 MVP 跑起来，保证技术稳定并记录所有阻塞问题。',
      objectives: ['完成核心流程演示稿', '梳理阻塞问题与解决方案', '验证数据埋点是否正常采集'],
      feedbackHooks: ['每日代码/设计走查', '周末进行一次原型试玩会']
    },
    {
      name: '第3周 · 用户验证',
      focus: '组织目标用户试用，快速归类反馈并形成迭代动作。',
      objectives: ['安排 ≥10 场体验测试', '整理高频问题并给出行动项', '完成至少 1 次升级发布'],
      feedbackHooks: ['每日同步用户反馈看板', '每两天复盘迭代效果']
    },
    {
      name: '第4周 · 收入信号',
      focus: '冲刺付费与增长实验，把结果沉淀为可复制的节奏。',
      objectives: ['完成 ≥2 个定价/付费实验', '形成首批付费或预订清单', '准备下一阶段的增长路线图'],
      feedbackHooks: ['每日追踪转化漏斗', '周四集中复盘收入实验']
    }
  ],
  feedbackLoop: {
    cadence: ['每天早上 15 分钟站会', '每周五复盘并定下周计划', '第2周末做中程检查，第4周末做总结'],
    channels: ['深度用户访谈（每周 ≥3 次）', '产品数据看板', '用户社群/客服反馈', '小规模线下观察记录'],
    decisionGates: ['核心假设是否被验证', '用户价值感知是否达标', '转化与留存数据是否支撑继续投入'],
    tooling: ['项目管理（Notion/飞书多维表格）', '数据看板（GA + 自建后台）', '用户反馈收集（问卷+表单）', 'AI 辅助整理总结']
  },
  dailyRoutines: [
    '每天至少和一个用户聊聊（电话、微信群都行）',
    '每天推进一个功能或者优化一个体验细节',
    '每天收盘前更新核心指标和反馈记录'
  ],
  reviewFramework: {
    weekly: ['对照当周目标，看完成了多少', '整理用户反馈与数据发现', '确定下周要跑的验证或实验'],
    monthly: ['第2周：确认原型是否满足验证需求', '第4周：评估付费/增长信号是否达标', '输出下一阶段的投入建议'],
    dataWatch: ['日活/周活趋势', '核心功能使用频率', '转化漏斗与留存', '反馈处理速度']
  }
}

export const FOUR_WEEK_SPRINT_TEMPLATE: ExecutionTemplate = {
  id: 'default-4-week-plan',
  label: '4周冲刺计划',
  summary:
    '以4周为节奏的实战冲刺方案，帮你快速对齐方向、做出原型、验证价值并拿到收入信号。',
  plan: BASE_EXECUTION_PLAN
}

export const TEMPLATE_LIBRARY: Record<string, ExecutionTemplate> = {
  default: FOUR_WEEK_SPRINT_TEMPLATE
}

export function resolveExecutionTemplate(_context?: ExecutionTemplateContext): ExecutionTemplate {
  // Future work: choose template based on industry / team strength. For now always return the base template.
  return FOUR_WEEK_SPRINT_TEMPLATE
}
