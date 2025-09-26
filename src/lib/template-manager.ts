// 智能对话模板管理系统
// 为不同阶段和触发事件生成丰富的预设对话内容

import { DialogueContext, AIDialogueContent } from './dialogue-strategy';

export interface DialogueTemplate {
  id: string;
  name: string;
  phase: 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result';
  trigger: string;
  personaType: string;
  variants: TemplateVariant[];
  weight: number;
}

export interface TemplateVariant {
  content: string;
  emotion: string;
  animation: string;
  conditions?: TemplateCondition[];
  bidRange?: [number, number];
}

export interface TemplateCondition {
  type: 'creativity_score' | 'round' | 'highest_bid' | 'user_feedback';
  operator: 'gt' | 'lt' | 'eq' | 'range';
  value: number | string | [number, number];
}

// 对话模板数据库
export const DIALOGUE_TEMPLATES: DialogueTemplate[] = [
  // 预热阶段模板
  {
    id: 'tech_warmup_intro',
    name: '技术先锋开场',
    phase: 'warmup',
    trigger: 'opening_introductions',
    personaType: 'tech-pioneer-alex',
    weight: 1.0,
    variants: [
      {
        content: '大家好！我是技术先锋艾克斯，专注于从技术角度分析创意的可行性。今天这个创意很有意思，让我们深入探讨一下技术实现的细节。',
        emotion: 'confident',
        animation: 'slide-in-left'
      },
      {
        content: '各位同行，艾克斯在此！今天的创意挑战正式开始，我会从架构设计和技术复杂度角度给出专业评估。准备好了吗？',
        emotion: 'professional',
        animation: 'fade-in'
      }
    ]
  },
  {
    id: 'business_warmup_intro',
    name: '商业智囊开场',
    phase: 'warmup',
    trigger: 'opening_introductions',
    personaType: 'business-guru-beta',
    weight: 1.0,
    variants: [
      {
        content: '欢迎来到创意竞价现场！我是商业智囊贝塔，将从市场价值和盈利模式角度分析这个创意。让我们看看它的商业潜力有多大！',
        emotion: 'enthusiastic',
        animation: 'bounce-in'
      },
      {
        content: '朋友们好！贝塔来了！今天要用商业嗅觉来评估这个创意能否在市场上获得成功。数据不会说谎，让我们用事实说话！',
        emotion: 'shrewd',
        animation: 'slide-in-right'
      }
    ]
  },

  // 讨论阶段模板
  {
    id: 'tech_discussion_analysis',
    name: '技术分析讨论',
    phase: 'discussion',
    trigger: 'technical_analysis',
    personaType: 'tech-pioneer-alex',
    weight: 0.8,
    variants: [
      {
        content: '从技术架构角度来看，这个创意需要考虑可扩展性和维护成本。我初步评估技术复杂度为中等偏上。',
        emotion: 'analytical',
        animation: 'pulse',
        conditions: [
          { type: 'creativity_score', operator: 'range', value: [60, 80] }
        ]
      },
      {
        content: '这个技术方案相当有挑战性！需要处理大量并发请求和数据一致性问题，但正是这种挑战让我兴奋！',
        emotion: 'excited',
        animation: 'shake',
        conditions: [
          { type: 'creativity_score', operator: 'gt', value: 80 }
        ]
      }
    ]
  },

  // 竞价阶段模板
  {
    id: 'competitive_bidding',
    name: '竞争性竞价',
    phase: 'bidding',
    trigger: 'competitive_banter',
    personaType: 'any',
    weight: 0.9,
    variants: [
      {
        content: '看来大家都很有信心！但是我相信我的分析更加准确，让我提高一下竞价！',
        emotion: 'competitive',
        animation: 'scale-up',
        bidRange: [100, 200]
      },
      {
        content: '哈哈，各位的眼光都不错！不过这个价格还远远不能体现真正的价值，我要出个让大家惊讶的价格！',
        emotion: 'confident',
        animation: 'glow',
        bidRange: [200, 300]
      },
      {
        content: '等等等等！你们都太保守了！这个创意的潜力被严重低估了，让我来正确定价！',
        emotion: 'dramatic',
        animation: 'bounce',
        bidRange: [150, 250]
      }
    ]
  },

  // 过渡阶段模板
  {
    id: 'stage_transition',
    name: '阶段过渡',
    phase: 'all',
    trigger: 'transition_segments',
    personaType: 'any',
    weight: 0.6,
    variants: [
      {
        content: '接下来进入更深入的分析阶段，大家准备好了吗？',
        emotion: 'anticipating',
        animation: 'fade-in'
      },
      {
        content: '刚才的讨论很精彩！让我们继续深入探讨...',
        emotion: 'thoughtful',
        animation: 'slide-down'
      },
      {
        content: '时间过得真快！现在情况变得更加有趣了...',
        emotion: 'excited',
        animation: 'rotate'
      }
    ]
  },

  // 结果阶段模板
  {
    id: 'victory_celebration',
    name: '庆祝胜利',
    phase: 'result',
    trigger: 'celebration_sequences',
    personaType: 'any',
    weight: 1.0,
    variants: [
      {
        content: '恭喜！这是一个非常公平和准确的结果！我为参与这次精彩的竞价感到荣幸。',
        emotion: 'satisfied',
        animation: 'celebration'
      },
      {
        content: '虽然没有获胜，但这个过程让我学到了很多。下次我会做得更好！',
        emotion: 'gracious',
        animation: 'bow'
      },
      {
        content: '太棒了！这个结果完全符合我的预期，证明了我的分析能力！',
        emotion: 'triumphant',
        animation: 'victory-dance'
      }
    ]
  }
];

