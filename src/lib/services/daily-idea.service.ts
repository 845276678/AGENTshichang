import { prisma } from '@/lib/prisma';
import { AIServiceFactory, AIProvider } from '@/lib/ai-services';

export interface DailyIdeaGenerationOptions {
  targetMaturity?: number;
  preferredDomains?: string[];
  excludeRecentDomains?: boolean;
  minQualityScore?: number;
  useAI?: boolean; // 是否使用AI生成
  aiProvider?: AIProvider; // 指定AI服务商
}

export interface GeneratedDailyIdea {
  title: string;
  description: string;
  maturity: number;
  domain: string[];
  guidingQuestions: string[];
  implementationHints: string[];
}

export class DailyIdeaService {

  /**
   * 生成每日创意
   */
  static async generateDailyIdea(options: DailyIdeaGenerationOptions = {}): Promise<GeneratedDailyIdea> {
    const {
      targetMaturity,
      preferredDomains = ['科技', '生活方式', '教育', '健康', '金融', '娱乐', '商业', '零售'],
      excludeRecentDomains = true,
      useAI = true, // 默认使用AI生成
      aiProvider
    } = options;

    // 获取最近7天使用过的领域（避免重复）
    let excludedDomains: string[] = [];
    if (excludeRecentDomains) {
      const recentIdeas = await prisma.dailyIdea.findMany({
        where: {
          publishDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: { domain: true }
      });

      excludedDomains = [...new Set(recentIdeas.flatMap(idea => idea.domain))];
    }

    // 选择可用领域
    const availableDomains = preferredDomains.filter(domain =>
      !excludedDomains.includes(domain)
    );

    if (availableDomains.length === 0) {
      // 如果所有领域都被排除，则重置使用所有领域
      availableDomains.push(...preferredDomains);
    }

    // 随机选择1-3个领域
    const selectedDomains = this.selectRandomDomains(availableDomains, Math.floor(Math.random() * 3) + 1);

    // 随机生成成熟度（如果未指定）
    const maturity = targetMaturity || this.generateRandomMaturity();

    // 使用AI生成创意内容
    let ideaContent;
    if (useAI) {
      try {
        ideaContent = await this.generateIdeaContentWithAI(selectedDomains, maturity, aiProvider);
      } catch (error) {
        console.error('AI生成失败，使用预设模板:', error);
        ideaContent = await this.generateIdeaContentFromTemplate(selectedDomains, maturity);
      }
    } else {
      ideaContent = await this.generateIdeaContentFromTemplate(selectedDomains, maturity);
    }

    return {
      ...ideaContent,
      maturity,
      domain: selectedDomains
    };
  }

  /**
   * 创建每日创意记录
   */
  static async createDailyIdea(idea: GeneratedDailyIdea, publishDate?: Date): Promise<string> {
    const targetDate = publishDate || this.getNextPublishDate();

    // 检查该日期是否已有创意
    const existingIdea = await prisma.dailyIdea.findUnique({
      where: { publishDate: targetDate }
    });

    if (existingIdea) {
      throw new Error(`${targetDate.toDateString()} 已存在每日创意`);
    }

    const dailyIdea = await prisma.dailyIdea.create({
      data: {
        title: idea.title,
        description: idea.description,
        maturity: idea.maturity,
        domain: idea.domain,
        guidingQuestions: idea.guidingQuestions,
        implementationHints: idea.implementationHints,
        publishDate: targetDate,
        isActive: true
      }
    });

    return dailyIdea.id;
  }

  /**
   * 批量生成未来7天的创意
   */
  static async generateWeeklyIdeas(): Promise<void> {
    const promises = [];

    for (let i = 0; i < 7; i++) {
      const publishDate = new Date();
      publishDate.setDate(publishDate.getDate() + i);
      publishDate.setHours(8, 0, 0, 0); // 每天8点发布

      // 检查是否已存在
      const existing = await prisma.dailyIdea.findUnique({
        where: { publishDate }
      });

      if (!existing) {
        const idea = await this.generateDailyIdea({
          excludeRecentDomains: true
        });

        promises.push(this.createDailyIdea(idea, publishDate));
      }
    }

    await Promise.all(promises);
  }

  /**
   * 获取创意统计信息
   */
  static async getIdeaStats(ideaId: string) {
    const idea = await prisma.dailyIdea.findUnique({
      where: { id: ideaId },
      include: {
        feedbacks: {
          select: {
            qualityScore: true,
            type: true,
            helpfulness: true
          }
        },
        userEngagements: {
          select: {
            engagementScore: true,
            viewDuration: true
          }
        }
      }
    });

    if (!idea) return null;

    const stats = {
      totalViews: idea.viewCount,
      totalFeedbacks: idea.feedbackCount,
      averageQuality: idea.feedbacks.length > 0
        ? idea.feedbacks.reduce((sum, f) => sum + f.qualityScore, 0) / idea.feedbacks.length
        : 0,
      feedbackTypes: this.groupFeedbacksByType(idea.feedbacks),
      averageEngagement: idea.userEngagements.length > 0
        ? idea.userEngagements.reduce((sum, e) => sum + e.engagementScore, 0) / idea.userEngagements.length
        : 0,
      averageViewDuration: idea.userEngagements.length > 0
        ? idea.userEngagements
            .filter(e => e.viewDuration)
            .reduce((sum, e) => sum + (e.viewDuration || 0), 0) / idea.userEngagements.length
        : 0
    };

    return stats;
  }

  // 私有辅助方法

  private static selectRandomDomains(domains: string[], count: number): string[] {
    const shuffled = [...domains].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private static generateRandomMaturity(): number {
    // 生成偏向中低成熟度的随机数，让用户有更多发挥空间
    const weights = [0.3, 0.4, 0.2, 0.1]; // 低(30%)、中低(40%)、中高(20%)、高(10%)
    const ranges: [number, number][] = [[0, 30], [30, 50], [50, 70], [70, 100]];

    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < weights.length; i++) {
      const weight = weights[i];
      if (weight !== undefined) {
        cumulative += weight;
        if (random <= cumulative) {
          const range = ranges[i];
          if (range) {
            const [min, max] = range;
            return Math.floor(Math.random() * (max - min) + min);
          }
        }
      }
    }

    return 50; // 默认值
  }

  private static getNextPublishDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow;
  }

