#!/bin/bash

echo "🔧 Final API error fixes..."

# Array of files to process
files=(
  "src/app/api/sppg/procurement/receipts/[id]/route.ts"
  "src/app/api/sppg/procurement/receipts/stats/route.ts"
  "src/app/api/sppg/procurement/receipts/pending/route.ts"
  "src/app/api/sppg/procurement/orders/[id]/cancel/route.ts"
  "src/app/api/sppg/procurement/orders/[id]/reject/route.ts"
  "src/app/api/sppg/procurement/orders/[id]/approve/route.ts"
  "src/app/api/sppg/procurement/orders/[id]/route.ts"
  "src/app/api/sppg/procurement/orders/stats/route.ts"
  "src/app/api/sppg/employees/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  Processing: $file"
    
    # Fix NextNextResponse typo
    sed -i '' 's/NextNextResponse/NextResponse/g' "$file"
    
    # Fix direct sppgId usage (add ! assertion)
    sed -i '' 's/sppgId: session\.user\.sppgId,$/sppgId: session.user.sppgId!,/g' "$file"
    
    # Fix variable assignment (add ! at definition)
    sed -i '' 's/const sppgId = session\.user\.sppgId$/const sppgId = session.user.sppgId!/g' "$file"
  fi
done

echo "✅ Final fixes applied!"
