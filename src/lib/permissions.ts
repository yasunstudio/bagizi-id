/**
 * @fileoverview RBAC Permissions Helper Functions
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Security Guidelines
 * 
 * ENTERPRISE SECURITY:
 * - Role-based access control (RBAC)
 * - Multi-tenant data isolation
 * - SPPG access verification
 * - Fine-grained permissions
 */

import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'

// ================================ PERMISSION TYPES ================================

export type PermissionType =
  // General permissions
  | 'ALL'
  | 'READ'
  | 'WRITE'
  | 'DELETE'
  | 'APPROVE'
  
  // SPPG Operations (for SPPG users)
  | 'MENU_MANAGE'
  | 'SCHOOL_MANAGE'
  | 'PROCUREMENT_MANAGE'
  | 'SUPPLIER_MANAGE'
  | 'PRODUCTION_MANAGE'
  | 'DISTRIBUTION_MANAGE'
  | 'FINANCIAL_MANAGE'
  | 'HR_MANAGE'
  | 'QUALITY_MANAGE'
  | 'USER_MANAGE'
  | 'ANALYTICS_VIEW'
  | 'REPORTS_VIEW'
  | 'INVENTORY_VIEW'
  | 'INVENTORY_MANAGE'
  | 'INVENTORY_APPROVE'
  
  // Platform Admin Permissions
  | 'PLATFORM_SPPG_VIEW'
  | 'PLATFORM_SPPG_CREATE'
  | 'PLATFORM_SPPG_EDIT'
  | 'PLATFORM_SPPG_DELETE'
  | 'PLATFORM_SPPG_ACTIVATE'
  | 'PLATFORM_USER_VIEW'
  | 'PLATFORM_USER_CREATE'
  | 'PLATFORM_USER_EDIT'
  | 'PLATFORM_USER_DELETE'
  | 'PLATFORM_DEMO_REQUEST_VIEW'
  | 'PLATFORM_DEMO_REQUEST_APPROVE'
  | 'PLATFORM_DEMO_REQUEST_REJECT'
  | 'PLATFORM_DEMO_REQUEST_CONVERT'
  | 'PLATFORM_SUBSCRIPTION_VIEW'
  | 'PLATFORM_SUBSCRIPTION_EDIT'
  | 'PLATFORM_BILLING_VIEW'
  | 'PLATFORM_BILLING_MANAGE'
  | 'PLATFORM_ANALYTICS_VIEW'
  | 'PLATFORM_ANALYTICS_EXPORT'
  | 'PLATFORM_SETTINGS_VIEW'
  | 'PLATFORM_SETTINGS_EDIT'
  | 'PLATFORM_DATABASE_ACCESS'
  | 'PLATFORM_SECURITY_MANAGE'
  | 'PLATFORM_AUDIT_LOG_VIEW'
  | 'PLATFORM_REGION_MANAGE'

// ================================ ROLE PERMISSIONS MAPPING ================================

