import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/auth'
import {
  generateFunctionalMVP,
  modifyFunctionalMVP,
  adjustMVPDesign,
  checkDeepSeekConfig,
  type GenerateMVPRequest,
  type ModifyMVPRequest,
  type DesignAdjustmentRequest
} from '@/lib/deepseek-client'

export const dynamic = 'force-dynamic'

interface MVPGenerationRequest {
  ideaDescription: string
  ideaTitle?: string
  targetUsers: string[]
  coreFeatures: string[]
  industryType: string
  userRequirement?: string
  designPreferences?: {
    colorScheme?: 'blue' | 'green' | 'purple' | 'orange'
    style?: 'modern' | 'minimalist' | 'corporate' | 'creative'
    includeAnimations?: boolean
  }
  modificationContext?: {
    currentVersion: number
    previousHtmlCode: string
    modificationRequest: string
    focusOnChanges: boolean
  }
  designContext?: {
    currentVersion: number
    previousHtmlCode: string
    designAdjustmentRequest: string
    focusOnDesign: boolean
    preserveFunctionality: boolean
  }
}

interface MVPPrototype {
  htmlCode: string
  cssCode: string
  jsCode: string
  readme: string
  metadata: {
    generatedAt: string
    templateUsed: string
    estimatedDevelopmentTime: string
    technologyStack: string[]
    features: string[]
  }
}

