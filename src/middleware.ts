/**
 * @fileoverview Enhanced middleware for multi-layer route protection and role-based access control
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { logAdminAccess, getClientIp, getUserAgent } from '@/lib/audit-log'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  console.log('='.repeat(80))
  console.log('[Middleware] 🚀 REQUEST START:', {
    pathname,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Public routes
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/case-studies')

  // Auth routes
  const isAuthRoute = 
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/demo-request')

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  // SPPG routes (Layer 2: SPPG Operations)
  const isSppgRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/menu') ||
    pathname.startsWith('/procurement') ||
    pathname.startsWith('/production') ||
    pathname.startsWith('/distribution') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/hrd') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/users')

  console.log('[Middleware] 📋 Route Classification:', {
    isPublicRoute,
    isAuthRoute,
    isAdminRoute,
    isSppgRoute
  })

  // Allow public routes
  if (isPublicRoute) {
    console.log('[Middleware] ✅ Public route - allowing access')
    return NextResponse.next()
  }

  console.log('[Middleware] 🔐 Session Check:', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    userRole: session?.user?.userRole,
    userType: session?.user?.userType,
    sppgId: session?.user?.sppgId
  })

  // Redirect to login if not authenticated
  if (!session && !isAuthRoute) {
    console.log('[Middleware] ❌ No session - redirecting to login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect authenticated users away from auth pages
  if (session && isAuthRoute) {
    const redirectUrl = 
      session.user.userRole === 'PLATFORM_SUPERADMIN' 
        ? '/admin' 
        : '/dashboard'
    console.log('[Middleware] 🔄 Auth route with session - redirecting to:', redirectUrl)
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Check SPPG access
  if (isSppgRoute) {
    console.log('[Middleware] 🏢 SPPG Route Check:', {
      pathname,
      sppgId: session?.user?.sppgId,
      userRole: session?.user?.userRole,
      userType: session?.user?.userType,
      email: session?.user?.email
    })

    // Skip SPPG checks for admin users
    const userRole = session?.user.userRole ?? ''
    const isAdminUser = 
      userRole === 'PLATFORM_SUPERADMIN' ||
      userRole === 'PLATFORM_SUPPORT' ||
      userRole === 'PLATFORM_ANALYST'
    
    if (isAdminUser) {
      console.log('[Middleware] 👑 Admin user accessing SPPG route - redirecting to /admin')
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    // Must have sppgId for non-admin users
    if (!session?.user.sppgId) {
      console.log('[Middleware] ❌ FAILED: No sppgId - redirecting to access-denied')
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }

    // Check if SPPG role
    const isSppgUser = session.user.userRole?.startsWith('SPPG_') ||
                      session.user.userType === 'SPPG_USER' ||
                      session.user.userType === 'SPPG_ADMIN'
    
    console.log('[Middleware] 👤 SPPG User Validation:', { 
      isSppgUser,
      roleStartsWithSPPG: session.user.userRole?.startsWith('SPPG_'),
      typeIsSppgUser: session.user.userType === 'SPPG_USER',
      typeIsSppgAdmin: session.user.userType === 'SPPG_ADMIN'
    })
    
    if (!isSppgUser) {
      console.log('[Middleware] ❌ FAILED: Not SPPG user - redirecting to admin')
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    console.log('[Middleware] ✅ SPPG user validation passed')
  }

  // Check admin access with fine-grained permissions
  if (isAdminRoute) {
    const userRole = session?.user.userRole ?? ''
    const isAdmin = 
      userRole === 'PLATFORM_SUPERADMIN' ||
      userRole === 'PLATFORM_SUPPORT' ||
      userRole === 'PLATFORM_ANALYST'
    
    console.log('[Middleware] 👑 Admin Access Check:', { 
      userRole,
      isAdmin,
      pathname 
    })
    
    // Extract client info for audit logging
    const ipAddress = getClientIp(req.headers)
    const userAgent = getUserAgent(req.headers)
    
    if (!isAdmin) {
      console.log('[Middleware] ❌ FAILED: Not admin - redirecting to unauthorized')
      
      // Log failed admin access attempt (non-blocking)
      logAdminAccess({
        userId: session?.user?.id,
        userEmail: session?.user?.email || undefined,
        userRole: userRole || undefined,
        pathname,
        method: req.method,
        success: false,
        ipAddress,
        userAgent,
        errorMessage: 'Unauthorized: User does not have admin role'
      }).catch(err => console.error('[Middleware] Audit log failed:', err))
      
      return NextResponse.redirect(new URL(`/unauthorized?error=unauthorized&from=${encodeURIComponent(pathname)}`, req.url))
    }

    // Fine-grained permissions for admin sub-routes
    const isSuperAdmin = userRole === 'PLATFORM_SUPERADMIN'
    const isSupport = userRole === 'PLATFORM_SUPPORT'
    const isAnalyst = userRole === 'PLATFORM_ANALYST'

    // PLATFORM_ANALYST has very limited access (read-only)
    if (isAnalyst) {
      const isReadOnlyRoute = 
        pathname === '/admin' ||
        pathname.startsWith('/admin/analytics') ||
        pathname.startsWith('/admin/activity-logs') ||
        pathname.startsWith('/admin/demo-requests') || // ✅ Allow demo requests viewing
        pathname.startsWith('/admin/subscriptions') || // ✅ Allow subscriptions viewing
        pathname.startsWith('/admin/invoices') || // ✅ Allow invoices viewing
        pathname.startsWith('/admin/notifications') || // ✅ Allow notifications viewing
        (pathname.startsWith('/admin/settings') && req.method === 'GET') || // ✅ Allow settings viewing (read-only)
        (pathname.startsWith('/admin/sppg') && req.method === 'GET') ||
        (pathname.startsWith('/admin/users') && req.method === 'GET')

      if (!isReadOnlyRoute) {
        console.log('[Middleware] ❌ ANALYST RESTRICTION: Read-only access only')
        
        // Log restricted access attempt (non-blocking)
        logAdminAccess({
          userId: session?.user?.id,
          userEmail: session?.user?.email || undefined,
          userRole,
          pathname,
          method: req.method,
          success: false,
          ipAddress,
          userAgent,
          errorMessage: 'Analyst role restricted to read-only access'
        }).catch(err => console.error('[Middleware] Audit log failed:', err))
        
        return NextResponse.redirect(new URL(`/unauthorized?error=read-only&from=${encodeURIComponent(pathname)}`, req.url))
      }
    }

    // PLATFORM_SUPPORT has limited write access
    if (isSupport && !isSuperAdmin) {
      const restrictedRoutes = [
        '/admin/database',
        '/admin/security',
        '/admin/settings/platform'
      ]

      const isRestricted = restrictedRoutes.some(route => pathname.startsWith(route))
      
      if (isRestricted) {
        console.log('[Middleware] ❌ SUPPORT RESTRICTION: Restricted route')
        
        // Log restricted access attempt (non-blocking)
        logAdminAccess({
          userId: session?.user?.id,
          userEmail: session?.user?.email || undefined,
          userRole,
          pathname,
          method: req.method,
          success: false,
          ipAddress,
          userAgent,
          errorMessage: 'Support role does not have access to restricted routes'
        }).catch(err => console.error('[Middleware] Audit log failed:', err))
        
        return NextResponse.redirect(new URL(`/unauthorized?error=restricted&from=${encodeURIComponent(pathname)}`, req.url))
      }
    }

    // Log successful admin access (non-blocking)
    logAdminAccess({
      userId: session?.user?.id,
      userEmail: session?.user?.email || undefined,
      userRole,
      pathname,
      method: req.method,
      success: true,
      ipAddress,
      userAgent
    }).catch(err => console.error('[Middleware] Audit log failed:', err))

    console.log('[Middleware] ✅ Admin access granted:', { userRole, pathname })
  }

  // **CRITICAL: Role-Based Access Control for SPPG Routes**
  // Each SPPG route requires specific roles for security and operational control
  
  // Menu Management - Nutrition experts and administrators
  if (pathname.startsWith('/menu')) {
    const userRole = session?.user?.userRole ?? ''
    
    // Skip check for admin users - they shouldn't access SPPG routes
    const isAdminUser = 
      userRole === 'PLATFORM_SUPERADMIN' ||
      userRole === 'PLATFORM_SUPPORT' ||
      userRole === 'PLATFORM_ANALYST'
    
    if (isAdminUser) {
      console.log('[Middleware] 👑 Admin user accessing menu route - redirecting to /admin')
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    
    const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI']
    const hasAccess = allowedRoles.includes(userRole)
    
    console.log('[Middleware] 🍽️  Menu Access Check:', {
      userRole,
      allowedRoles,
      hasAccess
    })
    
    if (!hasAccess) {
      console.log('[Middleware] ❌ FAILED: Menu access denied')
      return NextResponse.redirect(new URL(`/access-denied?error=access-denied&from=${encodeURIComponent(pathname)}`, req.url))
    }
  }

  // Production Management - Production staff and quality control
  if (pathname.startsWith('/production')) {
    const userRole = session?.user?.userRole ?? ''
    
    // Skip check for admin users - they shouldn't access SPPG routes
    const isAdminUser = 
      userRole === 'PLATFORM_SUPERADMIN' ||
      userRole === 'PLATFORM_SUPPORT' ||
      userRole === 'PLATFORM_ANALYST'
    
    if (isAdminUser) {
      console.log('[Middleware] 👑 Admin user accessing production route - redirecting to /admin')
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    
    const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_PRODUKSI_MANAGER', 'SPPG_STAFF_DAPUR', 'SPPG_STAFF_QC', 'SPPG_AHLI_GIZI']
    const hasAccess = allowedRoles.includes(userRole)
    
    console.log('[Middleware] 🏭 PRODUCTION ACCESS CHECK:', {
      pathname,
      userRole,
      userRoleType: typeof userRole,
      allowedRoles,
      hasAccess,
      email: session?.user?.email,
      isRoleInArray: allowedRoles.includes(userRole),
      roleComparisons: allowedRoles.map(role => ({
        role,
        matches: role === userRole,
        strictEqual: role === userRole,
        looseEqual: role == userRole
      }))
    })
    
    if (!hasAccess) {
      console.log('[Middleware] ❌❌❌ FAILED: Production access DENIED - REDIRECTING TO ACCESS-DENIED')
      console.log('[Middleware] 🔴 Redirect reason: userRole not in allowedRoles')
      return NextResponse.redirect(new URL(`/access-denied?error=access-denied&from=${encodeURIComponent(pathname)}`, req.url))
    }
    
    console.log('[Middleware] ✅✅✅ Production access GRANTED - allowing request to proceed')
  }

  console.log('[Middleware] ✅ All checks passed - allowing request')
  console.log('='.repeat(80))
  return NextResponse.next()
})

// Matcher configuration - exclude API routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (ALL API routes - they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}