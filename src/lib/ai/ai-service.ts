/**
 * 简化的AI服务接口
 *
 * 专门为工作坊澄清功能提供AI调用服务
 */

export interface AIGenerateRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface AIGenerateResponse {
  content: string
  tokensUsed?: number
  provider?: string
}

class SimpleAIService {
  async generateResponse(request: AIGenerateRequest): Promise<string> {
    try {
      // 暂时使用模拟响应，避免复杂的依赖
      return this.getFallbackResponse(request.prompt)
    } catch (error) {
      console.error('AI服务调用失败:', error)
      return this.getFallbackResponse(request.prompt)
    }
  }

  private getFallbackResponse(prompt: string): string {
    // 简单的规则匹配生成回复
    if (prompt.includes('目标客户') || prompt.includes('客户群体')) {
      return `基于你的描述，建议更具体地定义目标客户：

1. 明确客户的基本特征（年龄、职业、收入水平）
2. 分析客户的具体需求和痛点
3. 确定客户的行为模式和偏好
4. 评估客户的支付能力和意愿

这样能帮助你更精准地验证需求假设。`
    }

    if (prompt.includes('问题') || prompt.includes('痛点')) {
      return `关于问题描述，建议从以下角度完善：

1. 问题的具体表现和影响程度
2. 问题发生的频率和场景
3. 现有解决方案的不足之处
4. 问题给用户造成的具体损失

这将帮助你更好地验证问题的真实性和严重性。`
    }

    if (prompt.includes('解决方案') || prompt.includes('价值')) {
      return `关于解决方案价值，建议考虑：

1. 解决方案的独特优势和差异化价值
2. 与现有方案的对比分析
3. 客户愿意支付的价格范围
4. 解决方案的可操作性和实用性

这有助于验证价值主张的有效性。`
    }

    return `感谢你的描述。为了更好地帮助你完善假设，建议考虑以下几个方面：

1. 具体化描述：避免模糊的表达，用具体的例子说明
2. 量化指标：尽可能用数字和数据支撑你的观点
3. 验证方法：思考如何用最低成本验证这些假设
4. 风险评估：考虑假设可能错误的情况和应对方案

继续完善这些细节将大大提高需求验证的效果。`
  }
}

// 导出单例服务
export const aiService = new SimpleAIService()