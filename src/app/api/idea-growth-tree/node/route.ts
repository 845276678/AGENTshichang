import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-helper';
import { z } from 'zod';

export const dynamic = 'force-dynamic'

const nodeSchema = z.object({
  treeId: z.string(),
  content: z.string().min(10, '内容至少需要10个字符'),
  reason: z.string().optional(),
  impact: z.enum(['MINOR', 'MAJOR', 'PIVOT']),
  tags: z.array(z.string()).default([]),
  parentId: z.string().optional()
});

// 添加创意节点
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = nodeSchema.parse(body);

    // 验证树是否属于当前用户
    const tree = await prisma.ideaGrowthTree.findFirst({
      where: {
        id: validatedData.treeId,
        userId: user.id
      }
    });

    if (!tree) {
      return NextResponse.json({ error: '创意树不存在或无权限' }, { status: 404 });
    }

    // 验证父节点存在（如果指定了）
    if (validatedData.parentId) {
      const parentNode = await prisma.ideaModification.findFirst({
        where: {
          treeId: validatedData.treeId,
          nodeId: validatedData.parentId
        }
      });

      if (!parentNode) {
        return NextResponse.json({ error: '父节点不存在' }, { status: 400 });
      }
    }

    // 生成新节点ID
    const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 计算成熟度（基于内容长度和复杂度）
    const maturity = calculateNodeMaturity(validatedData.content, validatedData.impact);

    // 在事务中创建节点和更新树统计
    const result = await prisma.$transaction(async (tx) => {
      // 创建节点
      const node = await tx.ideaModification.create({
        data: {
          treeId: validatedData.treeId,
          nodeId,
          parentId: validatedData.parentId,
          content: validatedData.content,
          reason: validatedData.reason,
          impact: validatedData.impact,
          tags: validatedData.tags,
          maturity
        }
      });

      // 计算新的统计信息
      const allNodes = await tx.ideaModification.findMany({
        where: { treeId: validatedData.treeId },
        select: { nodeId: true, parentId: true }
      });

      const totalNodes = allNodes.length;
      const maxDepth = calculateMaxDepth(allNodes);

      // 更新树统计
      await tx.ideaGrowthTree.update({
        where: { id: validatedData.treeId },
        data: {
          totalNodes,
          maxDepth,
          updatedAt: new Date()
        }
      });

      return node;
    });

    return NextResponse.json({
      success: true,
      nodeId: result.nodeId,
      maturity,
      message: '节点添加成功'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('添加创意节点失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 计算节点成熟度
function calculateNodeMaturity(content: string, impact: string): number {
  let maturity = 30; // 基础分

  // 基于内容长度
  if (content.length > 100) maturity += 20;
  if (content.length > 200) maturity += 15;
  if (content.length > 500) maturity += 10;

  // 基于影响程度
  switch (impact) {
    case 'MINOR':
      maturity += 5;
      break;
    case 'MAJOR':
      maturity += 15;
      break;
    case 'PIVOT':
      maturity += 25;
      break;
  }

  // 检查关键词
  const keywords = ['具体', '实施', '计划', '测试', '验证', '数据', '用户', '市场'];
  const keywordCount = keywords.filter(keyword => content.includes(keyword)).length;
  maturity += keywordCount * 3;

  return Math.min(maturity, 100);
}

// 计算最大深度
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