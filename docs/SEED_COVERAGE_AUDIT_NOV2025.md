# 📊 Seed Coverage Audit - November 2, 2025

## Executive Summary
- **Total Models in Schema:** 175 models
- **Models with Seeds:** ~30-40 models (~20-25% coverage)
- **Missing Coverage:** ~135-145 models (~75-80%)
- **Status:** ⚠️ INCOMPLETE - Need comprehensive operational seeds

---

## ✅ Models WITH Seeds (Currently Seeded)

### Core Platform (Regional & SPPG)
1. ✅ **Province** - Regional seed
2. ✅ **Regency** - Regional seed
3. ✅ **District** - Regional seed (17 districts Purwakarta)
4. ✅ **Village** - Regional seed (151 villages Purwakarta)
5. ✅ **SPPG** - SPPG seed (DEMO-2025 Purwakarta)
6. ✅ **User** - User seed (admin@demo.sppg.id + team)

### Nutrition Domain
7. ✅ **NutritionStandard** - Nutrition seed
8. ✅ **NutritionProgram** - Menu seed
9. ✅ **NutritionMenu** - Menu seed
10. ✅ **MenuPlan** - Menu seed
11. ✅ **MenuIngredient** - Menu seed
12. ✅ **RecipeStep** - Menu seed (partial)

### Inventory Domain
13. ✅ **InventoryItem** - Inventory seed
14. ✅ **Supplier** - Suppliers seed (6 Purwakarta suppliers)
15. ✅ **SupplierProduct** - Suppliers seed (partial)

### Procurement Domain
16. ✅ **ProcurementSettings** - Procurement seed
17. ✅ **ProcurementApprovalLevel** - Procurement seed
18. ✅ **ProcurementCategory** - Procurement seed
19. ✅ **ProcurementNotificationRule** - Procurement seed
20. ✅ **ProcurementPaymentTerm** - Procurement seed
21. ✅ **ProcurementQCChecklist** - Procurement seed
22. ✅ **ProcurementPlan** - Procurement seed
23. ✅ **Procurement** - Procurement seed
24. ✅ **ProcurementItem** - Procurement seed

### Production Domain
25. ✅ **FoodProduction** - Production seed
26. ✅ **QualityControl** - Production seed (partial)

### Distribution Domain
27. ✅ **SchoolBeneficiary** - Schools seed (5 schools, 2,225 students)
28. ✅ **FoodDistribution** - Distribution seed
29. ✅ **DistributionSchedule** - Distribution seed
30. ✅ **DistributionDelivery** - Distribution seed
31. ✅ **DeliveryTracking** - Distribution seed

### Vehicle & Equipment
32. ✅ **Vehicle** - Vehicles seed (4 vehicles)
33. ✅ **VehicleMaintenance** - Vehicles seed (3 records)
34. ✅ **VehicleFuelRecord** - Vehicles seed (3 records)
35. ✅ **KitchenEquipment** - Equipment seed (14 units)
36. ✅ **EquipmentMaintenance** - Equipment seed (7 records)

### HRD Domain
37. ✅ **Department** - HRD seed (7 departments)
38. ✅ **Position** - HRD seed (14 positions)
39. ✅ **Employee** - HRD seed (25 employees)

**Total Seeded: ~39 models**

---

## ❌ Models MISSING Seeds (Critical for Operations)

### 🔴 CRITICAL PRIORITY (P0) - Needed for Full Operations

#### Inventory Management
40. ❌ **StockMovement** - Track inventory in/out/adjustments
41. ❌ **ProductionStockUsage** - Link production to inventory consumption

#### Procurement Extended
42. ❌ **ProcurementQualityControl** - QC inspection records
43. ❌ **ProcurementApprovalTracking** - Multi-level approval workflow
44. ❌ **SupplierContract** - Supplier agreements & terms
45. ❌ **SupplierEvaluation** - Supplier performance ratings

#### Distribution Extended
46. ❌ **SchoolDistribution** - Per-school distribution records
47. ❌ **BeneficiaryReceipt** - Student receipt confirmations
48. ❌ **DeliveryPhoto** - Photo evidence of deliveries
49. ❌ **DeliveryIssue** - Track delivery problems
50. ❌ **DistributionIssue** - Issue escalation & resolution
51. ❌ **VehicleAssignment** - Vehicle to route assignments

#### Quality & Safety
52. ❌ **Allergen** - Allergen database for menu safety
53. ❌ **QualityCheckPoint** - Quality checkpoints definition
54. ❌ **QualityControlItem** - Detailed QC inspection items
55. ❌ **DailyFoodSample** - Daily food sampling records
56. ❌ **FoodSafetyCertification** - Safety certifications
57. ❌ **LaboratoryTest** - Lab test results for food safety

#### Financial & Budget
58. ❌ **BudgetTracking** - Track budget vs actual spending
59. ❌ **Payment** - Payment records
60. ❌ **PaymentTransaction** - Transaction details
61. ❌ **Invoice** - Invoices to suppliers
62. ❌ **RevenueRecognition** - Revenue accounting

#### HRD Extended
63. ❌ **EmployeeAttendance** - Daily attendance records
64. ❌ **EmployeeTraining** - Training history
65. ❌ **EmployeeCertification** - Employee certifications
66. ❌ **EmployeeDocument** - Employee documents (contracts, etc)
67. ❌ **WorkSchedule** - Work shift schedules
68. ❌ **Training** - Training programs
69. ❌ **LeaveRequest** - Leave applications
70. ❌ **LeaveBalance** - Leave balance tracking
71. ❌ **PerformanceReview** - Performance evaluations
72. ❌ **DisciplinaryAction** - Disciplinary records
73. ❌ **Payroll** - Payroll processing

### 🟡 MEDIUM PRIORITY (P1) - Enhanced Features

#### Monitoring & Reporting
74. ❌ **ProgramMonitoring** - Program KPI monitoring
75. ❌ **SppgOperationalReport** - Daily/weekly operational reports
76. ❌ **SchoolFeedingReport** - School feeding statistics
77. ❌ **SppgBenchmarking** - SPPG performance comparison
78. ❌ **UtilityMonitoring** - Utility usage (water, gas, electric)
79. ❌ **WasteManagement** - Food waste tracking

#### Nutrition Extended
80. ❌ **MenuCostCalculation** - Detailed menu cost breakdown
81. ❌ **MenuNutritionCalculation** - Nutrition calculations per menu
82. ❌ **MenuTestResult** - Menu testing & tasting results
83. ❌ **MenuResearch** - Menu R&D documentation
84. ❌ **MenuAssignment** - Menu to school assignments
85. ❌ **MenuPlanTemplate** - Reusable menu templates
86. ❌ **LocalFoodAdaptation** - Local food preferences & adaptations
87. ❌ **NutritionConsultation** - Nutrition consultation records
88. ❌ **NutritionEducation** - Nutrition education sessions
89. ❌ **NutritionRequirement** - Special nutrition requirements

#### Notification System
90. ❌ **Notification** - User notifications
91. ❌ **NotificationTemplate** - Notification templates
92. ❌ **NotificationCampaign** - Notification campaigns
93. ❌ **NotificationDelivery** - Notification delivery status
94. ❌ **EmailLog** - Email delivery logs
95. ❌ **EmailTemplate** - Email templates

#### Document Management
96. ❌ **Document** - Document repository
97. ❌ **DocumentVersion** - Document version control
98. ❌ **DocumentCategory** - Document categories
99. ❌ **DocumentTemplate** - Document templates
100. ❌ **DocumentTypeConfig** - Document type configuration
101. ❌ **DocumentApproval** - Document approval workflow
102. ❌ **DocumentPermission** - Document access control
103. ❌ **DocumentShare** - Document sharing
104. ❌ **DocumentActivity** - Document activity log
105. ❌ **DocumentComment** - Document comments
106. ❌ **DigitalSignature** - Digital signature records

#### System & Analytics
107. ❌ **SystemConfiguration** - System settings
108. ❌ **FeatureFlag** - Feature toggle management
109. ❌ **FeatureUsage** - Feature usage tracking
110. ❌ **UserActivity** - User activity logs
111. ❌ **UserAuditLog** - Audit trail
112. ❌ **AuditLog** - System audit log
113. ❌ **UserSession** - Active user sessions
114. ❌ **UserPermission** - User permissions
115. ❌ **UserNotificationPreference** - Notification preferences
116. ❌ **UserConsent** - User consent records
117. ❌ **UserOnboarding** - User onboarding progress
118. ❌ **SecurityIncident** - Security incident tracking
119. ❌ **SystemHealthMetrics** - System health monitoring
120. ❌ **PerformanceAnalytics** - Performance analytics
121. ❌ **PerformanceBaseline** - Performance baselines
122. ❌ **UsageTracking** - Usage analytics

### 🟢 LOW PRIORITY (P2) - Platform Admin / Marketing

#### Subscription & Billing (Admin)
123. ❌ **Subscription** - SPPG subscriptions
124. ❌ **SubscriptionPackage** - Subscription plans
125. ❌ **SubscriptionPackageFeature** - Package features
126. ❌ **SubscriptionChange** - Subscription changes
127. ❌ **SubscriptionMetrics** - Subscription analytics
128. ❌ **BillingCycle** - Billing cycles
129. ❌ **PaymentMethod** - Payment methods
130. ❌ **SppgVirtualAccount** - Virtual account for payments
131. ❌ **DunningProcess** - Dunning process
132. ❌ **DunningAction** - Dunning actions
133. ❌ **RevenueScheduleItem** - Revenue schedule

#### Demo & Trial (Admin)
134. ❌ **DemoRequest** - Demo requests from prospects
135. ❌ **DemoAnalytics** - Demo usage analytics
136. ❌ **DemoFeature** - Demo feature restrictions
137. ❌ **DemoGoal** - Demo completion goals
138. ❌ **DemoChallenge** - Demo challenges/tasks
139. ❌ **TrialSubscription** - Trial subscriptions
140. ❌ **TrialNotification** - Trial reminder notifications

#### Marketing (Public)
141. ❌ **LandingPage** - Landing page content
142. ❌ **BlogPost** - Blog articles
143. ❌ **BlogComment** - Blog comments
144. ❌ **CaseStudy** - Customer success stories
145. ❌ **Testimonial** - Customer testimonials
146. ❌ **FAQ** - Frequently asked questions
147. ❌ **LeadCapture** - Lead generation forms
148. ❌ **MarketingCampaign** - Marketing campaigns
149. ❌ **PageAnalytics** - Page analytics
150. ❌ **ABTest** - A/B testing
151. ❌ **ABTestVariant** - A/B test variants

#### Support & Feedback (Admin)
152. ❌ **SupportTicket** - Support tickets
153. ❌ **SupportTicketResponse** - Ticket responses
154. ❌ **Feedback** - User feedback
155. ❌ **FeedbackResponse** - Feedback responses
156. ❌ **FeedbackActivity** - Feedback activity log
157. ❌ **FeedbackAnalytics** - Feedback analytics
158. ❌ **FeedbackEscalation** - Feedback escalation
159. ❌ **FeedbackSLA** - Feedback SLA tracking
160. ❌ **FeedbackStakeholder** - Feedback stakeholders
161. ❌ **FeedbackTemplate** - Feedback templates
162. ❌ **CustomerHealthScore** - Customer health scoring

#### Platform Admin Extended
163. ❌ **PlatformAnalytics** - Platform-wide analytics
164. ❌ **SppgTeamMember** - SPPG team management
165. ❌ **RolePermissionMatrix** - Role permission mapping
166. ❌ **Template** - Generic templates
167. ❌ **HelpArticle** - Help center articles
168. ❌ **KnowledgeBase** - Knowledge base
169. ❌ **ImageFile** - Image file management
170. ❌ **ImageFolder** - Image folder management
171. ❌ **ProductionOptimization** - Production optimization suggestions
172. ❌ **DataRetentionPolicy** - Data retention policies
173. ❌ **EncryptionKey** - Encryption key management
174. ❌ **BanperRequest** - BANPER subsidy requests (Indonesia-specific)
175. ❌ **BanperTransaction** - BANPER subsidy transactions

