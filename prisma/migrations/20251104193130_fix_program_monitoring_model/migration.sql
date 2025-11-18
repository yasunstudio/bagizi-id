/*
  Warnings:

  - You are about to drop the column `bestPractices` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `budgetUtilization` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `communityFeedback` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `costPerMeal` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `costPerRecipient` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `governmentFeedback` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `improvementPlans` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `innovations` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `majorChallenges` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `minorIssues` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `monitoringMonth` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `monitoringYear` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `nextMonthTargets` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `parentFeedback` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `priorityAreas` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `productionEfficiency` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedActions` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `reportedBy` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `resourceConstraints` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `resourceNeeds` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `savings` on the `program_monitoring` table. All the data in the column will be lost.
  - You are about to drop the column `teacherFeedback` on the `program_monitoring` table. All the data in the column will be lost.
  - The `achievements` column on the `program_monitoring` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[programId,monitoringDate]` on the table `program_monitoring` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `monitoringDate` to the `program_monitoring` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportedById` to the `program_monitoring` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."program_monitoring_monitoringMonth_monitoringYear_idx";

-- DropIndex
DROP INDEX "public"."program_monitoring_programId_monitoringMonth_idx";

-- AlterTable
ALTER TABLE "program_monitoring" DROP COLUMN "bestPractices",
DROP COLUMN "budgetUtilization",
DROP COLUMN "communityFeedback",
DROP COLUMN "costPerMeal",
DROP COLUMN "costPerRecipient",
DROP COLUMN "governmentFeedback",
DROP COLUMN "improvementPlans",
DROP COLUMN "innovations",
DROP COLUMN "majorChallenges",
DROP COLUMN "minorIssues",
DROP COLUMN "monitoringMonth",
DROP COLUMN "monitoringYear",
DROP COLUMN "nextMonthTargets",
DROP COLUMN "parentFeedback",
DROP COLUMN "priorityAreas",
DROP COLUMN "productionEfficiency",
DROP COLUMN "recommendedActions",
DROP COLUMN "reportedBy",
DROP COLUMN "resourceConstraints",
DROP COLUMN "resourceNeeds",
DROP COLUMN "savings",
DROP COLUMN "teacherFeedback",
ADD COLUMN     "challenges" JSONB,
ADD COLUMN     "feedback" JSONB,
ADD COLUMN     "monitoringDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "recommendations" JSONB,
ADD COLUMN     "reportedById" TEXT NOT NULL,
ALTER COLUMN "wastePercentage" DROP NOT NULL,
ALTER COLUMN "avgQualityScore" DROP NOT NULL,
ALTER COLUMN "customerSatisfaction" DROP NOT NULL,
ALTER COLUMN "staffAttendance" DROP NOT NULL,
ALTER COLUMN "trainingCompleted" SET DEFAULT 0,
DROP COLUMN "achievements",
ADD COLUMN     "achievements" JSONB;

-- CreateIndex
CREATE INDEX "program_monitoring_programId_monitoringDate_idx" ON "program_monitoring"("programId", "monitoringDate");

-- CreateIndex
CREATE INDEX "program_monitoring_monitoringDate_idx" ON "program_monitoring"("monitoringDate");

-- CreateIndex
CREATE UNIQUE INDEX "program_monitoring_programId_monitoringDate_key" ON "program_monitoring"("programId", "monitoringDate");

-- AddForeignKey
ALTER TABLE "program_monitoring" ADD CONSTRAINT "program_monitoring_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
