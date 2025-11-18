-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'CANCELLED', 'GRADUATED');

-- CreateEnum
CREATE TYPE "AccreditationGrade" AS ENUM ('A', 'B', 'C', 'UNACCREDITED');

-- CreateEnum
CREATE TYPE "RoadCondition" AS ENUM ('PAVED_GOOD', 'PAVED_DAMAGED', 'UNPAVED_PASSABLE', 'DIFFICULT_ACCESS', 'VERY_DIFFICULT');

-- AlterTable
ALTER TABLE "food_distributions" ADD COLUMN     "enrollmentId" TEXT;

-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "foodCategoryId" TEXT;

-- AlterTable
ALTER TABLE "nutrition_menus" ADD COLUMN     "foodCategoryId" TEXT;

-- CreateTable
CREATE TABLE "food_categories" (
    "id" TEXT NOT NULL,
    "categoryCode" VARCHAR(20) NOT NULL,
    "categoryName" VARCHAR(100) NOT NULL,
    "categoryNameEn" VARCHAR(100),
    "description" TEXT,
    "parentId" TEXT,
    "primaryNutrient" VARCHAR(50),
    "servingSizeGram" DOUBLE PRECISION,
    "dailyServings" INTEGER,
    "colorCode" VARCHAR(7),
    "iconName" VARCHAR(50),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "food_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "schoolName" VARCHAR(255) NOT NULL,
    "schoolCode" VARCHAR(50) NOT NULL,
    "npsn" VARCHAR(20),
    "schoolType" "SchoolType" NOT NULL,
    "schoolStatus" "SchoolStatus" NOT NULL,
    "accreditationGrade" "AccreditationGrade",
    "accreditationYear" INTEGER,
    "principalName" VARCHAR(255) NOT NULL,
    "principalNip" VARCHAR(30),
    "contactPhone" VARCHAR(20) NOT NULL,
    "contactEmail" VARCHAR(255),
    "alternatePhone" VARCHAR(20),
    "whatsappNumber" VARCHAR(20),
    "schoolAddress" TEXT NOT NULL,
    "provinceId" TEXT,
    "regencyId" TEXT,
    "districtId" TEXT,
    "villageId" TEXT,
    "coordinates" VARCHAR(50),
    "postalCode" VARCHAR(10),
    "hasKitchen" BOOLEAN NOT NULL DEFAULT false,
    "hasStorage" BOOLEAN NOT NULL DEFAULT false,
    "hasRefrigerator" BOOLEAN NOT NULL DEFAULT false,
    "hasCleanWater" BOOLEAN NOT NULL DEFAULT false,
    "hasElectricity" BOOLEAN NOT NULL DEFAULT false,
    "hasHandwashing" BOOLEAN NOT NULL DEFAULT false,
    "hasDiningArea" BOOLEAN NOT NULL DEFAULT false,
    "diningCapacity" INTEGER,
    "accessRoadCondition" "RoadCondition",
    "distanceFromSppg" DOUBLE PRECISION,
    "dapodikId" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_school_enrollments" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "targetStudents" INTEGER NOT NULL,
    "activeStudents" INTEGER,
    "students4to6Years" INTEGER,
    "students7to12Years" INTEGER,
    "students13to15Years" INTEGER,
    "students16to18Years" INTEGER,
    "maleStudents" INTEGER,
    "femaleStudents" INTEGER,
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
    "budgetPerStudent" DOUBLE PRECISION,
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "contractValue" DOUBLE PRECISION,
    "contractNumber" VARCHAR(100),
    "attendanceRate" DOUBLE PRECISION DEFAULT 0,
    "participationRate" DOUBLE PRECISION DEFAULT 0,
    "satisfactionScore" DOUBLE PRECISION,
    "lastDistributionDate" TIMESTAMP(3),
    "lastReportDate" TIMESTAMP(3),
    "totalDistributions" INTEGER DEFAULT 0,
    "totalMealsServed" INTEGER DEFAULT 0,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "suspendedAt" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "specialDietary" TEXT,
    "allergyAlerts" TEXT,
    "culturalReqs" TEXT,
    "religiousReqs" TEXT,
    "externalSystemId" VARCHAR(100),
    "syncedAt" TIMESTAMP(3),
    "notes" TEXT,
    "specialInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "program_school_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_categories_categoryCode_key" ON "food_categories"("categoryCode");

-- CreateIndex
CREATE INDEX "food_categories_parentId_idx" ON "food_categories"("parentId");

-- CreateIndex
CREATE INDEX "food_categories_categoryCode_idx" ON "food_categories"("categoryCode");

-- CreateIndex
CREATE INDEX "food_categories_isActive_sortOrder_idx" ON "food_categories"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "schools_npsn_key" ON "schools"("npsn");

-- CreateIndex
CREATE UNIQUE INDEX "schools_dapodikId_key" ON "schools"("dapodikId");

-- CreateIndex
CREATE INDEX "schools_sppgId_idx" ON "schools"("sppgId");

-- CreateIndex
CREATE INDEX "schools_schoolName_idx" ON "schools"("schoolName");

-- CreateIndex
CREATE INDEX "schools_npsn_idx" ON "schools"("npsn");

-- CreateIndex
CREATE INDEX "schools_isActive_idx" ON "schools"("isActive");

-- CreateIndex
CREATE INDEX "schools_provinceId_idx" ON "schools"("provinceId");

-- CreateIndex
CREATE INDEX "schools_regencyId_idx" ON "schools"("regencyId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_sppgId_schoolCode_key" ON "schools"("sppgId", "schoolCode");

-- CreateIndex
CREATE INDEX "program_school_enrollments_schoolId_idx" ON "program_school_enrollments"("schoolId");

-- CreateIndex
CREATE INDEX "program_school_enrollments_programId_idx" ON "program_school_enrollments"("programId");

-- CreateIndex
CREATE INDEX "program_school_enrollments_sppgId_idx" ON "program_school_enrollments"("sppgId");

-- CreateIndex
CREATE INDEX "program_school_enrollments_status_idx" ON "program_school_enrollments"("status");

-- CreateIndex
CREATE INDEX "program_school_enrollments_isActive_idx" ON "program_school_enrollments"("isActive");

-- CreateIndex
CREATE INDEX "program_school_enrollments_enrollmentDate_idx" ON "program_school_enrollments"("enrollmentDate");

-- CreateIndex
CREATE UNIQUE INDEX "program_school_enrollments_schoolId_programId_key" ON "program_school_enrollments"("schoolId", "programId");

-- CreateIndex
CREATE INDEX "inventory_items_foodCategoryId_idx" ON "inventory_items"("foodCategoryId");

-- CreateIndex
CREATE INDEX "nutrition_menus_foodCategoryId_idx" ON "nutrition_menus"("foodCategoryId");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_foodCategoryId_fkey" FOREIGN KEY ("foodCategoryId") REFERENCES "food_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_categories" ADD CONSTRAINT "food_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "food_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_regencyId_fkey" FOREIGN KEY ("regencyId") REFERENCES "regencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "villages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_school_enrollments" ADD CONSTRAINT "program_school_enrollments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_school_enrollments" ADD CONSTRAINT "program_school_enrollments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_school_enrollments" ADD CONSTRAINT "program_school_enrollments_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_distributions" ADD CONSTRAINT "food_distributions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "program_school_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_menus" ADD CONSTRAINT "nutrition_menus_foodCategoryId_fkey" FOREIGN KEY ("foodCategoryId") REFERENCES "food_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