// 个性化互动模板
export const PERSONALITY_INTERACTIONS = {
  'tech-pioneer-alex': {
    strengths: ['技术可行性', '架构设计', '性能优化'],
    catchPhrases: ['从技术角度来看...', '这个实现需要考虑...', '架构上我建议...'],
    competitiveLines: ['你们的技术分析还不够深入！', '让专业的来！', '技术实现没有这么简单！']
  },
  'business-guru-beta': {
    strengths: ['商业价值', '市场分析', '盈利模式'],
    catchPhrases: ['从商业角度...', '市场数据显示...', '盈利模式的关键是...'],
    competitiveLines: ['商业价值被你们低估了！', '看看这个市场机会！', '盈利潜力远超预期！']
  },
  'innovation-mentor-charlie': {
    strengths: ['创新思维', '用户体验', '设计理念'],
    catchPhrases: ['用户体验是核心...', '创新的本质在于...', '设计思维告诉我们...'],
    competitiveLines: ['创新价值无法用简单数字衡量！', '用户会为好的体验买单！', '这就是真正的创新！']
  },
  'market-insight-delta': {
    strengths: ['市场研究', '竞品分析', '趋势预测'],
    catchPhrases: ['根据市场数据...', '竞品分析显示...', '市场趋势表明...'],
    competitiveLines: ['市场潜力超出你们想象！', '数据不会说谎！', '这个赛道很有前景！']
  },
  'investment-advisor-ivan': {
    strengths: ['风险评估', '投资回报', '财务分析'],
    catchPhrases: ['从投资角度...', '风险收益比...', 'ROI分析显示...'],
    competitiveLines: ['投资价值被严重低估！', '这个回报率相当可观！', '风险可控，收益可期！']
  }
};

