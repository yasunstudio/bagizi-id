/**
 * @fileoverview QC Photo Upload Component with Validation
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Photo upload component for quality control with minimum requirement enforcement
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, X, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

interface QCPhoto {
  id: string
  url: string
  name: string
  size: number
  uploadedAt: Date
}

interface QCPhotoUploadProps {
  photos: QCPhoto[]
  onPhotosChange: (photos: QCPhoto[]) => void
  requiredPhotos: number
  maxPhotos?: number
  categoryName: string
}

// ================================ COMPONENT ================================

export function QCPhotoUpload({
  photos,
  onPhotosChange,
  requiredPhotos,
  maxPhotos = 10,
  categoryName,
}: QCPhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isRequirementMet = photos.length >= requiredPhotos
  const canUploadMore = photos.length < maxPhotos

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)
    setUploading(true)

    try {
      // Validate file count
      const remainingSlots = maxPhotos - photos.length
      if (files.length > remainingSlots) {
        setError(`Maksimal ${maxPhotos} foto. Anda hanya bisa mengunggah ${remainingSlots} foto lagi.`)
        setUploading(false)
        return
      }

      // Validate file types and sizes
      const validFiles: File[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          setError(`File "${file.name}" bukan gambar yang valid.`)
          setUploading(false)
          return
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(`File "${file.name}" terlalu besar. Maksimal 5MB per foto.`)
          setUploading(false)
          return
        }

        validFiles.push(file)
      }

      // Upload files (simulate upload - in real app, upload to storage)
      const newPhotos: QCPhoto[] = await Promise.all(
        validFiles.map(async (file) => {
          // Simulate upload delay
          await new Promise((resolve) => setTimeout(resolve, 500))

          // In real implementation, upload to cloud storage and get URL
          const url = URL.createObjectURL(file)

          return {
            id: `${Date.now()}-${Math.random()}`,
            url,
            name: file.name,
            size: file.size,
            uploadedAt: new Date(),
          }
        })
      )

      onPhotosChange([...photos, ...newPhotos])
    } catch (err) {
      setError('Gagal mengunggah foto. Silakan coba lagi.')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  // Handle photo removal
  const handleRemovePhoto = (photoId: string) => {
    onPhotosChange(photos.filter((p) => p.id !== photoId))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Dokumentasi Foto QC
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Kategori: <strong>{categoryName}</strong>
            </p>
          </div>
          <Badge
            variant={isRequirementMet ? 'default' : 'destructive'}
            className={cn(
              'flex items-center gap-1',
              isRequirementMet && 'bg-green-100 text-green-800 hover:bg-green-200'
            )}
          >
            {isRequirementMet ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {photos.length}/{requiredPhotos} foto wajib
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Requirement Alert */}
        {!isRequirementMet && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Minimal <strong>{requiredPhotos} foto</strong> wajib diunggah untuk kategori{' '}
              <strong>{categoryName}</strong>. Saat ini baru {photos.length} foto.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group rounded-lg border overflow-hidden bg-muted"
              >
                <div className="relative w-full h-32">
                  <Image
                    src={photo.url}
                    alt={photo.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePhoto(photo.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="p-2 bg-background">
                  <p className="text-xs truncate" title={photo.name}>
                    {photo.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(photo.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4 text-center">
            {canUploadMore ? (
              <>
                Unggah foto hasil inspeksi QC
                <br />
                <span className="text-xs">
                  Format: JPG, PNG (max 5MB per foto)
                </span>
              </>
            ) : (
              `Maksimal ${maxPhotos} foto tercapai`
            )}
          </p>
          <input
            type="file"
            id="qc-photo-upload"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading || !canUploadMore}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading || !canUploadMore}
            onClick={() => document.getElementById('qc-photo-upload')?.click()}
          >
            {uploading ? 'Mengunggah...' : 'Pilih Foto'}
          </Button>
        </div>

        {/* Guidelines */}
        <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md">
          <p className="font-medium">📋 Petunjuk Foto QC:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Foto kondisi keseluruhan produk (overview)</li>
            <li>Foto close-up label/kemasan</li>
            <li>Foto detail yang menunjukkan kualitas</li>
            <li>Foto suhu/termometer (untuk produk dengan suhu tertentu)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
