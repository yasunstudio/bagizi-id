/**
 * @fileoverview API Middleware Helpers for RBAC Protection
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { logAdminAccess, getClientIp, getUserAgent } from '@/lib/audit-log'

/**
 * Admin roles allowed to access admin API routes
 */
export const ADMIN_ROLES = [
  'PLATFORM_SUPERADMIN',
  'PLATFORM_SUPPORT',
  'PLATFORM_ANALYST'
] as const

/**
 * Super admin role (full access)
 */
export const SUPERADMIN_ROLE = 'PLATFORM_SUPERADMIN'

/**
 * Read-only analyst role
 */
export const ANALYST_ROLE = 'PLATFORM_ANALYST'

/**
 * Support role (limited write access)
 */
export const SUPPORT_ROLE = 'PLATFORM_SUPPORT'

/**
 * Session type from Auth.js
 */
export type AuthSession = {
  user: {
    id: string
    email: string
    name: string
    userRole?: string | null
    sppgId?: string | null
    userType?: string
  }
}

/**
 * Response type for middleware checks
 */
export type MiddlewareResponse = {
  success: boolean
  session?: AuthSession
  error?: string
  response?: NextResponse
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<MiddlewareResponse> {
  try {
    const session = await auth()

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
        response: NextResponse.json(
          { 
            success: false, 
            error: 'Unauthorized',
            message: 'You must be logged in to access this resource'
          },
          { status: 401 }
        )
      }
    }

    return {
      success: true,
      session
    }
  } catch (error) {
    console.error('[API Middleware] Auth check failed:', error)
    return {
      success: false,
      error: 'Internal server error',
      response: NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error',
          message: 'Failed to verify authentication'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Check if user has admin role
 */
export async function checkAdminAccess(
  request: NextRequest,
  options: {
    requireSuperAdmin?: boolean
    allowAnalystReadOnly?: boolean
  } = {}
): Promise<MiddlewareResponse> {
  const { requireSuperAdmin = false, allowAnalystReadOnly = true } = options

  // First check authentication
  const authCheck = await checkAuth()
  if (!authCheck.success) {
    return authCheck
  }

  const session = authCheck.session!
  const userRole = session.user.userRole ?? ''

  // Check if user has admin role
  const isAdmin = ADMIN_ROLES.includes(userRole as typeof ADMIN_ROLES[number])
  
  if (!isAdmin) {
    // Log failed access attempt
    await logAdminAccess({
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: userRole || undefined,
      pathname: request.nextUrl.pathname,
      method: request.method,
      success: false,
      ipAddress: getClientIp(request.headers),
      userAgent: getUserAgent(request.headers),
      errorMessage: 'User does not have admin role'
    }).catch(err => console.error('[API Middleware] Audit log failed:', err))

    return {
      success: false,
      error: 'Forbidden',
      response: NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden',
          message: 'You do not have permission to access this resource',
          requiredRoles: ADMIN_ROLES
        },
        { status: 403 }
      )
    }
  }

  // Check if super admin is required
  if (requireSuperAdmin && userRole !== SUPERADMIN_ROLE) {
    await logAdminAccess({
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: userRole || undefined,
      pathname: request.nextUrl.pathname,
      method: request.method,
      success: false,
      ipAddress: getClientIp(request.headers),
      userAgent: getUserAgent(request.headers),
      errorMessage: 'Super admin access required'
    }).catch(err => console.error('[API Middleware] Audit log failed:', err))

    return {
      success: false,
      error: 'Forbidden',
      response: NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden',
          message: 'This action requires super admin privileges',
          requiredRole: SUPERADMIN_ROLE
        },
        { status: 403 }
      )
    }
  }

  // Check analyst read-only restrictions
  if (userRole === ANALYST_ROLE) {
    const isReadOperation = request.method === 'GET'
    
    if (!isReadOperation && !allowAnalystReadOnly) {
      await logAdminAccess({
        userId: session.user.id,
        userEmail: session.user.email,
        userRole: userRole || undefined,
        pathname: request.nextUrl.pathname,
        method: request.method,
        success: false,
        ipAddress: getClientIp(request.headers),
        userAgent: getUserAgent(request.headers),
        errorMessage: 'Analyst role restricted to read-only operations'
      }).catch(err => console.error('[API Middleware] Audit log failed:', err))

      return {
        success: false,
        error: 'Forbidden',
        response: NextResponse.json(
          { 
            success: false, 
            error: 'Forbidden',
            message: 'Analyst role has read-only access',
            allowedMethods: ['GET']
          },
          { status: 403 }
        )
      }
    }
  }

  // Log successful access
  await logAdminAccess({
    userId: session.user.id,
    userEmail: session.user.email,
    userRole: userRole || undefined,
    pathname: request.nextUrl.pathname,
    method: request.method,
    success: true,
    ipAddress: getClientIp(request.headers),
    userAgent: getUserAgent(request.headers)
  }).catch(err => console.error('[API Middleware] Audit log failed:', err))

  return {
    success: true,
    session
  }
}

/**
 * Check if user has SPPG access
 */
