/**
 * @fileoverview UserDetail Component - Display detailed user profile
 * Shows user information with tabs for Overview, Security, Activity, and Permissions
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useRouter } from 'next/navigation'
import { useUser, useDeleteUser, useUpdateStatus, useResetPassword } from '../hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Shield,
  Key,
  Activity,
  Edit,
  Trash2,
  Power,
  PowerOff,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface UserDetailProps {
  userId: string
}

export function UserDetail({ userId }: UserDetailProps) {
  const router = useRouter()
  const { data: user, isLoading, error } = useUser(userId)
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()
  const { mutate: updateStatus, isPending: isTogglingStatus } = useUpdateStatus()
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword()

  // Handle delete user
  const handleDelete = () => {
    deleteUser(userId, {
      onSuccess: () => {
        router.push('/users')
      },
    })
  }

  // Handle toggle status
  const handleToggleStatus = () => {
    if (!user) return

    updateStatus({
      id: userId,
      isActive: !user.isActive,
    })
  }

  // Handle reset password
  const handleResetPassword = () => {
    const newPassword = Math.random().toString(36).slice(-10) + 'A1!'
    
    resetPassword({
      id: userId,
      data: {
        newPassword,
        confirmPassword: newPassword,
      },
    })
  }

  // Loading state
  if (isLoading) {
    return <UserDetailSkeleton />
  }

  // Error state
  if (error || !user) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Gagal memuat data user. {error?.message || 'User tidak ditemukan.'}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/users')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar User
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/users')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/users/${userId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={isTogglingStatus}>
                {user.isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Nonaktifkan
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Aktifkan
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {user.isActive ? 'Nonaktifkan User' : 'Aktifkan User'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {user.isActive
                    ? 'User ini tidak akan bisa login setelah dinonaktifkan. Anda bisa mengaktifkan kembali kapan saja.'
                    : 'User ini akan bisa login kembali setelah diaktifkan.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleToggleStatus}>
                  {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={isResetting}>
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Password User</AlertDialogTitle>
                <AlertDialogDescription>
                  Password baru akan digenerate secara otomatis dan dikirim ke email user.
                  User harus mengganti password saat login pertama kali.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetPassword}>
                  Reset Password
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus User</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus user ini? User akan dinonaktifkan
                  dan tidak bisa login lagi. Data user akan tetap tersimpan untuk audit trail.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                  Hapus User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* User Status Badge */}
      <div className="flex items-center gap-2">
        {user.isActive ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Aktif
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Nonaktif
          </Badge>
        )}
        {user.userType === 'DEMO_REQUEST' && (
          <Badge variant="secondary">Demo Account</Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {user.firstName?.[0] || user.name[0]}
                      {user.lastName?.[0] || user.name[1] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.userRole || 'No Role'}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Telepon</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Lokasi</p>
                        <p className="font-medium">{user.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Informasi Pekerjaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {user.position && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Posisi</p>
                        <p className="font-medium">{user.position.positionName}</p>
                        <p className="text-xs text-muted-foreground">{user.position.positionCode}</p>
                      </div>
                    </div>
                  )}

                  {user.department && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Departemen</p>
                        <p className="font-medium">{user.department.departmentName}</p>
                        <p className="text-xs text-muted-foreground">{user.department.departmentCode}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Role</p>
                      <Badge variant="secondary">{getRoleLabel(user.userRole || '')}</Badge>
                    </div>
                  </div>

                  {user.sppg && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">SPPG</p>
                        <p className="font-medium">{user.sppg.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Preferensi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Timezone</span>
                  <Badge variant="outline">{user.timezone || 'WIB'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bahasa</span>
                  <Badge variant="outline">{user.language === 'en' ? 'English' : 'Indonesia'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipe User</span>
                  <Badge variant="outline">{user.userType}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Account Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Dibuat</p>
                    <p className="font-medium">
                      {format(new Date(user.createdAt), 'dd MMMM yyyy, HH:mm', {
                        locale: idLocale,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Terakhir Diperbarui</p>
                    <p className="font-medium">
                      {format(new Date(user.updatedAt), 'dd MMMM yyyy, HH:mm', {
                        locale: idLocale,
                      })}
                    </p>
                  </div>
                </div>

                {user.lastLogin && (
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Login Terakhir</p>
                      <p className="font-medium">
                        {format(new Date(user.lastLogin), 'dd MMMM yyyy, HH:mm', {
                          locale: idLocale,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keamanan Akun</CardTitle>
              <CardDescription>
                Informasi keamanan dan status akun user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Status Akun</span>
                  </div>
                  {user.isActive ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Nonaktif
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tipe User</span>
                  </div>
                  <Badge variant="secondary">{user.userType}</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Riwayat Keamanan</h4>
                <p className="text-sm text-muted-foreground">
                  Informasi detail tentang riwayat keamanan seperti perubahan password,
                  login attempts, dan aktivitas mencurigakan akan ditampilkan di sini.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas User</CardTitle>
              <CardDescription>
                Riwayat aktivitas dan login user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.lastLogin ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Login Terakhir</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(user.lastLogin), 'EEEE, dd MMMM yyyy - HH:mm:ss', {
                          locale: idLocale,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  User belum pernah login
                </p>
              )}

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Riwayat Aktivitas</h4>
                <p className="text-sm text-muted-foreground">
                  Informasi detail tentang aktivitas user seperti perubahan data,
                  akses modul, dan transaksi akan ditampilkan di sini.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permissions & Akses</CardTitle>
              <CardDescription>
                Daftar permission berdasarkan role {getRoleLabel(user.userRole || '')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getRolePermissions(user.userRole || '').map((permission, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{permission.name}</p>
                      <p className="text-sm text-muted-foreground">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Loading skeleton component
function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <Skeleton className="h-6 w-20" />

      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  )
}

// Helper function to get role label
function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    SPPG_KEPALA: 'Kepala SPPG',
    SPPG_ADMIN: 'Administrator',
    SPPG_AHLI_GIZI: 'Ahli Gizi',
    SPPG_AKUNTAN: 'Akuntan',
    SPPG_PRODUKSI_MANAGER: 'Manajer Produksi',
    SPPG_DISTRIBUSI_MANAGER: 'Manajer Distribusi',
    SPPG_HRD_MANAGER: 'Manajer HRD',
    SPPG_STAFF_DAPUR: 'Staff Dapur',
    SPPG_STAFF_DISTRIBUSI: 'Staff Distribusi',
    SPPG_STAFF_ADMIN: 'Staff Admin',
    SPPG_STAFF_QC: 'Staff Quality Control',
    SPPG_VIEWER: 'Viewer',
  }
  return roleLabels[role] || role
}

// Helper function to get role permissions
function getRolePermissions(role: string): Array<{ name: string; description: string }> {
  const permissionsMap: Record<string, Array<{ name: string; description: string }>> = {
    SPPG_KEPALA: [
      { name: 'Full Access', description: 'Akses penuh ke semua modul dan fitur' },
      { name: 'Manajemen Menu', description: 'Buat, edit, hapus menu dan program gizi' },
      { name: 'Manajemen Pengadaan', description: 'Kelola pengadaan bahan baku' },
      { name: 'Manajemen Produksi', description: 'Kelola jadwal dan proses produksi' },
      { name: 'Manajemen Distribusi', description: 'Kelola distribusi makanan' },
      { name: 'Manajemen Keuangan', description: 'Akses laporan keuangan dan budget' },
      { name: 'Manajemen User', description: 'Kelola user dan permissions' },
      { name: 'Approval', description: 'Approve transaksi dan perubahan data' },
    ],
    SPPG_ADMIN: [
      { name: 'Manajemen Menu', description: 'Buat, edit, hapus menu dan program gizi' },
      { name: 'Manajemen Pengadaan', description: 'Kelola pengadaan bahan baku' },
      { name: 'Manajemen User', description: 'Kelola user SPPG' },
      { name: 'View Reports', description: 'Lihat laporan operasional' },
    ],
    SPPG_AHLI_GIZI: [
      { name: 'Manajemen Menu', description: 'Buat dan edit menu dengan analisis gizi' },
      { name: 'Quality Control', description: 'Kontrol kualitas makanan' },
      { name: 'View Reports', description: 'Lihat laporan gizi' },
    ],
    SPPG_AKUNTAN: [
      { name: 'Manajemen Keuangan', description: 'Kelola data keuangan dan budget' },
      { name: 'Manajemen Pengadaan', description: 'Lihat dan approve pengadaan' },
      { name: 'Financial Reports', description: 'Buat dan export laporan keuangan' },
    ],
    SPPG_PRODUKSI_MANAGER: [
      { name: 'Manajemen Produksi', description: 'Kelola jadwal dan proses produksi' },
      { name: 'Quality Control', description: 'Kontrol kualitas produksi' },
      { name: 'View Reports', description: 'Lihat laporan produksi' },
    ],
    SPPG_DISTRIBUSI_MANAGER: [
      { name: 'Manajemen Distribusi', description: 'Kelola jadwal dan proses distribusi' },
      { name: 'View Reports', description: 'Lihat laporan distribusi' },
    ],
    SPPG_HRD_MANAGER: [
      { name: 'Manajemen User', description: 'Kelola data user dan staff' },
      { name: 'View Reports', description: 'Lihat laporan kepegawaian' },
    ],
    SPPG_STAFF_DAPUR: [
      { name: 'Manajemen Produksi', description: 'Input data produksi harian' },
      { name: 'View Menu', description: 'Lihat menu dan resep' },
    ],
    SPPG_STAFF_DISTRIBUSI: [
      { name: 'Manajemen Distribusi', description: 'Input data distribusi' },
      { name: 'View Reports', description: 'Lihat laporan distribusi' },
    ],
    SPPG_STAFF_ADMIN: [
      { name: 'Data Entry', description: 'Input dan update data operasional' },
      { name: 'View Reports', description: 'Lihat laporan basic' },
    ],
    SPPG_STAFF_QC: [
      { name: 'Quality Control', description: 'Lakukan inspeksi kualitas' },
      { name: 'View Reports', description: 'Lihat laporan quality control' },
    ],
    SPPG_VIEWER: [
      { name: 'Read Only', description: 'Akses read-only ke semua modul' },
      { name: 'View Reports', description: 'Lihat semua jenis laporan' },
    ],
  }

  return permissionsMap[role] || [
    { name: 'Basic Access', description: 'Akses dasar ke sistem' },
  ]
}
