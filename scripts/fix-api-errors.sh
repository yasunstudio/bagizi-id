#!/bin/bash

# Script to fix common TypeScript errors in API routes
# 1. Add NextResponse import
# 2. Change Response.json to NextResponse.json  
# 3. Add ! to session.user.sppgId

echo "🔧 Fixing API route TypeScript errors..."

# Files to fix
FILES=(
  "src/app/api/sppg/procurement/receipts/[id]/route.ts"
  "src/app/api/sppg/procurement/receipts/[id]/quality-control/route.ts"
  "src/app/api/sppg/procurement/receipts/stats/route.ts"
  "src/app/api/sppg/procurement/receipts/pending/route.ts"
  "src/app/api/sppg/procurement/orders/[id]/cancel/route.ts"
  "src/app/api/sppg/procurement/orders/[id]/reject/route.ts"
  "src/app/api/sppg/procurement/orders/[id]/approve/route.ts"
  "src/app/api/sppg/procurement/orders/[id]/route.ts"
  "src/app/api/sppg/procurement/orders/stats/route.ts"
  "src/app/api/sppg/employees/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Processing: $file"
    
    # 1. Add NextResponse to import if only NextRequest
    sed -i '' "s/import { NextRequest } from 'next\/server'/import { NextRequest, NextResponse } from 'next\/server'/g" "$file"
    
    # 2. Change Response.json to NextResponse.json
    sed -i '' 's/return Response\.json(/return NextResponse.json(/g' "$file"
    sed -i '' 's/Response\.json(/NextResponse.json(/g' "$file"
    
    # 3. Add ! to session.user.sppgId (be careful not to double-add)
    sed -i '' 's/sppgId: session\.user\.sppgId,/sppgId: session.user.sppgId!,/g' "$file"
    sed -i '' 's/sppgId: session\.user\.sppgId /sppgId: session.user.sppgId! /g' "$file"
    
    # 4. Fix sppgId variable usage (when assigned)
    sed -i '' 's/sppgId,$/sppgId!,/g' "$file"
    
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo "✅ API route fixes applied!"
