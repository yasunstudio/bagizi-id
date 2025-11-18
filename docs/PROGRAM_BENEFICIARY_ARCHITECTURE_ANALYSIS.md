# 📊 Analisis Arsitektur Program & Penerima Manfaat

**Tanggal Analisis**: 14 November 2025  
**Status**: Post BeneficiaryOrganization Schema Cleanup  
**Versi**: Next.js 15.5.4 / Prisma 6.17.1

---

## 🎯 Executive Summary

Setelah cleanup pada `BeneficiaryOrganization`, arsitektur program dan penerima manfaat kini memiliki **3 layer utama**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    NutritionProgram                              │
│  (Program Gizi - APBN/APBD Funded)                              │
│  - Multi-target capable (1-6 target groups)                      │
│  - Budget tracking & government compliance                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── allowedTargetGroups: TargetGroup[]
                              │    (TODDLER, PREGNANT_WOMAN, etc.)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│          ProgramBeneficiaryEnrollment                           │
│  (Junction Table - Program ↔ Organization)                      │
│  - One enrollment per targetGroup per organization              │
│  - Feeding schedule, budget allocation, metrics                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── targetGroup: TargetGroup
                              │    (Single value per enrollment)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│            BeneficiaryOrganization                              │
│  (Sekolah, Puskesmas, Posyandu, etc.)                           │
│  - Physical location where beneficiaries are located            │
│  - Type-specific fields (NPSN, NIKKES, etc.)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📐 Model Architecture Deep Dive

### 1️⃣ **NutritionProgram** - Program Gizi (Top Level)

#### **Purpose**
Program gizi yang didanai oleh APBN/APBD dengan multi-target capability.

#### **Key Fields Analysis**

**A. Multi-Target Architecture** ✅ SIMPLIFIED (Phase 2 - Nov 11, 2025)
```prisma
allowedTargetGroups TargetGroup[] // Array of allowed target groups
```

**Cara Kerja:**
- **Single-target program**: `allowedTargetGroups = [SCHOOL_CHILDREN]`
- **Multi-target program**: `allowedTargetGroups = [PREGNANT_WOMAN, BREASTFEEDING_MOTHER, TODDLER]`
- Minimum: 1 target group
- Maximum: 6 target groups (all TargetGroup enum values)

**Migration History:**
- ❌ **Removed**: `isMultiTarget` (boolean)
- ❌ **Removed**: `targetGroup` (single value)
- ❌ **Removed**: `primaryTargetGroup`
- ✅ **Current**: Array-only approach (cleaner, simpler)

**B. Budget Tracking** ✅ REQUIRED (Nov 12, 2025)
```prisma
// REQUIRED fields (government compliance)
totalBudget        Float               // Total program budget
budgetPerMeal      Float               // Per meal per beneficiary
budgetSource       BudgetSource        // APBN_PUSAT, APBD_PROVINSI, etc.
budgetYear         Int                 // Fiscal year

// Optional government tracking
dpaNumber          String?             // DPA number
apbnProgramCode    String?             // APBN code
budgetDecreeNumber String?             // SK number
budgetDecreeDate   DateTime?           // SK date

// Budget breakdown (government regulation compliance)
foodBudget         Float?              // 60-75%
operationalBudget  Float?              // 15-20%
transportBudget    Float?              // 5-10%
utilityBudget      Float?              // 3-5%
staffBudget        Float?              // 5-7%
otherBudget        Float?              // 2-3%

// Approval tracking
budgetApprovedBy   String?
budgetApprovedAt   DateTime?
budgetApprovalNotes String?
```

**Impact:**
- ✅ **Before**: Programs could be created without budget (invalid for government programs)
- ✅ **After**: Budget is mandatory, ensuring compliance with APBN/APBD regulations

**C. Nutrition Targets** ❌ REMOVED (Phase 5 - Nov 8, 2025)
```prisma
// REMOVED: calories, protein, carbohydrates, fat, fiber
// REASON: NutritionStandard is single source of truth
```

**Replacement:**
- Use `NutritionStandard` model (based on target group + age + gender)
- Helper functions: `getProgramNutritionTargets()`, `getProgramNutritionSummary()`
- Located in: `/src/lib/nutrition-helpers.ts`

**D. Enrollment Tracking** ✅ NEW ARCHITECTURE (Phase 3)
```prisma
// ❌ REMOVED (Jan 19, 2025)
// - schoolDistributions
// - programEnrollments (old model)

// ✅ NEW
beneficiaryEnrollments ProgramBeneficiaryEnrollment[] @relation("ProgramBeneficiaryEnrollments")
```

