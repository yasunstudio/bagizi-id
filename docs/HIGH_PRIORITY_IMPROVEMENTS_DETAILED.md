# 🎯 HIGH PRIORITY Improvements - Detail Implementation Plan

**Tanggal:** November 7, 2025
**Status:** Ready to Implement
**Impact:** CRITICAL for MBG Program Quality

---

## 📋 Priority 1: Menu Target Group Compatibility (70/100)

### 🔴 **Problem Statement:**

**Current Situation:**
```prisma
model NutritionMenu {
  id          String
  menuName    String
  mealType    MealType
  // ❌ TIDAK ADA field untuk specify target group yang compatible
  
  // Menu bisa di-assign ke program apapun tanpa validation
  // Contoh MASALAH:
  // - Menu "Susu Ibu Hamil" bisa di-assign ke SCHOOL_CHILDREN ❌
  // - Menu "Nasi Goreng Anak" bisa di-assign ke ELDERLY ❌
}
```

**Dampak Real di Lapangan:**
- ❌ Menu tidak sesuai kebutuhan nutrisi target group
- ❌ User bisa salah assign menu
- ❌ Kualitas program menurun
- ❌ Tidak ada validation di application level

**Example Scenario (WRONG):**
```
Program: "MBG Ibu Hamil Purwakarta 2025"
Target Group: PREGNANT_WOMAN
Menu Assigned: "Nasi Goreng Anak SD" ❌ SALAH!

↓
Menu anak sekolah tidak memenuhi:
- ❌ Asam folat untuk ibu hamil
- ❌ Zat besi untuk ibu hamil
- ❌ Kalsium untuk ibu hamil
```

---

### ✅ **Solution: Add compatibleTargetGroups Field**

#### 1️⃣ **Schema Changes (Prisma)**

```prisma
model NutritionMenu {
  id                    String      @id @default(cuid())
  sppgId                String
  programId             String?
  
  menuName              String      @db.VarChar(255)
  menuCode              String      @unique @db.VarChar(50)
  mealType              MealType
  servingSize           Float
  
  // ✅ NEW FIELD - CRITICAL!
  compatibleTargetGroups TargetGroup[] @default([])
  // Jika kosong = compatible dengan semua target groups (backward compatible)
  // Jika diisi = hanya compatible dengan target groups yang disebutkan
  
  // Existing fields...
  calories              Float?
  protein               Float?
  carbohydrates         Float?
  fat                   Float?
  fiber                 Float?
  
  // Special nutrients tracking
  folicAcid             Float?      // mcg - untuk PREGNANT_WOMAN
  iron                  Float?      // mg - untuk PREGNANT_WOMAN, TEENAGE_GIRL
  calcium               Float?      // mg - untuk PREGNANT_WOMAN, ELDERLY
  vitaminA              Float?      // mcg - untuk BREASTFEEDING_MOTHER, TODDLER
  vitaminC              Float?      // mg - untuk semua
  vitaminD              Float?      // mcg - untuk ELDERLY, TODDLER
  
  costPerServing        Float
  preparationTime       Int?
  cookingMethod         String?     @db.VarChar(100)
  
  status                MenuStatus  @default(DRAFT)
  isActive              Boolean     @default(true)
  
  sppg                  SPPG        @relation(...)
  program               NutritionProgram? @relation(...)
  ingredients           MenuIngredient[]
  allergens             MenuAllergen[]
  menuPlans             MenuPlanItem[]
  productions           FoodProduction[]
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@index([sppgId])
  @@index([programId])
  @@index([status])
  @@index([mealType])
}
```

#### 2️⃣ **Migration Script**

```bash
# Generate migration
npx prisma migrate dev --name add_menu_target_group_compatibility

# Migration akan create:
# - Add field compatibleTargetGroups (array)
# - Add nutrients fields (folicAcid, iron, calcium, vitaminA, vitaminD)
# - Update indexes jika diperlukan
```

#### 3️⃣ **Seed Data Update**

```typescript
// prisma/seeds/menu-seed.ts

// ✅ EXAMPLE: Menu untuk Ibu Hamil
await prisma.nutritionMenu.create({
  data: {
    menuName: 'Paket Gizi Ibu Hamil - Trimester 1',
    menuCode: 'MENU-IBU-HAMIL-T1-001',
    mealType: 'SNACK',
    servingSize: 250,
    
    // ✅ SPECIFY: Hanya untuk ibu hamil!
    compatibleTargetGroups: ['PREGNANT_WOMAN'],
    
    // Nutrition values
    calories: 400,
    protein: 20,
    carbohydrates: 45,
    fat: 15,
    fiber: 8,
    
    // ✅ Special nutrients untuk ibu hamil
    folicAcid: 600,     // mcg (target: 600 mcg/day)
    iron: 27,           // mg (target: 27 mg/day)
    calcium: 1000,      // mg (target: 1000 mg/day)
    vitaminC: 85,       // mg (immune support)
    
    costPerServing: 12500,
    status: 'ACTIVE',
    sppgId: sppg.id,
  }
})

// ✅ EXAMPLE: Menu untuk Anak Sekolah
await prisma.nutritionMenu.create({
  data: {
    menuName: 'Nasi Gudeg Ayam untuk Anak SD',
    menuCode: 'MENU-ANAK-SD-001',
    mealType: 'LUNCH',
    servingSize: 300,
    
    // ✅ SPECIFY: Untuk anak sekolah saja
    compatibleTargetGroups: ['SCHOOL_CHILDREN'],
    
    calories: 550,
    protein: 25,
    carbohydrates: 75,
    fat: 18,
    fiber: 6,
    
    // Nutrisi umum (tidak perlu folicAcid khusus ibu hamil)
    iron: 8,            // mg (anak butuh lebih sedikit)
    calcium: 800,       // mg
    vitaminA: 500,      // mcg
    vitaminC: 45,       // mg
    
    costPerServing: 8500,
    status: 'ACTIVE',
    sppgId: sppg.id,
  }
})

// ✅ EXAMPLE: Menu universal (compatible dengan semua target)
await prisma.nutritionMenu.create({
  data: {
    menuName: 'Salad Buah Segar',
    menuCode: 'MENU-UNIVERSAL-001',
    mealType: 'SNACK',
    servingSize: 150,
    
    // ✅ EMPTY ARRAY = Compatible dengan SEMUA target groups
    compatibleTargetGroups: [],
    
    calories: 180,
    protein: 3,
    carbohydrates: 35,
    fat: 4,
    fiber: 5,
    vitaminA: 300,
    vitaminC: 60,
    
    costPerServing: 5000,
    status: 'ACTIVE',
    sppgId: sppg.id,
  }
})
```

