/*
  Warnings:

  - The `operatingDays` column on the `beneficiary_organizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "beneficiary_organizations" DROP COLUMN "operatingDays",
ADD COLUMN     "operatingDays" INTEGER[];
