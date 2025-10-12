import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/auth'
import OpenAI from 'openai'

interface IntelligentAnalysisRequest {
  ideaTitle: string
  ideaDescription: string
  userLocation?: string
  userBackground?: string
}

interface AIModelResult {
  model: string
  success: boolean
  data?: any
  error?: string
  duration: number
}

// 简单的内存缓存(生产环境建议使用Redis)
interface CacheEntry {
  data: any
  timestamp: number
}

const analysisCache = new Map<string, CacheEntry>()
const CACHE_TTL = 30 * 60 * 1000 // 30分钟缓存

/**
 * 多AI交叉验证智能分析API
 *
 * 核心机制：
 * 1. 同时调用DeepSeek、智谱GLM、通义千问三个模型
 * 2. 对比三个模型的分析结果
 * 3. 识别一致性数据（可信）和差异性数据（需审查）
 * 4. 生成综合验证报告
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IntelligentAnalysisRequest

    // 验证必要参数
    if (!body.ideaTitle?.trim() || !body.ideaDescription?.trim()) {
      return NextResponse.json({
        success: false,
        error: "缺少创意标题或描述"
      }, { status: 400 })
    }

    console.log('🔬 开始多AI交叉验证分析', {
      title: body.ideaTitle,
      location: body.userLocation || '未提供',
      background: body.userBackground || '未提供'
    })

    // 生成缓存键(基于创意内容)
    const cacheKey = `${body.ideaTitle}:${body.ideaDescription}:${body.userLocation || ''}:${body.userBackground || ''}`

    // 检查缓存
    const cachedResult = analysisCache.get(cacheKey)
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
      console.log('✅ 命中缓存，直接返回')
      return NextResponse.json({
        success: true,
        data: {
          ...cachedResult.data,
          metadata: {
            ...cachedResult.data.metadata,
            cached: true,
            cachedAt: new Date(cachedResult.timestamp).toISOString()
          }
        }
      })
    }

    // 准备通用的分析Prompt
    const analysisPrompt = buildAnalysisPrompt(body)

    // 并行调用三个AI模型
    const [deepseekResult, zhipuResult, qwenResult] = await Promise.allSettled([
      callDeepSeek(analysisPrompt),
      callZhipu(analysisPrompt),
      callQwen(analysisPrompt)
    ])

    // 整理各模型结果
    const results: AIModelResult[] = [
      processResult('DeepSeek', deepseekResult),
      processResult('智谱GLM', zhipuResult),
      processResult('通义千问', qwenResult)
    ]

    // 统计成功的模型
    const successfulResults = results.filter(r => r.success && r.data)
    console.log(`✅ ${successfulResults.length}/3 个模型成功返回结果`)

    if (successfulResults.length === 0) {
      throw new Error('所有AI模型均调用失败')
    }

    // 交叉验证分析
    const verifiedData = crossVerifyResults(successfulResults, body)

    // 生成验证报告
    const verificationReport = generateVerificationReport(results, verifiedData)

    console.log('✅ 多AI交叉验证完成', {
      successCount: successfulResults.length,
      consensusScore: verifiedData.consensusScore
    })

    const responseData = {
      // 经过验证的综合数据
      verified: verifiedData.consensus,

      // 各模型的原始结果（供用户参考）
      modelResults: results.map(r => ({
        model: r.model,
        success: r.success,
        duration: r.duration,
        data: r.success ? r.data : null,
        error: r.error
      })),

      // 验证报告
      verification: verificationReport,

      // 元数据
      metadata: {
        timestamp: new Date().toISOString(),
        modelsUsed: results.map(r => r.model),
        successRate: `${successfulResults.length}/3`,
        consensusScore: verifiedData.consensusScore,
        cached: false
      }
    }

    // 存入缓存
    analysisCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    })

    // 清理过期缓存(简单实现)
    if (analysisCache.size > 100) {
      const now = Date.now()
      for (const [key, entry] of analysisCache.entries()) {
        if (now - entry.timestamp > CACHE_TTL) {
          analysisCache.delete(key)
        }
      }
    }

    console.log(`📦 结果已缓存，当前缓存数: ${analysisCache.size}`)

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('❌ 多AI验证失败:', error)
    return handleApiError(error)
  }
}

/**
 * 构建分析Prompt（增强版 - 提升内容质量）
 */
