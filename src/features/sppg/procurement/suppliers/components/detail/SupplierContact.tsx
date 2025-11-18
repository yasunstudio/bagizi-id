/**
 * @fileoverview Supplier Contact Information Component
 * @version Next.js 15.5.4
 * @description Display supplier contact details
 * @author Bagizi-ID Development Team
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Building2, Phone, Mail, MessageSquare, Globe, ExternalLink } from 'lucide-react'
import type { Supplier } from '@prisma/client'

interface SupplierContactProps {
  supplier: Pick<Supplier,
    | 'primaryContact'
    | 'phone'
    | 'email'
    | 'whatsapp'
    | 'website'
  >
}

export function SupplierContact({ supplier }: SupplierContactProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <CardTitle>Informasi Kontak</CardTitle>
        </div>
        <CardDescription>Detail kontak supplier</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Primary Contact */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-md">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Kontak Utama</p>
              <p className="font-medium">{supplier.primaryContact}</p>
            </div>
          </div>

          <Separator />

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-md">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Telepon</p>
              <p className="font-medium">{supplier.phone}</p>
            </div>
          </div>

          {/* Email (conditional) */}
          {supplier.email && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a 
                    href={`mailto:${supplier.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {supplier.email}
                  </a>
                </div>
              </div>
            </>
          )}

          {/* WhatsApp (conditional) */}
          {supplier.whatsapp && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-md">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
                  <a 
                    href={`https://wa.me/${supplier.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {supplier.whatsapp}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </>
          )}

          {/* Website (conditional) */}
          {supplier.website && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-md">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <a 
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {supplier.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
