/**
 * @fileoverview Create Order Page
 * Form page for creating new procurement orders
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useRouter } from 'next/navigation'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import { OrderForm } from '@/features/sppg/procurement/orders/components'
import { toast } from 'sonner'

// ============================================================================
// Main Page Component
// ============================================================================

function NewOrderPage() {
  const router = useRouter()

  const handleSuccess = (orderId: string) => {
    toast.success('Order berhasil dibuat')
    router.push(`/procurement/orders/${orderId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <Link href="/procurement/orders">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Order Baru</h1>
          <p className="text-muted-foreground mt-1">
            Isi form di bawah untuk membuat order pembelian baru
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Order</CardTitle>
          <CardDescription>
            Lengkapi semua informasi yang diperlukan untuk membuat order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Export with Auth Protection
// ============================================================================

export default NewOrderPage
