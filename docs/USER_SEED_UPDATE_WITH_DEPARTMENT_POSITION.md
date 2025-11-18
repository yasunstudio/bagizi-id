# User Seed Update - Department & Position Relations ✅

**Date**: October 27, 2025  
**Status**: ✅ COMPLETE  
**Related**: USER_SCHEMA_MIGRATION_DEPARTMENT_POSITION_RELATIONS_COMPLETE.md

---

## 📋 Summary

Updated `prisma/seeds/user-seed.ts` to link demo users with appropriate departments and positions from HRD seed data. This ensures demo accounts have realistic organizational structure.

---

## 🔧 Changes Made

### 1. Added Department & Position Lookup

**File**: `prisma/seeds/user-seed.ts`

```typescript
export async function seedDemoUsers2025(prisma: PrismaClient, sppgs: SPPG[]): Promise<User[]> {
  // ... existing code ...

  // ✅ ADDED: Fetch departments and positions for linking users
  const departments = await prisma.department.findMany({
    where: { sppgId: demoSppg.id },
  })
  
  const positions = await prisma.position.findMany({
    where: { sppgId: demoSppg.id },
  })

  // ✅ ADDED: Helper functions to get department and position IDs
  const getDept = (code: string) => departments.find(d => d.departmentCode === code)?.id
  const getPos = (code: string) => positions.find(p => p.positionCode === code)?.id
}
```

---

### 2. Updated User Creation with Department & Position Links

#### Management Level Users

```typescript
// Kepala SPPG
{
  email: 'kepala@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('MNGMT'),      // ✅ Manajemen Department
  positionId: getPos('KEPALA-SPPG'),   // ✅ Kepala SPPG Position
}

// Admin SPPG
{
  email: 'admin@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('MNGMT'),      // ✅ Manajemen Department
  positionId: getPos('ADMIN-SPPG'),    // ✅ Admin SPPG Position
}
```

#### Operational Staff

```typescript
// Ahli Gizi
{
  email: 'ahligizi@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('GIZI'),       // ✅ Gizi dan Kesehatan Department
  positionId: getPos('AHLI-GIZI'),     // ✅ Ahli Gizi Position
}

// Akuntan
{
  email: 'akuntan@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('FIN'),        // ✅ Keuangan Department
  positionId: getPos('AKUNTAN'),       // ✅ Akuntan Position
}

// Production Manager
{
  email: 'produksi@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('PROD'),       // ✅ Produksi Department
  positionId: getPos('MGR-PROD'),      // ✅ Manager Produksi Position
}

// Distribution Manager
{
  email: 'distribusi@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('DIST'),       // ✅ Distribusi Department
  positionId: getPos('MGR-DIST'),      // ✅ Manager Distribusi Position
}

// HRD Manager
{
  email: 'hrd@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('MNGMT'),      // ✅ Manajemen Department
  // positionId: null (no specific HRD Manager position in seed)
}
```

#### Staff Level

```typescript
// Kitchen Staff
{
  email: 'dapur@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('PROD'),       // ✅ Produksi Department
  positionId: getPos('KOKI'),          // ✅ Koki Position
}

// Couriers
{
  email: 'kurir@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('DIST'),       // ✅ Distribusi Department
  positionId: getPos('KURIR'),         // ✅ Kurir Position
}

{
  email: 'kurir2@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('DIST'),       // ✅ Distribusi Department
  positionId: getPos('KURIR'),         // ✅ Kurir Position
}

// Admin Staff
{
  email: 'adminstaff@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('MNGMT'),      // ✅ Manajemen Department
  // positionId: null (no specific admin staff position)
}

// Quality Control
{
  email: 'qc@demo.sppg.id',
  // ... other fields ...
  departmentId: getDept('PROD'),       // ✅ Produksi Department
  positionId: getPos('QC'),            // ✅ Quality Control Position
}
```

---

## 📊 User-Department-Position Mapping

| Email | Role | Department | Position |
|-------|------|------------|----------|
| `kepala@demo.sppg.id` | SPPG_KEPALA | Manajemen (MNGMT) | Kepala SPPG |
| `admin@demo.sppg.id` | SPPG_ADMIN | Manajemen (MNGMT) | Admin SPPG |
| `ahligizi@demo.sppg.id` | SPPG_AHLI_GIZI | Gizi dan Kesehatan (GIZI) | Ahli Gizi |
| `akuntan@demo.sppg.id` | SPPG_AKUNTAN | Keuangan (FIN) | Akuntan |
| `produksi@demo.sppg.id` | SPPG_PRODUKSI_MANAGER | Produksi (PROD) | Manager Produksi |
| `distribusi@demo.sppg.id` | SPPG_DISTRIBUSI_MANAGER | Distribusi (DIST) | Manager Distribusi |
| `hrd@demo.sppg.id` | SPPG_HRD_MANAGER | Manajemen (MNGMT) | - |
| `dapur@demo.sppg.id` | SPPG_STAFF_DAPUR | Produksi (PROD) | Koki |
| `kurir@demo.sppg.id` | SPPG_STAFF_DISTRIBUSI | Distribusi (DIST) | Kurir |
| `kurir2@demo.sppg.id` | SPPG_STAFF_DISTRIBUSI | Distribusi (DIST) | Kurir |
| `adminstaff@demo.sppg.id` | SPPG_STAFF_ADMIN | Manajemen (MNGMT) | - |
| `qc@demo.sppg.id` | SPPG_STAFF_QC | Produksi (PROD) | Quality Control |

**Notes:**
- Platform-level users (SUPERADMIN, SUPPORT, ANALYST) have no department/position
- Viewer and Demo users have no department/position
- Some users have department but no specific position (e.g., HRD Manager, Admin Staff)

---

## ✅ Verification

### TypeScript Compilation
```bash
npx tsc --noEmit
# ✅ PASSED - No errors
```

### Seed Execution Order
1. **sppg-seed.ts** - Creates demo SPPG
2. **hrd-seed.ts** - Creates departments and positions
3. **user-seed.ts** - Creates users with department/position links ✅

**Important**: HRD seed must run **before** user seed to ensure departments and positions exist!

---

## 🎯 Benefits

1. **Realistic Demo Data**: Users are properly linked to organizational structure
2. **Complete Testing**: Can test department/position dropdowns with real data
3. **Cascading Dropdowns**: Position filtering works correctly in user forms
4. **Relational Integrity**: Foreign key constraints maintained
5. **Better UX**: User detail pages show actual department/position names

---

## 🚀 Testing Recommendations

### After Running Seed
1. ✅ Login with any demo user
2. ✅ Navigate to User Management → User Detail
3. ✅ Verify department and position display correctly
4. ✅ Edit user → Verify dropdowns populate with correct data
5. ✅ Change department → Verify position dropdown filters correctly
6. ✅ Save changes → Verify relations persist

### Test Cases
- **Management Users**: Should show in Manajemen department
- **Gizi Staff**: Should show in Gizi dan Kesehatan department
- **Production Staff**: Should show in Produksi department with Kitchen/QC positions
- **Distribution Staff**: Should show in Distribusi department with Courier positions
- **Financial Staff**: Should show in Keuangan department with Akuntan position

---

## 📝 Related Files

- `prisma/seeds/user-seed.ts` - Updated with department/position links
- `prisma/seeds/hrd-seed.ts` - Source of departments and positions
- `prisma/seed.ts` - Master seed file (execution order matters!)

---

## ✅ Status: COMPLETE

User seed successfully updated to link demo users with appropriate departments and positions from HRD data. All TypeScript compilation passes. Ready for seeding!

**Next Step**: Run `npm run db:seed` to apply changes to database.
