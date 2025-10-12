const fetch = require('node-fetch');

async function analyzeContentQuality() {
  console.log('🔍 内容质量深度分析...\n');

  const requestData = {
    ideaTitle: "AI Agent创意竞价与商业计划生成平台",
    ideaDescription: "一个创新的AI驱动平台，帮助创业者完善和验证创意。核心功能包括：1) 多个AI Agent对用户创意进行竞价评估；2) 智能引导系统完善创意；3) 自动生成商业计划书；4) 提供个性化落地指导。",
    userLocation: "成都",
    userBackground: "非技术背景，有创业想法但不懂编程和产品开发"
  };

  try {
    const response = await fetch('http://localhost:4000/api/business-plan/intelligent-analysis-verified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    console.log('==========================================');
    console.log('📊 内容质量问题分析');
    console.log('==========================================\n');

    const data = result.data.verified;
    const issues = [];
    const suggestions = [];

    // 1. 分析竞品质量
    console.log('1️⃣ 竞品分析质量检查:\n');
    const competitors = data.competitorAnalysis?.competitors || [];

    if (competitors.length === 0) {
      issues.push('❌ 未生成任何竞品');
    } else {
      console.log(`   发现${competitors.length}个竞品`);

      // 检查竞品相关性
      let irrelevantCount = 0;
      competitors.forEach((comp, i) => {
        const name = comp.name || '';
        const isRelevant =
          name.toLowerCase().includes('ai') ||
          name.toLowerCase().includes('business') ||
          name.toLowerCase().includes('plan') ||
          name.toLowerCase().includes('创业') ||
          name.toLowerCase().includes('商业');

        if (!isRelevant) {
          irrelevantCount++;
          console.log(`   ⚠️ ${i + 1}. ${name} - 相关性低`);
        } else {
          console.log(`   ✅ ${i + 1}. ${name} - 相关`);
        }
      });

      if (irrelevantCount > competitors.length / 2) {
        issues.push('⚠️ 超过一半的竞品相关性较低');
        suggestions.push('优化Prompt: 强调"必须是同领域的直接竞品"');
      }

      // 检查描述质量
      let shortDescCount = 0;
      competitors.forEach(comp => {
        const strength = comp.strength || '';
        const weakness = comp.weakness || '';
        const diff = comp.differentiation || '';

        if (strength.length < 20 || weakness.length < 20 || diff.length < 20) {
          shortDescCount++;
        }
      });

      if (shortDescCount > 0) {
        issues.push(`⚠️ ${shortDescCount}个竞品的描述过于简短`);
        suggestions.push('优化Prompt: 要求每个维度至少50字的详细分析');
      }
    }

    // 2. 分析技术栈推荐质量
    console.log('\n2️⃣ 技术栈推荐质量检查:\n');
    const techStack = data.recommendations?.techStackRecommendations?.beginner || {};
    const primary = techStack.primary || '';
    const reason = techStack.reason || '';
    const cost = techStack.cost || '';
    const timeline = techStack.timeline || '';

    console.log(`   主要推荐: ${primary}`);
    console.log(`   理由长度: ${reason.length}字`);
    console.log(`   成本信息: ${cost}`);
    console.log(`   时间线: ${timeline}`);

    // 检查是否真的优先国产
    const domesticTools = ['Trae', '腾讯', '阿里', '智谱', '百度', '华为', '字节'];
    const hasDomestic = domesticTools.some(tool => primary.includes(tool));

    if (!hasDomestic) {
      issues.push('❌ 技术栈未优先推荐国产工具');
      suggestions.push('强化Prompt: "必须将国产工具作为第一推荐"');
    } else {
      console.log('   ✅ 已优先国产工具');
    }

    // 检查描述详细度
    if (reason.length < 50) {
      issues.push('⚠️ 推荐理由过于简短');
      suggestions.push('要求提供至少100字的详细推荐理由');
    }

    // 检查成本信息的具体性
    if (!cost.match(/\d+/)) {
      issues.push('⚠️ 成本信息缺少具体数字');
      suggestions.push('要求提供具体的数字范围(如"3-5万元")');
    }

    // 3. 分析线下活动质量
    console.log('\n3️⃣ 线下活动推荐质量检查:\n');
    const events = data.recommendations?.offlineEvents?.nationalEvents || [];

    console.log(`   发现${events.length}个活动`);

    let outdatedCount = 0;
    let vagueTimeCount = 0;
    let noCostCount = 0;

    events.forEach((event, i) => {
      console.log(`\n   活动${i + 1}: ${event.name}`);

      // 检查时间信息
      const time = event.time || '';
      console.log(`   时间: ${time}`);

      if (time.includes('待查询') || time.includes('待确认') || !time) {
        vagueTimeCount++;
        console.log('   ⚠️ 时间信息不明确');
      }

      // 检查是否有2025年信息
      if (!time.includes('2025') && !time.includes('待查询')) {
        outdatedCount++;
        console.log('   ⚠️ 可能是过时信息');
      }

      // 检查费用信息
      const costInfo = event.cost || '';
      if (!costInfo || costInfo === '待确认') {
        noCostCount++;
      }
    });

    if (vagueTimeCount > events.length / 2) {
      issues.push('⚠️ 超过一半的活动时间信息不明确');
      suggestions.push('优化Prompt: "如果知道2025年的活动时间,请提供;否则明确说明需要查询官网"');
    }

    if (outdatedCount > 0) {
      issues.push(`⚠️ ${outdatedCount}个活动可能是过时信息`);
      suggestions.push('强调: "必须推荐2025年或未来的活动"');
    }

    // 4. 分析预算规划
    console.log('\n4️⃣ 预算规划质量检查:\n');
    const budget = data.recommendations?.budgetPlan || {};
    const startupCosts = budget.startupCosts?.total;
    const monthlyCosts = budget.monthlyCosts?.total;
    const optimization = budget.costOptimization || [];

    console.log(`   启动成本: ${startupCosts}`);
    console.log(`   月度成本: ${monthlyCosts}`);
    console.log(`   优化建议: ${optimization.length}条`);

    if (!startupCosts || startupCosts === '待评估') {
      issues.push('❌ 缺少具体的启动成本估算');
      suggestions.push('要求提供具体数字范围,基于用户背景和创意复杂度');
    }

    if (optimization.length < 3) {
      issues.push('⚠️ 成本优化建议不足3条');
      suggestions.push('要求至少提供5条具体的成本优化建议');
    }

    // 5. 分析调研渠道
    console.log('\n5️⃣ 调研渠道质量检查:\n');
    const channels = data.recommendations?.researchChannels || {};
    const online = channels.online || [];
    const offline = channels.offline || [];

    console.log(`   线上渠道: ${online.length}个`);
    console.log(`   线下渠道: ${offline.length}个`);

    online.forEach((ch, i) => console.log(`   ${i + 1}. ${ch}`));

    // 检查渠道的具体性
    const vague = ['社交媒体', '行业论坛', '在线调研'];
    const vagueCount = online.filter(ch => vague.some(v => ch.includes(v))).length;

    if (vagueCount > online.length / 2) {
      issues.push('⚠️ 调研渠道过于笼统');
      suggestions.push('要求提供具体的平台名称(如"知乎、小红书、微信社群"而非"社交媒体")');
    }

    // 6. 分析市场空白点
    console.log('\n6️⃣ 市场空白点分析质量:\n');
    const marketGap = data.competitorAnalysis?.marketGap || '';

    console.log(`   描述长度: ${marketGap.length}字`);
    console.log(`   内容: ${marketGap.substring(0, 100)}...`);

    if (marketGap.length < 50) {
      issues.push('⚠️ 市场空白点分析过于简短');
      suggestions.push('要求至少200字的深入分析,包含具体的用户痛点和解决方案');
    }

    // 7. 检查是否有"编造"的迹象
    console.log('\n7️⃣ 真实性检查:\n');

    // 检查竞品名称是否过于通用
    const genericNames = competitors.filter(c => {
      const name = c.name || '';
      return name.includes('平台') || name.includes('系统') || name.includes('工具');
    });

    if (genericNames.length > 0) {
      console.log(`   ⚠️ ${genericNames.length}个竞品名称可能不够具体`);
      genericNames.forEach(c => console.log(`      - ${c.name}`));
    }

    // 总结
    console.log('\n==========================================');
    console.log('📋 内容质量问题汇总');
    console.log('==========================================\n');

    if (issues.length === 0) {
      console.log('✅ 未发现明显的质量问题!');
    } else {
      console.log(`发现 ${issues.length} 个问题:\n`);
      issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
    }

    console.log('\n==========================================');
    console.log('💡 优化建议');
    console.log('==========================================\n');

    if (suggestions.length === 0) {
      console.log('✅ 当前质量良好，暂无优化建议');
    } else {
      suggestions.forEach((sug, i) => {
        console.log(`${i + 1}. ${sug}`);
      });
    }

    // 评分
    console.log('\n==========================================');
    console.log('⭐ 综合评分');
    console.log('==========================================\n');

    const totalChecks = 15; // 总检查项
    const passedChecks = totalChecks - issues.length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    console.log(`内容质量得分: ${score}/100`);

    if (score >= 90) {
      console.log('等级: 优秀 ⭐⭐⭐⭐⭐');
    } else if (score >= 80) {
      console.log('等级: 良好 ⭐⭐⭐⭐');
    } else if (score >= 70) {
      console.log('等级: 中等 ⭐⭐⭐');
    } else {
      console.log('等级: 需改进 ⭐⭐');
    }

  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  }
}

analyzeContentQuality();
