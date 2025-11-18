#!/bin/bash

##############################################################################
# Phase 7: Comprehensive Page Audit & Next.js 15 Pattern Fix
# 
# This script:
# 1. Audits all page.tsx files for size and patterns
# 2. Identifies TypeScript errors
# 3. Fixes common Next.js 15 pattern violations
# 4. Generates audit report
#
# Author: Bagizi-ID Development Team
# Date: October 29, 2025
##############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Phase 7: Page Audit & Next.js 15 Pattern Fix${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Step 1: Count pages by size
echo -e "${CYAN}📊 Step 1: Analyzing page sizes...${NC}\n"

echo "Monolithic pages (>200 lines):"
find src/app -name "page.tsx" -exec wc -l {} \; | awk '$1 > 200 {print $0}' | sort -rn | head -20

MONOLITHIC_COUNT=$(find src/app -name "page.tsx" -exec wc -l {} \; | awk '$1 > 200' | wc -l)
TOTAL_COUNT=$(find src/app -name "page.tsx" | wc -l)

echo -e "\n${YELLOW}Summary:${NC}"
echo -e "  Total pages: ${GREEN}$TOTAL_COUNT${NC}"
echo -e "  Monolithic (>200 lines): ${RED}$MONOLITHIC_COUNT${NC}"
echo -e "  Clean pages (<200 lines): ${GREEN}$((TOTAL_COUNT - MONOLITHIC_COUNT))${NC}"

# Step 2: Check TypeScript errors
echo -e "\n${CYAN}📊 Step 2: Checking TypeScript errors...${NC}\n"

ERROR_COUNT=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)
echo -e "Total TypeScript errors: ${RED}$ERROR_COUNT${NC}\n"

if [ $ERROR_COUNT -gt 0 ]; then
    echo "Error breakdown by file:"
    npx tsc --noEmit 2>&1 | grep "\.tsx" | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -10
fi

# Step 3: Find files with withSppgAuth (should be 0)
echo -e "\n${CYAN}📊 Step 3: Checking for withSppgAuth usage...${NC}\n"

WITHSPPGAUTH_COUNT=$(grep -r "withSppgAuth" src/app --include="*.tsx" | grep -v "page-auth.tsx" | wc -l)
echo -e "Files using withSppgAuth: ${RED}$WITHSPPGAUTH_COUNT${NC}"

if [ $WITHSPPGAUTH_COUNT -gt 0 ]; then
    echo "Files still using withSppgAuth:"
    grep -r "withSppgAuth" src/app --include="*.tsx" | grep -v "page-auth.tsx" | head -10
fi

# Step 4: Find patterns that need fixing
echo -e "\n${CYAN}📊 Step 4: Identifying Next.js 15 pattern violations...${NC}\n"

# Pattern 1: searchParams not async
echo "Checking searchParams pattern..."
SEARCHPARAMS_ISSUES=$(grep -r "searchParams:" src/app --include="page.tsx" | grep -v "Promise<" | wc -l)
echo -e "  searchParams not async: ${YELLOW}$SEARCHPARAMS_ISSUES${NC}"

# Pattern 2: params not async
echo "Checking params pattern..."
PARAMS_ISSUES=$(grep -r "params:" src/app --include="page.tsx" | grep -v "Promise<" | wc -l)
echo -e "  params not async: ${YELLOW}$PARAMS_ISSUES${NC}"

# Step 5: Generate detailed error report
echo -e "\n${CYAN}📊 Step 5: Generating detailed error report...${NC}\n"

OUTPUT_FILE="docs/PHASE7_AUDIT_$(date +%Y%m%d_%H%M%S).md"

cat > "$OUTPUT_FILE" << 'EOF'
# Phase 7: Page Audit & Fix Report

**Generated:** $(date)

## 📊 Executive Summary

EOF

echo "- **Total Pages:** $TOTAL_COUNT" >> "$OUTPUT_FILE"
echo "- **Monolithic Pages (>200 lines):** $MONOLITHIC_COUNT" >> "$OUTPUT_FILE"
echo "- **TypeScript Errors:** $ERROR_COUNT" >> "$OUTPUT_FILE"
echo "- **withSppgAuth Usage:** $WITHSPPGAUTH_COUNT" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "## 🔴 Monolithic Pages Requiring Refactoring" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
find src/app -name "page.tsx" -exec wc -l {} \; | awk '$1 > 200 {print $0}' | sort -rn >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "## ❌ TypeScript Errors by File" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
npx tsc --noEmit 2>&1 | grep "\.tsx" | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -20 >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"

echo -e "${GREEN}✓ Report generated: $OUTPUT_FILE${NC}\n"

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 Audit Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ No TypeScript errors!${NC}"
else
    echo -e "${RED}✗ $ERROR_COUNT TypeScript errors need fixing${NC}"
fi

if [ $MONOLITHIC_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ No monolithic pages!${NC}"
else
    echo -e "${YELLOW}⚠ $MONOLITHIC_COUNT pages need refactoring${NC}"
fi

echo -e "\n${CYAN}📝 Next Steps:${NC}"
echo "  1. Review generated report: $OUTPUT_FILE"
echo "  2. Fix TypeScript errors first"
echo "  3. Refactor monolithic pages (prioritize by size)"
echo "  4. Test all pages manually"
echo ""
