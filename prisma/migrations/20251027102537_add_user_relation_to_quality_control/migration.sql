-- CreateIndex
CREATE INDEX "quality_controls_checkedBy_idx" ON "quality_controls"("checkedBy");

-- AddForeignKey
ALTER TABLE "quality_controls" ADD CONSTRAINT "quality_controls_checkedBy_fkey" FOREIGN KEY ("checkedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
