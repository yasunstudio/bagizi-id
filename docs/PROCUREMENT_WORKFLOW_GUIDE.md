# 📋 PROCUREMENT WORKFLOW GUIDE - Bagizi-ID

> **Complete Enterprise Procurement Workflow Documentation**  
> Berdasarkan Prisma Schema Analysis - Bagizi-ID SaaS Platform  
> Version: 1.0.0 | Date: October 27, 2025

---

## 🎯 Executive Summary

Sistem Procurement Bagizi-ID adalah **enterprise-grade procurement management system** yang dirancang khusus untuk SPPG (Satuan Pelayanan Pemenuhan Gizi) dengan workflow **4-stage process**:

1. **Planning Phase** - Budget planning & allocation
2. **Procurement Phase** - Purchasing & ordering
3. **Receipt Phase** - Delivery & quality control
4. **Inventory Phase** - Stock management & tracking

---

## 📊 Data Model Architecture

### 🔷 Core Entities

#### 1. **ProcurementPlan** (Planning Phase)
```prisma
model ProcurementPlan {
  id               String            @id @default(cuid())
  sppgId           String            // Multi-tenant identifier
  programId        String?           // Optional: Link to nutrition program
  
  // Planning Details
  planName         String            // e.g., "Pengadaan Bulan Januari 2025"
  planMonth        String            // "2025-01" format
  planYear         Int               // 2025
  planQuarter      Int?              // Q1, Q2, Q3, Q4
  
  // Budget Allocation
  totalBudget      Float             // Total budget allocated
  allocatedBudget  Float             // Budget assigned to items
  usedBudget       Float             // Budget already spent
  remainingBudget  Float             // Budget still available
  
  // Category-based Budgeting
  proteinBudget    Float?            // Budget for protein items
  carbBudget       Float?            // Budget for carbohydrates
  vegetableBudget  Float?            // Budget for vegetables
  fruitBudget      Float?            // Budget for fruits
  otherBudget      Float?            // Budget for other categories
  
  // Target Planning
  targetRecipients Int               // Number of beneficiaries
  targetMeals      Int               // Number of meals to be produced
  costPerMeal      Float?            // Calculated cost per meal
  
  // Approval Workflow
  approvalStatus   String            // DRAFT, SUBMITTED, APPROVED, REJECTED
  submittedBy      String?           // User who submitted the plan
  submittedAt      DateTime?         // Submission timestamp
  approvedBy       String?           // User who approved the plan
  approvedAt       DateTime?         // Approval timestamp
  rejectionReason  String?           // Reason if rejected
  
  // Additional Fields
  notes            String?           // Planning notes
  emergencyBuffer  Float?            // Emergency budget buffer (%)
  
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  
  // Relations
  program          NutritionProgram? @relation(fields: [programId], references: [id])
  sppg             SPPG              @relation(fields: [sppgId], references: [id])
  procurements     Procurement[]     // Multiple procurement orders can reference this plan
}
```

**Business Logic:**
- ✅ **One plan per month per SPPG** (best practice)
- ✅ **Approval required** before procurement can start
- ✅ **Budget tracking** in real-time (allocated vs used vs remaining)
- ✅ **Category-based budgeting** for better cost control
- ✅ **Emergency buffer** for unexpected price changes

---

#### 2. **Procurement** (Purchasing Phase)
```prisma
model Procurement {
  id               String            @id @default(cuid())
  sppgId           String            // Multi-tenant identifier
  planId           String?           // Link to procurement plan
  
  // Order Identification
  procurementCode  String            @unique  // e.g., "PO-2025-01-001"
  procurementDate  DateTime          @default(now())
  
  // Delivery Tracking
  expectedDelivery DateTime?         // Expected delivery date
  actualDelivery   DateTime?         // Actual delivery date
  
  // Supplier Information
  supplierId       String            // Foreign key to Supplier
  supplierName     String?           // Cached for performance
  supplierContact  String?           // Contact person
  
  // Procurement Method
  purchaseMethod   ProcurementMethod // DIRECT, TENDER, CONTRACT, EMERGENCY, BULK
  paymentTerms     String?           // e.g., "Net 30", "Cash on Delivery"
  
  // Financial Breakdown
  subtotalAmount   Float             // Sum of all items before tax/discount
  taxAmount        Float             @default(0)  // VAT/PPN
  discountAmount   Float             @default(0)  // Supplier discount
  shippingCost     Float             @default(0)  // Delivery cost
  totalAmount      Float             // Final total amount
  
  // Payment Tracking
  paidAmount       Float             @default(0)  // Amount already paid
  paymentStatus    String            @default("UNPAID")  // UNPAID, PARTIAL, PAID
  paymentDue       DateTime?         // Payment deadline
  
  // Status Tracking
  status           ProcurementStatus @default(DRAFT)
  // DRAFT → PENDING_APPROVAL → APPROVED → ORDERED → 
  // PARTIALLY_RECEIVED → FULLY_RECEIVED → COMPLETED
  
  deliveryStatus   String            @default("ORDERED")
  // ORDERED, IN_TRANSIT, DELIVERED, PARTIALLY_DELIVERED
  
  // Quality Control
  qualityGrade     QualityGrade?     // EXCELLENT, GOOD, FAIR, POOR, REJECTED
  qualityNotes     String?           // Quality inspection notes
  
  // Documentation
  receiptNumber    String?           // Delivery receipt number
  receiptPhoto     String?           // Photo of delivery receipt
  deliveryPhoto    String?           // Photo of delivered goods
  invoiceNumber    String?           // Supplier invoice number
  
  // Logistics
  deliveryMethod   String?           // e.g., "Own Fleet", "Third Party"
  transportCost    Float?            // Transportation cost
  packagingType    String?           // Packaging details
  
  // Inspection & Acceptance
  inspectedBy      String?           // User who inspected goods
  inspectedAt      DateTime?         // Inspection timestamp
  acceptanceStatus String?           // ACCEPTED, REJECTED, CONDITIONAL
  rejectionReason  String?           // Reason if rejected
  
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  
  // Relations
  items            ProcurementItem[] // Multiple items in one order
  plan             ProcurementPlan?  @relation(fields: [planId], references: [id])
  sppg             SPPG              @relation(fields: [sppgId], references: [id])
  supplier         Supplier          @relation(fields: [supplierId], references: [id])
}
```

**Business Logic:**
- ✅ **Unique procurement code** for tracking (auto-generated)
- ✅ **Multi-status workflow** from draft to completed
- ✅ **Partial payment support** (down payment, installments)
- ✅ **Quality control integration** before acceptance
- ✅ **Photo documentation** for compliance & audit trail
- ✅ **Automatic stock movement** on acceptance

---

#### 3. **ProcurementItem** (Line Items)
```prisma
model ProcurementItem {
  id                 String            @id @default(cuid())
  procurementId      String            // Parent procurement order
  inventoryItemId    String?           // Link to master inventory item
  
  // Item Identification
  itemName           String            // Item description
  itemCode           String?           // Item SKU/code
  category           InventoryCategory // PROTEIN, KARBOHIDRAT, SAYURAN, etc.
  brand              String?           // Brand name if applicable
  
  // Quantity Tracking
  orderedQuantity    Float             // Quantity ordered
  receivedQuantity   Float?            // Quantity actually received
  unit               String            // kg, liter, pcs, etc.
  
  // Pricing
  pricePerUnit       Float             // Unit price from supplier
  totalPrice         Float             // Ordered qty × price per unit
  discountPercent    Float             @default(0)  // Discount percentage
  discountAmount     Float             @default(0)  // Discount amount
  finalPrice         Float             // Total price after discount
  
  // Quality Standards
  qualityStandard    String?           // Required quality standard
  qualityReceived    String?           // Quality received description
  gradeRequested     String?           // Quality grade requested
  gradeReceived      String?           // Quality grade received
  
  // Product Information
  expiryDate         DateTime?         // Expiration date
  batchNumber        String?           // Batch/lot number
  productionDate     DateTime?         // Production date
  storageRequirement String?           // Storage conditions required
  
  // Acceptance Control
  isAccepted         Boolean           @default(true)  // Item accepted?
  rejectionReason    String?           // Why rejected?
  returnedQuantity   Float             @default(0)     // Returned qty
  
  // Nutrition Information (per 100g)
  caloriesPer100g    Float?
  proteinPer100g     Float?
  fatPer100g         Float?
  carbsPer100g       Float?
  
  notes              String?           // Additional notes
  
  // Relations
  inventoryItem      InventoryItem?    @relation(fields: [inventoryItemId], references: [id])
  procurement        Procurement       @relation(fields: [procurementId], references: [id])
}
```

