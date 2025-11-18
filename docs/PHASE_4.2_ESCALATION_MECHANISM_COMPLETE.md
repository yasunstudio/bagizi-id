# Phase 4.2: Escalation Mechanism - COMPLETED ✅

**Tanggal**: October 30, 2025  
**Status**: ✅ **COMPLETED**

---

## 📋 Overview

Phase 4.2 mengimplementasikan **escalation mechanism** untuk auto-escalate pending approvals yang melebihi threshold hari yang dikonfigurasi. Sistem akan otomatis mengeskalasi approval ke higher authority dan mencatat history escalation.

---

## 🎯 Implementation Summary

### 1. **Approval Workflow Helpers Extended** ✅
**File**: `/src/lib/approval-workflow.ts`

Added 2 new functions:

#### `escalateApproval()`
- Records escalation in ProcurementApprovalTracking
- Updates procurement notes with escalation info
- Tracks: escalatedFrom, escalatedTo, reason, isEscalated flag

#### `processEscalations()`
- Finds all pending orders exceeding escalation threshold
- Auto-escalates to SPPG_KEPALA
- Returns array of escalated order IDs
- Handles errors per order gracefully

**Code**:
```typescript
export async function escalateApproval(
  procurementId: string,
  escalatedFrom: string,
  escalatedTo: string,
  reason: string,
  escalatedBy: string = 'SYSTEM'
)

export async function processEscalations(sppgId: string): Promise<string[]>
```

---

### 2. **Manual Escalation Endpoint** ✅
**File**: `/src/app/api/sppg/procurement/orders/[id]/escalate/route.ts`

**Route**: `POST /api/sppg/procurement/orders/[id]/escalate`

**Features**:
- Manual escalation by authorized users
- Role validation (SPPG_KEPALA, SPPG_ADMIN, PLATFORM_SUPERADMIN)
- Records escalation with user info
- Updates order notes

**Request Body**:
```json
{
  "escalateToRole": "SPPG_KEPALA",
  "reason": "Urgent approval needed"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "orderId": "xxx",
    "escalation": {
      "from": ["SPPG_AKUNTAN"],
      "to": "SPPG_KEPALA",
      "reason": "Urgent approval needed",
      "escalatedBy": "John Doe",
      "escalatedAt": "2025-10-30T10:00:00Z"
    }
  }
}
```

---

### 3. **Cron Job for Auto-Escalation** ✅
**File**: `/src/app/api/cron/escalate-approvals/route.ts`

**Route**: `GET /api/cron/escalate-approvals`

**Features**:
- Processes all active SPPGs
- Finds orders exceeding approvalEscalationDays threshold
- Auto-escalates to higher authority
- Returns summary per SPPG

**Security**:
- Requires Bearer token authentication
- Uses CRON_SECRET environment variable

**Vercel Cron Configuration** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/escalate-approvals",
      "schedule": "0 9 * * *"
    }
  ]
}
```
- **Schedule**: Daily at 9:00 AM
- **Timezone**: Server timezone (adjustable in Vercel dashboard)

**Response**:
```json
{
  "success": true,
  "executedAt": "2025-10-30T09:00:00Z",
  "summary": {
    "totalSppgs": 5,
    "totalEscalated": 12
  },
  "details": {
    "sppg-id-1": {
      "sppgName": "SPPG Jakarta Pusat",
      "escalatedCount": 3,
      "escalatedOrderIds": ["order-1", "order-2", "order-3"]
    }
  }
}
```

---

### 4. **Client-Side Hook** ✅
**File**: `/src/features/sppg/procurement/orders/hooks/useOrders.ts`

**Hook**: `useEscalateOrder()`

**Usage**:
```typescript
const { mutate: escalateOrder } = useEscalateOrder()

escalateOrder({ 
  id: orderId, 
  data: { 
    escalateToRole: 'SPPG_KEPALA',
    reason: 'Urgent approval needed'
  } 
})
```

**Features**:
- TanStack Query mutation
- Auto-invalidates order cache
- Success/error toast notifications

---

### 5. **API Client Method** ✅
**File**: `/src/features/sppg/procurement/orders/api/orderApi.ts`

**Method**: `orderApi.escalate()`

**Usage**:
```typescript
const result = await orderApi.escalate(orderId, {
  escalateToRole: 'SPPG_KEPALA',
  reason: 'Urgent approval needed'
})
```

---

### 6. **UI Component Integration** ✅
**File**: `/src/features/sppg/procurement/orders/components/OrderDetail.tsx`

**Added**:
- `onEscalate` prop
- `canEscalate` prop
- Escalate button with ArrowUpCircle icon
- Shows when order status is PENDING_APPROVAL

**Button**:
```tsx
{canEscalate && (
  <Button onClick={onEscalate} variant="outline" size="sm">
    <ArrowUpCircle className="h-4 w-4 mr-2" />
    Escalate
  </Button>
)}
```

---

### 7. **Page Integration** ✅
**File**: `/src/app/(sppg)/procurement/orders/[id]/page.tsx`

**Added**:
- `useEscalateOrder()` hook
- `handleEscalate()` handler
- Pass props to OrderDetail component

**Handler**:
```typescript
const handleEscalate = async () => {
  escalateOrder(
    { 
      id: orderId, 
      data: { 
        escalateToRole: 'SPPG_KEPALA',
        reason: 'Approval diperlukan segera'
      } 
    },
    {
      onSuccess: () => {
        toast.success('Order berhasil dieskalasi')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal melakukan eskalasi')
      },
    }
  )
}
```

---

### 8. **Environment Configuration** ✅
**File**: `.env.example`

**Added**:
```bash
# Cron Jobs
CRON_SECRET="your-cron-secret-key-here-change-in-production"
```

**Note**: Set this in Vercel environment variables for production

---

## 🔧 Technical Details

### Database Schema (Already Exists from Phase 4.1)
```prisma
model ProcurementApprovalTracking {
  id              String   @id @default(cuid())
  procurementId   String
  approvalLevelId String?
  approverUserId  String
  approverName    String
  approverRole    String
  action          String   // APPROVED, REJECTED, ESCALATED
  comments        String?
  approvedAt      DateTime
  ipAddress       String?
  isEscalated     Boolean  @default(false)
  escalatedFrom   String?
  escalatedReason String?
  createdAt       DateTime @default(now())
}

