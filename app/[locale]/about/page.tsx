'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  Award,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  Target,
  Heart,
  TrendingUp,
  Handshake,
  Globe,
  Building,
  Calendar,
  Package
} from 'lucide-react';

export default function AboutPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const achievements = [
    {
      icon: Users,
      number: '15,000+',
      label: isArabic ? 'عميل راضٍ' : 'Happy Customers',
      color: 'text-saudi-green'
    },
    {
      icon: Building,
      number: '1,200+',
      label: isArabic ? 'بائع معتمد' : 'Certified Sellers',
      color: 'text-desert-gold'
    },
    {
      icon: Package,
      number: '50,000+',
      label: isArabic ? 'قطعة غيار' : 'Spare Parts',
      color: 'text-riyadh-sky'
    },
    {
      icon: MapPin,
      number: '13',
      label: isArabic ? 'منطقة في المملكة' : 'Regions in KSA',
      color: 'text-saudi-green'
    }
  ];

  const timeline = [
    {
      year: '2020',
      title: isArabic ? 'البداية في الرياض' : 'Founded in Riyadh',
      description: isArabic 
        ? 'بدأنا كفريق صغير برؤية كبيرة لتطوير صناعة قطع الغيار في المملكة'
        : 'Started as a small team with a big vision to revolutionize spare parts industry in KSA'
    },
    {
      year: '2021',
      title: isArabic ? 'التوسع الأول' : 'First Expansion',
      description: isArabic 
        ? 'وصلنا إلى 5 مناطق في المملكة وحققنا أول 1000 عملية بيع'
        : 'Reached 5 regions in KSA and achieved our first 1,000 sales'
    },
    {
      year: '2022',
      title: isArabic ? 'الاعتماد الرسمي' : 'Official Certification',
      description: isArabic 
        ? 'حصلنا على ترخيص وزارة التجارة والاستثمار كمنصة تجارية معتمدة'
        : 'Received MOC certification as an official e-commerce platform'
    },
    {
      year: '2023',
      title: isArabic ? 'القيادة في السوق' : 'Market Leadership',
      description: isArabic 
        ? 'أصبحنا المنصة الأولى لقطع الغيار المستعملة في المملكة'
        : 'Became the #1 platform for used spare parts in Saudi Arabia'
    },
    {
      year: '2024',
      title: isArabic ? 'التطوير المستمر' : 'Continuous Innovation',
      description: isArabic 
        ? 'إطلاق تقنيات الذكاء الاصطناعي لتحسين تجربة البحث والشراء'
        : 'Launched AI technology to enhance search and shopping experience'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: isArabic ? 'الثقة والشفافية' : 'Trust & Transparency',
      description: isArabic 
        ? 'نبني الثقة من خلال الشفافية الكاملة في جميع معاملاتنا'
        : 'We build trust through complete transparency in all our transactions'
    },
    {
      icon: Award,
      title: isArabic ? 'الجودة العالية' : 'Superior Quality',
      description: isArabic 
        ? 'نضمن أعلى معايير الجودة في كل قطعة غيار نعرضها'
        : 'We ensure the highest quality standards in every spare part we list'
    },
    {
      icon: Heart,
      title: isArabic ? 'خدمة العملاء' : 'Customer Care',
      description: isArabic 
        ? 'عملاؤنا في المقدمة، ونسعى دائماً لتجاوز توقعاتهم'
        : 'Our customers come first, and we always strive to exceed expectations'
    },
    {
      icon: TrendingUp,
      title: isArabic ? 'التطوير المستمر' : 'Continuous Innovation',
      description: isArabic 
        ? 'نطور باستمرار لنوفر أفضل تجربة تسوق رقمية'
        : 'We continuously innovate to provide the best digital shopping experience'
    }
  ];

  // Team data - kept for future use
  // const team = [
  //   {
  //     name: isArabic ? 'أحمد العبدالله' : 'Ahmed Al-Abdullah',
  //     role: isArabic ? 'الرئيس التنفيذي' : 'Chief Executive Officer',
  //     experience: isArabic ? '15 سنة خبرة في قطاع السيارات' : '15 years in automotive sector',
  //     image: '/team/ceo.jpg' // Placeholder
  //   },
  //   {
  //     name: isArabic ? 'فاطمة الزهراني' : 'Fatima Al-Zahrani',
  //     role: isArabic ? 'مديرة التقنية' : 'Chief Technology Officer',
  //     experience: isArabic ? '12 سنة في تطوير التقنيات' : '12 years in technology development',
  //     image: '/team/cto.jpg' // Placeholder
  //   },
  //   {
  //     name: isArabic ? 'محمد القحطاني' : 'Mohammed Al-Qahtani',
  //     role: isArabic ? 'مدير العمليات' : 'Chief Operations Officer',
  //     experience: isArabic ? '10 سنوات في إدارة العمليات' : '10 years in operations management',
  //     image: '/team/coo.jpg' // Placeholder
  //   }
  // ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-saudi-green/10 via-saudi-green/5 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(22,93,49,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="badge-saudi mb-6">
              <Building className="me-2 h-4 w-4" />
              {isArabic ? 'تأسست في المملكة العربية السعودية' : 'Founded in Saudi Arabia'}
            </Badge>
            <h1 className="hierarchy-display text-4xl md:text-6xl font-bold mb-6">
              {isArabic ? 'من نحن' : 'About Us'}
            </h1>
            <p className="hierarchy-large text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              {isArabic 
                ? 'منصة كارجو للقطع هي الوجهة الأولى في المملكة العربية السعودية لشراء وبيع قطع الغيار الأصلية المستعملة. نربط بين ملايين العملاء وآلاف البائعين الموثوقين عبر منصة آمنة ومبتكرة.'
                : 'Cargo Parts is Saudi Arabia\'s premier destination for buying and selling genuine used auto parts. We connect millions of customers with thousands of trusted sellers through a secure and innovative platform.'}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-saudi-green/5 to-desert-gold/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="card-saudi text-center group hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-saudi-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <achievement.icon className={`h-8 w-8 ${achievement.color}`} />
                  </div>
                  <p className={`hierarchy-display text-3xl font-bold mb-2 ${achievement.color}`}>
                    {achievement.number}
                  </p>
                  <p className="hierarchy-caption text-muted-foreground">
                    {achievement.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="badge-gold mb-4">
                <Target className="me-2 h-4 w-4" />
                {isArabic ? 'رسالتنا' : 'Our Mission'}
              </Badge>
              <h2 className="hierarchy-heading mb-6">
                {isArabic 
                  ? 'نعيد تعريف تجربة شراء قطع الغيار'
                  : 'Redefining Spare Parts Shopping Experience'}
              </h2>
              <p className="hierarchy-body text-muted-foreground mb-6">
                {isArabic 
                  ? 'مهمتنا هي جعل العثور على قطع الغيار المناسبة أمراً سهلاً وآمناً وبأسعار عادلة. نسعى لبناء جسر الثقة بين البائعين والمشترين من خلال منصة تقنية متطورة تضمن الجودة والشفافية.'
                  : 'Our mission is to make finding the right spare parts easy, safe, and fairly priced. We strive to build a bridge of trust between sellers and buyers through an advanced technology platform that ensures quality and transparency.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-saudi-green/10 text-saudi-green">
                  {isArabic ? 'جودة مضمونة' : 'Quality Guaranteed'}
                </Badge>
                <Badge className="bg-desert-gold/10 text-desert-gold">
                  {isArabic ? 'أسعار عادلة' : 'Fair Pricing'}
                </Badge>
                <Badge className="bg-riyadh-sky/10 text-riyadh-sky">
                  {isArabic ? 'خدمة متميزة' : 'Excellent Service'}
                </Badge>
              </div>
            </div>
            <Card className="card-saudi p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-desert-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-10 w-10 text-desert-gold" />
                </div>
                <h3 className="hierarchy-subheading mb-4">
                  {isArabic ? 'رؤيتنا 2030' : 'Our Vision 2030'}
                </h3>
                <p className="hierarchy-body text-muted-foreground">
                  {isArabic 
                    ? 'أن نكون المنصة الرقمية الأولى في الشرق الأوسط لقطع الغيار، مساهمين في تحقيق رؤية المملكة 2030 للتحول الرقمي والاقتصاد المستدام.'
                    : 'To be the leading digital platform for spare parts in the Middle East, contributing to Saudi Vision 2030 for digital transformation and sustainable economy.'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="badge-saudi mb-4">
              <Calendar className="me-2 h-4 w-4" />
              {isArabic ? 'رحلتنا' : 'Our Journey'}
            </Badge>
            <h2 className="hierarchy-heading mb-4">
              {isArabic ? 'قصة نجاحنا عبر السنوات' : 'Our Success Story Over the Years'}
            </h2>
            <p className="hierarchy-body text-muted-foreground max-w-2xl mx-auto">
              {isArabic 
                ? 'من فكرة بسيطة إلى منصة رائدة، هذه هي رحلتنا في تطوير صناعة قطع الغيار'
                : 'From a simple idea to a leading platform, this is our journey in developing the spare parts industry'}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-6 mb-12 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-saudi-green text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {item.year}
                  </div>
                  {index !== timeline.length - 1 && (
                    <div className="w-0.5 h-16 bg-saudi-green/20 mx-auto mt-4" />
                  )}
                </div>
                <Card className="flex-1 p-6 hover:shadow-lg transition-shadow">
                  <h3 className="hierarchy-subheading mb-3">{item.title}</h3>
                  <p className="hierarchy-body text-muted-foreground">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="badge-gold mb-4">
              <Heart className="me-2 h-4 w-4" />
              {isArabic ? 'قيمنا' : 'Our Values'}
            </Badge>
            <h2 className="hierarchy-heading mb-4">
              {isArabic ? 'القيم التي نؤمن بها' : 'Values We Believe In'}
            </h2>
            <p className="hierarchy-body text-muted-foreground max-w-2xl mx-auto">
              {isArabic 
                ? 'هذه القيم توجه كل قراراتنا وتحدد طريقة تعاملنا مع عملائنا وشركائنا'
                : 'These values guide all our decisions and define how we interact with customers and partners'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="card-saudi text-center p-6 group hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-saudi-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <value.icon className="h-8 w-8 text-saudi-green" />
                </div>
                <h3 className="hierarchy-subheading mb-3">{value.title}</h3>
                <p className="hierarchy-caption text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Trust */}
      <section className="py-20 bg-gradient-to-r from-saudi-green/5 to-desert-gold/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="badge-saudi mb-4">
              <Shield className="me-2 h-4 w-4" />
              {isArabic ? 'الاعتمادات والشراكات' : 'Certifications & Partnerships'}
            </Badge>
            <h2 className="hierarchy-heading mb-6">
              {isArabic ? 'معتمدون ومرخصون رسمياً' : 'Officially Certified & Licensed'}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-saudi p-8 text-center">
              <div className="w-16 h-16 bg-saudi-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-saudi-green" />
              </div>
              <h3 className="hierarchy-subheading mb-2">
                {isArabic ? 'وزارة التجارة' : 'Ministry of Commerce'}
              </h3>
              <p className="hierarchy-caption text-muted-foreground">
                {isArabic ? 'مرخص كمنصة تجارة إلكترونية رسمية' : 'Licensed as official e-commerce platform'}
              </p>
            </Card>
            <Card className="card-saudi p-8 text-center">
              <div className="w-16 h-16 bg-desert-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-desert-gold" />
              </div>
              <h3 className="hierarchy-subheading mb-2">
                {isArabic ? 'شهادة الآيزو' : 'ISO Certification'}
              </h3>
              <p className="hierarchy-caption text-muted-foreground">
                {isArabic ? 'معايير الجودة العالمية ISO 9001' : 'International quality standards ISO 9001'}
              </p>
            </Card>
            <Card className="card-saudi p-8 text-center">
              <div className="w-16 h-16 bg-riyadh-sky/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-riyadh-sky" />
              </div>
              <h3 className="hierarchy-subheading mb-2">
                {isArabic ? 'الأمان السيبراني' : 'Cybersecurity'}
              </h3>
              <p className="hierarchy-caption text-muted-foreground">
                {isArabic ? 'معتمد من الهيئة السعودية للأمن السيبراني' : 'Certified by Saudi Cybersecurity Authority'}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <Badge className="badge-saudi mb-4">
                <Phone className="me-2 h-4 w-4" />
                {isArabic ? 'تواصل معنا' : 'Contact Us'}
              </Badge>
              <h2 className="hierarchy-heading mb-6">
                {isArabic ? 'نحن هنا لمساعدتك' : 'We\'re Here to Help You'}
              </h2>
              <p className="hierarchy-body text-muted-foreground mb-8">
                {isArabic 
                  ? 'فريق خدمة العملاء لدينا متاح 24/7 للإجابة على استفساراتك ومساعدتك في العثور على ما تحتاجه'
                  : 'Our customer service team is available 24/7 to answer your questions and help you find what you need'}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-saudi-green/10 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-saudi-green" />
                  </div>
                  <div>
                    <p className="font-semibold">{isArabic ? 'الهاتف' : 'Phone'}</p>
                    <p className="text-muted-foreground" dir="ltr">+966 11 234 5678</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-desert-gold/10 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-desert-gold" />
                  </div>
                  <div>
                    <p className="font-semibold">{isArabic ? 'البريد الإلكتروني' : 'Email'}</p>
                    <p className="text-muted-foreground">info@cargoparts.sa</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-riyadh-sky/10 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-riyadh-sky" />
                  </div>
                  <div>
                    <p className="font-semibold">{isArabic ? 'العنوان' : 'Address'}</p>
                    <p className="text-muted-foreground">
                      {isArabic 
                        ? 'الرياض، حي الملك فهد، المملكة العربية السعودية'
                        : 'King Fahd District, Riyadh, Saudi Arabia'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-saudi-green/10 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-saudi-green" />
                  </div>
                  <div>
                    <p className="font-semibold">{isArabic ? 'ساعات العمل' : 'Working Hours'}</p>
                    <p className="text-muted-foreground">
                      {isArabic ? 'الأحد - الخميس: 8:00 - 18:00' : 'Sunday - Thursday: 8:00 AM - 6:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="card-saudi p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-saudi-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Handshake className="h-10 w-10 text-saudi-green" />
                </div>
                <h3 className="hierarchy-subheading mb-4">
                  {isArabic ? 'انضم إلى عائلة كارجو' : 'Join the Cargo Family'}
                </h3>
                <p className="hierarchy-body text-muted-foreground mb-6">
                  {isArabic 
                    ? 'سواء كنت بائعاً أو مشترياً، نحن نرحب بك للانضمام إلى أكبر مجتمع لقطع الغيار في المملكة'
                    : 'Whether you\'re a seller or buyer, we welcome you to join the largest spare parts community in Saudi Arabia'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild className="btn-saudi">
                    <Link href={`/${locale}/shop`}>
                      {isArabic ? 'تسوق الآن' : 'Shop Now'}
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/${locale}/seller/dashboard`}>
                      {isArabic ? 'ابدأ البيع' : 'Start Selling'}
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}