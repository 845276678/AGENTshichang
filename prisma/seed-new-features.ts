import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDailyIdeas() {
  console.log('开始初始化每日创意数据...');

  // 创建示例每日创意
  const ideas = [
    {
      title: '智能家居声音识别助手',
      description: '开发一个能够识别家庭成员声音并提供个性化服务的智能助手，可以根据不同家庭成员的声音特征提供定制化的信息推送、娱乐内容和智能家居控制方案。',
      maturity: 45,
      domain: ['科技', '智能硬件'],
      guidingQuestions: [
        '如何确保声音识别的准确性和隐私安全？',
        '什么样的个性化服务最能吸引用户？',
        '如何与现有智能家居生态系统整合？',
        '用户愿意为这样的服务支付多少费用？'
      ],
      implementationHints: [
        '先从简单的声音识别开始，逐步增加个性化功能',
        '重点关注隐私保护和数据安全',
        '考虑与主流智能音箱厂商合作',
        '建立用户反馈循环机制优化识别算法'
      ]
    },
    {
      title: '个人碳足迹跟踪与奖励平台',
      description: '创建一个综合性平台，帮助用户跟踪日常生活中的碳排放，提供减排建议，并通过积分奖励机制鼓励环保行为，连接绿色消费商家提供实际优惠。',
      maturity: 62,
      domain: ['环保', '移动应用'],
      guidingQuestions: [
        '如何准确测量个人碳足迹？',
        '什么样的奖励机制能够持续激励用户？',
        '如何建立可信的商家合作网络？',
        '怎样确保数据的真实性和有效性？'
      ],
      implementationHints: [
        '从用户最容易理解的行为开始（如交通、用电）',
        '建立简单易用的数据录入方式',
        '先与本地环保商家建立合作关系',
        '设计有趣的社交分享功能增加用户粘性'
      ]
    },
    {
      title: '远程工作效率优化工具',
      description: '针对远程工作者开发的综合效率提升工具，包括时间管理、注意力训练、虚拟工作空间营造和团队协作优化功能，帮助在家办公人员提高工作效率和生活质量。',
      maturity: 73,
      domain: ['生产力工具', '远程办公'],
      guidingQuestions: [
        '远程工作者最大的痛点是什么？',
        '如何平衡工作效率和员工隐私？',
        '什么功能能够真正提升团队协作效果？',
        '如何与现有工作工具生态整合？'
      ],
      implementationHints: [
        '先做用户调研，了解真实需求',
        '开发MVP版本测试核心功能',
        '考虑与企业客户合作推广',
        '重视用户体验和界面设计'
      ]
    }
  ];

  // 为接下来3天创建每日创意
  for (let i = 0; i < 3; i++) {
    const publishDate = new Date();
    publishDate.setDate(publishDate.getDate() + i);
    publishDate.setHours(8, 0, 0, 0);

    const ideaData = ideas[i];
    if (!ideaData) continue;

    const existingIdea = await prisma.dailyIdea.findUnique({
      where: { publishDate }
    });

    if (!existingIdea) {
      await prisma.dailyIdea.create({
        data: {
          title: ideaData.title,
          description: ideaData.description,
          maturity: ideaData.maturity,
          domain: ideaData.domain,
          guidingQuestions: ideaData.guidingQuestions,
          implementationHints: ideaData.implementationHints,
          publishDate,
          isActive: true
        }
      });
      console.log(`创建了 ${publishDate.toDateString()} 的每日创意: ${ideaData.title}`);
    }
  }
}

