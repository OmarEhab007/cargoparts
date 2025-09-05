import { env } from '@/lib/env.mjs';
import { z } from 'zod';

const sendSMSSchema = z.object({
  to: z.string().regex(/^\+966[5][0-9]{8}$/, 'Must be a valid Saudi phone number (+966XXXXXXXXX)'),
  message: z.string().min(1).max(160),
  from: z.string().optional(),
});

export interface SMSProvider {
  name: string;
  send(to: string, message: string, from?: string): Promise<SMSResult>;
  healthCheck(): Promise<{ status: string; timestamp: string }>;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

// Taqnyat SMS Provider (Saudi-based SMS gateway)
class TaqnyatSMSProvider implements SMSProvider {
  name = 'taqnyat';
  private readonly apiUrl = 'https://api.taqnyat.sa/v1/messages';
  private readonly apiKey: string;
  private readonly sender: string;

  constructor(apiKey: string, sender: string) {
    this.apiKey = apiKey;
    this.sender = sender;
  }

  async send(to: string, message: string, from?: string): Promise<SMSResult> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          body: message,
          recipients: [to],
          sender: from || this.sender,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'SMS send failed');
      }

      return {
        success: true,
        messageId: result.messageId,
        cost: result.cost,
      };
    } catch (error) {
      console.error('Taqnyat SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Unifonic SMS Provider (Alternative Saudi SMS provider)
class UnifonicSMSProvider implements SMSProvider {
  name = 'unifonic';
  private readonly apiUrl = 'https://el.cloud.unifonic.com/rest/SMS/messages';
  private readonly appSid: string;
  private readonly sender: string;

  constructor(appSid: string, sender: string) {
    this.appSid = appSid;
    this.sender = sender;
  }

  async send(to: string, message: string, from?: string): Promise<SMSResult> {
    try {
      const params = new URLSearchParams({
        AppSid: this.appSid,
        Recipient: to,
        Body: message,
        SenderID: from || this.sender,
        responseType: 'JSON',
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'SMS send failed');
      }

      return {
        success: true,
        messageId: result.data?.MessageID,
        cost: result.data?.Cost,
      };
    } catch (error) {
      console.error('Unifonic SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const params = new URLSearchParams({
        AppSid: this.appSid,
      });

      const response = await fetch(`https://el.cloud.unifonic.com/rest/Account/getAppDefaultSenderID?${params.toString()}`, {
        method: 'GET',
      });

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Local SMS Service using HTTP SMS Gateway
class LocalSMSProvider implements SMSProvider {
  name = 'local';
  private readonly gatewayUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly sender: string;

  constructor(gatewayUrl: string, username: string, password: string, sender: string) {
    this.gatewayUrl = gatewayUrl;
    this.username = username;
    this.password = password;
    this.sender = sender;
  }

  async send(to: string, message: string, from?: string): Promise<SMSResult> {
    try {
      const params = new URLSearchParams({
        username: this.username,
        password: this.password,
        to: to,
        text: message,
        from: from || this.sender,
      });

      const response = await fetch(`${this.gatewayUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const result = await response.text();

      // Simple success check - adjust based on your SMS gateway response format
      if (response.ok && (result.includes('OK') || result.includes('success'))) {
        return {
          success: true,
          messageId: result.split(':')[1]?.trim(),
        };
      } else {
        throw new Error(result);
      }
    } catch (error) {
      console.error('Local SMS gateway error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.gatewayUrl}/status`, {
        method: 'GET',
        timeout: 5000,
      } as any);

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export class SMSService {
  private provider: SMSProvider | null = null;
  private readonly defaultSender: string;

  constructor() {
    this.defaultSender = 'CargoParts';
    this.initializeProvider();
  }

  private initializeProvider() {
    // Check for SMS configuration in order of preference
    if (process.env.SMS_TAQNYAT_API_KEY) {
      this.provider = new TaqnyatSMSProvider(
        process.env.SMS_TAQNYAT_API_KEY,
        process.env.SMS_TAQNYAT_SENDER || this.defaultSender
      );
      console.log('SMS service initialized with Taqnyat provider');
    } else if (process.env.SMS_UNIFONIC_APP_SID) {
      this.provider = new UnifonicSMSProvider(
        process.env.SMS_UNIFONIC_APP_SID,
        process.env.SMS_UNIFONIC_SENDER || this.defaultSender
      );
      console.log('SMS service initialized with Unifonic provider');
    } else if (process.env.SMS_GATEWAY_URL) {
      this.provider = new LocalSMSProvider(
        process.env.SMS_GATEWAY_URL,
        process.env.SMS_GATEWAY_USERNAME || '',
        process.env.SMS_GATEWAY_PASSWORD || '',
        process.env.SMS_GATEWAY_SENDER || this.defaultSender
      );
      console.log('SMS service initialized with local gateway provider');
    } else {
      console.warn('No SMS provider configured - SMS service disabled');
    }
  }

  async sendSMS(data: z.infer<typeof sendSMSSchema>): Promise<SMSResult> {
    if (!this.provider) {
      console.error('SMS service not available - no provider configured');
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    try {
      const validatedData = sendSMSSchema.parse(data);
      
      const result = await this.provider.send(
        validatedData.to,
        validatedData.message,
        validatedData.from || this.defaultSender
      );

      if (result.success) {
        console.log('SMS sent successfully:', {
          provider: this.provider.name,
          to: validatedData.to,
          messageId: result.messageId,
        });
      } else {
        console.error('SMS send failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('SMS validation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  async sendOTP(phoneNumber: string, otpCode: string, locale: 'ar' | 'en' = 'ar'): Promise<SMSResult> {
    const messages = {
      ar: `رمز التحقق الخاص بك من كارجو بارتس: ${otpCode}. صالح لمدة 10 دقائق.`,
      en: `Your Cargo Parts verification code: ${otpCode}. Valid for 10 minutes.`,
    };

    return await this.sendSMS({
      to: phoneNumber,
      message: messages[locale],
    });
  }

  async sendOrderUpdate(
    phoneNumber: string,
    orderId: string,
    status: string,
    locale: 'ar' | 'en' = 'ar'
  ): Promise<SMSResult> {
    const messages = {
      ar: `تحديث طلبك #${orderId}: ${status}. تابع طلبك على كارجو بارتس.`,
      en: `Your order #${orderId} update: ${status}. Track your order on Cargo Parts.`,
    };

    return await this.sendSMS({
      to: phoneNumber,
      message: messages[locale],
    });
  }

  formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.startsWith('966')) {
      return '+' + digits;
    } else if (digits.startsWith('05')) {
      return '+966' + digits.substring(1);
    } else if (digits.startsWith('5') && digits.length === 9) {
      return '+966' + digits;
    }
    
    return phoneNumber; // Return as-is if we can't parse it
  }

  isValidSaudiNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    return /^\+966[5][0-9]{8}$/.test(formatted);
  }

  async healthCheck(): Promise<{ 
    status: string; 
    timestamp: string; 
    provider?: string; 
    details?: any 
  }> {
    const timestamp = new Date().toISOString();
    
    if (!this.provider) {
      return {
        status: 'unhealthy',
        timestamp,
        details: 'No SMS provider configured'
      };
    }

    try {
      const providerHealth = await this.provider.healthCheck();
      return {
        status: providerHealth.status,
        timestamp,
        provider: this.provider.name,
        details: providerHealth,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp,
        provider: this.provider.name,
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getProviderName(): string | null {
    return this.provider?.name || null;
  }
}

export const smsService = new SMSService();