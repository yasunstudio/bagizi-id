/**
 * @fileoverview Procurement Page Header Component
 * Reusable header component for consistent procurement page layouts
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home, ShoppingCart, LucideIcon } from 'lucide-react'

interface ProcurementPageHeaderProps {
  /**
   * Current page title
   */
  title: string
  
  /**
   * Current page description
   */
  description: string
  
  /**
   * Icon component for the page
   */
  icon?: LucideIcon
  
  /**
   * Breadcrumb items
   * Example: ['Procurement', 'Orders']
   */
  breadcrumbs: string[]
  
  /**
   * Optional action button(s)
   * Can be single action object or array of actions
   */
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: LucideIcon
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  } | Array<{
    label: string
    href?: string
    onClick?: () => void
    icon?: LucideIcon
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  }>
}

/**
 * Standardized page header for procurement pages
 * Provides consistent breadcrumb navigation and page title layout
 * Supports single or multiple action buttons
 * 
 * @example Single action
 * ```tsx
 * <ProcurementPageHeader
 *   title="Orders"
 *   description="Kelola order pembelian dari supplier"
 *   icon={ShoppingBag}
 *   breadcrumbs={['Procurement', 'Orders']}
 *   action={{
 *     label: 'Buat Order Baru',
 *     href: '/procurement/orders/new',
 *     icon: Plus
 *   }}
 * />
 * ```
 * 
 * @example Multiple actions
 * ```tsx
 * <ProcurementPageHeader
 *   title="Suppliers"
 *   description="Kelola data supplier dan vendor"
 *   icon={Building2}
 *   breadcrumbs={['Procurement', 'Suppliers']}
 *   action={[
 *     {
 *       label: 'Export',
 *       onClick: () => handleExport(),
 *       icon: Download,
 *       variant: 'outline'
 *     },
 *     {
 *       label: 'Tambah Supplier',
 *       href: '/procurement/suppliers/new',
 *       icon: Plus,
 *       variant: 'default'
 *     }
 *   ]}
 * />
 * ```
 */
export function ProcurementPageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  action,
}: ProcurementPageHeaderProps) {
  // Normalize action to always be an array for consistent rendering
  const actions = action ? (Array.isArray(action) ? action : [action]) : []

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/procurement" className="flex items-center gap-1">
                <ShoppingCart className="h-4 w-4" />
                Procurement
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {breadcrumbs.slice(1).map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 2
            
            return (
              <div key={crumb} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={`/procurement/${crumb.toLowerCase()}`}>
                        {crumb}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      
      <Separator />
      
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {Icon && <Icon className="h-8 w-8 text-primary" />}
            {title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {description}
          </p>
        </div>
        
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((actionItem, index) => (
              <Button 
                key={index}
                asChild={!!actionItem.href} 
                onClick={actionItem.onClick}
                variant={actionItem.variant || 'default'}
                size="sm"
              >
                {actionItem.href ? (
                  <Link href={actionItem.href}>
                    {actionItem.icon && <actionItem.icon className="h-4 w-4 mr-2" />}
                    {actionItem.label}
                  </Link>
                ) : (
                  <>
                    {actionItem.icon && <actionItem.icon className="h-4 w-4 mr-2" />}
                    {actionItem.label}
                  </>
                )}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
