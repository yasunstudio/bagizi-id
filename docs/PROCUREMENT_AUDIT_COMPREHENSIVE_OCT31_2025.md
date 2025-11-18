# 📋 AUDIT KOMPREHENSIF MODUL PROCUREMENT
**Tanggal:** 31 Oktober 2025  
**Status:** CRITICAL - Requires Immediate Integration

---

## 🎯 EXECUTIVE SUMMARY

### ❌ TEMUAN KRITIS
Modul Procurement **TIDAK TERINTEGRASI** dengan operasional SPPG lainnya. Implementasi saat ini berdiri sendiri (isolated) tanpa memperhatikan workflow end-to-end dari:
- Menu Planning → Procurement → Production → Distribution

### 🔴 SEVERITY: CRITICAL
**Impact:** Sistem procurement tidak dapat mendukung operasional SPPG secara menyeluruh karena:
1. **Tidak ada integrasi dengan Menu Planning** - Procurement tidak tahu menu apa yang akan diproduksi
2. **Tidak ada integrasi dengan Production** - Bahan yang dibeli tidak terhubung dengan produksi
3. **Tidak ada cost tracking yang akurat** - Biaya produksi tidak terhitung dengan benar
4. **Workflow terputus** - Setiap modul bekerja dalam silo

---

## 📊 TEMUAN AUDIT DETAIL

### 1️⃣ SCHEMA DATABASE - ANALYSIS

#### ✅ Yang Sudah Benar:

**A. Struktur Multi-tenant:**
```prisma
model Procurement {
  sppgId String  // ✅ CORRECT: Multi-tenant filtering exists
  // ...
}

model ProcurementPlan {
  sppgId String  // ✅ CORRECT: Multi-tenant filtering exists
  // ...
}
```

**B. Relasi dengan Inventory:**
```prisma
model ProcurementItem {
  inventoryItemId String?  // ✅ CORRECT: Link to inventory
  inventoryItem   InventoryItem? @relation(...)
}
```

**C. Komponen Procurement yang Lengkap:**
- ✅ ProcurementPlan (Perencanaan)
- ✅ Procurement (Order)
- ✅ ProcurementItem (Detail item)
- ✅ ProcurementApprovalTracking (Approval workflow)
- ✅ ProcurementQualityControl (QC)
- ✅ ProcurementSettings (Konfigurasi)
- ✅ PaymentTransaction (Pembayaran)

#### ❌ MASALAH KRITIS:

**A. ProcurementPlan TIDAK Terhubung dengan Menu Planning:**
```prisma
model ProcurementPlan {
  id String @id
  sppgId String
  programId String? // ⚠️ Optional - seharusnya REQUIRED
  // ❌ MISSING: menuPlanId - tidak ada relasi ke MenuPlan!
  // ❌ MISSING: relasi ke MenuAssignment untuk tahu menu apa yang perlu dibeli
  
  program NutritionProgram? @relation(...) // ⚠️ Optional, should be required
  // ❌ MISSING: menuPlan MenuPlan @relation(...)
}
```

**Dampak:**
- Procurement plan dibuat tanpa tahu menu apa yang akan dimasak
- Tidak bisa auto-generate daftar belanja dari menu
- Budget allocation tidak berdasarkan kebutuhan menu aktual

**B. Production TIDAK Menggunakan Data Procurement:**
```prisma
model FoodProduction {
  id String @id
  menuId String  // ✅ Tahu menu apa yang diproduksi
  // ❌ MISSING: procurementId atau relasi ke Procurement
  // ❌ MISSING: validasi apakah bahan sudah dibeli
  
  usageRecords ProductionStockUsage[] // ✅ Track usage
  // ⚠️ PROBLEM: Usage tidak tervalidasi dengan procurement
}

model ProductionStockUsage {
  inventoryItemId String  // ✅ Tahu item mana yang dipakai
  quantityUsed Float     // ✅ Tahu berapa banyak
  unitCostAtUse Float    // ⚠️ Cost dari mana? Dari procurement terakhir?
  
  // ❌ MISSING: procurementItemId - tidak tahu item ini dari procurement mana
  // ❌ MISSING: validasi stock availability dari procurement
}
```

**Dampak:**
- Production bisa jalan meskipun bahan belum dibeli
- Cost calculation tidak akurat (ambil harga dari mana?)
- Tidak ada validasi stock availability

**C. Distribution TIDAK Terhubung dengan Procurement Budget:**
```prisma
model FoodDistribution {
  productionId String?  // ⚠️ Optional - should be required
  // ❌ MISSING: Budget tracking - tidak tahu biaya distribusi vs budget
  // ❌ MISSING: Cost allocation dari procurement
  
  transportCost Float?
  fuelCost Float?
  otherCosts Float?
  // ⚠️ PROBLEM: Costs tidak ter-track di procurement plan
}
```

**Dampak:**
- Total cost of operation tidak terhitung
- Budget overrun tidak terdeteksi
- No cost-per-meal calculation

---

### 2️⃣ API IMPLEMENTATION - ANALYSIS

#### ✅ Yang Sudah Benar:

**A. Multi-tenant Security:**
```typescript
// ✅ CORRECT: Every API has sppgId filtering
const where = {
  sppgId: session.user.sppgId!, // MANDATORY
}
```

**B. RBAC Implementation:**
```typescript
// ✅ CORRECT: Permission checks
if (!hasPermission(session.user.userRole, 'user:read')) {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
}
```

**C. QC Integration:**
```typescript
// ✅ CORRECT: QC validation in receive process
const qcPhotoValidation = await validateQCPhotos(...)
const qcChecklistValidation = await validateQCChecklist(...)
```

**D. Stock Movement Tracking:**
```typescript
// ✅ CORRECT: Create stock movement when receiving
await tx.stockMovement.create({
  data: {
    inventoryId: procurementItem.inventoryItemId,
    movementType: 'IN',
    quantity: acceptedQuantity,
    // ...
  }
})

// ✅ CORRECT: Update inventory stock
await tx.inventoryItem.update({
  where: { id: procurementItem.inventoryItemId },
  data: {
    currentStock: newStock,
  }
})
```

#### ❌ MASALAH KRITIS:

**A. Procurement Plan Creation - No Menu Validation:**
```typescript
// File: src/app/api/sppg/procurement/plans/route.ts
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    // ❌ PROBLEM: Tidak validasi apakah ada menu plan aktif
    // ❌ PROBLEM: Tidak auto-generate items dari menu
    // ❌ PROBLEM: Budget tidak dihitung dari menu + portion
    
    const plan = await db.procurementPlan.create({
      data: {
        sppgId: session.user.sppgId,
        programId: validated.data.programId, // Optional!
        // ❌ MISSING: menuPlanId
        // ❌ MISSING: auto-calculate budget from menu
        // ...
      }
    })
  })
}
```

