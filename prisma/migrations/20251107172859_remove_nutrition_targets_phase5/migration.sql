/*
  Warnings:

  - You are about to drop the column `calorieTarget` on the `nutrition_programs` table. All the data in the column will be lost.
  - You are about to drop the column `carbTarget` on the `nutrition_programs` table. All the data in the column will be lost.
  - You are about to drop the column `fatTarget` on the `nutrition_programs` table. All the data in the column will be lost.
  - You are about to drop the column `fiberTarget` on the `nutrition_programs` table. All the data in the column will be lost.
  - You are about to drop the column `proteinTarget` on the `nutrition_programs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "nutrition_programs" DROP COLUMN "calorieTarget",
DROP COLUMN "carbTarget",
DROP COLUMN "fatTarget",
DROP COLUMN "fiberTarget",
DROP COLUMN "proteinTarget";
