import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { UserService } from '@/lib/auth/user-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const sendSchema = z.object({
  action: z.literal('send'),
});

const verifySchema = z.object({
  action: z.literal('verify'),
  otpCode: z.string().length(6, 'OTP must be 6 digits'),
});

const requestSchema = z.discriminatedUnion('action', [
  sendSchema,
  verifySchema,
]);

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await SessionService.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = requestSchema.parse(body);

    if (data.action === 'send') {
      // Get full user from database to check phone verification status
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phone: true, phoneVerified: true }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Send phone verification OTP
      if (!user.phone) {
        return NextResponse.json(
          { error: 'No phone number associated with account' },
          { status: 400 }
        );
      }

      if (user.phoneVerified) {
        return NextResponse.json(
          { error: 'Phone is already verified' },
          { status: 400 }
        );
      }

      const result = await UserService.requestPhoneVerification(session.user.id);
      
      return NextResponse.json({
        message: 'OTP sent successfully',
        expiresAt: result.expiresAt,
      });
    } else {
      // Verify phone OTP
      const success = await UserService.verifyPhone(session.user.id, data.otpCode);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Invalid or expired OTP' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: 'Phone verified successfully',
      });
    }
  } catch (error) {
    console.error('Phone verification error:', error);

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
        'No phone number associated with account',
        'Phone is already verified',
        'Too many OTP requests',
        'Maximum attempts exceeded',
      ];

      if (errorMessages.some(msg => error.message.includes(msg))) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Phone verification failed. Please try again.' },
      { status: 500 }
    );
  }
}