**Yang Seharusnya:**
```typescript
// ✅ CORRECT IMPLEMENTATION:
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    // 1. Validate menu plan exists and is active
    const menuPlan = await db.menuPlan.findFirst({
      where: {
        id: validated.data.menuPlanId,
        sppgId: session.user.sppgId,
        status: 'APPROVED',
        startDate: { lte: validated.data.planStartDate },
        endDate: { gte: validated.data.planEndDate }
      },
      include: {
        assignments: {
          include: {
            menu: {
              include: {
                ingredients: {
                  include: {
                    inventoryItem: true
                  }
                }
              }
            }
          }
        }
      }
    })
    
    if (!menuPlan) {
      return NextResponse.json({
        error: 'No active menu plan found for this period'
      }, { status: 400 })
    }
    
    // 2. Calculate required items from menu ingredients
    const requiredItems = calculateRequiredItems(
      menuPlan.assignments,
      validated.data.targetRecipients
    )
    
    // 3. Calculate budget from items
    const totalBudget = calculateTotalBudget(requiredItems)
    
    // 4. Create procurement plan with menu link
    const plan = await db.procurementPlan.create({
      data: {
        sppgId: session.user.sppgId,
        programId: validated.data.programId,
        menuPlanId: menuPlan.id, // ✅ Link to menu plan
        totalBudget,
        // Auto-generated items
        suggestedItems: requiredItems,
        // ...
      }
    })
  })
}
```

**B. Production Stock Usage - No Procurement Validation:**
```typescript
// ❌ PROBLEM: Production tidak validasi apakah item sudah dibeli
// File: Production API (hypothetical)
async function recordProductionStockUsage() {
  await db.productionStockUsage.create({
    data: {
      productionId: '...',
      inventoryItemId: '...', // ✅ Ada inventory ID
      quantityUsed: 10,
      unitCostAtUse: 5000, // ❌ Harga dari mana? Random?
      // ❌ MISSING: procurementItemId validation
    }
  })
}
```

**Yang Seharusnya:**
```typescript
// ✅ CORRECT: Validate from latest procurement
async function recordProductionStockUsage(data: StockUsageInput) {
  // 1. Check if item was procured
  const latestProcurement = await db.procurementItem.findFirst({
    where: {
      inventoryItemId: data.inventoryItemId,
      procurement: {
        sppgId: session.user.sppgId,
        status: 'FULLY_RECEIVED',
        receivedQuantity: { gt: 0 }
      }
    },
    orderBy: {
      procurement: {
        actualDelivery: 'desc'
      }
    }
  })
  
  if (!latestProcurement) {
    throw new Error('Item not procured or out of stock')
  }
  
  // 2. Validate available stock
  const inventoryItem = await db.inventoryItem.findUnique({
    where: { id: data.inventoryItemId }
  })
  
  if (inventoryItem.currentStock < data.quantityUsed) {
    throw new Error('Insufficient stock')
  }
  
  // 3. Use actual procurement cost
  await db.productionStockUsage.create({
    data: {
      productionId: data.productionId,
      inventoryItemId: data.inventoryItemId,
      procurementItemId: latestProcurement.id, // ✅ Track source
      quantityUsed: data.quantityUsed,
      unitCostAtUse: latestProcurement.pricePerUnit, // ✅ Actual cost
      totalCost: data.quantityUsed * latestProcurement.pricePerUnit
    }
  })
}
```

---

### 3️⃣ SCHEMA VALIDATION - ANALYSIS

#### ❌ MASALAH KRITIS:

**A. Procurement Plan Schema - Missing Menu Link:**
```typescript
// File: src/features/sppg/procurement/plans/schemas/planSchemas.ts
export const procurementPlanCreateSchema = z.object({
  programId: z.string().cuid().optional(), // ⚠️ Should be required
  // ❌ MISSING: menuPlanId
  // ❌ MISSING: validation for menu period overlap
  // ...
})
```

**Yang Seharusnya:**
```typescript
// ✅ CORRECT:
export const procurementPlanCreateSchema = z.object({
  programId: z.string().cuid('Program ID required'),
  menuPlanId: z.string().cuid('Menu Plan ID required'), // ✅ REQUIRED
  planStartDate: z.date(),
  planEndDate: z.date(),
  targetRecipients: z.number().positive(),
  // Auto-calculate from menu - optional override
  totalBudget: z.number().positive().optional(),
  // ...
}).refine(data => {
  // Validate date range is within menu plan period
  return data.planStartDate < data.planEndDate
}, {
  message: 'Start date must be before end date'
})
```

---

## 🔄 WORKFLOW YANG SEHARUSNYA

### Current (WRONG) ❌:
```
Menu Planning (Isolated)
     ↓ (No connection)
Procurement (Isolated) 
     ↓ (No connection)
Production (Isolated)
     ↓ (No connection)
Distribution (Isolated)
```

### Correct (INTEGRATED) ✅:
```
1. Menu Planning
   ├── Create MenuPlan for period X
   ├── Assign menus to dates
   └── Approve menu plan
        ↓
2. Procurement Planning (Auto-generated from menu)
   ├── System calculates required ingredients from menu
   ├── System calculates budget from ingredients × recipients
   ├── Create ProcurementPlan linked to MenuPlan
   ├── Generate suggested procurement items
   └── Approve procurement plan
        ↓
3. Procurement Execution
   ├── Create orders based on plan
   ├── Receive items with QC
   ├── Update inventory with procurement reference
   └── Mark items as "ready for production"
        ↓
4. Production (Validate from procurement)
   ├── Check if ingredients are available (from procurement)
   ├── Use ingredients with procurement cost
   ├── Track usage with procurement reference
   └── Calculate actual production cost
        ↓
5. Distribution (Track total costs)
   ├── Distribute produced food
   ├── Calculate total cost (procurement + production + distribution)
   └── Report cost-per-meal and budget utilization
```

---

## 📋 REKOMENDASI PERBAIKAN

### 🚨 CRITICAL - Must Fix Immediately:

#### 1. Schema Changes (Prisma Migration):

```prisma
// ===== STEP 1: Add menuPlanId to ProcurementPlan =====
model ProcurementPlan {
  id        String @id @default(cuid())
  sppgId    String
  programId String // ✅ Make required, remove optional
  menuPlanId String? // ✅ ADD: Link to menu plan (nullable for backward compatibility)
  
  // ✅ ADD: Calculated fields from menu
  autoGeneratedItems Json? // Store suggested items from menu
  menuBasedBudget Float? // Budget calculated from menu
  
  // ... existing fields ...
  
  // ✅ ADD: Relation to MenuPlan
  menuPlan MenuPlan? @relation(fields: [menuPlanId], references: [id])
  
  @@index([menuPlanId]) // ✅ ADD: Index for performance
}

// ===== STEP 2: Add procurementItemId to ProductionStockUsage =====
model ProductionStockUsage {
  id              String @id @default(cuid())
  productionId    String
  inventoryItemId String
  procurementItemId String? // ✅ ADD: Track which procurement this came from
  
  // ... existing fields ...
  
  // ✅ ADD: Relation to ProcurementItem
  procurementItem ProcurementItem? @relation(fields: [procurementItemId], references: [id])
  
  @@index([procurementItemId]) // ✅ ADD: Index
}

// ===== STEP 3: Add procurementPlanId to FoodProduction =====
model FoodProduction {
  id               String @id @default(cuid())
  sppgId           String
  programId        String
  menuId           String
  procurementPlanId String? // ✅ ADD: Track which plan funded this production
  
  // ... existing fields ...
  
  // ✅ ADD: Relation to ProcurementPlan
  procurementPlan ProcurementPlan? @relation(fields: [procurementPlanId], references: [id])
  
  @@index([procurementPlanId]) // ✅ ADD: Index
}

// ===== STEP 4: Add budget tracking to FoodDistribution =====
model FoodDistribution {
  id               String @id @default(cuid())
  sppgId           String
  programId        String
  productionId     String? // ✅ Make required
  procurementPlanId String? // ✅ ADD: Link to procurement plan
  
  // Existing cost fields
  transportCost Float?
  fuelCost Float?
  otherCosts Float?
  
  // ✅ ADD: Calculated total costs
  totalProcurementCost Float? // Cost of ingredients used
  totalProductionCost Float? // Production overhead
  totalDistributionCost Float? // Distribution costs
  totalCostPerMeal Float? // Total cost / recipients
  
  // ✅ ADD: Relation to ProcurementPlan
  procurementPlan ProcurementPlan? @relation(fields: [procurementPlanId], references: [id])
  
  @@index([procurementPlanId]) // ✅ ADD: Index
}
```