/**
 * 生成MVP HTML原型
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MVPGenerationRequest

    // 验证必要参数
    if (!body.ideaDescription?.trim() || !body.industryType?.trim()) {
      return NextResponse.json({
        success: false,
        error: "缺少创意描述或行业类型"
      }, { status: 400 })
    }

    console.log('🛠️ 开始生成MVP原型', {
      industry: body.industryType,
      features: body.coreFeatures?.length || 0,
      hasModificationContext: !!body.modificationContext,
      hasDesignContext: !!body.designContext
    })

    // 确定颜色方案
    const colorSchemes = {
      blue: { primary: '#3B82F6', secondary: '#8B5CF6' },
      green: { primary: '#10B981', secondary: '#059669' },
      purple: { primary: '#8B5CF6', secondary: '#7C3AED' },
      orange: { primary: '#F97316', secondary: '#EA580C' }
    }
    const selectedColors = colorSchemes[body.designPreferences?.colorScheme || 'blue']

    let htmlCode: string
    let useDeepSeek = true

    // 检查DeepSeek配置
    const deepSeekCheck = checkDeepSeekConfig()
    if (!deepSeekCheck.isConfigured) {
      console.warn('⚠️ DeepSeek未配置，使用降级模板:', deepSeekCheck.error)
      useDeepSeek = false
    }

    // 如果有修改上下文，应用修改
    if (body.modificationContext) {
      console.log('🔧 应用功能修改:', body.modificationContext.modificationRequest)

      if (useDeepSeek) {
        try {
          // 使用DeepSeek API进行智能修改
          const modifyRequest: ModifyMVPRequest = {
            ideaDescription: body.ideaDescription,
            ideaTitle: body.ideaTitle || body.ideaDescription.slice(0, 30),
            targetUsers: body.targetUsers || ['目标用户'],
            coreFeatures: body.coreFeatures || ['核心功能'],
            industryType: body.industryType,
            designPreferences: body.designPreferences,
            previousHtmlCode: body.modificationContext.previousHtmlCode,
            modificationRequest: body.modificationContext.modificationRequest
          }

          htmlCode = await modifyFunctionalMVP(modifyRequest)
          console.log('✅ DeepSeek API成功生成修改版本')
        } catch (error) {
          console.error('❌ DeepSeek修改失败，使用降级方案:', error)
          htmlCode = applyModifications(
            body.modificationContext.previousHtmlCode,
            body.modificationContext.modificationRequest,
            body
          )
        }
      } else {
        // 降级：使用简单的字符串替换修改
        htmlCode = applyModifications(
          body.modificationContext.previousHtmlCode,
          body.modificationContext.modificationRequest,
          body
        )
      }
    }
    // 如果有设计上下文，应用设计调整
    else if (body.designContext) {
      console.log('🎨 应用设计调整:', body.designContext.designAdjustmentRequest)

      if (useDeepSeek) {
        try {
          // 使用DeepSeek API进行设计调整
          const designRequest: DesignAdjustmentRequest = {
            ideaDescription: body.ideaDescription,
            ideaTitle: body.ideaTitle || body.ideaDescription.slice(0, 30),
            targetUsers: body.targetUsers || ['目标用户'],
            coreFeatures: body.coreFeatures || ['核心功能'],
            industryType: body.industryType,
            designPreferences: body.designPreferences,
            previousHtmlCode: body.designContext.previousHtmlCode,
            designAdjustmentRequest: body.designContext.designAdjustmentRequest
          }

          htmlCode = await adjustMVPDesign(designRequest)
          console.log('✅ DeepSeek API成功应用设计调整')
        } catch (error) {
          console.error('❌ DeepSeek设计调整失败，使用降级方案:', error)
          htmlCode = applyDesignAdjustments(
            body.designContext.previousHtmlCode,
            body.designContext.designAdjustmentRequest,
            selectedColors,
            body.designPreferences?.style || 'modern'
          )
        }
      } else {
        // 降级：使用简单的CSS类替换
        htmlCode = applyDesignAdjustments(
          body.designContext.previousHtmlCode,
          body.designContext.designAdjustmentRequest,
          selectedColors,
          body.designPreferences?.style || 'modern'
        )
      }
    }
    // 否则生成新的功能性MVP
    else {
      console.log('✨ 生成新的功能性MVP原型')

      if (useDeepSeek) {
        try {
          // 使用DeepSeek API生成功能性MVP
          const generateRequest: GenerateMVPRequest = {
            ideaDescription: body.ideaDescription,
            ideaTitle: body.ideaTitle || body.ideaDescription.slice(0, 30),
            targetUsers: body.targetUsers || ['目标用户'],
            coreFeatures: body.coreFeatures || ['核心功能1', '核心功能2', '核心功能3'],
            industryType: body.industryType,
            designPreferences: body.designPreferences
          }

          htmlCode = await generateFunctionalMVP(generateRequest)
          console.log('✅ DeepSeek API成功生成功能性MVP')
        } catch (error) {
          console.error('❌ DeepSeek生成失败，使用降级模板:', error)
          htmlCode = generateDefaultTemplate(body, selectedColors)
        }
      } else {
        // 降级：使用静态模板
        htmlCode = generateDefaultTemplate(body, selectedColors)
      }
    }

    // 构建完整的原型数据
    const prototype: MVPPrototype = {
      htmlCode,
      cssCode: '', // Tailwind CSS通过CDN引入，不需要单独的CSS
      jsCode: generateDefaultJS(),
      readme: generateDefaultReadme(body),
      metadata: {
        generatedAt: new Date().toISOString(),
        templateUsed: body.industryType,
        estimatedDevelopmentTime: '2-4周（全栈开发）',
        technologyStack: [
          'HTML5',
          'Tailwind CSS',
          'JavaScript (ES6+)',
          '响应式设计'
        ],
        features: body.coreFeatures || ['基础展示', '响应式布局', '现代化UI']
      }
    }

    console.log('✅ MVP原型生成完成', {
      htmlSize: prototype.htmlCode.length,
      hasModification: !!body.modificationContext || !!body.designContext
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: `mvp_${Date.now()}`,
        prototype,
        downloadUrls: {
          htmlBundle: '/api/business-plan/modules/mvp-prototype/download?format=html',
          sourceCode: '/api/business-plan/modules/mvp-prototype/download?format=zip',
          previewUrl: `/preview/mvp/${Date.now()}`
        }
      },
      estimatedTime: '5-8分钟',
      moduleType: 'mvp-prototype'
    })

  } catch (error) {
    console.error('❌ MVP原型生成失败:', error)
    return handleApiError(error)
  }
}

/**
 * 生成默认HTML模板
 */
