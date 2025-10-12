/**
 * 测试MVP修改功能
 */

const testHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>测试原型</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div class="max-w-7xl mx-auto px-4">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
                原始标题
            </h1>
            <p class="text-xl md:text-2xl mb-8">
                原始描述
            </p>
            <button class="bg-white text-blue-600 px-8 py-3 rounded-lg">
                免费试用
            </button>
        </div>
    </section>
</body>
</html>`

// 改进的 extractContentFromRequest 函数
function extractContentFromRequest(request, keyword) {
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

  return keyword === '按钮' ? '新按钮' :
         keyword === '功能' ? '新功能' :
         keyword === '标题' ? '更新的标题' :
         keyword === '描述' ? '更新的描述' :
         '新内容'
}

// 模拟 applyModifications 函数
function applyModifications(previousHtml, modificationRequest) {
  let modifiedHtml = previousHtml
  const request = modificationRequest.toLowerCase()

  console.log('🔧 开始应用修改:', modificationRequest)

  // 修改标题
  if (request.includes('修改') && request.includes('标题')) {
    const newTitle = extractContentFromRequest(modificationRequest, '标题')
    console.log('  ✓ 提取到新标题:', newTitle)
    modifiedHtml = modifiedHtml.replace(
      /<h1[^>]*class="text-4xl[^"]*"[^>]*>([\s\S]*?)<\/h1>/,
      `<h1 class="text-4xl md:text-6xl font-bold mb-6">\n                ${newTitle}\n            </h1>`
    )
  }

  // 修改按钮
  if (request.includes('修改') && request.includes('按钮')) {
    const newButtonText = extractContentFromRequest(modificationRequest, '按钮')
    console.log('  ✓ 提取到新按钮文本:', newButtonText)
    modifiedHtml = modifiedHtml.replace(
      /免费试用/g,
      newButtonText
    )
  }

  return modifiedHtml
}

// 模拟 applyDesignAdjustments 函数
function applyDesignAdjustments(previousHtml, designRequest) {
  let modifiedHtml = previousHtml
  const request = designRequest.toLowerCase()

  console.log('🎨 开始应用设计调整:', designRequest)

  // 颜色调整
  if (request.includes('颜色') || request.includes('改成')) {
    if (request.includes('绿色')) {
      console.log('  ✓ 修改颜色为绿色')
      modifiedHtml = modifiedHtml.replace(
        /from-blue-600 to-purple-600/g,
        'from-green-500 to-emerald-600'
      )
      modifiedHtml = modifiedHtml.replace(/text-blue-600/g, 'text-green-600')
    }
  }

  return modifiedHtml
}

// 测试案例
console.log('========== 测试1: 修改标题 ==========')
const test1 = applyModifications(testHTML, '修改标题为"新的标题"')
console.log('修改后包含新标题:', test1.includes('新的标题'))
console.log('')

console.log('========== 测试2: 修改按钮 ==========')
const test2 = applyModifications(testHTML, '修改按钮为"立即开始"')
console.log('修改后包含新按钮文本:', test2.includes('立即开始'))
console.log('')

console.log('========== 测试3: 修改颜色 ==========')
const test3 = applyDesignAdjustments(testHTML, '改成绿色')
console.log('修改后包含绿色渐变:', test3.includes('from-green-500 to-emerald-600'))
console.log('修改后包含绿色文本:', test3.includes('text-green-600'))
console.log('')

console.log('========== 测试4: 连续修改 ==========')
let result = testHTML
result = applyModifications(result, '修改标题为"AI学习助手"')
result = applyDesignAdjustments(result, '改成绿色')
console.log('最终结果包含新标题:', result.includes('AI学习助手'))
console.log('最终结果包含绿色:', result.includes('from-green-500'))
