// 数据库集成测试脚本
import { prisma, checkDatabaseConnection } from './database'
import UserService from './services/user.service'
import IdeaService from './services/idea.service'
import ResearchReportService from './services/research-report.service'

interface TestResult {
  test: string
  success: boolean
  error?: string
  data?: any
}

async function runDatabaseTests(): Promise<TestResult[]> {
  const results: TestResult[] = []

  try {
    // 1. 测试数据库连接
    results.push({
      test: '数据库连接测试',
      success: await checkDatabaseConnection()
    })

    // 2. 测试Prisma客户端生成
    try {
      const userCount = await prisma.user.count()
      results.push({
        test: 'Prisma客户端测试',
        success: true,
        data: { userCount }
      })
    } catch (error) {
      results.push({
        test: 'Prisma客户端测试',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      })
    }

    // 3. 测试用户服务
    try {
      // 检查用户存在性
      const existence = await UserService.checkExistence('test@example.com', 'testuser')
      results.push({
        test: '用户服务 - 检查存在性',
        success: true,
        data: existence
      })

      // 测试用户创建（只在没有同名用户时创建）
      if (!existence.emailExists) {
        const testUser = await UserService.create({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })

        results.push({
          test: '用户服务 - 创建用户',
          success: true,
          data: { userId: testUser.id, credits: testUser.credits }
        })

        // 测试用户查找
        const foundUser = await UserService.findById(testUser.id)
        results.push({
          test: '用户服务 - 查找用户',
          success: !!foundUser,
          data: foundUser ? { id: foundUser.id, email: foundUser.email } : null
        })

        // 测试积分更新
        const updatedUser = await UserService.updateCredits(
          testUser.id,
          100,
          'ADMIN_ADJUSTMENT',
          '测试积分增加'
        )

        results.push({
          test: '用户服务 - 更新积分',
          success: true,
          data: { newCredits: updatedUser.credits }
        })
      } else {
        results.push({
          test: '用户服务 - 创建用户',
          success: true,
          data: { message: '测试用户已存在，跳过创建' }
        })
      }
    } catch (error) {
      results.push({
        test: '用户服务测试',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      })
    }

    // 4. 测试创意服务
    try {
      // 获取或创建测试用户
      let testUser = await UserService.findByEmail('test@example.com')
      if (!testUser) {
        testUser = await UserService.create({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        })
      }

      // 创建测试创意
      const testIdea = await IdeaService.create(testUser.id, {
        title: '测试创意',
        description: '这是一个用于测试数据库集成的创意',
        category: 'TECH',
        tags: ['测试', '数据库'],
        visibility: 'PRIVATE'
      })

      results.push({
        test: '创意服务 - 创建创意',
        success: true,
        data: { ideaId: testIdea.id, title: testIdea.title }
      })

      // 测试创意查找
      const foundIdea = await IdeaService.findById(testIdea.id)
      results.push({
        test: '创意服务 - 查找创意',
        success: !!foundIdea,
        data: foundIdea ? { id: foundIdea.id, title: foundIdea.title } : null
      })

      // 测试创意列表
      const ideas = await IdeaService.getIdeas(1, 5)
      results.push({
        test: '创意服务 - 获取列表',
        success: true,
        data: {
          total: ideas.pagination.total,
          count: ideas.data.length,
          hasNext: ideas.pagination.hasNext
        }
      })

    } catch (error) {
      results.push({
        test: '创意服务测试',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      })
    }

    // 5. 测试调研报告服务
    try {
      // 获取测试用户和创意
      const testUser = await UserService.findByEmail('test@example.com')
      const userIdeas = await IdeaService.getUserIdeas(testUser!.id, 1, 1)

      if (userIdeas.data.length > 0) {
        const testIdea = userIdeas.data[0]

        // 检查是否已有报告
        const hasReport = await ResearchReportService.hasUserGeneratedReport(testUser!.id, testIdea.id)

        if (!hasReport) {
          // 创建测试报告
          const testReport = await ResearchReportService.create(testUser!.id, {
            ideaId: testIdea.id,
            creditsCost: 100
          })

          results.push({
            test: '调研报告服务 - 创建报告',
            success: true,
            data: { reportId: testReport.id, status: testReport.status }
          })

          // 更新报告进度
          await ResearchReportService.updateProgress(testReport.id, 50)

          results.push({
            test: '调研报告服务 - 更新进度',
            success: true,
            data: { progress: 50 }
          })

          // 获取报告
          const foundReport = await ResearchReportService.findById(testReport.id)
          results.push({
            test: '调研报告服务 - 查找报告',
            success: !!foundReport,
            data: foundReport ? {
              id: foundReport.id,
              progress: foundReport.progress,
              status: foundReport.status
            } : null
          })
        } else {
          results.push({
            test: '调研报告服务',
            success: true,
            data: { message: '用户已有调研报告，跳过创建' }
          })
        }
      } else {
        results.push({
          test: '调研报告服务',
          success: true,
          data: { message: '没有可用的创意，跳过报告测试' }
        })
      }

    } catch (error) {
      results.push({
        test: '调研报告服务测试',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      })
    }

    // 6. 测试数据库统计
    try {
      const stats = await prisma.$queryRaw`SELECT COUNT(*) as total FROM "users"`
      results.push({
        test: '数据库统计查询',
        success: true,
        data: stats
      })
    } catch (error) {
      results.push({
        test: '数据库统计查询',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      })
    }

  } catch (error) {
    results.push({
      test: '整体测试',
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    })
  }

  return results
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  console.log('🚀 开始数据库集成测试...\n')

  runDatabaseTests()
    .then((results) => {
      console.log('📊 测试结果:')
      console.log('=' .repeat(50))

      let passedTests = 0
      const totalTests = results.length

      results.forEach((result, index) => {
        const status = result.success ? '✅ 通过' : '❌ 失败'
        console.log(`${index + 1}. ${result.test}: ${status}`)

        if (result.data) {
          console.log(`   数据: ${JSON.stringify(result.data, null, 2)}`)
        }

        if (result.error) {
          console.log(`   错误: ${result.error}`)
        }

        if (result.success) {passedTests++}
        console.log()
      })

      console.log('=' .repeat(50))
      console.log(`🎯 测试总结: ${passedTests}/${totalTests} 通过`)

      if (passedTests === totalTests) {
        console.log('🎉 所有测试通过！数据库集成正常工作。')
        process.exit(0)
      } else {
        console.log('⚠️  有测试失败，请检查配置和数据库连接。')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('💥 测试运行失败:', error)
      process.exit(1)
    })
    .finally(() => {
      // 关闭数据库连接
      prisma.$disconnect()
    })
}

export { runDatabaseTests }
export default runDatabaseTests