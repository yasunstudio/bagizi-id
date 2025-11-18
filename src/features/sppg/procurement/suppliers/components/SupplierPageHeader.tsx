/**
 * @fileoverview Supplier Page Header Component
 * Professional header with title, description, and action buttons
 * 
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * FEATURES:
 * - Professional title and description
 * - Export button with download icon
 * - "Tambah Supplier" button with plus icon
 * - Responsive layout
 * - Dark mode support
 * - shadcn/ui components
 * 
 * USAGE:
 * ```typescript
 * <SupplierPageHeader />
 * ```
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Download, Plus } from 'lucide-react'

/**
 * Supplier Page Header Component
 * Displays page title, description, and primary actions
 * 
 * @component
 * @example
 * <SupplierPageHeader />
 */
export function SupplierPageHeader() {
  return (
    <div className="flex items-start justify-between">
      {/* Title and Description */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Daftar Supplier
        </h1>
        <p className="text-muted-foreground">
          Kelola data supplier dan vendor untuk pengadaan barang
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Export Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // TODO: Implement export functionality
            console.log('Export suppliers clicked')
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        {/* Add Supplier Button */}
        <Button asChild>
          <Link href="/procurement/suppliers/new">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Supplier
          </Link>
        </Button>
      </div>
    </div>
  )
}
