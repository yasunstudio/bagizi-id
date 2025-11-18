# 🗺️ Master Data Implementation Roadmap - SPPG Module

**Project**: Bagizi-ID Platform  
**Start Date**: November 3, 2025  
**Approach**: Phased implementation with incremental delivery  
**Strategy**: Build → Seed → Test → Deploy per phase

---

## 📋 Executive Summary

**Total Master Data Models**: 46 missing models  
**Implementation Phases**: 6 phases over 12 weeks  
**Estimated Effort**: 80-100 hours total  
**Delivery Model**: Incremental - Each phase delivers working features

---

## 🎯 Phase 1: Foundation Master Data (Week 1-2)

**Duration**: 2 weeks  
**Effort**: 16-20 hours  
**Priority**: 🔴 CRITICAL  
**Goal**: Enable core menu planning and inventory operations

### 📦 Deliverables (5 Models):

#### 1. **FoodCategory** - Food categorization system
**Files to create**:
- Schema: Add to `prisma/schema.prisma`
- Types: `src/types/master/food-category.types.ts`
- API: `src/app/api/sppg/master/food-categories/route.ts`
- Seed: `prisma/seeds/food-category-seed.ts`

**Features**:
- Hierarchical categories (parent-child)
- Indonesian + English names
- Nutritional metadata per category
- Default serving sizes

**Sample Data** (15 categories):
```
BAHAN_POKOK (Staples)
  - Nasi & Beras
  - Mie & Pasta
  - Roti & Tepung
PROTEIN_HEWANI (Animal Protein)
  - Daging (Beef, Chicken)
  - Ikan & Seafood
  - Telur & Susu
PROTEIN_NABATI (Plant Protein)
  - Kacang-kacangan
  - Tempe & Tahu
SAYURAN (Vegetables)
  - Sayuran Hijau
  - Sayuran Warna
BUAH (Fruits)
  - Buah Lokal
  - Buah Impor
BUMBU_REMPAH (Spices & Herbs)
MINYAK_LEMAK (Oils & Fats)
MINUMAN (Beverages)
```

---

#### 2. **UnitOfMeasure** - Standardized units with conversions
**Files to create**:
- Schema: Add to `prisma/schema.prisma`
- Types: `src/types/master/unit-measure.types.ts`
- API: `src/app/api/sppg/master/units/route.ts`
- Utils: `src/lib/unit-converter.ts`
- Seed: `prisma/seeds/unit-measure-seed.ts`

**Features**:
- Base units (kg, L, pcs)
- Conversion factors between units
- Unit type classification (WEIGHT, VOLUME, COUNT)
- Display formatting (Indonesian locale)

**Sample Data** (30 units):
```
WEIGHT:
  - kg (base), g (÷1000), ton (×1000)
  - ons (÷10), kuintal (×100)
VOLUME:
  - L (base), mL (÷1000)
  - galon (×3.785), gelas (÷5)
COUNT:
  - pcs (base), lusin (×12), kodi (×20)
  - karung, karton, pack
LENGTH:
  - m (base), cm (÷100), mm (÷1000)
```

**Utilities**:
```typescript
// src/lib/unit-converter.ts
export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): number

export function formatUnit(
  value: number,
  unit: string,
  locale: 'id' | 'en'
): string
```

---

#### 3. **MealType** - Convert enum to master table
**Files to modify**:
- Schema: Convert enum to model in `prisma/schema.prisma`
- Migration: Create migration script
- Types: `src/types/master/meal-type.types.ts`
- API: `src/app/api/sppg/master/meal-types/route.ts`
- Seed: `prisma/seeds/meal-type-seed.ts`

**Features**:
- Meal timing and characteristics
- Calorie targets per meal type
- Typical food combinations
- Age group variations

**Sample Data** (6 types):
```
1. SARAPAN (Breakfast)
   - Time: 06:00-09:00
   - Calories: 25% daily
   - Focus: Energy start

2. SNACK_PAGI (Morning Snack)
   - Time: 09:30-10:30
   - Calories: 10% daily
   - Focus: Light nutrition

3. MAKAN_SIANG (Lunch)
   - Time: 12:00-13:30
   - Calories: 35% daily
   - Focus: Main meal

4. SNACK_SORE (Afternoon Snack)
   - Time: 15:00-16:00
   - Calories: 10% daily
   - Focus: Energy boost

5. MAKAN_MALAM (Dinner)
   - Time: 18:00-20:00
   - Calories: 20% daily
   - Focus: Evening meal

6. SUSU_MALAM (Evening Milk)
   - Time: 20:00-21:00
   - Calories: 5% daily
   - Focus: Calcium & sleep
```