**Key Changes:**
- Old: School-specific enrollment model
- New: Universal enrollment for ALL beneficiary types

#### **Relations**

```prisma
// Parent
sppg SPPG @relation(fields: [sppgId], references: [id])

// Children
menus              NutritionMenu[]
menuPlans          MenuPlan[]
productions        FoodProduction[]
distributions      FoodDistribution[]
procurementPlans   ProcurementPlan[]
monitoring         ProgramMonitoring[]

// NEW: Multi-Beneficiary
beneficiaryEnrollments ProgramBeneficiaryEnrollment[]

// NEW: Budget tracking
budgetAllocations  ProgramBudgetAllocation[]
banperTracking     BanperRequestTracking[]
```

---

### 2️⃣ **ProgramBeneficiaryEnrollment** - Junction Table (Middle Layer)

#### **Purpose**
**Junction table** yang menghubungkan `NutritionProgram` dengan `BeneficiaryOrganization`.

#### **Critical Design Decision**

**Q: Apakah 1 enrollment = 1 organization atau 1 targetGroup?**

**A: 1 enrollment = 1 targetGroup per organization**

**Contoh:**
```
Program: "MBG Multi-Target 2025"
allowedTargetGroups: [PREGNANT_WOMAN, BREASTFEEDING_MOTHER, TODDLER]

Posyandu A enrolls dengan 3 enrollments:
├─ Enrollment 1: targetGroup = PREGNANT_WOMAN (50 ibu hamil)
├─ Enrollment 2: targetGroup = BREASTFEEDING_MOTHER (30 ibu menyusui)
└─ Enrollment 3: targetGroup = TODDLER (100 balita)

Posyandu B enrolls dengan 1 enrollment:
└─ Enrollment 1: targetGroup = TODDLER (80 balita)
```

**Kenapa Design Ini?**
1. **Flexibility**: Setiap target group punya kebutuhan berbeda
2. **Budget Tracking**: Budget per target group bisa ditrack terpisah
3. **Distribution**: Distribusi bisa berbeda per target group
4. **Reporting**: Laporan per target group lebih akurat

#### **Key Fields Analysis**

**A. Target Group Configuration** 🎯 CRITICAL
```prisma
targetGroup TargetGroup // SINGLE value per enrollment
```

**Allowed Values:**
- `TODDLER` - Balita 0-5 tahun
- `PREGNANT_WOMAN` - Ibu hamil
- `BREASTFEEDING_MOTHER` - Ibu menyusui
- `TEENAGE_GIRL` - Remaja putri (10-19 tahun)
- `ELDERLY` - Lansia (60+ tahun)
- `SCHOOL_CHILDREN` - Anak sekolah (SD/SMP/SMA)

**B. Beneficiary Counts** 👥
```prisma
targetBeneficiaries Int  // Target total
activeBeneficiaries Int? // Current active

// Age breakdown (applicable for multiple target groups)
beneficiaries0to2Years   Int?
beneficiaries2to5Years   Int?
beneficiaries6to12Years  Int?
beneficiaries13to15Years Int?
beneficiaries16to18Years Int?
beneficiariesAbove18     Int?

// Gender breakdown
maleBeneficiaries   Int?
femaleBeneficiaries Int?
```

**Terminology:**
- ✅ **Generic**: "beneficiaries" (bukan "students")
- ✅ **Flexible**: Bisa untuk ibu hamil, balita, siswa, lansia
- ✅ **Age-based**: Breakdown umur sesuai target group

**C. Target-Specific Data** ✅ NEW (Phase 3 - Nov 7, 2025)
```prisma
targetGroupSpecificData Json?
```

**Purpose:** Flexible JSON field for target-specific breakdowns

**Examples:**

**For PREGNANT_WOMAN:**
```json
{
  "firstTrimester": 15,
  "secondTrimester": 20,
  "thirdTrimester": 15,
  "highRiskCount": 5,
  "averageAge": 28
}
```

**For BREASTFEEDING_MOTHER:**
```json
{
  "babyAge0to6Months": 10,
  "babyAge6to12Months": 12,
  "babyAge12to24Months": 8,
  "exclusiveBreastfeeding": 18
}
```

**For SCHOOL_CHILDREN:**
```json
{
  "elementaryStudents": 200,
  "juniorHighStudents": 150,
  "seniorHighStudents": 100,
  "specialNeedsStudents": 12
}
```

**For TODDLER:**
```json
{
  "age0to2Years": 30,
  "age2to5Years": 50,
  "stuntingRisk": 8,
  "underweight": 5
}
```

