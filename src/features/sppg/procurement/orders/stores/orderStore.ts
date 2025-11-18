/**
 * @fileoverview Procurement Orders Zustand Store - Enterprise-grade
 * @version Next.js 15.5.4 / Zustand 5.0.2 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * 
 * CRITICAL: Centralized client-side state management for Orders
 * - Complements TanStack Query (not a replacement)
 * - UI state: filters, selected items, dialogs
 * - Temporary state: draft forms, bulk operations
 * - NO server data (use TanStack Query hooks instead)
 * 
 * PATTERN:
 * - UI State: Filter preferences, selected items
 * - Temporary State: Draft data, bulk selections
 * - Actions: Update UI state, handle temporary data
 * 
 * USAGE:
 * ```typescript
 * // Get state
 * const { filters, selectedOrders } = useOrderStore()
 * 
 * // Update state
 * const { setFilters, toggleOrderSelection } = useOrderStore()
 * ```
 */

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OrderFilters, PaginationParams } from '../types'

// ================================ STORE TYPES ================================

/**
 * Order Store State
 * Contains UI preferences and temporary data
 */
interface OrderStoreState {
  // ============ UI State ============
  
  /** Current filter preferences (persisted) */
  filters: OrderFilters
  
  /** Current pagination preferences (persisted) */
  pagination: PaginationParams
  
  /** Selected order IDs for bulk actions */
  selectedOrders: string[]
  
  /** Dialog visibility states */
  dialogs: {
    createOrder: boolean
    editOrder: boolean
    deleteOrder: boolean
    approveOrder: boolean
    rejectOrder: boolean
    cancelOrder: boolean
    viewDetails: boolean
  }
  
  /** Currently active order ID (for dialogs/actions) */
  activeOrderId: string | null
  
  // ============ Temporary State ============
  
  /** Draft order data (before API submission) */
  draftOrder: Record<string, unknown> | null
  
  /** Bulk action mode */
  bulkActionMode: boolean
  
  /** View preferences */
  viewMode: 'table' | 'cards' | 'compact'
  
  /** Column visibility (for table view) */
  visibleColumns: string[]
}

/**
 * Order Store Actions
 * Methods to update state
 */
interface OrderStoreActions {
  // ============ Filter Actions ============
  
  /** Update filter preferences */
  setFilters: (filters: Partial<OrderFilters>) => void
  
  /** Clear all filters */
  clearFilters: () => void
  
  /** Reset filters to default */
  resetFilters: () => void
  
  // ============ Pagination Actions ============
  
  /** Update pagination preferences */
  setPagination: (pagination: Partial<PaginationParams>) => void
  
  /** Go to specific page */
  goToPage: (page: number) => void
  
  /** Change page size */
  setPageSize: (size: number) => void
  
  // ============ Selection Actions ============
  
  /** Toggle single order selection */
  toggleOrderSelection: (orderId: string) => void
  
  /** Select multiple orders */
  selectOrders: (orderIds: string[]) => void
  
  /** Clear all selections */
  clearSelection: () => void
  
  /** Select all orders on current page */
  selectAllOnPage: (orderIds: string[]) => void
  
  // ============ Dialog Actions ============
  
  /** Open specific dialog */
  openDialog: (dialog: keyof OrderStoreState['dialogs'], orderId?: string) => void
  
  /** Close specific dialog */
  closeDialog: (dialog: keyof OrderStoreState['dialogs']) => void
  
  /** Close all dialogs */
  closeAllDialogs: () => void
  
  // ============ Draft Actions ============
  
  /** Save draft order data */
  saveDraft: (data: Record<string, unknown>) => void
  
  /** Load draft order data */
  loadDraft: () => Record<string, unknown> | null
  
  /** Clear draft data */
  clearDraft: () => void
  
  // ============ View Actions ============
  
  /** Toggle bulk action mode */
  toggleBulkMode: () => void
  
  /** Change view mode */
  setViewMode: (mode: 'table' | 'cards' | 'compact') => void
  
  /** Toggle column visibility */
  toggleColumn: (columnId: string) => void
  
  /** Reset view preferences */
  resetView: () => void
  
  // ============ Utility Actions ============
  
  /** Reset entire store to defaults */
  reset: () => void
}

type OrderStore = OrderStoreState & OrderStoreActions

// ================================ DEFAULT STATE ================================

/**
 * Default filter state
 */
const defaultFilters: OrderFilters = {
  search: undefined,
  status: undefined,
  deliveryStatus: undefined,
  paymentStatus: undefined,
  supplierId: undefined,
  planId: undefined,
  purchaseMethod: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  priority: undefined,
  approvalStatus: undefined,
}

/**
 * Default pagination state
 */
const defaultPagination: PaginationParams = {
  page: 1,
  pageSize: 10,
}

/**
 * Default dialog state
 */
const defaultDialogs: OrderStoreState['dialogs'] = {
  createOrder: false,
  editOrder: false,
  deleteOrder: false,
  approveOrder: false,
  rejectOrder: false,
  cancelOrder: false,
  viewDetails: false,
}

/**
 * Default visible columns for table view
 */
const defaultVisibleColumns = [
  'orderNumber',
  'procurementDate',
  'supplier',
  'status',
  'priority',
  'totalAmount',
  'expectedDelivery',
  'actions',
]

/**
 * Initial store state
 */
const initialState: OrderStoreState = {
  filters: defaultFilters,
  pagination: defaultPagination,
  selectedOrders: [],
  dialogs: defaultDialogs,
  activeOrderId: null,
  draftOrder: null,
  bulkActionMode: false,
  viewMode: 'table',
  visibleColumns: defaultVisibleColumns,
}

