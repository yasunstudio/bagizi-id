# 📋 Page Modularity Audit Report
**Date**: October 29, 2025  
**Auditor**: GitHub Copilot  
**Scope**: All SPPG page files (`src/app/(sppg)/**/page.tsx`)

## 🎯 Executive Summary

**CRITICAL ISSUES FOUND**: 10 pages violate robust modular architecture principles

### Severity Breakdown:
- 🔴 **CRITICAL (1 page)**: >900 lines, direct DB calls, monolithic
- 🟠 **HIGH (4 pages)**: >450 lines, direct DB/auth imports
- 🟡 **MEDIUM (5 pages)**: 200-400 lines, some architectural issues
- 🟢 **GOOD (remaining)**: <200 lines, proper structure

---

## 🔴 CRITICAL Priority (Refactor Immediately)

### 1. `/procurement/suppliers/[id]/page.tsx` - 975 LINES ⚠️
**Violations**:
- ✗ 975 lines (Target: <200 lines)
- ✗ Direct `db` import from `@/lib/prisma`
- ✗ Direct `auth` import from `@/auth`
- ✗ Likely has inline business logic
- ✗ Not using feature components properly

**Impact**: High maintenance cost, hard to test, poor reusability

**Recommended Fix**:
```typescript
// BEFORE (975 lines - BAD):
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

async function SupplierDetailPage({ params }) {
  const session = await auth()
  const supplier = await db.supplier.findUnique({ ... }) // ❌ Direct DB
  // ... 900+ lines of logic and JSX
}

// AFTER (<150 lines - GOOD):
import { SupplierDetail } from '@/features/sppg/procurement/suppliers/components'
import { supplierApi } from '@/features/sppg/procurement/suppliers/api'

async function SupplierDetailPage({ params }) {
  const { id } = await params
  const supplier = await supplierApi.getById(id, headers()) // ✅ API client
  
  if (!supplier.data) notFound()
  
  return <SupplierDetail supplier={supplier.data} /> // ✅ Feature component
}
```

**Files to Create**:
- `src/features/sppg/procurement/suppliers/components/detail/SupplierDetailHeader.tsx`
- `src/features/sppg/procurement/suppliers/components/detail/SupplierOverviewTab.tsx`
- `src/features/sppg/procurement/suppliers/components/detail/SupplierContactTab.tsx`
- `src/features/sppg/procurement/suppliers/components/detail/SupplierOrdersTab.tsx`
- `src/features/sppg/procurement/suppliers/components/detail/SupplierStatisticsTab.tsx`

---

## 🟠 HIGH Priority (Refactor Soon)

### 2. `/menu/page.tsx` - 669 LINES
**Violations**:
- ✗ 669 lines (Target: <200)
- ✗ Likely monolithic list + filters + actions
- ✗ Should use feature components

**Recommended Structure**:
```typescript
// Page: <120 lines (orchestrator)
import { MenuList, MenuFilters, MenuActions } from '@/features/sppg/menu/components'

export default async function MenuPage({ searchParams }) {
  return (
    <div>
      <MenuFilters />
      <MenuActions />
      <MenuList filters={await searchParams} />
    </div>
  )
}
```

### 3. `/procurement/page.tsx` - 607 LINES
**Violations**:
- ✗ 607 lines
- ✗ Direct `db` + `auth` imports
- ✗ Monolithic dashboard page

**Recommended Fix**: Split into:
- `ProcurementOverview.tsx` (~120 lines)
- `ProcurementStats.tsx` (~80 lines)
- `RecentOrders.tsx` (~100 lines)
- `QuickActions.tsx` (~60 lines)

### 4. `/menu/[id]/page.tsx` - 557 LINES
**Violations**:
- ✗ 557 lines
- ✗ Detail page too large
- ✗ Multiple tabs inline

**Recommended Fix**: See Copilot Instructions Section 2a - Component-Based Architecture

### 5. `/procurement/suppliers/page.tsx` - 458 LINES
**Violations**:
- ✗ 458 lines
- ✗ Direct `db` + `auth` imports
- ✗ List + filters + stats inline

