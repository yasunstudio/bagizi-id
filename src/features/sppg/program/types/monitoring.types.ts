/**
 * @fileoverview TypeScript types untuk ProgramMonitoring domain
 * @version Next.js 15.5.4 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Types untuk monitoring program gizi bulanan/mingguan
 */

import { ProgramMonitoring } from '@prisma/client'

/**
 * Base ProgramMonitoring type - Import dari Prisma untuk type safety
 */
export type Monitoring = ProgramMonitoring

/**
 * ProgramMonitoring dengan relasi User (reporter) dan Program
 */
export interface MonitoringWithRelations extends ProgramMonitoring {
  reportedBy: {
    id: string
    name: string
    email: string
    userRole: string
  }
  program: {
    id: string
    name: string
    code: string
    programType: string
  }
}

/**
 * Input untuk create monitoring report
 */
export interface CreateMonitoringInput {
  programId: string
  monitoringDate: Date | string
  reportedById: string
  
  // Quantitative Data
  mealsPlanned: number
  mealsServed: number
  recipientsPlanned: number
  recipientsServed: number
  budgetPlanned: number
  budgetSpent: number
  productionDays: number
  totalStaffHours?: number | null
  staffAttendance?: number | null
  wastePercentage?: number | null
  
  // Qualitative Data (JSON fields)
  challenges?: MonitoringChallenges | null
  achievements?: MonitoringAchievements | null
  recommendations?: MonitoringRecommendations | null
  feedback?: MonitoringFeedback | null
  
  // Quality Metrics
  nutritionCompliance?: number | null
  portionCompliance?: number | null
  hygieneScore?: number | null
  tasteScore?: number | null
  presentationScore?: number | null
  
  // Logistics
  deliveryOnTime?: number | null
  distributionEfficiency?: number | null
  storageAdequacy?: number | null
  
  // Health & Safety
  foodSafetyIncidents?: number | null
  healthInspectionScore?: number | null
  allergenManagement?: number | null
  
  // Satisfaction
  satisfactionScore?: number | null
  complaintResolution?: number | null
  
  notes?: string | null
}

/**
 * Input untuk update monitoring report
 */
export type UpdateMonitoringInput = Partial<CreateMonitoringInput>

/**
 * Filter untuk query monitoring reports
 */
export interface MonitoringFilter {
  programId?: string
  startDate?: Date | string
  endDate?: Date | string
  reportedById?: string
  page?: number
  limit?: number
}

/**
 * Calculated metrics untuk monitoring (computed on-the-fly)
 */
export interface MonitoringStats {
  // Budget metrics
  budgetUtilization: number // (budgetSpent / budgetPlanned) * 100
  savings: number // budgetPlanned - budgetSpent
  
  // Cost metrics
  costPerMeal: number // budgetSpent / mealsServed
  costPerRecipient: number // budgetSpent / recipientsServed
  
  // Production metrics
  productionEfficiency: number // (mealsServed / mealsPlanned) * 100
  servingRate: number // (recipientsServed / recipientsPlanned) * 100
  
  // Staff metrics
  hoursPerMeal?: number | null // totalStaffHours / mealsServed
  
  // Quality averages
  averageQualityScore?: number | null // Average of nutrition, portion, hygiene, taste, presentation
  averageLogisticsScore?: number | null // Average of delivery, distribution, storage
  averageHealthScore?: number | null // Average of safety, inspection, allergen
}

/**
 * JSON field types untuk structured data
 */

/**
 * Challenges structure
 */
export interface MonitoringChallenges {
  major?: Array<{
    category: 'budget' | 'staff' | 'supply' | 'logistics' | 'quality' | 'other'
    description: string
    impact: 'high' | 'medium' | 'low'
    status: 'resolved' | 'ongoing' | 'escalated'
  }>
  minor?: Array<{
    description: string
    status: 'resolved' | 'ongoing'
  }>
  resourceConstraints?: string[]
}

/**
 * Achievements structure
 */
export interface MonitoringAchievements {
  milestones?: Array<{
    title: string
    description: string
    date: string
  }>
  bestPractices?: string[]
  innovations?: Array<{
    title: string
    description: string
    impact: string
  }>
  recognitions?: string[]
}

/**
 * Recommendations structure
 */
export interface MonitoringRecommendations {
  actions?: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    description: string
    timeline: string
  }>
  resourceNeeds?: Array<{
    type: 'staff' | 'equipment' | 'training' | 'budget' | 'other'
    description: string
    urgency: 'urgent' | 'soon' | 'future'
  }>
  improvementPlans?: Array<{
    area: string
    currentState: string
    targetState: string
    steps: string[]
  }>
  nextMonthTargets?: string[]
}

/**
 * Feedback structure
 */
export interface MonitoringFeedback {
  parents?: {
    positive?: string[]
    negative?: string[]
    suggestions?: string[]
  }
  teachers?: {
    positive?: string[]
    negative?: string[]
    suggestions?: string[]
  }
  community?: {
    positive?: string[]
    concerns?: string[]
    requests?: string[]
  }
  government?: {
    complianceNotes?: string[]
    inspectionResults?: string[]
    recommendations?: string[]
  }
}

/**
 * Response type untuk API
 */
export interface MonitoringResponse extends MonitoringWithRelations {
  stats?: MonitoringStats
}

/**
 * List response dengan pagination
 */
export interface MonitoringListResponse {
  data: MonitoringResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