---

#### 4. **PortionSize** - Standard serving sizes
**Files to create**:
- Schema: Add to `prisma/schema.prisma`
- Types: `src/types/master/portion-size.types.ts`
- API: `src/app/api/sppg/master/portions/route.ts`
- Seed: `prisma/seeds/portion-size-seed.ts`

**Features**:
- Age group variations (2-5, 6-12, 13-18)
- Meal type adjustments
- Nutritional content per portion
- Container size recommendations

**Sample Data**:
```
BALITA (2-5 tahun):
  - Nasi: 100g, 130 kcal
  - Lauk: 50g, 80 kcal
  - Sayur: 50g, 20 kcal
  - Buah: 75g, 40 kcal

ANAK SD (6-12 tahun):
  - Nasi: 150g, 195 kcal
  - Lauk: 75g, 120 kcal
  - Sayur: 75g, 30 kcal
  - Buah: 100g, 55 kcal

REMAJA (13-18 tahun):
  - Nasi: 200g, 260 kcal
  - Lauk: 100g, 160 kcal
  - Sayur: 100g, 40 kcal
  - Buah: 125g, 70 kcal
```

---

#### 5. **QualityStandard** - Food quality criteria
**Files to create**:
- Schema: Add to `prisma/schema.prisma`
- Types: `src/types/master/quality-standard.types.ts`
- API: `src/app/api/sppg/master/quality/route.ts`
- Seed: `prisma/seeds/quality-standard-seed.ts`

**Features**:
- Visual, smell, taste, texture criteria
- Acceptance/rejection thresholds
- Testing methods by food type
- BPOM compliance standards

**Sample Data**:
```
BERAS (Rice):
  - Visual: Bersih, tidak berjamur, tidak berkutu
  - Smell: Tidak apek, tidak bau
  - Texture: Utuh, tidak patah >10%
  - Grade: Premium, Medium, Standard

DAGING AYAM (Chicken):
  - Visual: Warna putih kemerahan, tidak pucat
  - Smell: Segar, tidak amis berlebihan
  - Texture: Kenyal, tidak lembek
  - Temperature: ≤4°C saat diterima

SAYURAN HIJAU:
  - Visual: Segar, tidak layu, tidak menguning
  - Smell: Harum segar
  - Texture: Renyah, tidak lembek
  - Storage: Suhu 8-10°C
```

---

### 📊 Phase 1 Success Metrics:
- [ ] All 5 models in database with relationships
- [ ] Seed data for each model (Indonesian context)
- [ ] GET APIs returning data correctly
- [ ] Type definitions complete with strict typing
- [ ] Unit conversion utility working
- [ ] Zero TypeScript errors
- [ ] Basic documentation for each model

### 🧪 Phase 1 Testing Checklist:
- [ ] Can create menu item with food category
- [ ] Can add inventory with proper units
- [ ] Can convert between units (kg ↔ g ↔ ton)
- [ ] Can select meal type from database
- [ ] Can get portion size by age group
- [ ] Quality standards appear in QC forms

### 📝 Phase 1 Migration Script:
```bash
# Create and run migration
npm run db:generate
npm run db:migrate -- --name add_phase1_master_data

# Run seeds
npm run db:seed:phase1
```

---

## 🎯 Phase 2: Production & Operations (Week 3-4)

**Duration**: 2 weeks  
**Effort**: 16-20 hours  
**Priority**: 🔴 HIGH  
**Goal**: Enable production scheduling and quality control

### 📦 Deliverables (7 Models):

#### 6. **ProductionShift** - Work shift management
**Files**: Schema, Types, API, Seed

**Sample Data**:
```
SHIFT_PAGI (Morning):
  - 06:00-14:00 (8 hours)
  - Capacity: 100%
  - Break: 12:00-12:30
  - Staff: 10-15 people

SHIFT_SIANG (Afternoon):
  - 14:00-22:00 (8 hours)
  - Capacity: 80%
  - Break: 18:00-18:30
  - Staff: 8-12 people

SHIFT_MALAM (Night):
  - 22:00-06:00 (8 hours)
  - Capacity: 50%
  - Break: 02:00-02:30
  - Staff: 5-8 people
```