**Business Logic:**
- ✅ **Ordered vs Received tracking** (handle partial deliveries)
- ✅ **Quality control per item** (accept/reject individual items)
- ✅ **Batch tracking** for food safety compliance
- ✅ **Automatic price calculation** with discount support
- ✅ **Nutrition data capture** for menu planning

---

#### 4. **Supplier** (Vendor Management)
```prisma
model Supplier {
  id                    String               @id @default(cuid())
  sppgId                String               // Multi-tenant
  
  // Basic Information
  supplierCode          String               @unique  // e.g., "SUP-001"
  supplierName          String               // Display name
  businessName          String?              // Legal business name
  supplierType          SupplierType         // LOCAL, REGIONAL, NATIONAL, etc.
  category              String               // Primary category (Protein, Vegetable, etc.)
  
  // Contact Information
  primaryContact        String               // Contact person name
  phone                 String               // Primary phone
  email                 String?              // Email address
  whatsapp              String?              // WhatsApp number
  website               String?              // Website URL
  
  // Location
  address               String               // Full address
  city                  String
  province              String
  postalCode            String?
  coordinates           String?              // Lat,Long for mapping
  deliveryRadius        Float?               // Delivery coverage in km
  
  // Business Licenses & Certifications
  businessLicense       String?              // SIUP/NIB number
  taxId                 String?              // NPWP
  hallaLicense          String?              // Halal certification
  foodSafetyLicense     String?              // Food safety permit
  isHalalCertified      Boolean              @default(false)
  isFoodSafetyCertified Boolean              @default(false)
  isISOCertified        Boolean              @default(false)
  certifications        String[]             // Other certifications
  
  // Payment Terms
  paymentTerms          String               @default("CASH_ON_DELIVERY")
  creditLimit           Float?               @default(0)
  currency              String               @default("IDR")
  bankAccount           String?              // Account number
  bankName              String?              // Bank name
  
  // Performance Metrics
  overallRating         Float                @default(0)  // 0-5 stars
  qualityRating         Float                @default(0)
  deliveryRating        Float                @default(0)
  priceCompetitiveness  Float                @default(0)
  serviceRating         Float                @default(0)
  
  totalOrders           Int                  @default(0)
  successfulDeliveries  Int                  @default(0)
  failedDeliveries      Int                  @default(0)
  averageDeliveryTime   Int?                 // in hours
  onTimeDeliveryRate    Float                @default(0)  // percentage
  totalPurchaseValue    Float                @default(0)
  
  // Ordering Capabilities
  minOrderValue         Float?               @default(0)
  maxOrderCapacity      Float?               // Maximum order they can handle
  leadTimeHours         Int?                 @default(24)
  deliveryDays          String[]             // ["MONDAY", "WEDNESDAY", "FRIDAY"]
  specialties           String[]             // Specialized products
  
  // Status & Compliance
  isActive              Boolean              @default(true)
  isPreferred           Boolean              @default(false)  // Preferred supplier
  isBlacklisted         Boolean              @default(false)
  blacklistReason       String?
  complianceStatus      String               @default("PENDING")
  lastInspectionDate    DateTime?
  lastAuditDate         DateTime?
  nextAuditDue          DateTime?
  
  // Partnership Details
  partnershipLevel      String               @default("STANDARD")
  // STANDARD, SILVER, GOLD, PLATINUM
  contractStartDate     DateTime?
  contractEndDate       DateTime?
  relationshipManager   String?              // Account manager
  
  // Integration
  hasAPIIntegration     Boolean              @default(false)
  apiEndpoint           String?
  supportsEDI           Boolean              @default(false)
  preferredOrderMethod  String               @default("PHONE")
  // PHONE, EMAIL, WHATSAPP, API, PORTAL
  
  createdAt             DateTime             @default(now())
  updatedAt             DateTime             @updatedAt
  lastContactDate       DateTime?
  
  // Relations
  inventoryItems        InventoryItem[]      @relation("SupplierItems")
  procurements          Procurement[]        @relation("SupplierProcurements")
  supplierContracts     SupplierContract[]
  supplierEvaluations   SupplierEvaluation[]
  supplierProducts      SupplierProduct[]    // Product catalog
  sppg                  SPPG                 @relation(fields: [sppgId], references: [id])
}
```

**Business Logic:**
- ✅ **Comprehensive vendor management** with ratings
- ✅ **Performance tracking** (delivery rate, quality, etc.)
- ✅ **Compliance management** (certifications, audits)
- ✅ **Partnership tiers** for preferred suppliers
- ✅ **Product catalog** integration

---

#### 5. **InventoryItem** (Stock Management)
```prisma
model InventoryItem {
  id                  String                 @id @default(cuid())
  sppgId              String                 // Multi-tenant
  
  // Item Identification
  itemName            String                 // Item name
  itemCode            String?                // SKU/code
  brand               String?
  category            InventoryCategory      // PROTEIN, KARBOHIDRAT, etc.
  unit                String                 // Base unit (kg, liter, pcs)
  
  // Stock Levels
  currentStock        Float                  @default(0)
  minStock            Float                  // Reorder point
  maxStock            Float                  // Maximum stock level
  reorderQuantity     Float?                 // Suggested reorder qty
  
  // Pricing
  lastPrice           Float?                 // Last purchase price
  averagePrice        Float?                 // Moving average price
  costPerUnit         Float?                 // Current cost per unit
  
  // Supplier Preference
  preferredSupplierId String?                // Preferred supplier ID
  legacySupplierName  String?                // Legacy supplier name
  supplierContact     String?
  leadTime            Int?                   // Lead time in days
  
  // Storage
  storageLocation     String                 // Where stored
  storageCondition    String?                // Storage requirements
  hasExpiry           Boolean                @default(false)
  shelfLife           Int?                   // Shelf life in days
  
  // Nutrition Information (per 100g)
  calories            Float?
  protein             Float?
  carbohydrates       Float?
  fat                 Float?
  fiber               Float?
  
  // Vitamins (per 100g)
  vitaminA            Float?
  vitaminB1           Float?
  vitaminC            Float?
  // ... other vitamins
  
  // Minerals (per 100g)
  calcium             Float?
  iron                Float?
  // ... other minerals
  
  isActive            Boolean                @default(true)
  createdAt           DateTime               @default(now())
  updatedAt           DateTime               @updatedAt
  
  // Relations
  preferredSupplier   Supplier?              @relation(fields: [preferredSupplierId], references: [id])
  sppg                SPPG                   @relation(fields: [sppgId], references: [id])
  menuIngredients     MenuIngredient[]       // Used in menu recipes
  procurementItems    ProcurementItem[]      // Purchase history
  stockMovements      StockMovement[]        // Stock transactions
  productionUsages    ProductionStockUsage[] // Production usage
}
```

**Business Logic:**
- ✅ **Min/Max stock control** with automatic reorder alerts
- ✅ **Price tracking** (last price, average, current)
- ✅ **Comprehensive nutrition data** for menu planning
- ✅ **Supplier preference** for quick reordering
- ✅ **Multi-purpose item** (procurement, menu, production)

---

#### 6. **StockMovement** (Inventory Transactions)
```prisma
model StockMovement {
  id              String        @id @default(cuid())
  inventoryId     String        // Which item
  
  // Movement Details
  movementType    MovementType  // IN, OUT, ADJUSTMENT, EXPIRED, DAMAGED, TRANSFER
  quantity        Float         // Quantity moved
  unit            String        // Unit of measurement
  
  // Stock Tracking
  stockBefore     Float         // Stock before movement
  stockAfter      Float         // Stock after movement
  
  // Costing
  unitCost        Float?        // Cost per unit
  totalCost       Float?        // Total transaction cost
  
  // Reference Tracking
  referenceType   String?       // "PROCUREMENT", "PRODUCTION", "DISTRIBUTION"
  referenceId     String?       // ID of reference document
  referenceNumber String?       // Document number (PO-001, PROD-001, etc.)
  
  // Product Tracking
  batchNumber     String?       // Batch/lot number
  expiryDate      DateTime?     // Expiration date
  
  // Documentation
  notes           String?       // Movement notes
  documentUrl     String?       // Supporting document
  
  // Approval
  movedBy         String        // User who created movement
  movedAt         DateTime      @default(now())
  approvedBy      String?       // User who approved
  approvedAt      DateTime?     // Approval timestamp
  
  // Relations
  inventory       InventoryItem @relation(fields: [inventoryId], references: [id])
}
```

