/**
 * @fileoverview Menu domain TanStack Query hooks
 * @version Next.js 15.5.4 / TanStack Query v5 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/domain-menu-workflow.md} Menu Domain Documentation
 */

'use client'

// Export modular hooks
export * from './useIngredients'
export * from './useRecipeSteps'
export * from './useNutrition'
export * from './useCost'
export * from './useDuplicateMenu'
export * from './useMenuPlans'
export * from './useFoodCategories'

// Import dependencies for legacy hooks defined in this file
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { menuApi, menuIngredientApi, menuCalculationApi } from '../api/menuApi'
import type {
  Menu,
  MenuInput,
  MenuUpdateInput,
  MenuIngredientInput,
  MenuFilters
} from '../types'

// ================================ QUERY KEYS ================================

const QUERY_KEYS = {
  menus: ['sppg', 'menus'] as const,
  menu: (id: string) => ['sppg', 'menus', id] as const,
  menuIngredients: (menuId: string) => ['sppg', 'menus', menuId, 'ingredients'] as const,
  menuNutrition: (menuId: string) => ['sppg', 'menus', menuId, 'nutrition'] as const,
  menuCost: (menuId: string) => ['sppg', 'menus', menuId, 'cost'] as const,
} as const

// ================================ MENU QUERY HOOKS ================================

/**
 * Hook to fetch all menus with optional filtering
 */
export function useMenus(filters?: Partial<MenuFilters>) {
  return useQuery({
    queryKey: [...QUERY_KEYS.menus, filters],
    queryFn: async () => {
      console.log('🔄 useMenus: Fetching menu data...')
      const result = await menuApi.getMenus(filters)
      console.log('✅ useMenus: Data fetched', {
        totalMenus: result.data?.menus?.length,
        firstMenuWithCost: result.data?.menus?.find(m => m.costCalc)?.menuName
      })
      return result
    },
    select: (data) => data.data,
    staleTime: 0, // Always consider data stale, refetch on mount when invalidated
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for navigation
  })
}

/**
 * Hook to fetch a single menu by ID with full details
 */
export function useMenu(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.menu(id),
    queryFn: () => menuApi.getMenuById(id),
    select: (data) => data.data,
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch menu ingredients
 */
export function useMenuIngredients(menuId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.menuIngredients(menuId),
    queryFn: () => menuIngredientApi.getIngredients(menuId),
    select: (data) => data.data,
    enabled: enabled && !!menuId,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates)
  })
}

/**
 * Hook to fetch menu nutrition calculation
 */
export function useMenuNutrition(menuId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.menuNutrition(menuId),
    queryFn: () => menuCalculationApi.getNutritionCalculation(menuId),
    select: (data) => data.data,
    enabled: enabled && !!menuId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch menu cost calculation
 */
export function useMenuCost(menuId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.menuCost(menuId),
    queryFn: () => menuCalculationApi.getCostCalculation(menuId),
    select: (data) => data.data,
    enabled: enabled && !!menuId,
    staleTime: 5 * 60 * 1000,
  })
}

// ================================ MENU MUTATION HOOKS ================================

/**
 * Hook to create new menu
 */
export function useCreateMenu() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: MenuInput) => menuApi.createMenu(data),
    onSuccess: (response) => {
      // Invalidate menus list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.menus })
      
      // Set new menu data in cache
      if (response.data) {
        queryClient.setQueryData(
          QUERY_KEYS.menu(response.data.menu.id),
          { data: response.data.menu }
        )
      }
      
      toast.success('Menu berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat menu')
    }
  })
}

/**
 * Hook to update menu
 */
export function useUpdateMenu() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuUpdateInput> }) =>
      menuApi.updateMenu(id, data),
    onSuccess: (response, variables) => {
      // Update menu in cache
      queryClient.setQueryData(
        QUERY_KEYS.menu(variables.id),
        { data: response.data }
      )
      
      // Update in menus list cache
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.menus },
        (oldData: unknown) => {
          const data = oldData as { data?: { menus?: Menu[] } }
          if (!data?.data?.menus) return oldData
          
          return {
            ...data,
            data: {
              ...data.data,
              menus: data.data.menus.map((menu: Menu) =>
                menu.id === variables.id ? { ...menu, ...response.data } : menu
              )
            }
          }
        }
      )
      
      toast.success('Menu berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui menu')
    }
  })
}

