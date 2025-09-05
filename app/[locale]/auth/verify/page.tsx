import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { OtpVerificationForm } from '@/components/features/auth/otp-verification-form';
import { SessionService } from '@/lib/auth/session';

export default async function VerifyPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ 
    email?: string;
    mode?: 'login' | 'register';
    redirect?: string;
  }>;
}) {
  const { locale } = await params;
  const { email, mode = 'login', redirect: redirectUrl } = await searchParams;
  
  // Check if user is already authenticated
  const session = await SessionService.getSession();
  if (session?.user) {
    redirect(redirectUrl || `/${locale}/dashboard`);
  }

  // Redirect if no email provided
  if (!email) {
    redirect(`/${locale}/auth`);
  }

  const t = await getTranslations('auth');

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl mx-auto flex items-center justify-center mb-4">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('checkYourEmail')}
          </h1>
          <p className="text-slate-600 mt-2">
            {t('otpInstruction')}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            <span className="font-medium">{email}</span>
          </p>
        </div>
      </div>

      {/* OTP Verification Form */}
      <OtpVerificationForm 
        email={email}
        mode={mode}
        redirectUrl={redirectUrl}
        locale={locale}
      />
    </div>
  );
}