/**
 * DeepSeek API Client
 * 用于调用DeepSeek API生成功能性MVP原型
 */

import OpenAI from 'openai'

// 创建DeepSeek客户端（使用OpenAI SDK，因为DeepSeek兼容OpenAI API格式）
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
})

export interface GenerateMVPRequest {
  ideaDescription: string
  ideaTitle: string
  targetUsers: string[]
  coreFeatures: string[]
  industryType: string
  designPreferences?: {
    colorScheme?: 'blue' | 'green' | 'purple' | 'orange'
    style?: 'modern' | 'minimalist' | 'corporate' | 'creative'
  }
}

export interface ModifyMVPRequest extends GenerateMVPRequest {
  previousHtmlCode: string
  modificationRequest: string
}

export interface DesignAdjustmentRequest extends GenerateMVPRequest {
  previousHtmlCode: string
  designAdjustmentRequest: string
}

/**
 * 生成功能性MVP原型HTML代码
 */
export async function generateFunctionalMVP(request: GenerateMVPRequest): Promise<string> {
  console.log('🚀 调用DeepSeek API生成功能性MVP原型')

  const prompt = buildMVPGenerationPrompt(request)

  try {
    const completion = await deepseek.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的前端开发工程师和产品设计师。你的任务是根据用户的创意描述，生成一个功能完整的HTML原型（MVP）。

**重要要求：**
1. 必须生成**功能性代码**，不是静态的展示页面
2. 根据核心功能生成**真实可交互的模块**（如：聊天界面、表单、数据展示等）
3. 使用Tailwind CSS（通过CDN）进行样式设计
4. 包含完整的JavaScript代码实现核心功能逻辑
5. 代码必须是完整的、可以直接在浏览器中运行的HTML文件
6. 所有文本内容必须使用中文
7. 添加必要的交互提示和用户反馈

**输出格式：**
只返回完整的HTML代码，不要有任何额外说明或markdown代码块标记。从<!DOCTYPE html>开始，到</html>结束。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 8000,
      stream: false
    })

    const htmlCode = completion.choices[0]?.message?.content || ''

    if (!htmlCode.trim()) {
      throw new Error('DeepSeek API返回了空的HTML代码')
    }

    // 清理可能的markdown代码块标记
    let cleanedHtml = htmlCode.trim()
    if (cleanedHtml.startsWith('```html')) {
      cleanedHtml = cleanedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '')
    } else if (cleanedHtml.startsWith('```')) {
      cleanedHtml = cleanedHtml.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    console.log('✅ DeepSeek API成功生成MVP原型，代码长度:', cleanedHtml.length)
    return cleanedHtml

  } catch (error: any) {
    console.error('❌ DeepSeek API调用失败:', error)
    throw new Error(`DeepSeek API调用失败: ${error.message}`)
  }
}

/**
 * 修改现有MVP原型
 */
export async function modifyFunctionalMVP(request: ModifyMVPRequest): Promise<string> {
  console.log('🔧 调用DeepSeek API修改MVP原型')

  const prompt = buildMVPModificationPrompt(request)

  try {
    const completion = await deepseek.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的前端开发工程师。你的任务是根据用户的修改要求，精确修改现有的HTML原型代码。

**重要要求：**
1. 仔细分析用户的修改要求，理解他们想要改变什么
2. 在原有HTML代码的基础上进行修改，保持代码结构完整
3. 如果要添加功能，生成真实可用的交互代码
4. 如果要修改内容，准确替换目标内容
5. 保持代码的可读性和一致性
6. 所有文本内容必须使用中文

**输出格式：**
只返回修改后的完整HTML代码，不要有任何额外说明或markdown代码块标记。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 8000,
      stream: false
    })

    const htmlCode = completion.choices[0]?.message?.content || ''

    if (!htmlCode.trim()) {
      throw new Error('DeepSeek API返回了空的HTML代码')
    }

    // 清理可能的markdown代码块标记
    let cleanedHtml = htmlCode.trim()
    if (cleanedHtml.startsWith('```html')) {
      cleanedHtml = cleanedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '')
    } else if (cleanedHtml.startsWith('```')) {
      cleanedHtml = cleanedHtml.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    console.log('✅ DeepSeek API成功修改MVP原型，代码长度:', cleanedHtml.length)
    return cleanedHtml

  } catch (error: any) {
    console.error('❌ DeepSeek API调用失败:', error)
    throw new Error(`DeepSeek API调用失败: ${error.message}`)
  }
}

/**
 * 调整MVP设计风格
 */
export async function adjustMVPDesign(request: DesignAdjustmentRequest): Promise<string> {
  console.log('🎨 调用DeepSeek API调整MVP设计')

  const prompt = buildDesignAdjustmentPrompt(request)

  try {
    const completion = await deepseek.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的UI/UX设计师和前端开发工程师。你的任务是根据用户的设计调整要求，修改HTML原型的视觉样式和设计风格。

**重要要求：**
1. 仔细分析用户的设计调整要求（颜色、字体、布局、风格等）
2. 只修改CSS样式和设计相关的代码，**保持功能完整不变**
3. 使用Tailwind CSS类进行样式调整
4. 确保修改后的设计符合用户要求
5. 保持代码的可读性
6. 所有文本内容保持中文

**输出格式：**
只返回调整后的完整HTML代码，不要有任何额外说明或markdown代码块标记。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 8000,
      stream: false
    })

    const htmlCode = completion.choices[0]?.message?.content || ''

    if (!htmlCode.trim()) {
      throw new Error('DeepSeek API返回了空的HTML代码')
    }

    // 清理可能的markdown代码块标记
    let cleanedHtml = htmlCode.trim()
    if (cleanedHtml.startsWith('```html')) {
      cleanedHtml = cleanedHtml.replace(/^```html\n?/, '').replace(/\n?```$/, '')
    } else if (cleanedHtml.startsWith('```')) {
      cleanedHtml = cleanedHtml.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    console.log('✅ DeepSeek API成功调整MVP设计，代码长度:', cleanedHtml.length)
    return cleanedHtml

  } catch (error: any) {
    console.error('❌ DeepSeek API调用失败:', error)
    throw new Error(`DeepSeek API调用失败: ${error.message}`)
  }
}

