/**
 * @fileoverview ProgramTypeDisplay Component - Display program type badge
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * ✅ SIMPLIFIED (Nov 11, 2025): Unified multi-target approach
 */

'use client'

import { type FC } from 'react'
import { Badge } from '@/components/ui/badge'
import { TargetGroup } from '@prisma/client'
import { 
  getTargetGroupLabel
} from '@/lib/programValidation'
import { Users, User, CheckCircle2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ProgramTypeDisplayProps {
  allowedTargetGroups: TargetGroup[]
  variant?: 'badge' | 'text' | 'detailed'
  showIcon?: boolean
  showTooltip?: boolean
}

export const ProgramTypeDisplay: FC<ProgramTypeDisplayProps> = ({
  allowedTargetGroups,
  variant = 'badge',
  showIcon = true,
  showTooltip = true,
}) => {
  // ✅ SIMPLIFIED: Auto-detect mode from array length
  const isMultiTarget = allowedTargetGroups.length > 1
  const displayText = isMultiTarget 
    ? `Multi-Target (${allowedTargetGroups.length})`
    : 'Single-Target'
  
  const configDescription = isMultiTarget
    ? `Program untuk ${allowedTargetGroups.length} kelompok target: ${allowedTargetGroups.map(getTargetGroupLabel).join(', ')}`
    : `Program untuk: ${getTargetGroupLabel(allowedTargetGroups[0])}`

  // Determine badge variant
  const badgeVariant = isMultiTarget ? 'default' : 'outline'

  const icon = isMultiTarget ? (
    <Users className="h-3.5 w-3.5" />
  ) : (
    <User className="h-3.5 w-3.5" />
  )

  // Badge variant
  if (variant === 'badge') {
    const badge = (
      <Badge variant={badgeVariant} className="gap-1.5">
        {showIcon && icon}
        {displayText}
      </Badge>
    )

    if (showTooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {badge}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{configDescription}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return badge
  }

  // Text variant
  if (variant === 'text') {
    return (
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
        {showIcon && icon}
        {displayText}
      </span>
    )
  }

  // Detailed variant
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {showIcon && icon}
        <span className="font-medium">{displayText}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {configDescription}
      </p>
      
      {/* Show all allowed target groups */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {allowedTargetGroups.map((group) => (
          <Badge key={group} variant="outline" className="text-xs gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {getTargetGroupLabel(group)}
          </Badge>
        ))}
      </div>
    </div>
  )
}
