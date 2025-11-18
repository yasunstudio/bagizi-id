/**
 * @fileoverview Edit Employee Page
 * @module app/(sppg)/hrd/employees/[id]/edit
 * @description Page for editing employee information
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useParams, useRouter } from 'next/navigation'

import { EmployeeForm } from '@/features/sppg/hrd/components'
import { useEmployee } from '@/features/sppg/hrd/hooks'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

function EditEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const { data: employee, isLoading, error } = useEmployee(employeeId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Karyawan</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">Karyawan tidak ditemukan</p>
              <p className="text-sm text-muted-foreground mt-2">
                Data karyawan tidak tersedia atau telah dihapus
              </p>
              <Button onClick={() => router.push('/hrd/employees')} className="mt-4">
                Kembali ke Daftar Karyawan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Karyawan</h1>
          <p className="text-muted-foreground">
            Perbarui data karyawan: {employee.fullName}
          </p>
        </div>
      </div>

      <EmployeeForm employee={employee} />
    </div>
  )
}

export default EditEmployeePage
