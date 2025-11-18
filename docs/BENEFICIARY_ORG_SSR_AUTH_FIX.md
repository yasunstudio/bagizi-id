# Beneficiary Organization SSR Authentication Fix

**Tanggal**: 10 November 2025  
**Status**: ✅ RESOLVED  
**Error**: "Unauthorized" pada SSR pages  
**Root Cause**: Missing headers forwarding untuk authentication  

---

## 🐛 Problem Description

### Error yang Terjadi

**Error 1: Unauthorized (Initial)**
```
Error Type: Runtime Error
Error Message: Unauthorized

at Object.getById (src/features/sppg/beneficiary-organization/api/beneficiaryOrganizationApi.ts:172:13)
at BeneficiaryOrganizationDetailPage (src/app/(sppg)/beneficiary-organizations/[id]/page.tsx:20:18)
```

**Error 2: Cannot convert object to primitive value (Follow-up)**
```
Error Type: Runtime TypeError
Error Message: Cannot convert object to primitive value

at Object.getById (src/features/sppg/beneficiary-organization/api/beneficiaryOrganizationApi.ts:165:28)
at BeneficiaryOrganizationDetailPage (src/app/(sppg)/beneficiary-organizations/[id]/page.tsx:22:51)
```

### URL yang Error
- `http://localhost:3000/beneficiary-organizations/cmhsi5igf00dgsvp1e2vtjdh5`

### Root Cause Analysis

**Problem 1 - Missing Headers**: Server-Side Rendering (SSR) pages memanggil API tanpa meneruskan authentication headers.

**Problem 2 - Next.js 15 Breaking Change**: `params` property is now a Promise that must be awaited.

**Explanation**:
1. Next.js 15 Server Components render di server-side
2. **Breaking Change**: `params` is now `Promise<{ id: string }>` instead of `{ id: string }`
3. Ketika memanggil API internal dari Server Component, fetch tidak otomatis membawa cookies
4. API endpoint `withSppgAuth` memerlukan session cookies untuk authentication
5. Tanpa forwarding headers, API return 401 Unauthorized
6. Tanpa await params, terjadi error "Cannot convert object to primitive value"

**Why This Happens**:
```typescript
// ❌ WRONG (Error 1): No headers forwarding
const result = await beneficiaryOrganizationApi.getById(params.id)
// Server Component → API (tanpa cookies) → 401 Unauthorized

// ❌ WRONG (Error 2): params not awaited (Next.js 15+)
const result = await beneficiaryOrganizationApi.getById(params.id, await headers())
// params is Promise → Cannot convert to primitive value

// ✅ CORRECT: With headers forwarding + awaited params
const { id } = await params
const result = await beneficiaryOrganizationApi.getById(id, await headers())
// Server Component → API (dengan cookies + correct id) → 200 OK
```

---

## ✅ Solution Implemented

### Files Modified

#### 1. `/src/app/(sppg)/beneficiary-organizations/[id]/page.tsx`

**Before** (Missing headers + wrong params type):
```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { beneficiaryOrganizationApi } from '@/features/sppg/beneficiary-organization/api/beneficiaryOrganizationApi'

interface BeneficiaryOrganizationDetailPageProps {
  params: {  // ❌ WRONG: Should be Promise in Next.js 15
    id: string
  }
}

export default async function BeneficiaryOrganizationDetailPage({
  params,
}: BeneficiaryOrganizationDetailPageProps) {
  const result = await beneficiaryOrganizationApi.getById(params.id)
  // ❌ No headers - API call fails with 401
  // ❌ params.id directly accessed - primitive conversion error
```

**After** (With headers + awaited params):
```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers' // ✅ Added import
import { beneficiaryOrganizationApi } from '@/features/sppg/beneficiary-organization/api/beneficiaryOrganizationApi'

interface BeneficiaryOrganizationDetailPageProps {
  params: Promise<{ id: string }>  // ✅ FIXED: Promise type for Next.js 15
}

export default async function BeneficiaryOrganizationDetailPage({
  params,
}: BeneficiaryOrganizationDetailPageProps) {
  const { id } = await params  // ✅ FIXED: Await params first
  
  // CRITICAL: Forward headers for SSR authentication
  const result = await beneficiaryOrganizationApi.getById(id, await headers())
  // ✅ Headers forwarded + correct id - API call succeeds with 200
```

