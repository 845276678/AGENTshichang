import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/auth'
import {
  generateFunctionalMVP,
  checkDeepSeekConfig
} from '@/lib/deepseek-client'
import OpenAI from 'openai'

interface IntelligentAnalysisRequest {
  ideaTitle: string
  ideaDescription: string
  userLocation?: string
  userBackground?: string
}

interface IdeaCharacteristics {
  category: string
  technicalComplexity: 'low' | 'medium' | 'high'
  fundingRequirement: string
  competitionLevel: 'low' | 'medium' | 'high'
  aiCapabilities: {
    nlp: boolean
    cv: boolean
    ml: boolean
    recommendation: boolean
    generation: boolean
    automation: boolean
  }
}

interface PersonalizedRecommendations {
  techStackRecommendations: {
    beginner: {
      primary: string
      timeline: string
      reason: string
      cost: string
    }
  }
  researchChannels: {
    online: string[]
    offline: string[]
  }
  offlineEvents: {
    nationalEvents: Array<{
      name: string
      time: string
      location: string
      cost: string
    }>
    localEvents: string[]
  }
  customizedTimeline: {
    month1: { focus: string }
    month2: { focus: string }
    month3: { focus: string }
  }
  budgetPlan: {
    startupCosts: { total: number }
    monthlyCosts: { total: number }
    costOptimization: string[]
  }
  teamRecommendations: {
    coreTeam: string[]
    advisorTypes: string[]
  }
}