#### 2. Migration Script:

```typescript
// File: prisma/migrations/XXX_add_procurement_integration/migration.sql

-- Step 1: Add menuPlanId to ProcurementPlan
ALTER TABLE "procurement_plans" 
  ADD COLUMN "menuPlanId" TEXT,
  ADD COLUMN "autoGeneratedItems" JSONB,
  ADD COLUMN "menuBasedBudget" DOUBLE PRECISION;

-- Step 2: Add index
CREATE INDEX "procurement_plans_menuPlanId_idx" ON "procurement_plans"("menuPlanId");

-- Step 3: Add foreign key
ALTER TABLE "procurement_plans"
  ADD CONSTRAINT "procurement_plans_menuPlanId_fkey" 
  FOREIGN KEY ("menuPlanId") REFERENCES "menu_plans"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Add procurementItemId to ProductionStockUsage
ALTER TABLE "production_stock_usage"
  ADD COLUMN "procurementItemId" TEXT;

CREATE INDEX "production_stock_usage_procurementItemId_idx" 
  ON "production_stock_usage"("procurementItemId");

ALTER TABLE "production_stock_usage"
  ADD CONSTRAINT "production_stock_usage_procurementItemId_fkey"
  FOREIGN KEY ("procurementItemId") REFERENCES "procurement_items"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 5: Add procurementPlanId to FoodProduction
ALTER TABLE "food_productions"
  ADD COLUMN "procurementPlanId" TEXT;

CREATE INDEX "food_productions_procurementPlanId_idx"
  ON "food_productions"("procurementPlanId");

ALTER TABLE "food_productions"
  ADD CONSTRAINT "food_productions_procurementPlanId_fkey"
  FOREIGN KEY ("procurementPlanId") REFERENCES "procurement_plans"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 6: Add cost tracking to FoodDistribution
ALTER TABLE "food_distributions"
  ADD COLUMN "procurementPlanId" TEXT,
  ADD COLUMN "totalProcurementCost" DOUBLE PRECISION,
  ADD COLUMN "totalProductionCost" DOUBLE PRECISION,
  ADD COLUMN "totalDistributionCost" DOUBLE PRECISION,
  ADD COLUMN "totalCostPerMeal" DOUBLE PRECISION;

CREATE INDEX "food_distributions_procurementPlanId_idx"
  ON "food_distributions"("procurementPlanId");

ALTER TABLE "food_distributions"
  ADD CONSTRAINT "food_distributions_procurementPlanId_fkey"
  FOREIGN KEY ("procurementPlanId") REFERENCES "procurement_plans"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
```

#### 3. API Integration Services:

**A. Procurement-Menu Integration Service:**
```typescript
// File: src/services/procurement/ProcurementMenuIntegrationService.ts

import { db } from '@/lib/prisma'

interface MenuPlanIngredient {
  inventoryItemId: string
  itemName: string
  totalQuantityNeeded: number
  unit: string
  estimatedCost: number
  menuCount: number
}

export class ProcurementMenuIntegrationService {
  /**
   * Calculate required ingredients from menu plan
   */
  static async calculateRequiredIngredientsFromMenuPlan(
    menuPlanId: string,
    targetRecipients: number,
    sppgId: string
  ): Promise<MenuPlanIngredient[]> {
    // 1. Get menu plan with all assignments
    const menuPlan = await db.menuPlan.findUnique({
      where: { 
        id: menuPlanId,
        sppgId // Multi-tenant security
      },
      include: {
        assignments: {
          include: {
            menu: {
              include: {
                ingredients: {
                  include: {
                    inventoryItem: {
                      select: {
                        id: true,
                        itemName: true,
                        unit: true,
                        currentPrice: true,
                        currentStock: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!menuPlan) {
      throw new Error('Menu plan not found')
    }

    // 2. Aggregate ingredients across all menus
    const ingredientMap = new Map<string, MenuPlanIngredient>()

    for (const assignment of menuPlan.assignments) {
      for (const ingredient of assignment.menu.ingredients) {
        const key = ingredient.inventoryItemId
        
        if (!ingredientMap.has(key)) {
          ingredientMap.set(key, {
            inventoryItemId: ingredient.inventoryItemId,
            itemName: ingredient.inventoryItem.itemName,
            totalQuantityNeeded: 0,
            unit: ingredient.inventoryItem.unit,
            estimatedCost: 0,
            menuCount: 0
          })
        }

        const item = ingredientMap.get(key)!
        
        // Calculate quantity needed
        // ingredient.quantity is per 100g serving
        // Scale by targetRecipients and menu servingSize
        const quantityPerServing = ingredient.quantity
        const totalQuantity = (quantityPerServing * targetRecipients) / 100
        
        item.totalQuantityNeeded += totalQuantity
        item.estimatedCost = item.totalQuantityNeeded * ingredient.inventoryItem.currentPrice
        item.menuCount += 1
      }
    }

    return Array.from(ingredientMap.values())
  }

  /**
   * Calculate total budget from required ingredients
   */
  static calculateTotalBudget(ingredients: MenuPlanIngredient[]): number {
    return ingredients.reduce((sum, item) => sum + item.estimatedCost, 0)
  }

  /**
   * Generate procurement plan from menu plan
   */
  static async generateProcurementPlanFromMenu(
    menuPlanId: string,
    sppgId: string,
    targetRecipients: number,
    planName: string,
    planMonth: string,
    planYear: number
  ) {
    // 1. Calculate required ingredients
    const requiredIngredients = await this.calculateRequiredIngredientsFromMenuPlan(
      menuPlanId,
      targetRecipients,
      sppgId
    )

    // 2. Calculate budget
    const totalBudget = this.calculateTotalBudget(requiredIngredients)

    // 3. Create procurement plan
    const procurementPlan = await db.procurementPlan.create({
      data: {
        sppgId,
        menuPlanId, // ✅ Link to menu plan
        planName,
        planMonth,
        planYear,
        targetRecipients,
        totalBudget,
        menuBasedBudget: totalBudget, // Store calculated budget
        autoGeneratedItems: requiredIngredients, // Store suggested items
        approvalStatus: 'DRAFT'
      }
    })

    return {
      procurementPlan,
      requiredIngredients,
      totalBudget
    }
  }

  /**
   * Validate if procurement plan covers menu requirements
   */
  static async validateProcurementCoverage(
    procurementPlanId: string,
    sppgId: string
  ): Promise<{
    isValid: boolean
    missingItems: MenuPlanIngredient[]
    sufficientItems: MenuPlanIngredient[]
  }> {
    const plan = await db.procurementPlan.findUnique({
      where: { 
        id: procurementPlanId,
        sppgId
      },
      include: {
        procurements: {
          include: {
            items: true
          }
        }
      }
    })

    if (!plan || !plan.menuPlanId) {
      throw new Error('Procurement plan or menu plan link not found')
    }

    // Get required ingredients from menu
    const requiredIngredients = await this.calculateRequiredIngredientsFromMenuPlan(
      plan.menuPlanId,
      plan.targetRecipients,
      sppgId
    )

    // Get procured items
    const procuredItems = new Map<string, number>()
    for (const procurement of plan.procurements) {
      for (const item of procurement.items) {
        if (item.inventoryItemId) {
          const current = procuredItems.get(item.inventoryItemId) || 0
          procuredItems.set(
            item.inventoryItemId,
            current + (item.receivedQuantity || 0)
          )
        }
      }
    }

    // Compare required vs procured
    const missingItems: MenuPlanIngredient[] = []
    const sufficientItems: MenuPlanIngredient[] = []

    for (const required of requiredIngredients) {
      const procured = procuredItems.get(required.inventoryItemId) || 0
      
      if (procured < required.totalQuantityNeeded) {
        missingItems.push({
          ...required,
          totalQuantityNeeded: required.totalQuantityNeeded - procured
        })
      } else {
        sufficientItems.push(required)
      }
    }

    return {
      isValid: missingItems.length === 0,
      missingItems,
      sufficientItems
    }
  }
}
```