#### 4️⃣ **Validation Logic**

```typescript
// src/features/sppg/menu/schemas/menuSchema.ts

import { z } from 'zod'
import { TargetGroup, MealType, MenuStatus } from '@prisma/client'

export const menuSchema = z.object({
  menuName: z.string().min(3, 'Nama menu minimal 3 karakter'),
  menuCode: z.string().min(2, 'Kode menu minimal 2 karakter'),
  mealType: z.nativeEnum(MealType),
  servingSize: z.number().min(1).max(2000),
  
  // ✅ NEW: Target group compatibility
  compatibleTargetGroups: z.array(z.nativeEnum(TargetGroup)).default([]),
  
  // Nutrition values
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbohydrates: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  
  // ✅ Special nutrients
  folicAcid: z.number().min(0).optional(),
  iron: z.number().min(0).optional(),
  calcium: z.number().min(0).optional(),
  vitaminA: z.number().min(0).optional(),
  vitaminC: z.number().min(0).optional(),
  vitaminD: z.number().min(0).optional(),
  
  costPerServing: z.number().min(0),
  preparationTime: z.number().min(0).optional(),
  status: z.nativeEnum(MenuStatus).default('DRAFT'),
})
.refine((data) => {
  // ✅ VALIDATION: Jika target PREGNANT_WOMAN, harus ada folicAcid & iron
  if (data.compatibleTargetGroups.includes('PREGNANT_WOMAN')) {
    return data.folicAcid && data.iron && data.calcium
  }
  return true
}, {
  message: 'Menu untuk ibu hamil harus memiliki asam folat, zat besi, dan kalsium',
  path: ['compatibleTargetGroups']
})
.refine((data) => {
  // ✅ VALIDATION: Jika target TEENAGE_GIRL, harus ada iron
  if (data.compatibleTargetGroups.includes('TEENAGE_GIRL')) {
    return data.iron && data.iron >= 15 // mg
  }
  return true
}, {
  message: 'Menu untuk remaja putri harus memiliki zat besi minimal 15 mg',
  path: ['iron']
})
.refine((data) => {
  // ✅ VALIDATION: Jika target ELDERLY, harus ada calcium & vitaminD
  if (data.compatibleTargetGroups.includes('ELDERLY')) {
    return data.calcium && data.vitaminD
  }
  return true
}, {
  message: 'Menu untuk lansia harus memiliki kalsium dan vitamin D',
  path: ['compatibleTargetGroups']
})
```

#### 5️⃣ **API Endpoint Validation**

```typescript
// src/app/api/sppg/menu-plan/assign/route.ts

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { menuId, programId, enrollmentId } = body
    
    // 1. Get enrollment with target group
    const enrollment = await db.programBeneficiaryEnrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        targetGroup: true,
        program: {
          select: {
            id: true,
            allowedTargetGroups: true,
          }
        }
      }
    })
    
    if (!enrollment) {
      return Response.json({ error: 'Enrollment not found' }, { status: 404 })
    }
    
    // 2. Get menu with compatibility info
    const menu = await db.nutritionMenu.findUnique({
      where: { id: menuId },
      select: {
        id: true,
        menuName: true,
        compatibleTargetGroups: true,
      }
    })
    
    if (!menu) {
      return Response.json({ error: 'Menu not found' }, { status: 404 })
    }
    
    // ✅ 3. VALIDATE: Menu compatibility dengan target group
    const enrollmentTargetGroup = enrollment.targetGroup
    const menuCompatibleGroups = menu.compatibleTargetGroups
    
    // If menu has specific compatible groups (not empty)
    if (menuCompatibleGroups.length > 0) {
      // Check if enrollment's target group is in the compatible list
      if (!menuCompatibleGroups.includes(enrollmentTargetGroup)) {
        return Response.json({ 
          error: `Menu "${menu.menuName}" tidak compatible dengan target group ${enrollmentTargetGroup}`,
          details: {
            menuCompatibleWith: menuCompatibleGroups,
            enrollmentTargetGroup: enrollmentTargetGroup,
          }
        }, { status: 400 })
      }
    }
    // If menu compatible groups is empty = universal menu (compatible dengan semua)
    
    // ✅ 4. All validation passed - assign menu
    const menuPlan = await db.menuPlan.create({
      data: {
        programId,
        menuId,
        // ... other fields
      }
    })
    
    return Response.json({ 
      success: true, 
      data: menuPlan,
      message: `Menu berhasil di-assign ke ${enrollmentTargetGroup}`
    })
    
  } catch (error) {
    console.error('Assign menu error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

#### 6️⃣ **UI Component Update**

```tsx
// src/features/sppg/menu/components/MenuForm.tsx

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { menuSchema } from '../schemas'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { TARGET_GROUP_CONFIG } from '@/features/sppg/program/lib/targetGroupConfig'