async function seedPressureScenarios() {
  console.log('开始初始化压力测试场景...');

  const scenarios = [
    {
      title: '突发资金链断裂',
      description: '主要投资方突然撤资，公司面临3个月内资金耗尽的危机。',
      type: 'FUNDING' as const,
      severity: 3,
      domain: ['通用'],
      questions: [
        '当得知投资方撤资消息时，你的第一反应和immediate行动计划是什么？',
        '如何在有限时间内寻找新的资金来源？请列出具体的融资渠道和策略。',
        '在资金紧张的情况下，你会如何优化成本结构和人员配置？',
        '如何向团队、客户和合作伙伴传达这一变化，同时维持信心和合作关系？'
      ],
      isPersonalized: false
    },
    {
      title: '强势竞争对手进入',
      description: '行业巨头突然推出与你产品高度相似的服务，且拥有更多资源和用户基础。',
      type: 'COMPETITION' as const,
      severity: 2,
      domain: ['通用'],
      questions: [
        '面对资源实力悬殊的竞争对手，你如何重新定位自己的产品？',
        '在价格战不可避免的情况下，你的差异化竞争策略是什么？',
        '如何快速建立并强化自己的竞争壁垒？',
        '是否考虑与竞争对手合作或被收购？决策标准是什么？'
      ],
      isPersonalized: false
    },
    {
      title: '市场需求急剧萎缩',
      description: '由于政策变化或消费习惯转变，目标市场需求在短期内下降70%。',
      type: 'MARKET' as const,
      severity: 3,
      domain: ['通用'],
      questions: [
        '当发现市场需求大幅下降时，你如何快速验证这是短期波动还是长期趋势？',
        '面对市场萎缩，你会选择坚持原有方向还是快速转型？理由是什么？',
        '如何识别和进入新的目标市场？具体的市场拓展计划是什么？',
        '在转型期间，如何保持现有用户的忠诚度和满意度？'
      ],
      isPersonalized: false
    },
    {
      title: '核心技术遭遇瓶颈',
      description: '产品的核心技术遇到无法突破的技术限制，现有方案无法满足用户需求。',
      type: 'TECHNICAL' as const,
      severity: 2,
      domain: ['科技', '软件'],
      questions: [
        '当核心技术遇到瓶颈时，你如何评估是继续投入研发还是寻求替代方案？',
        '如何在技术限制下重新设计产品架构或用户体验？',
        '是否考虑通过合作、收购或授权获得所需技术？具体策略是什么？',
        '如何向用户和投资者解释技术挑战，同时保持信心？'
      ],
      isPersonalized: true
    },
    {
      title: '监管政策突然收紧',
      description: '政府出台新的行业监管政策，对你的商业模式造成重大影响。',
      type: 'REGULATORY' as const,
      severity: 2,
      domain: ['金融', '教育', '医疗'],
      questions: [
        '面对新的监管要求，你如何快速调整商业模式以确保合规？',
        '在政策不确定性下，如何制定风险管理和应急预案？',
        '是否考虑将业务转移到监管较为宽松的地区？决策因素有哪些？',
        '如何与监管部门建立良好沟通，获得政策解读和指导？'
      ],
      isPersonalized: true
    },
    {
      title: '关键团队成员离职',
      description: '核心技术负责人和销售总监同时提出离职，对业务运营造成重大冲击。',
      type: 'OPERATIONAL' as const,
      severity: 2,
      domain: ['通用'],
      questions: [
        '如何快速稳定团队情绪，防止连锁离职效应？',
        '在关键岗位空缺的情况下，如何保证业务正常运转？',
        '你的人才招聘和团队建设策略是什么？如何吸引优秀人才？',
        '如何建立知识管理体系，减少对个人的依赖？'
      ],
      isPersonalized: false
    }
  ];

  for (const scenario of scenarios) {
    const existing = await prisma.pressureTestScenario.findFirst({
      where: { title: scenario.title }
    });

    if (!existing) {
      await prisma.pressureTestScenario.create({
        data: scenario
      });
      console.log(`创建了压力测试场景: ${scenario.title}`);
    }
  }
}

async function main() {
  try {
    await seedDailyIdeas();
    await seedPressureScenarios();
    console.log('数据初始化完成！');
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();