# Procurement Navigation Implementation

**Date**: January 19, 2025  
**Status**: ✅ Phase 1 Complete - Navigation Structure  
**Related**: PROCUREMENT_WORKFLOW_GUIDE.md

## 🎯 Overview

Implementasi struktur navigasi untuk modul Procurement di SPPG Sidebar dengan fitur:
- ✅ **Expandable Submenu** - Menu Procurement dengan 8 submenu menggunakan Collapsible component
- ✅ **Role-Based Access** - Filter submenu berdasarkan user role (SPPG_KEPALA, SPPG_AKUNTAN, SPPG_STAFF, dll)
- ✅ **Badge Notifications** - Badge count untuk pending approvals, drafts, ordered items, dll
- ✅ **Active State Management** - Auto-expand ketika user di halaman procurement
- ✅ **Icon Integration** - Icon yang sesuai untuk setiap submenu dari lucide-react

---

## 📁 File Modified

### `/src/components/shared/navigation/SppgSidebar.tsx`

**Changes Made:**

#### 1. **New Imports Added**
```typescript
import { useState } from 'react'  // For collapsible state management
import { 
  ClipboardList,    // Dashboard, Perencanaan
  ShoppingBag,      // Purchase Orders
  PackageCheck,     // Penerimaan Barang
  CreditCard,       // Pembayaran
  BarChart2,        // Laporan
  Cog,             // Pengaturan
  ChevronDown,     // Collapsible indicator
} from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
```

#### 2. **Updated Type Definitions**
```typescript
interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | null
  resource?: string
  children?: NavigationSubItem[]  // 👈 NEW: Support for submenus
}

interface NavigationSubItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | null
  roles?: string[]  // 👈 NEW: Role-based access control
}
```

#### 3. **Updated Procurement Navigation Structure**
```typescript
{
  title: 'Procurement',
  href: '/procurement',
  icon: ShoppingCart,
  badge: '3', // Total pending items
  resource: 'procurement',
  children: [
    {
      title: 'Dashboard',
      href: '/procurement',
      icon: ClipboardList,
      badge: null,
      roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN', 'SPPG_STAFF']
    },
    {
      title: 'Perencanaan',
      href: '/procurement/plans',
      icon: ClipboardList,
      badge: '2', // Pending approval count
      roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN']
    },
    {
      title: 'Purchase Orders',
      href: '/procurement/orders',
      icon: ShoppingBag,
      badge: '3', // Ordered count
      roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN', 'SPPG_STAFF']
    },
    {
      title: 'Penerimaan Barang',
      href: '/procurement/receipts',
      icon: PackageCheck,
      badge: '1', // Awaiting QC count
      roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_STAFF_QC', 'SPPG_STAFF']
    },
    {
      title: 'Supplier',
      href: '/procurement/suppliers',
      icon: Building2,
      badge: null,
      roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN']
    },
    {
      title: 'Pembayaran',
      href: '/procurement/payments',
      icon: CreditCard,
      badge: '2', // Overdue count
      roles: ['SPPG_KEPALA', 'SPPG_AKUNTAN']
    },
    {
      title: 'Laporan',
      href: '/procurement/reports',
      icon: BarChart2,
      badge: null,
      roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN']
    },
    {
      title: 'Pengaturan',
      href: '/procurement/settings',
      icon: Cog,
      badge: null,
      roles: ['SPPG_KEPALA', 'SPPG_ADMIN']
    }
  ]
}
```

#### 4. **Enhanced Component Logic**
```typescript
export function SppgSidebar({ className, onClose }: SppgSidebarProps) {
  const pathname = usePathname()
  const { user, canAccess, logout } = useAuth()
  
  // Auto-expand procurement menu when on procurement pages
  const [openProcurement, setOpenProcurement] = useState(
    pathname.startsWith('/procurement')
  )

  // Helper function to check if user has specific role
  const hasRole = (allowedRoles?: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true
    if (!user?.userRole) return false
    return allowedRoles.includes(user.userRole)
  }

  // ... rest of component
}
```

