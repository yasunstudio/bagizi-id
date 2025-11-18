# SchoolBeneficiary Model Deprecation (Phase 3)

**Date**: November 4, 2025  
**Phase**: Phase 3 - API Development  
**Decision**: Remove deprecated SchoolBeneficiary model from schema  

---

## 🎯 Context

After completing **Phase 2** (seed integration), we successfully migrated to the **clean architecture**:
- **OLD**: `SchoolBeneficiary` (monolithic, 82 fields, per-program duplication)
- **NEW**: `School` (master data, reusable) + `ProgramSchoolEnrollment` (per-program config)

The `SchoolBeneficiary` model is now **deprecated** and should be removed from the schema.

---

## 📊 Impact Analysis

### Models with SchoolBeneficiary Relations

**Before removal**, the following models referenced `SchoolBeneficiary`:

1. **SPPG** model
   - Field: `schoolBeneficiaries SchoolBeneficiary[]`
   - Status: DEPRECATED, will be removed

2. **NutritionProgram** model  
   - Field: `schools SchoolBeneficiary[]`
   - Status: DEPRECATED, will be removed

3. **FoodDistribution** model
   - Field: `schoolId` pointing to `SchoolBeneficiary`
   - Status: Will need migration to use `School` model

4. **SchoolDistribution** model
   - Field: `school SchoolBeneficiary`
   - Status: Will need migration to use `School` model

5. **SchoolFeedingReport** model
   - Field: `school SchoolBeneficiary`
   - Status: Will need migration to use `School` model

6. **DistributionDelivery** model
   - Field: `schoolBeneficiary SchoolBeneficiary?`
   - Status: Will need migration to use `School` model

7. **Regional models** (Province, Regency, District, Village)
   - Fields: `schoolBeneficiary SchoolBeneficiary[]`
   - Status: Will use `schools School[]` instead

---

## ⚠️ Migration Strategy

### Step 1: Remove SchoolBeneficiary Model (Current)
✅ **Action**: Delete the entire `SchoolBeneficiary` model from `prisma/schema.prisma`

### Step 2: Update Dependent Models (Future Phase)
⏳ **Action**: Migrate all models that referenced `SchoolBeneficiary` to use `School` instead

**Models to update**:
- `FoodDistribution` → Change `schoolId` to reference `School.id`
- `SchoolDistribution` → Change `schoolId` to reference `School.id`
- `SchoolFeedingReport` → Change `schoolId` to reference `School.id`
- `DistributionDelivery` → Change `schoolBeneficiaryId` to `schoolId` referencing `School.id`

### Step 3: Remove SPPG/NutritionProgram Relations (Current)
✅ **Action**: Remove deprecated fields from SPPG and NutritionProgram models

**SPPG model**:
```prisma
// REMOVE THIS:
schoolBeneficiaries SchoolBeneficiary[] // ✅ DEPRECATED: Will be removed after migration

// KEEP THIS (already exists):
schools School[] // ✅ NEW: School master data
programSchoolEnrollments ProgramSchoolEnrollment[] // ✅ NEW: Per-program enrollments
```

**NutritionProgram model**:
```prisma
// REMOVE THIS:
schools SchoolBeneficiary[]

// KEEP THIS (already exists):
schoolEnrollments ProgramSchoolEnrollment[] // ✅ NEW: Per-program enrollments
```

### Step 4: Database Migration
⏳ **Action**: Generate and apply Prisma migration

```bash
# Generate migration
npx prisma migrate dev --name remove_school_beneficiary_deprecated_model

# This will:
# 1. Drop school_beneficiaries table
# 2. Remove foreign keys from dependent tables
# 3. Update indexes
```

---

## 🔍 Verification Checklist

**Before Removal**:
- [x] Phase 2 completed successfully (seed system working)
- [x] School and ProgramSchoolEnrollment models tested
- [x] Database has 5 schools and 5 enrollments
- [x] All seed files use new architecture

**After Removal**:
- [ ] No TypeScript compilation errors
- [ ] No Prisma schema validation errors
- [ ] Migration generates successfully
- [ ] Database applies migration without errors
- [ ] Existing data preserved (School and ProgramSchoolEnrollment tables untouched)

---

## 📝 Code References

**Files Affected by SchoolBeneficiary Removal**:

1. **Schema** (PRIMARY):
   - `/prisma/schema.prisma` - Lines 1964-2104 (SchoolBeneficiary model)
   - `/prisma/schema.prisma` - Line 227 (SPPG.schoolBeneficiaries relation)
   - `/prisma/schema.prisma` - Line 2971 (NutritionProgram.schools relation)
   - `/prisma/schema.prisma` - Lines 4755, 4771, 4787, 4803 (Regional model relations)

2. **API Routes** (SECONDARY):
   - `/src/app/api/sppg/schools/route.ts` - Old implementation using SchoolBeneficiary
   - Will be rewritten to use `School` model in Phase 3

3. **Schemas** (TERTIARY):
   - `/src/features/sppg/school/schemas/` - Old schemas using SchoolBeneficiary
   - Will be recreated for `School` model in Phase 3

---

## ✅ Expected Outcome

**Clean Architecture Achieved**:
- ✅ Single source of truth: `School` table (master data)
- ✅ Per-program configuration: `ProgramSchoolEnrollment` table
- ✅ No duplication of school information
- ✅ Normalized database structure
- ✅ Easier to maintain and scale

**Database Structure** (Post-removal):
```
schools (Master Data)
├── id, schoolName, schoolCode, npsn
├── schoolType, schoolStatus, infrastructure
├── location (province, regency, district, village)
└── sppgId (owner)

program_school_enrollments (Per-program Config)
├── id, schoolId (FK → schools.id)
├── programId (FK → nutrition_programs.id)
├── student demographics, feeding config
├── delivery config, budget allocation
└── UNIQUE(schoolId, programId)
```

---

## 🚀 Next Steps (Phase 3 Continuation)

1. ✅ Remove SchoolBeneficiary from schema
2. ⏳ Generate and apply migration
3. ⏳ Rewrite `/api/sppg/schools/route.ts` using `withSppgAuth` and `School` model
4. ⏳ Create remaining API endpoints
5. ⏳ Create API clients and types
6. ⏳ Test all endpoints

---

**Status**: 🔄 **IN PROGRESS** - Removing deprecated model  
**Blocked by**: None  
**Blocking**: Phase 3 API development (cannot proceed until schema is clean)
