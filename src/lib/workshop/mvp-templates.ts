/**
 * MVP模板库
 *
 * 提供常见MVP类型的模板和建议，帮助用户快速开始
 * 包含适合中国市场的技术栈推荐和合规建议
 */

export interface MVPTemplate {
  id: string
  title: string
  description: string
  category: string
  targetAudience: string[]
  estimatedCost: {
    development: string
    operation: string
    compliance: string
  }
  estimatedTime: string
  complexity: 'low' | 'medium' | 'high'
  recommendedFeatures: {
    mustHave: string[]
    shouldHave: string[]
    couldHave: string[]
  }
  techStackOptions: {
    noCode: string[]
    lowCode: string[]
    customDev: string[]
  }
  validationMethods: string[]
  complianceConsiderations: string[]
  successCases: Array<{
    name: string
    description: string
    keyLearning: string
  }>
  nextSteps: string[]
}

// MVP模板库
export const MVP_TEMPLATES: MVPTemplate[] = [
  {
    id: 'saas_app',
    title: 'SaaS应用',
    description: '基于订阅的软件服务，解决特定业务问题',
    category: '企业服务',
    targetAudience: ['B2B企业', '中小企业', '专业人士'],
    estimatedCost: {
      development: '30,000-80,000元',
      operation: '3,000-8,000元/月',
      compliance: '10,000-20,000元'
    },
    estimatedTime: '2-4个月',
    complexity: 'medium',
    recommendedFeatures: {
      mustHave: [
        '用户注册和登录',
        '核心功能模块',
        '基础仪表板',
        '用户权限管理',
        '数据导入导出'
      ],
      shouldHave: [
        '多租户架构',
        'API接口',
        '数据备份',
        '基础分析统计',
        '邮件通知'
      ],
      couldHave: [
        '移动端适配',
        '第三方集成',
        '高级分析',
        '自动化工作流',
        '白标定制'
      ]
    },
    techStackOptions: {
      noCode: ['腾讯云微搭', '阿里云宜搭', '金山表单'],
      lowCode: ['OutSystems', 'Mendix', '炎黄盈动'],
      customDev: ['React + Node.js', 'Vue + Java', 'Next.js + PostgreSQL']
    },
    validationMethods: ['landing_page', 'prototype', 'concierge'],
    complianceConsiderations: [
      '需要营业执照',
      'ICP备案（如有官网）',
      '数据安全保护',
      '企业客户合同条款'
    ],
    successCases: [
      {
        name: '飞书',
        description: '从内部工具发展为企业协作平台',
        keyLearning: '先解决内部问题，再向外推广'
      },
      {
        name: '石墨文档',
        description: '在线协作文档工具',
        keyLearning: '专注核心功能，逐步扩展生态'
      }
    ],
    nextSteps: [
      '确定目标客户和痛点',
      '设计最小功能集',
      '搭建MVP原型',
      '找到首批种子用户',
      '收集反馈并迭代'
    ]
  },

  {
    id: 'marketplace',
    title: '双边市场平台',
    description: '连接供需双方，促成交易的平台型业务',
    category: '平台经济',
    targetAudience: ['消费者', '服务提供者', '中小商家'],
    estimatedCost: {
      development: '50,000-120,000元',
      operation: '8,000-20,000元/月',
      compliance: '20,000-40,000元'
    },
    estimatedTime: '3-6个月',
    complexity: 'high',
    recommendedFeatures: {
      mustHave: [
        '用户注册（买家/卖家）',
        '商品/服务发布',
        '搜索和筛选',
        '交易系统',
        '评价机制'
      ],
      shouldHave: [
        '实时聊天',
        '支付集成',
        '订单管理',
        '推荐算法',
        '移动端支持'
      ],
      couldHave: [
        '地理位置服务',
        '直播功能',
        '营销工具',
        '数据分析',
        'API开放平台'
      ]
    },
    techStackOptions: {
      noCode: ['有赞', '微盟', '人人商城'],
      lowCode: ['Shopify + 定制', 'Magento + 插件'],
      customDev: ['Next.js + Stripe', 'Laravel + Vue', 'Django + React']
    },
    validationMethods: ['concierge', 'wizard_of_oz', 'landing_page'],
    complianceConsiderations: [
      '营业执照必需',
      '支付牌照或第三方支付',
      'ICP备案和ICP经营许可证',
      '用户协议和交易规则',
      '数据保护和隐私政策',
      '消费者权益保护'
    ],
    successCases: [
      {
        name: '闲鱼',
        description: '二手交易平台，依托支付宝生态',
        keyLearning: '先解决信任问题，再优化交易体验'
      },
      {
        name: '猪八戒',
        description: '服务众包平台',
        keyLearning: '建立服务标准化和质量保障机制'
      }
    ],
    nextSteps: [
      '选择垂直细分市场',
      '先解决供给侧还是需求侧',
      '设计最小闭环交易流程',
      '建立初始信任机制',
      '逐步扩展品类和功能'
    ]
  },

  {
    id: 'mobile_app',
    title: '移动应用',
    description: 'iOS/Android应用，提供便捷的移动服务',
    category: '移动互联网',
    targetAudience: ['手机用户', '年轻群体', '移动优先用户'],
    estimatedCost: {
      development: '40,000-100,000元',
      operation: '5,000-15,000元/月',
      compliance: '8,000-15,000元'
    },
    estimatedTime: '2-4个月',
    complexity: 'medium',
    recommendedFeatures: {
      mustHave: [
        '用户注册登录',
        '核心功能模块',
        '推送通知',
        '基础设置',
        '意见反馈'
      ],
      shouldHave: [
        '离线支持',
        '分享功能',
        '搜索功能',
        '用户个人中心',
        '数据同步'
      ],
      couldHave: [
        '深度链接',
        '生物识别认证',
        'AR/VR功能',
        '智能推荐',
        '社交功能'
      ]
    },
    techStackOptions: {
      noCode: ['APICloud', '叮当应用'],
      lowCode: ['Flutter Flow', 'Adalo'],
      customDev: ['React Native', 'Flutter', 'Swift + Kotlin']
    },
    validationMethods: ['prototype', 'beta_testing', 'fake_door'],
    complianceConsiderations: [
      '应用商店审核规则',
      '用户隐私协议',
      '数据安全保护',
      '内容合规审核',
      '支付合规（如涉及）'
    ],
    successCases: [
      {
        name: '小红书',
        description: '从购物分享到生活方式平台',
        keyLearning: '社区驱动增长，内容创造价值'
      },
      {
        name: '得到',
        description: '知识付费应用',
        keyLearning: '专注细分市场，提供优质内容'
      }
    ],
    nextSteps: [
      '确定核心使用场景',
      '设计用户流程',
      '开发原型验证',
      '内测收集反馈',
      '优化后正式发布'
    ]
  },

  {
    id: 'mini_program',
    title: '微信小程序',
    description: '基于微信生态的轻量化应用',
    category: '微信生态',
    targetAudience: ['微信用户', '本地服务用户', 'O2O场景'],
    estimatedCost: {
      development: '15,000-50,000元',
      operation: '2,000-8,000元/月',
      compliance: '5,000-12,000元'
    },
    estimatedTime: '1-3个月',
    complexity: 'low',
    recommendedFeatures: {
      mustHave: [
        '微信授权登录',
        '核心业务功能',
        '微信支付',
        '分享转发',
        '客服功能'
      ],
      shouldHave: [
        '模板消息',
        '地理位置',
        '扫码功能',
        '表单收集',
        '数据统计'
      ],
      couldHave: [
        '直播功能',
        '小程序码',
        '群聊机器人',
        '公众号打通',
        '企业微信集成'
      ]
    },
    techStackOptions: {
      noCode: ['微盟', '有赞'],
      lowCode: ['腾讯云开发', '小程序云开发'],
      customDev: ['原生小程序', 'Taro', 'uni-app']
    },
    validationMethods: ['prototype', 'landing_page', 'concierge'],
    complianceConsiderations: [
      '小程序审核规则',
      '微信支付商户资质',
      '内容合规要求',
      '用户隐私保护',
      '营业执照（如涉及交易）'
    ],
    successCases: [
      {
        name: '拼多多',
        description: '基于微信社交的电商小程序',
        keyLearning: '利用社交关系链降低获客成本'
      },
      {
        name: '美团外卖',
        description: '本地生活服务小程序',
        keyLearning: '高频刚需服务，注重用户体验'
      }
    ],
    nextSteps: [
      '注册小程序账号',
      '完善资质信息',
      '开发核心功能',
      '提交审核发布',
      '推广获取用户'
    ]
  },

  {
    id: 'content_platform',
    title: '内容平台',
    description: 'UGC/PGC内容创作和分发平台',
    category: '内容媒体',
    targetAudience: ['内容创作者', '内容消费者', '垂直领域用户'],
    estimatedCost: {
      development: '60,000-150,000元',
      operation: '10,000-30,000元/月',
      compliance: '25,000-50,000元'
    },
    estimatedTime: '4-6个月',
    complexity: 'high',
    recommendedFeatures: {
      mustHave: [
        '内容发布系统',
        '内容审核机制',
        '用户关注系统',
        '评论互动',
        '搜索发现'
      ],
      shouldHave: [
        '推荐算法',
        '内容标签',
        '创作者工具',
        '数据分析',
        '变现功能'
      ],
      couldHave: [
        '直播功能',
        '付费内容',
        '广告系统',
        '社群功能',
        'AI辅助创作'
      ]
    },
    techStackOptions: {
      noCode: ['知识星球', '小鹅通'],
      lowCode: ['WordPress + 插件', 'Ghost + 定制'],
      customDev: ['Next.js + CMS', 'Django + React', 'Laravel + Vue']
    },
    validationMethods: ['prototype', 'concierge', 'fake_door'],
    complianceConsiderations: [
      '内容审核制度',
      '版权保护机制',
      '用户协议完善',
      '广告合规要求',
      'ICP备案和许可证',
      '网络安全等级保护'
    ],
    successCases: [
      {
        name: 'B站',
        description: '年轻人文化社区',
        keyLearning: '建立独特的社区文化和用户生态'
      },
      {
        name: '知乎',
        description: '知识问答社区',
        keyLearning: '专业内容沉淀，逐步商业化'
      }
    ],
    nextSteps: [
      '确定内容垂直领域',
      '设计内容创作工具',
      '建立内容审核体系',
      '吸引种子创作者',
      '优化分发算法'
    ]
  },

  {
    id: 'tool_service',
    title: '工具类服务',
    description: '解决特定问题的实用工具或服务',
    category: '工具效率',
    targetAudience: ['专业人士', '企业用户', '有特定需求的用户'],
    estimatedCost: {
      development: '20,000-60,000元',
      operation: '3,000-10,000元/月',
      compliance: '5,000-15,000元'
    },
    estimatedTime: '1-3个月',
    complexity: 'low',
    recommendedFeatures: {
      mustHave: [
        '核心工具功能',
        '简单用户系统',
        '使用说明',
        '结果导出',
        '基础设置'
      ],
      shouldHave: [
        '批量处理',
        '历史记录',
        '模板功能',
        '数据统计',
        '用户反馈'
      ],
      couldHave: [
        'API接口',
        '第三方集成',
        '高级功能',
        '团队协作',
        '自动化流程'
      ]
    },
    techStackOptions: {
      noCode: ['Bubble', 'Webflow + Zapier'],
      lowCode: ['Streamlit', 'Gradio'],
      customDev: ['Flask + React', 'FastAPI + Vue', 'Express + Angular']
    },
    validationMethods: ['prototype', 'landing_page', 'fake_door'],
    complianceConsiderations: [
      '数据处理合规',
      '用户隐私保护',
      '服务条款明确',
      'API使用规范'
    ],
    successCases: [
      {
        name: '墨刀',
        description: '原型设计工具',
        keyLearning: '专注解决设计师痛点，逐步扩展功能'
      },
      {
        name: '石墨文档',
        description: '在线文档协作工具',
        keyLearning: '简单易用，满足基础协作需求'
      }
    ],
    nextSteps: [
      '验证工具需求',
      '开发核心功能',
      '优化用户体验',
      '收集用户反馈',
      '迭代功能完善'
    ]
  }
]

