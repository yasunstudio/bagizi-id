/**
 * @fileoverview Menu Detail Page - Enhanced with Tabs
 * @version Next.js 15.5.4 / shadcn/ui Tabs Integration
 */

'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Info, 
  Package, 
  ChefHat, 
  Leaf, 
  DollarSign,
  Code,
  Clock,
  FileText,
  Check,
  X,
  Shield,
  Calculator,
  TrendingUp,
  TrendingDown,
  Copy,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { useMenu, useDeleteMenu } from '@/features/sppg/menu/hooks'
import { 
  IngredientsList,
  RecipeStepsManager, 
  NutritionPreview, 
  CostBreakdownCard,
  MenuActionsToolbar
} from '@/features/sppg/menu/components'
import { toast } from 'sonner'

interface MenuDetailPageProps {
  params: Promise<{ id: string }>
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  SARAPAN: 'Sarapan',
  SNACK_PAGI: 'Snack Pagi',
  MAKAN_SIANG: 'Makan Siang',
  SNACK_SORE: 'Snack Sore',
  MAKAN_MALAM: 'Makan Malam',
}

function MenuDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px] mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MenuDetailPage({ params }: MenuDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data: menu, isLoading, error } = useMenu(id)
  const { mutate: deleteMenu, isPending: isDeleting } = useDeleteMenu()
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (!menu) return
    
    deleteMenu(menu.id, {
      onSuccess: () => {
        toast.success('Menu berhasil dihapus')
        router.push('/menu')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menghapus menu')
      }
    })
    setShowDeleteDialog(false)
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6">
        <MenuDetailSkeleton />
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message || 'Menu tidak ditemukan'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/menu">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{menu.menuName}</h1>
            <p className="text-muted-foreground mt-2">
              Detail informasi menu
            </p>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div data-toolbar className="flex flex-wrap items-center gap-3">
          <MenuActionsToolbar
            menuId={menu.id}
            menuName={menu.menuName}
            onDuplicate={() => {
              // DuplicateMenuDialog will handle this
            }}
            onDelete={handleDelete}
          />
          
          {/* Kitchen View Button */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
          >
            <Link href={`/menu/${menu.id}/kitchen`}>
              <ChefHat className="h-4 w-4 mr-2" />
              Tampilan Dapur
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Info Dasar</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="ingredients" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Bahan</span>
            <span className="sm:hidden">Bahan</span>
          </TabsTrigger>
          <TabsTrigger value="recipe" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            <span className="hidden sm:inline">Resep</span>
            <span className="sm:hidden">Resep</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            <span className="hidden sm:inline">Nutrisi</span>
            <span className="sm:hidden">Nutrisi</span>
          </TabsTrigger>
          <TabsTrigger value="cost" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Biaya</span>
            <span className="sm:hidden">Biaya</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Informasi Dasar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Kode Menu with icon and copy button */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Kode Menu</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-mono">{menu.menuCode}</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(menu.menuCode)
                        toast.success('Kode menu berhasil disalin')
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {/* Jenis Makanan with icon */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Jenis Makanan</p>
                  </div>
                  <Badge className="mt-1">
                    {MEAL_TYPE_LABELS[menu.mealType] || menu.mealType}
                  </Badge>
                </div>

                {menu.description && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed">{menu.description}</p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Enhanced Halal/Vegetarian indicators */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Klasifikasi</p>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      {menu.isHalal ? (
                        <Shield className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">Halal</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                      {menu.isVegetarian ? (
                        <Leaf className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">Vegetarian</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Enhanced status with pulse indicator */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      menu.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    )} />
                    <Badge variant={menu.isActive ? 'default' : 'secondary'}>
                      {menu.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipe Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Informasi Resep
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Serving Size */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Ukuran Porsi</p>
                  </div>
                  <p className="text-lg font-semibold">{menu.servingSize} gram</p>
                </div>

                {/* Time Summary (if both times exist) */}
                {(menu.preparationTime || menu.cookingTime) && (
                  <>
                    <Separator />
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Total Waktu</p>
                      </div>
                      <p className="text-2xl font-bold">
                        {(menu.preparationTime || 0) + (menu.cookingTime || 0)} menit
                      </p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        {menu.preparationTime && (
                          <span>Persiapan: {menu.preparationTime}m</span>
                        )}
                        {menu.cookingTime && (
                          <span>Memasak: {menu.cookingTime}m</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {menu.difficulty && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Tingkat Kesulitan</p>
                      <Badge variant="outline" className="mt-1">
                        {menu.difficulty}
                      </Badge>
                    </div>
                  </>
                )}

                {menu.cookingMethod && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Metode Memasak</p>
                      <Badge variant="outline" className="mt-1">
                        {menu.cookingMethod}
                      </Badge>
                    </div>
                  </>
                )}

                <Separator />

                {/* Enhanced Cost Display */}
                <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Biaya per Porsi</p>
                  </div>
                  
                  {menu.costCalc?.costPerPortion ? (
                    // Show calculated cost (accurate from actual ingredients)
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-primary">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(menu.costCalc.costPerPortion)}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="default" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Terhitung Aktual
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(menu.costCalc.calculatedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      {/* Variance indicator */}
                      {Math.abs(menu.costCalc.costPerPortion - menu.costPerServing) > 100 && (
                        <div className="flex items-center gap-2 text-xs mt-2 p-2 bg-background/50 rounded">
                          {menu.costCalc.costPerPortion > menu.costPerServing ? (
                            <TrendingUp className="h-3 w-3 text-destructive" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-green-600" />
                          )}
                          <span>
                            {menu.costCalc.costPerPortion > menu.costPerServing ? '+' : ''}
                            {((menu.costCalc.costPerPortion - menu.costPerServing) / menu.costPerServing * 100).toFixed(1)}%
                            {' '}dari estimasi awal
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show planning cost (estimate only)
                    <div className="space-y-2">
                      <p className="text-2xl font-semibold text-muted-foreground">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(menu.costPerServing)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Estimasi Perencanaan
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Klik tombol &quot;Hitung Biaya&quot; di toolbar untuk mendapatkan biaya aktual dari bahan
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => {
                          // Scroll to toolbar
                          document.querySelector('[data-toolbar]')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        <Calculator className="h-3 w-3 mr-2" />
                        Lihat Toolbar Aksi
                      </Button>
                    </div>
                  )}
                </div>

                {menu.budgetAllocation && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Alokasi Anggaran</p>
                      </div>
                      <p className="text-lg font-semibold">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(menu.budgetAllocation)}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Allergens */}
          {menu.allergens && menu.allergens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alergen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {menu.allergens.map((allergen) => (
                    <Badge key={allergen} variant="destructive">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Ingredients */}
        <TabsContent value="ingredients" className="space-y-6">
          <IngredientsList menuId={menu.id} />
        </TabsContent>

        {/* Tab 3: Recipe Steps */}
        <TabsContent value="recipe" className="space-y-6">
          <RecipeStepsManager menuId={menu.id} menuName={menu.menuName} />
        </TabsContent>

        {/* Tab 4: Nutrition */}
        <TabsContent value="nutrition" className="space-y-6">
          <NutritionPreview menuId={menu.id} />
        </TabsContent>

        {/* Tab 5: Cost Analysis */}
        <TabsContent value="cost" className="space-y-6">
          <CostBreakdownCard menuId={menu.id} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Menu</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus menu <span className="font-semibold">&ldquo;{menu.menuName}&rdquo;</span>?
              <br /><br />
              Tindakan ini akan menghapus:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Semua data bahan untuk menu ini</li>
                <li>Langkah-langkah resep</li>
                <li>Hasil perhitungan nutrisi dan biaya</li>
              </ul>
              <br />
              <span className="text-destructive font-semibold">Tindakan ini tidak dapat dibatalkan.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus Menu'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
