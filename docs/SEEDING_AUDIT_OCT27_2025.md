# 📋 Database Seeding Audit - October 27, 2025

## ✅ Audit Summary

Semua file seeding telah diverifikasi dan diperbaiki agar konsisten dengan **SPPG DEMO-2025** yang terkait dengan akun `admin@demo.sppg.id`.

---

## 🎯 SPPG Target untuk Login `admin@demo.sppg.id`

**SPPG Code**: `DEMO-2025`  
**SPPG Name**: SPPG Demo Bagizi 2025  
**Email**: demo2025@bagizi.id  
**Description**: Demo Account untuk testing semua fitur sistem Bagizi-ID tahun 2025

### Detail SPPG Demo 2025:
- **Organization Type**: PEMERINTAH
- **Status**: ACTIVE
- **Is Demo Account**: ✅ TRUE
- **Demo Period**: January 1, 2025 - December 31, 2025
- **Target Recipients**: 1,000 penerima
- **Monthly Budget**: Rp 100,000,000
- **Yearly Budget**: Rp 1,200,000,000
- **Full Feature Access**: Semua fitur aktif untuk testing

---

## 🔧 File yang Diperbaiki

### 1. ✅ `prisma/seeds/inventory-seed.ts`
**Before**:
```typescript
const demoSppgId = 'cmh8pvzfm00vtsv4qmjig7xol' // ❌ Hardcoded ID salah
const sppg = await prisma.sPPG.findUnique({
  where: { id: demoSppgId }
})
```

**After**:
```typescript
const sppg = await prisma.sPPG.findUnique({
  where: { code: 'DEMO-2025' } // ✅ Query by code
})
```

### 2. ✅ `prisma/seeds/supplier-seed.ts`
**Before**:
```typescript
const demoSppgId = 'cmh8s1fqr00vusv3spq5dh2ig' // ❌ Hardcoded ID salah
const sppg = await prisma.sPPG.findUnique({
  where: { id: demoSppgId }
})

const suppliers = [
  { sppgId: demoSppgId, ... }, // ❌ Reference ke variable salah
  { sppgId: demoSppgId, ... },
  // ... 10 suppliers dengan sppgId salah
]
```

**After**:
```typescript
const sppg = await prisma.sPPG.findUnique({
  where: { code: 'DEMO-2025' } // ✅ Query by code
})

const suppliers = [
  { sppgId: sppg.id, ... }, // ✅ Dynamic reference
  { sppgId: sppg.id, ... },
  // ... 10 suppliers dengan sppgId benar
]
```

**Total Changes**: 10 suppliers diperbaiki

---

## 📁 File Seeding yang Sudah Benar (Tidak Perlu Diperbaiki)

### ✅ Core Seeds
1. **`sppg-seed.ts`** - Creates DEMO-2025 SPPG entity
   - Code: `DEMO-2025`
   - Name: SPPG Demo Bagizi 2025
   - Status: ACTIVE, Demo Account
   
2. **`user-seed.ts`** - Creates 16 demo users
   - Platform Admins: 3 users (superadmin@bagizi.id, support@bagizi.id, analyst@bagizi.id)
   - SPPG Admins: 2 users (kepala@demo.sppg.id, **admin@demo.sppg.id** ✅)
   - SPPG Staff: 11 users (ahligizi, akuntan, produksi, distribusi, hrd, dapur, dll)
   - All users connected to `sppgs.find(s => s.code === 'DEMO-2025')`

3. **`regional-seed.ts`** - Regional data (Purwakarta, Jawa Barat)

4. **`nutrition-seed.ts`** - Nutrition standards

5. **`allergen-seed.ts`** - Allergen master data

### ✅ Domain Seeds (All reference DEMO-2025 correctly)
6. **`menu-seed.ts`** - Menu domain data
   ```typescript
   const purwakartaSppg = sppgs.find(s => s.code === 'DEMO-2025') ✅
   ```

7. **`schools-seed.ts`** - School beneficiaries

8. **`menu-planning-seed.ts`** - Menu planning
   ```typescript
   const purwakartaSppg = sppgs.find(s => s.code === 'DEMO-2025') ✅
   const adminUser = users.find(u => u.email === 'admin@demo.sppg.id') ✅
   ```

9. **`hrd-seed.ts`** - HRD domain (departments, positions, employees)
   ```typescript
   const demoSppg = sppgs.find(s => s.code === 'DEMO-2025') ✅
   Employee reference: 'EMP-DEMO-2025-001' to 'EMP-DEMO-2025-008' ✅
   ```

10. **`procurement-seed.ts`** - Procurement domain
    ```typescript
    const sppg = sppgs.find(s => s.code === 'DEMO-2025') ✅
    ```

11. **`production-seed.ts`** - Production domain
    ```typescript
    const sppg = sppgs.find(s => s.code === 'DEMO-2025') ✅
    ```

12. **`vehicle-seed.ts`** - Vehicle data
    ```typescript
    const sppg = sppgs.find(s => s.code === 'DEMO-2025') ✅
    ```

13. **`distribution-seed.ts`** - Distribution domain
    ```typescript
    const sppg = sppgs.find(s => s.code === 'DEMO-2025') ✅
    ```