const rolePermissions: Record<UserRole, PermissionType[]> = {
  // ================================
  // PLATFORM LEVEL ROLES
  // ================================
  
  /**
   * PLATFORM_SUPERADMIN - Full platform access
   * Use case: CTO, Technical Lead, System Administrator
   */
  PLATFORM_SUPERADMIN: [
    'ALL', // Superadmin has ALL permissions by default
    
    // Explicitly list for documentation
    'PLATFORM_SPPG_VIEW',
    'PLATFORM_SPPG_CREATE',
    'PLATFORM_SPPG_EDIT',
    'PLATFORM_SPPG_DELETE',
    'PLATFORM_SPPG_ACTIVATE',
    'PLATFORM_USER_VIEW',
    'PLATFORM_USER_CREATE',
    'PLATFORM_USER_EDIT',
    'PLATFORM_USER_DELETE',
    'PLATFORM_DEMO_REQUEST_VIEW',
    'PLATFORM_DEMO_REQUEST_APPROVE',
    'PLATFORM_DEMO_REQUEST_REJECT',
    'PLATFORM_DEMO_REQUEST_CONVERT',
    'PLATFORM_SUBSCRIPTION_VIEW',
    'PLATFORM_SUBSCRIPTION_EDIT',
    'PLATFORM_BILLING_VIEW',
    'PLATFORM_BILLING_MANAGE',
    'PLATFORM_ANALYTICS_VIEW',
    'PLATFORM_ANALYTICS_EXPORT',
    'PLATFORM_SETTINGS_VIEW',
    'PLATFORM_SETTINGS_EDIT',
    'PLATFORM_DATABASE_ACCESS',
    'PLATFORM_SECURITY_MANAGE',
    'PLATFORM_AUDIT_LOG_VIEW',
    'PLATFORM_REGION_MANAGE',
  ],
  
  /**
   * PLATFORM_SUPPORT - Customer support operations
   * Use case: Customer Success Team, Support Engineers
   * Can: Manage SPPGs, users, demo requests, view billing
   * Cannot: Delete SPPGs, manage billing, access database/security
   */
  PLATFORM_SUPPORT: [
    'READ',
    'WRITE',
    
    // SPPG Management - Limited (no delete)
    'PLATFORM_SPPG_VIEW',
    'PLATFORM_SPPG_CREATE',
    'PLATFORM_SPPG_EDIT',
    'PLATFORM_SPPG_ACTIVATE',
    
    // User Management - Full (for customer support)
    'PLATFORM_USER_VIEW',
    'PLATFORM_USER_CREATE',
    'PLATFORM_USER_EDIT',
    // No USER_DELETE - escalate to superadmin
    
    // Demo Requests - Full control (primary responsibility)
    'PLATFORM_DEMO_REQUEST_VIEW',
    'PLATFORM_DEMO_REQUEST_APPROVE',
    'PLATFORM_DEMO_REQUEST_REJECT',
    'PLATFORM_DEMO_REQUEST_CONVERT',
    
    // Subscriptions & Billing - View only (for troubleshooting)
    'PLATFORM_SUBSCRIPTION_VIEW',
    'PLATFORM_BILLING_VIEW',
    // No BILLING_MANAGE - financial separation
    
    // Analytics - Full view
    'PLATFORM_ANALYTICS_VIEW',
    'PLATFORM_ANALYTICS_EXPORT',
    'PLATFORM_AUDIT_LOG_VIEW',
    
    // Regional Data - Manage
    'PLATFORM_REGION_MANAGE',
    
    // Settings - View only
    'PLATFORM_SETTINGS_VIEW',
    // No SETTINGS_EDIT, DATABASE_ACCESS, SECURITY_MANAGE
  ],
  
  /**
   * PLATFORM_ANALYST - Read-only analytics and reporting
   * Use case: Business Analysts, Data Team, Management
   * Can: View everything, export analytics
   * Cannot: Modify anything
   */
  PLATFORM_ANALYST: [
    'READ',
    
    // SPPG & Users - View only
    'PLATFORM_SPPG_VIEW',
    'PLATFORM_USER_VIEW',
    
    // Demo Requests - View only
    'PLATFORM_DEMO_REQUEST_VIEW',
    
    // Subscriptions & Billing - View only
    'PLATFORM_SUBSCRIPTION_VIEW',
    'PLATFORM_BILLING_VIEW',
    
    // Analytics - Full access (primary responsibility)
    'PLATFORM_ANALYTICS_VIEW',
    'PLATFORM_ANALYTICS_EXPORT',
    'PLATFORM_AUDIT_LOG_VIEW',
    'REPORTS_VIEW',
    'ANALYTICS_VIEW',
    
    // Settings - View only
    'PLATFORM_SETTINGS_VIEW',
  ],

  // ================================
  // SPPG LEVEL ROLES
  // ================================
  
  // SPPG Management
  SPPG_KEPALA: [
    'READ',
    'WRITE',
    'DELETE',
    'APPROVE',
    'MENU_MANAGE',
    'SCHOOL_MANAGE',
    'PROCUREMENT_MANAGE',
    'SUPPLIER_MANAGE',
    'PRODUCTION_MANAGE',
    'DISTRIBUTION_MANAGE',
    'FINANCIAL_MANAGE',
    'HR_MANAGE',
    'INVENTORY_VIEW',
    'INVENTORY_MANAGE',
    'INVENTORY_APPROVE',
  ],
  SPPG_ADMIN: [
    'READ',
    'WRITE',
    'MENU_MANAGE',
    'SCHOOL_MANAGE',
    'PROCUREMENT_MANAGE',
    'SUPPLIER_MANAGE',
    'PRODUCTION_MANAGE',
    'HR_MANAGE',
    'USER_MANAGE',
    'INVENTORY_VIEW',
    'INVENTORY_MANAGE',
  ],

  // SPPG Operational
  SPPG_AHLI_GIZI: ['READ', 'WRITE', 'MENU_MANAGE', 'SCHOOL_MANAGE', 'QUALITY_MANAGE', 'PRODUCTION_MANAGE', 'INVENTORY_VIEW'],  // ✅ Added for production access
  SPPG_AKUNTAN: ['READ', 'WRITE', 'FINANCIAL_MANAGE', 'PROCUREMENT_MANAGE', 'SUPPLIER_MANAGE', 'INVENTORY_VIEW', 'INVENTORY_MANAGE'],
  SPPG_PRODUKSI_MANAGER: [
    'READ',
    'WRITE',
    'PRODUCTION_MANAGE',
    'QUALITY_MANAGE',
    'INVENTORY_VIEW',
    'INVENTORY_MANAGE',
  ],
  SPPG_DISTRIBUSI_MANAGER: ['READ', 'WRITE', 'DISTRIBUTION_MANAGE', 'INVENTORY_VIEW'],
  SPPG_HRD_MANAGER: ['READ', 'WRITE', 'HR_MANAGE', 'USER_MANAGE'],

  // SPPG Staff
  SPPG_STAFF_DAPUR: ['READ', 'PRODUCTION_MANAGE'],
  SPPG_STAFF_DISTRIBUSI: ['READ', 'DISTRIBUTION_MANAGE'],
  SPPG_STAFF_ADMIN: ['READ', 'WRITE'],
  SPPG_STAFF_QC: ['READ', 'QUALITY_MANAGE', 'PRODUCTION_MANAGE'],  // ✅ Added for production access

  // Limited
  SPPG_VIEWER: ['READ'],
  DEMO_USER: ['READ'],
}

