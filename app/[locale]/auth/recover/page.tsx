import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { AccountRecoveryForm } from '@/components/features/auth/account-recovery-form';
import { SessionService } from '@/lib/auth/session';

export default async function RecoverPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ 
    email?: string;
    redirect?: string;
  }>;
}) {
  const { locale } = await params;
  const { email, redirect: redirectUrl } = await searchParams;
  
  // Check if user is already authenticated
  const session = await SessionService.getSession();
  if (session?.user) {
    redirect(redirectUrl || `/${locale}/dashboard`);
  }

  const t = await getTranslations('auth');

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('forgotPasswordTitle')}
          </h1>
          <p className="text-slate-600 mt-2">
            {t('forgotPasswordSubtitle')}
          </p>
        </div>
      </div>

      {/* Account Recovery Form */}
      <AccountRecoveryForm 
        initialEmail={email}
        redirectUrl={redirectUrl}
        locale={locale}
      />
    </div>
  );
}