**D. Feeding Configuration** 🍽️
```prisma
feedingDays   Int?     // Days per week (e.g., 5)
mealsPerDay   Int?     // Meals per day (e.g., 1)
feedingTime   String?  // "Lunch and Snack"
breakfastTime String?  // "07:30"
lunchTime     String?  // "12:00"
snackTime     String?  // "15:00"
```

**Universal untuk semua target groups:**
- Pregnant woman: Mungkin 2 meals/day + snack
- School children: Biasanya 1 meal/day (lunch)
- Toddler: Bisa 2-3 meals/day
- Elderly: Mungkin 1 meal/day

**E. Delivery Configuration** 🚚
```prisma
deliveryAddress       String?
deliveryContact       String?
deliveryPhone         String?
deliveryInstructions  String?
preferredDeliveryTime String?
estimatedTravelTime   Int?
```

**Use Cases:**
- School: Delivery ke sekolah (central kitchen → school)
- Posyandu: Delivery ke posyandu (central kitchen → posyandu)
- Puskesmas: Delivery untuk ibu hamil take-home

**F. Budget Tracking** 💰
```prisma
monthlyBudgetAllocation Float? // Monthly from APBD/APBN
budgetPerBeneficiary    Float? // Cost per beneficiary
```

**Purpose:**
- Track budget allocation per enrollment
- Monitor spending per target group
- Report to government per beneficiary type

**G. Performance Tracking** 📊
```prisma
totalMealsServed         Int?
totalBeneficiariesServed Int?
averageAttendanceRate    Float?
lastDistributionDate     DateTime?
lastMonitoringDate       DateTime?

// Quality metrics
satisfactionScore       Float?
complaintCount          Int?
nutritionComplianceRate Float?
```

**H. Special Requirements** 🏥
```prisma
specialDietaryNeeds   String? // JSON or comma-separated
allergenRestrictions  String? // "Peanuts, Seafood, Eggs"
culturalPreferences   String? // "Halal, Vegetarian"
medicalConsiderations String? // For pregnant women, elderly
```

**Examples:**

**Pregnant Women:**
```
medicalConsiderations: "High blood pressure - low sodium diet"
culturalPreferences: "Halal"
```

**School Children:**
```
allergenRestrictions: "Peanuts (3 students), Seafood (2 students)"
culturalPreferences: "Halal"
```

**Elderly:**
```
specialDietaryNeeds: "Soft food, easy to chew"
medicalConsiderations: "Diabetes - low sugar diet"
```

**I. Status & Flags** 🚦
```prisma
enrollmentStatus ProgramEnrollmentStatus // ACTIVE, SUSPENDED, COMPLETED, CANCELLED
isActive         Boolean
isPriority       Boolean  // Priority beneficiaries
needsAssessment  Boolean  // Requires nutritional assessment
```

#### **Relations**

```prisma
// Parents (Foreign Keys)
beneficiaryOrg BeneficiaryOrganization
program        NutritionProgram
sppg           SPPG

// Children (NEW - Phase 3)
distributions  FoodDistribution[] // Food distributions for this enrollment

// Future relations (to be added)
// monitoringRecords ProgramMonitoring[]
// assessments       NutritionalAssessment[]
// feedbacks         BeneficiaryFeedback[]
```

---

### 3️⃣ **BeneficiaryOrganization** - Physical Location (Bottom Layer)

#### **Purpose**
**Physical organization** tempat penerima manfaat berada (Sekolah, Puskesmas, Posyandu, dll).

#### **Key Changes Post-Cleanup**

**A. Removed Fields** ❌ (Nov 14, 2025)
```prisma
// ❌ REMOVED - Non-nutrition related
accreditationStatus
accreditationDate
capacity
facilities
programs
curriculumType
description // Kept as 'notes'
```

**Reason:** Focus on **nutrition program** data only, not comprehensive organization profile.

**B. Simplified Structure** ✅
```prisma
// Organization Identity (4 fields)
organizationName String
organizationCode String
type             BeneficiaryOrganizationType
subType          BeneficiaryOrganizationSubType?

// Location (8 fields) - Proper hierarchical foreign keys
address     String
provinceId  String  // Required
regencyId   String  // Required
districtId  String? // Optional
villageId   String? // Optional
postalCode  String?
latitude    Float?
longitude   Float?

// Contact (4 fields)
phone         String?
email         String?
contactPerson String?
contactTitle  String?

// Type-Specific Identifiers (3 fields)
npsn               String? // Schools only
nikkes             String? // Health facilities only
registrationNumber String? // Other types

// Principal/Head (2 fields)
principalName String?
principalNip  String?

// Ownership (1 field)
ownershipStatus OrganizationOwnershipStatus?

// Staff Counts (3 fields)
teachingStaffCount    Int? // Guru/Tenaga Medis/Kader
nonTeachingStaffCount Int? // Tendik/Support staff
establishedYear       Int?

// Status (2 fields)
operationalStatus String  // ACTIVE, INACTIVE, TEMPORARILY_CLOSED
isActive          Boolean

// Notes (1 field)
notes String?
```

