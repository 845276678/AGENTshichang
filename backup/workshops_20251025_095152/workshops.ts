export interface WorkshopCardConfig {
  id: 'demand-validation' | 'mvp-builder' | 'growth-hacking' | 'profit-model'
  title: string
  description: string
  difficulty: '初级' | '中级' | '高级'
  estimatedTime: string
  color: string
  features: string[]
  stats: {
    completions: number
    rating: number
  }
}

export const CORE_WORKSHOPS: WorkshopCardConfig[] = [
  {
    id: 'demand-validation',
    title: '创意完善计划书',
    description: '通过科学的方法验证您的商业想法是否有市场需求，完善创意细节',
    difficulty: '初级',
    estimatedTime: '45-60分钟',
    color: 'bg-blue-500',
    features: [
      '目标客户定义',
      '需求场景分析',
      '价值主张验证',
      '验证计划制定'
    ],
    stats: {
      completions: 1200,
      rating: 4.8
    }
  },
  {
    id: 'mvp-builder',
    title: 'MVP构建工作坊',
    description: '从想法到产品原型，学会构建最小可行产品（MVP）的核心方法',
    difficulty: '中级',
    estimatedTime: '60-90分钟',
    color: 'bg-green-500',
    features: [
      '核心功能定义',
      '用户故事梳理',
      '技术方案规划',
      'MVP原型设计'
    ],
    stats: {
      completions: 850,
      rating: 4.7
    }
  },
  {
    id: 'growth-hacking',
    title: '推广工具',
    description: '掌握增长策略的核心方法，快速扩大用户基础和业务规模',
    difficulty: '高级',
    estimatedTime: '90-120分钟',
    color: 'bg-purple-500',
    features: [
      'AARRR漏斗分析',
      '增长实验设计',
      '渠道策略优化',
      '数据驱动决策'
    ],
    stats: {
      completions: 650,
      rating: 4.9
    }
  },
  {
    id: 'profit-model',
    title: '盈利平台',
    description: '构建可持续盈利的商业模式，实现从创意到收益的转化',
    difficulty: '高级',
    estimatedTime: '120-150分钟',
    color: 'bg-orange-500',
    features: [
      '商业画布设计',
      '收入模式构建',
      '成本结构优化',
      '盈利能力评估'
    ],
    stats: {
      completions: 420,
      rating: 4.6
    }
  }
]
