import type { IdeaCharacteristics, TechStackRecommendation, ResearchChannels } from '@/types/business-plan'

/**
 * 创意分析引擎 - 实时分析用户创意特征并生成个性化推荐
 */
export class IdeaAnalysisEngine {

  /**
   * 分析创意特征，提取关键信息用于个性化推荐
   */
  analyzeIdea(ideaTitle: string, ideaDescription: string): IdeaCharacteristics {
    const keywords = this.extractKeywords(ideaTitle + " " + ideaDescription)
    const category = this.classifyByKeywords(keywords)
    const aiNeeds = this.detectAICapabilities(ideaDescription)
    const techComplexity = this.assessTechnicalComplexity(keywords, aiNeeds)
    const marketInfo = this.analyzeMarketCharacteristics(category, keywords)

    return {
      category,
      techIntensity: this.calculateTechIntensity(aiNeeds),
      targetAudience: this.identifyTargetAudience(keywords, category),
      businessModel: this.suggestBusinessModel(category, aiNeeds),
      aiCapabilities: aiNeeds,
      marketMaturity: marketInfo.maturity,
      competitionLevel: marketInfo.competition,
      regulationLevel: marketInfo.regulation,
      technicalComplexity: techComplexity,
      fundingRequirement: this.estimateFundingNeeds(techComplexity, aiNeeds),
      teamRequirement: this.identifyTeamSkills(aiNeeds, techComplexity)
    }
  }

  /**
   * 基于创意特征推荐AI技术栈
   */
  recommendTechStack(characteristics: IdeaCharacteristics): TechStackRecommendation {
    const { category, aiCapabilities, technicalComplexity } = characteristics

    // 教育类创意的AI技术栈推荐
    if (category === '教育' && aiCapabilities.nlp) {
      return {
        beginner: {
          primary: 'OpenAI API + 教育专用模板',
          reason: '教育场景对话质量要求高，OpenAI在中文教育对话上表现优秀',
          cost: '2000-4000元/月',
          timeline: '30天',
          examples: ['智能作业批改', '个性化学习助手'],
          setupGuide: [
            '注册OpenAI API账号',
            '搭建基础对话框架',
            '集成教育知识库',
            '设计学习路径算法'
          ]
        },
        intermediate: {
          primary: 'LangChain + 教育知识库 + 百度文心',
          reason: '可以集成教育专业知识，定制化程度高',
          cost: '4000-8000元/月',
          timeline: '60天',
          examples: ['智能教学系统', '个性化课程推荐'],
          setupGuide: [
            '构建LangChain架构',
            '训练教育领域模型',
            '建立知识图谱',
            '开发推荐算法'
          ]
        },
        advanced: {
          primary: '自训练教育模型 + RAG架构',
          reason: '完全定制化，可以建立教育领域的技术壁垒',
          cost: '10000+元/月',
          timeline: '90天+',
          examples: ['教育领域专用大模型', '多模态教学助手'],
          setupGuide: [
            '收集教育数据集',
            '训练专用模型',
            '构建RAG架构',
            '优化推理性能'
          ]
        }
      }
    }

    // 电商类创意的推荐系统
    if (category === '电商' && aiCapabilities.recommendation) {
      return {
        beginner: {
          primary: '阿里云推荐引擎 + 简单协同过滤',
          reason: '电商推荐算法成熟，阿里云有丰富的电商场景经验',
          cost: '1000-3000元/月',
          timeline: '30天',
          examples: ['商品推荐', '用户画像分析'],
          setupGuide: [
            '配置阿里云推荐引擎',
            '导入商品和用户数据',
            '设置推荐规则',
            '集成前端展示'
          ]
        },
        intermediate: {
          primary: 'TensorFlow Recommenders + 深度学习',
          reason: '可以处理复杂的用户行为和商品特征',
          cost: '3000-6000元/月',
          timeline: '60天',
          examples: ['多目标推荐', '实时个性化推荐'],
          setupGuide: [
            '搭建TensorFlow环境',
            '设计深度学习模型',
            '训练推荐算法',
            '部署实时服务'
          ]
        },
        advanced: {
          primary: 'Graph Neural Networks + 多模态推荐',
          reason: '利用图神经网络和多模态信息，推荐效果最佳',
          cost: '8000+元/月',
          timeline: '90天+',
          examples: ['社交电商推荐', '跨域推荐系统'],
          setupGuide: [
            '构建用户商品图',
            '实现图神经网络',
            '融合多模态数据',
            '优化推荐策略'
          ]
        }
      }
    }

    // 默认通用AI技术栈推荐
    return this.getDefaultTechStackRecommendation(characteristics)
  }

