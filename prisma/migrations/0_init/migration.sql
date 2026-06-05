-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PrintPosition" AS ENUM ('FRONT', 'BACK', 'LEFT_SLEEVE', 'RIGHT_SLEEVE', 'NECK');

-- CreateEnum
CREATE TYPE "GarmentType" AS ENUM ('TSHIRT', 'LONGSLEEVE', 'HOODIE');

-- CreateTable
CREATE TABLE "Garment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "altCode" TEXT NOT NULL DEFAULT '',
    "brandName" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '',
    "type" "GarmentType" NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "extraSizeCost" DOUBLE PRECISION,
    "tags" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Garment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GarmentMarkup" (
    "id" TEXT NOT NULL,
    "garmentType" "GarmentType" NOT NULL,
    "markupValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GarmentMarkup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintPrice" (
    "id" TEXT NOT NULL,
    "colorCount" INTEGER NOT NULL,
    "qtyMin" INTEGER NOT NULL,
    "qtyMax" INTEGER NOT NULL,
    "productionPrice" DOUBLE PRECISION NOT NULL,
    "pinsPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PrintPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "garmentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignPrint" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "position" "PrintPosition" NOT NULL,
    "colorCount" INTEGER NOT NULL,

    CONSTRAINT "DesignPrint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_garmentId_fkey" FOREIGN KEY ("garmentId") REFERENCES "Garment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignPrint" ADD CONSTRAINT "DesignPrint_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
