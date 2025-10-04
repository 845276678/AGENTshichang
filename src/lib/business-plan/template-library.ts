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
  mission: '将接下来的90天集中在验证产品、客户和商业循环上。',
  summary:
    '路线图分为三个阶段。每个阶段包含每周冲刺、反馈循环和明确的检查点，以保持团队一致。',
  phases: [
    {
      name: '阶段1 · 技术验证',
      timeline: '第1-30天',
      focus: '构建核心原型并降低关键技术风险。',
      keyOutcomes: ['主要工作流的原型', '技术风险清单及缓解措施', '可观察性和指标配置'],
      metrics: ['原型可用性 ≥ 80%', '技术风险解决 ≥ 70%']
    },
    {
      name: '阶段2 · 客户与MVP验证',
      timeline: '第31-60天',
      focus: '收集高质量用户反馈并确认最小可销售包。',
      keyOutcomes: ['100+ 有意义的用户接触点', '验证问题-解决方案匹配', '定义付费产品'],
      metrics: ['关键流程完成率 ≥ 60%', 'NPS趋势 > 0']
    },
    {
      name: '阶段3 · 商业验证',
      timeline: '第61-90天',
      focus: '赢得首批付费客户并锁定正反馈循环。',
      keyOutcomes: ['首批付费或承诺用户', '明确的货币化假设', '可复制的运营SOP'],
      metrics: ['初始转化达到目标', '续约/推荐意向增加']
    }
  ],
  weeklySprints: [
    {
      name: '第1-2周 · 技术突破',
      focus: '确认技术栈，解除数据/模型访问障碍，揭示关键风险。',
      objectives: ['完成技术发现和概念验证', '建立数据/模型环境', '记录风险登记册'],
      feedbackHooks: ['每日工程站会', '风险日志审查']
    },
    {
      name: '第3-4周 · MVP与客户访谈',
      focus: '交付演示级MVP的同时进行结构化访谈。',
      objectives: ['交付演示原型', '进行15+次深度访谈', '综合早期洞察'],
      feedbackHooks: ['访谈摘要看板', '每周洞察评分']
    },
    {
      name: '第5-8周 · 数据驱动迭代',
      focus: '使用产品内分析推动快速迭代。',
      objectives: ['交付检测工具和仪表板', '在关键流程上进行A/B实验', '减少流失指标'],
      feedbackHooks: ['行为审查会议', '产品委员会检查']
    },
    {
      name: '第9-12周 · 商业冲刺',
      focus: '验证支付意愿并建立可重复循环。',
      objectives: ['推出限时试点优惠', '达成首批承诺账户', '记录销售/支持脚本'],
      feedbackHooks: ['售后访谈', '每周收入站会']
    }
  ],
  feedbackLoop: {
    cadence: ['每日站会处理障碍和成果', '每周回顾+计划审查', '每月里程碑和资源检查'],
    channels: ['深度客户访谈', '产品分析', '社区/支持信号', '线下现场笔记'],
    decisionGates: ['目标群体留存率是否呈趋势？', '转化率是否在改善？', '基础设施是否安全扩展？'],
    tooling: ['项目看板（Notion/Jira）', '分析仪表板', '反馈收集表', 'AI摘要助手']
  },
  dailyRoutines: [
    '每天至少与三位用户交谈以收集反馈',
    '每天交付或改进一项产品功能',
    '每天结束前更新核心指标仪表板'
  ],
  reviewFramework: {
    weekly: ['检查与冲刺目标的进展', '总结显著的反馈和数据成果', '商定下一步要运行的实验'],
    monthly: ['审查里程碑健康状况', '调整产品和市场推广优先级', '计划下个月的增长赌注'],
    dataWatch: ['DAU/WAU/MAU曲线', '关键功能使用频率', '留存和转化漏斗', '反馈解决时间']
  }
}

export const NINETY_DAY_FOCUS_TEMPLATE: ExecutionTemplate = {
  id: 'default-90-day-plan',
  label: '90天聚焦计划',
  summary:
    '经过实战检验的90天运营节奏，涵盖技术、客户发现、货币化和持续正反馈。',
  plan: BASE_EXECUTION_PLAN
}

export const TEMPLATE_LIBRARY: Record<string, ExecutionTemplate> = {
  default: NINETY_DAY_FOCUS_TEMPLATE
}

export function resolveExecutionTemplate(_context?: ExecutionTemplateContext): ExecutionTemplate {
  // Future work: choose template based on industry / team strength. For now always return the base template.
  return NINETY_DAY_FOCUS_TEMPLATE
}
