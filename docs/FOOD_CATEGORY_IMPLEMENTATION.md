# Food Category Implementation - Enterprise Master Data

**Date**: November 3, 2025  
**Status**: ✅ Complete - Master Data Seed Ready  
**Type**: Shared Master Data (Non-Isolated)

---

## 📋 Overview

FoodCategory diimplementasikan sebagai **Master Data** yang shared across all SPPGs, bukan multi-tenant isolated. Pendekatan ini dipilih untuk standardisasi nasional dalam manajemen gizi.

---

## 🎯 Design Decision: Master Data vs Multi-Tenant

### ✅ **IMPLEMENTED: Master Data (Shared)**

**Alasan**:
1. **Standardisasi Gizi Nasional**: Kategori makanan harus mengikuti pedoman gizi Indonesia
2. **Konsistensi Pelaporan**: Semua SPPG pakai kategori sama → mudah aggregate & compare
3. **Maintenance Efisien**: Platform admin update sekali, semua SPPG dapat update
4. **Regulatory Compliance**: Sesuai pedoman Kemenkes RI untuk SPPG

**Karakteristik**:
- ❌ **NO `sppgId` field** - Shared across all SPPGs
- ✅ **Read-only untuk SPPG** - Hanya Platform Admin yang bisa CRUD
- ✅ **Hierarchical Structure** - 3 levels untuk detail classification
- ✅ **Reference Data** - Seperti `Allergen`, `NutritionStandard`

---

## 📊 Model Structure

### Database Schema

```prisma
model FoodCategory {
  id                  String         @id @default(cuid())
  categoryCode        String         @unique @db.VarChar(20)
  categoryName        String         @db.VarChar(100)
  categoryNameEn      String?        @db.VarChar(100)
  description         String?        @db.Text
  
  // Hierarchical Structure (3 levels max)
  parentId            String?
  parent              FoodCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children            FoodCategory[] @relation("CategoryHierarchy")
  
  // Nutritional Characteristics
  primaryNutrient     String?        // Protein, Karbohidrat, Vitamin, etc.
  servingSizeGram     Float?         // Recommended serving size
  dailyServings       Int?           // Recommended servings per day
  
  // UI Display
  colorCode           String?        @db.VarChar(7)  // Hex color
  iconName            String?        @db.VarChar(50) // Icon identifier
  sortOrder           Int            @default(0)
  
  // System
  isActive            Boolean        @default(true)
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
  
  // Relations (Optional - Menu & Inventory can link)
  inventoryItems      InventoryItem[]
  nutritionMenus      NutritionMenu[]
  
  @@index([parentId])
  @@index([categoryCode])
  @@index([isActive, sortOrder])
}
```

### Relations Updated

#### ✅ **InventoryItem** - UPDATED
```prisma
model InventoryItem {
  // ... existing fields
  category            InventoryCategory      // KEPT: Backward compatibility
  foodCategoryId      String?                // NEW: Optional relation
  foodCategory        FoodCategory?          @relation(fields: [foodCategoryId], references: [id])
  
  @@index([foodCategoryId])
}
```

**Note**: Dual system untuk transition period
- `category` (enum) → Legacy, tetap digunakan untuk filter cepat
- `foodCategoryId` (relation) → New, untuk detailed classification

#### ✅ **NutritionMenu** - UPDATED
```prisma
model NutritionMenu {
  // ... existing fields
  mealType                MealType              // KEPT: Breakfast, Lunch, etc.
  foodCategoryId          String?               // NEW: Optional relation
  foodCategory            FoodCategory?         @relation(fields: [foodCategoryId], references: [id])
  
  @@index([foodCategoryId])
}
```

**Use Case**: Menu "Nasi Gudeg Ayam" bisa di-assign ke:
- `mealType: LUNCH` (waktu makan)
- `foodCategoryId: MEAT-POULTRY` (kategori protein utama)

---

## 🗂️ Category Hierarchy (3 Levels)

### Level 1: Main Categories (9 groups)

1. **PROTEIN** - Sumber Protein (Red #E74C3C)
2. **CARBS** - Sumber Karbohidrat (Orange #F39C12)
3. **VEGGIES** - Sayuran (Green #27AE60)
4. **FRUITS** - Buah-buahan (Purple #9B59B6)
5. **DAIRY** - Produk Susu (Blue #3498DB)
6. **FATS** - Lemak & Minyak (Yellow #F1C40F)
7. **SEASONINGS** - Bumbu & Rempah (Brown #BA4A00)
8. **BEVERAGES** - Minuman (Light Blue #5DADE2)
9. **PROCESSED** - Makanan Olahan (Gray #85929E)

### Level 2: Sub-Categories (Examples)

**Under PROTEIN**:
- `PROTEIN-ANIMAL` - Protein Hewani
- `PROTEIN-PLANT` - Protein Nabati

**Under CARBS**:
- `STAPLE-FOODS` - Makanan Pokok (nasi, mie, roti)
- `TUBERS` - Umbi-umbian (singkong, ubi, kentang)

**Under VEGGIES**:
- `VEGGIES-GREEN` - Sayuran Hijau (bayam, kangkung, sawi)
- `VEGGIES-ROOT` - Sayuran Akar (wortel, lobak)
- `VEGGIES-CRUCIFEROUS` - Kubis-kubisan (brokoli, kembang kol)
- `VEGGIES-OTHER` - Lainnya (tomat, terong, buncis)

**Under FRUITS**:
- `FRUITS-CITRUS` - Buah Jeruk (jeruk, lemon)
- `FRUITS-TROPICAL` - Buah Tropis (pisang, mangga, pepaya)
- `FRUITS-BERRIES` - Buah Berry (strawberry, blueberry)
- `FRUITS-LOCAL` - Buah Lokal (apel, pir, anggur)

**Under DAIRY**:
- `MILK-LIQUID` - Susu Cair
- `YOGURT` - Yogurt
- `CHEESE` - Keju

### Level 3: Specific Types (Examples)

**Under PROTEIN-ANIMAL**:
- `MEAT-RED` - Daging Merah (sapi, kambing, kerbau)
- `MEAT-POULTRY` - Unggas (ayam, bebek)
- `SEAFOOD` - Ikan & Seafood
- `EGGS` - Telur

**Under PROTEIN-PLANT**:
- `LEGUMES` - Kacang-kacangan (kacang kedelai, merah, hijau)
- `SOY-PRODUCTS` - Olahan Kedelai (tempe, tahu, susu kedelai)

**Under STAPLE-FOODS**:
- `RICE` - Beras & Nasi (putih, merah, hitam)
- `NOODLES` - Mie & Pasta
- `BREAD` - Roti & Sereal

**Under SEASONINGS**:
- `SPICES-BASIC` - Bumbu Dasar (bawang, jahe, kunyit, lengkuas)
- `SPICES-DRY` - Rempah Kering (merica, pala, kayu manis, cengkeh)
- `CONDIMENTS` - Saus & Penyedap (kecap, saus tomat, MSG)

---

## 📦 Seed Data Summary

### Total Categories: ~45+ categories

**Breakdown by Level**:
- Level 1 (Main): 9 categories
- Level 2 (Sub): 20+ categories
- Level 3 (Detail): 15+ categories

**Key Features**:
1. ✅ **Hierarchical** - Parent-child relationships untuk drill-down
2. ✅ **Bilingual** - Indonesian & English names
3. ✅ **Nutritional Info** - Primary nutrient, serving size, daily servings
4. ✅ **UI Ready** - Color codes & icon names untuk display
5. ✅ **Sortable** - sortOrder field untuk custom arrangement
6. ✅ **Based on Standards** - Mengikuti Pedoman Gizi Seimbang Indonesia

**Indonesian Food Composition Standards**:
- Protein Sources: Hewani & Nabati
- Carbohydrate Sources: Staples & Tubers
- Vegetables: Green, Root, Cruciferous, Other
- Fruits: Citrus, Tropical, Berries, Local
- Dairy: Milk, Yogurt, Cheese
- Fats: Cooking Oils, Butter, Coconut Products
- Seasonings: Basic Spices, Dry Spices, Condiments
- Beverages: Juices, Tea, Coffee

---

## 🔒 Security & Access Control

### API Endpoints Architecture

#### SPPG API (Read-Only)
```typescript
GET /api/sppg/food-categories
  ✅ List all active categories (hierarchical)
  ✅ Filter by parent, level, primaryNutrient
  ✅ Used in: MenuForm, InventoryForm dropdowns
  ❌ NO POST/PUT/DELETE - Read-only access
```

#### Admin API (Full CRUD)
```typescript
GET    /api/admin/food-categories      // List all
POST   /api/admin/food-categories      // Create new
PUT    /api/admin/food-categories/:id  // Update
DELETE /api/admin/food-categories/:id  // Soft delete (isActive=false)

✅ Only accessible by PLATFORM_SUPERADMIN
✅ Audit log for all changes
✅ Used in: Admin dashboard → Master Data Management
```

### Permission Model

```typescript
// SPPG Users (All Roles)
hasPermission(role, 'READ') → ✅ Can view categories
hasPermission(role, 'WRITE') → ❌ Cannot modify categories

// Platform Admin
role === 'PLATFORM_SUPERADMIN' → ✅ Full CRUD access
  - Create new categories
  - Update existing
  - Soft delete (set isActive=false)
  - Reorder sortOrder
```

---

## 💡 Usage Examples

### 1. Menu Classification
```typescript
// Menu: Nasi Gudeg Ayam
{
  menuName: 'Nasi Gudeg Ayam',
  mealType: 'LUNCH',                    // Waktu makan
  foodCategoryId: 'MEAT-POULTRY'        // Kategori protein utama
}
```

### 2. Inventory Classification
```typescript
// Inventory: Ayam Kampung
{
  itemName: 'Ayam Kampung',
  category: 'MEAT',                      // Legacy enum (quick filter)
  foodCategoryId: 'MEAT-POULTRY',        // Detailed category
  unit: 'kg',
  // ... nutrition data
}
```

### 3. Dropdown in MenuForm
```typescript
<Select>
  <option value="">Pilih Kategori Makanan</option>
  <optgroup label="Protein Hewani">
    <option value="MEAT-RED">Daging Merah</option>
    <option value="MEAT-POULTRY">Unggas</option>
    <option value="SEAFOOD">Ikan & Seafood</option>
    <option value="EGGS">Telur</option>
  </optgroup>
  <optgroup label="Protein Nabati">
    <option value="LEGUMES">Kacang-kacangan</option>
    <option value="SOY-PRODUCTS">Olahan Kedelai</option>
  </optgroup>
  {/* ... more groups */}
</Select>
```

### 4. Reporting & Analytics
```typescript
// Menu Distribution by Food Category
const menusByCategory = await prisma.nutritionMenu.groupBy({
  by: ['foodCategoryId'],
  _count: true,
  where: {
    program: { sppgId: session.user.sppgId },
    isActive: true
  }
})

// Result: SPPG punya berapa menu di setiap kategori
// - MEAT-POULTRY: 15 menus
// - SEAFOOD: 8 menus
// - SOY-PRODUCTS: 12 menus
```

---

## 🎯 Benefits for SPPG Operations

### 1. Standardized Classification
- Semua SPPG pakai kategori yang sama
- Mudah compare menu antar SPPG
- National reporting konsisten

### 2. Better Menu Planning
- Filter menu by food category
- Ensure protein/carb/vegetable balance
- Visual representation dengan color codes

### 3. Inventory Management
- Classify ingredients by category
- Track stock by food group
- Procurement planning per category

### 4. Nutritional Analysis
- Group menus by primary nutrient
- Analyze if daily servings recommendations met
- Report compliance dengan pedoman gizi

### 5. Cost Analysis
- Track budget allocation per food category
- Compare prices across categories
- Identify cost-saving opportunities

---

## 🔄 Migration from Enum to FoodCategory

### Legacy System (Enum)
```typescript
enum InventoryCategory {
  MEAT
  VEGETABLE
  FRUIT
  GRAIN
  DAIRY
  SPICE
  OIL
  OTHER
}
```

**Limitations**:
- ❌ Only 8 broad categories
- ❌ No hierarchy
- ❌ No nutritional metadata
- ❌ Hard to extend

### New System (FoodCategory Table)
```typescript
// 45+ detailed categories
// 3-level hierarchy
// Rich metadata (nutrition, serving size, etc.)
// Easily extensible by admin
```

**Transition Strategy**:
1. ✅ **Keep enum** untuk backward compatibility
2. ✅ **Add foodCategoryId** as optional field
3. ✅ **Dual system** during transition
4. 🔄 **Gradual migration** as data updated
5. 📊 **Analytics** to track adoption

---

## 📝 Next Steps

### Immediate (Done ✅)
- [x] Create FoodCategory model in Prisma schema
- [x] Add relations to InventoryItem & NutritionMenu
- [x] Create comprehensive seed file (45+ categories)
- [x] Integrate into master seed script

### Short-term (To Do)
- [ ] Update MenuForm to include FoodCategory dropdown
- [ ] Update InventoryForm to include FoodCategory dropdown
- [ ] Create Admin UI for managing FoodCategory (CRUD)
- [ ] Add FoodCategory filter in Menu & Inventory lists
- [ ] Update existing menu/inventory records with foodCategoryId

### Long-term (Future)
- [ ] Deprecate InventoryCategory enum (after full migration)
- [ ] Add FoodCategory-based reporting & analytics
- [ ] Implement AI-powered category suggestions
- [ ] Integrate with national nutrition database

---

## 🧪 Testing Checklist

### Database
- [ ] Run seed: `npm run db:seed`
- [ ] Verify 45+ categories created
- [ ] Check hierarchical relationships (parent-child)
- [ ] Verify indexes created

### API
- [ ] Test SPPG GET endpoint (read-only)
- [ ] Test Admin CRUD endpoints (SUPERADMIN only)
- [ ] Verify permissions (SPPG cannot modify)
- [ ] Check audit logging for admin changes

### UI
- [ ] Food category dropdown in MenuForm
- [ ] Food category dropdown in InventoryForm
- [ ] Hierarchical display in dropdowns (optgroup)
- [ ] Color-coded category badges
- [ ] Icon display for each category

### Integration
- [ ] Create menu with foodCategoryId
- [ ] Create inventory with foodCategoryId
- [ ] Filter menus by food category
- [ ] Generate reports grouped by category

---

## 📚 References

### Standards & Guidelines
- **Pedoman Gizi Seimbang** - Kemenkes RI
- **Angka Kecukupan Gizi (AKG)** - Permenkes No. 28 Tahun 2019
- **Tabel Komposisi Pangan Indonesia (TKPI)** - Kemenkes RI
- **Food Composition Database** - FAO/INFOODS

### Related Documentation
- [Menu Module Complete Audit](./MENU_MODULE_COMPLETE_AUDIT.md)
- [Inventory Management Guide](./INVENTORY_MANAGEMENT_GUIDE.md)
- [Copilot Instructions - API Client Pattern](../.github/copilot-instructions.md)

---

**Implementation Date**: November 3, 2025  
**Status**: ✅ Ready for Integration  
**Next Action**: Test seed script & integrate UI dropdowns
