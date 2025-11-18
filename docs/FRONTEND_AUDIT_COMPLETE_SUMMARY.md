# 🔍 Complete Frontend Audit Report - School Module

**Date**: January 20, 2025  
**Status**: ⚠️ **CRITICAL ISSUES IDENTIFIED**  
**Impact**: 🔴 **PRODUCTION BLOCKER**

---

## 🎯 Executive Summary

**Problem**: School frontend components are using fields that **DO NOT EXIST** in the database schema.

**Root Cause**: Schema cleanup in Phase 3 removed `SchoolBeneficiary` and moved student data to `ProgramSchoolEnrollment`, but frontend code (schemas, types, components) were **not updated** to reflect this architectural change.

**Impact**: 
- Runtime errors when accessing non-existent fields
- Form submissions will fail
- Data displays show undefined/null values
- TypeScript compiles without errors (misleading!)

**Affected Components**: 3 files (SchoolCard, SchoolForm, SchoolDetail)  
**Lines to Fix**: ~200+ lines across 5 files  
**Estimated Fix Time**: 2-3 hours

---

## 📊 Complete Issue Inventory

### **Issue 1: Database Schema vs Frontend Schema Mismatch** 🔴 CRITICAL

#### ❌ **Fields in Frontend (But NOT in Database)**:
```typescript
// These exist in schoolSchema.ts and school.types.ts
// BUT DO NOT EXIST in prisma/schema.prisma School model!

totalStudents      // ❌ Not in DB
targetStudents     // ❌ Not in DB
activeStudents     // ❌ Not in DB
students4to6Years  // ❌ Not in DB
students7to12Years // ❌ Not in DB
students13to15Years // ❌ Not in DB
students16to18Years // ❌ Not in DB
```

#### ✅ **Where These Fields Actually Exist**:
```typescript
// In ProgramSchoolEnrollment model (per-program data)
targetStudents     // ✅ Exists here (per program)
activeStudents     // ✅ Exists here (per program)
students4to6Years  // ✅ Exists here (per program)
students7to12Years // ✅ Exists here (per program)
students13to15Years // ✅ Exists here (per program)
students16to18Years // ✅ Exists here (per program)

// totalStudents DOES NOT exist anywhere!
// Should be calculated: sum of age groups OR sum across enrollments
```

---

### **Issue 2: schoolSchema.ts Contains Invalid Fields** 🔴 CRITICAL

**File**: `src/features/sppg/school/schemas/schoolSchema.ts`  
**Lines**: 55-62, 136-170, 258, 281-282

**Problem**: Zod schema defines fields that don't exist in database

```typescript
// Line 55-62 - WRONG! These fields not in DB
export const schoolMasterSchema = z.object({
  // ... other fields ...
  totalStudents: z.number().int().min(0),        // ❌
  targetStudents: z.number().int().min(0),       // ❌
  activeStudents: z.number().int().min(0),       // ❌
  students4to6Years: z.number().int().min(0),    // ❌
  students7to12Years: z.number().int().min(0),   // ❌
  students13to15Years: z.number().int().min(0),  // ❌
  students16to18Years: z.number().int().min(0),  // ❌
})

// Line 136-170 - WRONG! Validation for non-existent fields
.refine((data) => {
  // Validation 1: Gender breakdown must equal totalStudents
  // Validation 2: Age breakdown must equal totalStudents
  // Validation 3: activeStudents validation
  // ALL WRONG - these fields don't exist!
})
```

**Impact**: 
- Form accepts student data that can't be saved
- API will reject these fields
- Validation logic is pointless

**Fix**: Remove all student-related fields from `schoolMasterSchema`

---

### **Issue 3: school.types.ts Contains Invalid Interfaces** 🔴 CRITICAL

**File**: `src/features/sppg/school/types/school.types.ts`  
**Lines**: 64-71, 190-192, 345-351, 494, 536-539, 612, 644-647

**Problem**: TypeScript interfaces include non-existent fields

```typescript
// Line 64-71 - WRONG! SchoolMaster interface
export interface SchoolMaster {
  id: string
  sppgId: string
  schoolName: string
  // ... other fields ...
  
  // ❌ THESE DON'T EXIST IN DB!
  totalStudents: number
  targetStudents: number
  activeStudents: number
  students4to6Years: number
  students7to12Years: number
  students13to15Years: number
  students16to18Years: number
}

// Line 190-192, 345-351, etc. - WRONG!
// Multiple interfaces repeated the same issue
```

