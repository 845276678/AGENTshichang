import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic'


/**
 * 获取当前用户会话信息
 * 兼容NextAuth.js的session API格式
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Session API - 获取会话信息...');

    // 从Authorization header获取token
    const authHeader = request.headers.get('authorization');

    // 也检查cookies中的token（兼容前端框架）
    const cookieToken = request.cookies.get('auth-token')?.value;

    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      console.log('⚪ 未提供认证令牌');
      return NextResponse.json({
        user: null,
        expires: null
      });
    }

    try {
      // 验证token并获取用户信息
      const payload = await verifyToken(token);
      const user = await getCurrentUser(token);

      const sessionData = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username,
          image: user.avatar,
          role: user.role,
          credits: user.credits,
          isEmailVerified: user.isEmailVerified
        },
        expires: new Date(payload.exp * 1000).toISOString(),
        accessToken: token
      };

      console.log('✅ 会话验证成功，用户:', user.email);

      return NextResponse.json(sessionData);

    } catch (tokenError) {
      console.log('❌ Token验证失败:', tokenError);
      return NextResponse.json({
        user: null,
        expires: null
      });
    }

  } catch (error) {
    console.error('❌ Session API错误:', error);
    return NextResponse.json({
      user: null,
      expires: null,
      error: 'Internal server error'
    });
  }
}

/**
 * 删除会话（登出）
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('🚪 Session API - 用户登出...');

    // 从header或cookie获取token
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (token) {
      try {
        const payload = await verifyToken(token);

        // 这里可以添加黑名单逻辑，或标记token为无效
        // 暂时只是记录日志
        console.log('✅ 用户登出成功，用户ID:', payload.userId);
      } catch (error) {
        console.log('⚪ Token已经无效或过期');
      }
    }

    // 创建清除cookie的响应
    const response = NextResponse.json({
      success: true,
      message: '登出成功'
    });

    // 清除auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ 登出API错误:', error);
    return NextResponse.json({
      success: false,
      message: '登出失败'
    }, { status: 500 });
  }
}