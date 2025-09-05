import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProfileCompletionForm } from '@/components/features/auth/profile-completion-form';
import { SessionService } from '@/lib/auth/session';
import type { User } from '@prisma/client';

export default async function CompleteProfilePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ 
    redirect?: string;
    required?: 'true' | 'false';
  }>;
}) {
  const { locale } = await params;
  const { redirect: redirectUrl, required = 'false' } = await searchParams;
  
  // Check if user is authenticated
  const session = await SessionService.getSession();
  if (!session?.user) {
    redirect(`/${locale}/auth`);
  }

  // Check if profile is already complete
  const user = session.user;
  const isProfileComplete = user.name && (user.phone || required === 'false');
  
  if (isProfileComplete && required === 'false') {
    redirect(redirectUrl || `/${locale}/dashboard`);
  }

  const t = await getTranslations('auth');

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl mx-auto flex items-center justify-center mb-4">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('profileCompletionTitle')}
          </h1>
          <p className="text-slate-600 mt-2">
            {t('profileCompletionSubtitle')}
          </p>
        </div>
      </div>

      {/* Profile Completion Form */}
      <ProfileCompletionForm 
        user={user as User}
        redirectUrl={redirectUrl}
        locale={locale}
        required={required === 'true'}
      />
    </div>
  );
}