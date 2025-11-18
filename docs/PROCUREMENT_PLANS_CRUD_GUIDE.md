# 🛒 Panduan CRUD Procurement Plans - Mudah & Jelas

## 🎯 Masalah yang Diperbaiki

Sebelumnya, data procurement plans **sangat membingungkan** karena:
- ❌ Hanya ada 1 plan, tidak ada konteks
- ❌ Budget tidak realistis (terlalu murah)
- ❌ Tidak jelas kenapa ada status tertentu
- ❌ Timeline tidak masuk akal
- ❌ Sulit untuk testing CRUD operations

## ✅ Solusi: 3 Plans dengan Konteks Jelas

Sekarang ada **3 procurement plans** yang realistis:

### 📅 Plan 1: **Oktober 2025** (COMPLETED)
```
Status: APPROVED ✅ Sudah Selesai
Budget: Rp 100.000.000
Terpakai: Rp 98.500.000 (98.5%)
Sisa: Rp 1.500.000

📊 Target: 200 anak x 22 hari = 4.400 porsi
💰 Cost per meal: Rp 22.727

✅ Submission: 5 Oktober 2025
✅ Approval: 7 Oktober 2025
```

**Cerita:** Bulan Oktober sudah lewat dan sukses! Budget hampir habis semua. Ini untuk referensi bahwa sistem berjalan dengan baik bulan lalu.

---

### 📅 Plan 2: **November 2025** (ACTIVE) ⭐ **PALING PENTING**
```
Status: APPROVED ✅ Sedang Berjalan
Budget: Rp 110.000.000 (naik 10% dari Oktober)
Terpakai: Rp 45.000.000 (40.9%)
Sisa: Rp 65.000.000 (59.1%)

📊 Target: 200 anak x 22 hari = 4.400 porsi
💰 Cost per meal: Rp 25.000 (naik karena inflasi)

✅ Submission: 25 Oktober 2025
✅ Approval: 28 Oktober 2025
```

**Cerita:** Ini adalah plan yang sedang aktif! Baru minggu ke-2 November, jadi budget masih banyak (59%). Ini adalah **main testing plan** untuk semua operasi CRUD!

**Kenapa Naik 10%?**
- Inflasi harga bahan pangan
- Harga ayam dan sayuran naik
- Antisipasi kenaikan cost per meal

---

### 📅 Plan 3: **Desember 2025** (DRAFT)
```
Status: DRAFT 📝 Masih Rencana
Budget: Rp 115.000.000
Terpakai: Rp 0
Sisa: Rp 115.000.000 (semua masih tersedia)

📊 Target: 200 anak x 18 hari = 3.600 porsi (lebih sedikit karena libur)
💰 Cost per meal: Rp 31.944

❌ Belum disubmit
❌ Belum ada approval
```

**Cerita:** Plan untuk bulan depan masih draft. Menunggu konfirmasi menu dan approval. Ini untuk testing **create dan edit draft plans**.

---

## 🛒 6 Procurement Orders (Berbagai Status)

Semua order ini linked ke **Plan November 2025** (yang sedang aktif).

### 1️⃣ Order **COMPLETED** ✅ (Minggu Lalu)
```
Code: PO-NOV-2025-001
Status: COMPLETED & PAID
Supplier: CV Berkah Protein Nusantara

📦 Item: 100 ekor Ayam Kampung @ Rp 85.000
💰 Total: Rp 8.500.000
✅ Paid: Rp 8.500.000

📅 Order: 7 hari lalu
📅 Expected: 5 hari lalu
📅 Delivered: 5 hari lalu (TEPAT WAKTU!)

⭐ Quality: EXCELLENT
✅ "Ayam segar, berat sesuai 1-1.2kg, tidak ada cacat"
```

**Use Case:** Lihat contoh order yang sukses sempurna!

---

### 2️⃣ Order **IN DELIVERY** 📦 (Hari Ini)
```
Code: PO-NOV-2025-002
Status: ORDERED (Sedang Dikirim)
Supplier: CV Sayur Segar Purwakarta

📦 Items:
   - 25 kg Bayam @ Rp 8.000 = Rp 200.000
   - 30 kg Wortel @ Rp 12.000 = Rp 360.000
   - 20 kg Tomat @ Rp 15.000 = Rp 300.000
   - 15 kg Kangkung @ Rp 6.000 = Rp 90.000
💰 Total: Rp 900.000 (setelah diskon Rp 50rb)

📅 Order: Kemarin
📅 Expected: Hari ini
📦 Status: Dijemput pagi jam 06:00

💵 Payment: COD (bayar saat terima)
```

