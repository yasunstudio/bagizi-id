/**
 * @fileoverview Category-Specific QC Checklists
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Dynamic quality control checklists based on inventory category
 */

import { InventoryCategory } from '@prisma/client'

// ================================ TYPES ================================

export interface QCCheckPoint {
  aspect: string
  standard: string
  isPassed: boolean
  actual?: string
}

export interface CategoryQCTemplate {
  category: InventoryCategory
  requiredPhotos: number
  checkPoints: Omit<QCCheckPoint, 'actual' | 'isPassed'>[]
  specificGuidelines: string[]
}

// ================================ CATEGORY TEMPLATES ================================

export const categoryQCTemplates: Record<InventoryCategory, CategoryQCTemplate> = {
  PROTEIN: {
    category: 'PROTEIN',
    requiredPhotos: 3,
    checkPoints: [
      {
        aspect: 'Kesegaran',
        standard: 'Tidak berbau, tekstur kenyal, warna natural',
      },
      {
        aspect: 'Suhu',
        standard: 'Suhu penyimpanan sesuai (cold chain maintained)',
      },
      {
        aspect: 'Kemasan',
        standard: 'Kemasan vakum/tertutup rapat, tidak rusak/bocor',
      },
      {
        aspect: 'Tanggal Kadaluarsa',
        standard: 'Minimal 50% dari masa simpan tersisa',
      },
      {
        aspect: 'Kebersihan',
        standard: 'Bebas kotoran, lendir, atau benda asing',
      },
    ],
    specificGuidelines: [
      'Periksa suhu produk saat diterima (<5°C untuk chilled)',
      'Pastikan tidak ada tanda-tanda thawing/refreezing',
      'Cek sertifikat halal dan nomor registrasi veteriner',
    ],
  },

  SAYURAN: {
    category: 'SAYURAN',
    requiredPhotos: 2,
    checkPoints: [
      {
        aspect: 'Kesegaran',
        standard: 'Hijau segar, tidak layu/kering',
      },
      {
        aspect: 'Kebersihan',
        standard: 'Bebas tanah berlebih, serangga, dan daun busuk',
      },
      {
        aspect: 'Ukuran',
        standard: 'Ukuran seragam sesuai grade',
      },
      {
        aspect: 'Warna',
        standard: 'Warna cerah natural, tidak pucat',
      },
      {
        aspect: 'Kondisi Fisik',
        standard: 'Tidak ada memar, luka potong, atau kerusakan',
      },
    ],
    specificGuidelines: [
      'Sortir dan buang bagian yang tidak layak konsumsi',
      'Cuci bersih sebelum penyimpanan',
      'Simpan di suhu dingin (10-15°C)',
    ],
  },

  BUAH: {
    category: 'BUAH',
    requiredPhotos: 2,
    checkPoints: [
      {
        aspect: 'Kematangan',
        standard: 'Tingkat kematangan sesuai kebutuhan',
      },
      {
        aspect: 'Kondisi Kulit',
        standard: 'Kulit utuh, tidak busuk/berjamur',
      },
      {
        aspect: 'Aroma',
        standard: 'Aroma segar khas buah, tidak fermentasi',
      },
      {
        aspect: 'Ukuran & Bentuk',
        standard: 'Ukuran seragam, bentuk normal',
      },
      {
        aspect: 'Kebersihan',
        standard: 'Bersih, tidak ada kotoran atau residu pestisida',
      },
    ],
    specificGuidelines: [
      'Pisahkan buah yang terlalu matang',
      'Hindari penumpukan untuk mencegah memar',
      'Simpan di suhu ruang atau cold storage sesuai jenis',
    ],
  },

  KARBOHIDRAT: {
    category: 'KARBOHIDRAT',
    requiredPhotos: 2,
    checkPoints: [
      {
        aspect: 'Kemasan',
        standard: 'Kemasan utuh, tidak robek/rusak',
      },
      {
        aspect: 'Kadar Air',
        standard: 'Kering, tidak lembab atau berair',
      },
      {
        aspect: 'Bau & Rasa',
        standard: 'Tidak berbau apek, tengik, atau asing',
      },
      {
        aspect: 'Kontaminasi',
        standard: 'Bebas kutu, ulat, jamur, atau kotoran',
      },
      {
        aspect: 'Tanggal Produksi',
        standard: 'Produksi terbaru, minimal 80% masa simpan tersisa',
      },
    ],
    specificGuidelines: [
      'Periksa kemasan untuk tanda-tanda hama',
      'Cek kelembaban di dalam kemasan',
      'Simpan di tempat kering dan sejuk',
    ],
  },

  SUSU_OLAHAN: {
    category: 'SUSU_OLAHAN',
    requiredPhotos: 3,
    checkPoints: [
      {
        aspect: 'Kemasan',
        standard: 'Kemasan tidak kembung, tidak bocor, seal utuh',
      },
      {
        aspect: 'Tanggal Kadaluarsa',
        standard: 'Minimal 60% dari masa simpan tersisa',
      },
      {
        aspect: 'Suhu Penyimpanan',
        standard: 'Cold chain maintained (<5°C)',
      },
      {
        aspect: 'Sertifikasi',
        standard: 'Ada nomor registrasi MD/ML BPOM',
      },
      {
        aspect: 'Kondisi Produk',
        standard: 'Tidak ada pemisahan/penggumpalan (untuk liquid)',
      },
    ],
    specificGuidelines: [
      'Periksa suhu produk saat diterima',
      'Pastikan cold chain tidak terputus',
      'Cek label halal dan izin edar BPOM',
    ],
  },

  BUMBU_REMPAH: {
    category: 'BUMBU_REMPAH',
    requiredPhotos: 2,
    checkPoints: [
      {
        aspect: 'Aroma',
        standard: 'Aroma kuat khas bumbu, tidak apek',
      },
      {
        aspect: 'Warna',
        standard: 'Warna cerah natural, tidak pucat/kusam',
      },
      {
        aspect: 'Kebersihan',
        standard: 'Bebas kotoran, pasir, atau benda asing',
      },
      {
        aspect: 'Kadar Air',
        standard: 'Kering (untuk yang dijual kering)',
      },
      {
        aspect: 'Kemasan',
        standard: 'Kemasan rapat, kedap udara',
      },
    ],
    specificGuidelines: [
      'Periksa aroma dengan mencium langsung',
      'Pastikan tidak ada kontaminasi jamur',
      'Simpan di wadah tertutup rapat',
    ],
  },

  MINYAK_LEMAK: {
    category: 'MINYAK_LEMAK',
    requiredPhotos: 2,
    checkPoints: [
      {
        aspect: 'Kejernihan',
        standard: 'Jernih, tidak keruh atau mengandung endapan',
      },
      {
        aspect: 'Aroma',
        standard: 'Tidak tengik, tidak berbau asing',
      },
      {
        aspect: 'Warna',
        standard: 'Warna sesuai jenis minyak, tidak gelap',
      },
      {
        aspect: 'Kemasan',
        standard: 'Kemasan utuh, seal tidak rusak',
      },
      {
        aspect: 'Label',
        standard: 'Label lengkap (komposisi, izin edar, halal)',
      },
    ],
    specificGuidelines: [
      'Cek tanggal produksi dan kadaluarsa',
      'Pastikan kemasan tidak rusak/bocor',
      'Simpan di tempat sejuk terhindar cahaya',
    ],
  },

  LAINNYA: {
    category: 'LAINNYA',
    requiredPhotos: 1,
    checkPoints: [
      {
        aspect: 'Kondisi Umum',
        standard: 'Produk dalam kondisi baik',
      },
      {
        aspect: 'Kemasan',
        standard: 'Kemasan utuh dan bersih',
      },
      {
        aspect: 'Label',
        standard: 'Label lengkap dan terbaca jelas',
      },
      {
        aspect: 'Tanggal Kadaluarsa',
        standard: 'Belum kadaluarsa dengan margin waktu cukup',
      },
    ],
    specificGuidelines: [
      'Sesuaikan pemeriksaan dengan jenis produk',
      'Dokumentasikan kondisi penerimaan',
    ],
  },
}

