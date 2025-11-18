/**
 * @fileoverview FoodCategory React Hooks with TanStack Query
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/MENU_MODULE_COMPLETE_AUDIT.md} Menu Module Implementation
 * 
 * CRITICAL: Use centralized API client, NOT direct fetch()
 * - All queries use foodCategoriesApi from api/foodCategoriesApi.ts
 * - Consistent error handling with toast notifications
 * - Optimistic updates for better UX
 * - Query invalidation for data consistency
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  foodCategoriesApi,
  type FoodCategory,
  type FoodCategoryQueryParams,
  type FoodCategoryCreateInput,
  type FoodCategoryUpdateInput,
} from '../api/foodCategoriesApi'

// ============================================
// QUERY KEYS
// ============================================

export const foodCategoryKeys = {
  all: ['food-categories'] as const,
  lists: () => [...foodCategoryKeys.all, 'list'] as const,
  list: (filters: FoodCategoryQueryParams) => [...foodCategoryKeys.lists(), filters] as const,
  details: () => [...foodCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...foodCategoryKeys.details(), id] as const,
  hierarchy: () => [...foodCategoryKeys.all, 'hierarchy'] as const,
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all food categories with optional filtering
 * @param filters - Optional query parameters
 * @returns TanStack Query result with food categories list
 * 
 * @example
 * // Get all root categories
 * const { data, isLoading } = useFoodCategories({ parentId: null })
 * 
 * // Get children of specific category
 * const { data } = useFoodCategories({ parentId: 'category-id' })
 * 
 * // Search categories
 * const { data } = useFoodCategories({ search: 'protein' })
 */
export function useFoodCategories(filters?: FoodCategoryQueryParams) {
  return useQuery({
    queryKey: foodCategoryKeys.list(filters || {}),
    queryFn: async () => {
      const result = await foodCategoriesApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch food categories')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (master data doesn't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Fetch single food category by ID
 * @param id - Category ID
 * @param enabled - Whether to run the query
 * @returns TanStack Query result with food category details
 * 
 * @example
 * const { data: category } = useFoodCategory('category-id')
 */
export function useFoodCategory(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: foodCategoryKeys.detail(id),
    queryFn: async () => {
      const result = await foodCategoriesApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch food category')
      }
      
      return result.data
    },
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Fetch complete category hierarchy tree
 * Returns root categories with all nested children
 * 
 * @returns TanStack Query result with hierarchical category tree
 * 
 * @example
 * const { data: hierarchy } = useFoodCategoryHierarchy()
 * // Result: [{ id, name, children: [{ id, name, children: [...] }] }]
 */
export function useFoodCategoryHierarchy() {
  return useQuery({
    queryKey: foodCategoryKeys.hierarchy(),
    queryFn: async () => {
      const result = await foodCategoriesApi.getHierarchy()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch category hierarchy')
      }
      
      return result.data
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (hierarchy rarely changes)
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create new food category mutation
 * @rbac Requires PLATFORM_SUPERADMIN role
 * 
 * @example
 * const { mutate: createCategory } = useCreateFoodCategory()
 * 
 * createCategory({
 *   categoryCode: 'PROTEIN_ANIMAL',
 *   categoryName: 'Protein Hewani',
 *   primaryNutrient: 'Protein'
 * })
 */
export function useCreateFoodCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: FoodCategoryCreateInput) => foodCategoriesApi.create(data),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: foodCategoryKeys.all })
      
      toast.success('Kategori makanan berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat kategori makanan')
    }
  })
}

/**
 * Update existing food category mutation
 * @rbac Requires PLATFORM_SUPERADMIN role
 * 
 * @example
 * const { mutate: updateCategory } = useUpdateFoodCategory()
 * 
 * updateCategory({
 *   id: 'category-id',
 *   data: { categoryName: 'Updated Name' }
 * })
 */
export function useUpdateFoodCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FoodCategoryUpdateInput }) => 
      foodCategoriesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: foodCategoryKeys.detail(id) })
      
      // Snapshot previous value
      const previousCategory = queryClient.getQueryData<FoodCategory>(
        foodCategoryKeys.detail(id)
      )
      
      // Optimistically update
      queryClient.setQueryData(foodCategoryKeys.detail(id), (old: FoodCategory | undefined) => {
        if (!old) return old
        return { ...old, ...data }
      })
      
      return { previousCategory }
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousCategory) {
        queryClient.setQueryData(
          foodCategoryKeys.detail(variables.id),
          context.previousCategory
        )
      }
      toast.error(error.message || 'Gagal memperbarui kategori makanan')
    },
    onSuccess: (_, { id }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: foodCategoryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: foodCategoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: foodCategoryKeys.hierarchy() })
      
      toast.success('Kategori makanan berhasil diperbarui')
    }
  })
}

/**
 * Delete food category mutation (soft delete)
 * @rbac Requires PLATFORM_SUPERADMIN role
 * 
 * @example
 * const { mutate: deleteCategory } = useDeleteFoodCategory()
 * 
 * deleteCategory('category-id')
 */
export function useDeleteFoodCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => foodCategoriesApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: foodCategoryKeys.detail(deletedId) })
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: foodCategoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: foodCategoryKeys.hierarchy() })
      
      toast.success('Kategori makanan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus kategori makanan')
    }
  })
}