**Total:** 23 fields (down from 30+ fields before cleanup)

**C. Type System** 🏛️

**Organization Types:**
```prisma
enum BeneficiaryOrganizationType {
  SCHOOL                    // Sekolah
  HEALTH_FACILITY          // Fasilitas Kesehatan (Puskesmas, Posyandu, etc.)
  INTEGRATED_SERVICE_POST  // Posyandu
  COMMUNITY_CENTER         // Pusat Komunitas
  DAYCARE                  // Daycare/PAUD
}
```

**Sub-Types:**
```prisma
enum BeneficiaryOrganizationSubType {
  // Schools
  TK_PAUD
  SD_MI
  SMP_MTS
  SMA_MA_SMK

  // Health Facilities
  PUSKESMAS
  PUSKESMAS_PEMBANTU
  RUMAH_SAKIT
  KLINIK

  // Posyandu (no subtypes - use main type)
  
  // Community Centers
  RW_CENTER
  KELURAHAN_CENTER
  
  // Daycare
  TPA
  KB
}
```

**D. Field Usage Per Type** 📋

| Field | SCHOOL | HEALTH_FACILITY | INTEGRATED_SERVICE_POST |
|-------|--------|-----------------|-------------------------|
| npsn | ✅ Required | ❌ | ❌ |
| nikkes | ❌ | ✅ Required | ❌ |
| registrationNumber | ❌ | ✅ Optional | ✅ Required |
| principalName | ✅ (Kepala Sekolah) | ✅ (Kepala Faskes) | ✅ (Ketua Posyandu) |
| principalNip | ✅ | ✅ | ❌ (usually volunteer) |
| teachingStaffCount | ✅ (Guru) | ✅ (Tenaga Medis) | ✅ (Kader) |
| nonTeachingStaffCount | ✅ (Tendik) | ✅ (Admin/Support) | ❌ |
| ownershipStatus | ✅ (Negeri/Swasta) | ✅ (Pemerintah/Swasta) | ❌ (Community-based) |

#### **Relations**

```prisma
// Parent
sppg SPPG

// Location hierarchy (proper foreign keys)
province Province
regency  Regency
district District?
village  Village?

// Children
enrollments   ProgramBeneficiaryEnrollment[] // Enrollments to programs
distributions FoodDistribution[]             // Direct distributions (NEW - Phase 3)
```

---

## 🔄 Data Flow & Relationships

### **Scenario 1: Single-Target Program (School Feeding)**

```
1. Create Program
   └─ NutritionProgram
      ├─ name: "MBG SD Kota Jakarta 2025"
      ├─ allowedTargetGroups: [SCHOOL_CHILDREN]
      ├─ totalBudget: 500_000_000
      └─ budgetPerMeal: 8_000

2. Create Organizations
   └─ BeneficiaryOrganization (SDN 01)
      ├─ type: SCHOOL
      ├─ subType: SD_MI
      ├─ npsn: "20100001"
      └─ teachingStaffCount: 25

3. Enroll Organization to Program
   └─ ProgramBeneficiaryEnrollment
      ├─ program: "MBG SD Kota Jakarta 2025"
      ├─ beneficiaryOrg: "SDN 01"
      ├─ targetGroup: SCHOOL_CHILDREN
      ├─ targetBeneficiaries: 400
      ├─ targetGroupSpecificData: {
      │   "elementaryStudents": 400,
      │   "grade1": 70,
      │   "grade2": 68,
      │   "grade3": 65,
      │   "grade4": 67,
      │   "grade5": 65,
      │   "grade6": 65
      │ }
      ├─ feedingDays: 5
      ├─ mealsPerDay: 1
      ├─ lunchTime: "12:00"
      └─ monthlyBudgetAllocation: 8_000 * 400 * 20 = 64_000_000
```

**Result:**
- 1 Program
- 1 Organization
- 1 Enrollment
- Total beneficiaries: 400 students

---

### **Scenario 2: Multi-Target Program (Posyandu)**

