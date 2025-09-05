import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/lib/communication/sms-service';
import { z } from 'zod';

const sendSMSSchema = z.object({
  to: z.string().regex(/^\+966[5][0-9]{8}$/, 'Must be a valid Saudi phone number (+966XXXXXXXXX)'),
  message: z.string().min(1).max(160),
  from: z.string().optional(),
});

const sendOTPSchema = z.object({
  phoneNumber: z.string(),
  otpCode: z.string(),
  locale: z.enum(['ar', 'en']).default('ar'),
});

const sendOrderUpdateSchema = z.object({
  phoneNumber: z.string(),
  orderId: z.string(),
  status: z.string(),
  locale: z.enum(['ar', 'en']).default('ar'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'otp') {
      const validatedData = sendOTPSchema.parse(body);
      
      // Format phone number
      const formattedNumber = smsService.formatPhoneNumber(validatedData.phoneNumber);
      
      if (!smsService.isValidSaudiNumber(formattedNumber)) {
        return NextResponse.json(
          { error: 'Invalid Saudi phone number format' },
          { status: 400 }
        );
      }

      const result = await smsService.sendOTP(
        formattedNumber,
        validatedData.otpCode,
        validatedData.locale
      );

      return NextResponse.json(result);

    } else if (action === 'order-update') {
      const validatedData = sendOrderUpdateSchema.parse(body);
      
      // Format phone number
      const formattedNumber = smsService.formatPhoneNumber(validatedData.phoneNumber);
      
      if (!smsService.isValidSaudiNumber(formattedNumber)) {
        return NextResponse.json(
          { error: 'Invalid Saudi phone number format' },
          { status: 400 }
        );
      }

      const result = await smsService.sendOrderUpdate(
        formattedNumber,
        validatedData.orderId,
        validatedData.status,
        validatedData.locale
      );

      return NextResponse.json(result);

    } else {
      const validatedData = sendSMSSchema.parse(body);
      
      const result = await smsService.sendSMS(validatedData);

      return NextResponse.json(result);
    }
    
  } catch (error) {
    console.error('SMS API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'SMS sending failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'health') {
      const health = await smsService.healthCheck();
      return NextResponse.json(health);
    }

    if (action === 'provider') {
      const providerName = smsService.getProviderName();
      return NextResponse.json({
        provider: providerName,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'validate') {
      const phoneNumber = searchParams.get('phoneNumber');
      if (!phoneNumber) {
        return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
      }

      const formatted = smsService.formatPhoneNumber(phoneNumber);
      const isValid = smsService.isValidSaudiNumber(formatted);

      return NextResponse.json({
        original: phoneNumber,
        formatted,
        isValid,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('SMS API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}