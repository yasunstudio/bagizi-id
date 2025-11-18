/**
 * @fileoverview Beneficiary Organization List Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Building2 } from 'lucide-react'
import { BeneficiaryOrganizationType } from '@prisma/client'
import {
  useBeneficiaryOrganizations,
  useDeleteBeneficiaryOrganization,
  usePrefetchBeneficiaryOrganization,
} from '../../hooks'
import type { 
  BeneficiaryOrganizationFilters 
} from '../../types/beneficiaryOrganization.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface BeneficiaryOrganizationListProps {
  showCreateButton?: boolean
  onCreateClick?: () => void
  onEditClick?: (id: string) => void
}

export function BeneficiaryOrganizationList({
  showCreateButton = true,
  onCreateClick,
  onEditClick,
}: BeneficiaryOrganizationListProps) {
  const [filters, setFilters] = useState<BeneficiaryOrganizationFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    id: string
    name: string
  }>({ open: false, id: '', name: '' })

  const { data: organizations, isLoading } = useBeneficiaryOrganizations(filters)
  const { mutate: deleteOrganization, isPending: isDeleting } = useDeleteBeneficiaryOrganization()
  const prefetchOrganization = usePrefetchBeneficiaryOrganization()

  // Client-side filtering by search query
  const filteredOrganizations = organizations?.filter((org) => {
    const matchesSearch = !searchQuery || 
      org.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.organizationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const handleDelete = (id: string) => {
    const org = organizations?.find(o => o.id === id)
    setDeleteDialog({ open: true, id, name: org?.organizationName || '' })
  }

  const confirmDelete = () => {
    if (deleteDialog.id) {
      deleteOrganization(deleteDialog.id, {
        onSuccess: () => {
          setDeleteDialog({ open: false, id: '', name: '' })
        },
      })
    }
  }

  const getStatusBadge = (operationalStatus: string) => {
    switch (operationalStatus) {
      case 'ACTIVE':
        return <Badge variant="default">Aktif</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Tidak Aktif</Badge>
      case 'TEMPORARILY_CLOSED':
        return <Badge variant="outline">Tutup Sementara</Badge>
      default:
        return <Badge variant="outline">{operationalStatus}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SCHOOL':
        return <Badge variant="secondary">Sekolah</Badge>
      case 'HEALTH_FACILITY':
        return <Badge variant="secondary">Fasilitas Kesehatan</Badge>
      case 'INTEGRATED_SERVICE_POST':
        return <Badge variant="secondary">Posyandu</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organisasi Penerima Manfaat
              </CardTitle>
              <CardDescription>
                Kelola organisasi penerima manfaat program gizi
              </CardDescription>
            </div>
            {showCreateButton && (
              <Button onClick={onCreateClick}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Organisasi
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari organisasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  type: value === 'all' ? undefined : (value as BeneficiaryOrganizationType),
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="SCHOOL">Sekolah</SelectItem>
                <SelectItem value="HEALTH_FACILITY">Fasilitas Kesehatan</SelectItem>
                <SelectItem value="INTEGRATED_SERVICE_POST">Posyandu</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.operationalStatus || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  operationalStatus: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                <SelectItem value="TEMPORARILY_CLOSED">Tutup Sementara</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Menampilkan {filteredOrganizations?.length || 0} dari {organizations?.length || 0}{' '}
            organisasi
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Organisasi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations && filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map((org) => (
                    <TableRow
                      key={org.id}
                      onMouseEnter={() => prefetchOrganization(org.id)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-mono text-sm">
                        {org.organizationCode}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{org.organizationName}</div>
                          {org.address && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {org.address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(org.type)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {org.phone && <div>{org.phone}</div>}
                          {org.email && (
                            <div className="text-muted-foreground">{org.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(org.operationalStatus)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Buka menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/program/beneficiary-organizations/${org.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onEditClick?.(org.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(org.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery || filters.type || filters.operationalStatus
                        ? 'Tidak ada organisasi yang sesuai dengan filter'
                        : 'Belum ada organisasi penerima manfaat'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Organisasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus organisasi <strong>{deleteDialog.name}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
