# Government Budget Tracking - Testing Guide

## 🧪 Manual Testing Scenarios

### Pre-requisites
- Development server running: `npm run dev`
- Database seeded with test data
- Login as SPPG user with proper permissions
- At least 1 active NutritionProgram exists

---

## Test Scenario 1: Complete Banper Workflow (Happy Path)

### Step 1: Create Draft Request

**Navigate**: Dashboard → Anggaran Pemerintah → Permintaan Banper

**Action**: Click "Buat Permintaan Banper"

**Fill Form**:
```
Program: [Select existing program]
Requested Amount: 500,000,000
Operational Period: 6 bulan
Total Beneficiaries: 500
Food Cost Total: 300,000,000
Operational Cost: 200,000,000
Internal Notes: Test banper request for workflow validation
```

**Click**: "Simpan"

**Expected Result**:
- ✅ Toast success: "Permintaan banper berhasil dibuat"
- ✅ Status badge: DRAFT_LOCAL (gray)
- ✅ Request appears in table
- ✅ Auto-generated request number visible

---

### Step 2: Submit to BGN

**Navigate**: Click request number → Detail page

**Action**: Click "Ajukan ke BGN" button

**Fill Dialog**:
```
BGN Request Number: BGN-2025-TEST-001
BGN Submission Date: [Today's date]
BGN Portal URL: https://bgn.go.id/request/test-001
Submission Notes: Test submission to BGN Portal
```

**Click**: "Ajukan"

**Expected Result**:
- ✅ Toast success: "Permintaan berhasil diajukan ke BGN"
- ✅ Status badge changes: SUBMITTED_TO_BGN (blue)
- ✅ "Ajukan ke BGN" button disappears
- ✅ "Setujui Permintaan" button appears
- ✅ Submission date displays correctly
- ✅ Timeline shows submission event

---

### Step 3: Record BGN Approval

**Action**: Click "Setujui Permintaan" button

**Fill Dialog**:
```
BGN Approval Number: SK-001/BGN/2025
BGN Approval Date: [Today's date]
BGN Approved By Name: Dr. Ahmad Budiman
BGN Approved By Position: Kepala Bagian Anggaran Pemerintah
Approval Notes: Approved for full amount
```

**Click**: "Setujui"

**Expected Result**:
- ✅ Toast success: "Permintaan berhasil disetujui"
- ✅ Status badge changes: APPROVED_BY_BGN (green)
- ✅ "Setujui Permintaan" button disappears
- ✅ "Cairkan Dana" button appears
- ✅ Approval details displayed
- ✅ Timeline shows approval event

---

### Step 4: Disburse Funds

**Action**: Click "Cairkan Dana" button

**Fill Dialog**:
```
Disbursed Amount: 500,000,000 (can be different from requested)
Disbursed Date: [Today's date]
Bank Reference Number: TRF-202511-12345
Bank Account Received: 1234567890
Disbursement Notes: Full amount disbursed
```

**Click**: "Cairkan"

**Expected Result**:
- ✅ Toast success: "Dana berhasil dicairkan"
- ✅ Status badge changes: DISBURSED (emerald/green)
- ✅ All action buttons disappear (except Delete)
- ✅ Disbursed amount displayed
- ✅ Timeline shows disbursement event
- ✅ **CRITICAL**: Check Alokasi Anggaran tab
  - New allocation auto-created
  - Source: BANPER_KEMENSOS
  - Allocated Amount: 500,000,000
  - Spent Amount: 0
  - Status: ACTIVE
  - Linked to this banper request

---

## Test Scenario 2: Budget Transaction Flow

### Step 1: Navigate to Transactions

**Navigate**: Dashboard → Anggaran Pemerintah → Transaksi Anggaran

**Expected**:
- ✅ Page loads without errors
- ✅ Transaction list displays
- ✅ "Catat Transaksi Baru" button visible

---

### Step 2: Create Transaction

**Action**: Click "Catat Transaksi Baru"

**Fill Form**:
```
Budget Allocation: [Select allocation from Step 4 above]
Transaction Date: [Today's date]
Category: FOOD_PROCUREMENT
Amount: 50,000,000
Description: Pembelian beras 5000 kg @ Rp 10,000/kg
Receipt Number: INV-2025-001
Vendor Name: PT Pangan Sejahtera
```

