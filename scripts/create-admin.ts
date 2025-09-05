#!/usr/bin/env npx tsx

/**
 * Script to create admin users for CargoTime marketplace
 * 
 * Usage:
 *   npm run create-admin
 *   npx tsx scripts/create-admin.ts
 *   npx tsx scripts/create-admin.ts --email admin@example.com --name "Admin Name" --role SUPER_ADMIN
 */

import { AdminService } from '@/lib/auth/admin-service';
import { prisma } from '@/lib/db/prisma';

interface AdminData {
  email: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

// Default admin configurations
const DEFAULT_ADMINS: AdminData[] = [
  {
    email: 'admin@cargoparts.sa',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
  },
  {
    email: 'support@cargoparts.sa',
    name: 'Support Admin',
    role: 'ADMIN',
  },
];

async function createAdmin(adminData: AdminData) {
  try {
    console.log(`Creating admin: ${adminData.email}...`);
    
    const admin = await AdminService.createAdmin({
      ...adminData,
      sendWelcomeEmail: false, // Don't send emails in seed script
    });

    console.log('✅ Admin created successfully:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${admin.createdAt.toISOString()}`);
    
    return admin;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️  Admin with email ${adminData.email} already exists, skipping...`);
        return null;
      }
    }
    
    console.error(`❌ Failed to create admin ${adminData.email}:`, error);
    throw error;
  }
}

async function parseCommandLineArgs(): Promise<AdminData | null> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    return null; // Use default admins
  }
  
  const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1];
  const name = args.find(arg => arg.startsWith('--name='))?.split('=')[1];
  const phone = args.find(arg => arg.startsWith('--phone='))?.split('=')[1];
  const role = args.find(arg => arg.startsWith('--role='))?.split('=')[1] as 'ADMIN' | 'SUPER_ADMIN';
  
  if (!email || !name) {
    console.error('❌ Missing required arguments: --email and --name');
    console.log('Usage: npx tsx scripts/create-admin.ts --email=admin@example.com --name="Admin Name" [--phone=+966501234567] [--role=ADMIN]');
    process.exit(1);
  }
  
  return {
    email,
    name,
    phone,
    role: role || 'ADMIN',
  };
}

async function main() {
  console.log('🚀 CargoTime Admin Creation Script');
  console.log('==================================\n');
  
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database\n');
    
    // Parse command line arguments
    const customAdmin = await parseCommandLineArgs();
    
    if (customAdmin) {
      // Create single admin from command line
      await createAdmin(customAdmin);
    } else {
      // Create default admins
      console.log('Creating default admin users...\n');
      
      for (const adminData of DEFAULT_ADMINS) {
        await createAdmin(adminData);
        console.log(''); // Add spacing between admins
      }
    }
    
    console.log('🎉 Admin creation completed successfully!');
    
    // Show login instructions
    console.log('\n📝 To login as admin:');
    console.log('1. Go to /login');
    console.log('2. Enter the admin email');
    console.log('3. Check email for OTP (or check logs for development)');
    console.log('4. Use the OTP to complete login');
    console.log('5. Access admin dashboard at /admin');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
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

export { main as createAdminScript };