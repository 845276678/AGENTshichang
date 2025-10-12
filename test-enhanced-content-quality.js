const fetch = require('node-fetch');

async function testEnhancedContentQuality() {
  console.log('🎯 测试增强版内容质量...\\n');
  console.log('==========================================');
  console.log('测试创意: AI Agent创意竞价与商业计划生成平台');
  console.log('目标: 验证10项内容优化是否生效');
  console.log('==========================================\\n');

  const requestData = {
    ideaTitle: "AI Agent创意竞价与商业计划生成平台",
    ideaDescription: "一个创新的AI驱动平台，帮助创业者完善和验证创意。核心功能包括：1) 多个AI Agent对用户创意进行竞价评估；2) 智能引导系统完善创意；3) 自动生成商业计划书；4) 提供个性化落地指导。",
    userLocation: "成都",
    userBackground: "非技术背景，有创业想法但不懂编程和产品开发"
  };

  const startTime = Date.now();

  try {
    console.log('🔬 调用增强版API（请耐心等待60-90秒）...\\n');

    const response = await fetch('http://localhost:4000/api/business-plan/intelligent-analysis-verified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
      timeout: 180000
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '分析失败');
    }

    console.log(`⏱️  总响应时间: ${duration}秒\\n`);

    const verified = result.data.verified;

    console.log('==========================================');
    console.log('📊 内容质量验证报告');
    console.log('==========================================\\n');

    let passCount = 0;
    const issues = [];

    // 验证1: 竞品相关性和描述深度
    console.log('✅ 验证1: 竞品分析质量');
    const competitors = verified.competitorAnalysis?.competitors || [];

    if (competitors.length > 0) {
      console.log(`   发现${competitors.length}个竞品`);

      let detailedCount = 0;
      let relevantCount = 0;

      competitors.forEach((comp, i) => {
        const strength = comp.strength || '';
        const weakness = comp.weakness || '';
        const diff = comp.differentiation || '';

        console.log(`\\n   竞品${i + 1}: ${comp.name}`);
        console.log(`   - 优势描述长度: ${strength.length}字`);
        console.log(`   - 劣势描述长度: ${weakness.length}字`);
        console.log(`   - 差异化长度: ${diff.length}字`);

        if (strength.length >= 80 && weakness.length >= 80 && diff.length >= 80) {
          detailedCount++;
          console.log(`   ✅ 描述详实`);
        } else {
          console.log(`   ⚠️ 描述不够详实`);
        }

        // 检查相关性（避免Canva、JungleScout等不相关竞品）
        const name = comp.name.toLowerCase();
        const isIrrelevant = name.includes('canva') || name.includes('junglescout') || name.includes('jungle scout');

        if (!isIrrelevant) {
          relevantCount++;
        } else {
          console.log(`   ⚠️ 竞品相关性低`);
        }
      });

      if (detailedCount >= competitors.length * 0.8 && relevantCount === competitors.length) {
        console.log(`\\n   ✅ 通过: ${detailedCount}/${competitors.length}个竞品描述详实，全部相关`);
        passCount++;
      } else {
        console.log(`\\n   ❌ 未通过: 描述详实率${Math.round(detailedCount/competitors.length*100)}%, 相关率${Math.round(relevantCount/competitors.length*100)}%`);
        issues.push('竞品分析质量仍需提升');
      }
    } else {
      console.log('   ❌ 未生成竞品');
      issues.push('未生成竞品分析');
    }

    // 验证2: 市场空白点深度
    console.log('\\n✅ 验证2: 市场空白点分析深度');
    const marketGap = verified.competitorAnalysis?.marketGap || '';
    console.log(`   描述长度: ${marketGap.length}字`);

    if (marketGap.length >= 300) {
      console.log(`   ✅ 通过: 深度分析，内容详实`);
      passCount++;
    } else {
      console.log(`   ❌ 未通过: 分析过于简短（目标≥300字）`);
      issues.push('市场空白点分析不够深入');
    }

    // 验证3: 线下活动信息完整性
    console.log('\\n✅ 验证3: 线下活动信息质量');
    const events = verified.recommendations?.offlineEvents?.nationalEvents || [];

    if (events.length > 0) {
      console.log(`   发现${events.length}个活动`);

      let completeCount = 0;
      events.forEach((event, i) => {
        console.log(`\\n   活动${i + 1}: ${event.name}`);
        console.log(`   - 时间: ${event.time || '未提供'}`);
        console.log(`   - 价值描述: ${(event.value || '').length}字`);
        console.log(`   - 官网: ${event.officialWebsite || '未提供'}`);
        console.log(`   - 报名流程: ${event.applicationProcess || '未提供'}`);

        const hasTime = event.time && !event.time.includes('待查询（通常');
        const hasValue = (event.value || '').length >= 80;
        const hasWebsite = event.officialWebsite;
        const hasProcess = event.applicationProcess;

        if (hasTime && hasValue && hasWebsite && hasProcess) {
          completeCount++;
          console.log(`   ✅ 信息完整`);
        } else {
          console.log(`   ⚠️ 信息不完整`);
        }
      });

      if (completeCount >= events.length * 0.6) {
        console.log(`\\n   ✅ 通过: ${completeCount}/${events.length}个活动信息完整`);
        passCount++;
      } else {
        console.log(`\\n   ❌ 未通过: 仅${Math.round(completeCount/events.length*100)}%的活动信息完整`);
        issues.push('活动信息不够完整');
      }
    } else {
      console.log('   ❌ 未推荐活动');
      issues.push('未推荐线下活动');
    }

    // 验证4: 技术栈学习路径
    console.log('\\n✅ 验证4: 技术栈学习路径');
    const techStack = verified.recommendations?.techStackRecommendations?.beginner || {};

    console.log(`   主要推荐: ${techStack.primary || '未提供'}`);
    console.log(`   推荐理由长度: ${(techStack.reason || '').length}字`);
    console.log(`   是否有学习路径: ${techStack.learningPath ? '是' : '否'}`);
    console.log(`   是否有替代方案: ${techStack.alternatives ? '是' : '否'}`);
    console.log(`   是否有成本细分: ${techStack.cost ? '是' : '否'}`);

    const hasLearningPath = techStack.learningPath &&
      techStack.learningPath.phase1 &&
      techStack.learningPath.phase2;
    const hasAlternatives = techStack.alternatives;
    const hasCost = techStack.cost;
    const reasonLength = (techStack.reason || '').length;

    if (hasLearningPath && hasAlternatives && hasCost && reasonLength >= 100) {
      console.log(`   ✅ 通过: 包含完整学习路径、替代方案和成本细分`);
      passCount++;
    } else {
      console.log(`   ❌ 未通过: 缺少学习路径或其他关键信息`);
      issues.push('技术栈推荐缺少学习路径');
    }

    // 验证5: 预算规划细分
    console.log('\\n✅ 验证5: 预算规划详细度');
    const budget = verified.recommendations?.budgetPlan || {};

    const hasStartupDetail = budget.startupCosts?.technology &&
      budget.startupCosts?.learning &&
      budget.startupCosts?.total &&
      !budget.startupCosts.total.includes('待评估');

    const hasMonthlyDetail = budget.monthlyCosts?.infrastructure &&
      budget.monthlyCosts?.ai_api &&
      budget.monthlyCosts?.total &&
      !budget.monthlyCosts.total.includes('待评估');

    const hasOptimization = (budget.costOptimization || []).length >= 5;

    console.log(`   启动成本总计: ${budget.startupCosts?.total || '未提供'}`);
    console.log(`   - 是否有详细分项: ${hasStartupDetail ? '是' : '否'}`);
    console.log(`   月度成本总计: ${budget.monthlyCosts?.total || '未提供'}`);
    console.log(`   - 是否有详细分项: ${hasMonthlyDetail ? '是' : '否'}`);
    console.log(`   成本优化建议: ${(budget.costOptimization || []).length}条`);

    if (hasStartupDetail && hasMonthlyDetail && hasOptimization) {
      console.log(`   ✅ 通过: 预算规划详实，包含具体数字和优化建议`);
      passCount++;
    } else {
      console.log(`   ❌ 未通过: 预算规划不够详细`);
      issues.push('预算规划缺少详细分项');
    }

    // 验证6: 调研渠道具体性
    console.log('\\n✅ 验证6: 调研渠道具体性');
    const channels = verified.recommendations?.researchChannels || {};

    const hasSocialMedia = channels.online?.socialMedia && Array.isArray(channels.online.socialMedia);
    const hasCommunities = channels.online?.professionalCommunities;

    let specificPlatforms = 0;
    if (hasSocialMedia) {
      channels.online.socialMedia.forEach(platform => {
        if (platform.name && platform.method) {
          console.log(`   - ${platform.name}: ${platform.method}`);
          specificPlatforms++;
        }
      });
    }

    if (specificPlatforms >= 2) {
      console.log(`   ✅ 通过: 提供了${specificPlatforms}个具体平台和使用方法`);
      passCount++;
    } else {
      console.log(`   ❌ 未通过: 调研渠道过于笼统`);
      issues.push('调研渠道不够具体');
    }

    // 验证7: 风险提示
    console.log('\\n✅ 验证7: 风险提示');
    const risks = verified.risks || {};

    const hasTechnicalRisks = (risks.technical || []).length >= 2;
    const hasMarketRisks = (risks.market || []).length >= 2;
    const hasMitigation = (risks.mitigation || []).length >= 3;

    console.log(`   技术风险: ${(risks.technical || []).length}条`);
    console.log(`   市场风险: ${(risks.market || []).length}条`);
    console.log(`   运营风险: ${(risks.operation || []).length}条`);
    console.log(`   财务风险: ${(risks.financial || []).length}条`);
    console.log(`   缓解建议: ${(risks.mitigation || []).length}条`);

    if (hasTechnicalRisks && hasMarketRisks && hasMitigation) {
      console.log(`   ✅ 通过: 包含全面的风险分析和缓解建议`);
      passCount++;
    } else {
      console.log(`   ❌ 未通过: 风险提示不完整`);
      issues.push('缺少完整的风险提示');
    }

    // 验证8: 成功案例
    console.log('\\n✅ 验证8: 成功案例参考');
    const successCases = verified.successCases || [];

    console.log(`   成功案例数量: ${successCases.length}个`);

    if (successCases.length >= 2) {
      successCases.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.name}: ${c.takeaway}`);
      });
      console.log(`   ✅ 通过: 提供了${successCases.length}个成功案例`);
      passCount++;
    } else {
      console.log(`   ❌ 未通过: 缺少成功案例参考`);
      issues.push('缺少成功案例参考');
    }

    // 验证9: 行动计划
    console.log('\\n✅ 验证9: 下一步行动指引');
    const nextSteps = verified.nextSteps || {};

    const hasWeek1 = nextSteps.week1 && nextSteps.week1.tasks;
    const hasWeek2_4 = nextSteps.week2_4 && nextSteps.week2_4.tasks;
    const hasMilestones = (nextSteps.keyMilestones || []).length >= 2;

    console.log(`   第1周计划: ${hasWeek1 ? '✓' : '✗'}`);
    console.log(`   第2-4周计划: ${hasWeek2_4 ? '✓' : '✗'}`);
    console.log(`   关键里程碑: ${(nextSteps.keyMilestones || []).length}个`);

    if (hasWeek1 && hasWeek2_4 && hasMilestones) {
      console.log(`   ✅ 通过: 提供了分阶段的详细行动计划`);
      passCount++;
    } else {
      console.log(`   ❌ 未通过: 缺少完整的行动指引`);
      issues.push('缺少下一步行动指引');
    }

    // 验证10: 国产工具优先
    console.log('\\n✅ 验证10: 国产工具优先推荐');
    const primary = techStack.primary || '';

    const domesticTools = ['trae', '腾讯', '阿里', '智谱', '百度', '华为', '钉钉'];
    const hasDomestic = domesticTools.some(tool => primary.toLowerCase().includes(tool));

    console.log(`   推荐技术栈: ${primary}`);

    if (hasDomestic) {
      console.log(`   ✅ 通过: 优先推荐国产工具`);
      passCount++;
    } else {
      console.log(`   ❌ 未通过: 未优先国产工具`);
      issues.push('未优先推荐国产工具');
    }

    // 总结
    console.log('\\n==========================================');
    console.log('📊 内容质量综合评估');
    console.log('==========================================\\n');

    const score = Math.round((passCount / 10) * 100);

    console.log(`✅ 通过项: ${passCount}/10`);
    console.log(`📈 内容质量得分: ${score}/100`);

    console.log('\\n得分等级:');
    if (score >= 90) {
      console.log('⭐⭐⭐⭐⭐ 优秀 - 内容质量显著提升！');
    } else if (score >= 80) {
      console.log('⭐⭐⭐⭐ 良好 - 大部分优化已生效');
    } else if (score >= 70) {
      console.log('⭐⭐⭐ 中等 - 部分优化已生效');
    } else {
      console.log('⭐⭐ 需改进 - 优化效果有限');
    }

    if (issues.length > 0) {
      console.log('\\n⚠️ 仍需改进的问题:');
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
    } else {
      console.log('\\n🎉 所有内容优化项都已通过！');
    }

    console.log('\\n==========================================');
    console.log('对比分析');
    console.log('==========================================');
    console.log('优化前得分: 57/100 (内容优化报告)');
    console.log(`优化后得分: ${score}/100`);
    console.log(`提升幅度: ${score >= 57 ? '+' : ''}${score - 57}分`);

    if (score >= 85) {
      console.log('\\n✅ 已达到目标分数（85+/100）！');
    } else {
      console.log(`\\n⚠️ 距离目标分数（85+/100）还差${85 - score}分`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testEnhancedContentQuality();
