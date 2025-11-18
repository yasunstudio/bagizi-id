# 📚 Arsitektur Program MBG - Penjelasan Lengkap

**Platform:** Bagizi-ID SaaS - SPPG Management System
**Tanggal:** November 7, 2025
**Konteks:** Makan Bergizi Gratis (MBG) - Program Pemerintah Indonesia

---

## 🎯 Konsep Dasar: Hierarki Program MBG

### Level 1: SPPG (Satuan Pelayanan Pemenuhan Gizi)
**Analogi:** Seperti "kantor cabang" yang mengelola program MBG

```
SPPG Purwakarta
├── Mengelola beberapa program MBG di Kabupaten Purwakarta
├── Melayani berbagai jenis penerima manfaat
├── Punya dapur, tim produksi, tim distribusi
└── Wilayah: Kecamatan Purwakarta, Jatiluhur, Campaka, dll
```

---

### Level 2: Program Gizi (Nutrition Program)
**Analogi:** Seperti "project" dengan tujuan spesifik

```
Program: "MBG Ibu Hamil & Menyusui Purwakarta 2025"
├── Tujuan: Meningkatkan gizi ibu hamil & menyusui
├── Durasi: Januari - Desember 2025
├── Budget: Rp 350.000.000
├── Wilayah: Kabupaten Purwakarta, Jawa Barat
└── Target Groups: 
    ├── Ibu Hamil
    └── Ibu Menyusui
```

**Sifat Program:**
- ✅ **Multi-Target Support** - Satu program bisa melayani BEBERAPA target group sekaligus
- ✅ **Single-Target Support** - Atau fokus ke SATU target group saja
- ✅ **Flexible** - SPPG yang menentukan konfigurasi

---

### Level 3: Target Group (Kelompok Sasaran)
**Analogi:** Seperti "kategori penerima" dengan kebutuhan gizi yang BERBEDA

```
6 Target Groups dalam MBG:

1. 🎓 SCHOOL_CHILDREN (Anak Sekolah)
   └── Kebutuhan: Energi untuk belajar, pertumbuhan

2. 🤰 PREGNANT_WOMAN (Ibu Hamil)
   └── Kebutuhan: Asam folat, zat besi, kalsium

3. 🤱 BREASTFEEDING_MOTHER (Ibu Menyusui)
   └── Kebutuhan: Protein, kalori untuk produksi ASI

4. 👶 TODDLER (Balita 0-5 tahun)
   └── Kebutuhan: Protein, vitamin untuk cegah stunting

5. 👧 TEENAGE_GIRL (Remaja Putri)
   └── Kebutuhan: Zat besi, kalsium untuk anemia

6. 👴 ELDERLY (Lansia)
   └── Kebutuhan: Protein mudah cerna, vitamin D
```

---

### Level 4: Beneficiary Organization (Organisasi Penerima)
**Analogi:** Seperti "lokasi distribusi" atau "institusi penerima"

```
Contoh untuk Ibu Hamil:
├── Puskesmas Purwakarta
├── Puskesmas Jatiluhur
├── Posyandu Desa Munjuljaya
└── Klinik Bersalin Campaka

Contoh untuk Anak Sekolah:
├── SDN 1 Purwakarta
├── SDN Munjuljaya
├── SMPN 1 Purwakarta
└── SMAN 1 Purwakarta
```

---

### Level 5: Enrollment (Pendaftaran)
**Analogi:** Seperti "kontrak pelayanan" antara Program dan Organisasi untuk Target Group tertentu

