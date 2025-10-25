/**
 * 创意完善工作坊 - 维度配置和Prompt模板
 *
 * 用途：定义6个维度的对话轮次、问题模板和AI引导策略
 * 关联文档：docs/创意完善工作坊-frontendDesign维度补充.md
 */

import type { FrontendDesign, ProductDetails } from '@/types/idea-refinement'

// ============================================
// 维度配置
// ============================================

export interface DimensionConfig {
  id: string
  name: string
  icon: string
  description: string
  rounds: number
  fields: string[]
}

/**
 * 6个维度的完整配置
 */
export const REFINEMENT_DIMENSIONS: DimensionConfig[] = [
  {
    id: 'targetUser',
    name: '目标用户画像',
    icon: '👥',
    description: '明确产品的目标用户群体、典型画像、核心痛点和使用场景',
    rounds: 5,
    fields: ['userGroup', 'typicalPersona', 'corePainPoints', 'usageScenarios']
  },
  {
    id: 'businessModel',
    name: '商业模式',
    icon: '💰',
    description: '设计可持续的盈利模式、定价策略和成本结构',
    rounds: 5,
    fields: ['revenueModel', 'pricingStrategy', 'costStructure', 'profitProjection']
  },
  {
    id: 'marketAnalysis',
    name: '市场分析',
    icon: '📊',
    description: '分析市场规模、目标市场、竞争态势和市场机会',
    rounds: 5,
    fields: ['marketSize', 'targetMarket', 'marketTrends', 'opportunities']
  },
  {
    id: 'competitiveAdvantage',
    name: '竞争优势',
    icon: '🏆',
    description: '识别核心竞争力、差异化优势和进入壁垒',
    rounds: 5,
    fields: ['competitors', 'coreCompetencies', 'differentiation', 'entryBarriers']
  },
  {
    id: 'productDetails',
    name: '产品/服务详情',
    icon: '📦',
    description: '详细描述产品功能、技术路线、开发计划和前端UI设计',
    rounds: 6, // 🆕 从5轮扩展到6轮
    fields: ['summary', 'coreFeatures', 'technicalApproach', 'timeline', 'resources', 'frontendDesign']
  },
  {
    id: 'implementation',
    name: '实施路径',
    icon: '🚀',
    description: '制定实施计划、里程碑、风险评估和资源需求',
    rounds: 5,
    fields: ['milestones', 'risks', 'resources']
  }
]

// ============================================
// AI Prompt模板 - 维度1：目标用户画像
// ============================================

export const TARGET_USER_PROMPTS = {
  systemPrompt: `你是创意完善工作坊的AI教练，专门帮助创业者明确产品的目标用户。

你的引导原则：
1. 基于The Mom Test方法，避免引导性问题
2. 深入挖掘真实用户痛点，而非假设性需求
3. 帮助创业者描绘具体的用户画像，而非宽泛的人群
4. 引导思考真实的使用场景，而非理想化场景

对话策略：
- 多用开放式问题："能具体描述一下...吗？"
- 追问细节："您提到的XX问题，用户目前是如何解决的？"
- 挑战假设："为什么您认为这类用户会有这个需求？"
- 总结确认："我理解的用户画像是...，对吗？"`,

  round1: `现在开始【目标用户画像】维度的第1轮对话。

请用简单的语言描述：
1. 您的产品主要服务于哪类人群？（年龄、职业、收入水平等）
2. 他们有什么共同特征？

示例回答：
"主要面向25-40岁的一线城市职场白领，月收入8k-20k，工作压力大但注重生活品质"`,

  round2: `第2轮对话：深入了解典型用户。

请描述一个最典型的用户案例：
1. 他/她的日常生活是什么样的？
2. 工作内容、家庭状况、兴趣爱好等
3. 这个人为什么会需要您的产品？

尽量描述一个真实存在的人（可以匿名），而不是想象中的"理想用户"。`,

  round3: `第3轮对话：挖掘核心痛点。

请列举3-5个目标用户当前遇到的真实痛点：
1. 他们在什么场景下会遇到这些问题？
2. 这些问题给他们带来了什么困扰？
3. 他们目前是如何解决的？效果如何？

注意：痛点必须是真实存在的，不是您假设的。`,

  round4: `第4轮对话：具体使用场景。

请描述2-3个用户使用您产品的典型场景：
1. 用户在什么时间、地点使用？
2. 使用的触发原因是什么？
3. 使用后能解决什么问题？
4. 频率如何？（每天、每周、偶尔？）`,

  round5: `第5轮对话：总结确认。

我将根据您的回答生成一份【目标用户画像】总结，请确认是否准确：

**用户群体**：{从round1提取}
**典型画像**：{从round2提取}
**核心痛点**：{从round3提取}
**使用场景**：{从round4提取}

如果有需要补充或修改的地方，请告诉我。`
}

