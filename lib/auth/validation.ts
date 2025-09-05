import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

export const phoneSchema = z
  .string()
  .regex(/^(\+966|0)?[5][0-9]{8}$/, 'Invalid Saudi phone number format')
  .transform((val) => {
    // Normalize phone number to +966XXXXXXXXX format
    if (val.startsWith('05')) {
      return `+966${val.substring(1)}`;
    }
    if (val.startsWith('5')) {
      return `+966${val}`;
    }
    if (val.startsWith('0')) {
      return `+966${val.substring(1)}`;
    }
    if (!val.startsWith('+966')) {
      return `+966${val}`;
    }
    return val;
  });

export const otpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'OTP must be 6 digits')
  .length(6);

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .trim();

export const localeSchema = z
  .enum(['ar', 'en'], 'Locale must be ar or en');

// Auth request schemas
export const registerSchema = z.object({
  email: emailSchema,
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  preferredLocale: localeSchema.default('ar'),
});

export const loginSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otpCode: otpCodeSchema,
});

export const resendOtpSchema = z.object({
  email: emailSchema,
  type: z.enum(['EMAIL_VERIFICATION', 'LOGIN'], 'Invalid OTP type'),
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  preferredLocale: localeSchema.optional(),
});

export const verifyPhoneSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  otpCode: otpCodeSchema,
});

export const requestPhoneVerificationSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Admin schemas
export const createAdminSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  phone: phoneSchema.optional(),
  role: z.enum(['ADMIN', 'SUPER_ADMIN'], {
    message: 'Role must be ADMIN or SUPER_ADMIN',
  }).default('ADMIN'),
});

export const updateUserStatusSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED', 'PENDING_VERIFICATION'], {
    message: 'Invalid user status',
  }),
  reason: z.string().max(500, 'Reason must not exceed 500 characters').optional(),
});

export const adminSearchUsersSchema = z.object({
  search: z.string().min(1).optional(),
  role: z.enum(['BUYER', 'SELLER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED', 'PENDING_VERIFICATION']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(20),
});

// Response types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
export type RequestPhoneVerificationInput = z.infer<typeof requestPhoneVerificationSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type AdminSearchUsersInput = z.infer<typeof adminSearchUsersSchema>;