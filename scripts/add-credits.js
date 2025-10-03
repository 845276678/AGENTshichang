/**
 * 管理员脚本: 为指定用户添加积分
 * 使用方法: node scripts/add-credits.js <email_or_id> <amount>
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addCredits(emailOrId, amount) {
  try {
    // 查找用户
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrId },
          { id: emailOrId },
          { username: emailOrId }
        ]
      }
    })

    if (!user) {
      console.error(`❌ 未找到用户: ${emailOrId}`)
      process.exit(1)
    }

    console.log(`📋 找到用户:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   用户名: ${user.username || '无'}`)
    console.log(`   当前积分: ${user.credits}`)

    // 更新积分
    const updatedUser = await prisma.$transaction(async (tx) => {
      const newCredits = user.credits + amount

      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: newCredits,
          totalEarned: amount > 0 ? user.totalEarned + amount : user.totalEarned
        }
      })

      // 记录交易
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount,
          type: amount > 0 ? 'ADMIN_ADJUSTMENT' : 'ADMIN_ADJUSTMENT',
          description: `管理员手动${amount > 0 ? '充值' : '扣除'} ${Math.abs(amount)} 积分`,
          relatedId: 'ADMIN_OPERATION',
          balanceBefore: user.credits,
          balanceAfter: newCredits
        }
      })

      return updated
    })

    console.log(`\n✅ 积分更新成功!`)
    console.log(`   操作: ${amount > 0 ? '+' : ''}${amount} 积分`)
    console.log(`   新余额: ${updatedUser.credits}`)

  } catch (error) {
    console.error(`\n❌ 错误:`, error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 解析命令行参数
const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('使用方法: node scripts/add-credits.js <email_or_id> <amount>')
  console.log('示例: node scripts/add-credits.js 845276678 90000')
  process.exit(1)
}

const [emailOrId, amountStr] = args
const amount = parseInt(amountStr)

if (isNaN(amount)) {
  console.error('❌ 积分数量必须是数字')
  process.exit(1)
}

addCredits(emailOrId, amount)