export function MenuForm() {
  const form = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      compatibleTargetGroups: [],
      // ... other defaults
    }
  })
  
  const selectedTargetGroups = form.watch('compatibleTargetGroups')
  const hasPregnantWoman = selectedTargetGroups.includes('PREGNANT_WOMAN')
  const hasTeenageGirl = selectedTargetGroups.includes('TEENAGE_GIRL')
  const hasElderly = selectedTargetGroups.includes('ELDERLY')
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Menu Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Info */}
            <FormField name="menuName" />
            <FormField name="mealType" />
            
            {/* ✅ NEW: Target Group Compatibility */}
            <div className="space-y-4">
              <FormLabel>
                Target Group Compatibility
                <p className="text-sm text-muted-foreground font-normal mt-1">
                  Pilih target group yang compatible dengan menu ini. 
                  Kosongkan jika menu universal (untuk semua target).
                </p>
              </FormLabel>
              
              <FormField
                control={form.control}
                name="compatibleTargetGroups"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(TARGET_GROUP_CONFIG).map(([key, config]) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name="compatibleTargetGroups"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(key as TargetGroup)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, key])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== key)
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">
                                  {config.label}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Show selected badges */}
              {selectedTargetGroups.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTargetGroups.map(group => (
                    <Badge key={group} variant="secondary">
                      {TARGET_GROUP_CONFIG[group].label}
                    </Badge>
                  ))}
                </div>
              )}
              
              {selectedTargetGroups.length === 0 && (
                <Badge variant="outline">Universal Menu (Semua Target Group)</Badge>
              )}
            </div>
            
            {/* Nutrition Values */}
            <FormField name="calories" />
            <FormField name="protein" />
            
            {/* ✅ Conditional: Special Nutrients untuk Ibu Hamil */}
            {hasPregnantWoman && (
              <div className="space-y-4 p-4 border rounded-lg bg-pink-50 dark:bg-pink-950/20">
                <p className="text-sm font-medium text-pink-800 dark:text-pink-200">
                  ⚠️ Menu untuk Ibu Hamil - Nutrisi Khusus Wajib Diisi
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <FormField 
                    name="folicAcid"
                    label="Asam Folat (mcg)"
                    description="Target: 600 mcg/hari"
                  />
                  <FormField 
                    name="iron"
                    label="Zat Besi (mg)"
                    description="Target: 27 mg/hari"
                  />
                  <FormField 
                    name="calcium"
                    label="Kalsium (mg)"
                    description="Target: 1000 mg/hari"
                  />
                </div>
              </div>
            )}
            
            {/* ✅ Conditional: Special Nutrients untuk Remaja Putri */}
            {hasTeenageGirl && (
              <div className="space-y-4 p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  ⚠️ Menu untuk Remaja Putri - Zat Besi Wajib Minimal 15 mg
                </p>
                <FormField 
                  name="iron"
                  label="Zat Besi (mg)"
                  description="Target minimal: 15 mg/hari (pencegahan anemia)"
                />
              </div>
            )}
            
            {/* ✅ Conditional: Special Nutrients untuk Lansia */}
            {hasElderly && (
              <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  ⚠️ Menu untuk Lansia - Kalsium & Vitamin D Wajib Diisi
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField 
                    name="calcium"
                    label="Kalsium (mg)"
                    description="Target: 1200 mg/hari"
                  />
                  <FormField 
                    name="vitaminD"
                    label="Vitamin D (mcg)"
                    description="Target: 15 mcg/hari"
                  />
                </div>
              </div>
            )}
            
            <FormField name="costPerServing" />
            
            {/* Submit */}
            <Button type="submit">Simpan Menu</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

#### 7️⃣ **Testing Scenarios**

```typescript
// tests/menu-target-compatibility.test.ts

describe('Menu Target Group Compatibility', () => {
  
  test('✅ Should allow assigning compatible menu to enrollment', async () => {
    // Menu: PREGNANT_WOMAN only
    const menu = await createMenu({
      menuName: 'Paket Ibu Hamil',
      compatibleTargetGroups: ['PREGNANT_WOMAN'],
      folicAcid: 600,
      iron: 27,
      calcium: 1000,
    })
    
    // Enrollment: PREGNANT_WOMAN
    const enrollment = await createEnrollment({
      targetGroup: 'PREGNANT_WOMAN'
    })
    
    // Should succeed
    const result = await assignMenuToEnrollment(menu.id, enrollment.id)
    expect(result.success).toBe(true)
  })
  
  test('❌ Should prevent assigning incompatible menu to enrollment', async () => {
    // Menu: PREGNANT_WOMAN only
    const menu = await createMenu({
      menuName: 'Paket Ibu Hamil',
      compatibleTargetGroups: ['PREGNANT_WOMAN'],
    })
    
    // Enrollment: SCHOOL_CHILDREN (incompatible!)
    const enrollment = await createEnrollment({
      targetGroup: 'SCHOOL_CHILDREN'
    })
    
    // Should fail
    const result = await assignMenuToEnrollment(menu.id, enrollment.id)
    expect(result.success).toBe(false)
    expect(result.error).toContain('tidak compatible')
  })
  
  test('✅ Should allow universal menu (empty array) to any target', async () => {
    // Menu: Universal (empty compatibleTargetGroups)
    const menu = await createMenu({
      menuName: 'Salad Buah',
      compatibleTargetGroups: [],
    })
    
    // Test dengan berbagai target groups
    const targets = ['PREGNANT_WOMAN', 'SCHOOL_CHILDREN', 'ELDERLY']
    
    for (const target of targets) {
      const enrollment = await createEnrollment({ targetGroup: target })
      const result = await assignMenuToEnrollment(menu.id, enrollment.id)
      expect(result.success).toBe(true)
    }
  })
  
  test('❌ Should reject PREGNANT_WOMAN menu without required nutrients', async () => {
    // Attempt to create menu for pregnant women without folicAcid
    const result = await createMenu({
      menuName: 'Paket Ibu Hamil',
      compatibleTargetGroups: ['PREGNANT_WOMAN'],
      // Missing: folicAcid, iron, calcium
    })
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('asam folat')
  })
})
```

