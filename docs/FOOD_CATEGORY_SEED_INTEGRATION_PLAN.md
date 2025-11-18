# Food Category Seed Integration - Action Plan

**Date**: November 3, 2025  
**Status**: 🔄 In Progress - Seed Files Need Update

---

## 📋 Analysis Results

### Files That Need Update

#### ✅ **Already Has FoodCategory Seed**
- [x] `prisma/seeds/food-category-seed.ts` - 45+ categories created
- [x] `prisma/seed.ts` - Integrated into master seed (Step 3b)

#### ❌ **Missing FoodCategory Integration**
- [ ] `prisma/seeds/inventory-seed.ts` - ~50+ inventory items (NO foodCategoryId yet)
- [ ] `prisma/seeds/menu-seed.ts` - ~10 menus (NO foodCategoryId yet)

---

## 🎯 Update Strategy

### Option 1: Manual Mapping (High Quality) ⭐ RECOMMENDED

**Approach**: Update seed files dengan mapping manual untuk setiap item

**Pros**:
- ✅ Accurate category assignment
- ✅ High quality data
- ✅ Educational (understand food classification)

**Cons**:
- ⏱️ Time consuming (~2-3 hours)
- 📝 Need to review each item carefully

### Option 2: Auto-Mapping (Fast but Less Accurate)

**Approach**: Create mapping logic based on item name/category enum

**Pros**:
- ⚡ Fast implementation (~30 minutes)
- 🤖 Automated process

**Cons**:
- ⚠️ May have incorrect mappings
- 🔍 Need manual verification after
- ❌ Less educational

---

## 📊 Scope of Work

### 1. Inventory Items Update

**File**: `prisma/seeds/inventory-seed.ts`

**Items to Update**: ~50+ items across categories:
- KARBOHIDRAT (7 items): Rice, noodles, bread, tubers
- DAGING (10+ items): Beef, chicken, fish, eggs
- SAYURAN (10+ items): Various vegetables
- BUAH (5+ items): Various fruits
- SUSU (3+ items): Milk products
- MINYAK (2+ items): Cooking oils
- BUMBU (10+ items): Spices and seasonings
- LAINNYA (misc items)

**Example Mapping**:
```typescript
// BEFORE
{
  itemName: 'Beras Merah',
  itemCode: 'BRM-001',
  category: 'KARBOHIDRAT',  // Enum only
  // ... other fields
}

// AFTER
{
  itemName: 'Beras Merah',
  itemCode: 'BRM-001',
  category: 'KARBOHIDRAT',              // Keep enum
  foodCategoryId: null,                 // Will be linked after categories created
  // ... other fields
}

// Then in seed logic:
const riceCategory = await prisma.foodCategory.findUnique({
  where: { categoryCode: 'RICE' }
})

// Update with actual ID
{
  itemName: 'Beras Merah',
  itemCode: 'BRM-001',
  category: 'KARBOHIDRAT',
  foodCategoryId: riceCategory.id,      // Link to FoodCategory
  // ...
}
```

### 2. Menu Items Update

**File**: `prisma/seeds/menu-seed.ts`

**Items to Update**: ~10 menus

**Example Mapping**:
```typescript
// BEFORE
{
  menuName: 'Nasi Gudeg Ayam Telur',
  menuCode: 'PWK-PMAS-001',
  mealType: 'MAKAN_SIANG',  // Only meal time
  // ... other fields
}

// AFTER
{
  menuName: 'Nasi Gudeg Ayam Telur',
  menuCode: 'PWK-PMAS-001',
  mealType: 'MAKAN_SIANG',
  foodCategoryId: poultryCategory.id,  // Main protein category
  // ... other fields
}
```

**Category Assignment Logic**:
- Look at main protein source in menu
- If multiple proteins, choose dominant one
- Examples:
  - "Nasi Gudeg **Ayam** Telur" → `MEAT-POULTRY` (ayam is main)
  - "Pepes **Ikan** Nila" → `SEAFOOD` (ikan is main)
  - "Sayur Asem **Tempe**" → `SOY-PRODUCTS` (tempe is protein)

---

## 🔧 Implementation Steps

### Step 1: Update Inventory Seed (Option 1 - Manual)

**Process**:
1. Read all inventory items in seed file
2. For each item, determine appropriate FoodCategory:
   - Beras → `RICE`
   - Ayam → `MEAT-POULTRY`
   - Ikan → `SEAFOOD`
   - Telur → `EGGS`
   - Tempe/Tahu → `SOY-PRODUCTS`
   - Sayuran hijau → `VEGGIES-GREEN`
   - Wortel → `VEGGIES-ROOT`
   - Buah jeruk → `FRUITS-CITRUS`
   - Pisang → `FRUITS-TROPICAL`
   - Susu → `MILK-LIQUID`
   - Minyak goreng → `OILS-COOKING`
   - Bawang → `SPICES-BASIC`
   - Kecap → `CONDIMENTS`
3. Add category fetch logic at start of seed
4. Add `foodCategoryId` field to each item
5. Test seed script