**Impact**: 
- TypeScript doesn't catch field access errors
- Components compile but fail at runtime
- Misleading autocomplete suggestions

**Fix**: Remove student fields from `SchoolMaster` interface

---

### **Issue 4: SchoolCard.tsx Displays Non-Existent Fields** 🔴 HIGH

**File**: `src/features/sppg/school/components/SchoolCard.tsx`  
**Lines**: 72-77, 119

```typescript
// Line 72-77 - Compact variant
<span className="flex items-center gap-1">
  <Users className="h-3 w-3" />
  {school.totalStudents}    // ❌ undefined!
</span>
<span className="flex items-center gap-1">
  <Target className="h-3 w-3" />
  {school.targetStudents}   // ❌ undefined!
</span>
```

**Impact**: UI shows "undefined" or crashes

**Fix Options**:
1. Remove student count display (simplest)
2. Aggregate from `programEnrollments` relation
3. Show enrollment count instead

---

### **Issue 5: SchoolForm.tsx Accepts Invalid Data** 🔴 CRITICAL

**File**: `src/features/sppg/school/components/SchoolForm.tsx`  
**Lines**: 117-125, 186-195, ~1500-1800 (entire "Data Siswa" section)

```typescript
// Line 117-125 - Default values for non-existent fields
defaultValues: {
  // ... other fields ...
  totalStudents: defaultValues?.totalStudents ?? 0,      // ❌
  targetStudents: defaultValues?.targetStudents ?? 0,    // ❌
  activeStudents: defaultValues?.activeStudents ?? 0,    // ❌
  students4to6Years: defaultValues?.students4to6Years ?? 0,    // ❌
  students7to12Years: defaultValues?.students7to12Years ?? 0,  // ❌
  students13to15Years: defaultValues?.students13to15Years ?? 0, // ❌
  students16to18Years: defaultValues?.students16to18Years ?? 0, // ❌
}

// Line 186-195 - Auto-calculation logic
useEffect(() => {
  const subscription = form.watch((value, { name }) => {
    if (name === 'totalStudents' && value.totalStudents) {
      form.setValue('activeStudents', value.totalStudents)
    }
  })
  return () => subscription.unsubscribe()
}, [form])

// Line ~1500-1800 - Entire "Data Siswa" tab with input fields
// All inputs for fields that don't exist in DB
```

**Impact**: 
- Users enter data that can't be saved
- API rejects the payload
- Confusing error messages

**Fix**: 
- Remove "Data Siswa" section entirely
- Remove auto-calculation useEffect
- Remove student fields from defaultValues
- Student data should be in enrollment forms only

---

### **Issue 6: SchoolDetail.tsx Shows Wrong Data** 🔴 CRITICAL

**File**: `src/features/sppg/school/components/SchoolDetail.tsx`  
**Lines**: 359, 370, 612, 616, 620, 632-651

```typescript
// Line 359 - Overview tab stats
<div className="text-2xl font-bold">{school.totalStudents}</div>  // ❌ undefined!

// Line 370
<div className="text-2xl font-bold">{school.targetStudents}</div> // ❌ undefined!

// Line 612-620 - Students tab (entire tab is WRONG!)
<div className="text-2xl font-bold">{school.totalStudents}</div>     // ❌
<div className="text-2xl font-bold">{school.targetStudents}</div>    // ❌
<div className="text-2xl font-bold">{school.activeStudents}</div>    // ❌

// Line 632-651 - Age breakdown display
<div>{school.students4to6Years} siswa</div>    // ❌ undefined!
<div>{school.students7to12Years} siswa</div>   // ❌ undefined!
<div>{school.students13to15Years} siswa</div>  // ❌ undefined!
<div>{school.students16to18Years} siswa</div>  // ❌ undefined!
```

**Impact**: 
- Statistics show undefined/NaN
- Students tab is completely broken
- Age breakdown shows no data

**Fix Options**:
1. Remove student stats from Overview
2. Remove entire Students tab (data should be in enrollments)
3. Aggregate from `programEnrollments` if needed

