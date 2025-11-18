# 🧪 Monitoring Auto-Fill Feature - Test Plan

**Feature**: Auto-populate monitoring form with aggregated data  
**Status**: ✅ Implementation Complete - Ready for Testing  
**Priority**: 🔥 HIGH - Critical UX Feature  
**Estimated Testing Time**: 30-45 minutes

---

## 📋 Test Objectives

1. ✅ Verify auto-fill loads data correctly on page load
2. ✅ Validate aggregated calculations are accurate
3. ✅ Test manual refresh functionality
4. ✅ Ensure no infinite toast loops or performance issues
5. ✅ Test error handling and edge cases
6. ✅ Verify multi-program support

---

## 🎯 Test Cases

### **Test Case 1: Basic Auto-Fill on Page Load**

**Scenario**: User navigates to create new monitoring report  
**Expected Result**: Form auto-fills with aggregated data from last 7 days

**Steps**:
1. Navigate to `/program/[programId]/monitoring/new`
2. Wait for page to load (observe loading indicator)
3. Observe auto-fill happening

**Expected Behavior**:
- ✅ Loading alert appears: "Memuat data otomatis dari sistem..."
- ✅ Success toast appears ONCE: "✨ Data otomatis terisi dari sistem!"
- ✅ Toast description shows: "Data agregasi dari X produksi dan Y distribusi (7 hari terakhir)"
- ✅ Success alert appears below header with production/distribution counts
- ✅ Form fields auto-filled:
  - **Step 1**: `monitoringDate` = today, `reportingWeek` = current week number
  - **Step 2**: `targetRecipients`, `enrolledRecipients`, `activeRecipients`, `attendanceRate`
  - **Step 3**: `totalMealsProduced`, `totalMealsDistributed`, `wastePercentage`
  - **Step 4**: `budgetAllocated`, `budgetUtilized`

**Acceptance Criteria**:
- [ ] Auto-fill completes within 2 seconds
- [ ] Success toast appears exactly ONCE (no loops)
- [ ] All numeric fields populated with valid numbers (>= 0)
- [ ] Date fields populated with valid dates
- [ ] Attendance rate calculated correctly: `(activeRecipients / targetRecipients) * 100`
- [ ] Waste percentage calculated correctly: `((produced - distributed) / produced) * 100`

---

### **Test Case 2: Manual Refresh Button**

**Scenario**: User clicks "Muat Ulang" button to refresh auto-fill data  
**Expected Result**: Data refetches and form updates with latest values

**Steps**:
1. Complete Test Case 1 (auto-fill on load)
2. Wait 5 seconds
3. Click "Muat Ulang" button in success alert

**Expected Behavior**:
- ✅ Button shows loading state: "Memuat..." with spinner
- ✅ Success toast appears: "✨ Data otomatis terisi dari sistem!" (again)
- ✅ Form values update with latest data
- ✅ Button returns to normal state: "Muat Ulang"

**Acceptance Criteria**:
- [ ] Refresh completes within 2 seconds
- [ ] No errors in console
- [ ] Form values match refetched data
- [ ] User can refresh multiple times without issues

---

### **Test Case 3: Edit Auto-Filled Values**

**Scenario**: User edits values that were auto-filled  
**Expected Result**: Manual edits are preserved and saved

**Steps**:
1. Complete Test Case 1 (auto-fill on load)
2. Navigate to Step 2
3. Manually change `targetRecipients` from auto-filled value to a different number
4. Navigate to Step 3
5. Manually change `totalMealsProduced`
6. Click "Save Draft"

**Expected Behavior**:
- ✅ Edited values are preserved (not overwritten by auto-fill)
- ✅ Manual save shows toast: "Draft disimpan"
- ✅ "Last saved" timestamp updates

**Acceptance Criteria**:
- [ ] Manual edits override auto-filled values
- [ ] Edited values persist through navigation
- [ ] Draft saves successfully with edited values
- [ ] No conflicts with auto-fill logic

---

### **Test Case 4: Auto-Save Silent Mode**

**Scenario**: Auto-save runs every 30 seconds without showing toasts  
**Expected Result**: Draft saves automatically without spamming notifications

**Steps**:
1. Navigate to monitoring new page (auto-fill loads)
2. Make any edit to trigger `isDirty` flag
3. Wait for 30 seconds
4. Observe "Last saved" timestamp
5. Wait another 30 seconds
6. Observe timestamp again

**Expected Behavior**:
- ✅ "Last saved" timestamp updates every 30 seconds
- ✅ NO toasts appear from auto-save (silent mode)
- ✅ Only the initial auto-fill toast appears
- ✅ Manual "Save Draft" button still shows toast when clicked

**Acceptance Criteria**:
- [ ] Auto-save runs every 30 seconds
- [ ] No repeated toasts from auto-save
- [ ] Timestamp updates correctly
- [ ] Manual save still shows feedback

---

### **Test Case 5: Submit with Auto-Filled Data**

**Scenario**: User submits monitoring report with auto-filled values  
**Expected Result**: Report saves to database with correct values

