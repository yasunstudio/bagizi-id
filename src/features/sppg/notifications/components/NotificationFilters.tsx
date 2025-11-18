/**
 * @fileoverview Notification Logs Filters
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Filter controls for notification logs (channel, status, date range)
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Filter, X, Calendar as CalendarIcon, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

// ================================ TYPES ================================

type NotificationChannel = 'ALL' | 'WHATSAPP' | 'EMAIL'
type NotificationStatus = 'ALL' | 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ'

export interface NotificationFilters {
  channel: NotificationChannel
  status: NotificationStatus
  dateFrom?: Date
  dateTo?: Date
  searchQuery?: string
}

interface NotificationFiltersProps {
  filters: NotificationFilters
  onFiltersChange: (filters: NotificationFilters) => void
  onApplyFilters: () => void
  resultsCount?: number
}

// ================================ COMPONENT ================================

export function NotificationFiltersComponent({
  filters,
  onFiltersChange,
  onApplyFilters,
  resultsCount,
}: NotificationFiltersProps) {
  const [localFilters, setLocalFilters] = useState<NotificationFilters>(filters)

  const updateFilter = (key: keyof NotificationFilters, value: unknown) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onApplyFilters()
  }

  const handleReset = () => {
    const resetFilters: NotificationFilters = {
      channel: 'ALL',
      status: 'ALL',
      dateFrom: undefined,
      dateTo: undefined,
      searchQuery: '',
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    onApplyFilters()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.channel !== 'ALL') count++
    if (localFilters.status !== 'ALL') count++
    if (localFilters.dateFrom) count++
    if (localFilters.dateTo) count++
    if (localFilters.searchQuery) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </CardTitle>
          {typeof resultsCount === 'number' && (
            <Badge variant="outline">{resultsCount} results</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by recipient or message..."
              value={localFilters.searchQuery || ''}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Channel Filter */}
        <div className="space-y-2">
          <Label htmlFor="channel">Channel</Label>
          <Select
            value={localFilters.channel}
            onValueChange={(value) => updateFilter('channel', value)}
          >
            <SelectTrigger id="channel">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Channels</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={localFilters.status}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="READ">Read</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !localFilters.dateFrom && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.dateFrom ? (
                    format(localFilters.dateFrom, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.dateFrom}
                  onSelect={(date) => updateFilter('dateFrom', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !localFilters.dateTo && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.dateTo ? (
                    format(localFilters.dateTo, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.dateTo}
                  onSelect={(date) => updateFilter('dateTo', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={activeFiltersCount === 0}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="pt-2 space-y-2">
            <Label className="text-xs text-muted-foreground">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {localFilters.channel !== 'ALL' && (
                <Badge variant="secondary">
                  Channel: {localFilters.channel}
                </Badge>
              )}
              {localFilters.status !== 'ALL' && (
                <Badge variant="secondary">
                  Status: {localFilters.status}
                </Badge>
              )}
              {localFilters.dateFrom && (
                <Badge variant="secondary">
                  From: {format(localFilters.dateFrom, 'dd MMM yyyy')}
                </Badge>
              )}
              {localFilters.dateTo && (
                <Badge variant="secondary">
                  To: {format(localFilters.dateTo, 'dd MMM yyyy')}
                </Badge>
              )}
              {localFilters.searchQuery && (
                <Badge variant="secondary">
                  Search: &quot;{localFilters.searchQuery}&quot;
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
