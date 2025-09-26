import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 登录API开始处理...');

    // 解析请求体
    const body = await request.json();
    console.log('✅ 请求体解析成功:', { email: body.email });

    const { email, password, rememberMe = false } = body;

    // 基本验证
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '邮箱和密码不能为空'
      }, { status: 400 });
    }

    // 查找用户
    console.log('🔍 查找用户...');
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: email.toLowerCase() }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        credits: true,
        level: true,
        isEmailVerified: true,
        avatar: true,
        role: true,
        status: true
      }
    });

    console.log('✅ 用户查询完成:', user ? '找到用户' : '未找到用户');

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '邮箱或密码错误'
      }, { status: 401 });
    }

    // 检查用户状态
    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return NextResponse.json({
        success: false,
        message: '账户已被暂停，请联系管理员'
      }, { status: 401 });
    }

    // 验证密码
    console.log('🔍 验证密码...');
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log('✅ 密码验证:', isValidPassword ? '成功' : '失败');

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: '邮箱或密码错误'
      }, { status: 401 });
    }

    // 生成JWT令牌
    console.log('🔍 生成JWT...');
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: rememberMe ? '30d' : '7d' }
    );

    console.log('✅ JWT生成成功');

    // 创建用户会话
    console.log('🔍 创建用户会话...');
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1';

    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + (rememberMe ? 30 : 7));

    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        ipAddress,
        userAgent,
        expiresAt: sessionExpiresAt
      }
    });

    console.log('✅ 用户会话创建成功');

    // 存储刷新令牌
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + (rememberMe ? 30 : 7));

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
        isRevoked: false
      }
    });

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    console.log('✅ 登录成功完成');

    // 构建响应
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          credits: user.credits,
          level: user.level,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar,
          role: user.role,
          status: user.status
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

    // 设置安全头
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // 设置刷新令牌Cookie（如果选择记住我）
    if (rememberMe) {
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });
    }

    return response;

  } catch (error) {
    console.error('❌ 登录API错误:', error);

    // 返回通用错误响应，不暴露具体错误信息
    return NextResponse.json({
      success: false,
      message: '登录失败，请稍后重试',
      ...(process.env.NODE_ENV === 'development' && {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }, { status: 500 });
  } finally {
    // 确保Prisma连接正确关闭
    await prisma.$disconnect().catch(() => {});
  }
}