/**
 * @fileoverview QC Checklist Builder Component  
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { qcChecklistSchema, type QCChecklistInput } from '../schemas'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface QCChecklistBuilderProps {
  checklists: QCChecklistInput[]
  onChange: (checklists: QCChecklistInput[]) => void
}

export function QCChecklistBuilder({ checklists, onChange }: QCChecklistBuilderProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)

  const handleSave = (data: QCChecklistInput) => {
    if (editingIndex !== null) {
      const newChecklists = [...checklists]
      newChecklists[editingIndex] = data
      onChange(newChecklists)
    } else {
      onChange([...checklists, data])
    }
    setIsDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>QC Checklists</CardTitle>
            <CardDescription>Template QC per kategori item</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingIndex(null); setIsDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-2" />Tambah
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <QCChecklistDialog
                checklist={editingIndex !== null ? checklists[editingIndex] : undefined}
                onSave={handleSave}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklists.map((checklist, index) => (
            <Card key={checklist.id || index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{checklist.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{checklist.code}</Badge>
                      {checklist.category && <Badge variant="secondary">{checklist.category}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingIndex(index); setIsDialogOpen(true) }}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onChange(checklists.filter((_, i) => i !== index))}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check Items:</span>
                  <span className="font-medium">{checklist.checkItems.length} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pass Threshold:</span>
                  <Badge>{checklist.passThreshold}%</Badge>
                </div>
                {checklist.requirePhotos && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Photos:</span>
                    <span>{checklist.minPhotos || 0}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QCChecklistDialog({ checklist, onSave, onCancel }: { checklist?: QCChecklistInput; onSave: (data: QCChecklistInput) => void; onCancel: () => void }) {
  const form = useForm<QCChecklistInput>({
    resolver: zodResolver(qcChecklistSchema),
    defaultValues: checklist || {
      code: '',
      name: '',
      checkItems: [{ item: 'Visual Inspection', criteria: 'No defects', weight: 100, isMandatory: true }],
      passThreshold: 80,
      requirePhotos: true,
      minPhotos: 3,
    },
  })

  const requirePhotos = form.watch('requirePhotos')
  const [checkItems, setCheckItems] = React.useState(checklist?.checkItems || [{ item: 'Visual Inspection', criteria: 'No defects', weight: 100, isMandatory: true }])

  const addCheckItem = () => {
    setCheckItems([...checkItems, { item: '', criteria: '', weight: 0, isMandatory: false }])
  }

  const updateCheckItem = (index: number, field: string, value: string | number | boolean) => {
    const newItems = [...checkItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setCheckItems(newItems)
    form.setValue('checkItems', newItems)
  }

  const removeCheckItem = (index: number) => {
    const newItems = checkItems.filter((_, i) => i !== index)
    setCheckItems(newItems)
    form.setValue('checkItems', newItems)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{checklist ? 'Edit' : 'Tambah'} QC Checklist</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="code" render={({ field }) => (
              <FormItem><FormLabel>Kode</FormLabel><FormControl><Input placeholder="FRESH_PRODUCE_QC" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nama</FormLabel><FormControl><Input placeholder="Fresh Produce QC" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Kategori (Optional)</FormLabel><FormControl>
              <Input placeholder="FRESH_PRODUCE" {...field} value={field.value || ''} />
            </FormControl><FormMessage /></FormItem>
          )} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel>Check Items</FormLabel>
              <Button type="button" size="sm" variant="outline" onClick={addCheckItem}>
                <Plus className="h-3 w-3 mr-1" />Add Item
              </Button>
            </div>
            
            {checkItems.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      placeholder="Item name" 
                      value={item.item}
                      onChange={(e) => updateCheckItem(index, 'item', e.target.value)}
                    />
                    <Input 
                      placeholder="Criteria" 
                      value={item.criteria}
                      onChange={(e) => updateCheckItem(index, 'criteria', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      placeholder="Weight (%)"
                      value={item.weight}
                      onChange={(e) => updateCheckItem(index, 'weight', Number(e.target.value))}
                      className="w-32"
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.isMandatory}
                        onCheckedChange={(checked) => updateCheckItem(index, 'isMandatory', checked)}
                      />
                      <span className="text-sm">Mandatory</span>
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeCheckItem(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <FormField control={form.control} name="passThreshold" render={({ field }) => (
            <FormItem><FormLabel>Pass Threshold (%)</FormLabel><FormControl>
              <Input type="number" min={0} max={100} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
            </FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="requirePhotos" render={({ field }) => (
            <FormItem className="flex items-center justify-between border rounded-lg p-4">
              <FormLabel>Require Photos</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />

          {requirePhotos && (
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="minPhotos" render={({ field }) => (
                <FormItem><FormLabel>Min Photos</FormLabel><FormControl>
                  <Input type="number" min={1} {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="maxPhotos" render={({ field }) => (
                <FormItem><FormLabel>Max Photos</FormLabel><FormControl>
                  <Input type="number" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                </FormControl><FormMessage /></FormItem>
              )} />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
