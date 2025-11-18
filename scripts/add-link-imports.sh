#!/bin/bash

# Add missing Link imports to files that use breadcrumbs
# This fixes TypeScript errors after breadcrumb pattern update

echo "🔧 Adding missing Link imports..."

# Find all files that have BreadcrumbLink asChild but no Link import
FILES=$(grep -l "BreadcrumbLink asChild" src/app/\(sppg\)/**/*.tsx 2>/dev/null | while read file; do
  if ! grep -q "import.*Link.*from.*next/link" "$file"; then
    echo "$file"
  fi
done)

if [ -z "$FILES" ]; then
  echo "✅ All files already have Link imports!"
  exit 0
fi

echo "$FILES" | while read -r file; do
  if [ -f "$file" ]; then
    echo "  → Adding Link import to: $file"
    
    # Check if file already has other Next.js imports
    if grep -q "from 'next/" "$file"; then
      # Add Link to existing import statement from 'next/link' if present
      # Or add new import after other next imports
      if grep -q "from 'next/navigation'" "$file"; then
        # Add after next/navigation import
        perl -i -pe "s/(from 'next\/navigation')/\$1\nimport Link from 'next\/link'/" "$file"
      elif grep -q "from 'next/headers'" "$file"; then
        # Add after next/headers import
        perl -i -pe "s/(from 'next\/headers')/\$1\nimport Link from 'next\/link'/" "$file"
      else
        # Add as first import
        perl -i -0pe "s/(import.*?from.*?'next\/.*?'\n)/\$1import Link from 'next\/link'\n/" "$file"
      fi
    else
      # Add Link import after Metadata import or at the top
      if grep -q "from 'next'" "$file"; then
        perl -i -0pe "s/(import.*?from 'next')/\$1\nimport Link from 'next\/link'/" "$file"
      else
        # Add at the very top after first import
        perl -i -pe "if (\$. == 1 && /^import/) { print; print \"import Link from 'next/link'\n\"; next }" "$file"
      fi
    fi
    
    echo "    ✅ Added Link import to: $file"
  fi
done

echo ""
echo "✅ Link import addition complete!"
echo ""
echo "Verifying TypeScript..."
npx tsc --noEmit 2>&1 | head -10
