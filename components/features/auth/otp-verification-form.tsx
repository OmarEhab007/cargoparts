'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowRight, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import Link from 'next/link';

interface OtpVerificationFormProps {
  email: string;
  mode: 'login' | 'register';
  redirectUrl?: string;
  locale: string;
}

const otpSchema = z.object({
  code: z.string().length(6, 'otpInvalid'),
});

type OtpFormData = z.infer<typeof otpSchema>;

export function OtpVerificationForm({ email, mode, redirectUrl, locale }: OtpVerificationFormProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const onSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    
    try {
      if (mode === 'register') {
        // Verify registration OTP
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            otpCode: data.code,
            type: 'EMAIL_VERIFICATION',
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Verification failed');
        }

        toast.success(t('registerSuccess'));
        
        // Redirect to profile completion or target page
        const searchParams = new URLSearchParams();
        if (redirectUrl) searchParams.set('redirect', redirectUrl);
        
        router.push(`/${locale}/auth/complete-profile?${searchParams.toString()}`);
      } else {
        // Verify login OTP
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            otpCode: data.code,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Login failed');
        }

        toast.success(t('loginSuccess'));
        
        // Redirect to target page or dashboard
        router.push(redirectUrl || `/${locale}/dashboard`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
      form.setError('code', { message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend code');
      }

      toast.success(t('otpSent'));
      setTimeLeft(60);
      setCanResend(false);
      form.setValue('code', '');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Input */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        // Auto-submit when 6 digits are entered
                        if (value.length === 6) {
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
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
            disabled={isLoading || form.watch('code').length !== 6}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{t('verifyOtp')}</span>
                <ArrowRight className={`w-4 h-4 ml-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Resend Section */}
      <Separator />
      <div className="text-center space-y-3">
        <p className="text-sm text-slate-600">
          {t('didntReceiveCode')}
        </p>
        
        {!canResend ? (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>
              {t('resendIn')} {formatTime(timeLeft)}
            </span>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-blue-600 hover:text-blue-700"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                <span>{t('resendOtp')}</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Back to Auth */}
      <Separator />
      <div className="text-center">
        <Link
          href={`/${locale}/auth?mode=${mode}${email ? `&email=${encodeURIComponent(email)}` : ''}${
            redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''
          }`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
          <span>{t('backToLogin')}</span>
        </Link>
      </div>
    </div>
  );
}