**Business Logic:**
- ✅ **Complete audit trail** of all stock movements
- ✅ **Before/After stock tracking** for reconciliation
- ✅ **Reference linking** to source documents
- ✅ **Batch & expiry tracking** for FIFO/FEFO
- ✅ **Approval workflow** for critical movements

---

## 🔄 Complete Procurement Workflow

### **Stage 1: Planning Phase** 📋

#### 1.1 Create Procurement Plan
```typescript
// User: SPPG_KEPALA, SPPG_ADMIN, SPPG_AKUNTAN
// Route: /procurement/plans/create

const createProcurementPlan = {
  step: "Create Monthly Procurement Plan",
  
  inputs: {
    planName: "Pengadaan Bahan Makanan Januari 2025",
    planMonth: "2025-01",
    planYear: 2025,
    planQuarter: 1,
    totalBudget: 50000000, // Rp 50 juta
    targetRecipients: 500,
    targetMeals: 10000, // 500 anak × 20 hari
    
    // Category budgeting (optional but recommended)
    proteinBudget: 20000000,    // 40%
    carbBudget: 12500000,       // 25%
    vegetableBudget: 10000000,  // 20%
    fruitBudget: 5000000,       // 10%
    otherBudget: 2500000,       // 5%
    
    emergencyBuffer: 10, // 10% emergency buffer
    notes: "Fokus protein berkualitas tinggi untuk perbaikan gizi"
  },
  
  calculations: {
    costPerMeal: 50000000 / 10000, // Rp 5,000 per meal
    allocatedBudget: 0, // Will be updated when procurement created
    usedBudget: 0,
    remainingBudget: 50000000
  },
  
  initialStatus: "DRAFT"
}
```

**API Endpoint:**
```http
POST /api/sppg/procurement/plans
Content-Type: application/json

{
  "planName": "Pengadaan Bahan Makanan Januari 2025",
  "planMonth": "2025-01",
  "planYear": 2025,
  "totalBudget": 50000000,
  "targetRecipients": 500,
  "targetMeals": 10000,
  "proteinBudget": 20000000,
  "carbBudget": 12500000,
  "vegetableBudget": 10000000,
  "fruitBudget": 5000000,
  "otherBudget": 2500000
}
```

---

#### 1.2 Submit Plan for Approval
```typescript
const submitPlanForApproval = {
  step: "Submit Plan to SPPG_KEPALA for Approval",
  
  action: "Update ProcurementPlan",
  updates: {
    approvalStatus: "PENDING_APPROVAL",
    submittedBy: currentUser.id,
    submittedAt: new Date()
  },
  
  notification: {
    to: "SPPG_KEPALA",
    message: "Procurement plan for January 2025 requires your approval"
  }
}
```

**API Endpoint:**
```http
PATCH /api/sppg/procurement/plans/:planId/submit
```

---

#### 1.3 Approve/Reject Plan
```typescript
const approvePlan = {
  step: "SPPG_KEPALA Approves Plan",
  
  action: "Update ProcurementPlan",
  updates: {
    approvalStatus: "APPROVED",
    approvedBy: currentUser.id,
    approvedAt: new Date()
  },
  
  notification: {
    to: "SPPG_ADMIN, SPPG_AKUNTAN",
    message: "Procurement plan approved. You may proceed with procurement."
  }
}

const rejectPlan = {
  step: "SPPG_KEPALA Rejects Plan",
  
  action: "Update ProcurementPlan",
  updates: {
    approvalStatus: "REJECTED",
    rejectionReason: "Budget too high for protein category. Please revise."
  },
  
  notification: {
    to: "Plan Submitter",
    message: "Procurement plan rejected. Please revise and resubmit."
  }
}
```

**API Endpoints:**
```http
PATCH /api/sppg/procurement/plans/:planId/approve
PATCH /api/sppg/procurement/plans/:planId/reject
```

---

### **Stage 2: Procurement Phase** 🛒

#### 2.1 Create Procurement Order
```typescript
const createProcurementOrder = {
  step: "Create Purchase Order",
  
  prerequisites: [
    "ProcurementPlan must be APPROVED",
    "Supplier must be ACTIVE",
    "Items must be in inventory master"
  ],
  
  inputs: {
    // Header Information
    planId: "plan_123", // Link to approved plan
    supplierId: "supplier_001",
    purchaseMethod: "DIRECT", // DIRECT, TENDER, CONTRACT, EMERGENCY, BULK
    expectedDelivery: "2025-01-05",
    paymentTerms: "Net 30",
    
    // Items (array)
    items: [
      {
        inventoryItemId: "inv_001",
        itemName: "Ayam Potong Segar",
        category: "PROTEIN",
        orderedQuantity: 100,
        unit: "kg",
        pricePerUnit: 45000,
        qualityStandard: "Grade A, Fresh",
        gradeRequested: "EXCELLENT"
      },
      {
        inventoryItemId: "inv_002",
        itemName: "Beras Premium",
        category: "KARBOHIDRAT",
        orderedQuantity: 200,
        unit: "kg",
        pricePerUnit: 15000,
        qualityStandard: "Premium Quality"
      }
      // ... more items
    ],
    
    // Additional costs
    shippingCost: 150000,
    notes: "Delivery to main kitchen, 7AM-9AM"
  },
  
  calculations: {
    itemsSubtotal: 4500000 + 3000000, // Sum of all items
    taxAmount: (4500000 + 3000000) * 0.11, // 11% VAT
    totalAmount: 7500000 + 825000 + 150000, // Subtotal + Tax + Shipping
    
    // Update plan budget
    planUpdate: {
      allocatedBudget: currentAllocated + 8475000,
      remainingBudget: totalBudget - (usedBudget + 8475000)
    }
  },
  
  autoGenerate: {
    procurementCode: "PO-2025-01-001", // Format: PO-YYYY-MM-XXX
    status: "DRAFT"
  }
}
```

**API Endpoint:**
```http
POST /api/sppg/procurement
Content-Type: application/json

{
  "planId": "plan_123",
  "supplierId": "supplier_001",
  "purchaseMethod": "DIRECT",
  "expectedDelivery": "2025-01-05T07:00:00Z",
  "paymentTerms": "Net 30",
  "shippingCost": 150000,
  "items": [
    {
      "inventoryItemId": "inv_001",
      "itemName": "Ayam Potong Segar",
      "category": "PROTEIN",
      "orderedQuantity": 100,
      "unit": "kg",
      "pricePerUnit": 45000
    }
  ]
}
```

**Business Rules:**
- ✅ Procurement code auto-generated: `PO-YYYY-MM-XXX`
- ✅ Check remaining budget before creation
- ✅ Validate supplier is active and not blacklisted
- ✅ Calculate totals automatically
- ✅ Link to procurement plan (optional but recommended)

---

#### 2.2 Submit for Approval (if required)
```typescript
const submitForApproval = {
  step: "Submit Procurement for Approval",
  
  triggers: [
    "Total amount > Rp 5,000,000",
    "Emergency procurement",
    "New supplier (first order)"
  ],
  
  action: "Update Procurement",
  updates: {
    status: "PENDING_APPROVAL"
  },
  
  notification: {
    to: "SPPG_KEPALA",
    message: `Procurement order ${procurementCode} requires approval`
  }
}
```

---

#### 2.3 Send Order to Supplier
```typescript
const sendOrderToSupplier = {
  step: "Send Purchase Order to Supplier",
  
  prerequisites: [
    "Status is APPROVED or auto-approved",
  ],
  
  action: "Update Procurement",
  updates: {
    status: "ORDERED",
    deliveryStatus: "ORDERED"
  },
  
  communications: [
    {
      method: supplier.preferredOrderMethod, // PHONE, EMAIL, WHATSAPP
      to: supplier.primaryContact,
      content: "PO Document + Item Details + Delivery Instructions"
    }
  ],
  
  supplierUpdate: {
    totalOrders: supplier.totalOrders + 1,
    lastContactDate: new Date()
  }
}
```