---

## 📊 Priority 2: Nutrition Standards per Target Group (50/100)

### 🔴 **Problem Statement:**

**Current Situation:**
```prisma
model NutritionProgram {
  calorieTarget Float?  // ✅ Generic untuk semua target
  proteinTarget Float?  // ✅ Generic untuk semua target
  
  // ❌ TIDAK ADA: Target-specific nutrition standards
  // ❌ Tidak bisa track: Asam folat untuk ibu hamil berbeda dengan remaja putri
  // ❌ Tidak bisa track: Zat besi ibu hamil (27mg) vs remaja putri (15mg)
}
```

**Dampak Real:**
- ❌ Tidak bisa set nutrition target yang berbeda per target group
- ❌ Reporting tidak akurat (mix semua target jadi satu)
- ❌ Tidak bisa monitor compliance per target group
- ❌ Quality assurance rendah

**Example Scenario (WRONG):**
```
Program: "MBG Multi-Target Purwakarta 2025"
├── Target: IBU_HAMIL (need: Asam folat 600 mcg, Zat besi 27 mg)
├── Target: REMAJA_PUTRI (need: Zat besi 15 mg, Asam folat 400 mcg)
└── Target: ANAK_SEKOLAH (need: Protein 25g, Kalori 550 kal)

Current System:
- ❌ Hanya bisa set 1 target kalori untuk SEMUA target groups
- ❌ Tidak bisa distinguish nutrient requirements per target
```

---

### ✅ **Solution: Create NutritionTargetByGroup Model**

#### 1️⃣ **New Prisma Model**

```prisma
// Add to schema.prisma

model NutritionTargetByGroup {
  id                String      @id @default(cuid())
  programId         String
  targetGroup       TargetGroup
  
  // Macro Nutrients (Min-Max Range)
  caloriesMin       Float       // kcal
  caloriesMax       Float       // kcal
  proteinMin        Float       // gram
  proteinMax        Float       // gram
  carbohydratesMin  Float?      // gram
  carbohydratesMax  Float?      // gram
  fatMin            Float?      // gram
  fatMax            Float?      // gram
  fiberMin          Float?      // gram
  fiberMax          Float?      // gram
  
  // Micro Nutrients - Target-Specific (Optional)
  folicAcidMin      Float?      // mcg - Critical for PREGNANT_WOMAN
  folicAcidMax      Float?      // mcg
  
  ironMin           Float?      // mg - Critical for PREGNANT_WOMAN, TEENAGE_GIRL
  ironMax           Float?      // mg
  
  calciumMin        Float?      // mg - Critical for PREGNANT_WOMAN, ELDERLY
  calciumMax        Float?      // mg
  
  vitaminAMin       Float?      // mcg - Important for BREASTFEEDING_MOTHER, TODDLER
  vitaminAMax       Float?      // mcg
  
  vitaminCMin       Float?      // mg - General immune support
  vitaminCMax       Float?      // mg
  
  vitaminDMin       Float?      // mcg - Critical for ELDERLY, TODDLER
  vitaminDMax       Float?      // mcg
  
  vitaminB12Min     Float?      // mcg - For ELDERLY
  vitaminB12Max     Float?      // mcg
  
  omega3Min         Float?      // mg - For brain development (TODDLER, SCHOOL_CHILDREN)
  omega3Max         Float?      // mg
  
  // Compliance Tracking
  isActive          Boolean     @default(true)
  complianceRate    Float?      // Percentage (calculated)
  lastEvaluated     DateTime?
  
  // Notes & Guidelines
  nutritionGuidelines String?   @db.Text
  specialConsiderations String? @db.Text
  
  // Relations
  program           NutritionProgram @relation(fields: [programId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@unique([programId, targetGroup])
  @@index([programId])
  @@index([targetGroup])
  @@map("nutrition_target_by_group")
}
```

#### 2️⃣ **Seed Data with Real Standards**

