-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "whatsapp" TEXT,
    "items" JSONB NOT NULL,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