### Step 2: Update Menu Seed

**Process**:
1. Read all menu definitions
2. Analyze each menu's main protein/ingredient
3. Assign appropriate category
4. Add category fetch logic
5. Add `foodCategoryId` field to menus
6. Test seed script

### Step 3: Test Complete Seed

```bash
# Reset and reseed database
npm run db:reset

# Verify:
# 1. All food categories created (45+)
# 2. All inventory items have foodCategoryId
# 3. All menus have foodCategoryId
# 4. Relations work correctly
```

---

## 📝 Manual Mapping Reference

### Inventory Item → FoodCategory Mapping

**KARBOHIDRAT (Carbs)**:
- Beras Merah/Putih/Hitam → `RICE`
- Mie Telur/Kering → `NOODLES`
- Roti Tawar → `BREAD`
- Singkong → `TUBERS`
- Kentang → `TUBERS`
- Ubi Jalar → `TUBERS`

**DAGING (Meat)**:
- Daging Sapi → `MEAT-RED`
- Ayam Kampung/Broiler → `MEAT-POULTRY`
- Ikan Nila/Lele/Tongkol → `SEAFOOD`
- Telur Ayam/Puyuh → `EGGS`

**PROTEIN NABATI**:
- Tempe → `SOY-PRODUCTS`
- Tahu → `SOY-PRODUCTS`
- Kacang Merah → `LEGUMES`
- Kacang Hijau → `LEGUMES`
- Kacang Tanah → `LEGUMES`

**SAYURAN (Vegetables)**:
- Bayam, Kangkung, Sawi → `VEGGIES-GREEN`
- Wortel → `VEGGIES-ROOT`
- Brokoli, Kembang Kol → `VEGGIES-CRUCIFEROUS`
- Tomat, Terong, Buncis → `VEGGIES-OTHER`

**BUAH (Fruits)**:
- Jeruk → `FRUITS-CITRUS`
- Pisang, Mangga, Pepaya → `FRUITS-TROPICAL`
- Apel, Pir → `FRUITS-LOCAL`

**SUSU (Dairy)**:
- Susu Segar/UHT → `MILK-LIQUID`
- Keju → `CHEESE`

**MINYAK (Fats)**:
- Minyak Goreng → `OILS-COOKING`
- Margarin → `BUTTER`
- Santan → `COCONUT`

**BUMBU (Seasonings)**:
- Bawang Merah/Putih, Jahe, Kunyit → `SPICES-BASIC`
- Merica, Pala → `SPICES-DRY`
- Kecap, Saus Tomat → `CONDIMENTS`

### Menu → FoodCategory Mapping

**By Main Protein**:
- "Nasi Gudeg **Ayam** Telur" → `MEAT-POULTRY`
- "Pepes **Ikan** Nila Daun Singkong" → `SEAFOOD`
- "Soto **Ayam** Kampung" → `MEAT-POULTRY`
- "Nasi Tim **Ikan** Sayur Wortel" → `SEAFOOD`
- "Sayur Asem **Tempe**" → `SOY-PRODUCTS`
- "Oseng **Tempe** Kacang Panjang" → `SOY-PRODUCTS`

---

## ⏱️ Time Estimate

### Option 1 (Manual - Recommended):
- Inventory mapping: **1.5 hours** (50+ items)
- Menu mapping: **30 minutes** (10 menus)
- Testing & fixes: **30 minutes**
- **Total: ~2.5 hours**

### Option 2 (Auto-mapping):
- Write mapping logic: **20 minutes**
- Test & fix errors: **30 minutes**
- Manual verification: **20 minutes**
- **Total: ~1 hour** (but lower quality)

---

## 🚀 Next Actions

### Immediate (Choose One):

**Option A: Manual Update (High Quality)**
1. Update `inventory-seed.ts` manually dengan mapping table
2. Update `menu-seed.ts` manually
3. Test complete seed script
4. Verify data quality

**Option B: Auto-Mapping (Fast)**
1. Create mapping function based on item name/category
2. Update both seed files with function
3. Run seed and verify
4. Manual fix any incorrect mappings

### Recommended: **Option A** for enterprise-grade quality

---

## 📊 Success Criteria

After update, verify:
- [ ] All 45+ food categories exist
- [ ] All inventory items have `foodCategoryId` (not null)
- [ ] All menus have `foodCategoryId` (not null)
- [ ] Categories correctly assigned (spot check 10 items)
- [ ] Relations work (query by foodCategory)
- [ ] Seed script runs without errors

---

## 🤔 Question for User

**Mau pilih yang mana?**

### Option A: Manual Mapping (2.5 hours) ⭐
- Highest quality
- Most accurate
- Educational
- **Saya akan mapping satu per satu dengan benar**

### Option B: Auto-Mapping (1 hour)
- Faster
- Automated
- May need fixes
- **Saya buat logic otomatis, lalu verify**

**Atau mau saya mulai dengan sample (5 items) dulu untuk demo?**

---

**Status**: Waiting for decision on approach  
**Next Step**: Update seed files based on chosen option
