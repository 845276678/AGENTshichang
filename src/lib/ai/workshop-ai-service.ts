/**
 * 工作坊专用AI服务
 *
 * 简化版本，专门为工作坊功能设计，避免复杂依赖
 */

// 基础AI请求接口
export interface WorkshopAIRequest {
  prompt: string
  systemPrompt?: string
  context?: Record<string, any>
  temperature?: number
  maxTokens?: number
}

// AI回复接口
export interface WorkshopAIResponse {
  content: string
  confidence?: number
  suggestions?: string[]
  metadata?: Record<string, any>
}

/**
 * 工作坊AI服务基类
 */
export abstract class BaseWorkshopAIService {
  abstract generateResponse(request: WorkshopAIRequest): Promise<WorkshopAIResponse>

  // 通用的回退响应生成
  protected generateFallbackResponse(prompt: string, context?: Record<string, any>): WorkshopAIResponse {
    // 基于关键词的简单响应模式
    const keywords = {
      customer: ['目标客户', '客户群体', '用户画像'],
      problem: ['问题', '痛点', '需求', '困难'],
      solution: ['解决方案', '产品', '功能', '价值'],
      validation: ['验证', '测试', '实验', '调研'],
      business: ['商业', '盈利', '收入', '模式']
    }

    let category = 'general'
    let matchCount = 0

    // 找出最匹配的类别
    for (const [key, terms] of Object.entries(keywords)) {
      const matches = terms.filter(term => prompt.includes(term)).length
      if (matches > matchCount) {
        matchCount = matches
        category = key
      }
    }

    const responses = {
      customer: {
        content: `关于目标客户定义，建议从以下维度深入分析：

• **基本特征**: 年龄、性别、职业、收入水平、地理位置
• **行为特征**: 购买习惯、使用偏好、决策过程
• **需求痛点**: 当前面临的主要问题和挑战
• **价值认知**: 愿意为解决方案付费的金额范围

这样的细分有助于制定更精准的验证策略。`,
        suggestions: [
          '创建详细的用户画像',
          '分析客户决策流程',
          '评估客户支付能力',
          '确定优先接触的客户群体'
        ]
      },
      problem: {
        content: `问题分析需要关注以下关键要素：

• **问题本质**: 问题的根本原因是什么？
• **影响程度**: 问题给客户造成多大损失？
• **发生频率**: 问题出现的频次和规律性
• **现有方案**: 客户目前如何处理这个问题？
• **解决紧迫性**: 客户解决问题的急迫程度

深入理解问题本质是成功验证的基础。`,
        suggestions: [
          '量化问题带来的损失',
          '分析问题发生的场景',
          '调研现有解决方案的不足',
          '评估问题的普遍性'
        ]
      },
      solution: {
        content: `解决方案设计要考虑：

• **核心价值**: 解决方案的独特价值主张
• **功能设计**: 核心功能与辅助功能的优先级
• **实现可行性**: 技术和资源实现的难度
• **成本效益**: 开发成本与预期收益的平衡
• **差异化优势**: 相比竞争对手的核心优势

确保解决方案真正解决客户的核心问题。`,
        suggestions: [
          '明确核心价值主张',
          '设计MVP功能清单',
          '分析技术实现难度',
          '评估竞争优势'
        ]
      },
      validation: {
        content: `需求验证方法建议：

• **用户访谈**: 深度了解客户需求和痛点
• **问卷调研**: 大规模收集客户反馈数据
• **MVP测试**: 用最小可行产品验证核心假设
• **竞品分析**: 研究市场现有解决方案
• **数据分析**: 通过数据验证市场趋势

选择最适合当前阶段的验证方法。`,
        suggestions: [
          '设计用户访谈大纲',
          '制作MVP原型',
          '设计A/B测试方案',
          '分析竞品优劣势'
        ]
      },
      business: {
        content: `商业模式要素分析：

• **价值主张**: 为客户创造的独特价值
• **收入来源**: 主要和次要收入渠道
• **成本结构**: 固定成本和变动成本分析
• **客户关系**: 获客、留存和增长策略
• **核心资源**: 关键资源和能力要求

构建可持续的商业闭环。`,
        suggestions: [
          '设计收入模型',
          '分析成本结构',
          '制定获客策略',
          '评估盈利能力'
        ]
      },
      general: {
        content: `基于你的描述，建议从以下维度进行系统思考：

• **目标明确**: 清晰定义要达成的目标
• **现状分析**: 深入了解当前的情况和挑战
• **方案设计**: 制定具体可行的解决方案
• **风险评估**: 识别可能遇到的风险和挑战
• **行动计划**: 制定分步实施的执行计划

系统性思考有助于提高成功概率。`,
        suggestions: [
          '明确具体目标',
          '分析当前现状',
          '设计解决方案',
          '制定行动计划'
        ]
      }
    }

    const response = responses[category as keyof typeof responses] || responses.general

    return {
      content: response.content,
      confidence: matchCount > 0 ? 0.7 : 0.5,
      suggestions: response.suggestions,
      metadata: {
        category,
        matchedTerms: matchCount,
        responseType: 'fallback'
      }
    }
  }
}

/**
 * 规则基础的AI服务实现
 * 使用预定义规则和模板生成回复
 */
export class RuleBasedWorkshopAIService extends BaseWorkshopAIService {
  async generateResponse(request: WorkshopAIRequest): Promise<WorkshopAIResponse> {
    // 简单延迟模拟AI思考时间
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    try {
      // 使用回退响应生成逻辑
      const response = this.generateFallbackResponse(request.prompt, request.context)

      // 如果有系统提示，尝试融合系统提示的上下文
      if (request.systemPrompt) {
        response.metadata = {
          ...response.metadata,
          systemPrompt: request.systemPrompt,
          enhanced: true
        }
      }

      return response
    } catch (error) {
      console.error('AI服务生成回复失败:', error)

      return {
        content: '抱歉，AI助手暂时遇到了一些问题。建议你继续填写表单，我会稍后为你提供更好的建议。',
        confidence: 0.1,
        suggestions: ['继续填写表单', '稍后重试AI建议'],
        metadata: {
          error: true,
          errorType: 'generation_failed'
        }
      }
    }
  }
}

// 导出默认服务实例
export const workshopAIService = new RuleBasedWorkshopAIService()

// 工厂函数，用于创建不同类型的AI服务
export function createWorkshopAIService(type: 'rule-based' | 'api-based' = 'rule-based'): BaseWorkshopAIService {
  switch (type) {
    case 'rule-based':
      return new RuleBasedWorkshopAIService()
    case 'api-based':
      // 将来可以扩展API版本
      return new RuleBasedWorkshopAIService()
    default:
      return new RuleBasedWorkshopAIService()
  }
}