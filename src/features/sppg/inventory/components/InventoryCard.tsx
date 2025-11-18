/**
 * @fileoverview InventoryCard Component - Comprehensive Detail View
 * @description Full-featured detail card displaying complete inventory item information
 * with tabbed interface for overview, stock status, nutrition facts, and movement history.
 * Includes quick action buttons and real-time stock monitoring.
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  Package,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  User,
  Phone,
  DollarSign,
  Info,
  Activity,
  BarChart3,
  Clock,
  Tag,
  Archive,
} from 'lucide-react'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Hooks & Types
import { useInventoryItem, useDeleteInventory } from '../hooks/useInventory'
import { useStockMovements } from '../hooks/useStockMovement'
import type { InventoryItem, StockMovementDetail } from '../types'

interface InventoryCardProps {
  itemId: string
}

export function InventoryCard({ itemId }: InventoryCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Data fetching
  const { data: item, isLoading, isError, error } = useInventoryItem(itemId)
  const { data: movements } = useStockMovements({
    inventoryId: itemId,
  })

  // Mutations
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteInventory()

  // Handlers
  const handleEdit = () => {
    router.push(`/inventory/${itemId}/edit`)
  }

  const handleDelete = () => {
    deleteItem(itemId, {
      onSuccess: () => {
        router.push('/inventory')
      },
    })
  }

  const handleAddMovement = () => {
    router.push(`/inventory/stock-movements/create?itemId=${itemId}`)
  }

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Error state
  if (isError || !item) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gagal Memuat Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error?.message || 'Terjadi kesalahan saat memuat data barang inventori'}
            </p>
            <Button onClick={() => router.push('/inventory')} variant="outline">
              Kembali ke Daftar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stockPercentage = item.maxStock > 0 ? (item.currentStock / item.maxStock) * 100 : 0
  const stockStatus = getStockStatus(item)
  const recentMovements = movements?.slice(0, 5) || []

  return (
    <>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{item.itemName}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-3">
                    {item.itemCode && (
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {item.itemCode}
                      </span>
                    )}
                    {item.brand && (
                      <span className="flex items-center gap-1">
                        <Archive className="h-3 w-3" />
                        {item.brand}
                      </span>
                    )}
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.icon}
                      {stockStatus.label}
                    </Badge>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </CardDescription>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button onClick={handleAddMovement} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Stok
                </Button>
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Stock Level Progress */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Stok Saat Ini</span>
                <span className="text-muted-foreground">
                  {item.currentStock} / {item.maxStock} {item.unit}
                </span>
              </div>
              <Progress value={stockPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: {item.minStock} {item.unit}</span>
                <span>{stockPercentage.toFixed(1)}%</span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  <Info className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="stock">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Status Stok
                </TabsTrigger>
                <TabsTrigger value="nutrition">
                  <Activity className="h-4 w-4 mr-2" />
                  Nutrisi
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="h-4 w-4 mr-2" />
                  Riwayat
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <OverviewSection item={item} />
              </TabsContent>

              {/* Stock Status Tab */}
              <TabsContent value="stock" className="space-y-6">
                <StockStatusSection item={item} />
              </TabsContent>

              {/* Nutrition Tab */}
              <TabsContent value="nutrition" className="space-y-6">
                <NutritionSection item={item} />
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <HistorySection movements={recentMovements} itemId={itemId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Barang Inventori?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus barang <strong>{item.itemName}</strong>. Tindakan ini tidak dapat
              dibatalkan dan akan menghapus semua data terkait termasuk riwayat stok.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * Overview Section Component
 */
function OverviewSection({ item }: { item: InventoryItem }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Informasi Dasar
        </h3>
        <Separator />
        <div className="space-y-3">
          <InfoRow label="Kategori" value={formatCategory(item.category)} />
          <InfoRow label="Satuan" value={item.unit} />
          {item.itemCode && <InfoRow label="Kode Barang" value={item.itemCode} />}
          {item.brand && <InfoRow label="Merek" value={item.brand} />}
          <InfoRow
            label="Status"
            value={
              <Badge variant={item.isActive ? 'default' : 'secondary'}>
                {item.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            }
          />
        </div>
      </div>

      {/* Storage Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Informasi Penyimpanan
        </h3>
        <Separator />
        <div className="space-y-3">
          <InfoRow label="Lokasi Penyimpanan" value={item.storageLocation} />
          {item.storageCondition && (
            <InfoRow label="Kondisi Penyimpanan" value={item.storageCondition} />
          )}
          {item.shelfLife && <InfoRow label="Masa Simpan" value={`${item.shelfLife} hari`} />}
          <InfoRow
            label="Memiliki Tanggal Kedaluwarsa"
            value={item.hasExpiry ? 'Ya' : 'Tidak'}
          />
        </div>
      </div>

      {/* Supplier Information */}
      {(item.legacySupplierName || item.supplierContact || item.preferredSupplier) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Informasi Supplier
          </h3>
          <Separator />
          <div className="space-y-3">
            {item.legacySupplierName && (
              <InfoRow label="Nama Supplier" value={item.legacySupplierName} />
            )}
            {item.supplierContact && (
              <InfoRow
                label="Kontak"
                value={
                  <span className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {item.supplierContact}
                  </span>
                }
              />
            )}
            {item.leadTime && <InfoRow label="Lead Time" value={`${item.leadTime} hari`} />}
          </div>
        </div>
      )}

      {/* Pricing Information */}
      {(item.lastPrice || item.averagePrice || item.costPerUnit) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Informasi Harga
          </h3>
          <Separator />
          <div className="space-y-3">
            {item.lastPrice && (
              <InfoRow label="Harga Terakhir" value={formatCurrency(item.lastPrice)} />
            )}
            {item.averagePrice && (
              <InfoRow label="Harga Rata-rata" value={formatCurrency(item.averagePrice)} />
            )}
            {item.costPerUnit && (
              <InfoRow label="Biaya per Unit" value={formatCurrency(item.costPerUnit)} />
            )}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="space-y-4 md:col-span-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Informasi Waktu
        </h3>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoRow
            label="Dibuat"
            value={format(new Date(item.createdAt), 'dd MMMM yyyy HH:mm', { locale: localeId })}
          />
          <InfoRow
            label="Diperbarui"
            value={format(new Date(item.updatedAt), 'dd MMMM yyyy HH:mm', { locale: localeId })}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Stock Status Section Component
 */
function StockStatusSection({ item }: { item: InventoryItem }) {
  const stockPercentage = item.maxStock > 0 ? (item.currentStock / item.maxStock) * 100 : 0
  const stockStatus = getStockStatus(item)
  const needsReorder = item.currentStock <= item.minStock

  return (
    <div className="space-y-6 pt-4">
      {/* Stock Level Card */}
      <Card className={needsReorder ? 'border-destructive' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {stockStatus.icon}
            Status Stok: {stockStatus.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Minimum</p>
              <p className="text-2xl font-bold text-orange-500">
                {item.minStock} {item.unit}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Saat Ini</p>
              <p className="text-3xl font-bold">{item.currentStock} {item.unit}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Maximum</p>
              <p className="text-2xl font-bold text-green-500">
                {item.maxStock} {item.unit}
              </p>
            </div>
          </div>

          <Progress value={stockPercentage} className="h-3" />

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0 {item.unit}</span>
            <span className="font-medium">{stockPercentage.toFixed(1)}% Terisi</span>
            <span>{item.maxStock} {item.unit}</span>
          </div>
        </CardContent>
      </Card>

      {/* Reorder Information */}
      {item.reorderQuantity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Informasi Pemesanan Ulang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Kuantitas Pesan Ulang" value={`${item.reorderQuantity} ${item.unit}`} />
            {item.leadTime && <InfoRow label="Lead Time" value={`${item.leadTime} hari kerja`} />}
            {needsReorder && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive font-medium">
                  Stok di bawah minimum! Segera lakukan pemesanan ulang.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stock Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status Ketersediaan</p>
                <p className="text-lg font-semibold">
                  {item.currentStock > 0 ? 'Tersedia' : 'Stok Habis'}
                </p>
              </div>
              {item.currentStock > 0 ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Perlu Pesan Ulang</p>
                <p className="text-lg font-semibold">{needsReorder ? 'Ya' : 'Tidak'}</p>
              </div>
              {needsReorder ? (
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Nutrition Section Component
 */
function NutritionSection({ item }: { item: InventoryItem }) {
  const hasNutrition =
    item.calories !== null ||
    item.protein !== null ||
    item.carbohydrates !== null ||
    item.fat !== null ||
    item.fiber !== null

  if (!hasNutrition) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Informasi Nutrisi Tidak Tersedia</h3>
        <p className="text-sm text-muted-foreground">
          Barang ini tidak memiliki informasi nilai gizi.
        </p>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Fakta Nutrisi (per 100g)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nutrisi</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Satuan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.calories !== null && (
                <TableRow>
                  <TableCell className="font-medium">Kalori</TableCell>
                  <TableCell className="text-right">{item.calories}</TableCell>
                  <TableCell className="text-right">kal</TableCell>
                </TableRow>
              )}
              {item.protein !== null && (
                <TableRow>
                  <TableCell className="font-medium">Protein</TableCell>
                  <TableCell className="text-right">{item.protein}</TableCell>
                  <TableCell className="text-right">g</TableCell>
                </TableRow>
              )}
              {item.carbohydrates !== null && (
                <TableRow>
                  <TableCell className="font-medium">Karbohidrat</TableCell>
                  <TableCell className="text-right">{item.carbohydrates}</TableCell>
                  <TableCell className="text-right">g</TableCell>
                </TableRow>
              )}
              {item.fat !== null && (
                <TableRow>
                  <TableCell className="font-medium">Lemak</TableCell>
                  <TableCell className="text-right">{item.fat}</TableCell>
                  <TableCell className="text-right">g</TableCell>
                </TableRow>
              )}
              {item.fiber !== null && (
                <TableRow>
                  <TableCell className="font-medium">Serat</TableCell>
                  <TableCell className="text-right">{item.fiber}</TableCell>
                  <TableCell className="text-right">g</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * History Section Component
 */
function HistorySection({
  movements,
  itemId,
}: {
  movements: StockMovementDetail[]
  itemId: string
}) {
  const router = useRouter()

  if (!movements || movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Belum Ada Riwayat Stok</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Belum ada pergerakan stok untuk barang ini.
        </p>
        <Button onClick={() => router.push(`/inventory/stock-movements/create?itemId=${itemId}`)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pergerakan Stok
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Riwayat Pergerakan Stok (5 Terakhir)</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/inventory/stock-movements?itemId=${itemId}`)}
        >
          Lihat Semua
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Kuantitas</TableHead>
              <TableHead>Referensi</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="text-sm">
                  {format(new Date(movement.movedAt), 'dd MMM yyyy', { locale: localeId })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      movement.movementType === 'IN'
                        ? 'default'
                        : movement.movementType === 'OUT'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {movement.movementType === 'IN' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : movement.movementType === 'OUT' ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : (
                      <Activity className="h-3 w-3 mr-1" />
                    )}
                    {movement.movementType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {movement.movementType === 'OUT' ? '-' : '+'}
                  {movement.quantity}
                </TableCell>
                <TableCell className="text-sm">{movement.referenceNumber || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      movement.approvedAt
                        ? 'default'
                        : movement.approvedBy === null
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {movement.approvedAt ? 'APPROVED' : 'PENDING'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

/**
 * Loading Skeleton Component
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Info Row Component
 */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

/**
 * Helper Functions
 */
function getStockStatus(item: InventoryItem) {
  if (item.currentStock === 0) {
    return {
      label: 'Habis',
      variant: 'destructive' as const,
      icon: <XCircle className="h-4 w-4" />,
    }
  }

  if (item.currentStock <= item.minStock) {
    return {
      label: 'Rendah',
      variant: 'destructive' as const,
      icon: <AlertTriangle className="h-4 w-4" />,
    }
  }

  if (item.currentStock >= item.maxStock) {
    return {
      label: 'Penuh',
      variant: 'default' as const,
      icon: <CheckCircle className="h-4 w-4" />,
    }
  }

  return {
    label: 'Normal',
    variant: 'secondary' as const,
    icon: <CheckCircle className="h-4 w-4" />,
  }
}

function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    PROTEIN: 'Protein',
    KARBOHIDRAT: 'Karbohidrat',
    SAYURAN: 'Sayuran',
    BUAH: 'Buah',
    SUSU_OLAHAN: 'Susu & Olahan',
    BUMBU_REMPAH: 'Bumbu & Rempah',
    MINYAK_LEMAK: 'Minyak & Lemak',
    LAINNYA: 'Lainnya',
  }
  return labels[category] || category
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
