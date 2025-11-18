# 🧪 Testing Guide - Monitoring Feature

## Quick Start Testing

### **Step 1: Create New Monitoring Report**

```bash
# Navigate to:
/program/[id]/monitoring
↓
Click: "Buat Laporan Baru" button
↓
You'll see: Multi-step form (Step 1 of 5)
```

### **Step 2: Complete Steps 1-4** (Quick validation)

**Step 1 - Basic Info:**
- ✅ Monitoring Date (auto-filled with today)
- ✅ Reporting Week (number input)

**Step 2 - Beneficiaries:**
- ✅ Target, Enrolled, Active recipients (numbers)
- ✅ Attendance rate (percentage)

**Step 3 - Production & Quality:**
- ✅ Feeding days planned/completed
- ✅ Total meals produced/distributed
- ✅ Quality scores (0-100)

**Step 4 - Budget & Resources:**
- ✅ Budget allocated/utilized (Rupiah)
- ✅ Staff count

---

## 🎯 **FOCUS: Step 5 - NEW Dynamic Forms!**

### **What to Test:**

#### **1. Challenges Section** (Tantangan & Hambatan)

**Test Scenario 1: Add Single Challenge**
```
1. Click accordion "Tantangan & Hambatan"
2. See default empty card
3. Fill in:
   - Category: Select "Operasional"
   - Impact: Select "High"
   - Status: Select "Ongoing"
   - Description: Type "Keterlambatan pengiriman bahan baku"
4. Verify: Data appears in card
```

**Test Scenario 2: Add Multiple Challenges**
```
1. Click "Tambah Tantangan" button
2. New card appears below
3. Fill second card:
   - Category: "Sumber Daya"
   - Impact: "Medium"
   - Status: "Resolved"
   - Description: "Kekurangan tenaga distribusi"
4. Verify: Both cards visible, badge shows "2 items"
```

**Test Scenario 3: Delete Challenge**
```
1. Click trash icon on second card
2. Verify: Card removed
3. Verify: Badge shows "1 items"
```

**Test Scenario 4: Empty Challenge (should be filtered)**
```
1. Click "Tambah Tantangan"
2. Leave all fields empty
3. Submit form
4. Verify: Empty challenge NOT saved (filtered out)
```

---

#### **2. Achievements Section** (Pencapaian & Keberhasilan)

**Test Scenario 1: Add Achievement with Date**
```
1. Click accordion "Pencapaian & Keberhasilan"
2. Fill in:
   - Category: "Nutrisi"
   - Impact: "High"
   - Date: Select date from picker
   - Description: "50 anak menunjukkan peningkatan gizi"
3. Verify: Date picker works, data saved
```

**Test Scenario 2: Multiple Categories**
```
1. Add achievement: Category "Operasional"
2. Add achievement: Category "Kualitas"
3. Add achievement: Category "Efisiensi"
4. Verify: Badge shows "4 items" (including default)
```

---

#### **3. Recommendations Section** (Rekomendasi & Perbaikan)

**Test Scenario 1: With Estimated Cost**
```
1. Click accordion "Rekomendasi & Perbaikan"
2. Fill in:
   - Category: "Infrastruktur"
   - Priority: "High"
   - Timeline: "1 bulan"
   - Recommendation: "Tambah armada distribusi"
   - Estimated Cost: 50000000
3. Verify: Number input works, cost saved
```

**Test Scenario 2: Without Cost (Optional)**
```
1. Add recommendation
2. Fill all fields EXCEPT estimated cost
3. Verify: Form accepts without cost
4. Submit: Cost should be undefined in JSON
```

---

#### **4. Feedback Section** (Feedback & Masukan)

**Test Scenario 1: Different Sources**
```
1. Click accordion "Feedback & Masukan"
2. Add feedback from "Kepala Sekolah"
   - Type: "Positive"
   - Message: "Kualitas makanan sangat memuaskan"
3. Add feedback from "Orang Tua"
   - Type: "Suggestion"
   - Message: "Tambah variasi menu"
4. Verify: Both visible, badge shows "3 items"
```

**Test Scenario 2: With Follow-up**
```
1. Add feedback
2. Fill follow-up: "Review menu planning"
3. Verify: Optional field works
```

**Test Scenario 3: Without Follow-up**
```
1. Add feedback
2. Leave follow-up empty
3. Submit form
4. Verify: Follow-up undefined in JSON
```

---

## 📊 **Expected Data Structure**

### **After Submission, Database Should Have:**

```json
{
  "challenges": [
    {
      "category": "Operasional",
      "description": "Keterlambatan pengiriman bahan baku",
      "impact": "High",
      "status": "Ongoing"
    }
  ],
  
  "achievements": [
    {
      "category": "Nutrisi",
      "description": "50 anak menunjukkan peningkatan gizi",
      "impact": "High",
      "date": "2025-11-06"
    }
  ],
  
  "recommendations": [
    {
      "category": "Infrastruktur",
      "recommendation": "Tambah armada distribusi",
      "priority": "High",
      "timeline": "1 bulan",
      "estimatedCost": 50000000
    }
  ],
  
  "feedback": [
    {
      "source": "Kepala Sekolah",
      "type": "Positive",
      "message": "Kualitas makanan sangat memuaskan",
      "date": "2025-11-06",
      "followUp": "Continue current quality standards"
    }
  ]
}
```

---

## ✅ **Verification Checklist**

