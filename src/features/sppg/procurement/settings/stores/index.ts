/**
 * @fileoverview Procurement Settings Zustand Store
 * @version Next.js 15.5.4 / Zustand 5.0.6
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * STORE ARCHITECTURE:
 * - Local state management for settings UI
 * - Optimistic updates support
 * - Dirty tracking for unsaved changes
 * - Section-based state management
 */

import { create } from 'zustand'
import type { 
  ProcurementSettingsDetail,
  UpdateGeneralSettingsRequest,
  ApprovalLevelInput,
  CategoryInput,
  NotificationRuleInput,
  PaymentTermInput,
  QCChecklistInput,
  QCCheckItem
} from '../types'

// ================================ STORE TYPES ================================

interface SettingsState {
  // Data
  settings: ProcurementSettingsDetail | null
  
  // UI State
  isEditing: boolean
  isDirty: boolean
  activeTab: string
  
  // Section-specific state
  generalSettings: UpdateGeneralSettingsRequest | null
  approvalLevels: ApprovalLevelInput[]
  categories: CategoryInput[]
  notificationRules: NotificationRuleInput[]
  paymentTerms: PaymentTermInput[]
  qcChecklists: QCChecklistInput[]
}

interface SettingsActions {
  // Data actions
  setSettings: (settings: ProcurementSettingsDetail) => void
  resetSettings: () => void
  
  // UI actions
  setIsEditing: (isEditing: boolean) => void
  setActiveTab: (tab: string) => void
  
  // Section actions
  updateGeneralSettings: (data: Partial<UpdateGeneralSettingsRequest>) => void
  setApprovalLevels: (levels: ApprovalLevelInput[]) => void
  addApprovalLevel: (level: ApprovalLevelInput) => void
  removeApprovalLevel: (index: number) => void
  
  setCategories: (categories: CategoryInput[]) => void
  addCategory: (category: CategoryInput) => void
  updateCategory: (index: number, category: Partial<CategoryInput>) => void
  removeCategory: (index: number) => void
  
  setNotificationRules: (rules: NotificationRuleInput[]) => void
  addNotificationRule: (rule: NotificationRuleInput) => void
  updateNotificationRule: (index: number, rule: Partial<NotificationRuleInput>) => void
  removeNotificationRule: (index: number) => void
  
  setPaymentTerms: (terms: PaymentTermInput[]) => void
  addPaymentTerm: (term: PaymentTermInput) => void
  updatePaymentTerm: (index: number, term: Partial<PaymentTermInput>) => void
  removePaymentTerm: (index: number) => void
  
  setQCChecklists: (checklists: QCChecklistInput[]) => void
  addQCChecklist: (checklist: QCChecklistInput) => void
  updateQCChecklist: (index: number, checklist: Partial<QCChecklistInput>) => void
  removeQCChecklist: (index: number) => void
  
  // Utility actions
  discardChanges: () => void
  hasUnsavedChanges: () => boolean
}

type SettingsStore = SettingsState & SettingsActions

// ================================ INITIAL STATE ================================

const initialState: SettingsState = {
  settings: null,
  isEditing: false,
  isDirty: false,
  activeTab: 'general',
  generalSettings: null,
  approvalLevels: [],
  categories: [],
  notificationRules: [],
  paymentTerms: [],
  qcChecklists: [],
}

// ================================ STORE IMPLEMENTATION ================================

/**
 * Procurement Settings Store
 * 
 * @example
 * ```typescript
 * const { settings, setSettings, updateGeneralSettings } = useSettingsStore()
 * 
 * // Update general settings locally
 * updateGeneralSettings({ autoApproveThreshold: 10000000 })
 * 
 * // Check if there are unsaved changes
 * const hasChanges = useSettingsStore.getState().hasUnsavedChanges()
 * ```
 */