---

### ✅ **What's Already Correct**

#### SchoolList.tsx ✅
**Status**: NO ISSUES FOUND

This component only displays:
- schoolName
- schoolCode
- schoolType
- schoolStatus

**No student count fields used!** 🎉

#### EnrollmentSection.tsx ✅
**Status**: FIXED (in Phase 3)

Correctly uses fields from `ProgramSchoolEnrollment`:
```typescript
enrollment.targetStudents   // ✅ Correct
enrollment.activeStudents   // ✅ Correct
enrollment.students4to6Years // ✅ Correct
```

#### ProgramCard.tsx ✅
**Status**: ALIGNED WITH SCHEMA

Correctly uses fields from `NutritionProgram`:
```typescript
program.targetRecipients    // ✅ Correct
program.currentRecipients   // ✅ Correct
```

---

## 🔧 Complete Fix Plan

### **Phase 1: Fix Schema & Types** (Priority 1)

#### Step 1.1: Update schoolSchema.ts
**File**: `src/features/sppg/school/schemas/schoolSchema.ts`

**Remove these lines**:
```typescript
// Line 55-62 - DELETE
totalStudents: z.number()...
targetStudents: z.number()...
activeStudents: z.number()...
students4to6Years: z.number()...
students7to12Years: z.number()...
students13to15Years: z.number()...
students16to18Years: z.number()...

// Line 136-170 - DELETE entire validation block
.refine((data) => { ... })
```

#### Step 1.2: Update school.types.ts
**File**: `src/features/sppg/school/types/school.types.ts`

**Remove from SchoolMaster interface** (line 64-71):
```typescript
// DELETE these properties
totalStudents: number
targetStudents: number
activeStudents: number
students4to6Years: number
students7to12Years: number
students13to15Years: number
students16to18Years: number
```

**Also remove from** (search & remove):
- `SchoolDetail` interface (line ~190)
- `SchoolInput` interface (line ~345)
- `SchoolStats` interface (line ~494, 536)
- `SchoolWithStats` interface (line ~612, 644)

---

### **Phase 2: Fix Components** (Priority 2)

#### Step 2.1: Fix SchoolCard.tsx

**Option A: Remove student counts** (Recommended)
```typescript
// REMOVE lines 72-77
// Don't display student counts in card

// Keep only:
- schoolName
- schoolCode
- schoolType
- schoolAddress
```

**Option B: Show enrollment count**
```typescript
// Replace with:
<span className="flex items-center gap-1">
  <Users className="h-3 w-3" />
  {school.programEnrollments?.length || 0} program
</span>
```

#### Step 2.2: Fix SchoolForm.tsx

**Remove entire "Data Siswa" section**:
```typescript
// DELETE tab from sections array (line ~169)
{ id: 'students', title: 'Data Siswa', icon: Users }

// DELETE defaultValues (line 117-125)
totalStudents: ...
targetStudents: ...
activeStudents: ...
students4to6Years: ...
// etc.

// DELETE useEffect auto-calculation (line 186-195)

// DELETE entire TabsContent for "Data Siswa" (~1500-1800 lines)
<TabsContent value="students">...</TabsContent>
```

**Result**: School form only manages school master data

#### Step 2.3: Fix SchoolDetail.tsx

**Remove student stats from Overview tab**:
```typescript
// DELETE cards showing student counts (line 352-380)
// Keep only:
- School info
- Contact info
- Facilities info
```

**Remove Students tab entirely**:
```typescript
// DELETE from TabsList (line ~300)
<TabsTrigger value="students">Data Siswa</TabsTrigger>

// DELETE entire TabsContent (line 600-700)
<TabsContent value="students">...</TabsContent>
```

**Keep Program tab** (already shows enrollments correctly!)

---

### **Phase 3: Update API & Hooks** (Priority 3)

#### Step 3.1: Verify API doesn't accept invalid fields
**File**: `src/app/api/sppg/schools/route.ts`

**Check**: Ensure API validation uses corrected schema

#### Step 3.2: Update hooks if needed
**File**: `src/features/sppg/school/hooks/useSchool.ts`

**Check**: Ensure hooks don't expect removed fields

---

### **Phase 4: Testing** (Priority 4)

