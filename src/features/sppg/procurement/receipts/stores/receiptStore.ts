/**
 * @fileoverview Receipt Zustand Store
 * @version Next.js 15.5.4 / Zustand / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ReceiptFilters, ReceiptSort, ReceiptSortField } from '../types'

// ================================ TYPES ================================

interface ReceiptStoreState {
  // Filters
  filters: ReceiptFilters
  setFilters: (filters: Partial<ReceiptFilters>) => void
  resetFilters: () => void
  
  // Sorting
  sort: ReceiptSort
  setSort: (field: ReceiptSortField) => void
  
  // View mode
  viewMode: 'list' | 'grid'
  setViewMode: (mode: 'list' | 'grid') => void
  
  // Selected receipts (for bulk actions)
  selectedIds: string[]
  toggleSelectReceipt: (id: string) => void
  selectAllReceipts: (ids: string[]) => void
  clearSelection: () => void
  
  // UI state
  isFilterPanelOpen: boolean
  setIsFilterPanelOpen: (open: boolean) => void
  toggleFilterPanel: () => void
  
  // Quality control dialog
  qcDialogOpen: boolean
  selectedReceiptForQC: string | null
  openQCDialog: (receiptId: string) => void
  closeQCDialog: () => void
  
  // Selectors
  selectActiveFilterCount: () => number
}

// ================================ INITIAL STATE ================================

const initialFilters: ReceiptFilters = {
  supplierId: undefined,
  deliveryStatus: undefined,
  qualityGrade: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  inspectedBy: undefined,
  searchTerm: undefined,
}

const initialSort: ReceiptSort = {
  field: 'actualDelivery',
  direction: 'desc',
}

// ================================ STORE ================================

export const useReceiptStore = create<ReceiptStoreState>()(
  devtools(
    (set) => ({
      // Filters
      filters: initialFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () =>
        set(() => ({
          filters: initialFilters,
        })),
      
      // Sorting
      sort: initialSort,
      setSort: (field) =>
        set((state) => ({
          sort: {
            field,
            direction:
              state.sort.field === field && state.sort.direction === 'asc'
                ? 'desc'
                : 'asc',
          },
        })),
      
      // View mode
      viewMode: 'list',
      setViewMode: (mode) => set({ viewMode: mode }),
      
      // Selected receipts
      selectedIds: [],
      toggleSelectReceipt: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedIds, id],
        })),
      selectAllReceipts: (ids) => set({ selectedIds: ids }),
      clearSelection: () => set({ selectedIds: [] }),
      
      // UI state
      isFilterPanelOpen: false,
      setIsFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),
      toggleFilterPanel: () =>
        set((state) => ({
          isFilterPanelOpen: !state.isFilterPanelOpen,
        })),
      
      // Quality control dialog
      qcDialogOpen: false,
      selectedReceiptForQC: null,
      openQCDialog: (receiptId) =>
        set({ qcDialogOpen: true, selectedReceiptForQC: receiptId }),
      closeQCDialog: () =>
        set({ qcDialogOpen: false, selectedReceiptForQC: null }),
      
      // Selectors
      selectActiveFilterCount: () => {
        const state = useReceiptStore.getState()
        const { filters } = state
        let count = 0
        
        if (filters.supplierId && filters.supplierId !== 'all') count++
        if (filters.deliveryStatus && filters.deliveryStatus !== 'all') count++
        if (filters.qualityGrade && filters.qualityGrade !== 'all') count++
        if (filters.dateFrom) count++
        if (filters.dateTo) count++
        if (filters.inspectedBy) count++
        if (filters.searchTerm) count++
        
        return count
      },
    }),
    {
      name: 'receipt-store',
    }
  )
)

// ================================ SELECTORS ================================

/**
 * Selector to check if any filters are active
 */
export const selectHasActiveFilters = (state: ReceiptStoreState): boolean => {
  const { filters } = state
  return !!(
    filters.supplierId ||
    filters.deliveryStatus ||
    filters.qualityGrade ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.inspectedBy ||
    filters.searchTerm
  )
}

/**
 * Selector to get active filter count
 */
export const selectActiveFilterCount = (state: ReceiptStoreState): number => {
  const { filters } = state
  let count = 0
  
  if (filters.supplierId) count++
  if (filters.deliveryStatus) count++
  if (filters.qualityGrade) count++
  if (filters.dateFrom) count++
  if (filters.dateTo) count++
  if (filters.inspectedBy) count++
  if (filters.searchTerm) count++
  
  return count
}

/**
 * Selector to check if receipts are selected
 */
export const selectHasSelection = (state: ReceiptStoreState): boolean => {
  return state.selectedIds.length > 0
}