---

### **Stage 3: Receipt & Quality Control Phase** ✅

#### 3.1 Record Delivery Receipt
```typescript
const recordDelivery = {
  step: "Receive Goods from Supplier",
  
  inputs: {
    actualDelivery: new Date(), // Actual delivery timestamp
    deliveryStatus: "DELIVERED",
    receiptNumber: "RCP-001-2025",
    deliveryPhoto: "photo_url",
    invoiceNumber: "INV-SUP-001",
    
    // Update each item
    items: [
      {
        itemId: "proc_item_001",
        receivedQuantity: 98, // vs 100 ordered (2kg shortage)
        qualityReceived: "Fresh, good condition",
        gradeReceived: "EXCELLENT",
        batchNumber: "BATCH-20250105",
        expiryDate: "2025-01-12",
        isAccepted: true
      },
      {
        itemId: "proc_item_002",
        receivedQuantity: 200,
        qualityReceived: "Premium quality",
        gradeReceived: "GOOD",
        batchNumber: "RICE-2025-A",
        isAccepted: true
      }
    ]
  }
}
```

**API Endpoint:**
```http
PATCH /api/sppg/procurement/:id/receive
Content-Type: application/json

{
  "actualDelivery": "2025-01-05T08:30:00Z",
  "receiptNumber": "RCP-001-2025",
  "invoiceNumber": "INV-SUP-001",
  "items": [
    {
      "itemId": "proc_item_001",
      "receivedQuantity": 98,
      "gradeReceived": "EXCELLENT",
      "batchNumber": "BATCH-20250105",
      "expiryDate": "2025-01-12",
      "isAccepted": true
    }
  ]
}
```

---

#### 3.2 Quality Inspection
```typescript
const performQualityInspection = {
  step: "Inspect Received Goods",
  
  inspector: "SPPG_STAFF_QC or SPPG_AHLI_GIZI",
  
  checks: [
    "Visual inspection",
    "Temperature check (for perishables)",
    "Packaging integrity",
    "Expiry date verification",
    "Quantity accuracy",
    "Quality grade assessment"
  ],
  
  outcomes: {
    accepted: {
      action: "Accept all items",
      updates: {
        inspectedBy: currentUser.id,
        inspectedAt: new Date(),
        acceptanceStatus: "ACCEPTED",
        qualityGrade: "GOOD",
        status: "FULLY_RECEIVED"
      }
    },
    
    partiallyAccepted: {
      action: "Accept some, reject others",
      updates: {
        inspectedBy: currentUser.id,
        inspectedAt: new Date(),
        acceptanceStatus: "CONDITIONAL",
        qualityGrade: "FAIR",
        status: "PARTIALLY_RECEIVED"
      },
      itemUpdates: [
        {
          itemId: "proc_item_003",
          isAccepted: false,
          rejectionReason: "Expired product",
          returnedQuantity: 5
        }
      ]
    },
    
    rejected: {
      action: "Reject entire delivery",
      updates: {
        inspectedBy: currentUser.id,
        inspectedAt: new Date(),
        acceptanceStatus: "REJECTED",
        rejectionReason: "Quality below standard",
        status: "REJECTED"
      }
    }
  }
}
```

**API Endpoint:**
```http
PATCH /api/sppg/procurement/:id/inspect
Content-Type: application/json

{
  "inspectedBy": "user_123",
  "acceptanceStatus": "ACCEPTED",
  "qualityGrade": "GOOD",
  "qualityNotes": "All items in excellent condition"
}
```

---

### **Stage 4: Inventory Update & Payment** 💰

#### 4.1 Update Inventory (Accepted Items Only)
```typescript
const updateInventoryStock = {
  step: "Create Stock Movements for Accepted Items",
  
  process: "For each ACCEPTED procurement item",
  
  createStockMovement: {
    inventoryId: item.inventoryItemId,
    movementType: "IN",
    quantity: item.receivedQuantity,
    unit: item.unit,
    stockBefore: currentStock,
    stockAfter: currentStock + item.receivedQuantity,
    
    // Costing
    unitCost: item.pricePerUnit,
    totalCost: item.finalPrice,
    
    // Reference
    referenceType: "PROCUREMENT",
    referenceId: procurement.id,
    referenceNumber: procurement.procurementCode,
    
    // Product tracking
    batchNumber: item.batchNumber,
    expiryDate: item.expiryDate,
    
    // Approval
    movedBy: currentUser.id,
    movedAt: new Date(),
    approvedBy: currentUser.id, // Auto-approved for procurement receipt
    approvedAt: new Date()
  },
  
  updateInventoryItem: {
    currentStock: currentStock + item.receivedQuantity,
    lastPrice: item.pricePerUnit,
    averagePrice: calculateMovingAverage(item.pricePerUnit),
    costPerUnit: item.pricePerUnit
  }
}
```

**Business Logic:**
```typescript
// Moving Average Price Calculation
function calculateMovingAverage(newPrice: number, newQty: number) {
  const totalValue = (currentStock * averagePrice) + (newQty * newPrice)
  const totalQty = currentStock + newQty
  return totalValue / totalQty
}
```

**API Endpoint:**
```http
POST /api/sppg/procurement/:id/update-inventory
```

**Stock Movement Record:**
```json
{
  "id": "stock_mov_001",
  "inventoryId": "inv_001",
  "movementType": "IN",
  "quantity": 98,
  "unit": "kg",
  "stockBefore": 50,
  "stockAfter": 148,
  "unitCost": 45000,
  "totalCost": 4410000,
  "referenceType": "PROCUREMENT",
  "referenceId": "proc_001",
  "referenceNumber": "PO-2025-01-001",
  "batchNumber": "BATCH-20250105",
  "expiryDate": "2025-01-12"
}
```

---

#### 4.2 Update Procurement Plan Budget
```typescript
const updatePlanBudget = {
  step: "Update Procurement Plan Budget Tracking",
  
  calculations: {
    usedBudget: plan.usedBudget + procurement.totalAmount,
    remainingBudget: plan.totalBudget - (plan.usedBudget + procurement.totalAmount)
  },
  
  action: "Update ProcurementPlan",
  updates: {
    usedBudget: newUsedBudget,
    remainingBudget: newRemainingBudget
  },
  
  alerts: [
    {
      condition: "remainingBudget < totalBudget * 0.2",
      message: "Warning: Less than 20% budget remaining",
      severity: "WARNING"
    },
    {
      condition: "remainingBudget < 0",
      message: "Error: Budget exceeded!",
      severity: "ERROR"
    }
  ]
}
```

---

#### 4.3 Payment Tracking
```typescript
const recordPayment = {
  step: "Record Payment to Supplier",
  
  inputs: {
    paidAmount: 8475000, // Full payment or partial
    paymentStatus: "PAID", // or "PARTIAL" if partial payment
    paymentMethod: "BANK_TRANSFER",
    paymentReference: "TRX-20250105-001",
    paymentDate: new Date()
  },
  
  action: "Update Procurement",
  updates: {
    paidAmount: procurement.paidAmount + 8475000,
    paymentStatus: calculatePaymentStatus(paidAmount, totalAmount)
  },
  
  supplierUpdate: {
    totalPurchaseValue: supplier.totalPurchaseValue + 8475000
  }
}

function calculatePaymentStatus(paid: number, total: number) {
  if (paid === 0) return "UNPAID"
  if (paid < total) return "PARTIAL"
  return "PAID"
}
```

**API Endpoint:**
```http
POST /api/sppg/procurement/:id/payment
Content-Type: application/json

{
  "amount": 8475000,
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "TRX-20250105-001"
}
```

---

#### 4.4 Complete Procurement
```typescript
const completeProcurement = {
  step: "Mark Procurement as Completed",
  
  prerequisites: [
    "All items received (or partially with justification)",
    "Quality inspection completed",
    "Inventory updated",
    "Payment completed (or payment terms agreed)"
  ],
  
  action: "Update Procurement",
  updates: {
    status: "COMPLETED"
  },
  
  supplierPerformanceUpdate: {
    totalOrders: supplier.totalOrders,
    successfulDeliveries: supplier.successfulDeliveries + 1,
    
    // Calculate delivery time
    deliveryTime: actualDelivery - expectedDelivery,
    onTimeDelivery: deliveryTime <= 0,
    
    // Update ratings (if quality inspection done)
    qualityRating: updateRating(supplier.qualityRating, procurement.qualityGrade),
    deliveryRating: updateRating(supplier.deliveryRating, onTimeDelivery ? 5 : 3),
    overallRating: calculateOverallRating()
  }
}
```

