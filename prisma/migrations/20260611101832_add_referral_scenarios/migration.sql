-- CreateTable
CREATE TABLE "ReferralScenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "rulesJson" JSONB NOT NULL,
    "testCasesJson" JSONB NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralScenario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReferralScenario_updatedAt_idx" ON "ReferralScenario"("updatedAt");

-- CreateIndex
CREATE INDEX "ReferralScenario_name_idx" ON "ReferralScenario"("name");