```typescript
// prisma/seeds/nutrition-standards-seed.ts

/**
 * Nutrition standards based on:
 * - Angka Kecukupan Gizi (AKG) Indonesia 2019
 * - Permenkes RI tentang Standar Gizi Bumil/Busui
 * - WHO Nutrition Guidelines
 */

export async function seedNutritionStandards(prisma: PrismaClient) {
  
  // Program: MBG Multi-Target Purwakarta 2025
  const program = await prisma.nutritionProgram.findFirst({
    where: { programCode: 'MBG-PWK-2025-001' }
  })
  
  if (!program) return
  
  // ✅ PREGNANT_WOMAN Standards
  await prisma.nutritionTargetByGroup.create({
    data: {
      programId: program.id,
      targetGroup: 'PREGNANT_WOMAN',
      
      // Macro nutrients
      caloriesMin: 2280,      // AKG ibu hamil trimester 2-3
      caloriesMax: 2500,
      proteinMin: 60,         // gram/hari
      proteinMax: 75,
      carbohydratesMin: 300,
      carbohydratesMax: 350,
      fatMin: 60,
      fatMax: 80,
      fiberMin: 30,
      fiberMax: 40,
      
      // CRITICAL: Micro nutrients untuk ibu hamil
      folicAcidMin: 600,      // mcg/hari - Prevent neural tube defects
      folicAcidMax: 800,
      ironMin: 27,            // mg/hari - Prevent anemia
      ironMax: 35,
      calciumMin: 1000,       // mg/hari - Bone health
      calciumMax: 1300,
      vitaminAMin: 800,       // mcg/hari
      vitaminAMax: 1000,
      vitaminCMin: 85,        // mg/hari - Iron absorption
      vitaminCMax: 100,
      vitaminDMin: 15,        // mcg/hari
      vitaminDMax: 20,
      
      nutritionGuidelines: `
        Kebutuhan nutrisi ibu hamil fokus pada:
        1. Asam folat (600 mcg) - Mencegah cacat tabung saraf
        2. Zat besi (27 mg) - Mencegah anemia pada ibu dan bayi
        3. Kalsium (1000 mg) - Kesehatan tulang ibu dan janin
        4. Protein (60-75g) - Pertumbuhan janin
        5. Vitamin C - Membantu penyerapan zat besi
      `,
      specialConsiderations: `
        - Hindari makanan mentah (sushi, telur setengah matang)
        - Batasi kafein (<200mg/hari)
        - Konsumsi 8-10 gelas air per hari
        - Makan porsi kecil tapi sering (6x sehari)
      `
    }
  })
  
  // ✅ BREASTFEEDING_MOTHER Standards
  await prisma.nutritionTargetByGroup.create({
    data: {
      programId: program.id,
      targetGroup: 'BREASTFEEDING_MOTHER',
      
      caloriesMin: 2400,      // Higher than pregnant (for milk production)
      caloriesMax: 2700,
      proteinMin: 65,
      proteinMax: 80,
      carbohydratesMin: 320,
      carbohydratesMax: 380,
      fatMin: 70,
      fatMax: 90,
      fiberMin: 32,
      fiberMax: 40,
      
      // CRITICAL: Nutrients for breastfeeding
      vitaminAMin: 1300,      // mcg/hari - Higher for milk production
      vitaminAMax: 1500,
      calciumMin: 1000,
      calciumMax: 1300,
      ironMin: 10,            // Lower than pregnant (no menstruation)
      ironMax: 15,
      folicAcidMin: 500,
      folicAcidMax: 600,
      vitaminCMin: 120,       // Higher for immune support
      vitaminCMax: 150,
      vitaminB12Min: 2.8,     // mcg/hari - For nervous system
      vitaminB12Max: 3.5,
      
      nutritionGuidelines: `
        Kebutuhan nutrisi ibu menyusui fokus pada:
        1. Kalori tinggi (2400-2700 kcal) - Produksi ASI
        2. Protein (65-80g) - Kualitas ASI
        3. Vitamin A (1300 mcg) - Vitamin larut lemak dalam ASI
        4. Cairan (3-4 liter/hari) - Produksi ASI optimal
        5. Kalsium (1000 mg) - Recovery tulang pasca melahirkan
      `,
      specialConsiderations: `
        - Minum minimal 3 liter air per hari
        - Hindari alkohol dan rokok
        - Batasi kafein (bisa masuk ke ASI)
        - Makan makanan "ASI booster" (daun katuk, kacang almond)
      `
    }
  })
  
  // ✅ SCHOOL_CHILDREN Standards (6-12 years)
  await prisma.nutritionTargetByGroup.create({
    data: {
      programId: program.id,
      targetGroup: 'SCHOOL_CHILDREN',
      
      caloriesMin: 1600,      // For active school children
      caloriesMax: 2000,
      proteinMin: 45,
      proteinMax: 60,
      carbohydratesMin: 220,
      carbohydratesMax: 280,
      fatMin: 50,
      fatMax: 70,
      fiberMin: 20,
      fiberMax: 28,
      
      calciumMin: 1000,       // Growth period
      calciumMax: 1300,
      ironMin: 8,
      ironMax: 12,
      vitaminAMin: 500,
      vitaminAMax: 700,
      vitaminCMin: 45,
      vitaminCMax: 60,
      vitaminDMin: 15,
      vitaminDMax: 20,
      omega3Min: 100,         // Brain development
      omega3Max: 200,
      
      nutritionGuidelines: `
        Kebutuhan nutrisi anak sekolah fokus pada:
        1. Energi (1600-2000 kcal) - Aktivitas fisik & belajar
        2. Protein (45-60g) - Pertumbuhan otot
        3. Kalsium (1000 mg) - Pertumbuhan tulang
        4. Omega-3 - Perkembangan otak & konsentrasi belajar
        5. Vitamin D - Penyerapan kalsium
      `,
      specialConsiderations: `
        - Sarapan wajib sebelum sekolah
        - Snack sehat 2x sehari (pagi & sore)
        - Batasi gula tambahan (<25g/hari)
        - Aktivitas fisik minimal 60 menit/hari
      `
    }
  })
  
  // ✅ TODDLER Standards (0-5 years)
  await prisma.nutritionTargetByGroup.create({
    data: {
      programId: program.id,
      targetGroup: 'TODDLER',
      
      caloriesMin: 1000,      // Age 1-3 years
      caloriesMax: 1400,
      proteinMin: 20,
      proteinMax: 30,
      carbohydratesMin: 130,
      carbohydratesMax: 180,
      fatMin: 30,
      fatMax: 40,
      fiberMin: 14,
      fiberMax: 20,
      
      // CRITICAL: Anti-stunting nutrients
      proteinMin: 20,
      proteinMax: 30,
      calciumMin: 700,        // Bone growth
      calciumMax: 1000,
      ironMin: 7,             // Prevent anemia
      ironMax: 10,
      vitaminAMin: 400,       // Immune system
      vitaminAMax: 600,
      vitaminDMin: 15,        // Bone development
      vitaminDMax: 20,
      omega3Min: 70,          // Brain development
      omega3Max: 150,
      
      nutritionGuidelines: `
        Kebutuhan nutrisi balita fokus pada ANTI-STUNTING:
        1. Protein hewani (20-30g) - Pertumbuhan optimal
        2. Kalsium (700 mg) - Tinggi badan optimal
        3. Zat besi (7 mg) - Mencegah anemia
        4. Vitamin A - Sistem imun & penglihatan
        5. Omega-3 - Perkembangan otak
      `,
      specialConsiderations: `
        - ASI eksklusif 0-6 bulan
        - MPASI mulai 6 bulan
        - Makan 3x utama + 2x snack
        - Hindari gula & garam berlebih
        - Pantau berat & tinggi badan rutin
      `
    }
  })
  
  // ✅ TEENAGE_GIRL Standards (13-18 years)
  await prisma.nutritionTargetByGroup.create({
    data: {
      programId: program.id,
      targetGroup: 'TEENAGE_GIRL',
      
      caloriesMin: 2000,
      caloriesMax: 2400,
      proteinMin: 55,
      proteinMax: 70,
      carbohydratesMin: 280,
      carbohydratesMax: 330,
      fatMin: 60,
      fatMax: 80,
      fiberMin: 26,
      fiberMax: 32,
      
      // CRITICAL: Iron for menstruation
      ironMin: 15,            // Prevent anemia from menstruation
      ironMax: 20,
      folicAcidMin: 400,      // Reproductive health
      folicAcidMax: 600,
      calciumMin: 1200,       // Peak bone mass
      calciumMax: 1300,
      vitaminAMin: 700,
      vitaminAMax: 900,
      vitaminCMin: 65,
      vitaminCMax: 80,
      
      nutritionGuidelines: `
        Kebutuhan nutrisi remaja putri fokus pada:
        1. ZAT BESI (15 mg) - Mencegah anemia akibat menstruasi
        2. Asam folat (400 mcg) - Persiapan reproduksi
        3. Kalsium (1200 mg) - Puncak massa tulang
        4. Protein (55-70g) - Pertumbuhan masa puber
        5. Vitamin C - Penyerapan zat besi
      `,
      specialConsiderations: `
        - Tablet Tambah Darah (TTD) 1x seminggu
        - Konsumsi vitamin C bersama makanan kaya zat besi
        - Hindari teh/kopi saat makan (menghambat penyerapan Fe)
        - Aktivitas fisik teratur
        - Edukasi gizi seimbang & body image positif
      `
    }
  })
  
  // ✅ ELDERLY Standards (60+ years)
  await prisma.nutritionTargetByGroup.create({
    data: {
      programId: program.id,
      targetGroup: 'ELDERLY',
      
      caloriesMin: 1600,      // Lower metabolism
      caloriesMax: 2000,
      proteinMin: 55,         // Maintain muscle mass
      proteinMax: 70,
      carbohydratesMin: 200,
      carbohydratesMax: 260,
      fatMin: 45,
      fatMax: 65,
      fiberMin: 25,           // Digestive health
      fiberMax: 35,
      
      // CRITICAL: Bone & muscle health
      calciumMin: 1200,       // Osteoporosis prevention
      calciumMax: 1500,
      vitaminDMin: 20,        // Higher for calcium absorption
      vitaminDMax: 25,
      proteinMin: 55,         // Prevent sarcopenia
      proteinMax: 70,
      vitaminB12Min: 2.4,     // Cognitive function
      vitaminB12Max: 3.0,
      omega3Min: 250,         // Heart health
      omega3Max: 500,
      
      nutritionGuidelines: `
        Kebutuhan nutrisi lansia fokus pada:
        1. Kalsium (1200 mg) + Vitamin D - Osteoporosis prevention
        2. Protein (55-70g) - Maintain muscle mass (sarcopenia)
        3. Vitamin B12 - Fungsi kognitif
        4. Omega-3 - Kesehatan jantung
        5. Serat (25-35g) - Kesehatan pencernaan
      `,
      specialConsiderations: `
        - Tekstur makanan lembut (mudah dikunyah)
        - Porsi kecil tapi sering (6x sehari)
        - Hindari garam berlebih (hipertensi)
        - Minum 1.5-2 liter air per hari
        - Aktivitas fisik ringan (jalan pagi)
        - Monitor obat-obatan (interaksi dengan makanan)
      `
    }
  })
  
  console.log('✅ Nutrition standards seeded for all target groups!')
}
```

