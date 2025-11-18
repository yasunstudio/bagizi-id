/**
 * @fileoverview Supplier Documents & Compliance Component
 * @version Next.js 15.5.4
 * @description Display supplier business documents, certifications, and compliance status
 * @author Bagizi-ID Development Team
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, CheckCircle2, Award, DollarSign } from 'lucide-react'
import type { Supplier } from '@prisma/client'

interface SupplierDocumentsProps {
  supplier: Pick<Supplier,
    | 'businessLicense'
    | 'taxId'
    | 'isHalalCertified'
    | 'isFoodSafetyCertified'
    | 'isISOCertified'
    | 'certifications'
    | 'paymentTerms'
    | 'creditLimit'
    | 'currency'
    | 'bankName'
    | 'bankAccount'
    | 'complianceStatus'
    | 'lastInspectionDate'
    | 'lastAuditDate'
    | 'nextAuditDue'
    | 'relationshipManager'
  >
}

export function SupplierDocuments({ supplier }: SupplierDocumentsProps) {
  return (
    <div className="space-y-6">
      {/* Business Documentation Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Dokumentasi Bisnis</CardTitle>
          </div>
          <CardDescription>Lisensi dan sertifikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lisensi Bisnis</p>
                <p className="font-medium mt-1">{supplier.businessLicense || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NPWP</p>
                <p className="font-medium mt-1">{supplier.taxId || '-'}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium">Sertifikasi</p>
              <div className="flex flex-wrap gap-2">
                {supplier.isHalalCertified && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Halal
                  </Badge>
                )}
                {supplier.isFoodSafetyCertified && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Food Safety
                  </Badge>
                )}
                {supplier.isISOCertified && (
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    ISO
                  </Badge>
                )}
                {!supplier.isHalalCertified && !supplier.isFoodSafetyCertified && !supplier.isISOCertified && (
                  <p className="text-sm text-muted-foreground">Tidak ada sertifikasi</p>
                )}
              </div>
            </div>

            {supplier.certifications && supplier.certifications.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Sertifikasi Lainnya</p>
                  <div className="flex flex-wrap gap-2">
                    {supplier.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline">{cert}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial & Terms Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Informasi Keuangan</CardTitle>
          </div>
          <CardDescription>Terms pembayaran dan informasi bank</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terms Pembayaran</p>
                <p className="font-medium mt-1">{supplier.paymentTerms.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Limit Kredit</p>
                <p className="font-medium mt-1">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: supplier.currency,
                    minimumFractionDigits: 0,
                  }).format(supplier.creditLimit || 0)}
                </p>
              </div>
            </div>

            {(supplier.bankName || supplier.bankAccount) && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Informasi Bank</p>
                  <div className="space-y-2">
                    {supplier.bankName && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Nama Bank:</span>
                        <span className="font-medium">{supplier.bankName}</span>
                      </div>
                    )}
                    {supplier.bankAccount && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">No. Rekening:</span>
                        <span className="font-medium font-mono">{supplier.bankAccount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance & Audit Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle>Kepatuhan & Audit</CardTitle>
          </div>
          <CardDescription>Status compliance dan inspeksi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Status Compliance</p>
              <Badge 
                variant={
                  supplier.complianceStatus === 'VERIFIED' 
                    ? 'default' 
                    : supplier.complianceStatus === 'EXPIRED'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {supplier.complianceStatus === 'VERIFIED' && 'Terverifikasi'}
                {supplier.complianceStatus === 'PENDING' && 'Pending'}
                {supplier.complianceStatus === 'EXPIRED' && 'Expired'}
              </Badge>
            </div>

            {supplier.lastInspectionDate && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inspeksi Terakhir</p>
                  <p className="font-medium mt-1">
                    {new Date(supplier.lastInspectionDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </>
            )}

            {supplier.lastAuditDate && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Audit Terakhir</p>
                  <p className="font-medium mt-1">
                    {new Date(supplier.lastAuditDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </>
            )}

            {supplier.nextAuditDue && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Audit Berikutnya</p>
                  <p className="font-medium mt-1">
                    {new Date(supplier.nextAuditDue).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </>
            )}

            {supplier.relationshipManager && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Relationship Manager</p>
                  <p className="font-medium mt-1">{supplier.relationshipManager}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
