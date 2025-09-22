import nodemailer from 'nodemailer';

export interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email service for sending authentication-related emails
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  private createTransporter() {
    // Configure based on environment
    if (process.env.NODE_ENV === 'development') {
      // For development, you can use services like Ethereal Email
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    }

    // Production configuration - replace with your SMTP settings
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(config: EmailConfig): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: config.from || process.env.FROM_EMAIL || 'noreply@ai-agent-marketplace.com',
        to: config.to,
        subject: config.subject,
        html: config.html,
        text: config.text
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(
    to: string,
    username: string,
    verificationToken: string
  ): Promise<boolean> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { background: #f8fafc; padding: 30px; }
            .button { 
              display: inline-block; 
              background: #4f46e5; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { background: #e2e8f0; padding: 15px; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AI Agent Marketplace!</h1>
            </div>
            <div class="content">
              <h2>Hi ${username},</h2>
              <p>Thank you for creating an account with us. To complete your registration, please verify your email address by clicking the button below:</p>
              
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              
              <p>This verification link will expire in 24 hours for security reasons.</p>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>This email was sent by AI Agent Marketplace. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Welcome to AI Agent Marketplace!
      
      Hi ${username},
      
      Thank you for creating an account with us. To complete your registration, please verify your email address by visiting:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours for security reasons.
      
      If you didn't create an account with us, please ignore this email.
    `;

    return this.sendEmail({
      from: process.env.FROM_EMAIL || 'noreply@ai-agent-marketplace.com',
      to,
      subject: 'Verify Your Email Address',
      html,
      text
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    to: string,
    username: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
            .content { background: #f8fafc; padding: 30px; }
            .button { 
              display: inline-block; 
              background: #ef4444; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { background: #e2e8f0; padding: 15px; font-size: 12px; color: #64748b; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${username},</h2>
              <p>We received a request to reset your password for your AI Agent Marketplace account.</p>
              
              <a href="${resetUrl}" class="button">Reset Password</a>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              
              <div class="warning">
                <strong>Important:</strong>
                <ul>
                  <li>This password reset link will expire in 1 hour for security reasons.</li>
                  <li>If you didn't request a password reset, please ignore this email and contact support if you're concerned about your account security.</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent by AI Agent Marketplace. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Password Reset Request
      
      Hi ${username},
      
      We received a request to reset your password for your AI Agent Marketplace account.
      
      To reset your password, please visit:
      ${resetUrl}
      
      Important:
      - This password reset link will expire in 1 hour for security reasons.
      - If you didn't request a password reset, please ignore this email and contact support if you're concerned about your account security.
    `;

    return this.sendEmail({
      from: process.env.FROM_EMAIL || 'noreply@ai-agent-marketplace.com',
      to,
      subject: 'Reset Your Password',
      html,
      text
    });
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(
    to: string,
    username: string
  ): Promise<boolean> {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to AI Agent Marketplace!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { background: #f8fafc; padding: 30px; }
            .button { 
              display: inline-block; 
              background: #10b981; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { background: #e2e8f0; padding: 15px; font-size: 12px; color: #64748b; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to AI Agent Marketplace!</h1>
            </div>
            <div class="content">
              <h2>Hi ${username},</h2>
              <p>Congratulations! Your email has been verified and your account is now active. Welcome to the AI Agent Marketplace community!</p>
              
              <div class="features">
                <h3>What you can do now:</h3>
                <ul>
                  <li>Browse and discover AI agents created by our community</li>
                  <li>Create and publish your own AI agents</li>
                  <li>Connect with other developers and AI enthusiasts</li>
                  <li>Access premium features and tools</li>
                </ul>
              </div>
              
              <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
              
              <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
              
              <p>Happy building!</p>
              <p>The AI Agent Marketplace Team</p>
            </div>
            <div class="footer">
              <p>This email was sent by AI Agent Marketplace. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Welcome to AI Agent Marketplace!
      
      Hi ${username},
      
      Congratulations! Your email has been verified and your account is now active. Welcome to the AI Agent Marketplace community!
      
      What you can do now:
      - Browse and discover AI agents created by our community
      - Create and publish your own AI agents
      - Connect with other developers and AI enthusiasts
      - Access premium features and tools
      
      Visit your dashboard: ${dashboardUrl}
      
      If you have any questions or need help getting started, don't hesitate to reach out to our support team.
      
      Happy building!
      The AI Agent Marketplace Team
    `;

    return this.sendEmail({
      from: process.env.FROM_EMAIL || 'noreply@ai-agent-marketplace.com',
      to,
      subject: '🎉 Welcome to AI Agent Marketplace!',
      html,
      text
    });
  }

  /**
   * Send security notification email
   */
  async sendSecurityNotification(
    to: string,
    username: string,
    action: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Security Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { background: #f8fafc; padding: 30px; }
            .footer { background: #e2e8f0; padding: 15px; font-size: 12px; color: #64748b; }
            .details { background: white; padding: 16px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Security Alert</h1>
            </div>
            <div class="content">
              <h2>Hi ${username},</h2>
              <p>We're writing to inform you about recent activity on your AI Agent Marketplace account.</p>
              
              <div class="details">
                <h3>Activity Details:</h3>
                <p><strong>Action:</strong> ${action}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
                ${userAgent ? `<p><strong>Device:</strong> ${userAgent}</p>` : ''}
              </div>
              
              <p>If this was you, no further action is needed. If you don't recognize this activity, please:</p>
              <ul>
                <li>Change your password immediately</li>
                <li>Review your account settings</li>
                <li>Contact our support team if you need assistance</li>
              </ul>
            </div>
            <div class="footer">
              <p>This email was sent by AI Agent Marketplace for your security. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Security Alert
      
      Hi ${username},
      
      We're writing to inform you about recent activity on your AI Agent Marketplace account.
      
      Activity Details:
      Action: ${action}
      Time: ${new Date().toLocaleString()}
      ${ipAddress ? `IP Address: ${ipAddress}` : ''}
      ${userAgent ? `Device: ${userAgent}` : ''}
      
      If this was you, no further action is needed. If you don't recognize this activity, please:
      - Change your password immediately
      - Review your account settings
      - Contact our support team if you need assistance
    `;

    return this.sendEmail({
      from: process.env.FROM_EMAIL || 'noreply@ai-agent-marketplace.com',
      to,
      subject: 'Security Alert - Recent Account Activity',
      html,
      text
    });
  }
}

// Singleton instance
export const emailService = new EmailService();