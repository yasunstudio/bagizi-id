/**
 * @fileoverview Notification Service Module - WhatsApp & Email
 * @version Next.js 15.5.4 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Comprehensive notification service for:
 * - WhatsApp notifications via WhatsApp Business API
 * - Email notifications via transactional email service
 * - Approval requests, budget alerts, escalation notices
 * - Order status updates, QC notifications
 * 
 * SUPPORTED PROVIDERS:
 * - WhatsApp: Twilio, WhatsApp Business API, Fonnte
 * - Email: Resend, SendGrid, AWS SES
 */

import { db } from '@/lib/prisma'

// ================================ TYPES ================================

export type NotificationType = 
  | 'APPROVAL_REQUEST'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REJECTED'
  | 'ESCALATION_NOTICE'
  | 'BUDGET_ALERT'
  | 'ORDER_CREATED'
  | 'ORDER_RECEIVED'
  | 'QC_FAILED'
  | 'QC_PASSED'

export interface NotificationRecipient {
  phone?: string
  email?: string
  name: string
  role?: string
}

export interface NotificationData {
  type: NotificationType
  recipients: NotificationRecipient[]
  sppgId: string
  metadata: {
    orderId?: string
    orderCode?: string
    totalAmount?: number
    supplierName?: string
    approverName?: string
    budgetPercentage?: number
    categoryName?: string
    reason?: string
    [key: string]: string | number | boolean | undefined
  }
}

export interface WhatsAppConfig {
  provider: 'twilio' | 'fonnte' | 'waba' // WhatsApp Business API
  apiUrl?: string
  apiKey?: string
  apiToken?: string
  accountSid?: string // Twilio
  authToken?: string // Twilio
  fromNumber?: string
}

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'ses'
  apiKey?: string
  fromEmail?: string
  fromName?: string
}

interface NotificationResult {
  success: boolean
  messageId?: string
  error?: string
  provider?: string
}

// ================================ WHATSAPP SERVICE ================================

/**
 * WhatsApp notification service
 * Supports multiple providers: Twilio, Fonnte, WhatsApp Business API
 */
export class WhatsAppService {
  private config: WhatsAppConfig

  constructor(config: WhatsAppConfig) {
    this.config = config
  }

  /**
   * Send WhatsApp message via configured provider
   */
  async sendMessage(
    to: string,
    message: string
  ): Promise<NotificationResult> {
    try {
      switch (this.config.provider) {
        case 'fonnte':
          return await this.sendViaFonnte(to, message)
        case 'twilio':
          return await this.sendViaTwilio(to, message)
        case 'waba':
          return await this.sendViaWABA(to, message)
        default:
          return {
            success: false,
            error: `Unsupported provider: ${this.config.provider}`,
          }
      }
    } catch (error) {
      console.error('WhatsApp send error:', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * Send via Fonnte (Indonesian WhatsApp Gateway)
   * https://fonnte.com
   */
  private async sendViaFonnte(
    to: string,
    message: string
  ): Promise<NotificationResult> {
    if (!this.config.apiToken) {
      return { success: false, error: 'Fonnte API token not configured' }
    }

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: this.config.apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: to,
        message,
        countryCode: '62', // Indonesia
      }),
    })

    const result = await response.json()

    if (response.ok && result.status) {
      return {
        success: true,
        messageId: result.id,
        provider: 'fonnte',
      }
    }

    return {
      success: false,
      error: result.reason || 'Failed to send via Fonnte',
      provider: 'fonnte',
    }
  }

  /**
   * Send via Twilio
   * https://www.twilio.com
   */
  private async sendViaTwilio(
    to: string,
    message: string
  ): Promise<NotificationResult> {
    if (!this.config.accountSid || !this.config.authToken || !this.config.fromNumber) {
      return { success: false, error: 'Twilio credentials not configured' }
    }

    const auth = Buffer.from(
      `${this.config.accountSid}:${this.config.authToken}`
    ).toString('base64')

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:${to}`,
          From: `whatsapp:${this.config.fromNumber}`,
          Body: message,
        }),
      }
    )

    const result = await response.json()

    if (response.ok && result.sid) {
      return {
        success: true,
        messageId: result.sid,
        provider: 'twilio',
      }
    }

    return {
      success: false,
      error: result.message || 'Failed to send via Twilio',
      provider: 'twilio',
    }
  }

  /**
   * Send via WhatsApp Business API (Meta)
   * https://developers.facebook.com/docs/whatsapp
   */
  private async sendViaWABA(
    to: string,
    message: string
  ): Promise<NotificationResult> {
    if (!this.config.apiUrl || !this.config.apiKey) {
      return { success: false, error: 'WABA credentials not configured' }
    }

    const response = await fetch(`${this.config.apiUrl}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    })

    const result = await response.json()

    if (response.ok && result.messages?.[0]?.id) {
      return {
        success: true,
        messageId: result.messages[0].id,
        provider: 'waba',
      }
    }

    return {
      success: false,
      error: result.error?.message || 'Failed to send via WABA',
      provider: 'waba',
    }
  }
}

// ================================ EMAIL SERVICE ================================

/**
 * Email notification service
 * Supports multiple providers: Resend, SendGrid, AWS SES
 */
export class EmailService {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  /**
   * Send email via configured provider
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<NotificationResult> {
    try {
      switch (this.config.provider) {
        case 'resend':
          return await this.sendViaResend(to, subject, html)
        case 'sendgrid':
          return await this.sendViaSendGrid(to, subject, html)
        case 'ses':
          return await this.sendViaSES(to, subject, html)
        default:
          return {
            success: false,
            error: `Unsupported email provider: ${this.config.provider}`,
          }
      }
    } catch (error) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      }
    }
  }

  /**
   * Send via Resend (Recommended for Indonesian market)
   * https://resend.com/docs/send-with-nodejs
   */
  private async sendViaResend(
    to: string,
    subject: string,
    html: string
  ): Promise<NotificationResult> {
    if (!this.config.apiKey || !this.config.fromEmail) {
      return { success: false, error: 'Resend credentials not configured' }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${this.config.fromName || 'Bagizi-ID'} <${this.config.fromEmail}>`,
        to: [to],
        subject,
        html,
      }),
    })

    const result = await response.json()

    if (response.ok && result.id) {
      return {
        success: true,
        messageId: result.id,
        provider: 'resend',
      }
    }

    return {
      success: false,
      error: result.message || 'Failed to send via Resend',
      provider: 'resend',
    }
  }

  /**
   * Send via SendGrid
   * https://docs.sendgrid.com/api-reference/mail-send/mail-send
   */
  private async sendViaSendGrid(
    to: string,
    subject: string,
    html: string
  ): Promise<NotificationResult> {
    if (!this.config.apiKey || !this.config.fromEmail) {
      return { success: false, error: 'SendGrid credentials not configured' }
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName || 'Bagizi-ID',
        },
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    })

    if (response.ok) {
      const messageId = response.headers.get('X-Message-Id')
      return {
        success: true,
        messageId: messageId || 'sent',
        provider: 'sendgrid',
      }
    }

    const result = await response.json()
    return {
      success: false,
      error: result.errors?.[0]?.message || 'Failed to send via SendGrid',
      provider: 'sendgrid',
    }
  }

  /**
   * Send via AWS SES
   * https://docs.aws.amazon.com/ses/latest/APIReference/API_SendEmail.html
   */
  private async sendViaSES(
    to: string,
    subject: string,
    html: string
  ): Promise<NotificationResult> {
    if (!this.config.apiKey || !this.config.fromEmail) {
      return { success: false, error: 'AWS SES credentials not configured' }
    }

    // Note: AWS SES requires AWS SDK or signed requests
    // This is a simplified example - in production, use @aws-sdk/client-ses
    
    // Placeholder for AWS SES implementation
    console.log('AWS SES email would be sent:', { to, subject, from: this.config.fromEmail })
    console.log('HTML preview:', html.substring(0, 100))
    
    return {
      success: false,
      error: 'AWS SES requires AWS SDK implementation - please use Resend or SendGrid',
      provider: 'ses',
    }
  }
}

// ================================ MESSAGE TEMPLATES ================================

/**
 * Generate WhatsApp message templates
 */
export class MessageTemplates {
  /**
   * Approval request template
   */
  static approvalRequest(data: NotificationData): string {
    const { orderCode, totalAmount, supplierName } = data.metadata
    
    return `
🔔 *Permintaan Approval*

Order: *${orderCode}*
Supplier: ${supplierName}
Total: *${this.formatCurrency(totalAmount)}*

Menunggu approval Anda.
Silakan buka aplikasi untuk review.

_Bagizi-ID Procurement System_
    `.trim()
  }

  /**
   * Approval granted template
   */
  static approvalGranted(data: NotificationData): string {
    const { orderCode, approverName } = data.metadata
    
    return `
✅ *Order Disetujui*

Order: *${orderCode}*
Disetujui oleh: ${approverName}

Order akan diproses lebih lanjut.

_Bagizi-ID Procurement System_
    `.trim()
  }

  /**
   * Approval rejected template
   */
  static approvalRejected(data: NotificationData): string {
    const { orderCode, approverName, reason } = data.metadata
    
    return `
❌ *Order Ditolak*

Order: *${orderCode}*
Ditolak oleh: ${approverName}
Alasan: ${reason}

Silakan review dan revisi order.

_Bagizi-ID Procurement System_
    `.trim()
  }

  /**
   * Escalation notice template
   */
  static escalationNotice(data: NotificationData): string {
    const { orderCode, reason } = data.metadata
    
    return `
⚠️ *Eskalasi Approval*

Order: *${orderCode}*
Alasan: ${reason}

Order telah dieskalasi ke Anda untuk approval.
Mohon segera ditindaklanjuti.

_Bagizi-ID Procurement System_
    `.trim()
  }

  /**
   * Budget alert template
   */
  static budgetAlert(data: NotificationData): string {
    const { categoryName, budgetPercentage } = data.metadata
    
    return `
💰 *Peringatan Budget*

Kategori: *${categoryName}*
Penggunaan: *${budgetPercentage}%*

Budget kategori ini telah mencapai threshold.
Harap perhatikan pengeluaran berikutnya.

_Bagizi-ID Procurement System_
    `.trim()
  }

  /**
   * Order created template
   */
  static orderCreated(data: NotificationData): string {
    const { orderCode, totalAmount, supplierName } = data.metadata
    
    return `
📦 *Order Baru Dibuat*

Order: *${orderCode}*
Supplier: ${supplierName}
Total: *${this.formatCurrency(totalAmount)}*

Order berhasil dibuat dan menunggu proses.

_Bagizi-ID Procurement System_
    `.trim()
  }

  /**
   * Format currency to IDR
   */
  private static formatCurrency(amount?: number): string {
    if (!amount) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }
}

// ================================ EMAIL TEMPLATES ================================

/**
 * Generate HTML email templates
 */
export class EmailTemplates {
  /**
   * Base email template with Bagizi-ID branding
   */
  private static baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .info-box {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .info-box strong {
      color: #667eea;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge-success {
      background: #d4edda;
      color: #155724;
    }
    .badge-warning {
      background: #fff3cd;
      color: #856404;
    }
    .badge-danger {
      background: #f8d7da;
      color: #721c24;
    }
    .badge-info {
      background: #d1ecf1;
      color: #0c5460;
    }
  </style>
</head>
<body>
  ${content}
  <div class="footer">
    <p><strong>Bagizi-ID Procurement System</strong></p>
    <p>© ${new Date().getFullYear()} Bagizi-ID. All rights reserved.</p>
    <p style="color: #999; font-size: 11px;">
      Email ini dikirim secara otomatis, mohon tidak membalas email ini.
    </p>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Approval request email template
   */
  static approvalRequest(data: NotificationData): { subject: string; html: string } {
    const { orderCode, totalAmount, supplierName } = data.metadata
    
    const content = `
  <div class="header">
    <h1>🔔 Permintaan Approval</h1>
  </div>
  <div class="content">
    <p>Halo,</p>
    <p>Anda memiliki permintaan approval order baru yang memerlukan tindakan Anda.</p>
    
    <div class="info-box">
      <p><strong>Order:</strong> ${orderCode}</p>
      <p><strong>Supplier:</strong> ${supplierName}</p>
      <p><strong>Total:</strong> ${this.formatCurrency(totalAmount)}</p>
      <p><span class="badge badge-warning">Menunggu Approval</span></p>
    </div>
    
    <p>Silakan buka aplikasi untuk mereview dan menyetujui order ini.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/procurement/orders/${data.metadata.orderId}" class="button">
      Lihat Detail Order
    </a>
    
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      Order ini memerlukan approval Anda sebelum dapat diproses lebih lanjut.
    </p>
  </div>
    `
    
    return {
      subject: `[Bagizi-ID] Permintaan Approval Order ${orderCode}`,
      html: this.baseTemplate(content),
    }
  }

  /**
   * Approval granted email template
   */
  static approvalGranted(data: NotificationData): { subject: string; html: string } {
    const { orderCode, approverName } = data.metadata
    
    const content = `
  <div class="header">
    <h1>✅ Order Disetujui</h1>
  </div>
  <div class="content">
    <p>Halo,</p>
    <p>Order Anda telah disetujui dan siap untuk diproses.</p>
    
    <div class="info-box">
      <p><strong>Order:</strong> ${orderCode}</p>
      <p><strong>Disetujui oleh:</strong> ${approverName}</p>
      <p><span class="badge badge-success">Disetujui</span></p>
    </div>
    
    <p>Order akan diproses lebih lanjut sesuai dengan prosedur procurement.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/procurement/orders/${data.metadata.orderId}" class="button">
      Lihat Detail Order
    </a>
  </div>
    `
    
    return {
      subject: `[Bagizi-ID] Order ${orderCode} Disetujui`,
      html: this.baseTemplate(content),
    }
  }

  /**
   * Approval rejected email template
   */
  static approvalRejected(data: NotificationData): { subject: string; html: string } {
    const { orderCode, approverName, reason } = data.metadata
    
    const content = `
  <div class="header">
    <h1>❌ Order Ditolak</h1>
  </div>
  <div class="content">
    <p>Halo,</p>
    <p>Order Anda telah ditolak dan memerlukan tindakan lebih lanjut.</p>
    
    <div class="info-box">
      <p><strong>Order:</strong> ${orderCode}</p>
      <p><strong>Ditolak oleh:</strong> ${approverName}</p>
      <p><strong>Alasan:</strong> ${reason}</p>
      <p><span class="badge badge-danger">Ditolak</span></p>
    </div>
    
    <p>Silakan review alasan penolakan dan lakukan penyesuaian yang diperlukan.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/procurement/orders/${data.metadata.orderId}" class="button">
      Lihat Detail Order
    </a>
  </div>
    `
    
    return {
      subject: `[Bagizi-ID] Order ${orderCode} Ditolak`,
      html: this.baseTemplate(content),
    }
  }

  /**
   * Escalation notice email template
   */
  static escalationNotice(data: NotificationData): { subject: string; html: string } {
    const { orderCode, reason } = data.metadata
    
    const content = `
  <div class="header">
    <h1>⚠️ Eskalasi Approval</h1>
  </div>
  <div class="content">
    <p>Halo,</p>
    <p>Order berikut telah dieskalasi kepada Anda untuk approval.</p>
    
    <div class="info-box">
      <p><strong>Order:</strong> ${orderCode}</p>
      <p><strong>Alasan Eskalasi:</strong> ${reason}</p>
      <p><span class="badge badge-warning">Eskalasi</span></p>
    </div>
    
    <p>Order ini memerlukan perhatian segera. Mohon segera review dan berikan keputusan.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/procurement/orders/${data.metadata.orderId}" class="button">
      Lihat Detail Order
    </a>
    
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      Order telah melewati waktu approval normal dan memerlukan tindakan cepat dari Anda.
    </p>
  </div>
    `
    
    return {
      subject: `[URGENT] Eskalasi Order ${orderCode}`,
      html: this.baseTemplate(content),
    }
  }

  /**
   * Budget alert email template
   */
  static budgetAlert(data: NotificationData): { subject: string; html: string } {
    const { categoryName, budgetPercentage } = data.metadata
    
    const badgeClass = 
      (budgetPercentage || 0) >= 90 ? 'badge-danger' :
      (budgetPercentage || 0) >= 80 ? 'badge-warning' :
      'badge-info'
    
    const content = `
  <div class="header">
    <h1>💰 Peringatan Budget</h1>
  </div>
  <div class="content">
    <p>Halo,</p>
    <p>Budget kategori procurement telah mencapai threshold yang telah ditentukan.</p>
    
    <div class="info-box">
      <p><strong>Kategori:</strong> ${categoryName}</p>
      <p><strong>Penggunaan Budget:</strong> ${budgetPercentage}%</p>
      <p><span class="badge ${badgeClass}">Alert Threshold</span></p>
    </div>
    
    <p>Harap perhatikan pengeluaran pada kategori ini untuk periode mendatang.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/procurement/reports" class="button">
      Lihat Laporan Budget
    </a>
    
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      ${(budgetPercentage || 0) >= 90 
        ? '⚠️ <strong>Peringatan:</strong> Budget hampir habis! Segera lakukan review.'
        : 'Monitoring budget secara berkala sangat penting untuk perencanaan keuangan yang baik.'}
    </p>
  </div>
    `
    
    return {
      subject: `[Bagizi-ID] Peringatan Budget - ${categoryName}`,
      html: this.baseTemplate(content),
    }
  }

  /**
   * Order created email template
   */
  static orderCreated(data: NotificationData): { subject: string; html: string } {
    const { orderCode, totalAmount, supplierName } = data.metadata
    
    const content = `
  <div class="header">
    <h1>📦 Order Baru Dibuat</h1>
  </div>
  <div class="content">
    <p>Halo,</p>
    <p>Order procurement baru telah berhasil dibuat.</p>
    
    <div class="info-box">
      <p><strong>Order:</strong> ${orderCode}</p>
      <p><strong>Supplier:</strong> ${supplierName}</p>
      <p><strong>Total:</strong> ${this.formatCurrency(totalAmount)}</p>
      <p><span class="badge badge-info">Order Baru</span></p>
    </div>
    
    <p>Order sedang dalam proses dan akan diupdate sesuai dengan progress-nya.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/procurement/orders/${data.metadata.orderId}" class="button">
      Lihat Detail Order
    </a>
  </div>
    `
    
    return {
      subject: `[Bagizi-ID] Order Baru ${orderCode}`,
      html: this.baseTemplate(content),
    }
  }

  /**
   * Format currency to IDR
   */
  private static formatCurrency(amount?: number): string {
    if (!amount) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }
}

// ================================ NOTIFICATION SERVICE ================================

/**
 * Main notification service
 * Handles WhatsApp and Email notifications
 */
export class NotificationService {
  private whatsappService: WhatsAppService | null = null
  private emailService: EmailService | null = null

  constructor(
    private sppgId: string,
    whatsappConfig?: WhatsAppConfig,
    emailConfig?: EmailConfig
  ) {
    if (whatsappConfig) {
      this.whatsappService = new WhatsAppService(whatsappConfig)
    }
    if (emailConfig) {
      this.emailService = new EmailService(emailConfig)
    }
  }

  /**
   * Send notification based on type
   */
  async send(data: NotificationData): Promise<{
    whatsapp: NotificationResult[]
    email: NotificationResult[]
  }> {
    const results = {
      whatsapp: [] as NotificationResult[],
      email: [] as NotificationResult[],
    }

    // Generate WhatsApp message
    const whatsappMessage = this.generateWhatsAppMessage(data)

    // Generate email content
    const emailContent = this.generateEmailContent(data)

    // Send WhatsApp notifications
    if (this.whatsappService) {
      for (const recipient of data.recipients) {
        if (recipient.phone) {
          const result = await this.whatsappService.sendMessage(
            recipient.phone,
            whatsappMessage
          )
          results.whatsapp.push(result)
        }
      }
    }

    // Send Email notifications
    if (this.emailService && emailContent) {
      for (const recipient of data.recipients) {
        if (recipient.email) {
          const result = await this.emailService.sendEmail(
            recipient.email,
            emailContent.subject,
            emailContent.html
          )
          results.email.push(result)
        }
      }
    }

    return results
  }

  /**
   * Generate WhatsApp message based on notification type
   */
  private generateWhatsAppMessage(data: NotificationData): string {
    switch (data.type) {
      case 'APPROVAL_REQUEST':
        return MessageTemplates.approvalRequest(data)
      case 'APPROVAL_GRANTED':
        return MessageTemplates.approvalGranted(data)
      case 'APPROVAL_REJECTED':
        return MessageTemplates.approvalRejected(data)
      case 'ESCALATION_NOTICE':
        return MessageTemplates.escalationNotice(data)
      case 'BUDGET_ALERT':
        return MessageTemplates.budgetAlert(data)
      case 'ORDER_CREATED':
        return MessageTemplates.orderCreated(data)
      default:
        return 'Notification from Bagizi-ID'
    }
  }

  /**
   * Generate email content based on notification type
   */
  private generateEmailContent(
    data: NotificationData
  ): { subject: string; html: string } | null {
    switch (data.type) {
      case 'APPROVAL_REQUEST':
        return EmailTemplates.approvalRequest(data)
      case 'APPROVAL_GRANTED':
        return EmailTemplates.approvalGranted(data)
      case 'APPROVAL_REJECTED':
        return EmailTemplates.approvalRejected(data)
      case 'ESCALATION_NOTICE':
        return EmailTemplates.escalationNotice(data)
      case 'BUDGET_ALERT':
        return EmailTemplates.budgetAlert(data)
      case 'ORDER_CREATED':
        return EmailTemplates.orderCreated(data)
      default:
        return null
    }
  }
}

// ================================ HELPER FUNCTIONS ================================

/**
 * Initialize notification service from settings
 */
export async function createNotificationService(
  sppgId: string
): Promise<NotificationService | null> {
  try {
    const settings = await db.procurementSettings.findUnique({
      where: { sppgId },
    })

    if (!settings) return null

    // Parse WhatsApp configuration
    let whatsappConfig: WhatsAppConfig | undefined
    let emailConfig: EmailConfig | undefined

    if (settings.approvalNotificationWhatsapp) {
      // Expected format: "provider:apiKey" or JSON string
      const whatsappSetting = settings.approvalNotificationWhatsapp
      
      if (whatsappSetting.startsWith('{')) {
        // JSON format
        whatsappConfig = JSON.parse(whatsappSetting) as WhatsAppConfig
      } else if (whatsappSetting.includes(':')) {
        // Simple format: "fonnte:API_TOKEN"
        const [provider, apiToken] = whatsappSetting.split(':')
        whatsappConfig = {
          provider: provider as WhatsAppConfig['provider'],
          apiToken,
        }
      }
    }

    // Parse Email configuration
    if (settings.approvalNotificationEmail) {
      const emailSetting = settings.approvalNotificationEmail
      
      if (emailSetting.startsWith('{')) {
        // JSON format: {"provider":"resend","apiKey":"re_xxx","fromEmail":"noreply@bagizi.id"}
        emailConfig = JSON.parse(emailSetting) as EmailConfig
      } else if (emailSetting.includes(':')) {
        // Simple format: "resend:API_KEY:noreply@bagizi.id"
        const parts = emailSetting.split(':')
        emailConfig = {
          provider: parts[0] as EmailConfig['provider'],
          apiKey: parts[1],
          fromEmail: parts[2] || 'noreply@bagizi.id',
          fromName: 'Bagizi-ID',
        }
      }
    }

    return new NotificationService(sppgId, whatsappConfig, emailConfig)
  } catch (error) {
    console.error('Failed to create notification service:', error)
    return null
  }
}

/**
 * Send approval request notification
 */
export async function sendApprovalRequestNotification(
  sppgId: string,
  orderId: string,
  recipients: Array<{ phone?: string; email?: string; name: string }>
) {
  const notificationService = await createNotificationService(sppgId)
  if (!notificationService) return

  // Fetch order details
  const order = await db.procurement.findUnique({
    where: { id: orderId },
    include: {
      supplier: true,
    },
  })

  if (!order) return

  await notificationService.send({
    type: 'APPROVAL_REQUEST',
    sppgId,
    recipients,
    metadata: {
      orderId: order.id,
      orderCode: order.procurementCode,
      totalAmount: order.totalAmount,
      supplierName: order.supplier.supplierName,
    },
  })
}

/**
 * Send escalation notification
 */
export async function sendEscalationNotification(
  sppgId: string,
  orderId: string,
  recipients: Array<{ phone?: string; email?: string; name: string }>,
  reason: string
) {
  const notificationService = await createNotificationService(sppgId)
  if (!notificationService) return

  const order = await db.procurement.findUnique({
    where: { id: orderId },
  })

  if (!order) return

  await notificationService.send({
    type: 'ESCALATION_NOTICE',
    sppgId,
    recipients,
    metadata: {
      orderId: order.id,
      orderCode: order.procurementCode,
      reason,
    },
  })
}

/**
 * Send budget alert notification
 */
export async function sendBudgetAlertNotification(
  sppgId: string,
  categoryName: string,
  budgetPercentage: number,
  recipients: Array<{ phone?: string; email?: string; name: string }>
) {
  const notificationService = await createNotificationService(sppgId)
  if (!notificationService) return

  await notificationService.send({
    type: 'BUDGET_ALERT',
    sppgId,
    recipients,
    metadata: {
      categoryName,
      budgetPercentage,
    },
  })
}
