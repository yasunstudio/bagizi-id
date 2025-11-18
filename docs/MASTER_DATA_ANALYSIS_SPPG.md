# 📊 Master Data Analysis - SPPG Module

**Date**: November 3, 2025  
**Purpose**: Identify implemented and missing master data models for SPPG operations  
**Scope**: Enterprise-grade SaaS Platform - Bagizi-ID

---

## 🎯 Master Data Categories

### 1. **Organization Master Data** ✅ COMPLETE

#### ✅ Implemented:
- **SPPG** - Main tenant/organization entity
  * Fields: 149 comprehensive fields
  * Includes: Profile, contact, operational, budget, compliance, demo settings
  * Location: `prisma/schema.prisma` line 119

- **Department** - Organizational structure
  * Fields: Name, code, description, manager, parent department
  * Location: Line 2367

- **Position** - Job positions
  * Fields: Title, code, description, level, department
  * Location: Line 2397

#### ⚠️ Missing:
- ❌ **SppgType** - SPPG categories (School, Hospital, Corporate, Government)
- ❌ **OrganizationLevel** - Hierarchy levels (National, Provincial, Regional)

---

### 2. **Nutrition Master Data** ✅ PARTIAL

#### ✅ Implemented:
- **NutritionStandard** - Age group nutrition requirements
  * Fields: Age groups, gender, calories, protein, vitamins, minerals
  * Location: Line 2942

- **Allergen** - Food allergen master
  * Fields: Name, description, severity, category
  * Location: Line 2812
  * API: ✅ `/api/sppg/menu/allergens` (CRUD complete)

- **NutritionRequirement** - Beneficiary requirements
  * Fields: Age group, nutrition targets, dietary restrictions
  * Location: Line 1678

#### ⚠️ Missing:
- ❌ **FoodCategory** - Missing! (Currently only enum `InventoryCategory`)
  * Needed: Grains, Proteins, Vegetables, Fruits, Dairy, etc.
  * With: Nutritional characteristics, recommended servings
  
- ❌ **NutritionGuideline** - National/WHO guidelines
  * Daily recommendations by age/gender
  * Dietary guidelines for special conditions
  * Source references

- ❌ **MicronutrientStandard** - Detailed vitamin/mineral standards
  * Vitamin A, B complex, C, D, E, K
  * Iron, Calcium, Zinc, Iodine, etc.
  * RDA (Recommended Daily Allowance)

- ❌ **DietaryRestriction** - Medical/religious dietary rules
  * Halal, Vegetarian, Vegan, Gluten-free
  * Diabetic, Hypertension, Kidney disease
  * Cultural/religious preferences

---

### 3. **Inventory Master Data** ✅ PARTIAL

#### ✅ Implemented:
- **InventoryItem** - Complete inventory master
  * Fields: 67 comprehensive fields
  * Categories: BAHAN_POKOK, PROTEIN, SAYURAN, BUAH, etc.
  * Location: Line 1057
  * API: ✅ Working

#### ⚠️ Missing:
- ❌ **UnitOfMeasure** - Missing! (Currently only enum `Unit`)
  * Base units: kg, liter, piece
  * Conversion factors between units
  * Display names (Indonesian/English)
  
- ❌ **StorageLocation** - Warehouse/storage areas
  * Cold storage, dry storage, freezer
  * Location codes, capacity limits
  * Temperature/humidity requirements

- ❌ **InventoryGrade** - Quality grading standards
  * Grade A, B, C with criteria
  * Price differentials by grade
  * Quality specifications

- ❌ **FoodSafetyCertificateType** - Halal, BPOM, SNI, etc.
  * Certificate requirements by product
  * Renewal periods
  * Issuing authorities

---

### 4. **Procurement Master Data** ✅ PARTIAL

#### ✅ Implemented:
- **Supplier** - Complete supplier master
  * Fields: 91 comprehensive fields
  * Location: Line 5989
  * API: ✅ Working

- **ProcurementCategory** - Procurement categories
  * Fields: Name, code, description, approval rules
  * Location: Line 1505

- **ProcurementPaymentTerm** - Payment terms master
  * Fields: Terms, days, discount, late penalty
  * Location: Line 1581

- **ProcurementApprovalLevel** - Approval hierarchy
  * Fields: Level, amount range, approver role
  * Location: Line 1478

#### ⚠️ Missing:
- ❌ **ProcurementMethod** - Bidding methods
  * Direct purchase, tender, e-catalog
  * Rules and thresholds
  * Required documents by method

- ❌ **TaxRate** - Tax configuration
  * PPN (11%), PPh 22, PPh 23
  * Tax-exempt items
  * Regional tax variations

- ❌ **DeliveryTerm** - Incoterms/delivery terms
  * FOB, CIF, Ex-warehouse
  * Delivery responsibility
  * Cost allocation

- ❌ **PriceAgreementType** - Pricing models
  * Fixed price, unit price, lump sum
  * Price adjustment clauses
  * Discount structures

---

### 5. **Production Master Data** ❌ MISSING

#### ✅ Implemented:
- **FoodProduction** - Production records (transactional, not master)
  * Location: Line 1866

#### ⚠️ Missing:
- ❌ **ProductionShift** - Shift master data
  * Morning, afternoon, night shifts
  * Start/end times, break times
  * Capacity per shift

- ❌ **ProductionArea** - Kitchen zones/areas
  * Preparation, cooking, plating, washing
  * Capacity, equipment, responsible staff
  * Safety/hygiene requirements

- ❌ **CookingMethod** - Cooking techniques
  * Steaming, boiling, frying, baking
  * Temperature, duration, equipment needed
  * Nutritional impact

- ❌ **PackagingType** - Food packaging options
  * Container types, sizes, materials
  * Food safety compliance
  * Cost per unit

- ❌ **PortionSize** - Standard serving sizes
  * By age group and meal type
  * Nutritional content per portion
  * Container specifications

---

### 6. **Distribution Master Data** ✅ PARTIAL

#### ✅ Implemented:
- **Vehicle** - Complete vehicle master
  * Fields: 66 comprehensive fields
  * Location: Line 2090

- **SchoolBeneficiary** - Beneficiary/school master
  * Fields: 142 comprehensive fields
  * Location: Line 1724

#### ⚠️ Missing:
- ❌ **DeliveryRoute** - Optimized delivery routes
  * Route code, start/end points
  * Estimated time, distance
  * Stop sequence, traffic patterns

- ❌ **DeliveryTimeWindow** - Delivery schedules
  * School operational hours
  * Preferred delivery times
  * Blackout periods (holidays, exams)

- ❌ **DistributionZone** - Geographic zones
  * Zone codes, coverage areas
  * Responsible team, vehicle assignment
  * Priority levels

- ❌ **ContainerType** - Food transport containers
  * Insulated boxes, thermal bags
  * Capacity, temperature retention
  * Cleaning/maintenance schedule

---

### 7. **Quality Control Master Data** ❌ MOSTLY MISSING

#### ✅ Implemented:
- **QualityControl** - QC records (transactional, not master)
  * Location: Line 1922

- **ProcurementQCChecklist** - QC checklist templates
  * Location: Line 1621

#### ⚠️ Missing:
- ❌ **QualityStandard** - Food quality standards
  * Visual, smell, taste, texture criteria
  * Acceptance/rejection thresholds
  * Testing methods

- ❌ **QualityInspectionType** - Inspection categories
  * Incoming inspection, in-process, final
  * Sampling methods, frequency
  * Required tests by product type

- ❌ **DefectType** - Product defect categories
  * Major, minor, critical defects
  * Defect codes and descriptions
  * Action required by defect type

- ❌ **TemperatureStandard** - Temperature requirements
  * Cold chain temperature ranges
  * Hot holding temperatures
  * Maximum temperature deviations

---

### 8. **HR Master Data** ✅ MOSTLY COMPLETE

#### ✅ Implemented:
- **Employee** - Complete employee master
  * Fields: 76 comprehensive fields
  * Location: Line 2427

- **Department** - Organizational departments
  * Location: Line 2367

- **Position** - Job positions
  * Location: Line 2397

- **Training** - Training programs master
  * Location: Line 3234

#### ⚠️ Missing:
- ❌ **SkillCategory** - Job skills taxonomy
  * Cooking, nutrition, admin, logistics
  * Competency levels (basic, intermediate, expert)
  * Required skills by position

- ❌ **CertificationType** - Professional certifications
  * Food handler license, halal certificate
  * Nutritionist license, safety training
  * Renewal requirements

- ❌ **WorkShiftType** - Shift templates
  * Shift patterns, rotation schedules
  * Overtime rules, break times
  * Shift allowances

---

### 9. **Menu Master Data** ✅ PARTIAL

#### ✅ Implemented:
- **NutritionMenu** - Menu items master
  * Fields: 39 comprehensive fields
  * Location: Line 2738
  * API: ✅ Working (programs API includes menus)

- **MenuPlan** - Menu planning
  * Location: Line 2832

- **MenuPlanTemplate** - Template library
  * Location: Line 2919

- **RecipeStep** - Cooking instructions
  * Location: Line 2793

#### ⚠️ Missing:
- ❌ **MealType** - Currently only enum
  * Should be table: Name, description, timing
  * Typical portions, calorie targets
  * Cultural considerations

- ❌ **CuisineType** - Indonesian, Western, Chinese, etc.
  * Regional variations (Javanese, Sundanese)
  * Spice levels, cooking methods
  * Ingredient substitutions

- ❌ **MenuTheme** - Thematic menu categories
  * Traditional, modern, fusion
  * Seasonal themes (harvest, holidays)
  * Educational themes (nutrition education)

- ❌ **RecipeDifficulty** - Complexity levels
  * Easy, medium, hard
  * Time required, skill level
  * Equipment needed

---

### 10. **Geographic Master Data** ✅ COMPLETE

#### ✅ Implemented:
- **Province** - Indonesian provinces
  * Location: Line 4500

- **Regency** - Cities/regencies
  * Location: Line 4514

- **District** - Districts/kecamatan
  * Location: Line 4530

- **Village** - Villages/kelurahan
  * Location: Line 4545

#### ✅ Status: **COMPLETE** - Full Indonesian administrative hierarchy

---

### 11. **Financial Master Data** ❌ MISSING

#### ⚠️ Missing:
- ❌ **Currency** - Multi-currency support
  * IDR (primary), USD, EUR
  * Exchange rates, update frequency
  * Rounding rules

- ❌ **CostCenter** - Budget allocation
  * Department cost centers
  * Program-specific budgets
  * Tracking and reporting

- ❌ **BudgetCategory** - Expense categories
  * Procurement, production, distribution
  * Fixed vs variable costs
  * Budget codes and limits

- ❌ **TaxConfiguration** - Tax rules by region
  * Regional tax variations
  * Tax-exempt items
  * Withholding tax rules

---

### 12. **Reporting Master Data** ❌ MISSING

#### ⚠️ Missing:
- ❌ **ReportTemplate** - Standard report formats
  * Daily, weekly, monthly templates
  * Required fields, calculations
  * Distribution lists

- ❌ **KPIDefinition** - Key Performance Indicators
  * KPI codes, formulas, targets
  * Acceptable ranges (green/yellow/red)
  * Reporting frequency

- ❌ **ComplianceRequirement** - Regulatory compliance
  * Government reporting requirements
  * Submission deadlines
  * Required documentation

---

## 📊 Summary Statistics

### ✅ **Implemented Master Data**: 21 models
1. SPPG (Organization)
2. Department
3. Position
4. NutritionStandard
5. Allergen
6. NutritionRequirement
7. InventoryItem
8. Supplier
9. ProcurementCategory
10. ProcurementPaymentTerm
11. ProcurementApprovalLevel
12. Vehicle
13. SchoolBeneficiary
14. Employee
15. Training
16. NutritionMenu
17. MenuPlan
18. MenuPlanTemplate
19. RecipeStep
20. Province/Regency/District/Village (Geographic)
21. ProcurementQCChecklist

### ❌ **Missing Master Data**: 46 critical models

#### 🔴 **HIGH PRIORITY** (15 models - Core Operations):
1. **FoodCategory** - Essential for menu planning
2. **UnitOfMeasure** - Required for inventory/procurement
3. **StorageLocation** - Critical for inventory management
4. **ProductionShift** - Required for production scheduling
5. **ProductionArea** - Kitchen zone management
6. **PortionSize** - Standard serving sizes
7. **DeliveryRoute** - Distribution optimization
8. **DeliveryTimeWindow** - Delivery scheduling
9. **QualityStandard** - Food safety compliance
10. **TemperatureStandard** - Cold chain management
11. **MealType** (table) - Currently only enum
12. **TaxRate** - Financial compliance
13. **CostCenter** - Budget tracking
14. **ReportTemplate** - Standard reporting
15. **KPIDefinition** - Performance monitoring

#### 🟡 **MEDIUM PRIORITY** (18 models - Operational Enhancement):
16. DietaryRestriction
17. NutritionGuideline
18. MicronutrientStandard
19. InventoryGrade
20. FoodSafetyCertificateType
21. ProcurementMethod
22. DeliveryTerm
23. PriceAgreementType
24. CookingMethod
25. PackagingType
26. DistributionZone
27. ContainerType
28. QualityInspectionType
29. DefectType
30. SkillCategory
31. CertificationType
32. WorkShiftType
33. CuisineType

#### 🟢 **LOW PRIORITY** (13 models - Nice to Have):
34. SppgType
35. OrganizationLevel
36. MenuTheme
37. RecipeDifficulty
38. Currency (if multi-currency needed)
39. BudgetCategory
40. TaxConfiguration
41. ComplianceRequirement
42. LocalFoodAdaptation (partially exists)
43. MenuResearch (partially exists)
44. NutritionConsultation (partially exists)
45. NutritionEducation (partially exists)
46. PerformanceAnalytics (partially exists)

---

## 🎯 Implementation Roadmap

### **Phase 1: Critical Master Data** (Week 1-2)
Focus on 15 high-priority models essential for core operations.

**Timeline**: 8-16 hours
**Impact**: Unblocks menu planning, production, distribution modules

**Models to implement**:
1. FoodCategory (with nutritional metadata)
2. UnitOfMeasure (with conversion factors)
3. MealType (convert enum to table)
4. ProductionShift
5. PortionSize
6. QualityStandard
7. TemperatureStandard

**Deliverables**:
- ✅ Schema models in `prisma/schema.prisma`
- ✅ Seed data for each model
- ✅ API endpoints (GET /api/sppg/master/{resource})
- ✅ Type definitions
- ✅ Basic CRUD if needed

---

### **Phase 2: Operational Master Data** (Week 3-4)
Implement 18 medium-priority models for operational enhancement.

**Timeline**: 16-24 hours
**Impact**: Enhanced operations, better compliance, improved efficiency

**Models to implement**:
8. StorageLocation
9. ProductionArea
10. DeliveryRoute
11. DeliveryTimeWindow
12. DistributionZone
13. TaxRate
14. CostCenter
15. ReportTemplate
16. KPIDefinition

---

### **Phase 3: Enhancement Master Data** (Week 5-6)
Add remaining 13 low-priority models for comprehensive features.

**Timeline**: 8-12 hours
**Impact**: Professional-grade platform with full feature set

---

## 💡 Recommendations

### **Immediate Actions** (Next 24 hours):

1. **FoodCategory Model** - CRITICAL
   ```prisma
   model FoodCategory {
     id                  String   @id @default(cuid())
     categoryCode        String   @unique @db.VarChar(20)
     categoryName        String   @db.VarChar(100)
     categoryNameEn      String?  @db.VarChar(100)
     description         String?
     
     // Nutritional characteristics
     primaryNutrient     String?  @db.VarChar(50)  // Protein, Carbs, etc.
     servingSize         Float?   // Recommended serving (grams)
     dailyServings       Int?     // Recommended servings per day
     
     // Categorization
     parentId            String?
     parent              FoodCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
     children            FoodCategory[] @relation("CategoryHierarchy")
     
     // System
     isActive            Boolean  @default(true)
     sortOrder           Int      @default(0)
     createdAt           DateTime @default(now())
     updatedAt           DateTime @updatedAt
     
     // Relations
     inventoryItems      InventoryItem[]
     nutritionMenus      NutritionMenu[]
   }
   ```

2. **UnitOfMeasure Model** - CRITICAL
   ```prisma
   model UnitOfMeasure {
     id                  String   @id @default(cuid())
     unitCode            String   @unique @db.VarChar(10)
     unitName            String   @db.VarChar(50)
     unitNameEn          String?  @db.VarChar(50)
     unitSymbol          String   @db.VarChar(10)
     
     // Conversion
     baseUnit            String?  @db.VarChar(10)  // kg, L, pcs
     conversionFactor    Float?   // Factor to base unit
     unitType            UnitType // WEIGHT, VOLUME, COUNT
     
     // System
     isActive            Boolean  @default(true)
     sortOrder           Int      @default(0)
     createdAt           DateTime @default(now())
     updatedAt           DateTime @updatedAt
     
     // Relations
     inventoryItems      InventoryItem[]
     procurementItems    ProcurementItem[]
   }
   
   enum UnitType {
     WEIGHT    // kg, g, ton
     VOLUME    // L, mL, m3
     COUNT     // pcs, pack, box
     LENGTH    // m, cm, mm
   }
   ```

3. **Create Master Data Management Module**
   - Location: `src/features/sppg/master/`
   - Structure:
     ```
     master/
     ├── food-category/
     │   ├── api/
     │   ├── components/
     │   ├── hooks/
     │   └── types/
     ├── unit-measure/
     ├── meal-type/
     └── shared/
     ```

4. **Seed Critical Master Data**
   - Indonesian food categories (10-15 main categories)
   - Common units of measure (20-30 units with conversions)
   - Standard meal types (Sarapan, Snack, Makan Siang, Makan Malam)

---

## 🎯 Success Criteria

### **Phase 1 Complete When**:
- ✅ All 15 high-priority models in database
- ✅ Seed data for each model (Indonesian context)
- ✅ GET APIs functional for all models
- ✅ Type definitions and validations complete
- ✅ Zero TypeScript errors
- ✅ Documentation updated

### **Validation Tests**:
1. Can create menu with food categories
2. Can add inventory items with proper units
3. Can convert between units automatically
4. Can schedule production with shifts
5. Can plan deliveries with time windows
6. Can track quality with standards
7. Can generate reports with templates

---

## 📚 References

- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Schema File**: `prisma/schema.prisma`
- **Existing Features**: `src/features/sppg/`
- **Indonesian Food Groups**: BPOM, Kemenkes guidelines
- **Nutritional Standards**: AKG (Angka Kecukupan Gizi) 2019

---

**Next Steps**: Start with Phase 1 implementation - FoodCategory and UnitOfMeasure models with seed data and APIs.
