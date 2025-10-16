/**
 * 需求验证假设澄清服务
 *
 * 针对需求验证工作坊的专门AI澄清系统：
 * 1. 目标客户假设澄清
 * 2. 问题场景明确化
 * 3. 价值主张验证
 * 4. 验证方案优化
 */

import { type DemandValidationForm } from './form-schemas'

// 简化的AI服务接口（内联版本）
interface AIServiceInterface {
  generateResponse(request: { prompt: string; systemPrompt?: string }): Promise<string>
}

const simpleAIService: AIServiceInterface = {
  async generateResponse(request: { prompt: string; systemPrompt?: string }): Promise<string> {
    // 简单的规则匹配生成回复
    const prompt = request.prompt

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

// 需求验证假设类型
export interface DemandValidationAssumption {
  targetCustomer?: string
  customerPainPoint?: string
  problemScenario?: string
  solutionValue?: string
  validationMethod?: string
  successMetrics?: string
  customerInteractionLevel?: number
  problemUrgency?: number
}

// 假设分析结果
export interface AssumptionAnalysis {
  clarity: number // 1-10
  specificity: number // 1-10
  measurability: number // 1-10
  assumptions_to_validate: string[]
  missing_info: string[]
  unclear_areas: string[]
  suggestions: string[]
  recommended_questions: string[]
  validation_methods: string[]
}

// 澄清会话
export interface DemandClarificationSession {
  id: string
  assumption: DemandValidationAssumption
  analysis: AssumptionAnalysis
  confidence: number // 0-1
  conversation: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  refined_assumption: DemandValidationAssumption
  status: 'analyzing' | 'clarifying' | 'completed'
  created_at: Date
  updated_at: Date
}

// 需求验证澄清服务类
class DemandValidationClarificationService {
  private sessions = new Map<string, DemandClarificationSession>()

  // 开始假设澄清
  async startClarification(assumption: DemandValidationAssumption): Promise<DemandClarificationSession> {
    const sessionId = `demand-clarification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    try {
      // 分析当前假设
      const analysis = await this.analyzeAssumption(assumption)
      const confidence = this.calculateConfidence(analysis)

      const session: DemandClarificationSession = {
        id: sessionId,
        assumption,
        analysis,
        confidence,
        conversation: [],
        refined_assumption: { ...assumption },
        status: confidence > 0.7 ? 'completed' : 'analyzing',
        created_at: new Date(),
        updated_at: new Date()
      }

      this.sessions.set(sessionId, session)
      console.log(`🎯 需求验证澄清会话开始:`, sessionId, `置信度: ${Math.round(confidence * 100)}%`)

      return session
    } catch (error) {
      console.error('❌ 创建澄清会话失败:', error)
      throw new Error('无法开始假设澄清')
    }
  }

  // 分析假设质量
  private async analyzeAssumption(assumption: DemandValidationAssumption): Promise<AssumptionAnalysis> {
    const prompt = `
作为需求验证专家，请分析以下客户需求假设的质量：

目标客户: ${assumption.targetCustomer || '未定义'}
客户痛点: ${assumption.customerPainPoint || '未定义'}
问题场景: ${assumption.problemScenario || '未定义'}
解决方案价值: ${assumption.solutionValue || '未定义'}
验证方法: ${assumption.validationMethod || '未定义'}
成功指标: ${assumption.successMetrics || '未定义'}

请评估：
1. 假设的清晰度 (1-10分)
2. 具体性 (1-10分)
3. 可测量性 (1-10分)
4. 需要验证的关键假设
5. 缺失的重要信息
6. 不清楚的领域
7. 改进建议
8. 推荐澄清问题
9. 建议的验证方法

请以JSON格式返回分析结果。
`

    try {
      const response = await simpleAIService.generateResponse({
        prompt,
        systemPrompt: `你是专业的需求验证顾问。专注于帮助创业者明确和验证他们的客户需求假设。你的回答应该具体、可执行，帮助用户制定清晰的验证计划。`,
        temperature: 0.7,
        maxTokens: 2000
      })

      // 解析AI回复
      const analysisMatch = response.match(/\{[\s\S]*\}/)
      if (analysisMatch) {
        const analysis = JSON.parse(analysisMatch[0])
        return {
          clarity: analysis.clarity || 5,
          specificity: analysis.specificity || 5,
          measurability: analysis.measurability || 5,
          assumptions_to_validate: analysis.assumptions_to_validate || [],
          missing_info: analysis.missing_info || [],
          unclear_areas: analysis.unclear_areas || [],
          suggestions: analysis.suggestions || [],
          recommended_questions: analysis.recommended_questions || [],
          validation_methods: analysis.validation_methods || []
        }
      }

      // 如果解析失败，返回基础分析
      return this.generateBasicAnalysis(assumption)
    } catch (error) {
      console.error('❌ 假设分析失败:', error)
      return this.generateBasicAnalysis(assumption)
    }
  }

  // 生成基础分析（备用方案）
  private generateBasicAnalysis(assumption: DemandValidationAssumption): AssumptionAnalysis {
    const hasTargetCustomer = !!assumption.targetCustomer && assumption.targetCustomer.length > 10
    const hasPainPoint = !!assumption.customerPainPoint && assumption.customerPainPoint.length > 20
    const hasScenario = !!assumption.problemScenario && assumption.problemScenario.length > 30
    const hasValue = !!assumption.solutionValue && assumption.solutionValue.length > 20

    const clarity = (hasTargetCustomer ? 3 : 1) + (hasPainPoint ? 3 : 1) + (hasScenario ? 2 : 1) + (hasValue ? 2 : 1)
    const specificity = hasTargetCustomer && hasPainPoint ? Math.min(8, clarity) : Math.min(5, clarity)
    const measurability = assumption.successMetrics ? Math.min(8, clarity) : Math.min(4, clarity)

    const missing_info = []
    if (!hasTargetCustomer) missing_info.push('目标客户定义过于模糊')
    if (!hasPainPoint) missing_info.push('客户痛点描述不够具体')
    if (!hasScenario) missing_info.push('问题场景需要更详细说明')
    if (!hasValue) missing_info.push('解决方案价值不明确')

    return {
      clarity,
      specificity,
      measurability,
      assumptions_to_validate: [
        '目标客户真实存在且可触达',
        '客户痛点足够强烈',
        '当前解决方案不够好',
        '客户愿意为解决方案付费'
      ],
      missing_info,
      unclear_areas: missing_info,
      suggestions: [
        '明确目标客户的具体特征和行为',
        '描述客户当前如何处理这个问题',
        '量化痛点的严重程度和频率',
        '定义可衡量的成功指标'
      ],
      recommended_questions: [
        '你的目标客户是谁？他们有什么共同特征？',
        '他们现在如何解决这个问题？',
        '这个问题给他们造成了什么损失？',
        '他们会为解决这个问题付多少钱？'
      ],
      validation_methods: [
        '客户访谈',
        '问卷调研',
        'MVP测试',
        '竞品分析',
        '数据分析'
      ]
    }
  }

  // 计算置信度
  private calculateConfidence(analysis: AssumptionAnalysis): number {
    const clarityWeight = 0.3
    const specificityWeight = 0.3
    const measurabilityWeight = 0.2
    const completenessWeight = 0.2

    const clarityScore = analysis.clarity / 10
    const specificityScore = analysis.specificity / 10
    const measurabilityScore = analysis.measurability / 10
    const completenessScore = Math.max(0, 1 - (analysis.missing_info.length * 0.2))

    const confidence = (
      clarityScore * clarityWeight +
      specificityScore * specificityWeight +
      measurabilityScore * measurabilityWeight +
      completenessScore * completenessWeight
    )

    return Math.min(1, Math.max(0, confidence))
  }

  // 发送澄清消息
  async sendClarificationMessage(
    sessionId: string,
    userMessage: string
  ): Promise<{ response: string; updated_assumption: DemandValidationAssumption }> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('澄清会话不存在')
    }

    try {
      // 添加用户消息
      session.conversation.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      })

      // 生成AI回复
      const conversationContext = session.conversation
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      const prompt = `
你是专业的需求验证顾问，正在帮助用户澄清他们的客户需求假设。

原始假设：
目标客户: ${session.assumption.targetCustomer || '未定义'}
客户痛点: ${session.assumption.customerPainPoint || '未定义'}
问题场景: ${session.assumption.problemScenario || '未定义'}
解决方案价值: ${session.assumption.solutionValue || '未定义'}

之前的对话：
${conversationContext}

当前分析结果显示需要澄清：
${session.analysis.missing_info.join(', ')}

用户刚刚说：${userMessage}

请：
1. 针对用户的回复给出专业建议
2. 如果信息已经足够清晰，帮助完善假设描述
3. 如果还需要更多信息，问1-2个关键问题
4. 保持对话自然、有帮助

请先给出你的回复，然后用JSON格式提供更新后的假设：
{
  "targetCustomer": "更新后的目标客户描述",
  "customerPainPoint": "更新后的痛点描述",
  "problemScenario": "更新后的场景描述",
  "solutionValue": "更新后的价值描述"
}
`

      const response = await simpleAIService.generateResponse({
        prompt,
        systemPrompt: '你是需求验证专家，帮助创业者明确客户需求假设。回答要具体、实用，避免空泛的建议。',
        temperature: 0.8,
        maxTokens: 1500
      })

      // 解析更新后的假设
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      let updated_assumption = { ...session.refined_assumption }

      if (jsonMatch) {
        try {
          const updates = JSON.parse(jsonMatch[0])
          updated_assumption = {
            ...updated_assumption,
            ...updates
          }
        } catch (e) {
          console.warn('解析更新假设失败，使用原假设')
        }
      }

      // 提取回复内容（移除JSON部分）
      const aiResponse = response.replace(/\{[\s\S]*\}/, '').trim()

      // 更新会话
      session.conversation.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      })
      session.refined_assumption = updated_assumption
      session.updated_at = new Date()

      // 重新评估是否需要继续澄清
      const updatedAnalysis = await this.analyzeAssumption(updated_assumption)
      const newConfidence = this.calculateConfidence(updatedAnalysis)

      session.analysis = updatedAnalysis
      session.confidence = newConfidence

      if (newConfidence > 0.75) {
        session.status = 'completed'
      } else {
        session.status = 'clarifying'
      }

      return {
        response: aiResponse,
        updated_assumption
      }
    } catch (error) {
      console.error('❌ 澄清消息处理失败:', error)
      throw new Error('无法处理澄清消息')
    }
  }

  // 获取会话
  getSession(sessionId: string): DemandClarificationSession | undefined {
    return this.sessions.get(sessionId)
  }

  // 获取完成的假设
  getCompletedAssumption(sessionId: string): DemandValidationAssumption | null {
    const session = this.sessions.get(sessionId)
    return session?.status === 'completed' ? session.refined_assumption : null
  }

  // 将澄清结果转换为表单数据
  convertToFormData(
    sessionId: string,
    existingFormData: Partial<DemandValidationForm> = {}
  ): Partial<DemandValidationForm> {
    const assumption = this.getCompletedAssumption(sessionId)
    if (!assumption) return existingFormData

    return {
      ...existingFormData,
      customerDefinition: {
        ...existingFormData.customerDefinition,
        targetCustomerProfile: assumption.targetCustomer || existingFormData.customerDefinition?.targetCustomerProfile || '',
        customerPainPoints: assumption.customerPainPoint || existingFormData.customerDefinition?.customerPainPoints || '',
        interactionFrequency: assumption.customerInteractionLevel || existingFormData.customerDefinition?.interactionFrequency || 5
      },
      scenarioDescription: {
        ...existingFormData.scenarioDescription,
        problemScenario: assumption.problemScenario || existingFormData.scenarioDescription?.problemScenario || '',
        currentSolution: existingFormData.scenarioDescription?.currentSolution || '',
        problemFrequency: assumption.problemUrgency || existingFormData.scenarioDescription?.problemFrequency || 5
      },
      valueValidation: {
        ...existingFormData.valueValidation,
        proposedSolution: assumption.solutionValue || existingFormData.valueValidation?.proposedSolution || '',
        expectedBenefits: existingFormData.valueValidation?.expectedBenefits || '',
        successMetrics: assumption.successMetrics || existingFormData.valueValidation?.successMetrics || ''
      },
      validationPlan: {
        ...existingFormData.validationPlan,
        validationMethods: assumption.validationMethod || existingFormData.validationPlan?.validationMethods || '',
        timeline: existingFormData.validationPlan?.timeline || '',
        budget: existingFormData.validationPlan?.budget || 0
      }
    }
  }
}

// 导出单例服务
export const demandValidationClarificationService = new DemandValidationClarificationService()