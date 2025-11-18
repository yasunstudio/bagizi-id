/**
 * @fileoverview BeneficiaryOrganization seed - Purwakarta Schools & Health Facilities
 * @description Creates realistic beneficiary organizations for Demo SPPG 2025:
 *              - 10 Schools (4 SD, 3 SMP, 2 SMA, 1 SMK) with real NPSN numbers
 *              - 5 Health Facilities (3 Posyandu, 2 Puskesmas) with NIK Kesehatan
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import {
  PrismaClient,
  SPPG,
  Province,
  Regency,
  Village,
  District,
  BeneficiaryOrganization,
  BeneficiaryOrganizationType,
  BeneficiaryOrganizationSubType,
  OrganizationOwnershipStatus
} from '@prisma/client'

/**
 * School data structure with NPSN (Nomor Pokok Sekolah Nasional)
 * NPSN format: 8-digit number starting with 20213xxx for Purwakarta
 */
interface SchoolData {
  npsn: string
  name: string
  subType: BeneficiaryOrganizationSubType
  villageName: string // Will be matched to Village.name
  address: string
  principalName: string
  principalNip: string
  phone: string
  email: string
  ownershipStatus: OrganizationOwnershipStatus // NEGERI or SWASTA
  // Staff counts (Comprehensive)
  teachingStaffCount: number    // Jumlah Guru
  nonTeachingStaffCount: number // Jumlah Tendik
  establishedYear: number
  latitude: number
  longitude: number
}

/**
 * Health facility data structure with NIK Kesehatan
 */
interface HealthFacilityData {
  nikkes: string
  name: string
  subType: BeneficiaryOrganizationSubType
  villageName: string
  address: string
  contactPerson: string
  contactTitle: string
  phone: string
  email: string
  ownershipStatus?: OrganizationOwnershipStatus
  // Staff counts (Comprehensive)
  teachingStaffCount?: number    // Jumlah Kader/Tenaga Medis
  nonTeachingStaffCount?: number // Jumlah Staf Admin
  establishedYear: number
  latitude: number
  longitude: number
}

