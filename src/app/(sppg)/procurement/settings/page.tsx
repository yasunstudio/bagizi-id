/**
 * @fileoverview Procurement Settings Page - Full Implementation
 * 
 * Complete settings management with:
 * - General settings (auto-approve, QC, notifications)
 * - Approval workflow configuration
 * - Custom categories management
 * - Payment terms configuration
 * - QC checklist templates
 * 
 * Access Control: Only SPPG_KEPALA and SPPG_ADMIN
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Settings, Save, X, AlertCircle, Loader2 } from 'lucide-react'
import { useSettings, useUpdateSettings, useInitializeSettings } from '@/features/sppg/procurement/settings/hooks'
import { useSettingsStore } from '@/features/sppg/procurement/settings/stores'
import {
  GeneralSettingsForm,
  ApprovalWorkflowTable,
  CategoryManagement,
  PaymentTermsTable,
  QCChecklistBuilder,
} from '@/features/sppg/procurement/settings/components'

function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('general')
  
  // Fetch settings
  const { data: settings, isLoading, error } = useSettings()
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateSettings()
  const { mutate: initializeSettings, isPending: isInitializing } = useInitializeSettings()
  
  // Store for local state management
  const {
    setSettings,
    generalSettings,
    approvalLevels,
    categories,
    paymentTerms,
    qcChecklists,
    updateGeneralSettings,
    setApprovalLevels,
    setCategories,
    setPaymentTerms,
    setQCChecklists,
    isDirty,
    discardChanges,
  } = useSettingsStore()

  // Initialize store when settings loaded
  React.useEffect(() => {
    if (settings) {
      setSettings(settings)
    }
  }, [settings, setSettings])

  // Handle save
  const handleSave = () => {
    if (!generalSettings) return

    updateSettings({
      general: generalSettings,
      approvalLevels,
      categories,
      paymentTerms,
      qcChecklists,
    })
  }

  // Handle cancel
  const handleCancel = () => {
    if (isDirty) {
      if (confirm('Ada perubahan yang belum disimpan. Yakin ingin membatalkan?')) {
        discardChanges()
      }
    }
  }

  // Handle initialize (for first-time setup)
  const handleInitialize = () => {
    initializeSettings()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-5 w-[600px] mt-2" />
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    )
  }

  // Error state - show error dengan detail
  if (error) {
    console.error('[SettingsPage] Error:', error)
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Gagal memuat pengaturan: {error.message}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>
            Muat Ulang Halaman
          </Button>
        </div>
      </div>
    )
  }

  // No settings - first time setup
  // Only show initialize button if truly no settings exist
  if (!settings) {
    console.log('[SettingsPage] No settings found, showing initialize button')
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Pengaturan Procurement
          </h1>
          <p className="text-muted-foreground mt-2">
            Belum ada pengaturan. Inisialisasi dengan konfigurasi default?
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup Awal</CardTitle>
            <CardDescription>
              Buat pengaturan default untuk memulai konfigurasi procurement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleInitialize} 
              disabled={isInitializing}
              size="lg"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menginisialisasi...
                </>
              ) : (
                'Inisialisasi Pengaturan Default'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  console.log('[SettingsPage] Settings loaded:', { 
    hasGeneralSettings: !!settings,
    approvalLevelsCount: settings?.approvalLevels?.length || 0,
    categoriesCount: settings?.customCategories?.length || 0,
    paymentTermsCount: settings?.paymentTerms?.length || 0,
    qcChecklistsCount: settings?.qcChecklists?.length || 0,
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Pengaturan Procurement
          </h1>
          <p className="text-muted-foreground mt-2">
            Konfigurasi approval workflow, kategori, dan preferensi sistem
          </p>
        </div>

        {/* Action Buttons */}
        {isDirty && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isUpdating}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Unsaved Changes Warning */}
      {isDirty && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ada perubahan yang belum disimpan. Jangan lupa klik <strong>Simpan Perubahan</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
          <TabsTrigger value="payment">Pembayaran</TabsTrigger>
          <TabsTrigger value="qc">Quality Control</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          {generalSettings && (
            <GeneralSettingsForm
              defaultValues={generalSettings}
              onChange={updateGeneralSettings}
            />
          )}
        </TabsContent>

        {/* Approval Workflow Tab */}
        <TabsContent value="approval">
          <ApprovalWorkflowTable
            levels={approvalLevels}
            onChange={setApprovalLevels}
          />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <CategoryManagement
            categories={categories}
            onChange={setCategories}
          />
        </TabsContent>

        {/* Payment Terms Tab */}
        <TabsContent value="payment">
          <PaymentTermsTable
            terms={paymentTerms}
            onChange={setPaymentTerms}
          />
        </TabsContent>

        {/* QC Checklists Tab */}
        <TabsContent value="qc">
          <QCChecklistBuilder
            checklists={qcChecklists}
            onChange={setQCChecklists}
          />
        </TabsContent>
      </Tabs>

      {/* Bottom Save Button */}
      {isDirty && (
        <div className="flex items-center justify-end gap-2 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isUpdating}
            size="lg"
          >
            <X className="h-4 w-4 mr-2" />
            Batal
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUpdating}
            size="lg"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
