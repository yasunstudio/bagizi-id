/**
 * @fileoverview Receipt Card Component
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Package,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ClipboardCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReceiptListItem } from '../types'
import {
  formatCurrency,
  formatDeliveryDate,
  getDeliveryStatusLabel,
  getDeliveryStatusVariant,
  getQualityGradeLabel,
  getQualityGradeVariant,
  getQualityGradeColor
} from '../lib'

// ================================ TYPES ================================

interface ReceiptCardProps {
  receipt: ReceiptListItem
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onQualityControl?: (id: string) => void
  className?: string
}

// ================================ COMPONENT ================================

export const ReceiptCard: FC<ReceiptCardProps> = ({
  receipt,
  onView,
  onEdit,
  onDelete,
  onQualityControl,
  className,
}) => {
  const needsQC = !receipt.inspectedBy && receipt.deliveryStatus === 'DELIVERED'

  return (
    <Card className={cn(
      'group hover:shadow-lg transition-all duration-200',
      'dark:hover:shadow-xl dark:hover:shadow-primary/5',
      needsQC && 'border-yellow-500/50 bg-yellow-500/5',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg text-foreground">
                {receipt.procurementCode}
              </h3>
            </div>
            
            {receipt.receiptNumber && (
              <p className="text-sm text-muted-foreground">
                No. Terima: {receipt.receiptNumber}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getDeliveryStatusVariant(receipt.deliveryStatus)}>
              {getDeliveryStatusLabel(receipt.deliveryStatus)}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu aksi</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {onView && (
                  <DropdownMenuItem asChild>
                    <Link href={`/procurement/receipts/${receipt.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {onQualityControl && needsQC && (
                  <DropdownMenuItem onClick={() => onQualityControl(receipt.id)}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Quality Control
                  </DropdownMenuItem>
                )}
                
                {onEdit && (
                  <DropdownMenuItem asChild>
                    <Link href={`/procurement/receipts/${receipt.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(receipt.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Supplier */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Supplier:</span>
          <span className="font-medium">{receipt.supplierName || '-'}</span>
        </div>

        {/* Delivery Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Diterima:</span>
          <span className="font-medium">
            {formatDeliveryDate(receipt.actualDelivery, null)}
          </span>
        </div>

        {/* Total Amount */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold text-lg">
            {formatCurrency(receipt.totalAmount)}
          </span>
        </div>

        {/* Quality Grade */}
        <div className="flex items-center gap-2 text-sm">
          {receipt.qualityGrade ? (
            <>
              <CheckCircle2 className={cn('h-4 w-4', getQualityGradeColor(receipt.qualityGrade))} />
              <span className="text-muted-foreground">Kualitas:</span>
              <Badge variant={getQualityGradeVariant(receipt.qualityGrade)}>
                {getQualityGradeLabel(receipt.qualityGrade)}
              </Badge>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Kualitas:</span>
              <Badge variant="outline">Belum Dinilai</Badge>
            </>
          )}
        </div>

        {/* Inspector */}
        {receipt.inspectedBy && (
          <div className="flex items-center gap-2 text-sm">
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Diperiksa:</span>
            <span className="font-medium">{receipt.inspectedBy}</span>
          </div>
        )}

        {/* Needs QC Alert */}
        {needsQC && (
          <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <ClipboardCheck className="h-3 w-3" />
              Memerlukan Quality Control
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/procurement/receipts/${receipt.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat Detail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
