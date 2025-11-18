/**
 * @fileoverview Supplier Form Component - Comprehensive & Robust
 * @version Next.js 15.5.4 / React Hook Form + Zod / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Building2, Phone, MapPin, FileText, CreditCard } from 'lucide-react'

import type { Supplier, CreateSupplierInput } from '@/features/sppg/procurement/suppliers/types'

// ================================ VALIDATION SCHEMA ================================

const supplierFormSchema = z.object({
  supplierName: z.string().min(3, 'Nama supplier minimal 3 karakter'),
  businessName: z.string().optional(),
  supplierType: z.enum(['LOCAL', 'REGIONAL', 'NATIONAL', 'INTERNATIONAL', 'COOPERATIVE', 'INDIVIDUAL']),
  category: z.string().min(1, 'Kategori harus dipilih'),
  
  // Contact
  primaryContact: z.string().min(3, 'Nama kontak harus diisi'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  website: z.string().url('URL tidak valid').optional().or(z.literal('')),
  
  // Address
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  city: z.string().min(2, 'Kota harus diisi'),
  province: z.string().min(2, 'Provinsi harus diisi'),
  postalCode: z.string().optional(),
  
  // Business
  businessLicense: z.string().optional(),
  taxId: z.string().optional(),
  hallaLicense: z.string().optional(),
  
  // Financial
  paymentTerms: z.string().min(1, 'Syarat pembayaran harus dipilih'),
  creditLimit: z.number().min(0).optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
})

type SupplierFormData = z.infer<typeof supplierFormSchema>

// ================================ COMPONENT PROPS ================================

interface SupplierFormProps {
  supplier?: Supplier
  onSubmit: (data: CreateSupplierInput) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

// ================================ COMPONENT ================================

export const SupplierForm: FC<SupplierFormProps> = ({
  supplier,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = !!supplier

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      supplierName: supplier?.supplierName || '',
      businessName: supplier?.businessName || '',
      supplierType: supplier?.supplierType || 'LOCAL',
      category: supplier?.category || '',
      primaryContact: supplier?.primaryContact || '',
      phone: supplier?.phone || '',
      email: supplier?.email || '',
      whatsapp: supplier?.whatsapp || '',
      website: supplier?.website || '',
      address: supplier?.address || '',
      city: supplier?.city || '',
      province: supplier?.province || '',
      postalCode: supplier?.postalCode || '',
      businessLicense: supplier?.businessLicense || '',
      taxId: supplier?.taxId || '',
      hallaLicense: supplier?.hallaLicense || '',
      paymentTerms: supplier?.paymentTerms || 'CASH_ON_DELIVERY',
      creditLimit: supplier?.creditLimit || undefined,
      bankName: supplier?.bankName || '',
      bankAccount: supplier?.bankAccount || '',
    },
  })

  // Reset form when supplier changes
  useEffect(() => {
    if (supplier) {
      form.reset({
        supplierName: supplier.supplierName,
        businessName: supplier.businessName || '',
        supplierType: supplier.supplierType,
        category: supplier.category,
        primaryContact: supplier.primaryContact,
        phone: supplier.phone,
        email: supplier.email || '',
        whatsapp: supplier.whatsapp || '',
        website: supplier.website || '',
        address: supplier.address,
        city: supplier.city,
        province: supplier.province,
        postalCode: supplier.postalCode || '',
        businessLicense: supplier.businessLicense || '',
        taxId: supplier.taxId || '',
        hallaLicense: supplier.hallaLicense || '',
        paymentTerms: supplier.paymentTerms,
        creditLimit: supplier.creditLimit || undefined,
        bankName: supplier.bankName || '',
        bankAccount: supplier.bankAccount || '',
      })
    }
  }, [supplier, form])

  const handleSubmit = (data: SupplierFormData) => {
    onSubmit(data as CreateSupplierInput)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>
                {isEditing ? 'Edit Supplier' : 'Tambah Supplier Baru'}
              </CardTitle>
            </div>
            <CardDescription>
              {isEditing 
                ? 'Perbarui informasi supplier yang sudah ada'
                : 'Lengkapi informasi supplier baru untuk sistem pengadaan'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Informasi Dasar</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Supplier *</FormLabel>
                      <FormControl>
                        <Input placeholder="PT Supplier Makanan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Badan Usaha</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama legal perusahaan" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nama resmi untuk dokumen legal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Supplier *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOCAL">Lokal</SelectItem>
                          <SelectItem value="REGIONAL">Regional</SelectItem>
                          <SelectItem value="NATIONAL">Nasional</SelectItem>
                          <SelectItem value="INTERNATIONAL">Internasional</SelectItem>
                          <SelectItem value="COOPERATIVE">Koperasi</SelectItem>
                          <SelectItem value="INDIVIDUAL">Perorangan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori Produk *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PROTEIN">Protein (Daging, Ikan, Telur)</SelectItem>
                          <SelectItem value="VEGETABLES">Sayuran</SelectItem>
                          <SelectItem value="FRUITS">Buah-buahan</SelectItem>
                          <SelectItem value="GRAINS">Biji-bijian & Karbohidrat</SelectItem>
                          <SelectItem value="DAIRY">Susu & Produk Olahan</SelectItem>
                          <SelectItem value="SPICES">Bumbu & Rempah</SelectItem>
                          <SelectItem value="PACKAGING">Kemasan</SelectItem>
                          <SelectItem value="OTHER">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <Badge variant="outline">Informasi Kontak</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kontak Utama *</FormLabel>
                      <FormControl>
                        <Input placeholder="Budi Santoso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon *</FormLabel>
                      <FormControl>
                        <Input placeholder="081234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="supplier@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="081234567890" {...field} />
                      </FormControl>
                      <FormDescription>
                        Untuk komunikasi cepat
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.supplier.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <Badge variant="outline">Alamat</Badge>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Lengkap *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kota *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jakarta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provinsi *</FormLabel>
                        <FormControl>
                          <Input placeholder="DKI Jakarta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Pos</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Business Documentation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <Badge variant="outline">Dokumen Bisnis</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Izin Usaha</FormLabel>
                      <FormControl>
                        <Input placeholder="NIB: 1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPWP</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000.0-000.000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hallaLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sertifikat Halal</FormLabel>
                      <FormControl>
                        <Input placeholder="Nomor sertifikat halal" {...field} />
                      </FormControl>
                      <FormDescription>
                        Jika tersedia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Financial Terms */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <Badge variant="outline">Syarat Keuangan</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Syarat Pembayaran *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih syarat pembayaran" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH_ON_DELIVERY">Cash on Delivery (COD)</SelectItem>
                          <SelectItem value="NET_7">Net 7 (Bayar dalam 7 hari)</SelectItem>
                          <SelectItem value="NET_15">Net 15 (Bayar dalam 15 hari)</SelectItem>
                          <SelectItem value="NET_30">Net 30 (Bayar dalam 30 hari)</SelectItem>
                          <SelectItem value="NET_45">Net 45 (Bayar dalam 45 hari)</SelectItem>
                          <SelectItem value="PREPAID">Prepaid (Bayar di muka)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limit Kredit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Dalam Rupiah
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Bank</FormLabel>
                      <FormControl>
                        <Input placeholder="Bank BCA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Rekening</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Batal
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Perbarui Supplier' : 'Simpan Supplier'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
