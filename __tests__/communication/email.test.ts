import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailService } from '@/lib/communication/email-service';

// Mock environment
vi.mock('@/lib/env.mjs', () => ({
  env: {
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 587,
    SMTP_USER: 'test@example.com',
    SMTP_PASS: 'password',
    SMTP_FROM: 'noreply@cargoparts.com',
    NEXT_PUBLIC_APP_URL: 'https://cargoparts.com'
  }
}));

// Mock nodemailer
const mockSendMail = vi.fn();
const mockVerify = vi.fn();

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({
    sendMail: mockSendMail,
    verify: mockVerify,
  })),
}));

describe('EmailService', () => {
  let emailService: EmailService;
  
  beforeEach(() => {
    emailService = new EmailService();
    mockSendMail.mockClear();
    mockVerify.mockClear();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockSendMail.mockResolvedValueOnce({
        messageId: 'test-message-id',
      });

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Email',
        text: 'Test message',
        html: '<p>Test message</p>',
      });

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@cargoparts.com',
        to: 'user@example.com',
        subject: 'Test Email',
        text: 'Test message',
        html: '<p>Test message</p>',
        replyTo: undefined,
        attachments: undefined,
      });
    });

    it('should handle email sending errors', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Email',
        text: 'Test message',
      });

      expect(result).toBe(false);
    });

    it('should validate email addresses', async () => {
      const result = await emailService.sendEmail({
        to: 'invalid-email',
        subject: 'Test Email',
        text: 'Test message',
      } as any);

      expect(result).toBe(false);
    });
  });

  describe('sendTemplate', () => {
    it('should send welcome email template', async () => {
      mockSendMail.mockResolvedValueOnce({
        messageId: 'test-message-id',
      });

      const result = await emailService.sendWelcomeEmail(
        'ahmed@example.com',
        'أحمد علي',
        'ar'
      );

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@cargoparts.com',
        to: 'ahmed@example.com',
        subject: 'مرحباً بك في كارجو بارتس',
        text: expect.stringContaining('مرحباً أحمد علي'),
        html: expect.stringContaining('مرحباً أحمد علي'),
        replyTo: undefined,
        attachments: undefined,
      });
    });

    it('should send order confirmation template', async () => {
      mockSendMail.mockResolvedValueOnce({
        messageId: 'test-message-id',
      });

      const result = await emailService.sendOrderConfirmation(
        'customer@example.com',
        {
          orderId: 'ORD-123',
          customerName: 'John Doe',
          total: 150.50,
          status: 'confirmed',
        },
        'en'
      );

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@cargoparts.com',
        to: 'customer@example.com',
        subject: 'Order Confirmation #ORD-123',
        text: expect.stringContaining('ORD-123'),
        html: expect.stringContaining('ORD-123'),
        replyTo: undefined,
        attachments: undefined,
      });
    });

    it('should send OTP verification template', async () => {
      mockSendMail.mockResolvedValueOnce({
        messageId: 'test-message-id',
      });

      const result = await emailService.sendOTPVerification(
        'user@example.com',
        '123456',
        10,
        'ar'
      );

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@cargoparts.com',
        to: 'user@example.com',
        subject: 'رمز التحقق - كارجو بارتس',
        text: expect.stringContaining('123456'),
        html: expect.stringContaining('123456'),
        replyTo: undefined,
        attachments: undefined,
      });
    });

    it('should handle template not found', async () => {
      const result = await emailService.sendTemplate(
        'user@example.com',
        {
          templateId: 'non-existent-template',
          data: {},
          locale: 'ar',
        }
      );

      expect(result).toBe(false);
    });
  });

  describe('verifyConnection', () => {
    it('should verify SMTP connection successfully', async () => {
      mockVerify.mockResolvedValueOnce(true);

      const result = await emailService.verifyConnection();

      expect(result).toBe(true);
      expect(mockVerify).toHaveBeenCalled();
    });

    it('should handle connection verification failure', async () => {
      mockVerify.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await emailService.verifyConnection();

      expect(result).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when connection is good', async () => {
      mockVerify.mockResolvedValueOnce(true);

      const health = await emailService.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
      expect(health.details).toEqual({
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        templatesLoaded: 3,
      });
    });

    it('should return unhealthy status when connection fails', async () => {
      mockVerify.mockRejectedValueOnce(new Error('Connection failed'));

      const health = await emailService.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.timestamp).toBeDefined();
    });
  });
});