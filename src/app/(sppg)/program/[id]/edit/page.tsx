/**
 * @fileoverview Program Edit Page - Edit existing program
 * @version Next.js 15.5.4 App Router
 * @author Bagizi-ID Development Team
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ProgramForm } from '@/features/sppg/program/components'
import { useProgram, useUpdateProgram } from '@/features/sppg/program/hooks'
import { toast } from 'sonner'
import type { CreateProgramInput } from '@/features/sppg/program/schemas'

interface ProgramEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProgramEditPage({ params }: ProgramEditPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const { data: program, isLoading } = useProgram(id)
  const { mutateAsync: updateProgram, isPending: isUpdating } = useUpdateProgram()

  const handleUpdate = async (data: CreateProgramInput) => {
    try {
      // ✅ SIMPLIFIED (Nov 11, 2025): Transform data to handle nullable fields
      const programData = {
        ...data,
        description: data.description ?? undefined,
        endDate: data.endDate ?? undefined,
        totalBudget: data.totalBudget ?? undefined,
        budgetPerMeal: data.budgetPerMeal ?? undefined,
      }
      
      // Wait for update and cache refresh to complete
      await updateProgram({ id, data: programData })
      
      toast.success('Program berhasil diperbarui')
      
      // Small delay to ensure cache is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      router.push(`/program/${id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui program')
    }
  }

  const handleCancel = () => {
    router.push(`/program/${id}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-[600px] bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-muted-foreground">Program tidak ditemukan</p>
        <Button onClick={() => router.push('/program')}>
          Kembali ke Daftar Program
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/program/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Program</h1>
          <p className="text-muted-foreground mt-1">
            {program.name} • {program.programCode}
          </p>
        </div>
      </div>

      <Separator />

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Program</CardTitle>
          <CardDescription>
            Perbarui informasi program gizi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramForm
            initialData={program}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            isSubmitting={isUpdating}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  )
}