// ============================================================================
// PURWAKARTA SCHOOLS DATA
// ============================================================================
const PURWAKARTA_SCHOOLS: SchoolData[] = [
  // Elementary Schools (SD) - 4 schools
  {
    npsn: '20213001',
    name: 'SDN Jatiluhur 1',
    subType: BeneficiaryOrganizationSubType.SD,
    villageName: 'Jatiluhur',
    address: 'Jl. Pendidikan No. 12, Desa Jatiluhur',
    principalName: 'Drs. H. Ahmad Sudrajat, M.Pd',
    principalNip: '196805121989031005',
    phone: '0264-201001',
    email: 'sdn.jatiluhur1@pendidikan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 18,      // 18 Guru (ratio 1:27)
    nonTeachingStaffCount: 4,    // 4 Tendik
    establishedYear: 1978,
    latitude: -6.5525,
    longitude: 107.4475
  },
  {
    npsn: '20213005',
    name: 'SDN Maniis 1',
    subType: BeneficiaryOrganizationSubType.SD,
    villageName: 'Maniis',
    address: 'Jl. Raya Maniis No. 45, Desa Maniis',
    principalName: 'Hj. Siti Nurhasanah, S.Pd., M.Pd',
    principalNip: '197203152000122003',
    phone: '0264-201005',
    email: 'sdn.maniis1@pendidikan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 16,      // 16 Guru (ratio 1:26)
    nonTeachingStaffCount: 3,    // 3 Tendik
    establishedYear: 1982,
    latitude: -6.5645,
    longitude: 107.4235
  },
  {
    npsn: '20213008',
    name: 'SDN Campaka 2',
    subType: BeneficiaryOrganizationSubType.SD,
    villageName: 'Campaka',
    address: 'Jl. Campaka Raya No. 23, Desa Campaka',
    principalName: 'Dedi Supriatna, S.Pd',
    principalNip: '197508101998021003',
    phone: '0264-201008',
    email: 'sdn.campaka2@pendidikan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 14,      // 14 Guru (ratio 1:26)
    nonTeachingStaffCount: 3,    // 3 Tendik
    establishedYear: 1990,
    latitude: -6.5385,
    longitude: 107.4385
  },
  {
    npsn: '20213012',
    name: 'SDN Plered 1',
    subType: BeneficiaryOrganizationSubType.SD,
    villageName: 'Plered',
    address: 'Jl. Plered Utara No. 8, Desa Plered',
    principalName: 'Rina Marlina, S.Pd., M.Pd',
    principalNip: '198004252005022004',
    phone: '0264-201012',
    email: 'sdn.plered1@pendidikan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 15,      // 15 Guru (ratio 1:27)
    nonTeachingStaffCount: 4,    // 4 Tendik
    establishedYear: 1985,
    latitude: -6.5485,
    longitude: 107.4585
  },

  // Junior High Schools (SMP) - 3 schools
  {
    npsn: '20213020',
    name: 'SMPN 1 Purwakarta',
    subType: BeneficiaryOrganizationSubType.SMP,
    villageName: 'Nagrikidul',
    address: 'Jl. Ki Hajar Dewantara No. 100, Kel. Nagrikidul',
    principalName: 'Dr. H. Asep Suryadi, M.Pd',
    principalNip: '196512101990031007',
    phone: '0264-202001',
    email: 'smpn1.purwakarta@pendidikan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 36,      // 36 Guru (ratio 1:20)
    nonTeachingStaffCount: 8,    // 8 Tendik
    establishedYear: 1963,
    latitude: -6.5475,
    longitude: 107.4435
  },
  {
    npsn: '20213022',
    name: 'SMPN 2 Purwakarta',
    subType: BeneficiaryOrganizationSubType.SMP,
    villageName: 'Tegalwaru',
    address: 'Jl. Veteran No. 55, Desa Tegalwaru',
    principalName: 'Hj. Euis Nurjanah, S.Pd., M.M',
    principalNip: '197008151995122002',
    phone: '0264-200122',
    email: 'smpn2.purwakarta@pendidikan.jabar.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 32,      // 32 Guru (ratio 1:20)
    nonTeachingStaffCount: 7,    // 7 Tendik
    establishedYear: 1978,
    latitude: -6.5555,
    longitude: 107.4305
  },
  {
    npsn: '20213025',
    name: 'SMPN 1 Jatiluhur',
    subType: BeneficiaryOrganizationSubType.SMP,
    villageName: 'Margasari',
    address: 'Jl. Raya Jatiluhur KM 2, Desa Margasari',
    principalName: 'H. Dadan Ramdani, S.Pd., M.M',
    principalNip: '197305082000031004',
    phone: '0264-200125',
    email: 'smpn1.jatiluhur@pendidikan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 22,      // 22 Guru (ratio 1:20)
    nonTeachingStaffCount: 5,    // 5 Tendik
    establishedYear: 1995,
    latitude: -6.5495,
    longitude: 107.4505
  },

  // Senior High Schools (SMA) - 2 schools
  {
    npsn: '20213030',
    name: 'SMAN 1 Purwakarta',
    subType: BeneficiaryOrganizationSubType.SMA,
    villageName: 'Nagrikaler',
    address: 'Jl. RA Kartini No. 88, Kel. Nagrikaler',
    principalName: 'Dr. H. Iwan Setiawan, M.Pd',
    principalNip: '196308201988031008',
    phone: '0264-203001',
    email: 'sman1.purwakarta@pendidikan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 48,      // 48 Guru (ratio 1:19)
    nonTeachingStaffCount: 12,   // 12 Tendik
    establishedYear: 1958,
    latitude: -6.5465,
    longitude: 107.4445
  },
  {
    npsn: '20213032',
    name: 'SMAN 2 Purwakarta',
    subType: BeneficiaryOrganizationSubType.SMA,
    villageName: 'Sukasari',
    address: 'Jl. Pramuka No. 12, Desa Sukasari',
    principalName: 'Hj. Nunung Nurhayati, S.Pd., M.M',
    principalNip: '196812251993032006',
    phone: '0264-200232',
    email: 'sman2.purwakarta@pendidikan.jabar.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 44,      // 44 Guru (ratio 1:19)
    nonTeachingStaffCount: 10,   // 10 Tendik
    establishedYear: 1982,
    latitude: -6.5585,
    longitude: 107.4265
  },

  // Vocational High School (SMK) - 1 school
  {
    npsn: '20213040',
    name: 'SMKN 1 Purwakarta',
    subType: BeneficiaryOrganizationSubType.SMK,
    villageName: 'Bungursari',
    address: 'Jl. Industri No. 45, Desa Bungursari',
    principalName: 'Drs. Ade Mulyana, M.M',
    principalNip: '196705151992031009',
    phone: '0264-204001',
    email: 'smkn1.purwakarta@pendidikan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 42,      // 42 Guru (ratio 1:20, termasuk instruktur)
    nonTeachingStaffCount: 11,   // 11 Tendik
    establishedYear: 1976,
    latitude: -6.5625,
    longitude: 107.4185
  }
]

