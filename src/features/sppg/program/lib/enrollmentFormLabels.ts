/**
 * @fileoverview Indonesian Labels untuk Beneficiary Enrollment Form
 * Centralized translation untuk consistency
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

export const FORM_LABELS = {
  // Page Titles
  title: {
    create: 'Tambah Pendaftaran Penerima Manfaat',
    edit: 'Edit Pendaftaran Penerima Manfaat',
  },
  description: 'Daftarkan organisasi penerima manfaat ke program nutrisi',

  // Section Headers
  sections: {
    coreRelations: '1. Organisasi & Program',
    enrollmentPeriod: '2. Periode Pendaftaran',
    targetGroup: '3. Kelompok Sasaran & Penerima Manfaat',
    feedingConfig: '4. Konfigurasi Pemberian Makan',
    deliveryConfig: '5. Konfigurasi Pengiriman',
    performance: '6. Pemantauan Kinerja',
    quality: '7. Kualitas & Kepuasan',
    specialRequirements: '8. Kebutuhan Khusus',
    statusAdmin: '9. Status & Administratif',
  },

  // Section 1: Core Relations
  beneficiaryOrg: {
    label: 'Organisasi Penerima Manfaat',
    placeholder: 'Pilih organisasi',
    description: 'Organisasi yang akan menerima program gizi',
    loading: 'Memuat...',
    empty: 'Tidak ada organisasi tersedia',
    required: 'wajib diisi',
  },
  program: {
    label: 'Program Gizi',
    placeholder: 'Pilih program',
    description: 'Program yang akan diikuti organisasi',
    loading: 'Memuat...',
    empty: 'Tidak ada program tersedia',
    required: 'wajib diisi',
  },

  // Section 2: Enrollment Period
  enrollmentDate: {
    label: 'Tanggal Pendaftaran',
    placeholder: 'Pilih tanggal pendaftaran',
    description: 'Tanggal organisasi didaftarkan ke program',
  },
  startDate: {
    label: 'Tanggal Mulai',
    placeholder: 'Pilih tanggal mulai',
    description: 'Tanggal mulai pemberian makanan',
  },
  endDate: {
    label: 'Tanggal Selesai',
    placeholder: 'Pilih tanggal selesai',
    description: 'Tanggal berakhirnya program (opsional)',
  },

  // Section 3: Target Group & Beneficiaries
  targetGroup: {
    label: 'Kelompok Sasaran',
    placeholder: 'Pilih kelompok sasaran',
    description: 'Kelompok penerima manfaat dalam program ini',
    required: 'wajib diisi',
  },
  targetBeneficiaries: {
    label: 'Jumlah Target Penerima Manfaat',
    placeholder: '0',
    description: 'Total jumlah penerima manfaat yang ditargetkan',
  },
  activeBeneficiaries: {
    label: 'Jumlah Penerima Manfaat Aktif',
    placeholder: '0',
    description: 'Jumlah penerima manfaat yang saat ini aktif',
  },
  
  // Age Breakdown
  ageBreakdown: {
    header: 'Distribusi Usia',
    description: 'Rincian jumlah penerima manfaat berdasarkan kelompok usia',
    beneficiaries0to2: 'Usia 0-2 tahun',
    beneficiaries2to5: 'Usia 2-5 tahun',
    beneficiaries6to12: 'Usia 6-12 tahun',
    beneficiaries13to15: 'Usia 13-15 tahun',
    beneficiaries16to18: 'Usia 16-18 tahun',
    beneficiariesAbove18: 'Usia 18+ tahun',
    placeholder: '0',
  },

  // Section 4: Feeding Configuration
  feedingDaysPerWeek: {
    label: 'Hari Pemberian Makan per Minggu',
    placeholder: '5',
    description: 'Jumlah hari pemberian makan dalam seminggu',
  },
  mealsPerDay: {
    label: 'Frekuensi Makan per Hari',
    placeholder: '1',
    description: 'Jumlah waktu makan dalam sehari (1-3 kali)',
  },
  breakfastTime: {
    label: 'Waktu Sarapan',
    placeholder: '07:00',
    description: 'Jam pemberian sarapan',
  },
  lunchTime: {
    label: 'Waktu Makan Siang',
    placeholder: '12:00',
    description: 'Jam pemberian makan siang',
  },
  dinnerTime: {
    label: 'Waktu Makan Malam',
    placeholder: '18:00',
    description: 'Jam pemberian makan malam',
  },
  snackTime: {
    label: 'Waktu Makanan Tambahan',
    placeholder: '10:00',
    description: 'Jam pemberian makanan tambahan/snack',
  },

  // Section 5: Delivery Configuration
  deliveryAddress: {
    label: 'Alamat Pengiriman',
    placeholder: 'Masukkan alamat lengkap pengiriman',
    description: 'Alamat tempat pengiriman makanan',
  },
  deliveryContactName: {
    label: 'Nama Kontak Pengiriman',
    placeholder: 'Nama penanggung jawab penerima',
    description: 'Nama orang yang dapat dihubungi untuk pengiriman',
  },
  deliveryContactPhone: {
    label: 'Nomor Telepon Kontak',
    placeholder: '08xx xxxx xxxx',
    description: 'Nomor telepon yang dapat dihubungi',
  },
  deliveryInstructions: {
    label: 'Instruksi Khusus Pengiriman',
    placeholder: 'Contoh: Antar ke ruang guru, hubungi security terlebih dahulu',
    description: 'Instruksi tambahan untuk proses pengiriman',
  },

  // Section 6: Budget Tracking (Government Program Monitoring)
  monthlyBudget: {
    label: 'Alokasi Anggaran Bulanan (Rp)',
    placeholder: '0',
    description: 'Alokasi anggaran APBD/APBN untuk program per bulan',
  },
  costPerBeneficiary: {
    label: 'Biaya per Penerima Manfaat (Rp)',
    placeholder: '0',
    description: 'Estimasi biaya yang dialokasikan per orang per bulan',
  },

  // Section 7: Performance Tracking
  totalMealsServed: {
    label: 'Total Makanan yang Disalurkan',
    placeholder: '0',
    description: 'Total jumlah porsi makanan yang telah diberikan',
  },
  attendanceRate: {
    label: 'Tingkat Kehadiran (%)',
    placeholder: '0',
    description: 'Persentase kehadiran penerima manfaat (0-100)',
  },
  wastageRate: {
    label: 'Tingkat Sisa Makanan (%)',
    placeholder: '0',
    description: 'Persentase makanan yang tidak habis (0-100)',
  },

  // Section 8: Quality & Satisfaction
  satisfactionScore: {
    label: 'Skor Kepuasan (1-5)',
    placeholder: '0',
    description: 'Rata-rata skor kepuasan penerima manfaat',
  },
  complaintCount: {
    label: 'Jumlah Keluhan',
    placeholder: '0',
    description: 'Total jumlah keluhan yang diterima',
  },
  lastSurveyDate: {
    label: 'Tanggal Survei Terakhir',
    placeholder: 'Pilih tanggal',
    description: 'Tanggal terakhir dilakukan survei kepuasan',
  },

  // Section 9: Special Requirements
  specialDietaryNeeds: {
    label: 'Kebutuhan Diet Khusus',
    placeholder: 'Contoh: Vegetarian, Halal, Bebas gluten',
    description: 'Kebutuhan diet khusus dari penerima manfaat',
  },
  allergenRestrictions: {
    label: 'Alergen yang Harus Dihindari',
    placeholder: 'Pilih alergen',
    description: 'Alergen yang harus diperhatikan dalam menu',
  },
  medicalConsiderations: {
    label: 'Pertimbangan Medis',
    placeholder: 'Contoh: Diabetes, hipertensi',
    description: 'Kondisi medis yang perlu dipertimbangkan',
  },
  culturalPreferences: {
    label: 'Preferensi Budaya',
    placeholder: 'Contoh: Tidak mengonsumsi daging sapi',
    description: 'Preferensi budaya atau agama dalam penyediaan makanan',
  },

  // Section 10: Status & Administrative
  enrollmentStatus: {
    label: 'Status Pendaftaran',
    placeholder: 'Pilih status',
    description: 'Status saat ini dari pendaftaran',
    options: {
      ACTIVE: 'Aktif',
      INACTIVE: 'Tidak Aktif',
      PENDING: 'Menunggu',
      SUSPENDED: 'Ditangguhkan',
      COMPLETED: 'Selesai',
    },
  },
  internalNotes: {
    label: 'Catatan Internal',
    placeholder: 'Catatan tambahan untuk tim internal',
    description: 'Catatan yang hanya terlihat oleh tim internal',
  },

  // Form Actions
  actions: {
    submit: {
      create: 'Simpan Pendaftaran',
      edit: 'Perbarui Pendaftaran',
      loading: 'Menyimpan...',
    },
    cancel: 'Batal',
  },

  // Validation Messages
  validation: {
    required: 'wajib diisi',
    invalidDate: 'Format tanggal tidak valid',
    invalidNumber: 'Harus berupa angka',
    minValue: 'Nilai minimal adalah',
    maxValue: 'Nilai maksimal adalah',
    invalidPhone: 'Format nomor telepon tidak valid',
    endBeforeStart: 'Tanggal selesai harus setelah tanggal mulai',
  },

  // Toast Messages
  toast: {
    createSuccess: 'Pendaftaran berhasil disimpan',
    updateSuccess: 'Pendaftaran berhasil diperbarui',
    error: 'Terjadi kesalahan. Silakan coba lagi.',
    loading: 'Memproses...',
  },

  // Button Labels
  buttons: {
    cancel: 'Batal',
    create: 'Simpan Pendaftaran',
    creating: 'Menyimpan...',
    update: 'Perbarui Pendaftaran',
    updating: 'Memperbarui...',
  },

  // Loading States
  loading: {
    fetching: 'Memuat data...',
    saving: 'Menyimpan...',
    updating: 'Memperbarui...',
  },
} as const

/**
 * Get target group specific labels
 */
