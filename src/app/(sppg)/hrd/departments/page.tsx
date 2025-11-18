/**
 * @fileoverview Departments List Page
 * @module app/(sppg)/hrd/departments
 * @description Enterprise departments list page with filtering and actions
 * 
 * ENTERPRISE FEATURES:
 * - Server-side rendering with React 19
 * - Real-time data with TanStack Query
 * - Advanced filtering and search
 * - Responsive layout with breadcrumbs
 * - Action buttons (Create, TreeView)
 * - Multi-tenant security
 * - Performance optimized
 * 
 * @version Next.js 15.5.4 / React 19.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Page Architecture Guidelines
 */

'use client'

import { Suspense } from 'react'

import Link from 'next/link'
import { Building2, Plus, TreePine } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
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

import { DepartmentList, DepartmentTreeView } from '@/features/sppg/hrd/components'


/**
 * Loading skeleton for department list
 */
function DepartmentListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}

/**
 * Departments List Page
 * Route: /hrd/departments
 */
function DepartmentsPage() {
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
              <BreadcrumbPage>Departemen</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Title & Actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Manajemen Departemen
            </h1>
            <p className="text-muted-foreground">
              Kelola struktur organisasi dan hierarki departemen
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="#tree-view">
                <TreePine className="mr-2 h-4 w-4" />
                Lihat Struktur
              </Link>
            </Button>
            <Button asChild>
              <Link href="/hrd/departments/new">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Departemen
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Department List */}
      <Suspense fallback={<DepartmentListSkeleton />}>
        <DepartmentList />
      </Suspense>

      {/* Department Tree View */}
      <div id="tree-view" className="scroll-mt-6">
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-96 w-full" />
              </CardContent>
            </Card>
          }
        >
          <DepartmentTreeView initiallyExpanded={false} />
        </Suspense>
      </div>
    </div>
  )
}

export default DepartmentsPage
