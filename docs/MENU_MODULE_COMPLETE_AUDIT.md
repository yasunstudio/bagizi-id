# 🍽️ MENU MODULE - Complete Implementation Audit

**Date**: November 3, 2025  
**Objective**: Audit lengkap semua model terkait Menu dan implementasi backend/frontend

---

## 📊 Executive Summary

**Total Menu-Related Models**: 15 models  
**Backend API Coverage**: 55% (Partial implementation)  
**Frontend Components**: 60% (Many not integrated)  
**Overall Status**: ⚠️ **INCOMPLETE** - Banyak missing links antara models

---

## 🗂️ Menu-Related Database Models

### Core Menu Models (6 models)

#### 1. ✅ **NutritionMenu** - Menu utama
```prisma
model NutritionMenu {
  id                          String
  programId                   String
  menuName                    String
  menuCode                    String
  mealType                    MealType
  foodCategoryId              String? // ⚠️ NEW field - belum ada UI
  servingSize                 Int
  costPerServing              Float
  cookingTime                 Int?
  allergens                   String[]
  
  // Relations
  ingredients                 MenuIngredient[]
  nutritionCalc               MenuNutritionCalculation?
  costCalc                    MenuCostCalculation?
  recipeSteps                 RecipeStep[]
  menuAssignments             MenuAssignment[]
  productions                 FoodProduction[]
  schoolDistributions         SchoolDistribution[]
  feedback                    Feedback[]
}
```

**Status**: ✅ **80% Complete**
- ✅ CRUD APIs implemented
- ✅ Basic UI components
- ⚠️ FoodCategory relation not implemented
- ⚠️ Recipe steps UI incomplete
- ❌ Feedback system not implemented

---

#### 2. ⚠️ **MenuIngredient** - Ingredients per menu
```prisma
model MenuIngredient {
  id               String
  menuId           String
  inventoryItemId  String // ✅ Links to inventory
  quantity         Float
  preparationNotes String?
  isOptional       Boolean
  substitutes      String[]
  
  // Relations
  menu             NutritionMenu
  inventoryItem    InventoryItem
}
```

**Status**: ✅ **75% Complete**
- ✅ CRUD APIs implemented
- ✅ IngredientManager component exists
- ⚠️ Substitutes UI not implemented
- ⚠️ Preparation notes not editable in UI

---

#### 3. ⚠️ **RecipeStep** - Cooking instructions
```prisma
model RecipeStep {
  id           String
  menuId       String
  stepNumber   Int
  instruction  String
  duration     Int?
  temperature  Float?
  equipment    String[]
  qualityCheck String?
  imageUrl     String?
  videoUrl     String?
  
  // Relations
  menu         NutritionMenu
}
```

**Status**: ❌ **30% Complete**
- ✅ API endpoints exist (`/api/sppg/menu/[id]/recipe`)
- ❌ Frontend UI tidak ada
- ❌ Image/video upload not implemented
- ❌ Equipment management not implemented

**CRITICAL GAP**: Resep masak tidak bisa diinput/edit via UI!

---

#### 4. ⚠️ **MenuNutritionCalculation** - Auto nutrition calculation
```prisma
model MenuNutritionCalculation {
  id              String
  menuId          String @unique
  calories        Float
  protein         Float
  carbohydrates   Float
  fat             Float
  fiber           Float
  // Vitamins & minerals...
  
  calculatedAt    DateTime
  calculationMethod String
  isVerified      Boolean
  
  // Relations
  menu            NutritionMenu
}
```

**Status**: ✅ **70% Complete**
- ✅ API endpoint exists (`/api/sppg/menu/[id]/calculate-nutrition`)
- ✅ Auto-calculation works
- ⚠️ Manual verification UI not implemented
- ⚠️ Detailed vitamins/minerals not shown in UI

---

#### 5. ⚠️ **MenuCostCalculation** - Auto cost calculation
```prisma
model MenuCostCalculation {
  id                    String
  menuId                String @unique
  totalIngredientCost   Float
  laborCost             Float
  utilityCost           Float
  packagingCost         Float
  overheadCost          Float
  totalCost             Float
  costPerServing        Float
  profitMargin          Float?
  
  calculatedAt          DateTime
  isVerified            Boolean
  
  // Relations
  menu                  NutritionMenu
}
```

