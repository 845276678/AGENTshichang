import type { BusinessPlanStageConfig } from '@/types/business-plan'

export const BUSINESS_PLAN_STAGES: BusinessPlanStageConfig[] = [
  {
    id: 'scenario_grounding',
    name: '场景洞察与落地校验',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '6-8分钟',
    deliverables: ['场景摘要', '角色链路', '落地性评分', '澄清问题列表'],
    dependencies: []
  },
  {
    id: 'concept_analysis',
    name: '创意概念解析',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '3-5分钟',
    deliverables: ['概念提取报告', '核心价值分析', '问题陈述'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'market_research',
    name: '市场调研分析',
    aiProvider: 'ALI',
    estimatedTime: '8-12分钟',
    deliverables: ['市场规模', '竞品分析', '目标用户画像'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'tech_architecture',
    name: '技术架构设计',
    aiProvider: 'ZHIPU',
    estimatedTime: '10-15分钟',
    deliverables: ['系统架构', 'API设计', '技术栈推荐'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'business_model',
    name: '商业模式构建',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '6-10分钟',
    deliverables: ['商业模式画布', '收入流设计', '成本结构'],
    dependencies: ['market_research']
  },
  {
    id: 'financial_model',
    name: '财务建模预测',
    aiProvider: 'ALI',
    estimatedTime: '12-18分钟',
    deliverables: ['财务预测', '投资回报分析', '估值建议'],
    dependencies: ['business_model']
  },
  {
    id: 'legal_compliance',
    name: '合规风险评估',
    aiProvider: 'ZHIPU',
    estimatedTime: '8-12分钟',
    deliverables: ['合规清单', '法律风险', '知识产权策略'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'implementation_plan',
    name: '实施路线规划',
    aiProvider: 'ZHIPU',
    estimatedTime: '6-10分钟',
    deliverables: ['项目时间表', '团队配置', '关键里程碑'],
    dependencies: ['tech_architecture']
  },
  {
    id: 'investor_pitch',
    name: '投资推介材料',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '5-8分钟',
    deliverables: ['Pitch Deck', '投资亮点', '融资策略'],
    dependencies: ['concept_analysis', 'market_research', 'business_model', 'financial_model']
  }
]

