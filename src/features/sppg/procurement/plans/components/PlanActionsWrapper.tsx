/**
 * @fileoverview Plan Actions Client Wrapper
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * 
 * CLIENT COMPONENT WRAPPER:
 * - Wraps PlanActions for use in Server Components
 * - Handles client-side mutations with TanStack Query
 * - Auto-refresh parent page on success
 */

'use client'

import { useRouter } from 'next/navigation'
import { PlanActions } from './PlanActions'
import type { PlanApprovalStatus } from '../types'

interface PlanActionsWrapperProps {
  planId: string
  currentStatus: PlanApprovalStatus | string
}

export function PlanActionsWrapper({ planId, currentStatus }: PlanActionsWrapperProps) {
  const router = useRouter()

  const handleActionComplete = () => {
    router.refresh()
  }

  return (
    <PlanActions
      planId={planId}
      currentStatus={currentStatus}
      onActionComplete={handleActionComplete}
    />
  )
}
