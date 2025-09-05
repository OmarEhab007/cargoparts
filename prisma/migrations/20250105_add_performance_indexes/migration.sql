-- Performance indexes for CargoParts database

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON "User"(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON "User"(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON "User"(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON "User"("createdAt" DESC);

-- Seller indexes
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON "Seller"("userId");
CREATE INDEX IF NOT EXISTS idx_sellers_verified ON "Seller"(verified);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON "Seller"(status);
CREATE INDEX IF NOT EXISTS idx_sellers_rating ON "Seller"(rating DESC);
CREATE INDEX IF NOT EXISTS idx_sellers_total_sales ON "Seller"("totalSales" DESC);
CREATE INDEX IF NOT EXISTS idx_sellers_slug ON "Seller"(slug);
CREATE INDEX IF NOT EXISTS idx_sellers_city ON "Seller"(city);

-- Listing indexes
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON "Listing"("sellerId");
CREATE INDEX IF NOT EXISTS idx_listings_status ON "Listing"(status);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON "Listing"("categoryId");
CREATE INDEX IF NOT EXISTS idx_listings_make_model ON "Listing"(make, model);
CREATE INDEX IF NOT EXISTS idx_listings_year_range ON "Listing"("fromYear", "toYear");
CREATE INDEX IF NOT EXISTS idx_listings_price ON "Listing"("priceSar");
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON "Listing"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_listings_view_count ON "Listing"("viewCount" DESC);
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON "Listing"("isFeatured");
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON "Listing"("isActive");
CREATE INDEX IF NOT EXISTS idx_listings_published_at ON "Listing"("publishedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_listings_sku ON "Listing"(sku);
CREATE INDEX IF NOT EXISTS idx_listings_city ON "Listing"(city);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_seller_status ON "Listing"("sellerId", status);
CREATE INDEX IF NOT EXISTS idx_listings_active_published ON "Listing"("isActive", status, "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_listings_category_active ON "Listing"("categoryId", "isActive", status);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON "Order"("userId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON "Order"(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON "Order"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON "Order"("orderNumber");
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON "Order"("shippingStatus");

-- OrderItem indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS idx_order_items_listing_id ON "OrderItem"("listingId");
CREATE INDEX IF NOT EXISTS idx_order_items_seller_earnings ON "OrderItem"("sellerEarnings");

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON "Payment"("orderId");
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON "Payment"("userId");
CREATE INDEX IF NOT EXISTS idx_payments_status ON "Payment"(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON "Payment"(method);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON "Payment"("transactionId");
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON "Payment"("createdAt" DESC);

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON "Session"("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON "Session"("expiresAt");
CREATE INDEX IF NOT EXISTS idx_sessions_token ON "Session"(token);

-- Cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON "Cart"("userId");
CREATE INDEX IF NOT EXISTS idx_cart_updated_at ON "Cart"("updatedAt" DESC);

-- CartItem indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON "CartItem"("cartId");
CREATE INDEX IF NOT EXISTS idx_cart_items_listing_id ON "CartItem"("listingId");

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON "Review"("listingId");
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON "Review"("userId");
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON "Review"("orderId");
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON "Review"(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON "Review"("createdAt" DESC);

-- SellerAnalytics indexes
CREATE INDEX IF NOT EXISTS idx_seller_analytics_seller_id ON "SellerAnalytics"("sellerId");
CREATE INDEX IF NOT EXISTS idx_seller_analytics_date ON "SellerAnalytics"(date DESC);
CREATE INDEX IF NOT EXISTS idx_seller_analytics_seller_date ON "SellerAnalytics"("sellerId", date DESC);

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON "Category"("parentId");
CREATE INDEX IF NOT EXISTS idx_categories_slug ON "Category"(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON "Category"("isActive");

-- OTP indexes
CREATE INDEX IF NOT EXISTS idx_otps_user_id ON "Otp"("userId");
CREATE INDEX IF NOT EXISTS idx_otps_type ON "Otp"(type);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON "Otp"("expiresAt");
CREATE INDEX IF NOT EXISTS idx_otps_verified ON "Otp"(verified);

-- Inquiry indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_listing_id ON "Inquiry"("listingId");
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON "Inquiry"("userId");
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON "Inquiry"(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON "Inquiry"("createdAt" DESC);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON "Notification"("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON "Notification"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON "Notification"("userId", "isRead") WHERE "isRead" = false;

-- SellerSettings indexes
CREATE INDEX IF NOT EXISTS idx_seller_settings_seller_id ON "SellerSettings"("sellerId");

-- SellerPaymentMethod indexes
CREATE INDEX IF NOT EXISTS idx_seller_payment_methods_seller_id ON "SellerPaymentMethod"("sellerId");
CREATE INDEX IF NOT EXISTS idx_seller_payment_methods_enabled ON "SellerPaymentMethod"("isEnabled");

-- SellerShippingMethod indexes
CREATE INDEX IF NOT EXISTS idx_seller_shipping_methods_seller_id ON "SellerShippingMethod"("sellerId");
CREATE INDEX IF NOT EXISTS idx_seller_shipping_methods_active ON "SellerShippingMethod"("isActive");

-- Full text search indexes (PostgreSQL specific)
-- Note: These require the pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full text search on listings
CREATE INDEX IF NOT EXISTS idx_listings_title_ar_trgm ON "Listing" USING gin ("titleAr" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_title_en_trgm ON "Listing" USING gin ("titleEn" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_description_ar_trgm ON "Listing" USING gin ("descriptionAr" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_description_en_trgm ON "Listing" USING gin ("descriptionEn" gin_trgm_ops);

-- Full text search on sellers
CREATE INDEX IF NOT EXISTS idx_sellers_business_name_trgm ON "Seller" USING gin ("businessName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sellers_store_name_trgm ON "Seller" USING gin ("storeName" gin_trgm_ops);

-- Full text search on users
CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON "User" USING gin (name gin_trgm_ops);

-- Analyze tables to update statistics
ANALYZE "User";
ANALYZE "Seller";
ANALYZE "Listing";
ANALYZE "Order";
ANALYZE "OrderItem";
ANALYZE "Payment";
ANALYZE "Session";
ANALYZE "Cart";
ANALYZE "CartItem";
ANALYZE "Review";
ANALYZE "SellerAnalytics";
ANALYZE "Category";
ANALYZE "Otp";
ANALYZE "Inquiry";
ANALYZE "Notification";