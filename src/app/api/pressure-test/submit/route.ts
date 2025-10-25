import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-helper';
import { z } from 'zod';

export const dynamic = 'force-dynamic'

const submitSchema = z.object({
  scenarioId: z.string(),
  answers: z.array(z.object({
    questionIndex: z.number(),
    answer: z.string(),
    confidence: z.number().min(0).max(100)
  })),
  completionTime: z.number() // 秒
});

interface TestAnswer {
  questionIndex: number;
  answer: string;
  confidence: number;
}

class PressureTestAnalyzer {
  static analyzeAnswers(answers: TestAnswer[], scenario: any): {
    overallScore: number;
    dimensionScores: {
      adaptability: number;
      resilience: number;
      pivotPotential: number;
      resourceEfficiency: number;
      strategicThinking: number;
    };
    recommendations: string[];
    contingencyPlans: string[];
  } {

    // 分析每个答案的质量
    const answerScores = answers.map(answer => this.scoreAnswer(answer, scenario));

    // 计算各维度得分
    const dimensionScores = {
      adaptability: this.calculateAdaptability(answers, answerScores),
      resilience: this.calculateResilience(answers, answerScores),
      pivotPotential: this.calculatePivotPotential(answers, answerScores),
      resourceEfficiency: this.calculateResourceEfficiency(answers, answerScores),
      strategicThinking: this.calculateStrategicThinking(answers, answerScores)
    };

    // 计算总分
    const overallScore = Math.round(
      (dimensionScores.adaptability +
       dimensionScores.resilience +
       dimensionScores.pivotPotential +
       dimensionScores.resourceEfficiency +
       dimensionScores.strategicThinking) / 5
    );

    // 生成建议和应急预案
    const recommendations = this.generateRecommendations(dimensionScores, scenario);
    const contingencyPlans = this.generateContingencyPlans(dimensionScores, scenario);

    return {
      overallScore,
      dimensionScores,
      recommendations,
      contingencyPlans
    };
  }

  private static scoreAnswer(answer: TestAnswer, scenario: any): number {
    let score = 40; // 基础分

    // 基于答案长度
    if (answer.answer.length > 50) score += 10;
    if (answer.answer.length > 150) score += 15;
    if (answer.answer.length > 300) score += 10;

    // 基于信心度
    const confidenceBonus = (answer.confidence - 50) * 0.2;
    score += Math.max(-10, Math.min(10, confidenceBonus));

    // 检查关键词
    const strategicWords = ['计划', '策略', '分析', '预案', '备选', '风险', '机会'];
    const tacticalWords = ['具体', '立即', '马上', '直接', '联系', '沟通'];
    const adaptiveWords = ['调整', '改变', '转向', '适应', '灵活', '创新'];

    const strategicCount = strategicWords.filter(word => answer.answer.includes(word)).length;
    const tacticalCount = tacticalWords.filter(word => answer.answer.includes(word)).length;
    const adaptiveCount = adaptiveWords.filter(word => answer.answer.includes(word)).length;

    score += strategicCount * 5;
    score += tacticalCount * 3;
    score += adaptiveCount * 4;

    return Math.min(score, 100);
  }

  private static calculateAdaptability(answers: TestAnswer[], scores: number[]): number {
    // 适应能力主要看是否提到调整、改变、学习等
    const adaptiveKeywords = ['调整', '改变', '学习', '适应', '灵活', '修改', '优化'];
    let adaptabilityScore = 0;

    answers.forEach((answer, index) => {
      const keywordCount = adaptiveKeywords.filter(word => answer.answer.includes(word)).length;
      const baseScore = scores[index];
      adaptabilityScore += (baseScore + keywordCount * 8) / answers.length;
    });

    return Math.round(Math.min(adaptabilityScore, 100));
  }

  private static calculateResilience(answers: TestAnswer[], scores: number[]): number {
    // 韧性主要看是否有坚持、突破、克服等表述
    const resilienceKeywords = ['坚持', '克服', '突破', '挑战', '坚定', '不放弃', '继续'];
    let resilienceScore = 0;

    answers.forEach((answer, index) => {
      const keywordCount = resilienceKeywords.filter(word => answer.answer.includes(word)).length;
      const baseScore = scores[index];
      const confidenceBonus = answer.confidence > 70 ? 10 : 0;
      resilienceScore += (baseScore + keywordCount * 8 + confidenceBonus) / answers.length;
    });

    return Math.round(Math.min(resilienceScore, 100));
  }

  private static calculatePivotPotential(answers: TestAnswer[], scores: number[]): number {
    // 转向潜力看是否提到备选方案、其他选择等
    const pivotKeywords = ['备选', '其他', '转向', '新的', '另一', '替代', '重新定位'];
    let pivotScore = 0;

    answers.forEach((answer, index) => {
      const keywordCount = pivotKeywords.filter(word => answer.answer.includes(word)).length;
      const baseScore = scores[index];
      pivotScore += (baseScore + keywordCount * 10) / answers.length;
    });

    return Math.round(Math.min(pivotScore, 100));
  }

