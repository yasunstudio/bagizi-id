/*
  Warnings:

  - You are about to drop the column `accreditationGrade` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `accreditationYear` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `femaleMembers` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `maleMembers` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `operatingDays` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `posyanduCadres` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `serviceHours` on the `beneficiary_organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "beneficiary_organizations" DROP COLUMN "accreditationGrade",
DROP COLUMN "accreditationYear",
DROP COLUMN "femaleMembers",
DROP COLUMN "maleMembers",
DROP COLUMN "operatingDays",
DROP COLUMN "posyanduCadres",
DROP COLUMN "serviceHours";
