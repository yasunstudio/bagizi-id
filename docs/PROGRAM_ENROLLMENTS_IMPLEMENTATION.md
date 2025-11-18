# 📚 Program Enrollments Implementation Guide

**Status**: 🔴 **CRITICAL - Missing Feature**  
**Priority**: ⚠️ **HIGH**  
**Version**: Next.js 15.5.4 / Prisma 6.17.1  
**Author**: Bagizi-ID Development Team  
**Date**: November 4, 2025

---

## 🎯 Executive Summary

Program saat ini **tidak memiliki UI untuk manage school enrollments**, padahal di database sudah ada model `ProgramSchoolEnrollment` yang lengkap dengan 40+ fields untuk konfigurasi per-school.

### Current State ❌
- Program detail page hanya punya 5 tabs (Overview, Schedule, Budget, Nutrition, Monitoring)
- Tidak ada cara untuk user melihat/manage sekolah yang enrolled
- Form program masih menggunakan `partnerSchools: String[]` (array nama sekolah)
- Tidak ada UI untuk configure enrollment settings per school

### Target State ✅
- Program detail page punya 6 tabs (tambah **Enrollments** tab)
- User bisa melihat semua sekolah enrolled dengan detail konfigurasi
- User bisa add/edit/delete enrollment dengan form lengkap
- Data enrollment terstruktur dengan baik di `ProgramSchoolEnrollment` table

---

## 📊 Problem Analysis

### Issue 1: Missing Enrollments Tab 🔴

**Current Program Detail Page:**
```
┌─────────────────────────────────────────────────────┐
│ Program: Makanan Bergizi 2025                       │
│ ┌─────────┬─────────┬────────┬────────┬──────────┐ │
│ │Ringkasan│ Jadwal  │Anggaran│Nutrisi │Monitoring│ │
│ └─────────┴─────────┴────────┴────────┴──────────┘ │
│                                                     │
│ [Overview content: program stats, target, etc]      │
└─────────────────────────────────────────────────────┘
```

**Missing Information:**
- ❌ Tidak bisa lihat sekolah mana saja yang enrolled
- ❌ Tidak bisa lihat berapa siswa per sekolah
- ❌ Tidak bisa lihat konfigurasi feeding per sekolah
- ❌ Tidak bisa lihat budget allocation per sekolah

### Issue 2: partnerSchools Field 🟡

**Current Schema (Prisma):**
```prisma
model NutritionProgram {
  id              String   @id @default(cuid())
  name            String
  partnerSchools  String[] // ❌ Array of school names
  
  // ✅ Proper relation (but not used in UI)
  programEnrollments ProgramSchoolEnrollment[]
}
```

**Current Form (ProgramForm.tsx):**
```typescript
partnerSchools: z
  .array(z.string().min(1, 'Nama sekolah tidak boleh kosong'))
  .min(1, 'Minimal 1 sekolah mitra harus dipilih')
```

**Problems:**
1. **Data Redundancy**: School names stored in 2 places
   - `partnerSchools: ["SDN 1", "SDN 2"]` (in program table)
   - `ProgramSchoolEnrollment.school.schoolName` (via relation)

2. **Data Inconsistency Risk**: 
   - School name change → partnerSchools array becomes stale
   - Enrollment deleted → partnerSchools array not updated

3. **Missing Configuration**: Can't store per-school settings
   - Student counts, feeding schedule, budget, delivery info

4. **Poor Query Performance**: 
   - Can't efficiently query "programs where school X is enrolled"
   - Need to scan partnerSchools arrays

### Issue 3: No Enrollment Configuration UI 🔴

**ProgramSchoolEnrollment Model** has 40+ fields for configuration:

```prisma
model ProgramSchoolEnrollment {
  // Student Configuration
  targetStudents       Int
  activeStudents       Int
  students4to6Years    Int
  students7to12Years   Int
  students13to15Years  Int
  students16to18Years  Int
  maleStudents         Int
  femaleStudents       Int
  
  // Feeding Configuration
  feedingDays          Int
  mealsPerDay          Int
  feedingTime          FeedingTime?
  breakfastTime        String?
  lunchTime            String?
  snackTime            String?
  
  // Delivery Configuration
  deliveryAddress      String
  deliveryContact      String
  deliveryPhone        String
  deliveryInstructions String?
  preferredDeliveryTime String?
  estimatedTravelTime  Int?
  
  // Budget Configuration
  monthlyBudgetAllocation Float
  budgetPerStudent        Float
  contractValue           Float
  contractNumber          String?
  
  // Service Configuration
  storageCapacity     Int?
  servingMethod       ServingMethod?
  
  // Performance Tracking
  attendanceRate      Float?
  participationRate   Float?
  satisfactionScore   Float?
  totalDistributions  Int      @default(0)
  totalMealsServed    Int      @default(0)
}
```

