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
    },
  });
  
  const seller = await prisma.seller.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      id: 'dummy-seller-1',
      userId: user.id,
      yardName: 'سكراب الرياض المتميز',
      city: 'الرياض',
      verified: true,
    },
  });
  
  console.log('✅ Created dummy user and seller');
  
  // Delete existing listings
  await prisma.listing.deleteMany();
  
  // Create listings
  for (const part of carParts) {
    await prisma.listing.create({
      data: {
        ...part,
        sellerId: seller.id,
      },
    });
  }
  
  console.log(`✅ Created ${carParts.length} listings`);
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