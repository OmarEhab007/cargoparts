// Shared order types for the seller dashboard
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  nameAr: string;
  nameEn?: string;
  sku: string;
  oem?: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
  make?: string;
  model?: string;
  year?: string;
  condition?: 'new' | 'used' | 'refurbished';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  rating: number;
  avatar?: string;
  isVip?: boolean;
  city?: string;
  preferredLanguage?: 'ar' | 'en';
}

export interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  method: 'standard' | 'express' | 'same_day';
  carrier?: 'aramex' | 'smsa' | 'dhl' | 'ups' | 'fedex';
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  cost: number;
  instructions?: string;
}

export interface PaymentInfo {
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'mada' | 'apple_pay' | 'stc_pay' | 'cash_on_delivery';
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  amount: number;
  refundAmount?: number;
  gateway?: 'tap' | 'hyperpay' | 'mada';
  last4?: string; // Last 4 digits for card payments
}

export interface OrderTimeline {
  id: string;
  status: OrderStatus;
  timestamp: string;
  note?: string;
  user?: string;
  userId?: string;
  automated?: boolean;
  notificationSent?: boolean;
}

export type OrderStatus = 
  | 'pending'        // New order, awaiting seller confirmation
  | 'confirmed'      // Seller confirmed, payment pending
  | 'paid'          // Payment received
  | 'processing'    // Order being prepared
  | 'ready'         // Ready for pickup/shipping
  | 'shipped'       // Package dispatched
  | 'out_for_delivery' // Out for delivery
  | 'delivered'     // Successfully delivered
  | 'cancelled'     // Order cancelled
  | 'returned'      // Order returned
  | 'refunded';     // Order refunded

export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  priority: OrderPriority;
  paymentInfo: PaymentInfo;
  shippingInfo: ShippingInfo;
  
  // Pricing
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  
  // Additional info
  notes?: string;
  internalNotes?: string;
  customerNotes?: string;
  timeline: OrderTimeline[];
  
  // Metadata
  source: 'website' | 'mobile' | 'phone' | 'whatsapp';
  assignedTo?: string; // Staff member ID
  tags?: string[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  
  // Features
  isUrgent?: boolean;
  requiresVerification?: boolean;
  hasSpecialInstructions?: boolean;
  
  // Communication
  lastContactAt?: string;
  communicationPreference?: 'email' | 'sms' | 'whatsapp' | 'phone';
}

export interface OrderStats {
  total: number;
  new: number;
  pending: number;
  confirmed: number;
  processing: number;
  ready: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  
  // Time-based stats
  todayOrders: number;
  todayRevenue: number;
  weeklyOrders: number;
  weeklyRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  
  // Performance metrics
  averageProcessingTime: number; // in hours
  averageDeliveryTime: number; // in days
  fulfillmentRate: number; // percentage
  returnRate: number; // percentage
  customerSatisfaction: number; // average rating
}

export interface OrderFilter {
  status?: OrderStatus[];
  dateRange?: {
    from: string;
    to: string;
  };
  customerType?: 'all' | 'vip' | 'new' | 'regular';
  priority?: OrderPriority[];
  paymentStatus?: PaymentInfo['status'][];
  shippingMethod?: ShippingInfo['method'][];
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  assignedTo?: string[];
  tags?: string[];
  source?: Order['source'][];
}

export interface OrderSort {
  field: 'orderNumber' | 'customer' | 'total' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// Saudi-specific configurations
export const SAUDI_CITIES = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'القطيف',
  'خميس مشيط',
  'بريدة',
  'تبوك',
  'الطائف',
  'حائل',
  'الجبيل',
  'ينبع',
  'نجران'
] as const;

export const SHIPPING_CARRIERS = {
  aramex: {
    nameAr: 'أرامكس',
    nameEn: 'Aramex',
    trackingUrl: 'https://www.aramex.com/track/results',
    supportedServices: ['standard', 'express'],
  },
  smsa: {
    nameAr: 'سمسا إكسبريس',
    nameEn: 'SMSA Express',
    trackingUrl: 'https://www.smsaexpress.com/tracking/',
    supportedServices: ['standard', 'express', 'same_day'],
  },
  dhl: {
    nameAr: 'دي إتش إل',
    nameEn: 'DHL',
    trackingUrl: 'https://www.dhl.com/tracking',
    supportedServices: ['express'],
  },
  ups: {
    nameAr: 'يو بي إس',
    nameEn: 'UPS',
    trackingUrl: 'https://www.ups.com/track',
    supportedServices: ['standard', 'express'],
  },
  fedex: {
    nameAr: 'فيدكس',
    nameEn: 'FedEx',
    trackingUrl: 'https://www.fedex.com/tracking',
    supportedServices: ['standard', 'express'],
  },
} as const;

