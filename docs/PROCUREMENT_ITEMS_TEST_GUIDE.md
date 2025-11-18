# 🧪 Procurement Items - Quick Test Guide

## Test URL
```
http://localhost:3000/procurement/orders/[any-order-id]
```

## What You Should See

### 1️⃣ Order Detail Page
- ✅ Standard order information at top
- ✅ New **"Item Management"** card
- ✅ Two tabs: **"Items (X)"** and **"Receiving & QC"**

### 2️⃣ Items Tab (Default View)
**Visual Elements:**
```
┌─────────────────────────────────────────────────┐
│ 📦 Item Management                              │
│    Kelola item yang dipesan...                  │
├─────────────────────────────────────────────────┤
│ [Items (5)] [Receiving & QC]                    │ ← Tabs
├─────────────────────────────────────────────────┤
│                                                  │
│ 📦 Items List (5)                               │
│                                                  │
│ [Search...] [Category ▼] [Status ▼] [Quality ▼]│ ← Filters
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ Item Name  │ Category │ Qty │ Price │ ⋯ │   │ ← Table
│ ├──────────────────────────────────────────┤   │
│ │ Beras      │ GRAINS   │ 100 │ Rp... │ ⋯ │   │
│ │ Ayam       │ PROTEIN  │ 50  │ Rp... │ ⋯ │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ Showing 1 to 5 of 5 items [Previous] [Next]    │ ← Pagination
└─────────────────────────────────────────────────┘
```

### 3️⃣ Receiving & QC Tab
**Status-Based Messages:**

**For ORDERED/PARTIALLY_RECEIVED:**
```
┌─────────────────────────────────────────────────┐
│        📦                                        │
│   Receiving & Quality Control                   │
│                                                  │
│   Terima barang dan lakukan quality control     │
│   di tab ini                                     │
└─────────────────────────────────────────────────┘
```

**For Other Statuses:**
```
┌─────────────────────────────────────────────────┐
│        📦                                        │
│   Receiving & Quality Control                   │
│                                                  │
│   Receiving hanya tersedia untuk order dengan   │
│   status ORDERED atau PARTIALLY_RECEIVED        │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Interactive Elements to Test

### Search Bar
- Type item name → Table filters instantly
- Clear search → Shows all items

### Category Filter
- Select category (GRAINS, PROTEIN, etc.)
- Items filtered by category
- "All" option to reset

### Acceptance Status Filter
- Options: All, Accepted, Rejected
- Shows only items matching status

### Quality Issues Filter
- Options: All, Has Issues, No Issues
- Filters by quality status

### Column Headers
- Click any header (Item Name, Category, Quantity, etc.)
- Arrow appears showing sort direction
- Click again to reverse sort

### Actions Menu (⋯)
Each item row has dropdown with:
- 👁️ View Details
- ✏️ Edit Item
- 🗑️ Delete Item

---

## ⚡ Expected Behaviors

### On Page Load
1. Items tab selected by default
2. All items displayed
3. No filters active
4. Sorted by item name (default)

### On Filter Change
1. Table updates immediately
2. Pagination resets to page 1
3. Item count updates

### On Sort
1. Column header shows arrow
2. Items reorder instantly
3. Maintains current filters

### On Action Click
1. View → Shows item details
2. Edit → Opens edit dialog/form
3. Delete → Shows confirmation
4. After delete → Item removed, list refreshes

---

## 🐛 Common Issues & Fixes

### Issue: "Items not loading"
**Check:**
- Network tab for API call to `/api/sppg/procurement/items?orderId=...`
- Console for errors
- Order ID is valid

**Fix:**
- Verify order exists in database
- Check API endpoint is running
- Ensure user has permission

### Issue: "Tabs not switching"
**Check:**
- Click is registering (inspect element)
- No JavaScript errors in console

**Fix:**
- Hard refresh page (Cmd+Shift+R)
- Clear browser cache

### Issue: "Filters not working"
**Check:**
- Data is loaded (not empty state)
- Filter values match data fields

**Fix:**
- Try different filter combination
- Reset all filters and try again

### Issue: "Actions menu not opening"
**Check:**
- Click on three dots (⋯) button
- No z-index conflicts

**Fix:**
- Scroll page to ensure menu has space
- Try different browser

---

## 📊 Data Validation

### Expected Data Structure
Each item should have:
- ✅ Item name (from inventory)
- ✅ Category (GRAINS, PROTEIN, VEGETABLES, etc.)
- ✅ Ordered quantity (number)
- ✅ Received quantity (number, can be 0)
- ✅ Price per unit (currency)
- ✅ Total price (calculated)
- ✅ Acceptance status (boolean or null)
- ✅ Quality info (optional)

### Visual Indicators
- **Accepted items**: Green checkmark badge
- **Rejected items**: Red X badge
- **Pending items**: Yellow clock badge
- **Quality issues**: Warning icon

---

## 🎯 Success Criteria

✅ **All items display correctly**
- Name, category, quantities all show
- Prices formatted as currency (Rp)
- Status badges visible

✅ **Filters work**
- Search finds items by name
- Category filter shows correct items
- Status filters apply correctly

✅ **Sorting works**
- Click headers to sort
- Arrow indicates direction
- Data reorders correctly

✅ **Actions work**
- View/Edit/Delete available
- Clicking triggers correct action
- Confirmations appear for destructive actions

✅ **Tabs work**
- Click switches tab content
- Active tab highlighted
- Content loads for each tab

✅ **Responsive**
- Works on mobile (< 768px)
- Works on tablet (768-1024px)
- Works on desktop (> 1024px)
- No horizontal scroll

---

## 🚀 Quick Test Commands

### Start Dev Server
```bash
npm run dev
```

### Create Test Order (if needed)
```bash
# Via Prisma Studio
npm run db:studio
# Navigate to Procurement table
# Create a new order
```

### Check API Endpoints
```bash
# Get items for an order
curl http://localhost:3000/api/sppg/procurement/items?orderId=YOUR_ORDER_ID

# Get stats
curl http://localhost:3000/api/sppg/procurement/items/stats?orderId=YOUR_ORDER_ID
```

---

## 📝 Testing Checklist

### Visual Tests
- [ ] Items tab displays
- [ ] Receiving tab displays
- [ ] Tab switching works
- [ ] Item count shows in tab label
- [ ] All columns visible

### Functional Tests
- [ ] Search by item name
- [ ] Filter by category
- [ ] Filter by acceptance
- [ ] Filter by quality
- [ ] Sort by each column
- [ ] Pagination (if >10 items)

### Action Tests
- [ ] View item details
- [ ] Edit item (if canEdit=true)
- [ ] Delete item
- [ ] Confirmation dialogs appear
- [ ] Success/error toasts show

### Edge Cases
- [ ] Empty state (no items)
- [ ] Loading state
- [ ] Error state (API failure)
- [ ] Long item names
- [ ] Large quantities
- [ ] Zero/null values

---

## 🎓 Next Steps After Visual Verification

1. **API Integration Testing**
   - Test all CRUD operations
   - Verify data persistence
   - Check error handling

2. **E2E Workflow Testing**
   - Create order
   - Add items
   - Receive goods
   - QC workflow
   - Inventory sync

3. **Performance Testing**
   - Large datasets (100+ items)
   - Rapid filter changes
   - Concurrent user actions

4. **User Acceptance Testing**
   - Real user scenarios
   - Feedback collection
   - Usability improvements

---

**Testing Started**: [Date]  
**Testing Status**: [ ] Not Started | [ ] In Progress | [ ] Complete  
**Issues Found**: [Number]  
**Blockers**: [None / List]

