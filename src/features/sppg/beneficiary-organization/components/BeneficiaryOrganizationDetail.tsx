/**
 * Beneficiary Organization Detail Page Orchestrator
 * Component-based architecture following enterprise patterns
 * 
 * @component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /.github/copilot-instructions.md} Component-Based Architecture Guidelines
 */

'use client'

import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDeleteBeneficiaryOrganization } from '../hooks/useBeneficiaryOrganizations'
import {
  BeneficiaryOrganizationDetailHeader,
  BeneficiaryOrganizationOverviewTab,
  BeneficiaryOrganizationEnrollmentsTab,
  BeneficiaryOrganizationDistributionsTab,
} from './detail'
import type { BeneficiaryOrganizationDetail as BeneficiaryOrganizationDetailType } from '../api/beneficiaryOrganizationApi'

interface BeneficiaryOrganizationDetailProps {
  organization: BeneficiaryOrganizationDetailType
}

export function BeneficiaryOrganizationDetail({
  organization,
}: BeneficiaryOrganizationDetailProps) {
  const router = useRouter()
  const { mutate: deleteOrganization, isPending: isDeleting } =
    useDeleteBeneficiaryOrganization()

  // Action Handlers
  const handleEdit = () => {
    router.push(`/beneficiary-organizations/${organization.id}/edit`)
  }

  const handleDelete = () => {
    deleteOrganization(organization.id, {
      onSuccess: () => {
        router.push('/beneficiary-organizations')
      },
    })
  }

  const handleBack = () => {
    router.push('/beneficiary-organizations')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Component */}
      <BeneficiaryOrganizationDetailHeader
        organization={organization}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBack={handleBack}
        isDeleting={isDeleting}
      />

      {/* Tabs with Tab Components */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="enrollments">
            Program ({organization.enrollments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="distributions">
            Distribusi ({organization.distributions?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <BeneficiaryOrganizationOverviewTab organization={organization} />
        </TabsContent>

        <TabsContent value="enrollments" className="mt-6">
          <BeneficiaryOrganizationEnrollmentsTab organization={organization} />
        </TabsContent>

        <TabsContent value="distributions" className="mt-6">
          <BeneficiaryOrganizationDistributionsTab organization={organization} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
