import { z } from 'zod'

// AI文档生成请求类型
export interface DocumentGenerationRequest {
  ideaId: string
  agentId: string
  idea: {
    title: string
    description: string
    category: string
    tags: string[]
    targetMarket?: string
    painPoints?: string[]
  }
  agent: {
    name: string
    specialties: string[]
    personality: {
      style: string
      approach: string
    }
  }
  collaborationResult: {
    enhancedTitle: string
    enhancedDescription: string
    finalScore: number
    collaborationCost: number
  }
}

// 文档模板类型
export interface DocumentTemplate {
  id: string
  name: string
  pages: number
  sections: DocumentSection[]
  category: 'technical' | 'business' | 'design' | 'marketing' | 'implementation' | 'risk'
}

export interface DocumentSection {
  title: string
  description: string
  requiredFields: string[]
  templateContent: string
}

// 生成的文档类型
export interface GeneratedDocument {
  id: string
  templateId: string
  title: string
  content: string
  sections: GeneratedSection[]
  metadata: {
    pages: number
    wordCount: number
    generatedAt: Date
    estimatedReadTime: number
  }
}

export interface GeneratedSection {
  title: string
  content: string
  subsections: {
    title: string
    content: string
  }[]
}

// AI交付物包
export interface DeliverablePackage {
  id: string
  ideaId: string
  agentId: string
  title: string
  description: string
  price: number

  documents: GeneratedDocument[]

  summary: {
    totalPages: number
    totalWordCount: number
    estimatedValue: string
    complexity: 'basic' | 'intermediate' | 'advanced'
  }

  features: string[]
  deliverables: {
    name: string
    pages: number
    description: string
  }[]

  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    timeToImplement: string
    requiredSkills: string[]
    estimatedROI: string
    license: 'personal' | 'commercial' | 'open-source' | 'exclusive'
  }

  pricing: {
    costAnalysis: {
      originalIdeaCost: number
      collaborationCost: number
      packagingCost: number
      platformFee: number
      totalCost: number
    }
    profitMargin: number
    finalPrice: number
  }

  createdAt: Date
  updatedAt: Date
}

// 文档生成配置
export const DocumentTemplates: DocumentTemplate[] = [
  {
    id: 'technical-architecture',
    name: '技术架构设计文档',
    pages: 5,
    category: 'technical',
    sections: [
      {
        title: '系统总体架构',
        description: '整体技术架构设计',
        requiredFields: ['技术栈', '硬件平台', '软件架构', '通信模块'],
        templateContent: `
## {{section_title}}

### 核心技术平台
{{hardware_platform}}

### 软件架构
{{software_architecture}}

### 通信架构
{{communication_architecture}}
        `
      },
      {
        title: 'AI核心算法',
        description: 'AI算法设计与实现',
        requiredFields: ['算法模型', '训练数据', '性能指标'],
        templateContent: `
## {{section_title}}

### 算法模型选择
{{algorithm_model}}

### 数据处理流程
{{data_processing}}

### 性能优化
{{performance_optimization}}
        `
      }
    ]
  },
  {
    id: 'business-plan',
    name: '商业计划书',
    pages: 5,
    category: 'business',
    sections: [
      {
        title: '市场分析',
        description: '目标市场和竞争分析',
        requiredFields: ['市场规模', '目标用户', '竞争对手', '市场机会'],
        templateContent: `
## {{section_title}}

### 市场规模与趋势
{{market_size}}

### 目标用户画像
{{target_users}}

### 竞争格局分析
{{competitive_analysis}}
        `
      },
      {
        title: '盈利模式',
        description: '商业模式和盈利策略',
        requiredFields: ['收入模式', '成本结构', '盈利预测'],
        templateContent: `
## {{section_title}}

### 收入模式设计
{{revenue_model}}

### 成本结构分析
{{cost_structure}}

### 财务预测
{{financial_forecast}}
        `
      }
    ]
  }
]

// API输入验证
export const DocumentGenerationSchema = z.object({
  ideaId: z.string(),
  agentId: z.string(),
  templateIds: z.array(z.string()),
  customization: z.object({
    targetMarket: z.string().optional(),
    priceRange: z.object({
      min: z.number(),
      max: z.number()
    }).optional(),
    complexity: z.enum(['basic', 'intermediate', 'advanced']).optional()
  }).optional()
})