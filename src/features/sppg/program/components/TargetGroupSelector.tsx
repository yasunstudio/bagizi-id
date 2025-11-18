/**
 * @fileoverview TargetGroupSelector Component - Multi-select for target groups
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC } from 'react'
import { TargetGroup } from '@prisma/client'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTargetGroupOptions } from '@/lib/programValidation'

interface TargetGroupSelectorProps {
  value: TargetGroup[]
  onChange: (value: TargetGroup[]) => void
  disabled?: boolean
  mode?: 'checkbox' | 'badge'
  className?: string
}

export const TargetGroupSelector: FC<TargetGroupSelectorProps> = ({
  value = [],
  onChange,
  disabled = false,
  mode = 'checkbox',
  className,
}) => {
  const options = getTargetGroupOptions()

  // DON'T use useCallback - just inline functions
  // useCallback with deps causes re-creation which triggers infinite loop
  const handleToggle = (targetGroup: TargetGroup) => {
    const currentValue = value || []
    onChange(currentValue.includes(targetGroup)
      ? currentValue.filter(g => g !== targetGroup)
      : [...currentValue, targetGroup]
    )
  }

  const handleSelectAll = () => {
    onChange(options.map(opt => opt.value))
  }

  const handleClearAll = () => {
    onChange([])
  }

  if (mode === 'badge') {
    return (
      <div className={className}>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = value.includes(option.value)
            return (
              <Badge
                key={option.value}
                variant={isSelected ? 'default' : 'outline'}
                className={`cursor-pointer transition-colors ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/80'
                }`}
                onClick={() => !disabled && handleToggle(option.value)}
              >
                {option.label}
              </Badge>
            )
          })}
        </div>
      </div>
    )
  }

  // Check if all options are selected (unrestricted mode)
  const allOptionsCount = options.length
  const isAllSelected = value.length === allOptionsCount

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* All Selected Indicator */}
          {isAllSelected && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✓ Semua Kelompok Sasaran Dipilih
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Program ini dapat menerima semua kelompok sasaran.
              </p>
            </div>
          )}

          {/* Select All / Clear All */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              Pilih Target Kelompok
              {value.length > 0 && (
                <span className="ml-2 text-muted-foreground">
                  ({value.length} dari {options.length} dipilih)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {value.length < options.length && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={disabled}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  Pilih Semua
                </button>
              )}
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={disabled}
                  className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                >
                  Hapus Semua
                </button>
              )}
            </div>
          </div>

          {/* Checkbox List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {options.map((option) => {
              const isChecked = value.includes(option.value)
              
              return (
                <div
                  key={option.value}
                  className={`flex items-start space-x-3 rounded-md border p-3 transition-colors ${
                    isChecked 
                      ? 'bg-primary/5 border-primary' 
                      : 'hover:bg-muted/50'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Checkbox
                    id={`target-group-${option.value}`}
                    checked={isChecked}
                    disabled={disabled}
                    onCheckedChange={() => handleToggle(option.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`target-group-${option.value}`}
                      className={`text-sm font-medium ${
                        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      onClick={() => !disabled && handleToggle(option.value)}
                    >
                      {option.label}
                    </Label>
                    {getTargetGroupDescription(option.value) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {getTargetGroupDescription(option.value)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Get description for each target group (for better UX)
 */
function getTargetGroupDescription(group: TargetGroup): string {
  const descriptions: Record<TargetGroup, string> = {
    TODDLER: 'Anak usia 0-5 tahun',
    SCHOOL_CHILDREN: 'Anak usia sekolah (6-12 tahun)',
    TEENAGE_GIRL: 'Remaja putri (13-18 tahun)',
    PREGNANT_WOMAN: 'Ibu hamil',
    BREASTFEEDING_MOTHER: 'Ibu menyusui',
    ELDERLY: 'Lanjut usia (60+ tahun)',
  }
  return descriptions[group] || ''
}
