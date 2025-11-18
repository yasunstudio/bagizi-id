# 📦 Procurement Seed Data - Realistic & Easy to Understand

## 🎯 Tujuan Pembaruan

Data seed procurement yang lama **terlalu kompleks dan membingungkan** untuk dipahami. Pembaruan ini membuat data seed yang:

✅ **REALISTIS** - Sesuai dengan skenario nyata SPPG  
✅ **MUDAH DIPAHAMI** - Cerita yang jelas dari awal sampai akhir  
✅ **MASUK AKAL** - Budget, harga, dan timeline yang logis  
✅ **LENGKAP** - Berbagai status procurement order untuk testing

---

## 📊 Struktur Procurement Plans (3 Bulan)

### 1. **Plan Oktober 2025 (COMPLETED)** ✅
**Status:** APPROVED - Sudah selesai dijalankan

```typescript
{
  planMonth: "2025-10",
  totalBudget: Rp 100.000.000,
  usedBudget: Rp 98.500.000 (98.5%),
  remainingBudget: Rp 1.500.000 (sisa sedikit),
  targetRecipients: 200 anak,
  targetMeals: 4.400 porsi (200 anak x 22 hari),
  costPerMeal: Rp 22.727 per porsi,
  approvalStatus: "APPROVED"
}
```

**Pembagian Budget:**
- 40% (Rp 40jt) untuk **Protein** (ayam, telur, ikan)
- 30% (Rp 30jt) untuk **Karbohidrat** (beras, roti)
- 20% (Rp 20jt) untuk **Sayuran**
- 10% (Rp 10jt) untuk **Buah-buahan**
- 10% (Rp 10jt) untuk **Emergency Buffer**

**Cerita:** Bulan Oktober sudah lewat, budget hampir habis semua (98.5%), hanya sisa Rp 1.5jt. Ini untuk referensi historis bahwa sistem berjalan dengan baik bulan lalu.

---

### 2. **Plan November 2025 (ACTIVE)** 🟢 **PALING PENTING!**
**Status:** APPROVED - Sedang berjalan (minggu ke-2)

```typescript
{
  planMonth: "2025-11",
  totalBudget: Rp 110.000.000 (naik 10% dari Oktober),
  usedBudget: Rp 45.000.000 (40.9%),
  remainingBudget: Rp 65.000.000 (59.1%),
  targetRecipients: 200 anak,
  targetMeals: 4.400 porsi,
  costPerMeal: Rp 25.000 per porsi (naik karena inflasi),
  approvalStatus: "APPROVED"
}
```

**Pembagian Budget:**
- 40% (Rp 44jt) untuk **Protein**
- 30% (Rp 33jt) untuk **Karbohidrat**
- 20% (Rp 22jt) untuk **Sayuran**
- 10% (Rp 11jt) untuk **Buah-buahan**
- 10% (Rp 11jt) untuk **Emergency Buffer**

**Cerita:** Ini adalah bulan yang sedang berjalan! Budget baru terpakai 40.9% karena baru minggu ke-2 November. Masih banyak sisa untuk 2 minggu ke depan. Ini adalah plan yang paling sering digunakan untuk testing CRUD operations.

**Kenapa Naik 10%?**
- Inflasi harga bahan pangan
- Kenaikan harga ayam dan sayuran
- Cost per meal naik dari Rp 22.727 → Rp 25.000

---

### 3. **Plan Desember 2025 (DRAFT)** 📝
**Status:** DRAFT - Masih dalam perencanaan

```typescript
{
  planMonth: "2025-12",
  totalBudget: Rp 115.000.000 (naik lagi untuk akhir tahun),
  usedBudget: Rp 0 (belum digunakan),
  remainingBudget: Rp 115.000.000 (semua masih tersedia),
  targetRecipients: 200 anak,
  targetMeals: 3.600 porsi (200 x 18 hari, karena libur),
  costPerMeal: Rp 31.944 per porsi,
  approvalStatus: "DRAFT"
}
```

