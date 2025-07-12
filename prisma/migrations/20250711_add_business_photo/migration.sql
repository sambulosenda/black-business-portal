-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('HERO', 'GALLERY', 'LOGO', 'BANNER');

-- CreateTable
CREATE TABLE "BusinessPhoto" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "PhotoType" NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessPhoto_businessId_type_idx" ON "BusinessPhoto"("businessId", "type");

-- CreateIndex
CREATE INDEX "BusinessPhoto_businessId_isActive_idx" ON "BusinessPhoto"("businessId", "isActive");

-- AddForeignKey
ALTER TABLE "BusinessPhoto" ADD CONSTRAINT "BusinessPhoto_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;