  /**
   * 基于创意特征推荐需求发现渠道
   */
  recommendResearchChannels(characteristics: IdeaCharacteristics): ResearchChannels {
    const { category, targetAudience } = characteristics

    const channelMap = {
      '教育': {
        online: [
          '知乎教育话题 - 搜索"在线教育痛点"、"教学工具"',
          '腾讯课堂评论区 - 分析课程用户反馈',
          '小红书教育博主 - 关注家长和学生需求',
          'B站学习区UP主评论 - 年轻用户学习习惯'
        ],
        offline: [
          '学校实地调研 - 联系当地中小学、大学',
          '教育装备展 - 每年春秋两季，了解行业趋势',
          '家长会 - 直接了解家长对教育工具的需求',
          '培训机构 - 调研机构老师的工作痛点'
        ],
        keywords: ['在线教育', '教学效率', '个性化学习', 'AI教育'],
        tools: ['问卷星教育模板', '腾讯问卷', '用户访谈指南']
      },

      '电商': {
        online: [
          '淘宝评价系统 - 商家工具需求分析',
          '京东问答区 - 用户购物痛点',
          '小红书种草内容 - 消费趋势和需求',
          '抖音带货评论 - 直播电商痛点'
        ],
        offline: [
          '商场实地调研 - 观察消费者购物行为',
          '电商展会 - 了解行业最新趋势',
          '供应商大会 - 了解B端商家需求',
          '物流园区调研 - 了解配送痛点'
        ],
        keywords: ['电商工具', '店铺运营', '选品', '客服自动化'],
        tools: ['淘宝生意参谋', '京东商智', '飞瓜数据']
      },

      '金融': {
        online: [
          '雪球讨论区 - 投资者真实需求和痛点',
          '集思录 - 量化投资用户群体分析',
          '知乎财经话题 - 个人理财需求挖掘',
          '金融界论坛 - 专业金融从业者讨论'
        ],
        offline: [
          '银行网点调研 - 了解客户经理工作痛点',
          '金融科技大会 - 行业趋势和技术需求',
          '投资沙龙 - 高净值用户需求了解',
          '财务公司实地访问 - B端客户需求调研'
        ],
        keywords: ['金融科技', '风控', '智能投顾', '支付创新'],
        tools: ['专业调研问卷', '行业专家访谈', '用户行为分析']
      }
    }

    return channelMap[category] || this.getDefaultResearchChannels()
  }

