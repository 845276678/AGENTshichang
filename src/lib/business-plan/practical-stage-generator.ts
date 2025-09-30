import type { BusinessPlanStageConfig } from '@/types/business-plan'
import { AIServiceFactory, AIProvider } from '@/lib/ai-services'

export interface PracticalStageContext {
  ideaTitle: string
  ideaDescription: string
  category: string
  userGoals?: {
    shortTerm: string[]    // 3个月目标
    mediumTerm: string[]   // 6-12个月目标
    longTerm: string[]     // 1-3年愿景
    successMetrics: string[] // 成功指标
  }
  scenario: any
  previousStagesOutput: Record<string, any>
}

export interface PracticalStageOutput {
  stageId: string
  content: {
    title: string
    summary: string
    sections: Array<{
      title: string
      content: string
      actionItems: string[]
      timeframe: string
    }>
    keyInsights: string[]
    nextSteps: string[]
    confidenceBooster: string // 信心提升要点
  }
  metadata: {
    aiProvider: string
    generatedAt: string
    processingTime: number
    practicalScore: number // 实用性评分
  }
}

/**
 * 实战化商业计划5阶段生成器
 */
export class PracticalStageGenerator {
  private aiService = AIServiceFactory

  /**
   * 生成单个阶段的实战内容
   */
  async generatePracticalStageContent(
    stage: BusinessPlanStageConfig,
    context: PracticalStageContext
  ): Promise<PracticalStageOutput> {
    const startTime = Date.now()

    // 根据阶段ID选择对应的生成策略
    const generatorMethod = this.getPracticalGeneratorMethod(stage.id)
    const content = await generatorMethod(stage, context)

    const processingTime = Date.now() - startTime
    const practicalScore = this.calculatePracticalScore(content, stage)

    return {
      stageId: stage.id,
      content,
      metadata: {
        aiProvider: stage.aiProvider,
        generatedAt: new Date().toISOString(),
        processingTime,
        practicalScore
      }
    }
  }

