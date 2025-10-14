/**
 * 中国市场MVP开发合规指导库
 *
 * 提供详细的合规要求说明、检查清单和实用建议
 * 帮助创业者了解在中国开发MVP需要注意的法规要求
 */

export type PlatformType = 'website' | 'app' | 'mini_program' | 'h5' | 'other'
export type TargetAudience = 'b2c' | 'b2b' | 'c2c' | 'internal'
export type DataCollection = 'none' | 'basic' | 'sensitive' | 'personal_id'

// 合规要求详细说明
export const COMPLIANCE_REQUIREMENTS = {
  icp_filing: {
    title: 'ICP备案要求',
    required: ['website', 'h5'],
    optional: ['mini_program'],
    not_required: ['app'],
    description: '在中国大陆提供互联网信息服务必须进行ICP备案',
    details: {
      process: [
        '1. 购买中国大陆服务器/虚拟主机',
        '2. 准备企业/个人备案资料',
        '3. 通过服务器提供商提交备案申请',
        '4. 等待工信部审核（通常20个工作日）',
        '5. 获得ICP备案号并在网站显示'
      ],
      materials: [
        '营业执照（企业）或身份证（个人）',
        '网站负责人身份证和联系方式',
        '域名证书',
        '服务器接入商资质',
        '网站建设方案书'
      ],
      timeframe: '首次备案：20个工作日；变更备案：10个工作日',
      cost: '免费（但需购买中国大陆服务器）',
      tips: [
        '个人备案不能用于商业用途',
        '备案期间网站无法访问',
        '建议提前准备，不要等到MVP开发完成才开始'
      ]
    }
  },

  business_license: {
    title: '营业执照要求',
    triggers: [
      '涉及商业交易（B2C、C2C平台）',
      '收取服务费用',
      '涉及支付功能',
      '广告业务',
      '数据服务'
    ],
    description: '从事经营性互联网信息服务需要营业执照',
    types: {
      individual: {
        name: '个体工商户',
        suitable_for: '小规模个人项目，年营业额较低',
        advantages: ['注册简单', '税负较轻', '运营成本低'],
        disadvantages: ['融资困难', '业务范围限制', '个人承担无限责任']
      },
      llc: {
        name: '有限责任公司',
        suitable_for: '计划融资或规模化的项目',
        advantages: ['有限责任', '便于融资', '业务范围广'],
        disadvantages: ['注册复杂', '税负相对较高', '财务要求严格']
      }
    },
    registration_process: [
      '1. 企业核名（1-3个工作日）',
      '2. 提交设立申请（3-5个工作日）',
      '3. 领取营业执照（1个工作日）',
      '4. 刻制公章（1个工作日）',
      '5. 开立银行账户（1-3个工作日）',
      '6. 税务登记（即时）'
    ]
  },

  payment_compliance: {
    title: '支付合规要求',
    description: '涉及在线支付功能需要满足相关合规要求',
    key_points: [
      '使用持牌支付机构（支付宝、微信支付等）',
      '个人收款有限额（微信/支付宝年限额20万）',
      '商户收款需要营业执照',
      '大额交易需要实名认证'
    ],
    compliance_levels: {
      personal: {
        limit: '个人年收款限额20万元',
        requirements: ['实名认证', '绑定银行卡'],
        suitable_for: '小规模测试、早期验证'
      },
      business: {
        limit: '无限额',
        requirements: ['营业执照', '对公银行账户', '签约商户协议'],
        suitable_for: '正式商业运营'
      }
    },
    recommendations: [
      'MVP阶段可以先用个人收款测试',
      '一旦有稳定收入立即注册公司',
      '使用第三方聚合支付降低接入成本',
      '注意保留所有交易记录'
    ]
  },

  data_protection: {
    title: '数据保护合规',
    laws: ['网络安全法', '数据安全法', '个人信息保护法'],
    description: '收集、使用个人信息需要遵守相关法律法规',
    compliance_by_level: {
      none: {
        description: '不收集任何个人信息',
        requirements: []
      },
      basic: {
        description: '收集基本信息（手机号、邮箱等）',
        requirements: [
          '明确告知收集目的',
          '获得用户同意',
          '提供隐私政策',
          '数据加密存储'
        ]
      },
      sensitive: {
        description: '收集敏感信息（位置、生物识别等）',
        requirements: [
          '获得明确同意',
          '数据分类分级保护',
          '定期安全评估',
          '数据出境安全评估'
        ]
      },
      personal_id: {
        description: '收集身份证等强身份信息',
        requirements: [
          '业务必要性证明',
          '严格访问控制',
          '数据脱敏处理',
          '监管备案要求'
        ]
      }
    }
  },

  content_compliance: {
    title: '内容合规要求',
    description: 'UGC平台、社区类产品需要建立内容审核机制',
    requirements: [
      '建立内容审核制度',
      '配备专职审核人员',
      '技术手段过滤违法内容',
      '用户举报处理机制',
      '违规内容处置记录'
    ],
    prohibited_content: [
      '危害国家安全',
      '暴力恐怖信息',
      '色情低俗内容',
      '虚假信息',
      '侵犯他人权益'
    ]
  }
}