---

#### 7. **ProductionArea** - Kitchen zones
**Files**: Schema, Types, API, Seed

**Sample Data**:
```
AREA_PERSIAPAN (Prep Area):
  - Capacity: 200 kg/hour
  - Equipment: Tables, knives, peelers
  - Hygiene Level: Medium
  - Staff Required: 5

AREA_MEMASAK (Cooking Area):
  - Capacity: 150 kg/hour
  - Equipment: Stoves, ovens, steamers
  - Hygiene Level: High
  - Staff Required: 6

AREA_PLATING (Plating Area):
  - Capacity: 500 portions/hour
  - Equipment: Containers, scales
  - Hygiene Level: Very High
  - Staff Required: 8
```

---

#### 8. **StorageLocation** - Warehouse management
**Sample Data**: Cold storage, Dry storage, Freezer, Chemical storage

---

#### 9. **TemperatureStandard** - Cold chain requirements
**Sample Data**: Frozen (-18°C), Chilled (0-4°C), Cool (8-15°C), Ambient (15-25°C)

---

#### 10. **CookingMethod** - Cooking techniques
**Sample Data**: Steaming, Boiling, Frying, Baking, Grilling (with nutritional impact)

---

#### 11. **PackagingType** - Food containers
**Sample Data**: Kotak makan, Thermal bag, Plastik wrap, Paper bag (with capacity & cost)

---

#### 12. **InventoryGrade** - Quality grading
**Sample Data**: Grade A, B, C with price differentials

---

### 📊 Phase 2 Success Metrics:
- [ ] Can schedule production by shift
- [ ] Can assign production to specific areas
- [ ] Can track storage locations
- [ ] Temperature monitoring in place
- [ ] Cooking methods in recipe steps
- [ ] Packaging types in distribution

---

## 🎯 Phase 3: Distribution & Logistics (Week 5-6)

**Duration**: 2 weeks  
**Effort**: 14-18 hours  
**Priority**: 🟡 MEDIUM  
**Goal**: Optimize delivery routes and scheduling

### 📦 Deliverables (6 Models):

#### 13. **DeliveryRoute** - Optimized routes
**Features**: Route code, distance, estimated time, stop sequence

---

#### 14. **DeliveryTimeWindow** - School schedules
**Features**: Preferred times, blackout periods, special instructions

---

#### 15. **DistributionZone** - Geographic zones
**Features**: Zone codes, coverage areas, responsible teams

---

#### 16. **ContainerType** - Transport containers
**Features**: Insulated boxes, thermal bags, capacity, temperature retention

---

#### 17. **DefectType** - Product defects
**Features**: Major/minor/critical, action required, SOP reference

---

#### 18. **QualityInspectionType** - Inspection categories
**Features**: Incoming, in-process, final inspection protocols

---

### 📊 Phase 3 Success Metrics:
- [ ] Routes optimized with time estimates
- [ ] Delivery windows prevent late deliveries
- [ ] Zone-based team assignment working
- [ ] Container tracking by type
- [ ] Defect classification standardized

---

## 🎯 Phase 4: Financial & Compliance (Week 7-8)

**Duration**: 2 weeks  
**Effort**: 12-16 hours  
**Priority**: 🟡 MEDIUM  
**Goal**: Financial tracking and regulatory compliance

### 📦 Deliverables (6 Models):

#### 19. **TaxRate** - Tax configuration
**Sample Data**: PPN 11%, PPh 22 1.5%, PPh 23 2%, Tax-exempt items

---

#### 20. **CostCenter** - Budget allocation
**Sample Data**: Procurement, Production, Distribution, Overhead

---

#### 21. **BudgetCategory** - Expense classification
**Sample Data**: Fixed costs, Variable costs, Capital expenditure

---

#### 22. **ProcurementMethod** - Purchasing methods
**Sample Data**: Direct purchase, Tender, E-catalog (with thresholds)

---

#### 23. **DeliveryTerm** - Incoterms
**Sample Data**: FOB, CIF, Ex-warehouse (with responsibility matrix)

---

#### 24. **PriceAgreementType** - Pricing models
**Sample Data**: Fixed price, Unit price, Lump sum, Price adjustment clauses

