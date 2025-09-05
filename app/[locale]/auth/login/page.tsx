import { redirect } from 'next/navigation';

export default async function LoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ 
    redirect?: string;
    role?: 'seller';
  }>;
}) {
  const { locale } = await params;
  const { redirect: redirectUrl, role } = await searchParams;
  
  // Redirect to the main auth page with login mode
  const authParams = new URLSearchParams({
    mode: 'login',
  });
  
  if (redirectUrl) {
    authParams.set('redirect', redirectUrl);
  }
  
  if (role) {
    authParams.set('role', role);
  }
  
  redirect(`/${locale}/auth?${authParams.toString()}`);
}