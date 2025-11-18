# 🗺️ School Master Data Migration - Complete Roadmap

**Status:** Ready to Implement  
**Priority:** HIGH  
**Estimated Time:** 5-7 days  
**Developer:** Bagizi-ID Team  
**Date:** November 4, 2025

---

## 📋 Table of Contents
1. [Phase 1: Schema Design & Validation](#phase-1)
2. [Phase 2: Database Migration](#phase-2)
3. [Phase 3: Data Migration Script](#phase-3)
4. [Phase 4: API Layer Updates](#phase-4)
5. [Phase 5: Frontend Updates](#phase-5)
6. [Phase 6: Testing & Validation](#phase-6)
7. [Phase 7: Deployment](#phase-7)

---

## 📊 Overview Timeline

```
Day 1: Phase 1 - Schema Design (4 hours)
Day 2: Phase 2 - Database Migration (4 hours)
Day 3: Phase 3 - Data Migration Script (6 hours)
Day 4: Phase 4 - API Layer Updates (8 hours)
Day 5: Phase 5 - Frontend Updates (8 hours)
Day 6: Phase 6 - Testing (8 hours)
Day 7: Phase 7 - Deployment (4 hours)

Total: ~42 hours (~1 work week)
```

---

<a name="phase-1"></a>
## 🎯 Phase 1: Schema Design & Validation (Day 1 - 4 hours)

### **Task 1.1: Add New Models to Schema** ⏱️ 2 hours

**File:** `prisma/schema.prisma`

**Actions:**
1. Add `School` model (master data)
2. Add `ProgramSchoolEnrollment` model (enrollment data)
3. Add `EnrollmentStatus` enum
4. Keep `SchoolBeneficiary` (deprecated, will be removed later)

**Checklist:**
- [ ] School model with all master data fields
- [ ] ProgramSchoolEnrollment with program-specific fields
- [ ] EnrollmentStatus enum (PENDING, ACTIVE, SUSPENDED, etc.)
- [ ] Proper indexes for performance
- [ ] Proper relations with SPPG, Program, Province, etc.
- [ ] Unique constraints for data integrity

### **Task 1.2: Schema Validation** ⏱️ 1 hour

**Actions:**
```bash
# 1. Format schema
npx prisma format

# 2. Validate schema
npx prisma validate

# 3. Check for conflicts
npx prisma migrate status
```

**Checklist:**
- [ ] No syntax errors
- [ ] No circular dependencies
- [ ] All relations properly defined
- [ ] Indexes optimized

### **Task 1.3: Generate Migration** ⏱️ 1 hour

**Actions:**
```bash
# Generate migration (don't apply yet)
npx prisma migrate dev --name add_school_master_data --create-only

# Review generated SQL
cat prisma/migrations/[timestamp]_add_school_master_data/migration.sql
```

**Checklist:**
- [ ] Migration file created
- [ ] SQL reviewed and validated
- [ ] No DROP statements for existing tables
- [ ] Backup plan ready

---

<a name="phase-2"></a>
## 🗄️ Phase 2: Database Migration (Day 2 - 4 hours)

### **Task 2.1: Backup Production Database** ⏱️ 1 hour

**Actions:**
```bash
# 1. Create backup
pg_dump $DATABASE_URL > backup_before_school_migration_$(date +%Y%m%d_%H%M%S).sql

# 2. Verify backup
ls -lh backup_*.sql

# 3. Test restore on local
createdb bagizi_test
psql bagizi_test < backup_*.sql
```

**Checklist:**
- [ ] Backup file created
- [ ] Backup size verified (should be reasonable)
- [ ] Test restore successful
- [ ] Backup uploaded to secure storage

### **Task 2.2: Apply Migration to Development** ⏱️ 1 hour

**Actions:**
```bash
# 1. Apply migration
npx prisma migrate dev

# 2. Verify tables created
npx prisma studio
# Check: schools, program_school_enrollments tables exist

# 3. Generate Prisma client
npx prisma generate
```

**Checklist:**
- [ ] Migration applied successfully
- [ ] New tables exist in database
- [ ] Prisma client updated
- [ ] TypeScript types generated

### **Task 2.3: Verify Schema Integrity** ⏱️ 2 hours

**Actions:**
```bash
# 1. Check indexes
psql $DATABASE_URL -c "\d schools"
psql $DATABASE_URL -c "\d program_school_enrollments"

# 2. Check relations
psql $DATABASE_URL -c "SELECT * FROM pg_constraint WHERE conrelid = 'schools'::regclass;"

# 3. Test queries
npx tsx prisma/test-queries.ts
```

**Checklist:**
- [ ] All indexes created
- [ ] Foreign keys working
- [ ] Unique constraints enforced
- [ ] Sample queries working

---

<a name="phase-3"></a>
## 🔄 Phase 3: Data Migration Script (Day 3 - 6 hours)

### **Task 3.1: Create Migration Script** ⏱️ 3 hours

**File:** `prisma/migrations/migrate-school-data.ts`

**Actions:**
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateSchoolData() {
  console.log('🚀 Starting school data migration...')
  
  // Get all SchoolBeneficiary records
  const beneficiaries = await prisma.schoolBeneficiary.findMany({
    include: {
      sppg: true,
      program: true
    }
  })
  
  console.log(`📊 Found ${beneficiaries.length} school beneficiaries to migrate`)
  
  let schoolsCreated = 0
  let enrollmentsCreated = 0
  let schoolsSkipped = 0
  
  for (const beneficiary of beneficiaries) {
    try {
      // 1. Check if school already exists (by NPSN or schoolCode)
      let school = await prisma.school.findFirst({
        where: {
          OR: [
            { npsn: beneficiary.npsn },
            { 
              sppgId_schoolCode: {
                sppgId: beneficiary.sppgId,
                schoolCode: beneficiary.schoolCode || `MIGRATED-${beneficiary.id}`
              }
            }
          ]
        }
      })
      
      // 2. Create school if not exists
      if (!school) {
        school = await prisma.school.create({
          data: {
            sppgId: beneficiary.sppgId,
            schoolName: beneficiary.schoolName,
            schoolCode: beneficiary.schoolCode || `MIGRATED-${beneficiary.id}`,
            npsn: beneficiary.npsn,
            schoolType: beneficiary.schoolType,
            schoolStatus: beneficiary.schoolStatus,
            accreditationGrade: beneficiary.accreditationGrade,
            accreditationYear: beneficiary.accreditationYear,
            
            // Leadership
            principalName: beneficiary.principalName,
            principalNip: beneficiary.principalNip,
            
            // Contact
            contactPhone: beneficiary.contactPhone,
            contactEmail: beneficiary.contactEmail,
            alternatePhone: beneficiary.alternatePhone,
            whatsappNumber: beneficiary.whatsappNumber,
            
            // Location
            schoolAddress: beneficiary.schoolAddress,
            provinceId: beneficiary.provinceId,
            regencyId: beneficiary.regencyId,
            districtId: beneficiary.districtId,
            villageId: beneficiary.villageId,
            coordinates: beneficiary.coordinates,
            postalCode: beneficiary.postalCode,
            
            // Infrastructure
            hasKitchen: beneficiary.hasKitchen,
            hasStorage: beneficiary.hasStorage,
            hasRefrigerator: beneficiary.hasRefrigerator,
            hasCleanWater: beneficiary.hasCleanWater,
            hasElectricity: beneficiary.hasElectricity,
            hasHandwashing: beneficiary.hasHandwashing,
            hasDiningArea: beneficiary.hasDiningArea,
            diningCapacity: beneficiary.diningCapacity,
            
            // Logistics
            accessRoadCondition: beneficiary.accessRoadCondition,
            distanceFromSppg: beneficiary.distanceFromSppg,
            
            // Integration
            dapodikId: beneficiary.dapodikId,
            
            // Status
            isActive: beneficiary.isActive,
            registrationDate: beneficiary.enrollmentDate,
            
            // Audit
            createdAt: beneficiary.createdAt,
            updatedAt: beneficiary.updatedAt
          }
        })
        
        schoolsCreated++
        console.log(`✅ Created school: ${school.schoolName} (${school.schoolCode})`)
      } else {
        schoolsSkipped++
        console.log(`⏭️  School already exists: ${school.schoolName} (${school.schoolCode})`)
      }
      
      // 3. Create enrollment
      const enrollment = await prisma.programSchoolEnrollment.create({
        data: {
          schoolId: school.id,
          programId: beneficiary.programId,
          sppgId: beneficiary.sppgId,
          
          // Enrollment period
          enrollmentDate: beneficiary.enrollmentDate,
          startDate: beneficiary.enrollmentDate,
          
          // Configuration
          targetStudents: beneficiary.targetStudents,
          activeStudents: beneficiary.activeStudents,
          students4to6Years: beneficiary.students4to6Years,
          students7to12Years: beneficiary.students7to12Years,
          students13to15Years: beneficiary.students13to15Years,
          students16to18Years: beneficiary.students16to18Years,
          maleStudents: beneficiary.maleStudents,
          femaleStudents: beneficiary.femaleStudents,
          feedingDays: beneficiary.feedingDays,
          mealsPerDay: beneficiary.mealsPerDay,
          feedingTime: beneficiary.feedingTime,
          breakfastTime: beneficiary.breakfastTime,
          lunchTime: beneficiary.lunchTime,
          snackTime: beneficiary.snackTime,
          
          // Delivery
          deliveryAddress: beneficiary.deliveryAddress,
          deliveryContact: beneficiary.deliveryContact,
          deliveryPhone: beneficiary.deliveryPhone,
          deliveryInstructions: beneficiary.deliveryInstructions,
          preferredDeliveryTime: beneficiary.preferredDeliveryTime,
          estimatedTravelTime: beneficiary.estimatedTravelTime,
          
          // Service
          storageCapacity: beneficiary.storageCapacity,
          servingMethod: beneficiary.servingMethod,
          
          // Budget
          monthlyBudgetAllocation: beneficiary.monthlyBudgetAllocation,
          budgetPerStudent: beneficiary.budgetPerStudent,
          contractStartDate: beneficiary.contractStartDate,
          contractEndDate: beneficiary.contractEndDate,
          contractValue: beneficiary.contractValue,
          contractNumber: beneficiary.contractNumber,
          
          // Performance
          attendanceRate: beneficiary.attendanceRate,
          participationRate: beneficiary.participationRate,
          satisfactionScore: beneficiary.satisfactionScore,
          lastDistributionDate: beneficiary.lastDistributionDate,
          lastReportDate: beneficiary.lastReportDate,
          totalDistributions: beneficiary.totalDistributions,
          totalMealsServed: beneficiary.totalMealsServed,
          
          // Status
          status: beneficiary.isActive ? 'ACTIVE' : 'SUSPENDED',
          isActive: beneficiary.isActive,
          suspendedAt: beneficiary.suspendedAt,
          suspensionReason: beneficiary.suspensionReason,
          
          // Special requirements
          specialDietary: beneficiary.specialDietary,
          allergyAlerts: beneficiary.allergyAlerts,
          culturalReqs: beneficiary.culturalReqs,
          religiousReqs: beneficiary.religiousReqs,
          
          // Integration
          externalSystemId: beneficiary.externalSystemId,
          syncedAt: beneficiary.syncedAt,
          
          // Notes
          notes: beneficiary.notes,
          specialInstructions: beneficiary.specialInstructions,
          
          // Audit
          createdAt: beneficiary.createdAt,
          updatedAt: beneficiary.updatedAt
        }
      })
      
      enrollmentsCreated++
      console.log(`✅ Created enrollment: ${school.schoolName} → ${beneficiary.program.name}`)
      
    } catch (error) {
      console.error(`❌ Error migrating beneficiary ${beneficiary.id}:`, error)
      // Continue with next record
    }
  }
  
  console.log('\n📊 Migration Summary:')
  console.log(`  Schools created: ${schoolsCreated}`)
  console.log(`  Schools skipped (already exist): ${schoolsSkipped}`)
  console.log(`  Enrollments created: ${enrollmentsCreated}`)
  console.log(`  Total beneficiaries processed: ${beneficiaries.length}`)
  console.log('\n✅ Migration completed!')
}

// Run migration
migrateSchoolData()
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Checklist:**
- [ ] Script handles duplicates (NPSN/schoolCode)
- [ ] Error handling for each record
- [ ] Logging for audit trail
- [ ] Dry-run mode available
- [ ] Rollback plan documented

### **Task 3.2: Test Migration on Dev Database** ⏱️ 2 hours

**Actions:**
```bash
# 1. Backup dev database
pg_dump $DEV_DATABASE_URL > dev_backup.sql

# 2. Run migration script (dry-run first)
DRY_RUN=true npx tsx prisma/migrations/migrate-school-data.ts

# 3. Review dry-run results
cat migration-dry-run-report.json

# 4. Run actual migration
npx tsx prisma/migrations/migrate-school-data.ts

# 5. Verify data
npx prisma studio
# Check: Schools and enrollments created correctly
```

**Checklist:**
- [ ] Dry-run successful
- [ ] No errors in dry-run
- [ ] Actual migration successful
- [ ] Data count matches (beneficiaries = enrollments)
- [ ] No duplicate schools created
- [ ] Relations intact

### **Task 3.3: Validate Migrated Data** ⏱️ 1 hour

**Actions:**
```typescript
// prisma/validate-migration.ts
async function validateMigration() {
  // 1. Count records
  const beneficiaryCount = await prisma.schoolBeneficiary.count()
  const schoolCount = await prisma.school.count()
  const enrollmentCount = await prisma.programSchoolEnrollment.count()
  
  console.log('Record counts:')
  console.log(`  SchoolBeneficiary: ${beneficiaryCount}`)
  console.log(`  School: ${schoolCount}`)
  console.log(`  ProgramSchoolEnrollment: ${enrollmentCount}`)
  
  // Validation: enrollments should equal beneficiaries
  if (enrollmentCount !== beneficiaryCount) {
    console.error('❌ Enrollment count mismatch!')
  }
  
  // 2. Check for orphaned enrollments
  const orphanedEnrollments = await prisma.programSchoolEnrollment.findMany({
    where: {
      school: null
    }
  })
  
  if (orphanedEnrollments.length > 0) {
    console.error(`❌ Found ${orphanedEnrollments.length} orphaned enrollments!`)
  }
  
  // 3. Compare sample data
  const sampleBeneficiary = await prisma.schoolBeneficiary.findFirst()
  const sampleEnrollment = await prisma.programSchoolEnrollment.findFirst({
    where: { programId: sampleBeneficiary.programId },
    include: { school: true }
  })
  
  console.log('\nSample data comparison:')
  console.log('Beneficiary:', sampleBeneficiary.schoolName)
  console.log('Enrollment School:', sampleEnrollment.school.schoolName)
  console.log('Match:', sampleBeneficiary.schoolName === sampleEnrollment.school.schoolName)
}
```

**Checklist:**
- [ ] Record counts match
- [ ] No orphaned records
- [ ] Sample data matches
- [ ] All relations valid

---

<a name="phase-4"></a>
## 🔌 Phase 4: API Layer Updates (Day 4 - 8 hours)

### **Task 4.1: Create School API Endpoints** ⏱️ 3 hours

**Files to create:**
```
src/app/api/sppg/schools/
├── route.ts                    # GET /api/sppg/schools, POST /api/sppg/schools
├── [id]/
│   └── route.ts               # GET, PUT, DELETE /api/sppg/schools/[id]
└── stats/
    └── route.ts               # GET /api/sppg/schools/stats
```

**Example:** `src/app/api/sppg/schools/route.ts`
```typescript
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { db } from '@/lib/db'
import { schoolSchema } from '@/features/sppg/school/schemas'

// GET /api/sppg/schools - List all schools
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    const sppg = await checkSppgAccess(session.user.sppgId)
    if (!sppg) {
      return Response.json({ error: 'SPPG not found' }, { status: 404 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const schoolType = searchParams.get('schoolType')

    // Build where clause
    const where: any = {
      sppgId: session.user.sppgId
    }

    if (isActive) {
      where.isActive = isActive === 'true'
    }

    if (schoolType && schoolType !== 'ALL') {
      where.schoolType = schoolType
    }

    if (search) {
      where.OR = [
        { schoolName: { contains: search, mode: 'insensitive' } },
        { schoolCode: { contains: search, mode: 'insensitive' } },
        { npsn: { contains: search, mode: 'insensitive' } }
      ]
    }

    const schools = await db.school.findMany({
      where,
      include: {
        province: { select: { name: true } },
        regency: { select: { name: true } },
        district: { select: { name: true } },
        village: { select: { name: true } },
        _count: {
          select: {
            programEnrollments: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { schoolName: 'asc' }
    })

    return Response.json({ success: true, data: schools })
  } catch (error) {
    console.error('GET /api/sppg/schools error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/sppg/schools - Create new school
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }

    const body = await request.json()
    const validated = schoolSchema.safeParse(body)

    if (!validated.success) {
      return Response.json({
        error: 'Validation failed',
        details: validated.error.errors
      }, { status: 400 })
    }

    const school = await db.school.create({
      data: {
        ...validated.data,
        sppgId: session.user.sppgId
      },
      include: {
        province: true,
        regency: true,
        district: true,
        village: true
      }
    })

    return Response.json({ success: true, data: school }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sppg/schools error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Checklist:**
- [ ] GET /api/sppg/schools (list + filters)
- [ ] POST /api/sppg/schools (create)
- [ ] GET /api/sppg/schools/[id] (detail)
- [ ] PUT /api/sppg/schools/[id] (update)
- [ ] DELETE /api/sppg/schools/[id] (soft delete)
- [ ] GET /api/sppg/schools/stats (statistics)

### **Task 4.2: Create Enrollment API Endpoints** ⏱️ 3 hours

**Files to create:**
```
src/app/api/sppg/program-enrollments/
├── route.ts                    # GET, POST /api/sppg/program-enrollments
├── [id]/
│   └── route.ts               # GET, PUT, DELETE /api/sppg/program-enrollments/[id]
├── by-program/
│   └── [programId]/
│       └── route.ts           # GET /api/sppg/program-enrollments/by-program/[programId]
└── available-schools/
    └── [programId]/
        └── route.ts           # GET schools not yet enrolled in program
```

**Checklist:**
- [ ] List enrollments (with filters)
- [ ] Create enrollment (enroll school to program)
- [ ] Update enrollment config
- [ ] Suspend/reactivate enrollment
- [ ] Get enrollments by program
- [ ] Get available schools for enrollment

### **Task 4.3: Update Existing APIs** ⏱️ 2 hours

**Files to update:**
```
src/app/api/sppg/program/
├── [id]/
│   └── schools/
│       └── route.ts           # Update to use ProgramSchoolEnrollment
```

**Actions:**
```typescript
// Before: Uses SchoolBeneficiary
const schools = await db.schoolBeneficiary.findMany({
  where: { programId }
})

// After: Uses ProgramSchoolEnrollment with School
const enrollments = await db.programSchoolEnrollment.findMany({
  where: { 
    programId,
    isActive: true
  },
  include: {
    school: {
      include: {
        province: true,
        regency: true,
        village: true
      }
    }
  }
})

// Transform for backward compatibility
const schools = enrollments.map(enrollment => ({
  ...enrollment.school,
  // Enrollment-specific data
  enrollmentId: enrollment.id,
  targetStudents: enrollment.targetStudents,
  activeStudents: enrollment.activeStudents,
  feedingDays: enrollment.feedingDays,
  // ... other enrollment fields
}))
```

**Checklist:**
- [ ] Program detail includes enrollments
- [ ] Distribution APIs use enrollments
- [ ] Report APIs use enrollments
- [ ] All school-related queries updated

---

<a name="phase-5"></a>
## 🎨 Phase 5: Frontend Updates (Day 5 - 8 hours)

### **Task 5.1: Create School Management Pages** ⏱️ 4 hours

**Files to create:**
```
src/app/(sppg)/schools/
├── page.tsx                    # School list
├── new/
│   └── page.tsx               # Create school
└── [id]/
    ├── page.tsx               # School detail
    └── edit/
        └── page.tsx           # Edit school
```

**Features:**
- [ ] School list with search/filter
- [ ] School creation form
- [ ] School detail view
- [ ] School edit form
- [ ] View enrollment history

### **Task 5.2: Create Enrollment Management** ⏱️ 3 hours

**Updates to Program Pages:**
```
src/app/(sppg)/program/[id]/
├── enrollments/
│   └── page.tsx               # List enrollments
└── enroll-school/
    └── page.tsx               # Enroll school wizard
```

**Features:**
- [ ] View enrolled schools per program
- [ ] Enroll existing school (dropdown select)
- [ ] Enroll new school (create + enroll flow)
- [ ] Configure enrollment settings
- [ ] Update enrollment status

### **Task 5.3: Update Existing Components** ⏱️ 1 hour

**Files to update:**
```
src/features/sppg/program/components/
├── ProgramDetail.tsx          # Show enrollments instead of beneficiaries
└── SchoolList.tsx             # Use new School + Enrollment models
```

**Checklist:**
- [ ] Replace SchoolBeneficiary references
- [ ] Use new enrollment endpoints
- [ ] Update TypeScript types
- [ ] Test all interactions

---

<a name="phase-6"></a>
## 🧪 Phase 6: Testing & Validation (Day 6 - 8 hours)

### **Task 6.1: Unit Tests** ⏱️ 2 hours

**Files to create:**
```
src/features/sppg/school/__tests__/
├── schoolApi.test.ts
├── enrollmentApi.test.ts
└── schoolUtils.test.ts
```

**Test Coverage:**
- [ ] School CRUD operations
- [ ] Enrollment CRUD operations
- [ ] Duplicate detection
- [ ] Validation rules
- [ ] Multi-tenancy isolation

### **Task 6.2: Integration Tests** ⏱️ 3 hours

**Scenarios to test:**
```typescript
// Test 1: Create school and enroll in program
test('should create school and enroll in program', async () => {
  // 1. Create school
  const school = await createSchool({ ... })
  
  // 2. Enroll in program
  const enrollment = await enrollSchool(school.id, programId)
  
  // 3. Verify enrollment exists
  expect(enrollment.schoolId).toBe(school.id)
  expect(enrollment.programId).toBe(programId)
})

// Test 2: Re-enroll same school in different program
test('should allow same school in multiple programs', async () => {
  const school = await createSchool({ ... })
  
  const enrollment1 = await enrollSchool(school.id, program1.id)
  const enrollment2 = await enrollSchool(school.id, program2.id)
  
  expect(enrollment1.schoolId).toBe(enrollment2.schoolId)
  expect(enrollment1.programId).not.toBe(enrollment2.programId)
})

// Test 3: Update school reflects in all enrollments
test('should update school data across enrollments', async () => {
  const school = await createSchool({ contactPhone: '081234567890' })
  await enrollSchool(school.id, program1.id)
  await enrollSchool(school.id, program2.id)
  
  // Update school
  await updateSchool(school.id, { contactPhone: '089876543210' })
  
  // Verify all enrollments see updated data
  const enrollment1 = await getEnrollment(program1.id, school.id)
  const enrollment2 = await getEnrollment(program2.id, school.id)
  
  expect(enrollment1.school.contactPhone).toBe('089876543210')
  expect(enrollment2.school.contactPhone).toBe('089876543210')
})
```

**Checklist:**
- [ ] All CRUD operations working
- [ ] Multi-program enrollment working
- [ ] Data consistency maintained
- [ ] Edge cases handled

### **Task 6.3: End-to-End Tests** ⏱️ 2 hours

**Playwright tests:**
```typescript
// tests/e2e/school-enrollment.spec.ts
test('complete school enrollment flow', async ({ page }) => {
  await page.goto('/schools')
  
  // Create new school
  await page.click('text=Tambah Sekolah')
  await page.fill('[name=schoolName]', 'SD Negeri 1 Test')
  await page.fill('[name=npsn]', '12345678')
  // ... fill all fields
  await page.click('text=Simpan')
  
  // Verify school created
  await expect(page.locator('text=SD Negeri 1 Test')).toBeVisible()
  
  // Enroll in program
  await page.goto('/program/[id]/enroll-school')
  await page.selectOption('[name=schoolId]', 'SD Negeri 1 Test')
  await page.fill('[name=targetStudents]', '150')
  await page.click('text=Daftarkan')
  
  // Verify enrollment
  await expect(page.locator('text=SD Negeri 1 Test')).toBeVisible()
})
```

**Checklist:**
- [ ] School creation flow
- [ ] School enrollment flow
- [ ] Re-enrollment flow
- [ ] Update school flow
- [ ] View enrollment history

### **Task 6.4: Performance Testing** ⏱️ 1 hour

**Load tests:**
```bash
# Test query performance
k6 run tests/performance/school-list.js

# Test with 1000 schools
# Test with 5000 enrollments
# Verify response times < 500ms
```

**Checklist:**
- [ ] List queries < 500ms
- [ ] Detail queries < 200ms
- [ ] Create operations < 1s
- [ ] No N+1 query issues

---

<a name="phase-7"></a>
## 🚀 Phase 7: Deployment (Day 7 - 4 hours)

### **Task 7.1: Pre-Deployment Checks** ⏱️ 1 hour

**Checklist:**
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Migration script tested
- [ ] Rollback plan documented
- [ ] Backup created
- [ ] Team notified

### **Task 7.2: Deploy to Staging** ⏱️ 1 hour

**Actions:**
```bash
# 1. Deploy code
git push staging main

# 2. Run migration
npx prisma migrate deploy

# 3. Run data migration
npx tsx prisma/migrations/migrate-school-data.ts

# 4. Verify
curl https://staging.bagizi.id/api/sppg/schools
```

**Checklist:**
- [ ] Code deployed
- [ ] Migration applied
- [ ] Data migrated
- [ ] APIs responding
- [ ] Frontend working

### **Task 7.3: Staging Validation** ⏱️ 1 hour

**Manual testing:**
- [ ] Create school
- [ ] Enroll in program
- [ ] Update school
- [ ] Re-enroll in another program
- [ ] View history
- [ ] Generate reports

### **Task 7.4: Deploy to Production** ⏱️ 1 hour

**Actions:**
```bash
# 1. Final backup
pg_dump $PROD_DATABASE_URL > prod_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Deploy code
git push production main

# 3. Run migration
npx prisma migrate deploy

# 4. Run data migration
npx tsx prisma/migrations/migrate-school-data.ts

# 5. Monitor
# Watch logs for errors
# Check API response times
# Verify user workflows
```

**Checklist:**
- [ ] Backup created
- [ ] Code deployed
- [ ] Migration applied
- [ ] Data migrated
- [ ] No errors in logs
- [ ] Users notified
- [ ] Documentation updated

---

## ✅ Success Criteria

### **Technical Criteria:**
- [ ] All new models created
- [ ] All data migrated successfully
- [ ] All API endpoints working
- [ ] All frontend pages functional
- [ ] All tests passing (unit, integration, e2e)
- [ ] Performance benchmarks met
- [ ] Zero data loss
- [ ] Zero downtime

### **Business Criteria:**
- [ ] Users can create schools once
- [ ] Users can enroll schools in multiple programs
- [ ] Re-enrollment takes < 1 minute
- [ ] School updates reflect immediately
- [ ] Historical data preserved
- [ ] Reports show correct data

---

## 📊 Rollback Plan

### **If Migration Fails:**

```bash
# 1. Stop application
pm2 stop bagizi-id

# 2. Restore database
psql $DATABASE_URL < backup_before_school_migration_[timestamp].sql

# 3. Revert migration
npx prisma migrate resolve --rolled-back [migration-name]

# 4. Deploy previous version
git revert [commit-hash]
git push production main

# 5. Restart application
pm2 start bagizi-id
```

---

## 📝 Post-Deployment Tasks

### **Week 1 After Deployment:**
- [ ] Monitor error logs daily
- [ ] Track user feedback
- [ ] Measure re-enrollment time savings
- [ ] Verify data consistency
- [ ] Update documentation

### **Month 1 After Deployment:**
- [ ] Deprecate SchoolBeneficiary model
- [ ] Remove old code references
- [ ] Optimize queries based on usage
- [ ] Gather user satisfaction metrics

---

## 📚 Documentation Updates

**Files to update:**
- [ ] `/docs/API_DOCUMENTATION.md` - New endpoints
- [ ] `/docs/DATABASE_SCHEMA.md` - New models
- [ ] `/docs/USER_GUIDE.md` - New workflows
- [ ] `/README.md` - Architecture changes

---

## 🎯 Key Performance Indicators (KPIs)

### **Before Migration:**
- School re-enrollment time: ~10 minutes
- Data entry errors: ~25%
- User satisfaction: 6/10

### **After Migration (Target):**
- School re-enrollment time: ~30 seconds (95% reduction)
- Data entry errors: <5% (80% reduction)
- User satisfaction: 9/10 (50% improvement)

---

## 🚀 Ready to Start?

**Next Steps:**
1. Review this roadmap with team
2. Assign tasks to developers
3. Set up daily standup meetings
4. Start with Phase 1 (Schema Design)
5. Track progress daily

**Let's build something amazing! 🎉**
