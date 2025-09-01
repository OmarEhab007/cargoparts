import { getRequestConfig } from 'next-intl/server';
import { locales } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  
  if (!locale || !locales.includes(locale as any)) {
    return {
      locale: 'ar',
      messages: (await import(`./messages/ar.json`)).default,
    };
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Asia/Riyadh',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        },
      },
      number: {
        currency: {
          style: 'currency',
          currency: 'SAR',
        },
      },
    },
  };
});