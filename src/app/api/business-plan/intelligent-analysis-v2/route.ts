import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/auth'
import OpenAI from 'openai'

interface IntelligentAnalysisRequest {
  ideaTitle: string
  ideaDescription: string
  userLocation?: string
  userBackground?: string
  preferredAIModel?: 'deepseek' | 'zhipu' | 'qwen' // 允许用户选择模型
}

/**
 * 改进版智能分析API
 *
 * 改进点：
 * 1. 增加竞品对比分析
 * 2. 推荐实时活动（提示AI需要最新信息）
 * 3. 优先推荐中国本土开发工具
 * 4. 支持多AI模型（DeepSeek/智谱/千问）
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

    console.log('🧠 开始智能分析创意 (V2)', {
      title: body.ideaTitle,
      location: body.userLocation || '未提供',
      background: body.userBackground || '未提供',
      model: body.preferredAIModel || 'auto'
    })

    // 选择AI模型
    const aiModel = body.preferredAIModel || 'deepseek'
    let client: OpenAI
    let modelName: string

    switch (aiModel) {
      case 'zhipu':
        // 智谱GLM（中文理解更好）
        if (!process.env.ZHIPU_API_KEY) {
          console.warn('⚠️ 智谱API未配置，降级到DeepSeek')
          client = new OpenAI({
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseURL: 'https://api.deepseek.com/v1'
          })
          modelName = 'deepseek-chat'
        } else {
          client = new OpenAI({
            apiKey: process.env.ZHIPU_API_KEY,
            baseURL: 'https://open.bigmodel.cn/api/paas/v4'
          })
          modelName = 'glm-4'
        }
        break

      case 'qwen':
        // 阿里通义千问（行业知识更全）
        if (!process.env.DASHSCOPE_API_KEY) {
          console.warn('⚠️ 千问API未配置，降级到DeepSeek')
          client = new OpenAI({
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseURL: 'https://api.deepseek.com/v1'
          })
          modelName = 'deepseek-chat'
        } else {
          client = new OpenAI({
            apiKey: process.env.DASHSCOPE_API_KEY,
            baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
          })
          modelName = 'qwen-plus'
        }
        break

      default:
        // DeepSeek（默认，性价比高）
        client = new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: 'https://api.deepseek.com/v1'
        })
        modelName = 'deepseek-chat'
    }

    // 改进的Prompt（解决用户提出的4个问题）
    const analysisPrompt = `你是一个专业的商业分析顾问和创业导师。请对以下创意进行深入分析，并提供个性化的推荐方案。

**创意信息：**
- 标题：${body.ideaTitle}
- 详细描述：${body.ideaDescription}
- 用户所在城市：${body.userLocation || '未提供'}
- 用户背景：${body.userBackground || '未提供'}
- 当前时间：2025年10月

**任务要求：**

1. **创意特征分析**
   - category: 所属行业类别
   - technicalComplexity: 技术复杂度（low/medium/high）
   - fundingRequirement: 启动资金需求
   - competitionLevel: 竞争激烈程度（low/medium/high）
   - aiCapabilities: 需要的AI能力（nlp/cv/ml/recommendation/generation/automation）

2. **竞品分析**（新增！）
   - competitors: 列出3-5个直接竞品或类似产品
     - name: 竞品名称
     - strength: 竞品优势
     - weakness: 竞品劣势
     - differentiation: 你的创意与竞品的差异化点
   - marketGap: 市场空白点分析

3. **个性化推荐方案**

   a) **技术栈推荐**（优先推荐中国本土产品！）
      - primary: 主要技术栈
        * 无代码平台：优先推荐 Trae.ai、腾讯云微搭、钉钉宜搭、阿里云魔方
        * 开发框架：Next.js、React、Vue3、Taro（跨端）
        * AI服务：智谱GLM、通义千问、DeepSeek、百度文心
        * 云服务：阿里云、腾讯云、华为云
      - timeline: 学习和开发时间线
      - reason: 推荐理由（强调国产工具的优势）
      - cost: 预计成本范围

   b) **用户调研渠道**
      - online: 3-5个在线调研渠道（根据创意类型）
      - offline: 3-5个线下调研方式（根据用户城市）

   c) **线下活动推荐**（重点改进！提供2025年实际活动）
      - nationalEvents: 1-3个全国性行业活动
        * 优先推荐2025年Q4的实际活动
        * 如果是技术类创意，推荐：黑客松、开发者大会、AI大会
        * 如果是创业类，推荐：创业大赛、路演活动
        * 提供活动时间、地点、费用
      - localEvents: 2-4个当地相关活动
        * 根据用户城市推荐本地创业社区活动
        * 包括黑客松、创业周末、孵化器开放日等

   d) **90天定制时间线**
      - month1/month2/month3: 每月执行重点

   e) **预算规划**
      - startupCosts: { total: 启动成本 }
      - monthlyCosts: { total: 月度成本 }
      - costOptimization: 3-5个成本优化建议

   f) **团队推荐**
      - coreTeam: 3-5个核心团队成员角色
      - advisorTypes: 2-3个建议顾问类型

**输出格式要求：**
严格按照以下JSON格式输出：

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
  "competitorAnalysis": {
    "competitors": [
      {
        "name": "竞品名称",
        "strength": "竞品优势",
        "weakness": "竞品劣势",
        "differentiation": "差异化点"
      }
    ],
    "marketGap": "市场空白点分析"
  },
  "recommendations": {
    "techStackRecommendations": {
      "beginner": {
        "primary": "技术栈（优先国产）",
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
          "name": "活动名称（2025年实际活动）",
          "time": "举办时间",
          "location": "地点",
          "cost": "费用",
          "relevance": "与创意的相关性"
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
1. ✅ 必须提供竞品分析和市场空白点
2. ✅ 技术栈优先推荐中国本土产品（Trae.ai、腾讯云微搭、智谱AI等）
3. ✅ 线下活动必须是2025年实际存在的活动（黑客松、创业大赛等）
4. ✅ 如果是技术类创意，重点推荐黑客松和开发者活动
5. ✅ 所有推荐基于用户创意、城市和背景进行深度个性化
6. ✅ 只返回JSON，不要有markdown标记或额外说明`

    console.log(`🚀 调用${aiModel}模型进行智能分析...`)

    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的商业分析顾问和创业导师，擅长分析创意项目、识别竞品、推荐本土化工具和实时活动。你的回答必须基于用户的创意进行深入分析，提供具体、可执行、本土化的建议。'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 6000, // 增加token数以支持更详细的分析
      stream: false
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      throw new Error(`${aiModel}返回空内容`)
    }

    console.log(`✅ ${aiModel}分析完成`)

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
      console.error('原始内容:', cleanedContent.substring(0, 500))
      throw new Error('AI分析结果格式错误')
    }

    // 验证结果结构
    if (!analysisResult.characteristics || !analysisResult.recommendations) {
      throw new Error('AI分析结果缺少必要字段')
    }

    console.log('✅ 智能分析完成 (V2)', {
      category: analysisResult.characteristics.category,
      complexity: analysisResult.characteristics.technicalComplexity,
      hasCompetitors: !!analysisResult.competitorAnalysis,
      model: aiModel
    })

    return NextResponse.json({
      success: true,
      data: {
        characteristics: analysisResult.characteristics,
        competitorAnalysis: analysisResult.competitorAnalysis || null,
        recommendations: analysisResult.recommendations,
        metadata: {
          aiModel: aiModel,
          generatedAt: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('❌ 智能分析失败:', error)
    return handleApiError(error)
  }
}
