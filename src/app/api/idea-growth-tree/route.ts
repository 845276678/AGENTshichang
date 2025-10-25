import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-helper';

export const dynamic = 'force-dynamic'

// 获取用户的创意生长树列表
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const trees = await prisma.ideaGrowthTree.findMany({
      where: { userId: user.id },
      include: {
        modifications: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // 转换数据格式
    const formattedTrees = trees.map(tree => ({
      id: tree.id,
      title: tree.title,
      description: tree.description,
      rootIdeaId: tree.rootIdeaId,
      totalNodes: tree.totalNodes,
      maxDepth: tree.maxDepth,
      createdAt: tree.createdAt,
      updatedAt: tree.updatedAt,
      nodes: tree.modifications.map(mod => ({
        id: mod.nodeId,
        content: mod.content,
        maturity: mod.maturity,
        parentId: mod.parentId,
        timestamp: mod.createdAt,
        tags: mod.tags,
        impact: mod.impact,
        reason: mod.reason
      }))
    }));

    return NextResponse.json({ trees: formattedTrees });

  } catch (error) {
    console.error('获取创意生长树失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建新的创意生长树
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { title, description, rootIdeaId } = await request.json();

    if (!title || !rootIdeaId) {
      return NextResponse.json(
        { error: '标题和根创意ID是必需的' },
        { status: 400 }
      );
    }

    const tree = await prisma.ideaGrowthTree.create({
      data: {
        userId: user.id,
        title,
        description,
        rootIdeaId,
        treeData: {},
        totalNodes: 1,
        maxDepth: 1
      }
    });

    return NextResponse.json({ success: true, treeId: tree.id });

  } catch (error) {
    console.error('创建创意生长树失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}