**Currently:** ❌ No UI to input/edit any of these fields!

---

## 🎨 Proposed Solution

### Solution Architecture

```
Program Detail Page
├── Overview Tab (existing)
├── ✨ ENROLLMENTS TAB (NEW!)
│   ├── Enrollment Stats Card
│   │   └── X schools enrolled, Y total students, Z budget
│   ├── [+ Add New Enrollment] Button
│   └── Grid of EnrollmentCard
│       ├── EnrollmentCard (SDN 1)
│       │   ├── School Info
│       │   ├── Student Stats
│       │   ├── Feeding Config
│       │   ├── Budget Info
│       │   └── [Edit] [Delete] Actions
│       ├── EnrollmentCard (SDN 2)
│       └── EnrollmentCard (SDN 3)
├── Schedule Tab (existing)
├── Budget Tab (existing)
├── Nutrition Tab (existing)
└── Monitoring Tab (existing)
```

### UI Mockup

```
┌────────────────────────────────────────────────────────────────────────┐
│ 📚 Program: Makanan Bergizi 2025                    [Edit] [Delete]    │
├────────────────────────────────────────────────────────────────────────┤
│ ┌──────────┬─────────────┬─────────┬─────────┬─────────┬───────────┐  │
│ │ Ringkasan│ Sekolah (5) │ Jadwal  │Anggaran │ Nutrisi │ Monitoring│  │
│ └──────────┴─────────────┴─────────┴─────────┴─────────┴───────────┘  │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────┐    │
│ │ 📊 Ringkasan Enrollment                                        │    │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │    │
│ │ │ 5 Sekolah   │ │ 1,705 Siswa │ │ Rp 85.25jt  │              │    │
│ │ │ Terdaftar   │ │ Total       │ │ Budget/Bulan│              │    │
│ │ └─────────────┘ └─────────────┘ └─────────────┘              │    │
│ └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│ [🔍 Cari sekolah...] [Filter: Semua Status ▾]   [+ Tambah Sekolah]   │
│                                                                        │
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐      │
│ │ 🏫 SDN 1 Purwakarta         │ │ 🏫 SDN 2 Purwakarta         │      │
│ │ ✅ ACTIVE                   │ │ ✅ ACTIVE                   │      │
│ │ NPSN: 20219347              │ │ NPSN: 20219348              │      │
│ │                             │ │                             │      │
│ │ 👥 Siswa                    │ │ 👥 Siswa                    │      │
│ │ Target: 485 | Aktif: 485   │ │ Target: 420 | Aktif: 420   │      │
│ │ L: 245 | P: 240             │ │ L: 210 | P: 210             │      │
│ │                             │ │                             │      │
│ │ 🍽️ Feeding                  │ │ 🍽️ Feeding                  │      │
│ │ 5 hari/minggu • 1x/hari    │ │ 5 hari/minggu • 1x/hari    │      │
│ │ Breakfast: 09:30           │ │ Breakfast: 09:30           │      │
│ │                             │ │                             │      │
│ │ 💰 Budget                   │ │ 💰 Budget                   │      │
│ │ Rp 24,250,000/bulan        │ │ Rp 21,000,000/bulan        │      │
│ │ Rp 50,000/siswa            │ │ Rp 50,000/siswa            │      │
│ │                             │ │                             │      │
│ │ 📊 Performance              │ │ 📊 Performance              │      │
│ │ Kehadiran: 95.5%           │ │ Kehadiran: 94.2%           │      │
│ │ Partisipasi: 98.0%         │ │ Partisipasi: 97.5%         │      │
│ │ 45 distribusi              │ │ 42 distribusi              │      │
│ │                             │ │                             │      │
│ │ [📝 Edit] [👁️ Detail]       │ │ [📝 Edit] [👁️ Detail]       │      │
│ └─────────────────────────────┘ └─────────────────────────────┘      │
│                                                                        │
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐      │
│ │ 🏫 SDN Campaka              │ │ 🏫 TK Pembina               │      │
│ │ ✅ ACTIVE                   │ │ ⏸️  PAUSED                   │      │
│ │ ... (similar card)          │ │ ... (similar card)          │      │
│ └─────────────────────────────┘ └─────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Implementation Plan

### Phase 1: Backend - API Routes ⚡

#### Create API Endpoints

**File:** `src/app/api/sppg/program/[id]/enrollments/route.ts`

```typescript
/**
 * GET /api/sppg/program/[id]/enrollments
 * Fetch all enrollments for a program
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const enrollments = await db.programSchoolEnrollment.findMany({
    where: {
      programId: params.id,
      program: {
        sppgId: session.user.sppgId! // Multi-tenant safety
      }
    },
    include: {
      school: {
        select: {
          id: true,
          schoolName: true,
          schoolCode: true,
          npsn: true,
          schoolType: true,
          schoolAddress: true,
          contactPhone: true,
          principalName: true,
        }
      },
      program: {
        select: {
          id: true,
          name: true,
          programCode: true,
        }
      }
    },
    orderBy: {
      school: {
        schoolName: 'asc'
      }
    }
  })

  return Response.json({ 
    success: true, 
    data: enrollments 
  })
}

/**
 * POST /api/sppg/program/[id]/enrollments
 * Create new enrollment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const validated = enrollmentSchema.safeParse(body)
  
  if (!validated.success) {
    return Response.json({ 
      error: 'Validation failed',
      details: validated.error.errors
    }, { status: 400 })
  }

  // Check if enrollment already exists
  const existing = await db.programSchoolEnrollment.findUnique({
    where: {
      schoolId_programId: {
        schoolId: validated.data.schoolId,
        programId: params.id
      }
    }
  })

  if (existing) {
    return Response.json({ 
      error: 'School already enrolled in this program' 
    }, { status: 409 })
  }

  const enrollment = await db.programSchoolEnrollment.create({
    data: {
      ...validated.data,
      programId: params.id,
      sppgId: session.user.sppgId!,
    },
    include: {
      school: true,
      program: true,
    }
  })

  return Response.json({ 
    success: true, 
    data: enrollment 
  }, { status: 201 })
}
```

**File:** `src/app/api/sppg/program/[id]/enrollments/[enrollmentId]/route.ts`

```typescript
/**
 * PUT /api/sppg/program/[id]/enrollments/[enrollmentId]
 * Update enrollment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; enrollmentId: string } }
) {
  // Similar structure to POST
}

/**
 * DELETE /api/sppg/program/[id]/enrollments/[enrollmentId]
 * Delete enrollment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; enrollmentId: string } }
) {
  // Similar structure with DELETE logic
}
```

---

### Phase 2: Schema & Types ⚡

#### Create Enrollment Schema

**File:** `src/features/sppg/program/schemas/enrollmentSchema.ts`

```typescript
import { z } from 'zod'
import { FeedingTime, ServingMethod, EnrollmentStatus } from '@prisma/client'

export const enrollmentSchema = z.object({
  schoolId: z.string().cuid('Invalid school ID'),
  
  // Enrollment Period
  enrollmentDate: z.coerce.date(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  
  // Student Configuration
  targetStudents: z.number()
    .int('Target students must be integer')
    .min(1, 'Minimal 1 siswa')
    .max(10000, 'Maksimal 10,000 siswa'),
    
  activeStudents: z.number()
    .int()
    .min(0)
    .max(10000),
    
  students4to6Years: z.number().int().min(0).default(0),
  students7to12Years: z.number().int().min(0).default(0),
  students13to15Years: z.number().int().min(0).default(0),
  students16to18Years: z.number().int().min(0).default(0),
  
  maleStudents: z.number().int().min(0),
  femaleStudents: z.number().int().min(0),
  
  // Feeding Configuration
  feedingDays: z.number()
    .int()
    .min(1, 'Minimal 1 hari')
    .max(7, 'Maksimal 7 hari'),
    
  mealsPerDay: z.number()
    .int()
    .min(1, 'Minimal 1 kali makan')
    .max(5, 'Maksimal 5 kali makan'),
    
  feedingTime: z.nativeEnum(FeedingTime).optional().nullable(),
  breakfastTime: z.string().optional().nullable(),
  lunchTime: z.string().optional().nullable(),
  snackTime: z.string().optional().nullable(),
  
  // Delivery Configuration
  deliveryAddress: z.string()
    .min(10, 'Alamat minimal 10 karakter')
    .max(500, 'Alamat maksimal 500 karakter'),
    
  deliveryContact: z.string()
    .min(3, 'Nama kontak minimal 3 karakter')
    .max(100),
    
  deliveryPhone: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor HP tidak valid'),
    
  deliveryInstructions: z.string()
    .max(1000)
    .optional()
    .nullable(),
    
  preferredDeliveryTime: z.string().optional().nullable(),
  estimatedTravelTime: z.number().int().min(0).optional().nullable(),
  
  // Service Configuration
  storageCapacity: z.number().int().min(0).optional().nullable(),
  servingMethod: z.nativeEnum(ServingMethod).optional().nullable(),
  
  // Budget Configuration
  monthlyBudgetAllocation: z.number()
    .min(0, 'Budget tidak boleh negatif')
    .max(1000000000, 'Budget terlalu besar'),
    
  budgetPerStudent: z.number()
    .min(0)
    .max(1000000),
    
  contractStartDate: z.coerce.date().optional().nullable(),
  contractEndDate: z.coerce.date().optional().nullable(),
  contractValue: z.number().min(0).optional().nullable(),
  contractNumber: z.string().max(100).optional().nullable(),
  
  // Status
  status: z.nativeEnum(EnrollmentStatus).default('ACTIVE'),
  isActive: z.boolean().default(true),
  
  // Notes
  notes: z.string().max(2000).optional().nullable(),
}).refine(
  (data) => data.maleStudents + data.femaleStudents === data.activeStudents,
  {
    message: 'Jumlah siswa laki-laki + perempuan harus sama dengan total siswa aktif',
    path: ['activeStudents']
  }
).refine(
  (data) => data.activeStudents <= data.targetStudents,
  {
    message: 'Siswa aktif tidak boleh melebihi target siswa',
    path: ['activeStudents']
  }
)

export type EnrollmentInput = z.infer<typeof enrollmentSchema>
```

#### Create Types

**File:** `src/features/sppg/program/types/enrollment.types.ts`

```typescript
import { 
  ProgramSchoolEnrollment, 
  School, 
  NutritionProgram 
} from '@prisma/client'

export type EnrollmentWithRelations = ProgramSchoolEnrollment & {
  school: Pick<School, 
    'id' | 'schoolName' | 'schoolCode' | 'npsn' | 'schoolType' | 
    'schoolAddress' | 'contactPhone' | 'principalName'
  >
  program: Pick<NutritionProgram, 'id' | 'name' | 'programCode'>
}

export interface EnrollmentStats {
  totalSchools: number
  totalStudents: number
  totalBudget: number
  averageAttendance: number
  averageParticipation: number
  activeEnrollments: number
  pausedEnrollments: number
  completedEnrollments: number
}

export interface EnrollmentFilters {
  status?: string
  schoolType?: string
  search?: string
}
```

---

### Phase 3: Frontend Components ⚡

#### 1. ProgramEnrollmentsTab Component

**File:** `src/features/sppg/program/components/detail/ProgramEnrollmentsTab.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  useProgramEnrollments, 
  useDeleteEnrollment 
} from '@/features/sppg/program/hooks'
import { EnrollmentCard } from './EnrollmentCard'
import { EnrollmentDialog } from './EnrollmentDialog'
import { 
  School, Users, DollarSign, TrendingUp, 
  Plus, Search 
} from 'lucide-react'

interface ProgramEnrollmentsTabProps {
  programId: string
  program: any
}

export function ProgramEnrollmentsTab({ 
  programId, 
  program 
}: ProgramEnrollmentsTabProps) {
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState(null)
  
  const { data: enrollments, isLoading } = useProgramEnrollments(programId)
  const { mutate: deleteEnrollment } = useDeleteEnrollment()
  
  // Calculate stats
  const stats = {
    totalSchools: enrollments?.length || 0,
    totalStudents: enrollments?.reduce((sum, e) => sum + e.activeStudents, 0) || 0,
    totalBudget: enrollments?.reduce((sum, e) => sum + e.monthlyBudgetAllocation, 0) || 0,
    activeCount: enrollments?.filter(e => e.status === 'ACTIVE').length || 0,
  }
  
  // Filter enrollments
  const filteredEnrollments = enrollments?.filter(e => 
    e.school.schoolName.toLowerCase().includes(search.toLowerCase()) ||
    e.school.schoolCode.toLowerCase().includes(search.toLowerCase())
  )
  
  const handleEdit = (enrollment: any) => {
    setEditingEnrollment(enrollment)
    setIsDialogOpen(true)
  }
  
  const handleDelete = (enrollmentId: string) => {
    if (confirm('Hapus enrollment sekolah ini?')) {
      deleteEnrollment({ programId, enrollmentId })
    }
  }
  
  const handleAddNew = () => {
    setEditingEnrollment(null)
    setIsDialogOpen(true)
  }
  
  if (isLoading) {
    return <div>Loading enrollments...</div>
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sekolah</p>
                <p className="text-2xl font-bold">{stats.totalSchools}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.activeCount} aktif
                </p>
              </div>
              <School className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Siswa</p>
                <p className="text-2xl font-bold">
                  {stats.totalStudents.toLocaleString('id-ID')}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget/Bulan</p>
                <p className="text-2xl font-bold">
                  Rp {(stats.totalBudget / 1000000).toFixed(1)}jt
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Budget/Siswa</p>
                <p className="text-2xl font-bold">
                  Rp {stats.totalStudents > 0 
                    ? (stats.totalBudget / stats.totalStudents).toFixed(0)
                    : '0'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari sekolah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Sekolah
        </Button>
      </div>
      
      {/* Enrollments Grid */}
      {filteredEnrollments && filteredEnrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEnrollments.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.id}
              enrollment={enrollment}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Belum Ada Sekolah Enrolled
            </h3>
            <p className="text-muted-foreground mb-4">
              Tambahkan sekolah untuk memulai program feeding.
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Sekolah Pertama
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Dialog */}
      <EnrollmentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        programId={programId}
        enrollment={editingEnrollment}
      />
    </div>
  )
}
```

#### 2. EnrollmentCard Component

**File:** `src/features/sppg/program/components/detail/EnrollmentCard.tsx`

```typescript
'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  School, Users, Calendar, DollarSign, 
  Utensils, TrendingUp, Edit, Trash2, Eye 
} from 'lucide-react'
import { EnrollmentWithRelations } from '@/features/sppg/program/types'

