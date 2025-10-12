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
 * 构建分析Prompt
 */
function buildAnalysisPrompt(body: IntelligentAnalysisRequest): string {
  return `你是一个专业的商业分析顾问。请对以下创意进行客观、准确的分析。

**创意信息：**
- 标题：${body.ideaTitle}
- 描述：${body.ideaDescription}
- 所在城市：${body.userLocation || '未提供'}
- 用户背景：${body.userBackground || '未提供'}

**分析要求：**

1. **创意特征**（必须客观准确）
   - category: 行业类别
   - technicalComplexity: 技术复杂度（low/medium/high）
   - fundingRequirement: 资金需求（客观估算）
   - competitionLevel: 竞争程度（low/medium/high）
   - aiCapabilities: AI能力需求（如实判断）

2. **竞品分析**（必须真实存在）
   - 列出3个真实存在的竞品（不要编造）
   - 如果确实没有直接竞品，说明"暂无直接竞品"
   - 分析优劣势和差异化

3. **技术栈推荐**（优先国产，必须真实可用）
   - 推荐真实存在的技术和工具
   - 优先：Trae.ai、腾讯云微搭、智谱GLM、阿里云等国产工具
   - 给出学习时间线和成本估算

4. **线下活动**（必须是真实活动）
   - 只推荐确实存在的活动
   - 如果不确定具体时间，说明"需要查询最新信息"
   - 优先推荐黑客松、创业大赛等

5. **其他推荐**
   - 调研渠道、时间线、预算、团队等

**输出格式：**
严格JSON格式，不要编造数据，不确定的信息标注"待确认"。

\`\`\`json
{
  "characteristics": {
    "category": "...",
    "technicalComplexity": "low/medium/high",
    "fundingRequirement": "...",
    "competitionLevel": "low/medium/high",
    "aiCapabilities": { ... }
  },
  "competitorAnalysis": {
    "competitors": [
      {
        "name": "真实竞品名称或'暂无直接竞品'",
        "strength": "...",
        "weakness": "...",
        "differentiation": "..."
      }
    ],
    "marketGap": "..."
  },
  "recommendations": {
    "techStackRecommendations": {
      "beginner": {
        "primary": "真实可用的技术栈",
        "timeline": "...",
        "reason": "...",
        "cost": "..."
      }
    },
    "offlineEvents": {
      "nationalEvents": [
        {
          "name": "真实活动名称或'待确认'",
          "time": "时间或'待查询'",
          "location": "...",
          "cost": "...",
          "confidence": "high/medium/low"
        }
      ],
      "localEvents": ["..."]
    },
    "researchChannels": { ... },
    "customizedTimeline": { ... },
    "budgetPlan": { ... },
    "teamRecommendations": { ... }
  }
}
\`\`\`

**特别注意：**
1. 不要编造不存在的产品、公司、活动
2. 不确定的信息要明确标注
3. 数据必须客观、可验证`
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
      }
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
    // 确保stack是字符串
    const stackStr = typeof stack === 'string' ? stack : String(stack || '')
    // 简单分词提取技术名称
    const techs = stackStr.split(/[、+,，]/g)
    techs.forEach(t => {
      const trimmed = t.trim()
      if (trimmed) allTechnologies.add(trimmed)
    })
  })

  return {
    beginner: {
      primary: techStacks[0] || '待评估',
      timeline: dataList[0]?.recommendations?.techStackRecommendations?.beginner?.timeline,
      reason: dataList[0]?.recommendations?.techStackRecommendations?.beginner?.reason,
      cost: dataList[0]?.recommendations?.techStackRecommendations?.beginner?.cost,
      alternatives: Array.from(allTechnologies).slice(0, 8),
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