```
Enrollment #1:
├── Program: "MBG Ibu Hamil & Menyusui Purwakarta 2025"
├── Organisasi: Puskesmas Purwakarta
├── Target Group: PREGNANT_WOMAN (Ibu Hamil)
├── Jumlah: 45 ibu hamil
├── Breakdown:
│   ├── Trimester 1: 12 orang
│   ├── Trimester 2: 18 orang
│   └── Trimester 3: 15 orang
└── Menu Khusus: Menu ibu hamil (tinggi asam folat, zat besi)

Enrollment #2:
├── Program: "MBG Ibu Hamil & Menyusui Purwakarta 2025" (SAMA)
├── Organisasi: Puskesmas Purwakarta (SAMA)
├── Target Group: BREASTFEEDING_MOTHER (Ibu Menyusui) ← BEDA!
├── Jumlah: 35 ibu menyusui
├── Breakdown:
│   ├── Bayi 0-6 bulan: 12 orang
│   ├── Bayi 6-12 bulan: 15 orang
│   └── Bayi 12-24 bulan: 8 orang
└── Menu Khusus: Menu ibu menyusui (tinggi protein, kalori)
```

**PENTING:** Satu organisasi bisa punya MULTIPLE enrollments untuk TARGET GROUP yang BERBEDA!

---

## 🔑 Konsep Kunci: Target Group vs Beneficiary Organization

### ❌ KESALAHAN UMUM - Mengira Target Group = Organization Type

**SALAH:**
```
Target Group = Sekolah
Target Group = Puskesmas
Target Group = Posyandu
```

**BENAR:**
```
Target Group = SCHOOL_CHILDREN (siapa yang makan)
Beneficiary Organization Type = SCHOOL (dimana distribusi)

Target Group = PREGNANT_WOMAN (siapa yang makan)
Beneficiary Organization Type = HEALTH_FACILITY (dimana distribusi)
```

---

## 📊 Database Schema - The Right Way

### Tabel Utama:

#### 1. **SPPG** - Platform tenant
```prisma
model SPPG {
  id        String
  sppgName  String
  sppgCode  String
  address   String
  // ... SPPG manages everything
}
```

#### 2. **NutritionProgram** - Program gizi yang dikelola SPPG
```prisma
model NutritionProgram {
  id                   String
  name                 String  // "MBG Ibu Hamil & Menyusui 2025"
  programCode          String  // "MBG-JAPUR-2025-001"
  
  // Multi-target support
  isMultiTarget        Boolean // true = bisa multiple target groups
  primaryTargetGroup   TargetGroup? // Jika single-target
  allowedTargetGroups  TargetGroup[] // Jika multi-target
  
  startDate            DateTime
  endDate              DateTime
  totalBudget          Float
  
  sppgId               String
  sppg                 SPPG @relation(...)
  
  // Relations
  enrollments          ProgramBeneficiaryEnrollment[]
  distributions        FoodDistribution[]
}
```

**Contoh Data:**
```json
{
  "name": "MBG Ibu Hamil & Menyusui Purwakarta 2025",
  "programCode": "MBG-PWK-2025-001",
  "isMultiTarget": true,
  "allowedTargetGroups": ["PREGNANT_WOMAN", "BREASTFEEDING_MOTHER"],
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

#### 3. **BeneficiaryOrganization** - Organisasi penerima (universal)
```prisma
model BeneficiaryOrganization {
  id                String
  organizationCode  String
  organizationName  String
  
  // Organization TYPE (dimana distribusi)
  type              BeneficiaryOrgType // SCHOOL, HEALTH_FACILITY, COMMUNITY_CENTER
  
  // Location
  address           String
  province          String
  city              String
  
  sppgId            String
  sppg              SPPG @relation(...)
  
  // Relations
  enrollments       ProgramBeneficiaryEnrollment[]
}

enum BeneficiaryOrgType {
  SCHOOL                 // SD, SMP, SMA
  HEALTH_FACILITY        // Puskesmas, Klinik, Posyandu
  COMMUNITY_CENTER       // RW, Kelurahan, Community Hall
  DAYCARE                // PAUD, TPA
  ELDERLY_HOME           // Panti Jompo
  ORPHANAGE              // Panti Asuhan
  SPECIAL_INSTITUTION    // Institusi khusus lainnya
}
```

**Contoh Data:**
```json
{
  "organizationName": "Puskesmas Purwakarta",
  "type": "HEALTH_FACILITY",
  "address": "Jl. Veteran No. 38, Purwakarta",
  "province": "Jawa Barat",
  "city": "Purwakarta",
  "capacity": 80
}
```

#### 4. **ProgramBeneficiaryEnrollment** - Bridge antara Program, Organization, dan Target Group
```prisma
model ProgramBeneficiaryEnrollment {
  id                String
  
  // Relations
  programId         String
  program           NutritionProgram @relation(...)
  
  beneficiaryOrgId  String
  beneficiaryOrg    BeneficiaryOrganization @relation(...)
  
  sppgId            String
  sppg              SPPG @relation(...)
  
  // TARGET GROUP - CRITICAL!
  targetGroup       TargetGroup // SCHOOL_CHILDREN, PREGNANT_WOMAN, etc.
  
  // Beneficiary Counts
  targetBeneficiaries    Int  // Total target
  activeBeneficiaries    Int? // Currently active
  
  // Gender Breakdown (conditional - tidak untuk ibu hamil/menyusui)
  maleBeneficiaries      Int?
  femaleBeneficiaries    Int?
  
  // Target-Specific Breakdown (JSON - flexible per target group)
  targetGroupSpecificData Json? // { "firstTrimester": 15, "secondTrimester": 20, ... }
  
  // Feeding Configuration (berbeda per target group)
  feedingDays       Int? // 5 untuk sekolah, 7 untuk ibu hamil
  mealsPerDay       Int? // 1 untuk sekolah, 3 untuk ibu menyusui
  feedingTime       String?
  
  // ... other fields
}

enum TargetGroup {
  SCHOOL_CHILDREN       // Anak sekolah (SD, SMP, SMA)
  PREGNANT_WOMAN        // Ibu hamil (per trimester)
  BREASTFEEDING_MOTHER  // Ibu menyusui (per usia bayi)
  TODDLER               // Balita 0-5 tahun
  TEENAGE_GIRL          // Remaja putri (anemia prevention)
  ELDERLY               // Lansia 60+
}
```

---

## 🎓 Skenario Real-World

### Skenario 1: Program Multi-Target di Satu Puskesmas

**Program:**
```
Nama: "MBG Kesehatan Ibu & Anak Purwakarta 2025"
Type: Multi-Target
Allowed: [PREGNANT_WOMAN, BREASTFEEDING_MOTHER, TODDLER]
Budget: Rp 600 juta
Wilayah: Kecamatan Purwakarta
```

**Organisasi:**
```
Nama: Puskesmas Purwakarta
Type: HEALTH_FACILITY
Alamat: Jl. Veteran No. 38, Purwakarta
Kapasitas: 150 orang
```

**Enrollments:**
```
Enrollment #1:
├── Target Group: PREGNANT_WOMAN
├── Jumlah: 50 ibu hamil
├── Breakdown:
│   ├── Trimester 1: 15 orang
│   ├── Trimester 2: 20 orang
│   └── Trimester 3: 15 orang
├── Menu: Tinggi asam folat, zat besi, kalsium
├── Frekuensi: 7 hari/minggu, 2 kali/hari
└── Waktu: Sarapan (08:00), Makan Siang (12:00)

Enrollment #2:
├── Target Group: BREASTFEEDING_MOTHER
├── Jumlah: 40 ibu menyusui
├── Breakdown:
│   ├── Bayi 0-6 bulan: 15 orang
│   ├── Bayi 6-12 bulan: 15 orang
│   └── Bayi 12-24 bulan: 10 orang
├── Menu: Tinggi protein, kalori untuk produksi ASI
├── Frekuensi: 7 hari/minggu, 3 kali/hari
└── Waktu: Sarapan, Makan Siang, Makan Malam