export function getTargetGroupLabels(targetGroup: string) {
  const labels = {
    SCHOOL_CHILDREN: {
      beneficiaryCount: 'Jumlah Siswa',
      ageBreakdown: 'Distribusi Usia Siswa',
      specificField1: 'Tingkat Kelas',
      specificField2: 'Tahun Ajaran',
    },
    PREGNANT_WOMAN: {
      beneficiaryCount: 'Jumlah Ibu Hamil',
      ageBreakdown: 'Distribusi Trimester',
      specificField1: 'Trimester',
      specificField2: 'Usia Kehamilan',
    },
    BREASTFEEDING_MOTHER: {
      beneficiaryCount: 'Jumlah Ibu Menyusui',
      ageBreakdown: 'Distribusi Usia Bayi',
      specificField1: 'Usia Bayi',
      specificField2: 'Status ASI',
    },
    TODDLER: {
      beneficiaryCount: 'Jumlah Balita',
      ageBreakdown: 'Distribusi Usia Balita',
      specificField1: 'Status Pertumbuhan',
      specificField2: 'Status Imunisasi',
    },
    TEENAGE_GIRL: {
      beneficiaryCount: 'Jumlah Remaja Putri',
      ageBreakdown: 'Distribusi Usia',
      specificField1: 'Tingkat Sekolah',
      specificField2: 'Status Anemia',
    },
    ELDERLY: {
      beneficiaryCount: 'Jumlah Lansia',
      ageBreakdown: 'Distribusi Usia Lansia',
      specificField1: 'Kondisi Kesehatan',
      specificField2: 'Status Mobilitas',
    },
  }

  return labels[targetGroup as keyof typeof labels] || labels.SCHOOL_CHILDREN
}