---

## 📊 Status Flow Diagrams

### Procurement Plan Status Flow
```
DRAFT
  ↓
PENDING_APPROVAL ← (Submitted by SPPG_ADMIN/AKUNTAN)
  ↓
APPROVED ← (Approved by SPPG_KEPALA)
  ↓
[Can create Procurement orders]

Alternative:
PENDING_APPROVAL → REJECTED → Back to DRAFT (with revision)
```

### Procurement Status Flow
```
DRAFT
  ↓
PENDING_APPROVAL (if required)
  ↓
APPROVED
  ↓
ORDERED ← (Sent to supplier)
  ↓
PARTIALLY_RECEIVED ← (Some items received)
  ↓
FULLY_RECEIVED ← (All items received)
  ↓
COMPLETED ← (Payment done, inventory updated)

Alternative flows:
- DRAFT → CANCELLED (Order cancelled before sending)
- PENDING_APPROVAL → REJECTED (Not approved)
- ORDERED → CANCELLED (Supplier can't fulfill)
```

### Delivery Status Flow
```
ORDERED
  ↓
IN_TRANSIT (optional)
  ↓
DELIVERED
  ↓
[Quality Inspection]
  ↓
ACCEPTED / REJECTED / PARTIALLY_ACCEPTED
```

### Payment Status Flow
```
UNPAID
  ↓
PARTIAL (partial payment received)
  ↓
PAID (full payment completed)
```

---

## 🔐 Multi-Tenant Security Rules

### Critical Security Patterns

```typescript
// ✅ ALWAYS filter by sppgId in queries
const procurementPlan = await db.procurementPlan.findMany({
  where: {
    sppgId: session.user.sppgId  // MANDATORY!
  }
})

const procurement = await db.procurement.findMany({
  where: {
    sppgId: session.user.sppgId  // MANDATORY!
  }
})

const suppliers = await db.supplier.findMany({
  where: {
    sppgId: session.user.sppgId,  // MANDATORY!
    isActive: true
  }
})

// ✅ ALWAYS verify ownership before update/delete
const procurement = await db.procurement.findFirst({
  where: {
    id: procurementId,
    sppgId: session.user.sppgId  // Ownership check!
  }
})

if (!procurement) {
  throw new Error("Procurement not found or access denied")
}
```

---

## 🧭 Navigation & Sidebar Structure

### Procurement Menu in Sidebar

```typescript
// Sidebar Navigation Structure for Procurement Module
const procurementNavigation = {
  section: "Procurement",
  icon: "ShoppingCart",
  routes: [
    {
      title: "Dashboard",
      href: "/procurement",
      icon: "LayoutDashboard",
      roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN", "SPPG_VIEWER"],
      description: "Overview pengadaan & statistik"
    },
    {
      title: "Perencanaan",
      href: "/procurement/plans",
      icon: "CalendarDays",
      roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"],
      badge: "pendingApprovalCount",
      children: [
        {
          title: "Daftar Rencana",
          href: "/procurement/plans",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"]
        },
        {
          title: "Buat Rencana",
          href: "/procurement/plans/new",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"]
        },
        {
          title: "Persetujuan",
          href: "/procurement/plans/approvals",
          roles: ["SPPG_KEPALA"],
          badge: "pendingCount"
        }
      ]
    },
    {
      title: "Purchase Orders",
      href: "/procurement/orders",
      icon: "FileText",
      roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"],
      badge: "draftCount",
      children: [
        {
          title: "Daftar PO",
          href: "/procurement/orders",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"]
        },
        {
          title: "Buat PO",
          href: "/procurement/orders/new",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"]
        },
        {
          title: "Menunggu Pengiriman",
          href: "/procurement/orders?status=ORDERED",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN", "SPPG_STAFF"],
          badge: "orderedCount"
        }
      ]
    },
    {
      title: "Penerimaan Barang",
      href: "/procurement/receipts",
      icon: "PackageCheck",
      roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN", "SPPG_STAFF"],
      badge: "pendingReceiptCount",
      children: [
        {
          title: "Daftar Penerimaan",
          href: "/procurement/receipts",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN", "SPPG_STAFF"]
        },
        {
          title: "Quality Control",
          href: "/procurement/quality-control",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_STAFF_QC"],
          badge: "pendingQCCount"
        }
      ]
    },
    {
      title: "Supplier",
      href: "/procurement/suppliers",
      icon: "Store",
      roles: ["SPPG_KEPALA", "SPPG_ADMIN"],
      children: [
        {
          title: "Daftar Supplier",
          href: "/procurement/suppliers",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN", "SPPG_VIEWER"]
        },
        {
          title: "Tambah Supplier",
          href: "/procurement/suppliers/new",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN"]
        },
        {
          title: "Evaluasi Supplier",
          href: "/procurement/suppliers/evaluations",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN"]
        },
        {
          title: "Kontrak Supplier",
          href: "/procurement/suppliers/contracts",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN"]
        }
      ]
    },
    {
      title: "Pembayaran",
      href: "/procurement/payments",
      icon: "Wallet",
      roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"],
      badge: "unpaidCount",
      children: [
        {
          title: "Daftar Pembayaran",
          href: "/procurement/payments",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"]
        },
        {
          title: "Belum Dibayar",
          href: "/procurement/payments?status=UNPAID",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"],
          badge: "unpaidCount"
        },
        {
          title: "Jatuh Tempo",
          href: "/procurement/payments?overdue=true",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"],
          badge: "overdueCount",
          variant: "destructive"
        }
      ]
    },
    {
      title: "Laporan",
      href: "/procurement/reports",
      icon: "BarChart3",
      roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN", "SPPG_VIEWER"],
      children: [
        {
          title: "Laporan Pengadaan",
          href: "/procurement/reports/procurement",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN", "SPPG_VIEWER"]
        },
        {
          title: "Analisis Budget",
          href: "/procurement/reports/budget",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"]
        },
        {
          title: "Performa Supplier",
          href: "/procurement/reports/suppliers",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN"]
        },
        {
          title: "Analisis Harga",
          href: "/procurement/reports/price-analysis",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN", "SPPG_AKUNTAN"]
        }
      ]
    },
    {
      title: "Pengaturan",
      href: "/procurement/settings",
      icon: "Settings",
      roles: ["SPPG_KEPALA", "SPPG_ADMIN"],
      children: [
        {
          title: "Kategori Barang",
          href: "/procurement/settings/categories",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN"]
        },
        {
          title: "Metode Pembayaran",
          href: "/procurement/settings/payment-methods",
          roles: ["SPPG_KEPALA", "SPPG_ADMIN"]
        },
        {
          title: "Approval Workflow",
          href: "/procurement/settings/workflow",
          roles: ["SPPG_KEPALA"]
        }
      ]
    }
  ]
}
```

### Conditional Sidebar Rendering

```typescript
// components/shared/navigation/Sidebar.tsx
import { useSession } from 'next-auth/react'
import { hasPermission } from '@/lib/permissions'

export function ProcurementSidebarSection() {
  const { data: session } = useSession()
  const userRole = session?.user?.userRole
  
  // Filter navigation items based on user role
  const visibleItems = procurementNavigation.routes.filter(route => 
    route.roles.includes(userRole)
  )
  
  return (
    <SidebarSection>
      <SidebarSectionTitle icon={ShoppingCart}>
        Procurement
      </SidebarSectionTitle>
      
      {visibleItems.map(item => (
        <SidebarItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          badge={item.badge ? getBadgeCount(item.badge) : undefined}
          variant={item.variant}
        >
          {item.title}
          
          {/* Render sub-menu if exists and user has permission */}
          {item.children && (
            <SidebarSubMenu>
              {item.children
                .filter(child => child.roles.includes(userRole))
                .map(child => (
                  <SidebarSubItem
                    key={child.href}
                    href={child.href}
                    badge={child.badge ? getBadgeCount(child.badge) : undefined}
                  >
                    {child.title}
                  </SidebarSubItem>
                ))
              }
            </SidebarSubMenu>
          )}
        </SidebarItem>
      ))}
    </SidebarSection>
  )
}
```

### Badge Count Functions

