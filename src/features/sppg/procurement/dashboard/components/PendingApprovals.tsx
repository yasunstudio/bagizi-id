/**
 * @fileoverview Pending Approvals Component
 * @description Displays procurements waiting for approval
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface PendingApproval {
  id: string
  procurementCode: string | null
  procurementDate: Date
  totalAmount: number
  supplier: {
    supplierName: string
  } | null
}

interface PendingApprovalsProps {
  approvals: PendingApproval[]
}

/**
 * Pending Approvals Component
 * @description Shows procurements that need approval with action buttons
 */
export function PendingApprovals({ approvals }: PendingApprovalsProps) {
  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Pending Approval
          </CardTitle>
          <CardDescription>Procurement yang menunggu persetujuan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">
              Semua procurement sudah disetujui
            </p>
            <p className="text-xs text-muted-foreground">
              Tidak ada yang menunggu approval
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-yellow-200 dark:border-yellow-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Pending Approval
          </CardTitle>
          <CardDescription>
            {approvals.length} procurement menunggu persetujuan
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/procurement/orders?status=PENDING_APPROVAL" className="flex items-center gap-1">
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {approvals.map((approval) => (
            <Link
              key={approval.id}
              href={`/procurement/orders/${approval.id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20 hover:bg-yellow-100/50 dark:hover:bg-yellow-950/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">
                    {approval.procurementCode || 'No Code'}
                  </p>
                  <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                    Perlu Review
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {approval.supplier?.supplierName || 'Unknown Supplier'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Diajukan: {format(new Date(approval.procurementDate), 'dd MMM yyyy', { 
                    locale: localeId 
                  })}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-sm">
                  Rp {approval.totalAmount.toLocaleString('id-ID')}
                </p>
                <Button size="sm" className="mt-2" onClick={(e) => {
                  e.preventDefault()
                  window.location.href = `/procurement/orders/${approval.id}`
                }}>
                  Review
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
