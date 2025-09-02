'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Package,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Shield,
  Award,
  Clock,
  CheckCircle2
} from 'lucide-react';

export function SiteFooter() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const footerLinks = {
    company: {
      title: isArabic ? 'الشركة' : 'Company',
      links: [
        { name: isArabic ? 'من نحن' : 'About Us', href: `/${locale}/about` },
        { name: isArabic ? 'اتصل بنا' : 'Contact Us', href: `/${locale}/contact` },
        { name: isArabic ? 'فرص عمل' : 'Careers', href: `/${locale}/careers` },
      ],
    },
    support: {
      title: isArabic ? 'الدعم' : 'Support',
      links: [
        { name: isArabic ? 'مساعدة' : 'Help', href: `/${locale}/help` },
        { name: isArabic ? 'تتبع الطلب' : 'Track Order', href: `/${locale}/track` },
        { name: isArabic ? 'الضمان' : 'Warranty', href: `/${locale}/warranty` },
      ],
    },
    sellers: {
      title: isArabic ? 'البائعون' : 'Sellers',
      links: [
        { name: isArabic ? 'ابدأ البيع' : 'Start Selling', href: `/${locale}/seller/dashboard` },
        { name: isArabic ? 'دليل البائع' : 'Seller Guide', href: `/${locale}/seller/guide` },
        { name: isArabic ? 'الرسوم' : 'Fees', href: `/${locale}/seller/fees` },
      ],
    },
    legal: {
      title: isArabic ? 'قانوني' : 'Legal',
      links: [
        { name: isArabic ? 'الشروط' : 'Terms', href: `/${locale}/terms` },
        { name: isArabic ? 'الخصوصية' : 'Privacy', href: `/${locale}/privacy` },
      ],
    },
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/cargoparts' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/cargoparts' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/cargoparts' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/cargoparts' },
  ];

  return (
    <footer className="bg-saudi-green text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(212,175,55,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative">
        {/* Main Footer */}
        <div className="py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
            {/* Company Info - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-saudi-green" />
                </div>
                <h3 className="text-xl font-bold">{isArabic ? 'كارجو' : 'CargoParts'}</h3>
              </div>
              
              <p className="text-white/90 mb-4 text-sm leading-relaxed">
                {isArabic 
                  ? 'أكبر منصة لقطع الغيار الأصلية في المملكة'
                  : 'Saudi Arabia\'s largest genuine auto parts marketplace'}
              </p>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/90">
                  <Phone className="h-3 w-3 text-desert-gold flex-shrink-0" />
                  <span dir="ltr">920000000</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Mail className="h-3 w-3 text-desert-gold flex-shrink-0" />
                  <span dir="ltr">support@cargoparts.sa</span>
                </div>
              </div>
            </div>

            {/* Links Sections - Each takes 1 column */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key}>
                <h4 className="font-semibold mb-3 text-white text-sm">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-white/70 text-sm">
              © 2024 {isArabic ? 'كارجو' : 'CargoParts'}. {isArabic ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-desert-gold hover:text-saudi-green transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-3 w-3" />
                  </Link>
                );
              })}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-2">
              <Badge className="bg-white/10 text-white border-white/20 text-xs flex items-center gap-1">
                <Shield className="h-3 w-3 flex-shrink-0" />
                <span>{isArabic ? 'آمن' : 'Secure'}</span>
              </Badge>
              <Badge className="bg-desert-gold/20 text-desert-gold border-desert-gold/30 text-xs flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                <span>{isArabic ? 'معتمد' : 'Certified'}</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}