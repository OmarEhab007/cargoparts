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
import { Form, FormControl, FormField, FormItem, FormMessage, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Loader2, ArrowRight, SkipForward } from 'lucide-react';
import type { User as PrismaUser } from '@prisma/client';

interface ProfileCompletionFormProps {
  user: PrismaUser;
  redirectUrl?: string;
  locale: string;
  required?: boolean;
}

const profileSchema = z.object({
  name: z.string().min(2, 'nameMinLength'),
  phone: z.string().regex(/^(\+966|0)?[5][0-9]{8}$/, 'phoneInvalid').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileCompletionForm({ user, redirectUrl, locale, required = false }: ProfileCompletionFormProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      phone: user.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      toast.success(tCommon('success'));
      
      // If phone was provided, redirect to phone verification
      if (data.phone) {
        const searchParams = new URLSearchParams();
        if (redirectUrl) searchParams.set('redirect', redirectUrl);
        
        router.push(`/${locale}/auth/verify-phone?${searchParams.toString()}`);
      } else {
        // Redirect to target page or dashboard
        router.push(redirectUrl || `/${locale}/dashboard`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (!required) {
      router.push(redirectUrl || `/${locale}/dashboard`);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="name">{t('name')}</Label>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      {...field}
                      id="name"
                      placeholder={t('namePlaceholder')}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Field */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="phone">
                  {required ? t('phone') : t('phoneOptional')}
                </Label>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      {...field}
                      id="phone"
                      type="tel"
                      placeholder={t('phonePlaceholder')}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                {!required && (
                  <FormDescription>
                    {t('addPhoneLater')}
                  </FormDescription>
                )}
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
                <span>{t('continue')}</span>
                <ArrowRight className={`w-4 h-4 ml-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
              </>
            )}
          </Button>

          {/* Skip Button (if not required) */}
          {!required && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleSkip}
              disabled={isLoading}
            >
              <SkipForward className={`w-4 h-4 mr-2 ${locale === 'ar' ? 'rotate-180' : ''}`} />
              <span>{t('skipForNow')}</span>
            </Button>
          )}
        </form>
      </Form>

      {/* User Info */}
      <Separator />
      <div className="text-center">
        <p className="text-sm text-slate-600">
          <span className="font-medium">{user.email}</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {user.role === 'BUYER' ? t('buyerAccount') : t('sellerAccount')}
        </p>
      </div>
    </div>
  );
}