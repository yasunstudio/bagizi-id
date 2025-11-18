-- AlterTable
ALTER TABLE "beneficiary_organizations" ADD COLUMN     "femaleMembers" INTEGER,
ADD COLUMN     "maleMembers" INTEGER,
ADD COLUMN     "ownershipStatus" VARCHAR(20),
ADD COLUMN     "posyanduCadres" INTEGER,
ADD COLUMN     "totalMembers" INTEGER;
