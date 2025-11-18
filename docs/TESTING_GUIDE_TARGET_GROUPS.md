# 🧪 Quick Testing Guide - Menu Target Group Compatibility UI

**Development Server:** http://localhost:3000  
**Test URL:** http://localhost:3000/menu/create  
**Status:** Step 5/7 Complete - Ready for Manual Testing

---

## 🎯 Test Scenario 1: Universal Menu (No Target Groups)

### Expected Behavior:
- ✅ Leave all checkboxes unchecked
- ✅ Badge shows: "🌍 Universal Menu (Semua Target Group)"
- ✅ No special nutrient fields appear
- ✅ Can submit form successfully

### Steps:
1. Navigate to http://localhost:3000/menu/create
2. Login as SPPG user (if required)
3. Fill basic menu information:
   - Menu Name: "Test Universal Menu"
   - Menu Code: "TU-001"
   - Description: "Testing universal menu"
4. Select Meal Type: "SNACK_PAGI"
5. Enter Serving Size: 200
6. Scroll to "Target Group Compatibility" section
7. **DON'T check any checkboxes**
8. Verify badge shows: "🌍 Universal Menu"
9. Scroll down - confirm NO nutrient panels appear
10. Fill remaining required fields
11. Click "Create Menu" button
12. Expect success message

---

## 🎯 Test Scenario 2: Pregnant Woman Menu

### Expected Behavior:
- ✅ Check "Ibu Hamil" checkbox
- ✅ Badge shows: "Ibu Hamil"
- ✅ Pink panel appears with 3 nutrient fields
- ✅ Warning message displays
- ✅ Validation enforces nutrient requirements

### Steps:
1. Create new menu (or continue from Scenario 1)
2. Basic info:
   - Menu Name: "Test Ibu Hamil Menu"
   - Menu Code: "TIH-001"
3. Scroll to "Target Group Compatibility"
4. **Check "Ibu Hamil" checkbox**
5. Verify:
   - Badge appears: "Ibu Hamil"
   - Pink panel displays below
   - Warning: "⚠️ Menu untuk Ibu Hamil - Nutrisi Khusus Wajib Diisi"
   - 3 input fields visible:
     * Asam Folat (mcg) - placeholder: 600
     * Zat Besi (mg) - placeholder: 27
     * Kalsium (mg) - placeholder: 1000
6. Fill nutrient values:
   - Folic Acid: 600
   - Iron: 27
   - Calcium: 1000
7. Submit form
8. Expect success

### Validation Test:
9. Try submitting WITHOUT filling nutrients
10. Expect validation error
11. Try submitting with low values (e.g., iron = 10)
12. May expect validation error (if Zod refinement enforces minimum)

---

## 🎯 Test Scenario 3: Teenage Girl Menu

### Expected Behavior:
- ✅ Check "Remaja Putri" checkbox
- ✅ Badge shows: "Remaja Putri"
- ✅ Purple panel appears with iron field
- ✅ Warning about 15mg minimum

### Steps:
1. Create new menu
2. Basic info:
   - Menu Name: "Test Remaja Putri Menu"
   - Menu Code: "TRP-001"
3. Check "Remaja Putri" checkbox
4. Verify:
   - Badge: "Remaja Putri"
   - Purple panel with warning
   - Iron field visible with placeholder: 15
   - Description: "Target minimal: 15 mg/hari"
5. Fill iron value: 18 (above minimum)
6. Submit → expect success

### Validation Test:
7. Try filling iron: 10 (below minimum)
8. Submit → expect error about minimum 15mg

---

## 🎯 Test Scenario 4: Multi-Target Menu (Balita + Anak SD)

### Expected Behavior:
- ✅ Multiple checkboxes selected
- ✅ Multiple badges display
- ✅ Only relevant nutrient panels appear
- ✅ Validation combines requirements

### Steps:
1. Create new menu
2. Check BOTH:
   - "Balita"
   - "Anak Sekolah Dasar"
3. Verify:
   - 2 badges show
   - Green panel appears (Balita nutrients)
   - NO panel for SCHOOL_CHILDREN (no special requirements)
4. Fill Balita nutrients:
   - Vitamin A: 400
   - Vitamin D: 15
5. Submit → expect success

---

## 🎯 Test Scenario 5: All Target Groups Selected

### Expected Behavior:
- ✅ 6 badges display
- ✅ All 5 nutrient panels appear (no panel for SCHOOL_CHILDREN)
- ✅ Must fill all required nutrients
- ✅ Can submit successfully

### Steps:
1. Create new menu
2. Check ALL 6 checkboxes
3. Verify all badges appear
4. Verify 5 colored panels appear:
   - Pink (Pregnant Woman)
   - Purple (Teenage Girl)
   - Blue (Elderly)
   - Green (Toddler)
   - Amber (Breastfeeding Mother)
5. Fill ALL nutrient fields
6. Submit → expect success

---

## 🎯 Test Scenario 6: Dark Mode

### Expected Behavior:
- ✅ All panels readable in dark mode
- ✅ Colors maintain good contrast
- ✅ Text colors invert properly

### Steps:
1. Create new menu
2. Toggle dark mode (usually top-right theme switcher)
3. Check "Ibu Hamil" → verify pink panel has dark variant
4. Check "Remaja Putri" → verify purple panel readable
5. Check "Lansia" → verify blue panel readable
6. Check "Balita" → verify green panel readable
7. Check "Ibu Menyusui" → verify amber panel readable
8. Verify all text is legible in dark mode

---

## 🎯 Test Scenario 7: Responsive Mobile

