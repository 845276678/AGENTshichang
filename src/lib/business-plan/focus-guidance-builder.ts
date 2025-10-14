// 低分创意聚焦引导生成器
// Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md v4.1 (Lines 735-935)

import type {
  MaturityScoreResult,
  DimensionScores
} from '@/types/maturity-score';

/**
 * 引导建议结构
 */
export interface FocusGuidance {
  title: string;
  summary: string;
  scoreOverview: {
    totalScore: number;
    level: string;
    confidence: number;
    radarChart: DimensionScores;
  };
  whyLowScore: {
    invalidSignals: {
      futurePromises: number;
      compliments: number;
    };
    lackingEvidence: string[];
  };
  expertAdvice: GuidanceStep[];
  momTestChecklist: MomTestQuestion[];
  nextSteps: string[];
}

export interface GuidanceStep {
  stepNumber: number;
  title: string;
  focus: string;
  reasoning: string[];
  actionItems: string[];
  momTestValidation: {
    dontAsk: string[];
    doAsk: string[];
  };
}

export interface MomTestQuestion {
  question: string;
  why: string;
  example: string;
  antiPattern: string;
}

/**
 * 低分聚焦引导生成器
 */
export class FocusGuidanceBuilder {
  /**
   * 生成完整的聚焦引导文档
   * Spec: Lines 742-929 (低分引导模板)
   */
  generate(scoreResult: MaturityScoreResult, ideaContent: string): FocusGuidance {
    const dimensions = scoreResult.dimensions;
    const weakestDimensions = this.identifyWeakestDimensions(dimensions);

    return {
      title: '您的创意需要进一步聚焦 📍',
      summary: `评分 ${scoreResult.totalScore}/10（成熟度：想法阶段），置信度 ${Math.round(scoreResult.confidence * 100)}%`,
      scoreOverview: {
        totalScore: scoreResult.totalScore,
        level: scoreResult.level,
        confidence: scoreResult.confidence,
        radarChart: dimensions
      },
      whyLowScore: this.generateWhyLowScore(scoreResult),
      expertAdvice: this.generateExpertAdvice(weakestDimensions, scoreResult),
      momTestChecklist: this.generateMomTestChecklist(),
      nextSteps: this.generateNextSteps()
    };
  }

  /**
   * 识别最薄弱的维度（用于聚焦建议）
   */
  private identifyWeakestDimensions(dimensions: DimensionScores): Array<{ name: string; score: number; status: string }> {
    const dimArray = [
      { name: 'targetCustomer', label: '目标客户', ...dimensions.targetCustomer },
      { name: 'demandScenario', label: '需求场景', ...dimensions.demandScenario },
      { name: 'coreValue', label: '核心价值', ...dimensions.coreValue },
      { name: 'businessModel', label: '商业模式', ...dimensions.businessModel },
      { name: 'credibility', label: '可信度', ...dimensions.credibility }
    ];

    // 按分数从低到高排序
    dimArray.sort((a, b) => a.score - b.score);

    // 返回最弱的3个维度
    return dimArray.slice(0, 3).map(d => ({
      name: d.label,
      score: d.score,
      status: d.status
    }));
  }

  /**
   * 生成"为什么是低分"部分（基于The Mom Test）
   * Spec: Lines 767-782
   */
  private generateWhyLowScore(scoreResult: MaturityScoreResult): FocusGuidance['whyLowScore'] {
    const invalidSignals = scoreResult.invalidSignals;
    const lackingEvidence: string[] = [];

    if (scoreResult.validSignals.specificPast === 0) {
      lackingEvidence.push('缺少具体的过去案例（"上次用户遇到这个问题是什么时候"）');
    }

    if (scoreResult.validSignals.realSpending === 0) {
      lackingEvidence.push('缺少真实付费证据（"用户现在为类似解决方案花多少钱"）');
    }

    if (scoreResult.validSignals.evidence === 0) {
      lackingEvidence.push('缺少可验证证据（截图、数据、链接等）');
    }

    return {
      invalidSignals: {
        futurePromises: invalidSignals.futurePromises,
        compliments: invalidSignals.compliments
      },
      lackingEvidence
    };
  }

