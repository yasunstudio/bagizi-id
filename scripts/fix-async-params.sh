#!/bin/bash

echo "🔧 Fixing async params in delivery pages..."

# Files to fix
files=(
  "src/app/(sppg)/distribution/delivery/[id]/track/page.tsx"
  "src/app/(sppg)/distribution/delivery/execution/[executionId]/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  Processing: $file"
    
    # Add 'use' import if using Suspense
    sed -i '' "s/import { Suspense } from 'react'/import { Suspense, use } from 'react'/g" "$file"
    
    # Fix PageProps interface - params to Promise
    sed -i '' 's/  params: {$/  params: Promise<{/g' "$file"
    sed -i '' '/  params: Promise<{/,/  }$/ s/  }$/  }>/' "$file"
    
    # Fix searchParams to Promise too
    sed -i '' 's/  searchParams: {$/  searchParams: Promise<{/g' "$file"
    sed -i '' '/  searchParams: Promise<{/,/  }$/ s/  }$/  }>/' "$file"
    
    # Fix usage - destructure with use()
    sed -i '' 's/const { \([^}]*\) } = params$/const { \1 } = use(params)/g' "$file"
    sed -i '' 's/const { \([^}]*\) } = searchParams$/const { \1 } = use(searchParams)/g' "$file"
  fi
done

echo "✅ Async params fixes applied!"
