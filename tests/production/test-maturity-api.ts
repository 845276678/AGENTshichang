/**
 * 生产环境测试 - 创意成熟度评估API
 * 运行: ts-node tests/production/test-maturity-api.ts
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// 测试数据：模拟AI专家讨论
const mockAIMessages = [
  {
    id: '1',
    agentName: 'Alex',
    agentType: 'technical',
    content: '目标用户是谁？高中生这个群体太宽泛了，能否更具体说明是哪个年级、什么科目的学生？',
    phase: 'discussion',
    timestamp: new Date()
  },
  {
    id: '2',
    agentName: 'Sophia',
    agentType: 'market',
    content: '我看到你提到了错题本，但市场上已经有作业帮、猿辅导这些大平台了，你的差异化在哪里？',
    phase: 'discussion',
    timestamp: new Date()
  },
  {
    id: '3',
    agentName: 'Marcus',
    agentType: 'business',
    content: '商业模式需要明确：基础版免费，高级版99元/年，这个定价依据是什么？有做过用户访谈吗？',
    phase: 'discussion',
    timestamp: new Date()
  },
  {
    id: '4',
    agentName: 'Isabella',
    agentType: 'creative',
    content: '上周我访谈了10个高三学生，其中8个表示每周花2小时整理错题，这个痛点是真实的。',
    phase: 'discussion',
    timestamp: new Date()
  },
  {
    id: '5',
    agentName: 'Ethan',
    agentType: 'analytical',
    content: '你提到的OCR识别手写错题这个功能很好，但需要验证：学生愿意为此付费吗？还是觉得拍照上传就够了？',
    phase: 'discussion',
    timestamp: new Date()
  }
];

const mockBids = {
  'Alex': 7.5,
  'Sophia': 6.8,
  'Marcus': 6.2,
  'Isabella': 7.8,
  'Ethan': 7.0
};

async function testMaturityAssessAPI() {
  console.log('🧪 开始测试创意成熟度评估API...\n');

  try {
    // 测试1: POST /api/maturity/assess
    console.log('📝 测试1: 提交评估请求');
    const assessResponse = await fetch(`${API_BASE_URL}/api/maturity/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ideaId: 'test-idea-001',
        userId: 'test-user-001',
        sessionId: 'test-session-001',
        aiMessages: mockAIMessages,
        bids: mockBids
      })
    });

    if (!assessResponse.ok) {
      throw new Error(`评估API失败: ${assessResponse.status} ${assessResponse.statusText}`);
    }

    const assessData = await assessResponse.json();
    console.log('✅ 评估成功');
    console.log('📊 评分结果:');
    console.log(`   总分: ${assessData.data.totalScore.toFixed(1)}/10.0`);
    console.log(`   等级: ${assessData.data.level}`);
    console.log(`   置信度: ${(assessData.data.confidence * 100).toFixed(0)}%`);
    console.log(`   工作坊解锁: ${assessData.data.workshopAccess.unlocked ? '✅' : '❌'}`);
    console.log(`   推荐工作坊数: ${assessData.data.workshopAccess.recommendations.length}`);
    console.log(`   薄弱维度: ${assessData.data.weakDimensions.join(', ')}`);

    console.log('\n🔍 维度详情:');
    for (const [dim, data] of Object.entries(assessData.data.dimensions) as any) {
      console.log(`   ${dim}: ${data.score.toFixed(1)}/10 (${data.status})`);
    }

    console.log('\n📈 The Mom Test信号:');
    console.log(`   有效信号:`, assessData.data.validSignals);
    console.log(`   无效信号:`, assessData.data.invalidSignals);

    // 测试2: GET /api/maturity/history
    console.log('\n📝 测试2: 查询评估历史');
    const historyResponse = await fetch(
      `${API_BASE_URL}/api/maturity/history?ideaId=test-idea-001&limit=5`
    );

    if (!historyResponse.ok) {
      throw new Error(`历史查询API失败: ${historyResponse.status}`);
    }

    const historyData = await historyResponse.json();
    console.log('✅ 历史查询成功');
    console.log(`   查询类型: ${historyData.data.queryType}`);
    console.log(`   记录数: ${historyData.data.count}`);

    if (historyData.data.count > 0) {
      console.log(`\n   最新记录:`);
      const latest = historyData.data.assessments[0];
      console.log(`     - ID: ${latest.id}`);
      console.log(`     - 总分: ${latest.totalScore.toFixed(1)}`);
      console.log(`     - 等级: ${latest.level}`);
      console.log(`     - 创建时间: ${new Date(latest.createdAt).toLocaleString('zh-CN')}`);
    }

    // 测试3: GET /api/maturity/stats
    console.log('\n📝 测试3: 查询统计数据');
    const statsResponse = await fetch(`${API_BASE_URL}/api/maturity/stats`);

    if (!statsResponse.ok) {
      throw new Error(`统计API失败: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();
    console.log('✅ 统计查询成功');
    console.log(`   总评估数: ${statsData.data.total}`);
    console.log(`   已解锁数: ${statsData.data.unlocked}`);
    console.log(`   解锁率: ${statsData.data.unlockRate.toFixed(2)}%`);
    console.log(`   平均分: ${statsData.data.avgScore.toFixed(2)}`);

    if (statsData.data.levelDistribution.length > 0) {
      console.log(`\n   等级分布:`);
      statsData.data.levelDistribution.forEach((item: any) => {
        console.log(`     - ${item.level}: ${item.count}条`);
      });
    }

    console.log('\n✅ 所有测试通过！\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testMaturityAssessAPI();
}
