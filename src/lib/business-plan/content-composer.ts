import { buildCoreGuide } from './core-guide-builder'
import { buildExecutionPlan } from './practical-planner'
import { generatePersonalizedRecommendations, formatRecommendationsAsMarkdown } from './personalized-recommendations'
import { FocusGuidanceBuilder } from './focus-guidance-builder'
import type { BiddingSnapshot, BusinessPlanMetadata, BusinessPlanGuide } from './types'
import type { MaturityScoreResult } from '@/types/maturity-score'

export interface ComposeGuideOptions {
  industry?: string
  teamStrength?: string
  maturityScore?: MaturityScoreResult | null // 🆕 成熟度评分
}

export interface ComposedBusinessPlan {
  guide: BusinessPlanGuide
  metadata: BusinessPlanMetadata
}

/**
 * 根据成熟度评分生成差异化的商业计划书
 * - LOW/GRAY_LOW (1-5分): 聚焦引导模板 (The Mom Test 问题清单)
 * - MEDIUM (5-7分): 详细商业计划书 (15-25页)
 * - GRAY_HIGH/HIGH (7-10分): 投资级商业计划书 (30-50页)
 */
export async function composeBusinessPlanGuide(
  snapshot: BiddingSnapshot,
  options: ComposeGuideOptions = {}
): Promise<ComposedBusinessPlan> {
  const { maturityScore } = options;

  // 🔴 LOW/GRAY_LOW: 返回聚焦引导模板
  if (maturityScore && (maturityScore.level === 'LOW' || maturityScore.level === 'GRAY_LOW')) {
    console.log(`📍 创意成熟度${maturityScore.level} (${maturityScore.totalScore}/10)，生成聚焦引导模板`);

    const guidanceBuilder = new FocusGuidanceBuilder();
    const focusGuide = guidanceBuilder.generate(maturityScore, snapshot.ideaDescription || '');
    const markdownGuide = guidanceBuilder.exportToMarkdown(focusGuide);

    // 返回简化的 guide 结构
    const guide: BusinessPlanGuide = {
      title: focusGuide.title,
      introduction: focusGuide.summary,
      // 将聚焦引导内容放入 executionPlan
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
      }
    };

    const metadata: BusinessPlanMetadata = {
      version: '2.0-focus-guidance',
      generatedAt: new Date().toISOString(),
      source: 'focus-guidance',
      maturityLevel: maturityScore.level,
      maturityScore: maturityScore.totalScore,
      confidence: maturityScore.confidence
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

  // 🆕 在 metadata 中包含成熟度评分
  if (maturityScore) {
    metadata.maturityLevel = maturityScore.level;
    metadata.maturityScore = maturityScore.totalScore;
    metadata.confidence = maturityScore.confidence;
  }

  return { guide, metadata }
}

