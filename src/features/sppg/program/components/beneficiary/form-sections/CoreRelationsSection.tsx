/**
 * @fileoverview Section 1: Organisasi & Program
 * Form section untuk memilih organisasi penerima manfaat dan program gizi
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { FORM_LABELS } from '../../../lib/enrollmentFormLabels'
import { CreateBeneficiaryEnrollmentInput } from '../../../schemas/beneficiaryEnrollmentSchema'

interface CoreRelationsSectionProps {
  form: UseFormReturn<CreateBeneficiaryEnrollmentInput>
  organizations: Array<{ 
    id: string
    organizationName: string
    organizationCode: string
    type: string
  }>
  programs: Array<{ 
    id: string
    name: string
    programCode: string
    programType: string
  }>
  isLoadingOrgs?: boolean
  isLoadingPrograms?: boolean
}

export function CoreRelationsSection({
  form,
  organizations,
  programs,
  isLoadingOrgs,
  isLoadingPrograms,
}: CoreRelationsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {FORM_LABELS.sections.coreRelations}
          </h3>
          <p className="text-sm text-muted-foreground">
            Pilih organisasi dan program yang akan didaftarkan
          </p>
        </div>
      </div>

      {/* Beneficiary Organization Field */}
      <FormField
        control={form.control}
        name="beneficiaryOrgId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {FORM_LABELS.beneficiaryOrg.label} *
            </FormLabel>
            <Select
              disabled={isLoadingOrgs}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingOrgs
                        ? FORM_LABELS.beneficiaryOrg.loading
                        : FORM_LABELS.beneficiaryOrg.placeholder
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {organizations.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    {FORM_LABELS.beneficiaryOrg.empty}
                  </div>
                ) : (
                  organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{org.organizationName}</span>
                        <span className="text-xs text-muted-foreground">
                          {org.organizationCode} • {org.type}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              {FORM_LABELS.beneficiaryOrg.description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Program Field */}
      <FormField
        control={form.control}
        name="programId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {FORM_LABELS.program.label} *
            </FormLabel>
            <Select
              disabled={isLoadingPrograms}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingPrograms
                        ? FORM_LABELS.program.loading
                        : FORM_LABELS.program.placeholder
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {programs.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    {FORM_LABELS.program.empty}
                  </div>
                ) : (
                  programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{program.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {program.programCode} • {program.programType}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              {FORM_LABELS.program.description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