  /**
   * 生成专家建议（4个步骤）
   * Spec: Lines 784-869
   */
  private generateExpertAdvice(weakestDimensions: Array<any>, scoreResult: MaturityScoreResult): GuidanceStep[] {
    const steps: GuidanceStep[] = [];

    // 第一步：明确目标客户
    if (weakestDimensions.some(d => d.name === '目标客户')) {
      steps.push({
        stepNumber: 1,
        title: '明确目标客户 🎯',
        focus: '自由职业者（设计师、程序员、咨询师）',
        reasoning: [
          '这个人群付费意愿高，市场成熟',
          '自由职业者对时间管理工具的需求最强烈'
        ],
        actionItems: [
          '访谈5-10位自由职业者，确认他们的时间管理痛点',
          '了解他们现在用什么工具，最不满意的地方是什么'
        ],
        momTestValidation: {
          dontAsk: [
            '❌ "你觉得自由职业者会用吗？" → 对方会为了照顾你而撒谎'
          ],
          doAsk: [
            '✅ "你上次遇到时间管理问题是什么时候？"',
            '✅ "你现在怎么解决这个问题？"',
            '✅ "你为此花了多少时间/金钱？"'
          ]
        }
      });
    }

    // 第二步：聚焦需求场景
    if (weakestDimensions.some(d => d.name === '需求场景')) {
      steps.push({
        stepNumber: steps.length + 1,
        title: '聚焦需求场景 📍',
        focus: '项目时间追踪 + 时薪计算',
        reasoning: [
          '自由职业者最关心的是"这个项目值不值得做"',
          '时薪可视化能给用户直观的价值感'
        ],
        actionItems: [
          '画出用户使用的典型流程（从开始项目到查看时薪报告）',
          '确认核心功能：时间追踪、项目管理、时薪报告'
        ],
        momTestValidation: {
          dontAsk: [
            '❌ "你会用时薪追踪功能吗？" → 未来的谎言',
            '❌ "你觉得时薪可视化有用吗？" → 引导赞美'
          ],
          doAsk: [
            '✅ "告诉我你最近一次管理项目时间的具体情况"',
            '✅ "那件事的影响是什么？（浪费了多少时间/钱）"',
            '✅ "你有尝试其他办法吗？为什么没用？"'
          ]
        }
      });
    }

    // 第三步：定义差异化价值
    if (weakestDimensions.some(d => d.name === '核心价值')) {
      steps.push({
        stepNumber: steps.length + 1,
        title: '定义差异化价值 💡',
        focus: '不是"又一个时间管理工具"，而是"自由职业者的时薪优化顾问"',
        reasoning: [
          '市面上时间管理工具太多了，需要独特卖点',
          '时薪优化这个角度很好，直接和赚钱挂钩'
        ],
        actionItems: [
          '用一句话描述产品："帮助自由职业者通过AI时薪分析，优化时间分配，提升收入"',
          '找3个竞品，对比独特优势'
        ],
        momTestValidation: {
          dontAsk: [],
          doAsk: [
            '✅ "你现在用什么工具管理时间？每年花多少钱？"',
            '✅ "那个工具最不满意的地方是什么？"',
            '✅ "如果有AI时薪分析，你愿意把预算转移过来吗？"'
          ]
        }
      });
    }

    // 第四步：验证需求真实性
    steps.push({
      stepNumber: steps.length + 1,
      title: '验证需求真实性 ✅',
      focus: '用户访谈 + 竞品分析 + MVP原型',
      reasoning: [
        '只有真实用户验证才能证明需求的真实性',
        '避免基于未来想象做决策'
      ],
      actionItems: [
        '用户访谈（5-10人）：使用The Mom Test问题清单',
        '竞品分析（3个产品）：Toggl、RescueTime、Clockify',
        'MVP原型：用Figma画出核心界面，收集10-20人反馈'
      ],
      momTestValidation: {
        dontAsk: [],
        doAsk: []
      }
    });

    return steps;
  }

  /**
   * 生成The Mom Test问题清单
   * Spec: Lines 886-902
   */
  private generateMomTestChecklist(): MomTestQuestion[] {
    return [
      {
        question: '你上次遇到XX问题是什么时候？',
        why: '获取具体的过去，而非泛泛而谈',
        example: '"上周二，我花了3小时整理项目时间，结果发现算错了时薪"',
        antiPattern: '❌ "你经常遇到这个问题吗？" → 泛泛而谈'
      },
      {
        question: '你现在怎么解决这个问题？',
        why: '了解替代方案和现有投入',
        example: '"我现在用Excel手动记录，每周花2小时汇总"',
        antiPattern: '❌ "你想要什么功能？" → 用户知道问题，但不知道解决方案'
      },
      {
        question: '你为此花了多少时间/金钱？',
        why: '验证问题的严重性和真实成本',
        example: '"我每月为Toggl付99元，但只用了30%的功能"',
        antiPattern: '❌ "你愿意花多少钱？" → 人们会为了说你想听的而撒谎'
      },
      {
        question: '告诉我上次问题发生的具体情况',
        why: '挖掘痛点故事和真实场景',
        example: '"上个月，我接了一个设计项目，事后发现时薪只有50元，亏了"',
        antiPattern: '❌ "你觉得我的主意好吗？" → 对方会为了照顾你而撒谎'
      },
      {
        question: '那件事的影响是什么？',
        why: '了解问题的后果和紧迫性',
        example: '"损失了2000元，而且影响了后续项目的报价策略"',
        antiPattern: '❌ "你会买这个产品吗？" → 未来的保证都是乐观的谎言'
      },
      {
        question: '你有尝试其他办法吗？为什么没用？',
        why: '了解现有方案的问题和改进空间',
        example: '"试过RescueTime，但它只统计时间，不能分析时薪"',
        antiPattern: '❌ "你觉得这个功能有用吗？" → 引导性问题'
      },
      {
        question: '我还可以问谁？',
        why: '获得更多潜在用户和验证机会',
        example: '"我有几个设计师朋友，他们也遇到同样的问题，可以介绍给你"',
        antiPattern: '❌ 不主动寻求更多验证渠道'
      }
    ];
  }

