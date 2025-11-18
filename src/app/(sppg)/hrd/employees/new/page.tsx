/**
 * @fileoverview Create Employee Page
 * @module app/(sppg)/hrd/employees/new
 * @description Page for creating new employee
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { EmployeeForm } from '@/features/sppg/hrd/components'

import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'


function NewEmployeePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/hrd/employees">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Karyawan Baru</h1>
          <p className="text-muted-foreground">
            Lengkapi data karyawan baru yang akan didaftarkan
          </p>
        </div>
      </div>

      <EmployeeForm />
    </div>
  )
}

export default NewEmployeePage
