#!/usr/bin/env node

/**
 * Cleanup Auth Mess Script
 * 
 * This script removes all the incorrect auth implementations:
 * 1. Remove manual auth checks that were wrongly injected
 * 2. Remove unused auth/redirect imports
 * 3. Remove async keyword from functions that don't need it
 * 
 * We rely 100% on middleware for auth protection.
 * 
 * @author Bagizi-ID Development Team
 * @date October 29, 2025
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Remove auth check block from content
 */
function removeAuthCheck(content) {
  // Pattern 1: Auth check at start of function body (correct placement)
  const pattern1 = /\n  \/\/ Authentication check\n  const session = await auth\(\)\n  const sppgId = session\?\.user\?\.sppgId\n\n  if \(!sppgId\) \{\n    redirect\('\/access-denied\?reason=no-sppg'\)\n  \}\n\n/g;
  content = content.replace(pattern1, '\n');
  
  // Pattern 2: Auth check with different whitespace
  const pattern2 = /  \/\/ Authentication check\n  const session = await auth\(\)\n  const sppgId = session\?\.user\?\.sppgId\n\n  if \(!sppgId\) \{\n    redirect\('\/access-denied\?reason=no-sppg'\)\n  \}\n\n/g;
  content = content.replace(pattern2, '');
  
  // Pattern 3: Auth check in function params (WRONG PLACEMENT)
  const pattern3 = /\n  \/\/ Authentication check\n  const session = await auth\(\)\n  const sppgId = session\?\.user\?\.sppgId\n\n  if \(!sppgId\) \{\n    redirect\('\/access-denied\?reason=no-sppg'\)\n  \}\n \n  params/g;
  content = content.replace(pattern3, '\n  params');
  
  // Pattern 4: Another variant with 'params' on separate line
  const pattern4 = /function \w+\(\{\n  \/\/ Authentication check\n  const session = await auth\(\)\n  const sppgId = session\?\.user\?\.sppgId\n\n  if \(!sppgId\) \{\n    redirect\('\/access-denied\?reason=no-sppg'\)\n  \}\n \n  params/g;
  content = content.replace(pattern4, 'function $1({\n  params');
  
  return content;
}

/**
 * Remove unused auth imports
 */
function removeUnusedAuthImports(content) {
  // If content doesn't use auth() anymore, remove the import
  if (!content.includes('auth()') && !content.includes('await auth()')) {
    content = content.replace(/import { auth } from '@\/lib\/auth'\n/g, '');
  }
  
  // If content doesn't use redirect() anymore, remove the import
  if (!content.includes('redirect(')) {
    content = content.replace(/import { redirect } from 'next\/navigation'\n/g, '');
  }
  
  return content;
}

/**
 * Remove async keyword from Client Component functions
 */
function removeAsyncFromClientComponents(content) {
  // Only for 'use client' files
  if (!content.includes("'use client'")) {
    return content;
  }
  
  // Remove async from function declarations in client components
  // Pattern: async function ComponentName(...) {
  content = content.replace(/\nasync function (\w+)/g, '\nfunction $1');
  
  return content;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    const changes = [];
    
    // Step 1: Remove auth checks
    const afterAuthRemoval = removeAuthCheck(modified);
    if (afterAuthRemoval !== modified) {
      changes.push('Removed manual auth check');
      modified = afterAuthRemoval;
    }
    
    // Step 2: Remove unused imports
    const afterImportCleanup = removeUnusedAuthImports(modified);
    if (afterImportCleanup !== modified) {
      changes.push('Removed unused auth imports');
      modified = afterImportCleanup;
    }
    
    // Step 3: Remove async from Client Components
    const afterAsyncRemoval = removeAsyncFromClientComponents(modified);
    if (afterAsyncRemoval !== modified) {
      changes.push('Removed async from Client Component');
      modified = afterAsyncRemoval;
    }
    
    if (changes.length === 0) {
      return { status: 'skip', reason: 'No changes needed' };
    }
    
    // Write back
    fs.writeFileSync(filePath, modified, 'utf8');
    
    return { status: 'success', changes };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

/**
 * Find all page.tsx files
 */
function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        findPageFiles(filePath, fileList);
      }
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Main execution
 */
function main() {
  log('\n🧹 Cleanup Auth Mess in All Pages', 'blue');
  log('='.repeat(70), 'blue');
  
  const appDir = path.join(process.cwd(), 'src', 'app', '(sppg)');
  
  if (!fs.existsSync(appDir)) {
    log('❌ Error: src/app/(sppg) directory not found', 'red');
    process.exit(1);
  }
  
  log(`\n📁 Scanning: ${appDir}`, 'yellow');
  
  const pageFiles = findPageFiles(appDir);
  log(`\n✓ Found ${pageFiles.length} page.tsx files`, 'green');
  
  const results = { success: 0, skip: 0, error: 0 };
  
  pageFiles.forEach(filePath => {
    const result = processFile(filePath);
    
    if (result.status === 'success') {
      results.success++;
      log(`\n✓ ${path.relative(process.cwd(), filePath)}`, 'green');
      result.changes.forEach(change => {
        log(`  - ${change}`, 'cyan');
      });
    } else if (result.status === 'skip') {
      results.skip++;
    } else {
      results.error++;
      log(`\n❌ ${path.relative(process.cwd(), filePath)}`, 'red');
      log(`   ${result.error}`, 'red');
    }
  });
  
  // Summary
  log('\n' + '='.repeat(70), 'blue');
  log('📊 Cleanup Summary:', 'blue');
  log('='.repeat(70), 'blue');
  log(`✓ Cleaned: ${results.success} files`, 'green');
  log(`⊘ Skipped: ${results.skip} files`, 'yellow');
  log(`✗ Errors:  ${results.error} files`, 'red');
  
  if (results.error === 0) {
    log('\n🎉 All files cleaned successfully!', 'green');
  }
  
  log('\n📝 Next steps:', 'cyan');
  log('   1. Run: npx tsc --noEmit', 'cyan');
  log('   2. All auth is now handled by middleware', 'cyan');
  log('   3. No manual auth checks in pages', 'cyan');
}

main();