```typescript
// lib/procurement/badge-counts.ts
import { db } from '@/lib/db'

export async function getProcurementBadgeCounts(sppgId: string) {
  const [
    pendingApprovalCount,
    draftCount,
    orderedCount,
    pendingReceiptCount,
    pendingQCCount,
    unpaidCount,
    overdueCount
  ] = await Promise.all([
    // Pending plan approvals
    db.procurementPlan.count({
      where: { 
        sppgId, 
        approvalStatus: 'PENDING_APPROVAL' 
      }
    }),
    
    // Draft procurement orders
    db.procurement.count({
      where: { 
        sppgId, 
        status: 'DRAFT' 
      }
    }),
    
    // Ordered (waiting delivery)
    db.procurement.count({
      where: { 
        sppgId, 
        status: 'ORDERED' 
      }
    }),
    
    // Pending receipt
    db.procurement.count({
      where: { 
        sppgId, 
        status: { in: ['ORDERED', 'PARTIALLY_RECEIVED'] } 
      }
    }),
    
    // Pending quality control
    db.procurement.count({
      where: { 
        sppgId, 
        deliveryStatus: 'DELIVERED',
        inspectedAt: null
      }
    }),
    
    // Unpaid invoices
    db.procurement.count({
      where: { 
        sppgId, 
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] } 
      }
    }),
    
    // Overdue payments
    db.procurement.count({
      where: { 
        sppgId, 
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
        paymentDue: { lt: new Date() }
      }
    })
  ])
  
  return {
    pendingApprovalCount,
    draftCount,
    orderedCount,
    pendingReceiptCount,
    pendingQCCount,
    unpaidCount,
    overdueCount
  }
}
```

---

## 👥 Role-Based Permissions

### Complete Role Access Matrix

| User Role | Description | Procurement Access Level |
|-----------|-------------|--------------------------|
| **SPPG_KEPALA** | Kepala SPPG | Full access - All modules & approval authority |
| **SPPG_ADMIN** | Administrator | Full operational access except final approvals |
| **SPPG_AKUNTAN** | Akuntan/Finance | Budget, planning, payment management |
| **SPPG_STAFF_QC** | Quality Control | Receipt & quality inspection only |
| **SPPG_STAFF** | General Staff | Receipt recording only (read-only procurement) |
| **SPPG_VIEWER** | Viewer | Read-only access to reports & data |

### Procurement Plan Operations

| Operation | SPPG_KEPALA | SPPG_ADMIN | SPPG_AKUNTAN | SPPG_STAFF |
|-----------|-------------|------------|--------------|------------|
| Create Plan | ✅ | ✅ | ✅ | ❌ |
| Edit Draft | ✅ | ✅ | ✅ | ❌ |
| Submit for Approval | ✅ | ✅ | ✅ | ❌ |
| Approve Plan | ✅ | ❌ | ❌ | ❌ |
| Reject Plan | ✅ | ❌ | ❌ | ❌ |
| View Plan | ✅ | ✅ | ✅ | ✅ (read-only) |
| Delete Plan | ✅ | ✅ (own only) | ❌ | ❌ |

### Procurement Operations

| Operation | SPPG_KEPALA | SPPG_ADMIN | SPPG_AKUNTAN | SPPG_STAFF |
|-----------|-------------|------------|--------------|------------|
| Create Order | ✅ | ✅ | ✅ | ❌ |
| Edit Draft | ✅ | ✅ | ✅ | ❌ |
| Send Order | ✅ | ✅ | ✅ | ❌ |
| Record Receipt | ✅ | ✅ | ✅ | ✅ |
| Quality Inspection | ✅ | ✅ | SPPG_STAFF_QC | ❌ |
| Record Payment | ✅ | ✅ | ✅ | ❌ |
| Cancel Order | ✅ | ✅ | ❌ | ❌ |

### Supplier Management

| Operation | SPPG_KEPALA | SPPG_ADMIN | SPPG_AKUNTAN | SPPG_STAFF_QC | SPPG_STAFF | SPPG_VIEWER |
|-----------|-------------|------------|--------------|---------------|------------|-------------|
| Create Supplier | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Supplier | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Activate/Deactivate | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Blacklist | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Supplier | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rate Supplier | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Evaluate Supplier | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Contracts | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Product Catalog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Payment & Finance Operations

| Operation | SPPG_KEPALA | SPPG_ADMIN | SPPG_AKUNTAN | SPPG_STAFF | SPPG_VIEWER |
|-----------|-------------|------------|--------------|------------|-------------|
| View Payments | ✅ | ✅ | ✅ | ❌ | ✅ (reports only) |
| Record Payment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Payment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cancel Payment | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve Payment | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Budget Reports | ✅ | ✅ | ✅ | ❌ | ✅ |
| Export Financial Data | ✅ | ✅ | ✅ | ❌ | ❌ |

### Reporting & Analytics

| Operation | SPPG_KEPALA | SPPG_ADMIN | SPPG_AKUNTAN | SPPG_STAFF | SPPG_VIEWER |
|-----------|-------------|------------|--------------|------------|-------------|
| View All Reports | ✅ | ✅ | ✅ | ❌ | ✅ |
| Procurement Reports | ✅ | ✅ | ✅ | ❌ | ✅ |
| Budget Analysis | ✅ | ✅ | ✅ | ❌ | ✅ |
| Supplier Performance | ✅ | ✅ | ✅ | ❌ | ✅ |
| Price Analysis | ✅ | ✅ | ✅ | ❌ | ✅ |
| Export Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Schedule Reports | ✅ | ✅ | ❌ | ❌ | ❌ |

### Settings & Configuration

| Operation | SPPG_KEPALA | SPPG_ADMIN | Others |
|-----------|-------------|------------|--------|
| Manage Categories | ✅ | ✅ | ❌ |
| Payment Methods | ✅ | ✅ | ❌ |
| Approval Workflow | ✅ | ❌ | ❌ |
| Budget Thresholds | ✅ | ❌ | ❌ |
| Notification Settings | ✅ | ✅ | ❌ |

---

## 🔐 Permission Middleware Implementation

### Route Protection

```typescript
// middleware/procurement-auth.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export async function procurementAuthMiddleware(
  request: NextRequest,
  requiredPermission: ProcurementPermission
) {
  const session = await auth()
  
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (!session.user.sppgId) {
    return Response.json({ error: 'SPPG access required' }, { status: 403 })
  }
  
  // Check role-based permission
  if (!hasPermission(session.user.userRole, requiredPermission)) {
    return Response.json({ 
      error: 'Insufficient permissions',
      required: requiredPermission,
      current: session.user.userRole
    }, { status: 403 })
  }
  
  return null // Permission granted
}

// Permission types
type ProcurementPermission = 
  | 'PROCUREMENT_VIEW'
  | 'PROCUREMENT_CREATE'
  | 'PROCUREMENT_EDIT'
  | 'PROCUREMENT_DELETE'
  | 'PROCUREMENT_APPROVE'
  | 'PLAN_CREATE'
  | 'PLAN_APPROVE'
  | 'SUPPLIER_MANAGE'
  | 'PAYMENT_MANAGE'
  | 'RECEIPT_RECORD'
  | 'QUALITY_INSPECT'
```

### Permission Helper Functions

```typescript
// lib/permissions/procurement.ts
import { UserRole } from '@prisma/client'

export const procurementPermissions = {
  PROCUREMENT_VIEW: [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AKUNTAN',
    'SPPG_STAFF',
    'SPPG_VIEWER'
  ],
  
  PROCUREMENT_CREATE: [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AKUNTAN'
  ],
  
  PROCUREMENT_EDIT: [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AKUNTAN'
  ],
  
  PROCUREMENT_DELETE: [
    'SPPG_KEPALA',
    'SPPG_ADMIN'
  ],
  
  PROCUREMENT_APPROVE: [
    'SPPG_KEPALA'
  ],
  
  PLAN_CREATE: [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AKUNTAN'
  ],
  
  PLAN_APPROVE: [
    'SPPG_KEPALA'
  ],
  
  SUPPLIER_MANAGE: [
    'SPPG_KEPALA',
    'SPPG_ADMIN'
  ],
  
  PAYMENT_MANAGE: [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AKUNTAN'
  ],
  
  RECEIPT_RECORD: [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AKUNTAN',
    'SPPG_STAFF'
  ],
  
  QUALITY_INSPECT: [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_STAFF_QC'
  ]
} as const

export function canAccessProcurement(userRole: UserRole): boolean {
  return procurementPermissions.PROCUREMENT_VIEW.includes(userRole)
}

export function canCreateProcurement(userRole: UserRole): boolean {
  return procurementPermissions.PROCUREMENT_CREATE.includes(userRole)
}

export function canApprovePlan(userRole: UserRole): boolean {
  return procurementPermissions.PLAN_APPROVE.includes(userRole)
}

export function canManageSupplier(userRole: UserRole): boolean {
  return procurementPermissions.SUPPLIER_MANAGE.includes(userRole)
}

export function canRecordReceipt(userRole: UserRole): boolean {
  return procurementPermissions.RECEIPT_RECORD.includes(userRole)
}

export function canInspectQuality(userRole: UserRole): boolean {
  return procurementPermissions.QUALITY_INSPECT.includes(userRole)
}

export function canManagePayment(userRole: UserRole): boolean {
  return procurementPermissions.PAYMENT_MANAGE.includes(userRole)
}
```

