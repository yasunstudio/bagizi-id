#!/usr/bin/env python3
"""
Fix Client Component auth pattern issues

For Client Components ('use client'), we should NOT use:
- async function
- await auth()
- redirect()

Instead, rely on middleware for auth protection.
"""

import re
from pathlib import Path

# Files to fix (all are Client Components)
FILES_TO_FIX = [
    'src/app/(sppg)/hrd/departments/[id]/edit/page.tsx',
    'src/app/(sppg)/hrd/employees/[id]/page.tsx',
    'src/app/(sppg)/hrd/positions/[id]/page.tsx',
    'src/app/(sppg)/hrd/positions/[id]/edit/page.tsx',
    'src/app/(sppg)/procurement/receipts/[id]/page.tsx',
    'src/app/(sppg)/procurement/receipts/[id]/edit/page.tsx',
]

def fix_client_component_auth(content):
    """
    Remove async and auth check from Client Component
    """
    # Step 1: Remove auth and redirect imports
    content = re.sub(
        r"import\s+\{\s*auth\s*\}\s+from\s+['\"]@/lib/auth['\"]\s*\n",
        '',
        content
    )
    content = re.sub(
        r"import\s+\{\s*redirect\s*\}\s+from\s+['\"]next/navigation['\"]\s*\n",
        '',
        content
    )
    
    # Step 2: Remove async from function declaration
    content = re.sub(
        r'async function (\w+)\(',
        r'function \1(',
        content
    )
    
    # Step 3: Remove auth check block
    # Pattern: Multi-line auth check in function params or body
    auth_pattern = r'\s*// Authentication check\s*\n\s*const session = await auth\(\)\s*\n\s*const sppgId = session\?\.user\?\.sppgId\s*\n\s*\n\s*if \(!sppgId\) \{\s*\n\s*redirect\([^\)]+\)\s*\n\s*\}\s*\n\s*\n'
    content = re.sub(auth_pattern, '\n', content, flags=re.MULTILINE)
    
    return content

def main():
    print("🔧 Fixing Client Component Auth Pattern\n")
    
    fixed_count = 0
    for file_path in FILES_TO_FIX:
        path = Path(file_path)
        if not path.exists():
            print(f"⊘ {file_path} - Not found")
            continue
        
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content = fix_client_component_auth(content)
        
        if fixed_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✓ {file_path} - Fixed")
            fixed_count += 1
        else:
            print(f"⊘ {file_path} - No changes needed")
    
    print(f"\n✅ Fixed {fixed_count} files")
    print("\n📝 Next: Run 'npx tsc --noEmit' to verify")

if __name__ == '__main__':
    main()
