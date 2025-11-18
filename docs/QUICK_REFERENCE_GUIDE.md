# 🚀 Bagizi-ID Platform - Quick Reference Guide

**Last Updated**: October 31, 2025  
**Platform Status**: ✅ PRODUCTION READY  
**Focus**: Internal SPPG Operational Management

---

## 📊 Platform Overview

**Bagizi-ID** adalah enterprise SaaS platform untuk manajemen operasional SPPG dengan 3 layer utama:

### Layer 1: Marketing Website (Public)
- Landing pages, pricing, blog, case studies
- Routes: `/`, `/features`, `/pricing`, `/blog/*`

### Layer 2: SPPG Dashboard (Protected - Multi-tenant)
- Operational management untuk SPPG
- Routes: `/dashboard/*`, `/menu/*`, `/procurement/*`, `/production/*`, `/distribution/*`
- Roles: `SPPG_ADMIN`, `SPPG_KEPALA`, `SPPG_AHLI_GIZI`, dll

### Layer 3: Platform Admin (Protected)
- Manage all SPPG tenants
- Routes: `/admin/*`
- Roles: `PLATFORM_SUPERADMIN`

---

## 🏗️ Core Architecture

### Tech Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js v5 (multi-role RBAC)
- **State**: Zustand (client) + TanStack Query (server)
- **UI**: shadcn/ui + Tailwind CSS (Dark mode support)
- **Validation**: Zod schemas
- **API**: RESTful endpoints (NOT server actions)

### Feature-Based Architecture
```
src/features/{layer}/{domain}/
├── components/     # UI components
├── hooks/         # TanStack Query hooks
├── stores/        # Zustand stores
├── schemas/       # Zod validation
├── types/         # TypeScript types
├── lib/           # Utilities
└── api/           # API client functions
```

---

## 🔐 Security Patterns

### Multi-Tenant Safety
```typescript
// CRITICAL: Always filter by sppgId!
const orders = await db.procurement.findMany({
  where: {
    sppgId: session.user.sppgId!, // MANDATORY!
  }
})
```

### API Endpoint Pattern
```typescript
// src/app/api/sppg/resource/route.ts
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    // 1. Authentication check (automatic via middleware)
    // 2. Role check
    if (!canManageResource(session.user.userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // 3. Query with sppgId filter
    const data = await db.resource.findMany({
      where: { sppgId: session.user.sppgId! }
    })
    
    return NextResponse.json({ success: true, data })
  })
}
```

---

## 📦 Procurement System Features

### ✅ Implemented Features (Complete)

#### 1. **Auto-Approve Workflow**
```typescript
// Orders below threshold → Auto APPROVED
// Orders above threshold → PENDING_APPROVAL
const settings = await db.procurementSettings.findUnique({ where: { sppgId } })
if (totalAmount <= settings.autoApproveThreshold) {
  status = 'APPROVED'
} else {
  status = 'PENDING_APPROVAL'
}
```

#### 2. **Multi-Level Approval**
```typescript
// Approval levels based on order amount
// Level 1: 0 - 10M (SPPG_ADMIN)
// Level 2: 10M - 50M (SPPG_KEPALA)
// Level 3: 50M+ (SPPG_KEPALA)
const level = await db.procurementApprovalLevel.findFirst({
  where: {
    minAmount: { lte: totalAmount },
    maxAmount: { gte: totalAmount }
  }
})
```

#### 3. **Budget Management**
```typescript
// Real-time budget validation before order creation
const budgetCheck = await checkCategoryBudget(sppgId, category, amount)
if (!budgetCheck.allowed) {
  return NextResponse.json({ error: budgetCheck.message }, { status: 400 })
}

// Budget alerts at 80% threshold
if (budgetCheck.details?.shouldAlert) {
  await logBudgetAlert(sppgId, budgetCheck.details)
}
```

