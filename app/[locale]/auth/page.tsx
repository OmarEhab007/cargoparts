import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { AuthForm } from '@/components/features/auth/auth-form';
import { SessionService } from '@/lib/auth/session';

export default async function AuthPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ 
    mode?: 'login' | 'register';
    email?: string;
    redirect?: string;
    role?: 'seller';
  }>;
}) {
  const { locale } = await params;
  const { mode = 'login', email, redirect: redirectUrl, role } = await searchParams;
  
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
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mx-auto flex items-center justify-center mb-4">
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
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? t('welcomeBack') : t('joinCargoparts')}
          </h1>
          <p className="text-slate-600 mt-2">
            {mode === 'login' 
              ? t('enterEmailToContinue')
              : t('weWillSendOtp')
            }
          </p>
        </div>
      </div>

      {/* Auth Form */}
      <AuthForm 
        mode={role ? 'register' : mode} 
        initialEmail={email}
        redirectUrl={redirectUrl}
        locale={locale}
        initialRole={role === 'seller' ? 'SELLER' : undefined}
      />
    </div>
  );
}