14. **`demo-requests-seed.ts`** - Demo requests

---

## 🔐 User Credentials untuk Testing

### Platform Level (No SPPG)
| Email | Role | Password |
|-------|------|----------|
| superadmin@bagizi.id | PLATFORM_SUPERADMIN | demo2025 |
| support@bagizi.id | PLATFORM_SUPPORT | demo2025 |
| analyst@bagizi.id | PLATFORM_ANALYST | demo2025 |

### SPPG Level (Connected to DEMO-2025)
| Email | Role | Password | Department |
|-------|------|----------|-----------|
| kepala@demo.sppg.id | SPPG_KEPALA | demo2025 | Management |
| **admin@demo.sppg.id** ✅ | **SPPG_ADMIN** | **demo2025** | **Management** |
| ahligizi@demo.sppg.id | SPPG_AHLI_GIZI | demo2025 | Nutrition |
| akuntan@demo.sppg.id | SPPG_AKUNTAN | demo2025 | Finance |
| produksi@demo.sppg.id | SPPG_PRODUKSI_MANAGER | demo2025 | Production |
| distribusi@demo.sppg.id | SPPG_DISTRIBUSI_MANAGER | demo2025 | Distribution |
| hrd@demo.sppg.id | SPPG_HRD_MANAGER | demo2025 | Management |
| dapur@demo.sppg.id | SPPG_STAFF_DAPUR | demo2025 | Production |
| staffdistribusi@demo.sppg.id | SPPG_STAFF_DISTRIBUSI | demo2025 | Distribution |
| staffadmin@demo.sppg.id | SPPG_STAFF_ADMIN | demo2025 | Management |
| qc@demo.sppg.id | SPPG_STAFF_QC | demo2025 | Quality Control |

---

## 🚀 Testing Instructions

### 1. Reset dan Seed Database
```bash
# Reset database dan seed ulang
npm run db:reset

# Atau manual
npx prisma migrate reset --force
npx tsx prisma/seed.ts
```

### 2. Login dengan Admin Demo
```
URL: http://localhost:3000/login
Email: admin@demo.sppg.id
Password: demo2025
```

### 3. Verifikasi Data
Setelah login dengan `admin@demo.sppg.id`, pastikan:
- ✅ Dashboard menampilkan data SPPG Demo Bagizi 2025
- ✅ Menu management menampilkan menu yang benar
- ✅ Inventory menampilkan stok bahan baku
- ✅ Procurement menampilkan 10 suppliers
- ✅ Production menampilkan data produksi
- ✅ Distribution menampilkan data distribusi
- ✅ HRD menampilkan 6 departments, 15 positions, 8 employees

---

## 📊 Expected Data Counts (DEMO-2025)

| Entity | Count | Notes |
|--------|-------|-------|
| SPPG | 1 | DEMO-2025 |
| Users | 14 | All connected to DEMO-2025 |
| Departments | 6 | Management, Finance, Nutrition, Production, Distribution, QC |
| Positions | 15 | Various positions |
| Employees | 8 | EMP-DEMO-2025-001 to 008 |
| Inventory Items | ~100+ | Complete with nutrition data |
| Suppliers | 10 | SUP-00001 to SUP-00010 |
| Nutrition Programs | 2 | PWK-PMAS-2025, PWK-PSM-2025 |
| Nutrition Menus | 10 | Complete with ingredients |
| Schools | Multiple | With beneficiaries |
| Menu Plans | Multiple | With assignments |
| Procurements | Multiple | With items |
| Productions | Multiple | With details |
| Distributions | Multiple | With deliveries |
| Vehicles | Multiple | For distribution |

---

## ✅ Verification Checklist

- [x] SPPG seed creates DEMO-2025 with correct data
- [x] User seed connects all SPPG users to DEMO-2025
- [x] Inventory seed queries DEMO-2025 by code (not hardcoded ID)
- [x] Supplier seed queries DEMO-2025 by code (not hardcoded ID)
- [x] All suppliers reference sppg.id correctly
- [x] Menu seed references DEMO-2025 correctly
- [x] HRD seed references DEMO-2025 correctly
- [x] Procurement seed references DEMO-2025 correctly
- [x] Production seed references DEMO-2025 correctly
- [x] Distribution seed references DEMO-2025 correctly
- [x] Vehicle seed references DEMO-2025 correctly
- [x] Menu planning references admin@demo.sppg.id correctly

---

## 🎉 Result

✅ **All seeding files are now consistent!**

Semua data seeding sekarang akan:
1. Create SPPG dengan code `DEMO-2025`
2. Connect semua users ke SPPG DEMO-2025 (termasuk admin@demo.sppg.id)
3. Create inventory items untuk SPPG DEMO-2025
4. Create suppliers untuk SPPG DEMO-2025
5. Create semua domain data (menu, procurement, production, distribution) untuk SPPG DEMO-2025

Ketika database di-reset dan seed ulang, login dengan `admin@demo.sppg.id` akan menampilkan semua data yang benar!

---

**Audit Date**: October 27, 2025  
**Audited By**: GitHub Copilot  
**Status**: ✅ COMPLETE
