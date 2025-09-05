'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Mail, Loader2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface AccountRecoveryFormProps {
  initialEmail?: string;
  redirectUrl?: string;
  locale: string;
}

const recoverySchema = z.object({
  email: z.string().email('emailInvalid'),
});

type RecoveryFormData = z.infer<typeof recoverySchema>;

export function AccountRecoveryForm({ initialEmail, redirectUrl, locale }: AccountRecoveryFormProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<RecoveryFormData>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: initialEmail || '',
    },
  });

  const onSubmit = async (data: RecoveryFormData) => {
    setIsLoading(true);
    
    try {
      // Use the login endpoint which handles account recovery
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Recovery failed');
      }

      setSubmittedEmail(data.email);
      setIsSuccess(true);
      toast.success(t('otpSent'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToVerification = () => {
    const searchParams = new URLSearchParams({
      email: submittedEmail,
      mode: 'login',
    });
    if (redirectUrl) searchParams.set('redirect', redirectUrl);
    
    router.push(`/${locale}/auth/verify?${searchParams.toString()}`);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {t('checkYourEmail')}
          </h2>
          <p className="text-slate-600 mb-2">
            {t('otpInstruction')}
          </p>
          <p className="text-sm text-slate-500">
            <span className="font-medium">{submittedEmail}</span>
          </p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinueToVerification}
          className="w-full"
        >
          <span>{t('continue')}</span>
          <ArrowRight className={`w-4 h-4 ml-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
        </Button>

        {/* Back to Recovery */}
        <Separator />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsSuccess(false);
            setSubmittedEmail('');
            form.reset();
          }}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className={`w-4 h-4 mr-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
          <span>{locale === 'ar' ? 'تعديل البريد الإلكتروني' : 'Change Email'}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="email">{t('email')}</Label>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{t('sendOtp')}</span>
                <ArrowRight className={`w-4 h-4 ml-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Back to Login */}
      <Separator />
      <div className="text-center">
        <Link
          href={`/${locale}/auth${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
          <span>{t('backToLogin')}</span>
        </Link>
      </div>

      {/* Additional Help */}
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-600 text-center">
          {locale === 'ar' 
            ? 'إذا لم تكن تتذكر بريدك الإلكتروني، اتصل بنا للحصول على المساعدة'
            : "If you don't remember your email, contact us for help"
          }
        </p>
      </div>
    </div>
  );
}