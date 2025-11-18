# Phase 3: Multi-Target Program - Integration Testing Plan

**Date**: November 7, 2025  
**Status**: In Progress  
**Tester**: Development Team  
**Environment**: Local Development (http://localhost:3000)

---

## Overview

End-to-end integration testing for multi-target program functionality across:
- Program creation/editing (ProgramForm)
- Program listing/filtering (ProgramList, ProgramCard)
- Beneficiary enrollment (BeneficiaryEnrollmentForm)
- Validation logic (multi-target rules)
- UI components (ProgramTypeDisplay, TargetGroupSelector, etc.)

---

## Pre-Test Setup

### ✅ Prerequisites Checklist
- [x] Development server running on port 3000
- [ ] Database seeded with test SPPG
- [ ] Logged in as SPPG user
- [ ] No existing programs (clean state)
- [ ] Browser DevTools open (Network + Console)

### Environment Verification
```bash
# Check server status
ps aux | grep "next dev"

# Check database connection
npm run db:studio

# View current programs
# Navigate to: http://localhost:3000/dashboard/program
```

---

## Test Scenario 1: Multi-Target Unrestricted Program

**Objective**: Create program that allows ALL target groups (isMultiTarget=true, allowedTargetGroups=[])

### Steps

#### 1.1 Create Program
1. Navigate to `/dashboard/program/new`
2. Fill in required fields:
   - **Nama Program**: "MBG Multi-Target Tanpa Batasan Test"
   - **Kode Program**: "MBG-MULTI-UNRESTRICTED"
   - **Jenis Program**: Pilih "MBG (Makanan Bergizi)"
   - **Program Type**: Toggle ON "Program Multi-Target"
   - **Kelompok Target yang Diizinkan**: LEAVE EMPTY (don't select any)
   - **Kelompok Target Utama**: Pilih "Balita (2-5 tahun)"
   - **Target Penerima**: 100
   - **Tanggal Mulai**: Today
   - **Wilayah Implementasi**: "Jakarta Pusat"
3. Click **Simpan Program**

**Expected Results**:
- ✅ Form submits successfully
- ✅ Success toast: "Program berhasil dibuat"
- ✅ Redirected to program list
- ✅ New program appears in list with badge: "Multi-target (Semua Kelompok)"

#### 1.2 Verify Program in List View
1. Navigate to `/dashboard/program`
2. Locate created program

**Expected Results**:
- ✅ Program card shows:
  - Badge: "Multi-target"
  - Badge: "Semua Kelompok" (gray badge)
  - ProgramTypeDisplay shows "Multi-target (Unrestricted)"
- ✅ Tooltip displays: "Program ini melayani semua kelompok target"

#### 1.3 Verify Program in Table View
1. Switch to Table view (if available)

**Expected Results**:
- ✅ "Konfigurasi" column shows:
  - ProgramTypeDisplay badge
  - TargetGroupConfigBadge with "Semua Kelompok"

#### 1.4 Test Enrollment Form
1. Navigate to `/dashboard/program/beneficiary-enrollment/new`
2. Select Organization: Pick any available
3. Select Program: "MBG-MULTI-UNRESTRICTED"
4. Wait for program data to load

**Expected Results**:
- ✅ Program configuration alert appears:
  - Shows: "Konfigurasi Program: Multi-target (Semua Kelompok)"
  - Info icon displayed
- ✅ Target Group selector is ENABLED
- ✅ Dropdown shows ALL 6 target group options:
  - Ibu Hamil & Menyusui
  - Balita (2-5 tahun)
  - Anak Usia Sekolah (6-12 tahun)
  - Remaja (13-18 tahun)
  - Lansia (>60 tahun)
  - Kelompok Rentan
- ✅ Dropdown placeholder: "Pilih dari 6 kelompok target yang diizinkan"

#### 1.5 Test Form Submission
1. Fill in remaining required fields
2. Select ANY target group
3. Submit form

**Expected Results**:
- ✅ Form submits successfully
- ✅ No validation errors
- ✅ Success toast displayed
- ✅ Enrollment created in database

---

## Test Scenario 2: Multi-Target Restricted Program

**Objective**: Create program with LIMITED target groups (isMultiTarget=true, allowedTargetGroups=[TODDLER, SCHOOL_CHILDREN])

### Steps

#### 2.1 Create Program
1. Navigate to `/dashboard/program/new`
2. Fill in required fields:
   - **Nama Program**: "MBG Multi-Target Terbatas Test"
   - **Kode Program**: "MBG-MULTI-RESTRICTED"
   - **Jenis Program**: "MBG (Makanan Bergizi)"
   - **Program Type**: Toggle ON "Program Multi-Target"
   - **Kelompok Target yang Diizinkan**: 
     - ✅ Select "Balita (2-5 tahun)"
     - ✅ Select "Anak Usia Sekolah (6-12 tahun)"
   - **Kelompok Target Utama**: Pilih "Balita (2-5 tahun)"
   - **Target Penerima**: 50
   - **Tanggal Mulai**: Today
   - **Wilayah Implementasi**: "Bandung"
3. Click **Simpan Program**

**Expected Results**:
- ✅ Form submits successfully
- ✅ Program saved with correct allowedTargetGroups array

#### 2.2 Verify Program Display
1. View program in list

**Expected Results**:
- ✅ Badge shows: "Multi-target"
- ✅ Second badge shows: "2 Kelompok"
- ✅ Tooltip displays:
  - "Program ini melayani beberapa kelompok target:"
  - "• Balita (2-5 tahun)"
  - "• Anak Usia Sekolah (6-12 tahun)"

#### 2.3 Test Enrollment Form Filtering
1. Navigate to enrollment form
2. Select Organization
3. Select Program: "MBG-MULTI-RESTRICTED"
4. Wait for program data to load

**Expected Results**:
- ✅ Program configuration alert shows:
  - "Multi-target: Balita, Anak Usia Sekolah"
- ✅ Target Group selector ENABLED
- ✅ Dropdown shows ONLY 2 options:
  - Balita (2-5 tahun)
  - Anak Usia Sekolah (6-12 tahun)
- ✅ Other 4 target groups NOT visible
- ✅ Placeholder: "Pilih dari 2 kelompok target yang diizinkan"

#### 2.4 Test Allowed Target Group Selection
1. Select "Balita (2-5 tahun)"
2. Fill remaining fields
3. Submit form

**Expected Results**:
- ✅ Form submits successfully
- ✅ No validation errors

#### 2.5 Test Disallowed Target Group (Manual Manipulation)
1. Open Browser DevTools
2. In Console, run:
```javascript
// Find the target group select element
const select = document.querySelector('select[name="targetGroup"]');

// Manually add a disallowed option
const option = document.createElement('option');
option.value = 'PREGNANT_WOMAN';
option.text = 'Ibu Hamil & Menyusui';
select.appendChild(option);

// Select the disallowed option
select.value = 'PREGNANT_WOMAN';
select.dispatchEvent(new Event('change', { bubbles: true }));
```
3. Observe validation error
4. Try to submit form

**Expected Results**:
- ✅ Red validation alert appears:
  - "Kelompok target Ibu Hamil & Menyusui tidak diizinkan untuk program ini"
  - Shows allowed groups: "Balita, Anak Usia Sekolah"
- ✅ Form submission blocked (if validation on submit)

---

## Test Scenario 3: Single-Target Program

**Objective**: Create traditional single-target program (isMultiTarget=false, primaryTargetGroup=PREGNANT_WOMAN)

### Steps

#### 3.1 Create Program
1. Navigate to `/dashboard/program/new`
2. Fill in required fields:
   - **Nama Program**: "PMT Ibu Hamil Test"
   - **Kode Program**: "PMT-BUMIL-SINGLE"
   - **Jenis Program**: "PMT (Pemberian Makanan Tambahan)"
   - **Program Type**: Toggle OFF "Program Multi-Target" (default)
   - **Kelompok Target Utama**: "Ibu Hamil & Menyusui"
   - **Target Penerima**: 30
   - **Tanggal Mulai**: Today
   - **Wilayah Implementasi**: "Surabaya"
3. Click **Simpan Program**

**Expected Results**:
- ✅ Form submits successfully
- ✅ isMultiTarget saved as FALSE
- ✅ allowedTargetGroups empty array
- ✅ primaryTargetGroup saved as PREGNANT_WOMAN

#### 3.2 Verify Display
1. View program in list

**Expected Results**:
- ✅ Badge shows: "Single-target"
- ✅ Second badge shows: "Ibu Hamil & Menyusui"
- ✅ Tooltip: "Program ini melayani kelompok target: Ibu Hamil & Menyusui"

#### 3.3 Test Enrollment Form - Single Option
1. Navigate to enrollment form
2. Select Organization
3. Select Program: "PMT-BUMIL-SINGLE"
4. Wait for program data to load

**Expected Results**:
- ✅ Program configuration alert shows:
  - "Single-target: Ibu Hamil & Menyusui"
- ✅ Target Group selector ENABLED
- ✅ Dropdown shows ONLY 1 option:
  - Ibu Hamil & Menyusui
- ✅ Placeholder: "Pilih dari 1 kelompok target yang diizinkan"
- ✅ Auto-select if only one option (optional UX improvement)

#### 3.4 Test Form Submission
1. Select "Ibu Hamil & Menyusui"
2. Fill remaining fields
3. Submit form

**Expected Results**:
- ✅ Form submits successfully
- ✅ Enrollment created with correct target group

---

## Test Scenario 4: Program List Filtering

**Objective**: Verify filter dropdown works correctly

### Steps

#### 4.1 Test "Semua Program" Filter
1. Navigate to `/dashboard/program`
2. Config filter dropdown: Select "Semua Program"

**Expected Results**:
- ✅ Shows ALL 3 test programs
- ✅ Count displayed correctly

#### 4.2 Test "Multi-Target" Filter
1. Config filter: Select "Multi-Target"

**Expected Results**:
- ✅ Shows only 2 programs:
  - MBG-MULTI-UNRESTRICTED
  - MBG-MULTI-RESTRICTED
- ✅ Hides PMT-BUMIL-SINGLE
- ✅ Count updates

#### 4.3 Test "Single-Target" Filter
1. Config filter: Select "Single-Target"

**Expected Results**:
- ✅ Shows only 1 program:
  - PMT-BUMIL-SINGLE
- ✅ Hides multi-target programs
- ✅ Count updates

---

## Test Scenario 5: Edit Program Flow

**Objective**: Test editing existing programs and config changes

### Steps

#### 5.1 Convert Single-Target to Multi-Target
1. Navigate to program edit page for "PMT-BUMIL-SINGLE"
2. Toggle ON "Program Multi-Target"
3. allowedTargetGroups field appears
4. Select multiple groups:
   - Ibu Hamil & Menyusui
   - Balita (2-5 tahun)
5. Save changes

**Expected Results**:
- ✅ Program updates successfully
- ✅ Display changes from "Single-target" to "Multi-target"
- ✅ Badge shows "2 Kelompok"
- ✅ Existing enrollments remain valid (if targetGroup matches)

#### 5.2 Restrict Multi-Target Program
1. Edit "MBG-MULTI-UNRESTRICTED"
2. Add specific allowed groups:
   - Balita (2-5 tahun)
   - Remaja (13-18 tahun)
   - Lansia (>60 tahun)
3. Save changes

**Expected Results**:
- ✅ Program updates successfully
- ✅ Badge changes from "Semua Kelompok" to "3 Kelompok"
- ✅ Enrollment form now shows only 3 options
- ✅ Existing enrollments validated (or migration handled)

---

## Test Scenario 6: UI Component Verification

**Objective**: Verify all reusable components work correctly

### Steps

#### 6.1 ProgramTypeDisplay Component
**Locations to test**:
- Program List table
- Program Card
- Enrollment form (info alert)

**Variants to verify**:
1. **Badge variant**:
   - ✅ Multi-target unrestricted: Shows "Multi-target" badge + "Semua Kelompok"
   - ✅ Multi-target restricted: Shows "Multi-target" badge + "N Kelompok"
   - ✅ Single-target: Shows "Single-target" badge + target group name

2. **Text variant**:
   - ✅ Multi-target unrestricted: "Multi-target (Semua Kelompok)"
   - ✅ Multi-target restricted: "Multi-target: Balita, Anak Sekolah"
   - ✅ Single-target: "Single-target: Ibu Hamil"

3. **Inline variant**:
   - ✅ Compact display in tight spaces
   - ✅ Proper spacing and alignment

**Tooltips**:
- ✅ Hover shows detailed information
- ✅ Lists all allowed target groups
- ✅ Proper formatting

#### 6.2 TargetGroupSelector Component
**Test in Program Form**:
- ✅ Disabled state when isMultiTarget=false
- ✅ Enabled state when isMultiTarget=true
- ✅ Multi-select works correctly
- ✅ Shows count: "N kelompok dipilih"
- ✅ Can clear all selections
- ✅ "Pilih Semua" button works
- ✅ Individual checkbox toggling

#### 6.3 TargetGroupConfigBadge Component
**Test in Program List**:
- ✅ Shows correct count
- ✅ Proper colors (default/secondary)
- ✅ Tooltip displays full list
- ✅ Handles edge cases (0 groups, 1 group, all groups)

---

## Test Scenario 7: End-to-End Complete Flow

**Objective**: Full user journey from program creation to multiple enrollments

### Steps

#### 7.1 Create Multi-Target Program
1. Create program: "MBG Komprehensif Test"
   - isMultiTarget: true
   - allowedTargetGroups: [TODDLER, SCHOOL_CHILDREN, TEENAGER]
   - primaryTargetGroup: TODDLER
   - targetRecipients: 150

#### 7.2 Enroll Beneficiary #1 (Balita)
1. Navigate to enrollment form
2. Select organization: "TK Nusantara"
3. Select program: "MBG Komprehensif Test"
4. Select target group: "Balita (2-5 tahun)"
5. Fill:
   - plannedBeneficiaries: 50
   - feedingFrequency: DAILY
   - mealsPerDay: 2
6. Submit form

**Expected Results**:
- ✅ Enrollment created
- ✅ Program currentRecipients updates to 50
- ✅ Success toast

#### 7.3 Enroll Beneficiary #2 (Anak Sekolah)
1. Repeat enrollment process
2. Select organization: "SD Pancasila"
3. Same program
4. Select target group: "Anak Usia Sekolah (6-12 tahun)"
5. plannedBeneficiaries: 60

**Expected Results**:
- ✅ Enrollment created
- ✅ Program currentRecipients updates to 110 (50+60)

#### 7.4 Enroll Beneficiary #3 (Remaja)
1. Repeat process
2. Organization: "SMP Harapan Bangsa"
3. Target group: "Remaja (13-18 tahun)"
4. plannedBeneficiaries: 40

**Expected Results**:
- ✅ Enrollment created
- ✅ Program currentRecipients updates to 150 (50+60+40)
- ✅ Matches targetRecipients

#### 7.5 Verify Program Statistics
1. View program detail page
2. Check recipients summary

**Expected Results**:
- ✅ Total Recipients: 150/150 (100%)
- ✅ Breakdown by target group:
  - Balita: 50 (33%)
  - Anak Sekolah: 60 (40%)
  - Remaja: 40 (27%)

#### 7.6 Test Over-Enrollment Prevention
1. Try to enroll beneficiary #4
2. plannedBeneficiaries: 20

**Expected Results**:
- ❓ System behavior (allow with warning? block? mark as over-capacity?)
- Document actual behavior

---

## Test Scenario 8: Validation Logic

**Objective**: Verify all validation rules work correctly

### Steps

#### 8.1 Form Validation - Program Creation
Test all validation rules:
- ✅ isMultiTarget=false requires primaryTargetGroup
- ✅ isMultiTarget=true with empty allowedTargetGroups = unrestricted (valid)
- ✅ isMultiTarget=true with non-empty allowedTargetGroups = restricted (valid)
- ✅ primaryTargetGroup must be in allowedTargetGroups (if allowedTargetGroups not empty)
- ✅ Cannot save program without required fields

#### 8.2 Form Validation - Enrollment
Test enrollment validations:
- ✅ Cannot select target group not in program's allowedTargetGroups
- ✅ Must select target group before proceeding
- ✅ Target group selector disabled until program selected
- ✅ Validation error messages clear and helpful

#### 8.3 API Validation
Test server-side validation:
1. Use browser DevTools Network tab
2. Attempt to submit invalid data via API
3. Check response status codes and error messages

**Expected Results**:
- ✅ 400 Bad Request for validation errors
- ✅ Error messages match Zod schema definitions
- ✅ Server-side validation catches client-side bypasses

---

## Browser Compatibility Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Performance Testing

### Metrics to Check
- [ ] Program list page load time (< 2 seconds)
- [ ] Program form load time (< 1 second)
- [ ] Enrollment form load time (< 1.5 seconds)
- [ ] Filter/search response time (< 500ms)
- [ ] Network requests count (minimize)
- [ ] Bundle size impact (check with `npm run build:analyze`)

---

## Accessibility Testing

### ARIA Labels
- [ ] All form fields have proper labels
- [ ] Buttons have descriptive aria-labels
- [ ] Complex components (selectors) have proper ARIA attributes

### Keyboard Navigation
- [ ] Tab order logical
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Escape key closes modals/dropdowns

### Screen Reader
- [ ] Form fields announced correctly
- [ ] Validation errors announced
- [ ] Dynamic content changes announced
- [ ] Badge content readable

---

## Error Handling Testing

### Network Errors
- [ ] API timeout handling
- [ ] 500 Internal Server Error response
- [ ] Network offline scenario

### Form Errors
- [ ] Validation error display
- [ ] Multiple errors shown simultaneously
- [ ] Error messages cleared when fixed

### Edge Cases
- [ ] Empty database (no programs)
- [ ] No organizations available
- [ ] User has no permissions

---

## Database Integrity Testing

### Data Consistency
- [ ] Multi-target programs saved correctly
- [ ] allowedTargetGroups array persisted
- [ ] Enrollments linked to correct programs
- [ ] currentRecipients count accurate

### Migration Testing
- [ ] Existing single-target programs still work
- [ ] Legacy targetGroup field populated (if needed)
- [ ] No data loss during edits

---

## Test Results Summary

**Date Completed**: _____________  
**Total Test Cases**: 50+  
**Passed**: _____  
**Failed**: _____  
**Skipped**: _____  

### Critical Issues Found
_(List any blocking bugs)_

### Medium Issues Found
_(List any non-blocking bugs)_

### Minor Issues / Enhancements
_(List any UX improvements needed)_

---

## Sign-off

**Developer**: ________________  
**Date**: ________________  

**QA Tester** (if applicable): ________________  
**Date**: ________________  

**Product Owner**: ________________  
**Date**: ________________  

---

## Notes

_(Add any additional observations, screenshots, or findings here)_
