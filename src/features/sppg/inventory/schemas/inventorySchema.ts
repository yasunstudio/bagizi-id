/**
 * @fileoverview Inventory Management Validation Schemas
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { z } from 'zod'
import { InventoryCategory } from '@prisma/client'

/**
 * Inventory Category Enum Schema
 */
export const inventoryCategorySchema = z.nativeEnum(InventoryCategory)

/**
 * Create Inventory Item Schema
 */
export const createInventorySchema = z.object({
  itemName: z
    .string()
    .min(2, 'Nama item minimal 2 karakter')
    .max(255, 'Nama item maksimal 255 karakter'),
  
  itemCode: z
    .string()
    .max(50, 'Kode item maksimal 50 karakter')
    .optional()
    .nullable(),
  
  brand: z
    .string()
    .max(100, 'Merek maksimal 100 karakter')
    .optional()
    .nullable(),
  
  category: inventoryCategorySchema,
  
  foodCategoryId: z
    .string()
    .cuid('ID kategori makanan tidak valid')
    .optional()
    .nullable(),
  
  unit: z
    .string()
    .min(1, 'Satuan wajib diisi')
    .max(20, 'Satuan maksimal 20 karakter'),
  
  currentStock: z
    .number()
    .min(0, 'Stok tidak boleh negatif')
    .default(0),
  
  minStock: z
    .number()
    .min(0, 'Stok minimum tidak boleh negatif'),
  
  maxStock: z
    .number()
    .min(0, 'Stok maksimum tidak boleh negatif'),
  
  reorderQuantity: z
    .number()
    .min(0, 'Jumlah reorder tidak boleh negatif')
    .optional()
    .nullable(),
  
  lastPrice: z
    .number()
    .min(0, 'Harga tidak boleh negatif')
    .optional()
    .nullable(),
  
  costPerUnit: z
    .number()
    .min(0, 'Biaya per unit tidak boleh negatif')
    .optional()
    .nullable(),
  
  preferredSupplierId: z
    .string()
    .cuid('ID supplier tidak valid')
    .optional()
    .nullable(),
  
  legacySupplierName: z
    .string()
    .max(255, 'Nama supplier maksimal 255 karakter')
    .optional()
    .nullable(),
  
  supplierContact: z
    .string()
    .max(255, 'Kontak supplier maksimal 255 karakter')
    .optional()
    .nullable(),
  
  leadTime: z
    .number()
    .int('Lead time harus bilangan bulat')
    .min(0, 'Lead time tidak boleh negatif')
    .optional()
    .nullable(),
  
  storageLocation: z
    .string()
    .min(1, 'Lokasi penyimpanan wajib diisi')
    .max(255, 'Lokasi penyimpanan maksimal 255 karakter'),
  
  storageCondition: z
    .string()
    .max(500, 'Kondisi penyimpanan maksimal 500 karakter')
    .optional()
    .nullable(),
  
  hasExpiry: z
    .boolean()
    .default(false),
  
  shelfLife: z
    .number()
    .int('Masa simpan harus bilangan bulat')
    .min(0, 'Masa simpan tidak boleh negatif')
    .optional()
    .nullable(),
  
  calories: z
    .number()
    .min(0, 'Kalori tidak boleh negatif')
    .optional()
    .nullable(),
  
  protein: z
    .number()
    .min(0, 'Protein tidak boleh negatif')
    .optional()
    .nullable(),
  
  carbohydrates: z
    .number()
    .min(0, 'Karbohidrat tidak boleh negatif')
    .optional()
    .nullable(),
  
  fat: z
    .number()
    .min(0, 'Lemak tidak boleh negatif')
    .optional()
    .nullable(),
  
  fiber: z
    .number()
    .min(0, 'Serat tidak boleh negatif')
    .optional()
    .nullable(),
  
  isActive: z
    .boolean()
    .default(true),
}).refine(
  (data) => data.maxStock >= data.minStock,
  {
    message: 'Stok maksimum harus lebih besar atau sama dengan stok minimum',
    path: ['maxStock'],
  }
).refine(
  (data) => data.currentStock <= data.maxStock,
  {
    message: 'Stok saat ini tidak boleh melebihi stok maksimum',
    path: ['currentStock'],
  }
)

/**
 * Update Inventory Item Schema
 */
export const updateInventorySchema = createInventorySchema.partial()

/**
 * Inventory Filters Schema
 */
export const inventoryFiltersSchema = z.object({
  category: inventoryCategorySchema.optional(),
  stockStatus: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'ALL']).optional(),
  storageLocation: z.string().optional(),
  supplierId: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
})

/**
 * Type exports for use in components
 */
export type CreateInventoryInput = z.infer<typeof createInventorySchema>
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>
export type InventoryFiltersInput = z.infer<typeof inventoryFiltersSchema>

/**
 * Inventory Category Labels
 */
export const inventoryCategoryLabels: Record<InventoryCategory, string> = {
  PROTEIN: 'Protein',
  KARBOHIDRAT: 'Karbohidrat',
  SAYURAN: 'Sayuran',
  BUAH: 'Buah',
  SUSU_OLAHAN: 'Susu & Olahan',
  BUMBU_REMPAH: 'Bumbu & Rempah',
  MINYAK_LEMAK: 'Minyak & Lemak',
  LAINNYA: 'Lainnya',
}

/**
 * Unit of Measure Options
 */
export const unitOptions = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'liter', label: 'Liter (L)' },
  { value: 'ml', label: 'Mililiter (ml)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'sak', label: 'Sak' },
  { value: 'karung', label: 'Karung' },
  { value: 'ikat', label: 'Ikat' },
  { value: 'buah', label: 'Buah' },
  { value: 'lembar', label: 'Lembar' },
  { value: 'botol', label: 'Botol' },
  { value: 'kaleng', label: 'Kaleng' },
  { value: 'roll', label: 'Roll' },
]

/**
 * Storage Location Options
 */
export const storageLocationOptions = [
  { value: 'Gudang Utama', label: 'Gudang Utama' },
  { value: 'Gudang Kering', label: 'Gudang Kering' },
  { value: 'Cold Storage', label: 'Cold Storage' },
  { value: 'Freezer', label: 'Freezer' },
  { value: 'Chiller', label: 'Chiller' },
  { value: 'Rak Sayuran', label: 'Rak Sayuran' },
  { value: 'Rak Bumbu', label: 'Rak Bumbu' },
  { value: 'Dapur', label: 'Dapur' },
  { value: 'Lainnya', label: 'Lainnya' },
]

/**
 * Stock Status Options
 */
export const stockStatusOptions = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'IN_STOCK', label: 'Stok Tersedia' },
  { value: 'LOW_STOCK', label: 'Stok Menipis' },
  { value: 'OUT_OF_STOCK', label: 'Stok Habis' },
]
