import { PrismaClient, Condition, Role } from '@prisma/client';

const prisma = new PrismaClient();

const carParts = [
  {
    titleAr: 'محرك كامري 2018 نظيف',
    titleEn: 'Clean 2018 Camry Engine',
    description: 'محرك تويوتا كامري 2018 بحالة ممتازة، قليل الاستخدام',
    priceSar: 8500,
    condition: Condition.USED,
    make: 'Toyota',
    model: 'Camry',
    fromYear: 2016,
    toYear: 2020,
    city: 'الرياض',
  },
  {
    titleAr: 'جير أكورد 2020',
    titleEn: 'Accord 2020 Transmission',
    description: 'ناقل حركة هوندا أكورد 2020 أوتوماتيك',
    priceSar: 5500,
    condition: Condition.USED,
    make: 'Honda',
    model: 'Accord',
    fromYear: 2018,
    toYear: 2022,
    city: 'جدة',
  },
  {
    titleAr: 'مكينة ألتيما 2019',
    titleEn: 'Altima 2019 Engine',
    description: 'محرك نيسان ألتيما 2019 4 سلندر',
    priceSar: 6500,
    condition: Condition.REFURBISHED,
    make: 'Nissan',
    model: 'Altima',
    fromYear: 2019,
    toYear: 2021,
    city: 'الدمام',
  },
  {
    titleAr: 'صدام أمامي كورولا 2021',
    titleEn: 'Corolla 2021 Front Bumper',
    description: 'صدام أمامي أصلي تويوتا كورولا',
    priceSar: 1200,
    condition: Condition.NEW,
    make: 'Toyota',
    model: 'Corolla',
    fromYear: 2020,
    toYear: 2023,
    city: 'الرياض',
  },
  {
    titleAr: 'مكيف سوناتا 2018',
    titleEn: 'Sonata 2018 AC Compressor',
    description: 'كمبروسر مكيف هيونداي سوناتا',
    priceSar: 1800,
    condition: Condition.USED,
    make: 'Hyundai',
    model: 'Sonata',
    fromYear: 2015,
    toYear: 2019,
    city: 'مكة',
  },
  {
    titleAr: 'دينمو لكزس ES350',
    titleEn: 'Lexus ES350 Alternator',
    description: 'دينمو لكزس ES350 2017 أصلي',
    priceSar: 2200,
    condition: Condition.REFURBISHED,
    make: 'Lexus',
    model: 'ES350',
    fromYear: 2016,
    toYear: 2018,
    city: 'الرياض',
  },
  {
    titleAr: 'رديتر باترول 2020',
    titleEn: 'Patrol 2020 Radiator',
    description: 'رديتر نيسان باترول V8',
    priceSar: 1500,
    condition: Condition.USED,
    make: 'Nissan',
    model: 'Patrol',
    fromYear: 2018,
    toYear: 2022,
    city: 'الخبر',
  },
  {
    titleAr: 'كمبيوتر محرك مازدا CX-5',
    titleEn: 'Mazda CX-5 ECU',
    description: 'وحدة التحكم بالمحرك مازدا CX-5 2019',
    priceSar: 3500,
    condition: Condition.REFURBISHED,
    make: 'Mazda',
    model: 'CX-5',
    fromYear: 2017,
    toYear: 2021,
    city: 'جدة',
  },
];

