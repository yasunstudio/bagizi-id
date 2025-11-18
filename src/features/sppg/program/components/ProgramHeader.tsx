/**
 * @fileoverview Program Page Header Component
 * Page title, description, and action buttons
 * 
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * FEATURES:
 * - Page title and description
 * - "Buat Program" action button
 * - Responsive design
 * - Dark mode support
 * 
 * USAGE:
 * ```typescript
 * <ProgramHeader />
 * ```
 */

'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Program Header Component
 * Displays page title, description, and create button
 * 
 * @component
 * 
 * @example
 * ```typescript
 * <ProgramHeader />
 * ```
 */
export function ProgramHeader() {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Program Gizi</h1>
          <p className="text-sm text-muted-foreground mt-1 md:mt-2">
            Kelola program pemenuhan gizi untuk berbagai kelompok sasaran
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="default" className="md:size-lg">
            <Link href="/program/new">
              <Plus className="mr-2 h-4 w-4" />
              Buat Program
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