**Use Case:** Test scenario **terima barang** dan **bayar COD**!

---

### 3️⃣ Order **APPROVED** ✅ (Besok Delivery)
```
Code: PO-NOV-2025-003
Status: APPROVED (Siap Kirim)
Supplier: CV Beras Sumber Rejeki

📦 Item: 4 karung Beras Premium @ Rp 1.500.000
🚚 Ongkir: Rp 100.000
💰 Total: Rp 6.100.000

📅 Expected: Besok pagi
🚛 Method: Truk Cargo dari Cianjur
💵 Payment: NET_15 (bayar dalam 15 hari)

📝 "200 kg beras untuk ~1000 porsi nasi"
```

**Use Case:** Test scenario **tracking delivery** besok!

---

### 4️⃣ Order **PENDING APPROVAL** ⏳ (Butuh Persetujuan)
```
Code: PO-NOV-2025-004
Status: PENDING_APPROVAL
Supplier: CV Sumber Susu Murni

📦 Items:
   - 100 liter Susu UHT @ Rp 14.000 = Rp 1.400.000
   - 50 cup Yogurt @ Rp 8.000 = Rp 400.000
   - 10 pack Keju @ Rp 30.000 = Rp 300.000
💰 Total: Rp 2.100.000

⏳ Menunggu approval Kepala SPPG
💵 Payment: NET_7 (bayar 7 hari setelah delivery)
```

**Use Case:** Test **approval workflow**! Kepala SPPG harus review dan approve.

---

### 5️⃣ Order **DRAFT** 📝 (Masih Rencana)
```
Code: PO-NOV-2025-005-DRAFT
Status: DRAFT
Supplier: CV Berkah Protein

📦 Items:
   - 100 kg Telur @ Rp 28.000 = Rp 2.800.000
   - 30 kg Ikan Lele @ Rp 35.000 = Rp 1.050.000
   - 40 bungkus Tempe @ Rp 16.000 = Rp 640.000
💰 Total: Rp 4.500.000 (estimasi)

📝 Belum dikonfirmasi ke supplier
📅 Rencana untuk 5 hari lagi
```

**Use Case:** Test **edit draft order**! Bisa diedit sebelum submit.

---

### 6️⃣ Order **CANCELLED** ❌ (Dibatalkan)
```
Code: PO-NOV-2025-006-CANCELLED
Status: CANCELLED
Supplier: Toko Bumbu Lengkap

📦 Item: 20 kg Bawang Merah @ Rp 25.000
💰 Total: Rp 0 (cancelled)

❌ Reason: "Supplier kehabisan stok"
💡 Lesson: Harus cari supplier backup!
```

**Use Case:** Lihat kenapa order bisa dibatalkan dan lesson learned.

---

## 🎮 Testing Scenarios

### Scenario 1: **CREATE New Order** ➕
```
1. Login sebagai admin@demo.sppg.id
2. Buka Procurement → Plans
3. Pilih "November 2025" (Active plan)
4. Check budget: Rp 65jt remaining ✅ Cukup!
5. Klik "Create New Order"
6. Pilih Supplier: CV Berkah Protein
7. Add Item: Telur 50 kg @ Rp 28.000 = Rp 1.4jt
8. Submit for Approval
9. ✅ Success! Order masuk status PENDING_APPROVAL
```

**Expected Result:**
- Order baru dengan status PENDING_APPROVAL
- Budget November berkurang Rp 1.4jt
- Notifikasi ke Kepala SPPG untuk approval

---

### Scenario 2: **READ & FILTER Orders** 📖
```
1. Buka Procurement → Orders
2. Lihat 6 orders dengan berbagai status
3. Filter by Status:
   - COMPLETED (1 order) ✅
   - IN_DELIVERY (1 order) 📦
   - APPROVED (1 order) ✅
   - PENDING_APPROVAL (1 order) ⏳
   - DRAFT (1 order) 📝
   - CANCELLED (1 order) ❌
4. Filter by Supplier: CV Berkah Protein (2 orders)
5. Sort by Date: Newest first
6. Sort by Amount: Highest first
```

---

### Scenario 3: **UPDATE Order** ✏️

#### 3a. Edit Draft Order
```
1. Pilih Order 5 (DRAFT)
2. Klik "Edit"
3. Ubah quantity: Telur 100 kg → 120 kg
4. Recalculate: Rp 2.8jt → Rp 3.36jt
5. Save
6. ✅ Success! Draft updated
```

#### 3b. Approve Order
```
1. Login sebagai kepala@demo.sppg.id
2. Pilih Order 4 (PENDING_APPROVAL)
3. Review items dan total
4. Check budget availability
5. Klik "Approve"
6. Status berubah: PENDING → APPROVED
7. Supplier dapat notifikasi untuk prepare delivery
```

