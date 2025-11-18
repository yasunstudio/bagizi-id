/**
 * Beneficiary Organization Overview Tab Component
 * Displays organization statistics and detailed information
 * 
 * @component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  School,
  Heart,
  FileText,
} from 'lucide-react'
import {
  organizationTypeLabels,
  organizationSubTypeLabels,
  ownershipStatusLabels,
} from '../../schemas/beneficiaryOrganizationSchema'
import type { BeneficiaryOrganizationDetail } from '../../api/beneficiaryOrganizationApi'

interface BeneficiaryOrganizationOverviewTabProps {
  organization: BeneficiaryOrganizationDetail
}

export function BeneficiaryOrganizationOverviewTab({
  organization,
}: BeneficiaryOrganizationOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Organization Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Nama Organisasi</div>
              <div className="font-medium">{organization.organizationName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Kode Organisasi</div>
              <div className="font-medium font-mono">{organization.organizationCode}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Jenis Organisasi</div>
              <div className="font-medium">
                {organizationTypeLabels[organization.type as keyof typeof organizationTypeLabels] || organization.type}
              </div>
            </div>
            {organization.subType && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Sub Jenis</div>
                <div className="font-medium">
                  {organizationSubTypeLabels[organization.subType as keyof typeof organizationSubTypeLabels] || organization.subType}
                </div>
              </div>
            )}
            {organization.ownershipStatus && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status Kepemilikan</div>
                <div className="font-medium">
                  {ownershipStatusLabels[organization.ownershipStatus as keyof typeof ownershipStatusLabels] || organization.ownershipStatus}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Alamat</div>
              <div className="font-medium">{organization.address}</div>
            </div>
            {organization.village && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Kelurahan/Desa</div>
                <div className="font-medium">{organization.village.name}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {organization.district && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Kecamatan</div>
                  <div className="font-medium">{organization.district.name}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {organization.regency?.type === 'CITY' ? 'Kota' : 'Kabupaten'}
                </div>
                <div className="font-medium">{organization.regency?.name || '-'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Provinsi</div>
                <div className="font-medium">{organization.province?.name || '-'}</div>
              </div>
              {organization.postalCode && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Kode Pos</div>
                  <div className="font-medium">{organization.postalCode}</div>
                </div>
              )}
            </div>
            {(organization.latitude || organization.longitude) && (
              <div className="grid grid-cols-2 gap-4">
                {organization.latitude && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Latitude</div>
                    <div className="font-medium font-mono">{organization.latitude}</div>
                  </div>
                )}
                {organization.longitude && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Longitude</div>
                    <div className="font-medium font-mono">{organization.longitude}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Kontak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organization.contactPerson && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Nama Kontak</div>
                <div className="font-medium">{organization.contactPerson}</div>
              </div>
            )}
            {organization.contactTitle && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Jabatan</div>
                <div className="font-medium">{organization.contactTitle}</div>
              </div>
            )}
            {organization.phone && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Telepon</div>
                <div className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {organization.phone}
                </div>
              </div>
            )}
            {organization.email && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {organization.email}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Capacity & Membership Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {organization.type === 'INTEGRATED_SERVICE_POST'
                ? 'Data Keanggotaan'
                : 'Kapasitas & Personel'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Staff Counts */}
            {organization.teachingStaffCount !== null && organization.teachingStaffCount !== undefined && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {organization.type === 'SCHOOL'
                    ? 'Jumlah Guru'
                    : organization.type === 'HEALTH_FACILITY'
                    ? 'Tenaga Medis'
                    : 'Jumlah Kader'}
                </div>
                <div className="font-medium">{organization.teachingStaffCount} orang</div>
              </div>
            )}
            {organization.nonTeachingStaffCount !== null && organization.nonTeachingStaffCount !== undefined && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Tenaga Non-Pengajar (Tendik)
                </div>
                <div className="font-medium">{organization.nonTeachingStaffCount} orang</div>
              </div>
            )}
            {organization.establishedYear && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Tahun Berdiri</div>
                <div className="font-medium">{organization.establishedYear}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Status Operasional</div>
              <div>
                <Badge variant={organization.operationalStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                  {organization.operationalStatus === 'ACTIVE' && 'Aktif'}
                  {organization.operationalStatus === 'INACTIVE' && 'Tidak Aktif'}
                  {organization.operationalStatus === 'TEMPORARILY_CLOSED' && 'Tutup Sementara'}
                  {!['ACTIVE', 'INACTIVE', 'TEMPORARILY_CLOSED'].includes(organization.operationalStatus) && organization.operationalStatus}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Status Organisasi</div>
              <div>
                <Badge variant={organization.isActive ? 'default' : 'destructive'}>
                  {organization.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* School Specific Info */}
      {organization.type === 'SCHOOL' &&
        (organization.npsn || organization.principalName || organization.principalNip) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Informasi Sekolah
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {organization.npsn && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">NPSN</div>
                  <div className="font-medium font-mono">{organization.npsn}</div>
                </div>
              )}
              {organization.principalName && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Kepala Sekolah</div>
                  <div className="font-medium">{organization.principalName}</div>
                </div>
              )}
              {organization.principalNip && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">NIP</div>
                  <div className="font-medium font-mono">{organization.principalNip}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* Health Facility Specific Info */}
      {organization.type === 'HEALTH_FACILITY' &&
        (organization.nikkes || organization.registrationNumber || organization.principalName || organization.principalNip) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Informasi Fasilitas Kesehatan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organization.nikkes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">NIKKES</div>
                  <div className="font-medium font-mono">{organization.nikkes}</div>
                </div>
              )}
              {organization.registrationNumber && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Nomor Registrasi</div>
                  <div className="font-medium font-mono">{organization.registrationNumber}</div>
                </div>
              )}
              {organization.principalName && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Kepala Faskes</div>
                  <div className="font-medium">{organization.principalName}</div>
                </div>
              )}
              {organization.principalNip && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">NIP</div>
                  <div className="font-medium font-mono">{organization.principalNip}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* Posyandu Specific Info */}
      {organization.type === 'INTEGRATED_SERVICE_POST' &&
        (organization.registrationNumber || organization.principalName) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Informasi Posyandu
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organization.registrationNumber && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Nomor Registrasi</div>
                  <div className="font-medium font-mono">{organization.registrationNumber}</div>
                </div>
              )}
              {organization.principalName && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ketua Posyandu</div>
                  <div className="font-medium">{organization.principalName}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* Notes */}
      {organization.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Catatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{organization.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
