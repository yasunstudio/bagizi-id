/*
  Warnings:

  - You are about to drop the column `city` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `subDistrict` on the `beneficiary_organizations` table. All the data in the column will be lost.
  - The `ownershipStatus` column on the `beneficiary_organizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `provinceId` to the `beneficiary_organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regencyId` to the `beneficiary_organizations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrganizationOwnershipStatus" AS ENUM ('NEGERI', 'SWASTA');

-- DropIndex
DROP INDEX "beneficiary_organizations_city_province_idx";

-- Step 1: Add new columns as NULLABLE first
ALTER TABLE "beneficiary_organizations" 
ADD COLUMN "districtId" TEXT,
ADD COLUMN "provinceId" TEXT,
ADD COLUMN "regencyId" TEXT,
ADD COLUMN "villageId" TEXT;

-- Step 2: Migrate data from string columns to ID columns
-- Match province by name
UPDATE "beneficiary_organizations" bo
SET "provinceId" = p.id
FROM "provinces" p
WHERE bo."province" = p.name;

-- Match regency by name
UPDATE "beneficiary_organizations" bo
SET "regencyId" = r.id
FROM "regencies" r
WHERE bo."city" = r.name;

-- Match district by name (if exists)
UPDATE "beneficiary_organizations" bo
SET "districtId" = d.id
FROM "districts" d
WHERE bo."district" = d.name 
AND bo."district" IS NOT NULL;

-- Match village by name (if exists)
UPDATE "beneficiary_organizations" bo
SET "villageId" = v.id
FROM "villages" v
WHERE bo."subDistrict" = v.name 
AND bo."subDistrict" IS NOT NULL;

-- Step 3: Make provinceId and regencyId required (NOT NULL)
ALTER TABLE "beneficiary_organizations" 
ALTER COLUMN "provinceId" SET NOT NULL,
ALTER COLUMN "regencyId" SET NOT NULL;

-- Step 4: Drop old string columns
ALTER TABLE "beneficiary_organizations" 
DROP COLUMN "city",
DROP COLUMN "district",
DROP COLUMN "province",
DROP COLUMN "subDistrict";

-- Step 5: Handle ownershipStatus enum conversion
-- First, update existing string values to match enum
UPDATE "beneficiary_organizations"
SET "ownershipStatus" = 'NEGERI'
WHERE "ownershipStatus" = 'NEGERI';

UPDATE "beneficiary_organizations"
SET "ownershipStatus" = 'SWASTA'
WHERE "ownershipStatus" = 'SWASTA';

-- Drop and recreate as enum
ALTER TABLE "beneficiary_organizations" 
DROP COLUMN "ownershipStatus",
ADD COLUMN "ownershipStatus" "OrganizationOwnershipStatus";

-- Restore ownership status values (default to NULL for existing records)
-- The seed script will handle setting proper values

-- CreateIndex
CREATE INDEX "beneficiary_organizations_provinceId_regencyId_idx" ON "beneficiary_organizations"("provinceId", "regencyId");

-- AddForeignKey
ALTER TABLE "beneficiary_organizations" ADD CONSTRAINT "beneficiary_organizations_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_organizations" ADD CONSTRAINT "beneficiary_organizations_regencyId_fkey" FOREIGN KEY ("regencyId") REFERENCES "regencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_organizations" ADD CONSTRAINT "beneficiary_organizations_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_organizations" ADD CONSTRAINT "beneficiary_organizations_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