// ================================ PERMISSION CHECK FUNCTIONS ================================

/**
 * Check if a role has a specific permission
 * @param role - User role
 * @param permission - Permission to check
 * @returns boolean - Whether the role has the permission
 */
export function hasPermission(
  role: UserRole,
  permission: PermissionType
): boolean {
  const permissions = rolePermissions[role] || []
  return permissions.includes('ALL') || permissions.includes(permission)
}

/**
 * Check if user can manage menus
 */
export function canManageMenu(role: UserRole): boolean {
  return hasPermission(role, 'MENU_MANAGE')
}

/**
 * Check if user can manage schools
 */
export function canManageSchool(role: UserRole): boolean {
  return hasPermission(role, 'SCHOOL_MANAGE')
}

/**
 * Check if user can manage procurement
 */
export function canManageProcurement(role: UserRole): boolean {
  return hasPermission(role, 'PROCUREMENT_MANAGE')
}

/**
 * Check if user can manage suppliers
 */
export function canManageSupplier(role: UserRole): boolean {
  return hasPermission(role, 'SUPPLIER_MANAGE')
}

/**
 * Check if user can manage production
 */
export function canManageProduction(role: UserRole): boolean {
  return hasPermission(role, 'PRODUCTION_MANAGE')
}

/**
 * Check if user can manage distribution
 */
export function canManageDistribution(role: UserRole): boolean {
  return hasPermission(role, 'DISTRIBUTION_MANAGE')
}

/**
 * Check if user can manage HR (departments, positions, employees)
 * Roles: SPPG_KEPALA, SPPG_ADMIN, SPPG_HRD_MANAGER
 */
export function canManageHR(role: UserRole): boolean {
  return hasPermission(role, 'HR_MANAGE')
}

/**
 * Check if user can manage users
 * Roles: SPPG_KEPALA, SPPG_ADMIN, SPPG_HRD_MANAGER
 */
export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'USER_MANAGE')
}

/**
 * Check if user can approve transactions
 */
export function canApprove(role: UserRole): boolean {
  return hasPermission(role, 'APPROVE')
}

// ================================ PLATFORM ADMIN PERMISSION CHECKS ================================

/**
 * Check if user is a platform admin (any level)
 */
export function isPlatformAdmin(role: UserRole | null | undefined): boolean {
  if (!role) return false
  return (
    role === 'PLATFORM_SUPERADMIN' ||
    role === 'PLATFORM_SUPPORT' ||
    role === 'PLATFORM_ANALYST'
  )
}

/**
 * Check if user is superadmin specifically
 */
export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === 'PLATFORM_SUPERADMIN'
}

/**
 * Check if user has write access (can create/edit)
 */
export function hasWriteAccess(role: UserRole | null | undefined): boolean {
  if (!role) return false
  return (
    role === 'PLATFORM_SUPERADMIN' ||
    role === 'PLATFORM_SUPPORT'
  )
}

/**
 * Check if user has read-only access
 */
export function isReadOnly(role: UserRole | null | undefined): boolean {
  return role === 'PLATFORM_ANALYST'
}

/**
 * SPPG Management Permissions for Platform Admins
 */
export const PlatformSppgPermissions = {
  canView: (role: UserRole) => hasPermission(role, 'PLATFORM_SPPG_VIEW'),
  canCreate: (role: UserRole) => hasPermission(role, 'PLATFORM_SPPG_CREATE'),
  canEdit: (role: UserRole) => hasPermission(role, 'PLATFORM_SPPG_EDIT'),
  canDelete: (role: UserRole) => hasPermission(role, 'PLATFORM_SPPG_DELETE'),
  canActivate: (role: UserRole) => hasPermission(role, 'PLATFORM_SPPG_ACTIVATE'),
}

