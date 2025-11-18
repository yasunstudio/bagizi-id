/**
 * User Seed File
 * 
 * Creates demo users for SPPG 2025 with various roles:
 * - Kepala SPPG (Head of SPPG)
 * - Ahli Gizi (Nutritionist)
 * - Admin SPPG
 * - Akuntan (Accountant)
 * - Staff Dapur (Kitchen Staff)
 * - Staff Distribusi (Distribution Staff)
 * - Staff QC (Quality Control)
 * - Viewer (Read-only)
 * 
 * All users use password: "Demo2025" (bcrypt hashed)
 * Email domain: demo.sppg.id
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { 
  PrismaClient, 
  User,
  SPPG,
  UserType,
  UserRole,
  UserDemoStatus
} from '@prisma/client'
import * as bcrypt from 'bcryptjs'

/**
 * Demo user data structure
 */
interface DemoUserData {
  email: string
  name: string
  firstName: string
  lastName: string
  userRole: UserRole
  phone: string
  position: string
}

/**
 * Demo users configuration
 * All passwords: "Demo2025" (will be hashed with bcrypt)
 * Email domain: demo.sppg.id (role-based for easy login)
 */
const DEMO_USERS: DemoUserData[] = [
  {
    email: 'kepala@demo.sppg.id',
    name: 'Dr. Siti Nurhaliza, S.Gz., M.Gizi',
    firstName: 'Siti',
    lastName: 'Nurhaliza',
    userRole: UserRole.SPPG_KEPALA,
    phone: '0264-8524126',
    position: 'Kepala SPPG'
  },
  {
    email: 'ahligizi@demo.sppg.id',
    name: 'Budi Santoso, S.Gz.',
    firstName: 'Budi',
    lastName: 'Santoso',
    userRole: UserRole.SPPG_AHLI_GIZI,
    phone: '0264-8524127',
    position: 'Ahli Gizi Senior'
  },
  {
    email: 'admin@demo.sppg.id',
    name: 'Dewi Lestari, S.Kom.',
    firstName: 'Dewi',
    lastName: 'Lestari',
    userRole: UserRole.SPPG_ADMIN,
    phone: '0264-8524128',
    position: 'Administrator SPPG'
  },
  {
    email: 'akuntan@demo.sppg.id',
    name: 'Andi Wijaya, S.E., M.Ak.',
    firstName: 'Andi',
    lastName: 'Wijaya',
    userRole: UserRole.SPPG_AKUNTAN,
    phone: '0264-8524129',
    position: 'Akuntan SPPG'
  },
  {
    email: 'produksi@demo.sppg.id',
    name: 'Rudi Hermawan',
    firstName: 'Rudi',
    lastName: 'Hermawan',
    userRole: UserRole.SPPG_PRODUKSI_MANAGER,
    phone: '0264-8524130',
    position: 'Manager Produksi'
  },
  {
    email: 'distribusi@demo.sppg.id',
    name: 'Yanti Sari',
    firstName: 'Yanti',
    lastName: 'Sari',
    userRole: UserRole.SPPG_DISTRIBUSI_MANAGER,
    phone: '0264-8524131',
    position: 'Manager Distribusi'
  },
  {
    email: 'dapur1@demo.sppg.id',
    name: 'Joko Prasetyo',
    firstName: 'Joko',
    lastName: 'Prasetyo',
    userRole: UserRole.SPPG_STAFF_DAPUR,
    phone: '0264-8524132',
    position: 'Staff Dapur - Kepala Koki'
  },
  {
    email: 'dapur2@demo.sppg.id',
    name: 'Sari Rahayu',
    firstName: 'Sari',
    lastName: 'Rahayu',
    userRole: UserRole.SPPG_STAFF_DAPUR,
    phone: '0264-8524133',
    position: 'Staff Dapur - Asisten Koki'
  },
  {
    email: 'driver@demo.sppg.id',
    name: 'Bambang Susilo',
    firstName: 'Bambang',
    lastName: 'Susilo',
    userRole: UserRole.SPPG_STAFF_DISTRIBUSI,
    phone: '0264-8524134',
    position: 'Staff Distribusi - Driver'
  },
  {
    email: 'qc@demo.sppg.id',
    name: 'Lina Marlina, S.TP.',
    firstName: 'Lina',
    lastName: 'Marlina',
    userRole: UserRole.SPPG_STAFF_QC,
    phone: '0264-8524135',
    position: 'Staff Quality Control'
  },
  {
    email: 'viewer@demo.sppg.id',
    name: 'Guest Viewer',
    firstName: 'Guest',
    lastName: 'Viewer',
    userRole: UserRole.SPPG_VIEWER,
    phone: '0264-8524136',
    position: 'Viewer (Read-Only)'
  }
]

/**
 * Seed User entities for Demo SPPG 2025
 * 
 * Creates demo users with various roles for testing and demonstration.
 * All users are linked to Demo SPPG 2025 and have the same password: "Demo2025"
 * 
 * @param prisma - Prisma Client instance
 * @param sppg - SPPG entity from sppg seed
 * @returns Promise<User[]> - Array of created User entities
 * 
 * @example
 * ```typescript
 * const sppg = await seedSPPG(prisma, villages)
 * const users = await seedUser(prisma, sppg)
 * console.log(users.length) // 11 users
 * ```
 */
export async function seedUser(
  prisma: PrismaClient,
  sppg: SPPG
): Promise<User[]> {
  console.log('  → Creating Demo Users for SPPG 2025...')

  // Hash password once for all users (more efficient)
  const hashedPassword = await bcrypt.hash('Demo2025', 12)

  // Create all users
  const users = await Promise.all(
    DEMO_USERS.map(async (userData) => {
      const user = await prisma.user.upsert({
        where: {
          email: userData.email
        },
        update: {},
        create: {
          // Basic Info
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,

          // User Type & Role
          userType: UserType.SPPG_USER,
          userRole: userData.userRole,
          sppgId: sppg.id,

          // Status & Verification
          isActive: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          emailVerified: new Date(),

          // Security Settings
          twoFactorEnabled: false,
          securityLevel: 1,
          riskScore: 0,
          failedLoginAttempts: 0,

          // Localization
          timezone: 'Asia/Jakarta',
          language: 'id',
          preferredCurrency: 'IDR',

          // Additional Info
          location: `Desa Jatiluhur, Purwakarta`,
          
          // Demo Settings
          demoStatus: UserDemoStatus.IN_PROGRESS,
          demoStartedAt: new Date('2025-01-01'),
          
          // Password Settings
          saltRounds: 12,
          lastPasswordChange: new Date('2025-01-01')
        }
      })

      console.log(`    ✓ ${user.name} (${userData.userRole})`)
      return user
    })
  )

  console.log(`  ✓ Created ${users.length} demo users for ${sppg.name}`)
  console.log(`    Default password for all users: "Demo2025"`)
  console.log(`    Email domain: demo.sppg.id`)
  console.log(`    Roles: Kepala SPPG, Ahli Gizi, Admin, Akuntan, Produksi, Distribusi, Dapur (2), QC, Viewer`)

  return users
}