### **Step 5 Form Testing:**
- [ ] All 4 accordions expand/collapse correctly
- [ ] Badge counters update when adding/removing items
- [ ] All dropdown selects show correct options
- [ ] Date pickers work (HTML5 native)
- [ ] Number inputs accept only numbers
- [ ] Textareas accept multi-line text
- [ ] "Tambah" buttons add new cards
- [ ] Delete buttons remove cards (except last one)
- [ ] Empty items are filtered out
- [ ] Optional fields (cost, followUp) can be empty
- [ ] Form syncs to React Hook Form correctly
- [ ] Submit button works

### **After Submission:**
- [ ] Success message appears
- [ ] Redirected to monitoring list
- [ ] New report appears in list
- [ ] Click report → detail page loads

### **Detail Page (Refactored):**
- [ ] Header shows report title, period, reporter
- [ ] 4 stat cards display correctly
- [ ] Budget card: utilization %, allocated, utilized, savings
- [ ] Production card: efficiency %, meals, cost per meal
- [ ] Quality card: average score, metrics
- [ ] Attendance card: serving rate %, recipients, cost
- [ ] Tabs navigation works
- [ ] Beneficiaries tab shows metrics
- [ ] **Qualitative tab shows structured data:**
  - [ ] Challenges displayed in cards with category badges
  - [ ] Achievements displayed with dates
  - [ ] Recommendations with priority badges
  - [ ] Feedback organized by source

### **CRUD Operations:**
- [ ] Edit: Navigate to edit page
- [ ] Edit: Form pre-filled with existing data
- [ ] Edit: Step 5 shows existing items in cards
- [ ] Edit: Can add/remove items
- [ ] Edit: Save changes works
- [ ] Delete: Confirmation dialog appears
- [ ] Delete: Report removed from list

---

## 🐛 **Known Edge Cases to Test**

### **1. Empty Submission**
```
Scenario: Leave all Step 5 fields empty
Expected: Form accepts (all fields optional)
Result: challenges, achievements, recommendations, feedback = undefined
```

### **2. Mix of Empty and Filled**
```
Scenario: Add 3 items, fill only 1
Expected: Only filled item saved
Result: Array with 1 item (empty ones filtered)
```

### **3. Special Characters**
```
Scenario: Type special chars in description: "Test 'quotes' & "symbols""
Expected: Properly escaped in JSON
Result: No JSON parsing errors
```

### **4. Very Long Text**
```
Scenario: Type 1000+ characters in description
Expected: Textarea expands, no layout break
Result: Text saved completely, no truncation
```

### **5. Rapid Add/Delete**
```
Scenario: Rapidly click "Tambah" 10 times, then delete all but 1
Expected: No UI lag, state consistent
Result: 1 item remains, others deleted
```

---

## 🎯 **Success Criteria**

### **✅ PASS if:**
1. ✅ Can add multiple items per section
2. ✅ Can delete items (except last one)
3. ✅ Dropdowns show correct options
4. ✅ Date pickers work
5. ✅ Empty items filtered out
6. ✅ Optional fields can be empty
7. ✅ Form submits successfully
8. ✅ Data saved as structured JSON
9. ✅ Detail page displays data correctly
10. ✅ Edit page pre-fills existing data
11. ✅ No console errors
12. ✅ No TypeScript errors
13. ✅ Responsive on mobile
14. ✅ Professional UX

### **❌ FAIL if:**
- ❌ JSON syntax errors on submit
- ❌ Form doesn't sync to React Hook Form
- ❌ Empty items not filtered
- ❌ Console errors appear
- ❌ Data not saved correctly
- ❌ Detail page doesn't display data
- ❌ Edit page doesn't work
- ❌ UI breaks on mobile

---

## 📞 **Quick Commands**

### **Start Dev Server:**
```bash
npm run dev
```

### **Check TypeScript Errors:**
```bash
npm run type-check
```

### **Check Console:**
```bash
# In browser DevTools (F12)
# Look for errors in Console tab
# Check Network tab for API calls
```

### **Test URL:**
```
http://localhost:3000/program/[PROGRAM_ID]/monitoring/new
```

---

## 🎉 **Expected User Experience**

### **User Journey:**

```
User clicks "Buat Laporan Baru"
↓
Sees: "Step 1 of 5" with progress bar
↓
Fills Step 1-4 (basic info)
↓
Reaches Step 5: "Qualitative Analysis"
↓
Sees: Professional accordion interface
↓
Clicks: "Tantangan & Hambatan"
↓
Sees: One empty card with structured fields
↓
Fills: Category dropdown → "Operasional"
↓
Fills: Description → Types naturally
↓
Clicks: "Tambah Tantangan" → New card appears
↓
Fills: Second challenge
↓
Moves to: "Pencapaian & Keberhasilan"
↓
Adds: 2 achievements with dates
↓
Moves to: "Rekomendasi & Perbaikan"
↓
Adds: 1 recommendation with priority
↓
Moves to: "Feedback & Masukan"
↓
Adds: 2 feedback items from different sources
↓
Clicks: "Submit Report"
↓
Sees: Success message
↓
Redirected: To monitoring list
↓
Clicks: New report
↓
Sees: Professional detail page with structured data
↓
Thinks: "Wow! Ini sangat mudah dan professional!" 🎉
```

---

## 🚀 **Start Testing Now!**

1. Run dev server: `npm run dev`
2. Navigate to program monitoring
3. Click "Buat Laporan Baru"
4. **Focus on Step 5** - new dynamic forms
5. Test all scenarios above
6. Report any issues

**Good luck! 🍀**
