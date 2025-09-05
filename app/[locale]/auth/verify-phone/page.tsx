import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PhoneVerificationForm } from '@/components/features/auth/phone-verification-form';
import { SessionService } from '@/lib/auth/session';

export default async function VerifyPhonePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ 
    redirect?: string;
  }>;
}) {
  const { locale } = await params;
  const { redirect: redirectUrl } = await searchParams;
  
  // Check if user is authenticated
  const session = await SessionService.getSession();
  if (!session?.user) {
    redirect(`/${locale}/auth`);
  }

  // Check if phone is already verified
  if ((session.user as any).phoneVerified) {
    redirect(redirectUrl || `/${locale}/dashboard`);
  }

  // Check if user has a phone number
  if (!session.user.phone) {
    redirect(`/${locale}/auth/complete-profile?required=true${redirectUrl ? `&redirect=${redirectUrl}` : ''}`);
  }

  const t = await getTranslations('auth');

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center mb-4">
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
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('phoneVerificationTitle')}
          </h1>
          <p className="text-slate-600 mt-2">
            {t('phoneVerificationSubtitle')}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            <span className="font-medium">{session.user.phone}</span>
          </p>
        </div>
      </div>

      {/* Phone Verification Form */}
      <PhoneVerificationForm 
        user={session.user as any}
        redirectUrl={redirectUrl}
        locale={locale}
      />
    </div>
  );
}