### API Route Protection Example

```typescript
// app/api/sppg/procurement/plans/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { canCreateProcurement } from '@/lib/permissions/procurement'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 2. SPPG access check
    if (!session.user.sppgId) {
      return Response.json({ error: 'SPPG access required' }, { status: 403 })
    }
    
    // 3. Permission check
    if (!canCreateProcurement(session.user.userRole)) {
      return Response.json({ 
        error: 'Permission denied',
        message: 'Only SPPG_KEPALA, SPPG_ADMIN, or SPPG_AKUNTAN can create procurement plans'
      }, { status: 403 })
    }
    
    // 4. Proceed with business logic
    const body = await request.json()
    
    // Create procurement plan...
    const plan = await db.procurementPlan.create({
      data: {
        ...body,
        sppgId: session.user.sppgId // Multi-tenant safety
      }
    })
    
    return Response.json({ success: true, data: plan }, { status: 201 })
    
  } catch (error) {
    console.error('Create plan error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Client-Side Permission Check

```typescript
// components/procurement/ProcurementActions.tsx
'use client'

import { useSession } from 'next-auth/react'
import { canCreateProcurement, canApprovePlan } from '@/lib/permissions/procurement'
import { Button } from '@/components/ui/button'

export function ProcurementActions() {
  const { data: session } = useSession()
  const userRole = session?.user?.userRole
  
  return (
    <div className="flex gap-2">
      {/* Show create button only if user has permission */}
      {canCreateProcurement(userRole) && (
        <Button asChild>
          <Link href="/procurement/orders/new">
            Buat PO Baru
          </Link>
        </Button>
      )}
      
      {/* Show approve button only for SPPG_KEPALA */}
      {canApprovePlan(userRole) && (
        <Button variant="outline" asChild>
          <Link href="/procurement/plans/approvals">
            Persetujuan ({pendingCount})
          </Link>
        </Button>
      )}
    </div>
  )
}

---

## 🎯 Best Practices & Recommendations

### 1. **Budget Planning**
- ✅ Create procurement plan BEFORE any purchasing
- ✅ Allocate budgets by category (protein, carb, vegetables, etc.)
- ✅ Set emergency buffer (10-15%) for price fluctuations
- ✅ Monthly plans recommended over quarterly
- ✅ Get approval before proceeding

### 2. **Supplier Management**
- ✅ Maintain at least 2-3 suppliers per category
- ✅ Evaluate supplier performance quarterly
- ✅ Track delivery times and quality grades
- ✅ Negotiate payment terms for regular suppliers
- ✅ Verify certifications (Halal, food safety)

### 3. **Quality Control**
- ✅ ALWAYS inspect goods upon delivery
- ✅ Document with photos (delivery, items)
- ✅ Check expiry dates and batch numbers
- ✅ Reject immediately if quality is poor
- ✅ Keep quality inspection records

### 4. **Inventory Management**
- ✅ Set min/max stock levels correctly
- ✅ Use FIFO (First In First Out) for perishables
- ✅ Track batch numbers for food safety
- ✅ Monitor expiry dates actively
- ✅ Regular stock reconciliation

### 5. **Cost Control**
- ✅ Track moving average prices
- ✅ Compare supplier prices regularly
- ✅ Negotiate bulk discounts
- ✅ Monitor budget usage in real-time
- ✅ Alert when budget reaches 80%

### 6. **Documentation**
- ✅ Keep all PO documents
- ✅ Store delivery receipts
- ✅ Archive supplier invoices
- ✅ Photo documentation for audit
- ✅ Quality inspection reports

---

## 📋 Implementation Checklist

### Phase 1: Planning Module
- [ ] Procurement Plan CRUD
- [ ] Budget allocation by category
- [ ] Approval workflow (submit, approve, reject)
- [ ] Budget tracking (allocated, used, remaining)
- [ ] Plan dashboard with metrics

### Phase 2: Supplier Module
- [ ] Supplier CRUD
- [ ] Supplier rating system
- [ ] Product catalog management
- [ ] Performance tracking
- [ ] Compliance management

### Phase 3: Procurement Module
- [ ] Procurement order CRUD
- [ ] Item management (add, edit, remove)
- [ ] Auto-calculation (subtotal, tax, total)
- [ ] Link to procurement plan
- [ ] Order approval workflow (if needed)

### Phase 4: Receipt & QC Module
- [ ] Delivery receipt recording
- [ ] Item-level quantity tracking
- [ ] Quality inspection interface
- [ ] Accept/Reject items
- [ ] Photo upload capability

### Phase 5: Inventory Integration
- [ ] Auto stock movement creation
- [ ] Inventory update on receipt
- [ ] Batch & expiry tracking
- [ ] Stock reconciliation
- [ ] Alerts for low stock

### Phase 6: Payment Module
- [ ] Payment recording
- [ ] Payment status tracking
- [ ] Payment history
- [ ] Supplier payment reports
- [ ] Outstanding payment alerts

### Phase 7: Reporting & Analytics
- [ ] Procurement summary reports
- [ ] Budget utilization reports
- [ ] Supplier performance reports
- [ ] Inventory movement reports
- [ ] Cost analysis reports

---

## 🚀 Quick Start Guide

### 1. Setup Suppliers First
```typescript
// Before any procurement, register suppliers
POST /api/sppg/suppliers
{
  "supplierName": "Pasar Induk Kramat Jati",
  "supplierType": "LOCAL",
  "category": "Sayuran",
  "phone": "081234567890",
  "address": "Jakarta Timur",
  "paymentTerms": "CASH_ON_DELIVERY"
}
```

### 2. Create Monthly Plan
```typescript
// Create and get approved plan for the month
POST /api/sppg/procurement/plans
{
  "planName": "Pengadaan Januari 2025",
  "planMonth": "2025-01",
  "totalBudget": 50000000,
  "targetRecipients": 500
}

// Submit for approval
PATCH /api/sppg/procurement/plans/:id/submit

// Approve (by SPPG_KEPALA)
PATCH /api/sppg/procurement/plans/:id/approve
```

### 3. Create Procurement Order
```typescript
// Create order linked to plan
POST /api/sppg/procurement
{
  "planId": "plan_123",
  "supplierId": "supplier_001",
  "expectedDelivery": "2025-01-05",
  "items": [...]
}
```

### 4. Receive & Inspect
```typescript
// Record delivery receipt
PATCH /api/sppg/procurement/:id/receive
{
  "actualDelivery": "2025-01-05T08:00:00Z",
  "items": [
    { "itemId": "...", "receivedQuantity": 100 }
  ]
}

// Quality inspection
PATCH /api/sppg/procurement/:id/inspect
{
  "acceptanceStatus": "ACCEPTED",
  "qualityGrade": "GOOD"
}
```

### 5. Update Inventory & Pay
```typescript
// Auto-update inventory (triggered after inspection)
POST /api/sppg/procurement/:id/update-inventory

// Record payment
POST /api/sppg/procurement/:id/payment
{
  "amount": 8475000,
  "paymentMethod": "BANK_TRANSFER"
}
```

---

## 📞 Support & Documentation

### Related Documentation
- [Inventory Management Guide](./INVENTORY_MANAGEMENT_GUIDE.md)
- [Menu Planning Workflow](./MENU_PLANNING_WORKFLOW.md)
- [Production Workflow](./PRODUCTION_WORKFLOW_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)

