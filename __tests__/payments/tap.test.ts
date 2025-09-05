import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TapPaymentService } from '@/lib/payments/providers/tap';

// Mock environment
vi.mock('@/lib/env.mjs', () => ({
  env: {
    TAP_API_KEY: 'test_api_key',
    TAP_SECRET_KEY: 'test_secret_key',
    TAP_WEBHOOK_SECRET: 'test_webhook_secret',
    TAP_SANDBOX_MODE: true
  }
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TapPaymentService', () => {
  let tapService: TapPaymentService;
  
  beforeEach(() => {
    tapService = new TapPaymentService();
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  describe('createCharge', () => {
    it('should create a charge successfully', async () => {
      const mockResponse = {
        id: 'chg_test123',
        amount: 100,
        currency: 'SAR',
        status: 'INITIATED',
        transaction: {
          url: 'https://tap.company/pay/chg_test123',
          expiry: { period: 30, type: 'MINUTE' }
        },
        customer: {
          first_name: 'Ahmed',
          last_name: 'Ali',
          email: 'ahmed@example.com'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const chargeData = {
        amount: 100,
        currency: 'SAR',
        description: 'Test order',
        customer: {
          first_name: 'Ahmed',
          last_name: 'Ali',
          email: 'ahmed@example.com',
          phone: {
            country_code: '966',
            number: '501234567',
          },
        },
        source: {
          id: 'src_card',
        },
        redirect: {
          url: 'https://example.com/return',
        },
      };

      const result = await tapService.createCharge(chargeData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.tap.company/v2/charges',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test_api_key',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(chargeData),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const chargeData = {
        amount: -100, // Invalid amount - this will be caught by Zod validation
        currency: 'SAR',
        description: 'Test order',
        customer: {
          first_name: 'Ahmed',
          last_name: 'Ali',
          email: 'ahmed@example.com',
          phone: {
            country_code: '966',
            number: '501234567',
          },
        },
        source: {
          id: 'src_card',
        },
        redirect: {
          url: 'https://example.com/return',
        },
      };

      await expect(tapService.createCharge(chargeData)).rejects.toThrow();
    });
  });

  describe('retrieveCharge', () => {
    it('should retrieve a charge by ID', async () => {
      const mockCharge = {
        id: 'chg_test123',
        amount: 100,
        currency: 'SAR',
        status: 'CAPTURED',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCharge,
      });

      const result = await tapService.retrieveCharge('chg_test123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.tap.company/v2/charges/chg_test123',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test_api_key',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockCharge);
    });
  });

  describe('verifyWebhook', () => {
    it('should verify webhook signature correctly', async () => {
      const payload = '{"id":"chg_test123","status":"CAPTURED"}';
      
      // Mock crypto module
      const mockHmac = {
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('expected_signature'),
      };
      
      const mockCrypto = {
        createHmac: vi.fn().mockReturnValue(mockHmac),
        timingSafeEqual: vi.fn().mockReturnValue(true),
      };

      vi.doMock('crypto', () => mockCrypto);

      const signature = 'expected_signature';
      const isValid = await tapService.verifyWebhook(payload, signature);

      expect(isValid).toBe(true);
    });
  });

  describe('formatAmount', () => {
    it('should format amounts correctly', () => {
      expect(tapService.formatAmount(99.999)).toBe(100);
      expect(tapService.formatAmount(99.001)).toBe(99);
      expect(tapService.formatAmount(100)).toBe(100);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when API is accessible', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const health = await tapService.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
    });

    it('should return unhealthy status when API throws error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const health = await tapService.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.timestamp).toBeDefined();
    });
  });
});