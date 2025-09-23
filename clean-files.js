const fs = require('fs')

// 修复特定的未使用变量问题
const fixes = [
  {
    file: 'src/app/cart/page.tsx',
    search: /\/\/ const paidItems = items\.filter\(item => item\.price > 0\)/g,
    replace: '// const paidItems = items.filter(item => item.price > 0) // Unused variable'
  },
  {
    file: 'src/components/submission/SubmissionStatus.tsx',
    search: /\/\/ const usagePercentage = .*? \/\/ Unused variable \/\/ 假设最多8次/g,
    replace: '// const usagePercentage = (todayStats.totalSubmissions / (config.dailyFreeLimit + 5)) * 100; // Unused variable'
  }
]

// 移除末尾的 "// Unused variable" 注释
const filesToClean = [
  'src/app/cart/page.tsx',
  'src/app/dashboard/activity/page.tsx',
  'src/app/ideas/[id]/discussion/page.tsx',
  'src/app/ideas/[id]/workbench/page.tsx',
  'src/app/purchase/[id]/page.tsx',
  'src/components/auth/AuthProvider.tsx',
  'src/components/creative/CreativeChallengeCard.tsx',
  'src/components/dashboard/RecentActivityFeed.tsx',
  'src/components/submission/SubmissionStatus.tsx'
]

// 应用特定修复
fixes.forEach(fix => {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8')
    content = content.replace(fix.search, fix.replace)
    fs.writeFileSync(fix.file, content)
    console.log(`Applied fix to: ${fix.file}`)
  }
})

// 清理文件末尾的错误注释
filesToClean.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8')
    content = content.replace(/\s*\/\/ Unused variable\s*$/g, '')
    fs.writeFileSync(filePath, content)
    console.log(`Cleaned: ${filePath}`)
  }
})

console.log('File cleanup completed!')