import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Files to process (update to actual filenames)
const files = [
  'src/server.ts',
  'src/routes/authRouter.ts',
  'src/routes/profileRouter.ts',
  'src/routes/projectsRouter.ts',
  'src/routes/ticketsRouter.ts',
  'src/routes/ticketCommentsRouter.ts',
  'src/routes/ticketActivityRouter.ts'
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
  // Run TypeScript compiler (type-check only as per tsconfig noEmit)
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');

  // Run tsc-alias
  execSync('npx tsc-alias', { stdio: 'inherit' });
  console.log('✅ Path aliases resolved');

  // Fix all compiled .js files to use .js imports
  const compiledFiles = [
    'dist/server.js',
    'dist/routes/authRouter.js',
    'dist/routes/profileRouter.js',
    'dist/routes/projectsRouter.js',
    'dist/routes/ticketsRouter.js',
    'dist/routes/ticketCommentsRouter.js',
    'dist/routes/ticketActivityRouter.js'
  ];

  compiledFiles.forEach(file => {
    if (!existsSync(file)) {
      console.warn(`⚠️ Skipping missing file: ${file}`);
      return;
    }
    const contents = readFileSync(file, 'utf8');
    if (contents.includes('.ts')) {
      let content = contents;
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
