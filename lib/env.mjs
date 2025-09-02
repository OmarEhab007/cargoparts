import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().url(),
    
    // Environment
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    
    // Authentication
    JWT_SECRET: z.string().min(32),
    OTP_SECRET: z.string().min(16).optional(),
    SESSION_COOKIE_NAME: z.string().default("cargoparts-session"),
    AUTH_COOKIE_SECURE: z
      .string()
      .transform((val) => val === "true")
      .default("false"),
    AUTH_COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
    
    // Email
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().transform(Number).optional(),
    SMTP_USER: z.string().email().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
    
    // Storage
    STORAGE_TYPE: z.enum(["supabase", "s3"]).default("supabase"),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_KEY: z.string().optional(),
    STORAGE_BUCKET: z.string().default("cargoparts-images"),
    
    // AWS S3
    AWS_REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    
    // Payment Gateway - Tap
    TAP_API_KEY: z.string().optional(),
    TAP_SECRET_KEY: z.string().optional(),
    TAP_WEBHOOK_SECRET: z.string().optional(),
    TAP_SANDBOX_MODE: z
      .string()
      .transform((val) => val === "true")
      .default("true"),
    
    // Payment Gateway - HyperPay
    HYPERPAY_ENTITY_ID: z.string().optional(),
    HYPERPAY_ACCESS_TOKEN: z.string().optional(),
    HYPERPAY_WEBHOOK_SECRET: z.string().optional(),
    HYPERPAY_SANDBOX_MODE: z
      .string()
      .transform((val) => val === "true")
      .default("true"),
    
    // Rate Limiting
    RATE_LIMIT_OTP_PER_HOUR: z.string().transform(Number).default("5"),
    RATE_LIMIT_LOGIN_PER_HOUR: z.string().transform(Number).default("10"),
    RATE_LIMIT_SEARCH_PER_MINUTE: z.string().transform(Number).default("30"),
    
    // VIN Decode
    VIN_DECODE_API_KEY: z.string().optional(),
    VIN_DECODE_API_URL: z.string().url().default("https://vpic.nhtsa.dot.gov/api/"),
  },
  
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["ar", "en"]).default("ar"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  },
  
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    OTP_SECRET: process.env.OTP_SECRET,
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
    AUTH_COOKIE_SECURE: process.env.AUTH_COOKIE_SECURE,
    AUTH_COOKIE_SAME_SITE: process.env.AUTH_COOKIE_SAME_SITE,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    STORAGE_TYPE: process.env.STORAGE_TYPE,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET: process.env.S3_BUCKET,
    TAP_API_KEY: process.env.TAP_API_KEY,
    TAP_SECRET_KEY: process.env.TAP_SECRET_KEY,
    TAP_WEBHOOK_SECRET: process.env.TAP_WEBHOOK_SECRET,
    TAP_SANDBOX_MODE: process.env.TAP_SANDBOX_MODE,
    HYPERPAY_ENTITY_ID: process.env.HYPERPAY_ENTITY_ID,
    HYPERPAY_ACCESS_TOKEN: process.env.HYPERPAY_ACCESS_TOKEN,
    HYPERPAY_WEBHOOK_SECRET: process.env.HYPERPAY_WEBHOOK_SECRET,
    HYPERPAY_SANDBOX_MODE: process.env.HYPERPAY_SANDBOX_MODE,
    RATE_LIMIT_OTP_PER_HOUR: process.env.RATE_LIMIT_OTP_PER_HOUR,
    RATE_LIMIT_LOGIN_PER_HOUR: process.env.RATE_LIMIT_LOGIN_PER_HOUR,
    RATE_LIMIT_SEARCH_PER_MINUTE: process.env.RATE_LIMIT_SEARCH_PER_MINUTE,
    VIN_DECODE_API_KEY: process.env.VIN_DECODE_API_KEY,
    VIN_DECODE_API_URL: process.env.VIN_DECODE_API_URL,
    
    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  },
  
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});