#### 4. **Quality Control**
```typescript
// Required QC photos based on settings
const settings = await db.procurementSettings.findUnique({ where: { sppgId } })
if (settings.requireQCPhotos && photos.length < settings.minQCPhotoCount) {
  throw new Error(`Minimum ${settings.minQCPhotoCount} photos required`)
}

// QC checklists validation
const checklist = await db.procurementQCChecklist.findFirst({
  where: { settingsId, category }
})
```

#### 5. **Dual-Channel Notifications**
```typescript
// WhatsApp + Email notifications
const service = await createNotificationService(sppgId)
await service.send({
  type: 'APPROVAL_REQUEST',
  recipients: [
    { phone: '+6281234567890', email: 'admin@sppg.id', name: 'Admin' }
  ],
  metadata: { orderId, orderCode, totalAmount }
})
```

#### 6. **Escalation Mechanism**
```typescript
// Auto-escalate after 3 days no action
// Cron job: POST /api/cron/escalate-approvals (daily)
const pendingOrders = await db.procurement.findMany({
  where: {
    status: 'PENDING_APPROVAL',
    createdAt: { lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
  }
})

for (const order of pendingOrders) {
  await escalateApproval(order.sppgId, order.id)
}
```

---

## 🔔 Notification System

### Providers Supported

**WhatsApp**:
- Fonnte (Indonesia-focused)
- Twilio (Global)
- WhatsApp Business API

**Email**:
- Resend (Recommended for Indonesia)
- SendGrid (Enterprise)
- AWS SES (Placeholder)

### Configuration Format

**Simple Format** (in ProcurementSettings):
```
WhatsApp: "+6281234567890"
Email: "resend:re_abc123:noreply@bagizi.id"
```

**JSON Format** (for advanced config):
```json
{
  "provider": "resend",
  "apiKey": "re_abc123",
  "fromEmail": "noreply@bagizi.id",
  "fromName": "Bagizi-ID Procurement"
}
```

### Notification Types

1. **APPROVAL_REQUEST** - When order created with PENDING_APPROVAL
2. **APPROVAL_GRANTED** - When order approved
3. **APPROVAL_REJECTED** - When order rejected
4. **ESCALATION_NOTICE** - When approval escalated to higher authority
5. **BUDGET_ALERT** - When category budget reaches 80% threshold
6. **ORDER_CREATED** - Order confirmation (optional)

---

## 📁 Key Files Reference

### Core Libraries
- `src/lib/budget-tracking.ts` (500 lines) - Budget validation & alerts
- `src/lib/approval-workflow.ts` (500 lines) - Approval orchestration
- `src/lib/notification-service.ts` (1200 lines) - WhatsApp + Email
- `src/lib/permissions.ts` - RBAC helpers
- `src/lib/api-middleware.ts` - withSppgAuth wrapper

### API Endpoints
- `POST /api/sppg/procurement/orders` - Create order (auto-approve, budget check, notifications)
- `POST /api/sppg/procurement/orders/[id]/approve` - Approve order
- `POST /api/sppg/procurement/orders/[id]/escalate` - Manual escalation
- `POST /api/cron/escalate-approvals` - Daily auto-escalation
- `GET /api/sppg/procurement/budget-utilization` - Budget analytics

### Database Models
- `Procurement` - Main order entity
- `ProcurementItem` - Order line items
- `ProcurementApprovalTracking` - Approval audit trail
- `ProcurementApprovalLevel` - Multi-level approval config
- `ProcurementSettings` - SPPG settings
- `ProcurementQCChecklist` - Quality control checklists

---

## 🧪 Testing Scenarios

### Scenario 1: Auto-Approve Order
```typescript
// Setup
autoApproveThreshold = Rp 5,000,000

// Test
Create order with total = Rp 3,000,000

// Expected
✅ Status: APPROVED (auto)
❌ No approval notification sent
✅ Order created successfully
```

