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
import { Loader2, ArrowRight, RefreshCw, Clock, SkipForward } from 'lucide-react';
import type { User as PrismaUser } from '@prisma/client';

interface PhoneVerificationFormProps {
  user: PrismaUser;
  redirectUrl?: string;
  locale: string;
}

const otpSchema = z.object({
  code: z.string().length(6, 'otpInvalid'),
});

type OtpFormData = z.infer<typeof otpSchema>;

export function PhoneVerificationForm({ user, redirectUrl, locale }: PhoneVerificationFormProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [otpSent, setOtpSent] = useState(false);

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
    } else if (timeLeft === 0 && !canResend && otpSent) {
      setCanResend(true);
    }
  }, [timeLeft, canResend, otpSent]);

  const sendOtp = async () => {
    setIsSending(true);
    
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      toast.success(t('otpSent'));
      setOtpSent(true);
      setTimeLeft(60);
      setCanResend(false);
      form.setValue('code', '');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          otpCode: data.code,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed');
      }

      toast.success(locale === 'ar' ? 'تم تأكيد رقم الجوال بنجاح' : 'Phone verified successfully');
      
      // Redirect to target page or dashboard
      router.push(redirectUrl || `/${locale}/dashboard`);
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
    await sendOtp();
    setIsResending(false);
  };

  const handleSkip = () => {
    router.push(redirectUrl || `/${locale}/dashboard`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {!otpSent ? (
        // Initial state - Send OTP
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              {locale === 'ar' 
                ? 'سنرسل رمز تأكيد إلى رقم جوالك'
                : "We'll send a verification code to your phone"
              }
            </p>
          </div>
          
          <Button
            onClick={sendOtp}
            className="w-full"
            disabled={isSending}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{t('sendOtp')}</span>
                <ArrowRight className={`w-4 h-4 ml-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleSkip}
            disabled={isSending}
          >
            <SkipForward className={`w-4 h-4 mr-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
            <span>{t('skipForNow')}</span>
          </Button>
        </div>
      ) : (
        // OTP verification state
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
      )}

      {/* Resend Section (only when OTP is sent) */}
      {otpSent && (
        <>
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
        </>
      )}

      {/* Skip Option (when OTP is sent) */}
      {otpSent && (
        <>
          <Separator />
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-slate-600 hover:text-slate-900"
            >
              <SkipForward className={`w-4 h-4 mr-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
              <span>{t('skipForNow')}</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}