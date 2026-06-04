-- CreateTable
CREATE TABLE "Garment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "basePrice" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "GarmentMarkup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "garmentType" TEXT NOT NULL,
    "markupValue" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "PrintPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "colorCount" INTEGER NOT NULL,
    "qtyMin" INTEGER NOT NULL,
    "qtyMax" INTEGER NOT NULL,
    "productionPrice" REAL NOT NULL,
    "pinsPrice" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vatRate" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "garmentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "Design_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Design_garmentId_fkey" FOREIGN KEY ("garmentId") REFERENCES "Garment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DesignPrint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "designId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "colorCount" INTEGER NOT NULL,
    CONSTRAINT "DesignPrint_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