### Scenario 2: Manual Approval Flow
```typescript
// Setup
autoApproveThreshold = Rp 5,000,000
Approval Level 1: 0-10M (SPPG_ADMIN)

// Test
Create order with total = Rp 8,500,000

// Expected
✅ Status: PENDING_APPROVAL
✅ Notification sent to SPPG_ADMIN users
✅ Email + WhatsApp delivered
✅ Awaiting approval
```

### Scenario 3: Budget Validation
```typescript
// Setup
Category: PROTEIN_HEWANI
Monthly Budget: Rp 10,000,000
Current Usage: Rp 8,000,000 (80%)

// Test
Create order with Rp 3,000,000 PROTEIN_HEWANI

// Expected
❌ Order creation blocked
❌ Error: "Budget exceeded for category PROTEIN_HEWANI"
✅ Budget alert sent to finance team
```

### Scenario 4: Escalation
```typescript
// Setup
escalationDays = 3
Order created 4 days ago, still PENDING_APPROVAL

// Test
Run cron: POST /api/cron/escalate-approvals

// Expected
✅ Order escalated to SPPG_KEPALA
✅ Escalation notification sent
✅ Status remains PENDING_APPROVAL
✅ Audit log created
```

---

## 🔧 Configuration Guide

### 1. Setup Procurement Settings

```sql
-- Default settings for new SPPG
INSERT INTO "ProcurementSettings" (
  "id", "sppgId", 
  "autoApproveThreshold", 
  "requireQCPhotos", "minQCPhotoCount",
  "defaultPaymentTerm",
  "budgetAlertEnabled", "budgetAlertThreshold",
  "requireParallelApproval", "approvalEscalationDays"
) VALUES (
  gen_random_uuid(), 'sppg-id',
  5000000, -- Auto-approve below 5M
  true, 3, -- Require 3 QC photos
  'NET_30', -- Default 30 days payment
  true, 80, -- Alert at 80% budget
  false, 3 -- Escalate after 3 days
);
```

### 2. Setup Approval Levels

```sql
-- Level 1: Manager (0 - 10M)
INSERT INTO "ProcurementApprovalLevel" (
  "id", "settingsId", "level", "levelName",
  "minAmount", "maxAmount", "requiredRole",
  "isActive", "sortOrder"
) VALUES (
  gen_random_uuid(), 'settings-id', 
  1, 'Persetujuan Manager',
  0, 10000000, 'SPPG_ADMIN',
  true, 1
);

-- Level 2: Director (10M - 50M)
INSERT INTO "ProcurementApprovalLevel" (
  "id", "settingsId", "level", "levelName",
  "minAmount", "maxAmount", "requiredRole",
  "isActive", "sortOrder"
) VALUES (
  gen_random_uuid(), 'settings-id',
  2, 'Persetujuan Direktur',
  10000001, 50000000, 'SPPG_KEPALA',
  true, 2
);
```

### 3. Setup Notifications

```sql
-- WhatsApp configuration
UPDATE "ProcurementSettings"
SET "approvalNotificationWhatsapp" = '+6281234567890'
WHERE "sppgId" = 'sppg-id';

-- Email configuration
UPDATE "ProcurementSettings"
SET "approvalNotificationEmail" = 'resend:re_abc123:noreply@bagizi.id'
WHERE "sppgId" = 'sppg-id';
```

### 4. Setup Budget Categories

```sql
INSERT INTO "BudgetCategory" (
  "id", "sppgId", "category", "name",
  "monthlyBudget", "currentUsage"
) VALUES
  (gen_random_uuid(), 'sppg-id', 'PROTEIN_HEWANI', 'Protein Hewani', 10000000, 0),
  (gen_random_uuid(), 'sppg-id', 'PROTEIN_NABATI', 'Protein Nabati', 8000000, 0),
  (gen_random_uuid(), 'sppg-id', 'SAYURAN', 'Sayuran', 5000000, 0),
  (gen_random_uuid(), 'sppg-id', 'BUAH', 'Buah', 6000000, 0);
```

