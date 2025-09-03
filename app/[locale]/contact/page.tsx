'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Headphones,
  Users
} from 'lucide-react';

export default function ContactPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-saudi-green/10 via-saudi-green/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="badge-saudi mb-4">
              <Headphones className="me-2 h-4 w-4" />
              {isArabic ? 'خدمة العملاء' : 'Customer Support'}
            </Badge>
            <h1 className="hierarchy-display text-4xl md:text-6xl font-bold mb-6">
              {isArabic ? 'تواصل معنا' : 'Contact Us'}
            </h1>
            <p className="hierarchy-large text-xl text-muted-foreground">
              {isArabic 
                ? 'فريقنا جاهز لمساعدتك في العثور على القطع المناسبة أو الإجابة على أي استفسار'
                : 'Our team is ready to help you find the right parts or answer any questions'}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="card-saudi p-8">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="hierarchy-subheading">
                  {isArabic ? 'أرسل رسالة' : 'Send a Message'}
                </CardTitle>
                <p className="hierarchy-body text-muted-foreground">
                  {isArabic 
                    ? 'سنرد عليك خلال 24 ساعة'
                    : 'We\'ll get back to you within 24 hours'}
                </p>
              </CardHeader>
              <CardContent className="px-0">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        {isArabic ? 'الاسم الأول' : 'First Name'}
                      </Label>
                      <Input id="firstName" className="input-modern" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        {isArabic ? 'اسم العائلة' : 'Last Name'}
                      </Label>
                      <Input id="lastName" className="input-modern" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                    </Label>
                    <Input id="email" type="email" className="input-modern" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                    </Label>
                    <Input id="phone" type="tel" className="input-modern" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      {isArabic ? 'الموضوع' : 'Subject'}
                    </Label>
                    <Input id="subject" className="input-modern" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {isArabic ? 'الرسالة' : 'Message'}
                    </Label>
                    <Textarea 
                      id="message" 
                      className="min-h-[120px] input-modern" 
                      placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                    />
                  </div>
                  <Button className="btn-saudi w-full">
                    <MessageSquare className="me-2 h-4 w-4" />
                    {isArabic ? 'إرسال الرسالة' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="card-saudi p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-saudi-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-saudi-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="hierarchy-subheading mb-2">
                      {isArabic ? 'اتصل بنا' : 'Call Us'}
                    </h3>
                    <p className="hierarchy-body text-muted-foreground mb-2">
                      {isArabic ? 'خدمة عملاء 24/7' : '24/7 Customer Support'}
                    </p>
                    <p className="hierarchy-body font-medium" dir="ltr">
                      +966 11 234 5678
                    </p>
                    <p className="hierarchy-body font-medium" dir="ltr">
                      920000000 (مجاني)
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="card-saudi p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-desert-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-desert-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="hierarchy-subheading mb-2">
                      {isArabic ? 'راسلنا' : 'Email Us'}
                    </h3>
                    <p className="hierarchy-body text-muted-foreground mb-2">
                      {isArabic ? 'نرد خلال ساعة واحدة' : 'Response within 1 hour'}
                    </p>
                    <p className="hierarchy-body font-medium">info@cargoparts.sa</p>
                    <p className="hierarchy-body font-medium">support@cargoparts.sa</p>
                  </div>
                </div>
              </Card>

              <Card className="card-saudi p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-riyadh-sky/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-riyadh-sky" />
                  </div>
                  <div className="flex-1">
                    <h3 className="hierarchy-subheading mb-2">
                      {isArabic ? 'زوروا مكاتبنا' : 'Visit Our Office'}
                    </h3>
                    <p className="hierarchy-body text-muted-foreground mb-2">
                      {isArabic ? 'مفتوح الأحد - الخميس' : 'Open Sunday - Thursday'}
                    </p>
                    <p className="hierarchy-body">
                      {isArabic 
                        ? 'الرياض، حي الملك فهد، شارع التحلية'
                        : 'King Fahd District, Tahlia Street, Riyadh'}
                    </p>
                    <p className="hierarchy-body text-muted-foreground">
                      {isArabic ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="card-saudi p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-saudi-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-saudi-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="hierarchy-subheading mb-2">
                      {isArabic ? 'ساعات العمل' : 'Working Hours'}
                    </h3>
                    <div className="space-y-1 hierarchy-body text-muted-foreground">
                      <p>{isArabic ? 'الأحد - الخميس: 8:00 - 18:00' : 'Sunday - Thursday: 8:00 AM - 6:00 PM'}</p>
                      <p>{isArabic ? 'الجمعة: 2:00 - 6:00 مساءً' : 'Friday: 2:00 PM - 6:00 PM'}</p>
                      <p>{isArabic ? 'السبت: مغلق' : 'Saturday: Closed'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-saudi-green/5 to-desert-gold/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="hierarchy-heading mb-4">
              {isArabic ? 'لديك أسئلة أخرى؟' : 'Have Other Questions?'}
            </h2>
            <p className="hierarchy-body text-muted-foreground mb-8">
              {isArabic 
                ? 'تصفح الأسئلة الشائعة أو انضم إلى مجتمعنا للحصول على مساعدة فورية'
                : 'Browse our FAQ or join our community for instant help'}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-12" asChild>
                <Link href={`/${locale}#faq`}>
                  {isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
                </Link>
              </Button>
              <Button className="btn-saudi h-12" asChild>
                <Link href={`/${locale}/shop`}>
                  <Users className="me-2 h-4 w-4" />
                  {isArabic ? 'ابدأ التسوق' : 'Start Shopping'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}