**Click**: "Simpan"

**Expected Result**:
- ✅ Toast success: "Transaksi berhasil dicatat"
- ✅ Transaction appears in table
- ✅ Category badge displays correctly with icon
- ✅ Amount formatted as IDR currency
- ✅ Approval status: "Belum Disetujui"

---

### Step 3: Verify Allocation Updated

**Navigate**: Back to Permintaan Banper → Detail → Alokasi Anggaran tab

**Expected**:
- ✅ Spent Amount updated: Rp 50,000,000
- ✅ Remaining Amount: Rp 450,000,000
- ✅ Progress bar shows ~10% usage
- ✅ Status still: ACTIVE

---

### Step 4: Approve Transaction

**Navigate**: Back to Transaksi Anggaran

**Action**: Click transaction → Actions → "Setujui"

**Fill Dialog**:
```
Approved By: John Doe (auto-filled from session)
Approval Notes: Transaction verified and approved
```

**Click**: "Setujui"

**Expected Result**:
- ✅ Toast success: "Transaksi berhasil disetujui"
- ✅ Approval status changes to checkmark with date
- ✅ Actions dropdown no longer shows "Edit" or "Hapus"
- ✅ Only "Lihat Detail" available

---

## Test Scenario 3: Budget Exhaustion

### Step 1: Create Multiple Transactions

**Action**: Repeat transaction creation until `spentAmount >= allocatedAmount`

**Example**:
```
Transaction 2: Rp 100,000,000 (OPERATIONAL)
Transaction 3: Rp 150,000,000 (STAFF_SALARY)
Transaction 4: Rp 200,000,000 (EQUIPMENT)
Total Spent: Rp 500,000,000
```

---

### Step 2: Verify Status Change

**Navigate**: Alokasi Anggaran tab

**Expected**:
- ✅ Spent Amount: Rp 500,000,000
- ✅ Remaining Amount: Rp 0
- ✅ Progress bar: 100% (full)
- ✅ Status badge changes: EXHAUSTED (red/destructive)
- ✅ Cannot create new transactions for this allocation

---

## Test Scenario 4: Dashboard Statistics

### Navigate to Dashboard

**Location**: /banper-tracking main page

**Verify Stats Cards**:
- ✅ Total Alokasi Anggaran: Sum of all allocations
- ✅ Total Terpakai: Sum of all spentAmount
- ✅ Sisa Anggaran: Total allocated - Total spent
- ✅ Jumlah Permintaan: Count of all requests
- ✅ Pending Pencairan: Count of APPROVED_BY_BGN status
- ✅ Dana Dicairkan Tahun Ini: Sum of disbursed amounts (current year)
- ✅ Budget by Source breakdown displays correctly
- ✅ Numbers formatted as Indonesian currency

---

## Test Scenario 5: Error Handling

### Test 1: Cannot Submit Without Required Fields

**Action**: Try submitting banper without BGN Request Number

**Expected**:
- ✅ Form validation error
- ✅ Error message: "Nomor permintaan BGN wajib diisi"
- ✅ Cannot submit

---

### Test 2: Cannot Delete Approved Request

**Action**: Try deleting request with status APPROVED_BY_BGN

**Expected**:
- ✅ Delete button disabled or not shown
- ✅ If somehow triggered: Error message

---

### Test 3: Cannot Edit Submitted Request

**Action**: Try editing request with status SUBMITTED_TO_BGN

**Expected**:
- ✅ Edit button not shown
- ✅ All fields read-only

---

### Test 4: Cannot Delete Allocation with Transactions

**Action**: Try deleting allocation with spentAmount > 0

**Expected**:
- ✅ Delete button disabled
- ✅ Error message: "Tidak dapat menghapus alokasi yang sudah memiliki transaksi"

---

### Test 5: Cannot Exceed Allocation Amount

**Action**: Try creating transaction with amount > remaining budget

**Expected**:
- ✅ Validation error
- ✅ Warning message shows available budget

---

## Test Scenario 6: Multi-tenant Security

### Test 1: Data Isolation

