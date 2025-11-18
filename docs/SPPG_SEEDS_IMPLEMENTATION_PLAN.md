# 🎯 SPPG Operational Seeds - Implementation Plan
**Date:** November 2, 2025  
**Status:** ✅ 2/18 Completed | 🚧 16 Pending

---

## ✅ Completed Seeds (2/18)

### 1. ✅ Allergen Management
**File:** `prisma/seeds/allergen-seed.ts`  
**Status:** COMPLETED & INTEGRATED  
**Data Created:**
- 21 common allergens (platform-wide, sppgId=null)
- 4 SPPG-specific custom allergens (DEMO-2025)
- Categories: PROTEIN_HEWANI, SEAFOOD, KACANG, KARBOHIDRAT, SAYURAN, BUAH, BUMBU_TAMBAHAN
- Integration: seed.ts Step 3a

**Models Covered:**
```typescript
✅ Allergen (25 records)
```

---

### 2. ✅ System Configuration
**File:** `prisma/seeds/system-configuration-seed.ts`  
**Status:** COMPLETED & NEED INTEGRATION  
**Data Created:**
- 27 system configurations across 6 categories
- Categories: GENERAL (6), PAYMENT (3), EMAIL (4), NOTIFICATION (5), SECURITY (6), INTEGRATION (3)
- Access levels: PUBLIC, USER, ADMIN, SUPER_ADMIN
- Value types: STRING, INTEGER, BOOLEAN, JSON

**Models Covered:**
```typescript
✅ SystemConfiguration (27 records)
```

**TODO: Integration to seed.ts**
```typescript
// Add to seed.ts imports
import { seedSystemConfiguration } from './seeds/system-configuration-seed'

// Add after Step 3a (Allergen)
console.log('⚙️  Step 3b: Seeding system configuration...')
const adminUser = users.find(u => u.email === 'admin@demo.sppg.id')
if (!adminUser) throw new Error('Admin user not found')
await seedSystemConfiguration(prisma, { adminUser })
console.log('✅ System configuration created')
console.log('')
```

---

## 🚧 Pending Seeds (16/18)

### 3. 🔴 StockMovement (CRITICAL - P0)
**File:** `prisma/seeds/stock-movement-seed.ts`  
**Status:** NOT STARTED  
**Priority:** P0 - Critical for inventory operations

**Purpose:**
Track all inventory movements (IN/OUT/ADJUSTMENT) with full traceability

**Data Structure:**
```typescript
interface StockMovementData {
  // Core fields
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  unit: string
  
  // Relationships
  inventoryItemId: string     // Link to InventoryItem
  sppgId: string             // Tenant isolation
  
  // Transaction references
  procurementId?: string      // If movementType = IN
  productionId?: string       // If movementType = OUT  
  distributionId?: string     // If movementType = OUT
  
  // Audit fields
  performedBy: string         // User who performed movement
  notes?: string
  referenceNumber?: string
  
  // Balance tracking
  balanceBefore: number
  balanceAfter: number
}
```

**Sample Data Scenarios:**
1. **IN movements:** 
   - From procurement receipts (10 records)
   - Stock adjustments/corrections (2 records)
   
2. **OUT movements:**
   - Production usage (15 records - links to FoodProduction)
   - Distribution shipments (12 records - links to FoodDistribution)
   
3. **ADJUSTMENT movements:**
   - Stock opname findings (3 records)
   - Damaged/expired items (2 records)

**Total Records:** ~44 movements

**Dependencies:**
- Requires: InventoryItem, Procurement, FoodProduction, FoodDistribution, User
- Used by: ProductionStockUsage, BudgetTracking

**Seed Function Signature:**
```typescript
export async function seedStockMovement(
  prisma: PrismaClient,
  dependencies: {
    sppgs: SPPG[]
    inventoryItems: InventoryItem[]
    procurements: Procurement[]
    productions: FoodProduction[]
    distributions: FoodDistribution[]
    users: User[]
  }
): Promise<StockMovement[]>
```

**Integration Point:** After Step 12 (Production seed)

---

### 4. 🔴 ProductionStockUsage (CRITICAL - P0)
**File:** `prisma/seeds/production-stock-usage-seed.ts`  
**Status:** NOT STARTED  
**Priority:** P0 - Critical for cost tracking

**Purpose:**
Track which inventory items consumed in each production batch with exact quantities

**Data Structure:**
```typescript
interface ProductionStockUsageData {
  productionId: string         // Link to FoodProduction
  inventoryItemId: string      // Which item was used
  quantityUsed: number         // How much was used
  unit: string                 // kg, pcs, liter, etc.
  costPerUnit: number          // Cost at time of usage
  totalCost: number            // quantityUsed * costPerUnit
  notes?: string
}
```

