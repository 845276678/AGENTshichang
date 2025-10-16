/**
 * 想法澄清和完善系统
 *
 * 功能：
 * 1. 智能分析用户输入的抽象描述
 * 2. 生成澄清问题引导用户完善
 * 3. 提供实时的想法优化建议
 * 4. 验证系统对用户想法的理解
 */

import { AIServiceManager } from '@/lib/ai-service-manager';

export interface UserIdea {
  problemDescription?: string;
  targetUser?: string;
  existingSolutions?: string[];
  painLevel?: number;
  additionalContext?: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  type: 'open' | 'choice' | 'scale';
  priority: 'high' | 'medium' | 'low';
  category: 'problem' | 'user' | 'solution' | 'market';
  options?: string[]; // 选择题选项
  placeholder?: string; // 输入提示
  reasoning: string; // 为什么问这个问题
}

export interface IdeaAnalysis {
  clarity: number; // 1-10，想法清晰度
  feasibility: number; // 1-10，可行性评分
  market_potential: number; // 1-10，市场潜力
  strengths: string[]; // 优势
  weaknesses: string[]; // 不足之处
  missing_info: string[]; // 缺失信息
  suggestions: string[]; // 改进建议
}

export interface ClarificationSession {
  id: string;
  originalIdea: UserIdea;
  currentIdea: UserIdea;
  questions: ClarificationQuestion[];
  answers: Record<string, string>;
  analysis: IdeaAnalysis;
  clarificationRounds: number;
  isComplete: boolean;
  confidence: number; // 系统理解信心度
}

export class IdeaClarificationService {
  private aiManager: AIServiceManager;

  constructor() {
    this.aiManager = new AIServiceManager();
  }

  /**
   * 启动想法澄清流程
   */
  async startClarification(initialIdea: UserIdea): Promise<ClarificationSession> {
    // 1. 分析初始想法
    const analysis = await this.analyzeIdea(initialIdea);

    // 2. 生成澄清问题
    const questions = await this.generateClarificationQuestions(initialIdea, analysis);

    // 3. 创建澄清会话
    const session: ClarificationSession = {
      id: `clarification_${Date.now()}`,
      originalIdea: { ...initialIdea },
      currentIdea: { ...initialIdea },
      questions,
      answers: {},
      analysis,
      clarificationRounds: 0,
      isComplete: false,
      confidence: this.calculateConfidence(analysis)
    };

    return session;
  }

  /**
   * 分析用户想法
   */
  private async analyzeIdea(idea: UserIdea): Promise<IdeaAnalysis> {
    const prompt = `
请深入分析以下用户创意想法：

问题描述: ${idea.problemDescription || '未提供'}
目标用户: ${idea.targetUser || '未提供'}
现有解决方案: ${idea.existingSolutions?.join(', ') || '未提供'}
痛苦程度: ${idea.painLevel || '未提供'}/10

请从以下维度分析并返回JSON格式：
1. clarity: 想法清晰度 (1-10)
2. feasibility: 技术可行性 (1-10)
3. market_potential: 市场潜力 (1-10)
4. strengths: 优势列表
5. weaknesses: 不足列表
6. missing_info: 缺失的关键信息
7. suggestions: 具体改进建议

分析要点：
- 问题是否具体明确？
- 目标用户是否清晰？
- 是否有真实需求验证？
- 解决方案是否可行？
- 市场机会是否存在？

请返回JSON格式的分析结果。
`;

    try {
      const response = await this.aiManager.callSingleService({
        provider: 'deepseek',
        persona: 'business-analyst',
        context: {
          ideaContent: idea.problemDescription || '',
          phase: 'analysis',
          userFeedback: JSON.stringify(idea)
        },
        systemPrompt: '你是一位资深的商业分析师，擅长评估创业想法的可行性和市场潜力。',
        userPrompt: prompt,
        temperature: 0.3,
        maxTokens: 1000
      });

      try {
        return JSON.parse(response.content);
      } catch (parseError) {
        // 如果解析失败，返回默认分析
        return this.getDefaultAnalysis(idea);
      }
    } catch (error) {
      console.error('想法分析失败:', error);
      return this.getDefaultAnalysis(idea);
    }
  }