function buildAnalysisPrompt(body: IntelligentAnalysisRequest): string {
  return `你是一个专业的商业分析顾问和创业导师。请对以下创意进行深入、详实、可操作的分析。

**创意信息：**
- 标题：${body.ideaTitle}
- 描述：${body.ideaDescription}
- 所在城市：${body.userLocation || '未提供'}
- 用户背景：${body.userBackground || '未提供'}

---

## 📋 分析要求（所有描述必须详实具体）

### 1. 创意特征分析
- category: 精确的行业类别
- technicalComplexity: 技术复杂度（low/medium/high）
- fundingRequirement: 具体资金需求范围（如"5-10万元"）
- competitionLevel: 竞争程度（low/medium/high）
- aiCapabilities: AI能力需求的详细描述

---

### 2. 竞品分析（✨ 关键优化：必须相关且详实）

**筛选标准（严格执行）：**
- 必须是同领域的直接竞品或相似产品
- 必须真实存在且可验证
- 优先推荐国内创业服务平台（如创业邦、36氪、IT桔子）
- 对于AI相关创意，推荐AI商业分析工具、创业辅导平台

**不要推荐：**
- 通用设计工具（如Canva）
- 电商工具（如JungleScout）
- 纯文档协作工具
- 与创意关联性弱的产品

**详细分析要求（每项至少80字）：**

competitors数组中每个竞品必须包含：
- name: 真实竞品名称
- strength: 优势分析（80字以上）
  * 具体功能特点（3-5点）
  * 用户规模或市场份额（如果已知）
  * 技术优势或商业模式亮点
  * 为什么用户会选择它
- weakness: 劣势分析（80字以上）
  * 功能缺陷或体验痛点
  * 定价过高或不灵活
  * 技术限制
  * 用户负面反馈
- differentiation: 差异化分析（80字以上）
  * 我们的创意如何解决它的劣势
  * 我们的独特价值主张
  * 目标用户群的差异
  * 技术或商业模式的创新点

**市场空白点分析（至少300字）：**
marketGap必须包含：
1. 现有解决方案的局限性（列举3-5个主要竞品的不足）
2. 目标用户群的具体需求和痛点
3. 我们的创意填补的空白（具体解决哪些痛点）
4. 市场时机分析（为什么现在是好时机）
5. 潜在风险提示

示例格式：
"当前创业服务市场存在明显的结构性缺陷。现有工具如XXX侧重XXX,缺乏XXX。据《2024中国创业者调研报告》显示,68%的早期创业者表示\"不知道如何验证创意\"。本平台的XXX机制填补了\"XXX\"的空白..."

---

### 3. 技术栈推荐（✨ 优先国产 + 学习路径）

**推荐原则：**
- 必须优先推荐中国本土产品
- 无代码平台：Trae.ai、腾讯云微搭、钉钉宜搭、阿里云魔方
- AI服务：智谱GLM、通义千问、DeepSeek、百度文心
- 云服务：阿里云、腾讯云、华为云

**techStackRecommendations.beginner必须包含：**

primary: 主要推荐的技术栈组合

reason: 推荐理由（至少100字）
- 为什么适合用户背景
- 技术成熟度和生态
- 成本优势
- 学习曲线

timeline: 完整学习时间线（不只是总时间）

learningPath: 分阶段学习路径（新增！）
{
  "phase1": {
    "duration": "1-2个月",
    "focus": "基础平台学习",
    "resources": ["官方文档URL", "视频教程", "实战案例"],
    "goal": "能够搭建简单应用"
  },
  "phase2": {
    "duration": "2-3个月",
    "focus": "AI功能集成",
    "resources": ["API文档", "示例代码", "社区问答"],
    "goal": "实现核心AI功能"
  },
  "phase3": {
    "duration": "2-3个月",
    "focus": "完整应用开发",
    "goal": "发布MVP版本"
  }
}

alternatives: 替代方案
{
  "noCode": "完全不需要编程的方案",
  "lowCode": "少量代码的方案",
  "fullCode": "需要编程基础的方案"
}

cost: 成本估算（具体数字范围）
{
  "learning": "线上课程约2000-5000元",
  "development": "云服务月费1000-3000元",
  "thirdPartyAPI": "AI API调用约500-2000元/月"
}

---

### 4. 线下活动推荐（✨ 必须真实 + 详细信息）

**推荐标准：**
- 只推荐2025年Q4及以后的真实活动
- 优先推荐：黑客松、创业大赛、开发者大会、创业路演
- 每个活动必须包含完整信息

**nationalEvents数组每个活动必须包含：**

name: 活动全称

time: 时间信息（必须明确）
- 如果知道2025年具体时间，提供准确时间
- 如果是年度固定活动，提供历史举办时间（如"往年在4-6月"）
- 必须建议查询官网的URL
- 格式示例："2025年3-9月（建议查询官网 cyds.org.cn 确认）"

location: 具体地点（如果是${body.userLocation}本地活动，标注"本地活动"）

cost: 费用信息（如"免费报名"、"需缴纳保证金"等）

value: 参加价值（80字以上）
- 对创业者的具体帮助
- 历年参与规模和影响力
- 可获得的资源（曝光、融资、导师等）

officialWebsite: 官网链接（必须提供）

applicationProcess: 报名流程（简要说明）

confidence: 可信度（high/medium/low）

示例：
{
  "name": "中国创新创业大赛",
  "time": "2024年3-9月（2025年时间建议查询官网 cyds.org.cn）",
  "location": "全国各赛区，${body.userLocation}有分赛区",
  "cost": "免费报名",
  "value": "全国最大规模创业大赛，往年参赛项目超10万个，可获得曝光和融资机会，优秀项目可获得种子资金和孵化资源",
  "officialWebsite": "https://www.chuangye.org.cn",
  "applicationProcess": "线上报名→初赛→复赛→全国总决赛",
  "confidence": "high"
}

---

### 5. 调研渠道（✨ 具体平台 + 使用方法）

**researchChannels必须提供具体平台：**

online: 线上调研渠道（根据创意类型定制）
{
  "socialMedia": [
    {
      "name": "小红书",
      "reason": "适合调研年轻用户需求，可搜索\"创业\"、\"AI工具\"等关键词",
      "method": "发布问卷、观察评论、私信用户访谈"
    },
    {
      "name": "知乎",
      "reason": "高质量用户群，可在\"创业\"、\"产品经理\"等话题下提问",
      "method": "发起讨论、分析高赞回答、联系KOL"
    }
  ],
  "professionalCommunities": [
    {
      "name": "Product Hunt中文版 - 少数派",
      "reason": "科技产品早期用户聚集地",
      "method": "发布产品原型，收集反馈"
    },
    {
      "name": "V2EX创业板块",
      "reason": "技术创业者社区",
      "method": "发帖讨论，获取技术创业建议"
    }
  ],
  "competitorAnalysis": {
    "tools": ["企查查（查竞品融资）", "App Store评论（分析用户痛点）", "SimilarWeb（流量分析）"]
  }
}

offline: 线下调研方式（结合用户城市）
- 具体场所：如"${body.userLocation}本地：XXX创业咖啡、XXX孵化器"
- 目标用户：创业孵化器、大学创业社团、创业者社群
- 方法：1对1深度访谈（准备10个核心问题）、小范围产品演示

---

### 6. 预算规划（✨ 详细分项 + 具体数字）

**budgetPlan必须包含详细分项：**

startupCosts: 启动成本（根据用户背景和创意复杂度）
{
  "technology": {
    "amount": "20000-30000元",
    "items": ["域名服务器", "开发工具", "第三方服务初始化"]
  },
  "learning": {
    "amount": "5000-10000元",
    "items": ["在线课程", "技术书籍", "培训费用"]
  },
  "marketing": {
    "amount": "10000-20000元",
    "items": ["品牌设计", "初期推广", "内容制作"]
  },
  "legal": {
    "amount": "5000-10000元",
    "items": ["公司注册", "商标申请", "合同咨询"]
  },
  "total": "4-7万元",
  "description": "基于${body.userBackground}的保守估算"
}

monthlyCosts: 月度成本分项
{
  "infrastructure": {
    "amount": "2000-3000元",
    "items": ["云服务器", "CDN", "数据库"]
  },
  "ai_api": {
    "amount": "1000-2000元",
    "items": ["AI模型调用费", "按量计费"]
  },
  "operations": {
    "amount": "5000-8000元",
    "items": ["人力成本（兼职）", "办公费用", "推广费用"]
  },
  "total": "0.8-1.3万元/月",
  "scalingNote": "用户增长后需相应增加预算"
}

costOptimization: 成本优化建议（至少5条具体建议）
[
  "使用腾讯云、阿里云的创业扶持计划，可获得1-3万元代金券",
  "选择国产AI模型（如智谱GLM），成本比OpenAI低60-70%",
  "初期采用无代码/低代码平台，节省5-10万元开发成本",
  "参加创业大赛获得种子资金和免费资源",
  "加入创业孵化器，获得免费办公场地和导师指导"
]

---

### 7. 风险提示（✨ 新增必备内容）

**risks必须包含：**

technical: 技术风险（2-3条）
- 低代码平台的局限性
- AI模型依赖风险
- 技术债务风险

market: 市场风险（2-3条）
- 竞争风险
- 用户付费意愿
- 市场时机

operation: 运营风险（2-3条）
- 学习曲线
- 用户获取成本
- 团队能力

financial: 财务风险（2-3条）
- 资金需求
- 成本增长
- 现金流管理

mitigation: 风险缓解建议（至少3条）
- 先用MVP验证核心价值
- 参加创业大赛获得种子资金
- 寻找技术合伙人降低开发风险

---

### 8. 成功案例参考（✨ 新增必备内容）

**successCases至少2-3个：**

[
  {
    "name": "Notion",
    "relevance": "同样面向非技术用户的工具类产品",
    "keySuccess": "简单易用的界面 + 模板生态 + 社区驱动",
    "takeaway": "重视用户体验，建立模板市场，培养KOL用户",
    "timeline": "2016年创立，2020年估值20亿美元"
  },
  {
    "name": "墨刀（国产原型工具）",
    "relevance": "服务非技术背景的产品经理和创业者",
    "keySuccess": "本土化 + 协作功能 + 教育内容",
    "takeaway": "重视本土化需求，提供丰富的学习资源",
    "timeline": "2014年成立，2019年完成B轮融资"
  }
]

---

### 9. 下一步行动计划（✨ 新增必备内容）

**nextSteps必须提供分阶段计划：**

week1: 第一周行动计划
{
  "title": "市场验证阶段",
  "tasks": [
    "在知乎、小红书发布需求调研问卷",
    "访谈10个目标用户，记录痛点",
    "研究3个核心竞品，完成SWOT分析"
  ],
  "deliverables": ["用户访谈记录", "竞品分析报告", "需求验证结论"],
  "resources": ["问卷模板", "访谈提纲", "SWOT模板"]
}

week2_4: 第2-4周行动计划
{
  "title": "MVP设计阶段",
  "tasks": [
    "学习技术平台基础教程（预计20小时）",
    "设计核心功能流程图",
    "制作交互原型"
  ],
  "deliverables": ["功能流程图", "交互原型", "技术方案"],
  "resources": ["平台官方文档", "原型设计教程"]
}

month2_3: 第2-3月行动计划
{
  "title": "MVP开发阶段",
  "tasks": [
    "基于推荐技术栈搭建基础应用",
    "集成AI功能实现核心价值",
    "邀请10个种子用户内测"
  ],
  "deliverables": ["MVP产品", "用户反馈报告"]
}

keyMilestones: 关键里程碑（2-3个）
[
  {
    "milestone": "验证需求",
    "criteria": "至少50%的受访用户表示愿意付费使用",
    "decision": "通过则继续开发，否则调整方向"
  },
  {
    "milestone": "完成MVP",
    "criteria": "10个种子用户中至少7个给出正面评价",
    "decision": "通过则申请创业大赛，否则迭代产品"
  }
]

---

## 📤 输出格式

严格按照JSON格式输出，确保所有字段都有详实的内容：

\`\`\`json
{
  "characteristics": { ... },
  "competitorAnalysis": {
    "competitors": [ ... ],  // 每个竞品的描述至少80字
    "marketGap": "..."  // 至少300字的深入分析
  },
  "recommendations": {
    "techStackRecommendations": {
      "beginner": {
        "primary": "...",
        "reason": "...",  // 至少100字
        "timeline": "...",
        "learningPath": { ... },  // 分阶段学习路径
        "alternatives": { ... },
        "cost": { ... }  // 详细成本分项
      }
    },
    "offlineEvents": {
      "nationalEvents": [ ... ],  // 每个活动包含完整信息
      "localEvents": [ ... ]
    },
    "researchChannels": {
      "online": { ... },  // 具体平台名称和方法
      "offline": [ ... ]
    },
    "budgetPlan": {
      "startupCosts": { ... },  // 详细分项和具体金额
      "monthlyCosts": { ... },
      "costOptimization": [ ... ]  // 至少5条
    },
    "customizedTimeline": { ... },
    "teamRecommendations": { ... }
  },
  "risks": {
    "technical": [ ... ],
    "market": [ ... ],
    "operation": [ ... ],
    "financial": [ ... ],
    "mitigation": [ ... ]
  },
  "successCases": [ ... ],  // 2-3个成功案例
  "nextSteps": {
    "week1": { ... },
    "week2_4": { ... },
    "month2_3": { ... },
    "keyMilestones": [ ... ]
  }
}
\`\`\`

---

## ⚠️ 特别注意

1. **不要编造数据**：所有竞品、活动、工具必须真实存在
2. **描述详实**：每个重要描述至少80字，市场分析至少300字
3. **数字具体**：成本用具体数字范围（如"3-5万元"），不用"适中"等模糊词
4. **平台具体**：调研渠道要写具体平台名（如"小红书"而非"社交媒体"）
5. **时间明确**：活动时间要么给准确时间，要么说明"待查询+官网链接"
6. **优先国产**：技术栈必须优先推荐中国本土产品
7. **风险提示**：必须包含风险分析，避免误导用户
8. **行动指引**：必须提供分阶段的具体行动计划`
}

