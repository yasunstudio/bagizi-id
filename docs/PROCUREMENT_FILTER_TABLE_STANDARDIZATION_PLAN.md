# 📋 Procurement Filter & Table Standardization Plan

**Date**: January 19, 2025  
**Status**: 🔄 **IN PROGRESS** - Analysis Complete, Implementation Pending  
**Issue**: Filter dan tabel masih tidak konsisten  
**Reported by**: yasunstudio

---

## 🔍 Analysis: Current Inconsistencies

### Filter & Search Inconsistencies

| Module | Search | Filters | Implementation | Issues |
|--------|--------|---------|----------------|--------|
| **Plans** | ❌ None | ❌ None | Props-based data | **No filtering at all** |
| **Suppliers** | ✅ Yes | ✅ 3 filters | Client-side (TanStack) | Complex filter UI in separate card |
| **Orders** | ❌ None | ✅ Advanced | Zustand store | Filter toggleable, inconsistent pattern |
| **Receipts** | ⚠️ Hidden | ❌ None | Local state only | searchTerm exists but not exposed |
| **Payments** | ✅ Yes | ✅ Status | Local state | Simple filter, inconsistent with others |

### Table Implementation Inconsistencies

| Module | Table Library | Sorting | Row Actions | Empty State | Loading State |
|--------|---------------|---------|-------------|-------------|---------------|
| **Plans** | TanStack Table | ✅ Column headers | ✅ Dropdown menu | ✅ Custom | ⚠️ Skeleton only |
| **Suppliers** | TanStack Table | ✅ Column headers | ✅ Dropdown menu | ✅ Custom | ✅ Skeleton + alert |
| **Orders** | Custom (Zustand) | ❌ None | ✅ Dropdown menu | ✅ Custom | ✅ Skeleton + alert |
| **Receipts** | TanStack Table | ✅ Column headers | ✅ Dropdown menu | ⚠️ Basic | ⚠️ Basic skeleton |
| **Payments** | Custom HTML | ✅ onClick handlers | ✅ Link buttons | ✅ Custom | ✅ Skeleton + alert |

### Detailed Inconsistencies

#### 1. **Plans Module** ❌ Critical
```tsx
// Location: /src/features/sppg/procurement/plans/components/PlanList.tsx
// Issues:
- ❌ NO search/filter UI at all
- ❌ Receives props from parent page, no local filtering
- ✅ Good: Table sorting works
- ✅ Good: Empty state message
```

#### 2. **Suppliers Module** ⚠️ Needs Alignment
```tsx
// Location: /src/features/sppg/procurement/suppliers/components/SupplierList.tsx
// Current Implementation:
<Card>
  <CardHeader>
    <CardTitle>Filter & Pencarian</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Search Input */}
    <div className="relative">
      <Search className="..." />
      <Input value={search} onChange={...} />
    </div>
    
    {/* 3 Filter Dropdowns */}
    <Select value={typeFilter} ...>...</Select>
    <Select value={categoryFilter} ...>...</Select>
    <Select value={statusFilter} ...>...</Select>
    
    {/* Clear Button */}
    <Button onClick={handleClearFilters}>...</Button>
  </CardContent>
</Card>

// Issues:
- ⚠️ Filter in separate Card (inconsistent with Payments)
- ⚠️ Complex layout with grid
- ✅ Good: Has search + 3 filters
- ✅ Good: Clear button
```

#### 3. **Orders Module** ⚠️ Complex
```tsx
// Location: /src/features/sppg/procurement/orders/components/OrderList.tsx
// Current Implementation:
- Uses Zustand store for filters
- Has "Filter" button that toggles filter visibility
- Filter UI is in conditional render
- No search input at all

// Issues:
- ❌ No search functionality
- ⚠️ Toggle filter pattern different from others
- ⚠️ Uses Zustand store (different state management)
- ✅ Good: Advanced filters (status, supplier, date range, amount)
```

#### 4. **Receipts Module** ❌ Hidden Functionality
```tsx
// Location: /src/features/sppg/procurement/receipts/components/ReceiptList.tsx
// Current State:
const [searchTerm, setSearchTerm] = useState('')  // EXISTS but not used!

// Issues:
- ❌ Search state exists but NO UI
- ❌ No filter UI at all
- ⚠️ searchTerm variable unused (dead code)
- ✅ Good: Table with sorting works
```

