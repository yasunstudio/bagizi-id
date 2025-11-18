# Quality Control Card Update Fix

**Date:** October 27, 2025  
**Issue:** Quality Control card tidak ter-update setelah menambah data baru  
**Status:** ✅ FIXED

---

## 🐛 Problem

### **Symptom:**
User berhasil menambah quality check baru (toast success muncul), tetapi card Quality Control tidak menampilkan data baru. User harus refresh halaman manual untuk melihat perubahan.

### **Root Cause:**
1. **StaleTime terlalu lama** - Query cache dianggap fresh selama 2 menit
2. **Missing refetch trigger** - Hanya invalidate query tanpa explicit refetch
3. **Race condition** - Dialog close dan query invalidation terjadi bersamaan

---

## ✅ Solution

### **1. Remove StaleTime**

**File:** `src/features/sppg/production/hooks/useProductions.ts`

**Before:**
```typescript
export function useQualityChecks(productionId: string | undefined) {
  return useQuery({
    queryKey: productionId ? QUERY_KEYS.qualityChecks(productionId) : ['production', 'quality', 'empty'],
    queryFn: () => {
      if (!productionId) throw new Error('Production ID is required')
      return productionApi.getQualityChecks(productionId)
    },
    select: (response) => response.data,
    enabled: !!productionId,
    staleTime: 2 * 60 * 1000, // 2 minutes ❌ TOO LONG
  })
}
```

**After:**
```typescript
export function useQualityChecks(productionId: string | undefined) {
  return useQuery({
    queryKey: productionId ? QUERY_KEYS.qualityChecks(productionId) : ['production', 'quality', 'empty'],
    queryFn: () => {
      if (!productionId) throw new Error('Production ID is required')
      return productionApi.getQualityChecks(productionId)
    },
    select: (response) => response.data,
    enabled: !!productionId,
    staleTime: 0, // ✅ Always fetch fresh data
    refetchOnMount: 'always', // ✅ Always refetch when component mounts
  })
}
```

**Impact:**
- ✅ Data always fresh
- ✅ Component refetch on mount
- ⚠️ Slightly more API calls (acceptable for real-time updates)

---

### **2. Add Explicit Refetch After Mutation**

**File:** `src/features/sppg/production/hooks/useProductions.ts`

**Before:**
```typescript
export function useAddQualityCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productionId, data }: { productionId, data }) =>
      productionApi.addQualityCheck(productionId, data),
    onSuccess: (response, variables) => {
      // Only invalidate - may not refetch immediately ❌
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.qualityChecks(variables.productionId),
      })

      toast.success('Quality Check berhasil ditambahkan')
    },
  })
}
```

**After:**
```typescript
export function useAddQualityCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productionId, data }: { productionId, data }) =>
      productionApi.addQualityCheck(productionId, data),
    onSuccess: async (response, variables) => {
      // Invalidate first ✅
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.qualityChecks(variables.productionId),
      })

      // Then explicitly refetch ✅
      await queryClient.refetchQueries({
        queryKey: QUERY_KEYS.qualityChecks(variables.productionId),
      })

      // Also invalidate production detail
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.productionId),
      })

      toast.success('Quality Check berhasil ditambahkan')
    },
  })
}
```

**Benefits:**
- ✅ Immediate data refetch after mutation
- ✅ No race condition
- ✅ Guaranteed UI update

---

### **3. Add Debug Logging**

**File:** `src/features/sppg/production/components/QualityControl.tsx`

```typescript
export function QualityControl({ productionId, className }: QualityControlProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { data: checks = [], isLoading, isFetching, dataUpdatedAt } = useQualityChecks(productionId)

  // Debug logging ✅
  console.log('[QualityControl] Render:', {
    productionId,
    checksCount: checks.length,
    isLoading,
    isFetching,
    dataUpdatedAt: new Date(dataUpdatedAt).toISOString(),
  })

  // ... rest of component
}
```

**Purpose:**
- Track when component re-renders
- Monitor data fetch status
- Verify data update timestamp

---

### **4. Add Fetching Indicator**

**File:** `src/features/sppg/production/components/QualityControl.tsx`

**Added visual feedback:**
```tsx
<div className="space-y-4 relative">
  {/* Fetching Indicator */}
  {isFetching && (
    <div className="absolute top-0 right-0 z-10">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-xs text-blue-700 dark:text-blue-300">
        <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        Memperbarui...
      </div>
    </div>
  )}
  
  {/* Rest of content */}
</div>
```

**Benefits:**
- ✅ User knows data is being updated
- ✅ Professional UX with loading spinner
- ✅ Non-intrusive (top-right corner)

---

## 📊 Before vs After

### **User Flow:**