**Sample Data:**
- Link to existing FoodProduction records (from production-seed.ts)
- For each production batch, track 3-8 inventory items used
- Example: Production batch "Nasi Gudeg 500 porsi" uses:
  * Beras 50kg
  * Ayam kampung 20kg
  * Nangka muda 15kg
  * Santan kelapa 10 liter
  * Bumbu dasar 2kg

**Total Records:** ~60 usage records (for ~15 production batches)

**Dependencies:**
- Requires: FoodProduction, InventoryItem
- Used by: MenuCostCalculation, BudgetTracking

**Integration Point:** After StockMovement seed

---

### 5. 🔴 ProcurementQualityControl (CRITICAL - P0)
**File:** `prisma/seeds/procurement-quality-control-seed.ts`  
**Status:** NOT STARTED  
**Priority:** P0 - Critical for supplier management

**Purpose:**
QC inspection records for received procurements using configured checklists

**Data Structure:**
```typescript
interface ProcurementQualityControlData {
  procurementId: string                    // Which procurement order
  checklistId: string                      // Which QC checklist used
  inspectorId: string                      // User who performed QC
  inspectionDate: Date
  overallScore: number                     // Calculated from checklist
  status: 'PASS' | 'FAIL' | 'CONDITIONAL'
  notes?: string
  issuesFound?: string[]
  photosUrls?: string[]
}
```

**Sample Data:**
- 10 QC records for received procurements
- Use existing ProcurementQCChecklist from procurement-seed
- Scores: 70-100 (passing grade >= 80)
- 2 FAIL cases, 1 CONDITIONAL, 7 PASS

**Dependencies:**
- Requires: Procurement, ProcurementQCChecklist, User (inspector)

**Integration Point:** After Procurement seed

---

### 6. 🟡 ProcurementApprovalTracking (MEDIUM - P1)
**File:** `prisma/seeds/procurement-approval-tracking-seed.ts`  
**Status:** NOT STARTED  
**Priority:** P1 - Important for workflow

**Purpose:**
Multi-level approval workflow tracking using configured approval levels

**Data Structure:**
```typescript
interface ProcurementApprovalTrackingData {
  procurementId: string
  approvalLevelId: string      // Which level (Manager/Admin/Kepala)
  approverId: string           // User who approved/rejected
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedAt?: Date
  rejectedAt?: Date
  notes?: string
  level: number                // 1, 2, 3 (sequence)
}
```

**Sample Data:**
- 3-level approval for procurements > Rp 20 juta
- 2-level for Rp 5-20 juta  
- 1-level for < Rp 5 juta
- Track approval chain for 10 procurements

**Dependencies:**
- Requires: Procurement, ProcurementApprovalLevel, User (approvers)

**Integration Point:** After Procurement QC seed

---

### 7. 🔴 SupplierContract & SupplierEvaluation (CRITICAL - P0)
**File:** `prisma/seeds/supplier-contract-evaluation-seed.ts`  
**Status:** NOT STARTED  
**Priority:** P0 - Critical for supplier management

**Purpose:**
Track supplier contracts and quarterly performance evaluations

**Data Structures:**
```typescript
// Supplier Contract
interface SupplierContractData {
  supplierId: string
  sppgId: string
  contractNumber: string
  startDate: Date
  endDate: Date
  value: number               // Total contract value
  paymentTerms: string        // e.g., "Net 30"
  deliveryTerms: string
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
  documentUrl?: string
}

// Supplier Evaluation (Quarterly)
interface SupplierEvaluationData {
  supplierId: string
  sppgId: string
  evaluationPeriod: string    // "Q1-2025", "Q2-2025"
  qualityScore: number        // 1-100
  deliveryScore: number       // 1-100
  priceScore: number          // 1-100
  serviceScore: number        // 1-100
  overallScore: number        // Average
  notes?: string
  evaluatedBy: string         // User ID
}
```

**Sample Data:**
- 6 supplier contracts (one per supplier from suppliers-seed)
- 12 evaluations (2 quarters x 6 suppliers)
- Scores: 70-95 range
- 1 supplier dengan score rendah (warning)

**Dependencies:**
- Requires: Supplier, SPPG, User (evaluator)

**Integration Point:** After Suppliers seed

---

### 8-18. 🚧 Remaining Seeds (Summary)

**8. SchoolDistribution & BeneficiaryReceipt** ⚡ P0  
- School-level distribution records + student receipts
- 25 distributions x 5 schools = 125 records
- Receipt confirmations with signatures

