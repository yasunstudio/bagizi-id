/**
 * @fileoverview Edit Department Page
 * @module app/(sppg)/hrd/departments/[id]/edit
 * @description Enterprise page for editing department information
 * 
 * ENTERPRISE FEATURES:
 * - Client-side form with pre-filled data
 * - React Hook Form with Zod validation
 * - Real-time data fetching
 * - Success/cancel navigation
 * - Breadcrumb navigation with department name
 * - Loading states
 * - Error handling
 * - Multi-tenant security
 * - Optimistic updates
 * 
 * @version Next.js 15.5.4 / React 19.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Page Architecture Guidelines
 */

'use client'

import { use } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

import { DepartmentForm } from '@/features/sppg/hrd/components'
import { useDepartment } from '@/features/sppg/hrd/hooks'

/**
 * Loading skeleton for edit form
 */
function EditFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Edit Department Form Content
 */
function EditDepartmentContent({ id }: { id: string }) {
  const router = useRouter()
  const { data: department, isLoading, error } = useDepartment(id)

  const handleSuccess = () => {
    router.push(`/hrd/departments/${id}`)
  }

  const handleCancel = () => {
    router.push(`/hrd/departments/${id}`)
  }

  // Loading state
  if (isLoading) {
    return <EditFormSkeleton />
  }

  // Error state
  if (error || !department) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || 'Gagal memuat data departemen'}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Departemen</CardTitle>
        <CardDescription>
          Perbarui informasi departemen. Pastikan semua perubahan sudah benar
          sebelum menyimpan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DepartmentForm
          department={department}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  )
}

/**
 * Edit Department Page
 * Route: /hrd/departments/[id]/edit
 * Client Component for form interactivity
 */
function EditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)

  // Fetch department for breadcrumb
  const { data: department } = useDepartment(id)

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
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
              <BreadcrumbLink asChild><Link href="/hrd/departments">Departemen</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href={`/hrd/departments/${id}`}>
                {department ? department.departmentName : 'Detail'}
              </Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Title & Back Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Edit Departemen
              {department && (
                <span className="text-muted-foreground text-2xl font-normal">
                  - {department.departmentName}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              Perbarui informasi dan pengaturan departemen
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push(`/hrd/departments/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>

      <Separator />

      {/* Edit Form */}
      <EditDepartmentContent id={id} />
    </div>
  )
}

export default EditDepartmentPage