function generateDefaultTemplate(
  body: MVPGenerationRequest,
  colors: { primary: string; secondary: string }
): string {
  const features = body.coreFeatures || ['功能1', '功能2', '功能3']

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${body.ideaDescription.slice(0, 30)} - MVP原型</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '${colors.primary}',
                        secondary: '${colors.secondary}'
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <div class="flex items-center">
                    <h1 class="text-xl font-bold text-gray-900">产品名称</h1>
                </div>
                <div class="hidden md:flex items-center space-x-6">
                    <a href="#features" class="text-gray-600 hover:text-gray-900 transition-colors">功能特性</a>
                    <a href="#pricing" class="text-gray-600 hover:text-gray-900 transition-colors">价格方案</a>
                    <a href="#about" class="text-gray-600 hover:text-gray-900 transition-colors">关于我们</a>
                    <button class="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                        立即体验
                    </button>
                </div>
                <!-- 移动端菜单按钮 -->
                <button id="mobile-menu-button" class="md:hidden text-gray-600 hover:text-gray-900">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </nav>

    <!-- 英雄区域 -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                    ${body.ideaDescription}
                </h1>
                <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                    为${body.targetUsers?.[0] || '用户'}提供专业的解决方案
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                        免费试用
                    </button>
                    <button class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                        了解更多
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- 功能特性区域 -->
    <section id="features" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    强大的功能特性
                </h2>
                <p class="text-xl text-gray-600">
                    全方位满足您的需求
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                ${features.map((feature, index) => `
                <div class="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow bg-white">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">${feature}</h3>
                    <p class="text-gray-600">为您提供专业的${feature}解决方案</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- 底部 -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-4 gap-8">
                <div>
                    <h3 class="text-lg font-semibold mb-4">产品名称</h3>
                    <p class="text-gray-400 text-sm">
                        提供专业的解决方案
                    </p>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">产品</h4>
                    <ul class="space-y-2 text-sm text-gray-400">
                        <li><a href="#" class="hover:text-white transition-colors">功能介绍</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">价格方案</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">客户案例</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">支持</h4>
                    <ul class="space-y-2 text-sm text-gray-400">
                        <li><a href="#" class="hover:text-white transition-colors">帮助中心</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">联系我们</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">隐私政策</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">关注我们</h4>
                    <div class="flex space-x-4">
                        <a href="#" class="text-gray-400 hover:text-white transition-colors">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-white transition-colors">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                <p>&copy; 2025 产品名称. 保留所有权利。</p>
            </div>
        </div>
    </footer>

    <script>
        // 平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // 移动端菜单
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', () => {
                alert('移动端菜单功能 - 在实际项目中，这里会展开菜单');
            });
        }

        // 按钮交互
        document.querySelectorAll('button').forEach(button => {
            const text = button.textContent.trim();
            if (text.includes('试用') || text.includes('体验') || text.includes('更多')) {
                button.addEventListener('click', () => {
                    alert('感谢您的兴趣！这是一个演示页面。\\n\\n在实际项目中，这里会跳转到注册或详情页面。');
                });
            }
        });

        // 滚动动画
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    </script>
</body>
</html>`
}

/**
 * 生成默认JavaScript代码
 */
function generateDefaultJS(): string {
  return `// MVP原型交互代码
console.log('MVP原型已加载');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面准备就绪');
});`
}

/**
 * 生成默认README
 */
function generateDefaultReadme(body: MVPGenerationRequest): string {
  return `# MVP原型 - ${body.ideaDescription}

## 项目介绍
这是一个基于AI生成的MVP前端原型，展示了产品的核心功能和用户界面。

## 技术栈
- HTML5
- Tailwind CSS (CDN)
- JavaScript (ES6+)
- 响应式设计

## 功能特性
${body.coreFeatures?.map((f, i) => `${i + 1}. ${f}`).join('\n') || '- 基础展示功能'}

## 使用方法
1. 直接在浏览器中打开 \`index.html\` 文件
2. 或者使用本地服务器：
   \`\`\`bash
   # 使用 Python
   python -m http.server 8000

   # 使用 Node.js
   npx serve
   \`\`\`

## 部署建议
- **Netlify**: 拖拽文件夹即可部署
- **Vercel**: 连接Git仓库自动部署
- **GitHub Pages**: 免费托管静态网站

## 下一步开发建议
1. 添加后端API接口
2. 实现用户认证功能
3. 连接数据库
4. 添加更多交互功能
5. 进行性能优化

## 注意事项
- 这是一个演示原型，部分功能为模拟实现
- 建议在实际开发中使用框架（如React、Vue）
- 需要添加后端支持才能实现完整功能

## 生成信息
- 生成时间：${new Date().toLocaleString('zh-CN')}
- 行业类型：${body.industryType}
- 目标用户：${body.targetUsers?.join('、') || '通用用户'}

---

**AI生成 · 仅供参考 · 建议根据实际需求调整**`
}

/**
 * 应用功能修改
 */
function applyModifications(
  previousHtml: string,
  modificationRequest: string,
  body: MVPGenerationRequest
): string {
  let modifiedHtml = previousHtml
  const request = modificationRequest.toLowerCase()

  console.log('🔧 开始应用修改:', modificationRequest)

  // 1. 添加新功能/区块
  if (request.includes('添加') || request.includes('增加') || request.includes('新增')) {
    // 提取要添加的内容
    if (request.includes('按钮')) {
      const buttonHtml = `
                <button class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg" onclick="alert('新按钮点击！')">
                    ${extractContentFromRequest(modificationRequest, '按钮')}
                </button>`

      // 在功能区域后添加
      modifiedHtml = modifiedHtml.replace(
        '</section>',
        `    <div class="text-center mt-8">${buttonHtml}</div>\n    </section>`
      )
    }

    if (request.includes('功能') || request.includes('特性')) {
      const newFeatureHtml = `
                <div class="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow bg-white">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">${extractContentFromRequest(modificationRequest, '功能')}</h3>
                    <p class="text-gray-600">新增的功能特性</p>
                </div>`

      // 在功能网格中添加
      modifiedHtml = modifiedHtml.replace(
        '</div>\n            </div>\n        </section>',
        `${newFeatureHtml}\n            </div>\n        </section>`
      )
    }
  }

  // 2. 修改现有内容
  if (request.includes('修改') || request.includes('改成') || request.includes('换成')) {
    // 修改标题
    if (request.includes('标题') || request.includes('title')) {
      const newTitle = extractContentFromRequest(modificationRequest, '标题')
      console.log('  ✓ 修改标题为:', newTitle)
      modifiedHtml = modifiedHtml.replace(
        /<h1[^>]*class="text-4xl[^"]*"[^>]*>([\s\S]*?)<\/h1>/,
        `<h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">\n                    ${newTitle}\n                </h1>`
      )
    }

    // 修改描述
    if (request.includes('描述') || request.includes('说明')) {
      const newDesc = extractContentFromRequest(modificationRequest, '描述')
      console.log('  ✓ 修改描述为:', newDesc)
      modifiedHtml = modifiedHtml.replace(
        /<p[^>]*class="text-xl md:text-2xl[^"]*"[^>]*>([\s\S]*?)<\/p>/,
        `<p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">\n                    ${newDesc}\n                </p>`
      )
    }

    // 修改按钮文本
    if (request.includes('按钮')) {
      const newButtonText = extractContentFromRequest(modificationRequest, '按钮')
      console.log('  ✓ 修改按钮为:', newButtonText)
      modifiedHtml = modifiedHtml.replace(
        /立即体验|免费试用/g,
        newButtonText
      )
    }
  }

  // 3. 删除元素
  if (request.includes('删除') || request.includes('移除') || request.includes('去掉')) {
    if (request.includes('按钮')) {
      // 删除第一个按钮
      modifiedHtml = modifiedHtml.replace(
        /<button class="bg-white text-blue-600.*?<\/button>/s,
        ''
      )
    }

    if (request.includes('底部') || request.includes('footer')) {
      modifiedHtml = modifiedHtml.replace(
        /<footer.*?<\/footer>/s,
        ''
      )
    }
  }

  // 4. 调整布局
  if (request.includes('布局') || request.includes('排列')) {
    if (request.includes('横向') || request.includes('水平')) {
      modifiedHtml = modifiedHtml.replace(
        /grid md:grid-cols-3/g,
        'flex flex-row'
      )
    }

    if (request.includes('竖向') || request.includes('垂直')) {
      modifiedHtml = modifiedHtml.replace(
        /grid md:grid-cols-3/g,
        'flex flex-col'
      )
    }
  }

  console.log('✅ 修改应用完成')
  return modifiedHtml
}