// 根据用户输入推荐合适的模板
export function recommendMVPTemplate(userInput: {
  problemDescription: string
  targetUser: string
  budgetRange: string
  timeframe: string
}): MVPTemplate[] {
  // 简单的关键词匹配推荐逻辑
  const recommendations: MVPTemplate[] = []

  const problem = userInput.problemDescription.toLowerCase()
  const user = userInput.targetUser.toLowerCase()

  // 基于关键词匹配
  if (problem.includes('企业') || problem.includes('管理') || problem.includes('效率')) {
    recommendations.push(MVP_TEMPLATES.find(t => t.id === 'saas_app')!)
  }

  if (problem.includes('买卖') || problem.includes('交易') || problem.includes('平台')) {
    recommendations.push(MVP_TEMPLATES.find(t => t.id === 'marketplace')!)
  }

  if (problem.includes('手机') || problem.includes('移动') || user.includes('年轻')) {
    recommendations.push(MVP_TEMPLATES.find(t => t.id === 'mobile_app')!)
  }

  if (problem.includes('微信') || problem.includes('小程序') || problem.includes('本地')) {
    recommendations.push(MVP_TEMPLATES.find(t => t.id === 'mini_program')!)
  }

  if (problem.includes('内容') || problem.includes('创作') || problem.includes('分享')) {
    recommendations.push(MVP_TEMPLATES.find(t => t.id === 'content_platform')!)
  }

  if (problem.includes('工具') || problem.includes('处理') || problem.includes('转换')) {
    recommendations.push(MVP_TEMPLATES.find(t => t.id === 'tool_service')!)
  }

  // 如果没有匹配的，返回最通用的模板
  if (recommendations.length === 0) {
    recommendations.push(
      MVP_TEMPLATES.find(t => t.id === 'tool_service')!,
      MVP_TEMPLATES.find(t => t.id === 'mini_program')!,
      MVP_TEMPLATES.find(t => t.id === 'saas_app')!
    )
  }

  return recommendations.filter(Boolean).slice(0, 3)
}

