// TypeScript interfaces for Seller API endpoints

export interface SellerProfile {
  id: string;
  businessName: string;
  businessNameAr?: string;
  commercialRegistration?: string;
  vatNumber?: string;
  contactPerson: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  website?: string;
  logo?: string;
  description?: string;
  descriptionAr?: string;
  specializations: string[];
  workingHours: WorkingHour[];
  certifications: string[];
  establishedYear?: number;
  employeeCount?: string;
  isVerified: boolean;
  verificationDocuments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHour {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export interface SellerSettings {
  id: string;
  sellerId: string;
  storeName: string;
  storeNameAr: string;
  storeSlug: string;
  currency: string;
  language: string;
  timeZone: string;
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  showPrices: boolean;
  showStock: boolean;
  allowNegotiation: boolean;
  autoAcceptOrders: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  minimumOrderValue: number;
  deliveryRadius: number;
  freeShippingThreshold: number;
  returnPolicy: string;
  returnPolicyAr: string;
  privacyPolicy: string;
  privacyPolicyAr: string;
  termsOfService: string;
  termsOfServiceAr: string;
  socialMedia: SocialMediaLink[];
  paymentMethods: PaymentMethod[];
  shippingMethods: ShippingMethod[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
  isActive: boolean;
}

export interface PaymentMethod {
  method: string;
  isEnabled: boolean;
  fees: number;
}

export interface ShippingMethod {
  name: string;
  nameAr: string;
  cost: number;
  estimatedDays: string;
  isActive: boolean;
}

export interface SellerAnalytics {
  sellerId: string;
  profileCompletion: number;
  trustScore: number;
  customerSatisfaction: number;
  responseTime: string;
  totalOrders: number;
  totalRevenue: number;
  monthlyGrowth: number;
  topCategories: string[];
  averageRating: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  period: string;
  updatedAt: string;
}

export interface SellerDashboard {
  overview: {
    totalViews: number;
    totalInquiries: number;
    totalOrders: number;
    totalRevenue: number;
    totalNewListings: number;
    activeListings: number;
    averageRating: number;
    totalReviews: number;
    totalSales: number;
    isVerified: boolean;
  };
  growth: {
    viewsGrowth: number;
    inquiriesGrowth: number;
    ordersGrowth: number;
    revenueGrowth: number;
  };
  chartData: ChartDataPoint[];
  topListings: TopListing[];
  recentOrders: RecentOrder[];
}

export interface ChartDataPoint {
  date: string;
  views: number;
  inquiries: number;
  orders: number;
  revenue: number;
}

export interface TopListing {
  id: string;
  title: string;
  titleEn?: string;
  views: number;
  price: number;
  image: string | null;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  items: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface SellerCounts {
  orders: {
    pending: number;
    processing: number;
    ready: number;
    shipped: number;
    completed: number;
    returns: number;
    total: number;
  };
  inventory: {
    total: number;
    draft: number;
    lowStock: number;
    outOfStock: number;
    archived: number;
  };
  messages: {
    unread: number;
  };
  activity: {
    recentViews: number;
    recentInquiries: number;
    newCustomers: number;
  };
  summary: {
    activeOrders: number;
    urgentActions: number;
    totalProducts: number;
  };
}

// Campaign interfaces
export interface SellerCampaign {
  id: string;
  sellerId: string;
  name: string;
  nameAr: string;
  type: 'DISCOUNT' | 'PROMOTION' | 'FLASH_SALE' | 'BUNDLE';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  targetAudience: string[];
  applicableItems: string[];
  usageLimit?: number;
  usedCount: number;
  description?: string;
  descriptionAr?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  metadata?: any;
}

// Order interfaces for seller view
export interface SellerOrder {
  id: string;
  orderNumber: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: SellerOrderItem[];
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shippingMethod?: string;
  trackingNumber?: string;
  shippingAddress: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  notes?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOrderItem {
  id: string;
  listing: {
    id: string;
    titleAr: string;
    titleEn?: string;
    sku: string;
    photos: { url: string; alt?: string }[];
  };
  qty: number;
  priceSar: number;
}

// Listing interfaces for inventory
export interface SellerListing {
  id: string;
  titleAr: string;
  titleEn?: string;
  sku: string;
  priceSar: number;
  quantity: number;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  condition: 'NEW' | 'REFURBISHED' | 'USED';
  status: 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'SUSPENDED';
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  photos: { url: string; alt?: string }[];
  categoryId: string;
  sellerId: string;
}

export interface InventoryStats {
  overview: {
    totalListings: number;
    published: number;
    draft: number;
    sold: number;
    suspended: number;
    totalQuantity: number;
    totalViews: number;
  };
  stockAlerts: {
    lowStock: number;
    outOfStock: number;
  };
  activity: {
    newListingsThisMonth: number;
  };
  topPerformers: TopListing[];
}

export type SellerApiEndpoints = {
  // Profile endpoints
  'GET /api/sellers/[id]/profile': ApiResponse<SellerProfile>;
  'PUT /api/sellers/[id]/profile': ApiResponse<SellerProfile>;
  
  // Settings endpoints
  'GET /api/sellers/[id]/settings': ApiResponse<SellerSettings>;
  'PUT /api/sellers/[id]/settings': ApiResponse<SellerSettings>;
  
  // Analytics endpoints
  'GET /api/sellers/[id]/analytics': ApiResponse<SellerAnalytics>;
  'GET /api/sellers/[id]/dashboard': ApiResponse<SellerDashboard>;
  'GET /api/sellers/[id]/counts': ApiResponse<SellerCounts>;
  
  // Campaign endpoints
  'GET /api/sellers/[id]/campaigns': PaginatedResponse<SellerCampaign>;
  'POST /api/sellers/[id]/campaigns': ApiResponse<SellerCampaign>;
  'PUT /api/sellers/[id]/campaigns/[campaignId]': ApiResponse<SellerCampaign>;
  'DELETE /api/sellers/[id]/campaigns/[campaignId]': ApiResponse<{ success: boolean }>;
  
  // Order endpoints
  'GET /api/orders': PaginatedResponse<SellerOrder>;
  'PUT /api/orders/[id]/status': ApiResponse<SellerOrder>;
  
  // Listing endpoints
  'GET /api/listings': PaginatedResponse<SellerListing>;
  'POST /api/listings': ApiResponse<SellerListing>;
  'PUT /api/listings/[id]': ApiResponse<SellerListing>;
  'DELETE /api/listings/[id]': ApiResponse<{ success: boolean }>;
};