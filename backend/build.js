import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Files to process
const files = [
  'src/server.ts',
  'src/routes/auth.ts',
  'src/routes/profile.ts',
  'src/routes/projects.ts'
];

// Backup original content
const backups = {};

// Convert .ts imports to .js for build
files.forEach(file => {
  const content = readFileSync(file, 'utf8');
  backups[file] = content;
  
  const modifiedContent = content.replace(/from ['"]([^'"]+)\.ts['"]/g, 'from "$1.js"');
  writeFileSync(file, modifiedContent);
});

try {
  // Run TypeScript compiler
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');
  
  // Run tsc-alias
  execSync('npx tsc-alias', { stdio: 'inherit' });
  console.log('✅ Path aliases resolved');
  
  // Fix all compiled .js files to use .js imports
  const compiledFiles = [
    'dist/server.js',
    'dist/routes/auth.js',
    'dist/routes/profile.js',
    'dist/routes/projects.js'
  ];
  
  compiledFiles.forEach(file => {
    if (readFileSync(file, 'utf8').includes('.ts')) {
      let content = readFileSync(file, 'utf8');
      content = content.replace(/from ['"]([^'"]+)\.ts['"]/g, 'from "$1.js"');
      writeFileSync(file, content);
      console.log(`✅ Fixed ${file} imports`);
    }
  });
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
} finally {
  // Restore original content
  files.forEach(file => {
    writeFileSync(file, backups[file]);
  });
  console.log('✅ Original files restored');
}