interface EnrollmentCardProps {
  enrollment: EnrollmentWithRelations
  onEdit: (enrollment: EnrollmentWithRelations) => void
  onDelete: (enrollmentId: string) => void
}

export function EnrollmentCard({ 
  enrollment, 
  onEdit, 
  onDelete 
}: EnrollmentCardProps) {
  const statusColors = {
    ACTIVE: 'bg-green-500',
    PAUSED: 'bg-yellow-500',
    COMPLETED: 'bg-blue-500',
    CANCELLED: 'bg-red-500',
  }
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <School className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">
                {enrollment.school.schoolName}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {enrollment.school.schoolType} • NPSN: {enrollment.school.npsn}
            </p>
          </div>
          <Badge 
            className={`${statusColors[enrollment.status]} text-white`}
          >
            {enrollment.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Students */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            <span>Siswa</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-semibold">{enrollment.targetStudents}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Aktif</p>
              <p className="font-semibold">{enrollment.activeStudents}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            L: {enrollment.maleStudents} • P: {enrollment.femaleStudents}
          </div>
        </div>
        
        {/* Feeding */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Utensils className="h-4 w-4" />
            <span>Feeding</span>
          </div>
          <div className="text-sm">
            <p>{enrollment.feedingDays} hari/minggu • {enrollment.mealsPerDay}x/hari</p>
            {enrollment.breakfastTime && (
              <p className="text-muted-foreground">
                Breakfast: {enrollment.breakfastTime}
              </p>
            )}
          </div>
        </div>
        
        {/* Budget */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            <span>Budget</span>
          </div>
          <div className="text-sm">
            <p className="font-semibold">
              Rp {enrollment.monthlyBudgetAllocation.toLocaleString('id-ID')}/bulan
            </p>
            <p className="text-muted-foreground">
              Rp {enrollment.budgetPerStudent.toLocaleString('id-ID')}/siswa
            </p>
          </div>
        </div>
        
        {/* Performance */}
        {(enrollment.attendanceRate || enrollment.participationRate) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>Performance</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {enrollment.attendanceRate && (
                <div>
                  <p className="text-muted-foreground">Kehadiran</p>
                  <p className="font-semibold">{enrollment.attendanceRate}%</p>
                </div>
              )}
              {enrollment.participationRate && (
                <div>
                  <p className="text-muted-foreground">Partisipasi</p>
                  <p className="font-semibold">{enrollment.participationRate}%</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {enrollment.totalDistributions} distribusi • {enrollment.totalMealsServed.toLocaleString()} porsi
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(enrollment)}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/schools/${enrollment.school.id}`}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 3. EnrollmentDialog Component

**File:** `src/features/sppg/program/components/detail/EnrollmentDialog.tsx`

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  useCreateEnrollment, 
  useUpdateEnrollment 
} from '@/features/sppg/program/hooks'
import { useSchools } from '@/features/sppg/school/hooks'
import { enrollmentSchema, type EnrollmentInput } from '@/features/sppg/program/schemas'

interface EnrollmentDialogProps {
  isOpen: boolean
  onClose: () => void
  programId: string
  enrollment?: any
}

export function EnrollmentDialog({ 
  isOpen, 
  onClose, 
  programId, 
  enrollment 
}: EnrollmentDialogProps) {
  const isEdit = !!enrollment
  
  const { data: schools } = useSchools()
  const { mutate: createEnrollment, isPending: isCreating } = useCreateEnrollment()
  const { mutate: updateEnrollment, isPending: isUpdating } = useUpdateEnrollment()
  
  const form = useForm<EnrollmentInput>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: enrollment || {
      feedingDays: 5,
      mealsPerDay: 1,
      status: 'ACTIVE',
      isActive: true,
    }
  })
  
  const onSubmit = (data: EnrollmentInput) => {
    if (isEdit) {
      updateEnrollment({
        programId,
        enrollmentId: enrollment.id,
        data
      }, {
        onSuccess: () => {
          onClose()
          form.reset()
        }
      })
    } else {
      createEnrollment({
        programId,
        data
      }, {
        onSuccess: () => {
          onClose()
          form.reset()
        }
      })
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Enrollment' : 'Tambah Enrollment Sekolah'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Dasar</TabsTrigger>
                <TabsTrigger value="students">Siswa</TabsTrigger>
                <TabsTrigger value="feeding">Feeding</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                {/* School Selection */}
                <FormField
                  control={form.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sekolah *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih sekolah" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schools?.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.schoolName} ({school.schoolCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Mulai *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Selesai</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="students" className="space-y-4">
                {/* Student Configuration - Add all fields here */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Siswa *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="activeStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Siswa Aktif *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Add more student fields... */}
              </TabsContent>
              
              <TabsContent value="feeding" className="space-y-4">
                {/* Feeding Configuration */}
              </TabsContent>
              
              <TabsContent value="budget" className="space-y-4">
                {/* Budget Configuration */}
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Phase 4: Hooks ⚡

**File:** `src/features/sppg/program/hooks/useEnrollments.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentApi } from '../api'
import { toast } from 'sonner'

export function useProgramEnrollments(programId: string) {
  return useQuery({
    queryKey: ['program-enrollments', programId],
    queryFn: () => enrollmentApi.getAll(programId),
    select: (data) => data.data,
  })
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ programId, data }: any) => 
      enrollmentApi.create(programId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['program-enrollments', variables.programId] 
      })
      toast.success('Enrollment berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat enrollment')
    }
  })
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ programId, enrollmentId, data }: any) => 
      enrollmentApi.update(programId, enrollmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['program-enrollments', variables.programId] 
      })
      toast.success('Enrollment berhasil diupdate')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal update enrollment')
    }
  })
}

