// 新的导航结构配置
export const navigationConfig = {
  // 主导航菜单
  mainNavigation: [
    {
      title: '创意中心',
      href: '/creative-hub',
      icon: 'Lightbulb',
      description: '发现和竞价创意内容',
      subPages: [
        {
          title: '创意竞价',
          href: '/creative-hub/marketplace',
          description: '参与AI创意竞价，发现有价值的创意'
        },
        {
          title: '创意分类',
          href: '/creative-hub/categories',
          description: '按分类浏览创意内容'
        },
        {
          title: '每日一创意',
          href: '/creative-hub/daily-idea',
          description: '每日精选创意推荐'
        }
      ]
    },
    {
      title: '创意工具',
      href: '/creative-tools',
      icon: 'Zap',
      description: '分析和开发创意的专业工具',
      subPages: [
        {
          title: '创意生长树',
          href: '/creative-tools/growth-tree',
          description: '可视化创意发展路径'
        },
        {
          title: '创意压力台',
          href: '/creative-tools/pressure-test',
          description: '压力测试创意可行性'
        },
        {
          title: '创意实现建议',
          href: '/creative-tools/business-plan',
          description: '生成详细的商业计划'
        }
      ]
    },
    {
      title: '学习成长',
      href: '/learning',
      icon: 'BookOpen',
      description: '知识学习和技能提升',
      subPages: [
        {
          title: '专业工作坊',
          href: '/learning/workshops',
          description: '专业技能培训工作坊'
        },
        {
          title: '知识库收藏夹',
          href: '/learning/knowledge-vault',
          description: '收集和管理知识资源'
        }
      ]
    },
    {
      title: 'AI服务',
      href: '/ai-services',
      icon: 'Bot',
      description: 'AI智能体和自动化服务',
      subPages: [
        {
          title: 'Agent能力中心',
          href: '/ai-services/agent-center',
          description: 'AI智能体能力展示'
        },
        {
          title: '一人公司',
          href: '/ai-services/solo-company',
          description: '个人创业助手'
        }
      ]
    }
  ],

  // 次要导航（右侧菜单）
  secondaryNavigation: [
    {
      title: '积分价格',
      href: '/payment',
      icon: 'CreditCard'
    },
    {
      title: '购物车',
      href: '/cart',
      icon: 'ShoppingCart'
    }
  ],

  // 移动端菜单结构
  mobileNavigation: [
    // 主要功能快速入口
    {
      title: '创意竞价',
      href: '/creative-hub/marketplace',
      icon: 'TrendingUp',
      featured: true
    },
    {
      title: '每日一创意',
      href: '/creative-hub/daily-idea',
      icon: 'Calendar',
      featured: true
    },
    // 完整分类菜单
    ...navigationConfig.mainNavigation
  ]
}

// 页面重定向配置
export const redirectConfig = {
  // 保持向后兼容的重定向
  '/marketplace': '/creative-hub/marketplace',
  '/daily-idea': '/creative-hub/daily-idea',
  '/categories': '/creative-hub/categories',
  '/idea-growth-tree': '/creative-tools/growth-tree',
  '/pressure-test': '/creative-tools/pressure-test',
  '/business-plan': '/creative-tools/business-plan',
  '/workshops': '/learning/workshops',
  '/knowledge-vault': '/learning/knowledge-vault',
  '/agent-center': '/ai-services/agent-center',
  '/solo-company': '/ai-services/solo-company'
}