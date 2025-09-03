import { env } from '@/lib/env.mjs';
import { z } from 'zod';

const hyperPayCheckoutSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('SAR'),
  paymentType: z.enum(['DB', 'PA', 'CD']).default('DB'), // Debit, PreAuth, Credit
  merchantTransactionId: z.string(),
  customer: z.object({
    email: z.string().email(),
    givenName: z.string(),
    surname: z.string(),
    mobile: z.string().optional(),
    ip: z.string().optional(),
  }),
  billing: z.object({
    street1: z.string(),
    city: z.string(),
    state: z.string().optional(),
    postcode: z.string(),
    country: z.string().default('SA'),
  }).optional(),
  shipping: z.object({
    street1: z.string(),
    city: z.string(),
    state: z.string().optional(),
    postcode: z.string(),
    country: z.string().default('SA'),
  }).optional(),
  notificationUrl: z.string().url().optional(),
  shopperResultUrl: z.string().url(),
  defaultPaymentMethod: z.string().optional(),
  createRegistration: z.boolean().default(false),
});

const hyperPayRefundSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('SAR'),
  paymentType: z.enum(['RF', 'CP']).default('RF'), // Refund, Chargeback
});

export interface HyperPayCheckout {
  id: string;
  paymentId?: string;
  paymentType: string;
  amount: string;
  currency: string;
  descriptor: string;
  result: {
    code: string;
    description: string;
  };
  resultDetails: {
    ConnectorTxID1: string;
    AcquirerResponse: string;
  };
  card?: {
    bin: string;
    last4Digits: string;
    holder: string;
    expiryMonth: string;
    expiryYear: string;
  };
  customer: {
    email: string;
    givenName: string;
    surname: string;
    mobile?: string;
    ip?: string;
  };
  customParameters: Record<string, string>;
  timestamp: string;
  ndc: string;
}

export interface HyperPayStatusResponse {
  id: string;
  paymentType: string;
  paymentBrand: string;
  amount: string;
  currency: string;
  descriptor: string;
  result: {
    code: string;
    description: string;
  };
  card: {
    bin: string;
    last4Digits: string;
    holder: string;
    expiryMonth: string;
    expiryYear: string;
  };
  risk: {
    score: string;
  };
  buildNumber: string;
  timestamp: string;
  ndc: string;
}

export class HyperPayService {
  private readonly entityId: string;
  private readonly accessToken: string;
  private readonly baseUrl: string;
  private readonly sandboxMode: boolean;

  constructor() {
    this.entityId = env.HYPERPAY_ENTITY_ID || '';
    this.accessToken = env.HYPERPAY_ACCESS_TOKEN || '';
    this.sandboxMode = env.HYPERPAY_SANDBOX_MODE;
    this.baseUrl = this.sandboxMode 
      ? 'https://test.oppwa.com/v1' 
      : 'https://oppwa.com/v1';
    
    if (!this.entityId || !this.accessToken) {
      throw new Error('HYPERPAY_ENTITY_ID and HYPERPAY_ACCESS_TOKEN are required');
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    };
  }

