import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { z } from 'zod';
import { checkRateLimit, getClientIp, getUserAgent, createAuthResponse } from '@/lib/auth/middleware';

const loginInitSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const loginCompleteSchema = z.object({
  email: z.string().email('Invalid email format'),
  otpCode: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for login attempts
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, 10, 60000); // 10 requests per minute
    
    if (rateLimit.isLimited) {
      return NextResponse.json(
        {
          error: 'Too many login attempts',
          details: {
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { otpCode } = body;

    // Determine if this is login initiation or OTP verification
    if (!otpCode) {
      // Login initiation - send OTP
      const data = loginInitSchema.parse(body);
      
      const result = await UserService.initiateLogin({
        email: data.email,
        useOtp: true,
      });

      return NextResponse.json({
        message: result.message,
        requiresOtp: result.requiresOtp,
        userId: result.userId,
      });
    } else {
      // OTP verification - complete login
      const data = loginCompleteSchema.parse(body);
      const userAgent = getUserAgent(request);
      
      const result = await UserService.completeOtpLogin(
        {
          email: data.email,
          otpCode: data.otpCode,
        },
        userAgent,
        clientIp
      );

      // Create response with auth tokens
      return createAuthResponse(
        {
          message: 'Login successful',
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            phone: result.user.phone,
            role: result.user.role,
            status: result.user.status,
            avatar: result.user.avatar,
            emailVerified: result.user.emailVerified,
            phoneVerified: result.user.phoneVerified,
            preferredLocale: result.user.preferredLocale,
          },
          sessionId: result.sessionId,
        },
        {
          token: result.token,
          refreshToken: result.refreshToken,
        }
      );
    }
  } catch (error) {
    console.error('Login error:', error);

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
      const errorMessages = [
        'Account has been banned',
        'Account is inactive',
        'Invalid email or OTP',
        'Invalid OTP',
        'Too many OTP requests',
        'Maximum attempts exceeded',
      ];

      if (errorMessages.some(msg => error.message.includes(msg))) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}