export function useDeleteEnrollment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ programId, enrollmentId }: any) => 
      enrollmentApi.delete(programId, enrollmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['program-enrollments', variables.programId] 
      })
      toast.success('Enrollment berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus enrollment')
    }
  })
}
```

---

### Phase 5: Update Program Detail Page ⚡

**File:** `src/app/(sppg)/program/[id]/page.tsx`

```typescript
// Add new tab to existing tabs
<Tabs defaultValue="overview" className="w-full">
  <TabsList className="grid w-full grid-cols-6"> {/* Changed from 5 to 6 */}
    <TabsTrigger value="overview">Ringkasan</TabsTrigger>
    <TabsTrigger value="enrollments">
      Sekolah ({enrollmentCount})
    </TabsTrigger> {/* NEW! */}
    <TabsTrigger value="schedule">Jadwal</TabsTrigger>
    <TabsTrigger value="budget">Anggaran</TabsTrigger>
    <TabsTrigger value="nutrition">Nutrisi</TabsTrigger>
    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    <ProgramOverviewTab program={program} />
  </TabsContent>

  <TabsContent value="enrollments">
    <ProgramEnrollmentsTab programId={id} program={program} /> {/* NEW! */}
  </TabsContent>

  {/* Other tabs... */}
</Tabs>
```

---

## 🔄 Migration Strategy: partnerSchools

### Option A: Keep as Derived Field (Recommended)

```typescript
// Keep partnerSchools in schema but auto-populate
// When saving program, calculate from enrollments

