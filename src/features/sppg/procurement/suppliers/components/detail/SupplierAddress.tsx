/**
 * @fileoverview Supplier Address & Location Component
 * @version Next.js 15.5.4
 * @description Display supplier address and delivery information
 * @author Bagizi-ID Development Team
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MapPin } from 'lucide-react'
import type { Supplier } from '@prisma/client'

interface SupplierAddressProps {
  supplier: Pick<Supplier,
    | 'address'
    | 'city'
    | 'province'
    | 'postalCode'
    | 'deliveryRadius'
  >
}

export function SupplierAddress({ supplier }: SupplierAddressProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle>Alamat & Lokasi</CardTitle>
        </div>
        <CardDescription>Informasi lokasi dan jangkauan pengiriman</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Alamat Lengkap</p>
            <p className="font-medium">{supplier.address}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kota</p>
              <p className="font-medium mt-1">{supplier.city}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Provinsi</p>
              <p className="font-medium mt-1">{supplier.province}</p>
            </div>
            {supplier.postalCode && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kode Pos</p>
                <p className="font-medium mt-1">{supplier.postalCode}</p>
              </div>
            )}
            {supplier.deliveryRadius && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Radius Pengiriman</p>
                <p className="font-medium mt-1">{supplier.deliveryRadius} KM</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