**Before (Broken):**
```
1. User clicks "Tambah Check"
2. User fills form and submits
3. ✅ Toast: "Quality Check berhasil ditambahkan"
4. ❌ Card still shows old data (0 checks)
5. 😞 User confused, must refresh page manually
```

**After (Fixed):**
```
1. User clicks "Tambah Check"
2. User fills form and submits
3. ✅ Toast: "Quality Check berhasil ditambahkan"
4. 🔄 "Memperbarui..." indicator appears
5. ✅ Card updates automatically with new data
6. 😊 User sees new check immediately
```

### **Technical Flow:**

**Before:**
```
Mutation Success
  → Invalidate Query (mark as stale)
  → (Query still considered fresh due to staleTime)
  → No refetch triggered
  → UI not updated ❌
```

**After:**
```
Mutation Success
  → Invalidate Query (mark as stale)
  → Explicitly Refetch Query
  → Fetch new data from API
  → Update component state
  → UI updates automatically ✅
```

---

## 🧪 Testing Instructions

### **Test Case 1: Add New Quality Check**

1. Navigate to production detail page
2. Open Quality Control card
3. Click "Tambah Check"
4. Fill form:
   - Tipe: Suhu
   - Parameter: Suhu makanan
   - Nilai Aktual: 65°C
   - Status: Lulus
5. Click "Simpan"

**Expected Result:**
- ✅ Toast success appears
- ✅ "Memperbarui..." indicator shows briefly
- ✅ New check appears in table immediately
- ✅ Statistics update (Total: 1, Lulus: 1)
- ✅ Console log shows updated checksCount

---

### **Test Case 2: Add Multiple Checks**

1. Add first quality check (Temperature)
2. Verify it appears immediately
3. Add second quality check (Hygiene)
4. Verify both checks appear
5. Add third quality check (Taste)
6. Verify all three checks appear

**Expected Result:**
- ✅ Each new check appears immediately
- ✅ Statistics update correctly
- ✅ No need to refresh page

---

### **Test Case 3: Failed Check**

1. Add quality check with "Tidak Lulus" status
2. Submit form

**Expected Result:**
- ✅ Check appears immediately
- ✅ Statistics show: Tidak Lulus: 1
- ✅ Red badge displayed
- ✅ Production status may change (if implemented)

---

## 📝 Console Debug Output

When everything works correctly:

```javascript
[QualityControl] Render: {
  productionId: 'cmh8twqgg0155svwu704wwwoo',
  checksCount: 0,
  isLoading: false,
  isFetching: false,
  dataUpdatedAt: '2025-10-27T10:30:00.000Z'
}

// After adding quality check:

[QualityControl] Render: {
  productionId: 'cmh8twqgg0155svwu704wwwoo',
  checksCount: 0,
  isLoading: false,
  isFetching: true,  // ← Refetching data
  dataUpdatedAt: '2025-10-27T10:30:00.000Z'
}

[QualityControl] Render: {
  productionId: 'cmh8twqgg0155svwu704wwwoo',
  checksCount: 1,  // ← Data updated!
  isLoading: false,
  isFetching: false,
  dataUpdatedAt: '2025-10-27T10:30:15.000Z'  // ← New timestamp
}
```

---

## 🎯 Performance Considerations

### **Trade-offs:**

**More API Calls:**
- Before: Query cached for 2 minutes
- After: Query refetches on mount and after mutations
- Impact: +1-2 extra API calls per user interaction

**Benefits:**
- ✅ Real-time data accuracy
- ✅ No stale data issues
- ✅ Better UX (immediate feedback)

**Optimization (Future):**
```typescript
// Option 1: Optimistic Updates
queryClient.setQueryData(QUERY_KEYS.qualityChecks(productionId), (old) => {
  return [...old, newCheck] // Add new check immediately
})

// Option 2: Smart Stale Time
staleTime: 30 * 1000, // 30 seconds instead of 0
refetchOnWindowFocus: true, // Refetch when user returns to tab
```

---

## 🚀 Deployment Notes

### **Files Changed:**
- ✅ `src/features/sppg/production/hooks/useProductions.ts`
- ✅ `src/features/sppg/production/components/QualityControl.tsx`

### **No Breaking Changes:**
- ✅ Backward compatible
- ✅ No database changes needed
- ✅ No API changes needed
- ✅ Safe to deploy

### **Rollback Plan:**
If issues occur, revert commits:
```bash
git revert HEAD  # Revert last commit
```

---

## 📚 Related Issues

- [x] Quality Control card not updating
- [x] StaleTime configuration
- [x] Query invalidation patterns
- [x] Real-time UI updates

---

**Fixed by:** GitHub Copilot & Development Team  
**Verified:** October 27, 2025  
**Status:** ✅ PRODUCTION READY
