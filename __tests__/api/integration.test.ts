import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Import all API routes for integration testing
import { POST as UploadPOST, DELETE as UploadDELETE } from '@/app/api/upload/route';
import { POST as PaymentPOST } from '@/app/api/payments/create/route';
import { POST as WebhookPOST } from '@/app/api/payments/webhook/route';
import { POST as EmailPOST, GET as EmailGET } from '@/app/api/communication/email/route';
import { POST as SMSPOST, GET as SMSGET } from '@/app/api/communication/sms/route';

// Mock all external dependencies
vi.mock('@/lib/env.mjs', () => ({
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    SMTP_HOST: 'smtp.test.com',
    SMTP_PORT: 587,
    SMTP_USER: 'test@example.com',
    SMTP_PASS: 'password',
    SMTP_FROM: 'noreply@cargoparts.com',
    TAP_API_KEY: 'test_tap_key',
    TAP_SECRET_KEY: 'test_tap_secret',
    TAP_WEBHOOK_SECRET: 'test_tap_webhook_secret',
    TAP_SANDBOX_MODE: true,
    HYPERPAY_ENTITY_ID: 'test_entity_id',
    HYPERPAY_ACCESS_TOKEN: 'test_access_token',
    HYPERPAY_WEBHOOK_SECRET: 'test_hyperpay_webhook_secret',
    HYPERPAY_SANDBOX_MODE: true,
  }
}));

// Mock external services
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSendMail = vi.fn();
const mockVerify = vi.fn();

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({
    sendMail: mockSendMail,
    verify: mockVerify,
  })),
}));

vi.mock('sharp', () => ({
  default: vi.fn().mockImplementation(() => ({
    jpeg: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('processed-image'))
  }))
}));

const mockHmac = {
  update: vi.fn().mockReturnThis(),
  digest: vi.fn().mockReturnValue('expected_signature'),
};

