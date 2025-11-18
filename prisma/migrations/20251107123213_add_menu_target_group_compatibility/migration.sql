-- AlterTable
ALTER TABLE "nutrition_menus" ADD COLUMN     "calcium" DOUBLE PRECISION,
ADD COLUMN     "compatibleTargetGroups" "TargetGroup"[] DEFAULT ARRAY[]::"TargetGroup"[],
ADD COLUMN     "folicAcid" DOUBLE PRECISION,
ADD COLUMN     "iron" DOUBLE PRECISION,
ADD COLUMN     "vitaminA" DOUBLE PRECISION,
ADD COLUMN     "vitaminC" DOUBLE PRECISION,
ADD COLUMN     "vitaminD" DOUBLE PRECISION;