**Cerita:** Plan untuk Desember masih draft karena:
- Menunggu konfirmasi menu
- Desember ada libur panjang (hanya 18 hari kerja)
- Harga akhir tahun biasanya lebih tinggi
- Belum ada approval dari Kepala SPPG

---

## 🛒 Procurement Orders (6 Skenario Realistis)

Semua order ini terhubung ke **Plan November 2025** (yang sedang aktif).

### Order 1: ✅ **COMPLETED** (Minggu Lalu)
```typescript
{
  procurementCode: "PO-NOV-2025-001",
  status: "COMPLETED",
  supplier: "CV Berkah Protein Nusantara",
  items: "100 ekor Ayam Kampung @ Rp 85.000",
  totalAmount: Rp 8.500.000,
  paidAmount: Rp 8.500.000,
  paymentStatus: "PAID",
  
  // Timeline
  procurementDate: 7 hari lalu,
  expectedDelivery: 5 hari lalu,
  actualDelivery: 5 hari lalu (TEPAT WAKTU!),
  
  // Quality
  qualityGrade: "EXCELLENT",
  qualityNotes: "Ayam segar, berat 1-1.2kg, tidak ada cacat"
}
```

**Cerita:** Order sukses! Pesan 100 ekor ayam minggu lalu, sampai tepat waktu, kualitas bagus, sudah dibayar lunas. Ini adalah success story - everything went perfectly! 🎉

---

### Order 2: 📦 **IN DELIVERY** (Hari Ini)
```typescript
{
  procurementCode: "PO-NOV-2025-002",
  status: "ORDERED",
  deliveryStatus: "SHIPPED",
  supplier: "CV Sayur Segar Purwakarta",
  items: [
    "25 kg Bayam @ Rp 8.000",
    "30 kg Wortel @ Rp 12.000",
    "20 kg Tomat @ Rp 15.000",
    "15 kg Kangkung @ Rp 6.000"
  ],
  totalAmount: Rp 900.000 (setelah diskon Rp 50rb),
  paymentStatus: "UNPAID" (COD),
  
  // Timeline
  procurementDate: Kemarin,
  expectedDelivery: Hari ini,
  qualityNotes: "Dalam pengiriman - dijemput pagi jam 06:00"
}
```

**Cerita:** Sayuran sedang dalam perjalanan! Order kemarin, expected sampai hari ini. Bayar nanti saat terima barang (COD). User bisa test scenario "terima barang" dan "bayar COD". 📦

---

### Order 3: ✅ **APPROVED** (Besok Delivery)
```typescript
{
  procurementCode: "PO-NOV-2025-003",
  status: "APPROVED",
  deliveryStatus: "CONFIRMED",
  supplier: "CV Beras Sumber Rejeki",
  items: "4 karung Beras Premium (200 kg) @ Rp 1.5jt",
  totalAmount: Rp 6.100.000 (termasuk ongkir Rp 100rb),
  paymentTerms: "NET_15" (bayar dalam 15 hari),
  
  // Timeline
  expectedDelivery: Besok,
  qualityNotes: "Order dikonfirmasi supplier - ready besok pagi"
}
```

**Cerita:** Order beras untuk 1 bulan sudah approved! 200 kg beras = ~1000 porsi nasi. Delivery besok pagi. Ini contract order dengan supplier tetap. Payment dalam 15 hari. 🍚

---

### Order 4: ⏳ **PENDING APPROVAL** (Butuh Persetujuan)
```typescript
{
  procurementCode: "PO-NOV-2025-004",
  status: "PENDING_APPROVAL",
  supplier: "CV Sumber Susu Murni",
  items: [
    "100 liter Susu UHT @ Rp 14.000",
    "50 cup Yogurt @ Rp 8.000",
    "10 pack Keju @ Rp 30.000"
  ],
  totalAmount: Rp 2.100.000,
  qualityNotes: "Menunggu approval Kepala SPPG - budget tinggi"
}
```

**Cerita:** Order susu & olahan menunggu approval karena nilai tinggi. Kepala SPPG harus review dan approve dulu. User bisa test approval workflow! ⏳

---