  // 私有方法：关键词提取
  private extractKeywords(text: string): string[] {
    // AI关键词
    const aiKeywords = ['AI', '人工智能', '机器学习', '深度学习', '神经网络', 'GPT', '大模型', '智能', '自动化']

    // 行业关键词
    const industryKeywords = {
      '教育': ['教育', '学习', '培训', '课程', '老师', '学生', '作业', '考试'],
      '电商': ['电商', '购物', '商品', '店铺', '销售', '客服', '物流', '支付'],
      '金融': ['金融', '投资', '理财', '银行', '保险', '股票', '基金', '风控'],
      '医疗': ['医疗', '健康', '诊断', '治疗', '医生', '患者', '药品', '康复'],
      '娱乐': ['游戏', '视频', '音乐', '直播', '社交', '内容', '娱乐', '互动']
    }

    const foundKeywords: string[] = []
    const lowerText = text.toLowerCase()

    // 检测AI相关关键词
    aiKeywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword)
      }
    })

    // 检测行业关键词
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          foundKeywords.push(keyword)
        }
      })
    })

    return foundKeywords
  }

  // 私有方法：基于关键词分类
  private classifyByKeywords(keywords: string[]): string {
    const categoryScores = {
      '教育': 0,
      '电商': 0,
      '金融': 0,
      '医疗': 0,
      '娱乐': 0
    }

    const keywordCategories = {
      '教育': ['教育', '学习', '培训', '课程', '老师', '学生', '作业', '考试'],
      '电商': ['电商', '购物', '商品', '店铺', '销售', '客服', '物流', '支付'],
      '金融': ['金融', '投资', '理财', '银行', '保险', '股票', '基金', '风控'],
      '医疗': ['医疗', '健康', '诊断', '治疗', '医生', '患者', '药品', '康复'],
      '娱乐': ['游戏', '视频', '音乐', '直播', '社交', '内容', '娱乐', '互动']
    }

    keywords.forEach(keyword => {
      Object.entries(keywordCategories).forEach(([category, categoryKeywords]) => {
        if (categoryKeywords.includes(keyword)) {
          categoryScores[category as keyof typeof categoryScores]++
        }
      })
    })

    const topCategory = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0]

    return topCategory[1] > 0 ? topCategory[0] : '通用'
  }

  // 私有方法：检测AI能力需求
  private detectAICapabilities(description: string): IdeaCharacteristics['aiCapabilities'] {
    const capabilities = {
      nlp: false,
      cv: false,
      ml: false,
      recommendation: false,
      generation: false,
      automation: false
    }

    const lowerDesc = description.toLowerCase()

    // NLP关键词
    if (lowerDesc.includes('对话') || lowerDesc.includes('聊天') || lowerDesc.includes('文本') ||
        lowerDesc.includes('语言') || lowerDesc.includes('翻译')) {
      capabilities.nlp = true
    }

    // CV关键词
    if (lowerDesc.includes('图像') || lowerDesc.includes('视觉') || lowerDesc.includes('识别') ||
        lowerDesc.includes('检测') || lowerDesc.includes('人脸')) {
      capabilities.cv = true
    }

    // 推荐系统关键词
    if (lowerDesc.includes('推荐') || lowerDesc.includes('匹配') || lowerDesc.includes('个性化')) {
      capabilities.recommendation = true
    }

    // 内容生成关键词
    if (lowerDesc.includes('生成') || lowerDesc.includes('创作') || lowerDesc.includes('写作') ||
        lowerDesc.includes('创建')) {
      capabilities.generation = true
    }

    // 自动化关键词
    if (lowerDesc.includes('自动') || lowerDesc.includes('智能') || lowerDesc.includes('流程')) {
      capabilities.automation = true
    }

    // 机器学习关键词
    if (lowerDesc.includes('预测') || lowerDesc.includes('分析') || lowerDesc.includes('学习') ||
        lowerDesc.includes('算法')) {
      capabilities.ml = true
    }

    return capabilities
  }

  // 其他私有方法...
  private calculateTechIntensity(aiCapabilities: IdeaCharacteristics['aiCapabilities']): number {
    const activeCapabilities = Object.values(aiCapabilities).filter(Boolean).length
    return Math.min(activeCapabilities * 2, 10)
  }

  private identifyTargetAudience(keywords: string[], category: string): string[] {
    const audienceMap = {
      '教育': ['学生', '老师', '家长', '培训机构'],
      '电商': ['消费者', '商家', '平台运营'],
      '金融': ['投资者', '银行客户', '金融从业者'],
      '医疗': ['患者', '医生', '医院管理者'],
      '娱乐': ['用户', '内容创作者', '平台方']
    }

    return audienceMap[category] || ['普通用户', '企业用户']
  }

  private suggestBusinessModel(category: string, aiCapabilities: IdeaCharacteristics['aiCapabilities']): string {
    if (category === '教育') return 'SaaS订阅 + 内容付费'
    if (category === '电商') return '佣金分成 + 增值服务'
    if (category === '金融') return '按量付费 + 专业服务'
    return '免费增值模式'
  }

  private assessTechnicalComplexity(keywords: string[], aiCapabilities: IdeaCharacteristics['aiCapabilities']): string {
    const complexityFactors = Object.values(aiCapabilities).filter(Boolean).length
    if (complexityFactors <= 2) return '低'
    if (complexityFactors <= 4) return '中'
    return '高'
  }

  private analyzeMarketCharacteristics(category: string, keywords: string[]) {
    const marketData = {
      '教育': { maturity: '成长期', competition: '激烈', regulation: '中等' },
      '电商': { maturity: '成熟期', competition: '非常激烈', regulation: '严格' },
      '金融': { maturity: '成熟期', competition: '激烈', regulation: '非常严格' },
      '医疗': { maturity: '成长期', competition: '中等', regulation: '非常严格' },
      '娱乐': { maturity: '成熟期', competition: '激烈', regulation: '中等' }
    }

    return marketData[category] || { maturity: '未知', competition: '中等', regulation: '中等' }
  }

  private estimateFundingNeeds(techComplexity: string, aiCapabilities: IdeaCharacteristics['aiCapabilities']): string {
    const capabilityCount = Object.values(aiCapabilities).filter(Boolean).length

    if (techComplexity === '低' && capabilityCount <= 2) return '低（5万以内）'
    if (techComplexity === '中' && capabilityCount <= 4) return '中（5-20万）'
    return '高（20万以上）'
  }

  private identifyTeamSkills(aiCapabilities: IdeaCharacteristics['aiCapabilities'], techComplexity: string): string[] {
    const baseSkills = ['产品经理', '前端开发', '后端开发']
    const aiSkills = []

    if (aiCapabilities.nlp) aiSkills.push('NLP工程师')
    if (aiCapabilities.cv) aiSkills.push('计算机视觉工程师')
    if (aiCapabilities.ml || aiCapabilities.recommendation) aiSkills.push('机器学习工程师')

    if (techComplexity === '高') {
      aiSkills.push('AI架构师', '数据科学家')
    }

    return [...baseSkills, ...aiSkills]
  }

  private getDefaultTechStackRecommendation(characteristics: IdeaCharacteristics): TechStackRecommendation {
    return {
      beginner: {
        primary: 'OpenAI API + 基础框架',
        reason: '快速上手，生态完善',
        cost: '2000-4000元/月',
        timeline: '30天',
        examples: ['基础AI应用'],
        setupGuide: ['注册API', '搭建基础架构', '实现核心功能']
      },
      intermediate: {
        primary: 'LangChain + 本土AI服务',
        reason: '更好的控制和定制',
        cost: '4000-8000元/月',
        timeline: '60天',
        examples: ['定制化AI应用'],
        setupGuide: ['框架搭建', '模型集成', '功能优化']
      },
      advanced: {
        primary: '自研AI架构',
        reason: '完全定制，技术壁垒',
        cost: '10000+元/月',
        timeline: '90天+',
        examples: ['行业专用AI系统'],
        setupGuide: ['架构设计', '模型训练', '系统优化']
      }
    }
  }

  private getDefaultResearchChannels(): ResearchChannels {
    return {
      online: ['知乎相关话题', '微博讨论', '专业论坛', '用户社群'],
      offline: ['行业会议', '用户访谈', '实地调研', '专家咨询'],
      keywords: ['用户需求', '市场痛点', '解决方案', '竞品分析'],
      tools: ['问卷调研', '用户访谈', '数据分析', '原型测试']
    }
  }
}

export default IdeaAnalysisEngine