```
1. Create Program
   └─ NutritionProgram
      ├─ name: "MBG Multi-Target Posyandu 2025"
      ├─ allowedTargetGroups: [PREGNANT_WOMAN, BREASTFEEDING_MOTHER, TODDLER]
      ├─ totalBudget: 300_000_000
      └─ budgetPerMeal: 10_000

2. Create Organization
   └─ BeneficiaryOrganization (Posyandu Melati)
      ├─ type: INTEGRATED_SERVICE_POST
      ├─ registrationNumber: "PSY-JKT-2025-001"
      └─ teachingStaffCount: 10 (kader)

3. Enroll Organization with 3 Target Groups
   
   Enrollment 1:
   └─ ProgramBeneficiaryEnrollment
      ├─ targetGroup: PREGNANT_WOMAN
      ├─ targetBeneficiaries: 50
      ├─ targetGroupSpecificData: {
      │   "firstTrimester": 15,
      │   "secondTrimester": 20,
      │   "thirdTrimester": 15
      │ }
      ├─ mealsPerDay: 2
      └─ monthlyBudgetAllocation: 10_000 * 50 * 2 * 20 = 20_000_000
   
   Enrollment 2:
   └─ ProgramBeneficiaryEnrollment
      ├─ targetGroup: BREASTFEEDING_MOTHER
      ├─ targetBeneficiaries: 30
      ├─ targetGroupSpecificData: {
      │   "babyAge0to6Months": 10,
      │   "babyAge6to12Months": 12,
      │   "babyAge12to24Months": 8
      │ }
      ├─ mealsPerDay: 2
      └─ monthlyBudgetAllocation: 10_000 * 30 * 2 * 20 = 12_000_000
   
   Enrollment 3:
   └─ ProgramBeneficiaryEnrollment
      ├─ targetGroup: TODDLER
      ├─ targetBeneficiaries: 100
      ├─ targetGroupSpecificData: {
      │   "age0to2Years": 30,
      │   "age2to5Years": 70,
      │   "stuntingRisk": 8
      │ }
      ├─ mealsPerDay: 3
      └─ monthlyBudgetAllocation: 10_000 * 100 * 3 * 20 = 60_000_000
```

**Result:**
- 1 Program (multi-target)
- 1 Organization (Posyandu)
- 3 Enrollments (per target group)
- Total beneficiaries: 180 (50 + 30 + 100)
- Total monthly budget: 92_000_000

---

## 🔍 Critical Analysis & Issues

### ✅ **Strengths**

1. **Flexible Multi-Target Architecture**
   - Program can serve multiple beneficiary types
   - Each enrollment tracks specific target group
   - Budget tracking per target group

2. **Clean Data Model**
   - BeneficiaryOrganization simplified (23 fields)
   - No duplicate/redundant fields
   - Type-specific fields properly organized

3. **Government Compliance**
   - Budget fields mandatory (APBN/APBD)
   - DPA tracking
   - Budget breakdown by category

4. **Scalable Design**
   - Can add new target groups easily
   - JSON fields for target-specific data
   - Future relations ready (assessments, feedbacks)

### ⚠️ **Potential Issues**

#### **Issue 1: Enrollment Complexity for Multi-Target**

**Problem:**
```
Posyandu A wants to enroll in Program X with 3 target groups
→ Must create 3 separate enrollments
→ UI complexity: Multiple forms vs single form with target group selector
```

**Current UX Flow:**
```
Option A (Current - Complex):
1. Create enrollment for PREGNANT_WOMAN
2. Create enrollment for BREASTFEEDING_MOTHER
3. Create enrollment for TODDLER

Option B (Better UX):
1. Select organization
2. Select program
3. Multi-select target groups: ☑️ PREGNANT_WOMAN ☑️ BREASTFEEDING_MOTHER ☑️ TODDLER
4. Fill details for each selected target group (tabs or accordion)
5. Submit → Creates 3 enrollments automatically
```

**Recommendation:** Implement Option B with better UX

---

#### **Issue 2: Budget Allocation Hierarchy**

**Current Budget Levels:**
```
Level 1: NutritionProgram
├─ totalBudget: 500_000_000
└─ budgetPerMeal: 8_000

Level 2: ProgramBeneficiaryEnrollment
└─ monthlyBudgetAllocation: 64_000_000
```

**Questions:**
1. **Auto-calculation?**
   - Should `monthlyBudgetAllocation` auto-calculate from `budgetPerMeal * targetBeneficiaries * mealsPerDay * feedingDays`?
   - Or manual input for flexibility?

