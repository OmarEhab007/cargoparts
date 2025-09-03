import { env } from '@/lib/env.mjs';
import { z } from 'zod';

const tapChargeSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('SAR'),
  description: z.string(),
  customer: z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    phone: z.object({
      country_code: z.string().default('966'),
      number: z.string(),
    }),
  }),
  source: z.object({
    id: z.string(),
  }),
  redirect: z.object({
    url: z.string().url(),
  }),
  metadata: z.record(z.string()).optional(),
});

const tapRefundSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().default('SAR'),
  description: z.string().optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).default('requested_by_customer'),
});

export interface TapCharge {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'INITIATED' | 'AUTHORIZED' | 'CAPTURED' | 'VOID' | 'DECLINED' | 'RESTRICTED';
  response: {
    code: string;
    message: string;
  };
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: {
      country_code: string;
      number: string;
    };
  };
  source: {
    type: string;
    company: string;
    number: string;
    name: string;
  };
  transaction: {
    timezone: string;
    created: string;
    url: string;
    expiry: {
      period: number;
      type: string;
    };
    asynchronous: boolean;
    amount: number;
    currency: string;
  };
  reference: {
    transaction: string;
    order: string;
    gateway: string;
    acquirer: string;
    track: string;
    payment: string;
  };
  receipt: {
    email: boolean;
    sms: boolean;
  };
  merchant: {
    country: string;
    currency: string;
    id: string;
  };
  invoice: {
    id: string;
  };
  metadata: Record<string, string>;
}

export interface TapRefund {
  id: string;
  amount: number;
  currency: string;
  charge: string;
  description: string;
  reason: string;
  status: 'PENDING' | 'INITIATED' | 'CANCELLED' | 'FAILED' | 'DECLINED' | 'RESTRICTED' | 'CAPTURED';
  created: string;
  metadata: Record<string, string>;
}

export class TapPaymentService {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly sandboxMode: boolean;

  constructor() {
    this.apiKey = env.TAP_API_KEY || '';
    this.secretKey = env.TAP_SECRET_KEY || '';
    this.sandboxMode = env.TAP_SANDBOX_MODE;
    this.baseUrl = this.sandboxMode 
      ? 'https://api.tap.company/v2' 
      : 'https://api.tap.company/v2';
    
    if (!this.apiKey) {
      throw new Error('TAP_API_KEY is required');
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async createCharge(data: z.infer<typeof tapChargeSchema>): Promise<TapCharge> {
    const validatedData = tapChargeSchema.parse(data);
    
    const response = await fetch(`${this.baseUrl}/charges`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`TAP API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  async retrieveCharge(chargeId: string): Promise<TapCharge> {
    const response = await fetch(`${this.baseUrl}/charges/${chargeId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`TAP API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  async captureCharge(chargeId: string, amount?: number): Promise<TapCharge> {
    const body: any = {};
    if (amount !== undefined) {
      body.amount = amount;
    }

    const response = await fetch(`${this.baseUrl}/charges/${chargeId}/capture`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`TAP API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  async voidCharge(chargeId: string): Promise<TapCharge> {
    const response = await fetch(`${this.baseUrl}/charges/${chargeId}/void`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`TAP API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  async createRefund(chargeId: string, data: z.infer<typeof tapRefundSchema>): Promise<TapRefund> {
    const validatedData = tapRefundSchema.parse(data);
    
    const response = await fetch(`${this.baseUrl}/charges/${chargeId}/refund`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`TAP API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  async listCharges(options: {
    period?: { from: number; to: number };
    status?: string;
    source_id?: string;
    limit?: number;
    starting_after?: string;
  } = {}): Promise<{ charges: TapCharge[]; has_more: boolean }> {
    const queryParams = new URLSearchParams();
    
    if (options.period) {
      queryParams.set('period[from]', options.period.from.toString());
      queryParams.set('period[to]', options.period.to.toString());
    }
    if (options.status) queryParams.set('status', options.status);
    if (options.source_id) queryParams.set('source_id', options.source_id);
    if (options.limit) queryParams.set('limit', options.limit.toString());
    if (options.starting_after) queryParams.set('starting_after', options.starting_after);

    const response = await fetch(`${this.baseUrl}/charges?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`TAP API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    if (!env.TAP_WEBHOOK_SECRET) {
      throw new Error('TAP_WEBHOOK_SECRET is required for webhook verification');
    }

    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', env.TAP_WEBHOOK_SECRET)
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
      const response = await fetch(`${this.baseUrl}/tokens`, {
        method: 'GET',
        headers: this.getHeaders(),
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

export const tapPaymentService = new TapPaymentService();