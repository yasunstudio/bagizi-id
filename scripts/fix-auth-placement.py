#!/usr/bin/env python3
"""
Fix auth check placement in Next.js 15 page components

This script fixes the bug where auth checks were injected in the wrong place
(inside function parameters instead of function body).

Pattern to fix:
  async function MyPage({
    // AUTH CHECK HERE <- WRONG!
    params
  }: { params: Promise<{...}> }) {

Should be:
  async function MyPage({
    params
  }: { params: Promise<{...}> }) {
    // AUTH CHECK HERE <- CORRECT!
"""

import os
import re
from pathlib import Path

# ANSI colors
class Colors:
    RESET = '\033[0m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'

def log(message, color=Colors.RESET):
    print(f"{color}{message}{Colors.RESET}")

def fix_auth_placement(content):
    """
    Fix auth check that's placed in function parameters.
    Move it to the start of function body.
    """
    # Pattern: function declaration with auth check in params
    pattern = r'(async function \w+)\s*\(\s*\{\s*\n\s*// Authentication check\s*\n\s*const session = await auth\(\)\s*\n\s*const sppgId = session\?\.user\?\.sppgId\s*\n\s*\n\s*if \(!sppgId\) \{\s*\n\s*redirect\([^\)]+\)\s*\n\s*\}\s*\n\s*\n\s*(params[^\}]*\})\s*:\s*(\{[^\}]+\})\s*\)\s*\{'
    
    def replacer(match):
        func_decl = match.group(1)
        params = match.group(2).strip()
        param_type = match.group(3)
        
        # Rebuild with auth check in body
        return f'''{func_decl}({{
  {params}
}}: {param_type}) {{
  // Authentication check
  const session = await auth()
  const sppgId = session?.user?.sppgId

  if (!sppgId) {{
    redirect('/access-denied?reason=no-sppg')
  }}
'''
    
    fixed = re.sub(pattern, replacer, content, flags=re.MULTILINE | re.DOTALL)
    
    return fixed if fixed != content else None

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file has the problematic pattern
        if '// Authentication check' not in content:
            return {'status': 'skip', 'reason': 'No auth check'}
        
        # Check if auth is in wrong place (in params)
        if not re.search(r'async function \w+\s*\(\s*\{\s*\n\s*// Authentication check', content):
            return {'status': 'skip', 'reason': 'Auth check already correct'}
        
        log(f"\nFixing: {file_path}", Colors.CYAN)
        
        fixed_content = fix_auth_placement(content)
        
        if fixed_content is None:
            return {'status': 'skip', 'reason': 'No changes needed'}
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        log("  ✓ Fixed auth check placement", Colors.GREEN)
        return {'status': 'success'}
        
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

def main():
    log("\n🔧 Fix Auth Check Placement in Page Components", Colors.BLUE)
    log("=" * 70, Colors.BLUE)
    
    app_dir = Path('src/app/(sppg)')
    
    if not app_dir.exists():
        log("❌ Error: src/app/(sppg) directory not found", Colors.RED)
        return
    
    # Find all page.tsx files
    page_files = list(app_dir.rglob('page.tsx'))
    log(f"\n✓ Found {len(page_files)} page.tsx files", Colors.GREEN)
    
    results = {'success': 0, 'skip': 0, 'error': 0}
    
    for file_path in page_files:
        result = process_file(file_path)
        results[result['status']] += 1
        
        if result['status'] == 'error':
            log(f"\n❌ Error in {file_path}:", Colors.RED)
            log(f"   {result['error']}", Colors.RED)
    
    # Summary
    log("\n" + "=" * 70, Colors.BLUE)
    log("📊 Fix Summary:", Colors.BLUE)
    log("=" * 70, Colors.BLUE)
    log(f"✓ Success: {results['success']} files", Colors.GREEN)
    log(f"⊘ Skipped: {results['skip']} files", Colors.YELLOW)
    log(f"✗ Errors:  {results['error']} files", Colors.RED)
    
    if results['error'] == 0:
        log("\n🎉 All files fixed successfully!", Colors.GREEN)
    
    log("\n📝 Next step: Run 'npx tsc --noEmit' to verify", Colors.CYAN)

if __name__ == '__main__':
    main()
