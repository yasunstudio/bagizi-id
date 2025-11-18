/**
 * @fileoverview Employee React Query Hooks
 * @version Next.js 15.5.4 / TanStack Query v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} React Hooks Pattern
 * 
 * TanStack Query hooks for Employee CRUD operations
 * Provides optimistic updates, cache management, and loading states
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '../api'
import type {
  EmployeeListItem,
  EmployeeDetail,
} from '../types'
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeFiltersInput,
} from '../schemas/employeeSchema'
import { toast } from 'sonner'

/**
 * Query keys for cache management
 */
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters?: EmployeeFiltersInput) => [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  statistics: () => [...employeeKeys.all, 'statistics'] as const,
}

/**
 * Fetch employees list with filters
 * @param filters - Optional filter parameters
 * @returns Query result with employees list
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useEmployees({ 
 *   search: 'John',
 *   departmentId: 'dept-123'
 * })
 * ```
 */
export function useEmployees(filters?: EmployeeFiltersInput) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: async () => {
      const result = await employeeApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch employees')
      }
      
      return result
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch single employee by ID
 * @param id - Employee ID
 * @returns Query result with employee detail
 * 
 * @example
 * ```typescript
 * const { data: employee, isLoading } = useEmployee('emp-123')
 * ```
 */
export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: async () => {
      const result = await employeeApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch employee')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch employee statistics
 * @returns Query result with statistics
 * 
 * @example
 * ```typescript
 * const { data: stats } = useEmployeeStatistics()
 * ```
 */
export function useEmployeeStatistics() {
  return useQuery({
    queryKey: employeeKeys.statistics(),
    queryFn: async () => {
      const result = await employeeApi.getStatistics()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch statistics')
      }
      
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Create new employee mutation
 * @returns Mutation with create function
 * 
 * @example
 * ```typescript
 * const { mutate: createEmployee, isPending } = useCreateEmployee()
 * 
 * createEmployee({
 *   fullName: 'John Doe',
 *   departmentId: 'dept-123',
 *   // ...other fields
 * })
 * ```
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateEmployeeInput) => {
      const result = await employeeApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create employee')
      }
      
      return result.data
    },
    onSuccess: (newEmployee: EmployeeDetail) => {
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeKeys.statistics() })
      
      // Set detail in cache
      queryClient.setQueryData(employeeKeys.detail(newEmployee.id), newEmployee)
      
      toast.success('Karyawan berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan karyawan')
    },
  })
}

/**
 * Update employee mutation
 * @returns Mutation with update function
 * 
 * @example
 * ```typescript
 * const { mutate: updateEmployee } = useUpdateEmployee()
 * 
 * updateEmployee({
 *   id: 'emp-123',
 *   data: { fullName: 'John Updated' }
 * })
 * ```
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string
      data: Partial<UpdateEmployeeInput> 
    }) => {
      const result = await employeeApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update employee')
      }
      
      return result.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: employeeKeys.detail(id) })
      
      // Snapshot previous value
      const previousEmployee = queryClient.getQueryData<EmployeeDetail>(
        employeeKeys.detail(id)
      )
      
      // Optimistically update cache
      if (previousEmployee) {
        queryClient.setQueryData<EmployeeDetail>(
          employeeKeys.detail(id),
          { ...previousEmployee, ...data }
        )
      }
      
      return { previousEmployee }
    },
    onSuccess: (updatedEmployee: EmployeeDetail, { id }) => {
      // Update detail cache
      queryClient.setQueryData(employeeKeys.detail(id), updatedEmployee)
      
      // Update in lists
      queryClient.setQueriesData<{ success: boolean; data: EmployeeListItem[] }>(
        { queryKey: employeeKeys.lists() },
        (old) => {
          if (!old?.data) return old
          
          return {
            ...old,
            data: old.data.map((emp) =>
              emp.id === id
                ? {
                    ...emp,
                    fullName: updatedEmployee.fullName,
                    email: updatedEmployee.email,
                    phone: updatedEmployee.phone,
                    employmentType: updatedEmployee.employmentType,
                    employmentStatus: updatedEmployee.employmentStatus,
                    isActive: updatedEmployee.isActive,
                  }
                : emp
            ),
          }
        }
      )
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: employeeKeys.statistics() })
      
      toast.success('Karyawan berhasil diperbarui')
    },
    onError: (error: Error, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousEmployee) {
        queryClient.setQueryData(
          employeeKeys.detail(context.previousEmployee.id),
          context.previousEmployee
        )
      }
      
      toast.error(error.message || 'Gagal memperbarui karyawan')
    },
  })
}

/**
 * Delete employee mutation
 * @returns Mutation with delete function
 * 
 * @example
 * ```typescript
 * const { mutate: deleteEmployee } = useDeleteEmployee()
 * 
 * deleteEmployee('emp-123')
 * ```
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await employeeApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete employee')
      }
      
      return id
    },
    onSuccess: (deletedId: string) => {
      // Remove from lists
      queryClient.setQueriesData<{ success: boolean; data: EmployeeListItem[] }>(
        { queryKey: employeeKeys.lists() },
        (old) => {
          if (!old?.data) return old
          
          return {
            ...old,
            data: old.data.filter((emp) => emp.id !== deletedId),
          }
        }
      )
      
      // Remove detail cache
      queryClient.removeQueries({ queryKey: employeeKeys.detail(deletedId) })
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: employeeKeys.statistics() })
      
      toast.success('Karyawan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus karyawan')
    },
  })
}

/**
 * Update employee status mutation (activate/deactivate)
 * @returns Mutation with status update function
 * 
 * @example
 * ```typescript
 * const { mutate: updateStatus } = useUpdateEmployeeStatus()
 * 
 * updateStatus({ id: 'emp-123', isActive: false })
 * ```
 */
export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      isActive 
    }: { 
      id: string
      isActive: boolean 
    }) => {
      const result = await employeeApi.updateStatus(id, isActive)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update employee status')
      }
      
      return result.data
    },
    onSuccess: (updatedEmployee: EmployeeDetail, { id, isActive }) => {
      // Update detail cache
      queryClient.setQueryData(employeeKeys.detail(id), updatedEmployee)
      
      // Update in lists
      queryClient.setQueriesData<{ success: boolean; data: EmployeeListItem[] }>(
        { queryKey: employeeKeys.lists() },
        (old) => {
          if (!old?.data) return old
          
          return {
            ...old,
            data: old.data.map((emp) =>
              emp.id === id ? { ...emp, isActive } : emp
            ),
          }
        }
      )
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: employeeKeys.statistics() })
      
      toast.success(`Karyawan berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui status karyawan')
    },
  })
}

/**
 * Upload employee photo mutation
 * @returns Mutation with photo upload function
 * 
 * @example
 * ```typescript
 * const { mutate: uploadPhoto } = useUploadEmployeePhoto()
 * 
 * uploadPhoto({ id: 'emp-123', file: photoFile })
 * ```
 */
export function useUploadEmployeePhoto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      file 
    }: { 
      id: string
      file: File 
    }) => {
      const result = await employeeApi.uploadPhoto(id, file)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to upload photo')
      }
      
      return { id, photoUrl: result.data.photoUrl }
    },
    onSuccess: ({ id, photoUrl }) => {
      // Update detail cache
      queryClient.setQueryData<EmployeeDetail>(
        employeeKeys.detail(id),
        (old) => old ? { ...old, photoUrl } : old
      )
      
      toast.success('Foto karyawan berhasil diunggah')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengunggah foto')
    },
  })
}
