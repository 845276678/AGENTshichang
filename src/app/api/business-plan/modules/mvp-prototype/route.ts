import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/auth'

interface MVPGenerationRequest {
  ideaDescription: string
  targetUsers: string[]
  coreFeatures: string[]
  industryType: string
  designPreferences?: {
    colorScheme?: 'blue' | 'green' | 'purple' | 'orange'
    style?: 'modern' | 'minimalist' | 'corporate' | 'creative'
    includeAnimations?: boolean
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
      features: body.coreFeatures?.length || 0
    })

    // 确定颜色方案
    const colorSchemes = {
      blue: { primary: '#3B82F6', secondary: '#8B5CF6' },
      green: { primary: '#10B981', secondary: '#059669' },
      purple: { primary: '#8B5CF6', secondary: '#7C3AED' },
      orange: { primary: '#F97316', secondary: '#EA580C' }
    }
    const selectedColors = colorSchemes[body.designPreferences?.colorScheme || 'blue']

    // 构建AI提示词
    const prompt = `你是一位资深的前端开发专家和UI/UX设计师。请基于以下创意生成一个完整的HTML前端原型。

创意描述：${body.ideaDescription}
行业类型：${body.industryType}
目标用户：${body.targetUsers?.join('、') || '通用用户'}
核心功能：${body.coreFeatures?.join('、') || '基础功能'}
设计风格：${body.designPreferences?.style || 'modern'}
配色方案：主色调${selectedColors.primary}，辅助色${selectedColors.secondary}

请生成一个专业的HTML原型，包括：

1. **完整的HTML结构** - 使用语义化标签，包含：
   - 响应式导航栏
   - 吸引人的英雄区域（Hero Section）
   - 功能特性展示区域（至少3个核心功能）
   - 定价方案区域（可选，根据产品类型）
   - 底部（Footer）

2. **现代化的样式** - 使用Tailwind CSS CDN：
   - 响应式设计（移动端、平板、桌面）
   - 现代渐变和阴影效果
   - 流畅的悬停和过渡动画
   - 统一的设计系统

3. **基础交互逻辑** - 使用原生JavaScript：
   - 平滑滚动效果
   - 响应式菜单切换
   - 模拟按钮点击反馈
   - 简单的表单验证

4. **README文档** - 包含：
   - 项目说明
   - 技术栈介绍
   - 使用方法
   - 部署建议

请以JSON格式返回，严格遵循以下结构：
{
  "htmlCode": "完整的HTML代码（包含<!DOCTYPE html>和所有标签）",
  "jsCode": "JavaScript交互代码（可以嵌入HTML中的<script>标签内容）",
  "readme": "README.md文档内容（Markdown格式）"
}

注意事项：
- HTML代码必须是完整可运行的
- 使用Tailwind CSS CDN，不需要单独的CSS文件
- 所有文本内容使用中文
- 代码要有清晰的注释
- 确保在所有现代浏览器中都能正常工作`

    // 使用模拟数据生成原型
    console.log('正在生成MVP原型...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 构建完整的原型数据
    const prototype: MVPPrototype = {
      htmlCode: generateDefaultTemplate(body, selectedColors),
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
      jsSize: prototype.jsCode.length
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
