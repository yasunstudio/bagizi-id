/**
 * @fileoverview Supplier Card Component - Modular & Robust
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC } from 'react'
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react'

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
import { cn } from '@/lib/utils'
import type { Supplier } from '@/features/sppg/procurement/suppliers/types'

// ================================ TYPES ================================

interface SupplierCardProps {
  supplier: Supplier
  variant?: 'default' | 'compact' | 'detailed'
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleStatus?: (id: string, isActive: boolean) => void
  onViewPerformance?: (id: string) => void
  className?: string
}

// ================================ UTILITIES ================================

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return 'text-green-600 dark:text-green-400'
  if (rating >= 4.0) return 'text-emerald-600 dark:text-emerald-400'
  if (rating >= 3.5) return 'text-yellow-600 dark:text-yellow-400'
  if (rating >= 3.0) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

const getReliabilityBadge = (score: number | null | undefined) => {
  if (!score) return { label: 'Belum ada', variant: 'secondary' as const, icon: AlertTriangle }
  
  if (score >= 90) return { label: 'Sangat Andal', variant: 'default' as const, icon: CheckCircle }
  if (score >= 75) return { label: 'Andal', variant: 'default' as const, icon: CheckCircle }
  if (score >= 60) return { label: 'Cukup Andal', variant: 'secondary' as const, icon: AlertTriangle }
  return { label: 'Kurang Andal', variant: 'destructive' as const, icon: XCircle }
}

// ================================ COMPONENT ================================

export const SupplierCard: FC<SupplierCardProps> = ({
  supplier,
  variant = 'default',
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewPerformance,
  className,
}) => {
  const reliabilityBadge = getReliabilityBadge(supplier.deliveryRating * 20)
  const ReliabilityIcon = reliabilityBadge.icon

  return (
    <Card className={cn(
      'group hover:shadow-lg transition-all duration-200',
      'dark:hover:shadow-xl dark:hover:shadow-primary/5',
      !supplier.isActive && 'opacity-60 border-dashed',
      supplier.isBlacklisted && 'border-destructive/50 bg-destructive/5',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                {supplier.supplierName}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {supplier.supplierType}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {supplier.isBlacklisted ? (
              <Badge variant="destructive" className="shrink-0">
                <XCircle className="h-3 w-3 mr-1" />
                Blacklist
              </Badge>
            ) : supplier.isActive ? (
              <Badge variant="default" className="shrink-0 bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Aktif
              </Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0">
                Nonaktif
              </Badge>
            )}

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
                  <DropdownMenuItem onClick={() => onView(supplier.id)}>
                    Lihat Detail
                  </DropdownMenuItem>
                )}
                
                {onViewPerformance && (
                  <DropdownMenuItem onClick={() => onViewPerformance(supplier.id)}>
                    Lihat Kinerja
                  </DropdownMenuItem>
                )}
                
                {onEdit && !supplier.isBlacklisted && (
                  <DropdownMenuItem onClick={() => onEdit(supplier.id)}>
                    Edit
                  </DropdownMenuItem>
                )}
                
                {onToggleStatus && !supplier.isBlacklisted && (
                  <DropdownMenuItem 
                    onClick={() => onToggleStatus(supplier.id, !supplier.isActive)}
                  >
                    {supplier.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </DropdownMenuItem>
                )}
                
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(supplier.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      Hapus
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Compact variant */}
        {variant === 'compact' && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Star className={cn('h-4 w-4', getRatingColor(supplier.overallRating || 0))} />
              <span className="font-semibold">{supplier.overallRating?.toFixed(1) || 'N/A'}</span>
            </div>
            <Badge variant={reliabilityBadge.variant}>
              {reliabilityBadge.label}
            </Badge>
          </div>
        )}

        {/* Default variant */}
        {variant === 'default' && (
          <div className="space-y-3">
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              {supplier.primaryContact && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{supplier.primaryContact}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{supplier.email}</span>
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  <span>Rating</span>
                </div>
                <p className={cn('font-semibold text-lg', getRatingColor(supplier.overallRating || 0))}>
                  {supplier.overallRating?.toFixed(1) || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Keandalan</span>
                </div>
                <div>
                  <Badge variant={reliabilityBadge.variant} className="text-xs">
                    <ReliabilityIcon className="h-3 w-3 mr-1" />
                    {reliabilityBadge.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed variant */}
        {variant === 'detailed' && (
          <div className="space-y-3">
            {/* Contact Details */}
            <div className="space-y-2 text-sm">
              {supplier.primaryContact && (
                <div className="flex items-start gap-2">
                  <Phone className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Kontak</p>
                    <p className="font-medium">{supplier.primaryContact}</p>
                    {supplier.phone && <p className="text-muted-foreground">{supplier.phone}</p>}
                  </div>
                </div>
              )}
              
              {supplier.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium truncate">{supplier.email}</p>
                  </div>
                </div>
              )}
              
              {supplier.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Alamat</p>
                    <p className="font-medium text-sm">{supplier.address}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Star className="h-3.5 w-3.5" />
                  </div>
                  <p className={cn('font-semibold text-lg', getRatingColor(supplier.overallRating || 0))}>
                    {supplier.overallRating?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <p className="font-semibold text-lg">
                    {supplier.totalOrders || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                  <p className="font-semibold text-lg">
                    {(supplier.deliveryRating * 20).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Keandalan</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>
            Bergabung {new Date(supplier.createdAt).toLocaleDateString('id-ID', {
              month: 'short',
              year: 'numeric'
            })}
          </span>
          {supplier.lastContactDate && (
            <span>
              Kontak terakhir {new Date(supplier.lastContactDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
