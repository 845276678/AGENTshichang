import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function viewRecentIdeas() {
  console.log('📚 查看最近生成的创意...\n')

  try {
    const recentIdeas = await prisma.dailyIdea.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log(`找到 ${recentIdeas.length} 个最新创意:\n`)

    recentIdeas.forEach((idea, index) => {
      console.log(`${index + 1}. 【${idea.publishDate.toLocaleDateString()}】${idea.title}`)
      console.log(`   成熟度: ${idea.maturity}分`)
      console.log(`   领域: ${idea.domain.join(', ')}`)
      console.log(`   描述: ${idea.description.substring(0, 100)}...`)
      console.log(`   创建时间: ${idea.createdAt.toLocaleString()}`)
      console.log(`   引导问题: ${idea.guidingQuestions.length}个`)
      console.log(`   实施提示: ${idea.implementationHints.length}个`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ 查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

viewRecentIdeas()