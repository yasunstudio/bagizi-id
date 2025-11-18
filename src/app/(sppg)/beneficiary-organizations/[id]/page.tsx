import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { beneficiaryOrganizationApi } from '@/features/sppg/beneficiary-organization/api/beneficiaryOrganizationApi'
import { BeneficiaryOrganizationDetail } from '@/features/sppg/beneficiary-organization/components/BeneficiaryOrganizationDetail'

export const metadata: Metadata = {
  title: 'Detail Organisasi Penerima Manfaat | Bagizi-ID',
  description: 'Detail organisasi penerima manfaat',
}

interface BeneficiaryOrganizationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BeneficiaryOrganizationDetailPage({
  params,
}: BeneficiaryOrganizationDetailPageProps) {
  const { id } = await params
  
  // CRITICAL: Extract cookie for SSR authentication
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined
  
  const result = await beneficiaryOrganizationApi.getById(id, requestHeaders)

  if (!result.success || !result.data) {
    notFound()
  }

  return <BeneficiaryOrganizationDetail organization={result.data} />
}