model ProcurementSettings {
  // ... other fields
  approvalEscalationDays  Int  @default(3)  // Auto-escalate after X days
}
```

---

## 🎯 Escalation Logic Flow

1. **Cron Trigger** (Daily 9 AM)
   - Vercel Cron calls `/api/cron/escalate-approvals`
   - Authenticated with CRON_SECRET

2. **Process All SPPGs**
   - Loop through all active SPPGs
   - Call `processEscalations(sppgId)` for each

3. **Find Pending Orders**
   - Query orders with status = PENDING_APPROVAL
   - Filter where `procurementDate <= (today - approvalEscalationDays)`

4. **Escalate Each Order**
   - Get required approvers from approval levels
   - Get already approved roles
   - Calculate pending roles
   - Call `escalateApproval()` to record escalation

5. **Update Order**
   - Add escalation record to ProcurementApprovalTracking
   - Update order qualityNotes with escalation info
   - Set isEscalated = true, record escalatedFrom/reason

---

## 🧪 Testing

### Manual Testing
```bash
# Test manual escalation endpoint
curl -X POST http://localhost:3000/api/sppg/procurement/orders/[orderId]/escalate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "escalateToRole": "SPPG_KEPALA",
    "reason": "Urgent approval needed"
  }'

# Test cron endpoint
curl -X GET http://localhost:3000/api/cron/escalate-approvals \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Vercel Cron Testing
1. Go to Vercel Dashboard → Project → Crons
2. Click "Run Now" to trigger manually
3. Check logs for execution results

---

## 📊 Features Completed

✅ **Auto-Escalation Logic**
- getPendingEscalations() - Find orders needing escalation
- escalateApproval() - Record escalation action
- processEscalations() - Batch process all SPPGs

✅ **Manual Escalation**
- POST endpoint with role validation
- UI button in OrderDetail component
- TanStack Query hook integration

✅ **Cron Job**
- Vercel Cron configuration
- Daily execution at 9 AM
- Bearer token authentication
- Summary reporting per SPPG

✅ **Tracking & History**
- ProcurementApprovalTracking records
- Escalation flags (isEscalated, escalatedFrom, escalatedReason)
- Order notes updated with escalation info

✅ **Client Integration**
- useEscalateOrder() hook
- orderApi.escalate() method
- OrderDetail component button
- Page handler with toast notifications

---

## 🎉 Benefits

1. **Automated Workflow**: No manual intervention needed for stuck approvals
2. **Accountability**: Full escalation history tracked
3. **Visibility**: Clear escalation path and reasons
4. **Flexibility**: Both auto and manual escalation supported
5. **Scalability**: Processes all SPPGs efficiently
6. **Monitoring**: Summary reports for audit trail

---

## 📝 Next Steps

With Phase 4.2 complete, ready to proceed to:

- **Phase 4.3**: WhatsApp notifications for escalation alerts
- **Phase 4.4**: Email notifications for escalation alerts
- **Phase 4.5**: Accounting system integration

---

## 🔗 Related Files

**Core Logic**:
- `/src/lib/approval-workflow.ts` - Escalation helpers (400+ lines)

**API Endpoints**:
- `/src/app/api/sppg/procurement/orders/[id]/escalate/route.ts` - Manual escalation
- `/src/app/api/cron/escalate-approvals/route.ts` - Auto-escalation cron

**Client-Side**:
- `/src/features/sppg/procurement/orders/hooks/useOrders.ts` - useEscalateOrder hook
- `/src/features/sppg/procurement/orders/api/orderApi.ts` - orderApi.escalate method
- `/src/features/sppg/procurement/orders/components/OrderDetail.tsx` - Escalate button
- `/src/app/(sppg)/procurement/orders/[id]/page.tsx` - Page integration

**Configuration**:
- `vercel.json` - Cron schedule configuration
- `.env.example` - CRON_SECRET environment variable

---

**Status**: ✅ **PHASE 4.2 COMPLETE**  
**Total Implementation**: 11/14 Phases Complete (78.5%)
