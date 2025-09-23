const fs = require('fs')

// 精确修复语法错误
const fixes = [
  {
    file: 'src/app/dashboard/activity/page.tsx',
    search: /\/\/ const filteredActivityTypes = activeFilter === 'all' \s*\? activityTypes\.slice\(1\)[^\n]*\n\s*: activityTypes\.filter[^\n]*/gm,
    replace: `// const filteredActivityTypes = activeFilter === 'all'
  //   ? activityTypes.slice(1) // Exclude 'all' option
  //   : activityTypes.filter(type => type.id === activeFilter)`
  },
  {
    file: 'src/components/dashboard/RecentActivityFeed.tsx',
    search: /\/\/ const getActivityLink = \(\) => \{\s*switch[\s\S]*?return '#'\s*\}/gm,
    replace: `// const getActivityLink = () => {
  //   switch (activity.type) {
  //     case 'purchase':
  //     case 'view':
  //     case 'usage':
  //     case 'review':
  //       return activity.metadata?.agentName ? \`/agents/\${activity.metadata.agentName.toLowerCase().replace(/\\s+/g, '-')}\` : '#'
  //     case 'account':
  //       return '/dashboard/profile'
  //     default:
  //       return '#'
  //   }
  // }`
  },
  {
    file: 'src/components/creative/CreativeChallengeCard.tsx',
    search: /\/\/ const rarityConfig = \{[\s\S]*?\}/gm,
    replace: `// const rarityConfig = {
//   COMMON: {
//     color: 'text-gray-500',
//     bgColor: 'bg-gray-100',
//     label: '普通'
//   },
//   RARE: {
//     color: 'text-blue-500',
//     bgColor: 'bg-blue-100',
//     label: '稀有'
//   },
//   EPIC: {
//     color: 'text-purple-500',
//     bgColor: 'bg-purple-100',
//     label: '史诗'
//   },
//   LEGENDARY: {
//     color: 'text-orange-500',
//     bgColor: 'bg-orange-100',
//     label: '传说'
//   }
// }`
  }
]

fixes.forEach((fix, index) => {
  console.log(`\n=== 修复 ${index + 1}: ${fix.file} ===`)

  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8')
    console.log('原始内容长度:', content.length)

    const newContent = content.replace(fix.search, fix.replace)

    if (newContent !== content) {
      fs.writeFileSync(fix.file, newContent)
      console.log('✅ 修复成功')
    } else {
      console.log('⚠️ 没有找到匹配的模式，尝试手动检查...')
      // 如果正则匹配失败，我们需要手动处理
    }
  } else {
    console.log('❌ 文件不存在')
  }
})

console.log('\n修复完成！')