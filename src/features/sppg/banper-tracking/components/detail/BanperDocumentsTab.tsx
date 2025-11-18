/**
 * @fileoverview Banper Documents Tab Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, ExternalLink } from 'lucide-react'
import type { BanperRequestTrackingWithRelations } from '../../types'

interface BanperDocumentsTabProps {
  tracking: BanperRequestTrackingWithRelations
}

export function BanperDocumentsTab({ tracking }: BanperDocumentsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dokumen Utama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Proposal Document */}
          {tracking.proposalDocumentUrl ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Dokumen Proposal</p>
                  <p className="text-sm text-muted-foreground">Proposal pengajuan banper</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={tracking.proposalDocumentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Lihat
                </a>
              </Button>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Dokumen proposal belum diunggah</p>
            </div>
          )}

          {/* RAB Document */}
          {tracking.rabDocumentUrl ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Dokumen RAB</p>
                  <p className="text-sm text-muted-foreground">Rencana Anggaran Biaya</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={tracking.rabDocumentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Lihat
                </a>
              </Button>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Dokumen RAB belum diunggah</p>
            </div>
          )}

          {/* Approval Document */}
          {tracking.bgnApprovalDocumentUrl && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Dokumen Persetujuan BGN</p>
                  <p className="text-sm text-muted-foreground">
                    {tracking.bgnApprovalNumber || 'Nomor tidak tersedia'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={tracking.bgnApprovalDocumentUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Unduh
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supporting Documents */}
      {tracking.supportingDocuments && tracking.supportingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dokumen Pendukung ({tracking.supportingDocuments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tracking.supportingDocuments.map((url, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">Dokumen Pendukung {index + 1}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portal Link */}
      {tracking.bgnPortalUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Portal BGN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Lacak Status di Portal BGN</p>
                <p className="text-sm text-muted-foreground">{tracking.bgnRequestNumber}</p>
              </div>
              <Button asChild>
                <a href={tracking.bgnPortalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Buka Portal
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
