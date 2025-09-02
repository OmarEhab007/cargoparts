import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/auth/middleware';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^(\+966|0)?[5][0-9]{8}$/, 'Invalid Saudi phone number').optional(),
  role: z.enum(['BUYER', 'SELLER']).default('BUYER'),
  preferredLocale: z.enum(['ar', 'en']).default('ar'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 5, 60000); // 5 requests per minute
    
    if (rateLimit.isLimited) {
      return NextResponse.json(
        {
          error: 'Too many registration attempts',
          details: {
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = registerSchema.parse(body);

    // Create user
    const user = await UserService.createUser({
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      preferredLocale: data.preferredLocale,
    });

    // Return success response (don't include sensitive data)
    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email for verification code.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          status: user.status,
        },
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Handle known errors
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET request to check if email/phone is available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone parameter is required' },
        { status: 400 }
      );
    }

    const checks = await Promise.all([
      email ? UserService.getUserByEmail(email) : null,
      phone ? UserService.getUserByPhone(phone) : null,
    ]);

    const emailTaken = !!checks[0];
    const phoneTaken = !!checks[1];

    return NextResponse.json({
      available: !emailTaken && !phoneTaken,
      emailTaken,
      phoneTaken,
    });
  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}