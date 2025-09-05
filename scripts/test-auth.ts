#!/usr/bin/env npx tsx

/**
 * Test script for authentication system
 * 
 * Usage:
 *   npm run test-auth
 *   npx tsx scripts/test-auth.ts
 */

import { UserService } from '@/lib/auth/user-service';
import { AdminService } from '@/lib/auth/admin-service';
import { SessionService } from '@/lib/auth/session';
import { OtpService } from '@/lib/auth/otp';
import { emailService } from '@/lib/communication/email-service';
import { prisma } from '@/lib/db/prisma';

async function testEmailService() {
  console.log('🔍 Testing Email Service...');
  
  const healthCheck = await emailService.healthCheck();
  console.log('Email Service Health:', healthCheck.status);
  
  if (healthCheck.status === 'unhealthy') {
    console.log('⚠️  Email service is not configured properly');
    console.log('Details:', healthCheck.details);
  } else {
    console.log('✅ Email service is configured correctly');
  }
}

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    console.log('✅ Database connected successfully');
    console.log(`Found ${userCount} users in database`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function testUserOperations() {
  console.log('🔍 Testing User Operations...');
  
  const testEmail = 'test@example.com';
  
  try {
    // Clean up any existing test user
    const existingUser = await UserService.getUserByEmail(testEmail);
    if (existingUser) {
      await prisma.user.delete({ where: { id: existingUser.id } });
      console.log('🧹 Cleaned up existing test user');
    }
    
    // Create test user
    const user = await UserService.createUser({
      email: testEmail,
      name: 'Test User',
      preferredLocale: 'ar',
    });
    
    console.log('✅ User created successfully:', {
      id: user.id,
      email: user.email,
      status: user.status,
    });
    
    // Test user retrieval
    const retrievedUser = await UserService.getUserByEmail(testEmail);
    if (retrievedUser && retrievedUser.id === user.id) {
      console.log('✅ User retrieval works correctly');
    } else {
      throw new Error('User retrieval failed');
    }
    
    // Test user profile
    const userProfile = await UserService.getUserProfile(user.id);
    if (userProfile) {
      console.log('✅ User profile retrieval works correctly');
    } else {
      throw new Error('User profile retrieval failed');
    }
    
    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
    console.log('🧹 Test user cleaned up');
    
  } catch (error) {
    console.error('❌ User operations test failed:', error);
    throw error;
  }
}

async function testOtpOperations() {
  console.log('🔍 Testing OTP Operations...');
  
  const testEmail = 'otp-test@example.com';
  
  try {
    // Create test user for OTP testing
    const user = await UserService.createUser({
      email: testEmail,
      name: 'OTP Test User',
      preferredLocale: 'ar',
    });
    
    // Test OTP generation
    const otpResult = await OtpService.generateOtp(user.id, 'EMAIL_VERIFICATION');
    console.log('✅ OTP generated successfully');
    
    // Test OTP verification with correct code
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    if (otpRecord) {
      const verification = await OtpService.verifyOtp(user.id, otpRecord.code, 'EMAIL_VERIFICATION');
      if (verification.success) {
        console.log('✅ OTP verification works correctly');
      } else {
        throw new Error('OTP verification failed');
      }
    } else {
      throw new Error('OTP record not found');
    }
    
    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
    console.log('🧹 OTP test user cleaned up');
    
  } catch (error) {
    console.error('❌ OTP operations test failed:', error);
    throw error;
  }
}

async function testSessionOperations() {
  console.log('🔍 Testing Session Operations...');
  
  const testEmail = 'session-test@example.com';
  
  try {
    // Create test user for session testing
    const user = await UserService.createUser({
      email: testEmail,
      name: 'Session Test User',
      preferredLocale: 'ar',
    });
    
    // Update user to active status (required for session creation)
    const activeUser = await prisma.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE', emailVerified: new Date() },
    });
    
    // Test session creation
    const { token, refreshToken, sessionId } = await SessionService.createSession(
      activeUser,
      'test-user-agent',
      '127.0.0.1'
    );
    
    console.log('✅ Session created successfully');
    
    // Test session validation
    const sessionData = await SessionService.validateSession(token);
    if (sessionData && sessionData.user.id === user.id) {
      console.log('✅ Session validation works correctly');
    } else {
      throw new Error('Session validation failed');
    }
    
    // Test session refresh
    const refreshResult = await SessionService.refreshSession(refreshToken);
    if (refreshResult) {
      console.log('✅ Session refresh works correctly');
    } else {
      throw new Error('Session refresh failed');
    }
    
    // Test session cleanup
    await SessionService.invalidateSession(sessionId);
    console.log('✅ Session cleanup works correctly');
    
    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
    console.log('🧹 Session test user cleaned up');
    
  } catch (error) {
    console.error('❌ Session operations test failed:', error);
    throw error;
  }
}

async function testAdminOperations() {
  console.log('🔍 Testing Admin Operations...');
  
  try {
    // Test super admin check
    const hasSuperAdmin = await AdminService.hasSuperAdmin();
    console.log(`Super admin exists: ${hasSuperAdmin}`);
    
    // Test admin user stats
    const userStats = await UserService.getUserStats();
    console.log('✅ User statistics retrieved:', {
      total: userStats.totalUsers,
      active: userStats.activeUsers,
      newToday: userStats.newUsersToday,
    });
    
    // Test admin creation (if no super admin exists)
    if (!hasSuperAdmin) {
      const admin = await AdminService.ensureSuperAdmin();
      if (admin) {
        console.log('✅ Default super admin created successfully');
      } else {
        console.log('ℹ️  Super admin already exists');
      }
    }
    
  } catch (error) {
    console.error('❌ Admin operations test failed:', error);
    throw error;
  }
}

async function runComprehensiveTest() {
  console.log('🚀 CargoTime Authentication System Test');
  console.log('=====================================\n');
  
  const startTime = Date.now();
  let testsRun = 0;
  let testsPassed = 0;
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Email Service', fn: testEmailService },
    { name: 'User Operations', fn: testUserOperations },
    { name: 'OTP Operations', fn: testOtpOperations },
    { name: 'Session Operations', fn: testSessionOperations },
    { name: 'Admin Operations', fn: testAdminOperations },
  ];
  
  for (const test of tests) {
    testsRun++;
    try {
      console.log(`\n${testsRun}. ${test.name}`);
      console.log('─'.repeat(40));
      await test.fn();
      testsPassed++;
      console.log(`✅ ${test.name} completed successfully\n`);
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error instanceof Error ? error.message : error);
    }
  }
  
  const duration = Date.now() - startTime;
  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`Tests Run: ${testsRun}`);
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsRun - testsPassed}`);
  console.log(`Duration: ${duration}ms`);
  
  if (testsPassed === testsRun) {
    console.log('\n🎉 All tests passed! Authentication system is working correctly.');
    
    console.log('\n📝 Next Steps:');
    console.log('1. Set up your environment variables (.env)');
    console.log('2. Configure SMTP for email sending');
    console.log('3. Run database migrations: npm run db:migrate');
    console.log('4. Create admin users: npm run create-admin');
    console.log('5. Start the development server: npm run dev');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

async function main() {
  try {
    await runComprehensiveTest();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { main as testAuthSystem };