  /**
   * 生成下一步行动清单
   */
  private generateNextSteps(): string[] {
    return [
      '完成5-10个目标用户访谈（使用The Mom Test问题清单）',
      '记录真实数据：已经发生的事实，不记录未来承诺',
      '分析3个竞品的优缺点、定价、用户评价',
      '用Figma画出MVP原型，收集10-20人反馈',
      '重新提交创意，届时将获得详细的创意实现建议'
    ];
  }

  /**
   * 导出为Markdown格式（用于PDF生成）
   */
  exportToMarkdown(guidance: FocusGuidance): string {
    let md = `# ${guidance.title}\n\n`;
    md += `**${guidance.summary}**\n\n`;
    md += `---\n\n`;

    // 评分概览
    md += `## 📊 五维评估\n\n`;
    md += `| 维度 | 得分 | 状态 |\n`;
    md += `|------|------|------|\n`;
    md += `| 🎯 目标客户 | ${guidance.scoreOverview.radarChart.targetCustomer.score}/10 | ${this.getStatusEmoji(guidance.scoreOverview.radarChart.targetCustomer.status)} |\n`;
    md += `| 📍 需求场景 | ${guidance.scoreOverview.radarChart.demandScenario.score}/10 | ${this.getStatusEmoji(guidance.scoreOverview.radarChart.demandScenario.status)} |\n`;
    md += `| 💡 核心价值 | ${guidance.scoreOverview.radarChart.coreValue.score}/10 | ${this.getStatusEmoji(guidance.scoreOverview.radarChart.coreValue.status)} |\n`;
    md += `| 💰 商业模式 | ${guidance.scoreOverview.radarChart.businessModel.score}/10 | ${this.getStatusEmoji(guidance.scoreOverview.radarChart.businessModel.status)} |\n`;
    md += `| 📈 可信度 | ${guidance.scoreOverview.radarChart.credibility.score}/10 | ${this.getStatusEmoji(guidance.scoreOverview.radarChart.credibility.status)} |\n\n`;

    // 为什么是低分
    md += `## ⚠️ 为什么是低分？（基于The Mom Test分析）\n\n`;
    if (guidance.whyLowScore.invalidSignals.futurePromises > 0) {
      md += `❌ **检测到${guidance.whyLowScore.invalidSignals.futurePromises}处"未来保证"**：这些都是未来的想象\n\n`;
    }
    guidance.whyLowScore.lackingEvidence.forEach(item => {
      md += `❌ ${item}\n`;
    });
    md += `\n⚠️ **提示**：根据**The Mom Test**原则，只有**已经发生的事实**才能证明需求的真实性。\n\n`;
    md += `---\n\n`;

    // AI专家建议
    md += `## 💡 AI专家给您的建议\n\n`;
    guidance.expertAdvice.forEach(step => {
      md += `### 第${step.stepNumber}步：${step.title}\n\n`;
      md += `**建议聚焦**：${step.focus}\n\n`;
      md += `**理由**：\n`;
      step.reasoning.forEach(reason => {
        md += `- ${reason}\n`;
      });
      md += `\n**下一步行动**：\n`;
      step.actionItems.forEach(action => {
        md += `- ${action}\n`;
      });

      if (step.momTestValidation.dontAsk.length > 0 || step.momTestValidation.doAsk.length > 0) {
        md += `\n**✅ The Mom Test 验证方法**：\n\n`;
        if (step.momTestValidation.dontAsk.length > 0) {
          md += `**不要这样做**：\n`;
          step.momTestValidation.dontAsk.forEach(q => {
            md += `${q}\n`;
          });
          md += `\n`;
        }
        if (step.momTestValidation.doAsk.length > 0) {
          md += `**要这样做**：\n`;
          step.momTestValidation.doAsk.forEach(q => {
            md += `${q}\n`;
          });
        }
      }

      md += `\n---\n\n`;
    });

    // The Mom Test 问题清单
    md += `## 📋 The Mom Test 问题清单（必读！）\n\n`;
    guidance.momTestChecklist.forEach(q => {
      md += `### ${q.question}\n\n`;
      md += `**为什么问这个**：${q.why}\n\n`;
      md += `**✅ 正确示例**：${q.example}\n\n`;
      md += `**${q.antiPattern}**\n\n`;
    });

    md += `---\n\n`;

    // 下一步
    md += `## 🎁 完成后的下一步\n\n`;
    guidance.nextSteps.forEach(step => {
      md += `- ✅ ${step}\n`;
    });

    return md;
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'CLEAR':
        return '✅ 清晰';
      case 'NEEDS_FOCUS':
        return '⚠️ 待聚焦';
      case 'UNCLEAR':
        return '❌ 待明确';
      default:
        return status;
    }
  }
}
