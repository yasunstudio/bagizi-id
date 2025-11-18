# 🚀 Quick Start Guide - Test Monitoring Auto-Fill

**Status**: ✅ Ready for Manual Testing  
**Time Required**: 30-45 minutes

---

## 🎯 Quick Test Commands

### 1. Run Automated Tests (Pre-Check)
```bash
# Run all automated tests
./scripts/test-auto-fill.sh

# Expected: 15/15 tests PASSED ✅
```

### 2. Start Development Server
```bash
# Start Next.js dev server
npm run dev

# Or with Turbo (faster)
npm run dev:turbo

# Server will be available at: http://localhost:3000
```

### 3. Navigate to Test Page
```
URL: http://localhost:3000/program/[programId]/monitoring/new

Replace [programId] with actual program ID from database
Example: http://localhost:3000/program/cm3j5x2y40000v7vxw1mh9abc/monitoring/new
```

---

## ✅ Quick Test Checklist (5 Minutes)

### Test 1: Basic Auto-Fill (2 min)
- [ ] Page loads without errors
- [ ] Loading alert appears: "Memuat data otomatis..."
- [ ] Success toast appears ONCE: "✨ Data otomatis terisi!"
- [ ] Success alert shows production/distribution counts
- [ ] Form fields populated with numbers (not 0)
- [ ] No infinite toasts or loops

**Expected**: Auto-fill completes in < 2 seconds

### Test 2: Manual Refresh (1 min)
- [ ] Click "Muat Ulang" button
- [ ] Button shows loading state
- [ ] Data refetches successfully
- [ ] No errors in console

### Test 3: Edit & Save (2 min)
- [ ] Change `targetRecipients` value manually
- [ ] Wait 30 seconds (auto-save)
- [ ] Check "Last saved" timestamp updates
- [ ] No auto-save toasts appear (silent mode)
- [ ] Click "Save Draft" button
- [ ] Manual save shows toast: "Draft disimpan"

**Expected**: Auto-save silent, manual save shows feedback

---

## 🔍 What to Observe

### Browser Console (F12)
```javascript
// Expected logs (no errors)
🎯 Auto-filling form with data: {...}
✅ Auto-fill complete

// Expected React Query logs
Query ['monitoring', 'auto-populate', 'programId'] - Success

// NO expected errors
❌ No "Cannot read property..." errors
❌ No infinite loops
❌ No memory leaks
```

### Network Tab
```
Request: GET /api/sppg/monitoring/auto-populate?programId=...
Status: 200 OK
Response Time: < 500ms
Response Size: ~2-3 KB

Response Body:
{
  "success": true,
  "data": {
    "monitoringDate": "2025-11-06T...",
    "reportingWeek": 45,
    "targetRecipients": 1000,
    "enrolledRecipients": 950,
    ...
  }
}
```

### React DevTools
```
Components Tree:
└── NewMonitoringReportPage
    ├── hasAutoFilled.current = true (after auto-fill)
    ├── form.watch() - values populated
    └── useAutoPopulateMonitoring - data loaded
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Program not found"
**Cause**: Invalid programId in URL  
**Solution**: Get valid programId from database:
```bash
# Check available programs
npm run db:studio

# Navigate to: NutritionProgram table
# Copy an ID from the 'id' column
```

### Issue 2: "No data auto-filled" (all fields = 0)
**Cause**: Program has no production/distribution records  
**Solution**: This is EXPECTED for new programs
- Test passes if no errors occur
- User can manually enter values
- Create test data:
```bash
npm run db:seed:demo
```

### Issue 3: "Infinite toasts"
**Cause**: Bug in auto-fill logic (should be fixed)  
**Solution**: Check console logs:
```javascript
// Look for repeated logs
🎯 Auto-filling form with data... (should appear ONCE)