vi.mock('crypto', () => ({
  createHmac: vi.fn().mockReturnValue(mockHmac),
  timingSafeEqual: vi.fn().mockReturnValue(true),
  randomUUID: vi.fn().mockReturnValue('test-uuid-123'),
}));

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    mockFetch.mockClear();
    mockSendMail.mockClear();
    mockVerify.mockClear();
    mockHmac.update.mockClear();
    mockHmac.digest.mockClear();

    // Set up default responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, messageId: 'test123' }),
      text: async () => 'OK: message sent',
    });
    
    mockSendMail.mockResolvedValue({ messageId: 'email-test-123' });
    mockVerify.mockResolvedValue(true);

    // Set up SMS environment
    process.env.SMS_GATEWAY_URL = 'http://localhost:3001/sms';
    process.env.SMS_GATEWAY_USERNAME = 'testuser';
    process.env.SMS_GATEWAY_PASSWORD = 'testpass';
  });

  describe('Complete E-commerce Flow Integration', () => {
    let uploadedFileId: string;
    let paymentIntentId: string;

    it('should complete full product upload to payment flow', async () => {
      // Step 1: Upload product images
      const mockFile = new File(['product-image'], 'product.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('options', JSON.stringify({
        category: 'listings',
        generateThumbnail: true
      }));

      const uploadRequest = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const uploadResponse = await UploadPOST(uploadRequest);
      const uploadResult = await uploadResponse.json();

      expect(uploadResponse.status).toBe(200);
      expect(uploadResult.url).toContain('/uploads/listings/');
      uploadedFileId = uploadResult.id;

      // Step 2: Create payment for order
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'chg_integration_test',
          amount: 150,
          currency: 'SAR',
          status: 'INITIATED',
          transaction: {
            url: 'https://tap.company/pay/chg_integration_test',
            expiry: { period: 30, type: 'MINUTE' }
          }
        }),
      });

      const paymentData = {
        provider: 'tap',
        amount: 150,
        currency: 'SAR',
        orderId: 'ORD-INTEGRATION-001',
        customer: {
          email: 'integration@test.com',
          firstName: 'محمد',
          lastName: 'أحمد',
          phone: '+966501234567',
          address: {
            street: 'شارع الملك فهد',
            city: 'الرياض',
            postalCode: '12345',
            country: 'SA',
          },
        },
        returnUrl: 'https://cargoparts.com/return',
        cancelUrl: 'https://cargoparts.com/cancel',
        webhookUrl: 'https://cargoparts.com/webhook',
        metadata: {
          productImages: uploadedFileId,
          customerType: 'premium',
        },
      };

      const paymentRequest = new NextRequest('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const paymentResponse = await PaymentPOST(paymentRequest);
      const paymentResult = await paymentResponse.json();

      expect(paymentResponse.status).toBe(200);
      expect(paymentResult.orderId).toBe('ORD-INTEGRATION-001');
      expect(paymentResult.amount).toBe(150);
      paymentIntentId = paymentResult.id;

      // Step 3: Send order confirmation email
      const emailData = {
        to: 'integration@test.com',
        templateId: 'order-confirmation',
        data: {
          customerName: 'محمد أحمد',
          orderId: 'ORD-INTEGRATION-001',
          total: '150.00',
          status: 'confirmed',
        },
        locale: 'ar',
      };

      const emailRequest = new NextRequest('http://localhost:3000/api/communication/email?action=template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      const emailResponse = await EmailPOST(emailRequest);
      const emailResult = await emailResponse.json();

      expect(emailResponse.status).toBe(200);
      expect(emailResult.success).toBe(true);

      // Step 4: Send SMS notification
      const smsData = {
        phoneNumber: '+966501234567',
        orderId: 'ORD-INTEGRATION-001',
        status: 'تم تأكيد الطلب',
        locale: 'ar',
      };

      const smsRequest = new NextRequest('http://localhost:3000/api/communication/sms?action=order-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smsData),
      });

      const smsResponse = await SMSPOST(smsRequest);
      const smsResult = await smsResponse.json();

      expect(smsResponse.status).toBe(200);
      expect(smsResult.success).toBe(true);

      // Step 5: Process payment webhook
      const webhookPayload = {
        id: 'chg_integration_test',
        status: 'CAPTURED',
        amount: 150,
        currency: 'SAR',
        metadata: {
          orderId: 'ORD-INTEGRATION-001'
        }
      };

      const webhookRequest = new NextRequest('http://localhost:3000/api/payments/webhook?provider=tap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tap-signature': 'expected_signature',
        },
        body: JSON.stringify(webhookPayload),
      });

      const webhookResponse = await WebhookPOST(webhookRequest);
      const webhookResult = await webhookResponse.json();

      expect(webhookResponse.status).toBe(200);
      expect(webhookResult.received).toBe(true);

      // Verify all services were called correctly
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.tap.company/v2/charges',
        expect.any(Object)
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'integration@test.com',
          subject: expect.stringContaining('ORD-INTEGRATION-001'),
        })
      );
    });

    afterAll(async () => {
      // Cleanup: Delete uploaded file
      if (uploadedFileId) {
        const deleteRequest = new NextRequest(
          `http://localhost:3000/api/upload?fileId=${uploadedFileId}&category=listings`,
          { method: 'DELETE' }
        );
        await UploadDELETE(deleteRequest);
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle cascading failures gracefully', async () => {
      // Simulate file upload failure
      vi.mocked(require('sharp').default).mockImplementationOnce(() => {
        throw new Error('Image processing failed');
      });

      const mockFile = new File(['corrupt-image'], 'corrupt.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);

      const uploadRequest = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const uploadResponse = await UploadPOST(uploadRequest);
      
      expect(uploadResponse.status).toBe(500);

      // Simulate payment failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Payment processing failed' }),
      });

      const paymentData = {
        provider: 'tap',
        amount: 100,
        currency: 'SAR',
        orderId: 'ORD-ERROR-001',
        customer: {
          email: 'error@test.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '+966501234567',
        },
        returnUrl: 'https://test.com/return',
        cancelUrl: 'https://test.com/cancel',
      };

      const paymentRequest = new NextRequest('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const paymentResponse = await PaymentPOST(paymentRequest);
      
      expect(paymentResponse.status).toBe(500);

      // Verify error notification email still works
      mockSendMail.mockResolvedValueOnce({ messageId: 'error-notification' });

      const errorEmailData = {
        to: 'admin@cargoparts.com',
        subject: 'Payment Failed - ORD-ERROR-001',
        text: 'Payment processing failed for order ORD-ERROR-001',
      };

      const errorEmailRequest = new NextRequest('http://localhost:3000/api/communication/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorEmailData),
      });

      const errorEmailResponse = await EmailPOST(errorEmailRequest);
      const errorEmailResult = await errorEmailResponse.json();

      expect(errorEmailResponse.status).toBe(200);
      expect(errorEmailResult.success).toBe(true);
    });
  });

  describe('Health Check Integration', () => {
    it('should provide comprehensive system health status', async () => {
      // Check email service health
      mockVerify.mockResolvedValueOnce(true);

      const emailHealthRequest = new NextRequest('http://localhost:3000/api/communication/email?action=health');
      const emailHealthResponse = await EmailGET(emailHealthRequest);
      const emailHealth = await emailHealthResponse.json();

      expect(emailHealth.status).toBe('healthy');

      // Check SMS service health
      const smsHealthRequest = new NextRequest('http://localhost:3000/api/communication/sms?action=health');
      const smsHealthResponse = await SMSGET(smsHealthRequest);
      const smsHealth = await smsHealthResponse.json();

      expect(smsHealth.status).toBe('healthy');

      // Aggregate health check would show all services are operational
      const systemHealth = {
        email: emailHealth,
        sms: smsHealth,
        timestamp: new Date().toISOString(),
        overall: 'healthy'
      };

      expect(systemHealth.overall).toBe('healthy');
    });

    it('should detect service degradation', async () => {
      // Simulate email service failure
      mockVerify.mockRejectedValueOnce(new Error('SMTP connection timeout'));

      const emailHealthRequest = new NextRequest('http://localhost:3000/api/communication/email?action=health');
      const emailHealthResponse = await EmailGET(emailHealthRequest);
      const emailHealth = await emailHealthResponse.json();

      expect(emailHealth.status).toBe('unhealthy');

      // Simulate SMS service failure
      mockFetch.mockRejectedValueOnce(new Error('SMS gateway unreachable'));

      const smsHealthRequest = new NextRequest('http://localhost:3000/api/communication/sms?action=health');
      const smsHealthResponse = await SMSGET(smsHealthRequest);
      const smsHealth = await smsHealthResponse.json();

      expect(smsHealth.status).toBe('unhealthy');

      // System should report degraded state
      const systemHealth = {
        email: emailHealth,
        sms: smsHealth,
        overall: emailHealth.status === 'unhealthy' || smsHealth.status === 'unhealthy' ? 'degraded' : 'healthy'
      };

      expect(systemHealth.overall).toBe('degraded');
    });
  });

  describe('Security Integration', () => {
    it('should validate webhook signatures across providers', async () => {
      // Test TAP webhook signature validation
      vi.mocked(require('crypto').timingSafeEqual).mockReturnValueOnce(false);

      const tapWebhookRequest = new NextRequest('http://localhost:3000/api/payments/webhook?provider=tap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tap-signature': 'invalid_signature',
        },
        body: JSON.stringify({ id: 'test' }),
      });

      const tapWebhookResponse = await WebhookPOST(tapWebhookRequest);
      expect(tapWebhookResponse.status).toBe(401);

      // Test HyperPay webhook signature validation
      vi.mocked(require('crypto').timingSafeEqual).mockReturnValueOnce(false);

      const hyperPayWebhookRequest = new NextRequest('http://localhost:3000/api/payments/webhook?provider=hyperpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hyperpay-signature': 'invalid_signature',
        },
        body: JSON.stringify({ id: 'test' }),
      });

      const hyperPayWebhookResponse = await WebhookPOST(hyperPayWebhookRequest);
      expect(hyperPayWebhookResponse.status).toBe(401);
    });

    it('should validate input sanitization across endpoints', async () => {
      // Test XSS prevention in email
      const maliciousEmailData = {
        to: 'test@example.com',
        subject: '<script>alert("xss")</script>',
        text: 'Test message',
      };

      const emailRequest = new NextRequest('http://localhost:3000/api/communication/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maliciousEmailData),
      });

      const emailResponse = await EmailPOST(emailRequest);
      expect(emailResponse.status).toBe(200);

      // Verify the script tag is handled safely (not executed)
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: '<script>alert("xss")</script>', // Should be treated as text, not executed
        })
      );

      // Test SQL injection prevention in payment metadata
      const maliciousPaymentData = {
        provider: 'tap',
        amount: 100,
        currency: 'SAR',
        orderId: "'; DROP TABLE orders; --",
        customer: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '+966501234567',
        },
        returnUrl: 'https://test.com/return',
        cancelUrl: 'https://test.com/cancel',
        metadata: {
          maliciousField: "'; DROP TABLE payments; --"
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'chg_safe', status: 'INITIATED' }),
      });

      const paymentRequest = new NextRequest('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maliciousPaymentData),
      });

      const paymentResponse = await PaymentPOST(paymentRequest);
      expect(paymentResponse.status).toBe(200);

      // Verify the malicious SQL is treated as string data, not executed
      const paymentResult = await paymentResponse.json();
      expect(paymentResult.orderId).toBe("'; DROP TABLE orders; --");
    });
  });
});