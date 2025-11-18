import { Prisma } from '@prisma/client'
import type {
  BgnRequestStatus,
  BudgetSource,
  BudgetAllocationStatus,
  BudgetTransactionCategory,
  TargetGroup,
  ProgramStatus,
  ProgramType,
} from '@prisma/client'

export type {
  BgnRequestStatus,
  BudgetSource,
  BudgetAllocationStatus,
  BudgetTransactionCategory,
  TargetGroup,
  ProgramStatus,
  ProgramType,
}

export type {
  BanperRequestTracking,
  ProgramBudgetAllocation,
  BudgetTransaction,
} from '@prisma/client'

export type BanperRequestTrackingWithRelations = Prisma.BanperRequestTrackingGetPayload<{
  include: {
    sppg: {
      select: {
        id: true
        code: true
        name: true
      }
    }
    program: {
      select: {
        id: true
        name: true
        programCode: true
        programType: true
        startDate: true
        endDate: true
        allowedTargetGroups: true
        status: true
      }
    }
    budgetAllocations: {
      include: {
        transactions: true
      }
    }
  }
}>

// List item type untuk table display
export type BanperRequestTrackingListItem = Prisma.BanperRequestTrackingGetPayload<{
  include: {
    program: {
      select: {
        id: true
        name: true
        programCode: true
      }
    }
    sppg: {
      select: {
        id: true
        name: true
        code: true
      }
    }
  }
}>

// Program Budget Allocation types
export type ProgramBudgetAllocationWithRelations = Prisma.ProgramBudgetAllocationGetPayload<{
  include: {
    program: {
      select: {
        id: true
        name: true
        programCode: true
      }
    }
    sppg: {
      select: {
        id: true
        name: true
        code: true
      }
    }
    banperTracking: {
      select: {
        id: true
        bgnRequestNumber: true
        bgnStatus: true
        disbursedAmount: true
      }
    }
    transactions: true
  }
}>

export type BudgetAllocationListItem = Prisma.ProgramBudgetAllocationGetPayload<{
  include: {
    program: {
      select: {
        id: true
        name: true
        programCode: true
      }
    }
    banperTracking: {
      select: {
        id: true
        bgnRequestNumber: true
        bgnStatus: true
      }
    }
  }
}>

// Budget Transaction types
export type BudgetTransactionWithRelations = Prisma.BudgetTransactionGetPayload<{
  include: {
    allocation: {
      include: {
        program: {
          select: {
            id: true
            name: true
            programCode: true
          }
        }
      }
    }
  }
}>

export type BudgetTransactionListItem = Prisma.BudgetTransactionGetPayload<{
  include: {
    allocation: {
      select: {
        id: true
        source: true
        fiscalYear: true
        program: {
          select: {
            id: true
            name: true
            programCode: true
          }
        }
      }
    }
  }
}>