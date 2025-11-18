-- CreateTable
CREATE TABLE "procurement_settings" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "autoApproveThreshold" DOUBLE PRECISION NOT NULL DEFAULT 5000000,
    "requireQCPhotos" BOOLEAN NOT NULL DEFAULT true,
    "minQCPhotoCount" INTEGER NOT NULL DEFAULT 3,
    "defaultPaymentTerm" TEXT NOT NULL DEFAULT 'NET_30',
    "enableWhatsappNotif" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" VARCHAR(20),
    "enableEmailDigest" BOOLEAN NOT NULL DEFAULT true,
    "digestFrequency" TEXT NOT NULL DEFAULT 'DAILY',
    "budgetAlertEnabled" BOOLEAN NOT NULL DEFAULT true,
    "budgetAlertThreshold" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "accountingIntegration" BOOLEAN NOT NULL DEFAULT false,
    "inventoryAutoSync" BOOLEAN NOT NULL DEFAULT true,
    "apiKeyHash" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_approval_levels" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "levelName" VARCHAR(100) NOT NULL,
    "minAmount" DOUBLE PRECISION NOT NULL,
    "maxAmount" DOUBLE PRECISION,
    "requiredRole" VARCHAR(50) NOT NULL,
    "isParallel" BOOLEAN NOT NULL DEFAULT false,
    "escalationDays" INTEGER,
    "skipOnEmergency" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_approval_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_categories" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "icon" VARCHAR(50),
    "color" VARCHAR(20),
    "monthlyBudget" DOUBLE PRECISION,
    "yearlyBudget" DOUBLE PRECISION,
    "budgetAllocPct" DOUBLE PRECISION,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "minApprovalAmount" DOUBLE PRECISION,
    "customApprover" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_notification_rules" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "eventName" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "channel" VARCHAR(50) NOT NULL,
    "recipientRoles" TEXT[],
    "recipientEmails" TEXT[],
    "recipientPhones" TEXT[],
    "template" TEXT,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "retryOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "conditionField" VARCHAR(100),
    "conditionOperator" VARCHAR(20),
    "conditionValue" VARCHAR(255),
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_notification_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_payment_terms" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "dueDays" INTEGER NOT NULL,
    "requireDP" BOOLEAN NOT NULL DEFAULT false,
    "dpPercentage" DOUBLE PRECISION DEFAULT 30,
    "dpDueDays" INTEGER DEFAULT 7,
    "allowLatePayment" BOOLEAN NOT NULL DEFAULT true,
    "lateFeeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lateFeePerDay" DOUBLE PRECISION DEFAULT 0.5,
    "maxLateFee" DOUBLE PRECISION,
    "autoRemindDays" INTEGER DEFAULT 3,
    "autoEscalateDays" INTEGER DEFAULT 7,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_payment_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_qc_checklists" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "category" VARCHAR(100),
    "checkItems" JSONB NOT NULL,
    "passThreshold" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "requirePhotos" BOOLEAN NOT NULL DEFAULT true,
    "minPhotos" INTEGER NOT NULL DEFAULT 3,
    "maxPhotos" INTEGER NOT NULL DEFAULT 10,
    "requireSignature" BOOLEAN NOT NULL DEFAULT true,
    "samplingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "samplingPct" DOUBLE PRECISION DEFAULT 10,
    "minSampleSize" INTEGER DEFAULT 5,
    "autoRejectBelow" DOUBLE PRECISION DEFAULT 60,
    "autoApproveAbove" DOUBLE PRECISION DEFAULT 95,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_qc_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "procurement_settings_sppgId_key" ON "procurement_settings"("sppgId");

-- CreateIndex
CREATE INDEX "procurement_settings_sppgId_idx" ON "procurement_settings"("sppgId");

-- CreateIndex
CREATE INDEX "procurement_approval_levels_settingsId_isActive_idx" ON "procurement_approval_levels"("settingsId", "isActive");

-- CreateIndex
CREATE INDEX "procurement_approval_levels_minAmount_maxAmount_idx" ON "procurement_approval_levels"("minAmount", "maxAmount");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_approval_levels_settingsId_level_key" ON "procurement_approval_levels"("settingsId", "level");

-- CreateIndex
CREATE INDEX "procurement_categories_settingsId_isActive_idx" ON "procurement_categories"("settingsId", "isActive");

-- CreateIndex
CREATE INDEX "procurement_categories_sortOrder_idx" ON "procurement_categories"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_categories_settingsId_code_key" ON "procurement_categories"("settingsId", "code");

-- CreateIndex
CREATE INDEX "procurement_notification_rules_settingsId_isEnabled_idx" ON "procurement_notification_rules"("settingsId", "isEnabled");

-- CreateIndex
CREATE INDEX "procurement_notification_rules_eventType_isEnabled_idx" ON "procurement_notification_rules"("eventType", "isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_notification_rules_settingsId_eventType_channel_key" ON "procurement_notification_rules"("settingsId", "eventType", "channel");

-- CreateIndex
CREATE INDEX "procurement_payment_terms_settingsId_isActive_isDefault_idx" ON "procurement_payment_terms"("settingsId", "isActive", "isDefault");

-- CreateIndex
CREATE INDEX "procurement_payment_terms_sortOrder_idx" ON "procurement_payment_terms"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_payment_terms_settingsId_code_key" ON "procurement_payment_terms"("settingsId", "code");

-- CreateIndex
CREATE INDEX "procurement_qc_checklists_settingsId_isActive_idx" ON "procurement_qc_checklists"("settingsId", "isActive");

-- CreateIndex
CREATE INDEX "procurement_qc_checklists_category_isActive_idx" ON "procurement_qc_checklists"("category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_qc_checklists_settingsId_code_key" ON "procurement_qc_checklists"("settingsId", "code");

-- AddForeignKey
ALTER TABLE "procurement_settings" ADD CONSTRAINT "procurement_settings_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_approval_levels" ADD CONSTRAINT "procurement_approval_levels_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "procurement_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_categories" ADD CONSTRAINT "procurement_categories_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "procurement_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_notification_rules" ADD CONSTRAINT "procurement_notification_rules_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "procurement_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_payment_terms" ADD CONSTRAINT "procurement_payment_terms_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "procurement_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_qc_checklists" ADD CONSTRAINT "procurement_qc_checklists_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "procurement_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
