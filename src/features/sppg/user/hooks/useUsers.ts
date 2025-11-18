/**
 * @fileoverview SPPG User Management React Query Hooks
 * @version Next.js 15.5.4 / TanStack Query v5 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/features/sppg/user/api'
import { toast } from 'sonner'
import type {
  UserListItem,
  UserDetail,
  CreateUserInput,
  UpdateUserInput,
  UpdatePasswordInput,
  ResetPasswordInput,
  UserFilters,
} from '@/features/sppg/user/types'

/**
 * Pagination metadata interface
 */
interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Query key factory for user-related queries
 * Provides consistent cache keys across hooks
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: userKeys.lists() })
 * queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
 */
export const userKeys = {
  all: ['sppg', 'users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  statistics: () => [...userKeys.all, 'statistics'] as const,
}

/**
 * Fetch paginated list of users with optional filters
 * Supports search, role, status, and SPPG filtering
 * 
 * @param filters - Optional filter parameters (search, role, status, sppgId, page, limit)
 * @returns Query result with data, loading, error states
 * 
 * @example
 * const { data, isLoading, error } = useUsers({
 *   search: 'john',
 *   userRole: 'SPPG_ADMIN',
 *   isActive: true,
 *   page: 1,
 *   limit: 10
 * })
 * 
 * // data.data - Array of UserListItem
 * // data.pagination - { page, limit, total, totalPages }
 */
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const result = await userApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch users')
      }
      
      return {
        data: result.data,
        pagination: result.pagination || {
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          total: result.data.length,
          totalPages: 1,
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Fetch single user detail by ID
 * Includes full user data with relations (SPPG, permissions, activity logs)
 * 
 * @param id - User ID
 * @param options - Query options (enabled, etc.)
 * @returns Query result with user detail
 * 
 * @example
 * const { data: user, isLoading } = useUser(userId)
 * 
 * // Conditional fetching
 * const { data: user } = useUser(userId, { enabled: !!userId })
 */
export function useUser(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const result = await userApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch user detail')
      }
      
      return result.data
    },
    enabled: options?.enabled !== false && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Fetch user statistics (aggregated counts by role, type, status)
 * Used for dashboard metrics and analytics
 * 
 * @returns Query result with statistics
 * 
 * @example
 * const { data: stats } = useUserStatistics()
 * console.log(stats.totalUsers) // Total active users
 * console.log(stats.byRole.SPPG_ADMIN) // Count of SPPG admins
 * console.log(stats.byStatus.active) // Count of active users
 */
export function useUserStatistics() {
  return useQuery({
    queryKey: userKeys.statistics(),
    queryFn: async () => {
      const result = await userApi.getStatistics()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch user statistics')
      }
      
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Create new user mutation
 * Invalidates user list cache on success
 * 
 * @returns Mutation result with mutate function
 * 
 * @example
 * const { mutate: createUser, isPending } = useCreateUser()
 * 
 * createUser({
 *   email: 'john@example.com',
 *   name: 'John Doe',
 *   password: 'SecurePass123',
 *   userType: 'SPPG_ADMIN',
 *   userRole: 'SPPG_ADMIN',
 *   phone: '081234567890'
 * }, {
 *   onSuccess: (user) => {
 *     router.push(`/sppg/users/${user.id}`)
 *   }
 * })
 */
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const result = await userApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create user')
      }
      
      return result.data
    },
    onSuccess: (newUser) => {
      // Invalidate user lists to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() })
      
      toast.success('User created successfully', {
        description: `${newUser.name} has been added to the system.`
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create user', {
        description: error.message || 'An unexpected error occurred.'
      })
    },
  })
}

