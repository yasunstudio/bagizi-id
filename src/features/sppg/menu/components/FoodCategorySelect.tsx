/**
 * @fileoverview FoodCategorySelect - Hierarchical food category selector
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useFoodCategoryHierarchy } from '../hooks'
import { Loader2, Folder, FolderOpen, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FoodCategory } from '../api/foodCategoriesApi'

// ================================ TYPES ================================

interface FoodCategorySelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  allowClear?: boolean
}

// ================================ COMPONENT ================================

export function FoodCategorySelect({
  value,
  onValueChange,
  placeholder = 'Pilih kategori makanan',
  disabled = false,
  className,
  allowClear = false
}: FoodCategorySelectProps) {
  const { data: hierarchy, isLoading, error } = useFoodCategoryHierarchy()

  // Render loading state
  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue>
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat kategori...
            </span>
          </SelectValue>
        </SelectTrigger>
      </Select>
    )
  }

  // Render error state
  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className={cn('border-destructive', className)}>
          <SelectValue>
            <span className="text-destructive text-sm">
              Gagal memuat kategori
            </span>
          </SelectValue>
        </SelectTrigger>
      </Select>
    )
  }

  // Render empty state
  if (!hierarchy || hierarchy.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue>
            <span className="text-muted-foreground text-sm">
              Belum ada kategori
            </span>
          </SelectValue>
        </SelectTrigger>
      </Select>
    )
  }

  // Recursive function to render category hierarchy
  const renderCategoryItems = (
    categories: FoodCategory[],
    level: number = 0
  ): React.ReactNode => {
    return categories.map((category) => {
      const indent = '  '.repeat(level) // 2 spaces per level
      const hasChildren = category.children && category.children.length > 0
      const icon = hasChildren ? (
        <FolderOpen className="h-3 w-3" />
      ) : (
        <Folder className="h-3 w-3" />
      )

      return (
        <React.Fragment key={category.id}>
          <SelectItem value={category.id} className="pl-2">
            <div className="flex items-center gap-2">
              {level > 0 && <span className="text-muted-foreground">{indent}</span>}
              {icon}
              {category.colorCode && (
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: category.colorCode }}
                />
              )}
              <span className={cn(
                level === 0 && 'font-semibold',
                level > 0 && 'text-sm'
              )}>
                {category.categoryName}
              </span>
              <span className="text-xs text-muted-foreground">
                ({category.categoryCode})
              </span>
            </div>
          </SelectItem>
          {hasChildren && renderCategoryItems(category.children as FoodCategory[], level + 1)}
        </React.Fragment>
      )
    })
  }

  return (
    <div className="relative">
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          <SelectGroup>
            <SelectLabel>Kategori Makanan</SelectLabel>
            {renderCategoryItems(hierarchy)}
          </SelectGroup>
        </SelectContent>
      </Select>
      {allowClear && value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-8 top-0 h-full px-2 hover:bg-transparent"
          onClick={(e) => {
            e.preventDefault()
            onValueChange('')
          }}
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          <span className="sr-only">Clear selection</span>
        </Button>
      )}
    </div>
  )
}

// ================================ CATEGORY BADGE COMPONENT ================================

interface FoodCategoryBadgeProps {
  categoryId: string
  className?: string
}

/**
 * Display a badge with food category name and color
 * Useful for showing selected category in cards/tables
 */
export function FoodCategoryBadge({ categoryId, className }: FoodCategoryBadgeProps) {
  const { data: hierarchy } = useFoodCategoryHierarchy()

  // Find category by ID (recursive search)
  const findCategory = (
    categories: FoodCategory[] | undefined,
    id: string
  ): FoodCategory | undefined => {
    if (!categories) return undefined

    for (const category of categories) {
      if (category.id === id) return category
      if (category.children) {
        const found = findCategory(category.children as FoodCategory[], id)
        if (found) return found
      }
    }
    return undefined
  }

  const category = findCategory(hierarchy, categoryId)

  if (!category) {
    return null
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
        className
      )}
      style={{
        backgroundColor: category.colorCode
          ? `${category.colorCode}20`
          : 'transparent',
        borderColor: category.colorCode || 'currentColor',
      }}
    >
      {category.colorCode && (
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: category.colorCode }}
        />
      )}
      <span>{category.categoryName}</span>
    </div>
  )
}

// ================================ EXPORTS ================================

export type { FoodCategorySelectProps, FoodCategory }
