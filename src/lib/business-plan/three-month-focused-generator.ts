import type { BusinessPlanStageConfig } from '@/types/business-plan'
import { AIServiceFactory, AIProvider } from '@/lib/ai-services'

/**
 * 3个月聚焦实战创意实现建议器
 * 重点关注：技术栈选择、需求发现渠道、线下调研活动
 */
export class ThreeMonthFocusedGenerator {
  private aiService = AIServiceFactory

  /**
   * 阶段4升级版：90天聚焦实施计划 (DeepSeek, 20-25分钟)
   *
   * 核心特色：
   * 1. AI技术栈推荐引擎
   * 2. 需求发现渠道指南
   * 3. 线下调研活动资源
   * 4. 每日执行计划
   */
  async generateFocused90DayPlan(
    stage: BusinessPlanStageConfig,
    context: any
  ) {
    const prompt = `
你是一名实战创业导师，专门为创业者设计90天冲刺计划。
你的特长是AI技术选型、需求发现和线下调研指导。

创意信息：
- 标题：${context.ideaTitle}
- 描述：${context.ideaDescription}
- 分类：${context.category}
- 基本盘分析：${JSON.stringify(context.previousStagesOutput.basic_market_analysis, null, 2)}

请设计一个90天的实战冲刺计划，重点关注以下4个核心模块：

## 🤖 模块1：AI技术栈推荐引擎

### 1.1 基于创意的技术栈分析
根据"${context.ideaTitle}"的特点，推荐最适合的AI技术栈：

#### 核心AI能力需求分析
- 这个创意需要哪些AI能力？(NLP/CV/推荐/预测/生成)
- 数据处理需求：结构化数据/非结构化数据/实时数据
- 计算资源需求：CPU密集/GPU密集/边缘计算

#### 技术栈推荐（按实现难度分级）
**🟢 入门级实现（30天可上手）**
- 主推技术：具体的框架/平台/API
- 为什么推荐：学习成本低，社区支持好
- 实现路径：具体的学习资源和实践步骤
- 预期效果：能实现的功能范围

**🟡 进阶级实现（60天可掌握）**
- 主推技术：更高级的框架和自定义方案
- 技术优势：性能更好，定制化程度高
- 学习要求：需要的前置技能
- 实现路径：进阶学习计划

**🔴 专家级实现（90天+长期发展）**
- 前沿技术：最新的AI技术和研究方向
- 竞争优势：技术护城河的构建
- 长期价值：未来3-5年的技术规划

#### 具体技术选型建议
**AI模型服务商对比**
- OpenAI API: 适用场景、价格、限制
- 百度文心: 本土化优势、API调用方式
- 阿里通义: 企业级服务、成本对比
- 智谱GLM: 开源方案、自部署选项

**开发框架推荐**
- 前端：React/Vue + AI组件库推荐
- 后端：Python Flask/FastAPI + AI集成方案
- 数据库：向量数据库选择 (Pinecone/Weaviate/Qdrant)
- 部署：云服务商选择和成本估算

**实战开发路线图**
第1-30天：基础MVP开发
- 第1周：环境搭建，API调试
- 第2周：核心功能实现
- 第3周：用户界面开发
- 第4周：基础测试和部署

第31-60天：功能扩展和优化
- 数据收集和标注
- 模型fine-tuning
- 性能优化
- 用户反馈集成

第61-90天：产品化和商业化
- 多用户支持
- 付费功能开发
- 数据分析后台
- 商业化准备

### 1.2 无代码/低代码方案
如果没有技术团队，推荐无代码AI平台：
- 飞书智能伙伴：适合企业内部AI应用
- 腾讯云AI平台：拖拽式AI应用构建
- 百度EasyDL：零门槛AI模型训练
- 阿里PAI：企业级AI开发平台

## 🔍 模块2：需求发现渠道指南

### 2.1 线上需求发现渠道
**社交媒体挖掘**
- 微博话题热搜：搜索相关关键词，分析用户讨论
- 知乎问答分析：相关领域的高赞问答，痛点识别
- 小红书内容：用户真实体验和需求表达
- 抖音评论区：短视频下的用户反馈和需求

**专业平台调研**
- GitHub Issues：开源项目中的功能需求和bug报告
- Stack Overflow：技术问题和解决方案需求
- Product Hunt：新产品的用户反馈和改进建议
- Reddit相关社区：海外用户的真实讨论

**垂直行业平台**
根据${context.category}行业特点，推荐具体平台：
- 如果是教育类：知乎教育话题、腾讯课堂评论、网易云课堂
- 如果是电商类：淘宝评价、京东问答、拼多多商家论坛
- 如果是金融类：雪球讨论、集思录、金融界论坛
- 如果是医疗类：丁香医生、好大夫在线、春雨医生

**需求挖掘工具箱**
- 关键词监控：百度指数、微指数、5118关键词工具
- 竞品分析：SimilarWeb、App Annie、七麦数据
- 用户反馈：问卷星、腾讯问卷、用户访谈工具

### 2.2 线下需求发现方法
**目标用户聚集地识别**
- 写字楼/商业区：针对上班族的创意
- 学校/培训机构：针对学生群体的创意
- 医院/社区：针对健康/生活服务的创意
- 商场/超市：针对消费者的创意

**实地调研技巧**
- 观察法：在目标场所观察用户行为模式
- 访谈法：与用户面对面深度交流
- 体验法：亲自体验现有解决方案的不足
- 问卷法：结构化收集大量用户意见

## 🏃‍♂️ 模块3：线下调研活动资源

### 3.1 行业活动日历
**全国性大型活动**
- 中国国际软件博览会（6月，北京）
- 世界互联网大会（11月，乌镇）
- 中国国际进口博览会（11月，上海）
- 深圳高交会（11月，深圳）

**行业垂直活动**
根据${context.category}推荐相关活动：
- 科技类：CES Asia、GTLC全球技术大会、QCon
- 电商类：电商博览会、新零售大会、直播电商大会
- 教育类：GET教育科技大会、中国教育装备展、智慧教育展
- 金融类：朗迪峰会、中国金融科技大会、区块链大会

**本地化活动挖掘**
- 各地创业园区的Demo Day和路演活动
- 大学的创业比赛和学术会议
- 行业协会的定期聚会和沙龙
- 政府举办的产业对接会和招商会

### 3.2 创建自己的调研活动
**小型沙龙组织**
- 主题设定：围绕你的创意相关问题
- 参与者邀请：目标用户+行业专家+同行创业者
- 活动形式：圆桌讨论+产品演示+反馈收集
- 成本控制：咖啡厅包场或共享办公空间

**用户体验工作坊**
- 原型展示：低保真/高保真原型演示
- 用户测试：现场操作和反馈收集
- 焦点小组：深度讨论和需求挖掘
- 共创环节：与用户一起优化产品

**行业专家访谈**
- 专家识别：行业KOL、资深从业者、学者
- 访谈准备：结构化问题清单、背景调研
- 深度交流：1对1深度访谈，录音记录
- 关系维护：后续保持联系，建立顾问关系

## ⏰ 模块4：90天详细执行计划

### 第1个月：技术验证 + 需求确认（Days 1-30）

**第1周（Days 1-7）：技术栈确定**
- Day 1-2：技术栈调研和选型决策
- Day 3-4：开发环境搭建和API测试
- Day 5-6：核心功能原型开发
- Day 7：第一周总结和下周规划

**第2周（Days 8-14）：需求深度挖掘**
- Day 8-9：线上渠道需求收集（社交媒体、论坛）
- Day 10-11：竞品深度分析和用户反馈收集
- Day 12-13：目标用户访谈（线上+线下）
- Day 14：需求整理和产品功能调整

**第3周（Days 15-21）：MVP开发冲刺**
- Day 15-17：基于需求调研的功能开发
- Day 18-19：用户界面设计和优化
- Day 20：MVP第一版完成和内部测试
- Day 21：第三周复盘和调整

**第4周（Days 22-30）：用户测试**
- Day 22-23：招募种子用户（朋友圈+目标用户）
- Day 24-26：用户测试执行和反馈收集
- Day 27-28：产品迭代和bug修复
- Day 29-30：第一个月总结和下月规划

### 第2个月：扩大验证 + 产品优化（Days 31-60）

**第5周（Days 31-37）：扩大用户群体**
- 目标：从20个测试用户扩展到100个
- 渠道：线下活动、社群推广、口碑传播
- 数据：建立用户行为追踪和分析

**第6周（Days 38-44）：线下调研活动**
- 参加至少1个行业活动或组织1次用户沙龙
- 实地调研目标用户聚集场所
- 收集一手的用户反馈和需求建议

**第7周（Days 45-51）：产品功能迭代**
- 基于扩大验证的结果优化产品
- 增加用户最迫切需要的功能
- 优化用户体验和使用流程

**第8周（Days 52-60）：数据分析和优化**
- 分析用户行为数据和使用模式
- 优化产品性能和用户留存
- 准备第三个月的商业化验证

### 第3个月：商业验证 + 扩展准备（Days 61-90）

**第9周（Days 61-67）：商业模式测试**
- 设计付费模式和定价策略
- 小规模付费用户验证
- 测试用户付费意愿和价格敏感度

**第10周（Days 68-74）：数据和反馈收集**
- 收集付费用户的深度反馈
- 分析付费转化率和用户生命周期价值
- 优化商业模式和定价策略

**第11周（Days 75-81）：产品商业化准备**
- 完善付费功能和用户体验
- 建立客服和售后支持体系
- 准备扩大推广的营销材料

**第12周（Days 82-90）：扩展计划制定**
- 总结90天的验证成果
- 制定下一阶段的发展规划
- 准备融资材料或自筹资金计划

## 🎯 每日执行模板

**每日必做三件事**
1. **用户接触**：每天至少与3个目标用户交流
2. **产品迭代**：每天至少完成1个小功能或优化
3. **数据记录**：记录关键指标和用户反馈

**每周复盘模板**
- 本周目标达成情况
- 用户反馈汇总和分析
- 产品迭代记录
- 下周目标设定

**每月里程碑检查**
- 用户数量和质量指标
- 产品功能完善程度
- 商业模式验证进展
- 资金使用和时间管理

请为${context.ideaTitle}提供具体、可执行的90天实战计划，确保每一天都有明确的目标和产出。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.6, maxTokens: 4000 })

    return this.parse90DayContent(response.content, context)
  }

  /**
   * 解析90天聚焦内容
   */
  private parse90DayContent(rawContent: string, context: any) {
    return {
      title: "90天聚焦实战计划",
      summary: "基于AI技术栈、需求发现和线下调研的3个月冲刺计划",
      sections: [
        {
          title: "AI技术栈推荐引擎",
          content: this.extractSection(rawContent, "AI技术栈推荐引擎"),
          actionItems: this.extractTechStackActions(rawContent),
          timeframe: "前30天完成技术选型和环境搭建"
        },
        {
          title: "需求发现渠道指南",
          content: this.extractSection(rawContent, "需求发现渠道指南"),
          actionItems: this.extractResearchChannelActions(rawContent),
          timeframe: "每周持续执行，重点在前60天"
        },
        {
          title: "线下调研活动资源",
          content: this.extractSection(rawContent, "线下调研活动资源"),
          actionItems: this.extractOfflineResearchActions(rawContent),
          timeframe: "第2个月重点执行"
        },
        {
          title: "90天详细执行计划",
          content: this.extractSection(rawContent, "90天详细执行计划"),
          actionItems: this.extractDailyExecutionActions(rawContent),
          timeframe: "每日执行，每周复盘"
        }
      ],
      keyInsights: [
        "技术栈选择决定了产品开发效率和未来扩展性",
        "需求发现的深度决定了产品市场匹配度",
        "线下调研提供最真实的用户反馈",
        "90天是验证商业可行性的关键窗口期"
      ],
      nextSteps: [
        "立即开始技术栈调研和选型",
        "制定每日用户接触计划",
        "确定第一个线下调研活动",
        "建立数据跟踪和分析机制"
      ],
      confidenceBooster: "90天的聚焦执行，让你的创意从想法变成可验证的商业模式！"
    }
  }

  /**
   * 提取技术栈行动项
   */
  private extractTechStackActions(content: string): string[] {
    return [
      "完成技术栈调研，选择最适合的AI服务商",
      "搭建开发环境，测试核心API调用",
      "开发MVP核心功能，验证技术可行性",
      "评估无代码方案作为备选"
    ]
  }

  /**
   * 提取需求发现行动项
   */
  private extractResearchChannelActions(content: string): string[] {
    return [
      "建立线上监控，追踪相关话题讨论",
      "深度分析竞品用户反馈和评价",
      "每周进行5-10个用户访谈",
      "利用数据工具分析行业趋势"
    ]
  }

  /**
   * 提取线下调研行动项
   */
  private extractOfflineResearchActions(content: string): string[] {
    return [
      "确定目标用户聚集的线下场所",
      "报名参加至少1个相关行业活动",
      "组织1次用户体验工作坊",
      "建立行业专家访谈计划"
    ]
  }

  /**
   * 提取每日执行行动项
   */
  private extractDailyExecutionActions(content: string): string[] {
    return [
      "每天与3个目标用户交流",
      "每天完成1个产品功能或优化",
      "每天记录关键数据和用户反馈",
      "每周进行目标达成情况复盘"
    ]
  }

  /**
   * 提取文本段落
   */
  private extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`## .*${sectionName}([\\s\\S]*?)(?=## |$)`, 'i')
    const match = text.match(regex)
    return match?.[1]?.trim() || `${sectionName}内容待生成`
  }

