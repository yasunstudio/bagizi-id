-- AlterTable
ALTER TABLE "nutrition_programs" ADD COLUMN     "allowedTargetGroups" "TargetGroup"[] DEFAULT ARRAY[]::"TargetGroup"[],
ADD COLUMN     "isMultiTarget" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "primaryTargetGroup" "TargetGroup",
ALTER COLUMN "targetGroup" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "nutrition_programs_isMultiTarget_idx" ON "nutrition_programs"("isMultiTarget");

-- CreateIndex
CREATE INDEX "nutrition_programs_primaryTargetGroup_idx" ON "nutrition_programs"("primaryTargetGroup");