// Check hasAutoFilled ref
console.log(hasAutoFilled.current) // Should be true after first run
```

### Issue 4: "TypeScript errors in page"
**Cause**: Type mismatch from z.coerce.date()  
**Solution**: Already handled with @ts-expect-error comments
- No action needed if tests pass

---

## 📊 Success Criteria

### ✅ Pass Criteria
- Auto-fill loads data in < 2 seconds
- Success toast appears exactly ONCE
- All numeric fields have valid values (>= 0)
- Manual refresh works
- Edited values persist
- Auto-save silent (no toasts)
- Manual save shows toast
- No console errors
- Form submission works

### ❌ Fail Criteria
- Infinite toast loops
- TypeScript errors in console
- API request fails (500 error)
- Form values not populated
- Manual edits lost
- Auto-save shows repeated toasts
- Performance issues (> 5 seconds)

---

## 📝 Test Result Template

Copy this template and fill it out:

```markdown
### Test Execution Results

**Date**: [Current Date]
**Tester**: [Your Name]
**Browser**: Chrome / Firefox / Safari
**Environment**: Development (localhost:3000)

#### Automated Tests
- [x] 15/15 tests PASSED ✅

#### Manual Tests
- [ ] Test 1: Basic Auto-Fill - PASS / FAIL
  - Auto-fill time: [X seconds]
  - Toast count: [1 or more]
  - Fields populated: [count]
  
- [ ] Test 2: Manual Refresh - PASS / FAIL
  - Refresh time: [X seconds]
  - Errors: [None / List errors]
  
- [ ] Test 3: Edit & Save - PASS / FAIL
  - Auto-save silent: [Yes / No]
  - Manual save toast: [Yes / No]
  - Values persisted: [Yes / No]

#### Issues Found
[List any bugs or unexpected behavior]

#### Overall Assessment
✅ PASS - Ready for production
⚠️ PARTIAL - Minor issues, acceptable
❌ FAIL - Critical issues, requires fixes

#### Next Steps
[What needs to be done next]
```

---

## 🚀 Next Actions

### If Tests Pass (✅)
1. Mark todo as complete
2. Update documentation with results
3. Proceed to comprehensive monitoring flow test
4. Prepare for production deployment

### If Tests Fail (❌)
1. Document specific failures
2. Create GitHub issues for bugs
3. Prioritize fixes (Critical / High / Medium)
4. Re-run tests after fixes
5. Seek help if needed

---

## 📚 Full Documentation

- **Test Plan**: `docs/MONITORING_AUTO_FILL_TEST_PLAN.md` (10 comprehensive tests)
- **Implementation**: `docs/MONITORING_AUTO_FILL_IMPLEMENTATION_COMPLETE.md`
- **Ready Status**: `docs/MONITORING_AUTO_FILL_READY_FOR_TESTING.md`
- **Test Script**: `scripts/test-auto-fill.sh` (automated)

---

## 💡 Pro Tips

### Debugging Tips
```bash
# Check React Query cache
React DevTools → Components → Search "useAutoPopulate"
# Look at: data, isLoading, error

# Check form values
React DevTools → Components → Search "NewMonitoring"
# Look at: form.getValues()

# Monitor API calls
Network Tab → Filter: "auto-populate"
# Check: Status, Response Time, Response Body
```

### Performance Tips
```javascript
// Measure auto-fill performance
console.time('auto-fill')
// ... auto-fill happens ...
console.timeEnd('auto-fill')
// Expected: < 2000ms
```

### Testing Multiple Programs
```bash
# Get all program IDs
npm run db:studio
# Navigate to NutritionProgram
# Test with different programIds to verify isolation
```

---

## 📞 Need Help?

### Resources
- GitHub Issues: [Report bugs]
- Documentation: `docs/` folder
- Code Comments: Check JSDoc in files
- Team Chat: [Your team channel]

### Contact
- Developer: Bagizi-ID Team
- Test Lead: [Your Test Lead]
- Product Owner: [Your PO]

---

**Quick Start Version**: 1.0  
**Last Updated**: November 6, 2025  
**Status**: 📋 Ready to Test

**REMEMBER**: Run `./scripts/test-auto-fill.sh` first! ✅