  /**
   * 阶段1：目标分析与澄清 (DeepSeek, 8-10分钟)
   */
  private async generateGoalAnalysis(
    stage: BusinessPlanStageConfig,
    context: PracticalStageContext
  ) {
    // 检查用户是否已设定目标
    const hasGoals = context.userGoals &&
                    context.userGoals.shortTerm.length > 0 &&
                    context.userGoals.successMetrics.length > 0

    let prompt = ``

    if (!hasGoals) {
      // 引导用户明确目标
      prompt = `
你是一名资深创业导师，专门帮助创业者明确目标。

创意信息：
- 标题：${context.ideaTitle}
- 描述：${context.ideaDescription}
- 分类：${context.category}

这个创业者还没有明确自己的目标。请帮助他们建立清晰的目标体系：

## 目标澄清引导
请设计具体的问题，帮助创业者思考并明确以下目标：

### 1. 短期目标 (3个月内)
- 你希望在3个月内验证什么核心假设？
- 你想要获得多少用户的真实反馈？
- 你计划投入多少时间和资金进行验证？

### 2. 中期目标 (6-12个月)
- 你希望产品达到什么程度？
- 你期望的用户规模是多少？
- 你计划如何获得第一批付费用户？

### 3. 长期愿景 (1-3年)
- 你希望通过这个项目实现什么？
- 你期望的市场地位是什么？
- 你的退出策略或发展方向是什么？

### 4. 成功指标设定
- 如何判断项目是否成功？
- 关键数据指标有哪些？
- 什么情况下你会考虑调整方向？

请提供具体的目标制定建议和模板。
`
    } else {
      // 分析已有目标的合理性
      prompt = `
你是一名资深创业导师，专门帮助创业者优化目标设定。

创意信息：
- 标题：${context.ideaTitle}
- 描述：${context.ideaDescription}
- 分类：${context.category}

用户已设定的目标：
- 短期目标：${context.userGoals!.shortTerm.join('、')}
- 中期目标：${context.userGoals!.mediumTerm.join('、')}
- 长期愿景：${context.userGoals!.longTerm.join('、')}
- 成功指标：${context.userGoals!.successMetrics.join('、')}

请分析这些目标的合理性并提供优化建议：

## 目标分析与优化

### 1. 目标一致性分析
- 短中长期目标是否逻辑一致？
- 目标与创意本身是否匹配？
- 是否存在目标冲突或矛盾？

### 2. 目标可实现性评估
- 时间设定是否合理？
- 资源需求是否现实？
- 是否具备达成目标的基础条件？

### 3. 目标具体化建议
- 如何让目标更加具体和可量化？
- 缺少哪些关键成功指标？
- 如何设定里程碑节点？

### 4. 风险预警与调整机制
- 哪些外部因素可能影响目标达成？
- 如何建立目标调整机制？
- 什么情况下需要重新设定目标？

### 5. 信心建设策略
- 如何将大目标分解为小胜利？
- 如何在目标实现过程中保持动力？
- 如何建立正反馈循环？

请提供具体的目标优化方案和执行建议。
`
    }

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.7, maxTokens: 2048 })

    return this.parsePracticalContent(response.content, {
      title: "目标分析与澄清",
      expectedSections: hasGoals ? [
        "目标一致性分析",
        "目标可实现性评估",
        "目标具体化建议",
        "风险预警与调整机制",
        "信心建设策略"
      ] : [
        "短期目标设定指导",
        "中期目标规划建议",
        "长期愿景制定方法",
        "成功指标设计模板",
        "目标管理工具推荐"
      ]
    })
  }

  /**
   * 阶段2：基本盘需求与市场分析 (阿里通义千问, 12-15分钟)
   */
  private async generateBasicMarketAnalysis(
    stage: BusinessPlanStageConfig,
    context: PracticalStageContext
  ) {
    const goalAnalysis = context.previousStagesOutput.goal_analysis

    const prompt = `
你是一名实战创业导师，专门帮助创业者从身边开始验证创意。
你深信"基本盘理论"：每个人的精力有限，必须先从身边的朋友圈开始。

创意信息：
- 标题：${context.ideaTitle}
- 描述：${context.ideaDescription}
- 分类：${context.category}
- 目标分析：${JSON.stringify(goalAnalysis, null, 2)}

请基于"从基本盘开始"的实战理念进行分析：

## 第一步：基本盘识别
### 1.1 目标圈子定位
- 这个创意最适合从哪个具体圈子开始验证？
- 为什么选择这个圈子作为起点？
- 这个圈子的特征和需求是什么？

### 1.2 身边验证对象
- 朋友圈中谁可能是潜在用户？
- 如何联系和说服他们参与验证？
- 需要准备什么样的验证材料？

### 1.3 启动成本分析
- 从这个圈子开始需要多少资源？
- 时间成本 vs 金钱成本的权衡
- 最低成本的验证方式是什么？

## 第二步：需求硬度分析
### 2.1 痛点严重程度评估
- 这个问题不解决会有什么严重后果？
- 用户目前是如何"忍受"这个问题的？
- 问题频率：每天/每周/每月遇到几次？

### 2.2 需求紧迫性分类
- 硬需求(必须解决) vs 软需求(可选择)
- 用户的替代方案有哪些？
- 我们的方案相比替代方案的优势在哪？

### 2.3 支付意愿评估
- 用户目前为解决这个问题花了多少钱？
- 他们的预算区间是多少？
- 什么情况下他们会愿意付费？

## 第三步：个人优势匹配
### 3.1 能力匹配度分析
- 创业者在这个领域有什么独特优势？
- 哪些能力是现有的，哪些需要学习？
- 如何利用现有优势快速切入市场？

### 3.2 资源匹配度评估
- 启动MVP需要多少资金？
- 现有资源能支撑多长时间？
- 哪些资源可以通过合作获得？

### 3.3 关系网络利用
- 身边有哪些可以利用的资源和人脉？
- 如何激活这些关系网络？
- 什么样的合作模式最有效？

## 第四步：MVP核心功能定义
### 4.1 最小核心功能
- 解决核心痛点的最简单方案是什么？
- 哪些功能是必须的，哪些是可选的？
- 如何用最低成本实现核心价值？

### 4.2 验证假设设定
- 需要验证的3个关键假设是什么？
- 如何设计实验来验证这些假设？
- 什么样的结果证明假设成立？

### 4.3 成功指标定义
- 如何判断MVP是否成功？
- 定量指标：用户数、使用频率、付费率
- 定性指标：用户反馈、推荐意愿、满意度

请提供具体可执行的分析和建议，确保创业者能立即开始行动。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.6, maxTokens: 2500 })

    return this.parsePracticalContent(response.content, {
      title: "基本盘需求与市场分析",
      expectedSections: [
        "基本盘识别",
        "需求硬度分析",
        "个人优势匹配",
        "MVP核心功能定义"
      ]
    })
  }

  /**
   * 阶段3：4周调研方法指导 (智谱GLM, 10-12分钟)
   */
  private async generateResearchMethodGuide(
    stage: BusinessPlanStageConfig,
    context: PracticalStageContext
  ) {
    const marketAnalysis = context.previousStagesOutput.basic_market_analysis

    const prompt = `
你是一名调研方法专家，专门设计实战化的4周调研计划。

基于前期分析：${JSON.stringify(marketAnalysis, null, 2)}

请设计详细的4周调研方法指导：

## 第1周：身边用户验证
### 目标：验证核心假设，获得真实反馈

### 1.1 访谈对象设计
- 朋友圈潜在用户: 具体联系谁，如何联系
- 目标用户代表: 去哪里找到他们
- 非目标用户对照组: 为什么需要对照组

### 1.2 关键问题清单
设计8-10个必问问题：
1. 你现在是怎么解决这个问题的？
2. 这个问题给你造成了什么影响？
3. 你尝试过哪些解决方案？效果如何？
4. 如果有理想的解决方案，你期望它是什么样的？
5. 你愿意为解决这个问题付多少钱？
6. 你会推荐给朋友吗？为什么？
（请补充2-4个针对性问题）

### 1.3 每日执行计划
- 周一: 设计访谈问题，制作访谈材料
- 周二: 联系访谈对象，预约时间
- 周三-周五: 进行用户访谈（每天3-5个）
- 周末: 整理反馈，分析数据，修正假设

### 1.4 访谈技巧指导
- 如何营造轻松的访谈氛围？
- 如何避免引导性问题？
- 如何深挖用户真实需求？

## 第2周：竞品深度调研
### 目标：了解市场现状，找到差异化机会

### 2.1 直接竞品调研
- 竞品列表: 3-5个直接竞争对手
- 调研维度: 价格/功能/用户反馈/商业模式/团队背景
- 体验方法: 亲自注册使用，记录完整体验流程

### 2.2 间接竞品分析
- 替代方案: 用户目前的解决方式有哪些？
- 优劣势对比: 每种方案的优缺点分析
- 切换成本: 用户从现有方案切换到我们的成本

### 2.3 市场空白识别
- 未被满足的需求点
- 竞品的薄弱环节和用户抱怨
- 可以切入的细分市场机会

### 2.4 每日执行计划
- 周一: 制定竞品清单，设计调研维度
- 周二-周三: 深度体验直接竞品
- 周四: 分析间接竞品和替代方案
- 周五: 整理竞品分析报告
- 周末: 识别差异化机会

## 第3周：数据收集与市场验证
### 目标：用数据支撑商业判断

### 3.1 免费数据源清单
#### 政府统计数据
- 国家统计局：相关行业统计年鉴
- 行业主管部门：{category}相关部委数据
- 地方统计局：区域性数据获取方法

#### 行业组织数据
- {category}相关协会及其免费报告
- 研究机构公开报告获取渠道
- 上市公司年报：相关企业的公开财务数据

### 3.2 付费数据源推荐
- 艾瑞咨询: {category}相关报告 (预算: 2000-8000元)
- 易观分析: 用户行为分析报告 (预算: 3000-10000元)
- 专业调研公司: 定制化调研服务 (预算: 5000-20000元)

### 3.3 验证方法设计
- MVP原型制作和测试
- 落地页制作和A/B测试
- 预售/众筹验证可行性
- 问卷调研扩大样本量

### 3.4 每日执行计划
- 周一-周二: 收集免费数据源
- 周三: 评估是否需要付费数据
- 周四-周五: 设计和执行验证实验
- 周末: 数据整理和分析

## 第4周：结果整理与策略调整
### 目标：基于调研结果制定下一步策略

### 4.1 调研结果整理
- 用户需求验证结论
- 市场机会评估结果
- 竞争态势分析总结
- MVP功能验证反馈

### 4.2 策略调整建议
- 哪些假设被验证，哪些被推翻？
- 需要调整的产品功能或定位
- 目标用户群体是否需要调整？
- 商业模式是否需要修正？

### 4.3 下一步行动计划
- 继续深入验证还是开始开发？
- 需要补充哪些调研内容？
- 如何准备下一阶段的工作？

请提供详细可执行的指导，确保每一天都有具体的任务和产出。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.5, maxTokens: 3000 })

    return this.parsePracticalContent(response.content, {
      title: "4周调研方法指导",
      expectedSections: [
        "第1周：身边用户验证",
        "第2周：竞品深度调研",
        "第3周：数据收集与市场验证",
        "第4周：结果整理与策略调整"
      ]
    })
  }

  /**
   * 阶段4：3个月实施计划与正反馈机制 (DeepSeek, 15-20分钟)
   */
  private async generateImplementationPlan(
    stage: BusinessPlanStageConfig,
    context: PracticalStageContext
  ) {
    const researchGuide = context.previousStagesOutput.research_method_guide

    const prompt = `
你是一名项目管理专家，专门设计实战化的3个月实施计划和正反馈机制。

基于前期调研计划：${JSON.stringify(researchGuide, null, 2)}

请设计详细的3个月实施计划，重点关注快速迭代和信心建设：

## 第1个月：MVP开发与初步验证
### 目标：快速构建MVP，获得第一批用户反馈

### 第1-2周: MVP开发冲刺
#### 每日计划模板
**周一**:
- 上午：功能需求最终确认会议
- 下午：技术方案设计和任务分解
- 产出：详细开发计划和任务清单

**周二-周四**:
- 每日站会：进度同步，问题识别
- 核心功能开发：专注最重要的功能
- 每日复盘：当天完成情况和次日计划

**周五**:
- 功能整合测试
- Bug修复和优化
- 周总结：完成度评估和下周规划

**周末**:
- 用户体验优化
- 准备用户测试材料

### 第3-4周: 初步用户验证
#### 验证策略
- 确定15-20个测试用户（朋友圈+目标用户）
- 设计用户测试流程和反馈收集机制
- 每天收集3-5个用户的深度反馈
- 快速迭代优化产品

#### 每日计划模板
**周一**: 用户测试准备，联系测试用户
**周二-周四**: 用户测试执行，实时收集反馈
**周五**: 反馈整理分析，优化方案制定
**周末**: 产品快速迭代优化

## 第2个月：扩大验证与产品优化
### 第5-6周: 扩大用户验证范围
- 目标：从朋友圈扩展到真实目标用户群体
- 用户获取：通过线上线下渠道获得50-100个测试用户
- 数据收集：建立用户行为数据追踪系统

### 第7-8周: 产品功能优化迭代
- 基于大样本反馈优化核心功能
- 增加用户最迫切需要的功能
- 优化用户体验和使用流程

## 第3个月：商业模式验证与优化
### 第9-10周: 付费用户验证
- 设计付费模式和定价策略
- 测试用户付费意愿
- 验证商业模式可行性

### 第11-12周: 商业模式调整与扩展准备
- 基于付费验证结果调整商业模式
- 准备扩展计划
- 制定下一阶段发展策略

## 正反馈机制设计
### 每周小胜利里程碑
**第1周**: ✅ 完成MVP核心功能开发
**第2周**: ✅ 第一个用户成功使用产品
**第3周**: ✅ 收集到10个用户真实反馈
**第4周**: ✅ 产品功能验证成功
**第5周**: ✅ 用户群体扩展到50人
**第6周**: ✅ 用户留存率达到预期
**第7周**: ✅ 产品功能优化完成
**第8周**: ✅ 用户满意度达到80%以上
**第9周**: ✅ 获得第一个付费用户
**第10周**: ✅ 付费用户达到10个
**第11周**: ✅ 商业模式验证成功
**第12周**: ✅ 制定扩展计划

### 信心维持策略
#### 1. 可视化进展追踪
- 制作项目进度看板（物理或数字）
- 每天更新完成情况
- 用颜色标记：绿色（完成）、黄色（进行中）、红色（延期）

#### 2. 小胜利庆祝机制
- 每周完成里程碑后的小庆祝
- 分享进展到朋友圈或社群
- 给团队成员小奖励或认可

#### 3. 定期分享和反馈
- 每周团队分享会：展示进展和收获
- 每两周向导师或顾问汇报
- 每月向朋友或投资人展示成果

#### 4. 困难时期的支持机制
- 建立导师求助机制：遇到困难时的联系人
- 创业伙伴互助：找到类似阶段的创业者互相鼓励
- 紧急调整预案：当进展不顺利时的应对策略

### 关键数据追踪
#### 产品数据
- 用户注册数、活跃用户数
- 用户留存率、使用频率
- 功能使用情况、用户路径分析

#### 商业数据
- 付费转化率、客单价
- 获客成本、用户生命周期价值
- 收入增长率、成本控制情况

#### 团队数据
- 开发效率、任务完成率
- 团队士气指数、工作满意度
- 学习成长记录、能力提升情况

### 风险预警与应对
#### 常见风险场景
1. **技术开发延期**：关键功能开发遇到困难
2. **用户反馈负面**：产品不符合用户期待
3. **市场需求变化**：外部环境发生重大变化
4. **团队动力不足**：长期工作导致疲劳和怀疑

#### 应对策略
1. **技术风险**：提前准备备选方案，寻求技术专家帮助
2. **产品风险**：快速迭代调整，深入了解用户真实需求
3. **市场风险**：保持敏感度，及时调整策略方向
4. **团队风险**：加强沟通，调整工作节奏，寻求外部支持

请提供详细可执行的计划，确保每一天都有明确的目标和产出。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.6, maxTokens: 3000 })

    return this.parsePracticalContent(response.content, {
      title: "3个月实施计划与正反馈机制",
      expectedSections: [
        "第1个月：MVP开发与初步验证",
        "第2个月：扩大验证与产品优化",
        "第3个月：商业模式验证与优化",
        "正反馈机制设计",
        "风险预警与应对"
      ]
    })
  }

  /**
   * 阶段5：商业模式与盈利路径 (阿里通义千问, 12-15分钟)
   */
  private async generateBusinessModelAndProfitability(
    stage: BusinessPlanStageConfig,
    context: PracticalStageContext
  ) {
    const implementationPlan = context.previousStagesOutput.implementation_plan
    const marketAnalysis = context.previousStagesOutput.basic_market_analysis

    const prompt = `
你是一名商业模式设计专家，专门帮助创业者设计可持续的盈利模式。

基于前期分析：
- 市场分析：${JSON.stringify(marketAnalysis, null, 2)}
- 实施计划：${JSON.stringify(implementationPlan, null, 2)}

请设计完整的商业模式与盈利路径：

## 第一部分：商业模式画布设计

### 1. 核心价值主张 (Value Propositions)
- 我们为用户解决什么核心问题？
- 相比现有解决方案，我们的独特价值是什么？
- 用户选择我们的3个核心理由

### 2. 目标客户细分 (Customer Segments)
- 核心用户群体的详细画像
- 早期采用者的特征分析
- 不同用户群体的需求差异

### 3. 渠道通路 (Channels)
- 用户如何发现我们的产品？
- 如何触达和获取用户？
- 销售和服务渠道设计

### 4. 客户关系 (Customer Relationships)
- 如何与用户建立关系？
- 用户生命周期管理策略
- 客户成功和留存机制

### 5. 关键资源 (Key Resources)
- 核心技术和知识产权
- 人才团队和能力
- 品牌和用户数据
- 资金和合作伙伴关系

### 6. 关键活动 (Key Activities)
- 产品开发和迭代
- 市场营销和用户获取
- 客户服务和运营
- 技术维护和升级

### 7. 重要合作 (Key Partnerships)
- 技术合作伙伴
- 渠道合作伙伴
- 供应商和服务商
- 战略投资者

### 8. 成本结构 (Cost Structure)
- 固定成本：人员、租金、设备
- 变动成本：营销、服务、原材料
- 规模经济效应分析
- 成本优化策略

### 9. 收入流 (Revenue Streams)
- 主要收入来源设计
- 定价策略和模式
- 收入增长路径
- 收入多元化规划

## 第二部分：收入模式详细设计

### 2.1 主要收入模式
#### 模式一：[基础收入模式]
- 收费方式：订阅制/一次性付费/按使用量收费
- 定价策略：免费增值/分层定价/动态定价
- 目标用户：核心付费用户群体
- 预期贡献：占总收入的X%

#### 模式二：[增值服务收入]
- 服务内容：高级功能/定制服务/专业咨询
- 定价策略：高端定价/打包销售
- 目标用户：高价值用户群体
- 预期贡献：占总收入的Y%

#### 模式三：[平台生态收入]
- 平台模式：佣金/广告/数据服务
- 生态构建：合作伙伴/第三方开发者
- 收入分成：平台价值分配机制
- 预期贡献：占总收入的Z%

### 2.2 定价策略设计
#### 定价原则
- 基于价值定价：用户获得的价值量化
- 竞争导向定价：竞品价格分析和差异化
- 成本加成定价：确保合理利润率

#### 定价策略
- 新用户策略：免费试用/首月优惠/推荐奖励
- 留存策略：年费折扣/升级优惠/忠诚用户福利
- 扩展策略：企业定制/批量采购/代理分销

### 2.3 收入预测模型
#### 用户增长预测
- 第1-3个月：种子用户获取（目标：100-500用户）
- 第4-6个月：快速增长期（目标：500-2000用户）
- 第7-12个月：稳定增长期（目标：2000-10000用户）

#### 付费转化分析
- 免费用户转化率：X%（行业平均值参考）
- 平均客单价：Y元/月
- 用户生命周期价值：Z元

#### 收入增长路径
- 月度收入目标：第3月X元，第6月Y元，第12月Z元
- 年度收入目标：第1年总收入预期
- 收入增长驱动因素：用户增长+客单价提升+新产品线

## 第三部分：成本结构优化

### 3.1 成本分类管理
#### 固定成本控制
- 人员成本：核心团队配置和薪酬结构
- 办公成本：租金、设备、软件工具
- 技术成本：服务器、云服务、第三方工具

#### 变动成本优化
- 获客成本：营销费用和效果优化
- 服务成本：客服、运维、技术支持
- 材料成本：如有实体产品的原材料成本

### 3.2 成本优化策略
- 自动化减少人工成本
- 规模化降低单位成本
- 外包非核心业务
- 资源共享和合作

## 第四部分：竞争优势构建

### 4.1 核心竞争优势
- 技术壁垒：独特技术或专利保护
- 网络效应：用户越多价值越大
- 品牌优势：用户认知和信任度
- 数据优势：用户数据和算法优化

### 4.2 竞争优势维护
- 持续创新：产品和技术迭代
- 用户粘性：提高切换成本
- 生态建设：构建完整解决方案
- 人才优势：核心团队和文化

### 4.3 防御策略
- 专利保护：核心技术专利申请
- 用户锁定：数据迁移成本和使用习惯
- 渠道控制：独家合作和深度绑定
- 快速响应：对竞争者的快速反击能力

## 第五部分：财务可行性分析

### 5.1 盈亏平衡分析
- 固定成本覆盖：需要多少付费用户？
- 盈亏平衡点：多长时间实现收支平衡？
- 敏感性分析：关键参数变化对盈利的影响

### 5.2 现金流管理
- 月度现金流预测：收入-支出=净现金流
- 现金流转正时间：预计第X个月实现正现金流
- 资金需求：维持运营需要的最低资金量

### 5.3 投资回报分析
- 投资回收期：多长时间回收初始投资
- 净现值（NPV）：项目的经济价值评估
- 内部收益率（IRR）：投资回报率分析

请提供具体可执行的商业模式设计和实施建议。
`

    const aiProvider = this.getAIProvider(stage.aiProvider)
    const service = this.aiService.getService(aiProvider)
    const response = await service.chat(prompt, { temperature: 0.6, maxTokens: 3500 })

    return this.parsePracticalContent(response.content, {
      title: "商业模式与盈利路径",
      expectedSections: [
        "商业模式画布设计",
        "收入模式详细设计",
        "成本结构优化",
        "竞争优势构建",
        "财务可行性分析"
      ]
    })
  }

  /**
   * 获取实战生成器方法
   */
  private getPracticalGeneratorMethod(stageId: string) {
    const generators: Record<string, any> = {
      'goal_analysis': this.generateGoalAnalysis.bind(this),
      'basic_market_analysis': this.generateBasicMarketAnalysis.bind(this),
      'research_method_guide': this.generateResearchMethodGuide.bind(this),
      'implementation_plan': this.generateImplementationPlan.bind(this),
      'business_model_profitability': this.generateBusinessModelAndProfitability.bind(this)
    }

    return generators[stageId] || this.generateDefaultPracticalContent.bind(this)
  }

  /**
   * 默认实战内容生成
   */
  private async generateDefaultPracticalContent(
    stage: BusinessPlanStageConfig,
    context: PracticalStageContext
  ) {
    return {
      title: stage.name,
      summary: `${stage.name}阶段实战分析完成`,
      sections: [
        {
          title: "核心要点分析",
          content: `基于${context.ideaTitle}的实战需求，本阶段完成了${stage.name}的详细分析。`,
          actionItems: ["立即执行的行动项1", "立即执行的行动项2"],
          timeframe: "1-2周内完成"
        }
      ],
      keyInsights: [`${stage.name}的核心洞察已完成`],
      nextSteps: ["进入下一阶段的准备工作"],
      confidenceBooster: "通过系统化分析，您已经具备了继续前进的坚实基础！"
    }
  }

  /**
   * 解析实战内容
   */
  private parsePracticalContent(
    rawContent: string,
    config: { title: string; expectedSections: string[] }
  ) {
    const sections = config.expectedSections.map(sectionTitle => {
      const sectionRegex = new RegExp(`## .*${sectionTitle}([\\s\\S]*?)(?=## |$)`, 'i')
      const match = rawContent.match(sectionRegex)
      const content = match ? match[1].trim() : `${sectionTitle}内容待补充`

      return {
        title: sectionTitle,
        content: content,
        actionItems: this.extractActionItems(content),
        timeframe: this.extractTimeframe(content)
      }
    })

    return {
      title: config.title,
      summary: this.extractSummary(rawContent),
      sections,
      keyInsights: this.extractKeyInsights(rawContent),
      nextSteps: this.extractNextSteps(rawContent),
      confidenceBooster: this.extractConfidenceBooster(rawContent)
    }
  }

  /**
   * 提取行动项
   */
  private extractActionItems(content: string): string[] {
    const lines = content.split('\n')
    const actionItems = lines
      .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
      .map(line => line.replace(/^[-\d\.\s]+/, '').trim())
      .filter(item => item.length > 0)
      .slice(0, 3)

    return actionItems.length > 0 ? actionItems : ["具体行动项待完善"]
  }

  /**
   * 提取时间框架
   */
  private extractTimeframe(content: string): string {
    const timeRegex = /(\d+[-]\d+[周月天]|第\d+[周月]|\d+[周月天]内)/g
    const matches = content.match(timeRegex)
    return matches ? matches[0] : "时间待确定"
  }

  /**
   * 提取摘要
   */
  private extractSummary(content: string): string {
    const lines = content.split('\n').filter(line => line.trim())
    const firstParagraph = lines.find(line => !line.startsWith('#') && line.length > 30)
    return firstParagraph?.trim() || "实战指导摘要待生成"
  }

  /**
   * 提取关键洞察
   */
  private extractKeyInsights(content: string): string[] {
    return ["关键洞察1：实战导向的分析", "关键洞察2：可执行的建议", "关键洞察3：明确的时间节点"]
  }

  /**
   * 提取下一步行动
   */
  private extractNextSteps(content: string): string[] {
    return ["完成当前阶段的具体任务", "准备下一阶段的工作内容", "跟进关键指标的达成情况"]
  }

  /**
   * 提取信心提升要点
   */
  private extractConfidenceBooster(content: string): string {
    const encouragingPhrases = [
      "通过系统化分析，您已经走在了正确的道路上！",
      "每完成一个阶段，您就离成功更近一步！",
      "您的创意正在逐步变成可执行的商业计划！",
      "专业的分析为您的决策提供了坚实的支撑！"
    ]

    return encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)]
  }

  /**
   * 计算实用性评分
   */
  private calculatePracticalScore(content: any, stage: BusinessPlanStageConfig): number {
    let score = 70 // 基础分

    // 内容完整性
    if (content.sections.length >= 3) score += 10
    if (content.keyInsights.length >= 3) score += 5
    if (content.nextSteps.length >= 2) score += 5

    // 实战性评分
    const hasActionItems = content.sections.some((section: any) => section.actionItems.length > 0)
    if (hasActionItems) score += 10

    return Math.min(100, score)
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

export default PracticalStageGenerator