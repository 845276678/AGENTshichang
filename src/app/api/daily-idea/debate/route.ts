import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-helper';
import { AIServiceManager } from '@/lib/ai-service-manager';

export const dynamic = 'force-dynamic'


// 创意辩论API - 用户评论后AI进行智能回应
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const { ideaId, userComment, commentType } = await request.json();

    if (!userComment?.trim()) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 });
    }

    // 获取创意信息
    const dailyIdea = await prisma.dailyIdea.findUnique({
      where: { id: ideaId },
      include: {
        debates: {
          where: user ? { userId: user.id } : {},
          orderBy: { createdAt: 'desc' },
          take: 10 // 最近10次对话
        }
      }
    });

    if (!dailyIdea) {
      return NextResponse.json({ error: '创意不存在' }, { status: 404 });
    }

    // 分析用户评论
    const commentAnalysis = await analyzeUserComment(userComment, dailyIdea, commentType);

    // 生成AI回应
    const aiResponse = await generateAIDebateResponse(
      dailyIdea,
      userComment,
      commentAnalysis,
      dailyIdea.debates
    );

    // 保存对话记录
    let debateRecord = null;
    if (user) {
      // 获取当前积分
      const currentPoints = await prisma.userPoints.findUnique({
        where: { userId: user.id }
      });

      debateRecord = await prisma.ideaDebate.create({
        data: {
          dailyIdeaId: ideaId,
          userId: user.id,
          userComment,
          commentType: commentAnalysis.type || 'GENERAL',
          commentQuality: commentAnalysis.quality,
          aiResponse: aiResponse.content,
          aiResponseType: aiResponse.responseType || 'GUIDE',
          aiPersona: aiResponse.aiPersona || '创意导师',
          aiReasoning: aiResponse.reasoning,
          followUpQuestions: aiResponse.followUpQuestions || [],
          improvements: aiResponse.suggestions || []
        }
      });

      // 给予积分奖励（基于评论质量）
      const pointsEarned = Math.min(5, Math.max(1, Math.floor(commentAnalysis.quality / 2)));

      await prisma.userPoints.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          totalPoints: pointsEarned,
          dailyPoints: pointsEarned,
          weeklyPoints: pointsEarned,
          level: 1,
          experience: pointsEarned * 10
        },
        update: {
          totalPoints: { increment: pointsEarned },
          dailyPoints: { increment: pointsEarned },
          experience: { increment: pointsEarned * 10 }
        }
      });

      // 记录积分交易
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          type: 'DAILY_PARTICIPATION',
          amount: pointsEarned,
          reason: '创意辩论参与',
          relatedId: debateRecord.id,
          balanceBefore: currentPoints?.totalPoints || 0,
          balanceAfter: (currentPoints?.totalPoints || 0) + pointsEarned
        }
      });
    }

    return NextResponse.json({
      success: true,
      debate: {
        id: debateRecord?.id,
        userComment,
        commentAnalysis,
        aiResponse,
        pointsEarned: user ? Math.min(5, Math.max(1, Math.floor(commentAnalysis.quality / 2))) : 0,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('创意辩论失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

/**
 * 分析用户评论
 */
async function analyzeUserComment(comment: string, idea: any, commentType?: string) {
  try {
    const aiManager = new AIServiceManager();

    const analysisPrompt = `
请分析用户对以下创意的评论：

创意标题: ${idea.title}
创意描述: ${idea.description}
创意领域: ${idea.domain.join(', ')}
创意成熟度: ${idea.maturity}%

用户评论: "${comment}"

请从以下维度分析这个评论：
1. 评论类型 (critique/suggestion/question/praise)
2. 涉及的方面 (技术/商业/用户体验/市场/风险等)
3. 情感倾向 (positive/negative/neutral)
4. 评论质量 (1-10分，考虑深度、建设性、专业性)
5. 主要观点和论据
6. 是否包含有价值的洞察

请返回JSON格式的分析结果。
`;

    const response = await aiManager.callSingleService({
      provider: 'deepseek',
      persona: 'tech-pioneer-alex',
      context: {
        ideaContent: `${idea.title} - ${idea.description}`,
        phase: 'analysis',
        userFeedback: comment
      },
      systemPrompt: '你是一个专业的创意分析师，擅长分析和评估创意相关的讨论内容。',
      userPrompt: analysisPrompt,
      temperature: 0.3,
      maxTokens: 800
    });

    // 尝试解析AI返回的JSON
    let analysis;
    try {
      analysis = JSON.parse(response.content);
    } catch {
      // 如果解析失败，使用默认分析
      analysis = {
        type: commentType || 'suggestion',
        aspects: ['general'],
        sentiment: 'neutral',
        quality: Math.min(8, Math.max(3, Math.floor(comment.length / 20))),
        mainPoints: [comment.substring(0, 100)],
        hasValuableInsights: comment.length > 50
      };
    }

    return analysis;

  } catch (error) {
    console.error('分析用户评论失败:', error);
    // 返回基础分析
    return {
      type: commentType || 'suggestion',
      aspects: ['general'],
      sentiment: 'neutral',
      quality: Math.min(8, Math.max(3, Math.floor(comment.length / 20))),
      mainPoints: [comment.substring(0, 100)],
      hasValuableInsights: comment.length > 50
    };
  }
}

/**
 * 生成AI辩论回应
 */
async function generateAIDebateResponse(idea: any, userComment: string, analysis: any, previousDebates: any[]) {
  try {
    const aiManager = new AIServiceManager();

    // 构建对话历史
    const conversationHistory = previousDebates.map(debate =>
      `用户: ${debate.userComment}\nAI: ${debate.aiResponse}`
    ).join('\n\n');

    // 根据分析结果选择AI角色和回应策略
    const aiPersona = selectAIPersona(analysis);
    const responseStrategy = determineResponseStrategy(analysis);

    const debatePrompt = `
你是一个${aiPersona.name}，正在与用户讨论以下创意：

创意信息:
- 标题: ${idea.title}
- 描述: ${idea.description}
- 领域: ${idea.domain.join(', ')}
- 成熟度: ${idea.maturity}%
- 引导问题: ${idea.guidingQuestions?.join('; ') || '无'}
- 实施提示: ${idea.implementationHints?.join('; ') || '无'}

对话历史:
${conversationHistory}

用户最新评论: "${userComment}"

评论分析:
- 类型: ${analysis.type}
- 涉及方面: ${analysis.aspects?.join(', ') || '综合'}
- 情感: ${analysis.sentiment}
- 质量分数: ${analysis.quality}/10

回应策略: ${responseStrategy}

请根据你的角色特点和回应策略，对用户的评论进行回应。你的回应应该：

1. ${getResponseGuidelines(responseStrategy)}
2. 保持${aiPersona.name}的角色特点
3. 如果用户说得对，要诚恳赞同并扩展
4. 如果用户有误解，要礼貌反驳并解释
5. 如果用户的想法不完善，要引导他们深入思考
6. 提出2-3个具体的后续问题，激发更深层的思考

请返回JSON格式：
{
  "responseType": "agree/disagree/guide/expand",
  "content": "你的回应内容",
  "reasoning": "你的推理过程",
  "followUpQuestions": ["问题1", "问题2", "问题3"],
  "suggestions": ["建议1", "建议2"]
}
`;

    const response = await aiManager.callSingleService({
      provider: aiPersona.provider,
      persona: aiPersona.name,
      context: {
        ideaContent: `${idea.title} - ${idea.description}`,
        phase: 'debate',
        userFeedback: userComment,
        previousContext: conversationHistory ? [conversationHistory] : []
      },
      systemPrompt: aiPersona.systemPrompt,
      userPrompt: debatePrompt,
      temperature: 0.7,
      maxTokens: 1500
    });

    // 尝试解析AI返回的JSON
    let aiResponse;
    try {
      aiResponse = JSON.parse(response.content);
    } catch {
      // 如果解析失败，创建默认回应
      aiResponse = {
        responseType: responseStrategy,
        content: response.content,
        reasoning: "基于用户评论的综合分析",
        followUpQuestions: [
          "你认为这个创意最大的挑战是什么？",
          "如何验证这个想法的可行性？"
        ],
        suggestions: ["进一步调研市场需求", "制作原型验证假设"]
      };
    }

    return aiResponse;

  } catch (error) {
    console.error('生成AI辩论回应失败:', error);
    // 返回默认回应
    return {
      responseType: 'guide',
      content: '感谢你的分享！你提出了很有价值的观点。我们来进一步探讨一下这个想法的可行性和改进空间。',
      reasoning: '鼓励用户继续参与讨论',
      followUpQuestions: [
        '你觉得这个创意面临的最大挑战是什么？',
        '有什么具体的解决方案吗？'
      ],
      suggestions: ['深入分析目标用户群体', '考虑技术实现的复杂度']
    };
  }
}

/**
 * 选择AI角色
 */
function selectAIPersona(analysis: any) {
  if (analysis.sentiment === 'negative' || analysis.type === 'critique') {
    return {
      name: '创意导师',
      provider: 'zhipu',
      systemPrompt: '你是一位耐心的创意导师，善于将批评转化为建设性的讨论，帮助用户看到问题的多个角度。'
    };
  }

  if (analysis.quality > 7) {
    return {
      name: '创新伙伴',
      provider: 'deepseek',
      systemPrompt: '你是一位智慧的创新伙伴，擅长与高质量的观点进行深度对话，共同完善创意想法。'
    };
  }

  return {
    name: '思维引导者',
    provider: 'qwen',
    systemPrompt: '你是一位思维引导者，擅长通过提问和引导帮助用户深入思考，发现更多可能性。'
  };
}

/**
 * 确定回应策略
 */
function determineResponseStrategy(analysis: any) {
  if (analysis.sentiment === 'positive' && analysis.quality > 6) {
    return 'expand'; // 扩展和深化
  }

  if (analysis.sentiment === 'negative' && analysis.hasValuableInsights) {
    return 'disagree'; // 礼貌反驳
  }

  if (analysis.type === 'question' || analysis.quality < 5) {
    return 'guide'; // 引导思考
  }

  return 'agree'; // 赞同并扩展
}

/**
 * 获取回应指导原则
 */
function getResponseGuidelines(strategy: string) {
  const guidelines = {
    agree: '赞同用户的观点，并在此基础上提供更深入的见解和扩展',
    disagree: '礼貌地指出不同观点，提供有说服力的论据和替代方案',
    guide: '通过提问和引导帮助用户更深入地思考这个问题',
    expand: '在用户观点的基础上进行扩展，提出新的角度和可能性'
  };

  return guidelines[strategy] || guidelines.guide;
}