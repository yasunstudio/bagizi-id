/**
 * @fileoverview Plan Form Wrapper with Navigation
 * @version Next.js 15.5.4 / Client Component
 * @author Bagizi-ID Development Team
 * 
 * PURPOSE:
 * - Client wrapper for PlanForm to handle navigation after create/update
 * - Enables redirect to detail page after successful save
 * - Maintains consistency with other CRUD patterns in the app
 */

'use client'

import { useRouter } from 'next/navigation'
import { PlanForm } from './PlanForm'

interface PlanFormData {
  id: string
  programId: string
  planName: string
  planMonth: string
  planYear: number
  planQuarter: number | null
  targetRecipients: number
  targetMeals: number
  totalBudget: number
  proteinBudget: number | null
  carbBudget: number | null
  vegetableBudget: number | null
  fruitBudget: number | null
  otherBudget: number | null
  notes: string | null
}

interface PlanFormWrapperProps {
  mode?: 'create' | 'edit'
  initialData?: PlanFormData
}

/**
 * Client wrapper for PlanForm with navigation
 * 
 * @param mode - Form mode (create or edit)
 * @param initialData - Initial form data for edit mode
 * 
 * @example
 * ```tsx
 * // Create mode
 * <PlanFormWrapper mode="create" />
 * 
 * // Edit mode
 * <PlanFormWrapper mode="edit" initialData={planData} />
 * ```
 */
export function PlanFormWrapper({
  mode = 'create',
  initialData,
}: PlanFormWrapperProps) {
  const router = useRouter()

  const handleSuccess = (planId: string) => {
    // Redirect to detail page after create/update
    router.push(`/procurement/plans/${planId}`)
  }

  return (
    <PlanForm
      mode={mode}
      initialData={initialData}
      onSuccess={handleSuccess}
    />
  )
}
