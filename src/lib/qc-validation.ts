/**
 * @fileoverview Quality Control (QC) Helper Functions
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * PHASE 2.1: QC Photos Requirement Enforcement
 * - Validates QC photos based on settings
 * - Enforces minimum photo count
 * - Returns validation result with details
 */

import { db } from '@/lib/prisma'

/**
 * QC Photo Validation Result
 */
export interface QCPhotoValidationResult {
  isValid: boolean
  message?: string
  details?: {
    requireQCPhotos: boolean
    minQCPhotoCount: number
    uploadedCount: number
  }
}

/**
 * Validate QC Photos based on settings
 * 
 * @param sppgId - SPPG ID to fetch settings
 * @param photos - Array of photo URLs or file uploads
 * @returns Validation result
 * 
 * @example
 * ```typescript
 * const result = await validateQCPhotos('sppg-id', ['photo1.jpg', 'photo2.jpg'])
 * if (!result.isValid) {
 *   return NextResponse.json({ error: result.message }, { status: 400 })
 * }
 * ```
 */
export async function validateQCPhotos(
  sppgId: string,
  photos: string[] | null | undefined
): Promise<QCPhotoValidationResult> {
  // Fetch settings
  const settings = await db.procurementSettings.findUnique({
    where: { sppgId },
    select: {
      requireQCPhotos: true,
      minQCPhotoCount: true,
    },
  })

  // If no settings, allow (backward compatibility)
  if (!settings) {
    return {
      isValid: true,
      message: 'No QC settings configured - validation skipped',
    }
  }

  // If QC photos not required, allow
  if (!settings.requireQCPhotos) {
    return {
      isValid: true,
      message: 'QC photos not required by settings',
      details: {
        requireQCPhotos: false,
        minQCPhotoCount: settings.minQCPhotoCount || 0,
        uploadedCount: photos?.length || 0,
      },
    }
  }

  // QC photos required - validate count
  const uploadedCount = photos?.length || 0
  const minRequired = settings.minQCPhotoCount || 1

  if (uploadedCount < minRequired) {
    return {
      isValid: false,
      message: `QC photos required: minimum ${minRequired} photo${minRequired > 1 ? 's' : ''} needed`,
      details: {
        requireQCPhotos: true,
        minQCPhotoCount: minRequired,
        uploadedCount,
      },
    }
  }

  // Validation passed
  return {
    isValid: true,
    message: 'QC photo requirements met',
    details: {
      requireQCPhotos: true,
      minQCPhotoCount: minRequired,
      uploadedCount,
    },
  }
}

/**
 * Get QC Checklist Templates by Category
 * 
 * @param sppgId - SPPG ID to fetch settings
 * @param category - Inventory category
 * @returns Array of active QC checklists
 * 
 * @example
 * ```typescript
 * const checklists = await getQCChecklists('sppg-id', 'SAYURAN')
 * // Returns checklist items to validate
 * ```
 */
export async function getQCChecklists(
  sppgId: string,
  category: string
) {
  const settings = await db.procurementSettings.findUnique({
    where: { sppgId },
    include: {
      qcChecklists: {
        where: {
          category,
          isActive: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  })

  return settings?.qcChecklists || []
}

/**
 * Validate QC Checklist Items
 * 
 * @param sppgId - SPPG ID
 * @param category - Category to validate
 * @param checklistData - Completed checklist items from form
 * @returns Validation result
 */
export interface QCChecklistValidationResult {
  isValid: boolean
  message?: string
  missingItems?: string[]
  details?: {
    totalItems: number
    completedItems: number
    requiredItems: number
  }
}

export async function validateQCChecklist(
  sppgId: string,
  category: string,
  checklistData: Record<string, boolean | string>
): Promise<QCChecklistValidationResult> {
  const checklists = await getQCChecklists(sppgId, category)

  // If no checklists configured, allow
  if (checklists.length === 0) {
    return {
      isValid: true,
      message: 'No QC checklist configured for this category',
    }
  }

  // Check required items
  const requiredItems = checklists.filter(item => item.isRequired)
  const missingItems: string[] = []

  for (const item of requiredItems) {
    const value = checklistData[item.id]
    
    if (!value || value === '' || value === false) {
      missingItems.push(item.checklistItem)
    }
  }

  if (missingItems.length > 0) {
    return {
      isValid: false,
      message: `Required QC checklist items missing`,
      missingItems,
      details: {
        totalItems: checklists.length,
        completedItems: Object.keys(checklistData).length,
        requiredItems: requiredItems.length,
      },
    }
  }

  return {
    isValid: true,
    message: 'All required QC checklist items completed',
    details: {
      totalItems: checklists.length,
      completedItems: Object.keys(checklistData).length,
      requiredItems: requiredItems.length,
    },
  }
}