  /**
   * 获取AI提供商
   */
  private getAIProvider(provider: string): AIProvider {
    const providerMap: Record<string, AIProvider> = {
      'DEEPSEEK': AIProvider.DEEPSEEK,
      'ZHIPU': AIProvider.ZHIPU,
      'ALI': AIProvider.ALI
    }
    return providerMap[provider] || AIProvider.DEEPSEEK
  }
}

// 技术栈推荐数据库
export const AI_TECH_STACK_DATABASE = {
  // 按创意类型分类的技术栈推荐
  categoryRecommendations: {
    'AI聊天机器人': {
      beginner: {
        frameworks: ['OpenAI API', '飞书智能伙伴'],
        timeline: '30天',
        cost: '1000-3000元/月',
        skillLevel: '基础编程'
      },
      intermediate: {
        frameworks: ['LangChain', 'Rasa', '百度UNIT'],
        timeline: '60天',
        cost: '3000-8000元/月',
        skillLevel: '中级Python'
      },
      advanced: {
        frameworks: ['自训练模型', 'Transformer架构'],
        timeline: '90天+',
        cost: '10000+元/月',
        skillLevel: '深度学习专家'
      }
    },
    '图像识别': {
      beginner: {
        frameworks: ['百度EasyDL', '腾讯云AI'],
        timeline: '30天',
        cost: '500-2000元/月',
        skillLevel: '无需编程'
      },
      intermediate: {
        frameworks: ['OpenCV', 'TensorFlow.js'],
        timeline: '60天',
        cost: '2000-5000元/月',
        skillLevel: '中级Python'
      },
      advanced: {
        frameworks: ['PyTorch', 'YOLO', 'ResNet'],
        timeline: '90天+',
        cost: '5000+元/月',
        skillLevel: 'CV专家'
      }
    },
    '推荐系统': {
      beginner: {
        frameworks: ['协同过滤算法', '阿里云推荐引擎'],
        timeline: '30天',
        cost: '1000-3000元/月',
        skillLevel: '数据分析'
      },
      intermediate: {
        frameworks: ['Surprise', 'LightFM', '深度学习推荐'],
        timeline: '60天',
        cost: '3000-8000元/月',
        skillLevel: '机器学习'
      },
      advanced: {
        frameworks: ['Graph Neural Networks', '多模态推荐'],
        timeline: '90天+',
        cost: '8000+元/月',
        skillLevel: '推荐系统专家'
      }
    }
  }
}

