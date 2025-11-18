/**
 * @fileoverview Category Management Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * Custom procurement categories management:
 * - Add/edit/delete categories
 * - Color picker for visual identification
 * - Icon selector
 * - Budget allocation
 * - Approval settings per category
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryInput } from '../schemas'
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CategoryManagementProps {
  categories: CategoryInput[]
  onChange: (categories: CategoryInput[]) => void
}

export function CategoryManagement({ categories, onChange }: CategoryManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)

  const handleAdd = () => {
    setEditingIndex(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setIsDialogOpen(true)
  }

  const handleDelete = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index)
    onChange(newCategories)
  }

  const handleSave = (data: CategoryInput) => {
    if (editingIndex !== null) {
      const newCategories = [...categories]
      newCategories[editingIndex] = data
      onChange(newCategories)
    } else {
      onChange([...categories, data])
    }
    setIsDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Kategori Kustom</CardTitle>
            <CardDescription>
              Tambahkan kategori khusus untuk procurement Anda
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kategori
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CategoryDialog
                category={editingIndex !== null ? categories[editingIndex] : undefined}
                onSave={handleSave}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Belum ada kategori kustom. Klik <strong>Tambah Kategori</strong> untuk membuat kategori baru.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <Card key={category.id || index} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      />
                      <CardTitle className="text-base">{category.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{category.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.description && (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  )}
                  
                  {(category.monthlyBudget || category.yearlyBudget) && (
                    <div className="text-sm space-y-1">
                      {category.monthlyBudget && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Budget Bulanan:</span>
                          <span className="font-medium">Rp {category.monthlyBudget.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {category.yearlyBudget && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Budget Tahunan:</span>
                          <span className="font-medium">Rp {category.yearlyBudget.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {category.budgetAllocPct && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Alokasi: </span>
                      <Badge variant="secondary">{category.budgetAllocPct}%</Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      {category.requiresApproval ? (
                        <Badge variant="outline" className="text-xs">Perlu Approval</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Auto Approve</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(index)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(index)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Dialog for add/edit category
interface CategoryDialogProps {
  category?: CategoryInput
  onSave: (data: CategoryInput) => void
  onCancel: () => void
}

function CategoryDialog({ category, onSave, onCancel }: CategoryDialogProps) {
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category || {
      code: '',
      name: '',
      description: undefined,
      icon: undefined,
      color: '#6366f1',
      monthlyBudget: undefined,
      yearlyBudget: undefined,
      budgetAllocPct: undefined,
      requiresApproval: true,
      minApprovalAmount: undefined,
      customApprover: undefined,
      isActive: true,
      sortOrder: 0,
    },
  })

  const onSubmit = (data: CategoryInput) => {
    onSave(data)
    form.reset()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{category ? 'Edit' : 'Tambah'} Kategori</DialogTitle>
        <DialogDescription>
          Buat kategori kustom untuk procurement dengan budget dan approval settings
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder="CUSTOM_FROZEN" {...field} />
                  </FormControl>
                  <FormDescription>Huruf besar, underscore</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder="Frozen Food" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Deskripsi kategori..." 
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warna</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="color" 
                        className="w-16 h-10"
                        {...field}
                        value={field.value || '#6366f1'}
                      />
                    </FormControl>
                    <Input 
                      placeholder="#6366f1"
                      value={field.value || ''}
                      onChange={field.onChange}
                      className="flex-1"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Package" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Lucide icon name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="monthlyBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Bulanan (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="10000000"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearlyBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Tahunan (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="120000000"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="budgetAllocPct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alokasi Budget (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="15"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Persentase dari total budget procurement</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requiresApproval"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Memerlukan Approval</FormLabel>
                  <FormDescription>
                    Procurement di kategori ini harus melalui approval
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
