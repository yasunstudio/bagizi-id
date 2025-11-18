#!/usr/bin/env python3
import re

FILE = "prisma/seeds/inventory-seed.ts"
BACKUP = FILE + ".backup3"

# Read file
with open(FILE, "r") as f:
    content = f.read()

# Backup
with open(BACKUP, "w") as f:
    f.write(content)

# Replace all getFoodCategoryId calls to remove second parameter
# Pattern: getFoodCategoryId('ItemName', 'CATEGORY')
# Replace with: getFoodCategoryId('ItemName')

pattern = r"getFoodCategoryId\('([^']+)',\s*'[^']+'\)"
replacement = r"getFoodCategoryId('\1')"

new_content = re.sub(pattern, replacement, content)

# Count changes
changes = content.count("getFoodCategoryId(") - new_content.count(", '")

# Write back
with open(FILE, "w") as f:
    f.write(new_content)

print(f"✅ Fixed getFoodCategoryId calls in inventory-seed.ts")
print(f"📊 Updated {changes} function calls to remove category parameter")