2. **Budget validation?**
   - Should sum of all enrollments' `monthlyBudgetAllocation` ≤ program `totalBudget`?
   - What happens if budget exceeded?

3. **Budget tracking?**
   - Need `ProgramBudgetAllocation` model for actual spending vs allocation?
   - Currently exists but not documented in this flow

**Recommendation:**
```typescript
// Auto-calculate monthly budget
const monthlyBudgetAllocation = 
  budgetPerMeal * 
  targetBeneficiaries * 
  mealsPerDay * 
  (feedingDays * 4) // weeks per month

// Validate against program total budget
const totalAllocated = enrollments.reduce(
  (sum, e) => sum + (e.monthlyBudgetAllocation * programDurationMonths), 
  0
)

if (totalAllocated > program.totalBudget) {
  throw new Error("Budget exceeded")
}
```

---

#### **Issue 3: Target Group Validation**

**Scenario:**
```
Program: allowedTargetGroups = [SCHOOL_CHILDREN, TODDLER]

Enrollment attempt:
├─ targetGroup: PREGNANT_WOMAN ❌ Should be rejected!
└─ targetGroup: SCHOOL_CHILDREN ✅ Allowed
```

**Current Validation:** Not enforced at database level

**Recommendation:**
```typescript
// API validation in enrollment creation
async function createEnrollment(data: EnrollmentInput) {
  const program = await prisma.nutritionProgram.findUnique({
    where: { id: data.programId }
  })
  
  if (!program.allowedTargetGroups.includes(data.targetGroup)) {
    throw new Error(
      `Target group ${data.targetGroup} not allowed in this program. ` +
      `Allowed: ${program.allowedTargetGroups.join(', ')}`
    )
  }
  
  // Continue with enrollment creation...
}
```

---

#### **Issue 4: Duplicate Enrollments**

**Problem:**
```
Posyandu A → Program X → TODDLER (Enrollment 1)
Posyandu A → Program X → TODDLER (Enrollment 2) ❌ Duplicate!
```

**Should be prevented:** 1 organization can only have 1 enrollment per program per target group

**Current Validation:** No unique constraint

**Recommendation:**
```prisma
model ProgramBeneficiaryEnrollment {
  // ... existing fields
  
  @@unique([beneficiaryOrgId, programId, targetGroup])
  // Ensures no duplicate enrollments
}
```

---

#### **Issue 5: Distribution Flow**

**Current Relations:**
```prisma
// Option 1: Distribution → Program
FoodDistribution
├─ programId (exists)
└─ distributions per program

// Option 2: Distribution → Enrollment (NEW - Phase 3)
ProgramBeneficiaryEnrollment
└─ distributions FoodDistribution[]

// Option 3: Distribution → Organization (NEW - Phase 3)
BeneficiaryOrganization
└─ distributions FoodDistribution[]
```

**Question:** Which relation is correct?

