import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { emailService } from '@/lib/communication/email-service';
import { resendOtpSchema } from '@/lib/auth/validation';
import { AuthErrors, createErrorResponse, handleUnknownError } from '@/lib/auth/errors';
import { withRateLimit, otpRateLimiter } from '@/lib/auth/rate-limiter';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(otpRateLimiter)(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = resendOtpSchema.parse(body);

    // Find user by email
    const user = await UserService.getUserByEmail(validatedData.email);
    if (!user) {
      // For security, don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a new OTP has been sent',
        messageAr: "إذا كان البريد الإلكتروني موجوداً فقد تم إرسال رمز تحقق جديد",
      });
    }

    let result;
    
    if (validatedData.type === 'EMAIL_VERIFICATION') {
      if (user.emailVerified) {
        throw AuthErrors.EMAIL_ALREADY_VERIFIED();
      }
      result = await UserService.resendVerificationEmail(user.id);
      
      // Get the latest OTP for sending email
      const otpRecord = await prisma.otp.findFirst({
        where: {
          userId: user.id,
          type: 'EMAIL_VERIFICATION',
          verified: false,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // Send email
      try {
        if (otpRecord) {
          await emailService.sendVerificationEmail(user.email, otpRecord.code, (user.preferredLocale as 'ar' | 'en') || 'ar');
        }
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        throw AuthErrors.EMAIL_SEND_FAILED();
      }
    } else if (validatedData.type === 'LOGIN') {
      // Generate new login OTP
      await UserService.initiateLogin({ email: validatedData.email });
      
      // Get the latest LOGIN OTP for sending email
      const loginOtpRecord = await prisma.otp.findFirst({
        where: {
          userId: user.id,
          type: 'LOGIN',
          verified: false,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // Send login OTP email
      try {
        if (loginOtpRecord) {
          await emailService.sendLoginOtp(user.email, loginOtpRecord.code, (user.preferredLocale as 'ar' | 'en') || 'ar');
        }
      } catch (emailError) {
        console.error('Failed to send login OTP email:', emailError);
        throw AuthErrors.EMAIL_SEND_FAILED();
      }
      
      result = { expiresAt: new Date(Date.now() + 10 * 60 * 1000) }; // 10 minutes
    }

    return NextResponse.json({
      success: true,
      message: 'New OTP has been sent to your email',
      messageAr: "تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني",
      data: {
        type: validatedData.type,
        expiresAt: result?.expiresAt,
      },
    });

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