### Order 5: 📝 **DRAFT** (Masih Rencana)
```typescript
{
  procurementCode: "PO-NOV-2025-005-DRAFT",
  status: "DRAFT",
  supplier: "CV Berkah Protein",
  items: [
    "100 kg Telur @ Rp 28.000",
    "30 kg Ikan Lele @ Rp 35.000",
    "40 bungkus Tempe @ Rp 16.000"
  ],
  totalAmount: Rp 4.500.000 (estimasi),
  qualityNotes: "Draft - belum dikonfirmasi ke supplier"
}
```

**Cerita:** Masih rencana untuk minggu depan. Belum final, bisa diedit, belum konfirmasi ke supplier. User bisa test edit draft order! 📝

---

### Order 6: ❌ **CANCELLED** (Dibatalkan)
```typescript
{
  procurementCode: "PO-NOV-2025-006-CANCELLED",
  status: "CANCELLED",
  supplier: "Toko Bumbu Lengkap",
  items: "20 kg Bawang Merah @ Rp 25.000",
  totalAmount: Rp 0 (cancelled),
  rejectionReason: "Supplier kehabisan stok - ganti supplier lain"
}
```

**Cerita:** Order gagal! Supplier tidak bisa memenuhi karena stok habis. Lesson learned - harus cari supplier backup. User bisa lihat kenapa order bisa cancelled. ❌

---

## 💡 Kenapa Data Ini Lebih Baik?

### ❌ **Masalah Data Lama:**
1. Hanya 1 plan, tidak ada konteks historis
2. Budget tidak realistis (Rp 50jt untuk 200 anak x 22 hari = Rp 11.000/porsi terlalu murah!)
3. Tidak ada cerita yang jelas (kenapa status ini?)
4. Item procurement tidak spesifik
5. Timeline membingungkan

### ✅ **Keunggulan Data Baru:**

1. **3 Plans dengan Timeline Jelas**
   - Oktober (COMPLETED) = Historis
   - November (ACTIVE) = Sedang berjalan
   - Desember (DRAFT) = Planning

2. **Budget yang Realistis**
   - Rp 25.000 per porsi (wajar untuk makanan bergizi)
   - Pembagian 40% protein, 30% carb, 20% sayur, 10% buah
   - Emergency buffer 10%

3. **6 Skenario Lengkap**
   - ✅ COMPLETED: Sudah selesai & bayar
   - 📦 IN DELIVERY: Sedang dalam perjalanan
   - ✅ APPROVED: Siap untuk delivery
   - ⏳ PENDING: Butuh approval
   - 📝 DRAFT: Masih rencana
   - ❌ CANCELLED: Dibatalkan

4. **Timeline yang Masuk Akal**
   - Menggunakan tanggal relatif (7 hari lalu, kemarin, hari ini, besok)
   - Lead time 1-3 hari sesuai jenis barang
   - Payment terms realistis (COD, NET_7, NET_15, NET_30)

5. **Items Detail & Spesifik**
   - Ayam Kampung 1-1.2 kg
   - Beras Premium Cianjur 50kg/karung
   - Sayuran dengan notes penggunaan
   - Harga sesuai market price 2025

---

## 🔄 CRUD Operations Testing

### CREATE (Buat Order Baru)
- Test dengan plan November (yang masih aktif)
- Budget masih banyak (Rp 65jt remaining)
- Pilih supplier dari 5 supplier aktif
- Add items sesuai kategori budget

### READ (Lihat Orders)
- List semua 6 orders dengan berbagai status
- Filter by status (COMPLETED, IN_DELIVERY, etc)
- Filter by supplier
- Sort by date, amount

### UPDATE (Edit Order)
- Edit Order 5 (DRAFT) - masih bisa diedit
- Approve Order 4 (PENDING_APPROVAL)
- Update delivery info Order 2 (IN_DELIVERY)

### DELETE (Hapus Order)
- Hapus Order 5 (DRAFT) - belum approved, aman dihapus
- Tidak bisa hapus Order 1 (COMPLETED) - sudah dibayar

---

## 📊 Data Summary