#### 2. `/src/app/(sppg)/beneficiary-organizations/[id]/edit/page.tsx`

**Before**:
```typescript
interface EditBeneficiaryOrganizationPageProps {
  params: {  // ❌ WRONG: Should be Promise
    id: string
  }
}

export default async function EditBeneficiaryOrganizationPage({
  params,
}: EditBeneficiaryOrganizationPageProps) {
  const result = await beneficiaryOrganizationApi.getById(params.id)
  // ❌ Same issues - missing headers + wrong params type
```

**After**:
```typescript
import { headers } from 'next/headers' // ✅ Added import

interface EditBeneficiaryOrganizationPageProps {
  params: Promise<{ id: string }>  // ✅ FIXED: Promise type
}

export default async function EditBeneficiaryOrganizationPage({
  params,
}: EditBeneficiaryOrganizationPageProps) {
  const { id } = await params  // ✅ FIXED: Await params
  
  // CRITICAL: Forward headers for SSR authentication
  const result = await beneficiaryOrganizationApi.getById(id, await headers())
  // ✅ Fixed
```

---

## 🔍 Technical Deep Dive

### Next.js 15 SSR Authentication Pattern

**Standard Pattern for Protected SSR Pages**:

```typescript
import { headers } from 'next/headers'
import { myApi } from '@/features/my-feature/api/myApi'

// CRITICAL: params is Promise in Next.js 15+
interface MyPageProps {
  params: Promise<{ id: string }>  // ✅ Promise type
}

export default async function MyServerPage({ 
  params 
}: MyPageProps) {
  // Step 1: Await params to extract id
  const { id } = await params
  
  // Step 2: Forward headers when calling protected API
  const result = await myApi.getData(id, await headers())
  
  if (!result.success) {
    notFound()
  }
  
  return <MyComponent data={result.data} />
}
```

### How Headers Forwarding Works

1. **Browser Request**:
   ```
   GET /beneficiary-organizations/123
   Cookie: next-auth.session-token=abc123
   ```

2. **Server Component Execution**:
   ```typescript
   const headersList = await headers() // Captures request headers
   const result = await api.getById(id, headersList) // Forwards to API
   ```

3. **Internal API Call**:
   ```
   GET /api/sppg/beneficiary-organizations/123
   Cookie: next-auth.session-token=abc123  ✅ Forwarded!
   ```

4. **API Middleware**:
   ```typescript
   export async function GET(request: NextRequest) {
     return withSppgAuth(request, async (session) => {
       // ✅ Session extracted from forwarded cookies
       const data = await db.findFirst({
         where: { id, sppgId: session.user.sppgId }
       })
     })
   }
   ```

### API Client Support (Already Implemented)

API client sudah support headers parameter:

```typescript
// src/features/sppg/beneficiary-organization/api/beneficiaryOrganizationApi.ts
export const beneficiaryOrganizationApi = {
  async getById(
    id: string,
    headers?: HeadersInit  // ✅ Optional headers parameter
  ): Promise<ApiResponse<BeneficiaryOrganizationDetail>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/sppg/beneficiary-organizations/${id}`,
      getFetchOptions(headers) // ✅ Headers merged into fetch options
    )
    // ...
  }
}
```

### `getFetchOptions()` Implementation

```typescript
// src/lib/api-utils.ts
export function getFetchOptions(headers?: HeadersInit): RequestInit {
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...headers, // ✅ Merge forwarded headers (including cookies)
    },
  }
  
  return options
}
```

---

## 📊 Verification

### Test Cases

#### ✅ Test 1: Detail Page
```bash
# URL: http://localhost:3000/beneficiary-organizations/[id]
# Expected: Page loads with organization details
# Status: ✅ PASS
```

#### ✅ Test 2: Edit Page
```bash
# URL: http://localhost:3000/beneficiary-organizations/[id]/edit
# Expected: Form loads with pre-filled data
# Status: ✅ PASS
```

#### ✅ Test 3: Unauthorized Access
```bash
# Login: demo@sppg.id (different SPPG)
# URL: http://localhost:3000/beneficiary-organizations/[other-sppg-id]
# Expected: 404 Not Found (multi-tenant security)
# Status: ✅ PASS
```

---

## 🎯 Pattern Guidelines

### When to Forward Headers

**ALWAYS forward headers when**:
- ✅ Server Component calls protected API endpoint
- ✅ SSR page needs user session data
- ✅ Multi-tenant data filtering required
- ✅ RBAC permission checking needed

**Example Use Cases**:
```typescript
// Detail pages
const org = await api.getById(id, await headers())

