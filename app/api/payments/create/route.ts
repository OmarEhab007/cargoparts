import { NextRequest, NextResponse } from 'next/server';
import { paymentService, PaymentProvider } from '@/lib/payments/payment-service';
import { z } from 'zod';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);
    
    const paymentIntent = await paymentService.createPaymentIntent(validatedData);
    
    return NextResponse.json(paymentIntent);
    
  } catch (error) {
    console.error('Create payment API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment creation failed' },
      { status: 500 }
    );
  }
}