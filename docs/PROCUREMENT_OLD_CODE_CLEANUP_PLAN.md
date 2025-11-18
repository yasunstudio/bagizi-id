# 🧹 Procurement Old Code Cleanup Plan

**Date**: October 28, 2025  
**Status**: 📋 **PLANNING**  
**Type**: Code Cleanup - Remove Deprecated Components

---

## 📋 Overview

After refactoring `/procurement` dashboard, we need to **clean up old procurement code** that is no longer used. The old system had individual procurement records, but now we use the modular approach with Orders, Plans, Suppliers, etc.

---

## 🎯 What to Keep vs Delete

### ✅ **KEEP (Active & Used)**

These folders contain **NEW modular components** that are actively used:

```
src/features/sppg/procurement/
├── orders/          ✅ KEEP - New orders module
├── plans/           ✅ KEEP - Planning module
├── suppliers/       ✅ KEEP - Supplier management
├── receipts/        ✅ KEEP - Receiving module
├── settings/        ✅ KEEP - Settings module
└── [other new modules]

src/app/(sppg)/procurement/
├── orders/          ✅ KEEP - Orders pages
├── plans/           ✅ KEEP - Plans pages
├── suppliers/       ✅ KEEP - Suppliers pages
├── receipts/        ✅ KEEP - Receipts pages
├── payments/        ✅ KEEP - Payments pages
├── settings/        ✅ KEEP - Settings pages
├── reports/         ✅ KEEP - Reports pages
└── page.tsx         ✅ KEEP - New dashboard (just refactored!)

src/app/api/sppg/procurement/
├── orders/          ✅ KEEP - Orders API
├── plans/           ✅ KEEP - Plans API
├── suppliers/       ✅ KEEP - Suppliers API
├── receipts/        ✅ KEEP - Receipts API
├── settings/        ✅ KEEP - Settings API
└── statistics/      ✅ KEEP - Stats API
```

### ❌ **DELETE (Old & Unused)**

These are **OLD procurement** components that used the deprecated single-record approach:

#### **1. Old Feature Components** ❌

```
src/features/sppg/procurement/
├── api/                          ❌ DELETE - Old API client
├── components/                   ❌ DELETE - Old components
│   ├── ProcurementCard.tsx       ❌ For old single records
│   ├── ProcurementForm.tsx       ❌ Old form (replaced by orders)
│   ├── ProcurementList.tsx       ❌ Old list (used in old dashboard)
│   ├── ProcurementStats.tsx      ❌ Old stats component
│   ├── ProcurementItemsManager.tsx ❌ Old items manager
│   ├── ItemSelectionDialog.tsx   ❌ Old item selector
│   ├── ProcurementPlanCard.tsx   ❌ Replaced by plans module
│   ├── ProcurementPlanForm.tsx   ❌ Replaced by plans module
│   ├── ProcurementPlanList.tsx   ❌ Replaced by plans module
│   ├── ProcurementPlanStats.tsx  ❌ Replaced by plans module
│   ├── BudgetBreakdown.tsx       ❌ Old budget component
│   ├── ApprovalWorkflow.tsx      ❌ Old approval (now in orders)
│   ├── ... (and other old components)
│   └── index.ts                  ❌ Barrel exports for old components
├── hooks/                        ❌ DELETE - Old hooks
│   ├── useProcurement.ts         ❌ Old procurement hooks
│   ├── useProcurementQueries.ts  ❌ Old query hooks
│   └── index.ts
├── stores/                       ❌ DELETE - Old Zustand stores
│   ├── procurementStore.ts       ❌ Old state management
│   └── index.ts
├── schemas/                      ❌ DELETE - Old schemas
│   ├── procurementSchema.ts      ❌ Old validation schemas
│   └── index.ts
├── types/                        ❌ DELETE - Old types
│   ├── procurement.types.ts      ❌ Old TypeScript types
│   └── index.ts
└── lib/                          ❌ DELETE - Old utilities
    ├── procurementUtils.ts       ❌ Old helper functions
    └── index.ts
```

#### **2. Old Page Routes** ❌

```
src/app/(sppg)/procurement/
├── [id]/                         ❌ DELETE - Old detail page
│   ├── page.tsx                  ❌ Single procurement detail
│   └── edit/
│       └── page.tsx              ❌ Old edit page
└── new/                          ❌ DELETE - Old create page
    └── page.tsx                  ❌ Old procurement form
```

#### **3. Old API Routes** ❌

