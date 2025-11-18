/**
 * @fileoverview SPPG User Management Types
 * @version Next.js 15.5.4 / TypeScript 5.x
 * @author Bagizi-ID Development Team
 * @see {@link /.github/copilot-instructions.md} Development Guidelines
 * 
 * Type definitions for SPPG user management domain.
 * Based on Prisma User model with SPPG-specific fields.
 */

import type { UserType, UserRole } from '@prisma/client'

/**
 * User list item for table display
 */
export interface UserListItem {
  id: string
  email: string
  name: string
  phone: string | null
  profileImage: string | null
  userType: UserType
  userRole: UserRole | null
  isActive: boolean
  emailVerified: DateTime | null
  lastLogin: DateTime | null
  createdAt: DateTime
  updatedAt: DateTime
  
  // SPPG relation
  sppg: {
    id: string
    code: string
    name: string
  } | null
  
  // Department & Position relations
  department: {
    id: string
    departmentName: string
    departmentCode: string
  } | null
  
  position: {
    id: string
    positionName: string
    positionCode: string
  } | null
}

/**
 * Full user detail with all fields
 */
export interface UserDetail extends UserListItem {
  // Additional contact info
  firstName: string | null
  lastName: string | null
  departmentId: string | null
  positionId: string | null
  location: string | null
  timezone: 'WIB' | 'WITA' | 'WIT'
  language: 'id' | 'en'
  workPhone: string | null
  personalPhone: string | null
  alternateEmail: string | null
  address: string | null
  
  // Emergency contact
  emergencyContact: string | null
  emergencyPhone: string | null
  emergencyRelationship: string | null
  
  // Security info
  twoFactorEnabled: boolean
  lastPasswordChange: DateTime | null
  failedLoginAttempts: number
  lockedUntil: DateTime | null
  lastIpAddress: string | null
  isEmailVerified: boolean
  isPhoneVerified: boolean
  securityLevel: number
  
  // Session info
  lastActiveModule: string | null
  sessionCount: number
}

/**
 * Input for creating new user
 */
export interface CreateUserInput {
  // Required fields
  email: string
  name: string
  password: string
  userType: UserType
  userRole: UserRole
  
  // Optional contact fields
  phone?: string
  firstName?: string
  lastName?: string
  departmentId?: string | null
  positionId?: string | null
  
  // Optional settings
  timezone?: 'WIB' | 'WITA' | 'WIT'
  language?: 'id' | 'en'
  isActive?: boolean
}

/**
 * Input for updating user
 */
export interface UpdateUserInput {
  // Editable fields
  name?: string
  phone?: string
  firstName?: string
  lastName?: string
  departmentId?: string | null
  positionId?: string | null
  location?: string
  timezone?: 'WIB' | 'WITA' | 'WIT'
  language?: 'id' | 'en'
  workPhone?: string
  personalPhone?: string
  alternateEmail?: string
  address?: string
  
  // Emergency contact
  emergencyContact?: string
  emergencyPhone?: string
  emergencyRelationship?: string
  
  // Role can be changed
  userRole?: UserRole
  
  // Status
  isActive?: boolean
}

/**
 * Input for password update
 */
export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Input for admin password reset
 */
export interface ResetPasswordInput {
  newPassword: string
  confirmPassword: string
}

/**
 * User filters for list queries
 */
export interface UserFilters {
  search?: string
  userRole?: UserRole
  isActive?: boolean
  sppgId?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin'
  sortOrder?: 'asc' | 'desc'
}

/**
 * User statistics
 */
export interface UserStatistics {
  total: number
  active: number
  inactive: number
  verified: number
  unverified: number
  locked: number
  byRole: Record<UserRole, number>
  byType: Record<UserType, number>
}

/**
 * User activity log item
 */
export interface UserActivityLog {
  id: string
  userId: string
  action: string
  description: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: DateTime
}

/**
 * DateTime type alias for consistency
 */
type DateTime = Date | string
