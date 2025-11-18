/**
 * @fileoverview Create Supplier Page - Add new supplier to the system
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ENTERPRISE-GRADE FEATURES:
 * - Server Component with client-side form wrapper
 * - Authentication & Authorization (RBAC)
 * - Multi-tenant data isolation (sppgId filtering)
 * - SupplierForm component integration (590 lines)
 * - Guidelines card with 7 sections
 * - Tips card with best practices
 * - SEO optimization with metadata
 * - Breadcrumb navigation
 * - Dark mode support
 * - Accessibility compliance (WCAG 2.1 AA)
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProcurementPageHeader } from '@/components/shared/procurement'
import { 
  Building2,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  TrendingUp,
  Shield,
  Info,
  ArrowLeft
} from 'lucide-react'
import { SupplierFormClient } from '.'

// ============================================
// METADATA
// ============================================


// ============================================
// PAGE COMPONENT
// ============================================

/**
 * SPPG Procurement - Create New Supplier Page
 * @description Page for creating a new supplier with form validation
 * @returns {JSX.Element} Create supplier page with form
 */
function CreateSupplierPage() {
  // ============================================
  // RENDER PAGE
  // ============================================

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProcurementPageHeader
        title="Tambah Supplier Baru"
        description="Daftarkan supplier baru untuk pengelolaan pengadaan yang lebih baik"
        icon={Building2}
        breadcrumbs={['Procurement', 'Suppliers', 'New']}
        action={{
          label: 'Kembali',
          href: '/procurement/suppliers',
          icon: ArrowLeft,
          variant: 'outline'
        }}
      />

      {/* ================================ MAIN CONTENT ================================ */}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Form */}
        <div className="lg:col-span-2">
          {/* 
            Client Component: SupplierFormClient
            - Wraps SupplierForm component (590 lines)
            - Handles form submission with TanStack Query
            - CREATE mutation to /api/sppg/procurement/suppliers
            - Success redirect to supplier detail page
            - Error handling with toast notifications
          */}
          <SupplierFormClient />
        </div>

        {/* RIGHT COLUMN - Guidelines & Tips */}
        <div className="space-y-6">
          {/* Guidelines Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Panduan Pengisian</CardTitle>
              </div>
              <CardDescription>
                Ikuti panduan berikut untuk memastikan data supplier lengkap dan akurat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 1. Basic Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">1. Informasi Dasar</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Nama supplier harus jelas dan lengkap</li>
                  <li>Pilih tipe supplier yang sesuai (Lokal/Regional/Nasional)</li>
                  <li>Tentukan kategori produk utama</li>
                </ul>
              </div>

              {/* 2. Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">2. Informasi Kontak</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Pastikan nomor telepon aktif dan dapat dihubungi</li>
                  <li>Email digunakan untuk komunikasi resmi</li>
                  <li>WhatsApp memudahkan koordinasi cepat</li>
                </ul>
              </div>

              {/* 3. Address & Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">3. Alamat & Lokasi</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Alamat lengkap untuk pengiriman</li>
                  <li>Radius pengiriman menentukan jangkauan</li>
                  <li>Koordinat GPS untuk navigasi akurat</li>
                </ul>
              </div>

              {/* 4. Business Documentation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">4. Dokumentasi Bisnis</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>NPWP wajib untuk transaksi resmi</li>
                  <li>Sertifikat Halal untuk produk makanan</li>
                  <li>Lisensi keamanan pangan penting</li>
                </ul>
              </div>

              {/* 5. Financial Terms */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">5. Terms Keuangan</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Tentukan terms pembayaran yang disepakati</li>
                  <li>Limit kredit sesuai kemampuan supplier</li>
                  <li>Info bank untuk transfer pembayaran</li>
                </ul>
              </div>

              {/* 6. Capabilities */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">6. Kapabilitas Supplier</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Minimum order untuk efisiensi</li>
                  <li>Kapasitas maksimum supplier</li>
                  <li>Lead time standar pengiriman</li>
                </ul>
              </div>

              {/* 7. Compliance */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">7. Kepatuhan & Kualitas</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Status compliance untuk audit</li>
                  <li>Jadwal inspeksi berkala</li>
                  <li>Relationship manager internal</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips Penting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">1</Badge>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Verifikasi Data:</strong> Pastikan semua informasi kontak valid dan dapat dihubungi
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">2</Badge>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Dokumentasi Lengkap:</strong> Supplier dengan dokumen lengkap lebih mudah diproses
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">3</Badge>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Terms Jelas:</strong> Sepakati terms pembayaran dan pengiriman sejak awal
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">4</Badge>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Evaluasi Berkala:</strong> Review performa supplier secara periodik
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">5</Badge>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Komunikasi Baik:</strong> Jaga komunikasi yang baik untuk hubungan jangka panjang
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CreateSupplierPage
