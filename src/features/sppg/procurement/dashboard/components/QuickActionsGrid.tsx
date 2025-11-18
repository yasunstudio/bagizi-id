/**
 * @fileoverview Quick Actions Grid Component
 * @description Navigation cards for main procurement modules
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ShoppingCart, 
  ClipboardList, 
  Building2, 
  FileText,
  ArrowRight 
} from 'lucide-react'

const actions = [
  {
    title: 'Kelola Orders',
    description: 'Buat dan kelola procurement orders',
    icon: ShoppingCart,
    href: '/procurement/orders',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    title: 'Perencanaan',
    description: 'Buat dan atur rencana procurement',
    icon: ClipboardList,
    href: '/procurement/plans',
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    title: 'Suppliers',
    description: 'Kelola daftar supplier dan kontrak',
    icon: Building2,
    href: '/procurement/suppliers',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    title: 'Laporan',
    description: 'Lihat laporan dan analisis procurement',
    icon: FileText,
    href: '/procurement/reports',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
]

/**
 * Quick Actions Grid Component
 * @description Displays navigation cards to main procurement modules
 */
export function QuickActionsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon
        
        return (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-lg transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${action.bgColor}`}>
                    <Icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