/**
 * Update existing user mutation
 * Uses optimistic updates for better UX
 * 
 * @returns Mutation result with mutate function
 * 
 * @example
 * const { mutate: updateUser, isPending } = useUpdateUser()
 * 
 * updateUser({
 *   id: userId,
 *   data: {
 *     name: 'John Smith',
 *     phone: '081234567890',
 *     userRole: 'SPPG_AHLI_GIZI'
 *   }
 * }, {
 *   onSuccess: () => {
 *     router.push(`/sppg/users/${userId}`)
 *   }
 * })
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const result = await userApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update user')
      }
      
      return result.data
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) })
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData<UserDetail>(userKeys.detail(id))
      
      // Optimistically update cache
      if (previousUser) {
        queryClient.setQueryData<UserDetail>(userKeys.detail(id), {
          ...previousUser,
          ...data,
          updatedAt: new Date().toISOString()
        })
      }
      
      return { previousUser }
    },
    onSuccess: (updatedUser, { id }) => {
      // Update detail cache with server data
      queryClient.setQueryData(userKeys.detail(id), updatedUser)
      
      // Update user in list cache
      queryClient.setQueriesData<{ data: UserListItem[]; pagination: PaginationMeta }>(
        { queryKey: userKeys.lists() },
        (old) => {
          if (!old?.data) return old
          
          return {
            ...old,
            data: old.data.map((user) =>
              user.id === id
                ? {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    phone: updatedUser.phone,
                    profileImage: updatedUser.profileImage,
                    userType: updatedUser.userType,
                    userRole: updatedUser.userRole,
                    isActive: updatedUser.isActive,
                    emailVerified: updatedUser.emailVerified,
                    lastLogin: updatedUser.lastLogin,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt,
                    sppg: updatedUser.sppg,
                    department: updatedUser.department,
                    position: updatedUser.position,
                  }
                : user
            ),
          }
        }
      )
      
      toast.success('User updated successfully', {
        description: `${updatedUser.name}'s information has been saved.`
      })
    },
    onError: (error: Error, { id }, context) => {
      // Rollback optimistic update on error
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(id), context.previousUser)
      }
      
      toast.error('Failed to update user', {
        description: error.message || 'An unexpected error occurred.'
      })
    },
  })
}

/**
 * Delete user mutation
 * Removes user from cache on success
 * 
 * @returns Mutation result with mutate function
 * 
 * @example
 * const { mutate: deleteUser, isPending } = useDeleteUser()
 * 
 * deleteUser(userId, {
 *   onSuccess: () => {
 *     router.push('/sppg/users')
 *   }
 * })
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await userApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user')
      }
      
      return id
    },
    onSuccess: (deletedId) => {
      // Remove user from detail cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) })
      
      // Remove user from list cache
      queryClient.setQueriesData<{ data: UserListItem[]; pagination: PaginationMeta }>(
        { queryKey: userKeys.lists() },
        (old) => {
          if (!old?.data) return old
          
          return {
            ...old,
            data: old.data.filter((user) => user.id !== deletedId),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
            },
          }
        }
      )
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() })
      
      toast.success('User deleted successfully', {
        description: 'The user has been removed from the system.'
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete user', {
        description: error.message || 'An unexpected error occurred.'
      })
    },
  })
}

/**
 * Self-service password change mutation
 * Requires current password for security
 * 
 * @returns Mutation result with mutate function
 * 
 * @example
 * const { mutate: updatePassword, isPending } = useUpdatePassword()
 * 
 * updatePassword({
 *   id: userId,
 *   data: {
 *     currentPassword: 'OldPass123',
 *     newPassword: 'NewPass123',
 *     confirmPassword: 'NewPass123'
 *   }
 * }, {
 *   onSuccess: () => {
 *     form.reset()
 *   }
 * })
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePasswordInput }) => {
      const result = await userApi.updatePassword(id, data)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update password')
      }
    },
    onSuccess: () => {
      toast.success('Password updated successfully', {
        description: 'Your password has been changed. Please use it for your next login.'
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update password', {
        description: error.message || 'Please check your current password and try again.'
      })
    },
  })
}

/**
 * Admin password reset mutation
 * Does not require current password (admin privilege)
 * 
 * @returns Mutation result with mutate function
 * 
 * @example
 * const { mutate: resetPassword, isPending } = useResetPassword()
 * 
 * resetPassword({
 *   id: userId,
 *   data: {
 *     newPassword: 'TempPass123',
 *     confirmPassword: 'TempPass123'
 *   }
 * }, {
 *   onSuccess: () => {
 *     toast.info('Remember to share the new password securely with the user.')
 *   }
 * })
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ResetPasswordInput }) => {
      const result = await userApi.resetPassword(id, data)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reset password')
      }
    },
    onSuccess: () => {
      toast.success('Password reset successfully', {
        description: 'The user can now log in with the new password.'
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to reset password', {
        description: error.message || 'An unexpected error occurred.'
      })
    },
  })
}

/**
 * Toggle user active status mutation
 * Used for enabling/disabling user accounts
 * 
 * @returns Mutation result with mutate function
 * 
 * @example
 * const { mutate: updateStatus, isPending } = useUpdateStatus()
 * 
 * updateStatus({
 *   id: userId,
 *   isActive: false
 * }, {
 *   onSuccess: (user) => {
 *     console.log(`User ${user.name} is now ${user.isActive ? 'active' : 'inactive'}`)
 *   }
 * })
 */
export function useUpdateStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const result = await userApi.updateStatus(id, isActive)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update user status')
      }
      
      return result.data
    },
    onMutate: async ({ id, isActive }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) })
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData<UserDetail>(userKeys.detail(id))
      
      // Optimistically update cache
      if (previousUser) {
        queryClient.setQueryData<UserDetail>(userKeys.detail(id), {
          ...previousUser,
          isActive,
          updatedAt: new Date().toISOString()
        })
      }
      
      return { previousUser }
    },
    onSuccess: (updatedUser, { id }) => {
      // Update detail cache with server data
      queryClient.setQueryData(userKeys.detail(id), updatedUser)
      
      // Update user in list cache
      queryClient.setQueriesData<{ data: UserListItem[]; pagination: PaginationMeta }>(
        { queryKey: userKeys.lists() },
        (old) => {
          if (!old?.data) return old
          
          return {
            ...old,
            data: old.data.map((user) =>
              user.id === id ? { ...user, isActive: updatedUser.isActive } : user
            ),
          }
        }
      )
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() })
      
      const action = updatedUser.isActive ? 'activated' : 'deactivated'
      toast.success(`User ${action} successfully`, {
        description: `${updatedUser.name} is now ${action}.`
      })
    },
    onError: (error: Error, { id }, context) => {
      // Rollback optimistic update on error
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(id), context.previousUser)
      }
      
      toast.error('Failed to update user status', {
        description: error.message || 'An unexpected error occurred.'
      })
    },
  })
}