#### 3️⃣ **API Endpoint for Compliance Tracking**

```typescript
// src/app/api/sppg/nutrition/compliance/route.ts

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET: Calculate nutrition compliance per target group
 * Compares actual menu nutrition vs target standards
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')
    
    if (!programId) {
      return Response.json({ error: 'programId required' }, { status: 400 })
    }
    
    // 1. Get nutrition standards for this program
    const standards = await db.nutritionTargetByGroup.findMany({
      where: { programId },
      include: {
        program: {
          select: {
            name: true,
            startDate: true,
            endDate: true,
          }
        }
      }
    })
    
    // 2. Get actual enrollments with target groups
    const enrollments = await db.programBeneficiaryEnrollment.findMany({
      where: {
        programId,
        enrollmentStatus: 'ACTIVE',
      },
      select: {
        id: true,
        targetGroup: true,
        activeBeneficiaries: true,
        beneficiaryOrg: {
          select: {
            organizationName: true,
          }
        }
      }
    })
    
    // 3. Get menu plans for this program
    const menuPlans = await db.menuPlan.findMany({
      where: { programId },
      include: {
        menu: {
          select: {
            menuName: true,
            calories: true,
            protein: true,
            carbohydrates: true,
            fat: true,
            fiber: true,
            folicAcid: true,
            iron: true,
            calcium: true,
            vitaminA: true,
            vitaminC: true,
            vitaminD: true,
          }
        }
      }
    })
    
    // 4. Calculate compliance per target group
    const complianceByTargetGroup = standards.map(standard => {
      // Filter enrollments for this target group
      const targetEnrollments = enrollments.filter(
        e => e.targetGroup === standard.targetGroup
      )
      
      // Filter menus for this target group (if menu has compatibleTargetGroups)
      const targetMenus = menuPlans.filter(mp => {
        const menu = mp.menu
        // If menu has no compatible groups specified, it's universal
        return mp.menu // Simplified, actual implementation checks compatibleTargetGroups
      })
      
      // Calculate average nutrition from menus
      const avgNutrition = {
        calories: calculateAverage(targetMenus, 'calories'),
        protein: calculateAverage(targetMenus, 'protein'),
        iron: calculateAverage(targetMenus, 'iron'),
        calcium: calculateAverage(targetMenus, 'calcium'),
        folicAcid: calculateAverage(targetMenus, 'folicAcid'),
        vitaminA: calculateAverage(targetMenus, 'vitaminA'),
        vitaminD: calculateAverage(targetMenus, 'vitaminD'),
      }
      
      // Calculate compliance percentage
      const compliance = {
        calories: calculateCompliance(
          avgNutrition.calories,
          standard.caloriesMin,
          standard.caloriesMax
        ),
        protein: calculateCompliance(
          avgNutrition.protein,
          standard.proteinMin,
          standard.proteinMax
        ),
        iron: standard.ironMin ? calculateCompliance(
          avgNutrition.iron || 0,
          standard.ironMin,
          standard.ironMax || standard.ironMin * 1.5
        ) : null,
        calcium: standard.calciumMin ? calculateCompliance(
          avgNutrition.calcium || 0,
          standard.calciumMin,
          standard.calciumMax || standard.calciumMin * 1.3
        ) : null,
        folicAcid: standard.folicAcidMin ? calculateCompliance(
          avgNutrition.folicAcid || 0,
          standard.folicAcidMin,
          standard.folicAcidMax || standard.folicAcidMin * 1.3
        ) : null,
      }
      
      // Overall compliance score (average of all nutrients)
      const overallCompliance = Object.values(compliance)
        .filter(v => v !== null)
        .reduce((sum, val) => sum + (val as number), 0) / 
        Object.values(compliance).filter(v => v !== null).length
      
      return {
        targetGroup: standard.targetGroup,
        targetGroupLabel: TARGET_GROUP_CONFIG[standard.targetGroup].label,
        totalBeneficiaries: targetEnrollments.reduce((sum, e) => sum + (e.activeBeneficiaries || 0), 0),
        organizationCount: targetEnrollments.length,
        standards: {
          calories: { min: standard.caloriesMin, max: standard.caloriesMax },
          protein: { min: standard.proteinMin, max: standard.proteinMax },
          iron: standard.ironMin ? { min: standard.ironMin, max: standard.ironMax } : null,
          calcium: standard.calciumMin ? { min: standard.calciumMin, max: standard.calciumMax } : null,
          folicAcid: standard.folicAcidMin ? { min: standard.folicAcidMin, max: standard.folicAcidMax } : null,
        },
        actual: avgNutrition,
        compliance,
        overallCompliance: Math.round(overallCompliance),
        status: overallCompliance >= 80 ? 'GOOD' : overallCompliance >= 60 ? 'ACCEPTABLE' : 'NEEDS_IMPROVEMENT',
      }
    })
    
    return Response.json({
      success: true,
      data: {
        program: standards[0]?.program,
        complianceByTargetGroup,
        summary: {
          totalTargetGroups: standards.length,
          averageCompliance: Math.round(
            complianceByTargetGroup.reduce((sum, c) => sum + c.overallCompliance, 0) / 
            complianceByTargetGroup.length
          ),
        }
      }
    })
    
  } catch (error) {
    console.error('Get compliance error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
function calculateAverage(menus: any[], field: string): number {
  const values = menus
    .map(m => m.menu[field])
    .filter(v => v !== null && v !== undefined)
  
  return values.length > 0
    ? values.reduce((sum, val) => sum + val, 0) / values.length
    : 0
}

function calculateCompliance(actual: number, min: number, max: number): number {
  if (actual < min) {
    return Math.round((actual / min) * 100)
  } else if (actual > max) {
    return Math.max(0, 100 - Math.round(((actual - max) / max) * 50))
  } else {
    return 100
  }
}
```

