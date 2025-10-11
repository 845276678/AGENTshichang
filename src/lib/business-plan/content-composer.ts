import { buildCoreGuide } from './core-guide-builder'
import { buildExecutionPlan } from './practical-planner'
import { generatePersonalizedRecommendations, formatRecommendationsAsMarkdown } from './personalized-recommendations'
import { FocusGuidanceBuilder } from './focus-guidance-builder'
import { SimplifiedBusinessPlanGenerator } from './simplified-generator'
import { BASE_LANDING_COACH_TEMPLATE } from '@/lib/utils/transformReportToGuide'
import type { BiddingSnapshot, BusinessPlanMetadata, BusinessPlanGuide } from './types'
import type { MaturityScoreResult } from '@/types/maturity-score'
import type { SimplifiedBusinessPlan } from './simplified-guide-structure'

export interface ComposeGuideOptions {
  industry?: string
  teamStrength?: string
  maturityScore?: MaturityScoreResult | null // 🆕 成熟度评分
  useSimplifiedFormat?: boolean // 🆕 是否使用简化版4模块格式
}

export interface ComposedBusinessPlan {
  guide: BusinessPlanGuide
  metadata: BusinessPlanMetadata
  simplifiedPlan?: SimplifiedBusinessPlan // 🆕 简化版商业计划书
}

/**
 * 根据成熟度评分生成差异化的商业计划书
 * - LOW/GRAY_LOW (1-5分): 聚焦引导模板 (The Mom Test 问题清单)
 * - MEDIUM (5-7分): 详细商业计划书 (15-25页) 或 简化版4模块 (8-12页)
 * - GRAY_HIGH/HIGH (7-10分): 投资级商业计划书 (30-50页) 或 简化版4模块 (12-18页)
 */
