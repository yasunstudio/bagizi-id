/**
 * @fileoverview QC Grade Selector with Auto-Rejection
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Grade selection component with automatic rejection for POOR grade
 */

'use client'

import { Star, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getGradeColor, shouldRejectByGrade } from '../lib/qc-templates'

// ================================ TYPES ================================

type QCGrade = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'

interface GradeOption {
  value: QCGrade
  label: string
  description: string
  stars: number
}

interface QCGradeSelectorProps {
  grade: QCGrade | null
  onGradeChange: (grade: QCGrade) => void
  onRejectionStatusChange: (shouldReject: boolean) => void
  disabled?: boolean
}

// ================================ CONSTANTS ================================

const gradeOptions: GradeOption[] = [
  {
    value: 'EXCELLENT',
    label: 'Excellent (A)',
    description: 'Sempurna, melebihi ekspektasi',
    stars: 5,
  },
  {
    value: 'GOOD',
    label: 'Good (B)',
    description: 'Baik, sesuai standar',
    stars: 4,
  },
  {
    value: 'FAIR',
    label: 'Fair (C)',
    description: 'Cukup, masih dapat diterima dengan catatan',
    stars: 3,
  },
  {
    value: 'POOR',
    label: 'Poor (D)',
    description: 'Buruk, tidak memenuhi standar - OTOMATIS DITOLAK',
    stars: 1,
  },
]

// ================================ COMPONENT ================================

export function QCGradeSelector({
  grade,
  onGradeChange,
  onRejectionStatusChange,
  disabled = false,
}: QCGradeSelectorProps) {
  const selectedOption = gradeOptions.find((opt) => opt.value === grade)
  const shouldAutoReject = grade ? shouldRejectByGrade(grade) : false

  // Handle grade change
  const handleGradeChange = (newGrade: QCGrade) => {
    onGradeChange(newGrade)
    
    // Automatically set rejection status
    const shouldReject = shouldRejectByGrade(newGrade)
    onRejectionStatusChange(shouldReject)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Penilaian Kualitas (Grade)
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Grade Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Pilih Grade Kualitas <span className="text-destructive">*</span>
          </label>
          <Select
            value={grade || undefined}
            onValueChange={handleGradeChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                'w-full',
                grade && getGradeColor(grade)
              )}
            >
              <SelectValue placeholder="Pilih grade kualitas..." />
            </SelectTrigger>
            <SelectContent>
              {gradeOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={cn('cursor-pointer', getGradeColor(option.value))}
                >
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-3 w-3',
                            i < option.stars
                              ? 'fill-current text-amber-500'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Grade Info */}
        {selectedOption && (
          <div
            className={cn(
              'p-4 rounded-lg border-2',
              getGradeColor(selectedOption.value)
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn('border-current', getGradeColor(selectedOption.value))}
                  >
                    {selectedOption.label}
                  </Badge>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < selectedOption.stars
                            ? 'fill-current text-amber-500'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm">{selectedOption.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Auto-Rejection Alert */}
        {shouldAutoReject && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Penolakan Otomatis!</strong>
              <br />
              Grade POOR mengindikasikan produk tidak memenuhi standar kualitas minimum.
              Barang akan otomatis ditolak dan harus diretur ke supplier.
            </AlertDescription>
          </Alert>
        )}

        {/* Grade Guidelines */}
        <div className="text-xs text-muted-foreground space-y-2 bg-muted/50 p-3 rounded-md">
          <p className="font-medium">📊 Panduan Penilaian Grade:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Excellent (A):</strong> Kondisi sempurna, melebihi standar, tidak ada cacat
            </li>
            <li>
              <strong>Good (B):</strong> Kondisi baik, memenuhi semua standar, cacat minor dapat diabaikan
            </li>
            <li>
              <strong>Fair (C):</strong> Kondisi cukup, sebagian besar standar terpenuhi, butuh catatan khusus
            </li>
            <li>
              <strong>Poor (D):</strong> Kondisi buruk, standar tidak terpenuhi, WAJIB ditolak
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