#### 4️⃣ **Dashboard Component**

```tsx
// src/features/sppg/dashboard/components/NutritionComplianceCard.tsx

'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useNutritionCompliance } from '../hooks/useNutritionCompliance'

export function NutritionComplianceCard({ programId }: { programId: string }) {
  const { data, isLoading } = useNutritionCompliance(programId)
  
  if (isLoading) return <CardSkeleton />
  if (!data) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Nutrisi per Target Group</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.complianceByTargetGroup.map(target => (
          <div key={target.targetGroup} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{target.targetGroupLabel}</h4>
                <p className="text-sm text-muted-foreground">
                  {target.totalBeneficiaries} penerima • {target.organizationCount} lokasi
                </p>
              </div>
              <Badge 
                variant={
                  target.status === 'GOOD' ? 'default' :
                  target.status === 'ACCEPTABLE' ? 'secondary' :
                  'destructive'
                }
              >
                {target.overallCompliance}% Compliance
              </Badge>
            </div>
            
            <div className="space-y-2">
              {/* Calories */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Kalori</span>
                  <span className="text-muted-foreground">
                    {Math.round(target.actual.calories)} / {target.standards.calories.min}-{target.standards.calories.max} kcal
                  </span>
                </div>
                <Progress value={target.compliance.calories} />
              </div>
              
              {/* Protein */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Protein</span>
                  <span className="text-muted-foreground">
                    {Math.round(target.actual.protein)} / {target.standards.protein.min}-{target.standards.protein.max} g
                  </span>
                </div>
                <Progress value={target.compliance.protein} />
              </div>
              
              {/* Folic Acid (for PREGNANT_WOMAN) */}
              {target.compliance.folicAcid !== null && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Asam Folat 🤰</span>
                    <span className="text-muted-foreground">
                      {Math.round(target.actual.folicAcid || 0)} / {target.standards.folicAcid!.min} mcg
                    </span>
                  </div>
                  <Progress value={target.compliance.folicAcid} />
                </div>
              )}
              
              {/* Iron */}
              {target.compliance.iron !== null && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Zat Besi</span>
                    <span className="text-muted-foreground">
                      {Math.round(target.actual.iron || 0)} / {target.standards.iron!.min} mg
                    </span>
                  </div>
                  <Progress value={target.compliance.iron} />
                </div>
              )}
              
              {/* Calcium */}
              {target.compliance.calcium !== null && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Kalsium</span>
                    <span className="text-muted-foreground">
                      {Math.round(target.actual.calcium || 0)} / {target.standards.calcium!.min} mg
                    </span>
                  </div>
                  <Progress value={target.compliance.calcium} />
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

---

## 📊 Implementation Timeline

| Priority | Task | Estimated Time | Complexity |
|----------|------|----------------|------------|
| **1** | Menu Target Compatibility | | |
| 1.1 | Update Prisma schema | 30 min | Low |
| 1.2 | Create migration | 15 min | Low |
| 1.3 | Update seed data | 1 hour | Medium |
| 1.4 | Add validation logic | 1 hour | Medium |
| 1.5 | Update UI components | 2 hours | Medium |
| 1.6 | API endpoint validation | 1 hour | Medium |
| 1.7 | Testing | 1 hour | Medium |
| **Subtotal Priority 1** | **~6.75 hours** | **Medium** |
| | | |
| **2** | Nutrition Standards per Target | | |
| 2.1 | Create new Prisma model | 30 min | Low |
| 2.2 | Create migration | 15 min | Low |
| 2.3 | Seed nutrition standards | 2 hours | High |
| 2.4 | API compliance endpoint | 2 hours | High |
| 2.5 | Dashboard components | 2 hours | Medium |
| 2.6 | Testing & validation | 1 hour | Medium |
| **Subtotal Priority 2** | **~7.75 hours** | **High** |
| | | |
| **TOTAL** | **~14.5 hours** | **~2 days** |

---

## ✅ Success Criteria

### Priority 1: Menu Target Compatibility
- ✅ Field `compatibleTargetGroups` ada di NutritionMenu model
- ✅ Menu bisa specify 1+ target groups atau kosong (universal)
- ✅ API validation prevent assign menu ke incompatible target
- ✅ UI form punya checkbox target group selection
- ✅ Conditional nutrients fields (folicAcid untuk ibu hamil, etc.)
- ✅ Seed data punya contoh menu untuk setiap target group
- ✅ Tests pass untuk compatibility scenarios

### Priority 2: Nutrition Standards
- ✅ Model NutritionTargetByGroup created dengan semua micro nutrients
- ✅ Seed data punya standards untuk 6 target groups
- ✅ API endpoint bisa calculate compliance per target
- ✅ Dashboard show compliance percentage per target group
- ✅ Color-coded status (GOOD/ACCEPTABLE/NEEDS_IMPROVEMENT)
- ✅ Reporting detailed per nutrient (calories, protein, iron, etc.)

---

## 🎯 Next Steps

1. **Confirm Priority** - User approval untuk implement?
2. **Start with Priority 1** - Menu compatibility (easier, foundational)
3. **Then Priority 2** - Nutrition standards (builds on #1)
4. **Testing** - Comprehensive testing both features
5. **Documentation** - Update user guides

**Ready to implement?** 🚀