#### 3c. Update Delivery Status
```
1. Pilih Order 2 (IN_DELIVERY)
2. Klik "Update Delivery"
3. Status: "Arrived at SPPG"
4. Receive items:
   - Bayam: 25 kg ✅ (sesuai order)
   - Wortel: 30 kg ✅
   - Tomat: 18 kg ⚠️ (kurang 2 kg, ada busuk)
   - Kangkung: 15 kg ✅
5. Quality Check: GOOD (minor issue tomat)
6. Bayar COD: Rp 900.000
7. Status berubah: IN_DELIVERY → COMPLETED
```

---

### Scenario 4: **DELETE Order** 🗑️

#### ✅ Can Delete: Draft Order
```
1. Pilih Order 5 (DRAFT)
2. Klik "Delete"
3. Confirm: "Are you sure?"
4. ✅ Deleted! Budget dikembalikan ke plan
```

#### ❌ Cannot Delete: Completed Order
```
1. Pilih Order 1 (COMPLETED)
2. Klik "Delete"
3. ❌ Error: "Cannot delete completed order"
4. Reason: Sudah dibayar dan masuk accounting
```

---

## 📊 Budget Tracking

### November Plan Budget Breakdown
```
Total Budget: Rp 110.000.000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALLOCATED BY CATEGORY:
├─ Protein (40%):      Rp 44.000.000
├─ Karbohidrat (30%):  Rp 33.000.000
├─ Sayuran (20%):      Rp 22.000.000
├─ Buah (10%):         Rp 11.000.000
└─ Emergency (10%):    Rp 11.000.000

USED SO FAR: Rp 45.000.000 (40.9%)
├─ Order 1 (Ayam):     Rp 8.500.000 ✅ PAID
├─ Order 2 (Sayur):    Rp 900.000   📦 IN DELIVERY
├─ Order 3 (Beras):    Rp 6.100.000 ✅ APPROVED
├─ Order 4 (Susu):     Rp 2.100.000 ⏳ PENDING
├─ Order 5 (Telur):    Rp 4.500.000 📝 DRAFT
└─ Order 6 (Bumbu):    Rp 0         ❌ CANCELLED

REMAINING: Rp 65.000.000 (59.1%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATUS:
✅ On Track - Masih banyak budget untuk 2 minggu kedepan
📊 Usage Rate: 40.9% (minggu ke-2 dari 4 minggu)
```

---

## 🎯 User Stories

### Story 1: Admin Procurement
**As a:** SPPG Admin  
**I want to:** Membuat order baru untuk bahan makanan  
**So that:** Stok kitchen cukup untuk minggu depan

```
✅ Login: admin@demo.sppg.id
✅ Check plan November: Rp 65jt tersedia
✅ Create order: Telur 50 kg = Rp 1.4jt
✅ Submit for approval
✅ Notifikasi dikirim ke Kepala SPPG
```

---

### Story 2: Kepala SPPG
**As a:** Kepala SPPG  
**I want to:** Review dan approve order yang nilainya tinggi  
**So that:** Budget terkontrol dengan baik

```
✅ Login: kepala@demo.sppg.id
✅ See notification: Order baru Rp 2.1jt
✅ Review items: Susu, Yogurt, Keju
✅ Check budget: Rp 65jt remaining ✅ OK
✅ Approve order
✅ Supplier dapat notifikasi
```

---

### Story 3: Staff Kitchen
**As a:** Staff Dapur  
**I want to:** Konfirmasi penerimaan barang dari supplier  
**So that:** Stok inventory terupdate

```
✅ Login: dapur@demo.sppg.id
✅ Check delivery: Sayuran hari ini
✅ Receive items: Quality check
✅ Update quantity: 18 kg tomat (kurang 2 kg)
✅ Report issue: 2 kg tomat busuk
✅ Bayar COD: Rp 900.000
✅ Status: COMPLETED
```

---

## 📈 Metrics & Reports

