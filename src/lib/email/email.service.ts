import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    this.transporter = nodemailer.createTransport(config)
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"AI创意协作平台" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('邮件发送成功:', result.messageId)
      return true
    } catch (error) {
      console.error('邮件发送失败:', error)
      return false
    }
  }

  async sendPaymentSuccessEmail(userEmail: string, amount: number, credits: number, orderId: string) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb;">🎉 支付成功通知</h2>
        <p>您好！</p>
        <p>您的积分充值已成功完成：</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>订单号：</strong>${orderId}</p>
          <p><strong>支付金额：</strong>¥${amount.toFixed(2)}</p>
          <p><strong>获得积分：</strong>${credits.toLocaleString()} 积分</p>
        </div>
        <p>现在您可以使用这些积分来：</p>
        <ul>
          <li>与AI Agent深度协作优化创意</li>
          <li>参与创意工作坊提升技能</li>
          <li>购买其他用户的创意成果</li>
        </ul>
        <p>感谢您对AI创意协作平台的支持！</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          此邮件由系统自动发送，请勿回复。
        </p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject: '支付成功 - AI创意协作平台',
      html
    })
  }

  async sendPaymentFailedEmail(userEmail: string, amount: number, orderId: string, reason?: string) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626;">❌ 支付失败通知</h2>
        <p>您好！</p>
        <p>很抱歉，您的积分充值支付失败：</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>订单号：</strong>${orderId}</p>
          <p><strong>支付金额：</strong>¥${amount.toFixed(2)}</p>
          ${reason ? `<p><strong>失败原因：</strong>${reason}</p>` : ''}
        </div>
        <p>您可以：</p>
        <ul>
          <li>重新尝试支付</li>
          <li>更换支付方式</li>
          <li>联系客服获得帮助</li>
        </ul>
        <p>如有疑问，请联系我们的客服团队。</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          此邮件由系统自动发送，请勿回复。
        </p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject: '支付失败 - AI创意协作平台',
      html
    })
  }

  async sendWelcomeEmail(userEmail: string, username: string) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb;">🎉 欢迎加入AI创意协作平台</h2>
        <p>亲爱的 ${username}，</p>
        <p>欢迎您加入AI创意协作平台！您的创意之旅即将开始。</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">🎁 新用户福利</h3>
          <p>✅ 免费获得 <strong>500积分</strong></p>
          <p>✅ 免费参与新手创意工作坊</p>
          <p>✅ 享受AI协作优惠价格</p>
        </div>

        <h3 style="color: #1f2937;">平台主要功能：</h3>
        <ul>
          <li><strong>创意提交</strong> - 分享您的原创想法</li>
          <li><strong>AI协作</strong> - 与专业AI Agent深度合作</li>
          <li><strong>技能提升</strong> - 参与各类创意工作坊</li>
          <li><strong>创意变现</strong> - 将创意包装成商品销售</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/dashboard"
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            立即开始创意之旅
          </a>
        </div>

        <p>祝您在AI创意协作平台获得丰富的创作体验！</p>

        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          AI创意协作平台团队<br>
          此邮件由系统自动发送，请勿回复。
        </p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject: '欢迎加入AI创意协作平台！',
      html
    })
  }

  async sendCreativePublishedEmail(userEmail: string, username: string, ideaTitle: string, ideaId: string) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #16a34a;">🚀 您的创意已发布成功</h2>
        <p>亲爱的 ${username}，</p>
        <p>恭喜您！您提交的创意已通过审核并成功发布：</p>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="margin-top: 0; color: #1f2937;">${ideaTitle}</h3>
          <p>现在AI Agent们可以看到您的创意并开始竞价协作了！</p>
        </div>

        <h3 style="color: #1f2937;">接下来会发生什么：</h3>
        <ul>
          <li>🤖 专业AI Agent将评估您的创意价值</li>
          <li>💰 AI Agent会根据兴趣程度进行竞价</li>
          <li>🎯 您可以选择最合适的AI Agent进行协作</li>
          <li>📈 通过多轮对话不断优化完善创意</li>
          <li>🛍️ 将最终成果包装成商品进行销售</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/ideas/${ideaId}"
             style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            查看我的创意
          </a>
        </div>

        <p>祝您获得精彩的协作体验！</p>

        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          此邮件由系统自动发送，请勿回复。
        </p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject: `创意发布成功 - ${ideaTitle}`,
      html
    })
  }
}

export const emailService = new EmailService()
export default EmailService