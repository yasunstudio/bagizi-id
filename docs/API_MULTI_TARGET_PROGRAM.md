# API Documentation: Multi-Target Program Features

**Version**: 1.0.0  
**Date**: November 7, 2025  
**Author**: Bagizi-ID Development Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Program Configuration Types](#program-configuration-types)
3. [Target Groups Reference](#target-groups-reference)
4. [API Endpoints](#api-endpoints)
   - [POST /api/sppg/program](#post-apisppgprogram)
   - [PUT /api/sppg/program/:id](#put-apisppgprogramid)
   - [POST /api/sppg/beneficiary-enrollments](#post-apisppgbeneficiary-enrollments)
5. [Validation Errors](#validation-errors)
6. [Migration Guide](#migration-guide)
7. [Examples](#examples)

---

## Overview

Multi-Target Program architecture memungkinkan satu program gizi untuk melayani **multiple target groups** (kelompok penerima manfaat) secara bersamaan, atau dibatasi hanya untuk **specific target groups** tertentu.

### Key Features

- ✅ **Multi-target unrestricted**: Program dapat menerima semua 6 kelompok penerima manfaat
- ✅ **Multi-target restricted**: Program hanya menerima kelompok tertentu yang ditentukan
- ✅ **Single-target**: Program hanya untuk satu kelompok penerima manfaat saja
- ✅ **Validation**: Automatic validation saat create program dan enrollment
- ✅ **Backward Compatible**: Legacy `targetGroup` field masih didukung

### Database Schema

```prisma
model NutritionProgram {
  // Multi-target fields (NEW)
  isMultiTarget       Boolean       @default(true)
  allowedTargetGroups TargetGroup[] @default([])
  primaryTargetGroup  TargetGroup?  // Optional for UI display
  
  // Legacy field (backward compatibility)
  targetGroup         TargetGroup?  // Deprecated, use above fields
}
```

---

## Program Configuration Types

### 1. Multi-Target Unrestricted (Default)

Program menerima **semua** kelompok penerima manfaat (6 kelompok).

**Configuration**:
```json
{
  "isMultiTarget": true,
  "allowedTargetGroups": [],
  "primaryTargetGroup": null // Optional
}
```

**Allowed Enrollments**: 
- ✅ SCHOOL_CHILDREN
- ✅ PREGNANT_WOMAN
- ✅ BREASTFEEDING_MOTHER
- ✅ TODDLER
- ✅ TEENAGE_GIRL
- ✅ ELDERLY

**Use Case**: Program gizi komprehensif yang melayani semua kelompok masyarakat.

---

### 2. Multi-Target Restricted

Program hanya menerima **kelompok tertentu** yang ditentukan dalam `allowedTargetGroups`.

**Configuration**:
```json
{
  "isMultiTarget": true,
  "allowedTargetGroups": [
    "PREGNANT_WOMAN",
    "BREASTFEEDING_MOTHER",
    "TODDLER"
  ],
  "primaryTargetGroup": "PREGNANT_WOMAN" // Optional, for UI display
}
```

**Allowed Enrollments**: 
- ✅ PREGNANT_WOMAN
- ✅ BREASTFEEDING_MOTHER
- ✅ TODDLER
- ❌ SCHOOL_CHILDREN (rejected)
- ❌ TEENAGE_GIRL (rejected)
- ❌ ELDERLY (rejected)

**Use Case**: Program gizi khusus Ibu dan Anak (KIA).

---

### 3. Single-Target

Program **hanya untuk satu kelompok** penerima manfaat saja.

**Configuration**:
```json
{
  "isMultiTarget": false,
  "allowedTargetGroups": [], // Must be empty
  "primaryTargetGroup": "SCHOOL_CHILDREN" // Required
}
```

**Allowed Enrollments**: 
- ✅ SCHOOL_CHILDREN only
- ❌ All other groups rejected

**Use Case**: Program Makan Siang Anak Sekolah (PMAS).

---

## Target Groups Reference

### Enum Values & Indonesian Labels

| Enum Value | Label Indonesia | Deskripsi |
|------------|----------------|-----------|
| `SCHOOL_CHILDREN` | Anak Sekolah | Anak usia sekolah (6-12 tahun) |
| `PREGNANT_WOMAN` | Ibu Hamil | Ibu dalam masa kehamilan |
| `BREASTFEEDING_MOTHER` | Ibu Menyusui | Ibu dalam masa menyusui |
| `TODDLER` | Balita | Anak usia di bawah lima tahun |
| `TEENAGE_GIRL` | Remaja Putri | Remaja putri usia 13-18 tahun |
| `ELDERLY` | Lansia | Lanjut usia (>60 tahun) |

---

## API Endpoints

### POST /api/sppg/program

Create new nutrition program dengan multi-target configuration.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

#### Request Body

**Multi-Target Unrestricted Example**:
```json
{
  "name": "Program Makanan Bergizi Komprehensif",
  "programCode": "PROG-PMB-2025",
  "description": "Program gizi untuk semua kelompok masyarakat",
  "programType": "SUPPLEMENTARY_FEEDING",
  "status": "ACTIVE",
  
  // Multi-target configuration
  "isMultiTarget": true,
  "allowedTargetGroups": [],
  "primaryTargetGroup": null,
  
  // Schedule
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "feedingDays": [1, 2, 3, 4, 5], // Monday-Friday
  "mealsPerDay": 1,
  
  // Budget
  "totalBudget": 500000000,
  "budgetPerMeal": 8500,
  "targetRecipients": 1000,
  
  // Implementation
  "implementationArea": "Kota Purwakarta"
}
```

**Multi-Target Restricted Example**:
```json
{
  "name": "Program Gizi Ibu dan Anak",
  "programCode": "PROG-KIA-2025",
  "description": "Program khusus ibu hamil, menyusui, dan balita",
  "programType": "SUPPLEMENTARY_FEEDING",
  "status": "ACTIVE",
  
  // Multi-target restricted configuration
  "isMultiTarget": true,
  "allowedTargetGroups": [
    "PREGNANT_WOMAN",
    "BREASTFEEDING_MOTHER",
    "TODDLER"
  ],
  "primaryTargetGroup": "PREGNANT_WOMAN",
  
  "startDate": "2025-01-01",
  "feedingDays": [1, 2, 3, 4, 5],
  "mealsPerDay": 2,
  "totalBudget": 300000000,
  "budgetPerMeal": 10000,
  "targetRecipients": 500,
  "implementationArea": "Kecamatan Purwakarta"
}
```

**Single-Target Example**:
```json
{
  "name": "Program Makan Siang Anak Sekolah",
  "programCode": "PROG-PMAS-2025",
  "description": "Program makan siang khusus anak sekolah",
  "programType": "SCHOOL_FEEDING",
  "status": "ACTIVE",
  
  // Single-target configuration
  "isMultiTarget": false,
  "allowedTargetGroups": [],
  "primaryTargetGroup": "SCHOOL_CHILDREN",
  
  "startDate": "2025-01-01",
  "feedingDays": [1, 2, 3, 4, 5],
  "mealsPerDay": 1,
  "totalBudget": 200000000,
  "budgetPerMeal": 7500,
  "targetRecipients": 800,
  "implementationArea": "SD Negeri 1 Purwakarta"
}
```

#### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "cm3k5l6m7n8o9p0q1r2s3t4u",
    "name": "Program Makanan Bergizi Komprehensif",
    "programCode": "PROG-PMB-2025",
    "sppgId": "cm3abc123...",
    
    // Multi-target fields
    "isMultiTarget": true,
    "allowedTargetGroups": [],
    "primaryTargetGroup": null,
    "targetGroup": null,
    
    "status": "ACTIVE",
    "targetRecipients": 1000,
    "currentRecipients": 0,
    "createdAt": "2025-11-07T10:30:00.000Z",
    "updatedAt": "2025-11-07T10:30:00.000Z",
    
    "sppg": {
      "id": "cm3abc123...",
      "name": "SPPG Purwakarta",
      "code": "SPPG-PWK-001"
    }
  }
}
```

#### Error Responses

**400 Bad Request - Validation Failed**:
```json
{
  "error": "Program single-target harus memiliki primaryTargetGroup"
}
```

```json
{
  "error": "Program single-target tidak boleh memiliki allowedTargetGroups"
}
```

```json
{
  "error": "Tidak boleh ada duplikasi target group dalam allowedTargetGroups"
}
```

**403 Forbidden - Insufficient Permissions**:
```json
{
  "error": "Insufficient permissions"
}
```

**403 Forbidden - SPPG Not Active**:
```json
{
  "error": "SPPG not found or inactive"
}
```

---

### PUT /api/sppg/program/:id

Update existing program (same validation rules apply).

#### Request Body (Partial Update)
```json
{
  "isMultiTarget": false,
  "primaryTargetGroup": "TODDLER",
  "allowedTargetGroups": []
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "cm3k5l6m7n8o9p0q1r2s3t4u",
    "isMultiTarget": false,
    "primaryTargetGroup": "TODDLER",
    "allowedTargetGroups": [],
    // ... other fields
  }
}
```

---

### POST /api/sppg/beneficiary-enrollments

Create enrollment dengan automatic target group validation.

#### Request Body
```json
{
  "programId": "cm3k5l6m7n8o9p0q1r2s3t4u",
  "beneficiaryOrgId": "cm3xyz789...",
  "targetGroup": "PREGNANT_WOMAN",
  "enrolledCount": 50,
  "enrollmentStatus": "ACTIVE",
  "startDate": "2025-01-01",
  "deliveryAddress": "Posyandu Melati 1",
  "deliveryContact": "0812-3456-7890",
  "isPriority": false
}
```

#### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "cm3enr123...",
    "programId": "cm3k5l6m7n8o9p0q1r2s3t4u",
    "beneficiaryOrgId": "cm3xyz789...",
    "targetGroup": "PREGNANT_WOMAN",
    "enrolledCount": 50,
    "enrollmentStatus": "ACTIVE",
    // ... other fields
  }
}
```

#### Error Response (400 Bad Request)

**Target Group Not Allowed**:
```json
{
  "error": "Target group ELDERLY tidak diizinkan untuk program ini. Program ini hanya mengizinkan: Ibu Hamil, Ibu Menyusui, Balita"
}
```

**Single-Target Mismatch**:
```json
{
  "error": "Program single-target ini hanya untuk Anak Sekolah. Target group PREGNANT_WOMAN tidak diizinkan."
}
```

---

## Validation Errors

### Program Configuration Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `Program single-target harus memiliki primaryTargetGroup` | Creating single-target program without `primaryTargetGroup` | Set `primaryTargetGroup` to one of the target groups |
| `Program single-target tidak boleh memiliki allowedTargetGroups` | Creating single-target program with non-empty `allowedTargetGroups` | Set `allowedTargetGroups` to `[]` for single-target |
| `Tidak boleh ada duplikasi target group dalam allowedTargetGroups` | Duplicate values in `allowedTargetGroups` array | Remove duplicate values from array |

### Enrollment Validation Errors

| Error Message Pattern | Cause | Solution |
|-----------------------|-------|----------|
| `Target group {X} tidak diizinkan untuk program ini. Program ini hanya mengizinkan: {list}` | Enrolling target group not in `allowedTargetGroups` | Choose a target group from the allowed list |
| `Program single-target ini hanya untuk {X}. Target group {Y} tidak diizinkan.` | Enrolling target group different from `primaryTargetGroup` | Use the program's `primaryTargetGroup` |
| `Program single-target dengan primaryTargetGroup tidak boleh kosong` | Program configuration invalid | Fix program configuration first |

---

## Migration Guide

### Migrating from Legacy Single-Target

**Before (Legacy)**:
```json
{
  "targetGroup": "SCHOOL_CHILDREN"
}
```

**After (Multi-Target)**:
```json
{
  "isMultiTarget": false,
  "primaryTargetGroup": "SCHOOL_CHILDREN",
  "allowedTargetGroups": [],
  "targetGroup": "SCHOOL_CHILDREN" // Optional for backward compatibility
}
```

### Converting to Multi-Target

**Scenario**: Expand existing single-target program to accept multiple groups.

**Step 1 - Current Configuration**:
```json
{
  "isMultiTarget": false,
  "primaryTargetGroup": "SCHOOL_CHILDREN",
  "allowedTargetGroups": []
}
```

**Step 2 - Update to Multi-Target Restricted**:
```json
{
  "isMultiTarget": true,
  "allowedTargetGroups": [
    "SCHOOL_CHILDREN",
    "TODDLER",
    "TEENAGE_GIRL"
  ],
  "primaryTargetGroup": "SCHOOL_CHILDREN"
}
```

**Step 3 - Or Update to Multi-Target Unrestricted**:
```json
{
  "isMultiTarget": true,
  "allowedTargetGroups": [],
  "primaryTargetGroup": "SCHOOL_CHILDREN" // For UI display
}
```

---

## Examples

### Example 1: Create Multi-Target Program with Validation

```bash
curl -X POST https://api.bagizi.id/api/sppg/program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Program Gizi Keluarga Sejahtera",
    "programCode": "PROG-GKS-2025",
    "programType": "SUPPLEMENTARY_FEEDING",
    "isMultiTarget": true,
    "allowedTargetGroups": [
      "PREGNANT_WOMAN",
      "BREASTFEEDING_MOTHER",
      "TODDLER",
      "ELDERLY"
    ],
    "primaryTargetGroup": "PREGNANT_WOMAN",
    "status": "ACTIVE",
    "startDate": "2025-01-01",
    "feedingDays": [1,2,3,4,5],
    "mealsPerDay": 2,
    "totalBudget": 400000000,
    "targetRecipients": 600,
    "implementationArea": "Kota Purwakarta"
  }'
```

### Example 2: Enroll with Target Group Validation

```bash
# This will succeed (PREGNANT_WOMAN is in allowedTargetGroups)
curl -X POST https://api.bagizi.id/api/sppg/beneficiary-enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "programId": "cm3k5l6m7n8o9p0q1r2s3t4u",
    "beneficiaryOrgId": "cm3xyz789...",
    "targetGroup": "PREGNANT_WOMAN",
    "enrolledCount": 30,
    "enrollmentStatus": "ACTIVE",
    "startDate": "2025-01-01"
  }'

# This will fail (SCHOOL_CHILDREN not in allowedTargetGroups)
curl -X POST https://api.bagizi.id/api/sppg/beneficiary-enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "programId": "cm3k5l6m7n8o9p0q1r2s3t4u",
    "beneficiaryOrgId": "cm3xyz789...",
    "targetGroup": "SCHOOL_CHILDREN",
    "enrolledCount": 20,
    "enrollmentStatus": "ACTIVE",
    "startDate": "2025-01-01"
  }'

# Response:
# {
#   "error": "Target group SCHOOL_CHILDREN tidak diizinkan untuk program ini. Program ini hanya mengizinkan: Ibu Hamil, Ibu Menyusui, Balita, Lansia"
# }
```

### Example 3: Query Programs by Configuration Type

```bash
# Get all multi-target programs
curl -X GET 'https://api.bagizi.id/api/sppg/program?isMultiTarget=true' \
  -H "Authorization: Bearer {token}"

# Get all single-target programs for specific group
curl -X GET 'https://api.bagizi.id/api/sppg/program?isMultiTarget=false&primaryTargetGroup=SCHOOL_CHILDREN' \
  -H "Authorization: Bearer {token}"
```

---

## Best Practices

### 1. Always Use Validation Helper Functions

```typescript
import { validateEnrollmentTargetGroup, getAllowedTargetGroups } from '@/lib/programValidation'

// Before creating enrollment, check if target group is allowed
const program = await getProgram(programId)
const validation = validateEnrollmentTargetGroup(program, targetGroup)

if (!validation.valid) {
  showError(validation.error)
  return
}

// Show allowed options in UI
const allowedGroups = getAllowedTargetGroups(program)
const options = allowedGroups.map(group => ({
  value: group,
  label: getTargetGroupLabel(group)
}))
```

### 2. Display Configuration in UI

```typescript
import { getProgramTypeDisplay, getTargetGroupConfiguration } from '@/lib/programValidation'

// Show program type badge
const typeDisplay = getProgramTypeDisplay(program)
// → "Multi-target (3 Kelompok)" or "Single-target (Anak Sekolah)"

// Show detailed configuration
const configText = getTargetGroupConfiguration(program)
// → "Program ini hanya menerima kelompok penerima manfaat berikut: Ibu Hamil, Balita"
```

### 3. Handle Validation Errors Gracefully

```typescript
try {
  const enrollment = await createEnrollment(data)
  showSuccess('Enrollment berhasil dibuat')
} catch (error) {
  if (error.status === 400) {
    // Validation error - show to user
    showError(error.message)
  } else {
    // Server error - log and show generic message
    console.error(error)
    showError('Terjadi kesalahan server')
  }
}
```

---

## Support

Untuk pertanyaan atau issue terkait Multi-Target Program features:

- **Documentation**: `/docs/PROGRAM_MULTI_TARGET_IMPLEMENTATION_ROADMAP.md`
- **Phase 2 Details**: `/docs/PHASE_2_BACKEND_API_COMPLETE.md`
- **Validation Helper**: `/src/lib/programValidation.ts`
- **Email**: dev@bagizi.id
- **GitHub Issues**: https://github.com/bagizi-id/bagizi-id/issues

---

**Last Updated**: November 7, 2025  
**API Version**: 1.0.0  
**Schema Version**: Phase 2 Complete
