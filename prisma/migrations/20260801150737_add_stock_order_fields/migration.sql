-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "acquisitionChannel" TEXT NOT NULL DEFAULT 'organic_web',
ADD COLUMN     "address" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending_payment';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
