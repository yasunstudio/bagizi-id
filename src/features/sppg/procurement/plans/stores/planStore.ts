/**
 * @fileoverview Procurement Plans Zustand Store
 * @version Next.js 15.5.4 / Zustand 5.0.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * STORE ARCHITECTURE:
 * - Client-side state management with Zustand
 * - Persistent filters with localStorage
 * - Type-safe actions and state
 * - Lightweight alternative to Redux
 * 
 * STATE MANAGEMENT:
 * - selectedPlan: Currently selected plan for detail view
 * - planFilters: Active filter state for list view
 * - Actions: setSelectedPlan, setPlanFilters, clearPlanFilters, resetPlanStore
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlanFilters } from '../types'

// ================================ TYPES ================================

/**
 * Plan store state
 */
interface PlanState {
  // State
  selectedPlanId: string | null
  planFilters: PlanFilters
  
  // Actions
  setSelectedPlanId: (id: string | null) => void
  setPlanFilters: (filters: Partial<PlanFilters>) => void
  clearPlanFilters: () => void
  resetPlanStore: () => void
}

// ================================ INITIAL STATE ================================

/**
 * Default filters
 */
const defaultFilters: PlanFilters = {
  search: undefined,
  approvalStatus: undefined,
  planYear: undefined,
  planMonth: undefined,
  planQuarter: undefined,
  minBudget: undefined,
  maxBudget: undefined,
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

// ================================ STORE ================================

/**
 * Plans Zustand Store
 * 
 * Manages client-side state for plans domain:
 * - Selected plan ID for detail views
 * - Filter state for list views (persisted to localStorage)
 * 
 * @example
 * // In component
 * const { selectedPlanId, setSelectedPlanId, planFilters, setPlanFilters } = usePlanStore()
 * 
 * // Set selected plan
 * setSelectedPlanId('plan_123')
 * 
 * // Update filters
 * setPlanFilters({ approvalStatus: ['APPROVED'], planYear: 2025 })
 * 
 * // Clear filters
 * clearPlanFilters()
 */
export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      // ================================ STATE ================================
      
      selectedPlanId: null,
      planFilters: defaultFilters,
      
      // ================================ ACTIONS ================================
      
      /**
       * Set selected plan ID
       * Used in detail view to track current plan
       * 
       * @param id - Plan ID or null to clear
       * 
       * @example
       * setSelectedPlanId('plan_123')
       * setSelectedPlanId(null) // Clear selection
       */
      setSelectedPlanId: (id) => {
        set({ selectedPlanId: id })
      },
      
      /**
       * Update plan filters
       * Merges new filters with existing state
       * 
       * @param filters - Partial filter object
       * 
       * @example
       * setPlanFilters({ approvalStatus: ['APPROVED'] })
       * setPlanFilters({ planYear: 2025, page: 1 })
       */
      setPlanFilters: (filters) => {
        set((state) => ({
          planFilters: {
            ...state.planFilters,
            ...filters,
          },
        }))
      },
      
      /**
       * Clear all filters back to defaults
       * Keeps only pagination settings
       * 
       * @example
       * clearPlanFilters()
       */
      clearPlanFilters: () => {
        set({ planFilters: defaultFilters })
      },
      
      /**
       * Reset entire store to initial state
       * Useful for logout or testing
       * 
       * @example
       * resetPlanStore()
       */
      resetPlanStore: () => {
        set({
          selectedPlanId: null,
          planFilters: defaultFilters,
        })
      },
    }),
    {
      name: 'bagizi-plan-store', // localStorage key
      partialize: (state) => ({
        // Only persist filters, not selectedPlanId
        planFilters: state.planFilters,
      }),
    }
  )
)

// ================================ SELECTORS ================================

/**
 * Select current plan filters
 * 
 * @example
 * const filters = usePlanStore(selectPlanFilters)
 */
export const selectPlanFilters = (state: PlanState) => state.planFilters

/**
 * Select selected plan ID
 * 
 * @example
 * const selectedId = usePlanStore(selectSelectedPlanId)
 */
export const selectSelectedPlanId = (state: PlanState) => state.selectedPlanId

/**
 * Select filter count (number of active filters)
 * 
 * @example
 * const filterCount = usePlanStore(selectFilterCount)
 * // Returns number like 3 if 3 filters are active
 */
export const selectFilterCount = (state: PlanState) => {
  const { planFilters } = state
  let count = 0
  
  if (planFilters.search) count++
  if (planFilters.approvalStatus?.length) count++
  if (planFilters.planYear) count++
  if (planFilters.planMonth) count++
  if (planFilters.planQuarter) count++
  if (planFilters.minBudget) count++
  if (planFilters.maxBudget) count++
  
  return count
}

/**
 * Check if any filters are active
 * 
 * @example
 * const hasFilters = usePlanStore(selectHasActiveFilters)
 * // Returns true if any filter is set
 */
export const selectHasActiveFilters = (state: PlanState) => {
  return selectFilterCount(state) > 0
}

// ================================ UTILITIES ================================

/**
 * Get current filters outside of React component
 * Useful for API calls or utilities
 * 
 * @returns Current filter state
 * 
 * @example
 * const filters = getPlanFilters()
 * const plans = await fetchPlans(filters)
 */
export const getPlanFilters = () => usePlanStore.getState().planFilters

/**
 * Get selected plan ID outside of React component
 * 
 * @returns Selected plan ID or null
 * 
 * @example
 * const selectedId = getSelectedPlanId()
 */
export const getSelectedPlanId = () => usePlanStore.getState().selectedPlanId

/**
 * Update filters outside of React component
 * 
 * @param filters - Partial filter object
 * 
 * @example
 * updatePlanFilters({ planYear: 2025 })
 */
export const updatePlanFilters = (filters: Partial<PlanFilters>) => {
  usePlanStore.getState().setPlanFilters(filters)
}

/**
 * Clear filters outside of React component
 * 
 * @example
 * clearFilters()
 */
export const clearFilters = () => {
  usePlanStore.getState().clearPlanFilters()
}

/**
 * Reset store outside of React component
 * 
 * @example
 * resetStore()
 */
export const resetStore = () => {
  usePlanStore.getState().resetPlanStore()
}

// ================================ TYPES EXPORT ================================

export type { PlanState }
