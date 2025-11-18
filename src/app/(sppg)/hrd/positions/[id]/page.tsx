/**
 * @fileoverview Position Detail Page
 * Server-side rendered position detail with full information
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { use } from 'react'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { usePositions } from '@/features/sppg/hrd/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function PositionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 bg-muted animate-pulse rounded-lg" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
      </div>
      <div className="h-60 bg-muted animate-pulse rounded-lg" />
      <div className="h-80 bg-muted animate-pulse rounded-lg" />
    </div>
  )
}

function PositionDetailPage({
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  const { data: positions, isLoading } = usePositions()
  
  if (isLoading) {
    return <PositionDetailSkeleton />
  }
  
  const position = positions?.find(p => p.id === id)
  
  if (!position) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/hrd">HRD</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/hrd/positions">Posisi</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Position Detail */}
      <Card>
        <CardHeader>
          <CardTitle>{position.positionName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Kode Posisi</div>
              <div className="font-medium">{position.positionCode}</div>
            </div>
            {position.jobDescription && (
              <div>
                <div className="text-sm text-muted-foreground">Deskripsi Pekerjaan</div>
                <div className="font-medium">{position.jobDescription}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Jumlah Karyawan</div>
              <div className="font-medium">{position._count?.employees || 0} orang</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PositionDetailPage