// ============================================
// AI Prompt模板 - 维度5：产品/服务详情
// ============================================

export const PRODUCT_DETAILS_PROMPTS = {
  systemPrompt: `你是创意完善工作坊的AI教练，专门帮助创业者细化产品功能和技术实现方案。

你的引导原则：
1. 帮助创业者聚焦MVP（最小可行产品），避免功能过度设计
2. 引导思考技术实现的可行性和成本
3. 确保技术选型与团队能力匹配
4. 收集前端UI设计需求，为MVP可视化工作坊做准备

对话策略：
- 鼓励优先级排序："哪些功能是必须的？哪些可以后期添加？"
- 挑战复杂度："这个功能是否可以简化实现？"
- 关注可行性："您或您的团队有相关技术背景吗？"`,

  round1: `现在开始【产品/服务详情】维度的第1轮对话。

请用一段话总体描述您的产品：
1. 产品是什么？（网站、App、SaaS平台等）
2. 核心价值是什么？（用一句话说明"帮用户做什么"）
3. 与现有同类产品的主要区别？`,

  round2: `第2轮对话：列举核心功能。

请列出3-5个产品的核心功能（MVP阶段必须实现的）：
1. 功能1：{名称} - {具体做什么}
2. 功能2：...
3. 功能3：...

对每个功能，简要说明：
- 用户如何使用这个功能？
- 这个功能解决什么问题？`,

  round3: `第3轮对话：技术路线选择。

请说明您的技术路线计划：

**前端技术**：
- 框架：React / Vue / Next.js / 其他？
- 为什么选择这个框架？

**后端技术**：
- 语言：Node.js / Python / Java / 其他？
- 数据库：PostgreSQL / MySQL / MongoDB / 其他？

**部署方式**：
- Vercel / AWS / 阿里云 / 自建服务器？

如果您还不确定，可以说明您的技术背景，我会给出建议。`,

  round4: `第4轮对话：开发时间表。

请规划您的开发里程碑：

**MVP开发阶段**（多久完成？）
- 前端开发：X周
- 后端开发：X周
- 测试和优化：X周

**预计上线时间**：X月X日
**初期用户目标**：多少用户？

如果是兼职开发，请说明每周能投入多少时间。`,

  round5: `第5轮对话：所需资源。

请说明开发所需的资源：

**人力资源**：
- 您自己负责什么？（产品、开发、运营？）
- 是否需要招募团队成员？需要什么技能？

**资金需求**：
- 初期预算大概多少？
- 主要花费在哪些方面？（服务器、开发工具、营销？）

**合作伙伴**：
- 是否需要寻找合作伙伴？（技术、市场、资金？）`,

  // 🆕 新增第6轮：收集前端UI设计需求
  round6: `第6轮对话：前端UI设计需求（🆕 为MVP可视化工作坊准备）

现在我们来明确产品的前端界面设计需求，这将帮助后续的MVP可视化工作坊快速生成原型。

请回答以下问题：

**1. 页面结构**
- 您的产品主要有哪些页面？（首页、列表页、详情页、用户中心等）
- 每个页面的基本布局是什么？（顶部导航栏、侧边栏、主内容区、底部信息等）

**2. 核心交互**
- 用户在界面上需要完成哪些关键操作？
  - 登录/注册？
  - 搜索/筛选？
  - 创建/编辑内容？
  - 支付/下单？
  - 其他？

**3. 视觉风格**
- 配色偏好：科技蓝、商务灰、活力橙、清新绿、其他？
- 字体风格：现代简约、传统正式、创意个性、其他？
- 布局方式：单栏、双栏、卡片式、网格式、其他？

**4. 目标设备**
- 主要在什么设备使用？桌面端、平板、手机？
- 是否需要响应式设计（自适应不同屏幕）？

**5. 参考案例**
- 有没有特别喜欢的网站或应用设计？（如：淘宝首页、Notion界面、飞书工作台等）
- 哪些设计元素您想要参考？

示例回答：
"主要是桌面端使用的SaaS平台，界面风格参考Notion的简洁设计。首页包含顶部导航栏、左侧项目列表、中间工作区、右侧属性面板。配色使用科技蓝+白色，现代简约风格。核心交互包括登录、创建项目、拖拽排序、实时协作等。"`,

  summary: `感谢您完成【产品/服务详情】维度的全部6轮对话！

我已经收集了：
✅ 产品总体描述
✅ 核心功能列表
✅ 技术路线选择
✅ 开发时间表
✅ 资源需求
✅ 前端UI设计需求 🆕

这些信息将用于：
1. 生成详细的产品规划文档
2. 为MVP可视化工作坊提供前端设计输入
3. 帮助您更清晰地向团队或投资人展示产品

接下来，我们将进入第6个维度：【实施路径】。`
}

