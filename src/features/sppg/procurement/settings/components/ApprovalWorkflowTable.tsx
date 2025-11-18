/**
 * @fileoverview Approval Workflow Table Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * Multi-level approval workflow configuration:
 * - Add/edit/delete approval levels
 * - Amount range validation
 * - Role assignment
 * - Parallel approval support
 * - Escalation settings
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { approvalLevelSchema, type ApprovalLevelInput } from '../schemas'
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ApprovalWorkflowTableProps {
  levels: ApprovalLevelInput[]
  onChange: (levels: ApprovalLevelInput[]) => void
}

export function ApprovalWorkflowTable({ levels, onChange }: ApprovalWorkflowTableProps) {
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
    const newLevels = levels.filter((_, i) => i !== index)
    onChange(newLevels)
  }

  const handleSave = (data: ApprovalLevelInput) => {
    if (editingIndex !== null) {
      // Update existing
      const newLevels = [...levels]
      newLevels[editingIndex] = data
      onChange(newLevels)
    } else {
      // Add new
      onChange([...levels, data])
    }
    setIsDialogOpen(false)
  }

  // Sort levels by level number
  const sortedLevels = [...levels].sort((a, b) => a.level - b.level)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Alur Persetujuan</CardTitle>
            <CardDescription>
              Konfigurasi multi-level approval berdasarkan nilai procurement
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Level
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <ApprovalLevelDialog
                level={editingIndex !== null ? levels[editingIndex] : undefined}
                onSave={handleSave}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {levels.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Belum ada approval level. Klik <strong>Tambah Level</strong> untuk membuat konfigurasi approval.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Level</TableHead>
                  <TableHead>Nama Level</TableHead>
                  <TableHead>Range Nilai</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-24">Tipe</TableHead>
                  <TableHead className="w-32 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLevels.map((level, index) => (
                  <TableRow key={level.id || index}>
                    <TableCell>
                      <Badge variant="outline">L{level.level}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{level.levelName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Min: Rp {level.minAmount.toLocaleString('id-ID')}</div>
                        {level.maxAmount && (
                          <div>Max: Rp {level.maxAmount.toLocaleString('id-ID')}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{level.requiredRole}</Badge>
                    </TableCell>
                    <TableCell>
                      {level.isParallel ? (
                        <Badge variant="default">Paralel</Badge>
                      ) : (
                        <Badge variant="outline">Sekuensial</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Dialog for add/edit approval level
interface ApprovalLevelDialogProps {
  level?: ApprovalLevelInput
  onSave: (data: ApprovalLevelInput) => void
  onCancel: () => void
}

function ApprovalLevelDialog({ level, onSave, onCancel }: ApprovalLevelDialogProps) {
  const form = useForm<ApprovalLevelInput>({
    resolver: zodResolver(approvalLevelSchema),
    defaultValues: level || {
      level: 1,
      levelName: '',
      minAmount: 0,
      maxAmount: undefined,
      requiredRole: 'SPPG_ADMIN',
      isParallel: false,
      escalationDays: undefined,
    },
  })

  const onSubmit = (data: ApprovalLevelInput) => {
    onSave(data)
    form.reset()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{level ? 'Edit' : 'Tambah'} Approval Level</DialogTitle>
        <DialogDescription>
          Konfigurasi level persetujuan dengan range nilai dan role yang diperlukan
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Level 1-10</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="levelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Level</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Approval Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nilai Minimum (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="5000000"
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
              name="maxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nilai Maximum (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="50000000 (kosongkan jika unlimited)"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>Kosongkan untuk unlimited</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="requiredRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role yang Diperlukan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SPPG_KEPALA">Kepala SPPG</SelectItem>
                    <SelectItem value="SPPG_ADMIN">Admin SPPG</SelectItem>
                    <SelectItem value="SPPG_AKUNTAN">Akuntan</SelectItem>
                    <SelectItem value="SPPG_PRODUKSI_MANAGER">Manager Produksi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isParallel"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Approval Paralel</FormLabel>
                  <FormDescription>
                    Semua approver di level ini harus approve bersamaan
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

          <FormField
            control={form.control}
            name="escalationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eskalasi (Hari)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={90}
                    placeholder="7 (kosongkan jika tidak ada eskalasi)"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Otomatis eskalasi ke level berikutnya setelah X hari tanpa approval
                </FormDescription>
                <FormMessage />
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