```
SUPPLIERS: 5 suppliers aktif
- CV Berkah Protein (Protein supplier)
- CV Sayur Segar (Sayuran supplier)
- CV Beras Sumber Rejeki (Karbohidrat supplier)
- CV Sumber Susu (Dairy supplier)
- Toko Bumbu Lengkap (Bumbu supplier)

PLANS: 3 plans
- Oktober 2025: APPROVED (Rp 100jt, 98.5% used)
- November 2025: APPROVED (Rp 110jt, 40.9% used) ⭐ MAIN TESTING
- Desember 2025: DRAFT (Rp 115jt, 0% used)

ORDERS: 6 orders (November)
- 1 COMPLETED (✅ Paid)
- 1 IN_DELIVERY (📦 On the way)
- 1 APPROVED (✅ Ready)
- 1 PENDING_APPROVAL (⏳ Waiting)
- 1 DRAFT (📝 Planning)
- 1 CANCELLED (❌ Failed)

TOTAL VALUE: Rp 22.650.000
PAID: Rp 8.500.000
UNPAID: Rp 14.150.000
```

---

## 🎓 User Stories

### Story 1: Admin Buat Order Baru
> "Saya butuh beli telur 50 kg untuk menu minggu depan"

1. Buka Procurement → Plans → November 2025 (Active)
2. Lihat remaining budget: Rp 65jt ✅ Cukup!
3. Create New Order → Pilih Supplier Protein
4. Add Item: Telur 50 kg @ Rp 28.000 = Rp 1.4jt
5. Submit untuk approval

### Story 2: Kepala SPPG Review Order
> "Ada order susu Rp 2.1jt yang perlu saya approve"

1. Buka Procurement → Orders → PENDING_APPROVAL
2. Lihat Order 4: Susu & Olahan Rp 2.1jt
3. Review items dan supplier
4. Approve → Status berubah APPROVED
5. Supplier bisa mulai proses delivery

### Story 3: Staff Terima Barang
> "Sayuran sudah sampai, saya perlu konfirmasi penerimaan"

1. Buka Procurement → Orders → IN_DELIVERY
2. Lihat Order 2: Sayuran Mix Rp 900rb
3. Check kualitas barang
4. Konfirmasi: Received → Update quantity
5. Bayar COD Rp 900rb
6. Status berubah COMPLETED

---

## 🚀 Testing Scenarios

### Scenario 1: Happy Path (Success)
✅ Order → Approve → Deliver → Receive → Pay → Complete

**Test dengan:** Order 3 (Beras) - besok delivery

### Scenario 2: Approval Workflow
⏳ Order → Wait Approval → Approve/Reject

**Test dengan:** Order 4 (Susu) - pending approval

### Scenario 3: Draft Management
📝 Create Draft → Edit → Submit → Approve

**Test dengan:** Order 5 (Telur, Ikan, Tempe)

### Scenario 4: Cancellation
❌ Order → Cancel → Update Budget

**Test dengan:** Order 6 (Bumbu) - learn from failure

### Scenario 5: Delivery Tracking
📦 Order → Ship → Track → Arrive → Receive

**Test dengan:** Order 2 (Sayuran) - sedang kirim

### Scenario 6: Payment Management
💵 Complete → Invoice → Pay → Reconcile

**Test dengan:** Order 1 (Ayam) - sudah paid

---

## 📖 Kesimpulan

Data seed procurement yang baru ini dibuat untuk:

✅ **Mudah Dipahami** - Setiap order punya cerita yang jelas  
✅ **Realistis** - Budget, harga, dan timeline masuk akal  
✅ **Lengkap** - Semua status dan skenario tercakup  
✅ **Testing-Friendly** - Mudah untuk test CRUD operations  
✅ **Educational** - User bisa belajar flow procurement yang benar  

Dengan data ini, fitur Procurement Plans & Orders akan jauh lebih mudah dipahami dan digunakan! 🎉

---

**Generated:** November 2025  
**Version:** 2.0 - Realistic & Easy to Understand  
**Author:** Bagizi-ID Development Team
