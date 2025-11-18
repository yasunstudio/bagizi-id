/**
 * @fileoverview Supplier Basic Information Component
 * @version Next.js 15.5.4
 * @description Display general supplier details
 * @author Bagizi-ID Development Team
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'
import type { Supplier } from '@prisma/client'

interface SupplierBasicInfoProps {
  supplier: Pick<Supplier,
    | 'supplierName'
    | 'businessName'
    | 'supplierCode'
    | 'supplierType'
    | 'category'
    | 'partnershipLevel'
  >
}

export function SupplierBasicInfo({ supplier }: SupplierBasicInfoProps) {
  // Supplier Type Labels
  const supplierTypeLabels: Record<string, string> = {
    LOCAL: 'Lokal',
    REGIONAL: 'Regional',
    NATIONAL: 'Nasional',
    INTERNATIONAL: 'Internasional',
    COOPERATIVE: 'Koperasi',
    INDIVIDUAL: 'Perorangan',
  }

  // Partnership Level Labels
  const partnershipLevelLabels: Record<string, string> = {
    STRATEGIC: 'Strategis',
    PREFERRED: 'Preferred',
    STANDARD: 'Standard',
  }

  // Partnership Level Colors
  const partnershipLevelColors: Record<string, string> = {
    STRATEGIC: 'bg-purple-500/10 text-purple-600',
    PREFERRED: 'bg-blue-500/10 text-blue-600',
    STANDARD: 'bg-gray-500/10 text-gray-600',
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Informasi Dasar</CardTitle>
        </div>
        <CardDescription>Data umum supplier</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nama Supplier</p>
            <p className="font-medium mt-1">{supplier.supplierName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nama Bisnis</p>
            <p className="font-medium mt-1">{supplier.businessName || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Kode Supplier</p>
            <p className="font-medium mt-1">{supplier.supplierCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tipe Supplier</p>
            <Badge variant="outline" className="mt-1">
              {supplierTypeLabels[supplier.supplierType]}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Kategori</p>
            <p className="font-medium mt-1">{supplier.category}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Level Partnership</p>
            <Badge 
              variant="secondary" 
              className={partnershipLevelColors[supplier.partnershipLevel]}
            >
              {partnershipLevelLabels[supplier.partnershipLevel]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
