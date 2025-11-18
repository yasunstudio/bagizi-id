# 🐛 HRD Phase 1 - Bug Fixes Required

**Status**: In Progress  
**Total Errors**: 31  
**Files Affected**: 7

---

## 🔴 Critical Fixes (Must Fix First)

### Fix 1: Use withSppgAuth Wrapper Pattern (6+ errors)
**Files Affected**:
- `src/app/api/sppg/departments/route.ts`
- `src/app/api/sppg/departments/[id]/route.ts`
- `src/app/api/sppg/departments/hierarchy/route.ts`

**Problem**:
```typescript
// ❌ Wrong pattern - manual auth/db imports
import { auth } from '@/lib/auth'  // Wrong path
import { db } from '@/lib/db'      // Wrong path

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return error
  // Manual security checks...
}
```

**Solution**:
```typescript
// ✅ Correct pattern - use withSppgAuth wrapper
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'  // Correct path
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    // Permission check
    if (!hasPermission(session.user.userRole as UserRole, 'HR_MANAGE')) {
      return NextResponse.json({ 
        success: false,
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    // sppgId already available from session
    const sppgId = session.user.sppgId!
    
    // Your logic here with automatic multi-tenant security
  })
}
```

**Benefits**:
- ✅ Automatic authentication check
- ✅ Automatic SPPG access validation
- ✅ Built-in error handling
- ✅ Consistent pattern across all routes
- ✅ Audit logging included

**Action**: Refactor all 3 department API files to use wrapper pattern

---

### Fix 2: Next.js 15 Async Params (1 error)
**File**: `src/app/api/sppg/positions/[id]/route.ts:53`

**Problem**:
```typescript
// ❌ Old Next.js 14 pattern
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
```

**Solution**:
```typescript
// ✅ Next.js 15 pattern with async params
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const { id } = params
```

**Action**: Update all 3 handler functions (GET, PUT, DELETE) in positions/[id]/route.ts

---

## 🟡 Medium Priority Fixes

### Fix 3: Zod Error Property (2 errors)
**Files**: 
- `src/app/api/sppg/departments/route.ts:216`
- `src/app/api/sppg/departments/[id]/route.ts:242`

**Problem**:
```typescript
// ❌ Property 'errors' doesn't exist on ZodError
details: validated.error.errors
```

**Solution**:
```typescript
// ✅ Use 'issues' property (Zod v3 standard)
details: validated.error.issues
```

**Action**: Replace `.errors` with `.issues` in 2 locations

---

### Fix 4: DepartmentForm Schema & Types (16 errors)
**File**: `src/features/sppg/hrd/components/DepartmentForm.tsx`

**Problem 1 - useEmployees filters**:
```typescript
// ❌ Missing required properties
const { data: employeesResult } = useEmployees({
  employmentStatus: 'ACTIVE',
  limit: 1000
})
```

**Solution 1**:
```typescript
// ✅ Include all required properties
const { data: employeesResult } = useEmployees({
  page: 1,
  limit: 1000,
  sortBy: 'fullName',
  sortOrder: 'asc',
  employmentStatus: 'ACTIVE'
})
```

**Problem 2 - Employee data structure**:
```typescript
// ❌ Property doesn't exist
const activeEmployees = employeesResult?.employees || []
```

**Solution 2**:
```typescript
// ✅ Check actual API response structure
const activeEmployees = employeesResult?.data || []
```

**Problem 3 - Schema type mismatch**:
```typescript
// ❌ isActive can be undefined in update schema
resolver: zodResolver(isEditMode ? departmentUpdateSchema : departmentSchema)
```

**Solution 3**:
```typescript
// Option A: Make isActive required in both schemas
export const departmentUpdateSchema = z.object({
  ...departmentSchema.shape,
  isActive: z.boolean().default(true)  // Always boolean
})

// Option B: Handle optional properly in form
resolver: zodResolver(departmentSchema),
defaultValues: {
  isActive: department?.isActive ?? true  // Ensure boolean
}
```

**Problem 4 - Employee map parameter type**:
```typescript
// ❌ Implicit any type
{activeEmployees.map((emp) => (
```

**Solution 4**:
```typescript
// ✅ Explicit type
interface EmployeeOption {
  id: string
  fullName: string
  employeeCode: string
}

{activeEmployees.map((emp: EmployeeOption) => (
```

**Action**: Fix all 4 issues in DepartmentForm.tsx

---

### Fix 5: DepartmentList Type Assertions (2 errors)
**File**: `src/features/sppg/hrd/components/DepartmentList.tsx`

**Problem**:
```typescript
// ❌ Properties don't exist on type {}
{dept.parent.departmentName}
{dept._count.positions}
```

**Solution**:
```typescript
// ✅ Add proper type to useDepartments return
// In types/department.types.ts
export interface DepartmentWithRelations extends Department {
  parent?: {
    id: string
    departmentName: string
    departmentCode: string
  }
  _count?: {
    positions: number
    children: number
    employees: number
  }
}

// In DepartmentList.tsx
const { data: departments } = useDepartments() as { 
  data: DepartmentWithRelations[] 
}
```

**Action**: 
1. Ensure DepartmentWithRelations type includes parent and _count
2. Add type assertion or update hook return type

---

## 🟢 Low Priority Fixes

### Fix 6: Schema Recursive Type Annotation (2 errors)
**File**: `src/features/sppg/hrd/schemas/departmentSchema.ts:135`

**Problem**:
```typescript
// ❌ Implicit any type in recursive schema
export const departmentTreeNodeSchema = z.object({
  // ... fields
  children: z.lazy(() => z.array(departmentTreeNodeSchema))
})
```

**Solution**:
```typescript
// ✅ Explicit type annotation for recursive schema
export const departmentTreeNodeSchema: z.ZodType<any> = z.object({
  id: z.string(),
  departmentCode: z.string(),
  departmentName: z.string(),
  level: z.number(),
  currentEmployees: z.number(),
  parent: z.object({
    departmentName: z.string()
  }).nullable(),
  children: z.lazy(() => z.array(departmentTreeNodeSchema))
})

// Or use proper typing
type DepartmentTreeNode = {
  id: string
  departmentCode: string
  departmentName: string
  level: number
  currentEmployees: number
  parent: { departmentName: string } | null
  children: DepartmentTreeNode[]
}

export const departmentTreeNodeSchema: z.ZodType<DepartmentTreeNode> = z.object({
  // ... implementation
})
```

**Action**: Add proper type annotation to recursive schema

---

## 📋 Fix Checklist

- [ ] **Fix 1**: Update imports in 3 department API files (auth, db)
- [ ] **Fix 2**: Update async params in positions/[id]/route.ts
- [ ] **Fix 3**: Change `.errors` to `.issues` in 2 locations
- [ ] **Fix 4**: Fix DepartmentForm issues (4 sub-fixes)
- [ ] **Fix 5**: Fix DepartmentList type assertions (2 locations)
- [ ] **Fix 6**: Add type annotation to recursive schema

**Total Fixes**: 6 main fixes, ~31 errors

---

## 🎯 Execution Order

1. ✅ Start with Critical Fixes (1-2) - blocks compilation
2. ✅ Then Medium Priority (3-5) - type safety
3. ✅ Finally Low Priority (6) - code quality

**Estimated Time**: 30-45 minutes

---

## 📊 Progress Tracking

| Fix | Status | Errors Fixed | Notes |
|-----|--------|--------------|-------|
| Fix 1 | ⏳ Pending | 0/6 | Import paths |
| Fix 2 | ⏳ Pending | 0/1 | Async params |
| Fix 3 | ⏳ Pending | 0/2 | Zod errors |
| Fix 4 | ⏳ Pending | 0/16 | Form issues |
| Fix 5 | ⏳ Pending | 0/2 | List types |
| Fix 6 | ⏳ Pending | 0/2 | Schema recursion |
| **Total** | **0%** | **0/31** | |

---

**Last Updated**: Oct 27, 2025  
**Next Action**: Begin Fix 1 (Critical imports)
