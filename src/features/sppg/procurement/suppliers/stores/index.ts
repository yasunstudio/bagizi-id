/**
 * @fileoverview Supplier Zustand Store - Independent Domain
 * @version Next.js 15.5.4 / Zustand / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ARCHITECTURAL NOTE:
 * Supplier store is in independent domain for state management across modules
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Supplier, SupplierFilters } from '../types'

// ================================ STATE INTERFACE ================================

interface SupplierState {
  // Selected supplier
  selectedSupplierId: string | null
  
  // Filters
  filters: Partial<SupplierFilters>
  searchQuery: string
  
  // UI state
  isFormOpen: boolean
  isPerformanceDialogOpen: boolean
  formMode: 'create' | 'edit'
  editingSupplier: Supplier | null
  
  // View preferences
  viewMode: 'list' | 'grid' | 'table'
  sortBy: 'name' | 'rating' | 'orders' | 'reliability'
  sortOrder: 'asc' | 'desc'
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  
  // Actions - Selection
  setSelectedSupplier: (supplierId: string | null) => void
  
  // Actions - Filters
  setFilters: (filters: Partial<SupplierFilters>) => void
  updateFilter: (key: keyof SupplierFilters, value: unknown) => void
  clearFilters: () => void
  setSearchQuery: (query: string) => void
  
  // Actions - Form
  openCreateForm: () => void
  openEditForm: (supplier: Supplier) => void
  closeForm: () => void
  
  // Actions - Performance Dialog
  openPerformanceDialog: (supplierId: string) => void
  closePerformanceDialog: () => void
  
  // Actions - View
  setViewMode: (mode: 'list' | 'grid' | 'table') => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  
  // Actions - Pagination
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  
  // Actions - Utility
  reset: () => void
}

// ================================ INITIAL STATE ================================

const initialState = {
  selectedSupplierId: null,
  filters: {},
  searchQuery: '',
  isFormOpen: false,
  isPerformanceDialogOpen: false,
  formMode: 'create' as const,
  editingSupplier: null,
  viewMode: 'table' as const,
  sortBy: 'name' as const,
  sortOrder: 'asc' as const,
  currentPage: 1,
  itemsPerPage: 20,
}

// ================================ STORE DEFINITION ================================

/**
 * SPPG Supplier store with enterprise patterns
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { filters, setFilters } = useSupplierStore()
 * 
 * // With selector for optimized re-renders
 * const filters = useSupplierStore(state => state.filters)
 * 
 * // Using helper selectors
 * const hasFilters = useSupplierStore(supplierSelectors.hasActiveFilters)
 * ```
 */
export const useSupplierStore = create<SupplierState>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        // Initial state
        ...initialState,

        // Selection actions
        setSelectedSupplier: (supplierId) =>
          set((state) => {
            state.selectedSupplierId = supplierId
          }),

        // Filter actions
        setFilters: (filters) =>
          set((state) => {
            state.filters = filters
            state.currentPage = 1
          }),

        updateFilter: (key, value) =>
          set((state) => {
            state.filters = { ...state.filters, [key]: value }
            state.currentPage = 1
          }),

        clearFilters: () =>
          set((state) => {
            state.filters = {}
            state.searchQuery = ''
            state.currentPage = 1
          }),

        setSearchQuery: (query) =>
          set((state) => {
            state.searchQuery = query
            state.currentPage = 1
          }),

        // Form actions
        openCreateForm: () =>
          set((state) => {
            state.isFormOpen = true
            state.formMode = 'create'
            state.editingSupplier = null
          }),

        openEditForm: (supplier) =>
          set((state) => {
            state.isFormOpen = true
            state.formMode = 'edit'
            state.editingSupplier = supplier
          }),

        closeForm: () =>
          set((state) => {
            state.isFormOpen = false
            state.editingSupplier = null
          }),

        // Performance dialog actions
        openPerformanceDialog: (supplierId) =>
          set((state) => {
            state.isPerformanceDialogOpen = true
            state.selectedSupplierId = supplierId
          }),

        closePerformanceDialog: () =>
          set((state) => {
            state.isPerformanceDialogOpen = false
          }),

        // View actions
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode
          }),

        setSorting: (sortBy, sortOrder) =>
          set((state) => {
            state.sortBy = sortBy as 'name' | 'rating' | 'orders' | 'reliability'
            state.sortOrder = sortOrder
          }),

        // Pagination actions
        setCurrentPage: (page) =>
          set((state) => {
            state.currentPage = page
          }),

        setItemsPerPage: (count) =>
          set((state) => {
            state.itemsPerPage = count
            state.currentPage = 1
          }),

        // Reset to initial state
        reset: () =>
          set((state) => {
            Object.assign(state, initialState)
          }),
      }))
    ),
    {
      name: 'sppg-supplier-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// ================================ SELECTORS ================================

/**
 * Supplier selectors for optimized component updates
 * Use these to prevent unnecessary re-renders
 */
export const supplierSelectors = {
  // Selection
  selectedSupplierId: (state: SupplierState) => state.selectedSupplierId,
  
  // Filters
  filters: (state: SupplierState) => state.filters,
  searchQuery: (state: SupplierState) => state.searchQuery,
  hasActiveFilters: (state: SupplierState) => 
    Object.keys(state.filters).length > 0 || state.searchQuery.length > 0,
  
  // Form state
  isFormOpen: (state: SupplierState) => state.isFormOpen,
  isPerformanceDialogOpen: (state: SupplierState) => state.isPerformanceDialogOpen,
  formMode: (state: SupplierState) => state.formMode,
  editingSupplier: (state: SupplierState) => state.editingSupplier,
  
  // View preferences
  viewMode: (state: SupplierState) => state.viewMode,
  sortBy: (state: SupplierState) => state.sortBy,
  sortOrder: (state: SupplierState) => state.sortOrder,
  
  // Pagination
  currentPage: (state: SupplierState) => state.currentPage,
  itemsPerPage: (state: SupplierState) => state.itemsPerPage,
  
  // Computed
  isCreating: (state: SupplierState) => 
    state.isFormOpen && state.formMode === 'create',
  isEditing: (state: SupplierState) => 
    state.isFormOpen && state.formMode === 'edit',
}

// ================================ HOOKS ================================

/**
 * Hook to use supplier store with selector
 * Optimizes re-renders by selecting only needed state
 * 
 * @example
 * ```tsx
 * const filters = useSupplierSelector(state => state.filters)
 * const hasFilters = useSupplierSelector(supplierSelectors.hasActiveFilters)
 * ```
 */
export function useSupplierSelector<T>(
  selector: (state: SupplierState) => T
): T {
  return useSupplierStore(selector)
}

// ================================ TYPE EXPORTS ================================

export type { SupplierState }
