import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * 从请求中获取用户信息的简化辅助函数
 * 替代复杂的auth.ts中的getUserFromToken函数
 */
export async function getUserFromToken(request: NextRequest) {
  try {
    // 获取Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: '未提供认证令牌'
      };
    }

    const token = authHeader.split(' ')[1];

    // 验证JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    } catch (error) {
      return {
        success: false,
        error: '无效的认证令牌'
      };
    }

    // 获取用户信息
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
      return {
        success: false,
        error: '用户不存在'
      };
    }

    // 检查用户状态
    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return {
        success: false,
        error: '账户已被暂停'
      };
    }

    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('❌ 用户认证错误:', error);
    return {
      success: false,
      error: '认证失败'
    };
  }
}

/**
 * 验证用户是否有管理员权限
 */
export async function requireAdmin(request: NextRequest) {
  const authResult = await getUserFromToken(request);

  if (!authResult.success) {
    return authResult;
  }

  if (authResult.user.role !== 'ADMIN') {
    return {
      success: false,
      error: '需要管理员权限'
    };
  }

  return authResult;
}

/**
 * 从请求中获取用户信息的简化辅助函数（可选用户）
 */
export async function getUserFromRequest(request: NextRequest) {
  try {
    const authResult = await getUserFromToken(request);
    return authResult.success ? authResult.user : null;
  } catch (error) {
    // 忽略错误，返回null表示未登录
    console.warn('getUserFromRequest error (ignored):', error);
    return null;
  }
}