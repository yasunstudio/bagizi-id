/**
 * @fileoverview Edit Order Page
 * Form page for editing existing procurement orders
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useParams, useRouter } from 'next/navigation'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'
import { OrderForm } from '@/features/sppg/procurement/orders/components'
import { useOrder } from '@/features/sppg/procurement/orders/hooks'
import { toast } from 'sonner'

// ============================================================================
// Main Page Component
// ============================================================================

function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  // Fetch order data
  const { data: order, isLoading, error } = useOrder(orderId)

  const handleSuccess = (updatedOrderId: string) => {
    toast.success('Order berhasil diperbarui')
    router.push(`/procurement/orders/${updatedOrderId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/procurement/orders">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Not Found</h1>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription className="text-destructive">
              {error?.message || 'Order tidak ditemukan'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/procurement/orders">Kembali ke Daftar Order</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main content
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/procurement/orders/${orderId}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Order {order.procurementCode}
          </h1>
          <p className="text-muted-foreground mt-1">
            Perbarui informasi order pembelian
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Edit Order</CardTitle>
          <CardDescription>
            Ubah informasi yang diperlukan untuk memperbarui order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderForm
            order={order}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default EditOrderPage
