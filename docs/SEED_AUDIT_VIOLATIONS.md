# Seed Files Audit - Copilot-Instructions Violations

**Date**: January 19, 2025  
**Total Files**: 85 seed files  
**Status**: 🔴 MAJOR VIOLATIONS - Complete refactoring required

---

## ✅ Copilot-Instructions Pattern

```
prisma/seeds/{model}-seed.ts

Example:
- nutrition-program-seed.ts   → Creates NutritionProgram entities
- nutrition-menu-seed.ts       → Creates NutritionMenu entities
- menu-ingredient-seed.ts      → Creates MenuIngredient entities
```

**Each model = ONE dedicated seed file**

---

## 🔴 CRITICAL Violations

### 1. **menu-seed.ts** (3211 lines) ❌
**Problem**: Monolithic file containing 6+ models in one file
**Contains**:
- NutritionProgram (should be `nutrition-program-seed.ts`)
- NutritionMenu (should be `nutrition-menu-seed.ts`)
- MenuIngredient (should be `menu-ingredient-seed.ts`)
- RecipeStep (should be `recipe-step-seed.ts`)
- MenuNutritionCalculation (should be `menu-nutrition-calculation-seed.ts`)
- MenuCostCalculation (should be `menu-cost-calculation-seed.ts`)

**Impact**: HIGH - Violates single responsibility, hard to maintain
**Action**: Split into 6 separate files

### 2. **hrd-seed.ts** ❌
**Problem**: Should be `employee-seed.ts` (model name is Employee, not HRD)
**Action**: Rename + refactor

### 3. **regional-seed.ts** ❌
**Problem**: Contains 4 models (Province, Regency, District, Village)
**Action**: Split into:
- `province-seed.ts`
- `regency-seed.ts`
- `district-seed.ts`
- `village-seed.ts`

### 4. **nutrition-seed.ts** ❌
**Problem**: Should be `nutrition-standard-seed.ts` or `nutrition-requirement-seed.ts`
**Action**: Rename to match actual model name

### 5. **distribution-seed.ts** ❌
**Problem**: Should be `food-distribution-seed.ts` (model is FoodDistribution)
**Action**: Rename

### 6. **production-seed.ts** ❌
**Problem**: Should be `food-production-seed.ts` (model is FoodProduction)
**Action**: Rename

### 7. **equipment-seed.ts** ❌
**Problem**: Should be `kitchen-equipment-seed.ts` (model is KitchenEquipment)
**Action**: Rename

### 8. **vehicles-seed.ts** ❌
**Problem**: Plural form, should be `vehicle-seed.ts`
**Action**: Rename

### 9. **suppliers-seed.ts** ❌
**Problem**: Plural form, should be `supplier-seed.ts`
**Action**: Rename

---

## ⚠️ Incomplete Data Issues

### Missing Target Group Menus
**Current**: Only LUNCH-001 to LUNCH-005 and SNACK-001 to SNACK-005 have ingredients (10 menus)  
**Missing**: 11 menus for specific target groups:
- ANAK-SD-001, ANAK-SD-002 (School Children)
- BALITA-001, BALITA-002 (Toddlers)
- BUMIL-001, BUMIL-002 (Pregnant Women)
- BUSUI-001, BUSUI-002 (Breastfeeding Mothers)
- LANSIA-001 (Elderly)
- REMAJA-001 (Teenagers)
- UNIVERSAL-001 (Universal Menu)

**Result**: 53% of menus have NO ingredients in database

---

## ⚠️ Non-Purwakarta Data

Many seed files use generic/fictional data instead of real Purwakarta regional data:
- Supplier addresses not in Purwakarta
- School names not matching real schools
- Generic menu names instead of local recipes
- No reference to Purwakarta's 15 kecamatan, 183 desa

---

## 📋 Refactoring Plan

### Phase 1: Core Infrastructure (Priority 1)
1. ✅ Backup all existing seeds → `seeds-backup/`
2. 🔄 Delete current `prisma/seeds/*.ts` files
3. ✅ Create clean seed structure following copilot-instructions

### Phase 2: Core Models (Priority 2)
4. `sppg-seed.ts` - Demo SPPG Purwakarta 2025
5. `province-seed.ts` - Jawa Barat
6. `regency-seed.ts` - Kabupaten Purwakarta
7. `district-seed.ts` - 15 Kecamatan Purwakarta
8. `village-seed.ts` - 183 Desa Purwakarta
9. `user-seed.ts` - Demo users (ahli gizi, admin, etc.)

### Phase 3: Menu Domain (Priority 3)
10. `food-category-seed.ts` - Indonesian food categories
11. `inventory-item-seed.ts` - ~100 items with Purwakarta pricing
12. `supplier-seed.ts` - Local Purwakarta suppliers
13. `nutrition-program-seed.ts` - 2 programs (PMAS + PMT)
14. `nutrition-menu-seed.ts` - **21 menus** (not 10!)
15. `menu-ingredient-seed.ts` - All 21 menus
16. `recipe-step-seed.ts` - Indonesian recipes
17. `menu-nutrition-calculation-seed.ts`
18. `menu-cost-calculation-seed.ts`

### Phase 4: Operations (Priority 4)
19. `beneficiary-organization-seed.ts` - Real Purwakarta schools/posyandu
20. `program-beneficiary-enrollment-seed.ts` - Enrollments
21. `procurement-plan-seed.ts` - Monthly procurement
22. `procurement-seed.ts` - Orders
23. `procurement-item-seed.ts` - Order items
24. `food-production-seed.ts` - Production batches
25. `food-distribution-seed.ts` - Distributions
26. `distribution-delivery-seed.ts` - Deliveries

### Phase 5: Master Seed Orchestrator
27. Refactor `prisma/seed.ts` with correct dependency order

---

## 🎯 Success Criteria

- ✅ Every model has dedicated `{model-name}-seed.ts` file
- ✅ All 21 menus have ingredients and recipes
- ✅ 100% Purwakarta regional data (15 kecamatan, 183 desa)
- ✅ Real local suppliers and realistic pricing
- ✅ Zero copilot-instructions violations
- ✅ Clean, maintainable, enterprise-grade seed architecture

---

## 📊 Estimated Effort

- Phase 1: 10 minutes (backup + cleanup)
- Phase 2: 30 minutes (core models)
- Phase 3: 2 hours (menu domain - 21 menus with ingredients)
- Phase 4: 1 hour (operations)
- Phase 5: 20 minutes (master orchestrator)

**Total**: ~4 hours for complete refactoring

---

**Next Step**: Clean seed directory and start Phase 2 (Core Models)
