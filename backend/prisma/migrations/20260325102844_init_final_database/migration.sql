-- =================================================================
--
--  COMPLETE UPDATED MIGRATION.SQL
--  SAFE VERSION FOR PRISMA MIGRATE DEV
--
-- =================================================================

-- ================================================================
-- ENUMS
-- ================================================================

DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM (
        'ADMIN',
        'SELLER',
        'BUYER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM (
        'PENDING',
        'REJECTED',
        'AWAITING_PAYMENT',
        'AWAITING_CONFIRMATION',
        'PAID',
        'COOKING',
        'READY_FOR_PICKUP',
        'COMPLETED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM (
        'PROMPTPAY',
        'CASH_ON_PICKUP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MenuType" AS ENUM (
        'MAIN',
        'DRINK',
        'DESSERT',
        'SNACK',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Gender" AS ENUM (
        'MALE',
        'FEMALE',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ================================================================
-- USER
-- ================================================================

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'BUYER',

    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "gender" "Gender",

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key"
ON "User"("username");

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"
ON "User"("email");

-- ================================================================
-- STORE
-- ================================================================

CREATE TABLE IF NOT EXISTS "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "image" TEXT,

    "promptPayId" TEXT,

    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,

    "closeReason" TEXT,
    "reopenAt" TIMESTAMP(3),

    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,

    "ownerId" TEXT NOT NULL,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Store_name_key"
ON "Store"("name");

CREATE UNIQUE INDEX IF NOT EXISTS "Store_ownerId_key"
ON "Store"("ownerId");

ALTER TABLE "Store"
DROP CONSTRAINT IF EXISTS "Store_ownerId_fkey";

ALTER TABLE "Store"
ADD CONSTRAINT "Store_ownerId_fkey"
FOREIGN KEY ("ownerId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- ================================================================
-- MENU CATEGORY
-- ================================================================

CREATE TABLE IF NOT EXISTS "MenuCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "menuType" "MenuType" NOT NULL DEFAULT 'OTHER',
    "storeId" TEXT NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MenuCategory_name_storeId_key"
ON "MenuCategory"("name", "storeId");

ALTER TABLE "MenuCategory"
DROP CONSTRAINT IF EXISTS "MenuCategory_storeId_fkey";

ALTER TABLE "MenuCategory"
ADD CONSTRAINT "MenuCategory_storeId_fkey"
FOREIGN KEY ("storeId")
REFERENCES "Store"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- ================================================================
-- MENU
-- ================================================================

CREATE TABLE IF NOT EXISTS "Menu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    "price" DOUBLE PRECISION NOT NULL,
    "cookingTime" INTEGER NOT NULL DEFAULT 5,

    "image" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    "categoryId" TEXT,
    "storeId" TEXT NOT NULL,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Menu"
DROP CONSTRAINT IF EXISTS "Menu_categoryId_fkey";

ALTER TABLE "Menu"
ADD CONSTRAINT "Menu_categoryId_fkey"
FOREIGN KEY ("categoryId")
REFERENCES "MenuCategory"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Menu"
DROP CONSTRAINT IF EXISTS "Menu_storeId_fkey";

ALTER TABLE "Menu"
ADD CONSTRAINT "Menu_storeId_fkey"
FOREIGN KEY ("storeId")
REFERENCES "Store"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- ================================================================
-- ORDER
-- ================================================================

CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,

    "buyerId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,

    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',

    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,

    "paymentMethod" "PaymentMethod",
    "paymentQrCode" TEXT,
    "paymentSlip" TEXT,
    "paymentExpiresAt" TIMESTAMP(3),

    "isReviewed" BOOLEAN NOT NULL DEFAULT false,

    "position" DOUBLE PRECISION NOT NULL,
    "queueNumber" INTEGER NOT NULL,

    "orderDate" DATE NOT NULL,

    "scheduledPickup" TIMESTAMP(3),

    "paidAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    "startCookingAt" TIMESTAMP(3),
    "estimatedReadyAt" TIMESTAMP(3),

    "hasIssue" BOOLEAN NOT NULL DEFAULT false,
    "issueReason" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey"
    PRIMARY KEY ("id", "storeId")
)
PARTITION BY LIST ("storeId");

CREATE INDEX IF NOT EXISTS "Order_storeId_idx"
ON "Order"("storeId");

CREATE INDEX IF NOT EXISTS "Order_storeId_orderDate_idx"
ON "Order"("storeId", "orderDate");

ALTER TABLE "Order"
DROP CONSTRAINT IF EXISTS "Order_buyerId_fkey";

ALTER TABLE "Order"
ADD CONSTRAINT "Order_buyerId_fkey"
FOREIGN KEY ("buyerId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Order"
DROP CONSTRAINT IF EXISTS "Order_storeId_fkey";

ALTER TABLE "Order"
ADD CONSTRAINT "Order_storeId_fkey"
FOREIGN KEY ("storeId")
REFERENCES "Store"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- ================================================================
-- ORDER ITEM
-- ================================================================

CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,

    "orderId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,

    "menuId" TEXT NOT NULL,

    "quantity" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey"
    PRIMARY KEY ("id", "storeId")
)
PARTITION BY LIST ("storeId");

CREATE INDEX IF NOT EXISTS "OrderItem_storeId_idx"
ON "OrderItem"("storeId");

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx"
ON "OrderItem"("orderId");

ALTER TABLE "OrderItem"
DROP CONSTRAINT IF EXISTS "OrderItem_menuId_fkey";

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_menuId_fkey"
FOREIGN KEY ("menuId")
REFERENCES "Menu"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- ================================================================
-- REVIEW
-- ================================================================

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,

    "rating" INTEGER NOT NULL,
    "comment" TEXT,

    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,

    "storeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    "orderId" TEXT,
    "orderStoreId" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Review_orderId_key"
ON "Review"("orderId")
WHERE "orderId" IS NOT NULL;

ALTER TABLE "Review"
DROP CONSTRAINT IF EXISTS "Review_storeId_fkey";

ALTER TABLE "Review"
ADD CONSTRAINT "Review_storeId_fkey"
FOREIGN KEY ("storeId")
REFERENCES "Store"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Review"
DROP CONSTRAINT IF EXISTS "Review_userId_fkey";

ALTER TABLE "Review"
ADD CONSTRAINT "Review_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Review"
DROP CONSTRAINT IF EXISTS "Review_orderId_orderStoreId_fkey";

ALTER TABLE "Review"
ADD CONSTRAINT "Review_orderId_orderStoreId_fkey"
FOREIGN KEY ("orderId", "orderStoreId")
REFERENCES "Order"("id", "storeId")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- ================================================================
-- CART
-- ================================================================

CREATE TABLE IF NOT EXISTS "carts" (
    "id" TEXT NOT NULL,

    "userId" TEXT NOT NULL,
    "storeId" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "carts_userId_key"
ON "carts"("userId");

ALTER TABLE "carts"
DROP CONSTRAINT IF EXISTS "carts_userId_fkey";

ALTER TABLE "carts"
ADD CONSTRAINT "carts_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- ================================================================
-- CART ITEMS
-- ================================================================

CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" TEXT NOT NULL,

    "cartId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,

    "quantity" INTEGER NOT NULL,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_cartId_menuId_key"
ON "cart_items"("cartId", "menuId");

ALTER TABLE "cart_items"
DROP CONSTRAINT IF EXISTS "cart_items_cartId_fkey";

ALTER TABLE "cart_items"
ADD CONSTRAINT "cart_items_cartId_fkey"
FOREIGN KEY ("cartId")
REFERENCES "carts"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "cart_items"
DROP CONSTRAINT IF EXISTS "cart_items_menuId_fkey";

ALTER TABLE "cart_items"
ADD CONSTRAINT "cart_items_menuId_fkey"
FOREIGN KEY ("menuId")
REFERENCES "Menu"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- ================================================================
-- CHAT ROOMS
-- ================================================================

CREATE TABLE IF NOT EXISTS "chat_rooms" (
    "id" TEXT NOT NULL,

    "buyerId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_rooms_buyerId_storeId_key"
ON "chat_rooms"("buyerId", "storeId");

ALTER TABLE "chat_rooms"
DROP CONSTRAINT IF EXISTS "chat_rooms_buyerId_fkey";

ALTER TABLE "chat_rooms"
ADD CONSTRAINT "chat_rooms_buyerId_fkey"
FOREIGN KEY ("buyerId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "chat_rooms"
DROP CONSTRAINT IF EXISTS "chat_rooms_storeId_fkey";

ALTER TABLE "chat_rooms"
ADD CONSTRAINT "chat_rooms_storeId_fkey"
FOREIGN KEY ("storeId")
REFERENCES "Store"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- ================================================================
-- CHAT MESSAGES
-- ================================================================

CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT NOT NULL,

    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    "content" TEXT NOT NULL,

    "isRead" BOOLEAN NOT NULL DEFAULT false,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "chat_messages"
DROP CONSTRAINT IF EXISTS "chat_messages_roomId_fkey";

ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_roomId_fkey"
FOREIGN KEY ("roomId")
REFERENCES "chat_rooms"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "chat_messages"
DROP CONSTRAINT IF EXISTS "chat_messages_senderId_fkey";

ALTER TABLE "chat_messages"
ADD CONSTRAINT "chat_messages_senderId_fkey"
FOREIGN KEY ("senderId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- ================================================================
-- PARTITION FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION create_store_partitions(store_id TEXT)
RETURNS void AS $$
BEGIN

    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS "Order_%s"
         PARTITION OF "Order"
         FOR VALUES IN (%L)',
        store_id,
        store_id
    );

    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS "OrderItem_%s"
         PARTITION OF "OrderItem"
         FOR VALUES IN (%L)',
        store_id,
        store_id
    );

    EXECUTE format(
        '
        ALTER TABLE "OrderItem_%s"
        DROP CONSTRAINT IF EXISTS "OrderItem_%s_orderId_fkey"
        ',
        store_id,
        store_id
    );

    EXECUTE format(
        '
        ALTER TABLE "OrderItem_%s"
        ADD CONSTRAINT "OrderItem_%s_orderId_fkey"
        FOREIGN KEY ("orderId", "storeId")
        REFERENCES "Order_%s"("id", "storeId")
        ON DELETE CASCADE
        ON UPDATE CASCADE
        ',
        store_id,
        store_id,
        store_id
    );

END;
$$ LANGUAGE plpgsql;