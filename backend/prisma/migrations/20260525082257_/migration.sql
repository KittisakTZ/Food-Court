-- =================================================================
-- Migration: Convert partitioned Order/OrderItem to normal tables
-- and add stock, openTime, closeTime columns
-- =================================================================

-- Step 1: Drop the composite FK on Review that references Order's old composite PK
-- (also dropped automatically when Order is dropped with CASCADE, but explicit is safer)
ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_orderId_orderStoreId_fkey";

-- Step 2: Drop partitioned OrderItem table with CASCADE
-- (removes all OrderItem_<storeId> partition tables and their FKs)
DROP TABLE IF EXISTS "OrderItem" CASCADE;

-- Step 3: Drop partitioned Order table with CASCADE
-- (removes all Order_<storeId> partition tables, indexes Order_storeId_idx,
--  Order_storeId_orderDate_idx, and FKs Order_buyerId_fkey, Order_storeId_fkey)
DROP TABLE IF EXISTS "Order" CASCADE;

-- Step 4: Recreate Order as a normal non-partitioned table with simple PRIMARY KEY
CREATE TABLE "Order" (
    "id"               TEXT NOT NULL,
    "buyerId"          TEXT NOT NULL,
    "storeId"          TEXT NOT NULL,
    "status"           "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description"      TEXT,
    "paymentMethod"    "PaymentMethod",
    "paymentQrCode"    TEXT,
    "paymentSlip"      TEXT,
    "paymentExpiresAt" TIMESTAMP(3),
    "isReviewed"       BOOLEAN NOT NULL DEFAULT false,
    "position"         DOUBLE PRECISION NOT NULL,
    "queueNumber"      INTEGER NOT NULL,
    "orderDate"        DATE NOT NULL,
    "scheduledPickup"  TIMESTAMP(3),
    "paidAt"           TIMESTAMP(3),
    "confirmedAt"      TIMESTAMP(3),
    "completedAt"      TIMESTAMP(3),
    "startCookingAt"   TIMESTAMP(3),
    "estimatedReadyAt" TIMESTAMP(3),
    "hasIssue"         BOOLEAN NOT NULL DEFAULT false,
    "issueReason"      TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Order_storeId_orderDate_idx" ON "Order"("storeId", "orderDate");

ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey"
    FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Recreate OrderItem as a normal non-partitioned table with simple PRIMARY KEY
CREATE TABLE "OrderItem" (
    "id"       TEXT NOT NULL,
    "orderId"  TEXT NOT NULL,
    "storeId"  TEXT NOT NULL,
    "menuId"   TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderItem_storeId_idx" ON "OrderItem"("storeId");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuId_fkey"
    FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Add new columns
ALTER TABLE "Menu" ADD COLUMN "stock" INTEGER;
ALTER TABLE "Store" ADD COLUMN "openTime" TEXT;
ALTER TABLE "Store" ADD COLUMN "closeTime" TEXT;

-- Step 7: Remove orderStoreId from Review (no longer needed since Order PK is now simple)
ALTER TABLE "Review" DROP COLUMN IF EXISTS "orderStoreId";

-- Step 8: Add FK from Review.orderId to Order.id (now a simple PK)
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