---

### 📊 Phase 4 Success Metrics:
- [ ] Tax automatically calculated on procurement
- [ ] Budget tracking by cost center
- [ ] Procurement method based on amount
- [ ] Delivery terms clear in PO
- [ ] Price agreements tracked

---

## 🎯 Phase 5: HR & Certification (Week 9-10)

**Duration**: 2 weeks  
**Effort**: 12-14 hours  
**Priority**: 🟢 LOW-MEDIUM  
**Goal**: Staff competency and certification tracking

### 📦 Deliverables (5 Models):

#### 25. **SkillCategory** - Job skills taxonomy
**Sample Data**: Cooking, Nutrition, Admin, Logistics (with competency levels)

---

#### 26. **CertificationType** - Professional certifications
**Sample Data**: Food handler, Halal, Nutritionist, Safety training

---

#### 27. **WorkShiftType** - Shift templates
**Sample Data**: Shift patterns, rotation schedules, overtime rules

---

#### 28. **DietaryRestriction** - Medical/religious restrictions
**Sample Data**: Halal, Vegetarian, Vegan, Gluten-free, Diabetic, Allergies

---

#### 29. **NutritionGuideline** - National standards
**Sample Data**: AKG 2019, WHO recommendations, Special conditions

---

### 📊 Phase 5 Success Metrics:
- [ ] Staff skills tracked and certified
- [ ] Certificate expiry alerts working
- [ ] Shift scheduling optimized
- [ ] Dietary restrictions enforced in menus
- [ ] Nutrition guidelines compliance

---

## 🎯 Phase 6: Reporting & Enhancement (Week 11-12)

**Duration**: 2 weeks  
**Effort**: 10-12 hours  
**Priority**: 🟢 LOW  
**Goal**: Advanced reporting and nice-to-have features

### 📦 Deliverables (7 Models):

#### 30. **ReportTemplate** - Standard reports
**Sample Data**: Daily, Weekly, Monthly templates with calculations

---

#### 31. **KPIDefinition** - Performance indicators
**Sample Data**: Delivery on-time %, Food waste %, Quality acceptance rate

---

#### 32. **SppgType** - Organization categories
**Sample Data**: School, Hospital, Corporate, Government

---

#### 33. **CuisineType** - Culinary categories
**Sample Data**: Indonesian, Western, Chinese, Japanese (regional variations)

---

#### 34. **MenuTheme** - Thematic categories
**Sample Data**: Traditional, Modern, Fusion, Seasonal, Educational

---

#### 35. **RecipeDifficulty** - Complexity levels
**Sample Data**: Easy, Medium, Hard (with time & skill requirements)

---

#### 36. **FoodSafetyCertificateType** - Certificates
**Sample Data**: Halal MUI, BPOM, SNI, ISO 22000, GMP

---

### 📊 Phase 6 Success Metrics:
- [ ] Standard reports generated automatically
- [ ] KPI dashboard shows performance
- [ ] SPPG categorization complete
- [ ] Cuisine types enhance menu variety
- [ ] Recipe difficulty helps planning

---

## 📅 Timeline Overview

```
Week 1-2:   Phase 1 - Foundation Master Data ████████
Week 3-4:   Phase 2 - Production & Operations ████████
Week 5-6:   Phase 3 - Distribution & Logistics ██████
Week 7-8:   Phase 4 - Financial & Compliance ██████
Week 9-10:  Phase 5 - HR & Certification █████
Week 11-12: Phase 6 - Reporting & Enhancement ████
```

**Total Duration**: 12 weeks (3 months)  
**Total Effort**: 80-100 hours  
**Models Implemented**: 36 of 46 critical models

---

## 🚀 Implementation Workflow (Per Model)

### Step 1: Schema Design (30 min)
```prisma
// prisma/schema.prisma
model ModelName {
  id          String   @id @default(cuid())
  // fields...
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // relations
}
```

### Step 2: Create Migration (10 min)
```bash
npx prisma migrate dev --name add_model_name
```

### Step 3: Type Definitions (20 min)
```typescript
// src/types/master/model-name.types.ts
export interface ModelNameResponse {
  id: string
  // fields...
}

export interface ModelNameInput {
  // input fields...
}
```