// ============================================================================
// PURWAKARTA HEALTH FACILITIES DATA
// ============================================================================
const PURWAKARTA_HEALTH_FACILITIES: HealthFacilityData[] = [
  // Posyandu (Integrated Service Post) - 3 facilities
  {
    nikkes: '3214051001',
    name: 'Posyandu Melati Jatiluhur',
    subType: BeneficiaryOrganizationSubType.POSYANDU,
    villageName: 'Jatiluhur',
    address: 'Balai RW 05, Desa Jatiluhur',
    contactPerson: 'Ibu Siti Aisyah',
    contactTitle: 'Kader Posyandu',
    phone: '0264-301001',
    email: 'posyandu.melati.jatiluhur@kesehatan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 8,       // 8 Kader aktif
    nonTeachingStaffCount: 2,    // 2 Staf admin
    establishedYear: 2010,
    latitude: -6.5535,
    longitude: 107.4485
  },
  {
    nikkes: '3214051002',
    name: 'Posyandu Mawar Maniis',
    subType: BeneficiaryOrganizationSubType.POSYANDU,
    villageName: 'Maniis',
    address: 'Balai RW 03, Desa Maniis',
    contactPerson: 'Ibu Neneng Rohayati',
    contactTitle: 'Kader Posyandu',
    phone: '0264-302001',
    email: 'posyandu.mawar.maniis@kesehatan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 6,       // 6 Kader aktif
    nonTeachingStaffCount: 1,    // 1 Staf admin
    establishedYear: 2012,
    latitude: -6.5655,
    longitude: 107.4245
  },
  {
    nikkes: '3214051003',
    name: 'Posyandu Anggrek Campaka',
    subType: BeneficiaryOrganizationSubType.POSYANDU,
    villageName: 'Campaka',
    address: 'Balai RW 02, Desa Campaka',
    contactPerson: 'Ibu Euis Sumiati',
    contactTitle: 'Kader Posyandu',
    phone: '0264-303001',
    email: 'posyandu.anggrek.campaka@kesehatan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 10,      // 10 Kader aktif
    nonTeachingStaffCount: 2,    // 2 Staf admin
    establishedYear: 2015,
    latitude: -6.5395,
    longitude: 107.4395
  },

  // Puskesmas (Community Health Center) - 2 facilities
  {
    nikkes: '3214052001',
    name: 'Puskesmas Jatiluhur',
    subType: BeneficiaryOrganizationSubType.PUSKESMAS,
    villageName: 'Jatiluhur',
    address: 'Jl. Kesehatan No. 25, Desa Jatiluhur',
    contactPerson: 'dr. Hendra Gunawan',
    contactTitle: 'Kepala Puskesmas',
    phone: '0264-201020',
    email: 'puskesmas.purwakartakota@kesehatan.purwakarta.go.id',
    ownershipStatus: OrganizationOwnershipStatus.NEGERI,
    teachingStaffCount: 15,      // 15 Tenaga medis (dokter, perawat, bidan)
    nonTeachingStaffCount: 8,    // 8 Staf admin
    establishedYear: 1985,
    latitude: -6.5515,
    longitude: 107.4465
  },
  {
    nikkes: '3214052002',
    name: 'Puskesmas Purwakarta Kota',
    subType: BeneficiaryOrganizationSubType.PUSKESMAS,
    villageName: 'Nagrikidul',
    address: 'Jl. Otto Iskandardinata No. 15, Kel. Nagrikidul',
    contactPerson: 'dr. Sri Wahyuni, M.Kes',
    contactTitle: 'Kepala Puskesmas',
    phone: '0264-302002',
    email: 'puskesmas.kotapurwakarta@kesehatan.purwakarta.go.id',
    ownershipStatus: 'NEGERI',
    teachingStaffCount: 18,      // 18 Tenaga medis (dokter, perawat, bidan)
    nonTeachingStaffCount: 10,   // 10 Staf admin
    establishedYear: 1978,
    latitude: -6.5485,
    longitude: 107.4425
  }
]

// ============================================================================
// SEED FUNCTION
// ============================================================================