export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initialState,
  
  // ================================ DATA ACTIONS ================================
  
  setSettings: (settings) => {
    set({
      settings,
      generalSettings: {
        autoApproveThreshold: settings.autoApproveThreshold,
        requireQCPhotos: settings.requireQCPhotos,
        minQCPhotoCount: settings.minQCPhotoCount,
        defaultPaymentTerm: settings.defaultPaymentTerm,
        enableWhatsappNotif: settings.enableWhatsappNotif,
        whatsappNumber: settings.whatsappNumber || undefined,
        enableEmailDigest: settings.enableEmailDigest,
        digestFrequency: settings.digestFrequency,
        budgetAlertEnabled: settings.budgetAlertEnabled,
        budgetAlertThreshold: settings.budgetAlertThreshold,
        accountingIntegration: settings.accountingIntegration,
        inventoryAutoSync: settings.inventoryAutoSync,
      },
      approvalLevels: settings.approvalLevels.map(level => ({
        id: level.id,
        level: level.level,
        levelName: level.levelName,
        minAmount: level.minAmount,
        maxAmount: level.maxAmount || undefined,
        requiredRole: level.requiredRole,
        isParallel: level.isParallel,
        escalationDays: level.escalationDays || undefined,
      })),
      categories: settings.customCategories.map(cat => ({
        id: cat.id,
        code: cat.code,
        name: cat.name,
        icon: cat.icon || undefined,
        color: cat.color || undefined,
        monthlyBudget: cat.monthlyBudget || undefined,
        yearlyBudget: cat.yearlyBudget || undefined,
        budgetAllocPct: cat.budgetAllocPct || undefined,
        requiresApproval: cat.requiresApproval,
      })),
      notificationRules: settings.notificationRules.map(rule => ({
        id: rule.id,
        eventType: rule.eventType,
        eventName: rule.eventName,
        description: rule.description || undefined,
        channel: rule.channel,
        recipientRoles: rule.recipientRoles,
        recipientEmails: rule.recipientEmails || undefined,
        recipientPhones: rule.recipientPhones || undefined,
        template: rule.template || undefined,
        delayMinutes: rule.delayMinutes || undefined,
        retryOnFailure: rule.retryOnFailure,
        maxRetries: rule.maxRetries || undefined,
        conditionField: rule.conditionField || undefined,
        conditionOperator: rule.conditionOperator || undefined,
        conditionValue: rule.conditionValue || undefined,
        isEnabled: rule.isEnabled,
        priority: rule.priority || undefined,
      })),
      paymentTerms: settings.paymentTerms.map(term => ({
        id: term.id,
        code: term.code,
        name: term.name,
        dueDays: term.dueDays,
        requireDP: term.requireDP,
        dpPercentage: term.dpPercentage || undefined,
        lateFeePerDay: term.lateFeePerDay || undefined,
        autoRemindDays: term.autoRemindDays || undefined,
        autoEscalateDays: term.autoEscalateDays || undefined,
      })),
      qcChecklists: settings.qcChecklists.map(checklist => ({
        id: checklist.id,
        code: checklist.code,
        name: checklist.name,
        description: checklist.description || undefined,
        category: checklist.category || undefined,
        checkItems: checklist.checkItems as unknown as QCCheckItem[],
        passThreshold: checklist.passThreshold,
        requirePhotos: checklist.requirePhotos,
        minPhotos: checklist.minPhotos || undefined,
        maxPhotos: checklist.maxPhotos || undefined,
        requireSignature: checklist.requireSignature,
        samplingEnabled: checklist.samplingEnabled,
        samplingPct: checklist.samplingPct || undefined,
        minSampleSize: checklist.minSampleSize || undefined,
        autoRejectBelow: checklist.autoRejectBelow || undefined,
        autoApproveAbove: checklist.autoApproveAbove || undefined,
        isActive: checklist.isActive,
        sortOrder: checklist.sortOrder,
      })),
      isDirty: false,
    })
  },
  
  resetSettings: () => set(initialState),
  
  // ================================ UI ACTIONS ================================
  
  setIsEditing: (isEditing) => set({ isEditing }),
  setActiveTab: (activeTab) => set({ activeTab }),
  
  // ================================ GENERAL SETTINGS ================================
  
  updateGeneralSettings: (data) => set((state) => ({
    generalSettings: state.generalSettings ? { ...state.generalSettings, ...data } : null,
    isDirty: true,
  })),
  
  // ================================ APPROVAL LEVELS ================================
  
  setApprovalLevels: (approvalLevels) => set({ approvalLevels, isDirty: true }),
  
  addApprovalLevel: (level) => set((state) => ({
    approvalLevels: [...state.approvalLevels, level],
    isDirty: true,
  })),
  
  removeApprovalLevel: (index) => set((state) => ({
    approvalLevels: state.approvalLevels.filter((_, i) => i !== index),
    isDirty: true,
  })),
  
  // ================================ CATEGORIES ================================
  
  setCategories: (categories) => set({ categories, isDirty: true }),
  
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category],
    isDirty: true,
  })),
  
  updateCategory: (index, data) => set((state) => ({
    categories: state.categories.map((cat, i) => 
      i === index ? { ...cat, ...data } : cat
    ),
    isDirty: true,
  })),
  
  removeCategory: (index) => set((state) => ({
    categories: state.categories.filter((_, i) => i !== index),
    isDirty: true,
  })),
  
  // ================================ NOTIFICATION RULES ================================
  
  setNotificationRules: (notificationRules) => set({ notificationRules, isDirty: true }),
  
  addNotificationRule: (rule) => set((state) => ({
    notificationRules: [...state.notificationRules, rule],
    isDirty: true,
  })),
  
  updateNotificationRule: (index, data) => set((state) => ({
    notificationRules: state.notificationRules.map((rule, i) => 
      i === index ? { ...rule, ...data } : rule
    ),
    isDirty: true,
  })),
  
  removeNotificationRule: (index) => set((state) => ({
    notificationRules: state.notificationRules.filter((_, i) => i !== index),
    isDirty: true,
  })),
  
  // ================================ PAYMENT TERMS ================================
  
  setPaymentTerms: (paymentTerms) => set({ paymentTerms, isDirty: true }),
  
  addPaymentTerm: (term) => set((state) => ({
    paymentTerms: [...state.paymentTerms, term],
    isDirty: true,
  })),
  
  updatePaymentTerm: (index, data) => set((state) => ({
    paymentTerms: state.paymentTerms.map((term, i) => 
      i === index ? { ...term, ...data } : term
    ),
    isDirty: true,
  })),
  
  removePaymentTerm: (index) => set((state) => ({
    paymentTerms: state.paymentTerms.filter((_, i) => i !== index),
    isDirty: true,
  })),
  
  // ================================ QC CHECKLISTS ================================
  
  setQCChecklists: (qcChecklists) => set({ qcChecklists, isDirty: true }),
  
  addQCChecklist: (checklist) => set((state) => ({
    qcChecklists: [...state.qcChecklists, checklist],
    isDirty: true,
  })),
  
  updateQCChecklist: (index, data) => set((state) => ({
    qcChecklists: state.qcChecklists.map((checklist, i) => 
      i === index ? { ...checklist, ...data } : checklist
    ),
    isDirty: true,
  })),
  
  removeQCChecklist: (index) => set((state) => ({
    qcChecklists: state.qcChecklists.filter((_, i) => i !== index),
    isDirty: true,
  })),
  
  // ================================ UTILITY ACTIONS ================================
  
  discardChanges: () => {
    const settings = get().settings
    if (settings) {
      get().setSettings(settings)
    }
  },
  
  hasUnsavedChanges: () => get().isDirty,
}))