#### 5. **Payments Module** ✅ Decent (but inconsistent)
```tsx
// Location: /src/features/sppg/procurement/payments/components/PaymentList.tsx
// Current Implementation:
<div className="flex items-center gap-4 p-4">
  {/* Search */}
  <div className="relative flex-1">
    <Search className="..." />
    <Input value={search} onChange={...} />
  </div>
  
  {/* Status Filter */}
  <Select value={statusFilter} ...>...</Select>
</div>

// Issues:
- ⚠️ Simple flex layout (not in Card like Suppliers)
- ✅ Good: Has search + status filter
- ⚠️ Filter position differs from Suppliers
```

---

## 🎯 Standardization Solution

### Component Created: `ProcurementTableFilters`

**Location**: `/src/components/shared/procurement/ProcurementTableFilters.tsx`

**Features**:
- ✅ Search input with icon
- ✅ Multiple filter dropdowns (configurable)
- ✅ Clear all filters button
- ✅ Responsive design (mobile-first)
- ✅ Dark mode support
- ✅ TypeScript type safety
- ✅ Optional search hiding
- ✅ Consistent spacing and layout

**Component Interface**:
```tsx
interface ProcurementTableFiltersProps {
  // Search
  searchValue: string
  searchPlaceholder?: string
  onSearchChange: (value: string) => void
  hideSearch?: boolean
  
  // Filters (optional, configurable)
  filters?: FilterDefinition[]
  
  // Clear button
  showClearButton?: boolean
  onClearAll?: () => void
  
  // Styling
  className?: string
}

interface FilterDefinition {
  key: string
  label: string
  placeholder?: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

interface FilterOption {
  value: string
  label: string
}
```

**Layout**:
```tsx
<div className="flex flex-col sm:flex-row gap-3 p-4 border-b bg-muted/30">
  {/* Search Input (left, flex-1) */}
  <div className="relative flex-1 min-w-[200px]">
    <Search icon />
    <Input />
    <X clear button />
  </div>

  {/* Filter Dropdowns (center, auto-width) */}
  <div className="flex flex-wrap gap-2">
    <Select>{filter 1}</Select>
    <Select>{filter 2}</Select>
    <Select>{filter 3}</Select>
  </div>

  {/* Clear Button (right, auto-width) */}
  <Button>Reset Filter</Button>
</div>
```

---

## 📊 Migration Plan

### Phase 1: Plans Module (Add Filtering)

**Current**: No filtering at all  
**Target**: Add search + status filter

```tsx
// src/app/(sppg)/procurement/plans/page.tsx
// Add state:
const [search, setSearch] = useState('')
const [statusFilter, setStatusFilter] = useState<PlanStatus | 'ALL'>('ALL')

// Filter plans locally:
const filteredPlans = useMemo(() => {
  let result = plans
  
  // Search filter
  if (search) {
    result = result.filter(plan =>
      plan.planName.toLowerCase().includes(search.toLowerCase()) ||
      plan.planCode.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  // Status filter
  if (statusFilter !== 'ALL') {
    result = result.filter(plan => plan.approvalStatus === statusFilter)
  }
  
  return result
}, [plans, search, statusFilter])

// Add ProcurementTableFilters before PlanList:
<ProcurementTableFilters
  searchValue={search}
  searchPlaceholder="Cari rencana..."
  onSearchChange={setSearch}
  filters={[
    {
      key: 'status',
      label: 'Status',
      placeholder: 'Semua Status',
      options: [
        { value: 'ALL', label: 'Semua' },
        { value: 'DRAFT', label: 'Draft' },
        { value: 'SUBMITTED', label: 'Diajukan' },
        { value: 'APPROVED', label: 'Disetujui' },
        { value: 'REJECTED', label: 'Ditolak' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ]}
  showClearButton
  onClearAll={() => {
    setSearch('')
    setStatusFilter('ALL')
  }}
/>

<PlanList plans={filteredPlans} ... />
```

**Files to Modify**:
- `/src/app/(sppg)/procurement/plans/page.tsx` (add filtering logic)

---

### Phase 2: Suppliers Module (Standardize UI)

**Current**: Complex filter UI in separate Card  
**Target**: Use ProcurementTableFilters component

