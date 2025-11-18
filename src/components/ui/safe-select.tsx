"use client"

/**
 * SafeSelect - Controlled wrapper around Radix UI Select
 * Handles undefined/null values by converting to empty string
 * 
 * CRITICAL: This component MUST be used with stable props to avoid infinite loops
 * - value: Should come directly from form field (e.g., field.value)
 * - onValueChange: Should be stable reference (e.g., field.onChange)
 * 
 * DO NOT create intermediate variables in render function!
 */

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SafeSelectProps {
  value: string | number | null | undefined
  onValueChange: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export function SafeSelect({
  value,
  onValueChange,
  placeholder,
  children,
  disabled,
  className,
}: SafeSelectProps) {
  // Convert to string, empty string if undefined/null
  const stringValue = value == null ? '' : String(value)

  return (
    <Select
      value={stringValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  )
}

// Export SelectItem for convenience
export { SelectItem }