**Steps**:
1. Complete Test Case 1 (auto-fill on load)
2. Navigate through all 5 steps (verify auto-filled values)
3. In Step 5, add 1 challenge item (optional)
4. Click "Submit Report"

**Expected Behavior**:
- ✅ Form validation passes
- ✅ Submit button shows loading: "Submitting..."
- ✅ Success toast: "Monitoring report created successfully"
- ✅ Redirect to `/program/[id]?tab=monitoring`
- ✅ Draft cleared from localStorage

**Acceptance Criteria**:
- [ ] Submission succeeds
- [ ] Data saved correctly to database
- [ ] All auto-filled values persisted
- [ ] Step 5 qualitative data saved as JSON
- [ ] Redirect works correctly

---

### **Test Case 6: Error Handling - No Data Available**

**Scenario**: Program has no production/distribution data in last 7 days  
**Expected Result**: Graceful error message, form remains editable

**Steps**:
1. Create a NEW program with no production/distribution records
2. Navigate to `/program/[newProgramId]/monitoring/new`
3. Observe auto-fill behavior

**Expected Behavior**:
- ✅ Auto-populate API returns minimal data (0 counts)
- ✅ Form fields set to 0 or default values
- ✅ Success alert shows: "Data agregasi dari 0 produksi dan 0 distribusi"
- ✅ User can manually input all values

**Acceptance Criteria**:
- [ ] No JavaScript errors
- [ ] Form is still usable (not blocked)
- [ ] User can enter all values manually
- [ ] Submission works with manual values

---

### **Test Case 7: Error Handling - Network Failure**

**Scenario**: Auto-populate API call fails due to network issue  
**Expected Result**: Error toast appears, form remains usable

**Steps**:
1. Open DevTools Network tab
2. Set Network to "Offline" mode
3. Navigate to `/program/[id]/monitoring/new`
4. Observe error behavior
5. Set Network back to "Online"
6. Click "Muat Ulang" button

**Expected Behavior**:
- ✅ Loading indicator appears briefly
- ✅ Error toast: "Gagal memuat data otomatis"
- ✅ Error description: "Silakan isi form secara manual atau muat ulang halaman"
- ✅ Form remains editable (empty defaults)
- ✅ After network restored, refresh button works

**Acceptance Criteria**:
- [ ] Error handled gracefully
- [ ] Form not blocked by error
- [ ] Retry mechanism works
- [ ] User can proceed manually

---

### **Test Case 8: Multi-Program Support**

**Scenario**: Test auto-fill with different programs (different data)  
**Expected Result**: Each program gets its own aggregated data

**Steps**:
1. Navigate to `/program/[program1Id]/monitoring/new`
2. Note auto-filled values (e.g., targetRecipients, meals produced)
3. Navigate to `/program/[program2Id]/monitoring/new`
4. Compare auto-filled values

**Expected Behavior**:
- ✅ Each program shows different data
- ✅ Values are NOT mixed between programs
- ✅ QueryKey includes programId for proper caching: `['monitoring', 'auto-populate', programId]`

**Acceptance Criteria**:
- [ ] Data is program-specific
- [ ] No cache conflicts
- [ ] Correct sppgId filtering on backend
- [ ] Multi-tenant isolation works

---

### **Test Case 9: Date Range Accuracy (Last 7 Days)**

**Scenario**: Verify aggregations only include data from last 7 days  
**Expected Result**: Only recent data included in calculations

**Steps**:
1. Check database for production/distribution records
2. Note which records are within last 7 days vs older
3. Navigate to monitoring new page
4. Compare auto-filled values with database aggregates

**Expected Behavior**:
- ✅ Only records from last 7 days included
- ✅ `totalMealsProduced` matches sum of `actualPortions` from FoodProduction (last 7 days)
- ✅ `totalMealsDistributed` matches sum of `totalPortions` from FoodDistribution (last 7 days)
- ✅ `budgetUtilized` matches sum of `paidAmount` from Procurement (last 7 days)

**Acceptance Criteria**:
- [ ] Date range logic correct (endDate - 7 days)
- [ ] SQL WHERE clause filters correctly
- [ ] Aggregates match manual calculation
- [ ] No data leakage from other time periods

---

### **Test Case 10: Week Number Calculation**

**Scenario**: Verify `reportingWeek` calculates correctly  
**Expected Result**: Week number matches current ISO week

