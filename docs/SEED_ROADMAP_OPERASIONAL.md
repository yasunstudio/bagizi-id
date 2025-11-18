# 🎯 ROADMAP: Seed Files Operasional SPPG

## 📋 Sesuai Copilot Instructions - Prisma Seed Architecture

### ✅ File yang SUDAH ADA (sesuai aturan):
1. `sppg-seed.ts` - SPPG entities ✅
2. `user-seed.ts` - Users & roles ✅  
3. `regional-seed.ts` - Indonesian regional data ✅
4. `nutrition-seed.ts` - Nutrition data ✅
5. `inventory-seed.ts` - Inventory items ✅

### 🎯 File yang HARUS DIBUAT/ENHANCE (sesuai aturan):

#### 1. **menu-seed.ts** (Menu and recipes)
**Status:** ✅ SUDAH ADA, perlu ENHANCE
**Isi:**
- ✅ NutritionMenu (basic info)
- ❌ MenuIngredient (link ke InventoryItem) - **HARUS DITAMBAH**
- ❌ RecipeStep (langkah memasak) - **HARUS DITAMBAH**
- ❌ MenuNutritionCalculation - **HARUS DITAMBAH**
- ❌ MenuCostCalculation - **HARUS DITAMBAH**

**Priority:** 🔴 **CRITICAL** - Menu tidak lengkap tanpa ingredients & recipe!

#### 2. **procurement-seed.ts** (Procurement data)
**Status:** ✅ SUDAH ADA, perlu ENHANCE
**Isi:**
- ✅ Supplier (basic)
- ✅ ProcurementPlan
- ✅ Procurement (orders)
- ✅ ProcurementItem
- ❌ ProcurementApprovalTracking - **HARUS DITAMBAH**
- ❌ ProcurementQualityControl - **HARUS DITAMBAH**

**Priority:** 🟡 MEDIUM

#### 3. **production-seed.ts** (Production data)
**Status:** ✅ SUDAH ADA, perlu ENHANCE
**Isi:**
- ✅ FoodProduction (basic)
- ❌ ProductionStockUsage (track ingredient usage) - **HARUS DITAMBAH**
- ❌ QualityControl - **HARUS DITAMBAH**

**Priority:** 🟡 MEDIUM

#### 4. **distribution-seed.ts** (Distribution data)
**Status:** ✅ SUDAH ADA, perlu ENHANCE
**Isi:**
- ✅ FoodDistribution (basic)
- ❌ DistributionIssue - **HARUS DITAMBAH**
- ❌ DistributionDelivery - **HARUS DITAMBAH**
- ❌ Vehicle data integration - **HARUS DITAMBAH**

**Priority:** 🟡 MEDIUM

#### 5. **demo-seed.ts** (Demo data)
**Status:** ⚠️ BARU DIBUAT, ADA ERROR
**Isi:**
- Integrates ALL above models for admin@demo.sppg.id
- Creates complete flow: MenuPlan → Assignments → Procurement → Production → Distribution

**Priority:** 🔴 **CRITICAL** - User needs this!

---

## 📐 EXECUTION PLAN

### PHASE 1: Fix menu-seed.ts (CRITICAL!)
**File:** `prisma/seeds/menu-seed.ts`

**Steps:**
1. ✅ Keep existing NutritionMenu creation
2. ➕ ADD MenuIngredient for each menu (8-12 ingredients per menu)
   - Link to InventoryItem (REQUIRED!)
   - quantity, preparationNotes, isOptional
3. ➕ ADD RecipeStep for each menu (5-8 steps per menu)
   - stepNumber, title, instruction, duration, temperature, equipment
4. ➕ ADD MenuNutritionCalculation (1 per menu)
   - calories, protein, carbohydrates, fat, fiber
5. ➕ ADD MenuCostCalculation (1 per menu)
   - ingredientCost, laborCost, overheadCost, totalCost

