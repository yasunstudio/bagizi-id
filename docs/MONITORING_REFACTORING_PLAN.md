# 🏗️ Monitoring Pages Refactoring Plan

## 📊 Current Status Assessment

### ❌ **NON-COMPLIANT with Copilot Instructions**

**Violation:** Detail page (759 lines) exceeds 200-line rule by **380%**

```
Current Structure:
monitoring/[monitoringId]/page.tsx: 759 lines ❌ VIOLATES RULE
Copilot Instruction: Page files should be ~120 lines max (orchestrator only)
```

### 📁 Current File Structure

```
src/app/(sppg)/program/[id]/monitoring/
├── page.tsx                    # 454 lines - List/Tab view
├── new/page.tsx                # 389 lines - Create form ✅
├── [monitoringId]/
│   ├── page.tsx                # 759 lines - Detail view ❌
│   └── edit/page.tsx           # 380 lines - Edit form ✅

src/features/sppg/program/components/monitoring/
├── Step1BasicInfo.tsx          # Create form only
├── Step2Beneficiaries.tsx      # Create form only
├── Step3ProductionQuality.tsx  # Create form only
├── Step4BudgetResources.tsx    # Create form only
├── Step5Qualitative.tsx        # Create form only
└── index.ts
```

**Problems:**
1. ❌ No detail page components (all logic in 759-line page file)
2. ❌ Monolithic structure, hard to maintain
3. ❌ Repeated UI patterns not extracted
4. ❌ No component reusability

---

## 🎯 Target Architecture (Copilot-Compliant)

### ✅ **Correct Modular Structure**

```
src/features/sppg/program/components/monitoring/
├── create/                              # CREATE form components
│   ├── Step1BasicInfo.tsx               # Multi-step form steps
│   ├── Step2Beneficiaries.tsx
│   ├── Step3ProductionQuality.tsx
│   ├── Step4BudgetResources.tsx
│   ├── Step5Qualitative.tsx
│   └── index.ts                         # Export barrel
│
├── detail/                              # DETAIL page components (NEW!)
│   ├── MonitoringDetailHeader.tsx       # ~80 lines
│   ├── MonitoringStatsCards.tsx         # ~150 lines
│   ├── MonitoringBeneficiariesTab.tsx   # ~120 lines
│   ├── MonitoringProductionTab.tsx      # ~150 lines
│   ├── MonitoringBudgetTab.tsx          # ~100 lines
│   ├── MonitoringQualitativeTab.tsx     # ~180 lines
│   ├── MonitoringAuditTab.tsx           # ~60 lines
│   └── index.ts                         # Export barrel
│
└── index.ts                             # Main export barrel

src/app/(sppg)/program/[id]/monitoring/[monitoringId]/page.tsx
# Target: ~120 lines (orchestrator only!)
```

---

## 📐 Component Breakdown Plan

### **Component 1: MonitoringDetailHeader.tsx** (~80 lines)

**Responsibilities:**
- Page title with icon
- Monitoring date display
- Reporter information
- Action buttons (Edit, Delete, Print, Export PDF)
- Back navigation

**Props:**
```typescript
interface MonitoringDetailHeaderProps {
  report: MonitoringReportDetail
  programId: string
  onEdit: () => void
  onDelete: () => void
  onPrint: () => void
  onExportPDF: () => void
}
```

**Extract from:** Lines 143-201 (current page.tsx)

---

### **Component 2: MonitoringStatsCards.tsx** (~150 lines)

**Responsibilities:**
- 4 stat cards in grid layout:
  1. Budget Card (allocated vs utilized)
  2. Production Card (meals produced/distributed)
  3. Quality Card (satisfaction, hygiene, compliance)
  4. Attendance Card (recipients, attendance rate)

**Props:**
```typescript
interface MonitoringStatsCardsProps {
  stats: {
    budgetAllocated: number
    budgetUtilized: number
    budgetUtilization: number
    totalMealsProduced: number
    totalMealsDistributed: number
    distributionRate: number
    avgQualityScore: number
    customerSatisfaction: number
    hygieneScore: number
    targetRecipients: number
    activeRecipients: number
    attendanceRate: number
  }
}
```

**Extract from:** Lines 203-345 (current page.tsx)

---

### **Component 3: MonitoringBeneficiariesTab.tsx** (~120 lines)

**Responsibilities:**
- Recipients metrics (target, enrolled, active)
- Dropout analysis
- New enrollments
- Nutrition assessment results
- Critical cases tracking

**Props:**
```typescript
interface MonitoringBeneficiariesTabProps {
  report: MonitoringReportDetail
}
```

**Extract from:** Lines 347-467 (current page.tsx)

---