```tsx
// src/features/sppg/procurement/suppliers/components/SupplierList.tsx
// Replace the entire filter Card with:
<ProcurementTableFilters
  searchValue={search}
  searchPlaceholder="Cari supplier (nama, kode, kontak, telepon)..."
  onSearchChange={setSearch}
  filters={[
    {
      key: 'type',
      label: 'Tipe Supplier',
      placeholder: 'Semua Tipe',
      options: [
        { value: 'ALL', label: 'Semua Tipe' },
        { value: 'FOOD_SUPPLIER', label: 'Supplier Bahan Makanan' },
        { value: 'NON_FOOD_SUPPLIER', label: 'Supplier Non-Makanan' },
        // ... other types
      ],
      value: typeFilter,
      onChange: setTypeFilter,
    },
    {
      key: 'category',
      label: 'Kategori',
      placeholder: 'Semua Kategori',
      options: categoryOptions,
      value: categoryFilter,
      onChange: setCategoryFilter,
    },
    {
      key: 'status',
      label: 'Status',
      placeholder: 'Semua Status',
      options: [
        { value: 'ALL', label: 'Semua' },
        { value: 'ACTIVE', label: 'Aktif' },
        { value: 'INACTIVE', label: 'Tidak Aktif' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ]}
  showClearButton
  onClearAll={handleClearFilters}
/>
```

**Code Reduction**: ~80 lines → 30 lines (62% reduction)

**Files to Modify**:
- `/src/features/sppg/procurement/suppliers/components/SupplierList.tsx`

---

### Phase 3: Orders Module (Add Search)

**Current**: Advanced filters but no search  
**Target**: Add search + refactor filters to use component

```tsx
// src/features/sppg/procurement/orders/components/OrderList.tsx
// Add search state:
const [search, setSearch] = useState('')

// Add search to filter logic in Zustand store or local
// Then use component:
<ProcurementTableFilters
  searchValue={search}
  searchPlaceholder="Cari order (kode procurement, supplier)..."
  onSearchChange={setSearch}
  filters={[
    {
      key: 'status',
      label: 'Status Order',
      options: orderStatusOptions,
      value: filters.orderStatus?.[0] || 'ALL',
      onChange: (val) => setFilters({ ...filters, orderStatus: val === 'ALL' ? undefined : [val] }),
    },
    // ... more filters
  ]}
  showClearButton
  onClearAll={() => {
    setSearch('')
    setFilters({})
  }}
/>
```

**Files to Modify**:
- `/src/features/sppg/procurement/orders/components/OrderList.tsx`
- `/src/features/sppg/procurement/orders/stores/orderStore.ts` (add search to filters)

---

### Phase 4: Receipts Module (Add Filtering UI)

**Current**: searchTerm exists but hidden  
**Target**: Expose search + add filters

```tsx
// src/features/sppg/procurement/receipts/components/ReceiptList.tsx
// Rename searchTerm → search for consistency
const [search, setSearch] = useState('')
const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'ALL'>('ALL')

// Add client-side filtering:
const filteredReceipts = useMemo(() => {
  let result = receipts
  
  if (search) {
    result = result.filter(receipt =>
      receipt.procurementCode.toLowerCase().includes(search.toLowerCase()) ||
      receipt.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
      receipt.supplierName?.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  if (statusFilter !== 'ALL') {
    result = result.filter(receipt => receipt.deliveryStatus === statusFilter)
  }
  
  return result
}, [receipts, search, statusFilter])

// Add component:
<ProcurementTableFilters
  searchValue={search}
  searchPlaceholder="Cari penerimaan (kode, nomor, supplier)..."
  onSearchChange={setSearch}
  filters={[
    {
      key: 'status',
      label: 'Status Pengiriman',
      options: [
        { value: 'ALL', label: 'Semua' },
        { value: 'PENDING', label: 'Menunggu' },
        { value: 'PARTIALLY_DELIVERED', label: 'Sebagian Diterima' },
        { value: 'DELIVERED', label: 'Diterima' },
        { value: 'RETURNED', label: 'Dikembalikan' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ]}
  showClearButton
  onClearAll={() => {
    setSearch('')
    setStatusFilter('ALL')
  }}
/>
```

**Files to Modify**:
- `/src/features/sppg/procurement/receipts/components/ReceiptList.tsx`

---

### Phase 5: Payments Module (Standardize)

**Current**: Simple filters, inconsistent layout  
**Target**: Use ProcurementTableFilters

