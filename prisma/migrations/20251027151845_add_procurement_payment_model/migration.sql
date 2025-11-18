/*
  Warnings:

  - You are about to drop the column `paymentDue` on the `procurements` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."procurements_paymentStatus_paymentDue_idx";

-- AlterTable
ALTER TABLE "procurements" DROP COLUMN "paymentDue",
ADD COLUMN     "invoiceDate" TIMESTAMP(3),
ADD COLUMN     "paymentDueDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "procurement_payments" (
    "id" TEXT NOT NULL,
    "procurementId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "procurement_payments_procurementId_idx" ON "procurement_payments"("procurementId");

-- CreateIndex
CREATE INDEX "procurement_payments_paymentDate_idx" ON "procurement_payments"("paymentDate");

-- CreateIndex
CREATE INDEX "procurements_paymentStatus_paymentDueDate_idx" ON "procurements"("paymentStatus", "paymentDueDate");

-- AddForeignKey
ALTER TABLE "procurement_payments" ADD CONSTRAINT "procurement_payments_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "procurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_payments" ADD CONSTRAINT "procurement_payments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