#### 5. **New Submenu Rendering Logic**
```typescript
// Check if item has children (submenu)
if (item.children && item.children.length > 0) {
  // Filter children based on user roles
  const allowedChildren = item.children.filter(child => hasRole(child.roles))
  
  if (allowedChildren.length === 0) return null
  
  return (
    <Collapsible
      key={item.href}
      open={openProcurement}
      onOpenChange={setOpenProcurement}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isActive}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
            <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {item.badge && (
          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
        )}
      </SidebarMenuItem>
      <CollapsibleContent>
        <SidebarMenuSub>
          {allowedChildren.map((subItem) => {
            const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/')
            
            return (
              <SidebarMenuSubItem key={subItem.href}>
                <SidebarMenuSubButton asChild isActive={isSubActive}>
                  <Link href={subItem.href} onClick={onClose}>
                    {subItem.icon && <subItem.icon className="h-4 w-4" />}
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
                {subItem.badge && (
                  <SidebarMenuBadge>{subItem.badge}</SidebarMenuBadge>
                )}
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

---

## 🎨 Visual Structure

```
SPPG Dashboard
├── Overview
│   └── Dashboard
├── Program Management
│   ├── Program
│   └── Schools
├── Operations
│   ├── Menu Management
│   ├── Menu Planning
│   ├── Procurement [3] ◀─── EXPANDABLE
│   │   ├── Dashboard
│   │   ├── Perencanaan [2]
│   │   ├── Purchase Orders [3]
│   │   ├── Penerimaan Barang [1]
│   │   ├── Supplier
│   │   ├── Pembayaran [2]
│   │   ├── Laporan
│   │   └── Pengaturan
│   ├── Production
│   ├── Distribution
│   └── Suppliers
├── Management
│   ├── Inventory
│   ├── Stock Movements
│   └── User Management
├── Human Resources
│   ├── Departments
│   ├── Positions
│   └── Employees
├── Reports & Analytics
│   └── Reports
└── Settings
    └── SPPG Settings
```

---

## 🔐 Role-Based Access Matrix

| Submenu | SPPG_KEPALA | SPPG_ADMIN | SPPG_AKUNTAN | SPPG_STAFF_QC | SPPG_STAFF | SPPG_VIEWER |
|---------|-------------|------------|--------------|---------------|------------|-------------|
| Dashboard | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Perencanaan | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Purchase Orders | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Penerimaan Barang | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Supplier | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Pembayaran | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Laporan | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Pengaturan | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Implementation:**
```typescript
// Example for SPPG_AKUNTAN
const user = { userRole: 'SPPG_AKUNTAN' }