**B. Production-Procurement Integration Service:**
```typescript
// File: src/services/production/ProductionProcurementIntegrationService.ts

import { db } from '@/lib/prisma'

export class ProductionProcurementIntegrationService {
  /**
   * Validate if production can start (all ingredients procured)
   */
  static async validateProductionReadiness(
    menuId: string,
    plannedPortions: number,
    sppgId: string,
    productionDate: Date
  ): Promise<{
    isReady: boolean
    missingIngredients: Array<{
      itemName: string
      required: number
      available: number
      unit: string
    }>
  }> {
    // 1. Get menu ingredients
    const menu = await db.nutritionMenu.findUnique({
      where: { id: menuId },
      include: {
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                itemName: true,
                currentStock: true,
                unit: true
              }
            }
          }
        }
      }
    })

    if (!menu) {
      throw new Error('Menu not found')
    }

    // 2. Calculate required quantities
    const missingIngredients = []

    for (const ingredient of menu.ingredients) {
      const requiredQty = (ingredient.quantity * plannedPortions) / 100
      const availableQty = ingredient.inventoryItem.currentStock

      if (availableQty < requiredQty) {
        missingIngredients.push({
          itemName: ingredient.inventoryItem.itemName,
          required: requiredQty,
          available: availableQty,
          unit: ingredient.inventoryItem.unit
        })
      }
    }

    return {
      isReady: missingIngredients.length === 0,
      missingIngredients
    }
  }

  /**
   * Record stock usage with procurement reference
   */
  static async recordStockUsageWithProcurement(
    productionId: string,
    inventoryItemId: string,
    quantityUsed: number,
    sppgId: string
  ) {
    // 1. Find latest procurement for this item
    const latestProcurementItem = await db.procurementItem.findFirst({
      where: {
        inventoryItemId,
        procurement: {
          sppgId,
          status: 'FULLY_RECEIVED'
        },
        receivedQuantity: { gt: 0 }
      },
      orderBy: {
        procurement: {
          actualDelivery: 'desc'
        }
      },
      include: {
        procurement: true
      }
    })

    if (!latestProcurementItem) {
      throw new Error(`Item ${inventoryItemId} has not been procured`)
    }

    // 2. Validate stock availability
    const inventoryItem = await db.inventoryItem.findUnique({
      where: { id: inventoryItemId }
    })

    if (!inventoryItem || inventoryItem.currentStock < quantityUsed) {
      throw new Error('Insufficient stock')
    }

    // 3. Record usage with procurement reference
    await db.productionStockUsage.create({
      data: {
        productionId,
        inventoryItemId,
        procurementItemId: latestProcurementItem.id, // ✅ Track source
        quantityUsed,
        unit: inventoryItem.unit,
        unitCostAtUse: latestProcurementItem.pricePerUnit, // ✅ Actual cost
        totalCost: quantityUsed * latestProcurementItem.pricePerUnit,
        usedAt: new Date(),
        recordedBy: 'system' // Should be actual user ID
      }
    })

    // 4. Update inventory stock
    await db.inventoryItem.update({
      where: { id: inventoryItemId },
      data: {
        currentStock: {
          decrement: quantityUsed
        }
      }
    })

    // 5. Create stock movement
    await db.stockMovement.create({
      data: {
        inventoryId: inventoryItemId,
        movementType: 'OUT',
        quantity: quantityUsed,
        unit: inventoryItem.unit,
        stockBefore: inventoryItem.currentStock,
        stockAfter: inventoryItem.currentStock - quantityUsed,
        unitCost: latestProcurementItem.pricePerUnit,
        totalCost: quantityUsed * latestProcurementItem.pricePerUnit,
        referenceType: 'PRODUCTION',
        referenceId: productionId,
        notes: 'Used for food production',
        movedBy: 'system', // Should be actual user ID
        movedAt: new Date()
      }
    })
  }

  /**
   * Calculate actual production cost from procurement data
   */
  static async calculateProductionCost(
    productionId: string,
    sppgId: string
  ): Promise<{
    totalIngredientCost: number
    ingredientBreakdown: Array<{
      itemName: string
      quantity: number
      unitCost: number
      totalCost: number
    }>
  }> {
    const usageRecords = await db.productionStockUsage.findMany({
      where: { 
        productionId,
        production: {
          sppgId // Multi-tenant security
        }
      },
      include: {
        inventoryItem: {
          select: {
            itemName: true,
            unit: true
          }
        }
      }
    })

    const breakdown = usageRecords.map(record => ({
      itemName: record.inventoryItem.itemName,
      quantity: record.quantityUsed,
      unitCost: record.unitCostAtUse,
      totalCost: record.totalCost
    }))

    const totalIngredientCost = usageRecords.reduce(
      (sum, record) => sum + record.totalCost,
      0
    )

    return {
      totalIngredientCost,
      ingredientBreakdown: breakdown
    }
  }
}
```