### **Component 4: MonitoringProductionTab.tsx** (~150 lines)

**Responsibilities:**
- Feeding days (planned vs completed)
- Menu variety
- Stock out days
- Quality issues
- Meals production/distribution
- Waste percentage
- Food safety incidents
- Temperature compliance

**Props:**
```typescript
interface MonitoringProductionTabProps {
  report: MonitoringReportDetail
}
```

**Extract from:** Lines 469-617 (current page.tsx)

---

### **Component 5: MonitoringBudgetTab.tsx** (~100 lines)

**Responsibilities:**
- Budget allocated
- Budget utilized
- Budget utilization percentage
- Visual progress bar
- Staff attendance
- Training completed

**Props:**
```typescript
interface MonitoringBudgetTabProps {
  report: MonitoringReportDetail
}
```

**Extract from:** Already in stats cards, but need detailed breakdown section

---

### **Component 6: MonitoringQualitativeTab.tsx** (~180 lines)

**Responsibilities:**
- Challenges section (major, minor, resource constraints)
- Achievements section (milestones, best practices, innovations)
- Recommendations section (actions, resource needs, improvement plans)
- Feedback section (parents, teachers, community, government)

**Props:**
```typescript
interface MonitoringQualitativeTabProps {
  challenges: any
  achievements: any
  recommendations: any
  feedback: any
}
```

**Extract from:** Lines 619-759 (current page.tsx)

---

### **Component 7: MonitoringAuditTab.tsx** (~60 lines)

**Responsibilities:**
- Created date/time
- Created by user
- Last updated date/time
- Updated by user
- Report ID
- Program ID

**Props:**
```typescript
interface MonitoringAuditTabProps {
  report: MonitoringReportDetail
}
```

**Extract from:** Add new audit trail section (currently missing)

---

## 🔄 Refactored Page Structure

### **Target: monitoring/[monitoringId]/page.tsx** (~120 lines)