// 模板管理器类
export class TemplateManager {
  private templates: Map<string, DialogueTemplate[]> = new Map();
  private usedTemplates: Set<string> = new Set();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // 按触发事件分组模板
    DIALOGUE_TEMPLATES.forEach(template => {
      const key = `${template.phase}_${template.trigger}`;
      if (!this.templates.has(key)) {
        this.templates.set(key, []);
      }
      this.templates.get(key)!.push(template);
    });
  }

  // 生成基于模板的对话内容
  generateFromTemplate(
    templateType: string,
    context: DialogueContext
  ): AIDialogueContent[] {
    const key = `${context.phase}_${context.trigger}`;
    const templates = this.templates.get(key) || [];

    if (templates.length === 0) {
      return this.getFallbackDialogue(context);
    }

    // 选择合适的模板
    const suitableTemplates = templates.filter(template =>
      this.isTemplateApplicable(template, context)
    );

    if (suitableTemplates.length === 0) {
      return this.getFallbackDialogue(context);
    }

    // 加权随机选择
    const selectedTemplate = this.selectWeightedTemplate(suitableTemplates);
    const variant = this.selectVariant(selectedTemplate, context);

    if (!variant) {
      return this.getFallbackDialogue(context);
    }

    // 生成对话内容
    const content: AIDialogueContent = {
      agentId: this.getPersonaId(selectedTemplate.personaType, context),
      agentName: this.getPersonaName(selectedTemplate.personaType),
      content: this.personalizeContent(variant.content, context),
      emotion: variant.emotion,
      animation: variant.animation,
      bidAmount: variant.bidRange ? this.generateBidAmount(variant.bidRange, context) : undefined,
      timestamp: Date.now()
    };

    return [content];
  }

  // 检查模板是否适用
  private isTemplateApplicable(template: DialogueTemplate, context: DialogueContext): boolean {
    if (template.phase !== 'all' && template.phase !== context.phase) {
      return false;
    }

    // 避免重复使用相同模板
    const templateKey = `${template.id}_${context.round}`;
    if (this.usedTemplates.has(templateKey)) {
      return false;
    }

    return true;
  }

  // 加权选择模板
  private selectWeightedTemplate(templates: DialogueTemplate[]): DialogueTemplate {
    const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    for (const template of templates) {
      random -= template.weight;
      if (random <= 0) {
        return template;
      }
    }

    return templates[templates.length - 1];
  }

  // 选择合适的变体
  private selectVariant(template: DialogueTemplate, context: DialogueContext): TemplateVariant | null {
    const applicableVariants = template.variants.filter(variant =>
      this.isVariantApplicable(variant, context)
    );

    if (applicableVariants.length === 0) {
      return template.variants[0]; // 返回默认变体
    }

    return applicableVariants[Math.floor(Math.random() * applicableVariants.length)];
  }

  // 检查变体是否适用
  private isVariantApplicable(variant: TemplateVariant, context: DialogueContext): boolean {
    if (!variant.conditions) return true;

    return variant.conditions.every(condition => {
      switch (condition.type) {
        case 'creativity_score':
          if (!context.creativityScore) return true;
          return this.checkCondition(context.creativityScore, condition);
        case 'round':
          return this.checkCondition(context.round, condition);
        default:
          return true;
      }
    });
  }

  // 检查条件
  private checkCondition(value: number, condition: TemplateCondition): boolean {
    switch (condition.operator) {
      case 'gt':
        return value > (condition.value as number);
      case 'lt':
        return value < (condition.value as number);
      case 'eq':
        return value === (condition.value as number);
      case 'range':
        const [min, max] = condition.value as [number, number];
        return value >= min && value <= max;
      default:
        return true;
    }
  }

  // 个性化内容
  private personalizeContent(content: string, context: DialogueContext): string {
    // 替换占位符
    let personalizedContent = content;

    // 根据创意评分调整语气
    if (context.creativityScore) {
      if (context.creativityScore > 80) {
        personalizedContent = personalizedContent.replace(/很有意思/g, '非常出色');
        personalizedContent = personalizedContent.replace(/不错/g, '令人印象深刻');
      } else if (context.creativityScore < 50) {
        personalizedContent = personalizedContent.replace(/很有意思/g, '需要改进');
        personalizedContent = personalizedContent.replace(/不错/g, '有提升空间');
      }
    }

    // 根据轮次调整内容
    if (context.round > 1) {
      personalizedContent = personalizedContent.replace(/第一次/g, `第${context.round}次`);
    }

    return personalizedContent;
  }

  // 生成竞价金额
  private generateBidAmount(range: [number, number], context: DialogueContext): number {
    const [min, max] = range;
    let baseAmount = min + Math.random() * (max - min);

    // 根据创意评分调整竞价
    if (context.creativityScore) {
      const scoreMultiplier = context.creativityScore / 100;
      baseAmount = Math.floor(baseAmount * (0.5 + scoreMultiplier));
    }

    // 确保是5的倍数
    return Math.round(baseAmount / 5) * 5;
  }

  // 获取角色ID
  private getPersonaId(personaType: string, context: DialogueContext): string {
    if (personaType === 'any') {
      const personas = ['tech-pioneer-alex', 'business-guru-beta', 'innovation-mentor-charlie', 'market-insight-delta', 'investment-advisor-ivan'];
      return personas[context.round % personas.length];
    }
    return personaType;
  }

  // 获取角色名称
  private getPersonaName(personaType: string): string {
    const nameMap: Record<string, string> = {
      'tech-pioneer-alex': '技术先锋艾克斯',
      'business-guru-beta': '商业智囊贝塔',
      'innovation-mentor-charlie': '创新导师查理',
      'market-insight-delta': '市场洞察黛拉',
      'investment-advisor-ivan': '投资顾问伊万'
    };
    return nameMap[personaType] || '神秘嘉宾';
  }

  // 获取回退对话
  getFallbackDialogue(context: DialogueContext): AIDialogueContent[] {
    const fallbackMessages = [
      '让我仔细考虑一下这个创意...',
      '这确实是个有趣的想法！',
      '我需要更多时间来分析...',
      '大家的观点都很有价值！'
    ];

    const content = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    return [{
      agentId: 'tech-pioneer-alex',
      agentName: '技术先锋艾克斯',
      content,
      emotion: 'thoughtful',
      animation: 'fade-in',
      timestamp: Date.now()
    }];
  }

  // 生成个性化互动
  generatePersonalityInteraction(
    personaId: string,
    interactionType: 'strength' | 'catchPhrase' | 'competitive',
    context: DialogueContext
  ): string {
    const personality = PERSONALITY_INTERACTIONS[personaId as keyof typeof PERSONALITY_INTERACTIONS];
    if (!personality) return '';

    switch (interactionType) {
      case 'strength':
        return personality.strengths[Math.floor(Math.random() * personality.strengths.length)];
      case 'catchPhrase':
        return personality.catchPhrases[Math.floor(Math.random() * personality.catchPhrases.length)];
      case 'competitive':
        return personality.competitiveLines[Math.floor(Math.random() * personality.competitiveLines.length)];
      default:
        return '';
    }
  }

  // 重置使用历史
  resetUsageHistory(): void {
    this.usedTemplates.clear();
  }

  // 获取模板统计
  getTemplateStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.templates.forEach((templates, key) => {
      stats[key] = templates.length;
    });
    return stats;
  }
}

export default TemplateManager;