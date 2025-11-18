/*
  Warnings:

  - A unique constraint covering the columns `[beneficiaryOrgId,programId,targetGroup]` on the table `program_beneficiary_enrollments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "program_beneficiary_enrollments_beneficiaryOrgId_programId__key" ON "program_beneficiary_enrollments"("beneficiaryOrgId", "programId", "targetGroup");