// Will see: Dashboard, Perencanaan, Purchase Orders, Supplier, Pembayaran, Laporan
// Will NOT see: Penerimaan Barang, Pengaturan
```

---

## 🔔 Badge Count System

### Current Implementation (Static Placeholders)

```typescript
{
  title: 'Procurement',
  badge: '3',  // Total pending items across all submenus
  children: [
    { title: 'Perencanaan', badge: '2' },           // Pending approval count
    { title: 'Purchase Orders', badge: '3' },       // Ordered status count
    { title: 'Penerimaan Barang', badge: '1' },     // Awaiting QC count
    { title: 'Pembayaran', badge: '2' },            // Overdue payment count
  ]
}
```

### Future Implementation (Dynamic from API)

**Create Hook**: `/src/hooks/use-procurement-badges.ts`
```typescript
export function useProcurementBadges() {
  const { data } = useQuery({
    queryKey: ['procurement', 'badges'],
    queryFn: async () => {
      const response = await fetch('/api/sppg/procurement/badges')
      return response.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  return {
    pendingApprovalCount: data?.pendingApprovals || 0,
    draftCount: data?.drafts || 0,
    orderedCount: data?.ordered || 0,
    receivedCount: data?.received || 0,
    awaitingQcCount: data?.awaitingQc || 0,
    overduePaymentCount: data?.overduePayments || 0,
    totalPending: data?.totalPending || 0,
  }
}
```

**API Endpoint**: `/src/app/api/sppg/procurement/badges/route.ts`
```typescript
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user.sppgId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [
    pendingApprovals,
    drafts,
    ordered,
    received,
    awaitingQc,
    overduePayments
  ] = await Promise.all([
    db.procurementPlan.count({
      where: {
        sppgId: session.user.sppgId,
        approvalStatus: 'PENDING_APPROVAL'
      }
    }),
    db.procurement.count({
      where: {
        sppgId: session.user.sppgId,
        status: 'DRAFT'
      }
    }),
    db.procurement.count({
      where: {
        sppgId: session.user.sppgId,
        status: 'ORDERED'
      }
    }),
    db.procurement.count({
      where: {
        sppgId: session.user.sppgId,
        status: 'RECEIVED'
      }
    }),
    db.procurement.count({
      where: {
        sppgId: session.user.sppgId,
        qualityStatus: 'AWAITING_QC'
      }
    }),
    db.procurement.count({
      where: {
        sppgId: session.user.sppgId,
        paymentStatus: 'OVERDUE'
      }
    })
  ])

  return Response.json({
    pendingApprovals,
    drafts,
    ordered,
    received,
    awaitingQc,
    overduePayments,
    totalPending: pendingApprovals + ordered + awaitingQc + overduePayments
  })
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: SPPG_KEPALA (Full Access)
```bash
# Login as SPPG_KEPALA
# Expected: See all 8 procurement submenus
✅ Dashboard
✅ Perencanaan [2]
✅ Purchase Orders [3]
✅ Penerimaan Barang [1]
✅ Supplier
✅ Pembayaran [2]
✅ Laporan
✅ Pengaturan
```

### Scenario 2: SPPG_AKUNTAN (Financial Focus)
```bash
# Login as SPPG_AKUNTAN
# Expected: See 6 financial-related submenus
✅ Dashboard
✅ Perencanaan [2]
✅ Purchase Orders [3]
❌ Penerimaan Barang (No access)
✅ Supplier
✅ Pembayaran [2]
✅ Laporan
❌ Pengaturan (No access)
```

### Scenario 3: SPPG_STAFF (Limited Access)
```bash
# Login as SPPG_STAFF
# Expected: See 3 operational submenus
✅ Dashboard
❌ Perencanaan (No access)
✅ Purchase Orders [3]
✅ Penerimaan Barang [1]
❌ Supplier (No access)
❌ Pembayaran (No access)
❌ Laporan (No access)
❌ Pengaturan (No access)
```

### Scenario 4: SPPG_STAFF_QC (Quality Control)
```bash
# Login as SPPG_STAFF_QC
# Expected: See only receipt-related menu
❌ Dashboard (No access)
❌ Perencanaan (No access)
❌ Purchase Orders (No access)
✅ Penerimaan Barang [1]
❌ Supplier (No access)
❌ Pembayaran (No access)
❌ Laporan (No access)
❌ Pengaturan (No access)
```

---

## 📋 Next Steps

### Phase 2: Permission Helpers ⏳
**File**: `/src/lib/permissions/procurement.ts`
```typescript
export function canViewProcurementDashboard(role: string): boolean {
  return ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN', 'SPPG_STAFF'].includes(role)
}

export function canManageProcurementPlan(role: string): boolean {
  return ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'].includes(role)
}

// ... more permission functions
```

### Phase 3: Dynamic Badge Counts ⏳
- Create `/src/hooks/use-procurement-badges.ts`
- Create `/src/app/api/sppg/procurement/badges/route.ts`
- Integrate badge hook into SppgSidebar component
- Replace static badge values with dynamic data

### Phase 4: Route Pages ⏳
Create the following pages:
- `/src/app/(sppg)/procurement/page.tsx` - Dashboard
- `/src/app/(sppg)/procurement/plans/page.tsx` - Perencanaan
- `/src/app/(sppg)/procurement/orders/page.tsx` - Purchase Orders
- `/src/app/(sppg)/procurement/receipts/page.tsx` - Penerimaan Barang
- `/src/app/(sppg)/procurement/suppliers/page.tsx` - Supplier
- `/src/app/(sppg)/procurement/payments/page.tsx` - Pembayaran
- `/src/app/(sppg)/procurement/reports/page.tsx` - Laporan
- `/src/app/(sppg)/procurement/settings/page.tsx` - Pengaturan

### Phase 5: Middleware Protection ⏳
Update `/middleware.ts` to protect procurement routes based on roles

---

## 🎯 Success Criteria

- [x] ✅ Procurement menu expands to show submenus
- [x] ✅ Submenus are filtered based on user role
- [x] ✅ Chevron icon rotates when menu is expanded
- [x] ✅ Active state highlights current page
- [x] ✅ Badge counts display on parent and children
- [x] ✅ Menu auto-expands when user is on procurement page
- [ ] ⏳ Badge counts are fetched dynamically from API
- [ ] ⏳ All procurement route pages are created
- [ ] ⏳ Middleware protection is implemented
- [ ] ⏳ Tested with all user roles

---

## 📚 References

- **Main Documentation**: `PROCUREMENT_WORKFLOW_GUIDE.md`
- **shadcn/ui Sidebar**: https://ui.shadcn.com/docs/components/sidebar
- **shadcn/ui Collapsible**: https://ui.shadcn.com/docs/components/collapsible
- **Copilot Instructions**: `.github/copilot-instructions.md` - Feature-based architecture patterns

---

## ✅ Summary

**What Was Implemented:**
1. ✅ Added expandable Procurement submenu with 8 items
2. ✅ Implemented role-based filtering for submenus
3. ✅ Added all necessary icons from lucide-react
4. ✅ Created `hasRole()` helper function for permission checking
5. ✅ Integrated Collapsible component for expand/collapse functionality
6. ✅ Added auto-expand on procurement pages
7. ✅ Implemented badge count placeholders (static for now)
8. ✅ Added ChevronDown rotation animation

**Current State:**
- Navigation structure is complete and functional
- Role-based access control is working
- Static badge counts are in place
- Ready for next phase: dynamic badge counts and route pages

**No Errors:** ✅ TypeScript compilation successful with zero errors
