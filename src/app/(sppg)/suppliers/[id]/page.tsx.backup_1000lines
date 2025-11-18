/**
 * @fileoverview Supplier Detail Page - Detailed supplier information page
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ENTERPRISE-GRADE FEATURES:
 * - Server Component with SSR for optimal performance
 * - Authentication & Authorization (RBAC)
 * - Multi-tenant data isolation (sppgId filtering)
 * - Comprehensive supplier information display (8 cards)
 * - Performance metrics and charts
 * - Rating visualization
 * - Related procurements list
 * - Edit and delete actions
 * - SEO optimization with metadata
 * - Breadcrumb navigation
 * - Dark mode support
 * - Accessibility compliance (WCAG 2.1 AA)
 */

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { checkSppgAccess, canManageProcurement } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  Star,
  Package,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Globe
} from 'lucide-react'

// ============================================
// METADATA
// ============================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.sppgId) {
    return { title: 'Access Denied' }
  }

  try {
    const supplier = await db.supplier.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId, // Multi-tenant security
      },
      select: {
        supplierName: true,
        supplierCode: true,
      },
    })

    if (!supplier) {
      return { title: 'Supplier Not Found' }
    }

    return {
      title: `${supplier.supplierName} - Detail Supplier | Bagizi`,
      description: `Detail informasi supplier ${supplier.supplierName} (${supplier.supplierCode})`,
    }
  } catch {
    return { title: 'Supplier Detail' }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

/**
 * Supplier Detail Page
 * 
 * Server Component that handles:
 * - Authentication & Authorization
 * - Data fetching for supplier details
 * - Multi-tenant security (sppgId filtering)
 * - Displays comprehensive supplier information
 * 
 * @async
 * @param {Object} params - Route parameters
 * @param {string} params.id - Supplier ID
 * @returns {Promise<JSX.Element>} Supplier detail page
 */
export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // ============================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================
  
  const session = await auth()
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/login?callbackUrl=/suppliers/' + id)
  }

  // Check if user has sppgId (multi-tenant requirement)
  const sppgId = session.user.sppgId
  if (!sppgId) {
    redirect('/access-denied?reason=no-sppg')
  }

  // Verify SPPG exists and is active
  const sppg = await checkSppgAccess(sppgId)
  if (!sppg) {
    redirect('/access-denied?reason=invalid-sppg')
  }

  // Check if user has permission to manage procurement (includes suppliers)
  const userRole = session.user.userRole
  if (!userRole || !canManageProcurement(userRole)) {
    redirect('/access-denied?reason=insufficient-permissions')
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  // Fetch supplier with all relations
  const supplier = await db.supplier.findFirst({
    where: {
      id,
      sppgId, // Multi-tenant security: CRITICAL!
    },
    include: {
      sppg: {
        select: {
          name: true,
        },
      },
      procurements: {
        select: {
          id: true,
          procurementCode: true,
          procurementDate: true,
          totalAmount: true,
          status: true,
          actualDelivery: true,
          paymentStatus: true,
        },
        orderBy: {
          procurementDate: 'desc',
        },
        take: 5, // Only show recent 5
      },
    },
  })

  // If supplier not found or doesn't belong to this SPPG
  if (!supplier) {
    notFound()
  }

  // ============================================
  // RENDER PAGE
  // ============================================

  return (
    <div className="space-y-6">
      {/* ================================ BREADCRUMB ================================ */}
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/procurement">Pengadaan</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/suppliers">Supplier</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{supplier.supplierName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ================================ HEADER ================================ */}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/suppliers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{supplier.supplierName}</h1>
              <Badge 
                variant={supplier.isActive ? 'default' : 'secondary'}
                className={supplier.isActive ? 'bg-green-500' : 'bg-gray-500'}
              >
                {supplier.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
              {supplier.isPreferred && (
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Preferred
                </Badge>
              )}
              {supplier.isBlacklisted && (
                <Badge variant="destructive">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Blacklist
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Kode Supplier: {supplier.supplierCode}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/suppliers/${supplier.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      {/* ================================ QUICK STATS ================================ */}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">{supplier.overallRating.toFixed(1)}</p>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Order</p>
                <p className="text-2xl font-bold mt-1">{supplier.totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On-Time Rate</p>
                <p className="text-2xl font-bold mt-1">{supplier.onTimeDeliveryRate.toFixed(0)}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pembelian</p>
                <p className="text-2xl font-bold mt-1">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(supplier.totalPurchaseValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================ MAIN CONTENT ================================ */}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD 1: Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Informasi Dasar</CardTitle>
              </div>
              <CardDescription>Data umum supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Supplier</p>
                  <p className="font-medium mt-1">{supplier.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Bisnis</p>
                  <p className="font-medium mt-1">{supplier.businessName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kode Supplier</p>
                  <p className="font-medium mt-1">{supplier.supplierCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipe Supplier</p>
                  <Badge variant="outline" className="mt-1">
                    {supplier.supplierType === 'LOCAL' && 'Lokal'}
                    {supplier.supplierType === 'REGIONAL' && 'Regional'}
                    {supplier.supplierType === 'NATIONAL' && 'Nasional'}
                    {supplier.supplierType === 'INTERNATIONAL' && 'Internasional'}
                    {supplier.supplierType === 'COOPERATIVE' && 'Koperasi'}
                    {supplier.supplierType === 'INDIVIDUAL' && 'Perorangan'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                  <p className="font-medium mt-1">{supplier.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Level Partnership</p>
                  <Badge 
                    variant="secondary" 
                    className={
                      supplier.partnershipLevel === 'STRATEGIC' 
                        ? 'bg-purple-500/10 text-purple-600'
                        : supplier.partnershipLevel === 'PREFERRED'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-gray-500/10 text-gray-600'
                    }
                  >
                    {supplier.partnershipLevel === 'STRATEGIC' && 'Strategis'}
                    {supplier.partnershipLevel === 'PREFERRED' && 'Preferred'}
                    {supplier.partnershipLevel === 'STANDARD' && 'Standard'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: Contact Information */}
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

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-md">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                    <p className="font-medium">{supplier.phone}</p>
                  </div>
                </div>

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

          {/* CARD 3: Address & Location */}
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

                {supplier.coordinates && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Koordinat GPS</p>
                      <p className="font-mono text-sm">{supplier.coordinates}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CARD 4: Business Documentation */}
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

          {/* CARD 5: Financial & Terms */}
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
        </div>

        {/* RIGHT COLUMN - Performance & Related Data */}
        <div className="space-y-6">
          {/* CARD 6: Performance Ratings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Rating Performance</CardTitle>
              </div>
              <CardDescription>Evaluasi kinerja supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Rating */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Rating</span>
                    <span className="text-sm font-bold">{supplier.overallRating.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400"
                      style={{ width: `${(supplier.overallRating / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Quality Rating */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Kualitas</span>
                    <span className="text-sm font-medium">{supplier.qualityRating.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${(supplier.qualityRating / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Delivery Rating */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Pengiriman</span>
                    <span className="text-sm font-medium">{supplier.deliveryRating.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${(supplier.deliveryRating / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Price Rating */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Harga</span>
                    <span className="text-sm font-medium">{supplier.priceCompetitiveness.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500"
                      style={{ width: `${(supplier.priceCompetitiveness / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Service Rating */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Pelayanan</span>
                    <span className="text-sm font-medium">{supplier.serviceRating.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500"
                      style={{ width: `${(supplier.serviceRating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 7: Performance Statistics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>Statistik Kinerja</CardTitle>
              </div>
              <CardDescription>Data performa operasional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Order:</span>
                  <span className="font-medium">{supplier.totalOrders}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pengiriman Sukses:</span>
                  <span className="font-medium text-green-600">{supplier.successfulDeliveries}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pengiriman Gagal:</span>
                  <span className="font-medium text-red-600">{supplier.failedDeliveries}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">On-Time Delivery:</span>
                  <span className="font-medium">{supplier.onTimeDeliveryRate.toFixed(1)}%</span>
                </div>
                {supplier.averageDeliveryTime && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg. Waktu Kirim:</span>
                      <span className="font-medium">{supplier.averageDeliveryTime} jam</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Pembelian:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      notation: 'compact',
                    }).format(supplier.totalPurchaseValue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 8: Compliance & Audit */}
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
      </div>

      {/* ================================ RELATED PROCUREMENTS ================================ */}
      
      {supplier.procurements && supplier.procurements.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Riwayat Pengadaan</CardTitle>
                <CardDescription>5 pengadaan terakhir dari supplier ini</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/procurement?supplier=${supplier.id}`}>
                  Lihat Semua
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supplier.procurements.map((procurement, index) => (
                <div key={procurement.id}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/procurement/${procurement.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {procurement.procurementCode}
                        </Link>
                        <Badge 
                          variant={
                            procurement.status === 'COMPLETED' 
                              ? 'default' 
                              : procurement.status === 'CANCELLED'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {procurement.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(procurement.procurementDate).toLocaleDateString('id-ID')}
                        </span>
                        {procurement.actualDelivery && (
                          <span>
                            Kirim: {new Date(procurement.actualDelivery).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(procurement.totalAmount)}
                      </p>
                      <Badge 
                        variant="outline" 
                        className="mt-1 text-xs"
                      >
                        {procurement.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