// 合规检查清单生成器
export function generateComplianceChecklist(config: {
  platformType: PlatformType
  targetAudience: TargetAudience
  dataCollection: DataCollection
  involvePayment: boolean
  hasUserContent: boolean
}): Array<{
  category: string
  title: string
  required: boolean
  priority: 'high' | 'medium' | 'low'
  description: string
  actionItems: string[]
  timeframe: string
}> {
  const checklist: Array<{
    category: string
    title: string
    required: boolean
    priority: 'high' | 'medium' | 'low'
    description: string
    actionItems: string[]
    timeframe: string
  }> = []

  // ICP备案检查
  const icpRequired = ['website', 'h5'].includes(config.platformType)
  checklist.push({
    category: '备案许可',
    title: 'ICP备案',
    required: icpRequired,
    priority: icpRequired ? 'high' : 'low',
    description: icpRequired ? '网站/H5应用必须完成ICP备案才能正常访问' : 'APP暂不需要ICP备案',
    actionItems: icpRequired ? [
      '购买中国大陆服务器',
      '准备备案材料',
      '提交备案申请',
      '等待审核通过'
    ] : ['暂无需要'],
    timeframe: icpRequired ? '20个工作日' : '无'
  })

  // 营业执照检查
  const businessRequired = config.targetAudience !== 'internal' &&
    (config.involvePayment || ['b2c', 'c2c'].includes(config.targetAudience))
  checklist.push({
    category: '主体资质',
    title: '营业执照',
    required: businessRequired,
    priority: businessRequired ? 'high' : 'medium',
    description: businessRequired ? '商业化运营必须注册公司或个体工商户' : '内部系统可暂不需要',
    actionItems: businessRequired ? [
      '确定注册类型（个体户/公司）',
      '准备注册材料',
      '办理营业执照',
      '开立银行对公账户'
    ] : ['建议未来考虑'],
    timeframe: businessRequired ? '5-10个工作日' : '无'
  })

  // 支付合规检查
  if (config.involvePayment) {
    checklist.push({
      category: '支付合规',
      title: '支付资质',
      required: true,
      priority: 'high',
      description: '涉及资金收付必须使用合规支付渠道',
      actionItems: [
        '选择持牌支付机构',
        '完成商户入网',
        '实施风控措施',
        '建立资金监控'
      ],
      timeframe: '3-7个工作日'
    })
  }

  // 数据保护检查
  if (config.dataCollection !== 'none') {
    const isPersonalId = config.dataCollection === 'personal_id'
    checklist.push({
      category: '数据保护',
      title: '个人信息保护',
      required: true,
      priority: isPersonalId ? 'high' : 'medium',
      description: '收集个人信息必须遵守相关法律法规',
      actionItems: [
        '制定隐私政策',
        '实施数据加密',
        '建立用户同意机制',
        '定期安全评估'
      ],
      timeframe: '持续进行'
    })
  }

  // 内容合规检查
  if (config.hasUserContent) {
    checklist.push({
      category: '内容合规',
      title: '内容审核机制',
      required: true,
      priority: 'medium',
      description: 'UGC平台必须建立完善的内容审核机制',
      actionItems: [
        '建立审核制度',
        '部署技术过滤',
        '配备审核人员',
        '建立举报处理流程'
      ],
      timeframe: '产品上线前'
    })
  }

  return checklist.sort((a, b) => {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// 合规风险评估
export function assessComplianceRisk(config: {
  platformType: PlatformType
  targetAudience: TargetAudience
  dataCollection: DataCollection
  involvePayment: boolean
  hasUserContent: boolean
}): {
  overallRisk: 'low' | 'medium' | 'high'
  riskFactors: string[]
  recommendations: string[]
  estimatedComplianceCost: string
  estimatedTimeframe: string
} {
  const risks: string[] = []
  const recommendations: string[] = []
  let riskScore = 0

  // 平台类型风险评估
  if (['website', 'h5'].includes(config.platformType)) {
    risks.push('需要ICP备案，可能影响上线时间')
    recommendations.push('提前准备备案材料，选择可靠的服务器提供商')
    riskScore += 2
  }

  // 商业化风险评估
  if (config.involvePayment) {
    risks.push('涉及支付合规，需要营业执照')
    recommendations.push('尽早注册公司，选择合规的支付渠道')
    riskScore += 3
  }

  // 数据保护风险评估
  if (config.dataCollection === 'personal_id') {
    risks.push('收集身份信息风险较高，监管要求严格')
    recommendations.push('评估业务必要性，实施严格的数据保护措施')
    riskScore += 3
  } else if (config.dataCollection !== 'none') {
    risks.push('需要遵守个人信息保护法')
    recommendations.push('制定完善的隐私政策和数据保护措施')
    riskScore += 1
  }

  // 内容合规风险评估
  if (config.hasUserContent) {
    risks.push('UGC内容存在合规风险')
    recommendations.push('建立内容审核机制，配备专业团队')
    riskScore += 2
  }

  // B2C业务风险评估
  if (config.targetAudience === 'b2c') {
    risks.push('面向消费者业务监管较严')
    recommendations.push('关注消费者权益保护相关规定')
    riskScore += 1
  }

  // 风险等级判断
  let overallRisk: 'low' | 'medium' | 'high'
  if (riskScore <= 3) {
    overallRisk = 'low'
  } else if (riskScore <= 6) {
    overallRisk = 'medium'
  } else {
    overallRisk = 'high'
  }

  // 成本和时间估算
  let estimatedCost = '5,000-15,000元'
  let estimatedTime = '2-4周'

  if (overallRisk === 'high') {
    estimatedCost = '20,000-50,000元'
    estimatedTime = '1-2个月'
  } else if (overallRisk === 'low') {
    estimatedCost = '2,000-8,000元'
    estimatedTime = '1-2周'
  }

  return {
    overallRisk,
    riskFactors: risks,
    recommendations,
    estimatedComplianceCost: estimatedCost,
    estimatedTimeframe: estimatedTime
  }
}

// MVP阶段合规建议
export const MVP_COMPLIANCE_RECOMMENDATIONS = {
  phase_1_validation: {
    title: 'MVP验证阶段（0-3个月）',
    focus: '快速验证想法，最小合规成本',
    recommendations: [
      '使用个人收款进行小规模测试',
      '避免收集敏感个人信息',
      '使用第三方平台（如微信群、QQ群）进行用户沟通',
      '准备ICP备案材料但暂缓提交'
    ],
    compliance_priority: ['数据保护基础措施', '用户协议模板'],
    cost_estimate: '1,000-3,000元'
  },

  phase_2_growth: {
    title: 'MVP增长阶段（3-6个月）',
    focus: '规范化运营，建立基础合规体系',
    recommendations: [
      '注册营业执照（建议有限公司）',
      '完成ICP备案（如需要）',
      '接入正规支付渠道',
      '建立基础的用户服务体系'
    ],
    compliance_priority: ['营业执照', 'ICP备案', '支付合规'],
    cost_estimate: '10,000-25,000元'
  },

  phase_3_scale: {
    title: 'MVP规模化阶段（6个月以后）',
    focus: '完善合规体系，支撑业务发展',
    recommendations: [
      '建立完整的法务合规团队',
      '实施全面的数据保护措施',
      '建立内容审核和风控系统',
      '考虑相关行业资质申请'
    ],
    compliance_priority: ['数据保护升级', '内容合规', '行业资质'],
    cost_estimate: '50,000-100,000元'
  }
}

// 常见合规错误和避免方法
export const COMMON_COMPLIANCE_MISTAKES = [
  {
    mistake: '等到产品完成才考虑备案',
    consequence: '导致产品无法及时上线，错过市场窗口',
    solution: 'MVP规划阶段就开始准备备案材料'
  },
  {
    mistake: '使用个人支付渠道进行商业收款',
    consequence: '触及个人收款限额，资金安全风险',
    solution: '有收入后立即注册公司，使用对公收款'
  },
  {
    mistake: '收集用户信息未告知用途',
    consequence: '违反个人信息保护法，面临处罚风险',
    solution: '制定清晰的隐私政策，获得用户明确同意'
  },
  {
    mistake: 'UGC平台缺乏内容审核',
    consequence: '违规内容传播，平台承担法律责任',
    solution: '上线前建立内容审核机制和应急响应流程'
  },
  {
    mistake: '忽视数据安全保护',
    consequence: '用户数据泄露，面临巨额赔偿和监管处罚',
    solution: '实施数据加密、访问控制等安全措施'
  }
]