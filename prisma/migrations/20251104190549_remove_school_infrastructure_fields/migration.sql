/*
  Warnings:

  - You are about to drop the column `partnerSchools` on the `nutrition_programs` table. All the data in the column will be lost.
  - You are about to drop the column `dapodikId` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `diningCapacity` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `hasCleanWater` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `hasDiningArea` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `hasElectricity` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `hasHandwashing` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `hasKitchen` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `hasRefrigerator` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `hasStorage` on the `schools` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."schools_dapodikId_key";

-- AlterTable
ALTER TABLE "nutrition_programs" DROP COLUMN "partnerSchools";

-- AlterTable
ALTER TABLE "schools" DROP COLUMN "dapodikId",
DROP COLUMN "diningCapacity",
DROP COLUMN "hasCleanWater",
DROP COLUMN "hasDiningArea",
DROP COLUMN "hasElectricity",
DROP COLUMN "hasHandwashing",
DROP COLUMN "hasKitchen",
DROP COLUMN "hasRefrigerator",
DROP COLUMN "hasStorage";