**C. Distribution Cost Tracking Service:**
```typescript
// File: src/services/distribution/DistributionCostTrackingService.ts

import { db } from '@/lib/prisma'

export class DistributionCostTrackingService {
  /**
   * Calculate total cost for distribution including procurement
   */
  static async calculateDistributionTotalCost(
    distributionId: string,
    sppgId: string
  ): Promise<{
    totalCost: number
    costPerMeal: number
    breakdown: {
      procurementCost: number
      productionCost: number
      distributionCost: number
    }
  }> {
    // 1. Get distribution with production
    const distribution = await db.foodDistribution.findUnique({
      where: { 
        id: distributionId,
        sppgId
      },
      include: {
        production: {
          include: {
            usageRecords: {
              include: {
                inventoryItem: true
              }
            }
          }
        }
      }
    })

    if (!distribution || !distribution.production) {
      throw new Error('Distribution or production not found')
    }

    // 2. Calculate procurement cost (from stock usage)
    const procurementCost = distribution.production.usageRecords.reduce(
      (sum, record) => sum + record.totalCost,
      0
    )

    // 3. Calculate production overhead (could be from settings)
    const productionCost = 0 // TODO: Add production overhead calculation

    // 4. Calculate distribution cost
    const distributionCost = 
      (distribution.transportCost || 0) +
      (distribution.fuelCost || 0) +
      (distribution.otherCosts || 0)

    const totalCost = procurementCost + productionCost + distributionCost
    const costPerMeal = distribution.actualRecipients 
      ? totalCost / distribution.actualRecipients
      : 0

    // 5. Update distribution with calculated costs
    await db.foodDistribution.update({
      where: { id: distributionId },
      data: {
        totalProcurementCost: procurementCost,
        totalProductionCost: productionCost,
        totalDistributionCost: distributionCost,
        totalCostPerMeal: costPerMeal
      }
    })

    return {
      totalCost,
      costPerMeal,
      breakdown: {
        procurementCost,
        productionCost,
        distributionCost
      }
    }
  }

  /**
   * Get procurement plan budget utilization
   */
  static async getProcurementPlanUtilization(
    procurementPlanId: string,
    sppgId: string
  ) {
    const plan = await db.procurementPlan.findUnique({
      where: { 
        id: procurementPlanId,
        sppgId
      },
      include: {
        procurements: {
          include: {
            items: true
          }
        }
      }
    })

    if (!plan) {
      throw new Error('Procurement plan not found')
    }

    // Calculate spent amount
    const totalSpent = plan.procurements.reduce((sum, procurement) => {
      return sum + procurement.totalAmount
    }, 0)

    // Calculate utilization percentage
    const utilizationPercent = (totalSpent / plan.totalBudget) * 100

    return {
      totalBudget: plan.totalBudget,
      totalSpent,
      remaining: plan.totalBudget - totalSpent,
      utilizationPercent,
      isOverBudget: totalSpent > plan.totalBudget
    }
  }
}
```

#### 4. Updated API Endpoints:

**A. Create Procurement Plan with Menu Integration:**
```typescript
// File: src/app/api/sppg/procurement/plans/route.ts (Updated POST)

import { ProcurementMenuIntegrationService } from '@/services/procurement/ProcurementMenuIntegrationService'

export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    const body = await request.json()
    
    // Validate schema (now includes menuPlanId)
    const validated = procurementPlanCreateSchema.parse(body)
    
    // ✅ NEW: Validate menu plan exists and is approved
    const menuPlan = await db.menuPlan.findUnique({
      where: {
        id: validated.menuPlanId,
        sppgId: session.user.sppgId,
        status: 'APPROVED'
      }
    })
    
    if (!menuPlan) {
      return NextResponse.json({
        success: false,
        error: 'Menu plan not found or not approved'
      }, { status: 400 })
    }
    
    // ✅ NEW: Generate procurement plan from menu
    const result = await ProcurementMenuIntegrationService
      .generateProcurementPlanFromMenu(
        validated.menuPlanId,
        session.user.sppgId!,
        validated.targetRecipients,
        validated.planName,
        validated.planMonth,
        validated.planYear
      )
    
    return NextResponse.json({
      success: true,
      data: result
    })
  })
}
```

**B. Start Production with Procurement Validation:**
```typescript
// File: src/app/api/sppg/production/[id]/start/route.ts (New)

import { ProductionProcurementIntegrationService } from '@/services/production/ProductionProcurementIntegrationService'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSppgAuth(request, async (session) => {
    // Get production
    const production = await db.foodProduction.findUnique({
      where: { 
        id: params.id,
        sppgId: session.user.sppgId
      }
    })
    
    if (!production) {
      return NextResponse.json({
        error: 'Production not found'
      }, { status: 404 })
    }
    
    // ✅ NEW: Validate production readiness
    const readiness = await ProductionProcurementIntegrationService
      .validateProductionReadiness(
        production.menuId,
        production.plannedPortions,
        session.user.sppgId!,
        production.productionDate
      )
    
    if (!readiness.isReady) {
      return NextResponse.json({
        success: false,
        error: 'Missing ingredients for production',
        details: readiness.missingIngredients
      }, { status: 400 })
    }
    
    // Start production...
    // Record stock usage with procurement reference...
    
    return NextResponse.json({
      success: true,
      message: 'Production started successfully'
    })
  })
}
```

---

## �️ DETAILED IMPLEMENTATION ROADMAP

### 📌 PRIORITAS PERBAIKAN:

**Urutan Perbaikan (Dependency-Based):**
```
1. Schema Migration (FOUNDATION) 
   ↓
2. Integration Services (BUSINESS LOGIC)
   ↓
3. API Endpoints (BACKEND)
   ↓
4. Frontend Components (UI/UX)
   ↓
5. Testing & Deployment (VALIDATION)
```

---

## 🚀 PHASE 1: DATABASE SCHEMA MIGRATION (Week 1)

### Day 1-2: Schema Design & Migration File

**Step 1.1: Create Migration File**
```bash
# Create new migration
npx prisma migrate dev --name add_procurement_integration --create-only
```

**Step 1.2: Edit Migration File**
```sql
-- File: prisma/migrations/XXXXXX_add_procurement_integration/migration.sql

-- ========================================
-- STEP 1: Add menuPlanId to ProcurementPlan
-- ========================================
ALTER TABLE "procurement_plans" 
  ADD COLUMN "menuPlanId" TEXT,
  ADD COLUMN "autoGeneratedItems" JSONB,
  ADD COLUMN "menuBasedBudget" DOUBLE PRECISION;

CREATE INDEX "procurement_plans_menuPlanId_idx" 
  ON "procurement_plans"("menuPlanId");

ALTER TABLE "procurement_plans"
  ADD CONSTRAINT "procurement_plans_menuPlanId_fkey" 
  FOREIGN KEY ("menuPlanId") REFERENCES "menu_plans"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================
-- STEP 2: Add procurementItemId to ProductionStockUsage
-- ========================================
ALTER TABLE "production_stock_usage"
  ADD COLUMN "procurementItemId" TEXT;

CREATE INDEX "production_stock_usage_procurementItemId_idx" 
  ON "production_stock_usage"("procurementItemId");

ALTER TABLE "production_stock_usage"
  ADD CONSTRAINT "production_stock_usage_procurementItemId_fkey"
  FOREIGN KEY ("procurementItemId") REFERENCES "procurement_items"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================
-- STEP 3: Add procurementPlanId to FoodProduction
-- ========================================
ALTER TABLE "food_productions"
  ADD COLUMN "procurementPlanId" TEXT;

CREATE INDEX "food_productions_procurementPlanId_idx"
  ON "food_productions"("procurementPlanId");

ALTER TABLE "food_productions"
  ADD CONSTRAINT "food_productions_procurementPlanId_fkey"
  FOREIGN KEY ("procurementPlanId") REFERENCES "procurement_plans"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================
-- STEP 4: Add cost tracking to FoodDistribution
-- ========================================
ALTER TABLE "food_distributions"
  ADD COLUMN "procurementPlanId" TEXT,
  ADD COLUMN "totalProcurementCost" DOUBLE PRECISION,
  ADD COLUMN "totalProductionCost" DOUBLE PRECISION,
  ADD COLUMN "totalDistributionCost" DOUBLE PRECISION,
  ADD COLUMN "totalCostPerMeal" DOUBLE PRECISION;

CREATE INDEX "food_distributions_procurementPlanId_idx"
  ON "food_distributions"("procurementPlanId");

ALTER TABLE "food_distributions"
  ADD CONSTRAINT "food_distributions_procurementPlanId_fkey"
  FOREIGN KEY ("procurementPlanId") REFERENCES "procurement_plans"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
```