---

## 🟡 MEDIUM Priority (Improve Gradually)

### 6. `/dashboard/page.tsx` - 360 LINES
- Could be split into smaller stat cards
- Otherwise acceptable for dashboard complexity

### 7. `/procurement/settings/page.tsx` - 324 LINES
- Settings pages can be longer
- Consider tab components

### 8. `/procurement/suppliers/new/page.tsx` - 271 LINES
- Form pages acceptable up to 300 lines
- Could extract form sections

### 9. `/procurement/orders/[id]/page.tsx` - 244 LINES
- Detail page acceptable
- Monitor for growth

### 10. `/production/page.tsx` - 238 LINES
- Acceptable size
- Uses feature components (check)

---

## 📊 Architectural Violations Summary

### Direct Database Access (4 files - CRITICAL)
```bash
✗ src/app/(sppg)/procurement/suppliers/page.tsx
✗ src/app/(sppg)/procurement/page.tsx
✗ src/app/(sppg)/procurement/suppliers/[id]/edit/page.tsx
✗ src/app/(sppg)/procurement/suppliers/[id]/page.tsx
```

**Problem**: Pages should NEVER import `db` directly
**Fix**: Use API clients from feature modules

### Direct Auth Access (6 files - HIGH)
```bash
✗ src/app/(sppg)/procurement/reports/page.tsx
✗ src/app/(sppg)/procurement/payments/page.tsx
✗ src/app/(sppg)/procurement/suppliers/page.tsx
✗ src/app/(sppg)/procurement/page.tsx
✗ src/app/(sppg)/procurement/suppliers/[id]/edit/page.tsx
✗ src/app/(sppg)/procurement/suppliers/[id]/page.tsx
```

**Problem**: Auth should be in middleware/layout, not pages
**Fix**: Use `withSppgAuth` HOC wrapper

### Monolithic Size (5 files - HIGH)
```bash
✗ 975 lines: procurement/suppliers/[id]/page.tsx
✗ 669 lines: menu/page.tsx
✗ 607 lines: procurement/page.tsx
✗ 557 lines: menu/[id]/page.tsx
✗ 458 lines: procurement/suppliers/page.tsx
```

**Problem**: Unmaintainable, hard to test, poor reusability
**Fix**: Extract feature components following Component-Based Architecture

---

## ✅ Correct Architecture Pattern

### Example: Good Page Structure (<150 lines)

```typescript
/**
 * @fileoverview Distribution Schedule Detail Page
 * Page orchestrator - NO business logic, NO direct DB/auth
 */

import { ScheduleDetail } from '@/features/sppg/distribution/schedule/components'
import { scheduleApi } from '@/features/sppg/distribution/schedule/api'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return { title: `Schedule #${id}` }
}

export default async function ScheduleDetailPage({ params }: PageProps) {
  const { id } = await params
  
  // Fetch via API client (with SSR headers)
  const schedule = await scheduleApi.getById(id, headers())
  
  if (!schedule.data) notFound()
  
  // Render feature component (all logic there)
  return <ScheduleDetail schedule={schedule.data} />
}
```

**Key Points**:
- ✅ <150 lines (thin orchestrator)
- ✅ Uses API client (not direct DB)
- ✅ No auth import (handled in middleware)
- ✅ Feature component contains all logic
- ✅ Async params with Next.js 15 pattern
- ✅ Proper error handling (notFound)

---

## 🎯 Refactoring Priority Queue

### Phase 1 (Week 1): CRITICAL
1. **suppliers/[id]/page.tsx** (975 → ~120 lines)
   - Extract 5 detail tab components
   - Create SupplierDetail wrapper
   - Use supplierApi client

### Phase 2 (Week 2): HIGH Priority List Pages
2. **menu/page.tsx** (669 → ~120 lines)
3. **procurement/page.tsx** (607 → ~150 lines)
4. **menu/[id]/page.tsx** (557 → ~120 lines)
5. **suppliers/page.tsx** (458 → ~120 lines)

### Phase 3 (Week 3): Edit Pages with Direct DB
6. **suppliers/[id]/edit/page.tsx** (212 lines)
   - Remove direct DB, use API
   - Already uses SupplierForm

### Phase 4 (Week 4): Auth Import Cleanup
7. **reports/page.tsx** (229 lines)
8. **payments/page.tsx** (204 lines)

---

## 📐 Component Extraction Guidelines

### When to Split (200-Line Rule):
- ✅ Page > 200 lines → Extract components
- ✅ Multiple distinct sections → Separate files
- ✅ Repeated UI patterns → Reusable components
- ✅ Complex forms → Step/section components
- ✅ Heavy business logic → Service layer

### Component Naming Pattern:
```
{Entity}{Section}{ComponentType}.tsx

