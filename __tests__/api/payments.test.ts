import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/payments/create/route';
import { POST as WebhookPOST } from '@/app/api/payments/webhook/route';

// Mock environment
vi.mock('@/lib/env.mjs', () => ({
  env: {
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

// Mock fetch for payment providers
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock crypto for webhook verification
const mockHmac = {
  update: vi.fn().mockReturnThis(),
  digest: vi.fn().mockReturnValue('expected_signature'),
};

const mockTimingSafeEqual = vi.fn().mockReturnValue(true);

vi.mock('crypto', () => ({
  createHmac: vi.fn().mockReturnValue(mockHmac),
  timingSafeEqual: mockTimingSafeEqual,
  randomUUID: vi.fn().mockReturnValue('test-uuid-123'),
}));

describe('/api/payments', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockHmac.update.mockClear();
    mockHmac.digest.mockClear();
    mockTimingSafeEqual.mockClear();
  });

  describe('POST /api/payments/create', () => {
    const validPaymentData = {
      provider: 'tap',
      amount: 100,
      currency: 'SAR',
      orderId: 'ORD-123',
      customer: {
        email: 'customer@example.com',
        firstName: 'أحمد',
        lastName: 'علي',
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
        orderId: 'ORD-123',
        customerId: 'CUST-456',
      },
    };

    it('should create TAP payment intent successfully', async () => {
      const mockTapResponse = {
        id: 'chg_test123',
        amount: 100,
        currency: 'SAR',
        status: 'INITIATED',
        transaction: {
          url: 'https://tap.company/pay/chg_test123',
          expiry: { period: 30, type: 'MINUTE' }
        },
        customer: {
          first_name: 'أحمد',
          last_name: 'علي',
          email: 'customer@example.com'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTapResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPaymentData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toMatchObject({
        id: expect.stringContaining('pi_'),
        provider: 'tap',
        orderId: 'ORD-123',
        amount: 100,
        currency: 'SAR',
        status: 'pending',
        clientSecret: 'chg_test123',
        paymentUrl: 'https://tap.company/pay/chg_test123',
      });

      // Verify TAP API was called correctly
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.tap.company/v2/charges',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_tap_key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should create HyperPay payment intent successfully', async () => {
      const hyperPayData = { ...validPaymentData, provider: 'hyperpay' };
      
      const mockHyperPayResponse = {
        id: 'checkout_test456',
        result: {
          code: '000.200.100',
          description: 'Successfully created checkout'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHyperPayResponse,
      });

      const request = new NextRequest('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hyperPayData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toMatchObject({
        provider: 'hyperpay',
        orderId: 'ORD-123',
        amount: 100,
        currency: 'SAR',
        status: 'pending',
        clientSecret: 'checkout_test456',
      });

      // Verify HyperPay API was called correctly
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.oppwa.com/v1/checkouts',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_access_token',
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        provider: 'tap',
        amount: -100, // Invalid amount
        orderId: 'ORD-123',
      };

      const request = new NextRequest('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid request data');
      expect(result.details).toBeDefined();
    });

    it('should handle payment provider errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid merchant' }),
      });

      const request = new NextRequest('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPaymentData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('Failed to create payment intent');
    });

    it('should validate Saudi phone number format', async () => {
      const dataWithInvalidPhone = {
        ...validPaymentData,
        customer: {
          ...validPaymentData.customer,
          phone: '+1234567890', // Non-Saudi phone number
        },
      };

      // Mock successful API response first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'chg_test123',
          amount: 100,
          currency: 'SAR',
          status: 'INITIATED',
          transaction: { url: 'https://tap.company/pay/chg_test123' }
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithInvalidPhone),
      });

      const response = await POST(request);
      
      // Should still process but format the phone number
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should process TAP webhook successfully', async () => {
      const tapWebhookPayload = {
        id: 'chg_test123',
        status: 'CAPTURED',
        amount: 100,
        currency: 'SAR',
        customer: {
          email: 'customer@example.com'
        }
      };

      const request = new NextRequest('http://localhost:3000/api/payments/webhook?provider=tap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tap-signature': 'expected_signature',
        },
        body: JSON.stringify(tapWebhookPayload),
      });

      const response = await WebhookPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.received).toBe(true);
      
      // Verify webhook signature was checked
      expect(mockHmac.update).toHaveBeenCalled();
      expect(mockTimingSafeEqual).toHaveBeenCalled();
    });

    it('should process HyperPay webhook successfully', async () => {
      const hyperPayWebhookPayload = {
        id: 'payment_test456',
        result: {
          code: '000.000.100',
          description: 'Transaction succeeded'
        },
        amount: '100.00',
        currency: 'SAR'
      };

      const request = new NextRequest('http://localhost:3000/api/payments/webhook?provider=hyperpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hyperpay-signature': 'expected_signature',
        },
        body: JSON.stringify(hyperPayWebhookPayload),
      });

      const response = await WebhookPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.received).toBe(true);
    });

    it('should reject webhook without signature', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/webhook?provider=tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test' }),
      });

      const response = await WebhookPOST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Missing webhook signature');
    });

    it('should reject webhook with invalid provider', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/webhook?provider=invalid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'test',
        },
        body: JSON.stringify({ id: 'test' }),
      });

      const response = await WebhookPOST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid or missing payment provider');
    });

    it('should reject webhook with invalid signature', async () => {
      mockTimingSafeEqual.mockReturnValueOnce(false);

      const request = new NextRequest('http://localhost:3000/api/payments/webhook?provider=tap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tap-signature': 'invalid_signature',
        },
        body: JSON.stringify({ id: 'test' }),
      });

      const response = await WebhookPOST(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Invalid webhook signature');
    });
  });
});