// ============================================
// frontendDesign数据提取逻辑
// ============================================

/**
 * 从第6轮对话中提取frontendDesign数据
 * 使用AI进行结构化提取
 */
export const extractFrontendDesignPrompt = (userResponse: string) => `
你是数据提取专家，负责从用户的回答中提取结构化的前端设计需求。

用户的原始回答：
"""
${userResponse}
"""

请提取以下信息，以JSON格式返回：

{
  "pageStructure": "页面结构描述",
  "coreInteractions": ["交互1", "交互2", "交互3"],
  "visualStyle": {
    "colorScheme": "配色方案",
    "typography": "字体风格",
    "layout": "布局方式"
  },
  "targetDevices": ["设备1", "设备2"],
  "referenceExamples": "参考案例描述"
}

提取规则：
1. pageStructure：总结主要页面和布局结构，用简洁的语言描述
2. coreInteractions：列出用户提到的所有交互操作，每项用简短的词汇表示
3. visualStyle：提取配色、字体、布局的具体描述
4. targetDevices：从用户回答中识别目标设备（桌面端、平板、移动端）
5. referenceExamples：总结用户提到的参考案例或设计风格

如果用户没有明确提到某项，使用合理的推断填充，并标注"（推断）"。

只返回JSON，不要其他解释。
`

/**
 * 推断frontendDesign数据（向后兼容旧数据）
 * 用于没有第6轮对话的旧版文档
 */
export function inferFrontendDesignFromProductDetails(
  productDetails: Partial<ProductDetails>
): FrontendDesign {
  // 基于产品总体描述和核心功能推断基本的前端需求
  const summary = productDetails.summary || ''
  const features = productDetails.coreFeatures || []

  return {
    pageStructure: summary.includes('平台') || summary.includes('SaaS')
      ? '顶部导航栏 + 侧边栏 + 主内容区 + 底部信息'
      : '顶部导航栏 + 主内容区 + 底部信息',

    coreInteractions: features.map(f =>
      f.includes('登录') ? '用户登录注册' :
      f.includes('搜索') ? '搜索筛选功能' :
      f.includes('创建') ? '创建内容表单' :
      f.includes('支付') ? '支付下单流程' :
      `${f}功能`
    ),

    visualStyle: {
      colorScheme: summary.includes('科技') ? '蓝色科技风' :
                   summary.includes('教育') ? '绿色清新风' :
                   summary.includes('电商') ? '橙色活力风' :
                   '现代简约风',
      typography: '现代简约',
      layout: '单栏布局'
    },

    targetDevices: ['桌面端'],

    referenceExamples: '（待补充）基于产品类型推断'
  }
}

// ============================================
// 其他维度的Prompt（简化版，完整实现时补充）
// ============================================

export const BUSINESS_MODEL_PROMPTS = {
  systemPrompt: `你是创意完善工作坊的AI教练，专门帮助创业者设计可持续的商业模式...`,
  round1: `开始【商业模式】维度的第1轮对话...`,
  round2: `...`,
  round3: `...`,
  round4: `...`,
  round5: `...`
}