### Common Issues & Solutions

**Issue: "Budget exceeded"**
- Solution: Check `remainingBudget` in ProcurementPlan before creating order
- Consider revising plan or requesting budget increase

**Issue: "Supplier not active"**
- Solution: Verify supplier `isActive = true` and `isBlacklisted = false`
- Activate supplier or choose alternative supplier

**Issue: "Partial delivery"**
- Solution: Update `receivedQuantity` per item
- System will calculate correctly and update stock accordingly

**Issue: "Quality rejection"**
- Solution: Set `isAccepted = false` for rejected items
- Provide `rejectionReason`
- Coordinate return with supplier

---

## 📈 Future Enhancements

### Planned Features
- [ ] Automatic reorder based on min stock
- [ ] Supplier bidding system (tender)
- [ ] Price comparison across suppliers
- [ ] Contract management integration
- [ ] Mobile app for delivery receipt
- [ ] QR code scanning for inventory
- [ ] AI-based demand forecasting
- [ ] Integration with e-procurement systems

---

## ✅ Conclusion

Procurement workflow di Bagizi-ID dirancang dengan **enterprise-grade standards**:

✅ **Multi-stage approval** untuk budget control  
✅ **Quality control integration** untuk food safety  
✅ **Complete audit trail** untuk compliance  
✅ **Automatic inventory updates** untuk accuracy  
✅ **Supplier performance tracking** untuk vendor management  
✅ **Multi-tenant security** untuk data isolation  

**Next Steps:**
1. Implement Planning Module first
2. Then Supplier Management
3. Then Procurement Orders
4. Finally integrate with Inventory

Workflow ini memastikan **transparency, accountability, dan efficiency** dalam proses pengadaan bahan makanan SPPG! 🎯

---

## 📱 Page-Level Access Control

### Route Access Matrix

| Route | KEPALA | ADMIN | AKUNTAN | STAFF_QC | STAFF | VIEWER |
|-------|--------|-------|---------|----------|-------|--------|
| `/procurement` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/procurement/plans` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/procurement/plans/new` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/procurement/plans/[id]` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/procurement/plans/[id]/edit` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/procurement/plans/approvals` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/procurement/orders` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/procurement/orders/new` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/procurement/orders/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/procurement/orders/[id]/edit` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/procurement/receipts` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/procurement/receipts/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/procurement/quality-control` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `/procurement/suppliers` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/procurement/suppliers/new` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/procurement/suppliers/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/procurement/suppliers/[id]/edit` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/procurement/suppliers/evaluations` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/procurement/suppliers/contracts` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/procurement/payments` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/procurement/payments/[id]` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/procurement/reports/*` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/procurement/settings/*` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Middleware Implementation

```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  
  // Procurement routes protection
  if (pathname.startsWith('/procurement')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    const userRole = session.user.userRole
    
    // Settings - SPPG_KEPALA and SPPG_ADMIN only
    if (pathname.startsWith('/procurement/settings')) {
      if (!['SPPG_KEPALA', 'SPPG_ADMIN'].includes(userRole)) {
        return NextResponse.redirect(new URL('/procurement', req.url))
      }
    }
    
    // Plan approvals - SPPG_KEPALA only
    if (pathname === '/procurement/plans/approvals') {
      if (userRole !== 'SPPG_KEPALA') {
        return NextResponse.redirect(new URL('/procurement/plans', req.url))
      }
    }
    
    // Create/Edit operations - Management roles only
    if (pathname.includes('/new') || pathname.includes('/edit')) {
      const managementRoles = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN']
      
      // Exception: receipts can be edited by staff
      if (!pathname.includes('/receipts') && !managementRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/procurement', req.url))
      }
    }
    
    // Quality Control - QC staff only
    if (pathname.startsWith('/procurement/quality-control')) {
      const qcRoles = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_STAFF_QC']
      if (!qcRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/procurement', req.url))
      }
    }
    
    // Payment management - Finance roles only
    if (pathname.startsWith('/procurement/payments') && pathname.includes('/edit')) {
      const financeRoles = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN']
      if (!financeRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/procurement/payments', req.url))
      }
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/procurement/:path*']
}
```

---

## 🎨 UI Component Permissions

### Conditional Button Rendering

```typescript
// components/procurement/ProcurementHeader.tsx
'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle, X } from 'lucide-react'
import Link from 'next/link'
import { canCreateProcurement, canApprovePlan } from '@/lib/permissions/procurement'

export function ProcurementHeader({ plan }: { plan?: ProcurementPlan }) {
  const { data: session } = useSession()
  const userRole = session?.user?.userRole
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Procurement</h1>
        <p className="text-muted-foreground">
          Manage procurement plans and orders
        </p>
      </div>
      
      <div className="flex gap-2">
        {/* Create button - show only if user can create */}
        {canCreateProcurement(userRole) && (
          <Button asChild>
            <Link href="/procurement/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Buat PO
            </Link>
          </Button>
        )}
        
        {/* Approval buttons - show only if user can approve */}
        {plan && plan.approvalStatus === 'PENDING_APPROVAL' && canApprovePlan(userRole) && (
          <>
            <Button onClick={handleApprove} variant="default">
              <CheckCircle className="mr-2 h-4 w-4" />
              Setujui
            </Button>
            <Button onClick={handleReject} variant="destructive">
              <X className="mr-2 h-4 w-4" />
              Tolak
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
```

### Conditional Action Menu

```typescript
// components/procurement/ProcurementActionMenu.tsx
'use client'

import { useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2, FileText, CheckCircle } from 'lucide-react'
import { 
  canCreateProcurement, 
  canApprovePlan,
  canInspectQuality 
} from '@/lib/permissions/procurement'

export function ProcurementActionMenu({ 
  procurement 
}: { 
  procurement: Procurement 
}) {
  const { data: session } = useSession()
  const userRole = session?.user?.userRole
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        {/* View - available to all */}
        <DropdownMenuItem onClick={() => viewProcurement(procurement.id)}>
          <FileText className="mr-2 h-4 w-4" />
          Lihat Detail
        </DropdownMenuItem>
        
        {/* Edit - only for authorized roles */}
        {canCreateProcurement(userRole) && procurement.status === 'DRAFT' && (
          <DropdownMenuItem onClick={() => editProcurement(procurement.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        
        {/* Quality Inspection - only for QC staff */}
        {canInspectQuality(userRole) && 
         procurement.deliveryStatus === 'DELIVERED' && 
         !procurement.inspectedAt && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => inspectQuality(procurement.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Quality Inspection
            </DropdownMenuItem>
          </>
        )}
        
        {/* Delete - only for authorized roles */}
        {canApprovePlan(userRole) && procurement.status === 'DRAFT' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => deleteProcurement(procurement.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Form Field Permissions

```typescript
// components/procurement/ProcurementForm.tsx
'use client'

import { useSession } from 'next-auth/react'
import { canApprovePlan, canCreateProcurement } from '@/lib/permissions/procurement'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function ProcurementForm({ procurement }: { procurement?: Procurement }) {
  const { data: session } = useSession()
  const userRole = session?.user?.userRole
  
  // Can only edit if user has permission and procurement is in draft
  const canEdit = canCreateProcurement(userRole) && 
                  (!procurement || procurement.status === 'DRAFT')
  
  // Only SPPG_KEPALA can override certain fields
  const canOverride = canApprovePlan(userRole)
  
  return (
    <form>
      {/* Standard fields - editable based on canEdit */}
      <div>
        <Label htmlFor="supplierId">Supplier</Label>
        <Select
          id="supplierId"
          disabled={!canEdit}
          // ... other props
        />
      </div>
      
      {/* Financial override - only for SPPG_KEPALA */}
      {canOverride && (
        <div className="border-t pt-4">
          <Label htmlFor="discountOverride">Discount Override</Label>
          <Input
            id="discountOverride"
            type="number"
            placeholder="Special discount"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Only SPPG_KEPALA can override discount
          </p>
        </div>
      )}
      
      {/* Submit button - conditional */}
      <div className="flex gap-2">
        {canEdit && (
          <Button type="submit">
            {procurement ? 'Update' : 'Create'} Procurement
          </Button>
        )}
      </div>
    </form>
  )
}
```

---

**Document Version:** 1.0.0  
**Last Updated:** October 27, 2025  
**Maintained By:** Bagizi-ID Development Team
