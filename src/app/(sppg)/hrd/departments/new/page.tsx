/**
 * @fileoverview Create Department Page
 * @module app/(sppg)/hrd/departments/new
 * @description Enterprise page for creating new departments
 * 
 * ENTERPRISE FEATURES:
 * - Client-side form with React Hook Form
 * - Real-time validation with Zod
 * - Success/cancel navigation
 * - Breadcrumb navigation
 * - Loading states
 * - Error handling
 * - Multi-tenant security
 * 
 * @version Next.js 15.5.4 / React 19.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Page Architecture Guidelines
 */

'use client'

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

import { DepartmentForm } from '@/features/sppg/hrd/components'

/**
 * Create Department Page
 * Route: /hrd/departments/new
 * Client Component for form interactivity
 */
function CreateDepartmentPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/hrd/departments')
  }

  const handleCancel = () => {
    router.back()
  }

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
              <BreadcrumbPage>Tambah Baru</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Title & Back Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Tambah Departemen Baru
            </h1>
            <p className="text-muted-foreground">
              Buat departemen baru dalam struktur organisasi
            </p>
          </div>

          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>

      <Separator />

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Departemen</CardTitle>
          <CardDescription>
            Lengkapi informasi departemen yang akan dibuat. Pastikan semua data
            sudah benar sebelum menyimpan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateDepartmentPage
