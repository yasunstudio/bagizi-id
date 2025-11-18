# Analisis Komprehensif Model vs Seed Files
Generated: November 3, 2025

## Total Models: 175 models

## Models SUDAH ADA SEED (28 files) ✅

### Core Seeds (6):
1. ✅ User - user-seed.ts
2. ✅ SPPG - sppg-seed.ts
3. ✅ Province/Regency/District/Village - regional-seed.ts
4. ✅ NutritionStandard - nutrition-seed.ts
5. ✅ InventoryItem - inventory-seed.ts
6. ✅ NutritionProgram/NutritionMenu/MenuIngredient/RecipeStep - menu-seed.ts

### Master Data Seeds (5):
7. ✅ SchoolBeneficiary - schools-seed.ts
8. ✅ Supplier/SupplierProduct - suppliers-seed.ts
9. ✅ Vehicle - vehicles-seed.ts
10. ✅ Department/Position/Employee - hrd-seed.ts
11. ✅ KitchenEquipment - equipment-seed.ts

### Operational Seeds (3):
12. ✅ ProcurementPlan/Procurement/ProcurementItem - procurement-seed.ts
13. ✅ FoodProduction/QualityControl - production-seed.ts
14. ✅ FoodDistribution/DistributionSchedule/DistributionDelivery - distribution-seed.ts

### Extended Operational Seeds (14):
15. ✅ Allergen - allergen-seed.ts
16. ✅ SystemConfiguration - system-configuration-seed.ts
17. ✅ StockMovement - stock-movement-seed.ts
18. ✅ ProductionStockUsage - production-stock-usage-seed.ts
19. ✅ ProcurementQualityControl/QualityControlItem - procurement-quality-control-seed.ts
20. ✅ ProcurementApprovalTracking - procurement-approval-tracking-seed.ts
21. ✅ SupplierContract/SupplierEvaluation - supplier-contract-evaluation-seed.ts
22. ✅ VehicleAssignment - vehicle-assignment-seed.ts
23. ✅ QualityCheckPoint/DailyFoodSample/LaboratoryTest - quality-daily-sample-lab-seed.ts
24. ✅ WorkSchedule/LeaveRequest - work-schedule-leave-seed.ts
25. ✅ MenuCostCalculation/MenuNutritionCalculation - menu-cost-nutrition-seed.ts
26. ✅ SchoolDistribution - school-distribution-receipts-seed.ts
27. ✅ DeliveryPhoto/DeliveryIssue - delivery-photo-issue-seed.ts
28. ✅ MenuAssignment/MenuTestResult - menu-assignment-testresult-seed.ts

---

## Models BELUM ADA SEED - Kategori SPPG Master & Operational 🔴

### PRIORITY 1: Master Data SPPG (PENTING) ⭐⭐⭐

#### A. Vehicle Management (4 models)
29. ❌ VehicleMaintenance - riwayat maintenance kendaraan
30. ❌ VehicleFuelRecord - pencatatan bahan bakar
31. ❌ DeliveryTracking - tracking real-time pengiriman
32. ❌ BeneficiaryReceipt - bukti penerimaan penerima manfaat

#### B. Equipment Management (2 models)
33. ❌ EquipmentMaintenance - maintenance peralatan dapur
34. ❌ UtilityMonitoring - monitoring utilitas (listrik, air, gas)

#### C. HRD Extended (6 models)
35. ❌ EmployeeDocument - dokumen karyawan (KTP, ijazah, dll)
36. ❌ EmployeeCertification - sertifikasi karyawan
37. ❌ EmployeeAttendance - absensi harian karyawan
38. ❌ LeaveBalance - saldo cuti karyawan
39. ❌ Payroll - penggajian karyawan
40. ❌ PerformanceReview - penilaian kinerja

#### D. Procurement Extended (6 models)
41. ❌ ProcurementSettings - pengaturan procurement
42. ❌ ProcurementApprovalLevel - level persetujuan
43. ❌ ProcurementCategory - kategori pengadaan
44. ❌ ProcurementNotificationRule - aturan notifikasi
45. ❌ ProcurementPaymentTerm - terms pembayaran
46. ❌ ProcurementQCChecklist - checklist QC pengadaan

#### E. Reporting & Monitoring (3 models)
47. ❌ SchoolFeedingReport - laporan pemberian makan sekolah
48. ❌ ProgramMonitoring - monitoring program gizi
49. ❌ SppgOperationalReport - laporan operasional SPPG

### PRIORITY 2: Operational Extended (PENTING) ⭐⭐

#### F. Menu Planning (2 models)
50. ❌ MenuPlan - perencanaan menu
51. ❌ MenuPlanTemplate - template rencana menu

#### G. Food Safety & Research (6 models)
52. ❌ FoodSafetyCertification - sertifikasi keamanan pangan
53. ❌ MenuResearch - riset menu baru
54. ❌ LocalFoodAdaptation - adaptasi makanan lokal
55. ❌ NutritionConsultation - konsultasi gizi
56. ❌ NutritionEducation - edukasi gizi
57. ❌ ProductionOptimization - optimisasi produksi

#### H. Waste & Performance (3 models)
58. ❌ WasteManagement - manajemen limbah
59. ❌ PerformanceAnalytics - analisis performa
60. ❌ SppgBenchmarking - benchmarking antar SPPG

### PRIORITY 3: Support Systems (OPSIONAL) ⭐

#### I. Payment & Transaction (2 models)
61. ❌ PaymentTransaction - transaksi pembayaran
62. ❌ PaymentMethod - metode pembayaran

#### J. Financial Management (6 models)
63. ❌ BudgetTracking - tracking budget
64. ❌ SppgVirtualAccount - virtual account SPPG
65. ❌ BanperRequest - permintaan bantuan pemerintah
66. ❌ BanperTransaction - transaksi bantuan
67. ❌ Invoice - invoice subscription
68. ❌ Payment - pembayaran subscription

#### K. Distribution Extended (2 models)
69. ❌ DistributionIssue - masalah distribusi
70. ❌ SppgTeamMember - anggota tim SPPG

#### L. Training (2 models)
71. ❌ Training - program training
72. ❌ EmployeeTraining - training karyawan
73. ❌ DisciplinaryAction - tindakan disipliner

---

## Models TIDAK PERLU SEED (Platform/Marketing/System) ❌

### Platform Subscription (22 models):
- Subscription, SubscriptionPackage, SubscriptionPackageFeature
- UsageTracking, SubscriptionChange, TrialSubscription
- TrialNotification, BillingCycle, DunningProcess
- DunningAction, RevenueRecognition, RevenueScheduleItem
- SubscriptionMetrics, CustomerHealthScore
- SupportTicket, SupportTicketResponse, KnowledgeBase
- NotificationTemplate, Notification, EmailTemplate
- EmailLog, NotificationDelivery

### Marketing Website (18 models):
- LandingPage, ABTest, ABTestVariant
- BlogPost, BlogComment, Testimonial
- CaseStudy, FAQ, HelpArticle
- LeadCapture, ImageFolder, ImageFile
- Template, PageAnalytics, MarketingCampaign
- DemoRequest, DemoAnalytics, PlatformAnalytics

### Demo System (4 models):
- DemoFeature, DemoChallenge, DemoGoal
- NotificationCampaign

### Feedback System (9 models):
- FeedbackStakeholder, Feedback, FeedbackResponse
- FeedbackEscalation, FeedbackActivity, FeedbackAnalytics
- FeedbackSLA, FeedbackTemplate
- UserNotificationPreference

### Document Management (13 models):
- DocumentCategory, DocumentTypeConfig, Document
- DocumentVersion, DocumentApproval, DigitalSignature
- DocumentPermission, DocumentActivity, DocumentComment
- DocumentShare, DocumentTemplate, DataRetentionPolicy

### User Management (10 models):
- UserPermission, UserSession, UserActivity
- UserAuditLog, RolePermissionMatrix, UserOnboarding
- UserConsent, AuditLog

### System/Security (5 models):
- FeatureFlag, FeatureUsage
- SystemHealthMetrics, EncryptionKey, SecurityIncident
- PerformanceBaseline

---

## RINGKASAN ANALISIS

### Total Models: 175
- ✅ Sudah ada seed: 28 models (16%)
- 🔴 Belum ada seed (SPPG Priority): 45 models (26%)
- ❌ Tidak perlu seed (Platform/Marketing): 102 models (58%)

### REKOMENDASI SEED BERIKUTNYA (45 models):

**BATCH 8 - Priority 1 Master Data (21 models):**
1. Vehicle Extended: Maintenance + Fuel + Tracking + Receipt (4)
2. Equipment: Maintenance + Utility (2)
3. HRD Extended: Documents + Certification + Attendance + Leave + Payroll + Review (6)
4. Procurement Extended: Settings + Levels + Category + Rules + Terms + Checklist (6)
5. Reporting: School Report + Monitoring + Operational Report (3)

**BATCH 9 - Priority 2 Operational (11 models):**
6. Menu Planning: Plan + Template (2)
7. Food Safety & Research: Certification + Research + Adaptation + Consultation + Education + Optimization (6)
8. Waste & Performance: Management + Analytics + Benchmarking (3)

**BATCH 10 - Priority 3 Support (13 models):**
9. Payment: Transaction + Method (2)
10. Financial: Budget + VA + Banper + Invoice + Payment (6)
11. Distribution Extended: Issue + Team (2)
12. Training: Training + Employee Training + Disciplinary (3)

### Target Akhir: 73 seed files (28 current + 45 new)
### Coverage: 42% dari total models (focus on SPPG operational only)
