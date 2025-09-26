import type { BusinessPlanStageConfig } from '@/types/business-plan'

export const BUSINESS_PLAN_STAGES: BusinessPlanStageConfig[] = [
  {
    id: 'scenario_grounding',
    name: '创意落地场景分析',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '8-12分钟',
    deliverables: ['具体应用场景', '用户痛点分析', '解决方案描述', '价值主张清单', '可行性初步评估'],
    dependencies: []
  },
  {
    id: 'market_reality_check',
    name: '市场现状与需求验证',
    aiProvider: 'ALI',
    estimatedTime: '10-15分钟',
    deliverables: ['真实市场规模', '现有解决方案分析', '用户需求验证', '市场准入门槛', '竞争格局分析'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'product_definition',
    name: 'MVP产品定义与设计',
    aiProvider: 'ZHIPU',
    estimatedTime: '8-12分钟',
    deliverables: ['产品核心功能', 'MVP设计方案', '用户体验流程', '技术可行性分析', '开发优先级'],
    dependencies: ['scenario_grounding', 'market_reality_check']
  },
  {
    id: 'business_model_design',
    name: '商业模式与盈利路径',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '10-15分钟',
    deliverables: ['商业模式画布', '收入来源分析', '成本结构设计', '定价策略', '盈利时间预估'],
    dependencies: ['market_reality_check', 'product_definition']
  },
  {
    id: 'operational_plan',
    name: '运营策略与执行计划',
    aiProvider: 'ALI',
    estimatedTime: '12-18分钟',
    deliverables: ['运营推广策略', '用户获取方案', '团队组建计划', '供应链设计', '风险应对措施'],
    dependencies: ['business_model_design']
  },
  {
    id: 'financial_planning',
    name: '财务规划与投资分析',
    aiProvider: 'ALI',
    estimatedTime: '15-20分钟',
    deliverables: ['启动资金需求', '3年财务预测', '现金流分析', '投资回报预期', '融资建议'],
    dependencies: ['business_model_design', 'operational_plan']
  },
  {
    id: 'implementation_roadmap',
    name: '实施路线图与里程碑',
    aiProvider: 'ZHIPU',
    estimatedTime: '8-12分钟',
    deliverables: ['6个月行动计划', '关键里程碑设置', '资源配置方案', '进度监控机制', '应急调整预案'],
    dependencies: ['product_definition', 'operational_plan']
  },
  {
    id: 'risk_assessment',
    name: '风险评估与合规分析',
    aiProvider: 'ZHIPU',
    estimatedTime: '6-10分钟',
    deliverables: ['核心风险识别', '法律合规要求', '知识产权保护', '监管政策分析', '风险缓解策略'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'investor_materials',
    name: '投资展示与融资材料',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '8-12分钟',
    deliverables: ['投资者Pitch Deck', '商业计划书摘要', '关键数据指标', '投资亮点总结', 'FAQ问答'],
    dependencies: ['business_model_design', 'financial_planning', 'implementation_roadmap']
  }
]