### Procurement Performance (November)
```
📊 ORDERS STATISTICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Orders:          6
Completed:             1 (16.7%)
In Progress:           4 (66.7%)
Cancelled:             1 (16.7%)

💰 FINANCIAL:
Total Value:           Rp 22.600.000
Already Paid:          Rp 8.500.000 (37.6%)
Unpaid:               Rp 14.100.000 (62.4%)
Budget Remaining:      Rp 65.000.000

⏱️ TIMING:
On-Time Delivery:      100% (1/1 completed)
Average Lead Time:     2 days
Orders This Week:      3

🏆 TOP SUPPLIERS:
1. CV Berkah Protein:  Rp 13.000.000 (57.5%)
2. CV Beras Rejeki:    Rp 6.100.000 (27%)
3. CV Sumber Susu:     Rp 2.100.000 (9.3%)
4. CV Sayur Segar:     Rp 900.000 (4%)
5. Toko Bumbu:         Rp 0 (cancelled)

📦 TOP CATEGORIES:
1. Protein:            Rp 13.000.000 (57.5%)
2. Karbohidrat:        Rp 6.100.000 (27%)
3. Susu & Olahan:      Rp 2.100.000 (9.3%)
4. Sayuran:            Rp 900.000 (4%)
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Order Stuck di PENDING_APPROVAL
**Problem:** Order tidak kunjung di-approve  
**Solution:**
- Check notifikasi ke Kepala SPPG
- Follow up via WhatsApp/Email
- Jika urgent, escalate ke Platform Admin

---

### Issue 2: Supplier Tidak Bisa Fulfill Order
**Problem:** Stok habis atau harga berubah  
**Solution:**
- Cancel order dengan alasan jelas
- Cari supplier alternatif
- Update supplier rating (kurang reliable)
- Budget kembali ke plan

---

### Issue 3: Kualitas Barang Tidak Sesuai
**Problem:** Barang rusak/busuk saat delivery  
**Solution:**
- Reject sebagian barang
- Update received quantity
- Report issue ke supplier
- Minta refund atau replacement
- Update supplier rating (kualitas buruk)

---

### Issue 4: Budget Tidak Cukup
**Problem:** Plan November hampir habis  
**Solution:**
- Review remaining budget
- Prioritaskan order essential (protein, beras)
- Delay order non-urgent
- Request budget tambahan dari Kepala SPPG
- Gunakan emergency buffer (Rp 11jt)

---

## 🎓 Best Practices

### 1. Planning
- ✅ Buat plan minimal 1 minggu sebelum bulan dimulai
- ✅ Align dengan menu plan
- ✅ Allocate budget per category (40% protein, 30% carb, etc)
- ✅ Sisakan 10% untuk emergency buffer

### 2. Ordering
- ✅ Order 2-3 hari sebelum kebutuhan (lead time)
- ✅ Prioritaskan supplier terpercaya (rating tinggi)
- ✅ Konfirmasi ketersediaan stok dulu
- ✅ Nego harga untuk order besar (bulk discount)

### 3. Receiving
- ✅ Quality check semua barang saat delivery
- ✅ Update quantity jika ada yang tidak sesuai
- ✅ Report issue segera ke supplier
- ✅ Bayar sesuai payment terms

### 4. Monitoring
- ✅ Track budget usage mingguan
- ✅ Review supplier performance bulanan
- ✅ Analyze spending pattern per category
- ✅ Optimize order timing untuk harga terbaik

---

## 🔐 Role Permissions

### PLATFORM_SUPERADMIN
- ✅ View all SPPG plans & orders
- ✅ Generate platform-wide reports
- ✅ Manage suppliers & products
- ✅ Override any approval

### SPPG_KEPALA
- ✅ View & approve all plans
- ✅ Approve orders > Rp 2 juta
- ✅ View all reports
- ✅ Manage budget allocation

### SPPG_ADMIN
- ✅ Create & edit plans
- ✅ Create & edit orders < Rp 2 juta
- ✅ View reports

### SPPG_AKUNTAN
- ✅ View financial reports
- ✅ Approve payments
- ✅ Reconcile invoices

### SPPG_STAFF_DAPUR
- ✅ View orders
- ✅ Confirm delivery
- ✅ Report quality issues

### SPPG_VIEWER
- ✅ View only (read-only)

---

## 🚀 Quick Commands

### Run Seed
```bash
npm run db:seed
```

### Reset & Reseed
```bash
npm run db:reset
```

### View Data in Prisma Studio
```bash
npm run db:studio
```

### Check Logs
```bash
# Check procurement logs
grep "procurement" logs/app.log

# Check budget tracking
grep "budget" logs/procurement.log
```

---

## 📚 Related Documentation

- [Procurement Seed Realistic Explained](./PROCUREMENT_SEED_REALISTIC_EXPLAINED.md)
- [Demo Credentials](./DEMO_CREDENTIALS.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Copilot Instructions](../.github/copilot-instructions.md)

---

**Last Updated:** November 1, 2025  
**Version:** 2.0 - Realistic & Easy to Understand  
**Tested:** ✅ All scenarios working  
**Author:** Bagizi-ID Development Team
