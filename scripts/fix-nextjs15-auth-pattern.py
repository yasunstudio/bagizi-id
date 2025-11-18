#!/usr/bin/env python3
"""
Fix all Next.js 15 auth pattern issues

This script fixes pages where auth check is in the wrong location.
It handles various function declaration patterns.
"""

import os
import re
from pathlib import Path

class Colors:
    RESET = '\033[0m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'

def log(message, color=Colors.RESET):
    print(f"{color}{message}{Colors.RESET}")

def fix_auth_in_params(content):
    """
    Fix pattern where auth check is inside function parameters.
    
    Pattern to fix:
        async function MyPage({
          // Authentication check
          const session = await auth()
          ...
          params
        }: { params: ... }) {
    
    Should be:
        async function MyPage({
          params
        }: { params: ... }) {
          // Authentication check
          const session = await auth()
          ...
    """
    
    # Regex to match function with auth in params
    pattern = r'(async\s+function\s+\w+)\s*\(\s*\{\s*\n(\s*)// Authentication check\s*\n\s*const session = await auth\(\)\s*\n\s*const sppgId = session\?\.user\?\.sppgId\s*\n\s*\n\s*if \(!sppgId\) \{\s*\n\s*redirect\([^\)]+\)\s*\n\s*\}\s*\n\s*\n\s*([^}]+)\}\s*:\s*(\{[^}]+\})\s*\)\s*\{'
    
    def replacer(match):
        func_start = match.group(1)  # async function MyPage
        indent = match.group(2)  # indentation
        params_content = match.group(3).strip()  # params
        params_type = match.group(4)  # { params: ... }
        
        # Rebuild correctly
        return f'''{func_start}({{
  {params_content}
}}: {params_type}) {{
  // Authentication check
  const session = await auth()
  const sppgId = session?.user?.sppgId

  if (!sppgId) {{
    redirect('/access-denied?reason=no-sppg')
  }}

'''
    
    new_content = re.sub(pattern, replacer, content, flags=re.MULTILINE | re.DOTALL)
    
    return new_content if new_content != content else None

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file needs fixing
        if '// Authentication check' not in content:
            return {'status': 'skip', 'reason': 'No auth check'}
        
        # Check if auth is in wrong place
        wrong_pattern = r'async\s+function\s+\w+\s*\(\s*\{\s*\n\s*// Authentication check'
        if not re.search(wrong_pattern, content):
            return {'status': 'skip', 'reason': 'Auth already correct'}
        
        log(f"\nFixing: {file_path}", Colors.CYAN)
        
        fixed_content = fix_auth_in_params(content)
        
        if fixed_content is None:
            log("  ⚠ Could not auto-fix, needs manual review", Colors.YELLOW)
            return {'status': 'skip', 'reason': 'Pattern not matched'}
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        log("  ✓ Fixed auth placement", Colors.GREEN)
        return {'status': 'success'}
        
    except Exception as e:
        log(f"  ✗ Error: {str(e)}", Colors.RED)
        return {'status': 'error', 'error': str(e)}

def main():
    log("\n🔧 Fix Next.js 15 Auth Pattern Issues", Colors.BLUE)
    log("=" * 70, Colors.BLUE)
    
    app_dir = Path('src/app')
    
    if not app_dir.exists():
        log("❌ Error: src/app directory not found", Colors.RED)
        return
    
    # Find all page.tsx files
    page_files = list(app_dir.rglob('page.tsx'))
    log(f"\n✓ Found {len(page_files)} page.tsx files", Colors.GREEN)
    
    results = {'success': 0, 'skip': 0, 'error': 0}
    fixed_files = []
    
    for file_path in sorted(page_files):
        result = process_file(file_path)
        results[result['status']] += 1
        
        if result['status'] == 'success':
            fixed_files.append(str(file_path))
    
    # Summary
    log("\n" + "=" * 70, Colors.BLUE)
    log("📊 Fix Summary:", Colors.BLUE)
    log("=" * 70, Colors.BLUE)
    log(f"✓ Fixed: {results['success']} files", Colors.GREEN)
    log(f"⊘ Skipped: {results['skip']} files", Colors.YELLOW)
    log(f"✗ Errors: {results['error']} files", Colors.RED)
    
    if fixed_files:
        log("\n📝 Fixed files:", Colors.CYAN)
        for f in fixed_files:
            log(f"  - {f}", Colors.GREEN)
    
    if results['success'] > 0:
        log("\n🎉 Auth pattern fixed successfully!", Colors.GREEN)
        log("\n📝 Next step: Run 'npx tsc --noEmit' to verify", Colors.CYAN)
    else:
        log("\n⚠️  No files needed fixing", Colors.YELLOW)

if __name__ == '__main__':
    main()