**Status**: ⚠️ **50% Complete**
- ✅ API endpoint exists (`/api/sppg/menu/[id]/cost-report`)
- ⚠️ Only shows ingredient cost, not labor/utility/overhead
- ❌ Cost breakdown UI incomplete
- ❌ Real-time cost updates not working

**CRITICAL GAP**: Cost tidak akurat karena hanya hitung ingredient!

---

#### 6. ⚠️ **Allergen** - Allergen master data
```prisma
model Allergen {
  id          String
  sppgId      String?
  name        String
  description String?
  isCommon    Boolean
  category    String?
  localName   String?
  isActive    Boolean
}
```

**Status**: ✅ **85% Complete**
- ✅ CRUD APIs complete
- ✅ UI components complete
- ✅ Integration with menu working
- ⚠️ Category filtering UI missing

---

### Menu Planning Models (4 models)

#### 7. ⚠️ **MenuPlan** - Weekly/monthly menu schedule
```prisma
model MenuPlan {
  id                      String
  programId               String
  sppgId                  String
  createdBy               String
  name                    String
  startDate               DateTime
  endDate                 DateTime
  status                  MenuPlanStatus
  
  // Analytics
  totalDays               Int
  totalMenus              Int
  averageCostPerDay       Float
  totalEstimatedCost      Float
  nutritionScore          Float?
  varietyScore            Float?
  
  // Approval workflow
  submittedAt             DateTime?
  approvedAt              DateTime?
  rejectedAt              DateTime?
  rejectionReason         String?
  
  // Relations
  assignments             MenuAssignment[]
  templates               MenuPlanTemplate[]
  procurementPlans        ProcurementPlan[] // ✅ NEW relation
}
```

**Status**: ⚠️ **60% Complete**
- ✅ CRUD APIs implemented
- ⚠️ Approval workflow exists but needs testing
- ❌ Analytics calculations not implemented
- ❌ Auto-generate procurement plan not working
- ❌ Template system not fully functional

**CRITICAL GAP**: Menu plan approval workflow belum terintegrasi!

---

#### 8. ❌ **MenuAssignment** - Daily menu assignments
```prisma
model MenuAssignment {
  id              String
  menuPlanId      String
  menuId          String
  assignedDate    DateTime
  mealType        MealType
  plannedPortions Int
  estimatedCost   Float
  
  // Nutrition snapshot
  calories        Int
  protein         Float
  carbohydrates   Float
  fat             Float
  
  // Status tracking
  isProduced      Boolean
  isDistributed   Boolean
  actualPortions  Int?
  actualCost      Float?
  productionId    String?
  
  // Relations
  menu            NutritionMenu
  menuPlan        MenuPlan
  production      FoodProduction?
}
```

**Status**: ❌ **40% Complete**
- ✅ API endpoints exist
- ❌ UI untuk edit assignments tidak ada
- ❌ Production tracking tidak terintegrasi
- ❌ Actual vs planned comparison tidak ada

**CRITICAL GAP**: Link antara menu plan → production → distribution RUSAK!

---

#### 9. ❌ **MenuPlanTemplate** - Reusable menu patterns
```prisma
model MenuPlanTemplate {
  id              String
  menuPlanId      String
  sppgId          String
  name            String
  templatePattern Json
  useCount        Int
  isPublic        Boolean
  
  // Relations
  menuPlan        MenuPlan
}
```

**Status**: ❌ **20% Complete**
- ⚠️ Model exists but no APIs
- ❌ No UI implementation
- ❌ Template pattern structure undefined

**CRITICAL GAP**: Template system tidak bisa digunakan!

---

#### 10. ✅ **NutritionStandard** - RDA reference data
```prisma
model NutritionStandard {
  id            String
  targetGroup   TargetGroup
  ageGroup      AgeGroup
  gender        Gender?
  activityLevel ActivityLevel
  
  // RDA values
  calories      Int
  protein       Float
  carbohydrates Float
  fat           Float
  fiber         Float
  calcium       Float?
  iron          Float?
  // ... vitamins
}
```

**Status**: ✅ **90% Complete**
- ✅ Seed data complete
- ✅ API endpoints exist
- ⚠️ UI untuk compare menu vs standard incomplete

---

### Supporting Models (5 models)

#### 11. ⚠️ **FoodCategory** - Hierarchical food categories
```prisma
model FoodCategory {
  id                  String
  categoryCode        String @unique
  categoryName        String
  parentId            String?
  
  // Nutritional info
  primaryNutrient     String?
  servingSizeGram     Float?
  
  // Relations
  parent              FoodCategory?
  children            FoodCategory[]
  inventoryItems      InventoryItem[]
  nutritionMenus      NutritionMenu[]
}
```

**Status**: ❌ **10% Complete**
- ✅ Seed data exists
- ❌ No API endpoints
- ❌ No UI implementation
- ❌ NutritionMenu.foodCategoryId not used anywhere

**CRITICAL GAP**: Model ada tapi tidak digunakan sama sekali!

---

#### 12. ❌ **MenuResearch** - Menu development tracking
```prisma
model MenuResearch {
  id              String
  sppgId          String
  menuId          String?
  researchTitle   String
  researchType    String
  objective       String
  methodology     String
  findings        String?
  recommendations String?
  status          String
  
  // Relations
  testResults     MenuTestResult[]
}
```

**Status**: ❌ **0% Complete**
- ❌ No APIs
- ❌ No UI
- ❌ Not integrated with menu creation

**GAP**: Menu research tidak bisa dilakukan!

---

#### 13. ❌ **MenuTestResult** - Menu testing & tasting
```prisma
model MenuTestResult {
  id              String
  menuResearchId  String
  menuId          String
  testDate        DateTime
  testers         Json
  
  // Ratings
  tasteRating     Float?
  textureRating   Float?
  aromaRating     Float?
  visualRating    Float?
  overallRating   Float?
  
  feedback        String?
  recommendations String?
  isApproved      Boolean
}
```

**Status**: ❌ **0% Complete**
- ❌ No APIs
- ❌ No UI
- ❌ Not integrated with menu approval

**GAP**: Menu testing process tidak ada!

---

#### 14. ❌ **NutritionConsultation** - Expert consultation
```prisma
model NutritionConsultation {
  id              String
  sppgId          String
  consultantId    String
  consultationType String
  menuReviewed    String[]
  
  findings        String?
  recommendations String?
  status          String
  scheduledAt     DateTime
  completedAt     DateTime?
}
```

**Status**: ❌ **0% Complete**
- ❌ No APIs
- ❌ No UI

**GAP**: Konsultasi gizi tidak bisa dijadwalkan!

---

#### 15. ❌ **NutritionEducation** - Educational materials
```prisma
model NutritionEducation {
  id              String
  sppgId          String
  title           String
  content         String
  targetAudience  String
  materialsUsed   String[]
  
  deliveredAt     DateTime?
  attendees       Json?
  feedbackScore   Float?
}
```

**Status**: ❌ **0% Complete**
- ❌ No APIs
- ❌ No UI

**GAP**: Edukasi gizi tidak ada sistemnya!

---

## 🔗 Integration Analysis

### Critical Integration Gaps:

#### 1. **Menu → Production → Distribution Chain**
```typescript
// EXPECTED FLOW:
MenuPlan (approved)
  → MenuAssignment (daily schedule)
    → FoodProduction (cook the menu)
      → FoodDistribution (deliver to schools)
        → SchoolDistribution (track per school)

// CURRENT REALITY:
MenuPlan ✅ exists
  → MenuAssignment ⚠️ exists but isolated
    → FoodProduction ❌ not linked to assignment
      → FoodDistribution ❌ not linked to production
        → SchoolDistribution ❌ orphaned data
```

**CRITICAL PROBLEM**: Data flow TERPUTUS di beberapa titik!

---

#### 2. **Menu → Procurement Connection**
```typescript
// EXPECTED:
MenuPlan.procurementPlans[] // Should auto-generate procurement needs

// CURRENT:
- Relation exists in schema ✅
- Auto-generation logic ❌ NOT IMPLEMENTED
- Manual linking ❌ NO UI

// NEEDED:
1. "Generate Procurement Plan" button in MenuPlan UI
2. API: POST /api/sppg/menu-planning/[id]/generate-procurement
3. Logic: Calculate ingredient needs from all assignments
```

---

#### 3. **Menu Cost Calculation**
```typescript
// EXPECTED:
MenuCostCalculation {
  totalIngredientCost  // From MenuIngredients
  laborCost            // From production time × labor rate
  utilityCost          // From cooking time × utility rate
  packagingCost        // Per serving packaging
  overheadCost         // Facility overhead allocation
}

// CURRENT:
MenuCostCalculation {
  totalIngredientCost  ✅ Calculated
  laborCost            ❌ Always 0
  utilityCost          ❌ Always 0
  packagingCost        ❌ Always 0
  overheadCost         ❌ Always 0
}
```

**CRITICAL**: Total cost TIDAK AKURAT!

---

## 📋 Prioritized Action Plan

### 🚨 **PHASE 1: Fix Critical Integration (Week 1-2)**

#### Task 1.1: Complete Recipe Steps UI
**Priority**: 🔥 CRITICAL  
**Effort**: 3 days

**Backend:**
- ✅ APIs already exist

**Frontend:**
```typescript
// NEEDED:
src/features/sppg/menu/components/
├── RecipeStepsManager.tsx       // Main recipe editor
├── RecipeStepCard.tsx           // Individual step display
├── RecipeStepForm.tsx           // Add/edit step
├── RecipeImageUpload.tsx        // Upload step images
└── RecipeVideoUpload.tsx        // Upload cooking videos
```

**User Story:**
> "Sebagai ahli gizi, saya perlu input langkah-langkah resep lengkap dengan foto dan video agar staff dapur bisa ikuti dengan benar."

---

#### Task 1.2: Fix Menu Cost Calculation
**Priority**: 🔥 CRITICAL  
**Effort**: 4 days

**Backend:**
```typescript
// NEEDED API:
PUT /api/sppg/menu/[id]/cost-calculation

// Calculate:
1. Ingredient cost ✅ (already working)
2. Labor cost = cookingTime × laborRatePerHour
3. Utility cost = cookingTime × utilityRatePerHour
4. Packaging cost = packagingCostPerServing
5. Overhead = (total × overheadPercentage)

// Get rates from:
- SPPG settings (labor rate, utility rate)
- Menu settings (packaging cost)
- System config (overhead percentage)
```

**Frontend:**
```typescript
// UPDATE:
src/features/sppg/menu/components/
├── CostBreakdownCard.tsx        // Show ALL cost components
├── CostSettingsPanel.tsx        // NEW: Edit rates
└── CostComparisonChart.tsx      // NEW: Compare costs
```

---

#### Task 1.3: Implement FoodCategory Integration
**Priority**: 🔧 HIGH  
**Effort**: 2 days

**Backend:**
```typescript
// NEEDED APIs:
GET /api/sppg/food-categories          // List all
GET /api/sppg/food-categories/[id]     // Get one
POST /api/sppg/food-categories         // Create (SUPERADMIN only)
PUT /api/sppg/food-categories/[id]     // Update (SUPERADMIN only)

// ALSO UPDATE:
PUT /api/sppg/menu/[id]
  - Add foodCategoryId to request body
  - Validate category exists
```

**Frontend:**
```typescript
// NEEDED:
src/features/sppg/menu/components/
├── FoodCategorySelect.tsx       // Select from hierarchy
└── MenuForm.tsx                 // Add category field

// UPDATE MenuForm to include:
<FoodCategorySelect
  value={foodCategoryId}
  onChange={setFoodCategoryId}
/>
```

---

#### Task 1.4: Connect Menu → Production → Distribution
**Priority**: 🔥 CRITICAL  
**Effort**: 5 days

**Backend:**
```typescript
// NEEDED:
1. Update FoodProduction creation to link menuAssignmentId
   POST /api/sppg/production
   body: {
     menuAssignmentId: string  // NEW field
     // ... existing fields
   }

2. Auto-update MenuAssignment when production completed
   PATCH /api/sppg/production/[id]/status
   - When status = COMPLETED
   - Set assignment.isProduced = true
   - Set assignment.actualPortions = production.actualPortions
   - Set assignment.productionId = production.id

3. Link distribution to production
   POST /api/sppg/distribution
   body: {
     productionId: string  // Link to which batch
     menuAssignmentId: string  // Link to which schedule
   }

4. Auto-update assignment when distributed
   - Set assignment.isDistributed = true
```

**Frontend:**
```typescript
// UPDATE COMPONENTS:
1. src/features/sppg/production/components/ProductionForm.tsx
   - Add "Select Menu Assignment" dropdown
   - Show assignment.plannedPortions as reference
   - Show assignment.menu.menuName

2. src/features/sppg/distribution/components/DistributionForm.tsx
   - Add "Select Production Batch" dropdown
   - Show production.actualPortions available
   - Auto-link to menuAssignment

3. src/features/sppg/menu-planning/components/AssignmentStatusTable.tsx
   - NEW: Show assignment status in real-time
   - Columns: Date, Menu, Planned, Produced?, Distributed?
   - Color coding: Gray (planned), Yellow (produced), Green (distributed)
```

---

### 🔧 **PHASE 2: Menu Planning Enhancement (Week 3-4)**

#### Task 2.1: Complete Menu Assignment UI
**Priority**: 🔧 HIGH  
**Effort**: 3 days

```typescript
// NEEDED COMPONENTS:
src/features/sppg/menu-planning/components/
├── CalendarMenuAssigner.tsx     // Drag-drop menu to dates
├── AssignmentEditor.tsx         // Edit portions, costs
├── AssignmentStatusTracker.tsx  // Track status per date
└── BulkAssignmentDialog.tsx     // Assign menu to multiple dates
```

---

#### Task 2.2: Implement Menu Plan Analytics
**Priority**: 🔧 HIGH  
**Effort**: 3 days

**Backend:**
```typescript
// NEEDED API:
GET /api/sppg/menu-planning/[id]/analytics

// Calculate:
{
  totalDays: number
  totalMenus: number
  averageCostPerDay: number
  totalEstimatedCost: number
  nutritionScore: number  // NEW: Compare vs standards
  varietyScore: number    // NEW: Menu diversity metric
  costEfficiency: number  // NEW: Cost vs budget
  nutritionBreakdown: {
    avgCalories: number
    avgProtein: number
    // ... per day averages
  }
  menuDistribution: {
    breakfast: number
    lunch: number
    snack: number
  }
}
```

**Frontend:**
```typescript
// NEW COMPONENT:
src/features/sppg/menu-planning/components/
└── PlanAnalyticsDashboard.tsx
    - Show all metrics with charts
    - Nutrition compliance radar chart
    - Cost trend over time
    - Menu variety heatmap
```

---

#### Task 2.3: Auto-Generate Procurement from Menu Plan
**Priority**: 🔥 CRITICAL  
**Effort**: 4 days

**Backend:**
```typescript
// NEW API:
POST /api/sppg/menu-planning/[id]/generate-procurement

// Logic:
1. Get all MenuAssignments for this plan
2. For each assignment:
   - Get menu.ingredients[]
   - Multiply by assignment.plannedPortions
   - Aggregate by inventoryItemId
3. Create ProcurementPlan with auto-generated items
4. Link plan.menuPlanId to menuPlan.id
5. Return procurement plan

Response: {
  procurementPlan: ProcurementPlan
  itemsSummary: {
    itemName: string
    totalQuantity: number
    estimatedCost: number
  }[]
}
```

**Frontend:**
```typescript
// ADD BUTTON TO:
src/features/sppg/menu-planning/components/detail/PlanActionsMenu.tsx

<Button onClick={handleGenerateProcurement}>
  <ShoppingCart /> Generate Procurement Plan
</Button>

// FLOW:
1. Click button
2. Show preview dialog with items list
3. User can adjust quantities
4. Confirm → Create procurement plan
5. Redirect to procurement plan detail
```

---

### ⏸️ **PHASE 3: Advanced Features (Future)**

#### Task 3.1: Menu Template System
- Design template pattern structure
- Implement save/load templates
- Public template marketplace

#### Task 3.2: Menu Research & Testing
- Menu research workflow
- Tasting session management
- Feedback aggregation

#### Task 3.3: Nutrition Consultation
- Schedule consultation sessions
- Expert review system
- Recommendation tracking

---

## 📊 Implementation Metrics

### Current Coverage:
```
Core Menu Models:
NutritionMenu:           ████████████████░░░░ 80%
MenuIngredient:          ███████████████░░░░░ 75%
RecipeStep:              ██████░░░░░░░░░░░░░░ 30% ⚠️
MenuNutritionCalc:       ██████████████░░░░░░ 70%
MenuCostCalc:            ██████████░░░░░░░░░░ 50% ⚠️
Allergen:                █████████████████░░░ 85%

Menu Planning:
MenuPlan:                ████████████░░░░░░░░ 60% ⚠️
MenuAssignment:          ████████░░░░░░░░░░░░ 40% ⚠️
MenuPlanTemplate:        ████░░░░░░░░░░░░░░░░ 20% ⚠️
NutritionStandard:       ██████████████████░░ 90%

Supporting:
FoodCategory:            ██░░░░░░░░░░░░░░░░░░ 10% 🚨
MenuResearch:            ░░░░░░░░░░░░░░░░░░░░  0% 🚨
MenuTestResult:          ░░░░░░░░░░░░░░░░░░░░  0% 🚨
NutritionConsultation:   ░░░░░░░░░░░░░░░░░░░░  0% 🚨
NutritionEducation:      ░░░░░░░░░░░░░░░░░░░░  0% 🚨

Overall Menu Module:     ██████████░░░░░░░░░░ 48%
```

### Target After Phase 1:
```
Core Menu Models:
NutritionMenu:           ████████████████████ 95% ⬆️
MenuIngredient:          ██████████████████░░ 90% ⬆️
RecipeStep:              ████████████████░░░░ 80% ⬆️
MenuNutritionCalc:       ██████████████████░░ 90% ⬆️
MenuCostCalc:            ██████████████████░░ 90% ⬆️
Allergen:                ██████████████████░░ 90% ⬆️

Menu Planning:
MenuPlan:                ████████████████░░░░ 80% ⬆️
MenuAssignment:          ████████████████░░░░ 80% ⬆️
MenuPlanTemplate:        ████████░░░░░░░░░░░░ 40% ⬆️
NutritionStandard:       ███████████████████░ 95% ⬆️

Supporting:
FoodCategory:            ████████████████░░░░ 80% ⬆️
MenuResearch:            ░░░░░░░░░░░░░░░░░░░░  0%
MenuTestResult:          ░░░░░░░░░░░░░░░░░░░░  0%
NutritionConsultation:   ░░░░░░░░░░░░░░░░░░░░  0%
NutritionEducation:      ░░░░░░░░░░░░░░░░░░░░  0%

Overall Menu Module:     ████████████████░░░░ 75% ⬆️
```

---

## 🎯 Success Criteria

### Must Have (Phase 1):
- ✅ Recipe steps fully editable with image upload
- ✅ Accurate cost calculation (all components)
- ✅ FoodCategory integrated in menu creation
- ✅ Menu → Production → Distribution chain working
- ✅ Menu plan analytics dashboard
- ✅ Auto-generate procurement from menu plan

### Should Have (Phase 2):
- ✅ Calendar-based menu assignment UI
- ✅ Assignment status real-time tracking
- ✅ Bulk menu assignment tools
- ✅ Cost efficiency analytics

### Nice to Have (Phase 3):
- ⏸️ Menu template marketplace
- ⏸️ Menu research workflow
- ⏸️ Expert consultation system

---

## 🚀 Next Steps

### Immediate Actions:

1. **Week 1-2: Critical Fixes**
   - Day 1-3: Recipe Steps UI complete
   - Day 4-7: Fix cost calculation (all components)
   - Day 8-9: FoodCategory integration
   - Day 10-14: Fix Menu → Production → Distribution chain

2. **Week 3-4: Planning Enhancement**
   - Day 1-3: Menu assignment UI
   - Day 4-6: Plan analytics dashboard
   - Day 7-10: Auto-procurement generation

### Decision Point:
**Do you want to proceed with Phase 1?**
- 🟢 **YES** → I'll start with Task 1.1 (Recipe Steps UI)
- 🔶 **MODIFY** → Adjust priorities
- 🔴 **PAUSE** → Review other modules first

---

**Total Estimated Time**: 4 weeks  
**Expected Outcome**: Fully functional Menu module with 75%+ coverage

Let me know which task to start with! 🚀
