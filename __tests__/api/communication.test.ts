import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as EmailPOST, GET as EmailGET } from '@/app/api/communication/email/route';
import { POST as SMSPOST, GET as SMSGET } from '@/app/api/communication/sms/route';

// Mock environment for email
vi.mock('@/lib/env.mjs', () => ({
  env: {
    SMTP_HOST: 'smtp.test.com',
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

// Mock fetch for SMS providers
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('/api/communication', () => {
  beforeEach(() => {
    mockSendMail.mockClear();
    mockVerify.mockClear();
    mockFetch.mockClear();
    
    // Default successful responses
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });
    mockVerify.mockResolvedValue(true);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      text: async () => 'OK: message sent',
    });
  });

  describe('/api/communication/email', () => {
    describe('POST - Send Email', () => {
      it('should send basic email successfully', async () => {
        const emailData = {
          to: 'user@example.com',
          subject: 'Test Subject',
          text: 'Test message content',
          html: '<p>Test message content</p>',
        };

        const request = new NextRequest('http://localhost:3000/api/communication/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData),
        });

        const response = await EmailPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Email sent successfully');
        
        expect(mockSendMail).toHaveBeenCalledWith({
          from: 'noreply@cargoparts.com',
          to: 'user@example.com',
          subject: 'Test Subject',
          text: 'Test message content',
          html: '<p>Test message content</p>',
          replyTo: undefined,
          attachments: undefined,
        });
      });

      it('should send email to multiple recipients', async () => {
        const emailData = {
          to: ['user1@example.com', 'user2@example.com'],
          subject: 'Bulk Email',
          text: 'Bulk message',
        };

        const request = new NextRequest('http://localhost:3000/api/communication/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData),
        });

        const response = await EmailPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'user1@example.com, user2@example.com',
          })
        );
      });

      it('should send template email successfully', async () => {
        const templateData = {
          to: 'customer@example.com',
          templateId: 'welcome',
          data: {
            name: 'أحمد علي',
            appUrl: 'https://cargoparts.com'
          },
          locale: 'ar',
        };

        const request = new NextRequest('http://localhost:3000/api/communication/email?action=template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData),
        });

        const response = await EmailPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Template email sent successfully');
        
        expect(mockSendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'customer@example.com',
            subject: expect.stringContaining('مرحباً بك'),
            html: expect.stringContaining('أحمد علي'),
          })
        );
      });

      it('should validate email addresses', async () => {
        const invalidEmailData = {
          to: 'invalid-email',
          subject: 'Test',
          text: 'Test',
        };

        const request = new NextRequest('http://localhost:3000/api/communication/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidEmailData),
        });

        const response = await EmailPOST(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.error).toBe('Invalid request data');
        expect(result.details).toBeDefined();
      });

      it('should handle email sending failures', async () => {
        mockSendMail.mockRejectedValueOnce(new Error('SMTP connection failed'));

        const emailData = {
          to: 'user@example.com',
          subject: 'Test',
          text: 'Test',
        };

        const request = new NextRequest('http://localhost:3000/api/communication/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData),
        });

        const response = await EmailPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to send email');
      });
    });

    describe('GET - Email Operations', () => {
      it('should return health check status', async () => {
        mockVerify.mockResolvedValueOnce(true);

        const request = new NextRequest('http://localhost:3000/api/communication/email?action=health');

        const response = await EmailGET(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.status).toBe('healthy');
        expect(result.details).toEqual({
          smtpHost: 'smtp.test.com',
          smtpPort: 587,
          templatesLoaded: 3,
        });
      });

      it('should verify SMTP connection', async () => {
        mockVerify.mockResolvedValueOnce(true);

        const request = new NextRequest('http://localhost:3000/api/communication/email?action=verify');

        const response = await EmailGET(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.connected).toBe(true);
        expect(result.timestamp).toBeDefined();
      });

      it('should handle invalid action', async () => {
        const request = new NextRequest('http://localhost:3000/api/communication/email?action=invalid');

        const response = await EmailGET(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.error).toBe('Invalid action');
      });
    });
  });

  describe('/api/communication/sms', () => {
    // Mock environment variables for SMS
    beforeEach(() => {
      process.env.SMS_GATEWAY_URL = 'http://localhost:3001/sms';
      process.env.SMS_GATEWAY_USERNAME = 'testuser';
      process.env.SMS_GATEWAY_PASSWORD = 'testpass';
      process.env.SMS_GATEWAY_SENDER = 'CargoParts';
    });

    describe('POST - Send SMS', () => {
      it('should send basic SMS successfully', async () => {
        const smsData = {
          to: '+966501234567',
          message: 'Test SMS message',
        };

        const request = new NextRequest('http://localhost:3000/api/communication/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(smsData),
        });

        const response = await SMSPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
      });

      it('should send OTP SMS successfully', async () => {
        const otpData = {
          phoneNumber: '0501234567', // Saudi format without +966
          otpCode: '123456',
          locale: 'ar',
        };

        const request = new NextRequest('http://localhost:3000/api/communication/sms?action=otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(otpData),
        });

        const response = await SMSPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
      });

      it('should send order update SMS successfully', async () => {
        const orderUpdateData = {
          phoneNumber: '+966501234567',
          orderId: 'ORD-123',
          status: 'تم الشحن',
          locale: 'ar',
        };

        const request = new NextRequest('http://localhost:3000/api/communication/sms?action=order-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderUpdateData),
        });

        const response = await SMSPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
      });

      it('should validate Saudi phone numbers', async () => {
        const invalidPhoneData = {
          phoneNumber: '+1234567890', // Non-Saudi number
          otpCode: '123456',
        };

        const request = new NextRequest('http://localhost:3000/api/communication/sms?action=otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidPhoneData),
        });

        const response = await SMSPOST(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.error).toBe('Invalid Saudi phone number format');
      });

      it('should handle SMS sending failures', async () => {
        mockFetch.mockRejectedValueOnce(new Error('SMS gateway timeout'));

        const smsData = {
          to: '+966501234567',
          message: 'Test message',
        };

        const request = new NextRequest('http://localhost:3000/api/communication/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(smsData),
        });

        const response = await SMSPOST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should validate message length', async () => {
        const longMessageData = {
          to: '+966501234567',
          message: 'x'.repeat(161), // Exceeds 160 character limit
        };

        const request = new NextRequest('http://localhost:3000/api/communication/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(longMessageData),
        });

        const response = await SMSPOST(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.error).toBe('Invalid request data');
      });
    });

    describe('GET - SMS Operations', () => {
      it('should return health check status', async () => {
        const request = new NextRequest('http://localhost:3000/api/communication/sms?action=health');

        const response = await SMSGET(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.status).toBe('healthy');
        expect(result.provider).toBe('local');
      });

      it('should return SMS provider info', async () => {
        const request = new NextRequest('http://localhost:3000/api/communication/sms?action=provider');

        const response = await SMSGET(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.provider).toBe('local');
        expect(result.timestamp).toBeDefined();
      });

      it('should validate phone numbers', async () => {
        const request = new NextRequest('http://localhost:3000/api/communication/sms?action=validate&phoneNumber=0501234567');

        const response = await SMSGET(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.original).toBe('0501234567');
        expect(result.formatted).toBe('+966501234567');
        expect(result.isValid).toBe(true);
      });

      it('should handle invalid phone number validation', async () => {
        const request = new NextRequest('http://localhost:3000/api/communication/sms?action=validate&phoneNumber=123');

        const response = await SMSGET(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.isValid).toBe(false);
      });

      it('should require phone number for validation', async () => {
        const request = new NextRequest('http://localhost:3000/api/communication/sms?action=validate');

        const response = await SMSGET(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.error).toBe('Phone number required');
      });
    });
  });
});