// 需求发现渠道数据库
export const DEMAND_DISCOVERY_CHANNELS = {
  // 按行业分类的需求发现渠道
  byIndustry: {
    '教育': {
      online: ['知乎教育话题', '腾讯课堂评论', '网易云课堂', '学习强国'],
      offline: ['教育展会', '学校实地调研', '培训机构', '家长会'],
      tools: ['问卷星', '腾讯问卷', '用户访谈'],
      keywords: ['在线教育', '教学工具', '学习效率', '教育科技']
    },
    '电商': {
      online: ['淘宝评价', '京东问答', '小红书种草', '抖音带货评论'],
      offline: ['商场实地调研', '电商展会', '供应商大会'],
      tools: ['淘宝生意参谋', '京东商智', '飞瓜数据'],
      keywords: ['电商工具', '店铺运营', '选品', '客服自动化']
    },
    '金融': {
      online: ['雪球讨论', '集思录', '金融界论坛', '知乎财经'],
      offline: ['金融科技大会', '银行网点调研', '投资沙龙'],
      tools: ['Wind金融终端', '同花顺', '东方财富'],
      keywords: ['金融科技', '投资理财', '风控', '支付']
    },
    '医疗健康': {
      online: ['丁香医生', '好大夫在线', '春雨医生', '健康界'],
      offline: ['医院实地调研', '医疗器械展', '医生沙龙'],
      tools: ['医疗问卷', '患者访谈', '医生调研'],
      keywords: ['医疗AI', '健康管理', '医患沟通', '诊断辅助']
    }
  }
}

