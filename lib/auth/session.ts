import { prisma } from '@/lib/db/prisma';
import { JwtService, type SessionData } from './jwt';
import { cookies } from 'next/headers';
import { env } from '@/lib/env.mjs';
import type { User } from '@prisma/client';

const COOKIE_NAME = env.SESSION_COOKIE_NAME;
const COOKIE_SECURE = env.AUTH_COOKIE_SECURE;
const COOKIE_SAME_SITE = env.AUTH_COOKIE_SAME_SITE as 'strict' | 'lax' | 'none';

export class SessionService {
  /**
   * Create a new session for user
   */
  static async createSession(
    user: User,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ token: string; refreshToken: string; sessionId: string }> {
    // Create session record in database
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: '', // Will be updated after generating JWT
        expiresAt: JwtService.getTokenExpiry(),
        userAgent: userAgent?.substring(0, 500), // Truncate long user agents
        ipAddress,
      },
    });

    // Generate tokens
    const token = JwtService.generateAccessToken(user, session.id);
    const refreshToken = JwtService.generateRefreshToken(user.id, session.id);

    // Update session with actual token
    await prisma.session.update({
      where: { id: session.id },
      data: { token },
    });

    return {
      token,
      refreshToken,
      sessionId: session.id,
    };
  }

  /**
   * Validate session and return user data
   */
  static async validateSession(token: string): Promise<SessionData | null> {
    try {
      // Verify JWT token
      const payload = JwtService.verifyAccessToken(token);

      // Check if session exists in database
      const session = await prisma.session.findFirst({
        where: {
          id: payload.sessionId,
          token,
          expiresAt: {
            gte: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              role: true,
              avatar: true,
              status: true,
            },
          },
        },
      });

      if (!session || session.user.status === 'BANNED' || session.user.status === 'INACTIVE') {
        return null;
      }

      return {
        user: session.user,
        sessionId: session.id,
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  /**
   * Refresh session with new token
   */
  static async refreshSession(refreshToken: string): Promise<{ token: string; refreshToken: string } | null> {
    try {
      // Verify refresh token
      const payload = JwtService.verifyRefreshToken(refreshToken);

      // Find session and user
      const session = await prisma.session.findFirst({
        where: {
          id: payload.sessionId,
          userId: payload.userId,
        },
        include: {
          user: true,
        },
      });

      if (!session || !session.user || session.user.status === 'BANNED' || session.user.status === 'INACTIVE') {
        return null;
      }

      // Generate new tokens
      const newToken = JwtService.generateAccessToken(session.user, session.id);
      const newRefreshToken = JwtService.generateRefreshToken(session.user.id, session.id);

      // Update session
      await prisma.session.update({
        where: { id: session.id },
        data: {
          token: newToken,
          expiresAt: JwtService.getTokenExpiry(),
        },
      });

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('Session refresh error:', error);
      return null;
    }
  }

  /**
   * Invalidate session (logout)
   */
  static async invalidateSession(sessionId: string): Promise<void> {
    await prisma.session.delete({
      where: { id: sessionId },
    }).catch(() => {
      // Session might already be deleted, ignore error
    });
  }

  /**
   * Invalidate all user sessions
   */
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Update user's last login time
   */
  static async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Set authentication cookies
   */
  static async setAuthCookies(token: string, refreshToken: string): Promise<void> {
    const cookieStore = await cookies();
    
    const cookieOptions = {
      httpOnly: true,
      secure: COOKIE_SECURE || process.env.NODE_ENV === 'production',
      sameSite: COOKIE_SAME_SITE,
      path: '/',
    } as const;

    // Set access token cookie (shorter expiry)
    cookieStore.set(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    // Set refresh token cookie (longer expiry)
    cookieStore.set(`${COOKIE_NAME}_refresh`, refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });
  }

  /**
   * Get authentication cookies
   */
  static async getAuthCookies(): Promise<{ token: string | null; refreshToken: string | null }> {
    const cookieStore = await cookies();
    
    return {
      token: cookieStore.get(COOKIE_NAME)?.value || null,
      refreshToken: cookieStore.get(`${COOKIE_NAME}_refresh`)?.value || null,
    };
  }

  /**
   * Clear authentication cookies
   */
  static async clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies();
    
    cookieStore.delete(COOKIE_NAME);
    cookieStore.delete(`${COOKIE_NAME}_refresh`);
  }

  /**
   * Get current session from cookies
   */
  static async getCurrentSession(): Promise<SessionData | null> {
    const { token } = await this.getAuthCookies();
    
    if (!token) {
      return null;
    }

    return this.validateSession(token);
  }

  /**
   * Get session stats for user
   */
  static async getUserSessionStats(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    lastLoginAt: Date | null;
  }> {
    const [user, totalSessions, activeSessions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { lastLoginAt: true },
      }),
      prisma.session.count({
        where: { userId },
      }),
      prisma.session.count({
        where: {
          userId,
          expiresAt: { gte: new Date() },
        },
      }),
    ]);

    return {
      totalSessions,
      activeSessions,
      lastLoginAt: user?.lastLoginAt || null,
    };
  }
}