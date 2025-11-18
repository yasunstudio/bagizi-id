#!/bin/bash

# 🧪 Quick Test Script for Monitoring Auto-Fill Feature
# Run this script to perform basic validation tests on auto-fill functionality

echo "🧪 =========================================="
echo "   Monitoring Auto-Fill Quick Test"
echo "   Testing Implementation & API"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=0

# Function to run test
run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}Test $TOTAL_TESTS: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASS_COUNT=$((PASS_COUNT + 1))
        echo ""
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo ""
        return 1
    fi
}

# Test 1: Check if API route file exists
echo -e "${YELLOW}=== File Existence Tests ===${NC}"
run_test "API route file exists" "test -f src/app/api/sppg/monitoring/auto-populate/route.ts"

# Test 2: Check if hook file exists
run_test "Hook file exists" "test -f src/features/sppg/program/hooks/useAutoPopulateMonitoring.ts"

# Test 3: Check if hook is exported in index
run_test "Hook exported in index" "grep -q 'useAutoPopulateMonitoring' src/features/sppg/program/hooks/index.ts"

# Test 4: Check if page imports hook
run_test "Page imports hook" "grep -q 'useAutoPopulateMonitoring' 'src/app/(sppg)/program/[id]/monitoring/new/page.tsx'"

# Test 5: Check TypeScript compilation (all 3 files)
echo -e "${YELLOW}=== TypeScript Compilation Tests ===${NC}"
echo -e "${BLUE}Checking TypeScript errors...${NC}"

# Run tsc on specific files (will show errors if any)
# Note: Using glob pattern to avoid shell parsing issues with parentheses
npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "(auto-populate|useAutoPopulateMonitoring|monitoring/new)" | tee /tmp/tsc_output.txt

if [ ! -s /tmp/tsc_output.txt ]; then
    echo -e "${GREEN}✅ PASS - No TypeScript errors in auto-fill files${NC}"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    echo -e "${RED}❌ FAIL - TypeScript errors found${NC}"
    echo "See /tmp/tsc_output.txt for details"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

# Test 6: Check for required imports in API route
echo -e "${YELLOW}=== Code Quality Tests ===${NC}"
run_test "API route has auth import" "grep -q 'from.*@/auth' src/app/api/sppg/monitoring/auto-populate/route.ts"

# Test 7: Check for Prisma import in API route
run_test "API route has Prisma import" "grep -q 'from.*@/lib/prisma' src/app/api/sppg/monitoring/auto-populate/route.ts"

# Test 8: Check for React Query in hook
run_test "Hook uses React Query" "grep -q 'useQuery' src/features/sppg/program/hooks/useAutoPopulateMonitoring.ts"

# Test 9: Check for useRef in page (prevents infinite loop)
run_test "Page uses useRef guard" "grep -q 'useRef' 'src/app/(sppg)/program/[id]/monitoring/new/page.tsx'"

# Test 10: Check for silent auto-save parameter
run_test "Page has silent auto-save" "grep -q 'silent.*true' 'src/app/(sppg)/program/[id]/monitoring/new/page.tsx'"

# Test 11: Check API endpoint structure
echo -e "${YELLOW}=== API Endpoint Tests ===${NC}"
run_test "API exports GET function" "grep -q 'export async function GET' src/app/api/sppg/monitoring/auto-populate/route.ts"

# Test 12: Check for multi-tenant sppgId check
run_test "API checks sppgId" "grep -q 'sppgId' src/app/api/sppg/monitoring/auto-populate/route.ts"

# Test 13: Check for date range logic (last 7 days)
run_test "API uses 7-day window" "grep -q 'setDate.*getDate.*-.*7' src/app/api/sppg/monitoring/auto-populate/route.ts"

# Test 14: Check hook query key structure
echo -e "${YELLOW}=== Hook Configuration Tests ===${NC}"
run_test "Hook has correct query key" "grep -q \"queryKey.*monitoring.*auto-populate\" src/features/sppg/program/hooks/useAutoPopulateMonitoring.ts"

# Test 15: Check hook staleTime setting (5 minutes)
run_test "Hook has 5-min cache" "grep -q 'staleTime.*1000.*60.*5' src/features/sppg/program/hooks/useAutoPopulateMonitoring.ts"

# Summary
echo ""
echo -e "${YELLOW}=========================================="
echo "   Test Results Summary"
echo "==========================================${NC}"
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo -e "${GREEN}✅ Auto-fill feature is ready for manual testing${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Start dev server: npm run dev"
    echo "2. Navigate to /program/[id]/monitoring/new"
    echo "3. Follow test plan in docs/MONITORING_AUTO_FILL_TEST_PLAN.md"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed!${NC}"
    echo -e "${YELLOW}Please fix the issues before proceeding to manual testing${NC}"
    echo ""
    exit 1
fi