/**
 * Hook to delete menu
 */
export function useDeleteMenu() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => menuApi.deleteMenu(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.menu(deletedId) })
      
      // Update menus list
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.menus },
        (oldData: unknown) => {
          const data = oldData as { data?: { menus?: Menu[] } }
          if (!data?.data?.menus) return oldData
          
          return {
            ...data,
            data: {
              ...data.data,
              menus: data.data.menus.filter((menu: Menu) => menu.id !== deletedId)
            }
          }
        }
      )
      
      toast.success('Menu berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus menu')
    }
  })
}

// ================================ INGREDIENT MUTATION HOOKS ================================

/**
 * Hook to add ingredient to menu
 */
export function useAddIngredient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ menuId, data }: { menuId: string; data: Omit<MenuIngredientInput, 'menuId'> }) =>
      menuIngredientApi.addIngredient(menuId, data),
    onSuccess: (response, { menuId }) => {
      // Invalidate menu ingredients
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.menuIngredients(menuId) 
      })
      
      // If calculation was triggered, invalidate nutrition and cost
      if (response.data?.calculationTriggered) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.menuNutrition(menuId) 
        })
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.menuCost(menuId) 
        })
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.menu(menuId) 
        })
      }
      
      toast.success('Bahan berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan bahan')
    }
  })
}

/**
 * Hook to update ingredient
 */
export function useUpdateIngredient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuIngredientInput>; menuId: string }) =>
      menuIngredientApi.updateIngredient(id, data),
    onSuccess: (response, { menuId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.menuIngredients(menuId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.menuNutrition(menuId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.menuCost(menuId) 
      })
      
      toast.success('Bahan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui bahan')
    }
  })
}

/**
 * Hook to remove ingredient from menu
 */
export function useRemoveIngredient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id }: { id: string; menuId: string }) =>
      menuIngredientApi.removeIngredient(id),
    onSuccess: (response, { menuId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.menuIngredients(menuId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.menuNutrition(menuId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.menuCost(menuId) 
      })
      
      toast.success('Bahan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus bahan')
    }
  })
}

// ================================ CALCULATION MUTATION HOOKS ================================

/**
 * Hook to trigger nutrition calculation
 */
export function useCalculateNutrition() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ menuId, forceRecalculate }: { menuId: string; forceRecalculate?: boolean }) =>
      menuCalculationApi.calculateNutrition(menuId, forceRecalculate),
    onSuccess: (response, { menuId }) => {
      // Update nutrition calculation in cache
      queryClient.setQueryData(
        QUERY_KEYS.menuNutrition(menuId),
        { data: response.data?.nutritionCalculation }
      )
      
      // Invalidate menu to refresh nutrition status
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.menu(menuId) 
      })
      
      toast.success('Perhitungan gizi berhasil')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghitung gizi')
    }
  })
}

/**
 * Hook to trigger cost calculation
 */
export function useCalculateCost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ menuId, options }: { 
      menuId: string; 
      options?: {
        laborCostPerHour?: number
        overheadPercentage?: number
        plannedPortions?: number
        forceRecalculate?: boolean
      }
    }) => menuCalculationApi.calculateCost(menuId, options),
    onSuccess: (response, { menuId }) => {
      // Update cost calculation in cache
      queryClient.setQueryData(
        QUERY_KEYS.menuCost(menuId),
        { data: response.data?.costCalculation }
      )
      
      // Invalidate menu to refresh cost status
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.menu(menuId) 
      })
      
      toast.success('Perhitungan biaya berhasil')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghitung biaya')
    }
  })
}

// Re-export programs hooks
export { usePrograms, useProgram, useActivePrograms } from './usePrograms'