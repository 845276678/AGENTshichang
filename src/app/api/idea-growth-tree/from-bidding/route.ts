import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-helper';
import { z } from 'zod';

// 竞价数据结构验证
const biddingDataSchema = z.object({
  ideaId: z.string(),
  ideaContent: z.string(),
  userContext: z.object({
    supplements: z.array(z.object({
      category: z.string(),
      content: z.string(),
      timestamp: z.date().or(z.string())
    })).optional()
  }).optional(),
  biddingResults: z.object({
    winningBid: z.number(),
    winningPersona: z.string().nullable(),
    winnerName: z.string(),
    averageBid: z.number(),
    totalBids: z.number(),
    bids: z.record(z.number()),
    participants: z.array(z.object({
      personaId: z.string(),
      name: z.string(),
      specialty: z.string(),
      bidAmount: z.number(),
      participated: z.boolean()
    }))
  }),
  expertDiscussions: z.array(z.object({
    personaId: z.string(),
    personaName: z.string(),
    content: z.string(),
    emotion: z.string(),
    bidValue: z.number().optional(),
    timestamp: z.string()
  })),
  metadata: z.object({
    sessionDuration: z.number(),
    totalMessages: z.number(),
    supportCount: z.number(),
    phase: z.string()
  })
});

// 从竞价数据生成创意生长树
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📥 收到竞价数据导出请求:', {
      ideaId: body.ideaId,
      messagesCount: body.expertDiscussions?.length || 0,
      bidsCount: body.biddingResults?.totalBids || 0
    });

    const validatedData = biddingDataSchema.parse(body);

    // 检查是否已存在该创意的生长树
    const existingTree = await prisma.ideaGrowthTree.findFirst({
      where: {
        userId: user.id,
        rootIdeaId: validatedData.ideaId
      }
    });

    let tree;
    if (existingTree) {
      console.log('📖 找到现有生长树，将在其基础上扩展:', existingTree.id);
      tree = existingTree;
    } else {
      // 创建新的创意生长树
      const treeTitle = `竞价结果：${validatedData.ideaContent.substring(0, 20)}...`;
      const treeDescription = `基于AI专家团队竞价分析自动生成的创意演进记录（最高出价：¥${validatedData.biddingResults.winningBid}）`;

      tree = await prisma.ideaGrowthTree.create({
        data: {
          userId: user.id,
          title: treeTitle,
          description: treeDescription,
          rootIdeaId: validatedData.ideaId,
          treeData: {},
          totalNodes: 0,
          maxDepth: 0
        }
      });

      console.log('✅ 创建新生长树:', tree.id);
    }

    // 生成节点数据
    const nodes = generateGrowthTreeNodes(validatedData);
    console.log('🌱 生成节点数量:', nodes.length);

    // 在事务中批量创建节点
    const result = await prisma.$transaction(async (tx) => {
      const createdNodes = [];

      for (const nodeData of nodes) {
        const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const node = await tx.ideaModification.create({
          data: {
            treeId: tree.id,
            nodeId,
            parentId: nodeData.parentId || null,
            content: nodeData.content,
            reason: nodeData.reason || null,
            impact: nodeData.impact,
            tags: nodeData.tags,
            maturity: nodeData.maturity
          }
        });

        createdNodes.push(node);
      }

      // 计算新的统计信息
      const allNodes = await tx.ideaModification.findMany({
        where: { treeId: tree.id },
        select: { nodeId: true, parentId: true }
      });

      const totalNodes = allNodes.length;
      const maxDepth = calculateMaxDepth(allNodes);

      // 更新树统计
      await tx.ideaGrowthTree.update({
        where: { id: tree.id },
        data: {
          totalNodes,
          maxDepth,
          updatedAt: new Date()
        }
      });

      return { tree, nodes: createdNodes, totalNodes, maxDepth };
    });

    console.log('✅ 生长树节点创建完成:', {
      treeId: result.tree.id,
      nodesCreated: result.nodes.length,
      totalNodes: result.totalNodes,
      maxDepth: result.maxDepth
    });

    return NextResponse.json({
      success: true,
      treeId: result.tree.id,
      nodesCreated: result.nodes.length,
      totalNodes: result.totalNodes,
      maxDepth: result.maxDepth,
      message: '竞价数据已成功导入创意生长树'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 数据验证失败:', error.errors);
      return NextResponse.json(
        { error: `数据格式错误: ${error.errors[0].message}` },
        { status: 400 }
      );
    }

    console.error('❌ 创建创意生长树失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 从竞价数据生成生长树节点
function generateGrowthTreeNodes(data: z.infer<typeof biddingDataSchema>) {
  const nodes = [];

  // 1. 根节点：原始创意
  nodes.push({
    parentId: null,
    content: `原始创意：${data.ideaContent}`,
    reason: '竞价会话的起始创意',
    impact: 'MAJOR' as const,
    tags: ['原始创意', '竞价起点'],
    maturity: 60
  });

  // 2. 竞价结果摘要节点
  const winnerInfo = data.biddingResults.winnerName || 'AI专家团队';
  nodes.push({
    parentId: null, // 将通过索引确定父节点
    content: `竞价结果：最高出价¥${data.biddingResults.winningBid}，由${winnerInfo}获胜。共有${data.biddingResults.totalBids}位专家参与，平均出价¥${data.biddingResults.averageBid}。`,
    reason: '专家团队对创意价值的市场化评估',
    impact: 'MAJOR' as const,
    tags: ['竞价结果', '市场评估', `¥${data.biddingResults.winningBid}`],
    maturity: 85
  });

  // 3. 用户补充节点（如果有）
  if (data.userContext?.supplements && data.userContext.supplements.length > 0) {
    data.userContext.supplements.forEach((supplement, index) => {
      nodes.push({
        parentId: null, // 将通过索引确定父节点
        content: `用户补充 ${index + 1}：${supplement.content}`,
        reason: '用户基于专家讨论进行的创意完善',
        impact: 'MINOR' as const,
        tags: ['用户补充', supplement.category || 'general'],
        maturity: 70
      });
    });
  }

  // 4. 关键专家观点节点（选择出价前3的专家）
  const topExperts = data.expertDiscussions
    .filter(expert => expert.bidValue && expert.bidValue > 0)
    .sort((a, b) => (b.bidValue || 0) - (a.bidValue || 0))
    .slice(0, 3);

  topExperts.forEach((expert, index) => {
    const emotionTag = getEmotionTag(expert.emotion);
    nodes.push({
      parentId: null, // 将通过索引确定父节点
      content: `${expert.personaName}观点：${expert.content}（出价：¥${expert.bidValue}）`,
      reason: `排名第${index + 1}的专家深度分析`,
      impact: index === 0 ? 'MAJOR' as const : 'MINOR' as const,
      tags: ['专家观点', expert.personaName, emotionTag, `¥${expert.bidValue}`],
      maturity: 75 + (3 - index) * 5 // 排名越高成熟度越高
    });
  });

  // 5. 情感趋势分析节点
  const emotionCounts = data.expertDiscussions.reduce((acc, expert) => {
    acc[expert.emotion] = (acc[expert.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantEmotion = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)[0];

  if (dominantEmotion) {
    const [emotion, count] = dominantEmotion;
    nodes.push({
      parentId: null, // 将通过索引确定父节点
      content: `专家情感趋势：${getEmotionDescription(emotion)}占主导（${count}/${data.expertDiscussions.length}），反映了专家团队对创意的整体态度。`,
      reason: '基于专家情感分析的市场信心评估',
      impact: 'MINOR' as const,
      tags: ['情感分析', emotion, '市场信心'],
      maturity: 65
    });
  }

  // 6. 会话统计洞察节点
  const sessionInsights = `会话洞察：${data.metadata.totalMessages}条专家讨论，持续${Math.round(data.metadata.sessionDuration / 60000)}分钟，获得${data.metadata.supportCount}次用户支持。`;
  nodes.push({
    parentId: null, // 将通过索引确定父节点
    content: sessionInsights,
    reason: '竞价会话的参与度和活跃度分析',
    impact: 'MINOR' as const,
    tags: ['会话统计', '参与度', '活跃度'],
    maturity: 55
  });

  return nodes;
}

// 获取情感标签
function getEmotionTag(emotion: string): string {
  const emotionMap: Record<string, string> = {
    'confident': '自信',
    'excited': '兴奋',
    'happy': '乐观',
    'neutral': '中性',
    'worried': '担忧',
    'angry': '质疑'
  };
  return emotionMap[emotion] || emotion;
}

// 获取情感描述
function getEmotionDescription(emotion: string): string {
  const descriptions: Record<string, string> = {
    'confident': '专家信心满满',
    'excited': '专家高度兴奋',
    'happy': '专家持乐观态度',
    'neutral': '专家保持中性',
    'worried': '专家表示担忧',
    'angry': '专家持质疑态度'
  };
  return descriptions[emotion] || `专家表现为${emotion}`;
}

// 计算最大深度（复用现有逻辑）
function calculateMaxDepth(nodes: Array<{nodeId: string, parentId: string | null}>): number {
  const nodeMap = new Map(nodes.map(node => [node.nodeId, node]));
  let maxDepth = 0;

  const getDepth = (nodeId: string, visited = new Set<string>()): number => {
    if (visited.has(nodeId)) return 0; // 避免循环
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node || !node.parentId) return 1;

    return 1 + getDepth(node.parentId, visited);
  };

  nodes.forEach(node => {
    const depth = getDepth(node.nodeId);
    maxDepth = Math.max(maxDepth, depth);
  });

  return maxDepth;
}