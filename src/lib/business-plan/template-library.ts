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
  mission: '接下来90天，咱们就干三件事：验证技术能不能跑通、用户要不要、能不能赚到钱。',
  summary:
    '分三个月来打，每个月一个重点。每周都有具体目标，每天都要看反馈，别闷头干。',
  phases: [
    {
      name: '第一个月 · 先把技术搞定',
      timeline: '第1-30天',
      focus: '做个能用的原型出来，把技术上的大坑提前踩一遍。',
      keyOutcomes: ['核心功能的演示版本', '技术问题清单（哪些能解决、哪些暂时绕过）', '数据监控搭起来，能看到基本情况'],
      metrics: ['原型能稳定跑起来（成功率 ≥ 80%）', '主要技术风险搞定了70%以上']
    },
    {
      name: '第二个月 · 让用户试试看',
      timeline: '第31-60天',
      focus: '找真实用户来用，收集反馈，看看咱们的方向对不对。',
      keyOutcomes: ['至少跟100个潜在用户聊过或让他们试用', '确认产品解决的问题是真需求', '定下来哪些功能值得收费'],
      metrics: ['核心流程完成率 ≥ 60%', '用户推荐意愿（NPS）开始上升']
    },
    {
      name: '第三个月 · 看能不能赚钱',
      timeline: '第61-90天',
      focus: '找到第一批付费用户，跑通商业模式。',
      keyOutcomes: ['拿下第一批付费用户（哪怕是内测价）', '验证定价策略', '运营流程文档化'],
      metrics: ['转化率达到预期', '用户续费或推荐意愿明显']
    }
  ],
  weeklySprints: [
    {
      name: '第1-2周 · 技术能不能行',
      focus: '选定技术方案，把数据和AI接口跑通，记录遇到的坑。',
      objectives: ['技术方案敲定（别选太新的，稳定优先）', '开发环境搭好，团队都能用', '技术风险列表（哪些能搞定，哪些要绕路）'],
      feedbackHooks: ['每天早上15分钟站会', '遇到问题随时更新风险清单']
    },
    {
      name: '第3-4周 · 做出能演示的东西',
      focus: '把核心功能做出来，能给用户演示的那种。',
      objectives: ['拿得出手的demo版本', '找15个人深聊，听他们的真实想法', '把反馈整理成下一步的改进方向'],
      feedbackHooks: ['访谈记录看板（谁说了啥都记下来）', '每周五下午聊聊这周学到了啥']
    },
    {
      name: '第5-8周 · 用数据说话',
      focus: '上线小范围试用，看数据，快速调整。',
      objectives: ['数据监控和分析工具配置好', '在关键环节做A/B测试', '优化流程，降低用户流失'],
      feedbackHooks: ['每周三看数据，找问题', '产品会议讨论下一步改进方向']
    },
    {
      name: '第9-12周 · 开始赚钱',
      focus: '验证付费意愿，建立可复制的获客方式。',
      objectives: ['推出限时优惠（造点紧迫感）', '拿下至少10个付费承诺', '销售和客服流程文档化'],
      feedbackHooks: ['成交后24小时内回访', '每周一早上看销售数据']
    }
  ],
  feedbackLoop: {
    cadence: ['每天早上15分钟站会，过一遍进展和问题', '每周五下午复盘，定下周计划', '每月初看大方向，调资源和预算'],
    channels: ['深度用户访谈（每周至少3个）', '产品数据分析', '用户社群和客服反馈', '线下活动的观察记录'],
    decisionGates: ['目标用户留存率是不是在涨？', '转化率有没有改善？', '技术架构能不能扛住更多用户？'],
    tooling: ['项目管理（Notion/飞书多维表格）', '数据看板（GA + 自建后台）', '用户反馈收集（问卷/表单）', 'AI帮忙整理总结']
  },
  dailyRoutines: [
    '每天至少跟3个用户聊聊（电话、微信都行）',
    '每天推进一个功能或者优化一个体验',
    '每天下班前更新核心数据'
  ],
  reviewFramework: {
    weekly: ['对照本周目标，看完成了多少', '整理用户反馈和数据发现', '定下下周要跑的实验'],
    monthly: ['关键指标是否达标', '产品和市场策略要不要调整', '下个月重点投入在哪'],
    dataWatch: ['日活/周活/月活趋势', '核心功能使用频率', '留存和转化漏斗', '反馈处理速度']
  }
}

export const NINETY_DAY_FOCUS_TEMPLATE: ExecutionTemplate = {
  id: 'default-90-day-plan',
  label: '90天落地计划',
  summary:
    '经过实战检验的90天节奏，帮你搞定技术、找到用户、验证赚钱模式，还有持续的反馈改进。',
  plan: BASE_EXECUTION_PLAN
}

export const TEMPLATE_LIBRARY: Record<string, ExecutionTemplate> = {
  default: NINETY_DAY_FOCUS_TEMPLATE
}

export function resolveExecutionTemplate(_context?: ExecutionTemplateContext): ExecutionTemplate {
  // Future work: choose template based on industry / team strength. For now always return the base template.
  return NINETY_DAY_FOCUS_TEMPLATE
}
