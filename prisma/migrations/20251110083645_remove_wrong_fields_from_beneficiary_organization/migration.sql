/*
  Warnings:

  - You are about to drop the column `averageServings` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `hasKitchen` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `hasStorageRoom` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `servingCapacity` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `storageCapacity` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `distribution_deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `enrollmentId` on the `food_distributions` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `food_distributions` table. All the data in the column will be lost.
  - You are about to drop the `program_school_enrollments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `school_distributions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `school_feeding_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schools` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "distribution_deliveries" DROP CONSTRAINT "distribution_deliveries_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "food_distributions" DROP CONSTRAINT "food_distributions_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "food_distributions" DROP CONSTRAINT "food_distributions_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "program_school_enrollments" DROP CONSTRAINT "program_school_enrollments_programId_fkey";

-- DropForeignKey
ALTER TABLE "program_school_enrollments" DROP CONSTRAINT "program_school_enrollments_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "program_school_enrollments" DROP CONSTRAINT "program_school_enrollments_sppgId_fkey";

-- DropForeignKey
ALTER TABLE "school_distributions" DROP CONSTRAINT "school_distributions_menuId_fkey";

-- DropForeignKey
ALTER TABLE "school_distributions" DROP CONSTRAINT "school_distributions_programId_fkey";

-- DropForeignKey
ALTER TABLE "school_distributions" DROP CONSTRAINT "school_distributions_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "school_feeding_reports" DROP CONSTRAINT "school_feeding_reports_distributionId_fkey";

-- DropForeignKey
ALTER TABLE "school_feeding_reports" DROP CONSTRAINT "school_feeding_reports_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_districtId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_provinceId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_regencyId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_sppgId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_villageId_fkey";

-- DropIndex
DROP INDEX "distribution_deliveries_schoolId_idx";

-- DropIndex
DROP INDEX "food_distributions_schoolId_distributionDate_idx";

-- AlterTable
ALTER TABLE "beneficiary_organizations" DROP COLUMN "averageServings",
DROP COLUMN "hasKitchen",
DROP COLUMN "hasStorageRoom",
DROP COLUMN "servingCapacity",
DROP COLUMN "storageCapacity";

-- AlterTable
ALTER TABLE "distribution_deliveries" DROP COLUMN "schoolId";

-- AlterTable
ALTER TABLE "food_distributions" DROP COLUMN "enrollmentId",
DROP COLUMN "schoolId";

-- DropTable
DROP TABLE "program_school_enrollments";

-- DropTable
DROP TABLE "school_distributions";

-- DropTable
DROP TABLE "school_feeding_reports";

-- DropTable
DROP TABLE "schools";
