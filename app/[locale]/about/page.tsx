'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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

      {/* Stats Section - Completely Redesigned */}
      <section className="py-20 bg-gradient-to-br from-saudi-green/3 via-background to-desert-gold/3 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-saudi opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="badge-premium mb-4">
              <TrendingUp className="me-2 h-4 w-4" />
              {isArabic ? 'إنجازاتنا بالأرقام' : 'Our Achievements in Numbers'}
            </Badge>
            <h2 className="hierarchy-heading text-saudi-green mb-4">
              {isArabic ? 'نفخر بما حققناه معاً' : 'Proud of What We\'ve Achieved Together'}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={cn(
                  "group relative",
                  "card-enhanced-hover card-glow-saudi",
                  "bg-gradient-to-br from-card via-card/95 to-saudi-green/5",
                  "border-2 border-saudi-green/10 hover:border-saudi-green/30",
                  "rounded-3xl p-8 text-center",
                  "shadow-lg hover:shadow-2xl",
                  "backdrop-blur-sm"
                )}
              >
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-saudi-green/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-desert-gold/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                
                {/* Icon Container */}
                <div className={cn(
                  "relative z-10 w-20 h-20 mx-auto mb-6",
                  "bg-gradient-to-br from-saudi-green/15 to-saudi-green/5",
                  "rounded-2xl flex items-center justify-center",
                  "group-hover:scale-110 group-hover:rotate-3",
                  "transition-transform duration-300 ease-out",
                  "shadow-lg group-hover:shadow-xl"
                )}>
                  <achievement.icon className={cn(
                    "h-10 w-10 transition-all duration-300",
                    achievement.color,
                    "group-hover:scale-110"
                  )} />
                  
                  {/* Floating indicator */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-saudi-green rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Number Display */}
                <div className="relative z-10 mb-4">
                  <p className={cn(
                    "text-4xl lg:text-5xl font-black mb-2",
                    "bg-gradient-to-br from-saudi-green to-saudi-green-dark bg-clip-text text-transparent",
                    "group-hover:scale-105 transition-transform duration-300",
                    "font-mono tracking-tight"
                  )}>
                    {achievement.number}
                  </p>
                  {/* Animated underline */}
                  <div className="w-12 h-1 bg-gradient-to-r from-saudi-green to-desert-gold rounded-full mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
                
                {/* Label */}
                <p className={cn(
                  "text-muted-foreground font-semibold leading-tight",
                  "group-hover:text-foreground transition-colors duration-300",
                  isArabic ? "text-base" : "text-sm"
                )}>
                  {achievement.label}
                </p>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-saudi-green/5 to-desert-gold/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
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
            <div className={cn(
              "relative group",
              "card-premium rounded-3xl p-10",
              "shadow-xl hover:shadow-2xl",
              "transform hover:-translate-y-2 hover:scale-105",
              "transition-all duration-500 ease-out",
              "overflow-hidden"
            )}>
              {/* Background Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-desert-gold/10 via-transparent to-saudi-green/5 opacity-50"></div>
              
              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-desert-gold/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-saudi-green/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"></div>
              
              <div className="relative z-10 text-center">
                {/* Enhanced Icon Container */}
                <div className={cn(
                  "relative w-24 h-24 mx-auto mb-8",
                  "bg-gradient-to-br from-desert-gold/20 to-desert-gold/10",
                  "rounded-3xl flex items-center justify-center",
                  "shadow-lg group-hover:shadow-xl",
                  "transform group-hover:scale-110 group-hover:rotate-6",
                  "transition-all duration-300 ease-out"
                )}>
                  <Globe className="h-12 w-12 text-desert-gold group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Animated Ring */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-desert-gold/30 opacity-0 group-hover:opacity-100 animate-ping"></div>
                  
                  {/* Corner Accent */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-saudi-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Enhanced Title */}
                <h3 className={cn(
                  "hierarchy-subheading mb-6",
                  "bg-gradient-to-r from-desert-gold to-desert-gold-dark bg-clip-text text-transparent",
                  "group-hover:scale-105 transition-transform duration-300"
                )}>
                  {isArabic ? 'رؤيتنا 2030' : 'Our Vision 2030'}
                </h3>
                
                {/* Enhanced Description */}
                <div className="relative">
                  <p className={cn(
                    "hierarchy-body text-muted-foreground leading-relaxed",
                    "group-hover:text-foreground transition-colors duration-300"
                  )}>
                    {isArabic 
                      ? 'أن نكون المنصة الرقمية الأولى في الشرق الأوسط لقطع الغيار، مساهمين في تحقيق رؤية المملكة 2030 للتحول الرقمي والاقتصاد المستدام.'
                      : 'To be the leading digital platform for spare parts in the Middle East, contributing to Saudi Vision 2030 for digital transformation and sustainable economy.'}
                  </p>
                  
                  {/* Decorative Quote Marks */}
                  <div className="absolute -top-4 -left-4 text-4xl text-desert-gold/20 font-serif opacity-0 group-hover:opacity-100 transition-opacity duration-300">&ldquo;</div>
                  <div className="absolute -bottom-4 -right-4 text-4xl text-desert-gold/20 font-serif opacity-0 group-hover:opacity-100 transition-opacity duration-300 rotate-180">&rdquo;</div>
                </div>
                
                {/* Progress Indicator */}
                <div className="mt-8 space-y-2">
                  <div className="flex justify-between text-sm font-medium text-muted-foreground">
                    <span>{isArabic ? 'التقدم نحو الهدف' : 'Progress to Goal'}</span>
                    <span className="text-desert-gold">73%</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-desert-gold to-saudi-green h-full rounded-full transition-all duration-1000 ease-out w-[73%] group-hover:w-[78%]"></div>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {values.map((value, index) => {
              const colors = [
                { bg: 'from-saudi-green/15 to-saudi-green/5', text: 'text-saudi-green', accent: 'bg-saudi-green' },
                { bg: 'from-desert-gold/15 to-desert-gold/5', text: 'text-desert-gold', accent: 'bg-desert-gold' },
                { bg: 'from-riyadh-sky/15 to-riyadh-sky/5', text: 'text-riyadh-sky', accent: 'bg-riyadh-sky' },
                { bg: 'from-oasis-teal/15 to-oasis-teal/5', text: 'text-oasis-teal', accent: 'bg-oasis-teal' }
              ];
              const colorScheme = colors[index % colors.length];
              
              return (
                <div 
                  key={index} 
                  className={cn(
                    "group relative",
                    "card-enhanced-hover",
                    "bg-gradient-to-br from-card via-card/98 to-card/95",
                    "border-2 border-transparent hover:border-saudi-green/20",
                    "rounded-3xl p-8 text-center",
                    "shadow-lg hover:shadow-2xl",
                    "backdrop-blur-sm overflow-hidden",
                    "h-full flex flex-col"
                  )}
                >
                  {/* Animated Background */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100",
                    colorScheme.bg,
                    "transition-opacity duration-500"
                  )}></div>
                  
                  {/* Floating Decorations */}
                  <div className={cn(
                    "absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-0 group-hover:opacity-30",
                    colorScheme.accent,
                    "transition-opacity duration-500 delay-100"
                  )}></div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Enhanced Icon Container */}
                    <div className={cn(
                      "relative w-20 h-20 mx-auto mb-6 flex-shrink-0",
                      "bg-gradient-to-br", colorScheme.bg,
                      "rounded-2xl flex items-center justify-center",
                      "shadow-md group-hover:shadow-lg",
                      "transform group-hover:scale-110 group-hover:-rotate-3",
                      "transition-all duration-300 ease-out"
                    )}>
                      <value.icon className={cn(
                        "h-10 w-10 transition-all duration-300",
                        colorScheme.text,
                        "group-hover:scale-110"
                      )} />
                      
                      {/* Pulse Effect */}
                      <div className={cn(
                        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30",
                        "animate-ping", colorScheme.accent
                      )}></div>
                      
                      {/* Corner Badge */}
                      <div className={cn(
                        "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        colorScheme.accent
                      )}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Enhanced Title */}
                    <h3 className={cn(
                      "hierarchy-subheading mb-4 flex-shrink-0",
                      "group-hover:scale-105 transition-transform duration-300",
                      isArabic ? "text-lg" : "text-base lg:text-lg"
                    )}>
                      {value.title}
                    </h3>
                    
                    {/* Enhanced Description */}
                    <div className="flex-1 flex flex-col justify-center">
                      <p className={cn(
                        "text-muted-foreground leading-relaxed",
                        "group-hover:text-foreground transition-colors duration-300",
                        isArabic ? "text-base" : "text-sm lg:text-base"
                      )}>
                        {value.description}
                      </p>
                    </div>
                    
                    {/* Interactive Element */}
                    <div className="mt-6 flex-shrink-0">
                      <div className={cn(
                        "w-full h-1 rounded-full transition-all duration-500",
                        "bg-gradient-to-r opacity-30 group-hover:opacity-100",
                        colorScheme.bg
                      )}></div>
                    </div>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certifications & Trust - Completely Redesigned */}
      <section className="py-24 bg-gradient-to-br from-saudi-green/8 via-background to-desert-gold/8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pattern-saudi opacity-20"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-saudi-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-desert-gold/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="badge-premium mb-6">
              <Shield className="me-2 h-4 w-4" />
              {isArabic ? 'الاعتمادات والشراكات الرسمية' : 'Official Certifications & Partnerships'}
            </Badge>
            <h2 className="hierarchy-heading text-saudi-green mb-6">
              {isArabic ? 'موثقون ومعتمدون من أعلى الجهات' : 'Certified by the Highest Authorities'}
            </h2>
            <p className="hierarchy-body text-muted-foreground max-w-2xl mx-auto">
              {isArabic 
                ? 'نفخر بحصولنا على أهم الشهادات والتراخيص التي تضمن أعلى معايير الجودة والأمان'
                : 'We are proud to hold the most important certifications and licenses that ensure the highest standards of quality and security'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Building,
                title: isArabic ? 'وزارة التجارة والاستثمار' : 'Ministry of Commerce',
                description: isArabic ? 'مرخص كمنصة تجارة إلكترونية رسمية معتمدة' : 'Licensed as official certified e-commerce platform',
                color: 'saudi-green',
                license: 'CR-2024-001'
              },
              {
                icon: Award,
                title: isArabic ? 'شهادة الآيزو العالمية' : 'ISO International Certification',
                description: isArabic ? 'معايير الجودة الدولية ISO 9001:2015' : 'International quality standards ISO 9001:2015',
                color: 'desert-gold',
                license: 'ISO-9001'
              },
              {
                icon: Shield,
                title: isArabic ? 'الأمان السيبراني' : 'Cybersecurity Authority',
                description: isArabic ? 'معتمد من الهيئة الوطنية للأمن السيبراني' : 'Certified by National Cybersecurity Authority',
                color: 'riyadh-sky',
                license: 'NCA-2024'
              }
            ].map((cert, index) => {
              const colorClasses = {
                'saudi-green': {
                  bg: 'from-saudi-green/15 to-saudi-green/5',
                  text: 'text-saudi-green',
                  border: 'border-saudi-green/20',
                  accent: 'bg-saudi-green'
                },
                'desert-gold': {
                  bg: 'from-desert-gold/15 to-desert-gold/5',
                  text: 'text-desert-gold',
                  border: 'border-desert-gold/20',
                  accent: 'bg-desert-gold'
                },
                'riyadh-sky': {
                  bg: 'from-riyadh-sky/15 to-riyadh-sky/5',
                  text: 'text-riyadh-sky',
                  border: 'border-riyadh-sky/20',
                  accent: 'bg-riyadh-sky'
                }
              };
              
              const colors = colorClasses[cert.color as keyof typeof colorClasses];
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "group relative",
                    "card-premium rounded-3xl p-10",
                    "border-2", colors.border,
                    "shadow-xl hover:shadow-2xl",
                    "transform hover:-translate-y-4 hover:scale-105",
                    "transition-all duration-500 ease-out",
                    "backdrop-blur-sm overflow-hidden",
                    "text-center h-full flex flex-col"
                  )}
                >
                  {/* Animated Background */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100",
                    colors.bg,
                    "transition-opacity duration-500"
                  )}></div>
                  
                  {/* Badge/License Number */}
                  <div className={cn(
                    "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-mono font-bold",
                    "bg-white/80 backdrop-blur-sm", colors.text,
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  )}>
                    {cert.license}
                  </div>
                  
                  {/* Floating Elements */}
                  <div className={cn(
                    "absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20",
                    colors.accent,
                    "transition-opacity duration-500"
                  )}></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Enhanced Icon Container */}
                    <div className={cn(
                      "relative w-24 h-24 mx-auto mb-8 flex-shrink-0",
                      "bg-gradient-to-br", colors.bg,
                      "rounded-3xl flex items-center justify-center",
                      "shadow-lg group-hover:shadow-xl",
                      "transform group-hover:scale-110 group-hover:rotate-6",
                      "transition-all duration-300 ease-out"
                    )}>
                      <cert.icon className={cn(
                        "h-12 w-12 transition-all duration-300",
                        colors.text,
                        "group-hover:scale-110"
                      )} />
                      
                      {/* Verification Checkmark */}
                      <div className={cn(
                        "absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center",
                        "bg-white shadow-lg border-2", colors.border,
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      )}>
                        <div className={cn("w-3 h-3 rounded-full", colors.accent)}></div>
                      </div>
                    </div>
                    
                    {/* Enhanced Title */}
                    <h3 className={cn(
                      "hierarchy-subheading mb-4 flex-shrink-0",
                      "group-hover:scale-105 transition-transform duration-300",
                      isArabic ? "text-lg" : "text-base lg:text-lg"
                    )}>
                      {cert.title}
                    </h3>
                    
                    {/* Enhanced Description */}
                    <div className="flex-1 flex flex-col justify-center mb-8">
                      <p className={cn(
                        "text-muted-foreground leading-relaxed",
                        "group-hover:text-foreground transition-colors duration-300",
                        isArabic ? "text-base" : "text-sm lg:text-base"
                      )}>
                        {cert.description}
                      </p>
                    </div>
                    
                    {/* Verification Status */}
                    <div className={cn(
                      "flex items-center justify-center gap-2 py-3 px-6 rounded-full",
                      "bg-white/50 backdrop-blur-sm border", colors.border,
                      "opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200"
                    )}>
                      <div className={cn("w-2 h-2 rounded-full animate-pulse", colors.accent)}></div>
                      <span className={cn("text-xs font-semibold", colors.text)}>
                        {isArabic ? 'معتمد وموثق' : 'Verified & Active'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section - Enhanced */}
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
            <div className={cn(
              "group relative",
              "card-premium rounded-3xl p-10",
              "shadow-xl hover:shadow-2xl",
              "transform hover:-translate-y-2 hover:scale-105",
              "transition-all duration-500 ease-out",
              "overflow-hidden"
            )}>
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-saudi-green/10 via-transparent to-desert-gold/5 opacity-50"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-saudi-green/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-desert-gold/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
              
              <div className="relative z-10 text-center">
                {/* Enhanced Icon Container */}
                <div className={cn(
                  "relative w-24 h-24 mx-auto mb-8",
                  "bg-gradient-to-br from-saudi-green/20 to-saudi-green/10",
                  "rounded-3xl flex items-center justify-center",
                  "shadow-lg group-hover:shadow-xl",
                  "transform group-hover:scale-110 group-hover:rotate-6",
                  "transition-all duration-300 ease-out"
                )}>
                  <Handshake className="h-12 w-12 text-saudi-green group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Animated Ring */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-saudi-green/30 opacity-0 group-hover:opacity-100 animate-ping"></div>
                  
                  {/* Welcome Badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-desert-gold rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs font-bold text-saudi-green-dark">+</span>
                  </div>
                </div>
                
                {/* Enhanced Title */}
                <h3 className={cn(
                  "hierarchy-subheading mb-6",
                  "bg-gradient-to-r from-saudi-green to-saudi-green-dark bg-clip-text text-transparent",
                  "group-hover:scale-105 transition-transform duration-300"
                )}>
                  {isArabic ? 'انضم إلى عائلة كارجو بارتس' : 'Join the Cargo Parts Family'}
                </h3>
                
                {/* Enhanced Description */}
                <p className={cn(
                  "hierarchy-body text-muted-foreground mb-8 leading-relaxed",
                  "group-hover:text-foreground transition-colors duration-300"
                )}>
                  {isArabic 
                    ? 'سواء كنت بائعاً أو مشترياً، نحن نرحب بك للانضمام إلى أكبر وأوثق مجتمع لقطع الغيار في المملكة العربية السعودية'
                    : 'Whether you\'re a seller or buyer, we welcome you to join the largest and most trusted spare parts community in Saudi Arabia'}
                </p>
                
                {/* Community Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-white/30 backdrop-blur-sm rounded-2xl">
                  <div className="text-center">
                    <div className="text-lg font-bold text-saudi-green">15K+</div>
                    <div className={cn("text-xs text-muted-foreground", isArabic && "text-sm")}>
                      {isArabic ? 'عضو' : 'Members'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-desert-gold">1.2K+</div>
                    <div className={cn("text-xs text-muted-foreground", isArabic && "text-sm")}>
                      {isArabic ? 'بائع' : 'Sellers'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-riyadh-sky">50K+</div>
                    <div className={cn("text-xs text-muted-foreground", isArabic && "text-sm")}>
                      {isArabic ? 'قطعة' : 'Parts'}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild className={cn(
                    "btn-saudi-enhanced group/btn",
                    "relative overflow-hidden"
                  )}>
                    <Link href={`/${locale}/shop`}>
                      <span className="relative z-10 flex items-center gap-2">
                        {isArabic ? 'تسوق الآن' : 'Shop Now'}
                        <div className="w-2 h-2 bg-white/50 rounded-full opacity-0 group-hover/btn:opacity-100 animate-bounce transition-opacity duration-300"></div>
                      </span>
                      <div className="absolute inset-0 bg-white/10 transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></div>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className={cn(
                    "border-2 border-desert-gold text-desert-gold hover:bg-desert-gold hover:text-saudi-green-dark",
                    "group/btn relative overflow-hidden transition-all duration-300"
                  )}>
                    <Link href={`/${locale}/seller/dashboard`}>
                      <span className="relative z-10 flex items-center gap-2">
                        {isArabic ? 'ابدأ البيع' : 'Start Selling'}
                        <div className="w-2 h-2 bg-desert-gold rounded-full opacity-0 group-hover/btn:opacity-100 animate-pulse transition-opacity duration-300"></div>
                      </span>
                    </Link>
                  </Button>
                </div>
                
                {/* Trust Indicator */}
                <div className="mt-6 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                  <Shield className="h-4 w-4 text-saudi-green" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {isArabic ? 'منصة آمنة وموثوقة 100%' : '100% Safe & Trusted Platform'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}