/**
 * @fileoverview Department TanStack Query Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} React Hooks Pattern
 * 
 * Custom hooks for Department CRUD operations using TanStack Query
 * Includes optimistic updates and proper cache management
 */

'use client'

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { departmentApi } from '@/features/sppg/hrd/api'
import { toast } from 'sonner'
import type {
  Department,
  DepartmentInput,
  DepartmentUpdate,
  DepartmentFilters,
  DepartmentWithRelations,
  DepartmentTreeNode,
} from '@/features/sppg/hrd/types/department.types'

/**
 * Query key factory for departments
 * Ensures consistent cache keys across all hooks
 */
export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (filters?: DepartmentFilters) => [...departmentKeys.lists(), filters] as const,
  hierarchy: () => [...departmentKeys.all, 'hierarchy'] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
}

/**
 * Fetch all departments with optional filters
 * 
 * @param filters - Optional filter parameters
 * @param options - TanStack Query options
 * @returns Query result with departments array
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { data, isLoading, error } = useDepartments()
 * 
 * // With filters
 * const { data } = useDepartments({ isActive: true })
 * 
 * // With custom options
 * const { data } = useDepartments(
 *   { parentId: 'parent-id' },
 *   { enabled: !!parentId }
 * )
 * ```
 */
export function useDepartments(
  filters?: DepartmentFilters,
  options?: Omit<UseQueryOptions<Department[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: departmentKeys.list(filters),
    queryFn: async () => {
      const result = await departmentApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch departments')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Fetch single department by ID with full relationships
 * 
 * @param id - Department ID
 * @param options - TanStack Query options
 * @returns Query result with department detail
 * 
 * @example
 * ```typescript
 * const { data: department, isLoading } = useDepartment(departmentId)
 * 
 * if (department) {
 *   console.log(department.employees) // Access employees
 *   console.log(department.positions) // Access positions
 *   console.log(department.children)  // Access child departments
 * }
 * ```
 */
export function useDepartment(
  id: string,
  options?: Omit<UseQueryOptions<DepartmentWithRelations>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: async () => {
      const result = await departmentApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch department')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  })
}

/**
 * Fetch hierarchical department tree
 * 
 * @param options - TanStack Query options
 * @returns Query result with nested department tree
 * 
 * @example
 * ```typescript
 * const { data: departmentTree } = useDepartmentHierarchy()
 * 
 * // Render tree recursively
 * {departmentTree?.map(dept => (
 *   <DepartmentTreeNode key={dept.id} department={dept} />
 * ))}
 * ```
 */
export function useDepartmentHierarchy(
  options?: Omit<UseQueryOptions<DepartmentTreeNode[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: departmentKeys.hierarchy(),
    queryFn: async () => {
      const result = await departmentApi.getHierarchy()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch department hierarchy')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Create new department mutation
 * 
 * @returns Mutation object with create function
 * 
 * @example
 * ```typescript
 * const { mutate: createDepartment, isPending } = useCreateDepartment()
 * 
 * const handleSubmit = (data: DepartmentInput) => {
 *   createDepartment(data, {
 *     onSuccess: () => {
 *       toast.success('Department created successfully')
 *       router.push('/hrd/departments')
 *     }
 *   })
 * }
 * ```
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: DepartmentInput) => {
      const result = await departmentApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create department')
      }
      
      return result.data
    },
    onSuccess: (newDepartment) => {
      // Invalidate all department lists to refetch
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() })
      
      // Invalidate hierarchy to update tree view
      queryClient.invalidateQueries({ queryKey: departmentKeys.hierarchy() })
      
      // If has parent, invalidate parent detail to update children count
      if (newDepartment.parentId) {
        queryClient.invalidateQueries({ 
          queryKey: departmentKeys.detail(newDepartment.parentId) 
        })
      }
      
      toast.success('Departemen berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat departemen')
    },
  })
}

/**
 * Update department mutation
 * 
 * @returns Mutation object with update function
 * 
 * @example
 * ```typescript
 * const { mutate: updateDepartment } = useUpdateDepartment()
 * 
 * updateDepartment({
 *   id: 'dept-id',
 *   data: { departmentName: 'New Name' }
 * })
 * ```
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DepartmentUpdate }) => {
      const result = await departmentApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update department')
      }
      
      return result.data
    },
    onSuccess: (updatedDepartment, variables) => {
      // Update specific department in cache
      queryClient.setQueryData(
        departmentKeys.detail(variables.id),
        (old: DepartmentWithRelations | undefined) => {
          if (!old) return updatedDepartment as DepartmentWithRelations
          return { ...old, ...updatedDepartment }
        }
      )
      
      // Invalidate lists to show updated data
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() })
      
      // Invalidate hierarchy if parent changed
      if (variables.data.parentId !== undefined) {
        queryClient.invalidateQueries({ queryKey: departmentKeys.hierarchy() })
        
        // Invalidate old and new parent details
        const oldParentId = queryClient.getQueryData<DepartmentWithRelations>(
          departmentKeys.detail(variables.id)
        )?.parentId
        
        if (oldParentId) {
          queryClient.invalidateQueries({ queryKey: departmentKeys.detail(oldParentId) })
        }
        
        if (variables.data.parentId) {
          queryClient.invalidateQueries({ 
            queryKey: departmentKeys.detail(variables.data.parentId) 
          })
        }
      }
      
      toast.success('Departemen berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui departemen')
    },
  })
}

/**
 * Delete department mutation
 * 
 * VALIDATION: Department must have no employees, positions, or child departments
 * 
 * @returns Mutation object with delete function
 * 
 * @example
 * ```typescript
 * const { mutate: deleteDepartment, isPending } = useDeleteDepartment()
 * 
 * const handleDelete = (id: string) => {
 *   if (confirm('Are you sure?')) {
 *     deleteDepartment(id, {
 *       onSuccess: () => router.push('/hrd/departments')
 *     })
 *   }
 * }
 * ```
 */
export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get department before deletion for cache cleanup
      const department = queryClient.getQueryData<DepartmentWithRelations>(
        departmentKeys.detail(id)
      )
      
      await departmentApi.delete(id)
      
      return { id, parentId: department?.parentId }
    },
    onSuccess: ({ id, parentId }) => {
      // Remove department from cache
      queryClient.removeQueries({ queryKey: departmentKeys.detail(id) })
      
      // Invalidate lists to remove deleted department
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() })
      
      // Invalidate hierarchy to update tree view
      queryClient.invalidateQueries({ queryKey: departmentKeys.hierarchy() })
      
      // If had parent, invalidate parent detail to update children count
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: departmentKeys.detail(parentId) })
      }
      
      toast.success('Departemen berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus departemen')
    },
  })
}
