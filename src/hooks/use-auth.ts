/**
 * @fileoverview Authentication hooks for client-side session management
 * @version Next.js 15.5.4 / Auth.js v5 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Authentication Guidelines
 */

'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import type { UserRole, UserType } from '@prisma/client'
import { toast } from 'sonner'

/**
 * Enhanced session user interface with SPPG multi-tenant support
 */
interface SessionUser {
  id: string
  email: string
  name: string | null
  userRole: UserRole
  userType: UserType
  sppgId: string | null
  sppgName?: string | null
  avatar?: string | null
  lastLoginAt?: Date | null
  isActive?: boolean
}

/**
 * Authentication hook return interface
 */
export interface UseAuthReturn {
  // Session State
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Authentication Actions
  login: (credentials?: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  
  // Role & Permission Checks
  hasRole: (role: UserRole | UserRole[]) => boolean
  isSppgUser: () => boolean
  isAdminUser: () => boolean
  isPlatformUser: () => boolean
  isDemoUser: () => boolean
  
  // SPPG Helpers
  sppgId: string | null
  sppgName: string | null
  
  // Security Helpers
  canAccess: (resource: string) => boolean
  requireAuth: () => void
  requireRole: (role: UserRole | UserRole[]) => void
}

/**
 * Main authentication hook for enterprise session management
 * 
 * Features:
 * - Client-side session access with TypeScript safety
 * - Role-based permission checking
 * - SPPG multi-tenant support
 * - Authentication flow helpers
 * - Security utilities
 * 
 * @returns {UseAuthReturn} Authentication state and utilities
 * 
 * @example
 * const { user, isAuthenticated, hasRole, logout } = useAuth()
 * 
 * if (hasRole('SPPG_ADMIN')) {
 *   // Admin functionality
 * }
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const user = session?.user as SessionUser | null
  const isLoading = status === 'loading'
  const isAuthenticated = !!user && status === 'authenticated'
  
  /**
   * Login with credentials or redirect to login page
   */
  const login = useCallback(async (credentials?: { email: string; password: string }) => {
    try {
      if (credentials) {
        const result = await signIn('credentials', {
          email: credentials.email,
          password: credentials.password,
          redirect: false,
        })
        
        if (result?.error) {
          toast.error('Login gagal. Periksa kembali email dan password.')
          return
        }
        
        toast.success('Login berhasil')
      } else {
        // Redirect to login page
        await signIn()
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Terjadi kesalahan saat login')
    }
  }, [])
  
  /**
   * Logout with confirmation and redirect
   */
  const logout = useCallback(async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/'
      })
      
