/**
 * @fileoverview SPPG Header dengan breadcrumbs, user menu, dan theme toggle
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { Menu, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { UserMenu } from '@/components/auth'
import { ThemeToggle } from '@/components/shared/navigation/ThemeToggle'
import { usePathname } from 'next/navigation'

interface SppgHeaderProps {
  onMenuClick: () => void
}

// Generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  
  const breadcrumbMap: Record<string, string> = {
    dashboard: 'Dashboard',
    menu: 'Manajemen Menu',
    'menu-planning': 'Perencanaan Menu',
    procurement: 'Pengadaan',
    production: 'Produksi',
    distribution: 'Distribusi',
    inventory: 'Inventori',
    'stock-movements': 'Pergerakan Stok',
    hrd: 'SDM',
    departments: 'Departemen',
    positions: 'Jabatan',
    employees: 'Karyawan',
    reports: 'Laporan',
    settings: 'Pengaturan',
    program: 'Program Gizi',
    'beneficiary-organizations': 'Organisasi Penerima',
    create: 'Buat Baru',
    edit: 'Edit',
    new: 'Baru',
  }

  return segments.map((segment, index) => ({
    title: breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
    href: '/' + segments.slice(0, index + 1).join('/'),
    isLast: index === segments.length - 1
  }))
}

export function SppgHeader({ onMenuClick }: SppgHeaderProps) {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">SPPG</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.length > 0 && <BreadcrumbSeparator />}
            {breadcrumbs.map((breadcrumb) => (
              <BreadcrumbItem key={breadcrumb.href}>
                {breadcrumb.isLast ? (
                  <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                    {breadcrumb.title}
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink
                      href={breadcrumb.href}
                      className="max-w-20 truncate md:max-w-none"
                    >
                      {breadcrumb.title}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Search */}
      <div className="hidden md:flex md:w-64">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}