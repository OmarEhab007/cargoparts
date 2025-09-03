import { prisma } from '@/lib/db/prisma';
import { env } from '@/lib/env.mjs';
import type { OtpType } from '@prisma/client';
import crypto from 'crypto';

// const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_RATE_LIMIT_MINUTES = 60; // 1 hour
const MAX_OTP_PER_HOUR = parseInt(env.RATE_LIMIT_OTP_PER_HOUR.toString(), 10);

export interface OtpVerificationResult {
  success: boolean;
  error?: string;
  attemptsLeft?: number;
}

export class OtpService {
  /**
   * Generate a secure OTP code
   */
  private static generateOtpCode(): string {
    // Generate cryptographically secure random number
    const randomBytes = crypto.randomBytes(3);
    const randomNumber = parseInt(randomBytes.toString('hex'), 16);
    
    // Convert to 6-digit code
    return (randomNumber % 900000 + 100000).toString();
  }

  /**
   * Generate and store OTP for user
   */
  static async generateOtp(userId: string, type: OtpType): Promise<{ code: string; expiresAt: Date }> {
    // Check rate limit
    const recentOtps = await prisma.otpCode.count({
      where: {
        userId,
        type,
        createdAt: {
          gte: new Date(Date.now() - OTP_RATE_LIMIT_MINUTES * 60 * 1000),
        },
      },
    });

    if (recentOtps >= MAX_OTP_PER_HOUR) {
      throw new Error('Too many OTP requests. Please try again later.');
    }

    // Invalidate existing OTPs of the same type
    await prisma.otpCode.deleteMany({
      where: {
        userId,
        type,
        verified: false,
      },
    });

    // Generate new OTP
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpCode.create({
      data: {
        userId,
        code,
        type,
        expiresAt,
      },
    });

    return { code, expiresAt };
  }

  /**
   * Verify OTP code
   */
  static async verifyOtp(userId: string, code: string, type: OtpType): Promise<OtpVerificationResult> {
    // Find the OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        type,
        verified: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return {
        success: false,
        error: 'Invalid or expired OTP code',
      };
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      // Delete the OTP to prevent further attempts
      await prisma.otpCode.delete({
        where: { id: otpRecord.id },
      });
      
      return {
        success: false,
        error: 'Maximum attempts exceeded. Please request a new code.',
      };
    }

    // Check if code matches
    if (otpRecord.code !== code) {
      // Increment attempts
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });

      return {
        success: false,
        error: 'Invalid OTP code',
        attemptsLeft: MAX_OTP_ATTEMPTS - otpRecord.attempts - 1,
      };
    }

    // Mark as verified
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return { success: true };
  }

  /**
   * Clean up expired OTPs
   */
  static async cleanupExpiredOtps(): Promise<void> {
    await prisma.otpCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Get OTP status for user
   */
  static async getOtpStatus(userId: string, type: OtpType): Promise<{
    hasActiveOtp: boolean;
    expiresAt: Date | null;
    attemptsUsed: number;
    attemptsLeft: number;
  }> {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        type,
        verified: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return {
        hasActiveOtp: false,
        expiresAt: null,
        attemptsUsed: 0,
        attemptsLeft: MAX_OTP_ATTEMPTS,
      };
    }

    return {
      hasActiveOtp: true,
      expiresAt: otpRecord.expiresAt,
      attemptsUsed: otpRecord.attempts,
      attemptsLeft: Math.max(0, MAX_OTP_ATTEMPTS - otpRecord.attempts),
    };
  }

  /**
   * Check rate limit for OTP generation
   */
  static async checkRateLimit(userId: string, type: OtpType): Promise<{
    isLimited: boolean;
    remainingCount: number;
    resetTime: Date;
  }> {
    const oneHourAgo = new Date(Date.now() - OTP_RATE_LIMIT_MINUTES * 60 * 1000);
    
    const recentOtps = await prisma.otpCode.count({
      where: {
        userId,
        type,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    const resetTime = new Date(Date.now() + OTP_RATE_LIMIT_MINUTES * 60 * 1000);

    return {
      isLimited: recentOtps >= MAX_OTP_PER_HOUR,
      remainingCount: Math.max(0, MAX_OTP_PER_HOUR - recentOtps),
      resetTime,
    };
  }

  /**
   * Invalidate all OTPs for user (used on successful login/verification)
   */
  static async invalidateUserOtps(userId: string, type?: OtpType): Promise<void> {
    await prisma.otpCode.deleteMany({
      where: {
        userId,
        ...(type && { type }),
        verified: false,
      },
    });
  }

  /**
   * Get OTP statistics for monitoring
   */
  static async getOtpStats(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<{
    totalGenerated: number;
    totalVerified: number;
    verificationRate: number;
    averageAttempts: number;
  }> {
    const timeMap = {
      hour: 1 * 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    };

    const since = new Date(Date.now() - timeMap[timeframe]);

    const [totalGenerated, verifiedOtps, allOtps] = await Promise.all([
      prisma.otpCode.count({
        where: {
          createdAt: { gte: since },
        },
      }),
      prisma.otpCode.count({
        where: {
          createdAt: { gte: since },
          verified: true,
        },
      }),
      prisma.otpCode.findMany({
        where: {
          createdAt: { gte: since },
        },
        select: { attempts: true },
      }),
    ]);

    const totalAttempts = allOtps.reduce((sum, otp) => sum + otp.attempts, 0);
    const averageAttempts = totalGenerated > 0 ? totalAttempts / totalGenerated : 0;
    const verificationRate = totalGenerated > 0 ? (verifiedOtps / totalGenerated) * 100 : 0;

    return {
      totalGenerated,
      totalVerified: verifiedOtps,
      verificationRate: Math.round(verificationRate * 100) / 100,
      averageAttempts: Math.round(averageAttempts * 100) / 100,
    };
  }
}