export async function composeBusinessPlanGuide(
  snapshot: BiddingSnapshot,
  options: ComposeGuideOptions = {}
): Promise<ComposedBusinessPlan> {
  const { maturityScore, useSimplifiedFormat = false } = options;

  // 🆕 优先使用简化版4模块格式
  if (useSimplifiedFormat) {
    console.log(`🎯 使用简化版4模块格式生成商业计划书`);

    const simplifiedGenerator = new SimplifiedBusinessPlanGenerator();
    const simplifiedPlan = await simplifiedGenerator.generateSimplifiedPlan(snapshot, maturityScore);

    // 将简化版转换为兼容的guide格式（保持现有API兼容性）
    const compatibleGuide = convertSimplifiedToGuide(simplifiedPlan);

    const metadata: BusinessPlanMetadata = {
      version: '3.0-simplified',
      generatedAt: new Date().toISOString(),
      source: 'simplified-4-modules',
      maturityLevel: simplifiedPlan.metadata.maturityLevel,
      maturityScore: simplifiedPlan.metadata.maturityScore,
      confidence: simplifiedPlan.metadata.confidence,
      ideaTitle: simplifiedPlan.metadata.ideaTitle,
      ideaId: simplifiedPlan.metadata.ideaId
    };

    return {
      guide: compatibleGuide,
      metadata,
      simplifiedPlan // 🆕 同时返回简化版
    };
  }

  // 🔴 LOW/GRAY_LOW: 返回聚焦引导模板
  if (maturityScore && (maturityScore.level === 'LOW' || maturityScore.level === 'GRAY_LOW')) {
    console.log(`📍 创意成熟度${maturityScore.level} (${maturityScore.totalScore}/10)，生成聚焦引导模板`);

    const guidanceBuilder = new FocusGuidanceBuilder();
    const focusGuide = guidanceBuilder.generate(maturityScore, snapshot.ideaDescription || '');
    const markdownGuide = guidanceBuilder.exportToMarkdown(focusGuide);

    // 返回简化的 guide 结构，基于模板确保所有字段存在
    const guide: BusinessPlanGuide = {
      ...BASE_LANDING_COACH_TEMPLATE, // 🆕 使用完整模板作为基础
      title: focusGuide.title,
      introduction: focusGuide.summary,
      // 覆盖 executionPlan 为聚焦引导内容
      executionPlan: {
        overview: focusGuide.summary,
        phases: focusGuide.expertAdvice.map((step) => ({
          name: step.title,
          duration: '1-2周',
          keyMilestones: step.actionItems.map(action => ({
            name: action,
            impact: 'high' as const,
            input: 'medium' as const,
            description: ''
          })),
          keyActions: step.actionItems,
          feedback: step.momTestValidation.doAsk
        })),
        milestones: focusGuide.momTestChecklist.map(q => ({
          week: 1,
          title: q.question,
          deliverables: [q.why],
          successCriteria: [q.example]
        })),
        quickWins: focusGuide.nextSteps,
        operationsPriorities: focusGuide.whyLowScore.lackingEvidence,
        // 🆕 附加完整的聚焦引导 Markdown
        personalizedRecommendations: markdownGuide
      },
      // 🆕 添加专门的聚焦引导说明到 expertInsights
      expertInsights: {
        summary: `创意成熟度评分 ${maturityScore.totalScore}/10 (${maturityScore.level})。根据评分结果，我们为您生成了聚焦引导模板，帮助您完善创意。`,
        keyQuotes: [],
        consensusPoints: [
          '需要更明确的目标用户定义',
          '需要验证真实的市场需求',
          '需要找到差异化竞争优势'
        ],
        controversialPoints: focusGuide.whyLowScore.lackingEvidence.slice(0, 3)
      }
    };

    const metadata: BusinessPlanMetadata = {
      version: '2.0-focus-guidance',
      generatedAt: new Date().toISOString(),
      source: 'focus-guidance',
      maturityLevel: maturityScore.level,
      maturityScore: maturityScore.totalScore,
      confidence: maturityScore.confidence,
      ideaTitle: snapshot.ideaTitle, // 🆕 包含创意标题
      ideaId: snapshot.ideaId // 🆕 包含创意ID
    };

    return { guide, metadata };
  }

  // 🟡 MEDIUM: 详细商业计划书 (当前逻辑)
  console.log(`📊 创意成熟度${maturityScore?.level || 'MEDIUM'} (${maturityScore?.totalScore || 'N/A'}/10)，生成详细商业计划书`);

  const { guide, metadata } = await buildCoreGuide(snapshot)

  guide.executionPlan = await buildExecutionPlan(snapshot, {
    ideaDescription: snapshot.ideaDescription,
    industry: options.industry,
    teamStrength: options.teamStrength
  })

  // 如果有用户上下文信息，生成个性化建议
  if (snapshot.userContext && snapshot.ideaDescription) {
    const recommendations = generatePersonalizedRecommendations(
      snapshot.userContext,
      snapshot.ideaDescription
    )

    // 将个性化建议添加到指南中
    const recommendationsMarkdown = formatRecommendationsAsMarkdown(recommendations)

    // 在核心指南的适当位置插入个性化建议
    // 可以添加到 executionPlan 或作为单独的部分
    if (guide.executionPlan) {
      guide.executionPlan.personalizedRecommendations = recommendationsMarkdown
    }
  }

  // 🆕 在 metadata 中包含成熟度评分和创意信息
  if (maturityScore) {
    metadata.maturityLevel = maturityScore.level;
    metadata.maturityScore = maturityScore.totalScore;
    metadata.confidence = maturityScore.confidence;
  }
  metadata.ideaTitle = snapshot.ideaTitle; // 🆕 包含创意标题
  metadata.ideaId = snapshot.ideaId; // 🆕 包含创意ID

  return { guide, metadata }
}

/**
 * 将简化版商业计划书转换为兼容的guide格式
 * 保持现有API的兼容性，同时支持新的简化版展示
 */