  private static calculateResourceEfficiency(answers: TestAnswer[], scores: number[]): number {
    // 资源效率看是否提到成本、预算、人力等资源管理
    const resourceKeywords = ['成本', '预算', '资源', '人力', '时间', '效率', '节省', '优化'];
    let resourceScore = 0;

    answers.forEach((answer, index) => {
      const keywordCount = resourceKeywords.filter(word => answer.answer.includes(word)).length;
      const baseScore = scores[index];
      resourceScore += (baseScore + keywordCount * 6) / answers.length;
    });

    return Math.round(Math.min(resourceScore, 100));
  }

  private static calculateStrategicThinking(answers: TestAnswer[], scores: number[]): number {
    // 战略思维看是否有长远规划、系统性思考
    const strategicKeywords = ['长期', '战略', '系统', '整体', '规划', '布局', '前瞻'];
    let strategicScore = 0;

    answers.forEach((answer, index) => {
      const keywordCount = strategicKeywords.filter(word => answer.answer.includes(word)).length;
      const baseScore = scores[index];
      const lengthBonus = answer.answer.length > 200 ? 10 : 0;
      strategicScore += (baseScore + keywordCount * 8 + lengthBonus) / answers.length;
    });

    return Math.round(Math.min(strategicScore, 100));
  }

  private static generateRecommendations(scores: any, scenario: any): string[] {
    const recommendations = [];

    if (scores.adaptability < 60) {
      recommendations.push('提升适应能力：定期收集市场反馈，建立快速调整机制');
    }

    if (scores.resilience < 60) {
      recommendations.push('增强抗压韧性：制定心理建设计划，培养团队凝聚力');
    }

    if (scores.pivotPotential < 60) {
      recommendations.push('提高转向能力：预设多个商业模式，保持战略灵活性');
    }

    if (scores.resourceEfficiency < 60) {
      recommendations.push('优化资源配置：建立成本控制体系，提高资源利用率');
    }

    if (scores.strategicThinking < 60) {
      recommendations.push('加强战略思维：定期进行SWOT分析，建立长期规划视角');
    }

    // 基于场景类型的特定建议
    switch (scenario.type) {
      case 'FUNDING':
        recommendations.push('多元化融资渠道：不要依赖单一资金来源');
        break;
      case 'COMPETITION':
        recommendations.push('建立差异化优势：专注核心竞争力的打造');
        break;
      case 'MARKET':
        recommendations.push('深入了解用户需求：建立用户反馈快速响应机制');
        break;
    }

    return recommendations.slice(0, 5); // 最多5条建议
  }

  private static generateContingencyPlans(scores: any, scenario: any): string[] {
    const plans = [];

    // 基础应急预案
    plans.push('建立3个月的运营资金储备');
    plans.push('制定核心团队保留计划');
    plans.push('识别并维护关键合作伙伴关系');

    // 基于薄弱环节的应急预案
    if (scores.adaptability < 70) {
      plans.push('建立快速决策流程，确保72小时内响应重大变化');
    }

    if (scores.resourceEfficiency < 70) {
      plans.push('制定成本削减清单，分3个等级逐步实施');
    }

    // 基于场景的应急预案
    switch (scenario.type) {
      case 'FUNDING':
        plans.push('准备至少3套融资方案，包括债权和股权选择');
        break;
      case 'COMPETITION':
        plans.push('制定价格战应对策略，确保利润底线');
        break;
      case 'MARKET':
        plans.push('准备市场收缩时的产品线精简方案');
        break;
    }

    return plans.slice(0, 6); // 最多6条应急预案
  }
}

// 提交压力测试结果
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = submitSchema.parse(body);

    // 获取场景信息
    const scenario = await prisma.pressureTestScenario.findUnique({
      where: { id: validatedData.scenarioId }
    });

    if (!scenario) {
      return NextResponse.json({ error: '场景不存在' }, { status: 404 });
    }

    // 分析答案并生成结果
    const analysisResult = PressureTestAnalyzer.analyzeAnswers(
      validatedData.answers,
      scenario
    );

    // 保存测试结果
    const testResult = await prisma.pressureTestResult.create({
      data: {
        scenarioId: validatedData.scenarioId,
        userId: user.id,
        answers: validatedData.answers,
        overallScore: analysisResult.overallScore,
        dimensionScores: analysisResult.dimensionScores,
        recommendations: analysisResult.recommendations,
        contingencyPlans: analysisResult.contingencyPlans,
        completionTime: validatedData.completionTime
      }
    });

    // 更新场景使用统计
    await prisma.pressureTestScenario.update({
      where: { id: validatedData.scenarioId },
      data: {
        usageCount: { increment: 1 },
        averageScore: {
          set: await calculateNewAverageScore(validatedData.scenarioId, analysisResult.overallScore)
        }
      }
    });

    return NextResponse.json({
      success: true,
      result: analysisResult,
      testId: testResult.id
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('提交压力测试失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 计算新的平均分
async function calculateNewAverageScore(scenarioId: string, newScore: number): Promise<number> {
  const results = await prisma.pressureTestResult.findMany({
    where: { scenarioId },
    select: { overallScore: true }
  });

  if (results.length === 0) return newScore;

  const totalScore = results.reduce((sum, result) => sum + result.overallScore, 0);
  return Math.round(totalScore / results.length);
}