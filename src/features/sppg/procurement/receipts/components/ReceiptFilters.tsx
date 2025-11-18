/**
 * @fileoverview Receipt Filters Component - Advanced Filtering Panel
 * @version Next.js 15.5.4 / Zustand Integration / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  Search,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import { QualityGrade } from '@prisma/client'
import { useReceiptStore } from '../stores'
import { receiptFiltersFormSchema } from '../schemas'
import type { ReceiptFiltersFormInput, ReceiptFilters } from '../types'
import { getQualityGradeLabel, getDeliveryStatusLabel } from '../lib'

// ================================ COMPONENT ================================

interface ReceiptFiltersProps {
  suppliers?: Array<{ id: string; supplierName: string }>
}

export function ReceiptFilters({ suppliers = [] }: ReceiptFiltersProps) {
  const {
    filters,
    setFilters,
    resetFilters,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    selectActiveFilterCount,
  } = useReceiptStore()

  const activeFilterCount = selectActiveFilterCount()

  // Convert filters (Date) to form format (string) for defaultValues
  const defaultFormValues: ReceiptFiltersFormInput = {
    ...filters,
    dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString().split('T')[0] : undefined,
    dateTo: filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : undefined,
  }

  // Form setup with form input types (strings for dates)
  const form = useForm<ReceiptFiltersFormInput>({
    resolver: zodResolver(receiptFiltersFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  })

  // Apply filters - transform form data (strings) to API format (Dates)
  const onSubmit = (formData: ReceiptFiltersFormInput) => {
    // Transform dates from string to Date for API
    const apiFilters: ReceiptFilters = {
      ...formData,
      dateFrom: formData.dateFrom ? new Date(formData.dateFrom) : undefined,
      dateTo: formData.dateTo ? new Date(formData.dateTo) : undefined,
    }
    
    setFilters(apiFilters)
    setIsFilterPanelOpen(false)
  }

  // Reset all filters
  const handleReset = () => {
    form.reset({
      supplierId: undefined,
      deliveryStatus: undefined,
      qualityGrade: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      inspectedBy: undefined,
      searchTerm: undefined,
    })
    resetFilters()
  }

  return (
    <Sheet open={isFilterPanelOpen} onOpenChange={setIsFilterPanelOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Penerimaan Barang
          </SheetTitle>
          <SheetDescription>
            Gunakan filter di bawah untuk mempersempit hasil pencarian
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Search Term */}
            <FormField
              control={form.control}
              name="searchTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pencarian</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari kode procurement, nomor terima..."
                        className="pl-8"
                        {...field}
                        value={field.value || ''}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Cari berdasarkan kode atau nomor dokumen
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Supplier Filter */}
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Semua supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Semua Supplier</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.supplierName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Filter berdasarkan supplier
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Status Filter */}
            <FormField
              control={form.control}
              name="deliveryStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Pengiriman</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Semua status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="PENDING">
                        {getDeliveryStatusLabel('PENDING')}
                      </SelectItem>
                      <SelectItem value="ON_DELIVERY">
                        {getDeliveryStatusLabel('ON_DELIVERY')}
                      </SelectItem>
                      <SelectItem value="DELIVERED">
                        {getDeliveryStatusLabel('DELIVERED')}
                      </SelectItem>
                      <SelectItem value="PARTIAL">
                        {getDeliveryStatusLabel('PARTIAL')}
                      </SelectItem>
                      <SelectItem value="CANCELLED">
                        {getDeliveryStatusLabel('CANCELLED')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Filter berdasarkan status pengiriman
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quality Grade Filter */}
            <FormField
              control={form.control}
              name="qualityGrade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Kualitas</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Semua grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Semua Grade</SelectItem>
                      {Object.values(QualityGrade).map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {getQualityGradeLabel(grade)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Filter berdasarkan grade kualitas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Date Range Filters */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Rentang Tanggal</h4>
              
              {/* Date From */}
              <FormField
                control={form.control}
                name="dateFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Dari Tanggal</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP', { locale: id })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString().split('T')[0] : undefined)
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Tanggal awal periode
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date To */}
              <FormField
                control={form.control}
                name="dateTo"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Sampai Tanggal</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP', { locale: id })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString().split('T')[0] : undefined)
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Tanggal akhir periode
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Inspector Filter */}
            <FormField
              control={form.control}
              name="inspectedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diperiksa Oleh</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama pemeriksa..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Filter berdasarkan nama pemeriksa QC
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <SheetFooter className="flex flex-row gap-2 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button type="submit" className="flex-1">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Terapkan Filter
              </Button>
            </SheetFooter>
          </form>
        </Form>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-6 p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Filter Aktif ({activeFilterCount})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-auto p-0 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Hapus Semua
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <Badge variant="secondary">
                  Search: {filters.searchTerm}
                </Badge>
              )}
              {filters.deliveryStatus && (
                <Badge variant="secondary">
                  Status: {getDeliveryStatusLabel(filters.deliveryStatus)}
                </Badge>
              )}
              {filters.qualityGrade && (
                <Badge variant="secondary">
                  Grade: {getQualityGradeLabel(filters.qualityGrade as QualityGrade)}
                </Badge>
              )}
              {filters.dateFrom && (
                <Badge variant="secondary">
                  Dari: {format(filters.dateFrom, 'dd MMM yyyy', { locale: id })}
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="secondary">
                  Sampai: {format(filters.dateTo, 'dd MMM yyyy', { locale: id })}
                </Badge>
              )}
              {filters.inspectedBy && (
                <Badge variant="secondary">
                  Pemeriksa: {filters.inspectedBy}
                </Badge>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