function convertSimplifiedToGuide(simplifiedPlan: SimplifiedBusinessPlan): BusinessPlanGuide {
  return {
    ...BASE_LANDING_COACH_TEMPLATE,

    // 基本信息
    title: `${simplifiedPlan.metadata.ideaTitle} - 简化版商业计划书`,
    introduction: `本计划书采用简化版4模块结构，为《${simplifiedPlan.metadata.ideaTitle}》提供清晰的商业化路径。`,

    // 当前形势分析 - 映射用户市场模块
    currentSituation: {
      summary: `目标用户：${simplifiedPlan.userAndMarket.targetUsers.primary}`,
      keyInsights: simplifiedPlan.userAndMarket.targetUsers.characteristics,
      marketReality: {
        marketSize: simplifiedPlan.userAndMarket.marketAnalysis.size,
        competition: simplifiedPlan.userAndMarket.marketAnalysis.competitors.join(', '),
        opportunities: simplifiedPlan.userAndMarket.marketAnalysis.opportunities,
        challenges: simplifiedPlan.userAndMarket.targetUsers.painPoints
      },
      userNeeds: {
        targetUsers: simplifiedPlan.userAndMarket.targetUsers.primary,
        painPoints: simplifiedPlan.userAndMarket.targetUsers.painPoints,
        solutions: [simplifiedPlan.userAndMarket.applicationScenarios.primary]
      },
      actionItems: simplifiedPlan.userAndMarket.applicationScenarios.useCases
    },

    // MVP定义 - 映射产品技术模块
    mvpDefinition: {
      productConcept: {
        uniqueValue: simplifiedPlan.productAndTech.coreValue,
        coreFeatures: simplifiedPlan.productAndTech.keyFeatures
      },
      developmentPlan: {
        estimatedCost: simplifiedPlan.productAndTech.developmentPlan.timeline,
        phases: simplifiedPlan.productAndTech.developmentPlan.milestones,
        techStack: simplifiedPlan.productAndTech.techStack.recommended
      },
      validationStrategy: {
        timeline: simplifiedPlan.validationAndIteration.validationMethods?.[0]?.timeline || '未定义',
        hypotheses: simplifiedPlan.validationAndIteration.hypotheses,
        experiments: simplifiedPlan.validationAndIteration.validationMethods.map(v => v.method),
        successMetrics: simplifiedPlan.validationAndIteration.validationMethods.map(v => v.successCriteria)
      },
      actionItems: simplifiedPlan.productAndTech.differentiators
    },

    // 商业执行 - 映射商业资源模块
    businessExecution: {
      businessModel: {
        revenueStreams: simplifiedPlan.businessAndResources.businessModel.revenueStreams,
        pricingStrategy: simplifiedPlan.businessAndResources.businessModel.pricingStrategy,
        costStructure: simplifiedPlan.businessAndResources.businessModel.costStructure
      },
      launchStrategy: {
        phases: simplifiedPlan.businessAndResources.launchStrategy.phases
      },
      operationalPlan: {
        teamStructure: simplifiedPlan.businessAndResources.teamAndResources.coreTeam.map(t => t.role),
        infrastructure: [simplifiedPlan.businessAndResources.teamAndResources.budget.development],
        riskManagement: simplifiedPlan.validationAndIteration.riskMitigation.map(r => r.mitigation)
      },
      actionItems: simplifiedPlan.businessAndResources.launchStrategy.channels
    },

    // 专家洞察
    expertInsights: {
      summary: `简化版商业计划书，适配成熟度${simplifiedPlan.metadata.maturityLevel}的创意`,
      keyQuotes: [],
      consensusPoints: [
        '采用4模块结构，结构清晰易懂',
        '5位AI专家协作生成，内容专业全面',
        `内容深度：${simplifiedPlan.metadata.contentDepth}，匹配创意成熟度`
      ],
      controversialPoints: []
    },

    // AI洞察
    aiInsights: {
      overallAssessment: {
        summary: `创意成熟度${simplifiedPlan.metadata.maturityScore}/10，采用简化版结构更适合当前阶段`,
        score: simplifiedPlan.metadata.maturityScore,
        level: simplifiedPlan.metadata.maturityLevel,
        keyStrengths: ['结构清晰', 'AI专家协作', '内容个性化'],
        criticalChallenges: ['需要持续验证', '团队组建', '市场推广']
      },
      sustainabilityAnalysis: {
        longTermViability: '基于4模块结构的持续迭代优化',
        persistenceFactors: ['清晰的商业模式', '验证策略完整', '资源规划合理'],
        riskMitigation: simplifiedPlan.validationAndIteration.riskMitigation.map(r => r.risk)
      }
    },

    // 元数据
    metadata: {
      ideaTitle: simplifiedPlan.metadata.ideaTitle,
      generatedAt: simplifiedPlan.metadata.generatedAt,
      implementationTimeframe: '3-6个月',
      estimatedReadTime: simplifiedPlan.metadata.contentDepth === 'basic' ? 10 :
                          simplifiedPlan.metadata.contentDepth === 'detailed' ? 15 : 20,
      confidenceLevel: Math.round(simplifiedPlan.metadata.confidence * 100)
    }
  }
}

