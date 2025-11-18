#!/usr/bin/env python3
import re

FILE = "prisma/seeds/menu-seed.ts"
BACKUP = FILE + ".backup2"

# Read file
with open(FILE, "r") as f:
    content = f.read()

# Backup
with open(BACKUP, "w") as f:
    f.write(content)

# Step 1: Add category fetch in seedNutritionMenus function
fetch_code = """  // Fetch all food categories for mapping
  console.log('  → Fetching food categories...')
  const foodCategories = await prisma.foodCategory.findMany({
    select: { id: true, categoryCode: true, categoryName: true }
  })
  const categoryMap = new Map(foodCategories.map(c => [c.categoryCode, c.id]))
  console.log(`  ✓ Loaded ${foodCategories.length} food categories`)
  
  // Helper to get foodCategoryId
  const getFoodCategoryId = (menuName: string, description: string): string | undefined => {
    const code = getMenuCategoryCode(menuName, description)
    return code ? categoryMap.get(code) : undefined
  }

  const schoolLunchProgram = programs.find(p => p.programCode === 'PWK-PMAS-2025')!"""

# Replace the line with schoolLunchProgram
content = content.replace(
    "  const schoolLunchProgram = programs.find(p => p.programCode === 'PWK-PMAS-2025')!",
    fetch_code
)

# Step 2: Add foodCategoryId to all menu creates
# Pattern: find create blocks with menuName, description, mealType
pattern = r"(menuName: '([^']+)',\s+description: '([^']+)',\s+mealType:)"

def replacer(match):
    menu_name = match.group(2)
    description = match.group(3)
    
    # Add foodCategoryId
    return f"menuName: '{menu_name}',\n        description: '{description}',\n        foodCategoryId: getFoodCategoryId('{menu_name}', '{description}'),\n        mealType:"

new_content = re.sub(pattern, replacer, content)

# Count changes
changes = new_content.count("foodCategoryId: getFoodCategoryId") - content.count("foodCategoryId: getFoodCategoryId")

# Write back
with open(FILE, "w") as f:
    f.write(new_content)

print(f"✅ Updated menu-seed.ts with foodCategoryId")
print(f"📊 Added foodCategoryId to {changes} menus")
print(f"📊 Added category fetch helper in seedNutritionMenus")