/**
 * 调用DeepSeek
 */
async function callDeepSeek(prompt: string): Promise<any> {
  const startTime = Date.now()

  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API未配置')
  }

  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1'
  })

  console.log('🚀 调用DeepSeek...')

  const completion = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的商业分析顾问。必须提供客观、准确、可验证的分析，不要编造数据。'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3, // 降低随机性，提高准确性
    max_tokens: 6000
  })

  const duration = Date.now() - startTime
  const content = completion.choices[0]?.message?.content || ''
  const cleanedContent = cleanContent(content)

  return {
    data: JSON.parse(cleanedContent),
    duration
  }
}

/**
 * 调用智谱GLM
 */
async function callZhipu(prompt: string): Promise<any> {
  const startTime = Date.now()

  if (!process.env.ZHIPU_API_KEY) {
    throw new Error('智谱API未配置')
  }

  const client = new OpenAI({
    apiKey: process.env.ZHIPU_API_KEY,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4'
  })

  console.log('🚀 调用智谱GLM...')

  const completion = await client.chat.completions.create({
    model: 'glm-4',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的商业分析顾问。必须提供客观、准确、可验证的分析，不要编造数据。重要提示：只返回纯JSON格式数据，不要有任何前缀文字、说明或markdown标记，直接以{开头。'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 6000
  })

  const duration = Date.now() - startTime
  const content = completion.choices[0]?.message?.content || ''
  const cleanedContent = cleanContent(content)

  return {
    data: JSON.parse(cleanedContent),
    duration
  }
}

/**
 * 调用通义千问
 */
async function callQwen(prompt: string): Promise<any> {
  const startTime = Date.now()

  if (!process.env.DASHSCOPE_API_KEY) {
    throw new Error('千问API未配置')
  }

  const client = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  })

  console.log('🚀 调用通义千问...')

  const completion = await client.chat.completions.create({
    model: 'qwen-plus',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的商业分析顾问。必须提供客观、准确、可验证的分析，不要编造数据。'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 6000
  })

  const duration = Date.now() - startTime
  const content = completion.choices[0]?.message?.content || ''
  const cleanedContent = cleanContent(content)

  return {
    data: JSON.parse(cleanedContent),
    duration
  }
}

