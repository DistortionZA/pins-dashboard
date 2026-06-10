-- CreateTable
CREATE TABLE "CalculatorProfile" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CalculatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalculatorProfile_code_key" ON "CalculatorProfile"("code");

-- AlterTable
ALTER TABLE "GarmentMarkup" ADD COLUMN "calculatorProfileId" TEXT;

-- Backfill existing rows into the default EU calculator profile.
INSERT INTO "CalculatorProfile" ("id", "code", "name", "isActive")
VALUES ('standard-eu-profile', 'STANDARD_EU', 'Standard EU Calculator', true);

UPDATE "GarmentMarkup"
SET "calculatorProfileId" = 'standard-eu-profile'
WHERE "calculatorProfileId" IS NULL;

ALTER TABLE "GarmentMarkup" ALTER COLUMN "calculatorProfileId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GarmentMarkup_calculatorProfileId_garmentType_key" ON "GarmentMarkup"("calculatorProfileId", "garmentType");

-- AddForeignKey
ALTER TABLE "GarmentMarkup"
ADD CONSTRAINT "GarmentMarkup_calculatorProfileId_fkey"
FOREIGN KEY ("calculatorProfileId") REFERENCES "CalculatorProfile"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
