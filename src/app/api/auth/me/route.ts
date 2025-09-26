import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 获取用户信息API开始处理...');

    // 获取Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: '未提供认证令牌'
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // 验证JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: '无效的认证令牌'
      }, { status: 401 });
    }

    console.log('✅ JWT验证成功，用户ID:', decoded.userId);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        credits: true,
        level: true,
        isEmailVerified: true,
        avatar: true,
        role: true,
        status: true,
        totalSpent: true,
        totalEarned: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 检查用户状态
    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return NextResponse.json({
        success: false,
        message: '账户已被暂停'
      }, { status: 401 });
    }

    console.log('✅ 用户信息获取成功');

    return NextResponse.json({
      success: true,
      data: user,
      message: '用户信息获取成功'
    });

  } catch (error) {
    console.error('❌ 获取用户信息API错误:', error);

    return NextResponse.json({
      success: false,
      message: '服务器内部错误',
      ...(process.env.NODE_ENV === 'development' && {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}