/**
 * 清理内容 - 增强版,处理智谱GLM等模型返回的中文前缀
 */
function cleanContent(content: string): string {
  let cleaned = content.trim()

  // 移除markdown代码块标记
  cleaned = cleaned.replace(/```json\n?/g, '')
  cleaned = cleaned.replace(/```\n?/g, '')

  // 移除可能的中文前缀(如"以下是..."、"根据提供的信息..."等)
  // 查找第一个{的位置
  const firstBrace = cleaned.indexOf('{')
  if (firstBrace > 0) {
    cleaned = cleaned.substring(firstBrace)
  }

  // 移除JSON后面可能的说明文字
  const lastBrace = cleaned.lastIndexOf('}')
  if (lastBrace > 0 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.substring(0, lastBrace + 1)
  }

  return cleaned.trim()
}

/**
 * 处理Promise结果
 */
function processResult(
  modelName: string,
  result: PromiseSettledResult<any>
): AIModelResult {
  if (result.status === 'fulfilled') {
    return {
      model: modelName,
      success: true,
      data: result.value.data,
      duration: result.value.duration
    }
  } else {
    return {
      model: modelName,
      success: false,
      error: result.reason?.message || '未知错误',
      duration: 0
    }
  }
}

/**
 * 交叉验证结果
 */