// 线下调研活动资源数据库
export const OFFLINE_RESEARCH_EVENTS = {
  // 全国性活动日历
  nationalEvents: [
    {
      name: '中国国际软件博览会',
      time: '每年6月',
      location: '北京',
      focus: ['软件技术', 'AI应用', '企业服务'],
      costRange: '500-2000元',
      networking: '高质量技术人员和决策者'
    },
    {
      name: '世界互联网大会',
      time: '每年11月',
      location: '乌镇',
      focus: ['互联网', '数字经济', '人工智能'],
      costRange: '1000-5000元',
      networking: '顶级互联网企业和投资人'
    },
    {
      name: '深圳高交会',
      time: '每年11月',
      location: '深圳',
      focus: ['高新技术', '创新创业', '科技金融'],
      costRange: '免费-1000元',
      networking: '创业者、投资人、技术专家'
    }
  ],

  // 城市创业活动
  cityEvents: {
    '北京': ['中关村创业大街活动', '清华科技园路演', '北大创业营'],
    '上海': ['张江高科技园区活动', '复旦创业园', '交大创业谷'],
    '深圳': ['南山科技园活动', '华强北创客空间', '前海创业孵化器'],
    '杭州': ['梦想小镇', '阿里巴巴创业基金活动', '网易创业营'],
    '成都': ['天府软件园', '电子科大创业园', '成都高新区活动']
  },

  // 按行业分类的专业活动
  industryEvents: {
    'AI技术': ['WAIC世界人工智能大会', 'CCAI中国人工智能大会', 'AI科技大本营'],
    '电商零售': ['电商博览会', '新零售大会', '直播电商大会'],
    '教育科技': ['GET教育科技大会', '中国教育装备展', 'EdTechHub'],
    '金融科技': ['朗迪峰会', '中国金融科技大会', 'Fintech前沿'],
    '医疗健康': ['中国数字医疗健康大会', '医疗AI大会', 'HIMSS医疗信息化大会']
  }
}

export default ThreeMonthFocusedGenerator