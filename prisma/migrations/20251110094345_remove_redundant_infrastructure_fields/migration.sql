/*
  Warnings:

  - You are about to drop the column `buildingArea` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `hasCleanWater` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `hasElectricity` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `totalMembers` on the `beneficiary_organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "beneficiary_organizations" DROP COLUMN "buildingArea",
DROP COLUMN "hasCleanWater",
DROP COLUMN "hasElectricity",
DROP COLUMN "totalMembers";
