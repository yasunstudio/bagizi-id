/**
 * @fileoverview Auto-Approve Badge Component
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * 
 * Display auto-approve status and threshold information
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Zap, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

interface AutoApproveBadgeProps {
  /** Is order auto-approved */
  isAutoApproved: boolean
  /** Order total amount */
  totalAmount: number
  /** Auto-approve threshold */
  threshold?: number
  /** Show tooltip with details */
  showTooltip?: boolean
  className?: string
}

// ================================ COMPONENT ================================

export function AutoApproveBadge({
  isAutoApproved,
  totalAmount,
  threshold = 5000000, // Default 5 juta
  showTooltip = true,
  className,
}: AutoApproveBadgeProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (!isAutoApproved) {
    return null
  }

  const badge = (
    <Badge
      variant="default"
      className={cn(
        'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
        className
      )}
    >
      <Zap className="mr-1 h-3 w-3" />
      Auto-Approved
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Auto-Approve Aktif</p>
                <p className="text-xs text-muted-foreground">
                  Order ini disetujui otomatis karena nilai di bawah threshold
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
              <div>
                <span className="text-muted-foreground">Threshold:</span>
                <p className="font-medium">{formatCurrency(threshold)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Order:</span>
                <p className="font-medium">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
