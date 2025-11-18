/**
 * @fileoverview TargetGroupConfigBadge Component - Display target group configuration badge
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC } from 'react'
import { Badge } from '@/components/ui/badge'
import { TargetGroup } from '@prisma/client'
import { getTargetGroupLabel } from '@/lib/programValidation'
import { CheckCircle2, Users } from 'lucide-react'

interface TargetGroupConfigBadgeProps {
  targetGroups: TargetGroup[]
  variant?: 'default' | 'outline' | 'secondary'
  maxDisplay?: number
  className?: string
}

export const TargetGroupConfigBadge: FC<TargetGroupConfigBadgeProps> = ({
  targetGroups,
  variant = 'outline',
  maxDisplay = 3,
  className,
}) => {
  if (!targetGroups || targetGroups.length === 0) {
    return (
      <Badge variant="secondary" className={className}>
        <Users className="h-3 w-3 mr-1" />
        Semua Kelompok
      </Badge>
    )
  }

  // Display up to maxDisplay groups
  const displayGroups = targetGroups.slice(0, maxDisplay)
  const remainingCount = targetGroups.length - maxDisplay

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {displayGroups.map((group) => (
        <Badge key={group} variant={variant} className="text-xs gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {getTargetGroupLabel(group)}
        </Badge>
      ))}
      
      {remainingCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{remainingCount} lainnya
        </Badge>
      )}
    </div>
  )
}
