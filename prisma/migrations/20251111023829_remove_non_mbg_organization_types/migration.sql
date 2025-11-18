/*
  Warnings:

  - The values [PKK,BALAI_WARGA,PANTI_JOMPO,MASJID,GEREJA,VIHARA,PURA] on the enum `BeneficiaryOrganizationSubType` will be removed. If these variants are still used in the database, this will fail.
  - The values [COMMUNITY_CENTER,RELIGIOUS_INSTITUTION] on the enum `BeneficiaryOrganizationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BeneficiaryOrganizationSubType_new" AS ENUM ('PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK', 'PESANTREN', 'PUSKESMAS', 'KLINIK', 'RUMAH_SAKIT', 'POSYANDU');
ALTER TABLE "beneficiary_organizations" ALTER COLUMN "subType" TYPE "BeneficiaryOrganizationSubType_new" USING ("subType"::text::"BeneficiaryOrganizationSubType_new");
ALTER TYPE "BeneficiaryOrganizationSubType" RENAME TO "BeneficiaryOrganizationSubType_old";
ALTER TYPE "BeneficiaryOrganizationSubType_new" RENAME TO "BeneficiaryOrganizationSubType";
DROP TYPE "public"."BeneficiaryOrganizationSubType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "BeneficiaryOrganizationType_new" AS ENUM ('SCHOOL', 'HEALTH_FACILITY', 'INTEGRATED_SERVICE_POST');
ALTER TABLE "beneficiary_organizations" ALTER COLUMN "type" TYPE "BeneficiaryOrganizationType_new" USING ("type"::text::"BeneficiaryOrganizationType_new");
ALTER TYPE "BeneficiaryOrganizationType" RENAME TO "BeneficiaryOrganizationType_old";
ALTER TYPE "BeneficiaryOrganizationType_new" RENAME TO "BeneficiaryOrganizationType";
DROP TYPE "public"."BeneficiaryOrganizationType_old";
COMMIT;
