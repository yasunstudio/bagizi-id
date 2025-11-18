/*
  Warnings:

  - Added the required column `budgetYear` to the `nutrition_programs` table without a default value. This is not possible if the table is not empty.
  - Made the column `totalBudget` on table `nutrition_programs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `budgetPerMeal` on table `nutrition_programs` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "BudgetSource" AS ENUM ('APBN_PUSAT', 'APBD_PROVINSI', 'APBD_KABUPATEN', 'APBD_KOTA', 'HIBAH', 'APBN_DEKONSENTRASI', 'DAK', 'MIXED');

-- CreateEnum
CREATE TYPE "BgnRequestStatus" AS ENUM ('DRAFT_LOCAL', 'SUBMITTED_TO_BGN', 'UNDER_REVIEW_BGN', 'APPROVED_BY_BGN', 'DISBURSED', 'REJECTED_BY_BGN', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BudgetAllocationStatus" AS ENUM ('ACTIVE', 'FULLY_SPENT', 'PARTIALLY_SPENT', 'FROZEN', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BudgetTransactionCategory" AS ENUM ('FOOD_PROCUREMENT', 'OPERATIONAL', 'TRANSPORT', 'UTILITIES', 'STAFF_SALARY', 'EQUIPMENT', 'PACKAGING', 'MARKETING', 'TRAINING', 'MAINTENANCE', 'OTHER');

-- AlterTable
ALTER TABLE "nutrition_programs" ADD COLUMN     "apbnProgramCode" TEXT,
ADD COLUMN     "budgetApprovalNotes" TEXT,
ADD COLUMN     "budgetApprovedAt" TIMESTAMP(3),
ADD COLUMN     "budgetApprovedBy" TEXT,
ADD COLUMN     "budgetDecreeDate" TIMESTAMP(3),
ADD COLUMN     "budgetDecreeNumber" TEXT,
ADD COLUMN     "budgetDecreeUrl" TEXT,
ADD COLUMN     "budgetLastModifiedAt" TIMESTAMP(3),
ADD COLUMN     "budgetLastModifiedBy" TEXT,
ADD COLUMN     "budgetSource" "BudgetSource" NOT NULL DEFAULT 'APBN_PUSAT',
ADD COLUMN     "budgetYear" INTEGER NOT NULL,
ADD COLUMN     "dpaDate" TIMESTAMP(3),
ADD COLUMN     "dpaNumber" TEXT,
ADD COLUMN     "foodBudget" DOUBLE PRECISION,
ADD COLUMN     "operationalBudget" DOUBLE PRECISION,
ADD COLUMN     "otherBudget" DOUBLE PRECISION,
ADD COLUMN     "staffBudget" DOUBLE PRECISION,
ADD COLUMN     "transportBudget" DOUBLE PRECISION,
ADD COLUMN     "utilityBudget" DOUBLE PRECISION,
ALTER COLUMN "totalBudget" SET NOT NULL,
ALTER COLUMN "budgetPerMeal" SET NOT NULL;

-- CreateTable
CREATE TABLE "banper_request_tracking" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "programId" TEXT,
    "bgnRequestNumber" TEXT,
    "bgnPortalUrl" TEXT,
    "bgnSubmissionDate" TIMESTAMP(3),
    "requestedAmount" DOUBLE PRECISION NOT NULL,
    "operationalPeriod" TEXT NOT NULL,
    "totalBeneficiaries" INTEGER NOT NULL,
    "beneficiaryBreakdown" JSONB,
    "foodCostTotal" DOUBLE PRECISION NOT NULL,
    "operationalCost" DOUBLE PRECISION NOT NULL,
    "transportCost" DOUBLE PRECISION,
    "utilityCost" DOUBLE PRECISION,
    "staffCost" DOUBLE PRECISION,
    "otherCosts" DOUBLE PRECISION,
    "dailyBudgetPerBeneficiary" DOUBLE PRECISION,
    "operationalDays" INTEGER DEFAULT 12,
    "bgnStatus" "BgnRequestStatus" NOT NULL DEFAULT 'DRAFT_LOCAL',
    "lastStatusUpdate" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "disbursedAmount" DOUBLE PRECISION,
    "disbursedDate" TIMESTAMP(3),
    "bankReferenceNumber" TEXT,
    "bankAccountReceived" TEXT,
    "proposalDocumentUrl" TEXT,
    "rabDocumentUrl" TEXT,
    "supportingDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bgnApprovalNumber" TEXT,
    "bgnApprovalDate" TIMESTAMP(3),
    "bgnApprovedByName" TEXT,
    "bgnApprovedByPosition" TEXT,
    "bgnApprovalDocumentUrl" TEXT,
    "internalNotes" TEXT,
    "bgnReviewNotes" TEXT,
    "bgnRejectionReason" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banper_request_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_budget_allocations" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "source" "BudgetSource" NOT NULL,
    "banperTrackingId" TEXT,
    "allocatedAmount" DOUBLE PRECISION NOT NULL,
    "allocatedDate" TIMESTAMP(3) NOT NULL,
    "allocatedBy" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "decreeNumber" TEXT,
    "decreeDate" TIMESTAMP(3),
    "decreeUrl" TEXT,
    "dpaNumber" TEXT,
    "dpaDate" TIMESTAMP(3),
    "spentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingAmount" DOUBLE PRECISION NOT NULL,
    "isFullySpent" BOOLEAN NOT NULL DEFAULT false,
    "status" "BudgetAllocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSpentAt" TIMESTAMP(3),

    CONSTRAINT "program_budget_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_transactions" (
    "id" TEXT NOT NULL,
    "allocationId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "BudgetTransactionCategory" NOT NULL,
    "procurementId" TEXT,
    "productionId" TEXT,
    "distributionId" TEXT,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "receiptNumber" TEXT,
    "receiptUrl" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banper_request_tracking_bgnRequestNumber_key" ON "banper_request_tracking"("bgnRequestNumber");

-- CreateIndex
CREATE INDEX "banper_request_tracking_sppgId_bgnStatus_idx" ON "banper_request_tracking"("sppgId", "bgnStatus");

-- CreateIndex
CREATE INDEX "banper_request_tracking_bgnRequestNumber_idx" ON "banper_request_tracking"("bgnRequestNumber");

-- CreateIndex
CREATE INDEX "banper_request_tracking_programId_idx" ON "banper_request_tracking"("programId");

-- CreateIndex
CREATE INDEX "banper_request_tracking_bgnSubmissionDate_idx" ON "banper_request_tracking"("bgnSubmissionDate");

-- CreateIndex
CREATE INDEX "program_budget_allocations_programId_status_idx" ON "program_budget_allocations"("programId", "status");

-- CreateIndex
CREATE INDEX "program_budget_allocations_sppgId_fiscalYear_idx" ON "program_budget_allocations"("sppgId", "fiscalYear");

-- CreateIndex
CREATE INDEX "program_budget_allocations_source_fiscalYear_idx" ON "program_budget_allocations"("source", "fiscalYear");

-- CreateIndex
CREATE INDEX "program_budget_allocations_banperTrackingId_idx" ON "program_budget_allocations"("banperTrackingId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_transactions_transactionNumber_key" ON "budget_transactions"("transactionNumber");

-- CreateIndex
CREATE INDEX "budget_transactions_allocationId_transactionDate_idx" ON "budget_transactions"("allocationId", "transactionDate");

-- CreateIndex
CREATE INDEX "budget_transactions_sppgId_category_idx" ON "budget_transactions"("sppgId", "category");

-- CreateIndex
CREATE INDEX "budget_transactions_programId_transactionDate_idx" ON "budget_transactions"("programId", "transactionDate");

-- CreateIndex
CREATE INDEX "budget_transactions_category_transactionDate_idx" ON "budget_transactions"("category", "transactionDate");

-- CreateIndex
CREATE INDEX "nutrition_programs_budgetSource_budgetYear_idx" ON "nutrition_programs"("budgetSource", "budgetYear");

-- AddForeignKey
ALTER TABLE "banper_request_tracking" ADD CONSTRAINT "banper_request_tracking_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banper_request_tracking" ADD CONSTRAINT "banper_request_tracking_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_budget_allocations" ADD CONSTRAINT "program_budget_allocations_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_budget_allocations" ADD CONSTRAINT "program_budget_allocations_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_budget_allocations" ADD CONSTRAINT "program_budget_allocations_banperTrackingId_fkey" FOREIGN KEY ("banperTrackingId") REFERENCES "banper_request_tracking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "program_budget_allocations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;
