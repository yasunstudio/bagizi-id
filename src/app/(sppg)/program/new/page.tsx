/**
 * @fileoverview New Program Page - Create New Nutrition Program
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgramForm } from '@/features/sppg/program/components/ProgramForm'
import { useCreateProgram } from '@/features/sppg/program/hooks'
import type { CreateProgramInput } from '@/features/sppg/program/schemas'
import { toast } from 'sonner'

/**
 * New Program Page Component
 * Provides form interface for creating new nutrition programs
 * 
 * Features:
 * - Full program creation form with validation
 * - Multi-step form sections (basic info, targets, nutrition, schedule)
 * - Automatic field validation with Zod schema
 * - Navigation after successful creation
 * 
 * @route /program/new
 */
export default function NewProgramPage() {
  const router = useRouter()
  const { mutateAsync: createProgram, isPending } = useCreateProgram()

  /**
   * ✅ SIMPLIFIED (Nov 11, 2025): Handle program creation
   * @param data - Validated program data from form
   */
  const handleSubmit = async (data: CreateProgramInput) => {
    try {
      // Transform data to handle nullable fields - convert null to undefined
      const programData = {
        ...data,
        description: data.description || undefined,
        endDate: data.endDate || undefined,
        totalBudget: data.totalBudget || undefined,
        budgetPerMeal: data.budgetPerMeal || undefined,
      }
      
      const newProgram = await createProgram(programData)
      toast.success('Program berhasil dibuat')
      router.push(`/program/${newProgram.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat program')
    }
  }

  /**
   * Handle cancel action
   * Returns to program list page
   */
  const handleCancel = () => {
    router.push('/program')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Buat Program Gizi Baru
          </h1>
          <p className="text-muted-foreground mt-1">
            Lengkapi informasi program gizi yang akan dijalankan
          </p>
        </div>
      </div>

      {/* Program Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Program</CardTitle>
          <CardDescription>
            Isi semua field yang diperlukan untuk membuat program gizi baru.
            Field yang ditandai dengan (*) wajib diisi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
