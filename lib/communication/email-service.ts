import { createTransport, type Transporter } from 'nodemailer';
import { env } from '@/lib/env.mjs';
import { z } from 'zod';

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
  from: z.string().email().optional(),
  replyTo: z.string().email().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.union([z.string(), z.instanceof(Buffer)]),
    contentType: z.string().optional(),
  })).optional(),
});

const emailTemplateSchema = z.object({
  templateId: z.string(),
  data: z.record(z.string(), z.any()),
  locale: z.enum(['ar', 'en']).default('ar'),
});

export interface EmailTemplate {
  id: string;
  subject: { ar: string; en: string };
  html: { ar: string; en: string };
  text: { ar: string; en: string };
}

export class EmailService {
  private transporter: Transporter | null = null;
  private readonly defaultFrom: string;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.defaultFrom = env.SMTP_FROM || 'noreply@cargoparts.com';
    this.initializeTransporter();
    this.loadTemplates();
  }

  private initializeTransporter() {
    if (!env.SMTP_HOST) {
      console.warn('SMTP configuration missing - email service disabled');
      return;
    }

    try {
      this.transporter = createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER && env.SMTP_PASS ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        } : undefined,
        tls: {
          rejectUnauthorized: false, // For self-signed certificates on VPS
        },
      });

      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  private loadTemplates() {
    // Welcome email template
    this.templates.set('welcome', {
      id: 'welcome',
      subject: {
        ar: 'مرحباً بك في كارجو بارتس',
        en: 'Welcome to Cargo Parts'
      },
      html: {
        ar: `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb; text-align: center;">مرحباً {{name}}</h1>
            <p>شكراً لانضمامك إلى كارجو بارتس، سوق قطع غيار السيارات الأول في المملكة العربية السعودية.</p>
            <p>يمكنك الآن البحث عن قطع غيار سيارتك من أفضل ورش الخردة المعتمدة.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">ابدأ التسوق الآن</a>
            </div>
          </div>
        `,
        en: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb; text-align: center;">Welcome {{name}}</h1>
            <p>Thank you for joining Cargo Parts, Saudi Arabia's premier automotive parts marketplace.</p>
            <p>You can now search for parts from our network of certified scrapyards.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Shopping</a>
            </div>
          </div>
        `
      },
      text: {
        ar: 'مرحباً {{name}}، شكراً لانضمامك إلى كارجو بارتس. ابدأ التسوق الآن: {{appUrl}}',
        en: 'Welcome {{name}}, thank you for joining Cargo Parts. Start shopping: {{appUrl}}'
      }
    });

    // Order confirmation template
    this.templates.set('order-confirmation', {
      id: 'order-confirmation',
      subject: {
        ar: 'تأكيد الطلب #{{orderId}}',
        en: 'Order Confirmation #{{orderId}}'
      },
      html: {
        ar: `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #059669;">تم تأكيد طلبك</h1>
            <p>مرحباً {{customerName}}،</p>
            <p>تم استلام طلبك بنجاح ونعمل حالياً على تجهيزه.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>تفاصيل الطلب</h3>
              <p><strong>رقم الطلب:</strong> {{orderId}}</p>
              <p><strong>المبلغ الإجمالي:</strong> {{total}} ر.س</p>
              <p><strong>حالة الطلب:</strong> {{status}}</p>
            </div>

            <p>سنرسل لك إشعاراً عند تحديث حالة طلبك.</p>
            <p>شكراً لاختيارك كارجو بارتس.</p>
          </div>
        `,
        en: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #059669;">Order Confirmed</h1>
            <p>Hi {{customerName}},</p>
            <p>Your order has been received successfully and we're now processing it.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> {{orderId}}</p>
              <p><strong>Total Amount:</strong> SAR {{total}}</p>
              <p><strong>Status:</strong> {{status}}</p>
            </div>

            <p>We'll send you an update when your order status changes.</p>
            <p>Thank you for choosing Cargo Parts.</p>
          </div>
        `
      },
      text: {
        ar: 'تم تأكيد طلبك #{{orderId}} بمبلغ {{total}} ر.س. سنرسل لك تحديثات عن حالة الطلب.',
        en: 'Your order #{{orderId}} for SAR {{total}} has been confirmed. We\'ll send you updates on your order status.'
      }
    });

    // OTP verification template
    this.templates.set('otp-verification', {
      id: 'otp-verification',
      subject: {
        ar: 'رمز التحقق - كارجو بارتس',
        en: 'Verification Code - Cargo Parts'
      },
      html: {
        ar: `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">رمز التحقق</h1>
            <p>مرحباً،</p>
            <p>استخدم الرمز التالي للتحقق من حسابك:</p>
            
            <div style="background-color: #f3f4f6; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <h2 style="font-size: 36px; color: #2563eb; margin: 0; letter-spacing: 8px;">{{otpCode}}</h2>
            </div>

            <p style="color: #ef4444;"><strong>مهم:</strong> هذا الرمز صالح لمدة {{expiryMinutes}} دقائق فقط.</p>
            <p>إذا لم تطلب هذا الرمز، يرجى تجاهل هذا الإيميل.</p>
          </div>
        `,
        en: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Verification Code</h1>
            <p>Hello,</p>
            <p>Use the following code to verify your account:</p>
            
            <div style="background-color: #f3f4f6; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <h2 style="font-size: 36px; color: #2563eb; margin: 0; letter-spacing: 8px;">{{otpCode}}</h2>
            </div>

            <p style="color: #ef4444;"><strong>Important:</strong> This code expires in {{expiryMinutes}} minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      },
      text: {
        ar: 'رمز التحقق الخاص بك: {{otpCode}} (صالح لمدة {{expiryMinutes}} دقائق)',
        en: 'Your verification code: {{otpCode}} (valid for {{expiryMinutes}} minutes)'
      }
    });
  }

  async sendEmail(data: z.infer<typeof sendEmailSchema>): Promise<boolean> {
    const validatedData = sendEmailSchema.parse(data);
    
    // In development mode without SMTP configured, log the email details
    if (!this.transporter) {
      console.warn('⚠️  SMTP not configured - Email would have been sent:');
      console.log('📧 Email Details:');
      console.log('  To:', Array.isArray(validatedData.to) ? validatedData.to.join(', ') : validatedData.to);
      console.log('  Subject:', validatedData.subject);
      console.log('  Text:', validatedData.text);
      console.log('  HTML:', validatedData.html ? 'HTML content included' : 'No HTML');
      console.log('─'.repeat(50));
      
      // Return true for development to allow the auth flow to continue
      return true;
    }

    try {
      const mailOptions = {
        from: validatedData.from || this.defaultFrom,
        to: Array.isArray(validatedData.to) ? validatedData.to.join(', ') : validatedData.to,
        subject: validatedData.subject,
        text: validatedData.text,
        html: validatedData.html,
        replyTo: validatedData.replyTo,
        attachments: validatedData.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', {
        messageId: result.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject,
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendTemplate(
    to: string | string[],
    templateData: z.infer<typeof emailTemplateSchema>
  ): Promise<boolean> {
    const validatedData = emailTemplateSchema.parse(templateData);
    const template = this.templates.get(validatedData.templateId);
    
    if (!template) {
      console.error('Email template not found:', validatedData.templateId);
      return false;
    }

    const locale = validatedData.locale;
    let subject = template.subject[locale];
    let html = template.html[locale];
    let text = template.text[locale];

    // Replace template variables
    Object.entries(validatedData.data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
      text = text.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return await this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  async sendWelcomeEmail(
    to: string,
    customerName: string,
    locale: 'ar' | 'en' = 'ar'
  ): Promise<boolean> {
    const template = this.templates.get('welcome');
    
    if (!template) {
      console.error('Welcome email template not found');
      return false;
    }

    let subject = template.subject[locale];
    let html = template.html[locale];
    let text = template.text[locale];

    // Replace template variables
    const replacements = {
      name: customerName,
      appUrl: env.NEXT_PUBLIC_APP_URL,
    };

    Object.entries(replacements).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
      text = text.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return await this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  async sendOrderConfirmation(
    to: string,
    orderData: {
      orderId: string;
      customerName: string;
      total: number;
      status: string;
    },
    locale: 'ar' | 'en' = 'ar'
  ): Promise<boolean> {
    const template = this.templates.get('order-confirmation');
    
    if (!template) {
      console.error('Order confirmation email template not found');
      return false;
    }

    let subject = template.subject[locale];
    let html = template.html[locale];
    let text = template.text[locale];

    // Replace template variables
    const replacements = {
      customerName: orderData.customerName,
      orderId: orderData.orderId,
      total: orderData.total.toFixed(2),
      status: orderData.status,
    };

    Object.entries(replacements).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
      text = text.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return await this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  async sendOTPVerification(
    to: string,
    otpCode: string,
    expiryMinutes: number = 10,
    locale: 'ar' | 'en' = 'ar'
  ): Promise<boolean> {
    const template = this.templates.get('otp-verification');
    
    if (!template) {
      console.error('OTP verification email template not found');
      return false;
    }

    let subject = template.subject[locale];
    let html = template.html[locale];
    let text = template.text[locale];

    // Replace template variables
    const replacements = {
      otpCode,
      expiryMinutes: expiryMinutes.toString(),
    };

    Object.entries(replacements).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
      text = text.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Log OTP for development
    console.log(`🔐 OTP Code for ${to}: ${otpCode} (expires in ${expiryMinutes} minutes)`);

    return await this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection verification failed:', error);
      return false;
    }
  }

  // Admin-specific email methods
  async sendAdminWelcomeEmail(
    to: string,
    adminName: string,
    locale: 'ar' | 'en' = 'ar'
  ): Promise<boolean> {
    const subject = locale === 'ar' ? 
      'مرحباً بك كمدير في كارجو بارتس' : 
      'Welcome as Admin - Cargo Parts';

    const html = locale === 'ar' ? `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">مرحباً ${adminName}</h1>
        <p>تم منحك صلاحيات إدارية في منصة كارجو بارتس.</p>
        <p>يمكنك الآن الوصول إلى لوحة التحكم لإدارة المستخدمين والطلبات.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${env.NEXT_PUBLIC_APP_URL}/admin" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">دخول لوحة التحكم</a>
        </div>
        <p><strong>تذكير مهم:</strong> يرجى الحفاظ على سرية بيانات الدخول وعدم مشاركتها مع أحد.</p>
      </div>
    ` : `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Welcome ${adminName}</h1>
        <p>You have been granted admin privileges on Cargo Parts platform.</p>
        <p>You can now access the admin dashboard to manage users and orders.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${env.NEXT_PUBLIC_APP_URL}/admin" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Admin Dashboard</a>
        </div>
        <p><strong>Important:</strong> Please keep your login credentials secure and do not share them with anyone.</p>
      </div>
    `;

    return await this.sendEmail({ to, subject, html });
  }

  async sendAdminPromotionEmail(
    to: string,
    adminName: string,
    role: 'ADMIN' | 'SUPER_ADMIN',
    locale: 'ar' | 'en' = 'ar'
  ): Promise<boolean> {
    const roleText = role === 'SUPER_ADMIN' ? 
      (locale === 'ar' ? 'مدير عام' : 'Super Admin') :
      (locale === 'ar' ? 'مدير' : 'Admin');

    const subject = locale === 'ar' ? 
      `ترقية لصلاحيات ${roleText}` : 
      `Promoted to ${roleText}`;

    const html = locale === 'ar' ? `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">مبروك الترقية!</h1>
        <p>عزيزي ${adminName}،</p>
        <p>تم ترقيتك إلى منصب ${roleText} في منصة كارجو بارتس.</p>
        <p>يمكنك الآن الوصول إلى المميزات الإدارية الجديدة من خلال لوحة التحكم.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${env.NEXT_PUBLIC_APP_URL}/admin" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">دخول لوحة التحكم</a>
        </div>
      </div>
    ` : `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Congratulations on Your Promotion!</h1>
        <p>Dear ${adminName},</p>
        <p>You have been promoted to ${roleText} on Cargo Parts platform.</p>
        <p>You can now access new administrative features through the admin dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${env.NEXT_PUBLIC_APP_URL}/admin" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Admin Dashboard</a>
        </div>
      </div>
    `;

    return await this.sendEmail({ to, subject, html });
  }

  async sendAdminDemotionEmail(
    to: string,
    userName: string,
    locale: 'ar' | 'en' = 'ar'
  ): Promise<boolean> {
    const subject = locale === 'ar' ? 
      'تغيير في صلاحيات الحساب' : 
      'Account Privileges Update';

    const html = locale === 'ar' ? `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">تحديث صلاحيات الحساب</h1>
        <p>عزيزي ${userName}،</p>
        <p>نود إعلامك بأن صلاحياتك الإدارية في منصة كارجو بارتس قد تم تعديلها.</p>
        <p>يمكنك الاستمرار في استخدام المنصة كمستخدم عادي.</p>
        <p>إذا كان لديك أي استفسار، يرجى التواصل مع الإدارة.</p>
      </div>
    ` : `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">Account Privileges Update</h1>
        <p>Dear ${userName},</p>
        <p>We want to inform you that your administrative privileges on Cargo Parts platform have been updated.</p>
        <p>You can continue using the platform as a regular user.</p>
        <p>If you have any questions, please contact the administration.</p>
      </div>
    `;

    return await this.sendEmail({ to, subject, html });
  }

  async sendVerificationEmail(
    to: string,
    otpCode: string,
    locale: 'ar' | 'en' = 'ar'
  ): Promise<boolean> {
    // Send OTP email for email verification
    return await this.sendOTPVerification(to, otpCode, 10, locale);
  }

  async sendLoginOtp(
    to: string,
    otpCode: string,
    locale: 'ar' | 'en' = 'ar'
  ): Promise<boolean> {
    // Send OTP email for login
    return await this.sendOTPVerification(to, otpCode, 10, locale);
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; details?: any }> {
    const timestamp = new Date().toISOString();
    
    if (!this.transporter) {
      return {
        status: 'unhealthy',
        timestamp,
        details: 'SMTP not configured'
      };
    }

    try {
      const isConnected = await this.verifyConnection();
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        timestamp,
        details: {
          smtpHost: env.SMTP_HOST,
          smtpPort: env.SMTP_PORT,
          templatesLoaded: this.templates.size,
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp,
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const emailService = new EmailService();