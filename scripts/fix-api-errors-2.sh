#!/bin/bash

# Script to fix NextNextResponse typo and sppgId! placement issues

echo "🔧 Fixing NextNextResponse typo and sppgId issues..."

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
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Processing: $file"
    
    # Fix NextNextResponse typo
    sed -i '' 's/NextNextResponse/NextResponse/g' "$file"
    
    # Fix standalone sppgId!, pattern (when it's a variable reference)
    # This fixes the "definite assignment assertion not permitted" error
    sed -i '' 's/sppgId!,$/sppgId,/g' "$file"
    
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo "✅ Fixes applied!"