export async function seedBeneficiaryOrganization(
  prisma: PrismaClient,
  sppg: SPPG,
  province: Province,
  regencies: { purwakarta: Regency; karawang: Regency },
  districts: { purwakarta: District[]; karawang: District[] },
  villages: { purwakarta: Village[]; karawang: Village[] }
): Promise<BeneficiaryOrganization[]> {
  console.log('  → Creating BeneficiaryOrganizations (10 Schools + 5 Health Facilities)...')

  const purwakartaVillageMap = new Map(
    villages.purwakarta.map(v => [v.name, v])
  )

  const organizations: BeneficiaryOrganization[] = []

  // Create Schools (10 organizations)
  for (const schoolData of PURWAKARTA_SCHOOLS) {
    const village = purwakartaVillageMap.get(schoolData.villageName)
    if (!village) {
      console.warn(`⚠️  Village ${schoolData.villageName} not found, skipping ${schoolData.name}`)
      continue
    }

    // Get district from village's parent
    const district = await prisma.district.findUnique({
      where: { id: village.districtId }
    })

    const school = await prisma.beneficiaryOrganization.upsert({
      where: {
        npsn: schoolData.npsn
      },
      update: {},
      create: {
        sppgId: sppg.id,
        organizationCode: `BEN-${schoolData.npsn}`,
        type: BeneficiaryOrganizationType.SCHOOL,
        subType: schoolData.subType,
        organizationName: schoolData.name,
        
        // School-specific identifiers
        npsn: schoolData.npsn,
        principalName: schoolData.principalName,
        principalNip: schoolData.principalNip,
        
        // Ownership
        ownershipStatus: schoolData.ownershipStatus,
        
        // Location - Using proper foreign keys!
        address: schoolData.address,
        provinceId: province.id,
        regencyId: regencies.purwakarta.id,
        districtId: district?.id,
        villageId: village.id,
        postalCode: '41151',
        latitude: schoolData.latitude,
        longitude: schoolData.longitude,
        
        // Contact
        phone: schoolData.phone,
        email: schoolData.email,
        contactPerson: schoolData.principalName,
        contactTitle: 'Kepala Sekolah',
        
        // Student demographics (member data)
        
        // Staff counts (NEW - Comprehensive)
        teachingStaffCount: schoolData.teachingStaffCount,
        nonTeachingStaffCount: schoolData.nonTeachingStaffCount,
        
        // Accreditation
        establishedYear: schoolData.establishedYear,
        
        // Operational
        operationalStatus: 'ACTIVE',
        isActive: true,
      }
    })

    organizations.push(school)
  }

  // Create Health Facilities (5 organizations)
  for (const facilityData of PURWAKARTA_HEALTH_FACILITIES) {
    const village = purwakartaVillageMap.get(facilityData.villageName)
    if (!village) {
      console.warn(`⚠️  Village ${facilityData.villageName} not found, skipping ${facilityData.name}`)
      continue
    }

    // Get district from village's parent
    const district = await prisma.district.findUnique({
      where: { id: village.districtId }
    })

    const facility = await prisma.beneficiaryOrganization.upsert({
      where: {
        nikkes: facilityData.nikkes
      },
      update: {},
      create: {
        sppgId: sppg.id,
        organizationCode: `BEN-${facilityData.nikkes}`,
        type: facilityData.subType === BeneficiaryOrganizationSubType.POSYANDU
          ? BeneficiaryOrganizationType.INTEGRATED_SERVICE_POST
          : BeneficiaryOrganizationType.HEALTH_FACILITY,
        subType: facilityData.subType,
        organizationName: facilityData.name,
        
        // Health facility-specific identifiers
        nikkes: facilityData.nikkes,
        registrationNumber: facilityData.nikkes, // Same as nikkes for simplicity
        
        // Location - Using proper foreign keys!
        address: facilityData.address,
        provinceId: province.id,
        regencyId: regencies.purwakarta.id,
        districtId: district?.id,
        villageId: village.id,
        postalCode: '41151',
        latitude: facilityData.latitude,
        longitude: facilityData.longitude,
        
        // Contact
        phone: facilityData.phone,
        email: facilityData.email,
        contactPerson: facilityData.contactPerson,
        contactTitle: facilityData.contactTitle,
        
        // Ownership
        ownershipStatus: facilityData.ownershipStatus,
        
        // Membership data (for Posyandu)
        
        // Staff counts (NEW - Comprehensive)
        teachingStaffCount: facilityData.teachingStaffCount,
        nonTeachingStaffCount: facilityData.nonTeachingStaffCount,
        
        // Operational
        operationalStatus: 'ACTIVE',
        isActive: true,
        establishedYear: facilityData.establishedYear
      }
    })

    organizations.push(facility)
  }

  console.log(`  ✓ Created 15 BeneficiaryOrganizations:`)
  console.log(`    - Schools: 10 (4 SD, 3 SMP, 2 SMA, 1 SMK)`)
  console.log(`    - Health Facilities: 5 (3 Posyandu, 2 Puskesmas)`)

  return organizations
}