Examples:
- SupplierDetailHeader.tsx
- SupplierOverviewTab.tsx
- MenuListFilters.tsx
- ProcurementStatsCard.tsx
```

### File Organization:
```
src/features/sppg/{domain}/components/
├── detail/              # Detail page components
│   ├── {Entity}DetailHeader.tsx
│   ├── {Entity}OverviewTab.tsx
│   ├── {Entity}ProfileTab.tsx
│   └── index.ts
├── list/                # List page components
│   ├── {Entity}List.tsx
│   ├── {Entity}Filters.tsx
│   ├── {Entity}Actions.tsx
│   └── index.ts
└── shared/              # Shared components
    ├── {Entity}Card.tsx
    ├── {Entity}Badge.tsx
    └── index.ts
```

---

## 🚀 Implementation Checklist

### For Each Page Refactor:

**Pre-Refactor**:
- [ ] Identify all sections/tabs (visual breakdown)
- [ ] List data dependencies (API calls needed)
- [ ] Check existing feature components
- [ ] Document current behavior (screenshots/tests)

**During Refactor**:
- [ ] Create component directory structure
- [ ] Extract components (start with simplest)
- [ ] Create/update API client if needed
- [ ] Update page to use components
- [ ] Remove direct DB/auth imports
- [ ] Test each component individually

**Post-Refactor**:
- [ ] Verify page < 200 lines
- [ ] Run `npm run build` (no errors)
- [ ] Test all functionality (no regressions)
- [ ] Update tests if applicable
- [ ] Document in component README

---

## 📈 Success Metrics

### Current State:
- ❌ 10 pages > 200 lines
- ❌ 4 pages with direct DB access
- ❌ 6 pages with direct auth import
- ❌ 1 page > 900 lines (CRITICAL)

### Target State:
- ✅ 0 pages > 200 lines
- ✅ 0 pages with direct DB access
- ✅ 0 pages with auth imports
- ✅ All pages use feature components
- ✅ 100% API client usage

### Timeline:
- **Week 1**: Fix CRITICAL (1 page)
- **Week 2**: Fix HIGH priority (4 pages)
- **Week 3**: Fix MEDIUM priority (4 pages)
- **Week 4**: Final cleanup + documentation

---

## 🔗 References

- [Copilot Instructions - Component-Based Architecture](/.github/copilot-instructions.md#component-based-architecture-pattern)
- [Copilot Instructions - API Client Pattern](/.github/copilot-instructions.md#2a-critical-enterprise-api-client-pattern)
- [Copilot Instructions - Feature Structure](/.github/copilot-instructions.md#feature-based-modular-architecture)

---

## 💡 Key Takeaways

1. **Pages are orchestrators** - Keep them thin (<150 lines)
2. **No direct DB in pages** - Always use API clients
3. **No auth in pages** - Handle in middleware/HOC
4. **Extract early, extract often** - Don't wait for 900 lines
5. **Component-based tabs** - Split detail pages into tab components
6. **Reusable components** - Build once, use everywhere
7. **Test components** - Isolated testing is easier

---

**Next Action**: Start with `procurement/suppliers/[id]/page.tsx` (975 lines → ~120 lines)