/**
 * User Management Permissions for Platform Admins
 */
export const PlatformUserPermissions = {
  canView: (role: UserRole) => hasPermission(role, 'PLATFORM_USER_VIEW'),
  canCreate: (role: UserRole) => hasPermission(role, 'PLATFORM_USER_CREATE'),
  canEdit: (role: UserRole) => hasPermission(role, 'PLATFORM_USER_EDIT'),
  canDelete: (role: UserRole) => hasPermission(role, 'PLATFORM_USER_DELETE'),
}

/**
 * Demo Request Permissions for Platform Admins
 */
export const PlatformDemoRequestPermissions = {
  canView: (role: UserRole) => hasPermission(role, 'PLATFORM_DEMO_REQUEST_VIEW'),
  canApprove: (role: UserRole) => hasPermission(role, 'PLATFORM_DEMO_REQUEST_APPROVE'),
  canReject: (role: UserRole) => hasPermission(role, 'PLATFORM_DEMO_REQUEST_REJECT'),
  canConvert: (role: UserRole) => hasPermission(role, 'PLATFORM_DEMO_REQUEST_CONVERT'),
  canTakeAction: (role: UserRole) => 
    hasPermission(role, 'PLATFORM_DEMO_REQUEST_APPROVE') ||
    hasPermission(role, 'PLATFORM_DEMO_REQUEST_REJECT'),
}

/**
 * Subscription & Billing Permissions for Platform Admins
 */
export const PlatformBillingPermissions = {
  canViewSubscription: (role: UserRole) => hasPermission(role, 'PLATFORM_SUBSCRIPTION_VIEW'),
  canEditSubscription: (role: UserRole) => hasPermission(role, 'PLATFORM_SUBSCRIPTION_EDIT'),
  canViewBilling: (role: UserRole) => hasPermission(role, 'PLATFORM_BILLING_VIEW'),
  canManageBilling: (role: UserRole) => hasPermission(role, 'PLATFORM_BILLING_MANAGE'),
}

/**
 * Platform Settings Permissions
 */
export const PlatformSettingsPermissions = {
  canView: (role: UserRole) => hasPermission(role, 'PLATFORM_SETTINGS_VIEW'),
  canEdit: (role: UserRole) => hasPermission(role, 'PLATFORM_SETTINGS_EDIT'),
  canAccessDatabase: (role: UserRole) => hasPermission(role, 'PLATFORM_DATABASE_ACCESS'),
  canManageSecurity: (role: UserRole) => hasPermission(role, 'PLATFORM_SECURITY_MANAGE'),
}

/**
 * Analytics & Reporting Permissions for Platform Admins
 */
export const PlatformAnalyticsPermissions = {
  canView: (role: UserRole) => hasPermission(role, 'PLATFORM_ANALYTICS_VIEW'),
  canExport: (role: UserRole) => hasPermission(role, 'PLATFORM_ANALYTICS_EXPORT'),
  canViewAuditLog: (role: UserRole) => hasPermission(role, 'PLATFORM_AUDIT_LOG_VIEW'),
}

/**
 * Regional Data Permissions for Platform Admins
 */
export const PlatformRegionalPermissions = {
  canManage: (role: UserRole) => hasPermission(role, 'PLATFORM_REGION_MANAGE'),
}

// ================================ SPPG ACCESS VERIFICATION ================================

/**
 * Check SPPG access and verify it's active
 * CRITICAL FOR MULTI-TENANT SECURITY
 * 
 * @param sppgId - SPPG ID to verify
 * @returns SPPG entity or null if not found/inactive
 */
export async function checkSppgAccess(sppgId: string | null) {
  if (!sppgId) return null

  try {
    const sppg = await db.sPPG.findFirst({
      where: {
        id: sppgId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        isDemoAccount: true,
        demoExpiresAt: true,
        demoAllowedFeatures: true,
      },
    })

    // Check if demo account is expired
    if (sppg?.isDemoAccount && sppg.demoExpiresAt) {
      if (new Date() > sppg.demoExpiresAt) {
        return null // Demo expired
      }
    }

    return sppg
  } catch (error) {
    console.error('Error checking SPPG access:', error)
    return null
  }
}

/**
 * Check if a feature is allowed for the SPPG
 * @param sppg - SPPG entity from checkSppgAccess
 * @param featureName - Feature to check
 */
export function isFeatureAllowed(
  sppg: Awaited<ReturnType<typeof checkSppgAccess>>,
  featureName: string
): boolean {
  if (!sppg) return false

  // Demo accounts have limited features
  if (sppg.isDemoAccount) {
    return (sppg.demoAllowedFeatures || []).includes(featureName)
  }

  // Non-demo accounts: check subscription plan
  // TODO: Implement subscription plan feature checks
  return true
}