**Setup**: Login as User A (SPPG 1), create banper request

**Action**: Login as User B (SPPG 2), navigate to Permintaan Banper

**Expected**:
- ✅ User B cannot see User A's request
- ✅ Only own SPPG's requests visible
- ✅ Direct URL access to User A's request returns 404

---

### Test 2: Permission Checks

**Setup**: Login as SPPG_VIEWER (read-only role)

**Expected**:
- ✅ Can view requests
- ✅ Cannot create, edit, or delete
- ✅ Action buttons not visible

---

## Test Scenario 7: UI/UX Validation

### Dark Mode

**Action**: Toggle dark mode (theme switcher)

**Verify**:
- ✅ All components render correctly
- ✅ Text readable on dark background
- ✅ Status badges have proper contrast
- ✅ Progress bars visible
- ✅ No white flashes

---

### Responsive Design

**Action**: Resize browser to mobile width

**Verify**:
- ✅ Tables scroll horizontally or stack
- ✅ Buttons remain accessible
- ✅ Forms adjust to mobile width
- ✅ Navigation menu becomes drawer

---

### Indonesian Localization

**Verify**:
- ✅ Currency: "Rp 500.000.000" format
- ✅ Dates: "12 Nov 2025" format
- ✅ All UI text in Indonesian
- ✅ Proper grammar and spelling

---

## Performance Testing

### Load Time

**Action**: Navigate to /banper-tracking with 100+ records

**Expected**:
- ✅ Page loads in < 3 seconds
- ✅ Data table renders smoothly
- ✅ No layout shift during load
- ✅ Loading skeletons displayed

---

### Query Performance

**Check in DevTools → Network**:
- ✅ API responses < 200ms
- ✅ No N+1 query issues
- ✅ Proper caching (TanStack Query)
- ✅ Optimistic updates work

---

## Regression Testing Checklist

After any code changes, verify:

- [ ] All 3 pages load without errors
- [ ] Navigation menu works
- [ ] All CRUD operations functional
- [ ] Status transitions work correctly
- [ ] Auto-calculations accurate
- [ ] Toast notifications display
- [ ] Dark mode not broken
- [ ] No console errors
- [ ] No TypeScript compilation errors
- [ ] All hooks return expected data

---

## Test Data Cleanup

After testing, clean up:

```sql
-- Delete test data (development only!)
DELETE FROM "BudgetTransaction" WHERE "description" LIKE '%Test%';
DELETE FROM "ProgramBudgetAllocation" WHERE "decreeNumber" LIKE '%TEST%';
DELETE FROM "BanperRequestTracking" WHERE "bgnRequestNumber" LIKE '%TEST%';
```

Or use: `npm run db:reset` to reset entire database.

---

## Bug Reporting Template

If you find a bug during testing:

```markdown
**Bug Title**: [Clear, descriptive title]

**Steps to Reproduce**:
1. Navigate to...
2. Click...
3. Fill form with...
4. Submit...

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots**: [If applicable]

**Console Errors**: [Copy paste from browser console]

**Environment**:
- Browser: Chrome 120.0
- OS: macOS 14.0
- User Role: SPPG_ADMIN
- SPPG ID: cm3abc123
```

---

## Automated Test Examples (Future)

### Jest Unit Test Example

```typescript
// useBanperTracking.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useBanperTracking } from '@/features/sppg/banper-tracking/hooks'

describe('useBanperTracking', () => {
  it('should fetch banper requests', async () => {
    const { result } = renderHook(() => useBanperTracking())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.data).toBeDefined()
    expect(Array.isArray(result.current.data)).toBe(true)
  })
})
```

### Playwright E2E Test Example

```typescript
// banper-workflow.spec.ts
import { test, expect } from '@playwright/test'

test('complete banper workflow', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@sppg.id')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  // Create banper request
  await page.goto('/banper-tracking')
  await page.click('text=Buat Permintaan Banper')
  // ... fill form and submit
  
  // Verify success
  await expect(page.locator('text=berhasil dibuat')).toBeVisible()
})
```

---

**Testing Status**: ⏳ Manual testing required  
**Automation**: 🔜 To be implemented  
**Last Updated**: November 12, 2025