Enrollment #3:
├── Target Group: TODDLER
├── Jumlah: 40 balita
├── Breakdown:
│   ├── Baduta (0-2 tahun): 20 anak
│   └── Balita (2-5 tahun): 20 anak
├── Menu: Protein, vitamin untuk cegah stunting
├── Frekuensi: 7 hari/minggu, 2 kali/hari
└── Waktu: Sarapan (08:00), Snack (15:00)
```

**Total di Puskesmas:** 130 penerima manfaat dengan 3 JENIS MENU berbeda!

---

### Skenario 2: Program Single-Target untuk Sekolah

**Program:**
```
Nama: "MBG Anak Sekolah Purwakarta 2025"
Type: Single-Target
Primary Target: SCHOOL_CHILDREN
Budget: Rp 1,5 miliar
Wilayah: Kabupaten Purwakarta
```

**Organisasi:**
```
Nama: SDN 1 Purwakarta
Type: SCHOOL
Alamat: Jl. Veteran, Nagri Tengah, Purwakarta
Siswa: 420 anak
```

**Enrollment:**
```
Enrollment:
├── Target Group: SCHOOL_CHILDREN (fixed)
├── Jumlah: 420 siswa
├── Gender:
│   ├── Laki-laki: 210 siswa
│   └── Perempuan: 210 siswa
├── Breakdown:
│   ├── SD Kelas 1-3: 180 siswa
│   ├── SD Kelas 4-6: 240 siswa
├── Menu: Menu anak sekolah (energi untuk belajar)
├── Frekuensi: 5 hari/minggu (Senin-Jumat)
├── Waktu: Makan Siang (12:00)
└── Metode: Makan di tempat (on-site)
```

---

## 🍽️ Nutrisi & Menu: Target Group Specific

### Kebutuhan Nutrisi Berbeda per Target Group:

#### 1. **PREGNANT_WOMAN (Ibu Hamil)**
```
Kebutuhan Khusus:
├── Asam Folat: 600 mcg/hari (cegah cacat janin)
├── Zat Besi: 27 mg/hari (cegah anemia)
├── Kalsium: 1000 mg/hari (tulang janin)
├── Protein: 70 gram/hari
├── Kalori: 2200-2500 kcal/hari
└── DHA: Untuk perkembangan otak janin

Menu Contoh:
├── Sarapan: Nasi merah + ikan salmon + bayam + susu
├── Makan Siang: Nasi + ayam + brokoli + wortel + buah
└── Snack: Kurma, kacang-kacangan, yogurt

Waktu Makan: 3x sehari (trimester 3 bisa 5-6x porsi kecil)
```

#### 2. **BREASTFEEDING_MOTHER (Ibu Menyusui)**
```
Kebutuhan Khusus:
├── Kalori: 2500-2800 kcal/hari (untuk produksi ASI)
├── Protein: 75 gram/hari
├── Kalsium: 1300 mg/hari
├── Vitamin A: 1300 mcg/hari
├── Cairan: 3 liter/hari
└── Omega-3: Untuk kualitas ASI

Menu Contoh:
├── Sarapan: Nasi + telur + sayur + susu
├── Snack Pagi: Buah + kacang almond
├── Makan Siang: Nasi + ikan + sayur hijau + tempe
├── Snack Sore: Bubur kacang hijau
└── Makan Malam: Nasi + ayam + sayur + buah

Waktu Makan: 5-6x sehari (porsi lebih kecil, lebih sering)
```

#### 3. **SCHOOL_CHILDREN (Anak Sekolah)**
```
Kebutuhan Khusus:
├── Kalori: 1600-2000 kcal/hari (usia 6-12 tahun)
├── Protein: 35-45 gram/hari
├── Kalsium: 1000 mg/hari (pertumbuhan tulang)
├── Vitamin D: Untuk penyerapan kalsium
├── Zat Besi: 8-10 mg/hari
└── Karbohidrat: Energi untuk belajar

Menu Contoh:
├── Makan Siang: Nasi + ayam/ikan + sayur + buah + susu
└── Snack: Roti + telur + susu