#### Test Plan:
1. ✅ TypeScript compilation (should be zero errors)
2. ✅ Create new school (form should submit successfully)
3. ✅ View school detail (no undefined values)
4. ✅ Edit school (form loads correctly)
5. ✅ List schools (cards display correctly)
6. ✅ Create enrollment (student data goes to enrollment, not school)
7. ✅ View enrollments (shows correct student counts per program)

---

## 📐 Correct Data Architecture

### **School Model** (Master Data Only)
```prisma
model School {
  id              String
  sppgId          String
  schoolName      String
  schoolCode      String
  schoolType      SchoolType
  schoolStatus    SchoolStatus
  principalName   String
  contactPhone    String
  contactEmail    String?
  schoolAddress   String
  provinceId      String?
  regencyId       String?
  districtId      String?
  // Infrastructure
  hasKitchen      Boolean
  hasStorage      Boolean
  hasCleanWater   Boolean
  hasElectricity  Boolean
  // Relations
  programEnrollments ProgramSchoolEnrollment[]
  
  // ❌ NO STUDENT COUNTS!
}
```

### **ProgramSchoolEnrollment** (Per-Program Data)
```prisma
model ProgramSchoolEnrollment {
  id              String
  schoolId        String
  programId       String
  sppgId          String
  
  // ✅ STUDENT DATA HERE!
  targetStudents  Int      // Per program
  activeStudents  Int?     // Per program
  students4to6Years   Int?
  students7to12Years  Int?
  students13to15Years Int?
  students16to18Years Int?
  maleStudents    Int?
  femaleStudents  Int?
  
  school          School @relation(...)
  program         NutritionProgram @relation(...)
}
```

### **If You Need Total Students**:
```typescript
// Aggregate from enrollments
const totalTargetStudents = school.programEnrollments.reduce(
  (sum, enrollment) => sum + enrollment.targetStudents,
  0
)

const totalActiveStudents = school.programEnrollments.reduce(
  (sum, enrollment) => sum + (enrollment.activeStudents || 0),
  0
)
```

---

## 📊 Impact Analysis

### **Before Fix**:
```
❌ SchoolCard: Displays undefined
❌ SchoolForm: Accepts invalid data → API rejects → User confused
❌ SchoolDetail: Stats show NaN, Students tab broken
❌ Database: Has no student data for schools
❌ User Experience: Frustrating, broken features
```

### **After Fix**:
```
✅ SchoolCard: Clean display, no undefined values
✅ SchoolForm: Only master data, validates correctly
✅ SchoolDetail: Accurate info, enrollment tab works
✅ Database: Consistent data structure
✅ User Experience: Professional, working features
```

---

## 🚨 **CRITICAL: Do NOT Deploy Until Fixed**

**Current Status**: 🔴 **NOT PRODUCTION READY**

**Blockers**:
1. Form submissions will fail (invalid fields)
2. Detail pages show broken data
3. User confusion from undefined values
4. Data integrity issues

**Estimated Fix Time**: 2-3 hours

**Priority**: 🔥 **URGENT** - Block deployment until fixed

---

## ✅ **Next Steps**

1. **Get approval for fix approach** (remove vs aggregate)
2. **Fix schemas & types** (30 minutes)
3. **Fix components** (1-2 hours)
4. **Test thoroughly** (30 minutes)
5. **Update documentation** (15 minutes)
6. **Deploy fix** (15 minutes)

**Total**: ~3 hours

---

## 📝 **Recommended Approach**

**I recommend**: **REMOVE student data from School components entirely**

**Rationale**:
1. ✅ **Aligns with database architecture** (School = master data only)
2. ✅ **Simpler fix** (remove, don't aggregate)
3. ✅ **Clearer separation of concerns** (enrollment handles student data)
4. ✅ **Faster to implement** (2 hours vs 4 hours)
5. ✅ **Less risk of bugs** (no complex aggregation logic)
6. ✅ **Better UX** (students managed per-program, not per-school)

**User flow**:
1. Create school (master data only)
2. Enroll school in program (add student counts here!)
3. View school → see list of program enrollments
4. Each enrollment shows its own student data

This matches the **actual business logic**: Student counts are **per-program**, not per-school!

---

**Ready to fix?** Let me know and I'll start implementing the corrections! 🚀