**Step 1.3: Update Prisma Schema**
```prisma
// File: prisma/schema.prisma (Add these changes)

model ProcurementPlan {
  // ... existing fields ...
  
  // ✅ NEW FIELDS
  menuPlanId String? // Link to menu plan
  autoGeneratedItems Json? // Store suggested items from menu
  menuBasedBudget Float? // Budget calculated from menu
  
  // ✅ NEW RELATION
  menuPlan MenuPlan? @relation(fields: [menuPlanId], references: [id])
  productions FoodProduction[] @relation("ProcurementPlanProductions")
  distributions FoodDistribution[] @relation("ProcurementPlanDistributions")
  
  @@index([menuPlanId])
}

model ProductionStockUsage {
  // ... existing fields ...
  
  // ✅ NEW FIELD
  procurementItemId String? // Track which procurement this came from
  
  // ✅ NEW RELATION
  procurementItem ProcurementItem? @relation(fields: [procurementItemId], references: [id])
  
  @@index([procurementItemId])
}

model FoodProduction {
  // ... existing fields ...
  
  // ✅ NEW FIELD
  procurementPlanId String? // Track which plan funded this production
  
  // ✅ NEW RELATION
  procurementPlan ProcurementPlan? @relation("ProcurementPlanProductions", fields: [procurementPlanId], references: [id])
  
  @@index([procurementPlanId])
}

model FoodDistribution {
  // ... existing fields ...
  
  // ✅ NEW FIELDS
  procurementPlanId String? // Link to procurement plan
  totalProcurementCost Float? // Cost of ingredients used
  totalProductionCost Float? // Production overhead
  totalDistributionCost Float? // Distribution costs
  totalCostPerMeal Float? // Total cost / recipients
  
  // ✅ NEW RELATION
  procurementPlan ProcurementPlan? @relation("ProcurementPlanDistributions", fields: [procurementPlanId], references: [id])
  
  @@index([procurementPlanId])
}

model MenuPlan {
  // ... existing fields ...
  
  // ✅ NEW RELATION
  procurementPlans ProcurementPlan[] @relation("MenuPlanProcurements")
}

model ProcurementItem {
  // ... existing fields ...
  
  // ✅ NEW RELATION
  productionUsages ProductionStockUsage[] @relation("ProcurementItemUsages")
}
```

### Day 3: Test Migration

**Step 1.4: Run Migration**
```bash
# Generate Prisma client
npx prisma generate

# Apply migration to development
npx prisma migrate dev

# Verify migration
npx prisma migrate status

# Check database
npx prisma studio
```

**Step 1.5: Test Schema Changes**
```bash
# Run test queries
npm run test:schema
```

### Day 4-5: Backfill Existing Data (Optional)

**Step 1.6: Create Backfill Script**
```typescript
// File: scripts/backfill-procurement-integration.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfillProcurementIntegration() {
  console.log('🔄 Starting backfill process...')
  
  // 1. Link existing procurement plans to menu plans (if possible)
  // This is optional and depends on data availability
  
  // 2. Initialize cost fields to 0
  await prisma.foodDistribution.updateMany({
    where: {
      totalProcurementCost: null
    },
    data: {
      totalProcurementCost: 0,
      totalProductionCost: 0,
      totalDistributionCost: 0,
      totalCostPerMeal: 0
    }
  })
  
  console.log('✅ Backfill complete!')
}

backfillProcurementIntegration()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Run backfill:**
```bash
npx tsx scripts/backfill-procurement-integration.ts
```

---

## 🏗️ PHASE 2: INTEGRATION SERVICES (Week 2-3)

### Week 2, Day 1-2: ProcurementMenuIntegrationService

**Step 2.1: Create Service File**
```bash
mkdir -p src/services/procurement
touch src/services/procurement/ProcurementMenuIntegrationService.ts
```

**Step 2.2: Implement Service Methods (Priority Order)**

1. ✅ `calculateRequiredIngredientsFromMenuPlan()` - HIGH PRIORITY
2. ✅ `calculateTotalBudget()` - HIGH PRIORITY
3. ✅ `generateProcurementPlanFromMenu()` - HIGH PRIORITY
4. ✅ `validateProcurementCoverage()` - MEDIUM PRIORITY

**Implementation checklist:**
- [ ] Create service class structure
- [ ] Implement calculateRequiredIngredientsFromMenuPlan
- [ ] Implement calculateTotalBudget
- [ ] Implement generateProcurementPlanFromMenu
- [ ] Implement validateProcurementCoverage
- [ ] Add error handling
- [ ] Add logging
- [ ] Write JSDoc documentation

**Testing:**
```bash
# Create test file
touch src/services/procurement/__tests__/ProcurementMenuIntegrationService.test.ts

# Run tests
npm run test src/services/procurement/__tests__
```

### Week 2, Day 3-4: ProductionProcurementIntegrationService

**Step 2.3: Create Service File**
```bash
mkdir -p src/services/production
touch src/services/production/ProductionProcurementIntegrationService.ts
```

**Step 2.4: Implement Service Methods (Priority Order)**

1. ✅ `validateProductionReadiness()` - CRITICAL
2. ✅ `recordStockUsageWithProcurement()` - CRITICAL
3. ✅ `calculateProductionCost()` - HIGH PRIORITY

**Implementation checklist:**
- [ ] Create service class structure
- [ ] Implement validateProductionReadiness
- [ ] Implement recordStockUsageWithProcurement
- [ ] Implement calculateProductionCost
- [ ] Add transaction handling
- [ ] Add error handling
- [ ] Write unit tests

### Week 2, Day 5: DistributionCostTrackingService

**Step 2.5: Create Service File**
```bash
mkdir -p src/services/distribution
touch src/services/distribution/DistributionCostTrackingService.ts
```

**Step 2.6: Implement Service Methods**

1. ✅ `calculateDistributionTotalCost()` - HIGH PRIORITY
2. ✅ `getProcurementPlanUtilization()` - MEDIUM PRIORITY

**Implementation checklist:**
- [ ] Create service class structure
- [ ] Implement calculateDistributionTotalCost
- [ ] Implement getProcurementPlanUtilization
- [ ] Add cost breakdown logic
- [ ] Write unit tests

### Week 3: Service Testing & Refinement

**Step 2.7: Integration Testing**
```bash
# Create integration test suite
mkdir -p src/services/__tests__/integration
touch src/services/__tests__/integration/procurement-workflow.test.ts

# Test complete workflow
npm run test:integration
```

**Test scenarios:**
- [ ] Menu Plan → Procurement Plan generation
- [ ] Procurement → Production validation
- [ ] Production → Cost calculation
- [ ] Distribution → Total cost tracking
- [ ] End-to-end workflow test

---

## 🔌 PHASE 3: API ENDPOINTS (Week 4)

### Day 1: Update Procurement Plan API

**Step 3.1: Update POST /api/sppg/procurement/plans**

```typescript
// File: src/app/api/sppg/procurement/plans/route.ts