```
src/app/api/sppg/procurement/
├── route.ts                      ❌ DELETE - Old CRUD endpoint
└── [id]/                         ❌ DELETE - Old detail endpoint
    ├── route.ts                  ❌ GET/PUT/DELETE single procurement
    ├── approve/                  ❌ Old approval (now in orders)
    ├── reject/                   ❌ Old rejection (now in orders)
    ├── payments/                 ❌ Old payments (dedicated module now)
    ├── status/                   ❌ Old status update
    └── submit/                   ❌ Old submit endpoint
```

---

## 🔍 Detailed Component Analysis

### **Component Usage Check**

Before deleting, we need to verify **no active imports** exist:

#### **Search for Old Imports**

```bash
# Search for old component imports
grep -r "from '@/features/sppg/procurement/components'" src/
grep -r "ProcurementList" src/
grep -r "ProcurementForm" src/
grep -r "ProcurementCard" src/

# Search for old hook imports
grep -r "from '@/features/sppg/procurement/hooks'" src/
grep -r "useProcurement" src/

# Search for old API imports
grep -r "from '@/features/sppg/procurement/api'" src/
grep -r "procurementApi" src/
```

**Expected Results**:
- Old dashboard used `ProcurementList` → Now replaced with new dashboard ✅
- No other active imports should exist

### **Safe Deletion Strategy**

**Phase 1: Verify No Usage** 
1. Search for all imports of old components
2. Check if any active pages still use them
3. Document any dependencies

**Phase 2: Backup (Optional)**
```bash
# Create backup of old code
mkdir -p backup/procurement-old-$(date +%Y%m%d)
cp -r src/features/sppg/procurement/components backup/procurement-old-$(date +%Y%m%d)/
cp -r src/features/sppg/procurement/hooks backup/procurement-old-$(date +%Y%m%d)/
# ... etc
```

**Phase 3: Delete Files**
```bash
# Delete old feature folders
rm -rf src/features/sppg/procurement/api
rm -rf src/features/sppg/procurement/components
rm -rf src/features/sppg/procurement/hooks
rm -rf src/features/sppg/procurement/lib
rm -rf src/features/sppg/procurement/schemas
rm -rf src/features/sppg/procurement/stores
rm -rf src/features/sppg/procurement/types

# Delete old page routes
rm -rf src/app/\(sppg\)/procurement/\[id\]
rm -rf src/app/\(sppg\)/procurement/new

# Delete old API routes
rm src/app/api/sppg/procurement/route.ts
rm -rf src/app/api/sppg/procurement/\[id\]
rm -rf src/app/api/sppg/procurement/items
```

**Phase 4: Verify Build**
```bash
npm run build
# Should pass with no errors
```

---

## 📊 Impact Analysis

### **Files to be Deleted**

**Feature Components**: ~25 files
- ProcurementCard.tsx (~300 lines)
- ProcurementForm.tsx (~500 lines)
- ProcurementList.tsx (~700 lines)
- ProcurementStats.tsx (~200 lines)
- ... (and 20+ other files)

**Total**: ~5,000-7,000 lines of old code

**Pages**: ~3 pages
- [id]/page.tsx (661 lines)
- [id]/edit/page.tsx
- new/page.tsx (291 lines)

**Total**: ~1,500-2,000 lines

**API Routes**: ~4-5 endpoints
- route.ts (main CRUD)
- [id]/route.ts
- [id]/approve/route.ts
- [id]/reject/route.ts
- etc.

**Total**: ~1,000-1,500 lines

**Grand Total**: **~7,500-10,500 lines of deprecated code**

### **Benefits of Cleanup**

1. **Codebase Size**: Reduce by ~10,000 lines
2. **Maintenance**: No confusion between old/new systems
3. **Performance**: Smaller bundle size
4. **Clarity**: Clear separation of modules
5. **Documentation**: Easier to understand structure

---

## ⚠️ Migration Checklist

Before proceeding with deletion:

### **Pre-Deletion Checks**

- [ ] New dashboard working correctly
- [ ] All module pages functional (orders, plans, suppliers, etc.)
- [ ] No active imports of old components found
- [ ] No external links pointing to old routes
- [ ] Database schema supports new structure
- [ ] API endpoints for new modules working

### **Deletion Steps**

- [ ] Create backup of old code (optional)
- [ ] Delete old feature folders (api, components, hooks, stores, schemas, types, lib)
- [ ] Delete old page routes ([id], new)
- [ ] Delete old API routes (route.ts, [id])
- [ ] Run TypeScript compilation check
- [ ] Run ESLint check
- [ ] Build project successfully
- [ ] Test new dashboard in browser
- [ ] Test all module pages
- [ ] Verify no 404 errors