export const MARKET_ANALYSIS_PROMPTS = {
  systemPrompt: `...`,
  round1: `...`,
  round2: `...`,
  round3: `...`,
  round4: `...`,
  round5: `...`
}

export const COMPETITIVE_ADVANTAGE_PROMPTS = {
  systemPrompt: `...`,
  round1: `...`,
  round2: `...`,
  round3: `...`,
  round4: `...`,
  round5: `...`
}

export const IMPLEMENTATION_PROMPTS = {
  systemPrompt: `...`,
  round1: `...`,
  round2: `...`,
  round3: `...`,
  round4: `...`,
  round5: `...`
}

// ============================================
// Prompt获取工具函数
// ============================================

/**
 * 根据维度ID和轮次获取对应的Prompt
 */
export function getPromptForDimensionRound(
  dimensionId: string,
  round: number
): string {
  const promptMap: Record<string, Record<number, string>> = {
    targetUser: {
      0: TARGET_USER_PROMPTS.systemPrompt,
      1: TARGET_USER_PROMPTS.round1,
      2: TARGET_USER_PROMPTS.round2,
      3: TARGET_USER_PROMPTS.round3,
      4: TARGET_USER_PROMPTS.round4,
      5: TARGET_USER_PROMPTS.round5
    },
    businessModel: {
      0: BUSINESS_MODEL_PROMPTS.systemPrompt,
      1: BUSINESS_MODEL_PROMPTS.round1,
      2: BUSINESS_MODEL_PROMPTS.round2,
      3: BUSINESS_MODEL_PROMPTS.round3,
      4: BUSINESS_MODEL_PROMPTS.round4,
      5: BUSINESS_MODEL_PROMPTS.round5
    },
    marketAnalysis: {
      0: MARKET_ANALYSIS_PROMPTS.systemPrompt,
      1: MARKET_ANALYSIS_PROMPTS.round1,
      2: MARKET_ANALYSIS_PROMPTS.round2,
      3: MARKET_ANALYSIS_PROMPTS.round3,
      4: MARKET_ANALYSIS_PROMPTS.round4,
      5: MARKET_ANALYSIS_PROMPTS.round5
    },
    competitiveAdvantage: {
      0: COMPETITIVE_ADVANTAGE_PROMPTS.systemPrompt,
      1: COMPETITIVE_ADVANTAGE_PROMPTS.round1,
      2: COMPETITIVE_ADVANTAGE_PROMPTS.round2,
      3: COMPETITIVE_ADVANTAGE_PROMPTS.round3,
      4: COMPETITIVE_ADVANTAGE_PROMPTS.round4,
      5: COMPETITIVE_ADVANTAGE_PROMPTS.round5
    },
    productDetails: {
      0: PRODUCT_DETAILS_PROMPTS.systemPrompt,
      1: PRODUCT_DETAILS_PROMPTS.round1,
      2: PRODUCT_DETAILS_PROMPTS.round2,
      3: PRODUCT_DETAILS_PROMPTS.round3,
      4: PRODUCT_DETAILS_PROMPTS.round4,
      5: PRODUCT_DETAILS_PROMPTS.round5,
      6: PRODUCT_DETAILS_PROMPTS.round6 // 🆕 新增第6轮
    },
    implementation: {
      0: IMPLEMENTATION_PROMPTS.systemPrompt,
      1: IMPLEMENTATION_PROMPTS.round1,
      2: IMPLEMENTATION_PROMPTS.round2,
      3: IMPLEMENTATION_PROMPTS.round3,
      4: IMPLEMENTATION_PROMPTS.round4,
      5: IMPLEMENTATION_PROMPTS.round5
    }
  }

  return promptMap[dimensionId]?.[round] || '对不起，找不到对应的Prompt配置'
}

/**
 * 获取维度配置
 */
export function getDimensionConfig(dimensionId: string): DimensionConfig | null {
  return REFINEMENT_DIMENSIONS.find(d => d.id === dimensionId) || null
}

/**
 * 获取下一个维度
 */
export function getNextDimension(currentDimensionIndex: number): DimensionConfig | null {
  if (currentDimensionIndex >= REFINEMENT_DIMENSIONS.length - 1) {
    return null // 已经是最后一个维度
  }
  return REFINEMENT_DIMENSIONS[currentDimensionIndex + 1]
}
