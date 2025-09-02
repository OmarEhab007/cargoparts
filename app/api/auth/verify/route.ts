import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { OtpService } from '@/lib/auth/otp';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/auth/middleware';

const verifyEmailSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  otpCode: z.string().length(6, 'OTP must be 6 digits'),
  type: z.literal('email'),
});

const verifyPhoneSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  otpCode: z.string().length(6, 'OTP must be 6 digits'),
  type: z.literal('phone'),
});

const resendSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  type: z.enum(['email', 'phone']),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 10, 60000); // 10 requests per minute
    
    if (rateLimit.isLimited) {
      return NextResponse.json(
        {
          error: 'Too many verification attempts',
          details: {
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type } = body;

    if (type === 'email') {
      const data = verifyEmailSchema.parse(body);
      
      const success = await UserService.verifyEmail(data.userId, data.otpCode);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Invalid or expired OTP code' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: 'Email verified successfully',
        verified: true,
      });
    } else if (type === 'phone') {
      const data = verifyPhoneSchema.parse(body);
      
      const success = await UserService.verifyPhone(data.userId, data.otpCode);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Invalid or expired OTP code' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: 'Phone verified successfully',
        verified: true,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid verification type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verification error:', error);

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

    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Resend verification OTP
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting for resend requests
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 5, 60000); // 5 requests per minute
    
    if (rateLimit.isLimited) {
      return NextResponse.json(
        {
          error: 'Too many resend attempts',
          details: {
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = resendSchema.parse(body);

    if (data.type === 'email') {
      const result = await UserService.resendVerificationEmail(data.userId);
      
      return NextResponse.json({
        message: 'Verification email sent',
        expiresAt: result.expiresAt,
      });
    } else if (data.type === 'phone') {
      const result = await UserService.requestPhoneVerification(data.userId);
      
      return NextResponse.json({
        message: 'Verification SMS sent',
        expiresAt: result.expiresAt,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid verification type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Resend verification error:', error);

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
      const knownErrors = [
        'User not found',
        'Email is already verified',
        'Phone is already verified',
        'No phone number associated',
        'Too many OTP requests',
      ];

      if (knownErrors.some(msg => error.message.includes(msg))) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to resend verification. Please try again.' },
      { status: 500 }
    );
  }
}

// Get verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') as 'email' | 'phone';

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type parameters are required' },
        { status: 400 }
      );
    }

    const otpType = type === 'email' ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION';
    const status = await OtpService.getOtpStatus(userId, otpType);

    return NextResponse.json({
      hasActiveOtp: status.hasActiveOtp,
      expiresAt: status.expiresAt,
      attemptsUsed: status.attemptsUsed,
      attemptsLeft: status.attemptsLeft,
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    return NextResponse.json(
      { error: 'Failed to get verification status' },
      { status: 500 }
    );
  }
}