// 根据模板生成预配置的表单数据
export function generateTemplateFormData(templateId: string): Partial<any> {
  const template = MVP_TEMPLATES.find(t => t.id === templateId)
  if (!template) return {}

  return {
    problemStatement: {
      targetUser: template.targetAudience.join('、'),
      existingSolutions: [],
      userPainLevel: 7
    },
    coreFeatures: {
      mustHave: template.recommendedFeatures.mustHave,
      shouldHave: template.recommendedFeatures.shouldHave,
      couldHave: template.recommendedFeatures.couldHave,
      featurePriorityMatrix: template.recommendedFeatures.mustHave.slice(0, 3).map(feature => ({
        feature,
        impact: 'high' as const,
        effort: 'medium' as const
      }))
    },
    mvpValidation: {
      successMetrics: ['用户活跃度', '核心功能使用率'],
      testingApproach: template.validationMethods[0] as any,
      budgetRange: 'under_5k' as any,
      targetUserCount: 100,
      keyAssumptions: ['用户确实有这个痛点', '我们的解决方案有效']
    },
    implementationPlan: {
      developmentApproach: template.complexity === 'low' ? 'no_code' : 'custom_development' as any,
      techStack: template.techStackOptions.customDev.slice(0, 3),
      keyResources: ['开发团队', '设计师', '测试用户'],
      riskFactors: ['技术风险', '市场风险'],
      estimatedDevelopmentTime: template.estimatedTime.includes('1-2') ? 'under_1_month' : '1_to_3_months' as any
    }
  }
}