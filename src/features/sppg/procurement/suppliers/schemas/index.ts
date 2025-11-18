/**
 * @fileoverview Supplier Zod Schemas - Independent Domain
 * @version Next.js 15.5.4 / Zod / Enterprise-grade validation
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 * 
 * ARCHITECTURAL NOTE:
 * Supplier schemas are in independent domain for reusability across modules
 */

import { z } from 'zod'
import { SupplierType } from '@prisma/client'

// ================================ BASE SCHEMAS ================================

/**
 * Supplier type enum schema
 */
export const supplierTypeSchema = z.nativeEnum(SupplierType)

// ================================ SUPPLIER SCHEMAS ================================

/**
 * Supplier creation schema with comprehensive validation
 */
export const supplierCreateSchema = z.object({
  // Basic Information - Required
  supplierName: z.string()
    .min(3, 'Nama supplier minimal 3 karakter')
    .max(255, 'Nama supplier maksimal 255 karakter')
    .regex(/^[a-zA-Z0-9\s\.\,\-\_\(\)]+$/, 'Nama supplier mengandung karakter tidak valid'),
  
  businessName: z.string()
    .min(3, 'Nama bisnis minimal 3 karakter')
    .max(255, 'Nama bisnis maksimal 255 karakter')
    .optional(),
  
  supplierType: supplierTypeSchema,
  
  category: z.string()
    .min(2, 'Kategori minimal 2 karakter')
    .max(100, 'Kategori maksimal 100 karakter'),
  
  // Contact Information - Required
  primaryContact: z.string()
    .min(3, 'Nama kontak minimal 3 karakter')
    .max(255, 'Nama kontak maksimal 255 karakter'),
  
  phone: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid (contoh: 08123456789)'),
  
  email: z.string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter')
    .optional(),
  
  whatsapp: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor WhatsApp tidak valid')
    .optional(),
  
  website: z.string()
    .url('Format website tidak valid')
    .max(255, 'Website URL maksimal 255 karakter')
    .optional(),
  
  // Address & Location - Required
  address: z.string()
    .min(10, 'Alamat minimal 10 karakter')
    .max(500, 'Alamat maksimal 500 karakter'),
  
  city: z.string()
    .min(2, 'Nama kota minimal 2 karakter')
    .max(100, 'Nama kota maksimal 100 karakter'),
  
  province: z.string()
    .min(2, 'Nama provinsi minimal 2 karakter')
    .max(100, 'Nama provinsi maksimal 100 karakter'),
  
  postalCode: z.string()
    .regex(/^\d{5}$/, 'Kode pos harus 5 digit angka')
    .optional(),
  
  coordinates: z.string()
    .regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/, 'Format koordinat tidak valid (contoh: -6.2088,106.8456)')
    .optional(),
  
  deliveryRadius: z.number()
    .min(0, 'Radius pengiriman tidak boleh negatif')
    .max(1000, 'Radius pengiriman maksimal 1000 km')
    .optional(),
  
  // Financial & Terms
  paymentTerms: z.string()
    .max(100, 'Syarat pembayaran maksimal 100 karakter')
    .default('CASH_ON_DELIVERY'),
  
  creditLimit: z.number()
    .min(0, 'Limit kredit tidak boleh negatif')
    .max(10000000000, 'Limit kredit terlalu besar')
    .optional(),
  
  // Supplier Capabilities
  minOrderValue: z.number()
    .min(0, 'Nilai pesanan minimal tidak boleh negatif')
    .optional(),
  
  maxOrderCapacity: z.number()
    .min(0, 'Kapasitas pesanan maksimal tidak boleh negatif')
    .optional(),
  
  leadTimeHours: z.number()
    .int('Lead time harus bilangan bulat')
    .min(1, 'Lead time minimal 1 jam')
    .max(720, 'Lead time maksimal 30 hari')
    .default(24),
  
  deliveryDays: z.array(z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']))
    .max(7, 'Maksimal 7 hari pengiriman')
    .default([]),
  
  specialties: z.array(z.string().max(100))
    .max(20, 'Maksimal 20 spesialisasi')
    .default([]),
  
  certifications: z.array(z.string().max(100))
    .max(20, 'Maksimal 20 sertifikasi')
    .default([]),
  
  // Compliance
  isHalalCertified: z.boolean().default(false),
  isFoodSafetyCertified: z.boolean().default(false),
  isISOCertified: z.boolean().default(false),
  
  // Digital Integration
  preferredOrderMethod: z.enum(['PHONE', 'EMAIL', 'WHATSAPP', 'API'])
    .default('PHONE')
})

/**
 * Supplier update schema - All fields optional except validation rules
 */
export const supplierUpdateSchema = supplierCreateSchema.partial().extend({
  id: z.string().cuid('ID supplier harus valid').optional(),
  
  // Additional fields for updates
  isActive: z.boolean().optional(),
  isPreferred: z.boolean().optional(),
  
  isBlacklisted: z.boolean().optional(),
  blacklistReason: z.string()
    .min(10, 'Alasan blacklist minimal 10 karakter')
    .max(500, 'Alasan blacklist maksimal 500 karakter')
    .optional(),
  
  complianceStatus: z.enum(['PENDING', 'VERIFIED', 'EXPIRED'])
    .optional(),
  
  partnershipLevel: z.enum(['STANDARD', 'PREFERRED', 'STRATEGIC'])
    .optional(),
  
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  
  relationshipManager: z.string()
    .max(255, 'Nama relationship manager maksimal 255 karakter')
    .optional()
})

/**
 * Supplier filters schema for list queries
 */
export const supplierFiltersSchema = z.object({
  // Search
  search: z.string().max(100).optional(),
  
  // Category filters
  supplierType: z.array(supplierTypeSchema).optional(),
  category: z.array(z.string()).optional(),
  city: z.array(z.string()).optional(),
  province: z.array(z.string()).optional(),
  
  // Status filters
  isActive: z.boolean().optional(),
  isPreferred: z.boolean().optional(),
  
  // Performance filters
  minRating: z.number().min(0).max(5).optional(),
  maxRating: z.number().min(0).max(5).optional(),
  
  // Relationship filters
  partnershipLevel: z.array(z.string()).optional(),
  complianceStatus: z.array(z.string()).optional(),
  
  // Pagination & Sorting
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['supplierName', 'overallRating', 'totalOrders', 'createdAt']).default('supplierName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// ================================ TYPE EXPORTS ================================

/**
 * Inferred types from Zod schemas
 */
export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>
export type SupplierFilters = z.infer<typeof supplierFiltersSchema>
export type SupplierTypeEnum = z.infer<typeof supplierTypeSchema>