  private formatParams(data: Record<string, any>): string {
    const params = new URLSearchParams();
    
    const addParam = (key: string, value: any, prefix = '') => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([k, v]) => {
          addParam(k, v, fullKey);
        });
      } else if (value !== undefined && value !== null) {
        params.append(fullKey, String(value));
      }
    };

    Object.entries(data).forEach(([key, value]) => {
      addParam(key, value);
    });

    return params.toString();
  }

  async prepareCheckout(data: z.infer<typeof hyperPayCheckoutSchema>): Promise<{ id: string; script: string }> {
    const validatedData = hyperPayCheckoutSchema.parse(data);
    
    const requestData = {
      entityId: this.entityId,
      amount: validatedData.amount.toFixed(2),
      currency: validatedData.currency,
      paymentType: validatedData.paymentType,
      merchantTransactionId: validatedData.merchantTransactionId,
      'customer.email': validatedData.customer.email,
      'customer.givenName': validatedData.customer.givenName,
      'customer.surname': validatedData.customer.surname,
      ...(validatedData.customer.mobile && { 'customer.mobile': validatedData.customer.mobile }),
      ...(validatedData.customer.ip && { 'customer.ip': validatedData.customer.ip }),
      ...(validatedData.billing && {
        'billing.street1': validatedData.billing.street1,
        'billing.city': validatedData.billing.city,
        'billing.postcode': validatedData.billing.postcode,
        'billing.country': validatedData.billing.country,
        ...(validatedData.billing.state && { 'billing.state': validatedData.billing.state }),
      }),
      ...(validatedData.shipping && {
        'shipping.street1': validatedData.shipping.street1,
        'shipping.city': validatedData.shipping.city,
        'shipping.postcode': validatedData.shipping.postcode,
        'shipping.country': validatedData.shipping.country,
        ...(validatedData.shipping.state && { 'shipping.state': validatedData.shipping.state }),
      }),
      ...(validatedData.notificationUrl && { notificationUrl: validatedData.notificationUrl }),
      shopperResultUrl: validatedData.shopperResultUrl,
      ...(validatedData.defaultPaymentMethod && { defaultPaymentMethod: validatedData.defaultPaymentMethod }),
      createRegistration: validatedData.createRegistration,
    };

    const response = await fetch(`${this.baseUrl}/checkouts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: this.formatParams(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HyperPay API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    
    if (result.result.code !== '000.200.100') {
      throw new Error(`HyperPay Error: ${result.result.code} - ${result.result.description}`);
    }

    return {
      id: result.id,
      script: `${this.baseUrl}/paymentWidgets.js?checkoutId=${result.id}`,
    };
  }

  async getPaymentStatus(resourcePath: string): Promise<HyperPayStatusResponse> {
    const url = `${this.baseUrl}${resourcePath}?entityId=${this.entityId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HyperPay API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  async createRefund(paymentId: string, data: z.infer<typeof hyperPayRefundSchema>): Promise<HyperPayStatusResponse> {
    const validatedData = hyperPayRefundSchema.parse(data);
    
    const requestData = {
      entityId: this.entityId,
      amount: validatedData.amount.toFixed(2),
      currency: validatedData.currency,
      paymentType: validatedData.paymentType,
    };

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: this.formatParams(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HyperPay API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  async backOfficeRefund(paymentId: string, data: z.infer<typeof hyperPayRefundSchema>): Promise<HyperPayStatusResponse> {
    const validatedData = hyperPayRefundSchema.parse(data);
    
    const requestData = {
      entityId: this.entityId,
      amount: validatedData.amount.toFixed(2),
      currency: validatedData.currency,
      paymentType: 'RV', // Reversal
    };

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: this.formatParams(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HyperPay API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  isSuccessfulPayment(resultCode: string): boolean {
    // Successful payment result codes
    const successCodes = [
      /^000\.000\./,    // Transaction succeeded
      /^000\.100\.1/,   // Successfully created checkout
      /^000\.200/,      // Transaction pending
      /^000\.400\.0[^3]/, // Transaction succeeded with risk
      /^000\.400\.100/, // Transaction succeeded
    ];

    return successCodes.some(pattern => pattern.test(resultCode));
  }

  isPendingPayment(resultCode: string): boolean {
    // Pending payment result codes
    const pendingCodes = [
      /^000\.200/,      // Transaction pending
      /^800\.400\.5/,   // Transaction pending for acquirer
    ];

    return pendingCodes.some(pattern => pattern.test(resultCode));
  }

  isFailedPayment(resultCode: string): boolean {
    return !this.isSuccessfulPayment(resultCode) && !this.isPendingPayment(resultCode);
  }

  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    if (!env.HYPERPAY_WEBHOOK_SECRET) {
      throw new Error('HYPERPAY_WEBHOOK_SECRET is required for webhook verification');
    }

    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', env.HYPERPAY_WEBHOOK_SECRET)
      .update(payload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  formatAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      // Simple health check by trying to create a minimal checkout
      const response = await fetch(`${this.baseUrl}/checkouts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: this.formatParams({
          entityId: this.entityId,
          amount: '1.00',
          currency: 'SAR',
          paymentType: 'DB',
          merchantTransactionId: `health-check-${Date.now()}`,
          'customer.email': 'health@example.com',
          'customer.givenName': 'Health',
          'customer.surname': 'Check',
          shopperResultUrl: 'https://example.com/return',
        }),
      });
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const hyperPayService = new HyperPayService();