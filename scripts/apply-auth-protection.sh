#!/bin/bash

##############################################################################
# Script: Apply withSppgAuth to All SPPG Routes
# Purpose: Automatically add authentication protection to all SPPG page components
# Version: 1.0.0
# Date: October 28, 2025
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
SUCCESS=0
SKIPPED=0
FAILED=0

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}  SPPG Global Auth Protection Application${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""

##############################################################################
# Function: Apply auth protection to a single file
##############################################################################
apply_auth_to_file() {
  local FILE=$1
  TOTAL=$((TOTAL + 1))
  
  echo -e "${YELLOW}[${TOTAL}] Processing:${NC} $FILE"
  
  # Check if file exists
  if [ ! -f "$FILE" ]; then
    echo -e "  ${RED}✗ File not found${NC}"
    FAILED=$((FAILED + 1))
    return 1
  fi
  
  # Check if already protected
  if grep -q "withSppgAuth" "$FILE"; then
    echo -e "  ${GREEN}✓ Already protected (skipped)${NC}"
    SKIPPED=$((SKIPPED + 1))
    return 0
  fi
  
  # Check if it's a client component
  if ! grep -q "'use client'" "$FILE"; then
    # Add 'use client' at the top after comments
    # Create temp file with 'use client' directive
    awk '
      BEGIN { client_added = 0 }
      /\*\/$/ && client_added == 0 { 
        print $0
        print ""
        print "'"'"'use client'"'"'"
        client_added = 1
        next
      }
      { print $0 }
    ' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
    echo -e "  ${BLUE}→ Added 'use client' directive${NC}"
  fi
  
  # Remove metadata export if exists (client components can't export metadata)
  if grep -q "export const metadata" "$FILE"; then
    # Create backup
    cp "$FILE" "$FILE.bak"
    
    # Remove metadata block
    sed -i '' '/export const metadata.*{/,/^}/d' "$FILE"
    # Remove Metadata import
    sed -i '' '/import.*Metadata.*from.*next/d' "$FILE"
    
    echo -e "  ${BLUE}→ Removed metadata (client component)${NC}"
  fi
  
  # Add withSppgAuth import if not exists
  if ! grep -q "import.*withSppgAuth" "$FILE"; then
    # Find the line after 'use client' and add import
    awk '
      BEGIN { import_added = 0 }
      /'"'"'use client'"'"'/ && import_added == 0 {
        print $0
        print ""
        print "import { withSppgAuth } from '"'"'@/lib/page-auth'"'"'"
        import_added = 1
        next
      }
      { print $0 }
    ' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
    echo -e "  ${BLUE}→ Added withSppgAuth import${NC}"
  fi
  
  # Convert export default function to wrapped version
  # Pattern 1: export default function Name() {
  if grep -q "^export default function" "$FILE"; then
    FUNC_NAME=$(grep "^export default function" "$FILE" | sed 's/export default function \([A-Za-z0-9_]*\).*/\1/')
    
    # Replace export default function with just function
    sed -i '' "s/^export default function ${FUNC_NAME}/function ${FUNC_NAME}/" "$FILE"
    
    # Add export at the end
    echo "" >> "$FILE"
    echo "export default withSppgAuth(${FUNC_NAME})" >> "$FILE"
    
    echo -e "  ${GREEN}✓ Applied withSppgAuth wrapper${NC}"
    SUCCESS=$((SUCCESS + 1))
    return 0
  fi
  
  # Pattern 2: export default async function Name() {
  if grep -q "^export default async function" "$FILE"; then
    echo -e "  ${YELLOW}⚠ Async server component - needs manual conversion${NC}"
    echo -e "    File: $FILE"
    SKIPPED=$((SKIPPED + 1))
    return 0
  fi
  
  # Already has separate export
  if grep -q "^export default withSppgAuth" "$FILE"; then
    echo -e "  ${GREEN}✓ Already properly formatted${NC}"
    SUCCESS=$((SUCCESS + 1))
    return 0
  fi
  
  echo -e "  ${YELLOW}⚠ Unknown pattern - needs manual review${NC}"
  SKIPPED=$((SKIPPED + 1))
  return 0
}

##############################################################################
# Main Execution
##############################################################################

echo -e "${BLUE}Starting batch protection application...${NC}"
echo ""

# Menu module (4 files)
echo -e "${BLUE}▶ Menu Module${NC}"
apply_auth_to_file "src/app/(sppg)/menu/page.tsx"
apply_auth_to_file "src/app/(sppg)/menu/create/page.tsx"
apply_auth_to_file "src/app/(sppg)/menu/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/menu/[id]/edit/page.tsx"
echo ""

# Menu Planning module (4 files)
echo -e "${BLUE}▶ Menu Planning Module${NC}"
apply_auth_to_file "src/app/(sppg)/menu-planning/page.tsx"
apply_auth_to_file "src/app/(sppg)/menu-planning/create/page.tsx"
apply_auth_to_file "src/app/(sppg)/menu-planning/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/menu-planning/[id]/edit/page.tsx"
echo ""

# Program module (4 files)
echo -e "${BLUE}▶ Program Module${NC}"
apply_auth_to_file "src/app/(sppg)/program/page.tsx"
apply_auth_to_file "src/app/(sppg)/program/new/page.tsx"
apply_auth_to_file "src/app/(sppg)/program/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/program/[id]/edit/page.tsx"
echo ""

# Schools module (4 files)
echo -e "${BLUE}▶ Schools Module${NC}"
apply_auth_to_file "src/app/(sppg)/schools/page.tsx"
apply_auth_to_file "src/app/(sppg)/schools/new/page.tsx"
apply_auth_to_file "src/app/(sppg)/schools/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/schools/[id]/edit/page.tsx"
echo ""

# Production module (4 files)
echo -e "${BLUE}▶ Production Module${NC}"
apply_auth_to_file "src/app/(sppg)/production/page.tsx"
apply_auth_to_file "src/app/(sppg)/production/new/page.tsx"
apply_auth_to_file "src/app/(sppg)/production/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/production/[id]/edit/page.tsx"
echo ""

# Inventory module (5 files)
echo -e "${BLUE}▶ Inventory Module${NC}"
apply_auth_to_file "src/app/(sppg)/inventory/page.tsx"
apply_auth_to_file "src/app/(sppg)/inventory/create/page.tsx"
apply_auth_to_file "src/app/(sppg)/inventory/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/inventory/[id]/edit/page.tsx"
apply_auth_to_file "src/app/(sppg)/inventory/stock-movements/page.tsx"
echo ""

# Users module (4 files)
echo -e "${BLUE}▶ Users Module${NC}"
apply_auth_to_file "src/app/(sppg)/users/page.tsx"
apply_auth_to_file "src/app/(sppg)/users/new/page.tsx"
apply_auth_to_file "src/app/(sppg)/users/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/users/[id]/edit/page.tsx"
echo ""

# HRD - Employees (5 files)
echo -e "${BLUE}▶ HRD Employees Module${NC}"
apply_auth_to_file "src/app/(sppg)/hrd/employees/page.tsx"
apply_auth_to_file "src/app/(sppg)/hrd/employees/new/page.tsx"
apply_auth_to_file "src/app/(sppg)/hrd/employees/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/hrd/employees/[id]/edit/page.tsx"
echo ""

# HRD - Positions (3 files)
echo -e "${BLUE}▶ HRD Positions Module${NC}"
apply_auth_to_file "src/app/(sppg)/hrd/positions/page.tsx"
apply_auth_to_file "src/app/(sppg)/hrd/positions/new/page.tsx"
apply_auth_to_file "src/app/(sppg)/hrd/positions/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/hrd/positions/[id]/edit/page.tsx"
echo ""

# HRD - Departments (4 files)
echo -e "${BLUE}▶ HRD Departments Module${NC}"
apply_auth_to_file "src/app/(sppg)/hrd/departments/page.tsx"
apply_auth_to_file "src/app/(sppg)/hrd/departments/new/page.tsx"
apply_auth_to_file "src/app/(sppg)/hrd/departments/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/hrd/departments/[id]/edit/page.tsx"
echo ""

# Distribution module (15+ files)
echo -e "${BLUE}▶ Distribution Module${NC}"
apply_auth_to_file "src/app/(sppg)/distribution/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/delivery/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/delivery/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/delivery/[id]/complete/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/delivery/[id]/track/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/delivery/execution/[executionId]/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/execution/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/execution/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/execution/monitor/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/schedule/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/schedule/new/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/schedule/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/distribution/schedule/[id]/edit/page.tsx"
echo ""

# Procurement - Suppliers (already have server auth(), but let's check)
echo -e "${BLUE}▶ Procurement Suppliers Module (review only)${NC}"
apply_auth_to_file "src/app/(sppg)/procurement/suppliers/page.tsx"
apply_auth_to_file "src/app/(sppg)/procurement/suppliers/new/page.tsx"
apply_auth_to_file "src/app/(sppg)/procurement/suppliers/[id]/page.tsx"
apply_auth_to_file "src/app/(sppg)/procurement/suppliers/[id]/edit/page.tsx"
echo ""

# Procurement - Main pages
echo -e "${BLUE}▶ Procurement Main Pages${NC}"
apply_auth_to_file "src/app/(sppg)/procurement/page.tsx"
apply_auth_to_file "src/app/(sppg)/procurement/reports/page.tsx"
apply_auth_to_file "src/app/(sppg)/procurement/payments/page.tsx"
echo ""

##############################################################################
# Summary
##############################################################################

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}  Execution Summary${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""
echo -e "Total files processed: ${BLUE}${TOTAL}${NC}"
echo -e "Successfully protected: ${GREEN}${SUCCESS}${NC}"
echo -e "Already protected: ${GREEN}${SKIPPED}${NC}"
echo -e "Failed/Manual review: ${YELLOW}${FAILED}${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${YELLOW}⚠ Some files need manual review (async components, unknown patterns)${NC}"
  echo -e "${YELLOW}  Please check files marked with '⚠' above${NC}"
  echo ""
fi

echo -e "${GREEN}✓ Batch protection application completed!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review git diff to verify changes"
echo "2. Test authentication on protected routes"
echo "3. Fix any TypeScript errors"
echo "4. Commit changes with message: 'feat: apply withSppgAuth to all SPPG routes'"
echo ""