// ================================ HELPER FUNCTIONS ================================

/**
 * Get QC template for specific category
 */
export function getQCTemplate(category: InventoryCategory): CategoryQCTemplate {
  return categoryQCTemplates[category] || categoryQCTemplates.LAINNYA
}

/**
 * Get required photos count for category
 */
export function getRequiredPhotos(category: InventoryCategory): number {
  return categoryQCTemplates[category]?.requiredPhotos || 1
}

/**
 * Get default checkpoints for category
 */
export function getDefaultCheckPoints(
  category: InventoryCategory
): Omit<QCCheckPoint, 'actual' | 'isPassed'>[] {
  return categoryQCTemplates[category]?.checkPoints || []
}

/**
 * Get specific guidelines for category
 */
export function getCategoryGuidelines(category: InventoryCategory): string[] {
  return categoryQCTemplates[category]?.specificGuidelines || []
}

/**
 * Validate if grade matches rejection criteria
 */
export function shouldRejectByGrade(
  grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
): boolean {
  return grade === 'POOR'
}

/**
 * Get grade color
 */
export function getGradeColor(
  grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
): string {
  const colors = {
    EXCELLENT: 'text-green-600 bg-green-50 border-green-200',
    GOOD: 'text-blue-600 bg-blue-50 border-blue-200',
    FAIR: 'text-amber-600 bg-amber-50 border-amber-200',
    POOR: 'text-red-600 bg-red-50 border-red-200',
  }
  return colors[grade] || colors.GOOD
}
