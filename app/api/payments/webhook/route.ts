import { NextRequest, NextResponse } from 'next/server';
import { paymentService, PaymentProvider } from '@/lib/payments/payment-service';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    
    // Get provider from query param or header
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as PaymentProvider;
    
    if (!provider || !['tap', 'hyperpay'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid or missing payment provider' },
        { status: 400 }
      );
    }

    // Get signature from headers
    let signature = '';
    if (provider === 'tap') {
      signature = headersList.get('x-tap-signature') || '';
    } else if (provider === 'hyperpay') {
      signature = headersList.get('x-hyperpay-signature') || '';
    }

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = await paymentService.verifyWebhook(provider, body, signature);
    
    if (!isValid) {
      console.error('Invalid webhook signature for provider:', provider);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    
    // Process webhook based on provider
    if (provider === 'tap') {
      await handleTapWebhook(payload);
    } else if (provider === 'hyperpay') {
      await handleHyperPayWebhook(payload);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleTapWebhook(payload: any) {
  console.log('Processing TAP webhook:', {
    id: payload.id,
    status: payload.status,
    amount: payload.amount,
    currency: payload.currency,
  });

  // Here you would typically:
  // 1. Find the payment intent/order by ID
  // 2. Update the payment status in your database
  // 3. Send confirmation emails
  // 4. Update order status
  // 5. Trigger fulfillment processes

  switch (payload.status) {
    case 'CAPTURED':
      console.log('Payment captured successfully:', payload.id);
      // Update order status to paid
      // Send confirmation email
      // Trigger fulfillment
      break;
      
    case 'DECLINED':
      console.log('Payment declined:', payload.id);
      // Update order status to failed
      // Send failure notification
      break;
      
    case 'CANCELLED':
      console.log('Payment cancelled:', payload.id);
      // Update order status to cancelled
      break;
      
    default:
      console.log('Unhandled TAP webhook status:', payload.status);
  }
}

async function handleHyperPayWebhook(payload: any) {
  console.log('Processing HyperPay webhook:', {
    id: payload.id,
    resultCode: payload.result?.code,
    amount: payload.amount,
    currency: payload.currency,
  });

  // Here you would typically:
  // 1. Find the payment intent/order by merchant transaction ID
  // 2. Update the payment status in your database
  // 3. Send confirmation emails
  // 4. Update order status
  // 5. Trigger fulfillment processes

  const resultCode = payload.result?.code;
  
  if (!resultCode) {
    console.error('Missing result code in HyperPay webhook');
    return;
  }

  // Check if payment was successful
  const successPatterns = [
    /^000\.000\./,    // Transaction succeeded
    /^000\.100\.1/,   // Successfully created checkout
    /^000\.400\.0[^3]/, // Transaction succeeded with risk
    /^000\.400\.100/, // Transaction succeeded
  ];

  const isSuccess = successPatterns.some(pattern => pattern.test(resultCode));
  const isPending = /^000\.200/.test(resultCode); // Transaction pending
  
  if (isSuccess) {
    console.log('HyperPay payment successful:', payload.id);
    // Update order status to paid
    // Send confirmation email
    // Trigger fulfillment
  } else if (isPending) {
    console.log('HyperPay payment pending:', payload.id);
    // Update order status to pending
  } else {
    console.log('HyperPay payment failed:', payload.id, resultCode);
    // Update order status to failed
    // Send failure notification
  }
}