Waktu Makan: 1x utama (siang) + 1x snack (pagi)
```

#### 4. **TODDLER (Balita)**
```
Kebutuhan Khusus:
├── Protein: 13-20 gram/hari (anti stunting)
├── Kalori: 1000-1400 kcal/hari
├── Zat Besi: 7-10 mg/hari
├── Kalsium: 700 mg/hari
├── Vitamin A: 400-500 mcg/hari
└── Zinc: Untuk pertumbuhan

Menu Contoh:
├── Sarapan: Bubur ayam + telur + sayur
├── Snack: Buah + biskuit
└── Makan Siang: Nasi lembek + ikan + wortel + brokoli

Waktu Makan: 3x utama + 2-3x snack
Tekstur: Lunak, mudah dikunyah
```

---

## 💻 Implementasi di Aplikasi

### Form Flow untuk User (SPPG Staff):

#### Step 1: Pilih/Buat Program
```
[Dropdown] Pilih Program:
├── MBG Ibu Hamil & Menyusui Purwakarta 2025
├── MBG Anak Sekolah Purwakarta 2025
├── MBG Kesehatan Ibu & Anak Purwakarta 2025
└── + Buat Program Baru
```

#### Step 2: Pilih Organisasi Penerima
```
[Dropdown] Pilih Organisasi:
├── Puskesmas Purwakarta (HEALTH_FACILITY)
├── SDN 1 Purwakarta (SCHOOL)
├── Posyandu Munjuljaya (COMMUNITY_CENTER)
├── Puskesmas Jatiluhur (HEALTH_FACILITY)
└── + Daftarkan Organisasi Baru
```

#### Step 3: Pilih Target Group (Filtered by Program)
```
Program: "MBG Ibu Hamil & Menyusui Purwakarta 2025"

[Dropdown] Kelompok Sasaran:
├── 🤰 Ibu Hamil (PREGNANT_WOMAN)
└── 🤱 Ibu Menyusui (BREASTFEEDING_MOTHER)

❌ NOT AVAILABLE:
├── Anak Sekolah (tidak di allowed list)
└── Balita (tidak di allowed list)
```
```
[Dropdown] Pilih Organisasi:
├── Puskesmas Menteng (HEALTH_FACILITY)
├── SD Negeri 01 Menteng (SCHOOL)
├── Posyandu RW 05 (COMMUNITY_CENTER)
└── + Daftarkan Organisasi Baru
```

#### Step 3: Pilih Target Group (Filtered by Program)
```
Program: "MBG Ibu Hamil & Menyusui 2025"

[Dropdown] Kelompok Sasaran:
├── 🤰 Ibu Hamil (PREGNANT_WOMAN)
└── 🤱 Ibu Menyusui (BREASTFEEDING_MOTHER)

❌ NOT AVAILABLE:
├── Anak Sekolah (tidak di allowed list)
└── Balita (tidak di allowed list)
```

#### Step 4: Input Detail (Dynamic based on Target Group)

**Jika pilih PREGNANT_WOMAN:**
```
Jumlah Ibu Hamil: [50]
Ibu Hamil Aktif: [50]

Distribusi Usia Kehamilan:
├── Trimester 1 (0-3 bulan): [15]
├── Trimester 2 (4-6 bulan): [20]
└── Trimester 3 (7-9 bulan): [15]

❌ Gender Breakdown: HIDDEN (redundant)

Konfigurasi Pemberian:
├── Frekuensi: [7] hari/minggu
├── Waktu Makan: [2] kali/hari
├── Jam: Sarapan [08:00], Makan Siang [12:00]
└── Metode: Take-home package
```

**Jika pilih SCHOOL_CHILDREN:**
```
Jumlah Siswa: [420]
Siswa Aktif: [420]

✅ Gender Breakdown:
├── Laki-laki: [210]
└── Perempuan: [210]

Distribusi Tingkat Pendidikan:
├── SD Kelas 1-3: [180]
└── SD Kelas 4-6: [240]

