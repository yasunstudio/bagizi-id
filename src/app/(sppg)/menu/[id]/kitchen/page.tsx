/**
 * @fileoverview Kitchen View Page - Dedicated view for kitchen staff
 * @version Next.js 15.5.4
 * @description Optimized for tablet/kitchen display with large text and step-by-step guidance
 */

'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KitchenStepsDisplay } from '@/features/sppg/menu/components'
import { useMenu } from '@/features/sppg/menu/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface KitchenViewPageProps {
  params: Promise<{ id: string }>
}

export default function KitchenViewPage({ params }: KitchenViewPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: menu, isLoading, error } = useMenu(resolvedParams.id)

  const handleComplete = () => {
    toast.success('Semua langkah resep selesai! 🎉')
    router.push(`/menu/${resolvedParams.id}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <Skeleton className="h-12 w-[300px]" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Menu tidak ditemukan'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header - Can be hidden in fullscreen */}
      <div className="border-b bg-card">
        <div className="container mx-auto py-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href={`/menu/${menu.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Detail Menu
            </Link>
          </Button>
        </div>
      </div>

      {/* Kitchen Display */}
      <div className="container mx-auto py-6">
        <KitchenStepsDisplay
          menuId={menu.id}
          menuName={menu.menuName}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
