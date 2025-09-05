import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '@/lib/db/prisma';
import { SessionService } from '@/lib/auth/session';
import { JwtService } from '@/lib/auth/jwt';
import { Role, UserStatus, SellerStatus } from '@prisma/client';
import { NextRequest } from 'next/server';

// Import route handlers
import { GET as getDashboard } from '@/app/api/sellers/[id]/dashboard/route';
import { GET as getInventory } from '@/app/api/sellers/[id]/inventory/route';
import { GET as getOrders, PATCH as updateOrder } from '@/app/api/sellers/[id]/orders/route';
import { GET as getSettings, PUT as updateSettings } from '@/app/api/sellers/[id]/settings/route';
import { GET as getAnalytics } from '@/app/api/sellers/[id]/analytics/route';

describe('Seller API Endpoints', () => {
  let testSeller: any;
  let testUser: any;
  let testAdmin: any;
  let sellerToken: string;
  let adminToken: string;
  let testListing: any;
  let testOrder: any;

  beforeAll(async () => {
    // Clean up test data
    await prisma.$transaction([
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.listing.deleteMany(),
      prisma.sellerAnalytics.deleteMany(),
      prisma.sellerSettings.deleteMany(),
      prisma.seller.deleteMany(),
      prisma.session.deleteMany(),
      prisma.user.deleteMany({ where: { email: { contains: 'test-' } } }),
    ]);

    // Create test users
    testUser = await prisma.user.create({
      data: {
        email: 'test-seller@example.com',
        name: 'Test Seller',
        phone: '+966501234567',
        role: Role.SELLER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    testAdmin = await prisma.user.create({
      data: {
        email: 'test-admin@example.com',
        name: 'Test Admin',
        phone: '+966501234568',
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    // Create test seller
    testSeller = await prisma.seller.create({
      data: {
        userId: testUser.id,
        businessName: 'Test Auto Parts',
        storeName: 'Test Store',
        storeNameAr: 'متجر تجريبي',
        slug: 'test-store',
        description: 'Test store description',
        descriptionAr: 'وصف المتجر التجريبي',
        verified: true,
        status: SellerStatus.ACTIVE,
        city: 'Riyadh',
        district: 'Test District',
        phone: '+966501234567',
        whatsapp: '+966501234567',
      },
    });

    // Create test category
    const category = await prisma.category.create({
      data: {
        nameAr: 'قطع غيار',
        nameEn: 'Spare Parts',
        slug: 'spare-parts',
        isActive: true,
      },
    });

    // Create test listing
    testListing = await prisma.listing.create({
      data: {
        sellerId: testSeller.id,
        categoryId: category.id,
        titleAr: 'قطعة غيار تجريبية',
        titleEn: 'Test Spare Part',
        descriptionAr: 'وصف قطعة الغيار',
        descriptionEn: 'Spare part description',
        sku: 'TEST-001',
        priceSar: 10000, // 100 SAR
        quantity: 50,
        condition: 'NEW',
        status: 'PUBLISHED',
        isActive: true,
        make: 'Toyota',
        model: 'Camry',
        fromYear: 2015,
        toYear: 2023,
        city: 'Riyadh',
      },
    });

    // Create test order
    const buyer = await prisma.user.create({
      data: {
        email: 'test-buyer@example.com',
        name: 'Test Buyer',
        phone: '+966501234569',
        role: Role.BUYER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
    });

    testOrder = await prisma.order.create({
      data: {
        userId: buyer.id,
        orderNumber: 'ORD-TEST-001',
        status: 'PENDING',
        shippingStatus: 'PENDING',
        totalAmount: 10000,
        subtotal: 10000,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        shippingAddress: {
          name: 'Test Buyer',
          phone: '+966501234569',
          street: 'Test Street',
          city: 'Riyadh',
          district: 'Test District',
        },
        items: {
          create: {
            listingId: testListing.id,
            quantity: 1,
            pricePerUnit: 10000,
            subtotal: 10000,
            sellerEarnings: 9000,
          },
        },
      },
    });

    // Create analytics data
    await prisma.sellerAnalytics.create({
      data: {
        sellerId: testSeller.id,
        date: new Date(),
        views: 100,
        inquiries: 10,
        orders: 5,
        revenue: 50000,
        newListings: 3,
      },
    });

    // Create sessions and tokens
    const sellerSession = await SessionService.createSession(testUser);
    sellerToken = sellerSession.token;

    const adminSession = await SessionService.createSession(testAdmin);
    adminToken = adminSession.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.$transaction([
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.listing.deleteMany(),
      prisma.sellerAnalytics.deleteMany(),
      prisma.sellerSettings.deleteMany(),
      prisma.seller.deleteMany(),
      prisma.session.deleteMany(),
      prisma.user.deleteMany({ where: { email: { contains: 'test-' } } }),
      prisma.category.deleteMany({ where: { slug: 'spare-parts' } }),
    ]);

    await prisma.$disconnect();
  });

  describe('GET /api/sellers/[id]/dashboard', () => {
    it('should fetch dashboard data for authenticated seller', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/dashboard?period=7d`,
        {
          headers: {
            cookie: `session=${sellerToken}`,
          },
        }
      );

      const response = await getDashboard(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('overview');
      expect(data.data).toHaveProperty('recentOrders');
      expect(data.data).toHaveProperty('topProducts');
    });

    it('should allow admin to access any seller dashboard', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/dashboard`,
        {
          headers: {
            cookie: `session=${adminToken}`,
          },
        }
      );

      const response = await getDashboard(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject unauthorized access', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/dashboard`
      );

      const response = await getDashboard(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/sellers/[id]/inventory', () => {
    it('should fetch inventory with pagination', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/inventory?page=1&limit=10`,
        {
          headers: {
            cookie: `session=${sellerToken}`,
          },
        }
      );

      const response = await getInventory(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('items');
      expect(data.data).toHaveProperty('metrics');
      expect(data.meta).toHaveProperty('page');
      expect(data.meta).toHaveProperty('total');
    });

    it('should filter inventory by status', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/inventory?status=PUBLISHED`,
        {
          headers: {
            cookie: `session=${sellerToken}`,
          },
        }
      );

      const response = await getInventory(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.items.every((item: any) => item.status === 'PUBLISHED')).toBe(true);
    });

    it('should validate query parameters', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/inventory?page=invalid`,
        {
          headers: {
            cookie: `session=${sellerToken}`,
          },
        }
      );

      const response = await getInventory(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/sellers/[id]/orders', () => {
    it('should fetch seller orders', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/orders`,
        {
          headers: {
            cookie: `session=${sellerToken}`,
          },
        }
      );

      const response = await getOrders(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('orders');
      expect(data.data).toHaveProperty('stats');
      expect(data.data.orders).toBeInstanceOf(Array);
    });

    it('should filter orders by status', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/orders?status=PENDING`,
        {
          headers: {
            cookie: `session=${sellerToken}`,
          },
        }
      );

      const response = await getOrders(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.orders.every((order: any) => order.status === 'PENDING')).toBe(true);
    });
  });

  describe('PATCH /api/sellers/[id]/orders/[orderId]', () => {
    it('should update order status', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/orders/${testOrder.id}`,
        {
          method: 'PATCH',
          headers: {
            cookie: `session=${sellerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'PROCESSING',
            shippingStatus: 'PREPARING',
            trackingNumber: 'TRACK-123456',
          }),
        }
      );

      const response = await updateOrder(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('PROCESSING');
      expect(data.data.trackingNumber).toBe('TRACK-123456');
    });

    it('should reject invalid status transitions', async () => {
      // First set order to CANCELLED
      await prisma.order.update({
        where: { id: testOrder.id },
        data: { status: 'CANCELLED' },
      });

      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/orders/${testOrder.id}`,
        {
          method: 'PATCH',
          headers: {
            cookie: `session=${sellerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'DELIVERED',
          }),
        }
      );

      const response = await updateOrder(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_STATUS_TRANSITION');
    });
  });

  describe('GET /api/sellers/[id]/settings', () => {
    it('should fetch seller settings', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/settings`,
        {
          headers: {
            cookie: `session=${sellerToken}`,
          },
        }
      );

      const response = await getSettings(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });
  });

  describe('PUT /api/sellers/[id]/settings', () => {
    it('should update seller settings', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/settings`,
        {
          method: 'PUT',
          headers: {
            cookie: `session=${sellerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storeName: 'Updated Store Name',
            primaryColor: '#FF0000',
            showPrices: true,
            allowNegotiation: true,
            minimumOrderValue: 50,
          }),
        }
      );

      const response = await updateSettings(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.storeName).toBe('Updated Store Name');
      expect(data.data.primaryColor).toBe('#FF0000');
    });

    it('should validate settings data', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/settings`,
        {
          method: 'PUT',
          headers: {
            cookie: `session=${sellerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            primaryColor: 'invalid-color',
            depositPercentage: 150, // Invalid: > 100
          }),
        }
      );

      const response = await updateSettings(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/sellers/[id]/analytics', () => {
    it('should fetch analytics data', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/analytics?period=30d`,
        {
          headers: {
            cookie: `session=${sellerToken}`,
          },
        }
      );

      const response = await getAnalytics(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('overview');
      expect(data.data).toHaveProperty('growth');
      expect(data.data).toHaveProperty('chartData');
      expect(data.data).toHaveProperty('topListings');
    });

    it('should support custom date ranges', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            cookie: `session=${sellerToken}`,
          },
        }
      );

      const response = await getAnalytics(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.period.startDate).toBeDefined();
      expect(data.data.period.endDate).toBeDefined();
    });
  });

  describe('Authentication & Authorization', () => {
    it('should prevent seller from accessing another sellers data', async () => {
      // Create another seller
      const otherUser = await prisma.user.create({
        data: {
          email: 'test-other-seller@example.com',
          name: 'Other Seller',
          phone: '+966501234570',
          role: Role.SELLER,
          status: UserStatus.ACTIVE,
        },
      });

      const otherSeller = await prisma.seller.create({
        data: {
          userId: otherUser.id,
          businessName: 'Other Business',
          storeName: 'Other Store',
          slug: 'other-store',
        },
      });

      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${otherSeller.id}/dashboard`,
        {
          headers: {
            cookie: `session=${sellerToken}`,
          },
        }
      );

      const response = await getDashboard(request, { params: Promise.resolve({ id: otherSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('UNAUTHORIZED');

      // Clean up
      await prisma.seller.delete({ where: { id: otherSeller.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it('should handle expired sessions', async () => {
      // Create expired session
      const expiredSession = await prisma.session.create({
        data: {
          userId: testUser.id,
          token: 'expired-token',
          expiresAt: new Date(Date.now() - 1000), // Already expired
        },
      });

      const request = new NextRequest(
        `http://localhost:3000/api/sellers/${testSeller.id}/dashboard`,
        {
          headers: {
            cookie: `session=${expiredSession.token}`,
          },
        }
      );

      const response = await getDashboard(request, { params: Promise.resolve({ id: testSeller.id }) });
      const data = await response.json();

      expect(response.status).toBe(403);

      // Clean up
      await prisma.session.delete({ where: { id: expiredSession.id } });
    });
  });
});