function crossVerifyResults(
  results: AIModelResult[],
  body: IntelligentAnalysisRequest
) {
  const dataList = results.map(r => r.data)

  // 验证创意特征的一致性
  const characteristics = verifyCharacteristics(dataList)

  // 验证竞品的真实性
  const competitors = verifyCompetitors(dataList)

  // 验证技术栈推荐
  const techStack = verifyTechStack(dataList)

  // 验证活动信息
  const events = verifyEvents(dataList)

  // 计算共识分数
  const consensusScore = calculateConsensusScore(dataList)

  return {
    consensus: {
      characteristics,
      competitorAnalysis: competitors,
      recommendations: {
        techStackRecommendations: techStack,
        offlineEvents: events,
        // 其他字段取第一个成功的结果
        researchChannels: dataList[0]?.recommendations?.researchChannels,
        customizedTimeline: dataList[0]?.recommendations?.customizedTimeline,
        budgetPlan: dataList[0]?.recommendations?.budgetPlan,
        teamRecommendations: dataList[0]?.recommendations?.teamRecommendations
      },
      // 新增的增强字段
      risks: dataList[0]?.risks || {},
      successCases: dataList[0]?.successCases || [],
      nextSteps: dataList[0]?.nextSteps || {}
    },
    consensusScore
  }
}

