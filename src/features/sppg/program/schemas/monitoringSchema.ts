/**
 * @fileoverview Zod validation schemas untuk ProgramMonitoring domain
 * @version Next.js 15.5.4 / Zod 3.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { z } from 'zod'

/**
 * Schema untuk challenges JSON field
 */
const challengesSchema = z.object({
  major: z.array(z.object({
    category: z.enum(['budget', 'staff', 'supply', 'logistics', 'quality', 'other']),
    description: z.string().min(1, 'Deskripsi challenge diperlukan'),
    impact: z.enum(['high', 'medium', 'low']),
    status: z.enum(['resolved', 'ongoing', 'escalated'])
  })).optional(),
  minor: z.array(z.object({
    description: z.string().min(1, 'Deskripsi diperlukan'),
    status: z.enum(['resolved', 'ongoing'])
  })).optional(),
  resourceConstraints: z.array(z.string()).optional()
}).optional().nullable()

/**
 * Schema untuk achievements JSON field
 */
const achievementsSchema = z.object({
  milestones: z.array(z.object({
    title: z.string().min(1, 'Judul milestone diperlukan'),
    description: z.string().min(1, 'Deskripsi diperlukan'),
    date: z.string() // ISO date string
  })).optional(),
  bestPractices: z.array(z.string()).optional(),
  innovations: z.array(z.object({
    title: z.string().min(1, 'Judul inovasi diperlukan'),
    description: z.string().min(1, 'Deskripsi diperlukan'),
    impact: z.string().min(1, 'Dampak diperlukan')
  })).optional(),
  recognitions: z.array(z.string()).optional()
}).optional().nullable()

/**
 * Schema untuk recommendations JSON field
 */
const recommendationsSchema = z.object({
  actions: z.array(z.object({
    priority: z.enum(['high', 'medium', 'low']),
    category: z.string().min(1, 'Kategori diperlukan'),
    description: z.string().min(1, 'Deskripsi diperlukan'),
    timeline: z.string().min(1, 'Timeline diperlukan')
  })).optional(),
  resourceNeeds: z.array(z.object({
    type: z.enum(['staff', 'equipment', 'training', 'budget', 'other']),
    description: z.string().min(1, 'Deskripsi diperlukan'),
    urgency: z.enum(['urgent', 'soon', 'future'])
  })).optional(),
  improvementPlans: z.array(z.object({
    area: z.string().min(1, 'Area diperlukan'),
    currentState: z.string().min(1, 'Status saat ini diperlukan'),
    targetState: z.string().min(1, 'Target status diperlukan'),
    steps: z.array(z.string())
  })).optional(),
  nextMonthTargets: z.array(z.string()).optional()
}).optional().nullable()

/**
 * Schema untuk feedback JSON field
 */
const feedbackSchema = z.object({
  parents: z.object({
    positive: z.array(z.string()).optional(),
    negative: z.array(z.string()).optional(),
    suggestions: z.array(z.string()).optional()
  }).optional(),
  teachers: z.object({
    positive: z.array(z.string()).optional(),
    negative: z.array(z.string()).optional(),
    suggestions: z.array(z.string()).optional()
  }).optional(),
  community: z.object({
    positive: z.array(z.string()).optional(),
    concerns: z.array(z.string()).optional(),
    requests: z.array(z.string()).optional()
  }).optional(),
  government: z.object({
    complianceNotes: z.array(z.string()).optional(),
    inspectionResults: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional()
  }).optional()
}).optional().nullable()

/**
 * Schema untuk create monitoring report
 */
