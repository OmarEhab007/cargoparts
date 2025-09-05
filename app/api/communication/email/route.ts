import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/communication/email-service';
import { z } from 'zod';

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
  from: z.string().email().optional(),
  replyTo: z.string().email().optional(),
});

const sendTemplateSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  templateId: z.string(),
  data: z.record(z.string(), z.any()),
  locale: z.enum(['ar', 'en']).default('ar'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'template') {
      const validatedData = sendTemplateSchema.parse(body);
      
      const success = await emailService.sendTemplate(
        validatedData.to,
        {
          templateId: validatedData.templateId,
          data: validatedData.data,
          locale: validatedData.locale,
        }
      );

      return NextResponse.json({
        success,
        message: success ? 'Template email sent successfully' : 'Failed to send template email',
      });

    } else {
      const validatedData = sendEmailSchema.parse(body);
      
      const success = await emailService.sendEmail(validatedData);

      return NextResponse.json({
        success,
        message: success ? 'Email sent successfully' : 'Failed to send email',
      });
    }
    
  } catch (error) {
    console.error('Email API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Email sending failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'health') {
      const health = await emailService.healthCheck();
      return NextResponse.json(health);
    }

    if (action === 'verify') {
      const isConnected = await emailService.verifyConnection();
      return NextResponse.json({
        connected: isConnected,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Email API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}