      toast.success('Logout berhasil')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Terjadi kesalahan saat logout')
    }
  }, [router])
  
  /**
   * Check if user has specific role(s)
   */
  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!user?.userRole) return false
    
    if (Array.isArray(role)) {
      return role.includes(user.userRole)
    }
    
    return user.userRole === role
  }, [user?.userRole])
  
  /**
   * Check if user is SPPG user (any SPPG role)
   */
  const isSppgUser = useCallback((): boolean => {
    if (!user?.userRole) return false
    
    const sppgRoles: UserRole[] = [
      'SPPG_KEPALA',
      'SPPG_ADMIN', 
      'SPPG_AHLI_GIZI',
      'SPPG_AKUNTAN',
      'SPPG_PRODUKSI_MANAGER',
      'SPPG_DISTRIBUSI_MANAGER',
      'SPPG_HRD_MANAGER',
      'SPPG_STAFF_DAPUR',
      'SPPG_STAFF_DISTRIBUSI',
      'SPPG_STAFF_ADMIN',
      'SPPG_STAFF_QC',
      'SPPG_VIEWER'
    ]
    
    return sppgRoles.includes(user.userRole)
  }, [user?.userRole])
  
  /**
   * Check if user is admin user (platform level)
   */
  const isAdminUser = useCallback((): boolean => {
    return hasRole(['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_ANALYST'])
  }, [hasRole])
  
  /**
   * Check if user is platform user (any platform role)
   */
  const isPlatformUser = useCallback((): boolean => {
    return isAdminUser()
  }, [isAdminUser])
  
  /**
   * Check if user is demo user
   */
  const isDemoUser = useCallback((): boolean => {
    return hasRole('DEMO_USER') || user?.userType === 'DEMO_REQUEST'
  }, [hasRole, user?.userType])
  
  /**
   * Check access to specific resource
   */
  const canAccess = useCallback((resource: string): boolean => {
    if (!user) {
      return false
    }
    
    // Platform admin can access everything
    if (isAdminUser()) {
      return true
    }
    
    // Resource-specific access logic
    let hasAccess = false
    switch (resource) {
      case 'admin':
        hasAccess = isAdminUser()
        break
      case 'sppg':
        hasAccess = isSppgUser() && !!user.sppgId
        break
      case 'program':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'])
        break
      case 'school':
      case 'schools': // Support both singular and plural
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'])
        break
      case 'menu':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'])
        break
      case 'menu-planning':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'])
        break
      case 'procurement':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'])
        break
      case 'suppliers':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'])
        break
      case 'production':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_PRODUKSI_MANAGER', 'SPPG_STAFF_DAPUR', 'SPPG_STAFF_QC', 'SPPG_AHLI_GIZI'])
        break
      case 'distribution':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_DISTRIBUSI_MANAGER', 'SPPG_STAFF_DISTRIBUSI'])
        break
      case 'inventory':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN', 'SPPG_PRODUKSI_MANAGER'])
        break
      case 'beneficiary':
      case 'beneficiaries': // Support both singular and plural
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'])
        break
      case 'budget':
        // Budget tracking (Banper) - accessible by financial roles
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'])
        break
      case 'hrd':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'])
        break
      case 'users':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'])
        break
      case 'reports':
        hasAccess = isSppgUser() && !hasRole('SPPG_STAFF_DAPUR')
        break
      case 'settings':
        hasAccess = hasRole(['SPPG_KEPALA', 'SPPG_ADMIN'])
        break
      case 'notifications':
        hasAccess = isSppgUser()
        break
      default:
        hasAccess = false
    }
    
    return hasAccess
  }, [user, isAdminUser, isSppgUser, hasRole])
  
  /**
   * Require authentication - redirect to login if not authenticated
   */
  const requireAuth = useCallback(() => {
    if (!isAuthenticated && !isLoading) {
      toast.error('Silakan login terlebih dahulu')
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])
  
  /**
   * Require specific role - redirect if insufficient permissions
   */
  const requireRole = useCallback((role: UserRole | UserRole[]) => {
    requireAuth()
    
    if (isAuthenticated && !hasRole(role)) {
      toast.error('Anda tidak memiliki izin untuk mengakses halaman ini')
      
      // Redirect based on user role
      if (isAdminUser()) {
        router.push('/admin')
      } else if (isSppgUser()) {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }
  }, [requireAuth, isAuthenticated, hasRole, isAdminUser, isSppgUser, router])
  
  return {
    // Session State
    user,
    isAuthenticated,
    isLoading,
    
    // Authentication Actions
    login,
    logout,
    
    // Role & Permission Checks
    hasRole,
    isSppgUser,
    isAdminUser,
    isPlatformUser,
    isDemoUser,
    
    // SPPG Helpers
    sppgId: user?.sppgId || null,
    sppgName: user?.sppgName || null,
    
    // Security Helpers
    canAccess,
    requireAuth,
    requireRole,
  }
}

/**
 * Hook for requiring authentication on protected routes
 * 
 * @example
 * function ProtectedPage() {
 *   useRequireAuth()
 *   return <div>Protected content</div>
 * }
 */
export function useRequireAuth() {
  const { requireAuth } = useAuth()
  
  // Auto-require auth on mount
  requireAuth()
}

/**
 * Hook for requiring specific role on protected routes
 * 
 * @param role - Required role or array of roles
 * 
 * @example
 * function AdminPage() {
 *   useRequireRole(['PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT'])
 *   return <div>Admin content</div>
 * }
 */
export function useRequireRole(role: UserRole | UserRole[]) {
  const { requireRole } = useAuth()
  
  // Auto-require role on mount
  requireRole(role)
}

/**
 * Hook for SPPG-specific authentication
 * Ensures user belongs to an SPPG and has sppgId
 * 
 * @example
 * function SppgDashboard() {
 *   const { sppgId, sppgName } = useRequireSppg()
 *   return <div>Welcome to {sppgName}</div>
 * }
 */
export function useRequireSppg() {
  const { user, isSppgUser, requireAuth } = useAuth()
  const router = useRouter()
  
  // Check authentication and SPPG membership
  requireAuth()
  
  if (user && (!isSppgUser() || !user.sppgId)) {
    toast.error('Akses SPPG diperlukan')
    router.push('/')
  }
  
  return {
    sppgId: user?.sppgId || null,
    sppgName: user?.sppgName || null,
  }
}