// ================================ STORE IMPLEMENTATION ================================

/**
 * Orders Zustand Store with Persistence
 * 
 * Persisted State (localStorage):
 * - filters: User filter preferences
 * - pagination: User pagination preferences
 * - viewMode: User view preferences
 * - visibleColumns: User column preferences
 * 
 * Session State (memory):
 * - selectedOrders: Current selections
 * - dialogs: Dialog visibility
 * - draftOrder: Temporary draft data
 * - activeOrderId: Current active order
 */
export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ============ Filter Actions ============
      
      setFilters: (newFilters) =>
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
          pagination: {
            ...state.pagination,
            page: 1, // Reset to first page on filter change
          },
        })),
      
      clearFilters: () =>
        set({
          filters: defaultFilters,
          pagination: {
            ...defaultPagination,
            page: 1,
          },
        }),
      
      resetFilters: () =>
        set({
          filters: defaultFilters,
          pagination: defaultPagination,
        }),
      
      // ============ Pagination Actions ============
      
      setPagination: (newPagination) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            ...newPagination,
          },
        })),
      
      goToPage: (page) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            page,
          },
        })),
      
      setPageSize: (limit) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            limit,
            page: 1, // Reset to first page
          },
        })),
      
      // ============ Selection Actions ============
      
      toggleOrderSelection: (orderId) =>
        set((state) => ({
          selectedOrders: state.selectedOrders.includes(orderId)
            ? state.selectedOrders.filter((id) => id !== orderId)
            : [...state.selectedOrders, orderId],
        })),
      
      selectOrders: (orderIds) =>
        set({
          selectedOrders: orderIds,
        }),
      
      clearSelection: () =>
        set({
          selectedOrders: [],
          bulkActionMode: false,
        }),
      
      selectAllOnPage: (orderIds) =>
        set((state) => {
          const allSelected = orderIds.every((id) => state.selectedOrders.includes(id))
          
          if (allSelected) {
            // Deselect all on page
            return {
              selectedOrders: state.selectedOrders.filter(
                (id) => !orderIds.includes(id)
              ),
            }
          } else {
            // Select all on page
            return {
              selectedOrders: [
                ...state.selectedOrders,
                ...orderIds.filter((id) => !state.selectedOrders.includes(id)),
              ],
            }
          }
        }),
      
      // ============ Dialog Actions ============
      
      openDialog: (dialog, orderId) =>
        set((state) => ({
          dialogs: {
            ...state.dialogs,
            [dialog]: true,
          },
          activeOrderId: orderId || state.activeOrderId,
        })),
      
      closeDialog: (dialog) =>
        set((state) => ({
          dialogs: {
            ...state.dialogs,
            [dialog]: false,
          },
          // Clear activeOrderId if all dialogs are closed
          activeOrderId: Object.values({
            ...state.dialogs,
            [dialog]: false,
          }).every((open) => !open)
            ? null
            : state.activeOrderId,
        })),
      
      closeAllDialogs: () =>
        set({
          dialogs: defaultDialogs,
          activeOrderId: null,
        }),
      
      // ============ Draft Actions ============
      
      saveDraft: (data) =>
        set({
          draftOrder: data,
        }),
      
      loadDraft: () => get().draftOrder,
      
      clearDraft: () =>
        set({
          draftOrder: null,
        }),
      
      // ============ View Actions ============
      
      toggleBulkMode: () =>
        set((state) => ({
          bulkActionMode: !state.bulkActionMode,
          selectedOrders: state.bulkActionMode ? [] : state.selectedOrders,
        })),
      
      setViewMode: (mode) =>
        set({
          viewMode: mode,
        }),
      
      toggleColumn: (columnId) =>
        set((state) => ({
          visibleColumns: state.visibleColumns.includes(columnId)
            ? state.visibleColumns.filter((id) => id !== columnId)
            : [...state.visibleColumns, columnId],
        })),
      
      resetView: () =>
        set({
          viewMode: 'table',
          visibleColumns: defaultVisibleColumns,
        }),
      
      // ============ Utility Actions ============
      
      reset: () => set(initialState),
    }),
    {
      name: 'bagizi-order-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
        viewMode: state.viewMode,
        visibleColumns: state.visibleColumns,
      }),
    }
  )
)

// ================================ SELECTOR HOOKS ================================

/**
 * Selector hook for filters
 * Avoids unnecessary re-renders
 */
export const useOrderFilters = () =>
  useOrderStore((state) => state.filters)

/**
 * Selector hook for pagination
 * Avoids unnecessary re-renders
 */
export const useOrderPagination = () =>
  useOrderStore((state) => state.pagination)

/**
 * Selector hook for selected orders
 * Avoids unnecessary re-renders
 */
export const useSelectedOrders = () =>
  useOrderStore((state) => state.selectedOrders)

/**
 * Selector hook for dialogs state
 * Avoids unnecessary re-renders
 */
export const useOrderDialogs = () =>
  useOrderStore((state) => state.dialogs)

/**
 * Selector hook for active order ID
 * Avoids unnecessary re-renders
 */
export const useActiveOrderId = () =>
  useOrderStore((state) => state.activeOrderId)

/**
 * Selector hook for view preferences
 * Avoids unnecessary re-renders
 */
export const useOrderViewPreferences = () =>
  useOrderStore((state) => ({
    viewMode: state.viewMode,
    visibleColumns: state.visibleColumns,
  }))