```tsx
// src/features/sppg/procurement/payments/components/PaymentList.tsx
// Replace existing filter div with:
<ProcurementTableFilters
  searchValue={search}
  searchPlaceholder="Cari pembayaran (kode, supplier, invoice)..."
  onSearchChange={setSearch}
  filters={[
    {
      key: 'status',
      label: 'Status Pembayaran',
      placeholder: 'Semua Status',
      options: [
        { value: 'ALL', label: 'Semua Status' },
        { value: 'PENDING', label: 'Menunggu' },
        { value: 'SCHEDULED', label: 'Terjadwal' },
        { value: 'PROCESSING', label: 'Diproses' },
        { value: 'PAID', label: 'Lunas' },
        { value: 'FAILED', label: 'Gagal' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ]}
  showClearButton
  onClearAll={() => {
    setSearch('')
    setStatusFilter('ALL')
  }}
/>
```

**Files to Modify**:
- `/src/features/sppg/procurement/payments/components/PaymentList.tsx`

---

## 📈 Expected Impact

### Code Metrics

**Before Standardization**:
- 5 different filter implementations
- ~250 lines of duplicated filter code
- Inconsistent UX across modules

**After Standardization**:
- 1 reusable ProcurementTableFilters component (200 lines)
- ~50-100 lines of filter usage code across 5 modules
- 100% consistent UX

**Code Reduction**: ~250 lines → ~100 lines = **60% reduction**

### Benefits

**1. Consistency** ✅
- Identical filter UI across all modules
- Same layout: Search (left) → Filters (center) → Clear (right)
- Same interaction patterns
- Same styling and spacing

**2. User Experience** ✅
- Predictable interface
- Easy to learn once, use everywhere
- Professional enterprise feel
- Reduced cognitive load

**3. Maintainability** ✅
- Single source of truth
- Changes in one place
- Easier to add new features
- TypeScript type safety

**4. Developer Experience** ✅
- Copy-paste ready
- Clear documentation
- Flexible configuration
- Easy to customize per module

---

## 🎯 Implementation Checklist

### Component Development
- [x] Create `ProcurementTableFilters.tsx`
- [x] Export in barrel file
- [x] Add TypeScript interfaces
- [x] Add JSDoc documentation
- [x] Add usage examples

### Module Migration
- [ ] **Plans Module**: Add filtering functionality
- [ ] **Suppliers Module**: Replace custom filter with component
- [ ] **Orders Module**: Add search + refactor filters
- [ ] **Receipts Module**: Expose search + add filters
- [ ] **Payments Module**: Standardize with component

### Testing & Verification
- [ ] TypeScript compilation check
- [ ] No ESLint errors
- [ ] Visual consistency check
- [ ] Responsive design test (mobile/tablet/desktop)
- [ ] Dark mode verification
- [ ] Filter functionality test
- [ ] Clear button test

### Documentation
- [ ] Update this document with implementation results
- [ ] Add screenshots of before/after
- [ ] Create usage guide for future modules
- [ ] Update Copilot instructions

---

## 🚀 Next Steps

**Priority 1: Critical Issues**
1. Add filtering to Plans module (no filtering at all)
2. Expose search in Receipts module (hidden functionality)

**Priority 2: Standardization**
3. Migrate Suppliers to use component
4. Migrate Payments to use component
5. Add search to Orders module

**Priority 3: Polish**
6. Visual consistency verification
7. Comprehensive testing
8. Documentation updates

**Estimated Time**: 2-3 hours for complete implementation

---

## 📝 Notes

### Design Decisions

1. **Filter Layout**: Horizontal flex layout (Search → Filters → Clear)
   - Responsive: Stacks vertically on mobile
   - Search takes flex-1 (grows to fill space)
   - Filters have fixed widths (180px each)
   - Clear button auto-width

2. **Filter Options**: Configurable via `FilterDefinition[]`
   - Each module can define its own filters
   - Options passed as array of `{value, label}`
   - Flexible enough for any dropdown type

3. **Clear Button**: Shows only when filters are active
   - `showClearButton && hasActiveFilters`
   - Resets all filters at once
   - Consistent "Reset Filter" label

4. **Search**: Optional, can be hidden
   - `hideSearch` prop for modules without search
   - Clear (X) button inside search input
   - Consistent placeholder pattern

### Rejected Alternatives

❌ **Separate Search & Filter Components**
- Reason: Would still cause inconsistency in layout/spacing

❌ **Advanced Filter Panel (Collapsible)**
- Reason: Too complex, reduces discoverability

❌ **Filter Tags Below Search**
- Reason: Takes too much vertical space

✅ **Current Solution: Single Unified Component**
- Pros: Maximum consistency, flexible, maintainable
- Cons: None identified

---

**Status**: ✅ Component created, ready for implementation  
**Next Action**: Begin Phase 1 (Plans Module migration)  
**Blocked by**: User approval for implementation plan