/**
 * 应用设计调整
 */
function applyDesignAdjustments(
  previousHtml: string,
  designRequest: string,
  colors: { primary: string; secondary: string },
  style: string
): string {
  let modifiedHtml = previousHtml
  const request = designRequest.toLowerCase()

  console.log('🎨 开始应用设计调整:', designRequest)

  // 1. 颜色调整
  if (request.includes('颜色') || request.includes('配色') || request.includes('色调')) {
    // 更新 Tailwind 配置中的颜色
    const colorConfig = `        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '${colors.primary}',
                        secondary: '${colors.secondary}'
                    }
                }
            }
        }`

    modifiedHtml = modifiedHtml.replace(
      /tailwind\.config = \{[\s\S]*?\}/,
      colorConfig
    )

    // 替换具体的颜色类
    if (request.includes('蓝色') || request.includes('blue')) {
      modifiedHtml = modifiedHtml.replace(/from-blue-600 to-purple-600/g, 'from-blue-500 to-blue-700')
      modifiedHtml = modifiedHtml.replace(/bg-blue-/g, 'bg-blue-')
      modifiedHtml = modifiedHtml.replace(/text-blue-/g, 'text-blue-')
    } else if (request.includes('绿色') || request.includes('green')) {
      modifiedHtml = modifiedHtml.replace(/from-blue-600 to-purple-600/g, 'from-green-500 to-emerald-600')
      modifiedHtml = modifiedHtml.replace(/bg-blue-100/g, 'bg-green-100')
      modifiedHtml = modifiedHtml.replace(/text-blue-600/g, 'text-green-600')
    } else if (request.includes('紫色') || request.includes('purple')) {
      modifiedHtml = modifiedHtml.replace(/from-blue-600 to-purple-600/g, 'from-purple-500 to-pink-600')
      modifiedHtml = modifiedHtml.replace(/bg-blue-100/g, 'bg-purple-100')
      modifiedHtml = modifiedHtml.replace(/text-blue-600/g, 'text-purple-600')
    } else if (request.includes('橙色') || request.includes('orange')) {
      modifiedHtml = modifiedHtml.replace(/from-blue-600 to-purple-600/g, 'from-orange-500 to-red-600')
      modifiedHtml = modifiedHtml.replace(/bg-blue-100/g, 'bg-orange-100')
      modifiedHtml = modifiedHtml.replace(/text-blue-600/g, 'text-orange-600')
    }
  }

  // 2. 风格调整
  if (request.includes('风格') || request.includes('样式') || request.includes('style')) {
    if (request.includes('极简') || request.includes('简约') || request.includes('minimalist')) {
      // 简化设计，移除阴影和渐变
      modifiedHtml = modifiedHtml.replace(/shadow-lg/g, 'shadow-sm')
      modifiedHtml = modifiedHtml.replace(/shadow-xl/g, 'shadow-md')
      modifiedHtml = modifiedHtml.replace(/from-.*? to-.*?"/g, 'bg-white"')
    } else if (request.includes('现代') || request.includes('modern')) {
      // 增强现代感，添加更多渐变和圆角
      modifiedHtml = modifiedHtml.replace(/rounded-lg/g, 'rounded-2xl')
      modifiedHtml = modifiedHtml.replace(/rounded-xl/g, 'rounded-3xl')
    } else if (request.includes('企业') || request.includes('正式') || request.includes('corporate')) {
      // 企业风格，使用深色和方正设计
      modifiedHtml = modifiedHtml.replace(/rounded-lg/g, 'rounded')
      modifiedHtml = modifiedHtml.replace(/rounded-xl/g, 'rounded-md')
      modifiedHtml = modifiedHtml.replace(/from-blue-600 to-purple-600/g, 'bg-gray-800')
    }
  }

  // 3. 字体大小调整
  if (request.includes('字体') || request.includes('文字') || request.includes('大小')) {
    if (request.includes('大') || request.includes('增大')) {
      modifiedHtml = modifiedHtml.replace(/text-4xl/g, 'text-5xl')
      modifiedHtml = modifiedHtml.replace(/text-xl/g, 'text-2xl')
      modifiedHtml = modifiedHtml.replace(/text-lg/g, 'text-xl')
    } else if (request.includes('小') || request.includes('减小')) {
      modifiedHtml = modifiedHtml.replace(/text-4xl/g, 'text-3xl')
      modifiedHtml = modifiedHtml.replace(/text-xl/g, 'text-lg')
      modifiedHtml = modifiedHtml.replace(/text-2xl/g, 'text-xl')
    }
  }

  // 4. 圆角调整
  if (request.includes('圆角')) {
    if (request.includes('增加') || request.includes('更圆')) {
      modifiedHtml = modifiedHtml.replace(/rounded-lg/g, 'rounded-2xl')
      modifiedHtml = modifiedHtml.replace(/rounded-xl/g, 'rounded-3xl')
      modifiedHtml = modifiedHtml.replace(/rounded-full/g, 'rounded-full')
    } else if (request.includes('减少') || request.includes('方正')) {
      modifiedHtml = modifiedHtml.replace(/rounded-3xl/g, 'rounded-lg')
      modifiedHtml = modifiedHtml.replace(/rounded-2xl/g, 'rounded-md')
      modifiedHtml = modifiedHtml.replace(/rounded-xl/g, 'rounded')
    }
  }

  // 5. 间距调整
  if (request.includes('间距') || request.includes('留白')) {
    if (request.includes('增加') || request.includes('更大')) {
      modifiedHtml = modifiedHtml.replace(/py-20/g, 'py-32')
      modifiedHtml = modifiedHtml.replace(/px-4/g, 'px-8')
      modifiedHtml = modifiedHtml.replace(/gap-8/g, 'gap-12')
    } else if (request.includes('减少') || request.includes('紧凑')) {
      modifiedHtml = modifiedHtml.replace(/py-20/g, 'py-12')
      modifiedHtml = modifiedHtml.replace(/px-8/g, 'px-4')
      modifiedHtml = modifiedHtml.replace(/gap-12/g, 'gap-6')
    }
  }

  // 6. 阴影调整
  if (request.includes('阴影')) {
    if (request.includes('增加') || request.includes('明显')) {
      modifiedHtml = modifiedHtml.replace(/shadow-sm/g, 'shadow-lg')
      modifiedHtml = modifiedHtml.replace(/shadow-md/g, 'shadow-xl')
    } else if (request.includes('减少') || request.includes('淡化') || request.includes('去掉')) {
      modifiedHtml = modifiedHtml.replace(/shadow-xl/g, 'shadow-md')
      modifiedHtml = modifiedHtml.replace(/shadow-lg/g, 'shadow-sm')
      modifiedHtml = modifiedHtml.replace(/shadow-md/g, 'shadow-sm')
    }
  }

  console.log('✅ 设计调整应用完成')
  return modifiedHtml
}

/**
 * 从用户请求中提取内容
 */
function extractContentFromRequest(request: string, keyword: string): string {
  // 尝试提取引号中的内容（支持中英文引号）
  const quotePatterns = [
    /"([^"]+)"/g,  // 英文双引号
    /'([^']+)'/g,  // 英文单引号
    /「([^」]+)」/g, // 中文引号
    /『([^』]+)』/g  // 中文书名号
  ]

  for (const pattern of quotePatterns) {
    const matches = Array.from(request.matchAll(pattern))
    if (matches.length > 0) {
      // 返回第一个匹配的内容
      return matches[0][1].trim()
    }
  }

  // 尝试提取关键词后的内容
  const patterns = [
    new RegExp(`${keyword}[为是:：]+([^，,。！!""'']+)`, 'i'),
    new RegExp(`${keyword}.*?为\\s*([^，,。！!""'']+)`, 'i'),
    new RegExp(`添加.*?${keyword}.*?([^，,。！!""'']+)`, 'i')
  ]

  for (const pattern of patterns) {
    const match = request.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // 默认返回
  return keyword === '按钮' ? '新按钮' :
         keyword === '功能' ? '新功能' :
         keyword === '标题' ? '更新的标题' :
         keyword === '描述' ? '更新的描述' :
         '新内容'
}

/**
 * 下载原型文件
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format')

  if (format === 'example') {
    // 返回示例原型
    const example = {
      htmlCode: generateDefaultTemplate({
        ideaDescription: 'AI智能学习助手',
        targetUsers: ['K12学生', '家长'],
        coreFeatures: ['智能答疑', '学习规划', '进度追踪'],
        industryType: '教育科技'
      }, { primary: '#3B82F6', secondary: '#8B5CF6' }),
      jsCode: generateDefaultJS(),
      readme: '# 示例MVP原型\n\n这是一个示例原型...'
    }

    return NextResponse.json({
      success: true,
      data: example,
      isExample: true
    })
  }

  return NextResponse.json({
    success: false,
    error: '请使用POST方法生成原型'
  }, { status: 405 })
}