// ✅ CHANGES NEEDED:
// 1. Add menuPlanId to request schema
// 2. Validate menu plan exists and is approved
// 3. Use ProcurementMenuIntegrationService.generateProcurementPlanFromMenu()
// 4. Return suggested items from menu
```

**Implementation steps:**
- [ ] Update planSchemas.ts to include menuPlanId (required)
- [ ] Add menu plan validation
- [ ] Integrate ProcurementMenuIntegrationService
- [ ] Update response format
- [ ] Add error handling for missing menu plan
- [ ] Update API documentation

**Step 3.2: Create GET /api/sppg/procurement/plans/[id]/suggested-items**

```typescript
// New endpoint to get suggested items from menu
// Returns: List of items needed based on menu plan
```

### Day 2: Update Production API

**Step 3.3: Create POST /api/sppg/production/[id]/validate-readiness**

```typescript
// File: src/app/api/sppg/production/[id]/validate-readiness/route.ts

// ✅ IMPLEMENT:
// 1. Check if all ingredients are procured
// 2. Check if stock is sufficient
// 3. Return missing ingredients list
```

**Step 3.4: Update POST /api/sppg/production/[id]/start**

```typescript
// ✅ CHANGES:
// 1. Add production readiness validation
// 2. Prevent start if ingredients missing
// 3. Link to procurement plan
```

**Step 3.5: Update Production Stock Usage Recording**

```typescript
// ✅ CHANGES:
// 1. Always include procurementItemId
// 2. Use actual procurement cost
// 3. Create stock movement with reference
```

### Day 3: Update Distribution API

**Step 3.6: Create POST /api/sppg/distribution/[id]/calculate-costs**

```typescript
// File: src/app/api/sppg/distribution/[id]/calculate-costs/route.ts

// ✅ IMPLEMENT:
// 1. Calculate procurement cost from production
// 2. Calculate production overhead
// 3. Calculate distribution costs
// 4. Update distribution record with costs
```

**Step 3.7: Update POST /api/sppg/distribution (create)**

```typescript
// ✅ CHANGES:
// 1. Link to procurement plan
// 2. Auto-calculate costs on creation
```

### Day 4: Create Dashboard/Reporting APIs

**Step 3.8: GET /api/sppg/procurement/dashboard/integration-status**

```typescript
// Returns:
// - Menu plans without procurement plans
// - Procurement plans without orders
// - Productions without procurement validation
// - Distributions without cost calculations
```

**Step 3.9: GET /api/sppg/reports/cost-analysis**

```typescript
// Returns:
// - Cost breakdown by phase (procurement/production/distribution)
// - Budget utilization
// - Cost per meal trends
// - Budget alerts
```

### Day 5: API Testing

**Step 3.10: Test All Updated Endpoints**

```bash
# Create test suite
mkdir -p src/app/api/__tests__
touch src/app/api/__tests__/procurement-integration.test.ts

# Run API tests
npm run test:api
```

**Test checklist:**
- [ ] Create procurement plan from menu
- [ ] Validate production readiness
- [ ] Record stock usage with procurement
- [ ] Calculate distribution costs
- [ ] Get integration status
- [ ] Get cost analysis reports

---

## 🎨 PHASE 4: FRONTEND COMPONENTS (Week 5-6)

### Week 5, Day 1-2: Procurement Plan Form

**Step 4.1: Update ProcurementPlanForm Component**

```typescript
// File: src/features/sppg/procurement/plans/components/ProcurementPlanForm.tsx

// ✅ CHANGES:
// 1. Add Menu Plan selector (required field)
// 2. Auto-calculate budget from menu
// 3. Show suggested items from menu
// 4. Allow override of auto-calculated values
```

**Implementation steps:**
- [ ] Add MenuPlanSelect component
- [ ] Integrate with menu plan API
- [ ] Auto-load suggested items on menu selection
- [ ] Display calculated budget
- [ ] Show ingredient breakdown
- [ ] Add override toggles

**Step 4.2: Create SuggestedItemsList Component**

```typescript
// New component to show items from menu
// Features:
// - List of required ingredients
// - Quantities needed
// - Estimated costs
// - Edit/override capabilities
```

### Week 5, Day 3: Production Validation UI

**Step 4.3: Create ProductionReadinessCheck Component**

```typescript
// File: src/features/sppg/production/components/ProductionReadinessCheck.tsx

// ✅ IMPLEMENT:
// 1. Check readiness before production start
// 2. Show missing ingredients
// 3. Show available stock
// 4. Link to procurement if needed
```

**Step 4.4: Update Production Start Flow**

```typescript
// ✅ CHANGES:
// 1. Add readiness check step
// 2. Prevent start if not ready
// 3. Show procurement link for missing items
// 4. Display procurement cost estimate
```

### Week 5, Day 4-5: Distribution Cost Display

**Step 4.5: Create CostBreakdownCard Component**

```typescript
// File: src/features/sppg/distribution/components/CostBreakdownCard.tsx

// ✅ IMPLEMENT:
// - Procurement cost (from production)
// - Production overhead
// - Distribution costs (transport, fuel, etc.)
// - Total cost
// - Cost per meal
// - Budget utilization %
```

**Step 4.6: Update Distribution Detail Page**

```typescript
// ✅ CHANGES:
// 1. Add CostBreakdownCard
// 2. Show budget comparison
// 3. Add cost alerts (if over budget)
```

### Week 6: Dashboard & Reports

**Step 4.7: Update SPPG Dashboard**

```typescript
// File: src/features/sppg/dashboard/components/DashboardStats.tsx

// ✅ ADD NEW METRICS:
// - Total budget utilization
// - Average cost per meal
// - Procurement → Production → Distribution flow status
// - Budget alerts count
```

**Step 4.8: Create Integration Status Widget**

```typescript
// New widget showing workflow completion:
// ✅ Menu Plan (X active)
// ✅ Procurement Plan (X linked)
// ✅ Orders (X completed)
// ⚠️ Production (X ready, Y missing ingredients)
// ✅ Distribution (X delivered)
```

**Step 4.9: Create Cost Analysis Report Page**

```typescript
// File: src/app/(sppg)/reports/cost-analysis/page.tsx

// ✅ IMPLEMENT:
// - Cost trends chart
// - Budget utilization by period
// - Cost breakdown pie chart
// - Cost per meal trends
// - Export to Excel/PDF
```

---

## 🧪 PHASE 5: TESTING & DEPLOYMENT (Week 7)

### Day 1-2: Integration Testing

**Step 5.1: End-to-End Testing**

```bash
# Create E2E test suite
mkdir -p tests/e2e/procurement-integration
touch tests/e2e/procurement-integration/workflow.spec.ts
```

**Test scenarios:**
```typescript
describe('Procurement Integration Workflow', () => {
  test('Complete workflow: Menu → Procurement → Production → Distribution', async () => {
    // 1. Create and approve menu plan
    // 2. Generate procurement plan from menu
    // 3. Create and receive procurement orders
    // 4. Start production with validation
    // 5. Distribute with cost calculation
    // 6. Verify cost accuracy
  })
  
  test('Production validation prevents start without ingredients', async () => {
    // 1. Create production without procurement
    // 2. Attempt to start
    // 3. Verify error about missing ingredients
  })
  
  test('Cost calculation is accurate across phases', async () => {
    // 1. Track costs through workflow
    // 2. Verify procurement cost in production
    // 3. Verify total cost in distribution
    // 4. Verify cost per meal calculation
  })
})
```

**Run E2E tests:**
```bash
npm run test:e2e
```

### Day 3: User Acceptance Testing (UAT)

**Step 5.2: Prepare UAT Environment**

```bash
# Deploy to staging
npm run deploy:staging

