/**
 * @fileoverview Supplier Detail Header Component
 * @version Next.js 15.5.4
 * @description Header section with supplier name, badges, and action buttons
 * @author Bagizi-ID Development Team
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Star, 
  AlertCircle 
} from 'lucide-react'
import type { Supplier } from '@prisma/client'

interface SupplierDetailHeaderProps {
  supplier: Pick<Supplier, 
    | 'id'
    | 'supplierName' 
    | 'supplierCode' 
    | 'isActive' 
    | 'isPreferred' 
    | 'isBlacklisted'
  >
  onDelete?: () => void
}

export function SupplierDetailHeader({ 
  supplier, 
  onDelete 
}: SupplierDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Left: Back button + Supplier info */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/procurement/suppliers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
        
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {supplier.supplierName}
            </h1>
            
            {/* Status Badge */}
            <Badge 
              variant={supplier.isActive ? 'default' : 'secondary'}
              className={supplier.isActive ? 'bg-green-500' : 'bg-gray-500'}
            >
              {supplier.isActive ? 'Aktif' : 'Tidak Aktif'}
            </Badge>
            
            {/* Preferred Badge */}
            {supplier.isPreferred && (
              <Badge 
                variant="secondary" 
                className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
              >
                <Star className="mr-1 h-3 w-3 fill-current" />
                Preferred
              </Badge>
            )}
            
            {/* Blacklist Badge */}
            {supplier.isBlacklisted && (
              <Badge variant="destructive">
                <AlertCircle className="mr-1 h-3 w-3" />
                Blacklist
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">
            Kode Supplier: {supplier.supplierCode}
          </p>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/procurement/suppliers/${supplier.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus
        </Button>
      </div>
    </div>
  )
}