/**
 * 智能分析创意并生成个性化推荐
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

    console.log('🧠 开始智能分析创意', {
      title: body.ideaTitle,
      location: body.userLocation || '未提供',
      background: body.userBackground || '未提供'
    })

    // 检查DeepSeek配置
    const deepSeekCheck = checkDeepSeekConfig()
    if (!deepSeekCheck.isConfigured) {
      console.warn('⚠️ DeepSeek未配置，使用降级模板')
      return NextResponse.json({
        success: false,
        error: 'AI分析服务暂时不可用',
        useFallback: true
      }, { status: 503 })
    }

    // 使用DeepSeek API进行智能分析
    const deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
    })

    const analysisPrompt = `你是一个专业的商业分析顾问和创业导师。请对以下创意进行深入分析，并提供个性化的推荐方案。

**创意信息：**
- 标题：${body.ideaTitle}
- 详细描述：${body.ideaDescription}
- 用户所在城市：${body.userLocation || '未提供'}
- 用户背景：${body.userBackground || '未提供'}

**任务要求：**

1. **创意特征分析** - 分析创意的基本特征：
   - category: 所属行业类别（如：教育科技、电商零售、企业服务、生活服务、金融科技、医疗健康等）
   - technicalComplexity: 技术复杂度（low/medium/high）
   - fundingRequirement: 启动资金需求（如：低（5万以下）、中等（5-20万）、高（20万以上））
   - competitionLevel: 竞争激烈程度（low/medium/high）
   - aiCapabilities: 需要的AI能力（nlp/cv/ml/recommendation/generation/automation，返回boolean对象）

2. **个性化推荐方案** - 基于创意特征和用户背景提供：
   - **技术栈推荐**（适合初学者）：
     - primary: 主要技术栈（具体到技术名称）
     - timeline: 学习和开发时间线
     - reason: 推荐理由
     - cost: 预计成本范围

   - **用户调研渠道**：
     - online: 3-5个在线调研渠道（根据创意类型推荐具体平台）
     - offline: 3-5个线下调研方式（根据用户所在城市定制）

   - **线下活动推荐**（根据行业和城市）：
     - nationalEvents: 1-3个全国性行业活动（包含name/time/location/cost）
     - localEvents: 2-4个当地相关活动（根据用户城市）

   - **90天定制时间线**：
     - month1: { focus: 第一个月重点 }
     - month2: { focus: 第二个月重点 }
     - month3: { focus: 第三个月重点 }

   - **预算规划**：
     - startupCosts: { total: 启动成本总额（数字） }
     - monthlyCosts: { total: 月度运营成本（数字） }
     - costOptimization: 3-5个成本优化建议

   - **团队推荐**：
     - coreTeam: 3-5个核心团队成员角色
     - advisorTypes: 2-3个建议寻找的顾问类型

**输出格式要求：**
严格按照以下JSON格式输出，不要有任何额外说明：

\`\`\`json
{
  "characteristics": {
    "category": "行业类别",
    "technicalComplexity": "low/medium/high",
    "fundingRequirement": "资金需求描述",
    "competitionLevel": "low/medium/high",
    "aiCapabilities": {
      "nlp": true/false,
      "cv": true/false,
      "ml": true/false,
      "recommendation": true/false,
      "generation": true/false,
      "automation": true/false
    }
  },
  "recommendations": {
    "techStackRecommendations": {
      "beginner": {
        "primary": "技术栈名称",
        "timeline": "时间线",
        "reason": "推荐理由",
        "cost": "成本范围"
      }
    },
    "researchChannels": {
      "online": ["渠道1", "渠道2", "渠道3"],
      "offline": ["方式1", "方式2", "方式3"]
    },
    "offlineEvents": {
      "nationalEvents": [
        {
          "name": "活动名称",
          "time": "举办时间",
          "location": "地点",
          "cost": "费用"
        }
      ],
      "localEvents": ["本地活动1", "本地活动2"]
    },
    "customizedTimeline": {
      "month1": { "focus": "第一个月重点" },
      "month2": { "focus": "第二个月重点" },
      "month3": { "focus": "第三个月重点" }
    },
    "budgetPlan": {
      "startupCosts": { "total": 50000 },
      "monthlyCosts": { "total": 15000 },
      "costOptimization": ["建议1", "建议2", "建议3"]
    },
    "teamRecommendations": {
      "coreTeam": ["角色1", "角色2", "角色3"],
      "advisorTypes": ["顾问类型1", "顾问类型2"]
    }
  }
}
\`\`\`

**重要提示：**
1. 所有推荐必须基于用户的创意内容进行个性化定制，不要使用通用模板
2. 如果用户提供了所在城市，线下推荐必须针对该城市
3. 技术栈推荐要考虑用户背景（如果提供）
4. 预算和成本要基于创意的实际需求合理估算
5. 时间线要符合90天快速验证的原则
6. 只返回JSON，不要有任何markdown标记或额外说明`

    console.log('🚀 调用DeepSeek API进行智能分析...')

    const completion = await deepseek.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的商业分析顾问和创业导师，擅长分析创意项目并提供个性化的指导建议。你的回答必须基于用户的创意进行深入分析，提供具体、可执行的建议。'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      stream: false
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      throw new Error('DeepSeek返回空内容')
    }

    console.log('✅ DeepSeek分析完成')

    // 清理markdown代码块标记
    let cleanedContent = rawContent.trim()
    cleanedContent = cleanedContent.replace(/```json\n?/g, '')
    cleanedContent = cleanedContent.replace(/```\n?/g, '')
    cleanedContent = cleanedContent.trim()

    // 解析JSON结果
    let analysisResult
    try {
      analysisResult = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error('❌ JSON解析失败:', parseError)
      console.error('原始内容:', cleanedContent)
      throw new Error('AI分析结果格式错误')
    }

    // 验证结果结构
    if (!analysisResult.characteristics || !analysisResult.recommendations) {
      throw new Error('AI分析结果缺少必要字段')
    }

    console.log('✅ 智能分析完成', {
      category: analysisResult.characteristics.category,
      complexity: analysisResult.characteristics.technicalComplexity
    })

    return NextResponse.json({
      success: true,
      data: {
        characteristics: analysisResult.characteristics,
        recommendations: analysisResult.recommendations
      }
    })

  } catch (error) {
    console.error('❌ 智能分析失败:', error)
    return handleApiError(error)
  }
}