  private static async generateIdeaContentWithAI(
    domains: string[],
    maturity: number,
    preferredProvider?: AIProvider
  ): Promise<Omit<GeneratedDailyIdea, 'maturity' | 'domain'>> {

    // 获取AI服务
    const aiService = preferredProvider
      ? AIServiceFactory.getService(preferredProvider)
      : await AIServiceFactory.getBalancedService();

    // 构建AI提示词
    const maturityLevel = maturity < 30 ? '概念期（初步想法）' :
                          maturity < 60 ? '发展期（有一定可行性）' :
                          '成熟期（接近落地）';

    const prompt = `你是一个创意生成专家。请为"每日一创意"功能生成一个创新的商业或产品创意。

要求：
- 领域：${domains.join('、')}
- 成熟度阶段：${maturityLevel}（${maturity}分）
- 创意应该具有创新性、可行性和市场潜力

请严格按照以下JSON格式输出（不要包含任何markdown标记或额外文字）：
{
  "title": "创意标题（10-20字）",
  "description": "详细描述这个创意的核心价值、目标用户和实现方式（100-200字）",
  "guidingQuestions": [
    "问题1：帮助用户思考创意可行性的问题",
    "问题2：关于市场需求的问题",
    "问题3：关于实施方案的问题",
    "问题4：关于商业模式的问题"
  ],
  "implementationHints": [
    "提示1：具体的实施建议",
    "提示2：需要注意的关键点",
    "提示3：可以参考的案例或方法",
    "提示4：优先级建议"
  ]
}

注意：
1. 创意要结合${domains.join('和')}领域的特点
2. 成熟度${maturity}分意味着${maturity < 30 ? '这是一个初步的想法，需要大量验证' : maturity < 60 ? '这个创意有一定基础，需要继续完善' : '这个创意比较成熟，接近可以落地实施'}
3. 引导问题要有深度，帮助用户真正思考
4. 实施提示要具体可执行`;

    try {
      const response = await aiService.chat(prompt, {
        temperature: 0.8, // 较高的创造性
        maxTokens: 1500
      });

      // 解析AI返回的JSON
      const cleanedContent = response.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsedIdea = JSON.parse(cleanedContent);

      // 验证返回数据的完整性
      if (!parsedIdea.title || !parsedIdea.description ||
          !Array.isArray(parsedIdea.guidingQuestions) ||
          !Array.isArray(parsedIdea.implementationHints)) {
        throw new Error('AI返回数据格式不完整');
      }

      return {
        title: parsedIdea.title,
        description: parsedIdea.description,
        guidingQuestions: parsedIdea.guidingQuestions,
        implementationHints: parsedIdea.implementationHints
      };

    } catch (error) {
      console.error('AI生成创意失败:', error);
      throw error;
    }
  }

