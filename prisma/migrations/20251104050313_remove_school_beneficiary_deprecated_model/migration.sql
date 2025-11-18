/*
  Warnings:

  - You are about to drop the column `schoolBeneficiaryId` on the `distribution_deliveries` table. All the data in the column will be lost.
  - You are about to drop the `school_beneficiaries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."distribution_deliveries" DROP CONSTRAINT "distribution_deliveries_schoolBeneficiaryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."food_distributions" DROP CONSTRAINT "food_distributions_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_beneficiaries" DROP CONSTRAINT "school_beneficiaries_districtId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_beneficiaries" DROP CONSTRAINT "school_beneficiaries_programId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_beneficiaries" DROP CONSTRAINT "school_beneficiaries_provinceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_beneficiaries" DROP CONSTRAINT "school_beneficiaries_regencyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_beneficiaries" DROP CONSTRAINT "school_beneficiaries_sppgId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_beneficiaries" DROP CONSTRAINT "school_beneficiaries_villageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_distributions" DROP CONSTRAINT "school_distributions_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_feeding_reports" DROP CONSTRAINT "school_feeding_reports_schoolId_fkey";

-- DropIndex
DROP INDEX "public"."distribution_deliveries_schoolBeneficiaryId_idx";

-- AlterTable
ALTER TABLE "distribution_deliveries" DROP COLUMN "schoolBeneficiaryId",
ADD COLUMN     "schoolId" TEXT;

-- DropTable
DROP TABLE "public"."school_beneficiaries";

-- CreateIndex
CREATE INDEX "distribution_deliveries_schoolId_idx" ON "distribution_deliveries"("schoolId");

-- AddForeignKey
ALTER TABLE "food_distributions" ADD CONSTRAINT "food_distributions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_distributions" ADD CONSTRAINT "school_distributions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_feeding_reports" ADD CONSTRAINT "school_feeding_reports_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_deliveries" ADD CONSTRAINT "distribution_deliveries_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