# Seed test data
npm run db:seed:integration-test
```

**Step 5.3: UAT Test Cases**

Create test cases document:
- [ ] Procurement planner can generate plan from menu
- [ ] Budget auto-calculates correctly
- [ ] Suggested items match menu requirements
- [ ] Production cannot start without ingredients
- [ ] Cost calculations are accurate
- [ ] Reports show correct data

**Step 5.4: Collect Feedback**

- [ ] Schedule UAT sessions with SPPG users
- [ ] Document issues and suggestions
- [ ] Prioritize fixes
- [ ] Implement critical fixes

### Day 4: Performance Testing

**Step 5.5: Load Testing**

```bash
# Run load tests
npm run test:load
```

**Test scenarios:**
- [ ] Concurrent procurement plan creation
- [ ] Bulk production validation
- [ ] Large-scale cost calculations
- [ ] Report generation with large datasets

**Step 5.6: Optimize Performance**

- [ ] Add database indexes if needed
- [ ] Optimize expensive queries
- [ ] Add caching where appropriate
- [ ] Optimize API response times

### Day 5: Documentation & Training

**Step 5.7: Update Documentation**

- [ ] Update API documentation
- [ ] Update user guide
- [ ] Create video tutorials
- [ ] Update developer documentation

**Step 5.8: Prepare Training Materials**

- [ ] Create training slides
- [ ] Record demo videos
- [ ] Prepare FAQ document
- [ ] Schedule training sessions

### Day 6-7: Production Deployment

**Step 5.9: Pre-deployment Checklist**

- [ ] All tests passing
- [ ] UAT approved
- [ ] Documentation updated
- [ ] Backup database
- [ ] Prepare rollback plan
- [ ] Schedule maintenance window

**Step 5.10: Deployment Steps**

```bash
# 1. Backup production database
npm run db:backup:production

# 2. Deploy new code
npm run deploy:production

# 3. Run migrations
npm run db:migrate:production

# 4. Verify deployment
npm run health-check:production

# 5. Monitor for issues
npm run monitor:production
```

**Step 5.11: Post-deployment Monitoring**

- [ ] Monitor error rates
- [ ] Monitor API performance
- [ ] Monitor database performance
- [ ] Check user feedback
- [ ] Fix any critical issues immediately

**Step 5.12: Rollback Plan (if needed)**

```bash
# If critical issues found:
npm run rollback:production
npm run db:migrate:rollback
```

---

## 📊 IMPLEMENTATION TRACKING

### Progress Tracker

```markdown
## Phase 1: Database Schema ⏳
- [ ] Day 1-2: Schema Design & Migration File
- [ ] Day 3: Test Migration
- [ ] Day 4-5: Backfill Existing Data

## Phase 2: Integration Services ⏳
- [ ] Week 2, Day 1-2: ProcurementMenuIntegrationService
- [ ] Week 2, Day 3-4: ProductionProcurementIntegrationService
- [ ] Week 2, Day 5: DistributionCostTrackingService
- [ ] Week 3: Service Testing & Refinement

## Phase 3: API Endpoints ⏳
- [ ] Day 1: Update Procurement Plan API
- [ ] Day 2: Update Production API
- [ ] Day 3: Update Distribution API
- [ ] Day 4: Create Dashboard/Reporting APIs
- [ ] Day 5: API Testing

## Phase 4: Frontend Components ⏳
- [ ] Week 5, Day 1-2: Procurement Plan Form
- [ ] Week 5, Day 3: Production Validation UI
- [ ] Week 5, Day 4-5: Distribution Cost Display
- [ ] Week 6: Dashboard & Reports

## Phase 5: Testing & Deployment ⏳
- [ ] Day 1-2: Integration Testing
- [ ] Day 3: User Acceptance Testing
- [ ] Day 4: Performance Testing
- [ ] Day 5: Documentation & Training
- [ ] Day 6-7: Production Deployment
```

### Daily Standup Template

```markdown
## Daily Progress Update

**Date:** [Date]
**Phase:** [Current Phase]
**Developer:** [Name]

### ✅ Completed Today:
- 

### 🚧 In Progress:
-

### ⏳ Planned for Tomorrow:
-

### 🚨 Blockers:
-

### 📝 Notes:
-
```

---

## 🎯 SUCCESS CRITERIA

### Definition of Done (DoD) per Phase:

**Phase 1 - Database:**
- ✅ All migrations run successfully
- ✅ All new fields indexed
- ✅ No breaking changes to existing data
- ✅ Schema validated with Prisma Studio

**Phase 2 - Services:**
- ✅ All service methods implemented
- ✅ Unit tests pass (>90% coverage)
- ✅ Integration tests pass
- ✅ Error handling complete
- ✅ JSDoc documentation complete

**Phase 3 - APIs:**
- ✅ All endpoints implemented
- ✅ All endpoints tested
- ✅ API documentation updated
- ✅ Postman collection updated
- ✅ Security validation passed

**Phase 4 - Frontend:**
- ✅ All components implemented
- ✅ UI/UX reviewed and approved
- ✅ Responsive design verified
- ✅ Accessibility checked
- ✅ Browser compatibility tested

**Phase 5 - Deployment:**
- ✅ All tests passed (unit/integration/E2E)
- ✅ UAT approved by stakeholders
- ✅ Performance benchmarks met
- ✅ Documentation complete
- ✅ Training completed
- ✅ Production deployment successful
- ✅ No critical issues in first 48 hours

---

## 🎯 SUCCESS METRICS

After integration, the system should achieve:

1. **Operational Efficiency:**
   - ✅ 100% of procurement plans linked to menu plans
   - ✅ 0% production starts without ingredient validation
   - ✅ 100% accurate cost-per-meal calculation

2. **Budget Control:**
   - ✅ Real-time budget utilization tracking
   - ✅ Automated alerts for budget overruns
   - ✅ Accurate forecasting based on menu plans

3. **Data Integrity:**
   - ✅ Complete audit trail from menu → procurement → production → distribution
   - ✅ No orphaned records
   - ✅ Consistent cost calculations

4. **User Experience:**
   - ✅ Auto-generated shopping lists from menus
   - ✅ Clear visibility of procurement status
   - ✅ Accurate production cost reports

---

## 🔚 CONCLUSION

**Current State:** Modul procurement berdiri sendiri tanpa integrasi dengan menu planning, production, dan distribution. Ini menyebabkan:
- ❌ Procurement tidak tahu apa yang perlu dibeli
- ❌ Production tidak validasi ketersediaan bahan
- ❌ Cost calculation tidak akurat
- ❌ Budget tracking tidak efektif

**Recommended Action:** Lakukan migrasi database dan implementasi service layer untuk mengintegrasikan seluruh workflow SPPG.

**Priority:** 🔴 CRITICAL - Must be fixed before production deployment

**Estimated Effort:** 7 weeks (1 developer full-time)

**Risk if Not Fixed:** System tidak dapat digunakan untuk operasional SPPG yang sesungguhnya karena workflow terputus dan data tidak akurat.

---

**Audit Date:** 31 Oktober 2025  
**Audited By:** GitHub Copilot + Bagizi-ID Development Team  
**Status:** REQUIRES IMMEDIATE ACTION