  private static async generateIdeaContentFromTemplate(
    _domains: string[],
    _maturity: number
  ): Promise<Omit<GeneratedDailyIdea, 'maturity' | 'domain'>> {
    // 创建示例创意内容 - 在实际项目中可以接入AI服务
    const ideas = [
      {
        title: '智能家居声音识别助手',
        description: '开发一个能够识别家庭成员声音并提供个性化服务的智能助手，可以根据不同家庭成员的声音特征提供定制化的信息推送、娱乐内容和智能家居控制方案。',
        guidingQuestions: [
          '如何确保声音识别的准确性和隐私安全？',
          '什么样的个性化服务最能吸引用户？',
          '如何与现有智能家居生态系统整合？',
          '用户愿意为这样的服务支付多少费用？'
        ],
        implementationHints: [
          '先从简单的声音识别开始，逐步增加个性化功能',
          '重点关注隐私保护和数据安全',
          '考虑与主流智能音箱厂商合作',
          '建立用户反馈循环机制优化识别算法'
        ]
      },
      {
        title: '个人碳足迹跟踪与奖励平台',
        description: '创建一个综合性平台，帮助用户跟踪日常生活中的碳排放，提供减排建议，并通过积分奖励机制鼓励环保行为，连接绿色消费商家提供实际优惠。',
        guidingQuestions: [
          '如何准确测量个人碳足迹？',
          '什么样的奖励机制能够持续激励用户？',
          '如何建立可信的商家合作网络？',
          '怎样确保数据的真实性和有效性？'
        ],
        implementationHints: [
          '从用户最容易理解的行为开始（如交通、用电）',
          '建立简单易用的数据录入方式',
          '先与本地环保商家建立合作关系',
          '设计有趣的社交分享功能增加用户粘性'
        ]
      },
      {
        title: '远程工作效率优化工具',
        description: '针对远程工作者开发的综合效率提升工具，包括时间管理、注意力训练、虚拟工作空间营造和团队协作优化功能，帮助在家办公人员提高工作效率和生活质量。',
        guidingQuestions: [
          '远程工作者最大的痛点是什么？',
          '如何平衡工作效率和员工隐私？',
          '什么功能能够真正提升团队协作效果？',
          '如何与现有工作工具生态整合？'
        ],
        implementationHints: [
          '先做用户调研，了解真实需求',
          '开发MVP版本测试核心功能',
          '考虑与企业客户合作推广',
          '重视用户体验和界面设计'
        ]
      }
    ];

    // 根据领域和成熟度选择合适的创意模板
    const selectedIdea = ideas[Math.floor(Math.random() * ideas.length)];

    if (!selectedIdea) {
      // 如果没有选中创意（理论上不会发生），返回第一个
      const firstIdea = ideas[0];
      if (!firstIdea) {
        throw new Error('No template ideas available');
      }
      return {
        title: firstIdea.title,
        description: firstIdea.description,
        guidingQuestions: firstIdea.guidingQuestions,
        implementationHints: firstIdea.implementationHints
      };
    }

    return {
      title: selectedIdea.title,
      description: selectedIdea.description,
      guidingQuestions: selectedIdea.guidingQuestions,
      implementationHints: selectedIdea.implementationHints
    };
  }

  private static groupFeedbacksByType(feedbacks: Array<{type: string, qualityScore: number}>) {
    const grouped = feedbacks.reduce((acc, feedback) => {
      if (!acc[feedback.type]) {
        acc[feedback.type] = { count: 0, totalQuality: 0 };
      }
      const group = acc[feedback.type];
      if (group) {
        group.count++;
        group.totalQuality += feedback.qualityScore;
      }
      return acc;
    }, {} as Record<string, {count: number, totalQuality: number}>);

    // 计算平均质量分
    Object.keys(grouped).forEach(type => {
      const group = grouped[type];
      if (group) {
        grouped[type] = {
          ...group,
          averageQuality: group.totalQuality / group.count
        } as any;
      }
    });

    return grouped;
  }
}