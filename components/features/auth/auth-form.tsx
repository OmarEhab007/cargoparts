'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { loginSchema as apiLoginSchema, registerSchema as apiRegisterSchema } from '@/lib/auth/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Mail, Loader2, ArrowRight, User, Store } from 'lucide-react';
import Link from 'next/link';

interface AuthFormProps {
  mode: 'login' | 'register';
  initialEmail?: string;
  redirectUrl?: string;
  locale: string;
  initialRole?: 'BUYER' | 'SELLER';
}

// Extended schemas that include UI-specific fields
const loginSchema = apiLoginSchema;

const registerSchema = apiRegisterSchema.extend({
  name: z.string().min(2, 'nameMinLength'), // Make name required in UI
  role: z.enum(['BUYER', 'SELLER']),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type AuthFormData = LoginFormData | RegisterFormData;

export function AuthForm({ mode, initialEmail, redirectUrl, locale, initialRole }: AuthFormProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema),
    defaultValues: {
      email: initialEmail || '',
      ...(mode === 'register' && {
        name: '',
        role: (initialRole || 'BUYER') as const,
      }),
    },
    mode: 'onChange',
  });

  // Debug form state changes
  useEffect(() => {
    console.log('AuthForm mounted/updated:', {
      mode,
      locale,
      formErrors: form.formState.errors,
      formIsValid: form.formState.isValid,
      formIsDirty: form.formState.isDirty,
      formValues: form.getValues(),
    });
  }, [mode, locale, form.formState.errors, form.formState.isValid, form.formState.isDirty, form]);

  // Debug form submission attempts
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log('Form field changed:', { name, type, value, formState: form.formState });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: AuthFormData) => {
    console.log('🚀 AUTH FORM SUBMITTED:', { 
      mode, 
      data, 
      formState: form.formState,
      timestamp: new Date().toISOString()
    });
    
    setIsLoading(true);
    
    try {
      // Validate form data
      const schema = mode === 'login' ? loginSchema : registerSchema;
      const validatedData = schema.parse(data);
      console.log('✅ Form validation passed:', validatedData);
      if (mode === 'register' && 'name' in validatedData && 'role' in validatedData) {
        // Register flow
        console.log('📤 Making register API call...');
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: validatedData.email,
            name: validatedData.name,
            preferredLocale: locale,
            // Note: role is UI-only, not sent to API
          }),
        });
        console.log('📥 Register API response status:', response.status);

        const result = await response.json();

        if (!response.ok) {
          const errorMessage = result.error || result.message || 'Registration failed';
          throw new Error(errorMessage);
        }

        // Show success message with development hint
        const successMessage = process.env.NODE_ENV === 'development' 
          ? `${t('otpSent')} (Check console for OTP code in development)`
          : t('otpSent');
        toast.success(successMessage);
        
        // Redirect to verification page
        const searchParams = new URLSearchParams({
          email: validatedData.email,
          mode: 'register',
        });
        if (redirectUrl) searchParams.set('redirect', redirectUrl);
        
        router.push(`/${locale}/auth/verify?${searchParams.toString()}`);
      } else {
        // Login flow
        console.log('📤 Making login API call...');
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: validatedData.email,
          }),
        });
        console.log('📥 Login API response status:', response.status);

        const result = await response.json();

        if (!response.ok) {
          const errorMessage = result.error || result.message || 'Login failed';
          throw new Error(errorMessage);
        }

        // Show success message with development hint
        const successMessage = process.env.NODE_ENV === 'development' 
          ? `${t('otpSent')} (Check console for OTP code in development)`
          : t('otpSent');
        toast.success(successMessage);
        
        // Redirect to verification page
        const searchParams = new URLSearchParams({
          email: validatedData.email,
          mode: 'login',
        });
        if (redirectUrl) searchParams.set('redirect', redirectUrl);
        
        router.push(`/${locale}/auth/verify?${searchParams.toString()}`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'An error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide user-friendly messages for common errors
        if (errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (errorMessage.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (errorMessage.includes('email')) {
          errorMessage = 'Please enter a valid email address.';
        }
      }
      
      // Show localized error message
      const localizedError = locale === 'ar' && errorMessage === 'Network error. Please check your connection and try again.' 
        ? 'خطأ في الشبكة. يرجى التحقق من الاتصال والمحاولة مرة أخرى.'
        : errorMessage;
        
      toast.error(localizedError);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log('❌ FORM VALIDATION ERRORS:', errors);
    toast.error('Please fix the form errors before submitting.');
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
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

          {/* Name Field (Register only) */}
          {mode === 'register' && (
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
          )}

          {/* Role Selection (Register only) */}
          {mode === 'register' && (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <Label>{t('chooseAccountType')}</Label>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => field.onChange('BUYER')}
                        className={`p-4 border-2 rounded-lg transition-all text-left ${
                          field.value === 'BUYER'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        disabled={isLoading}
                      >
                        <User className="w-5 h-5 text-blue-600 mb-2" />
                        <div className="font-medium text-sm">{t('iAmBuyer')}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {t('buyerDescription')}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange('SELLER')}
                        className={`p-4 border-2 rounded-lg transition-all text-left ${
                          field.value === 'SELLER'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        disabled={isLoading}
                      >
                        <Store className="w-5 h-5 text-blue-600 mb-2" />
                        <div className="font-medium text-sm">{t('iAmSeller')}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {t('sellerDescription')}
                        </div>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            onClick={(e) => {
              console.log('🔥 BUTTON CLICKED', { 
                isLoading, 
                formState: form.formState,
                formValues: form.getValues(),
                formErrors: form.formState.errors,
                isValid: form.formState.isValid,
                isDirty: form.formState.isDirty,
                event: e
              });
              
              // Manual form validation check
              form.trigger().then((isValid) => {
                console.log('Manual validation result:', isValid, form.formState.errors);
              });
            }}
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

      {/* Terms Agreement (Register only) */}
      {mode === 'register' && (
        <div className="text-xs text-center text-slate-500">
          {t('agreeToTerms')}{' '}
          <Link href={`/${locale}/terms`} className="text-blue-600 hover:underline">
            {t('termsAndConditions')}
          </Link>{' '}
          {t('and')}{' '}
          <Link href={`/${locale}/privacy`} className="text-blue-600 hover:underline">
            {t('privacyPolicy')}
          </Link>
        </div>
      )}

      {/* Mode Toggle */}
      <Separator />
      <div className="text-center">
        <p className="text-sm text-slate-600">
          {mode === 'login' ? t('newUser') : t('existingUser')}{' '}
          <Link
            href={`/${locale}/auth?mode=${mode === 'login' ? 'register' : 'login'}${
              redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''
            }`}
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {mode === 'login' ? t('createAccount') : t('signIn')}
          </Link>
        </p>
      </div>

      {/* Account Recovery Link */}
      {mode === 'login' && (
        <div className="text-center">
          <Link
            href={`/${locale}/auth/recover${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {t('forgotPassword')}
          </Link>
        </div>
      )}
    </div>
  );
}