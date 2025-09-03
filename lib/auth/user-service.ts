import { prisma } from '@/lib/db/prisma';
import { OtpService } from './otp';
import { SessionService } from './session';
import type { User, Role, UserStatus } from '@prisma/client';
import { z } from 'zod';

export interface CreateUserInput {
  email: string;
  name?: string;
  phone?: string;
  role?: Role;
  preferredLocale?: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  avatar?: string;
  preferredLocale?: string;
}

export interface LoginInput {
  email: string;
  useOtp?: boolean;
}

export interface VerifyOtpLoginInput {
  email: string;
  otpCode: string;
}

const emailSchema = z.string().email();
const phoneSchema = z.string().regex(/^(\+966|0)?[5][0-9]{8}$/, 'Invalid Saudi phone number');

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(input: CreateUserInput): Promise<User> {
    // Validate input
    emailSchema.parse(input.email);
    
    if (input.phone) {
      phoneSchema.parse(input.phone);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          ...(input.phone ? [{ phone: input.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw new Error('User with this email already exists');
      }
      if (existingUser.phone === input.phone) {
        throw new Error('User with this phone number already exists');
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        phone: input.phone,
        role: input.role || 'BUYER',
        preferredLocale: input.preferredLocale || 'ar',
        status: 'PENDING_VERIFICATION',
      },
    });

    // Generate email verification OTP
    await OtpService.generateOtp(user.id, 'EMAIL_VERIFICATION');

    return user;
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Get user by phone
   */
  static async getUserByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phone },
    });
  }

  /**
   * Update user
   */
  static async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    if (input.phone) {
      phoneSchema.parse(input.phone);
      
      // Check if phone is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: input.phone,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new Error('Phone number is already taken');
      }
    }

    return prisma.user.update({
      where: { id },
      data: {
        ...input,
        ...(input.phone && { phoneVerified: null }), // Reset phone verification if changed
      },
    });
  }

  /**
   * Delete user (soft delete by setting status to INACTIVE)
   */
  static async deleteUser(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    // Invalidate all sessions
    await SessionService.invalidateAllUserSessions(id);
  }

  /**
   * Update user status
   */
  static async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });

    // If user is banned or deactivated, invalidate all sessions
    if (status === 'BANNED' || status === 'INACTIVE') {
      await SessionService.invalidateAllUserSessions(id);
    }

    return user;
  }

  /**
   * Verify email with OTP
   */
  static async verifyEmail(userId: string, otpCode: string): Promise<boolean> {
    const verification = await OtpService.verifyOtp(userId, otpCode, 'EMAIL_VERIFICATION');
    
    if (!verification.success) {
      return false;
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
        status: 'ACTIVE',
      },
    });

    return true;
  }

  /**
   * Verify phone with OTP
   */
  static async verifyPhone(userId: string, otpCode: string): Promise<boolean> {
    const verification = await OtpService.verifyOtp(userId, otpCode, 'PHONE_VERIFICATION');
    
    if (!verification.success) {
      return false;
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerified: new Date(),
      },
    });

    return true;
  }

  /**
   * Initiate login process
   */
  static async initiateLogin(input: LoginInput): Promise<{
    requiresOtp: boolean;
    message: string;
    userId?: string;
  }> {
    emailSchema.parse(input.email);

    // Find user
    const user = await this.getUserByEmail(input.email);
    
    if (!user) {
      // For security, don't reveal if email exists
      return {
        requiresOtp: true,
        message: 'If the email exists, an OTP has been sent',
      };
    }

    if (user.status === 'BANNED') {
      throw new Error('Account has been banned');
    }

    if (user.status === 'INACTIVE') {
      throw new Error('Account is inactive');
    }

    // Generate login OTP
    await OtpService.generateOtp(user.id, 'LOGIN');

    return {
      requiresOtp: true,
      message: 'OTP has been sent to your email',
      userId: user.id,
    };
  }

  /**
   * Complete login with OTP
   */
  static async completeOtpLogin(
    input: VerifyOtpLoginInput,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{
    user: User;
    token: string;
    refreshToken: string;
    sessionId: string;
  }> {
    emailSchema.parse(input.email);

    // Find user
    const user = await this.getUserByEmail(input.email);
    
    if (!user) {
      throw new Error('Invalid email or OTP');
    }

    // Verify OTP
    const verification = await OtpService.verifyOtp(user.id, input.otpCode, 'LOGIN');
    
    if (!verification.success) {
      throw new Error(verification.error || 'Invalid OTP');
    }

    // Create session
    const { token, refreshToken, sessionId } = await SessionService.createSession(
      user,
      userAgent,
      ipAddress
    );

    // Update last login time
    await SessionService.updateLastLogin(user.id);

    // Clear all OTPs for this user
    await OtpService.invalidateUserOtps(user.id, 'LOGIN');

    return {
      user,
      token,
      refreshToken,
      sessionId,
    };
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(userId: string): Promise<{ expiresAt: Date }> {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    const { expiresAt } = await OtpService.generateOtp(userId, 'EMAIL_VERIFICATION');
    
    return { expiresAt };
  }

  /**
   * Request phone verification
   */
  static async requestPhoneVerification(userId: string): Promise<{ expiresAt: Date }> {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.phone) {
      throw new Error('No phone number associated with account');
    }

    if (user.phoneVerified) {
      throw new Error('Phone is already verified');
    }

    const { expiresAt } = await OtpService.generateOtp(userId, 'PHONE_VERIFICATION');
    
    return { expiresAt };
  }

  /**
   * Get user profile with additional data
   */
  static async getUserProfile(id: string): Promise<{
    user: User;
    seller?: {
      id: string;
      businessName: string;
      _count: {
        listings: number;
      };
    };
    stats: {
      totalOrders: number;
      totalSpent: number;
      joinedDate: Date;
    };
  } | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        seller: {
          include: {
            _count: {
              select: {
                listings: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Get user statistics
    const [totalOrders, orderStats] = await Promise.all([
      prisma.order.count({
        where: { buyerId: id },
      }),
      prisma.order.aggregate({
        where: { 
          buyerId: id,
          status: { in: ['DELIVERED'] },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      user,
      seller: user.seller,
      stats: {
        totalOrders,
        totalSpent: orderStats._sum?.total || 0,
        joinedDate: user.createdAt,
      },
    };
  }

  /**
   * Search users (admin function)
   */
  static async searchUsers(query: {
    search?: string;
    role?: Role;
    status?: UserStatus;
    page?: number;
    limit?: number;
  }): Promise<{
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { search, role, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user statistics for admin dashboard
   */
  static async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    usersByRole: Record<Role, number>;
    usersByStatus: Record<UserStatus, number>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      usersByRole,
      usersByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      prisma.user.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Convert arrays to objects
    const roleStats = usersByRole.reduce(
      (acc, item) => ({
        ...acc,
        [item.role]: item._count,
      }),
      {} as Record<Role, number>
    );

    const statusStats = usersByStatus.reduce(
      (acc, item) => ({
        ...acc,
        [item.status]: item._count,
      }),
      {} as Record<UserStatus, number>
    );

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      usersByRole: roleStats,
      usersByStatus: statusStats,
    };
  }
}