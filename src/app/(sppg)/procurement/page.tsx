/**
 * @fileoverview Procurement Dashboard - Business Process Overview
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_NAVIGATION_IMPLEMENTATION.md} Navigation Structure
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ARCHITECTURE: Business Process View (Option A)
 * - Dashboard as overview/entry point
 * - Sub-modules for workflow steps:
 *   1. Planning   → /procurement/plans
 *   2. Ordering   → /procurement/orders (main workflow)
 *   3. Receiving  → /procurement/receipts
 *   4. Supplier   → /procurement/suppliers
 *   5. Payment    → /procurement/payments (placeholder)
 *   6. Reports    → /procurement/reports (placeholder)
 * 
 * PATTERN: Modular Feature-Based Architecture ✅
 * - Uses API endpoint: /api/sppg/procurement/dashboard
 * - API Client: dashboardApi.getStats()
 * - Thin orchestrator: Auth → Fetch → Render
 * - Consistent with menu, orders, plans modules
 * 
 * ENTERPRISE-GRADE FEATURES:
 * - Server Component with SSR
 * - Authentication & Authorization (RBAC)
 * - Multi-tenant data isolation (sppgId filtering)
 * - Real-time statistics via API
 * - Quick action buttons
 * - Recent activities feed
 * - Pending approvals
 * - Low stock alerts
 * - Upcoming deliveries
 * - Dark mode support
 * - SEO optimization
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/auth'
import { checkSppgAccess } from '@/lib/permissions'
import { dashboardApi } from '@/features/sppg/procurement/dashboard/api/dashboardApi'
import { 
  ProcurementStats,
  RecentActivities,
  PendingApprovals,
  LowStockAlerts,
  UpcomingDeliveries,
  QuickActionsGrid
} from '@/features/sppg/procurement/dashboard/components'
import { ProcurementPageHeader } from '@/components/shared/procurement'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart } from 'lucide-react'

// ================================ METADATA ================================

export const metadata: Metadata = {
  title: 'Procurement Dashboard | Bagizi SPPG',
  description: 'Dashboard overview untuk manajemen pengadaan bahan baku SPPG. Monitor status pembelian, approval, delivery, dan payment secara real-time.',
  keywords: [
    'procurement dashboard',
    'pengadaan SPPG',
    'procurement overview',
    'purchase order monitoring',
    'procurement analytics',
    'supplier management dashboard'
  ],
  openGraph: {
    title: 'Procurement Dashboard - Bagizi SPPG',
    description: 'Monitor dan kelola seluruh proses procurement SPPG',
    type: 'website',
  },
}

// ================================ MAIN COMPONENT ================================

/**
 * Procurement Dashboard Page (Server Component)
 * 
 * Purpose: Entry point untuk procurement module dengan overview lengkap
 * Pattern: Thin Orchestrator - Auth → Fetch via API → Render
 * 
 * Business Process Flow:
 * 1. User lands on dashboard → Lihat stats & recent activities
 * 2. Click "Perencanaan" → /procurement/plans (planning & budgeting)
 * 3. Click "Purchase Orders" → /procurement/orders (main procurement list)
 * 4. Click "Penerimaan Barang" → /procurement/receipts (receiving & QC)
 * 5. Click "Supplier" → /procurement/suppliers (supplier management)
 * 6. Click "Pembayaran" → /procurement/payments (payment tracking)
 * 7. Click "Laporan" → /procurement/reports (analytics & reports)
 * 
 * Features:
 * - Real-time procurement statistics via API
 * - Pending approvals count
 * - Recent activities timeline
 * - Low stock alerts
 * - Upcoming deliveries schedule
 * - Quick action buttons to sub-modules
 * 
 * Architecture Note:
 * Uses dashboardApi client (modular pattern) instead of direct Prisma queries.
 * Consistent with existing menu, orders, plans implementations.
 */
export default async function ProcurementDashboardPage() {
  // ================================ AUTHENTICATION ================================
  
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // ================================ AUTHORIZATION ================================
  
  const userRole = session.user.userRole
  const sppgId = session.user.sppgId

  if (!sppgId) {
    redirect('/access-denied?reason=no_sppg')
  }

  // Verify SPPG access
  const sppg = await checkSppgAccess(sppgId)
  if (!sppg) {
    redirect('/access-denied?reason=invalid_sppg')
  }

  // Check if user has procurement access
  const canAccessProcurement = [
    'SPPG_KEPALA',
    'SPPG_ADMIN',
    'SPPG_AKUNTAN',
    'SPPG_PRODUKSI_MANAGER',
    'SPPG_STAFF',
    'SPPG_STAFF_QC'
  ].includes(userRole || '')

  if (!canAccessProcurement) {
    redirect('/access-denied?reason=insufficient_permissions')
  }

  // ================================ DATA FETCHING VIA API ================================
  
  /**
   * Fetch dashboard data via API client (modular pattern)
   * Uses existing /api/sppg/procurement/dashboard endpoint (262 lines)
   * Consistent with menu, orders, plans modules
   * 
   * Benefits:
   * - Reuses existing API endpoint
   * - Consistent architecture across modules
   * - Easier testing (mock API client)
   * - Single source of truth for data fetching logic
   * - Automatic caching via Next.js
   * 
   * CRITICAL: Must forward cookies from incoming request to API endpoint
   * for authentication to work in Server Component → API route flow
   */
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined
  
  const result = await dashboardApi.getStats(requestHeaders)
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to load dashboard statistics')
  }

  // Destructure data from API response
  const {
    orders,
    plans,
    suppliers,
    recentActivities,
    pendingApprovals,
    lowStockItems,
    upcomingDeliveries
  } = result.data

  // ================================ RENDER ================================

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProcurementPageHeader
        title="Procurement Dashboard"
        description={`Monitor dan kelola seluruh proses pengadaan bahan baku untuk ${sppg.name}`}
        icon={ShoppingCart}
        breadcrumbs={['Procurement']}
      />

      {/* Statistics Cards - Pass stats object from API */}
      <ProcurementStats stats={{ orders, plans, suppliers }} />

      {/* Quick Actions Grid - No props needed */}
      <QuickActionsGrid />

      <Separator />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Pending Approvals - Pass approvals array from API */}
          <PendingApprovals approvals={pendingApprovals} />

          {/* Low Stock Alerts - Pass items array from API */}
          <LowStockAlerts items={lowStockItems} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activities - Pass activities array from API */}
          <RecentActivities activities={recentActivities} />

          {/* Upcoming Deliveries - Pass deliveries array from API */}
          <UpcomingDeliveries deliveries={upcomingDeliveries} />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-muted/50 dark:bg-muted/20 rounded-lg border border-border/50">
        <div className="flex items-start gap-3">
          <ShoppingCart className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Procurement Workflow</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Planning</span> → Buat rencana pengadaan dengan alokasi budget
              {' • '}
              <span className="font-medium">Ordering</span> → Generate purchase orders dari planning
              {' • '}
              <span className="font-medium">Receiving</span> → Quality control dan penerimaan barang
              {' • '}
              <span className="font-medium">Payment</span> → Track status pembayaran dan jatuh tempo
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}