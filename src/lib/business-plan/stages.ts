import type { BusinessPlanStageConfig } from '@/types/business-plan'

export const BUSINESS_PLAN_STAGES: BusinessPlanStageConfig[] = [
  {
    id: 'scenario_grounding',
    name: '场景分析与定位',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '6-8分钟',
    deliverables: ['项目摘要', '核心思路', '关键假设条件', '核心价值主张列表'],
    dependencies: []
  },
  {
    id: 'concept_analysis',
    name: '概念深化分析',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '3-5分钟',
    deliverables: ['概念核心理念', '解决的核心价值问题', '创新点分析'],
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
    name: '商业模式设计',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '6-10分钟',
    deliverables: ['商业模式画布', '盈利模式分析', '成本结构'],
    dependencies: ['market_research']
  },
  {
    id: 'financial_model',
    name: '财务模型预测',
    aiProvider: 'ALI',
    estimatedTime: '12-18分钟',
    deliverables: ['财务预测', '投资回报分析', '估值模型'],
    dependencies: ['business_model']
  },
  {
    id: 'legal_compliance',
    name: '合规法律建议',
    aiProvider: 'ZHIPU',
    estimatedTime: '8-12分钟',
    deliverables: ['合规检查单', '法律风险', '知识产权策略'],
    dependencies: ['scenario_grounding']
  },
  {
    id: 'implementation_plan',
    name: '实施路径规划',
    aiProvider: 'ZHIPU',
    estimatedTime: '6-10分钟',
    deliverables: ['项目时间线', '团队配置', '关键里程碑'],
    dependencies: ['tech_architecture']
  },
  {
    id: 'investor_pitch',
    name: '投资者沟通材料',
    aiProvider: 'DEEPSEEK',
    estimatedTime: '5-8分钟',
    deliverables: ['Pitch Deck', '投资建议书', '常见问答'],
    dependencies: ['concept_analysis', 'market_research', 'business_model', 'financial_model']
  }
]