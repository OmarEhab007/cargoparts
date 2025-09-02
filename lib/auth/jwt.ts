import { sign, verify } from 'jsonwebtoken';
import { env } from '@/lib/env.mjs';
import type { User } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  exp?: number;
  iat?: number;
}

export interface SessionData {
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
    avatar: string | null;
    status: string;
  };
  sessionId: string;
}

const JWT_SECRET = env.JWT_SECRET;
const TOKEN_EXPIRY = '7d'; // 7 days
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

export class JwtService {
  /**
   * Generate access token
   */
  static generateAccessToken(user: Pick<User, 'id' | 'email' | 'role'>, sessionId?: string): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      ...(sessionId && { sessionId }),
    };

    return sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
      issuer: 'cargoparts',
      audience: 'cargoparts-users',
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string, sessionId: string): string {
    const payload = {
      userId,
      sessionId,
      type: 'refresh',
    };

    return sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'cargoparts',
      audience: 'cargoparts-refresh',
    });
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      return verify(token, JWT_SECRET, {
        issuer: 'cargoparts',
        audience: 'cargoparts-users',
      }) as JwtPayload;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid token: ${error.message}`);
      }
      throw new Error('Invalid token');
    }
  }

  /**
   * Verify and decode refresh token
   */
  static verifyRefreshToken(token: string): { userId: string; sessionId: string; type: string } {
    try {
      return verify(token, JWT_SECRET, {
        issuer: 'cargoparts',
        audience: 'cargoparts-refresh',
      }) as { userId: string; sessionId: string; type: string };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid refresh token: ${error.message}`);
      }
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get token expiry time
   */
  static getTokenExpiry(): Date {
    // Return expiry time for 7 days from now
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Get refresh token expiry time
   */
  static getRefreshTokenExpiry(): Date {
    // Return expiry time for 30 days from now
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Check if token is expired (client-side check)
   */
  static isTokenExpired(payload: JwtPayload): boolean {
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  }

  /**
   * Get time until token expires
   */
  static getTimeUntilExpiry(payload: JwtPayload): number {
    if (!payload.exp) return 0;
    return Math.max(0, payload.exp * 1000 - Date.now());
  }

  /**
   * Check if token expires soon (within 24 hours)
   */
  static isTokenExpiringSoon(payload: JwtPayload): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry(payload);
    const oneDayMs = 24 * 60 * 60 * 1000;
    return timeUntilExpiry < oneDayMs;
  }
}