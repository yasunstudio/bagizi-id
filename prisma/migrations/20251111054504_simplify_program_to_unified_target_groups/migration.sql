/*
  Warnings:

  - You are about to drop the column `isMultiTarget` on the `nutrition_programs` table. All the data in the column will be lost.
  - You are about to drop the column `primaryTargetGroup` on the `nutrition_programs` table. All the data in the column will be lost.
  - You are about to drop the column `targetGroup` on the `nutrition_programs` table. All the data in the column will be lost.

*/

-- ========================================
-- DATA MIGRATION: Preserve existing data before dropping columns
-- ========================================

-- Step 1: Migrate single-target programs (isMultiTarget = false)
-- Copy targetGroup to allowedTargetGroups as single-item array
UPDATE "nutrition_programs"
SET "allowedTargetGroups" = ARRAY["targetGroup"]::"TargetGroup"[]
WHERE "isMultiTarget" = false 
  AND "targetGroup" IS NOT NULL
  AND array_length("allowedTargetGroups", 1) IS NULL; -- Only if allowedTargetGroups is empty

-- Step 2: Migrate multi-target programs with empty allowedTargetGroups
-- Use primaryTargetGroup as fallback if allowedTargetGroups is empty
UPDATE "nutrition_programs"
SET "allowedTargetGroups" = ARRAY["primaryTargetGroup"]::"TargetGroup"[]
WHERE "isMultiTarget" = true 
  AND "primaryTargetGroup" IS NOT NULL
  AND (array_length("allowedTargetGroups", 1) IS NULL OR array_length("allowedTargetGroups", 1) = 0);

-- Step 3: Handle edge case - programs with no target info at all
-- Set to SCHOOL_CHILDREN as safe default (most common use case)
UPDATE "nutrition_programs"
SET "allowedTargetGroups" = ARRAY['SCHOOL_CHILDREN']::"TargetGroup"[]
WHERE array_length("allowedTargetGroups", 1) IS NULL 
   OR array_length("allowedTargetGroups", 1) = 0;

-- ========================================
-- SCHEMA CHANGES: Drop old columns and indexes
-- ========================================

-- DropIndex
DROP INDEX "nutrition_programs_isMultiTarget_idx";

-- DropIndex
DROP INDEX "nutrition_programs_primaryTargetGroup_idx";

-- AlterTable
ALTER TABLE "nutrition_programs" DROP COLUMN "isMultiTarget",
DROP COLUMN "primaryTargetGroup",
DROP COLUMN "targetGroup",
ALTER COLUMN "allowedTargetGroups" DROP DEFAULT;