### **Post-Deletion Verification**

- [ ] No TypeScript errors
- [ ] No ESLint warnings about missing imports
- [ ] Build passes successfully
- [ ] All pages load correctly
- [ ] No console errors in browser
- [ ] Navigation works as expected

---

## 🔄 Alternative: Archive Instead of Delete

If you're not comfortable deleting immediately:

### **Option: Move to Archive Folder**

```bash
mkdir -p archive/procurement-old

# Move instead of delete
mv src/features/sppg/procurement/components archive/procurement-old/
mv src/features/sppg/procurement/hooks archive/procurement-old/
# ... etc
```

**Benefits**:
- Easy to restore if needed
- Can reference old code for comparison
- Safer approach for production systems

**Archive Structure**:
```
archive/
└── procurement-old/
    ├── components/
    ├── hooks/
    ├── api/
    ├── stores/
    ├── schemas/
    ├── types/
    ├── lib/
    ├── pages/
    └── README.md  (explain why archived)
```

---

## 📝 Documentation Updates

After cleanup:

### **Update These Docs**

1. **Architecture Documentation**
   - Remove references to old procurement structure
   - Update with new modular approach

2. **API Documentation**
   - Remove old endpoint documentation
   - Update with new module endpoints

3. **User Guide**
   - Remove old procurement workflow
   - Update with new dashboard navigation

4. **Developer Guide**
   - Update component structure diagrams
   - Document new module organization

---

## 🎯 Recommendation

### **Recommended Approach: Gradual Cleanup**

**Step 1: Archive First** (Safe)
- Move old code to archive folder
- Keep for 1-2 weeks while testing

**Step 2: Monitor** (Validation)
- Monitor error logs
- Check for any missing imports
- Verify all features work

**Step 3: Delete** (Final)
- After confidence period, delete archived code
- Keep backup in git history

### **Why Gradual?**

1. **Safety**: Can restore quickly if issues found
2. **Testing**: Time to thoroughly test new system
3. **Confidence**: Build team confidence before final deletion
4. **Rollback**: Easy rollback if critical bugs discovered

---

## 🚀 Execution Plan

### **Today: Archive Old Code**
```bash
# Create archive folder
mkdir -p archive/procurement-old-20251028

# Move old feature code
mv src/features/sppg/procurement/api archive/procurement-old-20251028/
mv src/features/sppg/procurement/components archive/procurement-old-20251028/
mv src/features/sppg/procurement/hooks archive/procurement-old-20251028/
mv src/features/sppg/procurement/stores archive/procurement-old-20251028/
mv src/features/sppg/procurement/schemas archive/procurement-old-20251028/
mv src/features/sppg/procurement/types archive/procurement-old-20251028/
mv src/features/sppg/procurement/lib archive/procurement-old-20251028/

# Move old pages
mv src/app/\(sppg\)/procurement/\[id\] archive/procurement-old-20251028/pages/
mv src/app/\(sppg\)/procurement/new archive/procurement-old-20251028/pages/

# Move old API routes
mkdir -p archive/procurement-old-20251028/api
mv src/app/api/sppg/procurement/route.ts archive/procurement-old-20251028/api/
mv src/app/api/sppg/procurement/\[id\] archive/procurement-old-20251028/api/
mv src/app/api/sppg/procurement/items archive/procurement-old-20251028/api/

# Verify build still works
npm run build
```

### **Next Week: Delete Archived Code**
```bash
# After thorough testing and team approval
rm -rf archive/procurement-old-20251028
```

---

## ✅ Completion Criteria

Cleanup is complete when:

- ✅ No old procurement components exist in active codebase
- ✅ No old page routes exist
- ✅ No old API routes exist
- ✅ TypeScript compilation passes
- ✅ Build succeeds
- ✅ All module pages work correctly
- ✅ Dashboard displays properly
- ✅ No console errors
- ✅ Documentation updated

---

## 📞 Questions to Answer

Before proceeding:

1. **Backup Strategy**: Archive or straight delete?
2. **Timeline**: Delete now or gradual approach?
3. **Team Approval**: Need sign-off from team?
4. **Testing Period**: How long to keep archive before deletion?
5. **Rollback Plan**: How to restore if issues found?

---

**Status**: 📋 Awaiting user decision on cleanup strategy

**Recommended**: Archive first, test thoroughly, then delete after confidence period
