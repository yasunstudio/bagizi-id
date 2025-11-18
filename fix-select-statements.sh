#!/bin/bash

# Fix all targetGroup: true in API select statements
# Nov 11, 2025 - Migration cleanup

echo "🔧 Fixing targetGroup select statements in API routes..."

# Find and replace targetGroup: true, with empty (remove line)
find src/app/api/sppg -name "*.ts" -type f -exec sed -i '' '/targetGroup: true,/d' {} \;

# Find and replace standalone targetGroup: true (without comma)
find src/app/api/sppg -name "*.ts" -type f -exec sed -i '' '/targetGroup: true$/d' {} \;

# Find and replace isMultiTarget: true,
find src/app/api/sppg -name "*.ts" -type f -exec sed -i '' '/isMultiTarget: true,/d' {} \;
find src/app/api/sppg -name "*.ts" -type f -exec sed -i '' '/isMultiTarget: true$/d' {} \;

echo "✅ Cleanup complete!"
echo "📊 Running TypeScript check..."

# Run tsc to verify
npx tsc --noEmit 2>&1 | grep -E "(isMultiTarget|primaryTargetGroup|targetGroup)" | wc -l

echo "✅ Done! Check errors above."
