# 🧪 Dynamic Enrollment Tabs - Testing Guide

## ✅ Implementation Summary

**What Changed:**
- `ProgramEnrollmentsTab` now fetches program data to get `allowedTargetGroups`
- Tabs are dynamically filtered based on program configuration
- Only shows tabs for allowed target groups (not all 6 groups)

**Files Modified:**
- `src/features/sppg/program/components/detail/ProgramEnrollmentsTab.tsx`

---

## 🎯 Test Scenarios

### Test 1: Unrestricted Program (All 6 Groups)

**Steps:**
1. Navigate to: `http://localhost:3000/program`
2. Click on **Program 1** (should have all 6 target groups)
3. Click tab **"Penerima Manfaat"**

**Expected Result:**
- ✅ Should see **6 tabs**:
  - 🎓 Anak Sekolah
  - 🤰 Ibu Hamil
  - 🍼 Ibu Menyusui
  - 👶 Balita
  - 👧 Remaja Putri
  - 👴 Lansia
- ✅ Tab layout: `grid-cols-6` (6 columns)
- ✅ Can click and switch between all 6 tabs

---

### Test 2: Restricted Program (Only 3 Groups)

**Steps:**
1. Stay on program list or go back
2. Click on **Program 2** (should have only 3 target groups)
3. Click tab **"Penerima Manfaat"**

**Expected Result:**
- ✅ Should see **ONLY 3 tabs**:
  - 🤰 Ibu Hamil
  - 🍼 Ibu Menyusui
  - 👶 Balita
- ✅ Tab layout: `grid-cols-3` (3 columns, wider tabs)
- ❌ Should **NOT** see:
  - Anak Sekolah
  - Remaja Putri
  - Lansia

---

### Test 3: Default Tab Selection

**For Program 2 (3 groups):**
- ✅ Default selected tab should be **first allowed group** (Ibu Hamil)
- ❌ Should NOT default to "Anak Sekolah" (not in allowed groups)

**For Program 1 (6 groups):**
- ✅ Default selected tab should be **Anak Sekolah** (first in list)

---

### Test 4: Create Button Behavior

**Steps:**
1. On Program 2 enrollment tab (3 groups)
2. Select tab "Ibu Hamil"
3. Click **"Tambah Pendaftaran"** button

**Expected Result:**
- ✅ Navigate to: `/program/beneficiary-enrollments/new?programId=xxx&targetGroup=PREGNANT_WOMAN`
- ✅ Form should pre-fill with correct programId and targetGroup
- ✅ Target group dropdown should only show 3 allowed options

---

## 🔍 Verification Checklist

### Visual Consistency
- [ ] Tabs show correct number based on `allowedTargetGroups`
- [ ] Tab grid layout adjusts dynamically (`grid-cols-X`)
- [ ] Icons and labels display correctly
- [ ] No empty or broken tabs

### Functional Behavior
- [ ] Clicking tabs switches content correctly
- [ ] Stats cards update when switching tabs
- [ ] Create button navigates with correct targetGroup
- [ ] Enrollment list filters by selected targetGroup

### Database Consistency
- [ ] Program 1 in database has 6 groups in `allowedTargetGroups`
- [ ] Program 2 in database has 3 groups in `allowedTargetGroups`
- [ ] Tabs match database configuration exactly

---

## 🐛 Common Issues to Check

### Issue 1: Still Shows All 6 Tabs
**Cause:** Program data not fetched or `allowedTargetGroups` is empty
**Fix:** Check browser console for errors, verify `useProgram(programId)` returns data

### Issue 2: No Tabs Shown
**Cause:** `allowedTabs` array is empty
**Fix:** Check program has `allowedTargetGroups` populated in database

### Issue 3: Wrong Default Tab
**Cause:** Default tab not in allowed groups
**Fix:** `useEffect` should auto-select first allowed tab

### Issue 4: Tab Layout Broken
**Cause:** Dynamic grid-cols class not applied
**Fix:** Verify `grid-cols-${allowedTabs.length}` renders correctly

---

## 📊 Expected Database State

**After seed:**

```typescript
// Program 1: Unrestricted
{
  id: "...",
  programName: "Program Makan Anak Sekolah 2025",
  isMultiTarget: true,
  allowedTargetGroups: [
    'SCHOOL_CHILDREN',
    'PREGNANT_WOMAN',
    'BREASTFEEDING_MOTHER',
    'TODDLER',
    'TEENAGE_GIRL',
    'ELDERLY'
  ],
  primaryTargetGroup: 'SCHOOL_CHILDREN'
}

// Program 2: Restricted
{
  id: "...",
  programName: "Program Gizi Ibu dan Balita",
  isMultiTarget: true,
  allowedTargetGroups: [
    'PREGNANT_WOMAN',
    'BREASTFEEDING_MOTHER',
    'TODDLER'
  ],
  primaryTargetGroup: 'PREGNANT_WOMAN'
}
```

---

## 🎨 UI Screenshots to Verify

### Program 1 (6 tabs)
```
┌─────────────────────────────────────────────────────────────┐
│ [🎓 Anak Sekolah] [🤰 Ibu Hamil] [🍼 Ibu Menyusui] ...      │
│                                                               │
│ ✓ Program ini menerima semua kelompok sasaran               │
└─────────────────────────────────────────────────────────────┘
```

### Program 2 (3 tabs)
```
┌─────────────────────────────────────────────────────────────┐
│   [🤰 Ibu Hamil]   [🍼 Ibu Menyusui]   [👶 Balita]         │
│                                                               │
│ ✓ Program ini menerima 3 kelompok sasaran                   │
└─────────────────────────────────────────────────────────────┘
```

Notice: Tabs are wider when fewer groups (grid adapts)

---

## 🚀 Next Steps After Testing

If all tests pass:
- ✅ Mark "Integration testing - Multi-Target Unrestricted Program" as complete
- ✅ Mark "Integration testing - Multi-Target Restricted Program" as complete
- ✅ Update todo list with test results
- 🎯 Proceed to beneficiary enrollment form validation testing

If issues found:
- 🐛 Document specific issue
- 🔍 Check browser console for errors
- 📊 Verify database state in Prisma Studio
- 🔧 Apply fixes and re-test

---

## 💡 Testing Tips

1. **Use Browser DevTools:**
   - Check React DevTools to see `program` data
   - Verify `allowedTargetGroups` array values
   - Check component props and state

2. **Database Verification:**
   - Open Prisma Studio: `npx prisma studio`
   - Navigate to `NutritionProgram` table
   - Verify `allowedTargetGroups` field values

3. **Console Logging:**
   - Add temporary logs in `ProgramEnrollmentsTab.tsx`:
   ```typescript
   console.log('Program:', program)
   console.log('Allowed Groups:', allowedTargetGroups)
   console.log('Allowed Tabs:', allowedTabs)
   ```

4. **Network Tab:**
   - Check API calls to `/api/sppg/program/[id]`
   - Verify response includes `allowedTargetGroups`

---

## ✅ Success Criteria

**Test passes when:**
- ✅ Program 1 shows exactly 6 tabs
- ✅ Program 2 shows exactly 3 tabs
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Tabs are clickable and functional
- ✅ Create button works with correct targetGroup
- ✅ UI is consistent with form and database

**Ready for production when:**
- ✅ All 7 integration test scenarios pass
- ✅ User feedback confirms UX improvement
- ✅ Database consistency verified
- ✅ No regressions in existing features