### Expected Behavior:
- ✅ Checkbox grid becomes 1 column
- ✅ Nutrient fields stack vertically
- ✅ Panels remain readable
- ✅ Form remains usable

### Steps:
1. Open browser DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Select iPhone/Android device
4. Navigate to menu create page
5. Verify:
   - Checkbox grid shows 1 column
   - Nutrient fields stack on mobile
   - All buttons accessible
   - Form scrollable
6. Try selecting target groups
7. Fill nutrients
8. Submit form

---

## 🎯 Test Scenario 8: Edit Existing Menu

### Expected Behavior:
- ✅ Pre-selected target groups load correctly
- ✅ Badges auto-display
- ✅ Nutrient panels auto-open
- ✅ Values populate from database
- ✅ Can modify and save

### Steps:
1. Create a menu with target groups first (Scenario 2)
2. Navigate to menu list page
3. Click "Edit" on the test menu
4. Verify:
   - Target group checkboxes are pre-checked
   - Badges display correctly
   - Nutrient panels are open
   - Nutrient values are populated
5. Modify target groups:
   - Uncheck one group → panel should close
   - Check new group → panel should open
6. Modify nutrient values
7. Save changes
8. Re-open menu → verify changes persisted

---

## 🔍 Visual Verification Checklist

### UI Components Present:
- [ ] Target Group Compatibility section header
- [ ] Description text explaining usage
- [ ] 6 checkbox options in grid layout
- [ ] Badge display area below checkboxes
- [ ] Universal menu badge (when no selection)
- [ ] Selected target badges (when selections made)

### Conditional Panels:
- [ ] Pink panel for PREGNANT_WOMAN
- [ ] Purple panel for TEENAGE_GIRL
- [ ] Blue panel for ELDERLY
- [ ] Green panel for TODDLER
- [ ] Amber panel for BREASTFEEDING_MOTHER
- [ ] No panel for SCHOOL_CHILDREN (expected)

### Panel Components:
- [ ] Warning message with Info icon
- [ ] Field labels in Bahasa Indonesia
- [ ] Number input fields
- [ ] Placeholder values (target values)
- [ ] FormDescription with target hints
- [ ] Proper spacing and padding

### Dark Mode:
- [ ] Panel backgrounds adjust to dark theme
- [ ] Text colors maintain readability
- [ ] Warning messages visible
- [ ] Icons render correctly

---

## 🐛 Known Issues to Watch For

### Potential Issues:
1. **Validation not enforcing minimums** - Zod schema may need adjustment
2. **Multiple target conflicts** - e.g., PREGNANT_WOMAN + TEENAGE_GIRL both need iron field
3. **Form submission with empty nutrients** - Should fail validation
4. **Badge overflow on many selections** - Should wrap properly
5. **Mobile layout issues** - Grid should become 1 column

### Expected Errors (Normal):
- ⚠️ If nutrients not filled for selected target → validation error
- ⚠️ If iron < 15mg for TEENAGE_GIRL → validation error
- ⚠️ If form incomplete → general validation error

---

## 📊 Database Verification (After Submission)

### Using Prisma Studio:
```bash
npx prisma studio
```

1. Navigate to `NutritionMenu` table
2. Find your test menu
3. Verify columns:
   - `compatibleTargetGroups`: Should show array like `["PREGNANT_WOMAN"]`
   - `folicAcid`: Should show value (e.g., 600)
   - `iron`: Should show value (e.g., 27)
   - `calcium`: Should show value (e.g., 1000)
   - `vitaminA`: Should show value if applicable
   - `vitaminC`: Should show value if filled
   - `vitaminD`: Should show value if applicable

### Empty Array Check:
- Universal menu should have: `compatibleTargetGroups: []`
- Database representation: empty array (not null)

---

## 🎯 Success Criteria

**UI Implementation Complete When:**
- ✅ All 6 checkboxes work
- ✅ Badges display correctly
- ✅ All 5 conditional panels appear
- ✅ Nutrient fields accept input
- ✅ Form submits successfully
- ✅ Database stores values correctly
- ✅ Dark mode works
- ✅ Mobile responsive
- ✅ Edit mode loads pre-selected data

---

## 🚀 Next Steps After Testing

**If all tests pass:**
1. Document any UI/UX improvements needed
2. Proceed to Step 6: API Validation Endpoint
3. Create menu assignment validation logic
4. Test incompatible menu assignment prevention

**If issues found:**
1. Document specific errors encountered
2. Fix bugs in MenuForm.tsx
3. Re-test failed scenarios
4. Verify database schema alignment

---

## 📝 Testing Notes Template

```
Test Date: _____________
Tester: _____________
Browser: _____________
Screen Size: _____________

Scenario 1 (Universal): ✅ / ❌
Issues: ___________________________

Scenario 2 (Pregnant): ✅ / ❌
Issues: ___________________________

Scenario 3 (Teenage): ✅ / ❌
Issues: ___________________________

Scenario 4 (Multi-target): ✅ / ❌
Issues: ___________________________

Scenario 5 (All targets): ✅ / ❌
Issues: ___________________________

Scenario 6 (Dark mode): ✅ / ❌
Issues: ___________________________

Scenario 7 (Mobile): ✅ / ❌
Issues: ___________________________

Scenario 8 (Edit): ✅ / ❌
Issues: ___________________________

Overall Status: PASS / FAIL / NEEDS WORK
```

---

**Ready to Test!** 🎉  
Development server is running at: http://localhost:3000  
Navigate to: http://localhost:3000/menu/create

Good luck testing! 🚀
