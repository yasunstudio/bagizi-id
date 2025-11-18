#!/usr/bin/env node

/**
 * Mass Migration Script: Remove withSppgAuth HOC from Server Components
 * 
 * This script fixes the architectural mistake of using Client Component HOC
 * on Server Component pages in Next.js 15.
 * 
 * Changes:
 * 1. Remove withSppgAuth import
 * 2. Remove withSppgAuth wrapper from export
 * 3. Add auth() import from @/lib/auth
 * 4. Add redirect import from next/navigation
 * 5. Add manual auth check inside component function
 * 6. Make component async if not already
 * 
 * @author Bagizi-ID Development Team
 * @date October 29, 2025
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
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
 * Check if file uses withSppgAuth
 */
function usesWithSppgAuth(content) {
  return content.includes('withSppgAuth') && content.includes('export default withSppgAuth(');
}

/**
 * Transform file content to remove withSppgAuth
 */
function transformContent(content, filePath) {
  let modified = content;
  let changes = [];

  // Extract component name from export
  const exportMatch = modified.match(/export default withSppgAuth\((\w+)\)/);
  if (!exportMatch) {
    throw new Error('Could not extract component name from export');
  }
  const componentName = exportMatch[1];
  changes.push(`Extracted component name: ${componentName}`);

  // Step 1: Remove withSppgAuth import
  if (modified.includes("from '@/lib/page-auth'")) {
    modified = modified.replace(/import\s+{\s*withSppgAuth\s*}\s+from\s+['"]@\/lib\/page-auth['"]\s*\n?/g, '');
    changes.push('✓ Removed withSppgAuth import');
  }

  // Step 2: Add auth and redirect imports if not present
  const hasAuthImport = modified.includes("from '@/lib/auth'");
  const hasRedirectImport = modified.includes("from 'next/navigation'") && modified.includes('redirect');

  if (!hasAuthImport || !hasRedirectImport) {
    // Find the first import line to insert after
    const firstImportMatch = modified.match(/^import .+$/m);
    if (firstImportMatch) {
      const insertPosition = modified.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
      let newImports = '\n';
      
      if (!hasAuthImport) {
        newImports += "import { auth } from '@/lib/auth'\n";
        changes.push('✓ Added auth import');
      }
      if (!hasRedirectImport) {
        newImports += "import { redirect } from 'next/navigation'\n";
        changes.push('✓ Added redirect import');
      }
      
      modified = modified.slice(0, insertPosition) + newImports + modified.slice(insertPosition);
    }
  }

  // Step 3: Make component async if not already
  const componentDefMatch = modified.match(new RegExp(`(export\\s+default\\s+)?(function|const)\\s+${componentName}`));
  if (componentDefMatch && !modified.match(new RegExp(`async\\s+(function|const)\\s+${componentName}`))) {
    modified = modified.replace(
      new RegExp(`((export\\s+default\\s+)?(function|const)\\s+${componentName})`),
      'async $1'
    );
    changes.push('✓ Made component async');
  }

  // Step 4: Add auth check at the beginning of component function body
  // Find the function body opening brace and the next line
  const funcBodyRegex = new RegExp(
    `(async\\s+)?(function|const)\\s+${componentName}[^{]*{\\s*\\n`,
    's'
  );
  const funcBodyMatch = modified.match(funcBodyRegex);
  
  if (funcBodyMatch) {
    const authCheckCode = `  // Authentication check
  const session = await auth()
  const sppgId = session?.user?.sppgId

  if (!sppgId) {
    redirect('/access-denied?reason=no-sppg')
  }

`;
    
    // Find position after opening brace and newline
    const insertPosition = modified.indexOf(funcBodyMatch[0]) + funcBodyMatch[0].length;
    
    // Only insert if not already present
    const nextLines = modified.slice(insertPosition, insertPosition + 200);
    if (!nextLines.includes('const session = await auth()')) {
      modified = modified.slice(0, insertPosition) + authCheckCode + modified.slice(insertPosition);
      changes.push('✓ Added auth check inside component');
    } else {
      changes.push('⊘ Auth check already present');
    }
  } else {
    changes.push('⚠ Could not find function body to insert auth check');
  }

  // Step 5: Replace export statement
  modified = modified.replace(
    /export default withSppgAuth\(\w+\)/g,
    `export default ${componentName}`
  );
  changes.push('✓ Removed withSppgAuth wrapper from export');

  return { content: modified, changes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (!usesWithSppgAuth(content)) {
      return { status: 'skip', reason: 'No withSppgAuth usage' };
    }

    // Skip backup files
    if (filePath.includes('.backup') || filePath.includes('page-auth.tsx')) {
      return { status: 'skip', reason: 'Backup or auth file' };
    }

    log(`\nProcessing: ${filePath}`, 'cyan');
    
    const { content: newContent, changes } = transformContent(content, filePath);
    
    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    changes.forEach(change => log(`  ${change}`, 'green'));
    
    return { status: 'success', changes };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

/**
 * Find all page.tsx files recursively
 */
function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
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
  log('\n🔧 Mass Migration: Remove withSppgAuth from Server Components', 'blue');
  log('='.repeat(70), 'blue');
  
  const appDir = path.join(process.cwd(), 'src', 'app');
  
  if (!fs.existsSync(appDir)) {
    log('❌ Error: src/app directory not found', 'red');
    process.exit(1);
  }
  
  log(`\n📁 Scanning directory: ${appDir}`, 'yellow');
  
  const pageFiles = findPageFiles(appDir);
  log(`\n✓ Found ${pageFiles.length} page.tsx files`, 'green');
  
  const results = {
    success: 0,
    skip: 0,
    error: 0,
    details: []
  };
  
  pageFiles.forEach(filePath => {
    const result = processFile(filePath);
    results.details.push({ filePath, result });
    
    if (result.status === 'success') {
      results.success++;
    } else if (result.status === 'skip') {
      results.skip++;
    } else {
      results.error++;
      log(`\n❌ Error in ${filePath}:`, 'red');
      log(`   ${result.error}`, 'red');
    }
  });
  
  // Summary
  log('\n' + '='.repeat(70), 'blue');
  log('📊 Migration Summary:', 'blue');
  log('='.repeat(70), 'blue');
  log(`✓ Success: ${results.success} files`, 'green');
  log(`⊘ Skipped: ${results.skip} files`, 'yellow');
  log(`✗ Errors:  ${results.error} files`, 'red');
  
  if (results.error > 0) {
    log('\n⚠️  Some files had errors. Please review manually.', 'yellow');
  } else {
    log('\n🎉 All files processed successfully!', 'green');
  }
  
  log('\n📝 Next steps:', 'cyan');
  log('   1. Run: npx tsc --noEmit', 'cyan');
  log('   2. Test affected pages manually', 'cyan');
  log('   3. Commit changes if everything works', 'cyan');
}

// Run the script
main();
