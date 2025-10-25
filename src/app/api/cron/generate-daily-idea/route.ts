import { NextRequest, NextResponse } from 'next/server';
import { DailyIdeaService } from '@/lib/services/daily-idea.service';

export const dynamic = 'force-dynamic'


/**
 * Vercel Cron Job API
 * 每天8点自动执行，生成每日创意
 *
 * Cron配置在vercel.json中：
 * "schedule": "0 8 * * *"  # 每天8点执行
 */
export async function GET(request: NextRequest) {
  // 验证请求来自Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('⏰ Vercel Cron触发: 开始生成每日创意');

    // 检查今天是否已有创意
    const today = new Date();
    today.setHours(8, 0, 0, 0);

    const existingIdea = await prisma.dailyIdea.findUnique({
      where: { publishDate: today }
    });

    if (existingIdea) {
      console.log('✅ 今日创意已存在，无需重复生成');
      return NextResponse.json({
        success: true,
        message: '今日创意已存在',
        idea: {
          id: existingIdea.id,
          title: existingIdea.title
        }
      });
    }

    // 生成新创意（使用AI）
    const idea = await DailyIdeaService.generateDailyIdea({
      excludeRecentDomains: true,
      useAI: true // 使用AI生成
    });

    // 保存到数据库
    const savedId = await DailyIdeaService.createDailyIdea(idea, today);

    console.log('✅ 每日创意生成成功:', idea.title);

    return NextResponse.json({
      success: true,
      message: '每日创意生成成功',
      idea: {
        id: savedId,
        title: idea.title,
        maturity: idea.maturity,
        domain: idea.domain
      }
    });

  } catch (error) {
    console.error('❌ Cron执行失败:', error);

    // 尝试使用模板生成
    try {
      const idea = await DailyIdeaService.generateDailyIdea({
        excludeRecentDomains: true,
        useAI: false // 使用模板
      });

      const today = new Date();
      today.setHours(8, 0, 0, 0);

      const savedId = await DailyIdeaService.createDailyIdea(idea, today);

      console.log('⚠️ AI生成失败，使用模板生成:', idea.title);

      return NextResponse.json({
        success: true,
        message: '使用模板生成成功',
        warning: 'AI生成失败，已降级为模板生成',
        idea: {
          id: savedId,
          title: idea.title
        }
      });

    } catch (fallbackError) {
      console.error('❌ 模板生成也失败:', fallbackError);

      return NextResponse.json(
        {
          success: false,
          error: 'AI和模板生成都失败了',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
}

// 允许POST请求（用于手动触发）
export async function POST(request: NextRequest) {
  return GET(request);
}

// 导入prisma
import { prisma } from '@/lib/prisma';