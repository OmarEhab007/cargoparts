import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { emailService } from '@/lib/communication/email-service';
import { registerSchema } from '@/lib/auth/validation';
import { AuthErrors, createErrorResponse, handleUnknownError } from '@/lib/auth/errors';
import { withRateLimit, otpRateLimiter } from '@/lib/auth/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(otpRateLimiter)(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(validatedData.email);
    if (existingUser) {
      throw AuthErrors.USER_ALREADY_EXISTS();
    }

    // Check if phone number is already taken
    if (validatedData.phone) {
      const existingPhoneUser = await UserService.getUserByPhone(validatedData.phone);
      if (existingPhoneUser) {
        throw AuthErrors.PHONE_ALREADY_EXISTS();
      }
    }

    // Create user
    const user = await UserService.createUser({
      email: validatedData.email,
      name: validatedData.name,
      phone: validatedData.phone,
      preferredLocale: validatedData.preferredLocale,
    });

    // Send verification email with OTP
    try {
      // Get the generated OTP code for email verification
      const { OtpService } = await import('@/lib/auth/otp');
      const otpStatus = await OtpService.getOtpStatus(user.id, 'EMAIL_VERIFICATION');
      
      if (otpStatus.hasActiveOtp) {
        // Find the actual OTP code from the database
        const { prisma } = await import('@/lib/db/prisma');
        const otpRecord = await prisma.otpCode.findFirst({
          where: {
            userId: user.id,
            type: 'EMAIL_VERIFICATION',
            verified: false,
            expiresAt: { gte: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });
        
        if (otpRecord) {
          await emailService.sendVerificationEmail(user.email, otpRecord.code, (user.preferredLocale as 'ar' | 'en') || 'ar');
        }
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email sending fails
    }

    // Return success response without sensitive data
    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification.',
      messageAr: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.',
      data: {
        userId: user.id,
        email: user.email,
        status: user.status,
        requiresVerification: !user.emailVerified,
      },
    }, { status: 201 });

  } catch (error) {
    const authError = handleUnknownError(error);
    return createErrorResponse(authError);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}