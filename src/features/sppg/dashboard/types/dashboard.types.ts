/**
 * @fileoverview Dashboard feature types - SPPG dashboard data types
 * @version Next.js 15.5.4 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

export interface DashboardStats {
  activePrograms?: {
    current: number
    newThisWeek: number
    percentage: number
  }
  activeMenus: {
    current: number
    newThisWeek: number
    percentage?: number
  }
  totalBeneficiaries: {
    current: number // Total members from all organizations
    organizations: number // Total number of beneficiary organizations
    newOrganizations: number // New organizations this week
    byType?: Record<string, number> // Count by organization type (SD, SMP, POSYANDU, etc)
    percentage: number
    change?: number
    trend?: 'up' | 'down' | 'stable'
  }
  pendingDistributions?: {
    current: number
    completedThisWeek: number
    percentage: number
  }
  todayDistribution?: {
    current: number
    targetAchievement: number
  }
  budgetUtilization?: {
    percentage: number
    spent: number
    remaining: number
    total: number
  }
  monthlyBudget?: {
    total: number
    used: number
    percentage: number
  }
}

export interface QuickAction {
  id: string
  title: string
  href: string
  icon: string
  description?: string
}

export interface ActivityItem {
  id: string
  type: 'menu' | 'distribution' | 'procurement' | 'production'
  title: string
  description: string
  timestamp: string
  actor: string
  badge: string
  status: 'success' | 'warning' | 'error' | 'info'
}

export interface NotificationItem {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface DashboardData {
  stats: DashboardStats
  quickActions: QuickAction[]
  recentActivities: ActivityItem[]
  notifications: NotificationItem[]
  lastUpdated: string
}

export type DashboardMetric = keyof DashboardStats