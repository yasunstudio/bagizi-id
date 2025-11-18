/**
 * @fileoverview SPPG Sidebar Navigation dengan menu lengkap SPPG operations
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * HYDRATION SAFETY:
 * - Uses client-side mounting flag to prevent hydration mismatch
 * - DropdownMenu components with Radix UI generate random IDs
 * - Random IDs differ between SSR and CSR causing hydration errors
 * - Solution: Delay DropdownMenu render until after client mount
 * - Maintains layout with skeleton during SSR
 * 
 * @see {@link https://react.dev/link/hydration-mismatch} React Hydration
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Building2,
  LayoutDashboard,
  ChefHat,
  Calendar,
  ShoppingCart,
  Factory,
  Truck,
  Package,
  Users,
  FileText,
  Settings,
  ChevronUp,
  ChevronDown,
  LogOut,
  UserCog,
  Briefcase,
  Activity,
  Building,
  Layers,
  ClipboardList,
  ShoppingBag,
  PackageCheck,
  CreditCard,
  BarChart2,
  Cog,
  Bell,
  MessageSquare,
  Wallet,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface SppgSidebarProps {
  className?: string
  onClose?: () => void
}

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | null
  resource?: string
  children?: NavigationSubItem[]
}

interface NavigationSubItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | null
  roles?: string[]
}

interface NavigationGroup {
  title: string
  items: NavigationItem[]
}

// SPPG Navigation Items sesuai copilot instructions
const sppgNavigation: NavigationGroup[] = [
  {
    title: 'Ringkasan',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        badge: null
      }
    ]
  },
  {
    title: 'Manajemen Program',
    items: [
      {
        title: 'Program Gizi',
        href: '/program',
        icon: Briefcase,
        badge: null,
        resource: 'program'
      },
      {
        title: 'Organisasi Penerima',
        href: '/beneficiary-organizations',
        icon: Building,
        badge: null,
        resource: 'beneficiary'
      }
    ]
  },
  {
    title: 'Operasional',
    items: [
      {
        title: 'Manajemen Menu',
        href: '/menu',
        icon: ChefHat,
        badge: null,
        resource: 'menu'
      },
      {
        title: 'Perencanaan Menu',
        href: '/menu-planning',
        icon: Calendar,
        badge: null,
        resource: 'menu-planning'
      },
      {
        title: 'Pengadaan',
        href: '/procurement',
        icon: ShoppingCart,
        badge: null, // Pending orders
        resource: 'procurement',
        children: [
          {
            title: 'Dashboard',
            href: '/procurement',
            icon: ClipboardList,
            badge: null,
            roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN', 'SPPG_STAFF']
          },
          {
            title: 'Perencanaan',
            href: '/procurement/plans',
            icon: ClipboardList,
            badge: null, // Pending approval count
            roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN']
          },
          {
            title: 'Purchase Orders',
            href: '/procurement/orders',
            icon: ShoppingBag,
            badge: null, // Ordered count
            roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN', 'SPPG_STAFF']
          },
          {
            title: 'Penerimaan Barang',
            href: '/procurement/receipts',
            icon: PackageCheck,
            badge: null, // Awaiting QC count
            roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_STAFF_QC', 'SPPG_STAFF']
          },
          {
            title: 'Supplier',
            href: '/procurement/suppliers',
            icon: Building2,
            badge: null,
            roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN']
          },
          {
            title: 'Pembayaran',
            href: '/procurement/payments',
            icon: CreditCard,
            badge: null, // Overdue count
            roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN']
          },
          {
            title: 'Laporan',
            href: '/procurement/reports',
            icon: BarChart2,
            badge: null,
            roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN']
          },
          {
            title: 'Pengaturan',
            href: '/procurement/settings',
            icon: Cog,
            badge: null,
            roles: ['SPPG_KEPALA', 'SPPG_ADMIN']
          }
        ]
      },
      {
        title: 'Produksi',
        href: '/production',
        icon: Factory,
        badge: null,
        resource: 'production'
      },
      {
        title: 'Distribusi',
        href: '/distribution',
        icon: Truck,
        badge: null,
        resource: 'distribution'
      }
    ]
  },
  {
    title: 'Manajemen',
    items: [
      {
        title: 'Inventori',
        href: '/inventory',
        icon: Package,
        badge: null,
        resource: 'inventory'
      },
      {
        title: 'Pergerakan Stok',
        href: '/inventory/stock-movements',
        icon: Activity,
        badge: null,
        resource: 'inventory'
      },
      {
        title: 'Manajemen Pengguna',
        href: '/users',
        icon: UserCog,
        badge: null,
        resource: 'users'
      },
    ]
  },
  {
    title: 'Anggaran Pemerintah',
    items: [
      {
        title: 'Permintaan Banper',
        href: '/banper-tracking',
        icon: Wallet,
        badge: null,
        resource: 'budget'
      },
      {
        title: 'Transaksi Anggaran',
        href: '/budget-transactions',
        icon: CreditCard,
        badge: null,
        resource: 'budget'
      }
    ]
  },
  {
    title: 'Sumber Daya Manusia',
    items: [
      {
        title: 'Departemen',
        href: '/hrd/departments',
        icon: Building,
        badge: null,
        resource: 'hrd'
      },
      {
        title: 'Jabatan',
        href: '/hrd/positions',
        icon: Layers,
        badge: null,
        resource: 'hrd'
      },
      {
        title: 'Karyawan',
        href: '/hrd/employees',
        icon: Users,
        badge: null,
        resource: 'hrd'
      },
    ]
  },
  {
    title: 'Laporan & Analitik',
    items: [
      {
        title: 'Laporan',
        href: '/reports',
        icon: FileText,
        badge: null,
        resource: 'reports'
      }
    ]
  },
  {
    title: 'Notifikasi',
    items: [
      {
        title: 'Log Notifikasi',
        href: '/notifications/logs',
        icon: Bell,
        badge: null, // Can show unread count
        resource: 'notifications'
      }
    ]
  },
  {
    title: 'Pengaturan',
    items: [
      {
        title: 'Pengaturan SPPG',
        href: '/settings',
        icon: Settings,
        badge: null,
        resource: 'settings',
        children: [
          {
            title: 'General',
            href: '/settings',
            icon: Cog,
            badge: null,
            roles: ['SPPG_KEPALA', 'SPPG_ADMIN']
          },
          {
            title: 'Notifications',
            href: '/settings/notifications',
            icon: MessageSquare,
            badge: null,
            roles: ['SPPG_KEPALA', 'SPPG_ADMIN']
          }
        ]
      }
    ]
  }
]

export function SppgSidebar({ className, onClose }: SppgSidebarProps) {
  const pathname = usePathname()
  const { user, canAccess, logout } = useAuth()
  const [openProcurement, setOpenProcurement] = useState(
    pathname.startsWith('/procurement')
  )
  
  // Track client-side mounting to prevent hydration mismatch
  // Enterprise Pattern: Delay rendering of components with random IDs
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Helper function to check if user has specific role
  const hasRole = (allowedRoles?: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true
    if (!user?.userRole) return false
    return allowedRoles.includes(user.userRole)
  }

  return (
    <Sidebar collapsible="icon" className={cn(className)}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">SPPG Dashboard</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email || 'SPPG Purwakarta'}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        {sppgNavigation.map((group, index) => (
          <React.Fragment key={group.title}>
            <SidebarGroup>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    // Check resource access permissions
                    if (item.resource && !canAccess(item.resource)) {
                      return null
                    }

                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    
                    // Check if item has children (submenu)
                    if (item.children && item.children.length > 0) {
                      // Filter children based on user roles
                      const allowedChildren = item.children.filter(child => hasRole(child.roles))
                      
                      if (allowedChildren.length === 0) return null
                      
                      return (
                        <Collapsible
                          key={item.href}
                          open={openProcurement}
                          onOpenChange={setOpenProcurement}
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton isActive={isActive}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                                <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            {item.badge && (
                              <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                            )}
                          </SidebarMenuItem>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {allowedChildren.map((subItem) => {
                                const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                                
                                return (
                                  <SidebarMenuSubItem key={subItem.href}>
                                    <SidebarMenuSubButton asChild isActive={isSubActive}>
                                      <Link href={subItem.href} onClick={onClose}>
                                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                    {subItem.badge && (
                                      <SidebarMenuBadge>{subItem.badge}</SidebarMenuBadge>
                                    )}
                                  </SidebarMenuSubItem>
                                )
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      )
                    }
                    
                    // Regular menu item without submenu
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href} onClick={onClose}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {/* Add separator between groups, except after last group */}
            {index < sppgNavigation.length - 1 && <SidebarSeparator />}
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* Footer with User Dropdown */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Only render DropdownMenu after client-side mount to prevent hydration mismatch */}
            {isMounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar || ''} alt={user?.name || ''} />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name || 'User'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email || 'user@sppg.id'}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="top"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem>
                    <UserCog className="mr-2 size-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Skeleton/placeholder during SSR to maintain layout
              <SidebarMenuButton size="lg">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.name || 'User'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email || 'user@sppg.id'}
                  </span>
                </div>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      {/* Sidebar Rail for better hover/toggle UX */}
      <SidebarRail />
    </Sidebar>
  )
}