// In API when creating/updating program:
const enrollments = await db.programSchoolEnrollment.findMany({
  where: { programId },
  include: { school: true }
})

const partnerSchools = enrollments.map(e => e.school.schoolName)

await db.nutritionProgram.update({
  where: { id: programId },
  data: {
    partnerSchools, // Auto-calculated
  }
})
```

### Option B: Full Deprecation

```typescript
// Remove partnerSchools from forms completely
// Calculate on-demand when needed for display

// In ProgramCard or ProgramList:
const partnerSchools = program.programEnrollments
  .map(e => e.school.schoolName)
  .join(', ')
```

---

## ✅ Implementation Checklist

### Backend
- [ ] Create API route: GET /api/sppg/program/[id]/enrollments
- [ ] Create API route: POST /api/sppg/program/[id]/enrollments
- [ ] Create API route: PUT /api/sppg/program/[id]/enrollments/[enrollmentId]
- [ ] Create API route: DELETE /api/sppg/program/[id]/enrollments/[enrollmentId]
- [ ] Create enrollmentSchema.ts with full validation
- [ ] Create enrollment.types.ts

### Frontend
- [ ] Create ProgramEnrollmentsTab component
- [ ] Create EnrollmentCard component
- [ ] Create EnrollmentDialog component (with 4 tabs: Basic, Students, Feeding, Budget)
- [ ] Create enrollment API client
- [ ] Create enrollment hooks (useEnrollments, useCreateEnrollment, etc.)
- [ ] Update program detail page to add 6th tab
- [ ] Test enrollment CRUD operations

### Optional
- [ ] Deprecate partnerSchools from forms
- [ ] Add migration script for existing programs
- [ ] Add enrollment bulk import feature
- [ ] Add enrollment history/audit log

---

## 📝 Testing Scenarios

1. **Create Enrollment**
   - Select school from dropdown
   - Fill student data (target, active, by age, by gender)
   - Configure feeding schedule
   - Set delivery info
   - Set budget allocation
   - Save and verify data appears in tab

2. **Edit Enrollment**
   - Click edit on enrollment card
   - Modify student counts
   - Change feeding config
   - Update budget
   - Save and verify changes

3. **Delete Enrollment**
   - Click delete on enrollment card
   - Confirm deletion
   - Verify enrollment removed from list

4. **Validation**
   - Try to enroll same school twice (should fail)
   - Try invalid student counts (male + female ≠ active)
   - Try active > target (should fail)
   - Try invalid phone format

5. **Multi-tenant Security**
   - Verify user can only see/manage enrollments for their SPPG
   - Verify cannot enroll schools from other SPPG

---

## 🚀 Next Steps

1. **Review this document** with team
2. **Prioritize phases** (suggest: Phase 1-2-3-4-5 in order)
3. **Estimate time**: 
   - Phase 1 (API): 4 hours
   - Phase 2 (Schema/Types): 2 hours
   - Phase 3 (Components): 8 hours
   - Phase 4 (Hooks): 2 hours
   - Phase 5 (Integration): 2 hours
   - **Total**: ~18 hours (2-3 days)

4. **Start implementation** or adjust plan based on feedback

---

## 📞 Questions & Considerations

1. **Should enrollment have approval workflow?**
   - DRAFT → PENDING → APPROVED → ACTIVE
   - Or direct ACTIVE?

2. **Should we show historical enrollments?**
   - Completed enrollments from past programs
   - Archive functionality

3. **Bulk enrollment import?**
   - Excel/CSV import for multiple schools at once
   - Template generation

4. **Enrollment transfer between programs?**
   - Move school from Program A to Program B
   - Copy enrollment settings

---

**End of Document**