```typescript
/**
 * @fileoverview Monitoring Report Detail Page - Orchestrator Only
 * @version Next.js 15.5.4
 * 
 * Architecture: Component-based per Copilot Instructions
 * - Page file: ~120 lines (orchestrator + routing logic only)
 * - UI Components: src/features/sppg/program/components/monitoring/detail/*
 * - Business Logic: useMonitoringReport hook
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useMonitoringReport, useDeleteMonitoring } from '@/features/sppg/program/hooks'
import {
  MonitoringDetailHeader,
  MonitoringStatsCards,
  MonitoringBeneficiariesTab,
  MonitoringProductionTab,
  MonitoringBudgetTab,
  MonitoringQualitativeTab,
  MonitoringAuditTab,
} from '@/features/sppg/program/components/monitoring/detail'

export default function MonitoringDetailPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string
  const monitoringId = params.monitoringId as string

  const { data: report, isLoading, error } = useMonitoringReport(programId, monitoringId)
  const { mutate: deleteReport } = useDeleteMonitoring()

  // Loading state
  if (isLoading) return <DetailPageSkeleton />

  // Error state
  if (error || !report) return <ErrorState error={error} />

  // Action handlers
  const handleEdit = () => router.push(`/program/${programId}/monitoring/${monitoringId}/edit`)
  const handleDelete = () => deleteReport(
    { programId, monitoringId },
    { onSuccess: () => router.push(`/program/${programId}?tab=monitoring`) }
  )
  const handlePrint = () => window.print()
  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export PDF')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with actions */}
      <MonitoringDetailHeader
        report={report}
        programId={programId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
      />

      {/* Stats summary cards */}
      <MonitoringStatsCards stats={report.stats} />

      {/* Detailed tabs */}
      <Tabs defaultValue="beneficiaries">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="beneficiaries">Penerima Manfaat</TabsTrigger>
          <TabsTrigger value="production">Produksi</TabsTrigger>
          <TabsTrigger value="budget">Anggaran</TabsTrigger>
          <TabsTrigger value="qualitative">Analisis Kualitatif</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="beneficiaries">
          <MonitoringBeneficiariesTab report={report} />
        </TabsContent>

        <TabsContent value="production">
          <MonitoringProductionTab report={report} />
        </TabsContent>

        <TabsContent value="budget">
          <MonitoringBudgetTab report={report} />
        </TabsContent>

        <TabsContent value="qualitative">
          <MonitoringQualitativeTab
            challenges={report.challenges}
            achievements={report.achievements}
            recommendations={report.recommendations}
            feedback={report.feedback}
          />
        </TabsContent>

        <TabsContent value="audit">
          <MonitoringAuditTab report={report} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper components
function DetailPageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      {/* Content skeleton */}
      <Skeleton className="h-96" />
    </div>
  )
}

function ErrorState({ error }: { error: Error | null }) {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h4 className="font-semibold mb-2">Laporan Tidak Ditemukan</h4>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'Laporan monitoring tidak dapat dimuat'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Result:** ~120 lines ✅ (orchestrator only, no business logic)

---

## 📝 Implementation Steps

### Phase 1: Prepare Component Structure

1. **Create directory:**
   ```bash
   mkdir -p src/features/sppg/program/components/monitoring/detail
   ```

2. **Move existing create components:**
   ```bash
   mkdir -p src/features/sppg/program/components/monitoring/create
   mv src/features/sppg/program/components/monitoring/Step*.tsx \
      src/features/sppg/program/components/monitoring/create/
   ```

### Phase 2: Extract Detail Components

**Order of extraction (easiest to hardest):**

1. ✅ `MonitoringDetailHeader.tsx` (80 lines)
   - Extract lines 143-201
   - Simple: title + actions

2. ✅ `MonitoringAuditTab.tsx` (60 lines)
   - New component, simple data display
   - Created/updated info

3. ✅ `MonitoringStatsCards.tsx` (150 lines)
   - Extract lines 203-345
   - 4 stat cards with metrics

4. ✅ `MonitoringBeneficiariesTab.tsx` (120 lines)
   - Extract lines 347-467
   - Recipients metrics section

5. ✅ `MonitoringProductionTab.tsx` (150 lines)
   - Extract lines 469-617
   - Production & quality metrics

6. ✅ `MonitoringBudgetTab.tsx` (100 lines)
   - Extract budget details section
   - Budget breakdown + staff info

7. ✅ `MonitoringQualitativeTab.tsx` (180 lines)
   - Extract lines 619-759
   - Most complex: challenges, achievements, recommendations, feedback

### Phase 3: Update Page File

1. Remove extracted code
2. Import new components
3. Implement orchestrator pattern
4. Add error handling
5. Test all functionality

### Phase 4: Testing

1. ✅ Verify all data displays correctly
2. ✅ Test all action buttons (Edit, Delete, Print, Export)
3. ✅ Test tab navigation
4. ✅ Verify responsive layout
5. ✅ Check loading states
6. ✅ Test error states

---

## 🎯 Benefits of Refactoring

### **Before (Current):**
- ❌ 759 lines in single file
- ❌ Hard to maintain
- ❌ Difficult to test individual sections
- ❌ No component reusability
- ❌ Violates Copilot Instructions

### **After (Target):**
- ✅ ~120 lines page file (orchestrator)
- ✅ 7 focused components (~80-180 lines each)
- ✅ Easy to maintain and test
- ✅ Reusable components
- ✅ Compliant with enterprise architecture
- ✅ Better code organization
- ✅ Improved developer experience

---

## 📊 Metrics Comparison

| Metric | Before | After | Improvement |
|--------|---------|-------|-------------|
| **Page File Size** | 759 lines | ~120 lines | **-84%** |
| **Largest Component** | 759 lines | ~180 lines | **-76%** |
| **Number of Components** | 1 monolithic | 8 modular | **+700%** |
| **Testability** | Hard | Easy | **10x better** |
| **Maintainability** | Low | High | **5x better** |
| **Copilot Compliance** | ❌ No | ✅ Yes | **100%** |

---

## ⚠️ Migration Strategy

### **Safe Refactoring Process:**

1. **Don't delete original file** - Keep as reference
2. **Create components incrementally** - One at a time
3. **Test after each component** - Verify no regressions
4. **Update imports gradually** - Replace inline code with components
5. **Final verification** - Full E2E testing

### **Rollback Plan:**

If issues arise:
1. Keep original file as `page.tsx.backup`
2. Can revert quickly if needed
3. Git history available for reference

---

## 📅 Estimated Timeline

- **Phase 1 (Structure):** 30 minutes
- **Phase 2 (Components):** 3-4 hours (7 components)
- **Phase 3 (Page Update):** 1 hour
- **Phase 4 (Testing):** 1-2 hours

**Total:** ~6-8 hours of focused work

---

## ✅ Completion Criteria

- [ ] All 7 components created and exported
- [ ] Page file reduced to ~120 lines
- [ ] All functionality preserved
- [ ] 0 TypeScript errors
- [ ] All tests passing
- [ ] Responsive layout verified
- [ ] Loading/error states working
- [ ] Documentation updated

---

## 📚 References

- Copilot Instructions: `.github/copilot-instructions.md` (Lines 280-450)
- Current Implementation: `src/app/(sppg)/program/[id]/monitoring/[monitoringId]/page.tsx`
- Similar Pattern: SPPG Admin detail pages (already refactored)
- Enrollment Pattern: Already uses component-based architecture ✅