**9. DeliveryPhoto & DeliveryIssue** ⚡ P0  
- Photo evidence (3 photos per delivery)
- Issue tracking (delays, quality, quantity)
- 15 delivery photos, 5 issues

**10. VehicleAssignment** ⚡ P0  
- Vehicle → Route → Driver assignments
- 20 assignments for distribution schedules

**11. QualityCheckPoint & QualityControlItem** ⚡ P0  
- Define checkpoints (5 checkpoints)
- Inspection items (20 items total)

**12. DailyFoodSample & LaboratoryTest** ⚡ P0  
- Daily sampling (30 samples)
- Lab test results (10 tests)

**13. BudgetTracking & Payment System** ⚡ P0  
- Monthly budget vs actual (3 months)
- Payment records (25 payments)
- Invoice generation (30 invoices)

**14. HRD: Attendance & Training** 🟡 P1  
- Daily attendance (25 employees x 30 days)
- Training sessions (10 sessions)
- Certifications (15 certs)

**15. WorkSchedule & LeaveRequest** 🟡 P1  
- Shift schedules (3 shifts x 30 days)
- Leave requests (12 applications)

**16. PerformanceReview & Payroll** 🟡 P1  
- Performance reviews (25 reviews)
- Monthly payroll (25 employees x 2 months)

**17. MenuCost & Nutrition Calculation** 🟡 P1  
- Cost breakdown per menu (50 menus)
- Nutrition calculations (50 menus)

**18. MenuAssignment & TestResult** 🟡 P1  
- Menu to school assignments (25 assignments)
- Tasting results (15 test sessions)

---

## 📊 Implementation Progress Tracker

| # | Seed Name | Priority | Models | Records | Status | Integration |
|---|-----------|----------|---------|---------|--------|-------------|
| 1 | Allergen | P0 | 1 | 25 | ✅ DONE | ✅ Step 3a |
| 2 | SystemConfiguration | P0 | 1 | 27 | ✅ DONE | ⏳ Pending |
| 3 | StockMovement | P0 | 1 | ~44 | ❌ TODO | After Step 12 |
| 4 | ProductionStockUsage | P0 | 1 | ~60 | ❌ TODO | After #3 |
| 5 | ProcurementQC | P0 | 1 | ~10 | ❌ TODO | After Step 11 |
| 6 | ProcurementApproval | P1 | 1 | ~30 | ❌ TODO | After #5 |
| 7 | SupplierContract | P0 | 2 | ~18 | ❌ TODO | After Step 8 |
| 8 | SchoolDistribution | P0 | 2 | ~130 | ❌ TODO | After Step 13 |
| 9 | DeliveryPhoto | P0 | 2 | ~20 | ❌ TODO | After #8 |
| 10 | VehicleAssignment | P0 | 1 | ~20 | ❌ TODO | After Step 9 |
| 11 | QualityCheckPoint | P0 | 2 | ~25 | ❌ TODO | Before Step 12 |
| 12 | DailyFoodSample | P0 | 2 | ~40 | ❌ TODO | After Step 12 |
| 13 | BudgetTracking | P0 | 3 | ~58 | ❌ TODO | After Step 11 |
| 14 | HRD Attendance | P1 | 3 | ~765 | ❌ TODO | After Step 10 |
| 15 | WorkSchedule | P1 | 2 | ~102 | ❌ TODO | After #14 |
| 16 | PerformanceReview | P1 | 2 | ~75 | ❌ TODO | After #15 |
| 17 | MenuCostCalc | P1 | 2 | ~100 | ❌ TODO | After Step 6 |
| 18 | MenuAssignment | P1 | 2 | ~40 | ❌ TODO | After #17 |

**Total:** 18 seeds, ~1,598 new records, 27 models

---

## 🎯 Next Steps

### Immediate Actions (Next Session):
1. ✅ Integrate SystemConfiguration seed to master seed.ts
2. 🚧 Create StockMovement seed (Priority #1 - Foundational)
3. 🚧 Create ProductionStockUsage seed (Priority #2 - Cost tracking)
4. 🚧 Create ProcurementQC seed (Priority #3 - Quality management)

### Week 1 Target:
- Complete all P0 seeds (#3-#13): 11 seeds, ~487 records
- Full operational data for SPPG testing

### Week 2 Target:
- Complete all P1 seeds (#14-#18): 5 seeds, ~1,082 records
- Enhanced features & reporting data

---

**Generated:** November 2, 2025  
**Last Updated:** November 2, 2025 - After completing Allergen & SystemConfiguration seeds