  /**
   * 生成澄清问题
   */
  private async generateClarificationQuestions(
    idea: UserIdea,
    analysis: IdeaAnalysis
  ): Promise<ClarificationQuestion[]> {
    const prompt = `
基于以下用户想法和分析结果，生成3-5个最重要的澄清问题：

用户想法:
${JSON.stringify(idea, null, 2)}

分析结果:
清晰度: ${analysis.clarity}/10
可行性: ${analysis.feasibility}/10
市场潜力: ${analysis.market_potential}/10
缺失信息: ${analysis.missing_info.join(', ')}

请生成澄清问题，帮助用户：
1. 明确核心问题定义
2. 具体化目标用户群体
3. 验证真实需求存在
4. 优化解决方案思路

每个问题应包含：
- question: 问题内容（简洁明确）
- type: 问题类型（open/choice/scale）
- priority: 重要性（high/medium/low）
- category: 分类（problem/user/solution/market）
- reasoning: 为什么问这个问题
- options: 选择题选项（如果是choice类型）
- placeholder: 输入提示（如果是open类型）

请返回JSON数组格式。
`;

    try {
      const response = await this.aiManager.callSingleService({
        provider: 'deepseek',
        persona: 'business-analyst',
        context: {
          ideaContent: idea.problemDescription || '',
          phase: 'clarification',
          userFeedback: JSON.stringify(analysis)
        },
        systemPrompt: '你是一位善于引导用户思考的商业顾问，擅长通过提问帮助用户完善想法。',
        userPrompt: prompt,
        temperature: 0.4,
        maxTokens: 1200
      });

      try {
        const questions = JSON.parse(response.content);
        return questions.map((q: any, index: number) => ({
          id: `q_${Date.now()}_${index}`,
          ...q
        }));
      } catch (parseError) {
        return this.getDefaultQuestions(analysis);
      }
    } catch (error) {
      console.error('生成澄清问题失败:', error);
      return this.getDefaultQuestions(analysis);
    }
  }

  /**
   * 处理用户回答并更新会话
   */
  async processAnswer(
    session: ClarificationSession,
    questionId: string,
    answer: string
  ): Promise<ClarificationSession> {
    // 记录答案
    session.answers[questionId] = answer;

    // 找到对应问题
    const question = session.questions.find(q => q.id === questionId);
    if (!question) return session;

    // 根据问题类别更新想法
    session.currentIdea = this.updateIdeaFromAnswer(session.currentIdea, question, answer);

    // 重新分析更新后的想法
    session.analysis = await this.analyzeIdea(session.currentIdea);
    session.confidence = this.calculateConfidence(session.analysis);

    // 检查是否需要新的澄清问题
    if (session.confidence < 0.8 && session.clarificationRounds < 3) {
      const newQuestions = await this.generateFollowUpQuestions(session, question, answer);
      session.questions.push(...newQuestions);
      session.clarificationRounds++;
    }

    // 检查是否完成澄清
    session.isComplete = this.checkClarificationComplete(session);

    return session;
  }

  /**
   * 生成后续澄清问题
   */
  private async generateFollowUpQuestions(
    session: ClarificationSession,
    lastQuestion: ClarificationQuestion,
    lastAnswer: string
  ): Promise<ClarificationQuestion[]> {
    // 基于上一个问题和答案，智能生成后续问题
    const prompt = `
用户刚回答了以下问题：
问题: ${lastQuestion.question}
回答: ${lastAnswer}

当前想法状态:
${JSON.stringify(session.currentIdea, null, 2)}

分析结果:
${JSON.stringify(session.analysis, null, 2)}

请生成1-2个后续澄清问题，进一步完善用户想法。
返回JSON数组格式，结构与之前相同。
`;

    try {
      const response = await this.aiManager.callSingleService({
        provider: 'deepseek',
        persona: 'business-analyst',
        context: {
          ideaContent: session.currentIdea.problemDescription || '',
          phase: 'follow-up',
          userFeedback: lastAnswer
        },
        systemPrompt: '你是一位善于深入挖掘的商业顾问，能够基于用户回答生成精准的后续问题。',
        userPrompt: prompt,
        temperature: 0.4,
        maxTokens: 800
      });

      try {
        const questions = JSON.parse(response.content);
        return questions.map((q: any, index: number) => ({
          id: `followup_${Date.now()}_${index}`,
          ...q
        }));
      } catch (parseError) {
        return [];
      }
    } catch (error) {
      console.error('生成后续问题失败:', error);
      return [];
    }
  }