/**
 * 验证创意特征（取多数）
 */
function verifyCharacteristics(dataList: any[]): any {
  const categories = dataList.map(d => d?.characteristics?.category).filter(Boolean)
  const complexities = dataList.map(d => d?.characteristics?.technicalComplexity).filter(Boolean)

  return {
    category: getMostCommon(categories) || '待确认',
    technicalComplexity: getMostCommon(complexities) || 'medium',
    fundingRequirement: dataList[0]?.characteristics?.fundingRequirement || '待评估',
    competitionLevel: getMostCommon(
      dataList.map(d => d?.characteristics?.competitionLevel).filter(Boolean)
    ) || 'medium',
    aiCapabilities: dataList[0]?.characteristics?.aiCapabilities || {},
    verificationNotes: `${categories.length}/3 个模型达成共识`
  }
}

/**
 * 验证竞品（去重+标注来源）
 */
function verifyCompetitors(dataList: any[]): any {
  const allCompetitors: any[] = []
  const competitorNames = new Set<string>()

  dataList.forEach(data => {
    const competitors = data?.competitorAnalysis?.competitors || []
    competitors.forEach((comp: any) => {
      if (comp.name && comp.name !== '暂无直接竞品' && !competitorNames.has(comp.name)) {
        competitorNames.add(comp.name)

        // 统计有多少个模型提到了这个竞品
        const mentionCount = dataList.filter(d =>
          d?.competitorAnalysis?.competitors?.some((c: any) => c.name === comp.name)
        ).length

        allCompetitors.push({
          ...comp,
          confidence: mentionCount >= 2 ? 'high' : 'medium',
          mentionedBy: mentionCount
        })
      }
    })
  })

  // 按提及次数排序
  allCompetitors.sort((a, b) => b.mentionedBy - a.mentionedBy)

  return {
    competitors: allCompetitors,
    marketGap: dataList[0]?.competitorAnalysis?.marketGap || '待分析',
    verificationNotes: `发现${allCompetitors.length}个竞品，其中${allCompetitors.filter(c => c.mentionedBy >= 2).length}个被多个模型确认`
  }
}

