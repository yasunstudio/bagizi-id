/**
 * @fileoverview General Procurement Settings Form Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * General configuration for procurement:
 * - Auto-approve threshold
 * - QC photo requirements
 * - Default payment terms
 * - Notification settings (WhatsApp, Email digest)
 * - Budget alerts
 * - System integrations
 */

'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { updateGeneralSettingsSchema, type UpdateGeneralSettingsInput } from '../schemas'
import { DIGEST_FREQUENCIES, PAYMENT_TERM_CODES } from '../types'
import { DollarSign, Camera, Bell, Settings } from 'lucide-react'

interface GeneralSettingsFormProps {
  defaultValues: UpdateGeneralSettingsInput
  onChange: (data: UpdateGeneralSettingsInput) => void
}

export function GeneralSettingsForm({ defaultValues, onChange }: GeneralSettingsFormProps) {
  const form = useForm<UpdateGeneralSettingsInput>({
    resolver: zodResolver(updateGeneralSettingsSchema),
    defaultValues,
  })

  // Trigger onChange whenever form values change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (form.formState.isValid) {
        onChange(value as UpdateGeneralSettingsInput)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

  const requireQCPhotos = form.watch('requireQCPhotos')
  const enableWhatsappNotif = form.watch('enableWhatsappNotif')
  const enableEmailDigest = form.watch('enableEmailDigest')
  const budgetAlertEnabled = form.watch('budgetAlertEnabled')

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-6">
          {/* Approval Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Pengaturan Persetujuan</CardTitle>
              </div>
              <CardDescription>
                Konfigurasi ambang batas dan proses persetujuan procurement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="autoApproveThreshold"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Ambang Batas Auto-Approve</FormLabel>
                      <Badge variant="secondary">
                        Rp {(field.value || 0).toLocaleString('id-ID')}
                      </Badge>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={50000000}
                        step={500000}
                        value={[field.value || 0]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Procurement di bawah nilai ini akan otomatis disetujui tanpa approval manual
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* QC Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <CardTitle>Pengaturan Quality Control</CardTitle>
              </div>
              <CardDescription>
                Konfigurasi foto dan dokumentasi QC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="requireQCPhotos"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Wajibkan Foto QC
                      </FormLabel>
                      <FormDescription>
                        Setiap procurement harus dilengkapi dengan foto QC
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

              {requireQCPhotos && (
                <FormField
                  control={form.control}
                  name="minQCPhotoCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Jumlah Foto</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          placeholder="3"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Jumlah minimum foto yang harus diupload untuk setiap QC (1-20)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Pengaturan Pembayaran</CardTitle>
              </div>
              <CardDescription>
                Konfigurasi metode pembayaran default
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="defaultPaymentTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Term Default</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih payment term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PAYMENT_TERM_CODES).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {key.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Payment term yang akan digunakan secara default untuk supplier baru
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Pengaturan Notifikasi</CardTitle>
              </div>
              <CardDescription>
                Konfigurasi notifikasi WhatsApp dan email digest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="enableWhatsappNotif"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Notifikasi WhatsApp
                      </FormLabel>
                      <FormDescription>
                        Aktifkan notifikasi via WhatsApp
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

              {enableWhatsappNotif && (
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0812-3456-7890"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Format: +62xxx atau 08xxx (9-12 digit)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Separator />

              <FormField
                control={form.control}
                name="enableEmailDigest"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Email Digest
                      </FormLabel>
                      <FormDescription>
                        Terima ringkasan procurement via email
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

              {enableEmailDigest && (
                <FormField
                  control={form.control}
                  name="digestFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frekuensi Digest</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih frekuensi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIGEST_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq} value={freq}>
                              {freq === 'DAILY' && 'Harian'}
                              {freq === 'WEEKLY' && 'Mingguan'}
                              {freq === 'MONTHLY' && 'Bulanan'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Budget Alert Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Pengaturan Alert Budget</CardTitle>
              </div>
              <CardDescription>
                Konfigurasi notifikasi saat mendekati batas budget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="budgetAlertEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Alert Budget
                      </FormLabel>
                      <FormDescription>
                        Aktifkan notifikasi saat budget hampir habis
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

              {budgetAlertEnabled && (
                <FormField
                  control={form.control}
                  name="budgetAlertThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Threshold Alert</FormLabel>
                        <Badge variant="secondary">{field.value}%</Badge>
                      </div>
                      <FormControl>
                        <Slider
                          min={50}
                          max={100}
                          step={5}
                          value={[field.value || 80]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormDescription>
                        Notifikasi akan dikirim saat budget terpakai mencapai persentase ini
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Integration Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>Pengaturan Integrasi</CardTitle>
              </div>
              <CardDescription>
                Konfigurasi integrasi dengan sistem lain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="accountingIntegration"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Integrasi Accounting
                      </FormLabel>
                      <FormDescription>
                        Sinkronisasi otomatis dengan sistem accounting
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
                name="inventoryAutoSync"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Auto-Sync Inventory
                      </FormLabel>
                      <FormDescription>
                        Update stok inventory otomatis saat procurement selesai
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
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
