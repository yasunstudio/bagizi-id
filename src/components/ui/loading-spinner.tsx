/**
 * @fileoverview Loading Spinner Component
 * @version shadcn/ui compatible
 * @author Bagizi-ID Development Team
 */

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <Loader2
        className={cn(
          'animate-spin text-muted-foreground',
          size === 'sm' && 'h-4 w-4',
          size === 'md' && 'h-8 w-8',
          size === 'lg' && 'h-12 w-12',
          className
        )}
      />
    </div>
  )
}