**Expected Output:**
```typescript
export async function seedMenu(
  prisma: PrismaClient,
  sppgs: Sppg[],
  users: User[]
): Promise<void> {
  // For each SPPG
  for (const sppg of sppgs) {
    // Create menus
    const menu = await prisma.nutritionMenu.create({...})
    
    // ✅ ADD: Create ingredients for this menu
    await prisma.menuIngredient.createMany({
      data: [
        { menuId: menu.id, inventoryItemId: berasItem.id, quantity: 120, ... },
        { menuId: menu.id, inventoryItemId: ayamItem.id, quantity: 100, ... },
        // ... 8-12 ingredients
      ]
    })
    
    // ✅ ADD: Create recipe steps
    await prisma.recipeStep.createMany({
      data: [
        { menuId: menu.id, stepNumber: 1, title: "Prep", instruction: "...", ... },
        { menuId: menu.id, stepNumber: 2, title: "Cook", instruction: "...", ... },
        // ... 5-8 steps
      ]
    })
    
    // ✅ ADD: Create nutrition calculation
    await prisma.menuNutritionCalculation.create({
      data: {
        menuId: menu.id,
        calories: 450,
        protein: 25,
        carbohydrates: 55,
        fat: 12,
        fiber: 5,
        // ... other nutrients
      }
    })
    
    // ✅ ADD: Create cost calculation
    await prisma.menuCostCalculation.create({
      data: {
        menuId: menu.id,
        ingredientCost: 10500,
        laborCost: 1000,
        overheadCost: 500,
        totalCost: 12000,
        // ...
      }
    })
  }
}
```

---

### PHASE 2: Enhance procurement-seed.ts
**File:** `prisma/seeds/procurement-seed.ts`

**Add:**
- ProcurementApprovalTracking (approval workflow)
- ProcurementQualityControl (QC checks on received items)

---

### PHASE 3: Enhance production-seed.ts
**File:** `prisma/seeds/production-seed.ts`

**Add:**
- ProductionStockUsage (link to ProcurementItem, track costs)
- QualityControl (temperature checks, hygiene, taste ratings)

---

### PHASE 4: Enhance distribution-seed.ts
**File:** `prisma/seeds/distribution-seed.ts`

**Add:**
- DistributionIssue (track problems during delivery)
- DistributionDelivery (individual school deliveries)
- Vehicle assignment integration

---

### PHASE 5: Fix demo-seed.ts
**File:** `prisma/seeds/demo-seed.ts`

**Fix TypeScript errors:**
- Remove invalid field references
- Use correct schema field names
- Link to enhanced models from Phase 1-4

---

## 🚀 IMMEDIATE NEXT ACTION

**START WITH:** `menu-seed.ts` enhancement (PHASE 1)

**Why?**
- User complaint: "dari menu saja tidak ada bahan baku dan tidak ada resep"
- MenuIngredient & RecipeStep are MISSING
- All other flows depend on complete menu data
- CRITICAL for admin@demo.sppg.id experience

**Command:**
```bash
# Read current menu-seed.ts
# Enhance with MenuIngredient + RecipeStep + Calculations
# Test with: npm run db:seed
```

---

## ✅ Success Criteria

**For each menu:**
- ✅ Has 8-12 MenuIngredient records
- ✅ Has 5-8 RecipeStep records
- ✅ Has 1 MenuNutritionCalculation record
- ✅ Has 1 MenuCostCalculation record
- ✅ All linked to valid InventoryItem records
- ✅ All data realistic and Indonesian cuisine

**For admin@demo.sppg.id:**
- ✅ Can see complete menu with ingredients
- ✅ Can see recipe steps
- ✅ Can see nutrition breakdown
- ✅ Can see cost breakdown
- ✅ Complete flow from Menu → Procurement → Production → Distribution works

---

## 📝 Notes

- **ONLY use files allowed by copilot instructions**
- **NO custom seed files** (like comprehensive-flow-seed.ts)
- **Follow upsert pattern** for idempotency
- **Return created entities** for dependent seeds
- **Indonesian cuisine focus** (Nasi Goreng, Ayam Bakar, etc.)