---

## 📈 Coverage Statistics

| Category | Total Models | Seeded | Missing | Coverage |
|----------|-------------|---------|---------|----------|
| **Core Platform** | 6 | 6 | 0 | 100% ✅ |
| **Nutrition** | 13 | 6 | 7 | 46% ⚠️ |
| **Inventory** | 4 | 3 | 1 | 75% ⚠️ |
| **Procurement** | 13 | 9 | 4 | 69% ⚠️ |
| **Production** | 6 | 2 | 4 | 33% ⚠️ |
| **Distribution** | 11 | 5 | 6 | 45% ⚠️ |
| **Vehicle & Equipment** | 6 | 6 | 0 | 100% ✅ |
| **HRD** | 16 | 3 | 13 | 19% ❌ |
| **Quality & Safety** | 7 | 1 | 6 | 14% ❌ |
| **Financial** | 8 | 0 | 8 | 0% ❌ |
| **Monitoring** | 6 | 0 | 6 | 0% ❌ |
| **Notifications** | 6 | 0 | 6 | 0% ❌ |
| **Documents** | 11 | 0 | 11 | 0% ❌ |
| **System & Analytics** | 17 | 0 | 17 | 0% ❌ |
| **Subscription & Billing** | 13 | 0 | 13 | 0% ❌ |
| **Demo & Trial** | 7 | 0 | 7 | 0% ❌ |
| **Marketing** | 11 | 0 | 11 | 0% ❌ |
| **Support & Feedback** | 12 | 0 | 12 | 0% ❌ |
| **Platform Admin** | 12 | 0 | 12 | 0% ❌ |
| **TOTAL** | **175** | **~39** | **~136** | **22%** ❌ |

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Operations (P0) - Complete SPPG Operations
**Target: 33 additional seeds** - Weeks 1-2

1. ✅ Allergen management
2. ✅ StockMovement (inventory tracking)
3. ✅ ProductionStockUsage
4. ✅ ProcurementQualityControl
5. ✅ ProcurementApprovalTracking
6. ✅ SupplierContract & SupplierEvaluation
7. ✅ SchoolDistribution & BeneficiaryReceipt
8. ✅ DeliveryPhoto & DeliveryIssue
9. ✅ VehicleAssignment
10. ✅ Quality checkpoints & items
11. ✅ DailyFoodSample & LaboratoryTest
12. ✅ BudgetTracking & Payment/Invoice
13. ✅ EmployeeAttendance & Training
14. ✅ WorkSchedule & LeaveRequest
15. ✅ PerformanceReview & Payroll

### Phase 2: Enhanced Features (P1) - Rich Frontend Experience
**Target: 47 additional seeds** - Weeks 3-4

1. ✅ Monitoring & reporting (6 models)
2. ✅ Nutrition extended (10 models)
3. ✅ Notification system (6 models)
4. ✅ Document management (11 models)
5. ✅ System & analytics (17 models)

### Phase 3: Platform Features (P2) - Admin Dashboard
**Target: 56 additional seeds** - Weeks 5-6

1. ✅ Subscription & billing (13 models)
2. ✅ Demo & trial (7 models)
3. ✅ Marketing (11 models)
4. ✅ Support & feedback (12 models)
5. ✅ Platform admin (13 models)

---

## 🚨 Current Status: INCOMPLETE

**Coverage:** 22% (39/175 models)
**Priority:** Need Phase 1 (P0) immediately for full operational testing
**Timeline:** Estimated 6 weeks for 100% coverage

**Next Steps:**
1. ✅ Get user approval for Phase 1 scope
2. ✅ Create seeds in priority order (P0 → P1 → P2)
3. ✅ Test each seed incrementally
4. ✅ Update master seed.ts integration
5. ✅ Final end-to-end testing

---

**Generated:** November 2, 2025
**Author:** GitHub Copilot
**Review Status:** Pending user approval for Phase 1 implementation
