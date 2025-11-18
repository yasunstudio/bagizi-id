#!/bin/bash

# Fix breadcrumb pattern across all SPPG pages
# Converts: <BreadcrumbLink href="...">...</BreadcrumbLink>
# To: <BreadcrumbLink asChild><Link href="...">...</Link></BreadcrumbLink>

echo "🔧 Fixing breadcrumb patterns across all SPPG pages..."

# Find all files with BreadcrumbLink href pattern
FILES=$(grep -rl "BreadcrumbLink href=" src/app/\(sppg\)/ 2>/dev/null || true)

if [ -z "$FILES" ]; then
  echo "✅ No files found with old breadcrumb pattern!"
  exit 0
fi

# Backup directory
BACKUP_DIR="breadcrumb_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "$FILES" | while read -r file; do
  if [ -f "$file" ]; then
    echo "  → Processing: $file"
    
    # Create backup with full path structure
    backup_file="$BACKUP_DIR/$(basename $file).$(date +%s)"
    cp "$file" "$backup_file"
    
    # Apply fix using perl for multi-line replacement
    # Pattern 1: Simple static href
    # <BreadcrumbLink href="/path">Text</BreadcrumbLink>
    # → <BreadcrumbLink asChild><Link href="/path">Text</Link></BreadcrumbLink>
    
    # Pattern 2: Dynamic href with variable
    # <BreadcrumbLink href={`/path/${id}`}>Text</BreadcrumbLink>
    # → <BreadcrumbLink asChild><Link href={`/path/${id}`}>Text</Link></BreadcrumbLink>
    
    perl -i -0pe '
      # Fix static href
      s/<BreadcrumbLink\s+href="([^"]+)">([^<]+)<\/BreadcrumbLink>/<BreadcrumbLink asChild><Link href="$1">$2<\/Link><\/BreadcrumbLink>/g;
      
      # Fix dynamic href with backticks
      s/<BreadcrumbLink\s+href=\{`([^`]+)`\}>([^<]+)<\/BreadcrumbLink>/<BreadcrumbLink asChild><Link href={`$1`}>$2<\/Link><\/BreadcrumbLink>/g;
    ' "$file"
    
    echo "    ✅ Fixed: $file"
  fi
done

echo ""
echo "✅ Breadcrumb fix complete!"
echo "📁 Backups saved to: $BACKUP_DIR"
echo ""
echo "Verifying..."
REMAINING=$(grep -r "BreadcrumbLink href=" src/app/\(sppg\)/ 2>/dev/null | wc -l | xargs)
if [ "$REMAINING" = "0" ]; then
  echo "✅ All breadcrumbs fixed! No remaining issues."
else
  echo "⚠️  Warning: $REMAINING instances still need manual review"
  echo ""
  echo "Files needing manual review:"
  grep -r "BreadcrumbLink href=" src/app/\(sppg\)/ 2>/dev/null | cut -d: -f1 | sort -u
fi
echo ""
echo "Next steps:"
echo "1. Review changes with: git diff"
echo "2. Test breadcrumb navigation"
echo "3. Run: npm run type-check"

