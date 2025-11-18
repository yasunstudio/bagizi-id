/**
 * @fileoverview Payment Terms Table Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { paymentTermSchema, type PaymentTermInput } from '../schemas'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface PaymentTermsTableProps {
  terms: PaymentTermInput[]
  onChange: (terms: PaymentTermInput[]) => void
}

export function PaymentTermsTable({ terms, onChange }: PaymentTermsTableProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)

  const handleSave = (data: PaymentTermInput) => {
    if (editingIndex !== null) {
      const newTerms = [...terms]
      newTerms[editingIndex] = data
      onChange(newTerms)
    } else {
      onChange([...terms, data])
    }
    setIsDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Terms</CardTitle>
            <CardDescription>Konfigurasi metode pembayaran</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingIndex(null); setIsDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-2" />Tambah
              </Button>
            </DialogTrigger>
            <DialogContent>
              <PaymentTermDialog
                term={editingIndex !== null ? terms[editingIndex] : undefined}
                onSave={handleSave}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Jatuh Tempo</TableHead>
              <TableHead>DP</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terms.map((term, index) => (
              <TableRow key={term.id || index}>
                <TableCell><Badge>{term.code}</Badge></TableCell>
                <TableCell>{term.name}</TableCell>
                <TableCell>{term.dueDays} hari</TableCell>
                <TableCell>
                  {term.requireDP ? (
                    <Badge variant="secondary">{term.dpPercentage}%</Badge>
                  ) : (
                    <Badge variant="outline">Tidak</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingIndex(index); setIsDialogOpen(true) }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onChange(terms.filter((_, i) => i !== index))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function PaymentTermDialog({ term, onSave, onCancel }: { term?: PaymentTermInput; onSave: (data: PaymentTermInput) => void; onCancel: () => void }) {
  const form = useForm<PaymentTermInput>({
    resolver: zodResolver(paymentTermSchema),
    defaultValues: term || { code: '', name: '', dueDays: 30, requireDP: false },
  })

  const requireDP = form.watch('requireDP')

  return (
    <>
      <DialogHeader>
        <DialogTitle>{term ? 'Edit' : 'Tambah'} Payment Term</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <FormField control={form.control} name="code" render={({ field }) => (
            <FormItem><FormLabel>Kode</FormLabel><FormControl><Input placeholder="NET_30" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nama</FormLabel><FormControl><Input placeholder="Net 30 Days" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="dueDays" render={({ field }) => (
            <FormItem><FormLabel>Jatuh Tempo (Hari)</FormLabel><FormControl>
              <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
            </FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="requireDP" render={({ field }) => (
            <FormItem className="flex items-center justify-between border rounded-lg p-4">
              <div><FormLabel>Memerlukan DP</FormLabel></div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
          {requireDP && (
            <FormField control={form.control} name="dpPercentage" render={({ field }) => (
              <FormItem><FormLabel>Persentase DP (%)</FormLabel><FormControl>
                <Input type="number" min={0} max={100} {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
              </FormControl><FormMessage /></FormItem>
            )} />
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