Konfigurasi Pemberian:
├── Frekuensi: [5] hari/minggu (weekdays)
├── Waktu Makan: [1] kali/hari
├── Jam: Makan Siang [12:00]
└── Metode: Makan di tempat (on-site)
```

---

## 🎯 Business Rules Summary

### Rule 1: Program Flexibility
```
✅ Program bisa MULTI-TARGET (1 program → multiple target groups)
✅ Program bisa SINGLE-TARGET (1 program → 1 target group only)
✅ SPPG yang menentukan konfigurasi saat buat program
```

### Rule 2: Target Group = WHO eats
```
Target Group = SIAPA yang menerima makanan
├── Bukan "dimana" (organization type)
├── Bukan "kapan" (feeding schedule)
└── Tapi "SIAPA dengan kebutuhan nutrisi spesifik"
```

### Rule 3: Beneficiary Organization = WHERE distribution
```
Organization Type = DIMANA distribusi makanan
├── HEALTH_FACILITY → untuk ibu hamil, ibu menyusui, balita
├── SCHOOL → untuk anak sekolah
├── COMMUNITY_CENTER → untuk lansia, remaja putri
└── Bisa overlap (1 org bisa melayani multiple target groups)
```

### Rule 4: Enrollment = Contract
```
Enrollment = Kontrak pelayanan yang spesifik:
├── Program tertentu
├── Organisasi tertentu
├── Target Group tertentu
├── Jumlah penerima tertentu
├── Menu khusus untuk target group
└── Jadwal pemberian tertentu
```

### Rule 5: Same Org, Different Targets = Different Enrollments
```
Puskesmas Purwakarta bisa punya:
├── Enrollment #1: PREGNANT_WOMAN (50 orang, menu ibu hamil)
├── Enrollment #2: BREASTFEEDING_MOTHER (40 orang, menu ibu menyusui)
└── Enrollment #3: TODDLER (40 orang, menu balita)

= 3 enrollments berbeda dengan MENU & JADWAL berbeda!
```

---

## 📈 Reporting & Analytics

### Dashboard SPPG - Overview:
```
SPPG Purwakarta - Dashboard
Total Penerima Manfaat: 950 orang
├── Ibu Hamil: 150 orang (16%)
├── Ibu Menyusui: 130 orang (14%)
├── Anak Sekolah: 450 orang (47%)
├── Balita: 150 orang (16%)
└── Remaja Putri: 70 orang (7%)

Total Menu Berbeda: 5 jenis menu
Total Distribusi Point: 12 lokasi
Budget Terpakai: Rp 950 juta / Rp 1,5 miliar
Wilayah Layanan: Kab. Purwakarta (17 Kecamatan)
```

### Report per Target Group:
```
Report: Ibu Hamil (PREGNANT_WOMAN)
Wilayah: Kabupaten Purwakarta

Total Penerima: 150 orang
Distribusi:
├── Trimester 1: 45 orang (30%)
├── Trimester 2: 60 orang (40%)
└── Trimester 3: 45 orang (30%)

Lokasi:
├── Puskesmas Purwakarta: 50 orang
├── Puskesmas Jatiluhur: 40 orang
├── Posyandu Munjuljaya: 30 orang
└── Klinik Bersalin Campaka: 30 orang

Menu Spesifik:
├── Menu Ibu Hamil A (Trimester 1-2)
└── Menu Ibu Hamil B (Trimester 3)

Nutrisi Target vs Aktual:
├── Asam Folat: 600 mcg ✅ (target tercapai)
├── Zat Besi: 27 mg ✅ (target tercapai)
└── Kalsium: 1000 mg ✅ (target tercapai)
```

---

## 🔄 Data Flow Example

### Complete Flow: Dari Program sampai Distribusi

```
1. SPPG Purwakarta membuat program:
   ├── Program: "MBG Kesehatan Ibu Purwakarta 2025"
   ├── Multi-Target: YES
   ├── Allowed: [PREGNANT_WOMAN, BREASTFEEDING_MOTHER]
   └── Budget: Rp 400 juta

