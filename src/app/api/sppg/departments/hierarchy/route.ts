/**
 * @fileoverview Department Hierarchy API
 * @version Next.js 15.5.4 / Auth.js v5
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} API Development Guidelines
 * 
 * REST API endpoint for Department hierarchy tree
 * GET /api/sppg/departments/hierarchy - Get hierarchical department tree
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { canManageHR } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import type { DepartmentTreeNode } from '@/features/sppg/hrd/types/department.types'

/**
 * GET /api/sppg/departments/hierarchy
 * Get hierarchical department tree structure
 * Multi-tenant: Automatically filtered by user's sppgId
 * 
 * Returns nested tree structure starting from root departments
 */
export async function GET(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission check
      if (!canManageHR(session.user.userRole as UserRole)) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      const sppgId = session.user.sppgId!

      // Fetch all departments for this SPPG
      const allDepartments = await db.department.findMany({
        where: {
          sppgId, // CRITICAL: Multi-tenant isolation
        },
      select: {
        id: true,
        departmentCode: true,
        departmentName: true,
        description: true,
        parentId: true,
        managerId: true,
        budgetAllocated: true,
        maxEmployees: true,
        currentEmployees: true,
        isActive: true,
      },
      orderBy: [
        { departmentCode: 'asc' },
        { departmentName: 'asc' },
      ],
    })

    // 4. Build hierarchical tree structure
    const departmentMap = new Map<string, DepartmentTreeNode>()
    const rootDepartments: DepartmentTreeNode[] = []

    // First pass: Create all nodes
    allDepartments.forEach((dept) => {
      departmentMap.set(dept.id, {
        id: dept.id,
        departmentCode: dept.departmentCode,
        departmentName: dept.departmentName,
        description: dept.description,
        managerId: dept.managerId,
        budgetAllocated: dept.budgetAllocated,
        maxEmployees: dept.maxEmployees,
        currentEmployees: dept.currentEmployees,
        isActive: dept.isActive,
        children: [],
      })
    })

    // Second pass: Build tree structure
    allDepartments.forEach((dept) => {
      const node = departmentMap.get(dept.id)
      if (!node) return

      if (dept.parentId) {
        // This is a child department
        const parent = departmentMap.get(dept.parentId)
        if (parent) {
          parent.children.push(node)
        } else {
          // Parent not found (orphaned), add to root
          rootDepartments.push(node)
        }
      } else {
        // This is a root department
        rootDepartments.push(node)
      }
    })

    // 5. Sort children recursively
    const sortChildren = (nodes: DepartmentTreeNode[]) => {
      nodes.sort((a, b) => a.departmentCode.localeCompare(b.departmentCode))
      nodes.forEach((node) => {
        if (node.children.length > 0) {
          sortChildren(node.children)
        }
      })
    }

      sortChildren(rootDepartments)

      return NextResponse.json({
        success: true,
        data: rootDepartments,
      })
    } catch (error) {
      console.error('GET /api/sppg/departments/hierarchy error:', error)

      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch department hierarchy',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }) // End of withSppgAuth wrapper
}