export const ORDER_STATUS_CONFIG = {
  pending: {
    labelAr: 'قيد الانتظار',
    labelEn: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    badgeVariant: 'secondary' as const,
    icon: 'Clock',
    description: {
      ar: 'الطلب بحاجة لمراجعة وتأكيد',
      en: 'Order needs review and confirmation'
    },
    allowedTransitions: ['confirmed', 'cancelled'],
  },
  confirmed: {
    labelAr: 'مؤكد',
    labelEn: 'Confirmed',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    badgeVariant: 'default' as const,
    icon: 'CheckSquare',
    description: {
      ar: 'تم تأكيد الطلب وينتظر الدفع',
      en: 'Order confirmed, awaiting payment'
    },
    allowedTransitions: ['paid', 'processing', 'cancelled'],
  },
  paid: {
    labelAr: 'مدفوع',
    labelEn: 'Paid',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    badgeVariant: 'default' as const,
    icon: 'CreditCard',
    description: {
      ar: 'تم استلام الدفع وجاري تحضير الطلب',
      en: 'Payment received, preparing order'
    },
    allowedTransitions: ['processing', 'cancelled', 'refunded'],
  },
  processing: {
    labelAr: 'قيد المعالجة',
    labelEn: 'Processing',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    badgeVariant: 'secondary' as const,
    icon: 'Package',
    description: {
      ar: 'جاري تحضير وتجهيز الطلب',
      en: 'Order is being prepared and packaged'
    },
    allowedTransitions: ['ready', 'shipped', 'cancelled'],
  },
  ready: {
    labelAr: 'جاهز للشحن',
    labelEn: 'Ready to Ship',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    badgeVariant: 'outline' as const,
    icon: 'Box',
    description: {
      ar: 'الطلب جاهز للشحن أو الاستلام',
      en: 'Order ready for shipping or pickup'
    },
    allowedTransitions: ['shipped', 'cancelled'],
  },
  shipped: {
    labelAr: 'تم الشحن',
    labelEn: 'Shipped',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    badgeVariant: 'outline' as const,
    icon: 'Truck',
    description: {
      ar: 'تم شحن الطلب وهو في الطريق',
      en: 'Order shipped and on the way'
    },
    allowedTransitions: ['out_for_delivery', 'delivered', 'returned'],
  },
  out_for_delivery: {
    labelAr: 'خارج للتوصيل',
    labelEn: 'Out for Delivery',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    badgeVariant: 'outline' as const,
    icon: 'MapPin',
    description: {
      ar: 'الطلب خارج للتوصيل اليوم',
      en: 'Order is out for delivery today'
    },
    allowedTransitions: ['delivered', 'returned'],
  },
  delivered: {
    labelAr: 'تم التسليم',
    labelEn: 'Delivered',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    badgeVariant: 'default' as const,
    icon: 'CheckCircle',
    description: {
      ar: 'تم تسليم الطلب بنجاح',
      en: 'Order delivered successfully'
    },
    allowedTransitions: ['returned'],
  },
  cancelled: {
    labelAr: 'ملغي',
    labelEn: 'Cancelled',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    badgeVariant: 'destructive' as const,
    icon: 'XCircle',
    description: {
      ar: 'تم إلغاء الطلب',
      en: 'Order has been cancelled'
    },
    allowedTransitions: ['refunded'],
  },
  returned: {
    labelAr: 'مرتجع',
    labelEn: 'Returned',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    badgeVariant: 'secondary' as const,
    icon: 'RotateCcw',
    description: {
      ar: 'تم إرجاع الطلب',
      en: 'Order has been returned'
    },
    allowedTransitions: ['refunded'],
  },
  refunded: {
    labelAr: 'مسترد',
    labelEn: 'Refunded',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    badgeVariant: 'outline' as const,
    icon: 'RefreshCw',
    description: {
      ar: 'تم استرداد المبلغ',
      en: 'Amount has been refunded'
    },
    allowedTransitions: [],
  },
} as const;

export const PAYMENT_STATUS_CONFIG = {
  pending: {
    labelAr: 'معلق',
    labelEn: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    badgeVariant: 'secondary' as const,
  },
  paid: {
    labelAr: 'مدفوع',
    labelEn: 'Paid',
    color: 'bg-green-100 text-green-800',
    badgeVariant: 'default' as const,
  },
  failed: {
    labelAr: 'فشل',
    labelEn: 'Failed',
    color: 'bg-red-100 text-red-800',
    badgeVariant: 'destructive' as const,
  },
  refunded: {
    labelAr: 'مسترد',
    labelEn: 'Refunded',
    color: 'bg-blue-100 text-blue-800',
    badgeVariant: 'outline' as const,
  },
  partially_refunded: {
    labelAr: 'مسترد جزئياً',
    labelEn: 'Partially Refunded',
    color: 'bg-orange-100 text-orange-800',
    badgeVariant: 'outline' as const,
  },
} as const;

export const PRIORITY_CONFIG = {
  low: {
    labelAr: 'منخفضة',
    labelEn: 'Low',
    color: 'text-gray-500',
    badgeVariant: 'outline' as const,
  },
  normal: {
    labelAr: 'عادية',
    labelEn: 'Normal',
    color: 'text-blue-500',
    badgeVariant: 'secondary' as const,
  },
  high: {
    labelAr: 'عالية',
    labelEn: 'High',
    color: 'text-orange-500',
    badgeVariant: 'default' as const,
  },
  urgent: {
    labelAr: 'عاجل',
    labelEn: 'Urgent',
    color: 'text-red-500',
    badgeVariant: 'destructive' as const,
  },
} as const;

// Helper functions
export function getStatusConfig(status: OrderStatus) {
  return ORDER_STATUS_CONFIG[status];
}

export function getPaymentStatusConfig(status: PaymentInfo['status']) {
  return PAYMENT_STATUS_CONFIG[status];
}

export function getPriorityConfig(priority: OrderPriority) {
  return PRIORITY_CONFIG[priority];
}

export function canTransitionTo(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
  return ORDER_STATUS_CONFIG[currentStatus].allowedTransitions.includes(targetStatus);
}

export function formatOrderNumber(orderNumber: string): string {
  return `#${orderNumber}`;
}

export function calculateOrderAge(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

export function getOrderUrgencyLevel(order: Order): 'normal' | 'warning' | 'critical' {
  const age = calculateOrderAge(order.createdAt);
  
  if (order.priority === 'urgent') return 'critical';
  if (order.priority === 'high' || age > 3) return 'warning';
  return 'normal';
}