/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `procurements` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `procurements` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceDate` on the `procurements` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDueDate` on the `procurements` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `procurements` table. All the data in the column will be lost.
  - You are about to drop the column `submittedBy` on the `procurements` table. All the data in the column will be lost.
  - You are about to drop the `procurement_payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "quality_check_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CONDITIONAL');

-- DropForeignKey
ALTER TABLE "public"."procurement_payments" DROP CONSTRAINT "procurement_payments_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."procurement_payments" DROP CONSTRAINT "procurement_payments_procurementId_fkey";

-- DropIndex
DROP INDEX "public"."procurements_paymentStatus_paymentDueDate_idx";

-- AlterTable
ALTER TABLE "procurements" DROP COLUMN "approvedAt",
DROP COLUMN "approvedBy",
DROP COLUMN "invoiceDate",
DROP COLUMN "paymentDueDate",
DROP COLUMN "submittedAt",
DROP COLUMN "submittedBy",
ADD COLUMN     "paymentDue" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."procurement_payments";

-- CreateTable
CREATE TABLE "procurement_quality_controls" (
    "id" TEXT NOT NULL,
    "procurementId" TEXT NOT NULL,
    "inspectedBy" TEXT NOT NULL,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallGrade" "QualityGrade" NOT NULL,
    "overallStatus" "quality_check_status" NOT NULL DEFAULT 'PENDING',
    "overallNotes" TEXT,
    "recommendation" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_quality_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_control_items" (
    "id" TEXT NOT NULL,
    "qualityControlId" TEXT NOT NULL,
    "procurementItemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "inspectedQuantity" DOUBLE PRECISION NOT NULL,
    "acceptedQuantity" DOUBLE PRECISION NOT NULL,
    "rejectedQuantity" DOUBLE PRECISION NOT NULL,
    "qualityGrade" "QualityGrade" NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT true,
    "defectType" TEXT,
    "defectDescription" TEXT,
    "rejectionReason" TEXT,
    "correctionAction" TEXT,
    "photosUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_control_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_check_points" (
    "id" TEXT NOT NULL,
    "qualityItemId" TEXT NOT NULL,
    "checkPointName" TEXT NOT NULL,
    "checkPointType" TEXT NOT NULL,
    "expectedValue" TEXT,
    "actualValue" TEXT,
    "isPassed" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "severity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_check_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "procurement_quality_controls_procurementId_inspectedAt_idx" ON "procurement_quality_controls"("procurementId", "inspectedAt");

-- CreateIndex
CREATE INDEX "procurement_quality_controls_overallStatus_idx" ON "procurement_quality_controls"("overallStatus");

-- CreateIndex
CREATE INDEX "quality_control_items_qualityControlId_idx" ON "quality_control_items"("qualityControlId");

-- CreateIndex
CREATE INDEX "quality_control_items_procurementItemId_idx" ON "quality_control_items"("procurementItemId");

-- CreateIndex
CREATE INDEX "quality_check_points_qualityItemId_idx" ON "quality_check_points"("qualityItemId");

-- CreateIndex
CREATE INDEX "procurements_paymentStatus_paymentDue_idx" ON "procurements"("paymentStatus", "paymentDue");

-- AddForeignKey
ALTER TABLE "procurement_quality_controls" ADD CONSTRAINT "procurement_quality_controls_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "procurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_control_items" ADD CONSTRAINT "quality_control_items_qualityControlId_fkey" FOREIGN KEY ("qualityControlId") REFERENCES "procurement_quality_controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_check_points" ADD CONSTRAINT "quality_check_points_qualityItemId_fkey" FOREIGN KEY ("qualityItemId") REFERENCES "quality_control_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
