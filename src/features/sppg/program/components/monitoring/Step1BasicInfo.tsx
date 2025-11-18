/**
 * @fileoverview Step 1: Basic Information Component
 * Monitoring period and reporter information
 */

'use client'

import { Control } from 'react-hook-form'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { CreateMonitoringInput } from '@/features/sppg/program/schemas/monitoringSchema'

interface Step1BasicInfoProps {
  control: Control<CreateMonitoringInput>
}

export function Step1BasicInfo({ control }: Step1BasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monitoring Date */}
        <FormField
          control={control}
          name="monitoringDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Monitoring Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value as Date, 'PPP', { locale: localeId })
                      ) : (
                        <span>Pick monitoring date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value as Date | undefined}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Month/period of this monitoring report
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reporting Week (Optional) */}
        <FormField
          control={control}
          name="reportingWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reporting Week (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 1, 2, 3, 4"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                Week number of the month (1-4)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Reporter information and report date will be automatically recorded from your logged-in user account.
        </p>
      </div>
    </div>
  )
}