### Step 4: API Endpoint (45 min)
```typescript
// src/app/api/sppg/master/model-name/route.ts
export async function GET(request: NextRequest) {
  // Implementation
}

export async function POST(request: NextRequest) {
  // Implementation
}
```

### Step 5: Seed Data (30 min)
```typescript
// prisma/seeds/model-name-seed.ts
export async function seedModelName(prisma: PrismaClient) {
  await prisma.modelName.createMany({
    data: [/* seed data */]
  })
}
```

### Step 6: Testing (30 min)
- Manual API testing
- Data validation
- Integration testing

**Total per model**: ~2.5 hours average

---

## 🎯 Phase Completion Checklist

### Before Starting Each Phase:
- [ ] Review phase deliverables
- [ ] Prepare seed data (Indonesian context)
- [ ] Create feature branch: `feature/master-data-phase-X`
- [ ] Update todo list

### During Implementation:
- [ ] Follow schema design patterns
- [ ] Maintain strict TypeScript typing
- [ ] Write comprehensive seed data
- [ ] Test each API endpoint
- [ ] Document model relationships

### After Completing Each Phase:
- [ ] Run all migrations successfully
- [ ] Verify seed data loaded correctly
- [ ] Test API endpoints with Postman/Insomnia
- [ ] Check TypeScript compilation (zero errors)
- [ ] Update documentation
- [ ] Create PR and merge to main
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Move to production

---

## 📊 Progress Tracking

### Phase 1: Foundation ⏳ NOT STARTED
- [ ] FoodCategory
- [ ] UnitOfMeasure
- [ ] MealType (convert enum)
- [ ] PortionSize
- [ ] QualityStandard

### Phase 2: Production ⏳ NOT STARTED
- [ ] ProductionShift
- [ ] ProductionArea
- [ ] StorageLocation
- [ ] TemperatureStandard
- [ ] CookingMethod
- [ ] PackagingType
- [ ] InventoryGrade

### Phase 3: Distribution ⏳ NOT STARTED
- [ ] DeliveryRoute
- [ ] DeliveryTimeWindow
- [ ] DistributionZone
- [ ] ContainerType
- [ ] DefectType
- [ ] QualityInspectionType

### Phase 4: Financial ⏳ NOT STARTED
- [ ] TaxRate
- [ ] CostCenter
- [ ] BudgetCategory
- [ ] ProcurementMethod
- [ ] DeliveryTerm
- [ ] PriceAgreementType

### Phase 5: HR ⏳ NOT STARTED
- [ ] SkillCategory
- [ ] CertificationType
- [ ] WorkShiftType
- [ ] DietaryRestriction
- [ ] NutritionGuideline

### Phase 6: Reporting ⏳ NOT STARTED
- [ ] ReportTemplate
- [ ] KPIDefinition
- [ ] SppgType
- [ ] CuisineType
- [ ] MenuTheme
- [ ] RecipeDifficulty
- [ ] FoodSafetyCertificateType

---

## 🎯 Next Immediate Steps

### This Week (Week 1):
1. **Day 1-2**: Implement FoodCategory + UnitOfMeasure
2. **Day 3-4**: Convert MealType enum to table
3. **Day 5**: Implement PortionSize
4. **Day 6-7**: Implement QualityStandard + Testing

### Success Criteria Week 1:
- ✅ All Phase 1 models in database
- ✅ Seed data loaded and tested
- ✅ APIs returning correct data
- ✅ Zero TypeScript errors
- ✅ Basic integration working

---

## 📚 Resources & References

### Documentation:
- [Copilot Instructions](.github/copilot-instructions.md)
- [Master Data Analysis](./MASTER_DATA_ANALYSIS_SPPG.md)
- [Prisma Schema](../prisma/schema.prisma)

### Standards:
- **AKG 2019**: Angka Kecukupan Gizi Indonesia
- **BPOM**: Indonesian Food & Drug Authority
- **SNI**: Indonesian National Standards
- **Halal MUI**: Indonesian Halal Certification

### Tools:
- Prisma Studio for data viewing
- Postman for API testing
- VS Code for development
- Docker for local database

---

**Status**: 📋 Roadmap approved - Ready to start Phase 1  
**Next Action**: Begin implementation of FoodCategory model  
**Estimated Start**: November 4, 2025  
**Estimated Completion**: January 26, 2026 (12 weeks)
