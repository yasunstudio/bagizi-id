#!/bin/bash
# verify-seed-costs.sh - Verify all seed files compile and are ready for seeding

echo "🔍 Verifying Seed Cost Tracking Implementation..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check TypeScript compilation
echo "📝 Checking TypeScript compilation..."
npx tsc --noEmit prisma/seeds/production-seed.ts
PROD_STATUS=$?

npx tsc --noEmit prisma/seeds/distribution-seed.ts
DIST_STATUS=$?

npx tsc --noEmit prisma/seeds/procurement-integration-seed.ts
PROC_STATUS=$?

npx tsc --noEmit prisma/seed.ts
MASTER_STATUS=$?

echo ""

# Report results
if [ $PROD_STATUS -eq 0 ]; then
  echo -e "${GREEN}✅ production-seed.ts: 0 errors${NC}"
else
  echo -e "${RED}❌ production-seed.ts: Has errors${NC}"
fi

if [ $DIST_STATUS -eq 0 ]; then
  echo -e "${GREEN}✅ distribution-seed.ts: 0 errors${NC}"
else
  echo -e "${RED}❌ distribution-seed.ts: Has errors${NC}"
fi

if [ $PROC_STATUS -eq 0 ]; then
  echo -e "${GREEN}✅ procurement-integration-seed.ts: 0 errors${NC}"
else
  echo -e "${RED}❌ procurement-integration-seed.ts: Has errors${NC}"
fi

if [ $MASTER_STATUS -eq 0 ]; then
  echo -e "${GREEN}✅ seed.ts (master): 0 errors${NC}"
else
  echo -e "${RED}❌ seed.ts (master): Has errors${NC}"
fi

echo ""

# Overall status
if [ $PROD_STATUS -eq 0 ] && [ $DIST_STATUS -eq 0 ] && [ $PROC_STATUS -eq 0 ] && [ $MASTER_STATUS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL SEED FILES READY FOR SEEDING${NC}"
  echo ""
  echo "To seed the database with REAL cost calculations:"
  echo "  npm run db:seed"
  echo ""
  echo "To reset and reseed:"
  echo "  npm run db:reset"
  echo ""
  exit 0
else
  echo -e "${RED}❌ SOME SEED FILES HAVE ERRORS${NC}"
  echo "Please fix TypeScript errors before seeding"
  echo ""
  exit 1
fi