**Analysis:**
- Distribution should be per **enrollment** (program + organization + target group)
- Example: Distribute meals for "Program X → Posyandu A → TODDLER"
- NOT just "Program X" (too broad)
- NOT just "Posyandu A" (doesn't specify which program/target)

**Recommendation:**
```prisma
model FoodDistribution {
  // ✅ CORRECT: Link to enrollment (most specific)
  enrollmentId String
  enrollment   ProgramBeneficiaryEnrollment @relation(fields: [enrollmentId], references: [id])
  
  // ❌ REMOVE: programId (too broad)
  // ❌ REMOVE: direct beneficiaryOrgId relation (use via enrollment)
}
```

---

#### **Issue 6: TargetGroupSpecificData Validation**

**Problem:**
```json
// PREGNANT_WOMAN enrollment
targetGroupSpecificData: {
  "elementaryStudents": 200  // ❌ Wrong data for pregnant women!
}
```

**Current:** No validation for JSON field structure

**Recommendation:**
```typescript
// Define Zod schemas per target group
const pregnantWomanDataSchema = z.object({
  firstTrimester: z.number().int().min(0),
  secondTrimester: z.number().int().min(0),
  thirdTrimester: z.number().int().min(0),
  highRiskCount: z.number().int().min(0).optional(),
  averageAge: z.number().int().min(15).max(50).optional(),
})

const schoolChildrenDataSchema = z.object({
  elementaryStudents: z.number().int().min(0).optional(),
  juniorHighStudents: z.number().int().min(0).optional(),
  seniorHighStudents: z.number().int().min(0).optional(),
  specialNeedsStudents: z.number().int().min(0).optional(),
})

// Validate based on targetGroup
function validateTargetGroupData(
  targetGroup: TargetGroup, 
  data: any
) {
  switch (targetGroup) {
    case 'PREGNANT_WOMAN':
      return pregnantWomanDataSchema.parse(data)
    case 'SCHOOL_CHILDREN':
      return schoolChildrenDataSchema.parse(data)
    // ... other cases
  }
}
```

---

## 📊 Data Consistency Rules

### **Rule 1: Budget Consistency**
```typescript
// Program level
program.totalBudget >= sum(enrollments.monthlyBudgetAllocation * programDurationMonths)

// Enrollment level
enrollment.monthlyBudgetAllocation = 
  program.budgetPerMeal * 
  enrollment.targetBeneficiaries * 
  enrollment.mealsPerDay * 
  (enrollment.feedingDays * 4)
```

### **Rule 2: Beneficiary Count Consistency**
```typescript
// Sum of age breakdowns should equal total
enrollment.targetBeneficiaries = 
  (enrollment.beneficiaries0to2Years || 0) +
  (enrollment.beneficiaries2to5Years || 0) +
  (enrollment.beneficiaries6to12Years || 0) +
  (enrollment.beneficiaries13to15Years || 0) +
  (enrollment.beneficiaries16to18Years || 0) +
  (enrollment.beneficiariesAbove18 || 0)

// Gender breakdown should equal total
enrollment.targetBeneficiaries =
  (enrollment.maleBeneficiaries || 0) +
  (enrollment.femaleBeneficiaries || 0)
```

### **Rule 3: Target Group Validation**
```typescript
// Enrollment targetGroup must be in program allowedTargetGroups
enrollment.targetGroup IN program.allowedTargetGroups
```

### **Rule 4: Date Consistency**
```typescript
// Enrollment period must be within program period
enrollment.startDate >= program.startDate
enrollment.endDate <= program.endDate (if both exist)
```

### **Rule 5: Unique Enrollment**
```typescript
// One organization can only have one enrollment per program per target group
UNIQUE(beneficiaryOrgId, programId, targetGroup)
```

---

## 🎯 Recommendations

### **Priority 1: Add Database Constraints** ⚡ URGENT

```prisma
model ProgramBeneficiaryEnrollment {
  // ... existing fields
  
  @@unique([beneficiaryOrgId, programId, targetGroup])
  // Prevents duplicate enrollments
}
```

### **Priority 2: Implement Validation Layer** 🛡️

Create `/src/lib/enrollment-validators.ts`:

```typescript
export async function validateEnrollment(data: EnrollmentInput) {
  // 1. Check target group allowed in program
  const program = await prisma.nutritionProgram.findUnique({
    where: { id: data.programId }
  })
  
  if (!program.allowedTargetGroups.includes(data.targetGroup)) {
    throw new ValidationError('Target group not allowed in program')
  }
  
  // 2. Validate date ranges
  if (data.startDate < program.startDate) {
    throw new ValidationError('Enrollment start date before program start')
  }
  
  // 3. Validate beneficiary counts
  const totalFromBreakdown = 
    (data.beneficiaries0to2Years || 0) +
    (data.beneficiaries2to5Years || 0) +
    // ... other age groups
  
  if (totalFromBreakdown !== data.targetBeneficiaries) {
    throw new ValidationError('Beneficiary count mismatch')
  }
  
  // 4. Validate budget allocation
  const calculatedBudget = 
    program.budgetPerMeal *
    data.targetBeneficiaries *
    data.mealsPerDay *
    (data.feedingDays * 4)
  
  if (Math.abs(calculatedBudget - data.monthlyBudgetAllocation) > 1000) {
    throw new ValidationError('Budget allocation mismatch')
  }
  
  // 5. Validate target-specific data
  if (data.targetGroupSpecificData) {
    validateTargetGroupData(data.targetGroup, data.targetGroupSpecificData)
  }
  
  return true
}
```

### **Priority 3: Improve UI/UX for Multi-Target Enrollment** 🎨

Create wizard-style enrollment form:

```typescript
// Step 1: Select Program & Organization
<ProgramSelector />
<OrganizationSelector />

// Step 2: Select Target Groups (multi-select)
<TargetGroupMultiSelect 
  allowedGroups={program.allowedTargetGroups}
  onChange={setSelectedTargetGroups}
/>

// Step 3: Fill Details Per Target Group (tabs)
<Tabs>
  {selectedTargetGroups.map(targetGroup => (
    <TabPanel key={targetGroup}>
      <EnrollmentForm targetGroup={targetGroup} />
    </TabPanel>
  ))}
</Tabs>

// Step 4: Review & Submit
<EnrollmentSummary 
  enrollments={enrollmentsToCreate}
  onSubmit={createMultipleEnrollments}
/>
```

### **Priority 4: Fix Distribution Relations** 🚚

Update schema:

```prisma
model FoodDistribution {
  // PRIMARY: Link to enrollment (most specific)
  enrollmentId String
  enrollment   ProgramBeneficiaryEnrollment @relation(fields: [enrollmentId], references: [id])
  
  // DERIVED: These can be accessed via enrollment
  // beneficiaryOrg = enrollment.beneficiaryOrg
  // program = enrollment.program
  // targetGroup = enrollment.targetGroup
  
  // Remove direct programId and beneficiaryOrgId relations
}
```

### **Priority 5: Create Helper Functions** 🔧

Create `/src/lib/enrollment-helpers.ts`:

```typescript
/**
 * Calculate monthly budget allocation for enrollment
 */
export function calculateMonthlyBudget(params: {
  budgetPerMeal: number
  targetBeneficiaries: number
  mealsPerDay: number
  feedingDays: number
}): number {
  return params.budgetPerMeal * 
         params.targetBeneficiaries * 
         params.mealsPerDay * 
         (params.feedingDays * 4) // 4 weeks per month
}

/**
 * Get program's total allocated budget
 */
export async function getProgramAllocatedBudget(programId: string) {
  const enrollments = await prisma.programBeneficiaryEnrollment.findMany({
    where: { programId }
  })
  
  return enrollments.reduce(
    (sum, e) => sum + (e.monthlyBudgetAllocation || 0), 
    0
  )
}

/**
 * Check if program budget exceeded
 */
export async function isProgramBudgetExceeded(programId: string) {
  const program = await prisma.nutritionProgram.findUnique({
    where: { id: programId }
  })
  
  const allocated = await getProgramAllocatedBudget(programId)
  const programDurationMonths = calculateProgramDuration(
    program.startDate, 
    program.endDate
  )
  
  return allocated > program.totalBudget
}

/**
 * Get enrollment statistics
 */
export async function getEnrollmentStats(enrollmentId: string) {
  const enrollment = await prisma.programBeneficiaryEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      distributions: true
    }
  })
  
  return {
    totalBeneficiaries: enrollment.targetBeneficiaries,
    activeBeneficiaries: enrollment.activeBeneficiaries,
    mealsServed: enrollment.totalMealsServed,
    attendanceRate: enrollment.averageAttendanceRate,
    distributionCount: enrollment.distributions.length,
    lastDistribution: enrollment.lastDistributionDate,
    budgetUtilization: calculateBudgetUtilization(enrollment)
  }
}
```

---

## 📈 Migration Path

### **Phase 1: Add Constraints** ✅ (Can do immediately)

```bash
npx prisma migrate dev --name add_enrollment_unique_constraint
```

```prisma
// In schema.prisma
model ProgramBeneficiaryEnrollment {
  // ... existing fields
  
  @@unique([beneficiaryOrgId, programId, targetGroup])
}
```

### **Phase 2: Create Validation Layer** ✅

1. Create `/src/lib/enrollment-validators.ts`
2. Create `/src/lib/enrollment-helpers.ts`
3. Add Zod schemas for target-specific data
4. Implement validation in API routes

### **Phase 3: Update Distribution Relations** ⚠️ (Requires migration)

1. Add `enrollmentId` to `FoodDistribution`
2. Migrate existing distributions to link to enrollments
3. Remove `programId` direct relation (use via enrollment)

### **Phase 4: UI/UX Improvements** 🎨

1. Create multi-target enrollment wizard
2. Add budget calculator
3. Add validation feedback
4. Add enrollment statistics dashboard

---

## 🎓 Conclusion

### **Current State: GOOD Foundation** ✅

The architecture is **solid** with:
- ✅ Flexible multi-target support
- ✅ Clean data model
- ✅ Government compliance (budget tracking)
- ✅ Scalable design

### **Areas for Improvement:**

1. **Add database constraints** (unique enrollment)
2. **Implement validation layer** (business rules)
3. **Fix distribution relations** (enrollment-centric)
4. **Improve UX** (multi-target enrollment wizard)
5. **Add helper functions** (budget calculations, stats)

### **Overall Grade: B+** 

Good architecture but needs validation and UX polish for production readiness.

---

**Document Version**: 1.0  
**Last Updated**: 14 November 2025  
**Next Review**: After implementing Priority 1-2 recommendations
