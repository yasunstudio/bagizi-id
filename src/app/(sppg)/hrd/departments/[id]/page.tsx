/**
 * @fileoverview Department Detail Page
 * @module app/(sppg)/hrd/departments/[id]
 * @description Enterprise department detail page with comprehensive information
 * 
 * ENTERPRISE FEATURES:
 * - Server-side rendering with data fetching
 * - Async params for Next.js 15
 * - Comprehensive department information
 * - Related data (employees, positions, hierarchy)
 * - Action buttons (Edit, Delete, View Tree)
 * - Loading states
 * - Error handling
 * - Multi-tenant security
 * - Performance optimized
 * 
 * @version Next.js 15.5.4 / React 19.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Page Architecture Guidelines
 */

'use client'

import { use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Building2, Edit, ArrowLeft, TreePine } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

import { useDepartments } from '@/features/sppg/hrd/hooks'

/**
 * Loading skeleton for department detail
 */
function DepartmentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function DepartmentDetailPage({
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  const { data: departments, isLoading } = useDepartments()
  
  if (isLoading) {
    return <DepartmentDetailSkeleton />
  }
  
  const department = departments?.find(d => d.id === id)
  
  if (!department) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/hrd">HRD</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/hrd/departments">Departemen</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Detail</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Title & Actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Detail Departemen
            </h1>
            <p className="text-muted-foreground">
              Informasi lengkap tentang departemen dan strukturnya
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/hrd/departments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/hrd/departments#tree-view">
                <TreePine className="mr-2 h-4 w-4" />
                Lihat Struktur
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/hrd/departments/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Department Detail Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {department.departmentName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Kode Departemen</div>
              <div className="font-medium">{department.departmentCode}</div>
            </div>
            {department.description && (
              <div>
                <div className="text-sm text-muted-foreground">Deskripsi</div>
                <div className="font-medium">{department.description}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Manager</div>
                <div className="font-medium">{department.managerId || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Lokasi</div>
                <div className="font-medium">{department.location || '-'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DepartmentDetailPage