export async function checkSppgAccess(
  request: NextRequest,
  options: {
    requireSppgId?: boolean
  } = {}
): Promise<MiddlewareResponse> {
  const { requireSppgId = true } = options

  // First check authentication
  const authCheck = await checkAuth()
  if (!authCheck.success) {
    return authCheck
  }

  const session = authCheck.session!

  // Check if user has sppgId
  if (requireSppgId && !session.user.sppgId) {
    return {
      success: false,
      error: 'Forbidden',
      response: NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden',
          message: 'Your account is not associated with any SPPG'
        },
        { status: 403 }
      )
    }
  }

  // Check if user has SPPG role
  const isSppgUser = 
    session.user.userRole?.startsWith('SPPG_') ||
    session.user.userType === 'SPPG_USER' ||
    session.user.userType === 'SPPG_ADMIN'

  if (!isSppgUser) {
    return {
      success: false,
      error: 'Forbidden',
      response: NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden',
          message: 'This resource is only accessible to SPPG users'
        },
        { status: 403 }
      )
    }
  }

  return {
    success: true,
    session
  }
}

/**
 * Wrapper for admin API routes with automatic RBAC
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   return withAdminAuth(request, async (session) => {
 *     // Your handler logic here
 *     return NextResponse.json({ data: 'something' })
 *   })
 * }
 * ```
 */
export async function withAdminAuth(
  request: NextRequest,
  handler: (session: AuthSession) => Promise<NextResponse>,
  options?: {
    requireSuperAdmin?: boolean
    allowAnalystReadOnly?: boolean
  }
): Promise<NextResponse> {
  const accessCheck = await checkAdminAccess(request, options)
  
  if (!accessCheck.success) {
    return accessCheck.response!
  }

  try {
    return await handler(accessCheck.session!)
  } catch (error) {
    console.error('[API Middleware] Handler error:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'N/A',
      url: request.url,
      method: request.method,
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An error occurred while processing your request',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Permission type for RBAC checks
 */
export type Permission = 
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'menu:create'
  | 'menu:update'
  | 'menu:delete'
  | 'procurement:create'
  | 'procurement:update'
  | 'procurement:delete'
  | 'production:manage'
  | 'distribution:manage'
  | 'financial:view'
  | 'financial:manage'
  | 'hr:manage'
  | 'analytics:view'
  | 'quality:manage'
  | 'approval:submit'
  | 'approval:approve'

/**
 * Role-based permissions mapping
 */
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Platform Level
  PLATFORM_SUPERADMIN: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'menu:create', 'menu:update', 'menu:delete',
    'procurement:create', 'procurement:update', 'procurement:delete',
    'production:manage', 'distribution:manage',
    'financial:view', 'financial:manage',
    'hr:manage', 'analytics:view', 'quality:manage',
    'approval:submit', 'approval:approve'
  ],
  
  // SPPG Management
  SPPG_KEPALA: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'menu:create', 'menu:update', 'menu:delete',
    'procurement:create', 'procurement:update', 'procurement:delete',
    'production:manage', 'distribution:manage',
    'financial:view', 'financial:manage',
    'hr:manage', 'analytics:view', 'quality:manage',
    'approval:submit', 'approval:approve'
  ],
  
  SPPG_ADMIN: [
    'user:create', 'user:read', 'user:update',
    'menu:create', 'menu:update', 'menu:delete',
    'procurement:create', 'procurement:update',
    'analytics:view'
  ],
  
  // SPPG Operational
  SPPG_HRD_MANAGER: [
    'user:create', 'user:read', 'user:update',
    'hr:manage', 'analytics:view'
  ],
  
  SPPG_AHLI_GIZI: [
    'user:read',
    'menu:create', 'menu:update', 'menu:delete',
    'quality:manage', 'analytics:view'
  ],
  
  SPPG_AKUNTAN: [
    'user:read',
    'financial:view', 'financial:manage',
    'procurement:create', 'procurement:update',
    'analytics:view'
  ],
  
  SPPG_PRODUKSI_MANAGER: [
    'user:read',
    'production:manage', 'quality:manage',
    'analytics:view'
  ],
  
  SPPG_DISTRIBUSI_MANAGER: [
    'user:read',
    'distribution:manage', 'analytics:view'
  ],
  
  // SPPG Staff
  SPPG_STAFF_DAPUR: ['user:read', 'production:manage'],
  SPPG_STAFF_DISTRIBUSI: ['user:read', 'distribution:manage'],
  SPPG_STAFF_QC: ['user:read', 'quality:manage'],
  SPPG_STAFF_ADMIN: ['user:read', 'analytics:view'],
  
  // Limited
  SPPG_VIEWER: ['user:read', 'analytics:view'],
  DEMO_USER: ['user:read', 'analytics:view']
}

/**
 * Check if user role has specific permission
 * 
 * @param userRole - User's role from session
 * @param permission - Permission to check
 * @returns true if user has permission, false otherwise
 * 
 * @example
 * ```typescript
 * if (!hasPermission(session.user.userRole, 'user:delete')) {
 *   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
 * }
 * ```
 */
export function hasPermission(
  userRole: string | null | undefined,
  permission: Permission
): boolean {
  if (!userRole) return false
  
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.includes(permission)
}
/**
 * Wrapper for SPPG API routes with automatic RBAC
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   return withSppgAuth(request, async (session) => {
 *     const sppgId = session.user.sppgId
 *     // Your handler logic here
 *     return NextResponse.json({ data: 'something' })
 *   })
 * }
 * ```
 */
export async function withSppgAuth(
  request: NextRequest,
  handler: (session: AuthSession) => Promise<NextResponse>,
  options?: {
    requireSppgId?: boolean
  }
): Promise<NextResponse> {
  const accessCheck = await checkSppgAccess(request, options)
  
  if (!accessCheck.success) {
    return accessCheck.response!
  }

  try {
    return await handler(accessCheck.session!)
  } catch (error) {
    console.error('[API Middleware] Handler error:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'N/A',
      url: request.url,
      method: request.method,
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An error occurred while processing your request',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}