/**
 * 验证技术栈（优先被多次推荐的）
 */
function verifyTechStack(dataList: any[]): any {
  const techStacks = dataList.map(d =>
    d?.recommendations?.techStackRecommendations?.beginner?.primary
  ).filter(Boolean)

  // 提取所有提到的技术
  const allTechnologies = new Set<string>()
  techStacks.forEach(stack => {
    // 确保stack是字符串，如果是对象则跳过
    if (typeof stack === 'string') {
      // 简单分词提取技术名称
      const techs = stack.split(/[、+,，]/g)
      techs.forEach(t => {
        const trimmed = t.trim()
        if (trimmed) allTechnologies.add(trimmed)
      })
    } else if (typeof stack === 'object' && stack !== null) {
      // 如果是对象,尝试获取其字符串表示
      const stackStr = JSON.stringify(stack)
      if (stackStr) allTechnologies.add(stackStr.substring(0, 50))
    }
  })

  return {
    beginner: {
      primary: techStacks[0] || '待评估',
      timeline: dataList[0]?.recommendations?.techStackRecommendations?.beginner?.timeline,
      reason: dataList[0]?.recommendations?.techStackRecommendations?.beginner?.reason,
      cost: dataList[0]?.recommendations?.techStackRecommendations?.beginner?.cost,
      learningPath: dataList[0]?.recommendations?.techStackRecommendations?.beginner?.learningPath || {},
      alternatives: dataList[0]?.recommendations?.techStackRecommendations?.beginner?.alternatives || Array.from(allTechnologies).slice(0, 8),
      verificationNotes: `${techStacks.length}个模型提供了技术栈建议`
    }
  }
}