export const createMonitoringSchema = z.object({
  programId: z.string().cuid('Program ID tidak valid'),
  
  monitoringDate: z.coerce.date({
    message: 'Tanggal monitoring diperlukan dan harus valid'
  }),
  
  reportedById: z.string().cuid('Reporter ID tidak valid'),
  
  reportingWeek: z
    .number()
    .int('Reporting week harus berupa bilangan bulat')
    .min(1, 'Week minimal 1')
    .max(5, 'Week maksimal 5')
    .optional()
    .nullable(),
  
  // === BENEFICIARY METRICS ===
  targetRecipients: z
    .number()
    .int('Target recipients harus berupa bilangan bulat')
    .min(0, 'Target recipients tidak boleh negatif'),
  
  enrolledRecipients: z
    .number()
    .int('Enrolled recipients harus berupa bilangan bulat')
    .min(0, 'Enrolled recipients tidak boleh negatif'),
  
  activeRecipients: z
    .number()
    .int('Active recipients harus berupa bilangan bulat')
    .min(0, 'Active recipients tidak boleh negatif'),
  
  dropoutCount: z
    .number()
    .int('Dropout count harus berupa bilangan bulat')
    .min(0, 'Dropout count tidak boleh negatif'),
  
  newEnrollments: z
    .number()
    .int('New enrollments harus berupa bilangan bulat')
    .min(0, 'New enrollments tidak boleh negatif'),
  
  attendanceRate: z
    .number()
    .min(0, 'Attendance rate tidak boleh negatif')
    .max(100, 'Attendance rate maksimal 100%'),
  
  assessmentsCompleted: z
    .number()
    .int('Assessments completed harus berupa bilangan bulat')
    .min(0, 'Assessments completed tidak boleh negatif')
    .default(0),
  
  improvedNutrition: z
    .number()
    .int('Improved nutrition harus berupa bilangan bulat')
    .min(0, 'Improved nutrition tidak boleh negatif')
    .default(0),
  
  stableNutrition: z
    .number()
    .int('Stable nutrition harus berupa bilangan bulat')
    .min(0, 'Stable nutrition tidak boleh negatif')
    .default(0),
  
  worsenedNutrition: z
    .number()
    .int('Worsened nutrition harus berupa bilangan bulat')
    .min(0, 'Worsened nutrition tidak boleh negatif')
    .default(0),
  
  criticalCases: z
    .number()
    .int('Critical cases harus berupa bilangan bulat')
    .min(0, 'Critical cases tidak boleh negatif')
    .default(0),
  
  feedingDaysPlanned: z
    .number()
    .int('Feeding days planned harus berupa bilangan bulat')
    .min(1, 'Feeding days planned minimal 1')
    .max(31, 'Feeding days planned maksimal 31'),
  
  feedingDaysCompleted: z
    .number()
    .int('Feeding days completed harus berupa bilangan bulat')
    .min(0, 'Feeding days completed tidak boleh negatif')
    .max(31, 'Feeding days completed maksimal 31'),
  
  menuVariety: z
    .number()
    .int('Menu variety harus berupa bilangan bulat')
    .min(0, 'Menu variety tidak boleh negatif'),
  
  stockoutDays: z
    .number()
    .int('Stockout days harus berupa bilangan bulat')
    .min(0, 'Stockout days tidak boleh negatif'),
  
  qualityIssues: z
    .number()
    .int('Quality issues harus berupa bilangan bulat')
    .min(0, 'Quality issues tidak boleh negatif'),
  
  totalMealsProduced: z
    .number()
    .int('Total meals produced harus berupa bilangan bulat')
    .min(0, 'Total meals produced tidak boleh negatif'),
  
  totalMealsDistributed: z
    .number()
    .int('Total meals distributed harus berupa bilangan bulat')
    .min(0, 'Total meals distributed tidak boleh negatif'),
  
  wastePercentage: z
    .number()
    .min(0, 'Waste percentage tidak boleh negatif')
    .max(100, 'Waste percentage maksimal 100%')
    .optional()
    .nullable(),
  
  // === BUDGET ===
  budgetAllocated: z
    .number()
    .min(0, 'Budget allocated tidak boleh negatif'),
  
  budgetUtilized: z
    .number()
    .min(0, 'Budget utilized tidak boleh negatif'),
  
  // === QUALITY & SATISFACTION ===
  avgQualityScore: z
    .number()
    .min(0, 'Score minimal 0')
    .max(100, 'Score maksimal 100')
    .optional()
    .nullable(),
  
  customerSatisfaction: z
    .number()
    .min(0, 'Score minimal 0')
    .max(100, 'Score maksimal 100')
    .optional()
    .nullable(),
  
  complaintCount: z
    .number()
    .int('Complaint count harus berupa bilangan bulat')
    .min(0, 'Complaint count tidak boleh negatif')
    .default(0),
  
  complimentCount: z
    .number()
    .int('Compliment count harus berupa bilangan bulat')
    .min(0, 'Compliment count tidak boleh negatif')
    .default(0),
  
  foodSafetyIncidents: z
    .number()
    .int('Food safety incidents harus berupa bilangan bulat')
    .min(0, 'Food safety incidents tidak boleh negatif')
    .default(0),
  
  hygieneScore: z
    .number()
    .min(0, 'Score minimal 0')
    .max(100, 'Score maksimal 100')
    .optional()
    .nullable(),
  
  temperatureCompliance: z
    .number()
    .min(0, 'Score minimal 0')
    .max(100, 'Score maksimal 100')
    .optional()
    .nullable(),
  
  // === HUMAN RESOURCES ===
  staffAttendance: z
    .number()
    .min(0, 'Staff attendance tidak boleh negatif')
    .max(100, 'Staff attendance maksimal 100%')
    .optional()
    .nullable(),
  
  trainingCompleted: z
    .number()
    .int('Training completed harus berupa bilangan bulat')
    .min(0, 'Training completed tidak boleh negatif')
    .default(0),
  
  // === QUALITATIVE DATA (JSON fields) ===
  challenges: challengesSchema,
  achievements: achievementsSchema,
  recommendations: recommendationsSchema,
  feedback: feedbackSchema,
})
.refine(
  (data) => data.totalMealsDistributed <= data.totalMealsProduced,
  {
    message: 'Meals distributed tidak boleh lebih dari meals produced',
    path: ['totalMealsDistributed']
  }
)
.refine(
  (data) => data.activeRecipients <= data.enrolledRecipients,
  {
    message: 'Active recipients tidak boleh lebih dari enrolled recipients',
    path: ['activeRecipients']
  }
)
.refine(
  (data) => data.budgetUtilized <= data.budgetAllocated * 1.2, // Allow 20% over budget
  {
    message: 'Budget utilized tidak boleh melebihi 120% dari budget allocated',
    path: ['budgetUtilized']
  }
)

/**
 * Schema untuk update monitoring report
 */
export const updateMonitoringSchema = createMonitoringSchema.partial().omit({
  programId: true,
  reportedById: true
})

/**
 * Schema untuk filter monitoring reports
 */
export const monitoringFilterSchema = z.object({
  programId: z.string().cuid('Program ID tidak valid').optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  reportedById: z.string().cuid('Reporter ID tidak valid').optional(),
  page: z.coerce.number().int().min(1, 'Page minimal 1').optional().default(1),
  limit: z.coerce.number().int().min(1, 'Limit minimal 1').max(100, 'Limit maksimal 100').optional().default(10)
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate
    }
    return true
  },
  {
    message: 'Start date harus sebelum atau sama dengan end date',
    path: ['startDate']
  }
)

/**
 * Type inference untuk TypeScript
 */
export type CreateMonitoringInput = z.infer<typeof createMonitoringSchema>
export type UpdateMonitoringInput = z.infer<typeof updateMonitoringSchema>
export type MonitoringFilterInput = z.infer<typeof monitoringFilterSchema>
