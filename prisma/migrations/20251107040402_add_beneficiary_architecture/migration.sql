-- CreateEnum
CREATE TYPE "BeneficiaryOrganizationType" AS ENUM ('SCHOOL', 'HEALTH_FACILITY', 'INTEGRATED_SERVICE_POST', 'COMMUNITY_CENTER', 'RELIGIOUS_INSTITUTION');

-- CreateEnum
CREATE TYPE "BeneficiaryOrganizationSubType" AS ENUM ('PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK', 'PESANTREN', 'PUSKESMAS', 'KLINIK', 'RUMAH_SAKIT', 'POSYANDU', 'PKK', 'BALAI_WARGA', 'PANTI_JOMPO', 'MASJID', 'GEREJA', 'VIHARA', 'PURA');

-- CreateEnum
CREATE TYPE "ProgramEnrollmentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "food_distributions" ADD COLUMN     "beneficiaryEnrollmentId" TEXT,
ADD COLUMN     "beneficiaryOrgId" TEXT;

-- CreateTable
CREATE TABLE "beneficiary_organizations" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "organizationName" VARCHAR(255) NOT NULL,
    "organizationCode" VARCHAR(50) NOT NULL,
    "type" "BeneficiaryOrganizationType" NOT NULL,
    "subType" "BeneficiaryOrganizationSubType",
    "address" TEXT NOT NULL,
    "subDistrict" VARCHAR(100),
    "district" VARCHAR(100),
    "city" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(10),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "contactPerson" VARCHAR(255),
    "contactTitle" VARCHAR(100),
    "npsn" VARCHAR(20),
    "nikkes" VARCHAR(30),
    "registrationNumber" VARCHAR(50),
    "principalName" VARCHAR(255),
    "principalNip" VARCHAR(30),
    "totalCapacity" INTEGER,
    "buildingArea" DOUBLE PRECISION,
    "hasElectricity" BOOLEAN DEFAULT true,
    "hasCleanWater" BOOLEAN DEFAULT true,
    "hasKitchen" BOOLEAN DEFAULT false,
    "hasStorageRoom" BOOLEAN DEFAULT false,
    "storageCapacity" INTEGER,
    "accreditationGrade" VARCHAR(5),
    "accreditationYear" INTEGER,
    "establishedYear" INTEGER,
    "operationalStatus" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "serviceHours" VARCHAR(100),
    "operatingDays" VARCHAR(50),
    "servingCapacity" INTEGER,
    "averageServings" INTEGER,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "beneficiary_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_beneficiary_enrollments" (
    "id" TEXT NOT NULL,
    "beneficiaryOrgId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "targetGroup" "TargetGroup" NOT NULL,
    "targetBeneficiaries" INTEGER NOT NULL,
    "activeBeneficiaries" INTEGER,
    "beneficiaries0to2Years" INTEGER,
    "beneficiaries2to5Years" INTEGER,
    "beneficiaries6to12Years" INTEGER,
    "beneficiaries13to15Years" INTEGER,
    "beneficiaries16to18Years" INTEGER,
    "beneficiariesAbove18" INTEGER,
    "maleBeneficiaries" INTEGER,
    "femaleBeneficiaries" INTEGER,
    "feedingDays" INTEGER,
    "mealsPerDay" INTEGER,
    "feedingTime" VARCHAR(50),
    "breakfastTime" VARCHAR(10),
    "lunchTime" VARCHAR(10),
    "snackTime" VARCHAR(10),
    "deliveryAddress" TEXT,
    "deliveryContact" VARCHAR(255),
    "deliveryPhone" VARCHAR(20),
    "deliveryInstructions" TEXT,
    "preferredDeliveryTime" VARCHAR(50),
    "estimatedTravelTime" INTEGER,
    "storageCapacity" INTEGER,
    "servingMethod" VARCHAR(50),
    "monthlyBudgetAllocation" DOUBLE PRECISION,
    "budgetPerBeneficiary" DOUBLE PRECISION,
    "totalMealsServed" INTEGER DEFAULT 0,
    "totalBeneficiariesServed" INTEGER DEFAULT 0,
    "averageAttendanceRate" DOUBLE PRECISION,
    "lastDistributionDate" TIMESTAMP(3),
    "lastMonitoringDate" TIMESTAMP(3),
    "satisfactionScore" DOUBLE PRECISION,
    "complaintCount" INTEGER DEFAULT 0,
    "nutritionComplianceRate" DOUBLE PRECISION,
    "specialDietaryNeeds" TEXT,
    "allergenRestrictions" TEXT,
    "culturalPreferences" TEXT,
    "medicalConsiderations" TEXT,
    "programFocus" VARCHAR(100),
    "supplementaryServices" TEXT,
    "enrollmentStatus" "ProgramEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPriority" BOOLEAN NOT NULL DEFAULT false,
    "needsAssessment" BOOLEAN NOT NULL DEFAULT false,
    "enrolledBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_beneficiary_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "beneficiary_organizations_organizationCode_key" ON "beneficiary_organizations"("organizationCode");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiary_organizations_npsn_key" ON "beneficiary_organizations"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiary_organizations_nikkes_key" ON "beneficiary_organizations"("nikkes");

-- CreateIndex
CREATE INDEX "beneficiary_organizations_sppgId_idx" ON "beneficiary_organizations"("sppgId");

-- CreateIndex
CREATE INDEX "beneficiary_organizations_type_subType_idx" ON "beneficiary_organizations"("type", "subType");

-- CreateIndex
CREATE INDEX "beneficiary_organizations_city_province_idx" ON "beneficiary_organizations"("city", "province");

-- CreateIndex
CREATE INDEX "beneficiary_organizations_operationalStatus_idx" ON "beneficiary_organizations"("operationalStatus");

-- CreateIndex
CREATE INDEX "program_beneficiary_enrollments_beneficiaryOrgId_idx" ON "program_beneficiary_enrollments"("beneficiaryOrgId");

-- CreateIndex
CREATE INDEX "program_beneficiary_enrollments_programId_idx" ON "program_beneficiary_enrollments"("programId");

-- CreateIndex
CREATE INDEX "program_beneficiary_enrollments_sppgId_idx" ON "program_beneficiary_enrollments"("sppgId");

-- CreateIndex
CREATE INDEX "program_beneficiary_enrollments_targetGroup_idx" ON "program_beneficiary_enrollments"("targetGroup");

-- CreateIndex
CREATE INDEX "program_beneficiary_enrollments_enrollmentStatus_idx" ON "program_beneficiary_enrollments"("enrollmentStatus");

-- CreateIndex
CREATE INDEX "program_beneficiary_enrollments_startDate_endDate_idx" ON "program_beneficiary_enrollments"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "food_distributions_beneficiaryOrgId_distributionDate_idx" ON "food_distributions"("beneficiaryOrgId", "distributionDate");

-- CreateIndex
CREATE INDEX "food_distributions_beneficiaryEnrollmentId_idx" ON "food_distributions"("beneficiaryEnrollmentId");

-- AddForeignKey
ALTER TABLE "food_distributions" ADD CONSTRAINT "food_distributions_beneficiaryOrgId_fkey" FOREIGN KEY ("beneficiaryOrgId") REFERENCES "beneficiary_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_distributions" ADD CONSTRAINT "food_distributions_beneficiaryEnrollmentId_fkey" FOREIGN KEY ("beneficiaryEnrollmentId") REFERENCES "program_beneficiary_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_organizations" ADD CONSTRAINT "beneficiary_organizations_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_beneficiary_enrollments" ADD CONSTRAINT "program_beneficiary_enrollments_beneficiaryOrgId_fkey" FOREIGN KEY ("beneficiaryOrgId") REFERENCES "beneficiary_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_beneficiary_enrollments" ADD CONSTRAINT "program_beneficiary_enrollments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_beneficiary_enrollments" ADD CONSTRAINT "program_beneficiary_enrollments_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;
