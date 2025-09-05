import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('auth');
  
  return {
    title: t('loginOrRegister'),
    description: locale === 'ar' 
      ? 'تسجيل الدخول أو إنشاء حساب جديد في منصة كارجو لقطع غيار السيارات'
      : 'Login or create a new account on Cargo Parts marketplace',
  };
}

export default async function AuthLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsIDAsIDAsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPgo8L3N2Zz4=')] opacity-40" />
      
      {/* Header with back link */}
      <div className="relative z-10 w-full bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="container max-w-md mx-auto px-4 py-4">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">
              {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-white/60 backdrop-blur-sm border-t border-slate-200/60 mt-auto">
        <div className="container max-w-md mx-auto px-4 py-4 text-center">
          <p className="text-xs text-slate-500">
            © 2025 {locale === 'ar' ? 'كارجو - جميع الحقوق محفوظة' : 'Cargo Parts - All rights reserved'}
          </p>
        </div>
      </div>
    </div>
  );
}