2. Register beneficiary organizations:
   ├── Puskesmas Purwakarta (HEALTH_FACILITY)
   ├── Puskesmas Jatiluhur (HEALTH_FACILITY)
   └── Posyandu Munjuljaya (COMMUNITY_CENTER)

3. Create enrollments:
   Enrollment A:
   ├── Program: MBG Kesehatan Ibu Purwakarta 2025
   ├── Organization: Puskesmas Purwakarta
   ├── Target: PREGNANT_WOMAN
   ├── Count: 50 ibu hamil
   └── Menu: Menu Ibu Hamil

   Enrollment B:
   ├── Program: MBG Kesehatan Ibu Purwakarta 2025
   ├── Organization: Puskesmas Purwakarta
   ├── Target: BREASTFEEDING_MOTHER
   ├── Count: 40 ibu menyusui
   └── Menu: Menu Ibu Menyusui

4. Create menus (per target group):
   Menu 1: "Nasi Ikan Bayam" (untuk ibu hamil)
   ├── Tinggi asam folat, zat besi
   ├── Kalori: 600 kcal/porsi
   └── Target: PREGNANT_WOMAN

   Menu 2: "Nasi Ayam Brokoli" (untuk ibu menyusui)
   ├── Tinggi protein, kalori
   ├── Kalori: 700 kcal/porsi
   └── Target: BREASTFEEDING_MOTHER

5. Production planning:
   Day 1 (Monday):
   ├── Menu Ibu Hamil: 100 porsi (50 orang × 2 kali)
   └── Menu Ibu Menyusui: 120 porsi (40 orang × 3 kali)

6. Distribution:
   ├── Puskesmas Purwakarta: 220 porsi total
   │   ├── 100 porsi Menu Ibu Hamil
   │   └── 120 porsi Menu Ibu Menyusui
   ├── Delivery time: 07:00 AM & 11:00 AM
   └── Distribution method: Take-home package
```

---

## ✅ Summary - Key Takeaways

### 1. **Hierarki yang Benar:**
```
SPPG
└── Program (1 atau lebih)
    └── Enrollment (per org + per target group)
        ├── Target Group (WHO - kebutuhan nutrisi)
        ├── Organization (WHERE - lokasi distribusi)
        └── Menu Spesifik (WHAT - makanan sesuai kebutuhan)
```

### 2. **Target Group ≠ Organization Type**
- Target Group = SIAPA yang makan (ibu hamil, anak sekolah, dll)
- Organization Type = DIMANA distribusi (puskesmas, sekolah, dll)

### 3. **Flexibility is Key**
- 1 Program bisa multiple target groups
- 1 Organization bisa multiple enrollments (beda target group)
- Setiap target group punya kebutuhan nutrisi UNIK

### 4. **Data Structure Supports Business Logic**
- `ProgramBeneficiaryEnrollment` = Bridge yang flexible
- `targetGroup` field = Kunci untuk filtering & reporting
- `targetGroupSpecificData` (JSON) = Breakdown dinamis per target group

### 5. **User Experience yang Clear**
- Form enrollment conditional berdasarkan target group
- Menu options filtered berdasarkan target group
- Reporting separated per target group
- Nutrition tracking per target group

---

**Dokumentasi ini menjelaskan:**
✅ Konsep Program multi-target
✅ Perbedaan target group vs organization type
✅ Kebutuhan nutrisi per target group
✅ Data structure yang mendukung flexibility
✅ Real-world scenarios & use cases

**Untuk Developer:**
- Pastikan validation rules sesuai target group
- UI conditional rendering berdasarkan target group
- Reporting & analytics per target group
- Menu assignment based on target group compatibility

**Untuk SPPG User:**
- Pahami perbedaan program vs enrollment
- Satu organisasi bisa melayani multiple target groups
- Setiap target group punya menu & jadwal berbeda
- Reporting akan separated per target group

---

**Dibuat oleh:** Bagizi-ID Development Team
**Tanggal:** November 7, 2025
**Status:** Living Document - akan di-update sesuai kebutuhan