/**
 * 构建MVP生成提示词
 */
function buildMVPGenerationPrompt(request: GenerateMVPRequest): string {
  const { ideaTitle, ideaDescription, targetUsers, coreFeatures, industryType, designPreferences } = request

  const colorSchemes = {
    blue: { primary: '#3B82F6', secondary: '#8B5CF6' },
    green: { primary: '#10B981', secondary: '#059669' },
    purple: { primary: '#8B5CF6', secondary: '#7C3AED' },
    orange: { primary: '#F97316', secondary: '#EA580C' }
  }

  const colors = colorSchemes[designPreferences?.colorScheme || 'blue']

  return `请生成一个功能性的HTML MVP原型，要求如下：

**创意信息：**
- 标题：${ideaTitle}
- 描述：${ideaDescription}
- 目标用户：${targetUsers.join('、')}
- 行业类型：${industryType}

**核心功能（必须实现为可交互的真实功能）：**
${coreFeatures.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

**设计要求：**
- 配色方案：主色 ${colors.primary}，辅色 ${colors.secondary}
- 设计风格：${designPreferences?.style || '现代简约'}
- 使用Tailwind CSS通过CDN引入

**功能实现要求：**
针对每个核心功能，你需要生成真实可用的交互组件：

1. 如果有"聊天"、"答疑"、"咨询"类功能 → 生成聊天界面（消息列表 + 输入框 + 发送按钮）
2. 如果有"表单"、"注册"、"提交"类功能 → 生成完整的表单（输入框 + 验证 + 提交）
3. 如果有"搜索"、"查询"类功能 → 生成搜索框和结果展示
4. 如果有"数据"、"统计"、"分析"类功能 → 生成图表或数据展示组件
5. 如果有"购物"、"商城"类功能 → 生成产品列表和购物车
6. 如果有"日历"、"规划"类功能 → 生成日历组件
7. 如果有"上传"、"文件"类功能 → 生成文件上传界面

**页面结构建议：**
1. 顶部导航栏（包含产品名称和核心导航）
2. 英雄区块（简短介绍产品价值）
3. 功能展示区（每个核心功能一个可交互的模块）
4. 底部信息栏

**JavaScript要求：**
- 必须包含完整的功能逻辑代码
- 使用真实的事件监听和DOM操作
- 添加用户交互反馈（成功/失败提示）
- 模拟后端响应（使用setTimeout等）
- 数据使用本地存储（localStorage）或内存存储

请直接输出完整的HTML代码，确保可以在浏览器中直接运行并体验所有功能。`
}

/**
 * 构建MVP修改提示词
 */
function buildMVPModificationPrompt(request: ModifyMVPRequest): string {
  const { modificationRequest, previousHtmlCode, ideaTitle, coreFeatures } = request

  return `请根据用户的修改要求，修改现有的MVP原型HTML代码。

**原始MVP信息：**
- 标题：${ideaTitle}
- 核心功能：${coreFeatures.join('、')}

**用户的修改要求：**
${modificationRequest}

**现有HTML代码：**
\`\`\`html
${previousHtmlCode}
\`\`\`

**修改指南：**
1. 仔细分析用户想要修改什么（添加、删除、修改功能或内容）
2. 如果是添加功能，生成真实可交互的代码
3. 如果是修改文本，准确定位并替换
4. 如果是删除功能，完整移除相关代码
5. 保持代码结构完整，所有功能正常工作

请直接输出修改后的完整HTML代码。`
}

/**
 * 构建设计调整提示词
 */
function buildDesignAdjustmentPrompt(request: DesignAdjustmentRequest): string {
  const { designAdjustmentRequest, previousHtmlCode, ideaTitle } = request

  return `请根据用户的设计调整要求，修改MVP原型的视觉样式。

**MVP标题：** ${ideaTitle}

**用户的设计调整要求：**
${designAdjustmentRequest}

**现有HTML代码：**
\`\`\`html
${previousHtmlCode}
\`\`\`

**调整指南：**
1. 分析用户的设计要求（颜色、字体大小、布局、圆角、间距、阴影等）
2. 使用Tailwind CSS类进行样式调整
3. **重要：只修改样式，不要改变任何功能代码**
4. 保持代码结构完整
5. 确保调整后的设计美观且符合要求

请直接输出调整后的完整HTML代码。`
}

/**
 * 检查DeepSeek API配置是否正确
 */
export function checkDeepSeekConfig(): { isConfigured: boolean; error?: string } {
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'your_deepseek_api_key') {
    return {
      isConfigured: false,
      error: 'DeepSeek API Key未配置或配置不正确，请在.env文件中设置DEEPSEEK_API_KEY'
    }
  }

  return { isConfigured: true }
}
