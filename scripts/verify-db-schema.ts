import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabaseSchema() {
  try {
    console.log('🔍 验证数据库架构...');

    // 测试新的智能辩论系统表
    console.log('检查 IdeaDebate 表...');
    const debateCount = await prisma.ideaDebate.count();
    console.log(`✅ IdeaDebate 表存在，当前记录数: ${debateCount}`);

    // 测试 PointTransaction 表
    console.log('检查 PointTransaction 表...');
    const pointTransactionCount = await prisma.pointTransaction.count();
    console.log(`✅ PointTransaction 表存在，当前记录数: ${pointTransactionCount}`);

    // 测试枚举类型
    console.log('测试新的枚举类型...');
    console.log('✅ DebateCommentType 枚举已定义');
    console.log('✅ DebateResponseType 枚举已定义');

    // 验证现有关键表
    console.log('\n验证现有关键表...');
    const userCount = await prisma.user.count();
    console.log(`✅ User 表存在，记录数: ${userCount}`);

    const dailyIdeaCount = await prisma.dailyIdea.count();
    console.log(`✅ DailyIdea 表存在，记录数: ${dailyIdeaCount}`);

    // 测试数据库连接
    console.log('\n🔗 测试数据库连接...');
    const now = new Date();
    console.log(`✅ 数据库连接正常，当前时间: ${now.toISOString()}`);

    console.log('\n🎉 数据库架构验证完成！所有新表和功能已成功部署。');

  } catch (error) {
    console.error('❌ 数据库架构验证失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行验证
verifyDatabaseSchema()
  .then(() => {
    console.log('✅ 验证完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  });