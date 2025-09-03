import { prisma } from '@/lib/db/prisma';
import { env } from '@/lib/env.mjs';
import type { PaymentProvider, PaymentStatus } from '@prisma/client';

export interface CreatePaymentInput {
  orderId: string;
  provider: PaymentProvider;
  amount: number;
  currency?: string;
  paymentMethod?: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret?: string;
  redirectUrl?: string;
  status: PaymentStatus;
  expiresAt: Date;
}

export class PaymentService {
  /**
   * Create payment intent for order
   */
  static async createPaymentIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
    // Verify order exists and is payable
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        payments: {
          where: { status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] } },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Order is not in a payable state');
    }

    // Check if there's already a pending payment
    const existingPayment = order.payments.find(p => 
      p.status === 'PENDING' || p.status === 'PROCESSING'
    );

    if (existingPayment) {
      throw new Error('Payment already in progress for this order');
    }

    // Validate amount matches order total
    if (input.amount !== order.total) {
      throw new Error('Payment amount does not match order total');
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: input.orderId,
        provider: input.provider,
        amount: input.amount,
        currency: input.currency || 'SAR',
        status: 'PENDING',
        paymentMethod: input.paymentMethod,
        expiresAt,
      },
    });

    // Create payment intent with provider
    let providerResponse;
    
    switch (input.provider) {
      case 'TAP':
        providerResponse = await this.createTapPayment(payment.id);
        break;
      case 'HYPERPAY':
        providerResponse = await this.createHyperPayPayment(payment.id);
        break;
      default:
        throw new Error(`Payment provider ${input.provider} not supported`);
    }

    // Update payment with provider transaction ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerTxId: providerResponse.transactionId,
        reference: providerResponse.reference,
      },
    });

    return {
      id: payment.id,
      clientSecret: providerResponse.clientSecret,
      redirectUrl: providerResponse.redirectUrl,
      status: 'PENDING',
      expiresAt,
    };
  }

  /**
   * Handle payment webhook
   */
  static async handleWebhook(
    provider: PaymentProvider,
    event: string,
    payload: Record<string, unknown>,
    signature?: string
  ): Promise<void> {
    // Log webhook for debugging
    await prisma.paymentWebhook.create({
      data: {
        provider,
        event,
        payload: JSON.stringify(payload),
        signature,
        processed: false,
      },
    });

    try {
      switch (provider) {
        case 'TAP':
          await this.handleTapWebhook(event, payload);
          break;
        case 'HYPERPAY':
          await this.handleHyperPayWebhook(event, payload);
          break;
        default:
          throw new Error(`Webhook for provider ${provider} not supported`);
      }

      // Mark webhook as processed
      await prisma.paymentWebhook.updateMany({
        where: {
          provider,
          payload: JSON.stringify(payload),
        },
        data: { processed: true },
      });
    } catch (error) {
      // Mark webhook with error
      await prisma.paymentWebhook.updateMany({
        where: {
          provider,
          payload: JSON.stringify(payload),
        },
        data: {
          processed: true,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    failureReason?: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Update payment
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status,
          failureReason,
          processedAt: new Date(),
        },
        include: { order: true },
      });

      // Update order status based on payment status
      if (status === 'COMPLETED') {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'CONFIRMED' },
        });

        // Add to order status history
        await tx.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            status: 'CONFIRMED',
            notes: 'Payment confirmed',
          },
        });
      } else if (status === 'FAILED' || status === 'CANCELLED') {
        // Restore inventory for failed payments
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: payment.orderId },
          include: { listing: true },
        });

        for (const item of orderItems) {
          await tx.listing.update({
            where: { id: item.listingId },
            data: {
              quantity: { increment: item.quantity },
            },
          });
        }
      }
    });
  }

  /**
   * Get payment by ID
   */
  static async getPaymentById(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get order payments
   */
  static async getOrderPayments(orderId: string) {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Provider-specific implementations (stubs for now)
  private static async createTapPayment(paymentId: string) {
    // TODO: Implement TAP payment integration
    // This would typically involve calling TAP's API to create a charge
    
    if (!env.TAP_SECRET_KEY) {
      throw new Error('TAP payment configuration missing');
    }

    // Mock response for development
    return {
      transactionId: `tap_${Date.now()}`,
      reference: `TAP-${paymentId.substring(0, 8)}`,
      redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/payment/tap/redirect/${paymentId}`,
    };
  }

  private static async createHyperPayPayment(paymentId: string) {
    // TODO: Implement HyperPay integration
    
    if (!env.HYPERPAY_ACCESS_TOKEN) {
      throw new Error('HyperPay payment configuration missing');
    }

    // Mock response for development
    return {
      transactionId: `hyperpay_${Date.now()}`,
      reference: `HP-${paymentId.substring(0, 8)}`,
      redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/payment/hyperpay/redirect/${paymentId}`,
    };
  }

  private static async handleTapWebhook(event: string, payload: Record<string, unknown>) {
    // TODO: Verify webhook signature
    // TODO: Handle TAP webhook events
    
    console.log('TAP webhook received:', { event, payload });
    
    // Example webhook handling logic:
    // if (event === 'charge_succeeded') {
    //   const paymentId = payload.metadata.payment_id;
    //   await this.updatePaymentStatus(paymentId, 'COMPLETED');
    // }
  }

  private static async handleHyperPayWebhook(event: string, payload: Record<string, unknown>) {
    // TODO: Verify webhook signature
    // TODO: Handle HyperPay webhook events
    
    console.log('HyperPay webhook received:', { event, payload });
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats(filters: { dateFrom?: Date; dateTo?: Date } = {}) {
    const where: Record<string, unknown> = {};
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) (where.createdAt as Record<string, unknown>).gte = filters.dateFrom;
      if (filters.dateTo) (where.createdAt as Record<string, unknown>).lte = filters.dateTo;
    }

    const [
      totalPayments,
      completedPayments,
      failedPayments,
      totalRevenue,
      paymentsByProvider,
    ] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.count({
        where: { ...where, status: 'COMPLETED' },
      }),
      prisma.payment.count({
        where: { ...where, status: { in: ['FAILED', 'CANCELLED'] } },
      }),
      prisma.payment.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ['provider'],
        where,
        _count: { id: true },
      }),
    ]);

    const successRate = totalPayments > 0 
      ? (completedPayments / totalPayments) * 100 
      : 0;

    return {
      totalPayments,
      completedPayments,
      failedPayments,
      successRate: Math.round(successRate * 100) / 100,
      totalRevenue: totalRevenue._sum.amount || 0,
      paymentsByProvider: paymentsByProvider.reduce((acc, stat) => {
        acc[stat.provider] = stat._count.id;
        return acc;
      }, {} as Record<PaymentProvider, number>),
    };
  }
}