async function main() {
  console.log('🌱 Starting seed...');
  
  // Create admin user for authentication testing
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cargoparts.sa' },
    update: {},
    create: {
      id: 'admin-user-1',
      email: 'admin@cargoparts.sa',
      name: 'مدير النظام',
      phone: '+966500000000',
      role: Role.ADMIN,
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  });
  
  // Create buyer users for testing orders
  const buyer1 = await prisma.user.upsert({
    where: { email: 'buyer1@example.com' },
    update: {},
    create: {
      id: 'buyer-1',
      email: 'buyer1@example.com',
      name: 'أحمد محمد',
      phone: '+966501111111',
      role: Role.BUYER,
      status: 'ACTIVE',
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: 'buyer2@example.com' },
    update: {},
    create: {
      id: 'buyer-2',
      email: 'buyer2@example.com',
      name: 'خالد العلي',
      phone: '+966502222222',
      role: Role.BUYER,
      status: 'ACTIVE',
    },
  });
  
  // Create dummy user and seller for POC
  const user = await prisma.user.upsert({
    where: { email: 'seller@cargoparts.sa' },
    update: {},
    create: {
      id: 'dummy-user-1',
      email: 'seller@cargoparts.sa',
      name: 'محل قطع الغيار',
      phone: '+966501234567',
      role: Role.SELLER,
      status: 'ACTIVE',
    },
  });
  
  const seller = await prisma.seller.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      id: 'dummy-seller-1',
      userId: user.id,
      businessName: 'سكراب الرياض المتميز',
      businessNameEn: 'Riyadh Premium Scrapyard',
      city: 'الرياض',
      address: 'طريق الملك فهد، حي العليا، الرياض',
      phone: '+966501234567',
      whatsapp: '+966501234567',
      description: 'متخصصون في قطع غيار السيارات اليابانية والأمريكية',
      descriptionEn: 'Specialists in Japanese and American car parts',
      verified: true,
      rating: 4.5,
      reviewCount: 23,
      totalSales: 156,
      totalRevenue: 95000,
      status: 'APPROVED',
    },
  });
  
  console.log('✅ Created admin user, buyers, seller and enhanced seller profile');
  
  // Delete existing data
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.sellerAnalytics.deleteMany();
  
  // Create listings
  const listings = [];
  for (const part of carParts) {
    const listing = await prisma.listing.create({
      data: {
        ...part,
        sellerId: seller.id,
        isActive: true,
        status: 'PUBLISHED',
        quantity: Math.floor(Math.random() * 10) + 1,
        sku: `CP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        viewCount: Math.floor(Math.random() * 100) + 10,
      },
    });
    listings.push(listing);
  }
  
  // Create sample orders
  const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'];
  const sampleOrders = [];
  
  for (let i = 0; i < 15; i++) {
    const buyerId = Math.random() > 0.5 ? buyer1.id : buyer2.id;
    const buyerName = buyerId === buyer1.id ? buyer1.name : buyer2.name;
    const randomListing = listings[Math.floor(Math.random() * listings.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const unitPrice = randomListing.priceSar;
    const subtotal = unitPrice * quantity;
    const taxAmount = Math.round(subtotal * 0.15); // 15% VAT
    const shippingAmount = subtotal > 500 ? 0 : 25; // Free shipping over 500 SAR
    const total = subtotal + taxAmount + shippingAmount;
    
    const order = await prisma.order.create({
      data: {
        buyerId: buyerId,
        orderNumber: `ORD-${Date.now()}-${String(i + 1).padStart(3, '0')}`,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        subtotal: subtotal,
        taxAmount: taxAmount,
        shippingAmount: shippingAmount,
        total: total,
        createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000), // Random date within last 15 days
        items: {
          create: [
            {
              listingId: randomListing.id,
              quantity: quantity,
              unitPrice: unitPrice,
              totalPrice: unitPrice * quantity,
            }
          ]
        }
      },
      include: {
        items: true
      }
    });
    
    sampleOrders.push(order);
  }
  
  // Create seller analytics data for the last 30 days
  const analyticsData = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    // Generate realistic analytics data
    const baseViews = 15 + Math.floor(Math.random() * 25); // 15-40 views per day
    const baseInquiries = Math.floor(baseViews * (0.1 + Math.random() * 0.1)); // 10-20% inquiry rate
    const baseOrders = Math.floor(baseInquiries * (0.2 + Math.random() * 0.3)); // 20-50% conversion rate
    const avgOrderValue = 800 + Math.random() * 1500; // 800-2300 SAR average
    const revenue = Math.round(baseOrders * avgOrderValue);
    
    // Weekend effect (less activity on Fridays)
    const dayOfWeek = date.getDay();
    const weekendMultiplier = dayOfWeek === 5 ? 0.6 : 1; // Friday is day 5 in Saudi calendar
    
    const analytics = await prisma.sellerAnalytics.create({
      data: {
        sellerId: seller.id,
        date: date,
        views: Math.round(baseViews * weekendMultiplier),
        inquiries: Math.round(baseInquiries * weekendMultiplier),
        orders: Math.round(baseOrders * weekendMultiplier),
        revenue: Math.round(revenue * weekendMultiplier),
        newListings: Math.random() < 0.2 ? Math.floor(Math.random() * 3) + 1 : 0, // 20% chance of new listings
        uniqueCustomers: Math.round(baseOrders * weekendMultiplier * (0.7 + Math.random() * 0.3)), // 70-100% unique customers
        conversionRate: baseOrders > 0 ? Math.round((baseOrders / baseViews) * 100 * 100) / 100 : 0,
        averageOrderValue: Math.round(avgOrderValue),
      }
    });
    
    analyticsData.push(analytics);
  }
  
  console.log(`✅ Created ${carParts.length} listings`);
  console.log(`✅ Created ${sampleOrders.length} sample orders`);
  console.log(`✅ Created ${analyticsData.length} days of analytics data`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });