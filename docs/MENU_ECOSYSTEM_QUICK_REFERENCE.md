# 🎯 MENU ECOSYSTEM - QUICK REFERENCE GUIDE

**Last Updated**: January 19, 2025

---

## 📊 MODEL RELATIONSHIP DIAGRAM (TEXT)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MENU ECOSYSTEM                               │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  SPPG (Tenant)   │
└────────┬─────────┘
         │
         ├─────────────────────────────────────────────┐
         │                                             │
         ▼                                             ▼
┌────────────────────┐                       ┌──────────────────┐
│ NutritionProgram   │──────────────────────▶│  SchoolBeneficiary│
│  (Context)         │                       └──────────────────┘
└────────┬───────────┘
         │
         ├──────────┬────────────┬─────────────┬────────────┐
         │          │            │             │            │
         ▼          ▼            ▼             ▼            ▼
┌──────────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│NutritionMenu│ │ MenuPlan  │ │Production│ │Distribution│ │Procurement│
│  (Recipe)   │ └─────┬─────┘ └──────────┘ └──────────┘ └──────────┘
└──────┬───────┘       │
       │               │
       ├───────┬───────┴───────┬──────────┐
       │       │               │          │
       ▼       ▼               ▼          ▼
┌─────────┐ ┌────────┐ ┌──────────────┐ ┌────────┐
│Ingredient││RecipeStep││MenuAssignment││FoodCategory│
└─────────┘ └────────┘ └──────────────┘ └────────┘
       │                                      │
       ▼                                      ▼
┌─────────────┐                      ┌──────────────┐
│InventoryItem│                      │  Allergen    │
└─────────────┘                      └──────────────┘
       │
       ├────────────┬─────────────┐
       ▼            ▼             ▼
┌─────────────┐ ┌──────────┐ ┌────────────┐
│MenuNutrition│ │MenuCost  │ │Nutrition   │
│Calculation  │ │Calculation│ │Standard    │
└─────────────┘ └──────────┘ └────────────┘
```

---

## 🎭 MODEL STATUS MATRIX

| Model | Schema | Seed | API | UI | Status |
|-------|--------|------|-----|----|---------
| **NutritionProgram** | ✅ | ✅ | ✅ | ✅ | 🟢 Complete |
| **NutritionMenu** | ✅ | ✅ | ✅ | ✅ | 🟢 Complete |
| **MenuIngredient** | ✅ | ✅ | ✅ | 🟡 | 🟡 Partial |
| **RecipeStep** | ✅ | ✅ | 🔴 | 🔴 | 🔴 Missing UI |
| **MenuNutritionCalculation** | ✅ | ✅ | ✅ | ✅ | 🟢 Complete |
| **MenuCostCalculation** | ✅ | ✅ | ✅ | 🟡 | 🟡 Partial |
| **MenuPlan** | ✅ | ✅ | 🟡 | 🟡 | 🟡 Workflow Gap |
| **MenuAssignment** | ✅ | ✅ | ✅ | 🔴 | 🔴 No Calendar |
| **MenuPlanTemplate** | ✅ | ✅ | 🔴 | 🔴 | 🔴 Not Implemented |
| **FoodCategory** | ✅ | ✅ | ✅ | ✅ | 🟢 Complete (NEW) |
| **Allergen** | ✅ | ✅ | 🔴 | 🔴 | 🔴 No Manager |
| **NutritionStandard** | ✅ | ✅ | ✅ | ✅ | 🟢 Complete |

**Legend**:
- 🟢 Complete = Fully functional
- 🟡 Partial = Missing features
- 🔴 Missing = Not implemented

---

## 🔄 WORKFLOW STATUS

### **Menu Creation Workflow** ✅ COMPLETE
```
Create Program → Create Menu → Add Ingredients → Add Recipe Steps → Calculate Nutrition/Cost
    ✅              ✅             ✅                  🟡                    ✅
```

### **Menu Planning Workflow** 🟡 PARTIAL
```
Create Plan → Assign Menus → Review → Submit → Approve → Publish → Generate Procurement
    ✅            🔴           🟡       🔴       🔴        🔴            🔴
```

### **Production Workflow** ✅ COMPLETE
```
MenuPlan → MenuAssignment → Production → Quality Control → Distribution
    ✅           ✅              ✅             ✅                ✅
```

---

## 📁 SEED FILE DEPENDENCY TREE

```
1. sppg-seed.ts
   └─▶ 2. user-seed.ts
       └─▶ 3. program-seed.ts (creates NutritionProgram)
           ├─▶ 4. food-category-seed.ts (master data)
           ├─▶ 5. allergen-seed.ts (master data)
           ├─▶ 6. nutrition-seed.ts (standards)
           ├─▶ 7. inventory-seed.ts
           │   └─▶ 8. menu-seed.ts (creates NutritionMenu)
           │       ├─▶ 9. menu-cost-nutrition-seed.ts (calculations)
           │       ├─▶ 10. menu-plan-seed.ts (creates MenuPlan)
           │       │   ├─▶ 11. menu-assignment-testresult-seed.ts
           │       │   └─▶ 12. menu-plan-template-seed.ts
           │       ├─▶ 13. menu-research-seed.ts
           │       └─▶ 14. nutrition-menu-analysis-seed.ts
           └─▶ 15. production-seed.ts
               └─▶ 16. distribution-seed.ts
```

**Total Menu-Related Seed Files**: 14 files

---

## 🎯 PRIORITY ACTION ITEMS

### **🔴 CRITICAL (Do This Week)**

1. **Menu Planning Approval Workflow**
   ```
   Priority: P0 (Blocker)
   Effort: 3 days
   APIs Needed:
   - POST /api/sppg/menu-plan/[id]/submit
   - POST /api/sppg/menu-plan/[id]/approve
   - POST /api/sppg/menu-plan/[id]/reject
   - POST /api/sppg/menu-plan/[id]/publish
   
   UI Needed:
   - Approval Panel Component
   - Status Timeline Component
   - Comment Thread Component
   ```

2. **Planning Calendar View**
   ```
   Priority: P0 (User Experience)
   Effort: 5 days
   Features:
   - Month/Week/Day views
   - Drag-drop menu assignment
   - Visual cost/nutrition indicators
   - Quick menu swap
   ```

---

### **🟡 HIGH (Next 2 Weeks)**

3. **Recipe Step Manager**
   ```
   Priority: P1 (Content Creation)
   Effort: 5 days
   Features:
   - Visual step editor
   - Drag-drop reordering
   - Image/video upload
   - Quality check notes
   ```

4. **Procurement Generation**
   ```
   Priority: P1 (Automation)
   Effort: 3 days
   API: POST /api/sppg/menu-plan/[id]/generate-procurement
   Algorithm:
   - Aggregate ingredients from all assignments
   - Calculate quantities based on portions
   - Group by preferred suppliers
   - Create linked ProcurementPlan
   ```

5. **Allergen Management**
   ```
   Priority: P1 (Data Management)
   Effort: 3 days
   Pages:
   - /settings/allergens (CRUD)
   - Improved allergen selector in MenuForm
   ```

---

### **🟢 MEDIUM (Next Month)**

6. **Menu Plan Templates**
7. **Nutrition Dashboard**
8. **Cost Analytics**
9. **Advanced Menu Filters**
10. **Menu Duplication/Import/Export**

---

## 📊 IMPLEMENTATION METRICS

### **Completion Percentage**

| Layer | Complete | In Progress | Not Started | Total |
|-------|----------|-------------|-------------|-------|
| **Schema** | 12 | 0 | 0 | 12 (100%) |
| **Seed** | 14 | 0 | 0 | 14 (100%) |
| **API** | 8 | 3 | 5 | 16 (50%) |
| **UI** | 6 | 4 | 6 | 16 (38%) |

### **Estimated Work Remaining**

```
Critical Priority (P0):  8 days
High Priority (P1):     18 days
Medium Priority (P2):   13 days
Low Priority (P3):      15 days
────────────────────────────────
TOTAL:                  54 days (~11 weeks)
```

### **Quick Wins Available**

```
✨ Menu Duplication:          1 day
✨ Menu Import/Export:         2 days
✨ Menu Status Indicators:    1 day
✨ Quick Menu Filters:        1 day
✨ Menu Comparison:           2 days
────────────────────────────────────
TOTAL QUICK WINS:             7 days
```

---

## 🔗 KEY API ENDPOINTS

### **✅ Implemented**

```typescript
// Menu CRUD
GET    /api/sppg/menu              // List menus
POST   /api/sppg/menu              // Create menu
GET    /api/sppg/menu/[id]         // Get menu detail
PUT    /api/sppg/menu/[id]         // Update menu
DELETE /api/sppg/menu/[id]         // Delete menu

// Menu Relations
GET    /api/sppg/menu/[id]/ingredients  // Get ingredients
POST   /api/sppg/menu/[id]/ingredients  // Add ingredient
GET    /api/sppg/menu/[id]/nutrition    // Get nutrition calc
GET    /api/sppg/menu/[id]/cost         // Get cost calc

// Menu Plan CRUD
GET    /api/sppg/menu-plan         // List plans
POST   /api/sppg/menu-plan         // Create plan
GET    /api/sppg/menu-plan/[id]    // Get plan detail
PUT    /api/sppg/menu-plan/[id]    // Update plan
DELETE /api/sppg/menu-plan/[id]    // Delete plan

// Menu Plan Relations
GET    /api/sppg/menu-plan/[id]/assignments  // Get assignments
POST   /api/sppg/menu-plan/[id]/assignments  // Add assignment
```

### **🔴 Missing (High Priority)**

```typescript
// Workflow Actions
POST   /api/sppg/menu-plan/[id]/submit              // Submit for approval
POST   /api/sppg/menu-plan/[id]/approve             // Approve plan
POST   /api/sppg/menu-plan/[id]/reject              // Reject plan
POST   /api/sppg/menu-plan/[id]/publish             // Publish plan

// Procurement Integration
POST   /api/sppg/menu-plan/[id]/generate-procurement  // Generate procurement

// Recipe Management
GET    /api/sppg/menu/[id]/recipe-steps         // Get all steps
POST   /api/sppg/menu/[id]/recipe-steps         // Add step
PUT    /api/sppg/menu/[id]/recipe-steps/[step]  // Update step
DELETE /api/sppg/menu/[id]/recipe-steps/[step]  // Delete step

// Template Management
GET    /api/sppg/menu-plan-template             // List templates
POST   /api/sppg/menu-plan-template             // Create template
GET    /api/sppg/menu-plan-template/[id]        // Get template
DELETE /api/sppg/menu-plan-template/[id]        // Delete template

// Allergen Management
GET    /api/sppg/allergen                       // List allergens
POST   /api/sppg/allergen                       // Create custom allergen
PUT    /api/sppg/allergen/[id]                  // Update allergen
DELETE /api/sppg/allergen/[id]                  // Delete allergen
```

---

## 📍 CURRENT POSITION

### **What's Working Well** ✅
- Core menu management (create, edit, list, view)
- Ingredient linking to inventory
- Auto-calculation of nutrition and cost
- Program-based menu organization
- Food category classification (NEW)
- Basic menu planning

### **What's Blocking Progress** 🚧
1. **No approval workflow** - Plans stuck in draft
2. **No visual calendar** - Hard to see weekly/monthly plans
3. **No recipe editor** - Manual SQL editing required
4. **No procurement link** - Manual procurement creation
5. **No template system** - Repetitive planning work

### **Quick Assessment**
```
Foundation:     🟢 Solid (90%)
Core Features:  🟢 Good (75%)
Planning:       🟡 Basic (60%)
Workflow:       🔴 Missing (20%)
Automation:     🔴 Missing (10%)
───────────────────────────────
OVERALL:        🟡 65% Complete
```

---

## 🎯 RECOMMENDED SPRINT PLAN

### **Sprint 1: Workflow Foundation** (Week 1-2)
```
Goal: Enable complete planning workflow

□ Implement approval APIs (3d)
□ Build approval panel UI (3d)
□ Create status timeline (2d)
□ Add email notifications (2d)

Deliverable: Plans can be submitted and approved
```

### **Sprint 2: Visual Planning** (Week 3-4)
```
Goal: Better planning UX

□ Build planning calendar (5d)
□ Implement drag-drop (3d)
□ Add quick actions (2d)

Deliverable: Visual drag-drop planning
```

### **Sprint 3: Automation** (Week 5-6)
```
Goal: Reduce manual work

□ Procurement generation (3d)
□ Template system (3d)
□ Recipe manager (5d)

Deliverable: One-click operations
```

---

## 📚 RELATED DOCUMENTATION

- `/docs/MENU_DOMAIN_COMPREHENSIVE_AUDIT.md` - This document
- `/docs/FOODCATEGORY_INTEGRATION_COMPLETE.md` - Food category implementation
- `/docs/MENU_PLANNING_CRITICAL_FIXES_COMPLETE.md` - Planning fixes
- `/docs/PROGRAM_DOMAIN_AUDIT_COMPLETE.md` - Program management

---

**Quick Reference Guide Complete** - January 19, 2025