**Steps**:
1. Navigate to monitoring new page on different dates
2. Check auto-filled `reportingWeek` value
3. Verify against ISO week calculator (https://www.epochconverter.com/)

**Expected Behavior**:
- ✅ Week number calculated using ISO 8601 standard
- ✅ Monday is first day of week
- ✅ Week 1 contains January 4th

**Acceptance Criteria**:
- [ ] Week number matches ISO standard
- [ ] Calculation consistent across different dates
- [ ] No off-by-one errors

---

## 🔍 Performance Metrics

### Expected Performance
- **API Response Time**: < 500ms
- **Auto-fill Execution**: < 2 seconds total
- **UI Responsiveness**: No blocking, smooth animations
- **Memory Usage**: < 10MB additional (React Query cache)

### Performance Test Steps
1. Open DevTools Performance tab
2. Start recording
3. Navigate to monitoring new page
4. Wait for auto-fill to complete
5. Stop recording
6. Analyze timeline

**Acceptance Criteria**:
- [ ] No long tasks (> 50ms)
- [ ] No layout thrashing
- [ ] API call completes in < 500ms
- [ ] Form render time < 100ms

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. ⚠️ Auto-fill only runs on initial page load (not on navigation back)
2. ⚠️ 7-day window hardcoded (no custom date range yet)
3. ⚠️ Step 5 qualitative fields NOT auto-filled (intentional - requires manual input)
4. ⚠️ No auto-fill for edit mode (only for create new)

### Future Enhancements
- [ ] Add date range selector for auto-populate
- [ ] Support auto-fill in edit mode (pre-fill with last report values)
- [ ] Add confidence score for aggregated data
- [ ] Implement incremental auto-fill (per-step instead of all at once)

---

## ✅ Test Execution Checklist

### Pre-Test Setup
- [ ] Database seeded with test data (programs, productions, distributions)
- [ ] At least 2 programs with different data
- [ ] Some programs with data, some without (edge cases)
- [ ] Development server running (`npm run dev`)
- [ ] Browser DevTools open (Console + Network tabs)

### Test Execution
- [ ] Test Case 1: Basic Auto-Fill ✅
- [ ] Test Case 2: Manual Refresh ✅
- [ ] Test Case 3: Edit Auto-Filled Values ✅
- [ ] Test Case 4: Auto-Save Silent Mode ✅
- [ ] Test Case 5: Submit with Auto-Filled Data ✅
- [ ] Test Case 6: No Data Available ✅
- [ ] Test Case 7: Network Failure ✅
- [ ] Test Case 8: Multi-Program Support ✅
- [ ] Test Case 9: Date Range Accuracy ✅
- [ ] Test Case 10: Week Number Calculation ✅

### Post-Test Validation
- [ ] No console errors observed
- [ ] No infinite loops or memory leaks
- [ ] Performance metrics meet targets
- [ ] All acceptance criteria passed
- [ ] Documentation updated with findings

---

## 📊 Test Results Template

```markdown
### Test Execution: [Date]
**Tester**: [Name]
**Environment**: Development / Staging / Production
**Browser**: Chrome / Firefox / Safari
**Database**: [Test data seed version]

#### Test Case Results
1. Basic Auto-Fill: ✅ PASS / ❌ FAIL
2. Manual Refresh: ✅ PASS / ❌ FAIL
3. Edit Auto-Filled Values: ✅ PASS / ❌ FAIL
4. Auto-Save Silent Mode: ✅ PASS / ❌ FAIL
5. Submit with Auto-Filled Data: ✅ PASS / ❌ FAIL
6. No Data Available: ✅ PASS / ❌ FAIL
7. Network Failure: ✅ PASS / ❌ FAIL
8. Multi-Program Support: ✅ PASS / ❌ FAIL
9. Date Range Accuracy: ✅ PASS / ❌ FAIL
10. Week Number Calculation: ✅ PASS / ❌ FAIL

#### Issues Found
- [List any bugs, unexpected behavior, or concerns]

#### Performance Metrics
- API Response Time: [X ms]
- Auto-fill Total Time: [X seconds]
- UI Blocking Time: [X ms]

#### Overall Result
✅ PASS - Feature ready for production
⚠️ PARTIAL - Minor issues found, acceptable for release
❌ FAIL - Critical issues, requires fixes before release
```

---

## 🚀 Next Steps After Testing

### If All Tests Pass (✅ PASS)
1. Mark "Test Monitoring Auto-Fill Feature" as complete in todo list
2. Proceed to "Test Monitoring Create & Detail Flow (COMPREHENSIVE!)"
3. Update documentation with test results
4. Create release notes for auto-fill feature

### If Issues Found (⚠️ PARTIAL / ❌ FAIL)
1. Document all issues in GitHub Issues or bug tracker
2. Prioritize issues (Critical / High / Medium / Low)
3. Fix critical issues before proceeding
4. Re-run affected test cases
5. Update implementation if needed

---

## 📚 Related Documentation

- [MONITORING_AUTO_FILL_IMPLEMENTATION_COMPLETE.md](./MONITORING_AUTO_FILL_IMPLEMENTATION_COMPLETE.md) - Implementation details
- [API_INTEGRATION_AUDIT_TRAIL_COMPLETE.md](./API_INTEGRATION_AUDIT_TRAIL_COMPLETE.md) - API patterns
- [COPILOT_INSTRUCTIONS.md](../.github/copilot-instructions.md) - Development guidelines

---

**Test Plan Version**: 1.0  
**Created**: November 6, 2025  
**Last Updated**: November 6, 2025  
**Status**: 📋 Ready for Execution
