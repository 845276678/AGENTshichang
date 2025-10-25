import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'


// 获取压力测试场景列表
export async function GET(request: NextRequest) {
  try {
    const scenarios = await prisma.pressureTestScenario.findMany({
      where: { isActive: true },
      orderBy: [
        { isPersonalized: 'desc' }, // 个性化场景优先
        { usageCount: 'desc' },     // 使用次数多的优先
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ scenarios });

  } catch (error) {
    console.error('获取压力测试场景失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}