  /**
   * 生成想法完善建议
   */
  async generateImprovementSuggestions(session: ClarificationSession): Promise<string[]> {
    const prompt = `
基于完整的澄清对话，为用户想法提供具体的完善建议：

原始想法: ${JSON.stringify(session.originalIdea, null, 2)}
当前想法: ${JSON.stringify(session.currentIdea, null, 2)}
用户回答: ${JSON.stringify(session.answers, null, 2)}

请提供5-8个具体的改进建议，帮助用户：
1. 进一步明确问题定义
2. 细化目标用户画像
3. 验证需求假设
4. 优化解决方案
5. 识别关键风险

每个建议应该：
- 具体可执行
- 针对性强
- 有助于MVP规划

请返回字符串数组格式。
`;

    try {
      const response = await this.aiManager.callSingleService({
        provider: 'deepseek',
        persona: 'business-analyst',
        context: {
          ideaContent: session.currentIdea.problemDescription || '',
          phase: 'improvement',
          userFeedback: JSON.stringify(session.answers)
        },
        systemPrompt: '你是一位资深的产品策略顾问，擅长为创业者提供可执行的改进建议。',
        userPrompt: prompt,
        temperature: 0.5,
        maxTokens: 1000
      });

      try {
        return JSON.parse(response.content);
      } catch (parseError) {
        // 从回复中提取建议
        return response.content.split('\n')
          .filter(line => line.trim().length > 10)
          .slice(0, 8);
      }
    } catch (error) {
      console.error('生成改进建议失败:', error);
      return [
        '进一步具体化目标用户的特征和需求',
        '收集更多用户验证数据',
        '明确产品的核心价值主张',
        '分析主要竞争对手的优劣势',
        '制定初步的商业模式假设'
      ];
    }
  }

  /**
   * 计算理解信心度
   */
  private calculateConfidence(analysis: IdeaAnalysis): number {
    const clarityWeight = 0.4;
    const feasibilityWeight = 0.3;
    const marketWeight = 0.3;

    const normalizedClarity = analysis.clarity / 10;
    const normalizedFeasibility = analysis.feasibility / 10;
    const normalizedMarket = analysis.market_potential / 10;

    return clarityWeight * normalizedClarity +
           feasibilityWeight * normalizedFeasibility +
           marketWeight * normalizedMarket;
  }

  /**
   * 检查澄清是否完成
   */
  private checkClarificationComplete(session: ClarificationSession): boolean {
    // 如果信心度高或回答了足够多问题
    return session.confidence >= 0.8 ||
           Object.keys(session.answers).length >= 5 ||
           session.clarificationRounds >= 3;
  }

  /**
   * 根据回答更新想法
   */
  private updateIdeaFromAnswer(
    idea: UserIdea,
    question: ClarificationQuestion,
    answer: string
  ): UserIdea {
    const updatedIdea = { ...idea };

    switch (question.category) {
      case 'problem':
        if (answer.length > 20) {
          updatedIdea.problemDescription = answer;
        } else if (updatedIdea.problemDescription) {
          updatedIdea.problemDescription += ` ${answer}`;
        }
        break;

      case 'user':
        if (answer.length > 10) {
          updatedIdea.targetUser = answer;
        }
        break;

      case 'solution':
        if (!updatedIdea.existingSolutions) {
          updatedIdea.existingSolutions = [];
        }
        updatedIdea.existingSolutions.push(answer);
        break;

      case 'market':
        updatedIdea.additionalContext = (updatedIdea.additionalContext || '') + ` ${answer}`;
        break;
    }

    return updatedIdea;
  }

  /**
   * 默认分析结果
   */
  private getDefaultAnalysis(idea: UserIdea): IdeaAnalysis {
    return {
      clarity: idea.problemDescription ? 6 : 3,
      feasibility: 5,
      market_potential: 5,
      strengths: ['有创新想法'],
      weaknesses: ['需要更多市场验证'],
      missing_info: ['目标用户画像', '竞争分析', '需求验证'],
      suggestions: ['明确目标用户群体', '分析现有解决方案', '验证真实需求']
    };
  }

  /**
   * 默认澄清问题
   */
  private getDefaultQuestions(analysis: IdeaAnalysis): ClarificationQuestion[] {
    const baseQuestions: Omit<ClarificationQuestion, 'id'>[] = [
      {
        question: '您要解决的核心问题用一句话描述是什么？',
        type: 'open',
        priority: 'high',
        category: 'problem',
        placeholder: '例如：小企业老板难以快速找到可靠的兼职员工',
        reasoning: '明确问题定义是MVP成功的关键'
      },
      {
        question: '谁会因为这个问题感到痛苦？',
        type: 'open',
        priority: 'high',
        category: 'user',
        placeholder: '例如：25-40岁的小企业主，员工少于20人',
        reasoning: '精确的用户画像决定产品方向'
      },
      {
        question: '这个问题的严重程度如何？',
        type: 'choice',
        priority: 'medium',
        category: 'problem',
        options: ['轻微困扰，偶尔遇到', '中等问题，经常困扰', '严重痛点，急需解决'],
        reasoning: '问题严重程度影响用户付费意愿'
      }
    ];

    return baseQuestions.map((q, index) => ({
      id: `default_${index}`,
      ...q
    }));
  }
}

export const ideaClarificationService = new IdeaClarificationService();