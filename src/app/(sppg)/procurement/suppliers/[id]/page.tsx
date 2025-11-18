/**
 * @fileoverview Supplier Detail Page - REFACTORED VERSION
 * @description Thin orchestrator pattern with extracted components
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * REFACTORING METRICS:
 * - Original: 976 lines (monolithic)
 * - Refactored: 250 lines (thin orchestrator)
 * - Reduction: 74%
 * - Components extracted: 8
 * - Pattern: API client + focused components
 * 
 * TO USE THIS FILE:
 * 1. Copy this entire file content
 * 2. Replace the content of page.tsx with this
 * 3. Delete this .REFACTORED.tsx file
 * 4. Run: npm run build
 */

import { Metadata } from 'next'

import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { supplierApi } from '@/features/sppg/procurement/suppliers/api'
import {
  SupplierDetailHeader,
  SupplierQuickStats,
  SupplierBasicInfo,
  SupplierContact,
  SupplierAddress,
  SupplierRatings,
  SupplierDocuments,
  SupplierProcurements,
} from '@/features/sppg/procurement/suppliers/components/detail'
import { ProcurementPageHeader } from '@/components/shared/procurement/ProcurementPageHeader'
import { Building2, ArrowLeft, Edit } from 'lucide-react'

// ============================================
// METADATA
// ============================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    // Fetch via API client (multi-tenant secure)
    const result = await supplierApi.getSupplierById(id, await headers())

    if (!result.success || !result.data) {
      return {
        title: 'Supplier Not Found | Bagizi',
        description: 'The requested supplier could not be found',
      }
    }

    const supplier = result.data

    return {
      title: `${supplier.supplierName} - Detail Supplier | Bagizi`,
      description: `Detail informasi supplier ${supplier.supplierName} (${supplier.supplierCode}) - ${supplier.category || 'Supplier'} dari ${supplier.city}, ${supplier.province}`,
    }
  } catch {
    return { 
      title: 'Supplier Detail | Bagizi',
      description: 'Detail informasi supplier'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

/**
 * SPPG Procurement - Supplier Detail Page
 * @description Thin orchestrator for supplier detail components
 * @param {Object} params - Route parameters
 * @param {string} params.id - Supplier ID
 * @returns {Promise<JSX.Element>} Supplier detail page
 * 
 * ARCHITECTURE NOTE:
 * This page follows the "thin orchestrator" pattern:
 * - Fetch data via API client (multi-tenant secure)
 * - Pass data to focused feature components
 * - No business logic or presentation details
 * - Total lines: ~250 (74% reduction from 976)
 */
async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // ============================================
  // DATA FETCHING - API Client Pattern
  // ============================================

  // Fetch supplier data via API client (multi-tenant secure)
  const result = await supplierApi.getSupplierById(id, await headers())

  // Handle not found or error
  if (!result.success || !result.data) {
    notFound()
  }

  const supplier = result.data

  // ============================================
  // RENDER - Thin Orchestrator Pattern
  // ============================================

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header with Breadcrumb */}
      <ProcurementPageHeader
        title={supplier.supplierName}
        description={`Detail informasi supplier ${supplier.supplierCode} - ${supplier.category || 'Supplier'}`}
        icon={Building2}
        breadcrumbs={['Procurement', 'Suppliers', supplier.supplierName]}
        action={[
          {
            label: 'Kembali',
            href: '/procurement/suppliers',
            icon: ArrowLeft,
            variant: 'outline'
          },
          {
            label: 'Edit',
            href: `/procurement/suppliers/${supplier.id}/edit`,
            icon: Edit
          }
        ]}
      />

      {/* Header Section */}
      <SupplierDetailHeader 
        supplier={{
          id: supplier.id,
          supplierName: supplier.supplierName,
          supplierCode: supplier.supplierCode,
          isActive: supplier.isActive,
          isPreferred: supplier.isPreferred,
          isBlacklisted: supplier.isBlacklisted,
        }}
      />

      {/* Quick Stats Section */}
      <SupplierQuickStats 
        supplier={{
          overallRating: supplier.overallRating,
          totalOrders: supplier.totalOrders,
          onTimeDeliveryRate: supplier.onTimeDeliveryRate,
          totalPurchaseValue: supplier.totalPurchaseValue,
        }}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <SupplierBasicInfo 
            supplier={{
              supplierName: supplier.supplierName,
              businessName: supplier.businessName || null,
              supplierCode: supplier.supplierCode,
              supplierType: supplier.supplierType,
              category: supplier.category,
              partnershipLevel: supplier.partnershipLevel,
            }}
          />

          {/* Contact Information */}
          <SupplierContact 
            supplier={{
              primaryContact: supplier.primaryContact,
              phone: supplier.phone,
              email: supplier.email || null,
              whatsapp: supplier.whatsapp || null,
              website: supplier.website || null,
            }}
          />

          {/* Address Information */}
          <SupplierAddress 
            supplier={{
              address: supplier.address,
              city: supplier.city,
              province: supplier.province,
              postalCode: supplier.postalCode || null,
              deliveryRadius: supplier.deliveryRadius || null,
            }}
          />

          {/* Ratings & Performance */}
          <SupplierRatings 
            supplier={{
              overallRating: supplier.overallRating,
              qualityRating: supplier.qualityRating,
              deliveryRating: supplier.deliveryRating,
              priceCompetitiveness: supplier.priceCompetitiveness,
              serviceRating: supplier.serviceRating,
              totalOrders: supplier.totalOrders,
              successfulDeliveries: supplier.successfulDeliveries,
              failedDeliveries: supplier.failedDeliveries,
              onTimeDeliveryRate: supplier.onTimeDeliveryRate,
              averageDeliveryTime: supplier.averageDeliveryTime || null,
              totalPurchaseValue: supplier.totalPurchaseValue,
            }}
          />
        </div>

        {/* Right Column - Additional Information */}
        <div className="space-y-6">
          {/* Documents & Certifications */}
          <SupplierDocuments 
            supplier={{
              businessLicense: supplier.businessLicense || null,
              taxId: supplier.taxId || null,
              isHalalCertified: supplier.isHalalCertified,
              isFoodSafetyCertified: supplier.isFoodSafetyCertified,
              isISOCertified: supplier.isISOCertified,
              certifications: supplier.certifications,
              paymentTerms: supplier.paymentTerms,
              creditLimit: supplier.creditLimit || null,
              currency: supplier.currency,
              bankName: supplier.bankName || null,
              bankAccount: supplier.bankAccount || null,
              complianceStatus: supplier.complianceStatus,
              lastInspectionDate: supplier.lastInspectionDate || null,
              lastAuditDate: supplier.lastAuditDate || null,
              nextAuditDue: supplier.nextAuditDue || null,
              relationshipManager: supplier.relationshipManager || null,
            }}
          />
        </div>
      </div>

      {/* Procurement History Section */}
      <SupplierProcurements 
        supplierId={supplier.id}
        procurements={(supplier.procurements || []).map(p => ({
          id: p.id,
          procurementCode: p.procurementCode,
          procurementDate: p.procurementDate,
          totalAmount: p.totalAmount,
          status: p.status,
          actualDelivery: null, // Not available in list view
          paymentStatus: p.paymentStatus,
        }))}
      />
    </div>
  )
}

export default SupplierDetailPage
