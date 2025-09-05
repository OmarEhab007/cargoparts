import { prisma } from '@/lib/db/prisma';
import { UserService } from './user-service';
import { EmailService } from '@/lib/communication/email-service';
import type { Role } from '@prisma/client';
import { z } from 'zod';

export interface CreateAdminInput {
  email: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  sendWelcomeEmail?: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  createdAt: Date;
  emailVerified?: Date | null;
  tempPassword?: string; // Only included when creating new admin
}

const emailSchema = z.string().email();
const phoneSchema = z.string().regex(/^(\+966|0)?[5][0-9]{8}$/, 'Invalid Saudi phone number');

export class AdminService {
  /**
   * Create admin user
   */
  static async createAdmin(input: CreateAdminInput): Promise<AdminUser> {
    // Validate input
    emailSchema.parse(input.email);
    
    if (input.phone) {
      phoneSchema.parse(input.phone);
    }

    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    if (input.phone) {
      const existingPhoneUser = await UserService.getUserByPhone(input.phone);
      if (existingPhoneUser) {
        throw new Error('User with this phone number already exists');
      }
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        phone: input.phone,
        role: input.role,
        status: 'ACTIVE',
        emailVerified: new Date(), // Admin users are pre-verified
        preferredLocale: 'ar',
      },
    });

    // Send welcome email if requested
    if (input.sendWelcomeEmail) {
      try {
        await EmailService.sendAdminWelcomeEmail(admin.email, admin.name, admin.preferredLocale || 'ar');
      } catch (emailError) {
        console.error('Failed to send admin welcome email:', emailError);
      }
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      phone: admin.phone || undefined,
      role: admin.role,
      createdAt: admin.createdAt,
      emailVerified: admin.emailVerified,
    };
  }

  /**
   * Promote existing user to admin
   */
  static async promoteUserToAdmin(userId: string, role: 'ADMIN' | 'SUPER_ADMIN'): Promise<AdminUser> {
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      throw new Error('User is already an admin');
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role,
        status: 'ACTIVE', // Ensure admin is active
      },
    });

    // Send promotion notification
    try {
      await EmailService.sendAdminPromotionEmail(
        updatedUser.email, 
        updatedUser.name || 'Admin', 
        role,
        updatedUser.preferredLocale || 'ar'
      );
    } catch (emailError) {
      console.error('Failed to send admin promotion email:', emailError);
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone || undefined,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      emailVerified: updatedUser.emailVerified,
    };
  }

  /**
   * Get all admin users
   */
  static async getAdminUsers(): Promise<AdminUser[]> {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return admins.map(admin => ({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      phone: admin.phone || undefined,
      role: admin.role,
      createdAt: admin.createdAt,
      emailVerified: admin.emailVerified,
    }));
  }

  /**
   * Check if any super admin exists
   */
  static async hasSuperAdmin(): Promise<boolean> {
    const count = await prisma.user.count({
      where: {
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });

    return count > 0;
  }

  /**
   * Create default super admin if none exists
   */
  static async ensureSuperAdmin(): Promise<AdminUser | null> {
    const hasSuperAdmin = await this.hasSuperAdmin();
    
    if (hasSuperAdmin) {
      return null; // Super admin already exists
    }

    // Create default super admin
    const defaultAdmin = await this.createAdmin({
      email: 'admin@cargoparts.sa',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      sendWelcomeEmail: false,
    });

    console.log('✅ Default super admin created:', {
      email: defaultAdmin.email,
      id: defaultAdmin.id,
    });

    return defaultAdmin;
  }

  /**
   * Remove admin privileges (demote to buyer)
   */
  static async demoteAdmin(userId: string, performedBy: string): Promise<void> {
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('User is not an admin');
    }

    // Can't demote yourself
    if (userId === performedBy) {
      throw new Error('Cannot demote yourself');
    }

    // Only super admins can demote other admins
    const performer = await UserService.getUserById(performedBy);
    if (!performer || performer.role !== 'SUPER_ADMIN') {
      throw new Error('Only super admins can demote other admins');
    }

    // Update user role to buyer
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'BUYER' },
    });

    // Send demotion notification
    try {
      await EmailService.sendAdminDemotionEmail(
        user.email,
        user.name || 'User',
        user.preferredLocale || 'ar'
      );
    } catch (emailError) {
      console.error('Failed to send admin demotion email:', emailError);
    }

    console.log(`Admin ${user.email} has been demoted by ${performer.email}`);
  }

  /**
   * Validate admin permissions for action
   */
  static async validateAdminAction(
    adminId: string, 
    requiredRole: 'ADMIN' | 'SUPER_ADMIN' = 'ADMIN'
  ): Promise<{ valid: boolean; admin?: AdminUser; error?: string }> {
    try {
      const admin = await UserService.getUserById(adminId);
      
      if (!admin) {
        return { valid: false, error: 'Admin user not found' };
      }

      if (!['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
        return { valid: false, error: 'User is not an admin' };
      }

      if (requiredRole === 'SUPER_ADMIN' && admin.role !== 'SUPER_ADMIN') {
        return { valid: false, error: 'Super admin privileges required' };
      }

      if (admin.status !== 'ACTIVE') {
        return { valid: false, error: 'Admin account is not active' };
      }

      return {
        valid: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          phone: admin.phone || undefined,
          role: admin.role,
          createdAt: admin.createdAt,
          emailVerified: admin.emailVerified,
        },
      };
    } catch (error) {
      return { valid: false, error: 'Failed to validate admin permissions' };
    }
  }
}