import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { PrismaClient } from '@prisma/client';
import { DailyIdeaService } from '../src/lib/services/daily-idea.service';
// import { AIProvider } from '../src/lib/ai-services'; // 可在line 46使用aiProvider参数指定AI提供商

const prisma = new PrismaClient();

/**
 * 每日创意自动生成脚本
 *
 * 使用方式：
 * 1. 手动执行：npx ts-node scripts/generate-daily-idea.ts
 * 2. 定时任务：配置cron job每天8点执行
 *    在Linux: 0 8 * * * cd /path/to/project && npx ts-node scripts/generate-daily-idea.ts
 *    在Windows Task Scheduler中配置定时任务
 * 3. Vercel Cron Jobs: 在vercel.json中配置
 */

async function generateDailyIdea() {
  console.log('='.repeat(60));
  console.log('开始生成今日创意...');
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  console.log('='.repeat(60));

  try {
    // 检查今天是否已经有创意
    const today = new Date();
    today.setHours(8, 0, 0, 0);

    const existingIdea = await prisma.dailyIdea.findUnique({
      where: { publishDate: today }
    });

    if (existingIdea) {
      console.log('✅ 今日创意已存在:', existingIdea.title);
      console.log('   无需重复生成');
      return;
    }

    // 生成新的创意
    console.log('\n📝 正在使用AI生成创意...');

    const idea = await DailyIdeaService.generateDailyIdea({
      excludeRecentDomains: true,
      useAI: true, // 使用AI生成
      // 可以指定AI提供商，不指定则自动选择最优的
      // aiProvider: AIProvider.DEEPSEEK
    });

    console.log('\n✨ AI生成成功！');
    console.log('   标题:', idea.title);
    console.log('   领域:', idea.domain.join(', '));
    console.log('   成熟度:', idea.maturity);

    // 保存到数据库
    const savedIdea = await DailyIdeaService.createDailyIdea(idea, today);
    console.log('\n💾 保存成功！ID:', savedIdea);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 今日创意生成完成！');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 生成失败:', error);

    // 如果AI生成失败，尝试使用模板生成
    console.log('\n🔄 尝试使用预设模板生成...');

    try {
      const idea = await DailyIdeaService.generateDailyIdea({
        excludeRecentDomains: true,
        useAI: false // 使用模板
      });

      const today = new Date();
      today.setHours(8, 0, 0, 0);

      const savedIdea = await DailyIdeaService.createDailyIdea(idea, today);

      console.log('\n✅ 使用模板生成成功！');
      console.log('   标题:', idea.title);
      console.log('   ID:', savedIdea);

    } catch (fallbackError) {
      console.error('\n❌ 模板生成也失败了:', fallbackError);
      throw fallbackError;
    }
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 批量生成未来N天的创意
 */
async function generateBatchIdeas(days: number = 7) {
  console.log(`\n📅 批量生成未来${days}天的创意...\n`);

  for (let i = 0; i < days; i++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + i);
    targetDate.setHours(8, 0, 0, 0);

    console.log(`\n生成第 ${i + 1}/${days} 天 (${targetDate.toLocaleDateString('zh-CN')})...`);

    try {
      const existingIdea = await prisma.dailyIdea.findUnique({
        where: { publishDate: targetDate }
      });

      if (existingIdea) {
        console.log('✅ 已存在，跳过');
        continue;
      }

      const idea = await DailyIdeaService.generateDailyIdea({
        excludeRecentDomains: true,
        useAI: true
      });

      await DailyIdeaService.createDailyIdea(idea, targetDate);

      console.log('✅ 生成成功:', idea.title);

      // 延迟1秒，避免API限流
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ 生成第${i + 1}天失败:`, error);

      // 失败后使用模板
      try {
        const idea = await DailyIdeaService.generateDailyIdea({
          excludeRecentDomains: true,
          useAI: false
        });
        await DailyIdeaService.createDailyIdea(idea, targetDate);
        console.log('⚠️  使用模板生成:', idea.title);
      } catch (fallbackError) {
        console.error('❌ 模板生成也失败');
      }
    }
  }

  console.log('\n✅ 批量生成完成！');
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'batch':
        // 批量生成：npm run generate-ideas batch [天数]
        const days = args[1] ? parseInt(args[1], 10) : 7;
        await generateBatchIdeas(days);
        break;

      case 'today':
      default:
        // 生成今日创意（默认）：npm run generate-ideas
        await generateDailyIdea();
        break;
    }
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
}

main();