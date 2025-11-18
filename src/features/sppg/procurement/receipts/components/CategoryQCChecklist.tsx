/**
 * @fileoverview Category-Specific QC Checklist Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Dynamic checklist based on inventory category with guidelines
 */

'use client'

import { CheckCircle2, Circle, AlertCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { InventoryCategory } from '@prisma/client'
import {
  getQCTemplate,
  type QCCheckPoint,
} from '../lib/qc-templates'

// ================================ TYPES ================================

interface CategoryQCChecklistProps {
  category: InventoryCategory
  checkPoints: QCCheckPoint[]
  onCheckPointsChange: (checkPoints: QCCheckPoint[]) => void
  showGuidelines?: boolean
}

// ================================ COMPONENT ================================

export function CategoryQCChecklist({
  category,
  checkPoints,
  onCheckPointsChange,
  showGuidelines = true,
}: CategoryQCChecklistProps) {
  const template = getQCTemplate(category)
  
  // Calculate completion
  const totalChecks = checkPoints.length
  const passedChecks = checkPoints.filter((cp) => cp.isPassed).length
  const completionPercentage = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0

  // Handle checkbox change
  const handleCheckChange = (index: number, isPassed: boolean) => {
    const newCheckPoints = [...checkPoints]
    newCheckPoints[index] = {
      ...newCheckPoints[index],
      isPassed,
    }
    onCheckPointsChange(newCheckPoints)
  }

  // Handle actual value change
  const handleActualChange = (index: number, actual: string) => {
    const newCheckPoints = [...checkPoints]
    newCheckPoints[index] = {
      ...newCheckPoints[index],
      actual,
    }
    onCheckPointsChange(newCheckPoints)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Quality Checklist - {category}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Pemeriksaan khusus untuk kategori ini
            </p>
          </div>
          <Badge
            variant={completionPercentage === 100 ? 'default' : 'secondary'}
            className={cn(
              'flex items-center gap-1',
              completionPercentage === 100 && 'bg-green-100 text-green-800'
            )}
          >
            {passedChecks}/{totalChecks} passed ({completionPercentage.toFixed(0)}%)
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Guidelines */}
        {showGuidelines && template.specificGuidelines.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">📋 Panduan Inspeksi:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {template.specificGuidelines.map((guideline, index) => (
                  <li key={index}>{guideline}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Check Points */}
        <div className="space-y-3">
          {checkPoints.map((checkPoint, index) => (
            <div
              key={index}
              className={cn(
                'border rounded-lg p-4 space-y-3 transition-colors',
                checkPoint.isPassed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-background hover:bg-muted/50'
              )}
            >
              {/* Header with checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`checkpoint-${index}`}
                  checked={checkPoint.isPassed}
                  onCheckedChange={(checked) => {
                    handleCheckChange(index, checked === true)
                  }}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor={`checkpoint-${index}`}
                    className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                  >
                    {checkPoint.isPassed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    {checkPoint.aspect}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    <strong>Standar:</strong> {checkPoint.standard}
                  </p>
                </div>
              </div>

              {/* Actual value input */}
              <div className="ml-9 space-y-2">
                <label htmlFor={`actual-${index}`} className="text-xs font-medium text-muted-foreground">
                  Kondisi Aktual/Catatan:
                </label>
                <Input
                  id={`actual-${index}`}
                  placeholder="Masukkan kondisi aktual atau catatan inspeksi..."
                  value={checkPoint.actual || ''}
                  onChange={(e) => handleActualChange(index, e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Warning if not all passed */}
        {completionPercentage < 100 && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Masih ada {totalChecks - passedChecks} aspek yang belum lulus pemeriksaan.
              Pastikan semua aspek telah diperiksa dan memenuhi standar.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