// Edit pages
const data = await api.getData(id, await headers())

// Server-side data fetching
const list = await api.getAll(filters, await headers())
```

### When NOT to Forward Headers

**DON'T forward headers when**:
- ❌ Client Component (use TanStack Query hooks instead)
- ❌ Public pages (no authentication needed)
- ❌ Static pages (no dynamic data)

**Client Component Pattern**:
```typescript
'use client'

export function MyClientComponent() {
  // ✅ Use hooks - cookies sent automatically by browser
  const { data } = useBeneficiaryOrganization(id)
  
  return <div>{data?.name}</div>
}
```

---

## 📝 Related Files

### Modified Files (2)
- ✅ `/src/app/(sppg)/beneficiary-organizations/[id]/page.tsx`
- ✅ `/src/app/(sppg)/beneficiary-organizations/[id]/edit/page.tsx`

### Related Files (No Changes Required)
- `/src/features/sppg/beneficiary-organization/api/beneficiaryOrganizationApi.ts` (already supports headers)
- `/src/lib/api-utils.ts` (getFetchOptions already merges headers)
- `/src/app/api/sppg/beneficiary-organizations/[id]/route.ts` (withSppgAuth working correctly)

### Reference Implementations
Similar pattern used in:
- `/src/app/(sppg)/procurement/suppliers/[id]/page.tsx`
- `/src/app/(sppg)/production/[id]/edit/page.tsx`
- `/src/app/(sppg)/procurement/page.tsx`

---

## 🔒 Security Notes

### Multi-Tenant Security Maintained

Headers forwarding doesn't compromise security:

1. **Authentication still required**: API middleware validates session
2. **Multi-tenant filtering still active**: `sppgId` filter in database queries
3. **RBAC still enforced**: Role-based permissions checked
4. **Audit logging still working**: All operations logged via middleware

```typescript
// API endpoint maintains all security layers
return withSppgAuth(request, async (session) => {
  const org = await db.beneficiaryOrganization.findFirst({
    where: {
      id,
      sppgId: session.user.sppgId, // ✅ Multi-tenant filter
    },
  })
  
  if (!org) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  // ✅ Audit log via middleware
  return NextResponse.json({ success: true, data: org })
})
```

---

## 📚 Additional Resources

### Documentation
- [Enterprise API Pattern Fix](/docs/ENTERPRISE_API_PATTERN_FIX.md)
- [API Utilities Documentation](/src/lib/api-utils.ts)
- [Copilot Instructions - SSR Pattern](/.github/copilot-instructions.md#api-first-architecture-notes)

### Next.js 15 Docs
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [headers() API](https://nextjs.org/docs/app/api-reference/functions/headers)
- [Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)

---

## ✅ Summary

**Problem 1**: SSR pages returned 401 Unauthorized when accessing beneficiary organization details/edit

**Problem 2**: Runtime TypeError "Cannot convert object to primitive value" after adding headers

**Root Cause 1**: Missing `await headers()` parameter in API calls from Server Components

**Root Cause 2**: Next.js 15 breaking change - `params` is now `Promise<{ id: string }>` and must be awaited

**Solution**: 
1. Change params type from `{ id: string }` to `Promise<{ id: string }>`
2. Await params before accessing id: `const { id } = await params`
3. Forward headers to API calls: `await headers()`

**Files Changed**: 2 files (detail page + edit page)

**Changes Made**:
```typescript
// ✅ Both fixes applied:
interface PageProps {
  params: Promise<{ id: string }>  // Fix 1: Promise type
}

export default async function Page({ params }: PageProps) {
  const { id } = await params  // Fix 2: Await params
  const result = await api.getById(id, await headers())  // Fix 3: Headers forwarding
}
```

**Impact**: 
- ✅ Detail page now works
- ✅ Edit page now works
- ✅ Multi-tenant security maintained
- ✅ Authentication flow correct
- ✅ Pattern follows Next.js 15 standards
- ✅ No more primitive conversion errors

**Status**: 🎉 **FULLY RESOLVED**