---

## 🚀 Deployment Commands

### Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed data (optional)
npm run db:seed
```

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/bagizi_db"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://app.bagizi.id"

# Email (optional)
EMAIL_PROVIDER="resend"
EMAIL_API_KEY="re_abc123"
EMAIL_FROM="noreply@bagizi.id"

# Deep links
NEXT_PUBLIC_APP_URL="https://app.bagizi.id"
```

### Vercel Deployment
```bash
# Build & deploy
npm run build
vercel --prod

# Setup cron jobs in Vercel dashboard:
# POST /api/cron/escalate-approvals (daily at 9 AM)
```

---

## 📈 Performance Benchmarks

### API Response Times (Target)
- Order creation: < 500ms
- Order approval: < 300ms
- Budget validation: < 200ms
- Notification sending: < 5s (total for all recipients)

### Database Query Times (Target)
- Procurement list: < 100ms
- Order detail: < 80ms
- Budget check: < 80ms
- Approval tracking: < 50ms

### Notification Delivery (Target)
- WhatsApp: < 2s average
- Email: < 5s average
- Delivery rate: > 98%

---

## 🐛 Common Issues & Solutions

### Issue 1: Notifications Not Sending
**Symptoms**: Orders created but no notifications received  
**Debug**:
```typescript
// Check settings configured
const settings = await db.procurementSettings.findUnique({ 
  where: { sppgId },
  select: { 
    approvalNotificationWhatsapp: true,
    approvalNotificationEmail: true 
  }
})
console.log('Settings:', settings) // Should not be null

// Check users have contact info
const users = await db.user.findMany({
  where: { sppgId, userRole: 'SPPG_ADMIN' },
  select: { phone: true, email: true }
})
console.log('Users:', users) // Should have phone or email
```

### Issue 2: Budget Always Exceeds
**Symptoms**: All orders blocked by budget validation  
**Debug**:
```typescript
// Check budget categories exist
const categories = await db.budgetCategory.findMany({
  where: { sppgId, month: currentMonth, year: currentYear }
})
console.log('Categories:', categories) // Should have monthly budgets

// Check current usage calculation
const utilization = await getBudgetUtilization(sppgId, category)
console.log('Utilization:', utilization) // Should be < 100%
```

### Issue 3: Orders Not Escalating
**Symptoms**: Pending orders not escalated after 3 days  
**Debug**:
```bash
# Test cron job manually
curl -X POST https://app.bagizi.id/api/cron/escalate-approvals \
  -H "Authorization: Bearer cron-secret"

# Check logs
tail -f logs/escalation.log
```

---

## 📞 Support Contacts

**Platform**: Bagizi-ID SaaS  
**Owner**: yasunstudio  
**Repository**: github.com/yasunstudio/bagizi-id  
**Documentation**: `/docs/` directory  

**Key Documents**:
- `PROJECT_COMPLETE_SUMMARY.md` - Full implementation summary
- `PHASE_4.4_EMAIL_NOTIFICATIONS_COMPLETE.md` - Email system guide
- `OPTION_C_APPROVAL_REQUEST_AT_CREATION_COMPLETE.md` - Approval flow
- `copilot-instructions.md` - Development guidelines

---

## ✅ Quick Checklist for New SPPG

- [ ] Create SPPG record in database
- [ ] Setup ProcurementSettings with thresholds
- [ ] Create approval levels (1-3 levels typical)
- [ ] Setup budget categories with monthly limits
- [ ] Configure WhatsApp notification number
- [ ] Configure Email notification settings
- [ ] Add admin users with email & phone
- [ ] Test auto-approve flow
- [ ] Test manual approval flow
- [ ] Test budget validation
- [ ] Test notifications delivery
- [ ] Setup cron job for escalation

---

**Last Updated**: October 31, 2025  
**Platform Version**: v1.0.0 (Production Ready)  
**Status**: ✅ All 13 phases complete, ready for deployment!
