import { tapPaymentService, TapCharge } from './providers/tap';
import { hyperPayService, HyperPayStatusResponse } from './providers/hyperpay';
import { z } from 'zod';

export type PaymentProvider = 'tap' | 'hyperpay';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

const createPaymentSchema = z.object({
  provider: z.enum(['tap', 'hyperpay']),
  amount: z.number().positive(),
  currency: z.string().default('SAR'),
  orderId: z.string(),
  customer: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string().optional(),
      postalCode: z.string(),
      country: z.string().default('SA'),
    }).optional(),
  }),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
  webhookUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export class PaymentService {
  async createPaymentIntent(data: z.infer<typeof createPaymentSchema>) {
    const validatedData = createPaymentSchema.parse(data);
    const intentId = this.generateIntentId();
    
    try {
      let clientSecret: string | undefined;
      let paymentUrl: string | undefined;

      if (validatedData.provider === 'tap') {
        const tapCharge = await tapPaymentService.createCharge({
          amount: validatedData.amount,
          currency: validatedData.currency,
          description: `Order ${validatedData.orderId}`,
          customer: {
            first_name: validatedData.customer.firstName,
            last_name: validatedData.customer.lastName,
            email: validatedData.customer.email,
            phone: {
              country_code: '966',
              number: validatedData.customer.phone.replace(/^\+?966/, ''),
            },
          },
          source: {
            id: 'src_card',
          },
          redirect: {
            url: validatedData.returnUrl,
          },
          metadata: {
            orderId: validatedData.orderId,
            ...validatedData.metadata,
          },
        });

        clientSecret = tapCharge.id;
        paymentUrl = tapCharge.transaction?.url;
        
      } else if (validatedData.provider === 'hyperpay') {
        const checkout = await hyperPayService.prepareCheckout({
          amount: validatedData.amount,
          currency: validatedData.currency,
          paymentType: 'DB',
          merchantTransactionId: intentId,
          customer: {
            email: validatedData.customer.email,
            givenName: validatedData.customer.firstName,
            surname: validatedData.customer.lastName,
            mobile: validatedData.customer.phone,
          },
          shopperResultUrl: validatedData.returnUrl,
          notificationUrl: validatedData.webhookUrl,
          createRegistration: false,
        });

        clientSecret = checkout.id;
        paymentUrl = checkout.script;
      }

      return {
        id: intentId,
        provider: validatedData.provider,
        orderId: validatedData.orderId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: 'pending' as const,
        clientSecret,
        paymentUrl,
        redirectUrl: validatedData.returnUrl,
        metadata: validatedData.metadata || {},
        createdAt: new Date(),
      };
      
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyWebhook(
    provider: PaymentProvider, 
    payload: string, 
    signature: string
  ): Promise<boolean> {
    try {
      if (provider === 'tap') {
        return await tapPaymentService.verifyWebhook(payload, signature);
      } else if (provider === 'hyperpay') {
        return await hyperPayService.verifyWebhook(payload, signature);
      }
      return false;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return false;
    }
  }

  private generateIntentId(): string {
    return `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const paymentService = new PaymentService();