/**
 * 验证活动（去重+标注可信度）
 */
function verifyEvents(dataList: any[]): any {
  const allEvents: any[] = []
  const eventNames = new Set<string>()

  dataList.forEach(data => {
    const events = data?.recommendations?.offlineEvents?.nationalEvents || []
    events.forEach((event: any) => {
      if (event.name && !eventNames.has(event.name)) {
        eventNames.add(event.name)

        // 统计提及次数
        const mentionCount = dataList.filter(d =>
          d?.recommendations?.offlineEvents?.nationalEvents?.some((e: any) => e.name === event.name)
        ).length

        allEvents.push({
          ...event,
          confidence: event.confidence || (mentionCount >= 2 ? 'high' : 'medium'),
          mentionedBy: mentionCount
        })
      }
    })
  })

  // 按可信度和提及次数排序
  allEvents.sort((a, b) => {
    if (a.confidence === 'high' && b.confidence !== 'high') return -1
    if (a.confidence !== 'high' && b.confidence === 'high') return 1
    return b.mentionedBy - a.mentionedBy
  })

  return {
    nationalEvents: allEvents,
    localEvents: dataList[0]?.recommendations?.offlineEvents?.localEvents || [],
    verificationNotes: `发现${allEvents.length}个活动，其中${allEvents.filter(e => e.confidence === 'high').length}个高可信度`
  }
}

/**
 * 计算共识分数
 */
function calculateConsensusScore(dataList: any[]): number {
  let agreements = 0
  let total = 0

  // 比较行业类别
  const categories = dataList.map(d => d?.characteristics?.category).filter(Boolean)
  if (categories.length >= 2) {
    total++
    if (categories.every(c => c === categories[0])) agreements++
  }

  // 比较技术复杂度
  const complexities = dataList.map(d => d?.characteristics?.technicalComplexity).filter(Boolean)
  if (complexities.length >= 2) {
    total++
    if (complexities.every(c => c === complexities[0])) agreements++
  }

  // 比较竞争程度
  const competitions = dataList.map(d => d?.characteristics?.competitionLevel).filter(Boolean)
  if (competitions.length >= 2) {
    total++
    if (competitions.every(c => c === competitions[0])) agreements++
  }

  return total > 0 ? Math.round((agreements / total) * 100) : 0
}

/**
 * 生成验证报告
 */
function generateVerificationReport(
  results: AIModelResult[],
  verifiedData: any
): any {
  const successCount = results.filter(r => r.success).length

  return {
    summary: `${successCount}/3个模型成功返回，共识度${verifiedData.consensusScore}%`,
    modelPerformance: results.map(r => ({
      model: r.model,
      success: r.success,
      responseTime: `${(r.duration / 1000).toFixed(2)}秒`,
      error: r.error
    })),
    dataQuality: {
      consensusScore: verifiedData.consensusScore,
      status: verifiedData.consensusScore >= 80 ? 'excellent' :
              verifiedData.consensusScore >= 60 ? 'good' :
              verifiedData.consensusScore >= 40 ? 'fair' : 'poor',
      recommendation: verifiedData.consensusScore >= 60
        ? '数据可信度高，可直接使用'
        : '数据存在分歧，建议人工审核'
    }
  }
}

/**
 * 获取最常见的值
 */
function getMostCommon(arr: string[]): string | null {
  if (arr.length === 0) return null

  const counts: { [key: string]: number } = {}
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1
  })

  let maxCount = 0
  let mostCommon = arr[0]

  Object.entries(counts).forEach(([item, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostCommon = item
    }
  })

  return mostCommon
}
