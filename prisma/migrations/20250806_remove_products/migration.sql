-- Drop foreign key constraints first
ALTER TABLE "BookingItem" DROP CONSTRAINT IF EXISTS "BookingItem_productId_fkey";
ALTER TABLE "BookingItem" DROP CONSTRAINT IF EXISTS "BookingItem_bookingId_fkey";
ALTER TABLE "InventoryLog" DROP CONSTRAINT IF EXISTS "InventoryLog_productId_fkey";
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_orderId_fkey";
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_bookingId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_businessId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_businessId_fkey";
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
ALTER TABLE "ProductCategory" DROP CONSTRAINT IF EXISTS "ProductCategory_businessId_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "BookingItem_bookingId_idx";
DROP INDEX IF EXISTS "BookingItem_productId_idx";
DROP INDEX IF EXISTS "InventoryLog_productId_createdAt_idx";
DROP INDEX IF EXISTS "Order_businessId_status_idx";
DROP INDEX IF EXISTS "Order_userId_idx";
DROP INDEX IF EXISTS "OrderItem_orderId_idx";
DROP INDEX IF EXISTS "OrderItem_productId_idx";
DROP INDEX IF EXISTS "Product_businessId_categoryId_idx";
DROP INDEX IF EXISTS "Product_businessId_isActive_idx";
DROP INDEX IF EXISTS "Product_businessId_isFeatured_idx";
DROP INDEX IF EXISTS "ProductCategory_businessId_isActive_idx";

-- Drop unique constraints
DROP INDEX IF EXISTS "Order_orderNumber_key";
DROP INDEX IF EXISTS "Order_stripePaymentIntentId_key";
DROP INDEX IF EXISTS "Order_bookingId_key";
DROP INDEX IF EXISTS "Product_businessId_sku_key";
DROP INDEX IF EXISTS "ProductCategory_businessId_name_key";

-- Drop tables
DROP TABLE IF EXISTS "BookingItem";
DROP TABLE IF EXISTS "InventoryLog";
DROP TABLE IF EXISTS "OrderItem";
DROP TABLE IF EXISTS "Order";
DROP TABLE IF EXISTS "Product";
DROP TABLE IF EXISTS "ProductCategory";

-- Drop enums
DROP TYPE IF EXISTS "InventoryLogType";
DROP TYPE IF EXISTS "OrderType";
DROP TYPE IF EXISTS "OrderStatus";
DROP TYPE IF EXISTS "FulfillmentType";

-- Update PromotionScope enum to remove product-related values
-- First, update any existing data
UPDATE "Promotion" SET "scope" = 'ENTIRE_PURCHASE' WHERE "scope" IN ('ALL_PRODUCTS', 'SPECIFIC_PRODUCTS');

-- Create new enum without product values
CREATE TYPE "PromotionScope_new" AS ENUM ('ALL_SERVICES', 'SPECIFIC_SERVICES', 'ENTIRE_PURCHASE');

-- Update the column to use the new enum
ALTER TABLE "Promotion" ALTER COLUMN "scope" TYPE "PromotionScope_new" USING ("scope"::text::"PromotionScope_new");

-- Drop the old enum
DROP TYPE "PromotionScope";

-- Rename the new enum
ALTER TYPE "PromotionScope_new" RENAME TO "PromotionScope";

-- Remove productIds column from Promotion table
ALTER TABLE "Promotion" DROP COLUMN IF EXISTS "productIds";

-- Remove orderId column from PromotionUsage table (if exists)
ALTER TABLE "PromotionUsage" DROP COLUMN IF EXISTS "orderId";