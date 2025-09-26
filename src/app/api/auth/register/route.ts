import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 注册API开始处理...');

    // 解析请求体
    const body = await request.json();
    console.log('✅ 请求体解析成功:', { email: body.email, username: body.username });

    const { email, username, password, firstName, lastName } = body;

    // 基本验证
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '邮箱和密码不能为空'
      }, { status: 400 });
    }

    if (!username) {
      return NextResponse.json({
        success: false,
        message: '用户名不能为空'
      }, { status: 400 });
    }

    // 简单的密码强度验证
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: '密码至少需要6个字符'
      }, { status: 400 });
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: '请输入有效的邮箱地址'
      }, { status: 400 });
    }

    // 检查用户是否已存在
    console.log('🔍 检查用户是否已存在...');
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      const message = existingUser.email === email.toLowerCase()
        ? '该邮箱已被注册'
        : '该用户名已被使用';
      return NextResponse.json({
        success: false,
        message
      }, { status: 400 });
    }

    // 哈希密码
    console.log('🔍 加密密码...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ 密码加密成功');

    // 创建用户
    console.log('🔍 创建用户...');
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        firstName: firstName || '',
        lastName: lastName || '',
        credits: 100, // 新用户奖励积分
        level: 'BEGINNER',
        isEmailVerified: false,
        avatar: null,
        role: 'USER',
        status: 'ACTIVE',
        totalSpent: 0,
        totalEarned: 0,
        lastLoginAt: new Date()
      }
    });

    console.log('✅ 用户创建成功:', newUser.id);

    // 生成JWT令牌
    console.log('🔍 生成JWT...');
    const accessToken = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      {
        userId: newUser.id,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: '7d' }
    );

    console.log('✅ JWT生成成功');

    // 创建用户会话
    console.log('🔍 创建用户会话...');
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1';

    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7);

    await prisma.userSession.create({
      data: {
        userId: newUser.id,
        token: accessToken,
        ipAddress,
        userAgent,
        expiresAt: sessionExpiresAt
      }
    });

    console.log('✅ 用户会话创建成功');

    // 存储刷新令牌
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: newUser.id,
        expiresAt: refreshTokenExpiresAt,
        isRevoked: false
      }
    });

    // 创建注册奖励积分记录
    await prisma.creditTransaction.create({
      data: {
        userId: newUser.id,
        amount: 100,
        type: 'REGISTER_BONUS',
        description: '新用户注册奖励',
        balanceBefore: 0,
        balanceAfter: 100
      }
    });

    console.log('✅ 注册成功完成');

    // 构建响应
    const response = NextResponse.json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          credits: newUser.credits,
          level: newUser.level,
          isEmailVerified: newUser.isEmailVerified,
          avatar: newUser.avatar,
          role: newUser.role,
          status: newUser.status
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    }, { status: 201 });

    // 设置安全头
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;

  } catch (error) {
    console.error('❌ 注册API错误:', error);

    // 返回通用错误响应，不暴露具体错误信息
    return NextResponse.json({
      success: false,
      message: '注册失败，请稍后重试',
      ...(process.env.NODE_ENV === 'development' && {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }, { status: 500 });
  } finally {
    // 确保Prisma连接正确关闭
    await prisma.$disconnect().catch(() => {});
  }
}